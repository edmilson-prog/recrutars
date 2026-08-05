-- Migration 123: financial_recurrences
-- Regras de recorrencia que materializam financial_entries pendentes ao longo do tempo.
-- Tambem adiciona a FK financial_entries.recurrence_id (a tabela ja existia na 121).

CREATE TABLE public.financial_recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  counterparty_name TEXT,
  counterparty_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT CHECK (payment_method IN ('card_credit','card_debit','pix','boleto','transfer','cash','other')),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly','monthly','quarterly','yearly')),
  interval INTEGER NOT NULL DEFAULT 1 CHECK (interval > 0),
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_recurrences ENABLE ROW LEVEL SECURITY;

-- RLS: admin-only
CREATE POLICY "financial_recurrences_select_admin"
  ON public.financial_recurrences FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_recurrences_insert_admin"
  ON public.financial_recurrences FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_recurrences_update_admin"
  ON public.financial_recurrences FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_recurrences_delete_admin"
  ON public.financial_recurrences FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- RLS: service_role pode ler/atualizar (cron de geracao avanca next_run_date)
CREATE POLICY "financial_recurrences_select_service"
  ON public.financial_recurrences FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "financial_recurrences_update_service"
  ON public.financial_recurrences FOR UPDATE
  TO service_role
  USING (true);

-- Index para geracao (recorrencias ativas com proxima execucao vencida)
CREATE INDEX idx_financial_recurrences_active_next
  ON public.financial_recurrences(is_active, next_run_date);

-- Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.financial_recurrences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- FK retroativa em financial_entries.recurrence_id (coluna criada na 121)
ALTER TABLE public.financial_entries
  ADD CONSTRAINT financial_entries_recurrence_id_fkey
  FOREIGN KEY (recurrence_id) REFERENCES public.financial_recurrences(id) ON DELETE SET NULL;
