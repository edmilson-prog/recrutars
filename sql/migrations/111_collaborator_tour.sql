-- Migration 111: collaborator guided tour completion flag (Fase 4)
-- NULL = tour not yet seen (eligible for auto-start). New collaborators default NULL.
ALTER TABLE public.company_users
  ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz;

-- Backfill: existing collaborators are not first-timers — mark as already seen.
UPDATE public.company_users
  SET tour_completed_at = now()
  WHERE tour_completed_at IS NULL;
