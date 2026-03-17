-- Migration 057: Test Packages System
-- Sistema de pacotes de testes avulsos para empresas
-- Pagamento unico sem recorrencia, creditos por compra

-- ============================================================================
-- Table: test_packages (catalogo de produtos)
-- ============================================================================

CREATE TABLE public.test_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_short TEXT,
  type TEXT NOT NULL DEFAULT 'gauge_pro' CHECK (type IN ('gauge_pro')),
  credits INTEGER NOT NULL CHECK (credits > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2),
  features TEXT[] DEFAULT '{}',
  badge TEXT,
  stripe_product_id_test TEXT,
  stripe_product_id_live TEXT,
  stripe_price_id_test TEXT,
  stripe_price_id_live TEXT,
  stripe_synced_at_test TIMESTAMPTZ,
  stripe_synced_at_live TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.test_packages ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can view active packages
CREATE POLICY "test_packages_select_all"
  ON public.test_packages FOR SELECT
  USING (true);

-- RLS: Only admins can manage packages
CREATE POLICY "test_packages_insert_admin"
  ON public.test_packages FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "test_packages_update_admin"
  ON public.test_packages FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "test_packages_delete_admin"
  ON public.test_packages FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Trigger: auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.test_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- Table: test_credits (saldo por compra)
-- ============================================================================

CREATE TABLE public.test_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.test_packages(id),
  total_credits INTEGER NOT NULL CHECK (total_credits > 0),
  used_credits INTEGER NOT NULL DEFAULT 0 CHECK (used_credits >= 0),
  remaining_credits INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exhausted', 'refunded')),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.test_credits ENABLE ROW LEVEL SECURITY;

-- RLS: Company sees own credits, admin sees all
CREATE POLICY "test_credits_select_own"
  ON public.test_credits FOR SELECT
  USING (
    company_id = public.get_company_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "test_credits_insert_admin"
  ON public.test_credits FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "test_credits_update_admin"
  ON public.test_credits FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Indexes
CREATE INDEX idx_test_credits_company ON public.test_credits(company_id);
CREATE INDEX idx_test_credits_status ON public.test_credits(company_id, status);

-- Trigger: auto-exhaust when used_credits >= total_credits
CREATE OR REPLACE FUNCTION public.auto_exhaust_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.used_credits >= NEW.total_credits THEN
    NEW.status := 'exhausted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_exhaust_credits
  BEFORE UPDATE ON public.test_credits
  FOR EACH ROW EXECUTE FUNCTION public.auto_exhaust_credits();

-- ============================================================================
-- Table: test_credit_transactions (auditoria)
-- ============================================================================

CREATE TABLE public.test_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  credit_id UUID NOT NULL REFERENCES public.test_credits(id),
  type TEXT NOT NULL CHECK (type IN ('purchase', 'consume', 'refund')),
  amount INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.test_credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS: Company sees own transactions, admin sees all
CREATE POLICY "test_credit_transactions_select_own"
  ON public.test_credit_transactions FOR SELECT
  USING (
    company_id = public.get_company_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

-- Insert via service role (RPCs use SECURITY DEFINER)
CREATE POLICY "test_credit_transactions_insert_service"
  ON public.test_credit_transactions FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_test_credit_transactions_company ON public.test_credit_transactions(company_id);
CREATE INDEX idx_test_credit_transactions_credit ON public.test_credit_transactions(credit_id);
CREATE INDEX idx_test_credit_transactions_ref ON public.test_credit_transactions(reference_type, reference_id);

-- ============================================================================
-- RPCs
-- ============================================================================

-- Get company credit balance (total remaining across all active purchases)
CREATE OR REPLACE FUNCTION public.get_company_credit_balance(p_company_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(total_credits - used_credits), 0)::INTEGER
  FROM public.test_credits
  WHERE company_id = p_company_id AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Consume 1 credit (FIFO: oldest active purchase first)
-- Returns the credit_id used, or NULL if insufficient credits
CREATE OR REPLACE FUNCTION public.consume_test_credit(
  p_company_id UUID,
  p_invitation_id UUID,
  p_description TEXT,
  p_created_by UUID
) RETURNS UUID AS $$
DECLARE
  v_credit_id UUID;
BEGIN
  -- Lock and select oldest active credit with remaining balance
  SELECT id INTO v_credit_id
  FROM public.test_credits
  WHERE company_id = p_company_id
    AND status = 'active'
    AND (total_credits - used_credits) > 0
  ORDER BY purchased_at ASC
  LIMIT 1
  FOR UPDATE;

  IF v_credit_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Debit 1 credit
  UPDATE public.test_credits
  SET used_credits = used_credits + 1
  WHERE id = v_credit_id;

  -- Log transaction
  INSERT INTO public.test_credit_transactions
    (company_id, credit_id, type, amount, reference_type, reference_id, description, created_by)
  VALUES
    (p_company_id, v_credit_id, 'consume', -1, 'test_invitation', p_invitation_id, p_description, p_created_by);

  RETURN v_credit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refund 1 credit (when invitation expires or is cancelled)
CREATE OR REPLACE FUNCTION public.refund_test_credit(
  p_company_id UUID,
  p_invitation_id UUID,
  p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_credit_id UUID;
BEGIN
  -- Find the original consume transaction for this invitation
  SELECT credit_id INTO v_credit_id
  FROM public.test_credit_transactions
  WHERE company_id = p_company_id
    AND reference_type = 'test_invitation'
    AND reference_id = p_invitation_id
    AND type = 'consume'
  LIMIT 1;

  IF v_credit_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if already refunded
  IF EXISTS (
    SELECT 1 FROM public.test_credit_transactions
    WHERE reference_type = 'test_invitation'
      AND reference_id = p_invitation_id
      AND type = 'refund'
  ) THEN
    RETURN FALSE;
  END IF;

  -- Restore credit
  UPDATE public.test_credits
  SET used_credits = used_credits - 1,
      status = 'active'
  WHERE id = v_credit_id;

  -- Log refund transaction
  INSERT INTO public.test_credit_transactions
    (company_id, credit_id, type, amount, reference_type, reference_id, description)
  VALUES
    (p_company_id, v_credit_id, 'refund', 1, 'test_invitation', p_invitation_id, p_description);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Trigger: auto-refund expired/cancelled invitations
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_refund_expired_invitation()
RETURNS TRIGGER AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF NEW.status IN ('expired', 'cancelled') AND OLD.status NOT IN ('expired', 'cancelled') THEN
    -- Get company_id from the test
    SELECT company_id INTO v_company_id
    FROM public.company_tests
    WHERE id = NEW.test_id;

    IF v_company_id IS NOT NULL THEN
      PERFORM public.refund_test_credit(
        v_company_id,
        NEW.id,
        'Convite ' || NEW.status || ' - ' || COALESCE(NEW.candidate_email, 'desconhecido')
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_refund_expired_invitation
  AFTER UPDATE ON public.test_invitations
  FOR EACH ROW
  WHEN (NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.auto_refund_expired_invitation();

-- ============================================================================
-- Seed: default packages
-- ============================================================================

INSERT INTO public.test_packages (name, slug, description, description_short, type, credits, price, original_price, features, badge, sort_order) VALUES
  ('1 Teste Gauge-Pro', '1-gauge-pro', 'Ideal para avaliacao pontual de um candidato ou colaborador.', 'Avaliacao individual', 'gauge_pro', 1, 49.90, NULL,
   ARRAY['1 teste comportamental completo', 'Relatorio individual detalhado', 'Sem validade'], NULL, 1),
  ('Pacote 10 Testes', 'pacote-10', 'Para processos seletivos de medio porte. Economize 20% por teste.', 'Processos seletivos', 'gauge_pro', 10, 399.00, 499.00,
   ARRAY['10 testes comportamentais completos', 'Relatorios individuais detalhados', 'Comparativo entre candidatos', 'Sem validade'], 'Mais Popular', 2),
  ('Pacote 50 Testes', 'pacote-50', 'Para grandes operacoes de RH. Economize 40% por teste.', 'Grandes operacoes', 'gauge_pro', 50, 1499.00, 2495.00,
   ARRAY['50 testes comportamentais completos', 'Relatorios individuais detalhados', 'Comparativo entre candidatos', 'Suporte prioritario', 'Sem validade'], 'Melhor Custo', 3);
