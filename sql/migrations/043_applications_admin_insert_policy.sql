-- Admin pode criar candidaturas (necessário para impersonação)
CREATE POLICY "applications_insert_admin"
  ON public.applications FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');
