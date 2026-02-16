-- Migration 029: Fix CHECK constraints to match TypeScript types
-- Tables are empty (0 rows), safe to change constraints

-- 1. retest_schedules.frequency
-- OLD: 'monthly', 'quarterly', 'semiannual', 'annual'
-- NEW: '3months', '6months', '9months', '12months'
ALTER TABLE public.retest_schedules
  DROP CONSTRAINT IF EXISTS retest_schedules_frequency_check;

ALTER TABLE public.retest_schedules
  ADD CONSTRAINT retest_schedules_frequency_check
  CHECK (frequency IN ('3months', '6months', '9months', '12months'));

ALTER TABLE public.retest_schedules
  ALTER COLUMN frequency SET DEFAULT '6months';

-- 2. evolution_annotations.type
-- OLD: 'observation', 'improvement', 'concern', 'milestone'
-- NEW: 'training', 'coaching', 'feedback', 'promotion', 'other'
ALTER TABLE public.evolution_annotations
  DROP CONSTRAINT IF EXISTS evolution_annotations_type_check;

ALTER TABLE public.evolution_annotations
  ADD CONSTRAINT evolution_annotations_type_check
  CHECK (type IN ('training', 'coaching', 'feedback', 'promotion', 'other'));

ALTER TABLE public.evolution_annotations
  ALTER COLUMN type SET DEFAULT 'other';
