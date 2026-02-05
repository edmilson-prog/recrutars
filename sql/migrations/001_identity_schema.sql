-- =====================================================
-- RecrutaRS: Identity Schema Migration
-- PRD-063: Fundacao Supabase + Autenticacao
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- TABLE: profiles
-- Extends auth.users with application-specific fields.
-- 1:1 relationship using the same UUID as auth.users.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('admin', 'company', 'candidate')),
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  role_id TEXT,
  last_access_at TIMESTAMPTZ,
  group_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_type ON public.profiles(type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with app-specific fields (PRD-063)';

-- =====================================================
-- TABLE: candidates
-- Candidate-specific profile data.
-- 1:1 with profiles where type = candidate.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  title TEXT DEFAULT '',
  location TEXT DEFAULT '',
  experience_years INTEGER DEFAULT 0,
  education TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT 'BRL',
  availability TEXT DEFAULT '',
  profile_completion INTEGER DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  has_test BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  phone TEXT,
  linkedin TEXT,
  about TEXT,
  plan TEXT DEFAULT 'Essencial',
  date_of_birth DATE,
  visibility_mode TEXT DEFAULT 'public' CHECK (visibility_mode IN ('public', 'partial', 'private')),
  anonymous_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_profile_id ON public.candidates(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON public.candidates USING GIN(skills);

COMMENT ON TABLE public.candidates IS 'Candidate-specific data, 1:1 with profiles where type=candidate (PRD-063)';

-- =====================================================
-- TABLE: companies
-- Company-specific profile data.
-- 1:1 with profiles where type = company.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnpj TEXT,
  logo_url TEXT,
  industry TEXT DEFAULT '',
  size TEXT DEFAULT '',
  location TEXT DEFAULT '',
  description TEXT DEFAULT '',
  website TEXT,
  linkedin TEXT,
  phone TEXT,
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  address TEXT,
  active_jobs INTEGER DEFAULT 0,
  total_candidates INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  plan TEXT DEFAULT 'Essencial Empresas',
  payment_status TEXT DEFAULT 'ok' CHECK (payment_status IN ('ok', 'pending', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_profile_id ON public.companies(profile_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_plan ON public.companies(plan);

COMMENT ON TABLE public.companies IS 'Company-specific data, 1:1 with profiles where type=company (PRD-063)';

-- =====================================================
-- FUNCTION + TRIGGER: Auto-create profile on signup
-- Runs as SECURITY DEFINER to access auth schema.
-- Reads name and type from raw_user_meta_data.
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, type, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'type', 'candidate'),
    'active'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates profiles row when auth.users row is inserted (PRD-063)';

-- =====================================================
-- FUNCTION: get_user_type helper for RLS policies
-- STABLE + SECURITY DEFINER to bypass RLS and cache.
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_type(user_id UUID)
RETURNS TEXT
STABLE
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (SELECT type FROM public.profiles WHERE id = user_id);
END;
$$;

COMMENT ON FUNCTION public.get_user_type(UUID) IS 'Returns user type for RLS policy evaluation (PRD-063)';

-- =====================================================
-- FUNCTION + TRIGGERS: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON public.candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: profiles
-- =====================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- RLS POLICIES: candidates
-- =====================================================

-- Candidates can read their own record
CREATE POLICY "candidates_select_own"
  ON public.candidates FOR SELECT
  USING (profile_id = auth.uid());

-- Admins can read all candidates
CREATE POLICY "candidates_select_admin"
  ON public.candidates FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Companies can read all candidates (talent pool)
CREATE POLICY "candidates_select_company"
  ON public.candidates FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'company');

-- Candidates can update their own record
CREATE POLICY "candidates_update_own"
  ON public.candidates FOR UPDATE
  USING (profile_id = auth.uid());

-- Candidates can insert their own record (during registration)
CREATE POLICY "candidates_insert_own"
  ON public.candidates FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- =====================================================
-- RLS POLICIES: companies
-- =====================================================

-- Companies can read their own record
CREATE POLICY "companies_select_own"
  ON public.companies FOR SELECT
  USING (profile_id = auth.uid());

-- Admins can read all companies
CREATE POLICY "companies_select_admin"
  ON public.companies FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Candidates can read all companies (public info)
CREATE POLICY "companies_select_candidate"
  ON public.companies FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'candidate');

-- Companies can update their own record
CREATE POLICY "companies_update_own"
  ON public.companies FOR UPDATE
  USING (profile_id = auth.uid());

-- Companies can insert their own record (during registration)
CREATE POLICY "companies_insert_own"
  ON public.companies FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- =====================================================
-- Done. Execute sql/seeds/001_dev_users.sql next.
-- =====================================================
