-- Migration 116: reveal the candidate's PHONE to a company as soon as the
-- candidate is in one of that company's selective processes (has applied to a
-- company job), WITHOUT waiting for the LGPD data-disclosure consent.
--
-- Rationale: the recruiter needs an operational contact channel (WhatsApp/call)
-- while running the process. The other sensitive fields (email, cpf,
-- date_of_birth) stay masked until an accepted disclosure exists (unchanged).
--
-- Scope decision (product): "in a selective process" = the candidate has ANY
-- application to a job owned by the company (no status filter) — consistent with
-- the visibility predicate already used by these views (migrations 113/115).
--
-- This only widens the PHONE reveal. The WHERE-clause visibility predicate and
-- the email/cpf/date_of_birth masking are kept exactly as migration 115 left them.

-- =====================================================
-- FUNCTION: company_has_application_from_candidate
-- TRUE when the candidate has at least one application to a job owned by the
-- given company. SECURITY DEFINER so it can run inside the SECURITY DEFINER
-- views and read applications/jobs regardless of the caller's RLS.
-- =====================================================
CREATE OR REPLACE FUNCTION public.company_has_application_from_candidate(
  p_company_id UUID,
  p_candidate_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE a.candidate_id = p_candidate_id
      AND j.company_id = p_company_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.company_has_application_from_candidate(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.company_has_application_from_candidate(UUID, UUID) IS
  'TRUE when the candidate has any application to a job owned by the company (in a selective process). Used to reveal phone to the recruiter (LGPD operational-contact carve-out).';

-- =====================================================
-- VIEW: candidates_for_company  (phone reveal widened)
-- phone now revealed for: admin OR accepted disclosure OR in-process applicant.
-- email/cpf/date_of_birth: unchanged (admin OR accepted disclosure).
-- =====================================================
CREATE OR REPLACE VIEW public.candidates_for_company
WITH (security_invoker = off) AS
SELECT
  c.id,
  c.profile_id,
  c.name,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
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
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), c.id)
       THEN c.phone ELSE NULL END AS phone,
  c.linkedin,
  c.about,
  c.plan,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.date_of_birth ELSE NULL END AS date_of_birth,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.cpf ELSE NULL END AS cpf,
  c.visibility_mode,
  c.anonymous_id,
  c.created_at,
  c.deactivated_at,
  c.updated_at
FROM public.candidates c
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

GRANT SELECT ON public.candidates_for_company TO authenticated;

-- =====================================================
-- VIEW: curriculums_for_company  (phone reveal widened, same rule)
-- =====================================================
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
  cu.updated_at
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

COMMENT ON VIEW public.candidates_for_company IS
  'Company (masked by consent) + admin (full) candidate read surface; email/cpf/date_of_birth NULL for company without accepted disclosure; phone revealed once the candidate is in the company''s selective process';
COMMENT ON VIEW public.curriculums_for_company IS
  'Company (masked by consent) + admin (full) parent curriculum view (no child embeds); phone revealed once the candidate is in the company''s selective process';

-- =====================================================
-- ADVERSARIAL VERIFICATION (run to verify, do not apply)
-- =====================================================
-- -- Helper present + granted:
-- SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname='company_has_application_from_candidate') AS fn_ok,
--        has_function_privilege('authenticated','public.company_has_application_from_candidate(uuid,uuid)','EXECUTE') AS grant_ok;
-- Expected: both t.
--
-- -- Applicant (in process, NO consent): phone visible, email/cpf/dob NULL.
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT id, name, phone, email, cpf, date_of_birth
-- FROM public.candidates_for_company WHERE id='<applicant_candidate_id>';
-- ROLLBACK;
-- Expected: phone filled; email/cpf/date_of_birth NULL.
--
-- -- Public non-applicant (NOT in process, NO consent): phone still NULL.
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT id, name, phone FROM public.candidates_for_company WHERE id='<public_non_applicant_candidate_id>';
-- ROLLBACK;
-- Expected: phone NULL (only revealed inside a selective process).
