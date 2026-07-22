-- Migration 122: financial_attachments
-- Multiplos anexos (NF/comprovante/recibo) por lancamento. Bucket privado.
-- ON DELETE CASCADE: apagar o lancamento remove os registros de anexo.

CREATE TABLE public.financial_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.financial_entries(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  kind TEXT CHECK (kind IN ('invoice', 'receipt', 'other')),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_attachments ENABLE ROW LEVEL SECURITY;

-- RLS: admin-only
CREATE POLICY "financial_attachments_select_admin"
  ON public.financial_attachments FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_attachments_insert_admin"
  ON public.financial_attachments FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_attachments_update_admin"
  ON public.financial_attachments FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_attachments_delete_admin"
  ON public.financial_attachments FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Index por lancamento (carregar anexos no Sheet de detalhe)
CREATE INDEX idx_financial_attachments_entry ON public.financial_attachments(entry_id);
