-- Migration 034: Fix stuck pending jobs
--
-- Bug: jobs were created with moderation_status='pending' (DB default)
-- because createJob() never set moderation_status explicitly.
-- RLS policy requires moderation_status='approved' for candidates to see jobs.
-- This migration approves all active jobs currently stuck as pending.

UPDATE public.jobs
SET
  moderation_status = 'approved',
  moderated_at = NOW()
WHERE
  moderation_status = 'pending'
  AND status = 'active';
