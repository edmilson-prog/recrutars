-- ============================================================================
-- Migration 068: Add delivery_channel to test_invitations
-- Tracks actual delivery channel (email, whatsapp, link) separately from method
-- ============================================================================

ALTER TABLE public.test_invitations
  ADD COLUMN IF NOT EXISTS delivery_channel TEXT;

-- Backfill: infer channel from method for existing records
UPDATE public.test_invitations SET delivery_channel =
  CASE method
    WHEN 'public_link' THEN 'link'
    WHEN 'email' THEN 'email'
    WHEN 'internal' THEN 'email'
  END
WHERE delivery_channel IS NULL;

-- Index for filtering by delivery_channel
CREATE INDEX IF NOT EXISTS idx_test_invitations_delivery_channel
  ON public.test_invitations(delivery_channel);
