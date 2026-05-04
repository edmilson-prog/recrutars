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

-- ============================================================================
-- RPC: consume_ai_match_credit
-- Atomically reserves a quota slot. Returns usage_id or NULL if quota exhausted.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.consume_ai_match_credit(
  p_candidate_id uuid,
  p_job_id       uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id  uuid;
  v_user_id     uuid;
  v_quota       integer;
  v_used        integer;
  v_usage_id    uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  v_company_id := public.get_company_id(v_user_id);
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'company not found for user';
  END IF;

  -- Serialize concurrent reservations from the same company to prevent quota overshoot
  PERFORM pg_advisory_xact_lock(hashtext(v_company_id::text));

  -- Lookup quota from plan capability (fallback 3 if no plan or capability)
  SELECT COALESCE(
    CASE WHEN pca.value ~ '^-?[0-9]+$' THEN pca.value::integer END,
    3
  )
    INTO v_quota
    FROM public.subscriptions s
    LEFT JOIN public.plan_capability_assignments pca
      ON pca.plan_id = s.plan_id AND pca.capability_key = 'ai_match_monthly_quota'
   WHERE s.user_id = v_company_id
     AND s.user_type = 'company'
     AND s.status IN ('active', 'trial', 'past_due')
   ORDER BY (s.status = 'active') DESC, s.created_at DESC
   LIMIT 1;

  IF v_quota IS NULL THEN
    v_quota := 3;
  END IF;

  -- Count usage in current month (excludes refunded)
  SELECT COUNT(*) INTO v_used
    FROM public.ai_match_usage
   WHERE company_id = v_company_id
     AND status <> 'refunded'
     AND created_at >= date_trunc('month', now());

  -- -1 = unlimited
  IF v_quota <> -1 AND v_used >= v_quota THEN
    RETURN NULL;
  END IF;

  -- Reserve slot
  INSERT INTO public.ai_match_usage (company_id, candidate_id, job_id, triggered_by, status)
  VALUES (v_company_id, p_candidate_id, p_job_id, v_user_id, 'reserved')
  RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$$;

COMMENT ON FUNCTION public.consume_ai_match_credit IS
  'Reserva 1 cota AI Match. Retorna usage_id ou NULL se cota mensal esgotada. Quota lida de plan_capabilities (fallback 3).';

-- ============================================================================
-- RPC: save_ai_match_analysis
-- Marks usage as completed and persists the analysis result.
-- Replaces existing analysis for same (company, candidate, job).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.save_ai_match_analysis(
  p_usage_id            uuid,
  p_content             text,
  p_model               text,
  p_tokens_in           integer,
  p_tokens_out          integer,
  p_gen_ms              integer,
  p_algo_score          integer
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id   uuid;
  v_candidate_id uuid;
  v_job_id       uuid;
  v_user_id      uuid;
  v_analysis_id  uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Validate usage exists, is reserved, and belongs to this user's company
  SELECT u.company_id, u.candidate_id, u.job_id
    INTO v_company_id, v_candidate_id, v_job_id
    FROM public.ai_match_usage u
   WHERE u.id = p_usage_id
     AND u.status = 'reserved'
     AND u.company_id = public.get_company_id(v_user_id);

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'invalid or already-completed usage';
  END IF;

  -- Mark usage completed
  UPDATE public.ai_match_usage SET status = 'completed' WHERE id = p_usage_id;

  -- Replace existing analysis (regeneration)
  DELETE FROM public.ai_match_analyses
   WHERE company_id = v_company_id
     AND candidate_id = v_candidate_id
     AND job_id = v_job_id;

  INSERT INTO public.ai_match_analyses (
    usage_id, company_id, candidate_id, job_id, content,
    model_used, tokens_input, tokens_output, generation_time_ms, algorithmic_score_snapshot
  )
  VALUES (
    p_usage_id, v_company_id, v_candidate_id, v_job_id, p_content,
    p_model, p_tokens_in, p_tokens_out, p_gen_ms, p_algo_score
  )
  RETURNING id INTO v_analysis_id;

  RETURN v_analysis_id;
END;
$$;

-- ============================================================================
-- RPC: refund_ai_match_credit
-- Marks usage as refunded (won't count in monthly quota).
-- Called when Claude API call fails after reservation.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.refund_ai_match_credit(
  p_usage_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    uuid;
  v_company_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  v_company_id := public.get_company_id(v_user_id);

  UPDATE public.ai_match_usage
     SET status = 'refunded'
   WHERE id = p_usage_id
     AND status = 'reserved'
     AND company_id = v_company_id;

  RETURN FOUND;
END;
$$;

-- ============================================================================
-- RPC: get_ai_match_quota_status
-- Returns { used, total, remaining, unlimited } for the current company.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_ai_match_quota_status()
RETURNS TABLE (used integer, total integer, remaining integer, unlimited boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    uuid;
  v_company_id uuid;
  v_quota      integer;
  v_used       integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  v_company_id := public.get_company_id(v_user_id);
  IF v_company_id IS NULL THEN
    used := 0; total := 0; remaining := 0; unlimited := false;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT COALESCE(
    CASE WHEN pca.value ~ '^-?[0-9]+$' THEN pca.value::integer END,
    3
  )
    INTO v_quota
    FROM public.subscriptions s
    LEFT JOIN public.plan_capability_assignments pca
      ON pca.plan_id = s.plan_id AND pca.capability_key = 'ai_match_monthly_quota'
   WHERE s.user_id = v_company_id
     AND s.user_type = 'company'
     AND s.status IN ('active', 'trial', 'past_due')
   ORDER BY (s.status = 'active') DESC, s.created_at DESC
   LIMIT 1;

  IF v_quota IS NULL THEN v_quota := 3; END IF;

  SELECT COUNT(*) INTO v_used
    FROM public.ai_match_usage
   WHERE company_id = v_company_id
     AND status <> 'refunded'
     AND created_at >= date_trunc('month', now());

  used := v_used;
  total := v_quota;
  unlimited := (v_quota = -1);
  remaining := CASE WHEN unlimited THEN 999 ELSE GREATEST(v_quota - v_used, 0) END;
  RETURN NEXT;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.consume_ai_match_credit(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_ai_match_analysis(uuid, text, text, integer, integer, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_ai_match_credit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_match_quota_status() TO authenticated;
