-- ============================================================================
-- Migration 107: allow certificate images on candidate-documents bucket
-- ----------------------------------------------------------------------------
-- Course certificates (PDF/PNG/JPG) now upload to Supabase Storage instead of
-- being stored as base64 in curriculum_courses.certificate_url. The bucket
-- only allowed pdf + video mime types, so add the image ones.
-- ============================================================================

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'image/png',
  'image/jpeg',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]
WHERE id = 'candidate-documents';
