-- Migration 070: Auto-expire stale invitations via pg_cron

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Partial index for efficient cron query
CREATE INDEX IF NOT EXISTS idx_test_invitations_pending_expiry
  ON public.test_invitations(expires_at)
  WHERE status IN ('sent', 'viewed');

-- Function to expire stale invitations
CREATE OR REPLACE FUNCTION public.expire_stale_invitations()
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE public.test_invitations
  SET status = 'expired'
  WHERE expires_at < NOW()
    AND status IN ('sent', 'viewed');
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: run every hour at minute 0
SELECT cron.schedule('expire-stale-invitations', '0 * * * *',
  $$SELECT public.expire_stale_invitations()$$);
