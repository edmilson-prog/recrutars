-- =====================================================
-- RecrutaRS: Company Users & Invites
-- Convites reais de equipe (v1.15.0)
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 029_fix_retest_frequency_and_annotation_type.sql
-- =====================================================

-- =====================================================
-- TABLE: company_users
-- Links multiple auth users to a single company with roles.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_profile_id ON public.company_users(profile_id);

COMMENT ON TABLE public.company_users IS 'Links auth users to companies with roles (admin/member). Supports multi-user company access (v1.15.0)';

-- =====================================================
-- TABLE: company_invites
-- Tracks pending/accepted/cancelled invites.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.company_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(company_id, email)
);

CREATE INDEX IF NOT EXISTS idx_company_invites_company_id ON public.company_invites(company_id);
CREATE INDEX IF NOT EXISTS idx_company_invites_email ON public.company_invites(email);

COMMENT ON TABLE public.company_invites IS 'Pending/accepted/cancelled team member invites (v1.15.0)';

-- =====================================================
-- BACKFILL: Add existing company owners to company_users
-- =====================================================

INSERT INTO public.company_users (company_id, profile_id, role)
SELECT id, profile_id, 'admin' FROM public.companies
ON CONFLICT (company_id, profile_id) DO NOTHING;

-- =====================================================
-- UPDATE: handle_new_user() trigger
-- Detect invited_company_id in metadata to link to
-- existing company instead of creating a new one.
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _type TEXT;
  _name TEXT;
  _phone TEXT;
  _invited_company_id TEXT;
  _invited_role TEXT;
BEGIN
  _type  := COALESCE(NEW.raw_user_meta_data->>'type', 'candidate');
  _name  := COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuario');
  _phone := NEW.raw_user_meta_data->>'phone';

  -- 1. Create profile
  INSERT INTO public.profiles (id, name, email, type, status)
  VALUES (
    NEW.id,
    _name,
    NEW.email,
    _type,
    'active'
  );

  -- 2. Create type-specific record
  IF _type = 'candidate' THEN
    INSERT INTO public.candidates (
      profile_id, name, email, phone, anonymous_id
    )
    VALUES (
      NEW.id,
      _name,
      NEW.email,
      _phone,
      LPAD(FLOOR(1000 + RANDOM() * 9000)::TEXT, 4, '0')
    );
  ELSIF _type = 'company' THEN
    _invited_company_id := NEW.raw_user_meta_data->>'invited_company_id';
    _invited_role := COALESCE(NEW.raw_user_meta_data->>'invited_role', 'member');

    IF _invited_company_id IS NOT NULL THEN
      -- Invited user: link to existing company via company_users
      INSERT INTO public.company_users (company_id, profile_id, role)
      VALUES (_invited_company_id::UUID, NEW.id, _invited_role);

      -- Mark invite as accepted
      UPDATE public.company_invites
      SET status = 'accepted', accepted_at = NOW()
      WHERE company_id = _invited_company_id::UUID AND email = NEW.email AND status = 'pending';
    ELSE
      -- Normal signup: create new company
      INSERT INTO public.companies (profile_id, name, phone)
      VALUES (NEW.id, _name, _phone);

      -- Add owner to company_users as admin
      INSERT INTO public.company_users (company_id, profile_id, role)
      VALUES (
        (SELECT id FROM public.companies WHERE profile_id = NEW.id),
        NEW.id,
        'admin'
      );
    END IF;
  END IF;
  -- Admin type: only profile row, no additional table

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Auto-creates profiles + company/candidate row on auth.users INSERT. '
  'For invited company users, links to existing company via company_users. (v1.15.0)';

-- =====================================================
-- UPDATE: get_company_id() helper
-- Also check company_users for invited members.
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_company_id(p_user_id UUID)
RETURNS UUID
STABLE
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT id FROM public.companies WHERE profile_id = p_user_id),
    (SELECT company_id FROM public.company_users WHERE profile_id = p_user_id LIMIT 1)
  );
END;
$$;

COMMENT ON FUNCTION public.get_company_id(UUID) IS
  'Returns company ID for a given user profile_id. Checks company ownership first, then company_users membership. (v1.15.0)';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_invites ENABLE ROW LEVEL SECURITY;

-- ----- company_users -----

CREATE POLICY "company_users_select_own_company"
  ON public.company_users FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "company_users_select_admin"
  ON public.company_users FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "company_users_insert_own_company"
  ON public.company_users FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "company_users_update_own_company"
  ON public.company_users FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "company_users_delete_own_company"
  ON public.company_users FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));

-- ----- company_invites -----

CREATE POLICY "company_invites_select_own_company"
  ON public.company_invites FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "company_invites_select_admin"
  ON public.company_invites FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "company_invites_insert_own_company"
  ON public.company_invites FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "company_invites_update_own_company"
  ON public.company_invites FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "company_invites_delete_own_company"
  ON public.company_invites FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));

-- ----- companies: NEW policy for members -----

CREATE POLICY "companies_select_member"
  ON public.companies FOR SELECT
  USING (
    id IN (SELECT company_id FROM public.company_users WHERE profile_id = auth.uid())
  );
