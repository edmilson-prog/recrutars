-- ============================================================================
-- Migration 025: Stripe Integration
-- PRD-075: Integracao Stripe
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Plans table — Stripe fields
-- ---------------------------------------------------------------------------

ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS stripe_product_id_test TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS stripe_product_id_live TEXT;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS stripe_price_ids_test JSONB DEFAULT '{}';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS stripe_price_ids_live JSONB DEFAULT '{}';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS stripe_synced_at_test TIMESTAMPTZ;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS stripe_synced_at_live TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- 2. Subscriptions table — Stripe fields
-- ---------------------------------------------------------------------------

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS scheduled_plan_change JSONB;

-- Note: cancellation_reason may already exist from PRD-074
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'subscriptions' AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN cancellation_reason TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_cust ON public.subscriptions(stripe_customer_id);

-- ---------------------------------------------------------------------------
-- 3. Companies table — Stripe customer IDs per environment
-- ---------------------------------------------------------------------------

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS stripe_customer_id_test TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS stripe_customer_id_live TEXT;

-- ---------------------------------------------------------------------------
-- 4. Candidates table — Stripe customer IDs per environment
-- ---------------------------------------------------------------------------

ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS stripe_customer_id_test TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS stripe_customer_id_live TEXT;

-- ---------------------------------------------------------------------------
-- 5. Stripe Webhook Events table (new)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('test', 'live')),
  payload JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'skipped')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON public.stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.stripe_webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON public.stripe_webhook_events(created_at DESC);

-- RLS: Only admins can access webhook events
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to avoid conflict
DROP POLICY IF EXISTS "Admin full access on webhook events" ON public.stripe_webhook_events;

CREATE POLICY "Admin full access on webhook events" ON public.stripe_webhook_events
  FOR ALL USING (
    public.get_user_type(auth.uid()) = 'admin'
  );

-- Service role needs full access for Edge Functions (they use service_role key)
DROP POLICY IF EXISTS "Service role full access on webhook events" ON public.stripe_webhook_events;

CREATE POLICY "Service role full access on webhook events" ON public.stripe_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- 6. Update subscriptions status CHECK to include 'past_due'
-- ---------------------------------------------------------------------------

-- The status CHECK constraint may need updating to include 'past_due'
-- First check if the constraint exists and drop/recreate if needed
DO $$
BEGIN
  -- Try to add past_due to the existing constraint
  -- If subscriptions_status_check exists, we need to update it
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'subscriptions_status_check'
  ) THEN
    ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_status_check;
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
      CHECK (status IN ('active', 'cancelled', 'expired', 'suspended', 'pending', 'trial', 'past_due'));
  END IF;
END $$;
