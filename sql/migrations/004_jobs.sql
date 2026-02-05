-- =====================================================
-- RecrutaRS: Jobs Table
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 003_helpers_and_functions.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: jobs
-- Job postings created by companies.
-- Includes moderation workflow fields for admin review.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  location TEXT,
  type TEXT NOT NULL DEFAULT 'remote' CHECK (type IN ('remote', 'hybrid', 'onsite')),
  level TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  area TEXT,
  applications_count INTEGER NOT NULL DEFAULT 0,

  -- Moderation workflow
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'correction_requested')),
  moderated_by UUID REFERENCES public.profiles(id),
  moderated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  correction_fields TEXT[],
  admin_notes TEXT,

  -- Highlighting / featured
  is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  highlighted_until TIMESTAMPTZ,

  -- Publication lifecycle
  published_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  finalization_reason TEXT CHECK (finalization_reason IS NULL OR finalization_reason IN ('filled', 'cancelled', 'expired')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_area ON public.jobs(area);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_moderation_status ON public.jobs(moderation_status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_level ON public.jobs(level);

-- Full-text search on title + description
CREATE INDEX IF NOT EXISTS idx_jobs_fts ON public.jobs
  USING GIN (to_tsvector('portuguese', title || ' ' || description));

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read active + approved jobs
CREATE POLICY "jobs_select_public"
  ON public.jobs FOR SELECT
  USING (status = 'active' AND moderation_status = 'approved');

-- Company: can read all own jobs (any status)
CREATE POLICY "jobs_select_company_own"
  ON public.jobs FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

-- Admin: can read all jobs
CREATE POLICY "jobs_select_admin"
  ON public.jobs FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Company: can insert own jobs
CREATE POLICY "jobs_insert_company_own"
  ON public.jobs FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

-- Company: can update own jobs
CREATE POLICY "jobs_update_company_own"
  ON public.jobs FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

-- Admin: can update any job (moderation)
CREATE POLICY "jobs_update_admin"
  ON public.jobs FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Company: can delete own jobs
CREATE POLICY "jobs_delete_company_own"
  ON public.jobs FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));

-- Admin: can delete any job
CREATE POLICY "jobs_delete_admin"
  ON public.jobs FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

COMMENT ON TABLE public.jobs IS 'Job postings with moderation workflow, created by companies (PRD-064)';
