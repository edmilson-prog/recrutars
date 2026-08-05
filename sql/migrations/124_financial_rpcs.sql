-- Migration 124: financial RPCs
-- create_financial_entry_with_installments: cria N parcelas atomicamente.
-- mark_financial_entry_paid: baixa de um lancamento.
-- generate_due_recurrences: materializa ocorrencias pendentes (idempotente).

-- ============================================================================
-- create_financial_entry_with_installments(p_base jsonb, p_items jsonb)
--   p_base: campos comuns (type, status, category_id, description,
--           counterparty_name, counterparty_company_id, currency,
--           payment_method, competence_date, notes, created_by)
--   p_items: [{ number, dueDate, amount }] (1..N)
-- SECURITY INVOKER: RLS de financial_entries (admin-only) ainda se aplica.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_financial_entry_with_installments(
  p_base jsonb,
  p_items jsonb
)
RETURNS SETOF public.financial_entries
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID := gen_random_uuid();
  v_total INTEGER := jsonb_array_length(p_items);
BEGIN
  IF v_total < 1 THEN
    RAISE EXCEPTION 'Pelo menos uma parcela e obrigatoria';
  END IF;

  RETURN QUERY
  INSERT INTO public.financial_entries (
    type, status, category_id, description, counterparty_name,
    counterparty_company_id, amount, currency, payment_method,
    competence_date, due_date, notes,
    installment_group_id, installment_number, installment_total, created_by
  )
  SELECT
    (p_base->>'type')::text,
    COALESCE(p_base->>'status', 'pending')::text,
    NULLIF(p_base->>'category_id', '')::uuid,
    (p_base->>'description')::text,
    NULLIF(p_base->>'counterparty_name', '')::text,
    NULLIF(p_base->>'counterparty_company_id', '')::uuid,
    (item->>'amount')::numeric,
    COALESCE(p_base->>'currency', 'BRL')::text,
    NULLIF(p_base->>'payment_method', '')::text,
    (p_base->>'competence_date')::date,
    (item->>'dueDate')::date,
    NULLIF(p_base->>'notes', '')::text,
    v_group_id,
    (item->>'number')::int,
    v_total,
    NULLIF(p_base->>'created_by', '')::uuid
  FROM jsonb_array_elements(p_items) AS item
  RETURNING *;
END;
$$;

COMMENT ON FUNCTION public.create_financial_entry_with_installments IS
  'Cria N parcelas de financial_entries atomicamente com installment_group_id compartilhado. SECURITY INVOKER: RLS admin-only aplica.';

-- ============================================================================
-- mark_financial_entry_paid(p_entry_id uuid, p_paid_date date, p_payment_method text)
-- SECURITY INVOKER: RLS de UPDATE (admin) aplica; NOT FOUND sinaliza bloqueio.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mark_financial_entry_paid(
  p_entry_id UUID,
  p_paid_date DATE,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS public.financial_entries
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_row public.financial_entries;
BEGIN
  UPDATE public.financial_entries
  SET status = 'paid',
      paid_date = p_paid_date,
      payment_method = COALESCE(p_payment_method, payment_method)
  WHERE id = p_entry_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lancamento nao encontrado ou sem permissao'
      USING ERRCODE = '42501';
  END IF;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.mark_financial_entry_paid IS
  'Marca um lancamento como pago (status=paid, paid_date). SECURITY INVOKER: RLS admin aplica.';

-- ============================================================================
-- generate_due_recurrences()
-- Para cada recorrencia ativa, materializa as ocorrencias pendentes faltantes
-- ate hoje. Idempotente: nao recria uma ocorrencia ja existente (mesmo
-- recurrence_id + due_date). Avanca next_run_date. SECURITY DEFINER (roda no cron).
-- Retorna o numero de entries criadas.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_due_recurrences()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec RECORD;
  v_due DATE;
  v_created INTEGER := 0;
  v_step INTERVAL;
BEGIN
  FOR v_rec IN
    SELECT * FROM public.financial_recurrences
    WHERE is_active = true
      AND start_date <= current_date
      AND (end_date IS NULL OR end_date >= start_date)
  LOOP
    -- Passo conforme a frequencia x intervalo
    v_step := CASE v_rec.frequency
      WHEN 'weekly'    THEN make_interval(weeks  => v_rec.interval)
      WHEN 'monthly'   THEN make_interval(months => v_rec.interval)
      WHEN 'quarterly' THEN make_interval(months => v_rec.interval * 3)
      WHEN 'yearly'    THEN make_interval(years  => v_rec.interval)
    END;

    v_due := COALESCE(v_rec.next_run_date, v_rec.start_date);

    WHILE v_due <= current_date
      AND (v_rec.end_date IS NULL OR v_due <= v_rec.end_date)
    LOOP
      -- Idempotencia: so insere se ainda nao existe ocorrencia nesta data
      IF NOT EXISTS (
        SELECT 1 FROM public.financial_entries
        WHERE recurrence_id = v_rec.id AND due_date = v_due
      ) THEN
        INSERT INTO public.financial_entries (
          type, status, category_id, description, counterparty_name,
          counterparty_company_id, amount, currency, payment_method,
          competence_date, due_date, recurrence_id, created_by
        ) VALUES (
          v_rec.type, 'pending', v_rec.category_id, v_rec.description,
          v_rec.counterparty_name, v_rec.counterparty_company_id, v_rec.amount,
          'BRL', v_rec.payment_method, v_due, v_due, v_rec.id, v_rec.created_by
        );
        v_created := v_created + 1;
      END IF;

      v_due := (v_due + v_step)::date;
    END LOOP;

    -- Avanca next_run_date para a proxima ocorrencia futura
    UPDATE public.financial_recurrences
    SET next_run_date = v_due
    WHERE id = v_rec.id;
  END LOOP;

  RETURN v_created;
END;
$$;

COMMENT ON FUNCTION public.generate_due_recurrences IS
  'Materializa financial_entries pendentes para recorrencias ativas ate a data atual. Idempotente. Agendar via pg_cron diario na Fase 7.';
