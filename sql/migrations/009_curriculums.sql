-- =====================================================
-- RecrutaRS: Curriculums & Related Tables
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 008_behavioral_tests.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: curriculums
-- Main curriculum/resume for a candidate.
-- A candidate can have multiple curriculums (one default).
-- =====================================================

CREATE TABLE IF NOT EXISTS public.curriculums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Curriculo Principal',
  title TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  linkedin TEXT,
  about TEXT,
  availability TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  is_default BOOLEAN NOT NULL DEFAULT TRUE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_curriculums_candidate_id ON public.curriculums(candidate_id);

-- =====================================================
-- TABLE: curriculum_experiences
-- Work experience entries for a curriculum.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.curriculum_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_curriculum_experiences_curriculum_id ON public.curriculum_experiences(curriculum_id);

-- =====================================================
-- TABLE: curriculum_education
-- Education entries for a curriculum.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.curriculum_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT,
  start_year TEXT,
  end_year TEXT,
  status TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_curriculum_education_curriculum_id ON public.curriculum_education(curriculum_id);

-- =====================================================
-- TABLE: curriculum_skills
-- Skill entries for a curriculum with level and type.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.curriculum_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT,
  type TEXT
);

CREATE INDEX IF NOT EXISTS idx_curriculum_skills_curriculum_id ON public.curriculum_skills(curriculum_id);

-- =====================================================
-- TABLE: curriculum_courses
-- Courses and certifications for a curriculum.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.curriculum_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES public.curriculums(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  year INTEGER,
  hours INTEGER,
  certificate_url TEXT,
  certificate_type TEXT
);

CREATE INDEX IF NOT EXISTS idx_curriculum_courses_curriculum_id ON public.curriculum_courses(curriculum_id);

-- =====================================================
-- TRIGGERS: Auto-update updated_at for curriculums
-- =====================================================

DROP TRIGGER IF EXISTS update_curriculums_updated_at ON public.curriculums;
CREATE TRIGGER update_curriculums_updated_at
  BEFORE UPDATE ON public.curriculums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_courses ENABLE ROW LEVEL SECURITY;

-- ----- curriculums -----

-- Candidate: full CRUD on own curriculums
CREATE POLICY "curriculums_select_candidate_own"
  ON public.curriculums FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

CREATE POLICY "curriculums_insert_candidate_own"
  ON public.curriculums FOR INSERT
  WITH CHECK (candidate_id = public.get_candidate_id(auth.uid()));

CREATE POLICY "curriculums_update_candidate_own"
  ON public.curriculums FOR UPDATE
  USING (candidate_id = public.get_candidate_id(auth.uid()));

CREATE POLICY "curriculums_delete_candidate_own"
  ON public.curriculums FOR DELETE
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can read curriculums (talent pool)
CREATE POLICY "curriculums_select_company"
  ON public.curriculums FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'company');

-- Admin: can read all curriculums
CREATE POLICY "curriculums_select_admin"
  ON public.curriculums FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- ----- curriculum_experiences -----

CREATE POLICY "curriculum_experiences_select_candidate"
  ON public.curriculum_experiences FOR SELECT
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_experiences_insert_candidate"
  ON public.curriculum_experiences FOR INSERT
  WITH CHECK (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_experiences_update_candidate"
  ON public.curriculum_experiences FOR UPDATE
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_experiences_delete_candidate"
  ON public.curriculum_experiences FOR DELETE
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_experiences_select_company"
  ON public.curriculum_experiences FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'company');

CREATE POLICY "curriculum_experiences_select_admin"
  ON public.curriculum_experiences FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- ----- curriculum_education -----

CREATE POLICY "curriculum_education_select_candidate"
  ON public.curriculum_education FOR SELECT
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_education_insert_candidate"
  ON public.curriculum_education FOR INSERT
  WITH CHECK (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_education_update_candidate"
  ON public.curriculum_education FOR UPDATE
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_education_delete_candidate"
  ON public.curriculum_education FOR DELETE
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_education_select_company"
  ON public.curriculum_education FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'company');

CREATE POLICY "curriculum_education_select_admin"
  ON public.curriculum_education FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- ----- curriculum_skills -----

CREATE POLICY "curriculum_skills_select_candidate"
  ON public.curriculum_skills FOR SELECT
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_skills_insert_candidate"
  ON public.curriculum_skills FOR INSERT
  WITH CHECK (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_skills_update_candidate"
  ON public.curriculum_skills FOR UPDATE
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_skills_delete_candidate"
  ON public.curriculum_skills FOR DELETE
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_skills_select_company"
  ON public.curriculum_skills FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'company');

CREATE POLICY "curriculum_skills_select_admin"
  ON public.curriculum_skills FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- ----- curriculum_courses -----

CREATE POLICY "curriculum_courses_select_candidate"
  ON public.curriculum_courses FOR SELECT
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_courses_insert_candidate"
  ON public.curriculum_courses FOR INSERT
  WITH CHECK (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_courses_update_candidate"
  ON public.curriculum_courses FOR UPDATE
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_courses_delete_candidate"
  ON public.curriculum_courses FOR DELETE
  USING (curriculum_id IN (SELECT id FROM public.curriculums WHERE candidate_id = public.get_candidate_id(auth.uid())));

CREATE POLICY "curriculum_courses_select_company"
  ON public.curriculum_courses FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'company');

CREATE POLICY "curriculum_courses_select_admin"
  ON public.curriculum_courses FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

COMMENT ON TABLE public.curriculums IS 'Candidate resumes with multiple curriculum support (PRD-064)';
COMMENT ON TABLE public.curriculum_experiences IS 'Work experience entries linked to a curriculum (PRD-064)';
COMMENT ON TABLE public.curriculum_education IS 'Education entries linked to a curriculum (PRD-064)';
COMMENT ON TABLE public.curriculum_skills IS 'Skills with level and type linked to a curriculum (PRD-064)';
COMMENT ON TABLE public.curriculum_courses IS 'Courses and certifications linked to a curriculum (PRD-064)';
