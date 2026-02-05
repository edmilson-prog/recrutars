-- =====================================================
-- RecrutaRS: Interviews Table
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 006_conversations_messages.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: interviews
-- Interview scheduling between companies and candidates.
-- Supports multiple types (video, in-person, phone)
-- with slot proposal/confirmation workflow.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,

  -- Interview details
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'in_person', 'phone')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'suggestion_sent')),
  duration INTEGER NOT NULL DEFAULT 60, -- duration in minutes

  -- Scheduling
  proposed_slots JSONB, -- array of proposed datetime slots
  confirmed_datetime TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  response_deadline TIMESTAMPTZ,

  -- Candidate suggestion workflow
  suggested_slots JSONB, -- candidate-suggested alternative slots
  suggestion_reason TEXT,

  -- Location/link details
  video_link TEXT,
  address TEXT,
  map_link TEXT,
  phone_number TEXT,

  -- Interviewer info
  interviewer_name TEXT,
  interviewer_role TEXT,

  -- Notes
  notes TEXT,

  -- Cancellation
  cancellation_reason TEXT,
  cancellation_details TEXT,
  cancelled_at TIMESTAMPTZ,

  -- Completion
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON public.interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON public.interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_company_id ON public.interviews(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_confirmed_datetime ON public.interviews(confirmed_datetime);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON public.interviews(created_at DESC);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_interviews_updated_at ON public.interviews;
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Candidate: can read own interviews
CREATE POLICY "interviews_select_candidate_own"
  ON public.interviews FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can read own interviews
CREATE POLICY "interviews_select_company_own"
  ON public.interviews FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

-- Admin: can read all interviews
CREATE POLICY "interviews_select_admin"
  ON public.interviews FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Company: can create interviews
CREATE POLICY "interviews_insert_company"
  ON public.interviews FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

-- Admin: can create interviews
CREATE POLICY "interviews_insert_admin"
  ON public.interviews FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- Company: can update own interviews
CREATE POLICY "interviews_update_company"
  ON public.interviews FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

-- Candidate: can update own interviews (confirm, suggest, cancel)
CREATE POLICY "interviews_update_candidate"
  ON public.interviews FOR UPDATE
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Admin: can update any interview
CREATE POLICY "interviews_update_admin"
  ON public.interviews FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Company: can delete own interviews
CREATE POLICY "interviews_delete_company"
  ON public.interviews FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));

-- Admin: can delete any interview
CREATE POLICY "interviews_delete_admin"
  ON public.interviews FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

COMMENT ON TABLE public.interviews IS 'Interview scheduling with slot proposal/confirmation workflow (PRD-064)';
