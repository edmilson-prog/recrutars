-- =====================================================
-- RecrutaRS: Behavioral Tests
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 007_interviews.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: behavioral_tests
-- Legacy behavioral tests (DISC-based) sent by companies
-- to candidates. Stores results as JSONB.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.behavioral_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  candidate_name TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'cancelled')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_behavioral_tests_candidate_id ON public.behavioral_tests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_tests_company_id ON public.behavioral_tests(company_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_tests_job_id ON public.behavioral_tests(job_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_tests_status ON public.behavioral_tests(status);
CREATE INDEX IF NOT EXISTS idx_behavioral_tests_created_at ON public.behavioral_tests(created_at DESC);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_behavioral_tests_updated_at ON public.behavioral_tests;
CREATE TRIGGER update_behavioral_tests_updated_at
  BEFORE UPDATE ON public.behavioral_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.behavioral_tests ENABLE ROW LEVEL SECURITY;

-- Candidate: can read own tests
CREATE POLICY "behavioral_tests_select_candidate_own"
  ON public.behavioral_tests FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can read tests they requested
CREATE POLICY "behavioral_tests_select_company"
  ON public.behavioral_tests FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

-- Admin: can read all tests
CREATE POLICY "behavioral_tests_select_admin"
  ON public.behavioral_tests FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Company: can create tests (send to candidates)
CREATE POLICY "behavioral_tests_insert_company"
  ON public.behavioral_tests FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

-- Admin: can create tests
CREATE POLICY "behavioral_tests_insert_admin"
  ON public.behavioral_tests FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- Candidate: can update own tests (complete them)
CREATE POLICY "behavioral_tests_update_candidate"
  ON public.behavioral_tests FOR UPDATE
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can update tests they requested
CREATE POLICY "behavioral_tests_update_company"
  ON public.behavioral_tests FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

-- Admin: can update any test
CREATE POLICY "behavioral_tests_update_admin"
  ON public.behavioral_tests FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

COMMENT ON TABLE public.behavioral_tests IS 'Legacy behavioral tests (DISC) sent by companies to candidates with JSONB results (PRD-064)';
