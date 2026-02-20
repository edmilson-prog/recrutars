-- =====================================================
-- Migration 035: Helpdesk Tickets Extensions
-- PRD-082: Admin Helpdesk Intelligence (Phases 1+2)
-- =====================================================

-- =====================================================
-- 1. ADD COLUMNS TO tickets
-- =====================================================

-- Auto-incrementing ticket number for display
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS number SERIAL;

-- Requester type (auto-detected from profile)
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS requester_type TEXT;

-- Assigned admin agent
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id);

-- SLA deadline (auto-calculated from priority)
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;

-- When ticket was resolved
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- AI triage fields (Phase 4 — columns created now, used later)
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ai_suggested_category TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ai_suggested_priority TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ai_triage_status TEXT;

-- Update status constraint: 'waiting' → 'waiting_user' for clarity
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_status_check
  CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed'));

-- Add comprehensive category constraint
ALTER TABLE public.tickets ADD CONSTRAINT tickets_category_check
  CHECK (category IN (
    'general', 'technical', 'billing', 'account', 'feedback', 'bug',
    'access', 'plan', 'financial', 'other',
    'applications', 'resumes', 'tests', 'interviews', 'messages', 'suggestions'
  ));

-- Full-text search index on subject (Portuguese)
CREATE INDEX IF NOT EXISTS idx_tickets_subject_fts
  ON public.tickets USING gin(to_tsvector('portuguese', subject));

-- SLA deadline index for unresolved tickets
CREATE INDEX IF NOT EXISTS idx_tickets_sla_deadline
  ON public.tickets(sla_deadline)
  WHERE resolved_at IS NULL AND status NOT IN ('resolved', 'closed');

-- Index on assigned_to for agent workload queries
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);

-- =====================================================
-- 2. ADD COLUMNS TO ticket_messages
-- =====================================================

-- Internal notes (visible only to admins)
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS is_internal_note BOOLEAN NOT NULL DEFAULT FALSE;

-- File attachments
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- =====================================================
-- 3. CREATE ticket_csat TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ticket_csat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ticket_csat_unique_ticket UNIQUE (ticket_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_csat_user_id ON public.ticket_csat(user_id);

-- RLS for ticket_csat
ALTER TABLE public.ticket_csat ENABLE ROW LEVEL SECURITY;

-- Users can insert their own CSAT ratings
CREATE POLICY ticket_csat_insert_own ON public.ticket_csat
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users see their own, admins see all
CREATE POLICY ticket_csat_select ON public.ticket_csat
  FOR SELECT USING (
    user_id = auth.uid() OR get_user_type(auth.uid()) = 'admin'
  );

-- =====================================================
-- 4. CREATE ticket_audit_log TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ticket_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES public.profiles(id),
  performed_by_name TEXT,
  old_value TEXT,
  new_value TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_audit_log_ticket_id ON public.ticket_audit_log(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_audit_log_created_at ON public.ticket_audit_log(created_at DESC);

-- RLS for ticket_audit_log (admin only)
ALTER TABLE public.ticket_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY ticket_audit_log_select_admin ON public.ticket_audit_log
  FOR SELECT USING (get_user_type(auth.uid()) = 'admin');

CREATE POLICY ticket_audit_log_insert_admin ON public.ticket_audit_log
  FOR INSERT WITH CHECK (get_user_type(auth.uid()) = 'admin');

-- =====================================================
-- 5. UPDATE RLS FOR INTERNAL NOTES
-- =====================================================

-- Drop combined select policy
DROP POLICY IF EXISTS ticket_messages_select ON public.ticket_messages;

-- Users see only non-internal messages of their own tickets
CREATE POLICY ticket_messages_select_user ON public.ticket_messages
  FOR SELECT USING (
    is_internal_note = FALSE
    AND ticket_id IN (
      SELECT id FROM public.tickets WHERE user_id = auth.uid()
    )
  );

-- Admins see everything (including internal notes)
CREATE POLICY ticket_messages_select_admin ON public.ticket_messages
  FOR SELECT USING (
    get_user_type(auth.uid()) = 'admin'
  );

-- =====================================================
-- 6. SLA CALCULATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_sla_deadline(
  p_priority TEXT,
  p_created_at TIMESTAMPTZ
) RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN CASE p_priority
    WHEN 'urgent' THEN p_created_at + INTERVAL '1 hour'
    WHEN 'high'   THEN p_created_at + INTERVAL '2 hours'
    WHEN 'medium' THEN p_created_at + INTERVAL '8 hours'
    WHEN 'low'    THEN p_created_at + INTERVAL '24 hours'
    ELSE p_created_at + INTERVAL '8 hours'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 7. TRIGGER: Auto-set SLA + requester_type on INSERT
-- =====================================================

CREATE OR REPLACE FUNCTION public.set_ticket_sla_and_requester()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate SLA deadline
  NEW.sla_deadline := public.calculate_sla_deadline(NEW.priority, NEW.created_at);

  -- Auto-detect requester_type from profile
  IF NEW.requester_type IS NULL THEN
    SELECT user_type INTO NEW.requester_type
    FROM public.profiles
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_sla ON public.tickets;
CREATE TRIGGER set_ticket_sla
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ticket_sla_and_requester();

-- =====================================================
-- 8. TRIGGER: Recalculate SLA on priority change + set resolved_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_ticket_sla_on_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate SLA when priority changes
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    NEW.sla_deadline := public.calculate_sla_deadline(NEW.priority, NEW.created_at);
  END IF;

  -- Set resolved_at when status changes to resolved/closed
  IF NEW.status IN ('resolved', 'closed') AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at := NOW();
  END IF;

  -- Clear resolved_at if ticket is reopened
  IF NEW.status NOT IN ('resolved', 'closed') AND OLD.status IN ('resolved', 'closed') THEN
    NEW.resolved_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ticket_sla_on_priority_change ON public.tickets;
CREATE TRIGGER update_ticket_sla_on_priority_change
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ticket_sla_on_change();
