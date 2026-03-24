-- =====================================================
-- Migration 075: Team Lifecycle Management
-- PRD-090: Ciclo de Vida do Colaborador
-- =====================================================
-- Adds lifecycle status tracking, termination/leave fields,
-- event history, offboarding checklists, data retention
-- settings, and pg_cron jobs for automated processing.
-- =====================================================
-- Execute AFTER 074_gauge_pro_scenario_order_mode_function.sql
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADD COLUMNS TO team_members
-- =====================================================

-- Lifecycle status (replaces binary is_active)
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'team_members_status_check'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_status_check
      CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated', 'unlinked'));
  END IF;
END $$;

-- Backfill status from is_active
UPDATE public.team_members
SET status = CASE WHEN is_active = false THEN 'inactive' ELSE 'active' END
WHERE status = 'active' AND is_active = false;

-- Termination fields
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS termination_date DATE;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS termination_reason TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'team_members_termination_reason_check'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_termination_reason_check
      CHECK (termination_reason IS NULL OR termination_reason IN (
        'voluntary', 'involuntary', 'contract_end', 'retirement', 'mutual_agreement', 'other'
      ));
  END IF;
END $$;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS termination_reason_detail TEXT;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS termination_notes TEXT;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS termination_scheduled_date DATE;

-- Leave fields
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS leave_type TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'team_members_leave_type_check'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_leave_type_check
      CHECK (leave_type IS NULL OR leave_type IN (
        'medical_leave', 'maternity', 'vacation_extended', 'unpaid_leave', 'sabbatical', 'other'
      ));
  END IF;
END $$;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS leave_start_date DATE;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS leave_expected_return DATE;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS leave_include_metrics BOOLEAN NOT NULL DEFAULT false;

-- Reactivation / Anonymization
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS previous_team_member_id UUID REFERENCES public.team_members(id);

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS anonymized BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

-- Indexes for lifecycle queries
CREATE INDEX IF NOT EXISTS idx_team_members_status
  ON public.team_members(status);

CREATE INDEX IF NOT EXISTS idx_team_members_termination_scheduled
  ON public.team_members(termination_scheduled_date)
  WHERE termination_scheduled_date IS NOT NULL;

-- =====================================================
-- 2. CREATE team_member_events TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.team_member_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  performed_by UUID REFERENCES auth.users(id),
  visibility TEXT NOT NULL DEFAULT 'all_managers',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT team_member_events_type_check CHECK (event_type IN (
    'hired', 'terminated', 'unlinked', 'reactivated',
    'leave_started', 'leave_returned',
    'promoted', 'department_transferred', 'position_changed',
    'note_added', 'test_completed', 'test_invited',
    'anonymized', 'offboarding_item_completed',
    'scheduled_termination_set', 'scheduled_termination_cancelled'
  )),

  CONSTRAINT team_member_events_visibility_check CHECK (visibility IN (
    'all_managers', 'managers_and_admin'
  ))
);

CREATE INDEX IF NOT EXISTS idx_team_member_events_member
  ON public.team_member_events(team_member_id);

CREATE INDEX IF NOT EXISTS idx_team_member_events_company
  ON public.team_member_events(company_id);

CREATE INDEX IF NOT EXISTS idx_team_member_events_type
  ON public.team_member_events(event_type);

CREATE INDEX IF NOT EXISTS idx_team_member_events_date
  ON public.team_member_events(event_date DESC);

-- =====================================================
-- 3. CREATE offboarding_checklists TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.offboarding_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  item_label VARCHAR(200) NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offboarding_checklists_member
  ON public.offboarding_checklists(team_member_id);

-- =====================================================
-- 4. CREATE offboarding_templates TABLE + SEED DATA
-- =====================================================

CREATE TABLE IF NOT EXISTS public.offboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  item_label VARCHAR(200) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System default templates (company_id IS NULL = global defaults)
INSERT INTO public.offboarding_templates (company_id, item_label, is_default, sort_order)
SELECT NULL, label, true, ord
FROM (VALUES
  ('Revogar acessos de sistemas e ferramentas', 1),
  ('Devolver equipamentos e materiais', 2),
  ('Transferir responsabilidades e projetos', 3),
  ('Realizar entrevista de desligamento', 4)
) AS t(label, ord)
WHERE NOT EXISTS (
  SELECT 1 FROM public.offboarding_templates
  WHERE company_id IS NULL AND is_default = true
);

-- =====================================================
-- 5. CREATE data_retention_settings TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.data_retention_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  retention_years INT NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),

  CONSTRAINT retention_years_check CHECK (retention_years IN (1, 2, 3, 5, 7, 10))
);

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================

-- ----- team_member_events -----
ALTER TABLE public.team_member_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_member_events_select_company_own"
  ON public.team_member_events FOR SELECT
  USING (
    company_id = public.get_company_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "team_member_events_insert_company_own"
  ON public.team_member_events FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

-- Events are immutable: no UPDATE or DELETE policies

-- ----- offboarding_checklists -----
ALTER TABLE public.offboarding_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offboarding_checklists_select"
  ON public.offboarding_checklists FOR SELECT
  USING (
    company_id = public.get_company_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "offboarding_checklists_insert"
  ON public.offboarding_checklists FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "offboarding_checklists_update"
  ON public.offboarding_checklists FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "offboarding_checklists_delete"
  ON public.offboarding_checklists FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));

-- ----- offboarding_templates -----
ALTER TABLE public.offboarding_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offboarding_templates_select"
  ON public.offboarding_templates FOR SELECT
  USING (
    company_id = public.get_company_id(auth.uid())
    OR company_id IS NULL
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "offboarding_templates_insert"
  ON public.offboarding_templates FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "offboarding_templates_update"
  ON public.offboarding_templates FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "offboarding_templates_delete"
  ON public.offboarding_templates FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));

-- ----- data_retention_settings -----
ALTER TABLE public.data_retention_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_retention_settings_select"
  ON public.data_retention_settings FOR SELECT
  USING (
    company_id = public.get_company_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "data_retention_settings_insert"
  ON public.data_retention_settings FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "data_retention_settings_update"
  ON public.data_retention_settings FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

-- No DELETE policy for data_retention_settings (one per company, never deleted)

-- =====================================================
-- 7. pg_cron JOBS
-- =====================================================

-- Ensure pg_cron extension is available (already created in migration 070)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ----- Scheduled termination processor (daily at 01:00 UTC) -----

CREATE OR REPLACE FUNCTION public.process_scheduled_terminations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_member RECORD;
BEGIN
  FOR v_member IN
    SELECT id, company_id
    FROM public.team_members
    WHERE termination_scheduled_date IS NOT NULL
      AND termination_scheduled_date <= CURRENT_DATE
      AND status = 'active'
  LOOP
    -- Update team member status to terminated
    UPDATE public.team_members
    SET status = 'terminated',
        is_active = false,
        termination_date = termination_scheduled_date,
        termination_scheduled_date = NULL,
        updated_at = NOW()
    WHERE id = v_member.id;

    -- Record the termination event
    INSERT INTO public.team_member_events (
      team_member_id, company_id, event_type, event_date, description, metadata
    ) VALUES (
      v_member.id,
      v_member.company_id,
      'terminated',
      CURRENT_DATE,
      'Desligamento programado executado automaticamente',
      jsonb_build_object('automated', true, 'source', 'scheduled_termination')
    );

    -- Cancel pending test invitations for terminated member
    UPDATE public.test_invitations
    SET status = 'cancelled', updated_at = NOW()
    WHERE team_member_id = v_member.id
      AND status IN ('sent', 'viewed', 'started');

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove existing job if re-running migration
SELECT cron.unschedule('process-scheduled-terminations')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-scheduled-terminations'
);

SELECT cron.schedule(
  'process-scheduled-terminations',
  '0 1 * * *',
  $$SELECT public.process_scheduled_terminations()$$
);

-- ----- Leave return reminder (daily at 08:00 UTC) -----

CREATE OR REPLACE FUNCTION public.notify_leave_returns()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_member RECORD;
  v_manager_profile_id UUID;
BEGIN
  FOR v_member IN
    SELECT tm.id, tm.name, tm.company_id, tm.department_id, tm.leave_expected_return
    FROM public.team_members tm
    WHERE tm.status = 'on_leave'
      AND tm.leave_expected_return IS NOT NULL
      AND tm.leave_expected_return = CURRENT_DATE + INTERVAL '7 days'
  LOOP
    -- Find department manager's profile_id
    SELECT d.manager_id INTO v_manager_profile_id
    FROM public.departments d
    WHERE d.id = v_member.department_id;

    IF v_manager_profile_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id, type, title, description, action_url, metadata, read
      ) VALUES (
        v_manager_profile_id,
        'team_lifecycle',
        'Retorno de afastamento previsto',
        format(
          'Colaborador %s tem retorno previsto para %s',
          v_member.name,
          to_char(v_member.leave_expected_return, 'DD/MM/YYYY')
        ),
        format('/empresa/equipes/membro/%s', v_member.id),
        jsonb_build_object('event', 'leave_return_reminder', 'teamMemberId', v_member.id),
        false
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove existing job if re-running migration
SELECT cron.unschedule('notify-leave-returns')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'notify-leave-returns'
);

SELECT cron.schedule(
  'notify-leave-returns',
  '0 8 * * *',
  $$SELECT public.notify_leave_returns()$$
);

-- =====================================================
-- 8. BACKFILL: Create 'hired' events for existing members
-- =====================================================

INSERT INTO public.team_member_events (
  team_member_id, company_id, event_type, event_date, description, metadata
)
SELECT
  tm.id,
  tm.company_id,
  'hired',
  COALESCE(tm.hire_date::date, tm.created_at::date),
  'Admissão registrada (backfill)',
  jsonb_build_object('backfill', true, 'source', 'migration_075')
FROM public.team_members tm
WHERE NOT EXISTS (
  SELECT 1 FROM public.team_member_events e
  WHERE e.team_member_id = tm.id AND e.event_type = 'hired'
);

-- =====================================================
-- TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE public.team_member_events IS 'Immutable event log tracking team member lifecycle changes (PRD-090)';
COMMENT ON TABLE public.offboarding_checklists IS 'Per-member offboarding checklist items (PRD-090)';
COMMENT ON TABLE public.offboarding_templates IS 'Reusable offboarding checklist templates, global or per-company (PRD-090)';
COMMENT ON TABLE public.data_retention_settings IS 'Company-level data retention configuration for terminated members (PRD-090)';

COMMIT;
