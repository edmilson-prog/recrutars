-- =====================================================
-- RecrutaRS: Applications, Notes & History
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 004_jobs.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: applications
-- Candidate applications to job postings.
-- Unique constraint ensures one application per job+candidate.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interview', 'approved', 'rejected', 'withdrawn')),
  message TEXT,
  test_status TEXT NOT NULL DEFAULT 'not_requested'
    CHECK (test_status IN ('not_requested', 'pending', 'completed')),
  test_requested_at TIMESTAMPTZ,
  test_deadline TIMESTAMPTZ,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One application per candidate per job
  CONSTRAINT applications_job_candidate_unique UNIQUE (job_id, candidate_id)
);

-- =====================================================
-- INDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON public.applications(applied_at DESC);

-- =====================================================
-- TABLE: application_notes
-- Internal notes on applications (by recruiters/admins).
-- =====================================================

CREATE TABLE IF NOT EXISTS public.application_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_notes_application_id ON public.application_notes(application_id);

-- =====================================================
-- TABLE: application_history
-- Status change audit trail for applications.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.application_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_application_history_application_id ON public.application_history(application_id);

-- =====================================================
-- FUNCTION + TRIGGER: update_job_applications_count
-- Keeps jobs.applications_count in sync when
-- applications are inserted or deleted.
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_job_applications_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs
      SET applications_count = applications_count + 1
      WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs
      SET applications_count = applications_count - 1
      WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_job_applications_count ON public.applications;
CREATE TRIGGER trg_update_job_applications_count
  AFTER INSERT OR DELETE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_applications_count();

COMMENT ON FUNCTION public.update_job_applications_count() IS 'Increments/decrements jobs.applications_count on application insert/delete (PRD-064)';

-- =====================================================
-- TRIGGER: Auto-update updated_at for applications
-- =====================================================

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;

-- ----- applications -----

-- Candidate: can read own applications
CREATE POLICY "applications_select_candidate_own"
  ON public.applications FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can read applications for their jobs
CREATE POLICY "applications_select_company"
  ON public.applications FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE company_id = public.get_company_id(auth.uid())
    )
  );

-- Admin: can read all applications
CREATE POLICY "applications_select_admin"
  ON public.applications FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Candidate: can insert own applications
CREATE POLICY "applications_insert_candidate"
  ON public.applications FOR INSERT
  WITH CHECK (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can update applications for their jobs
CREATE POLICY "applications_update_company"
  ON public.applications FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE company_id = public.get_company_id(auth.uid())
    )
  );

-- Candidate: can update own applications (e.g. withdraw)
CREATE POLICY "applications_update_candidate"
  ON public.applications FOR UPDATE
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Admin: can update any application
CREATE POLICY "applications_update_admin"
  ON public.applications FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Candidate: can delete own applications
CREATE POLICY "applications_delete_candidate"
  ON public.applications FOR DELETE
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- ----- application_notes -----

-- Company: can read notes for their jobs' applications
CREATE POLICY "application_notes_select_company"
  ON public.application_notes FOR SELECT
  USING (
    application_id IN (
      SELECT a.id FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE j.company_id = public.get_company_id(auth.uid())
    )
  );

-- Admin: can read all notes
CREATE POLICY "application_notes_select_admin"
  ON public.application_notes FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Company: can insert notes for their jobs' applications
CREATE POLICY "application_notes_insert_company"
  ON public.application_notes FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT a.id FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE j.company_id = public.get_company_id(auth.uid())
    )
  );

-- Admin: can insert any note
CREATE POLICY "application_notes_insert_admin"
  ON public.application_notes FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- ----- application_history -----

-- Company: can read history for their jobs' applications
CREATE POLICY "application_history_select_company"
  ON public.application_history FOR SELECT
  USING (
    application_id IN (
      SELECT a.id FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE j.company_id = public.get_company_id(auth.uid())
    )
  );

-- Candidate: can read own application history
CREATE POLICY "application_history_select_candidate"
  ON public.application_history FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM public.applications
      WHERE candidate_id = public.get_candidate_id(auth.uid())
    )
  );

-- Admin: can read all history
CREATE POLICY "application_history_select_admin"
  ON public.application_history FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Company: can insert history entries
CREATE POLICY "application_history_insert_company"
  ON public.application_history FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT a.id FROM public.applications a
      JOIN public.jobs j ON a.job_id = j.id
      WHERE j.company_id = public.get_company_id(auth.uid())
    )
  );

-- Admin: can insert any history entry
CREATE POLICY "application_history_insert_admin"
  ON public.application_history FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

COMMENT ON TABLE public.applications IS 'Job applications linking candidates to jobs with status workflow (PRD-064)';
COMMENT ON TABLE public.application_notes IS 'Internal recruiter/admin notes on applications (PRD-064)';
COMMENT ON TABLE public.application_history IS 'Audit trail of application status changes (PRD-064)';
