-- =====================================================
-- RecrutaRS: Helper Functions & Utilities
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 002_expand_handle_new_user.sql has been applied.
-- =====================================================

-- =====================================================
-- FUNCTION: get_company_id
-- Returns the company UUID for a given user profile_id.
-- Used in RLS policies to check company ownership.
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_company_id(p_user_id UUID)
RETURNS UUID
STABLE
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (SELECT id FROM public.companies WHERE profile_id = p_user_id);
END;
$$;

COMMENT ON FUNCTION public.get_company_id(UUID) IS 'Returns company ID for a given user profile_id, used in RLS policies (PRD-064)';

-- =====================================================
-- FUNCTION: get_candidate_id
-- Returns the candidate UUID for a given user profile_id.
-- Used in RLS policies to check candidate ownership.
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_candidate_id(p_user_id UUID)
RETURNS UUID
STABLE
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (SELECT id FROM public.candidates WHERE profile_id = p_user_id);
END;
$$;

COMMENT ON FUNCTION public.get_candidate_id(UUID) IS 'Returns candidate ID for a given user profile_id, used in RLS policies (PRD-064)';
