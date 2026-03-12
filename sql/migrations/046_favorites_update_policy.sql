-- Migration: favorites_rls_complete
-- Purpose: Add missing UPDATE policy and admin policies for favorites table
--          UPDATE policy required because favoritesService uses .upsert() with onConflict
--          Admin policies required for PRD-061 impersonation (auth.uid() != user_id)

-- User: can update own favorites (needed for upsert on conflict)
CREATE POLICY "favorites_update_own"
  ON public.favorites FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin: full CRUD on all favorites (needed for impersonation)
CREATE POLICY "favorites_select_admin" ON public.favorites FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "favorites_insert_admin" ON public.favorites FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "favorites_update_admin" ON public.favorites FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "favorites_delete_admin" ON public.favorites FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');
