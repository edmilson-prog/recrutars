-- Migration 121: financial_entries
-- Lancamentos manuais de receita/despesa (contas a pagar/receber + caixa).
-- amount SEMPRE positivo; sinal/cor vem do type. overdue e DERIVADO (nao armazenado).
-- recurrence_id existe aqui sem FK; a FK e adicionada na migration 123.

CREATE TABLE public.financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled')),
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  counterparty_name TEXT,
  counterparty_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_method TEXT CHECK (payment_method IN ('card_credit','card_debit','pix','boleto','transfer','cash','other')),
  competence_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  installment_group_id UUID,
  installment_number INTEGER,
  installment_total INTEGER,
  recurrence_id UUID,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

-- RLS: admin-only para SELECT/INSERT/UPDATE/DELETE
CREATE POLICY "financial_entries_select_admin"
  ON public.financial_entries FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_entries_insert_admin"
  ON public.financial_entries FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_entries_update_admin"
  ON public.financial_entries FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_entries_delete_admin"
  ON public.financial_entries FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- RLS: service_role pode inserir (geracao de recorrencias via cron/Edge Function)
CREATE POLICY "financial_entries_insert_service"
  ON public.financial_entries FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_financial_entries_status ON public.financial_entries(status);
CREATE INDEX idx_financial_entries_due_date ON public.financial_entries(due_date);
CREATE INDEX idx_financial_entries_competence_date ON public.financial_entries(competence_date);
CREATE INDEX idx_financial_entries_type ON public.financial_entries(type);
CREATE INDEX idx_financial_entries_category ON public.financial_entries(category_id);
CREATE INDEX idx_financial_entries_installment_group ON public.financial_entries(installment_group_id);
CREATE INDEX idx_financial_entries_counterparty_company ON public.financial_entries(counterparty_company_id);

-- Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.financial_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
