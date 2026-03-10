-- =====================================================
-- RecrutaRS: Company Stats Triggers
-- Fix: active_jobs and total_candidates always 0
-- =====================================================
-- Adds triggers to keep companies.active_jobs and
-- companies.total_candidates in sync with jobs and
-- applications tables. Includes backfill for existing data.
-- =====================================================

-- =====================================================
-- FUNCTION: update_company_active_jobs()
-- Recalculates active_jobs for the affected company
-- whenever a job is inserted, updated, or deleted.
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_company_active_jobs()
RETURNS TRIGGER AS $$
DECLARE
  target_company_id UUID;
BEGIN
  -- Determine which company to update
  IF TG_OP = 'DELETE' THEN
    target_company_id := OLD.company_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.company_id IS DISTINCT FROM NEW.company_id THEN
    -- company_id changed: update both old and new company
    UPDATE public.companies
    SET active_jobs = (
      SELECT COUNT(*) FROM public.jobs
      WHERE company_id = OLD.company_id
        AND status = 'active'
        AND moderation_status = 'approved'
    )
    WHERE id = OLD.company_id;

    target_company_id := NEW.company_id;
  ELSE
    target_company_id := NEW.company_id;
  END IF;

  UPDATE public.companies
  SET active_jobs = (
    SELECT COUNT(*) FROM public.jobs
    WHERE company_id = target_company_id
      AND status = 'active'
      AND moderation_status = 'approved'
  )
  WHERE id = target_company_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: trg_update_company_active_jobs
-- Fires after INSERT, UPDATE, DELETE on jobs
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_company_active_jobs ON public.jobs;

CREATE TRIGGER trg_update_company_active_jobs
  AFTER INSERT OR UPDATE OF status, moderation_status, company_id OR DELETE
  ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_active_jobs();

-- =====================================================
-- FUNCTION: update_company_total_candidates()
-- Recalculates total_candidates for the affected company
-- whenever an application is inserted or deleted.
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_company_total_candidates()
RETURNS TRIGGER AS $$
DECLARE
  target_company_id UUID;
BEGIN
  -- Get company_id from the related job
  IF TG_OP = 'DELETE' THEN
    SELECT company_id INTO target_company_id
    FROM public.jobs WHERE id = OLD.job_id;
  ELSE
    SELECT company_id INTO target_company_id
    FROM public.jobs WHERE id = NEW.job_id;
  END IF;

  -- If the job was already deleted (CASCADE), skip
  IF target_company_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE public.companies
  SET total_candidates = (
    SELECT COUNT(*) FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE j.company_id = target_company_id
  )
  WHERE id = target_company_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: trg_update_company_total_candidates
-- Fires after INSERT, DELETE on applications
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_company_total_candidates ON public.applications;

CREATE TRIGGER trg_update_company_total_candidates
  AFTER INSERT OR DELETE
  ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_total_candidates();

-- =====================================================
-- BACKFILL: Update existing companies with real counts
-- =====================================================

-- Backfill active_jobs
UPDATE public.companies c
SET active_jobs = (
  SELECT COUNT(*) FROM public.jobs j
  WHERE j.company_id = c.id
    AND j.status = 'active'
    AND j.moderation_status = 'approved'
);

-- Backfill total_candidates
UPDATE public.companies c
SET total_candidates = (
  SELECT COUNT(*) FROM public.applications a
  JOIN public.jobs j ON j.id = a.job_id
  WHERE j.company_id = c.id
);
