-- =====================================================
-- RecrutaRS: Company Cultural Profiles
-- Migration 037: Cultural Fit (PRD-042) — localStorage to Supabase
-- =====================================================

-- =====================================================
-- TABLE: company_cultural_profiles
-- 1:1 relationship with companies for cultural dimension scores
-- =====================================================

CREATE TABLE IF NOT EXISTS public.company_cultural_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  innovation SMALLINT NOT NULL DEFAULT 3 CHECK (innovation BETWEEN 1 AND 5),
  collaboration SMALLINT NOT NULL DEFAULT 3 CHECK (collaboration BETWEEN 1 AND 5),
  hierarchy SMALLINT NOT NULL DEFAULT 3 CHECK (hierarchy BETWEEN 1 AND 5),
  pace SMALLINT NOT NULL DEFAULT 3 CHECK (pace BETWEEN 1 AND 5),
  direction SMALLINT NOT NULL DEFAULT 3 CHECK (direction BETWEEN 1 AND 5),
  description TEXT,
  "values" TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id)
);

COMMENT ON TABLE public.company_cultural_profiles IS
  'Company cultural dimension profiles for cultural fit matching (PRD-042). 1:1 with companies.';

-- Index
CREATE INDEX IF NOT EXISTS idx_company_cultural_profiles_company_id
  ON public.company_cultural_profiles(company_id);

-- Trigger: auto-update updated_at
CREATE TRIGGER update_company_cultural_profiles_updated_at
  BEFORE UPDATE ON public.company_cultural_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.company_cultural_profiles ENABLE ROW LEVEL SECURITY;

-- Company members can read their own company's cultural profile
CREATE POLICY "cultural_profiles_select_company"
  ON public.company_cultural_profiles FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

-- Candidates can read any company's cultural profile (for fit matching)
CREATE POLICY "cultural_profiles_select_candidate"
  ON public.company_cultural_profiles FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'candidate');

-- Admin can read all
CREATE POLICY "cultural_profiles_select_admin"
  ON public.company_cultural_profiles FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Company can insert their own cultural profile
CREATE POLICY "cultural_profiles_insert_company"
  ON public.company_cultural_profiles FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

-- Company can update their own cultural profile
CREATE POLICY "cultural_profiles_update_company"
  ON public.company_cultural_profiles FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

-- Company can delete their own cultural profile
CREATE POLICY "cultural_profiles_delete_company"
  ON public.company_cultural_profiles FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));
