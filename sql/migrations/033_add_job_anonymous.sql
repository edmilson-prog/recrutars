-- =====================================================
-- RecrutaRS Migration 033: Add anonymous company toggle to jobs
-- When true, company name is hidden from candidates
-- =====================================================

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.jobs.is_anonymous IS 'When true, company name is hidden from candidates (shown as "Empresa Confidencial")';
