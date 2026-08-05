-- Migration 125: bucket privado financial-documents
-- NF/comprovantes contem dados sensiveis -> bucket PRIVADO (public=false).
-- Visualizacao via createSignedUrl (URL temporaria), nunca getPublicUrl.
-- Path: financial/{entry_id}/{timestamp}-{safeName}.{ext}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'financial-documents',
  'financial-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
) ON CONFLICT (id) DO NOTHING;

-- Leitura somente admin (signed URL e gerada server-side respeitando esta policy)
CREATE POLICY "financial_documents_select_admin"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'financial-documents'
    AND public.get_user_type(auth.uid()) = 'admin'
  );

-- Upload somente admin
CREATE POLICY "financial_documents_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'financial-documents'
    AND public.get_user_type(auth.uid()) = 'admin'
  );

-- Update somente admin
CREATE POLICY "financial_documents_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'financial-documents'
    AND public.get_user_type(auth.uid()) = 'admin'
  );

-- Delete somente admin
CREATE POLICY "financial_documents_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'financial-documents'
    AND public.get_user_type(auth.uid()) = 'admin'
  );
