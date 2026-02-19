-- Migration 032: Bucket brand-assets para logos institucionais
-- Bucket público e somente-leitura; escrita restrita a admins

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Leitura pública (sem autenticação)
CREATE POLICY "Brand assets are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'brand-assets');

-- Upload somente admin
CREATE POLICY "Only admins can upload brand assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-assets'
    AND public.get_user_type(auth.uid()) = 'admin'
  );

-- Update somente admin
CREATE POLICY "Only admins can update brand assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brand-assets'
    AND public.get_user_type(auth.uid()) = 'admin'
  );

-- Delete somente admin
CREATE POLICY "Only admins can delete brand assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-assets'
    AND public.get_user_type(auth.uid()) = 'admin'
  );
