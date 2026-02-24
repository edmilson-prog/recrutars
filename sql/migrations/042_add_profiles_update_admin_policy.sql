-- =============================================================================
-- Migration: 042_add_profiles_update_admin_policy
-- Description: Allow admins to update any user's profile (role_id, status, etc.)
--              Fixes HTTP 406 on PATCH /profiles when admin assigns roles.
-- Applied via MCP: 2026-02-24
-- =============================================================================

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');
