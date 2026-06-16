-- ============================================================================
-- Migration 105: audit timestamps on curriculum child tables
-- ----------------------------------------------------------------------------
-- The curriculum_* child tables had no created_at/updated_at, which made it
-- impossible to audit when rows were created or lost (see the MICHELI BOTENE
-- "missing courses" investigation). Existing rows get created_at = migration
-- time, which is the best available approximation.
-- ============================================================================

ALTER TABLE public.curriculum_experiences
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.curriculum_education
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.curriculum_skills
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.curriculum_courses
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS curriculum_experiences_updated_at ON public.curriculum_experiences;
CREATE TRIGGER curriculum_experiences_updated_at
  BEFORE UPDATE ON public.curriculum_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS curriculum_education_updated_at ON public.curriculum_education;
CREATE TRIGGER curriculum_education_updated_at
  BEFORE UPDATE ON public.curriculum_education
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS curriculum_skills_updated_at ON public.curriculum_skills;
CREATE TRIGGER curriculum_skills_updated_at
  BEFORE UPDATE ON public.curriculum_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS curriculum_courses_updated_at ON public.curriculum_courses;
CREATE TRIGGER curriculum_courses_updated_at
  BEFORE UPDATE ON public.curriculum_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
