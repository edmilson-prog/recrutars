-- =====================================================
-- RecrutaRS: Job Assessments (PRD-048)
-- Migration 036: Teste por Vaga — Supabase Integration
-- =====================================================
-- Creates tables for job-specific behavioral assessments:
--   job_assessments       — assessment configuration per job
--   job_assessment_invites — invites (internal + magic link)
--   job_assessment_results — candidate results + AI analysis
-- =====================================================

-- =====================================================
-- TABLE: job_assessments
-- Behavioral test configuration tied to a specific job
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  competencies JSONB NOT NULL DEFAULT '{}',
  questions_ids TEXT[] NOT NULL DEFAULT '{}',
  total_questions INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER NOT NULL DEFAULT 20,
  expiration_days INTEGER NOT NULL DEFAULT 7,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.job_assessments IS 'Behavioral test configurations tied to specific jobs (PRD-048)';

-- Indices
CREATE INDEX IF NOT EXISTS idx_job_assessments_job_id ON public.job_assessments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assessments_company_id ON public.job_assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_job_assessments_status ON public.job_assessments(status);
CREATE INDEX IF NOT EXISTS idx_job_assessments_created_by ON public.job_assessments(created_by);

-- Trigger: auto-update updated_at
DROP TRIGGER IF EXISTS update_job_assessments_updated_at ON public.job_assessments;
CREATE TRIGGER update_job_assessments_updated_at
  BEFORE UPDATE ON public.job_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.job_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_assessments_select_company"
  ON public.job_assessments FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "job_assessments_select_admin"
  ON public.job_assessments FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "job_assessments_insert_company"
  ON public.job_assessments FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "job_assessments_update_company"
  ON public.job_assessments FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "job_assessments_update_admin"
  ON public.job_assessments FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "job_assessments_delete_company"
  ON public.job_assessments FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));

-- =====================================================
-- TABLE: job_assessment_invites
-- Invites for candidates to take a job assessment
-- Supports internal (candidate_id) and magic_link (token)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_assessment_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_assessment_id UUID NOT NULL REFERENCES public.job_assessments(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'internal'
    CHECK (type IN ('internal', 'magic_link')),
  -- For internal candidates
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
  -- For external candidates (magic link)
  external_name TEXT,
  external_email TEXT,
  magic_token UUID UNIQUE,
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'started', 'completed', 'expired', 'cancelled')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.job_assessment_invites IS 'Invites for candidates to take a job-specific assessment (PRD-048)';

-- Indices
CREATE INDEX IF NOT EXISTS idx_job_assessment_invites_assessment_id ON public.job_assessment_invites(job_assessment_id);
CREATE INDEX IF NOT EXISTS idx_job_assessment_invites_candidate_id ON public.job_assessment_invites(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_assessment_invites_magic_token ON public.job_assessment_invites(magic_token);
CREATE INDEX IF NOT EXISTS idx_job_assessment_invites_status ON public.job_assessment_invites(status);
CREATE INDEX IF NOT EXISTS idx_job_assessment_invites_expires_at ON public.job_assessment_invites(expires_at);

-- Trigger: auto-update updated_at
DROP TRIGGER IF EXISTS update_job_assessment_invites_updated_at ON public.job_assessment_invites;
CREATE TRIGGER update_job_assessment_invites_updated_at
  BEFORE UPDATE ON public.job_assessment_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.job_assessment_invites ENABLE ROW LEVEL SECURITY;

-- Company can see invites for their assessments
CREATE POLICY "job_assessment_invites_select_company"
  ON public.job_assessment_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.job_assessments ja
      WHERE ja.id = job_assessment_id
      AND ja.company_id = public.get_company_id(auth.uid())
    )
  );

-- Candidate can see their own invites
CREATE POLICY "job_assessment_invites_select_candidate"
  ON public.job_assessment_invites FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Admin can see all invites
CREATE POLICY "job_assessment_invites_select_admin"
  ON public.job_assessment_invites FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Company can create invites for their assessments
CREATE POLICY "job_assessment_invites_insert_company"
  ON public.job_assessment_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_assessments ja
      WHERE ja.id = job_assessment_id
      AND ja.company_id = public.get_company_id(auth.uid())
    )
  );

-- Company can update invites (cancel, resend)
CREATE POLICY "job_assessment_invites_update_company"
  ON public.job_assessment_invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.job_assessments ja
      WHERE ja.id = job_assessment_id
      AND ja.company_id = public.get_company_id(auth.uid())
    )
  );

-- Candidate can update their own invites (mark started/completed)
CREATE POLICY "job_assessment_invites_update_candidate"
  ON public.job_assessment_invites FOR UPDATE
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Company can delete invites
CREATE POLICY "job_assessment_invites_delete_company"
  ON public.job_assessment_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.job_assessments ja
      WHERE ja.id = job_assessment_id
      AND ja.company_id = public.get_company_id(auth.uid())
    )
  );

-- =====================================================
-- TABLE: job_assessment_results
-- Results + AI analysis for completed assessments
-- =====================================================

CREATE TABLE IF NOT EXISTS public.job_assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id UUID NOT NULL REFERENCES public.job_assessment_invites(id) ON DELETE CASCADE,
  job_assessment_id UUID NOT NULL REFERENCES public.job_assessments(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
  candidate_name TEXT,
  candidate_email TEXT,
  -- Scores
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  competency_scores JSONB NOT NULL DEFAULT '{}',
  -- AI analysis
  ai_analysis JSONB NOT NULL DEFAULT '{}',
  ai_recommendation TEXT DEFAULT 'evaluate'
    CHECK (ai_recommendation IN ('approve', 'evaluate', 'reject')),
  -- Recruiter adjustments
  recruiter_adjustments JSONB,
  recruiter_decision TEXT
    CHECK (recruiter_decision IN ('approved', 'pending', 'rejected')),
  recruiter_notes TEXT,
  -- Alerts
  red_flags JSONB NOT NULL DEFAULT '[]',
  -- Responses
  responses JSONB NOT NULL DEFAULT '[]',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.job_assessment_results IS 'Results and AI analysis for completed job assessments (PRD-048)';

-- Indices
CREATE INDEX IF NOT EXISTS idx_job_assessment_results_invite_id ON public.job_assessment_results(invite_id);
CREATE INDEX IF NOT EXISTS idx_job_assessment_results_assessment_id ON public.job_assessment_results(job_assessment_id);
CREATE INDEX IF NOT EXISTS idx_job_assessment_results_candidate_id ON public.job_assessment_results(candidate_id);

-- Trigger: auto-update updated_at
DROP TRIGGER IF EXISTS update_job_assessment_results_updated_at ON public.job_assessment_results;
CREATE TRIGGER update_job_assessment_results_updated_at
  BEFORE UPDATE ON public.job_assessment_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.job_assessment_results ENABLE ROW LEVEL SECURITY;

-- Company can see results for their assessments
CREATE POLICY "job_assessment_results_select_company"
  ON public.job_assessment_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.job_assessments ja
      WHERE ja.id = job_assessment_id
      AND ja.company_id = public.get_company_id(auth.uid())
    )
  );

-- Candidate can see their own results
CREATE POLICY "job_assessment_results_select_candidate"
  ON public.job_assessment_results FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Admin can see all results
CREATE POLICY "job_assessment_results_select_admin"
  ON public.job_assessment_results FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Insert: company (via service) or candidate (completing test)
CREATE POLICY "job_assessment_results_insert_company"
  ON public.job_assessment_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_assessments ja
      WHERE ja.id = job_assessment_id
      AND ja.company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "job_assessment_results_insert_candidate"
  ON public.job_assessment_results FOR INSERT
  WITH CHECK (candidate_id = public.get_candidate_id(auth.uid()));

-- Company can update results (recruiter decision/notes)
CREATE POLICY "job_assessment_results_update_company"
  ON public.job_assessment_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.job_assessments ja
      WHERE ja.id = job_assessment_id
      AND ja.company_id = public.get_company_id(auth.uid())
    )
  );

-- Admin can update any result
CREATE POLICY "job_assessment_results_update_admin"
  ON public.job_assessment_results FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');
