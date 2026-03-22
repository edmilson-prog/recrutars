-- Migration 069: Add configurable expiration days to company_tests
-- Default: 30 days, range: 1-90 days

ALTER TABLE public.company_tests
  ADD COLUMN IF NOT EXISTS default_expiration_days INTEGER NOT NULL DEFAULT 30;

ALTER TABLE public.company_tests
  ADD CONSTRAINT chk_company_tests_expiration_days
  CHECK (default_expiration_days BETWEEN 1 AND 90);
