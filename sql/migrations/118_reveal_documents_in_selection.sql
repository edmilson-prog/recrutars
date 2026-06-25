-- Migration 118: reveal the candidate's attached documents (resume PDF +
-- presentation video) to the company as soon as the candidate is in one of that
-- company's selective processes (has applied to a company job), WITHOUT waiting
-- for the LGPD data-disclosure consent.
--
-- Rationale (product decision, supersedes migration 117): the recruiter needs the
-- candidate's resume/curriculum while evaluating them in a process. So the
-- documents now follow the SAME in-process carve-out already used for the phone
-- (migration 116): revealed for admin OR accepted disclosure OR in-process
-- applicant.
--
-- Privacy note: the resume PDF may contain cpf/email/phone printed inside it.
-- This is an explicit product choice to make the CV available during the process.
-- The STRUCTURED email/cpf/date_of_birth fields stay masked until consent
-- (unchanged) — only the document columns and phone widen to in-process.
--
-- This only widens the 7 document columns. The WHERE-clause visibility predicate,
-- the email/cpf masking and the phone in-process reveal are kept exactly as
-- migration 117 left them. The helper function
-- company_has_application_from_candidate(uuid, uuid) already exists (migration 116).

CREATE OR REPLACE VIEW public.curriculums_for_company
WITH (security_invoker = off) AS
SELECT
  cu.id,
  cu.candidate_id,
  cu.name,
  cu.title,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.email ELSE NULL END AS email,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.phone ELSE NULL END AS phone,
  cu.location,
  cu.city,
  cu.state,
  cu.linkedin,
  cu.about,
  cu.availability,
  cu.salary_min,
  cu.salary_max,
  cu.is_default,
  cu.is_archived,
  cu.created_at,
  cu.updated_at,
  -- Documents (resume PDF + presentation video): revealed for admin OR accepted
  -- disclosure OR in-process applicant (the recruiter is running the process).
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_url ELSE NULL END AS resume_pdf_url,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_name ELSE NULL END AS resume_pdf_name,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_size ELSE NULL END AS resume_pdf_size,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_uploaded_at ELSE NULL END AS resume_pdf_uploaded_at,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.presentation_video_url ELSE NULL END AS presentation_video_url,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.presentation_video_type ELSE NULL END AS presentation_video_type,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.presentation_video_name ELSE NULL END AS presentation_video_name
FROM public.curriculums cu
JOIN public.candidates c ON c.id = cu.candidate_id
WHERE public.get_user_type(auth.uid()) = 'admin'
  OR (
    public.get_user_type(auth.uid()) = 'company'
    AND (
      c.visibility_mode IS DISTINCT FROM 'private'
      OR EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        WHERE a.candidate_id = c.id
          AND j.company_id = public.get_company_id(auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE (
                tm.imported_from_candidate_id = c.id
                OR tm.email = (SELECT p.email FROM public.profiles p WHERE p.id = c.profile_id)
              )
          AND tm.company_id = public.get_company_id(auth.uid())
          AND tm.is_active = TRUE
      )
    )
  );

GRANT SELECT ON public.curriculums_for_company TO authenticated;

COMMENT ON VIEW public.curriculums_for_company IS
  'Company (masked by consent) + admin (full) parent curriculum view (no child embeds); phone, resume PDF and presentation video revealed once the candidate is in the company''s selective process; email/cpf stay masked until accepted data disclosure';

-- =====================================================
-- ADVERSARIAL VERIFICATION (run to verify, do not apply)
-- =====================================================
-- -- 1) Company WITHOUT consent, applicant in process: documents + phone filled,
-- --    email NULL.
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT phone, email, resume_pdf_url, presentation_video_url
-- FROM public.curriculums_for_company WHERE candidate_id='<applicant_candidate_id>';
-- ROLLBACK;
-- Expected: phone + resume_pdf_url + presentation_video_url filled (when uploaded); email NULL.
--
-- -- 2) Company, public NON-applicant (not in process, no consent): documents NULL.
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT resume_pdf_url, presentation_video_url
-- FROM public.curriculums_for_company WHERE candidate_id='<public_non_applicant_candidate_id>';
-- ROLLBACK;
-- Expected: both NULL (documents only revealed inside a selective process / consent).
