-- Migration 060: Admin Credit Management
-- Credito manual, debito e transferencia de creditos pelo admin

-- ============================================================================
-- 1. Expand type CHECK constraint on test_credit_transactions
-- ============================================================================

ALTER TABLE public.test_credit_transactions
  DROP CONSTRAINT test_credit_transactions_type_check;

ALTER TABLE public.test_credit_transactions
  ADD CONSTRAINT test_credit_transactions_type_check
  CHECK (type IN ('purchase', 'consume', 'refund', 'manual_credit', 'manual_debit', 'transfer_out', 'transfer_in'));

-- ============================================================================
-- 2. Make package_id nullable (manual credits have no package)
-- ============================================================================

ALTER TABLE public.test_credits
  ALTER COLUMN package_id DROP NOT NULL;

-- ============================================================================
-- 3. Add origin column to distinguish credit sources
-- ============================================================================

ALTER TABLE public.test_credits
  ADD COLUMN origin TEXT NOT NULL DEFAULT 'purchase'
  CHECK (origin IN ('purchase', 'manual', 'transfer'));

-- ============================================================================
-- 4. RPC: admin_manual_credit
--    Creates a credit row with no package, logs manual_credit transaction
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_manual_credit(
  p_company_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_created_by UUID
) RETURNS UUID AS $$
DECLARE
  v_credit_id UUID;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Quantidade deve ser maior que zero';
  END IF;

  -- Create credit row (no package, no stripe)
  INSERT INTO public.test_credits
    (company_id, package_id, total_credits, used_credits, status, origin)
  VALUES
    (p_company_id, NULL, p_amount, 0, 'active', 'manual')
  RETURNING id INTO v_credit_id;

  -- Log transaction
  INSERT INTO public.test_credit_transactions
    (company_id, credit_id, type, amount, reference_type, description, created_by)
  VALUES
    (p_company_id, v_credit_id, 'manual_credit', p_amount, 'admin_adjustment', p_description, p_created_by);

  RETURN v_credit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. RPC: admin_manual_debit
--    Consumes N credits FIFO, logs manual_debit transactions
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_manual_debit(
  p_company_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_created_by UUID
) RETURNS INTEGER AS $$
DECLARE
  v_remaining INTEGER := p_amount;
  v_credit RECORD;
  v_debit_amount INTEGER;
  v_total_debited INTEGER := 0;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Quantidade deve ser maior que zero';
  END IF;

  -- Check balance first
  IF (SELECT COALESCE(SUM(total_credits - used_credits), 0) FROM public.test_credits
      WHERE company_id = p_company_id AND status = 'active') < p_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente. A empresa possui % credito(s) disponivel(is).',
      (SELECT COALESCE(SUM(total_credits - used_credits), 0) FROM public.test_credits
       WHERE company_id = p_company_id AND status = 'active');
  END IF;

  -- FIFO debit loop
  FOR v_credit IN
    SELECT id, (total_credits - used_credits) AS available
    FROM public.test_credits
    WHERE company_id = p_company_id AND status = 'active' AND (total_credits - used_credits) > 0
    ORDER BY purchased_at ASC
    FOR UPDATE
  LOOP
    EXIT WHEN v_remaining <= 0;

    v_debit_amount := LEAST(v_remaining, v_credit.available);

    UPDATE public.test_credits
    SET used_credits = used_credits + v_debit_amount
    WHERE id = v_credit.id;

    INSERT INTO public.test_credit_transactions
      (company_id, credit_id, type, amount, reference_type, description, created_by)
    VALUES
      (p_company_id, v_credit.id, 'manual_debit', -v_debit_amount, 'admin_adjustment', p_description, p_created_by);

    v_remaining := v_remaining - v_debit_amount;
    v_total_debited := v_total_debited + v_debit_amount;
  END LOOP;

  RETURN v_total_debited;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. RPC: admin_transfer_credits
--    Atomic transfer: debit from source, credit to target
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_transfer_credits(
  p_source_company_id UUID,
  p_target_company_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_created_by UUID
) RETURNS UUID AS $$
DECLARE
  v_transfer_id UUID := gen_random_uuid();
  v_remaining INTEGER := p_amount;
  v_credit RECORD;
  v_debit_amount INTEGER;
  v_new_credit_id UUID;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Quantidade deve ser maior que zero';
  END IF;

  IF p_source_company_id = p_target_company_id THEN
    RAISE EXCEPTION 'Nao e possivel transferir creditos para a mesma empresa';
  END IF;

  -- Check source balance
  IF (SELECT COALESCE(SUM(total_credits - used_credits), 0) FROM public.test_credits
      WHERE company_id = p_source_company_id AND status = 'active') < p_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente na empresa de origem';
  END IF;

  -- FIFO debit from source
  FOR v_credit IN
    SELECT id, (total_credits - used_credits) AS available
    FROM public.test_credits
    WHERE company_id = p_source_company_id AND status = 'active' AND (total_credits - used_credits) > 0
    ORDER BY purchased_at ASC
    FOR UPDATE
  LOOP
    EXIT WHEN v_remaining <= 0;

    v_debit_amount := LEAST(v_remaining, v_credit.available);

    UPDATE public.test_credits
    SET used_credits = used_credits + v_debit_amount
    WHERE id = v_credit.id;

    INSERT INTO public.test_credit_transactions
      (company_id, credit_id, type, amount, reference_type, reference_id, description, created_by)
    VALUES
      (p_source_company_id, v_credit.id, 'transfer_out', -v_debit_amount, 'transfer', v_transfer_id, p_description, p_created_by);

    v_remaining := v_remaining - v_debit_amount;
  END LOOP;

  -- Credit to target
  INSERT INTO public.test_credits
    (company_id, package_id, total_credits, used_credits, status, origin)
  VALUES
    (p_target_company_id, NULL, p_amount, 0, 'active', 'transfer')
  RETURNING id INTO v_new_credit_id;

  INSERT INTO public.test_credit_transactions
    (company_id, credit_id, type, amount, reference_type, reference_id, description, created_by)
  VALUES
    (p_target_company_id, v_new_credit_id, 'transfer_in', p_amount, 'transfer', v_transfer_id, p_description, p_created_by);

  RETURN v_transfer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
