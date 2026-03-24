-- Migration 045: Add billing_model column to plans
-- Supports 'recurring' (default, subscription-based) and 'one_time' (single payment)

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS billing_model TEXT NOT NULL DEFAULT 'recurring'
  CHECK (billing_model IN ('recurring', 'one_time'));
