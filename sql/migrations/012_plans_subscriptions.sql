-- =====================================================
-- RecrutaRS: Plans & Subscriptions
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 011_notifications_tickets_favorites.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: plans
-- Subscription plans available on the platform.
-- Supports both candidate and company plan types.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('candidate', 'company')),
  description TEXT,
  description_short TEXT,
  features TEXT[] DEFAULT '{}',
  prices JSONB NOT NULL DEFAULT '{}'::JSONB,
  launch_prices JSONB,
  launch_price_end_date TIMESTAMPTZ,
  badge TEXT,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_type ON public.plans(type);
CREATE INDEX IF NOT EXISTS idx_plans_slug ON public.plans(slug);
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON public.plans(is_active);

-- =====================================================
-- TABLE: plan_capabilities
-- Defines what capabilities/limits a plan can control.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.plan_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  value_type TEXT NOT NULL DEFAULT 'boolean'
    CHECK (value_type IN ('boolean', 'number', 'text')),
  possible_values TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_plan_capabilities_key ON public.plan_capabilities(key);
CREATE INDEX IF NOT EXISTS idx_plan_capabilities_category ON public.plan_capabilities(category);

-- =====================================================
-- TABLE: plan_capability_assignments
-- Maps specific capability values to plans.
-- Composite primary key: plan_id + capability_key.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.plan_capability_assignments (
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  capability_key TEXT NOT NULL REFERENCES public.plan_capabilities(key) ON DELETE CASCADE,
  value TEXT NOT NULL,
  PRIMARY KEY (plan_id, capability_key)
);

-- =====================================================
-- TABLE: subscriptions
-- Active subscriptions linking users to plans.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trial')),
  period TEXT NOT NULL DEFAULT 'monthly'
    CHECK (period IN ('monthly', 'quarterly', 'semiannual', 'annual')),
  price_paid NUMERIC NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,
  is_early_adopter BOOLEAN NOT NULL DEFAULT FALSE,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- =====================================================
-- TABLE: subscription_history
-- Audit trail for subscription changes (upgrades, downgrades, cancellations).
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  from_plan_id UUID REFERENCES public.plans(id),
  to_plan_id UUID REFERENCES public.plans(id),
  performed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON public.subscription_history(subscription_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_capability_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- ----- plans (public read, admin manage) -----

CREATE POLICY "plans_select_public"
  ON public.plans FOR SELECT
  USING (TRUE);

CREATE POLICY "plans_insert_admin"
  ON public.plans FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "plans_update_admin"
  ON public.plans FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "plans_delete_admin"
  ON public.plans FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- ----- plan_capabilities (public read, admin manage) -----

CREATE POLICY "plan_capabilities_select_public"
  ON public.plan_capabilities FOR SELECT
  USING (TRUE);

CREATE POLICY "plan_capabilities_insert_admin"
  ON public.plan_capabilities FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "plan_capabilities_update_admin"
  ON public.plan_capabilities FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "plan_capabilities_delete_admin"
  ON public.plan_capabilities FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- ----- plan_capability_assignments (public read, admin manage) -----

CREATE POLICY "plan_capability_assignments_select_public"
  ON public.plan_capability_assignments FOR SELECT
  USING (TRUE);

CREATE POLICY "plan_capability_assignments_insert_admin"
  ON public.plan_capability_assignments FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "plan_capability_assignments_update_admin"
  ON public.plan_capability_assignments FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "plan_capability_assignments_delete_admin"
  ON public.plan_capability_assignments FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- ----- subscriptions (user own, admin all) -----

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "subscriptions_select_admin"
  ON public.subscriptions FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "subscriptions_insert_own"
  ON public.subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "subscriptions_insert_admin"
  ON public.subscriptions FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "subscriptions_update_own"
  ON public.subscriptions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "subscriptions_update_admin"
  ON public.subscriptions FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- ----- subscription_history (user own, admin all) -----

CREATE POLICY "subscription_history_select_own"
  ON public.subscription_history FOR SELECT
  USING (
    subscription_id IN (SELECT id FROM public.subscriptions WHERE user_id = auth.uid())
  );

CREATE POLICY "subscription_history_select_admin"
  ON public.subscription_history FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "subscription_history_insert_admin"
  ON public.subscription_history FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

COMMENT ON TABLE public.plans IS 'Subscription plans for candidates and companies (PRD-064)';
COMMENT ON TABLE public.plan_capabilities IS 'Capability definitions that plans can control (PRD-064)';
COMMENT ON TABLE public.plan_capability_assignments IS 'Mapping of capability values to specific plans (PRD-064)';
COMMENT ON TABLE public.subscriptions IS 'Active user subscriptions to plans (PRD-064)';
COMMENT ON TABLE public.subscription_history IS 'Audit trail for subscription changes (PRD-064)';
