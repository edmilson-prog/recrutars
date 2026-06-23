-- Migration 117: expose the candidate's attached documents (resume PDF + presentation
-- video) to the company through curriculums_for_company, MASKED BY CONSENT — same rule
-- as email/cpf/date_of_birth (admin OR accepted data disclosure).
--
-- Rationale: the resume PDF typically contains email/cpf/phone, which the LGPD consent
-- system keeps hidden until the candidate accepts the data-sharing term. So the documents
-- are revealed ONLY with an accepted disclosure — NOT under the in-process phone carve-out.
--
-- This only ADDS 7 masked columns. The WHERE-clause visibility predicate, the
-- email/cpf masking and the phone in-process reveal are kept exactly as migration 116.

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
  -- Documents (resume PDF + presentation video): revealed only with consent.
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_url ELSE NULL END AS resume_pdf_url,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_name ELSE NULL END AS resume_pdf_name,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_size ELSE NULL END AS resume_pdf_size,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_uploaded_at ELSE NULL END AS resume_pdf_uploaded_at,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.presentation_video_url ELSE NULL END AS presentation_video_url,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.presentation_video_type ELSE NULL END AS presentation_video_type,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
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
  'Company (masked by consent) + admin (full) parent curriculum view (no child embeds); phone revealed once the candidate is in the company''s selective process; resume PDF + presentation video revealed only with accepted data disclosure';

-- =====================================================
-- ADVERSARIAL VERIFICATION (run to verify, do not apply)
-- =====================================================
-- -- 1) The 7 document columns exist on the view:
-- SELECT array_agg(column_name ORDER BY column_name) AS cols
-- FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='curriculums_for_company'
--   AND column_name IN ('resume_pdf_url','resume_pdf_name','resume_pdf_size',
--                       'resume_pdf_uploaded_at','presentation_video_url',
--                       'presentation_video_type','presentation_video_name');
-- Expected: array with all 7 names.
--
-- -- 2) Company WITHOUT consent (applicant in process): documents NULL, phone filled.
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT phone, resume_pdf_url, presentation_video_url
-- FROM public.curriculums_for_company WHERE candidate_id='<applicant_candidate_id>';
-- ROLLBACK;
-- Expected: phone filled; resume_pdf_url and presentation_video_url = NULL.
--
-- -- 3) Company WITH accepted disclosure: documents filled.
-- INSERT INTO public.candidate_data_disclosures(application_id, candidate_id, company_id, status, accepted_at)
-- VALUES ('<application_id>','<candidate_id>','<company_id>','accepted', now())
-- ON CONFLICT (application_id, company_id) DO UPDATE SET status='accepted', accepted_at=now();
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT resume_pdf_url, presentation_video_url FROM public.curriculums_for_company WHERE candidate_id='<candidate_id>';
-- ROLLBACK;
-- -- Cleanup: DELETE FROM public.candidate_data_disclosures WHERE application_id='<application_id>' AND company_id='<company_id>';
-- Expected: both filled (when the candidate actually uploaded them).
