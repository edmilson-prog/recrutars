-- 097_fix_ai_match_quota_subscription_lookup.sql
-- Fix: AI Match RPCs filtravam subscription por `s.user_id = v_company_id`,
-- mas `subscriptions.user_id` armazena `companies.profile_id` (auth user id),
-- nao `companies.id`. O lookup nunca casava, todas as empresas caiam no fallback (3).
-- Effects: configuracao de `ai_match_monthly_quota` por plano era ignorada;
-- admins acessando paginas de empresa viam `0 de 0 restantes`.
--
-- Padrao correto (PRD-079, migration 031): JOIN companies ON c.profile_id = s.user_id.

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

  PERFORM pg_advisory_xact_lock(hashtext(v_company_id::text));

  SELECT COALESCE(
    CASE WHEN pca.value ~ '^-?[0-9]+$' THEN pca.value::integer END,
    3
  )
    INTO v_quota
    FROM public.subscriptions s
    INNER JOIN public.companies c
      ON c.profile_id = s.user_id AND c.id = v_company_id
    LEFT JOIN public.plan_capability_assignments pca
      ON pca.plan_id = s.plan_id AND pca.capability_key = 'ai_match_monthly_quota'
   WHERE s.user_type = 'company'
     AND s.status IN ('active', 'trial', 'past_due')
   ORDER BY (s.status = 'active') DESC, s.created_at DESC
   LIMIT 1;

  IF v_quota IS NULL THEN
    v_quota := 3;
  END IF;

  SELECT COUNT(*) INTO v_used
    FROM public.ai_match_usage
   WHERE company_id = v_company_id
     AND status <> 'refunded'
     AND created_at >= date_trunc('month', now());

  IF v_quota <> -1 AND v_used >= v_quota THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.ai_match_usage (company_id, candidate_id, job_id, triggered_by, status)
  VALUES (v_company_id, p_candidate_id, p_job_id, v_user_id, 'reserved')
  RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$$;


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
    INNER JOIN public.companies c
      ON c.profile_id = s.user_id AND c.id = v_company_id
    LEFT JOIN public.plan_capability_assignments pca
      ON pca.plan_id = s.plan_id AND pca.capability_key = 'ai_match_monthly_quota'
   WHERE s.user_type = 'company'
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
