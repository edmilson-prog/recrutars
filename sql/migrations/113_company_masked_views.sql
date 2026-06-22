-- Migration 113: Approach B — restrict company direct SELECT on candidates/curriculums,
-- expose masked SECURITY DEFINER views candidates_for_company and curriculums_for_company.
--
-- CONSEQUENCE (handled in service layer, Section C): dropping the company's direct row
-- access means PostgREST embeds candidates(name,avatar_url) in APPLICATION_SELECT and
-- candidates(name) in CONVERSATION_SELECT now return NULL for company users (embeds follow
-- base-table RLS). Those embeds are removed and candidateName/candidateAvatar are populated
-- client-side from useCandidates (which reads candidates_for_company).

-- =====================================================
-- 1. CANDIDATES: replace the company talent-pool SELECT policy
--    with one that NO LONGER returns candidate rows directly to the company.
--    (Company reads candidates only through candidates_for_company.)
-- =====================================================
DROP POLICY IF EXISTS "candidates_select_company" ON public.candidates;
-- Intentionally NOT recreating a direct company SELECT policy.
-- Candidate own (candidates_update_own / candidates_insert_own) and
-- candidates_select_admin remain untouched and keep direct access.

-- =====================================================
-- 2. CURRICULUMS: drop the wide-open company SELECT policy.
--    (Company reads the parent curriculum only through curriculums_for_company.
--     Child tables keep their existing *_select_company policies — used by the
--     per-curriculum_id queries in getProfileForCompany.)
-- =====================================================
DROP POLICY IF EXISTS "curriculums_select_company" ON public.curriculums;

-- =====================================================
-- 3. VIEW: candidates_for_company
--    Same shape as candidates, but:
--      - reapplies the visibility predicate (non-private OR applicant-of-company
--        OR active team_member-of-company),
--      - masks cpf/email/phone/date_of_birth unless company_has_data_consent is true.
--    SECURITY DEFINER (security_invoker = off) so it bypasses base RLS and applies
--    its own predicate. GRANTed to authenticated; the WHERE clause restricts to
--    company users and their visible candidates.
-- =====================================================
CREATE OR REPLACE VIEW public.candidates_for_company
WITH (security_invoker = off) AS
SELECT
  c.id,
  c.profile_id,
  c.name,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.email ELSE NULL END AS email,
  c.avatar_url,
  c.title,
  c.location,
  c.city,
  c.state,
  c.experience_years,
  c.education,
  c.skills,
  c.salary_min,
  c.salary_max,
  c.salary_currency,
  c.availability,
  c.profile_completion,
  c.has_test,
  c.status,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.phone ELSE NULL END AS phone,
  c.linkedin,
  c.about,
  c.plan,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.date_of_birth ELSE NULL END AS date_of_birth,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.cpf ELSE NULL END AS cpf,
  c.visibility_mode,
  c.anonymous_id,
  c.created_at,
  c.deactivated_at,
  c.updated_at
FROM public.candidates c
WHERE public.get_user_type(auth.uid()) = 'company'
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
  );

GRANT SELECT ON public.candidates_for_company TO authenticated;

-- =====================================================
-- 4. VIEW: curriculums_for_company  (PARENT ONLY, no child embeds)
--    Masks email/phone unless consent; cidade/estado (location) stays visible.
--    Visibility reapplied via the candidate's visibility predicate.
-- =====================================================
CREATE OR REPLACE VIEW public.curriculums_for_company
WITH (security_invoker = off) AS
SELECT
  cu.id,
  cu.candidate_id,
  cu.name,
  cu.title,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.email ELSE NULL END AS email,
  CASE WHEN public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
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
  cu.updated_at
FROM public.curriculums cu
JOIN public.candidates c ON c.id = cu.candidate_id
WHERE public.get_user_type(auth.uid()) = 'company'
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
  );

GRANT SELECT ON public.curriculums_for_company TO authenticated;

-- NOTE: these views return 0 rows for non-company callers (admin/candidate) by
-- design (WHERE get_user_type(auth.uid())='company'). Admin/candidate reads use
-- the base tables directly; service-layer code must query these views ONLY in
-- company context (e.g. getCandidates/getProfileForCompany), never for admin.

COMMENT ON VIEW public.candidates_for_company IS
  'Masked talent-pool view for company role: sensitive cols (cpf,email,phone,date_of_birth) NULL unless accepted disclosure exists';
COMMENT ON VIEW public.curriculums_for_company IS
  'Masked parent curriculum view for company role (no child embeds): email/phone NULL unless accepted disclosure';

-- =====================================================
-- ADVERSARIAL VERIFICATION (run to verify, do not apply)
-- =====================================================
-- SELECT NOT EXISTS(SELECT 1 FROM pg_policy WHERE polname='candidates_select_company') AS cand_policy_dropped,
--        NOT EXISTS(SELECT 1 FROM pg_policy WHERE polname='curriculums_select_company') AS curr_policy_dropped,
--        to_regclass('public.candidates_for_company') IS NOT NULL AS cand_view_ok,
--        to_regclass('public.curriculums_for_company') IS NOT NULL AS curr_view_ok,
--        has_table_privilege('authenticated','public.candidates_for_company','SELECT') AS cand_grant_ok,
--        has_table_privilege('authenticated','public.curriculums_for_company','SELECT') AS curr_grant_ok;
-- Expected: all t.
--
-- -- Key columns present in candidates_for_company:
-- SELECT array_agg(column_name ORDER BY column_name) AS cols
-- FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='candidates_for_company'
--   AND column_name IN ('cpf','email','phone','date_of_birth','name','location');
-- Expected: array with all 6 names.
--
-- -- Masking test (no consent): impersonate a company user, read the view for an applicant candidate
-- -- Expected: name and location filled, email/phone/cpf/date_of_birth = NULL
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT id, name, email, phone, cpf, date_of_birth, location
-- FROM public.candidates_for_company WHERE id='<candidate_id>';
-- ROLLBACK;
--
-- -- Reveal test (with accepted disclosure):
-- INSERT INTO public.candidate_data_disclosures(application_id, candidate_id, company_id, status, accepted_at)
-- VALUES ('<application_id>','<candidate_id>','<company_id>','accepted', now())
-- ON CONFLICT (application_id, company_id) DO UPDATE SET status='accepted', accepted_at=now();
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT email, phone, cpf, date_of_birth FROM public.candidates_for_company WHERE id='<candidate_id>';
-- ROLLBACK;
-- -- Cleanup: DELETE FROM public.candidate_data_disclosures WHERE application_id='<application_id>' AND company_id='<company_id>';
--
-- -- Curriculum masking test (no consent):
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT email, phone, location FROM public.curriculums_for_company WHERE candidate_id='<candidate_id>';
-- ROLLBACK;
-- Expected: email/phone = NULL, location filled.
