-- Migration: one_time_period
-- Purpose: Add 'one_time' as a valid subscription period for non-recurring charges
--          PlanPeriod type in TypeScript already includes 'one_time'

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_period_check;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_period_check
  CHECK (period IN ('monthly', 'quarterly', 'semiannual', 'annual', 'one_time'));
