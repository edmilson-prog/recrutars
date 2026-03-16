-- =====================================================
-- RecrutaRS: Gauge-Pro Completion Trigger
-- Notifica empresa (se solicitou) e admin quando candidato
-- conclui teste Gauge-Pro
-- =====================================================

CREATE OR REPLACE FUNCTION public.trg_notify_gauge_pro_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_name TEXT;
  v_archetype TEXT;
  v_profile_id UUID;
  v_app RECORD;
  v_has_company_request BOOLEAN := FALSE;
BEGIN
  IF NOT public.is_notification_enabled('triggerTestCompleted') THEN RETURN NEW; END IF;

  SELECT name, profile_id INTO v_candidate_name, v_profile_id
  FROM public.candidates WHERE id = NEW.candidate_id;
  IF v_candidate_name IS NULL THEN RETURN NEW; END IF;

  v_archetype := COALESCE(NEW.archetype_id, NEW.primary_dimension);

  -- Verificar se alguma empresa solicitou teste para este candidato
  FOR v_app IN
    SELECT a.job_id, j.title AS job_title, j.company_id
    FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE a.candidate_id = NEW.candidate_id
      AND a.test_status = 'pending'
  LOOP
    v_has_company_request := TRUE;

    -- Notificar empresa
    PERFORM public.notify_company_users(
      v_app.company_id,
      'test_completed',
      'Teste comportamental concluído',
      v_candidate_name || ' completou o teste Gauge-Pro para a vaga de ' || v_app.job_title,
      '/empresa/testes',
      jsonb_build_object(
        'candidateId', NEW.candidate_id,
        'candidateName', v_candidate_name,
        'jobId', v_app.job_id,
        'jobTitle', v_app.job_title,
        'archetype', v_archetype
      )
    );

    -- Atualizar test_status para completed
    UPDATE public.applications
    SET test_status = 'completed'
    WHERE candidate_id = NEW.candidate_id
      AND job_id = v_app.job_id
      AND test_status = 'pending';
  END LOOP;

  -- Sempre notificar admin (com contexto diferente se empresa solicitou ou nao)
  PERFORM public.notify_admins(
    'new_candidate',
    CASE WHEN v_has_company_request
      THEN 'Teste Gauge-Pro concluído (solicitado)'
      ELSE 'Teste Gauge-Pro concluído (onboarding)'
    END,
    v_candidate_name || ' completou o teste comportamental Gauge-Pro'
      || CASE WHEN v_has_company_request THEN ' (solicitado por empresa)' ELSE ' (onboarding)' END,
    '/admin/candidatos',
    jsonb_build_object(
      'userId', v_profile_id,
      'userName', v_candidate_name,
      'userType', 'candidate',
      'archetype', v_archetype
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_gauge_pro_completed ON public.gauge_pro_results;
CREATE TRIGGER trg_notify_gauge_pro_completed
  AFTER INSERT ON public.gauge_pro_results
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_gauge_pro_completed();

COMMENT ON FUNCTION public.trg_notify_gauge_pro_completed() IS
  'Notifica empresa (se solicitou) e admin quando candidato conclui teste Gauge-Pro. Atualiza test_status de pending para completed.';
