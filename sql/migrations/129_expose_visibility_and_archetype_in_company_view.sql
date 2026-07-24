-- Migration 129: expose visibility_locked (bugfix — never selected since the
-- view existed) and behavioral_archetype_id (latest Gauge-Pro archetype) on
-- candidates_for_company, so admin/Candidates.tsx can filter by "origin"
-- (colaborador vs candidato) and behavioral profile entirely on the server,
-- instead of fetching every candidate row into the browser to filter there.
--
-- Both new columns are non-sensitive (no LGPD masking change): visibility_locked
-- is an internal flag, behavioral_archetype_id is a text id already exposed to
-- companies/admin via the Gauge-Pro results screens.
--
-- WHERE-clause visibility predicate and existing email/cpf/date_of_birth/phone
-- masking are kept byte-for-byte identical to migration 116.
--
-- The two new columns are inserted mid-list (after anonymous_id), which
-- CREATE OR REPLACE VIEW cannot do (it can only append at the end). The view has
-- no dependent objects, so we DROP and recreate it to keep the intended column
-- order. GRANT SELECT is reissued below.

DROP VIEW IF EXISTS public.candidates_for_company;

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
  c.visibility_locked,
  (
    SELECT gpr.archetype_id
    FROM public.gauge_pro_results gpr
    WHERE gpr.candidate_id = c.id
    ORDER BY gpr.generated_at DESC
    LIMIT 1
  ) AS behavioral_archetype_id,
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

COMMENT ON VIEW public.candidates_for_company IS
  'Company (masked by consent) + admin (full) candidate read surface; email/cpf/date_of_birth NULL for company without accepted disclosure; phone revealed once the candidate is in the company''s selective process; visibility_locked + behavioral_archetype_id added in migration 129 for server-side filtering';

-- =====================================================
-- ADVERSARIAL VERIFICATION (run to verify, do not apply)
-- =====================================================
-- -- New columns present:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'candidates_for_company' AND column_name IN ('visibility_locked', 'behavioral_archetype_id');
-- Expected: both rows present.
--
-- -- visibility_locked reflects the real table value (was always NULL/false before):
-- SELECT count(*) FROM public.candidates WHERE visibility_locked = true;
-- -- compare against (as admin):
-- SELECT count(*) FROM public.candidates_for_company WHERE visibility_locked = true;
-- Expected: same count.
--
-- -- behavioral_archetype_id matches the candidate's most recent Gauge-Pro result:
-- SELECT cfc.id, cfc.behavioral_archetype_id, gpr.archetype_id, gpr.generated_at
-- FROM public.candidates_for_company cfc
-- JOIN public.gauge_pro_results gpr ON gpr.candidate_id = cfc.id
-- WHERE cfc.id = '<some_candidate_id_with_multiple_gauge_results>'
-- ORDER BY gpr.generated_at DESC;
-- Expected: cfc.behavioral_archetype_id equals the archetype_id of the most recent row.
--
-- -- Masking of email/cpf/date_of_birth/phone is unchanged from migration 116
-- -- (same CASE expressions, byte-for-byte) — no re-verification needed.
