-- Migration 120: financial_categories
-- Categorias gerenciaveis de receitas/despesas para o modulo de fluxo de caixa.
-- Admin-only (operador da plataforma). Seed inicial desativavel via is_active.

CREATE TABLE public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, type)
);

ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

-- RLS: admin-only (todas as operacoes)
CREATE POLICY "financial_categories_select_admin"
  ON public.financial_categories FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_categories_insert_admin"
  ON public.financial_categories FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_categories_update_admin"
  ON public.financial_categories FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_categories_delete_admin"
  ON public.financial_categories FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Index para ordenacao por tipo
CREATE INDEX idx_financial_categories_type ON public.financial_categories(type, sort_order);

-- Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.financial_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed inicial: 7 categorias de despesa + 3 de receita.
--
-- Cores revisadas em 21/07: tons dessaturados, fora das faixas 0-20deg
-- (vermelho de atraso), 150-170deg (verde de receita) e 190-205deg (cyan de
-- interacao). O dot da categoria e renderizado DENTRO da linha da lista, ao
-- lado do valor colorido e do badge de status; as cores originais faziam o dot
-- contradizer a semantica da propria linha (ex.: despesa de "Ocupacao" com dot
-- verde). O CRUD oferece estes tons como swatches fixos, nao color picker
-- livre. Ver spec de produto, secao 4.1.
INSERT INTO public.financial_categories (name, type, color, sort_order) VALUES
  ('Marketing',          'expense', '#9a7b4f', 1),
  ('Infraestrutura',     'expense', '#5b6b8c', 2),
  ('Serviços',           'expense', '#4f7a8b', 3),
  ('Equipamentos',       'expense', '#3f4d6b', 4),
  ('Ocupação',           'expense', '#6b7f5e', 5),
  ('Impostos',           'expense', '#8a6d5a', 6),
  ('Pessoal',            'expense', '#7c6f9e', 7),
  ('Consultoria avulsa', 'income',  '#5f8a85', 1),
  ('Reembolso',          'income',  '#6e7fa3', 2),
  ('Outras receitas',    'income',  '#8b7fa8', 3);
