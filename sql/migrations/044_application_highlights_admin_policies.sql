-- Admin pode inserir highlights (necessário para impersonação)
CREATE POLICY "application_highlights_insert_admin"
  ON public.application_highlights FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- Admin pode deletar highlights (necessário para impersonação - setHighlights faz delete+insert)
CREATE POLICY "application_highlights_delete_admin"
  ON public.application_highlights FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');
