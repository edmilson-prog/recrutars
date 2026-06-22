-- Migration 115: let candidates_for_company / curriculums_for_company also serve
-- the ADMIN role (all rows, unmasked). Section C routed getCandidates/getProfile
-- through these views; admins (platform operator) use the same hooks and must see
-- every candidate with full data. Admin already has candidates_select_admin /
-- curriculums_select_admin on the base tables; this keeps the view path consistent.
--
-- For admin: WHERE matches all rows; masking CASE reveals unconditionally.
-- For company: unchanged (visibility predicate + consent masking).

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
  'Company (masked by consent) + admin (full) candidate read surface; sensitive cols NULL for company without accepted disclosure';
COMMENT ON VIEW public.curriculums_for_company IS
  'Company (masked by consent) + admin (full) parent curriculum read surface (no child embeds)';