-- ============================================================================
-- Migration 106: certificate_file_name on curriculum_courses
-- ----------------------------------------------------------------------------
-- The Course domain type and the CourseDialog already capture the original
-- certificate file name, but the column never existed — the name was silently
-- dropped on save. Adds the column and recreates replace_curriculum_children
-- so the courses payload persists it.
-- ============================================================================

ALTER TABLE public.curriculum_courses
  ADD COLUMN IF NOT EXISTS certificate_file_name TEXT;

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
      (curriculum_id, name, institution, year, hours, certificate_type, certificate_url, certificate_file_name)
    SELECT p_curriculum_id, x.name, x.institution, x.year, x.hours,
           x.certificate_type, x.certificate_url, x.certificate_file_name
    FROM jsonb_to_recordset(p_courses) AS x(
      name text, institution text, year integer, hours integer,
      certificate_type text, certificate_url text, certificate_file_name text
    );
  END IF;
END;
$$;
