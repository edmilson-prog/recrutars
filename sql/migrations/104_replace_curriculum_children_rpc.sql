-- ============================================================================
-- Migration 104: replace_curriculum_children RPC
-- ----------------------------------------------------------------------------
-- The service layer used to replace curriculum sub-entities with two separate
-- statements (DELETE all + INSERT all). When the INSERT failed (statement
-- timeout, RLS rejection), the DELETE had already committed and the candidate
-- silently lost data. This RPC performs the whole replace atomically inside a
-- single transaction: if any INSERT fails, the DELETEs roll back too.
--
-- SECURITY INVOKER: RLS policies still apply to every statement inside.
-- The explicit ownership check turns the silent no-op DELETE (RLS filtering
-- out all rows, e.g. during admin impersonation) into a loud 42501 error.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.replace_curriculum_children(
  p_curriculum_id uuid,
  p_experiences jsonb DEFAULT NULL,
  p_education jsonb DEFAULT NULL,
  p_skills jsonb DEFAULT NULL,
  p_courses jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.curriculums
    WHERE id = p_curriculum_id
      AND candidate_id = public.get_candidate_id(auth.uid())
  ) THEN
    RAISE EXCEPTION 'Sem permissão para alterar este currículo'
      USING ERRCODE = '42501';
  END IF;

  IF p_experiences IS NOT NULL THEN
    DELETE FROM public.curriculum_experiences WHERE curriculum_id = p_curriculum_id;
    INSERT INTO public.curriculum_experiences
      (curriculum_id, company, role, start_date, end_date, is_current, description, sort_order)
    SELECT p_curriculum_id, x.company, x.role, x.start_date, x.end_date,
           COALESCE(x.is_current, false), x.description, COALESCE(x.sort_order, 0)
    FROM jsonb_to_recordset(p_experiences) AS x(
      company text, role text, start_date text, end_date text,
      is_current boolean, description text, sort_order integer
    );
  END IF;

  IF p_education IS NOT NULL THEN
    DELETE FROM public.curriculum_education WHERE curriculum_id = p_curriculum_id;
    INSERT INTO public.curriculum_education
      (curriculum_id, institution, degree, field, start_year, end_year, status, sort_order)
    SELECT p_curriculum_id, x.institution, x.degree, x.field, x.start_year,
           x.end_year, x.status, COALESCE(x.sort_order, 0)
    FROM jsonb_to_recordset(p_education) AS x(
      institution text, degree text, field text, start_year text,
      end_year text, status text, sort_order integer
    );
  END IF;

  IF p_skills IS NOT NULL THEN
    DELETE FROM public.curriculum_skills WHERE curriculum_id = p_curriculum_id;
    INSERT INTO public.curriculum_skills (curriculum_id, name, level, type)
    SELECT p_curriculum_id, x.name, x.level, x.type
    FROM jsonb_to_recordset(p_skills) AS x(name text, level text, type text);
  END IF;

  IF p_courses IS NOT NULL THEN
    DELETE FROM public.curriculum_courses WHERE curriculum_id = p_curriculum_id;
    INSERT INTO public.curriculum_courses
      (curriculum_id, name, institution, year, hours, certificate_type, certificate_url)
    SELECT p_curriculum_id, x.name, x.institution, x.year, x.hours,
           x.certificate_type, x.certificate_url
    FROM jsonb_to_recordset(p_courses) AS x(
      name text, institution text, year integer, hours integer,
      certificate_type text, certificate_url text
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION public.replace_curriculum_children IS
  'Atomically replaces curriculum sub-entities (delete + insert in one transaction). SECURITY INVOKER: RLS applies; raises 42501 when the caller does not own the curriculum.';
