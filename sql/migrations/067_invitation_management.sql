-- ============================================================================
-- Migration 067: Invitation Management
-- Adds 'cancelled' status to test_invitations and index for company-wide queries.
-- ============================================================================

-- Add 'cancelled' status to test_invitations CHECK constraint
ALTER TABLE public.test_invitations DROP CONSTRAINT IF EXISTS test_invitations_status_check;
ALTER TABLE public.test_invitations ADD CONSTRAINT test_invitations_status_check
  CHECK (status = ANY (ARRAY['sent'::text, 'viewed'::text, 'started'::text, 'completed'::text, 'expired'::text, 'cancelled'::text, 'abandoned'::text]));

-- Index for company-wide invitation queries (sorted by sent_at DESC)
CREATE INDEX IF NOT EXISTS idx_test_invitations_sent_at_desc
  ON public.test_invitations(sent_at DESC);
