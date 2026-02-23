-- =====================================================
-- RecrutaRS: Applications — Company INSERT Policy
-- Fix: "Convidar para Vaga" — allow companies to create
-- applications (invitations) for their own jobs.
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 038_candidate_onboarding.sql has been applied.
-- =====================================================

-- Allow companies to create applications (invitations) for their own jobs
CREATE POLICY "applications_insert_company"
  ON public.applications FOR INSERT
  WITH CHECK (
    job_id IN (
      SELECT id FROM public.jobs
      WHERE company_id = public.get_company_id(auth.uid())
    )
  );

COMMENT ON POLICY "applications_insert_company" ON public.applications IS
  'Companies can create applications (invitations) for candidates on their own jobs';
