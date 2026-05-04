-- 096_ai_match.sql
-- AI Match: análise inteligente de compatibilidade candidato/vaga
-- Cria 2 tabelas (usage + analyses), 4 RPCs, plan capability, RLS

-- ============================================================================
-- TABLES
-- ============================================================================

-- Reserva de cota: criada antes da chamada Claude. Status final: completed | refunded
CREATE TABLE public.ai_match_usage (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id       uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  triggered_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status       text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','completed','refunded')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_match_usage IS 'Reserva de cota para análise AI Match. status reserved→completed (ok) ou reserved→refunded (erro).';

-- Index para contagem mensal eficiente (não conta refunded)
CREATE INDEX idx_ai_match_usage_company_month
  ON public.ai_match_usage(company_id, created_at DESC)
  WHERE status <> 'refunded';

-- Index para lookup de análise existente
CREATE INDEX idx_ai_match_usage_lookup
  ON public.ai_match_usage(company_id, candidate_id, job_id);

-- Resultado persistido (1 análise ativa por par candidato+vaga)
CREATE TABLE public.ai_match_analyses (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_id                    uuid NOT NULL REFERENCES public.ai_match_usage(id) ON DELETE CASCADE,
  company_id                  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  candidate_id                uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id                      uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  content                     text NOT NULL,
  model_used                  text,
  tokens_input                integer,
  tokens_output               integer,
  generation_time_ms          integer,
  algorithmic_score_snapshot  integer,
  created_at                  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_match_analyses IS 'Resultado persistido da análise AI Match. Único por par (company, candidate, job) — regeneração substitui via DELETE+INSERT.';

-- 1 análise ativa por par (regeneração substitui)
CREATE UNIQUE INDEX idx_ai_match_analyses_unique
  ON public.ai_match_analyses(company_id, candidate_id, job_id);

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE public.ai_match_usage    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_match_analyses ENABLE ROW LEVEL SECURITY;

-- Empresa vê apenas seus próprios usos
CREATE POLICY "ai_match_usage_select_company"
  ON public.ai_match_usage FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "ai_match_usage_select_admin"
  ON public.ai_match_usage FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- INSERT/UPDATE/DELETE só via RPCs SECURITY DEFINER → não criar policies abertas

-- Empresa vê apenas suas próprias análises
CREATE POLICY "ai_match_analyses_select_company"
  ON public.ai_match_analyses FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "ai_match_analyses_select_admin"
  ON public.ai_match_analyses FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- INSERT/UPDATE/DELETE só via RPCs SECURITY DEFINER

-- ============================================================================
-- PLAN CAPABILITY
-- ============================================================================

INSERT INTO public.plan_capabilities (key, name, description, category, value_type)
VALUES (
  'ai_match_monthly_quota',
  'Análises IA por mês',
  'Quantidade de análises de match por IA disponíveis por mês para a empresa. Use -1 para ilimitado.',
  'ai',
  'number'
)
ON CONFLICT (key) DO NOTHING;
