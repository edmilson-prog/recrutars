-- =====================================================
-- RecrutaRS: Notification Triggers
-- Sistema automatico de notificacoes via triggers PostgreSQL
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 050_populate_platform_metrics.sql
-- =====================================================

-- =====================================================
-- PHASE 1: HELPER FUNCTIONS
-- =====================================================

-- 1.1 notify_company_users: Insere 1 notificacao por membro ativo da empresa
CREATE OR REPLACE FUNCTION public.notify_company_users(
  p_company_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_description TEXT,
  p_action_url TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
  SELECT cu.profile_id, p_type, p_title, p_description, p_action_url, p_metadata
  FROM public.company_users cu
  JOIN public.profiles p ON p.id = cu.profile_id
  WHERE cu.company_id = p_company_id
    AND p.status = 'active';
END;
$$;

COMMENT ON FUNCTION public.notify_company_users(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) IS
  'Insere uma notificacao para cada membro ativo de uma empresa via company_users';

-- 1.2 notify_candidate: Resolve profile_id a partir de candidate_id e insere notificacao
CREATE OR REPLACE FUNCTION public.notify_candidate(
  p_candidate_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_description TEXT,
  p_action_url TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT profile_id INTO v_profile_id
  FROM public.candidates WHERE id = p_candidate_id;

  IF v_profile_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
  VALUES (v_profile_id, p_type, p_title, p_description, p_action_url, p_metadata);
END;
$$;

COMMENT ON FUNCTION public.notify_candidate(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) IS
  'Insere uma notificacao para um candidato, resolvendo profile_id a partir de candidate_id';

-- =====================================================
-- PHASE 2: CANDIDATE NOTIFICATION TRIGGERS
-- =====================================================

-- 2.1 Application status change -> notify candidate
CREATE OR REPLACE FUNCTION public.trg_notify_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_title TEXT;
  v_company_name TEXT;
  v_company_id UUID;
  v_notif_type TEXT;
  v_title TEXT;
  v_description TEXT;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.status IN ('hired', 'talent_pool') THEN RETURN NEW; END IF;
  IF NEW.status = 'withdrawn' THEN RETURN NEW; END IF;

  SELECT j.title, c.name, j.company_id
  INTO v_job_title, v_company_name, v_company_id
  FROM public.jobs j
  JOIN public.companies c ON j.company_id = c.id
  WHERE j.id = NEW.job_id;

  -- Guard against deleted job/company
  IF v_job_title IS NULL OR v_company_name IS NULL THEN RETURN NEW; END IF;

  CASE NEW.status
    WHEN 'reviewing' THEN
      v_notif_type := 'application_update';
      v_title := 'Sua candidatura está em análise';
      v_description := 'A empresa ' || v_company_name || ' está analisando sua candidatura para ' || v_job_title;
    WHEN 'interview' THEN
      v_notif_type := 'application_update';
      v_title := 'Você avançou para entrevista!';
      v_description := 'Parabéns! Você avançou para a fase de entrevista na vaga de ' || v_job_title || ' na ' || v_company_name;
    WHEN 'offer' THEN
      v_notif_type := 'application_approved';
      v_title := 'Você foi aprovado(a)!';
      v_description := 'Parabéns! Sua candidatura para ' || v_job_title || ' na ' || v_company_name || ' foi aprovada!';
    WHEN 'rejected' THEN
      v_notif_type := 'application_rejected';
      v_title := 'Atualização sobre sua candidatura';
      v_description := 'Sua candidatura para ' || v_job_title || ' não avançou neste processo. Não desanime, novas oportunidades surgem todos os dias!';
    ELSE
      RETURN NEW;
  END CASE;

  PERFORM public.notify_candidate(
    NEW.candidate_id,
    v_notif_type,
    v_title,
    v_description,
    '/candidato/candidaturas',
    jsonb_build_object(
      'jobId', NEW.job_id,
      'jobTitle', v_job_title,
      'companyName', v_company_name,
      'companyId', v_company_id,
      'applicationId', NEW.id,
      'newStage', NEW.status
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_application_status ON public.applications;
CREATE TRIGGER trg_notify_application_status
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.trg_notify_application_status_change();

COMMENT ON FUNCTION public.trg_notify_application_status_change() IS
  'Notifica candidato quando status da candidatura muda (reviewing, interview, offer, rejected)';

-- 2.2 Test requested -> notify candidate
CREATE OR REPLACE FUNCTION public.trg_notify_test_requested()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_title TEXT;
  v_company_name TEXT;
  v_company_id UUID;
BEGIN
  IF OLD.test_status = NEW.test_status THEN RETURN NEW; END IF;
  IF NEW.test_status != 'pending' THEN RETURN NEW; END IF;

  SELECT j.title, c.name, j.company_id
  INTO v_job_title, v_company_name, v_company_id
  FROM public.jobs j
  JOIN public.companies c ON j.company_id = c.id
  WHERE j.id = NEW.job_id;

  IF v_job_title IS NULL OR v_company_name IS NULL THEN RETURN NEW; END IF;

  PERFORM public.notify_candidate(
    NEW.candidate_id,
    'test_request',
    'Teste comportamental solicitado',
    v_company_name || ' solicita que você realize o teste Gauge-Pro para a vaga de ' || v_job_title,
    '/candidato/testes',
    jsonb_build_object(
      'jobId', NEW.job_id,
      'jobTitle', v_job_title,
      'companyName', v_company_name,
      'companyId', v_company_id,
      'applicationId', NEW.id,
      'testDeadline', NEW.test_deadline
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_test_request ON public.applications;
CREATE TRIGGER trg_notify_test_request
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  WHEN (OLD.test_status IS DISTINCT FROM NEW.test_status)
  EXECUTE FUNCTION public.trg_notify_test_requested();

COMMENT ON FUNCTION public.trg_notify_test_requested() IS
  'Notifica candidato quando empresa solicita teste comportamental (test_status -> pending)';

-- 2.3 New message -> notify other party (bidirectional)
CREATE OR REPLACE FUNCTION public.trg_notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv RECORD;
  v_target_profile_id UUID;
  v_has_recent BOOLEAN;
BEGIN
  IF NEW.sender_type IN ('system', 'admin') THEN RETURN NEW; END IF;

  SELECT
    conv.candidate_id,
    conv.company_id,
    cand.name AS candidate_name,
    comp.name AS company_name
  INTO v_conv
  FROM public.conversations conv
  LEFT JOIN public.candidates cand ON conv.candidate_id = cand.id
  LEFT JOIN public.companies comp ON conv.company_id = comp.id
  WHERE conv.id = NEW.conversation_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  IF NEW.sender_type = 'company' THEN
    SELECT profile_id INTO v_target_profile_id
    FROM public.candidates WHERE id = v_conv.candidate_id;

    IF v_target_profile_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE user_id = v_target_profile_id
          AND type = 'message'
          AND read = false
          AND created_at > NOW() - INTERVAL '5 minutes'
          AND metadata->>'companyId' = v_conv.company_id::TEXT
      ) INTO v_has_recent;

      IF NOT v_has_recent THEN
        PERFORM public.notify_candidate(
          v_conv.candidate_id,
          'message',
          'Nova mensagem de ' || COALESCE(v_conv.company_name, 'Empresa'),
          LEFT(NEW.content, 100),
          '/candidato/mensagens',
          jsonb_build_object(
            'companyName', v_conv.company_name,
            'companyId', v_conv.company_id,
            'messagePreview', LEFT(NEW.content, 100)
          )
        );
      END IF;
    END IF;

  ELSIF NEW.sender_type = 'candidate' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.notifications n
      JOIN public.company_users cu ON n.user_id = cu.profile_id
      WHERE cu.company_id = v_conv.company_id
        AND n.type = 'new_message'
        AND n.read = false
        AND n.created_at > NOW() - INTERVAL '5 minutes'
        AND n.metadata->>'candidateId' = v_conv.candidate_id::TEXT
    ) INTO v_has_recent;

    IF NOT v_has_recent THEN
      PERFORM public.notify_company_users(
        v_conv.company_id,
        'new_message',
        'Nova mensagem de ' || COALESCE(v_conv.candidate_name, 'Candidato'),
        LEFT(NEW.content, 100),
        '/empresa/mensagens',
        jsonb_build_object(
          'candidateId', v_conv.candidate_id,
          'candidateName', v_conv.candidate_name,
          'messagePreview', LEFT(NEW.content, 100)
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_new_message();

COMMENT ON FUNCTION public.trg_notify_new_message() IS
  'Notifica a outra parte quando nova mensagem e enviada (bidirecional, com dedup de 5min)';

-- =====================================================
-- PHASE 3: COMPANY NOTIFICATION TRIGGERS
-- =====================================================

-- 3.1 New application -> notify company
CREATE OR REPLACE FUNCTION public.trg_notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_name TEXT;
  v_job_title TEXT;
  v_company_id UUID;
BEGIN
  SELECT name INTO v_candidate_name FROM public.candidates WHERE id = NEW.candidate_id;
  SELECT title, company_id INTO v_job_title, v_company_id FROM public.jobs WHERE id = NEW.job_id;

  IF v_candidate_name IS NULL OR v_job_title IS NULL OR v_company_id IS NULL THEN RETURN NEW; END IF;

  PERFORM public.notify_company_users(
    v_company_id,
    'new_application',
    'Nova candidatura recebida',
    v_candidate_name || ' se candidatou para a vaga de ' || v_job_title,
    '/empresa/candidatos',
    jsonb_build_object(
      'candidateId', NEW.candidate_id,
      'candidateName', v_candidate_name,
      'jobId', NEW.job_id,
      'jobTitle', v_job_title,
      'applicationId', NEW.id
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_application ON public.applications;
CREATE TRIGGER trg_notify_new_application
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_new_application();

COMMENT ON FUNCTION public.trg_notify_new_application() IS
  'Notifica empresa quando candidato se candidata a uma vaga';

-- 3.2 Test completed -> notify company
CREATE OR REPLACE FUNCTION public.trg_notify_test_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_name TEXT;
  v_job_title TEXT;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.status != 'completed' THEN RETURN NEW; END IF;
  IF NEW.company_id IS NULL THEN RETURN NEW; END IF;

  SELECT name INTO v_candidate_name FROM public.candidates WHERE id = NEW.candidate_id;
  IF v_candidate_name IS NULL THEN RETURN NEW; END IF;

  IF NEW.job_id IS NOT NULL THEN
    SELECT title INTO v_job_title FROM public.jobs WHERE id = NEW.job_id;
  END IF;

  PERFORM public.notify_company_users(
    NEW.company_id,
    'test_completed',
    'Teste comportamental concluído',
    v_candidate_name || ' completou o teste comportamental'
      || CASE WHEN v_job_title IS NOT NULL THEN ' para a vaga de ' || v_job_title ELSE '' END,
    '/empresa/testes',
    jsonb_build_object(
      'candidateId', NEW.candidate_id,
      'candidateName', v_candidate_name,
      'jobId', NEW.job_id,
      'jobTitle', v_job_title
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_test_completed ON public.behavioral_tests;
CREATE TRIGGER trg_notify_test_completed
  AFTER UPDATE ON public.behavioral_tests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.trg_notify_test_completed();

COMMENT ON FUNCTION public.trg_notify_test_completed() IS
  'Notifica empresa quando candidato completa teste comportamental';

-- 3.3a Interview status change -> notify company
CREATE OR REPLACE FUNCTION public.trg_notify_interview_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_name TEXT;
  v_job_title TEXT;
  v_notif_type TEXT;
  v_title_text TEXT;
  v_description TEXT;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;

  SELECT name INTO v_candidate_name FROM public.candidates WHERE id = NEW.candidate_id;
  IF v_candidate_name IS NULL THEN RETURN NEW; END IF;

  v_job_title := COALESCE((SELECT title FROM public.jobs WHERE id = NEW.job_id), NEW.title, 'a vaga');

  CASE NEW.status
    WHEN 'confirmed' THEN
      v_notif_type := 'interview_confirmed';
      v_title_text := 'Entrevista confirmada';
      v_description := v_candidate_name || ' confirmou a entrevista para ' || v_job_title;
    WHEN 'suggestion_sent' THEN
      v_notif_type := 'interview_suggested';
      v_title_text := 'Novo horário sugerido';
      v_description := v_candidate_name || ' sugeriu um novo horário para a entrevista de ' || v_job_title;
    WHEN 'cancelled' THEN
      v_notif_type := 'interview_cancelled';
      v_title_text := 'Entrevista cancelada';
      v_description := 'A entrevista com ' || v_candidate_name || ' para ' || v_job_title || ' foi cancelada';
    ELSE
      RETURN NEW;
  END CASE;

  PERFORM public.notify_company_users(
    NEW.company_id,
    v_notif_type,
    v_title_text,
    v_description,
    '/empresa/candidatos',
    jsonb_build_object(
      'candidateId', NEW.candidate_id,
      'candidateName', v_candidate_name,
      'jobId', NEW.job_id,
      'jobTitle', v_job_title,
      'interviewDate', NEW.confirmed_datetime
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_interview_status ON public.interviews;
CREATE TRIGGER trg_notify_interview_status
  AFTER UPDATE ON public.interviews
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.trg_notify_interview_status();

COMMENT ON FUNCTION public.trg_notify_interview_status() IS
  'Notifica empresa quando candidato confirma, sugere horario ou cancela entrevista';

-- 3.3b Interview created -> notify candidate
CREATE OR REPLACE FUNCTION public.trg_notify_interview_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_title TEXT;
  v_company_name TEXT;
BEGIN
  SELECT j.title, c.name
  INTO v_job_title, v_company_name
  FROM public.jobs j
  JOIN public.companies c ON j.company_id = c.id
  WHERE j.id = NEW.job_id;

  IF v_job_title IS NULL OR v_company_name IS NULL THEN RETURN NEW; END IF;

  PERFORM public.notify_candidate(
    NEW.candidate_id,
    'application_update',
    'Convite para entrevista',
    v_company_name || ' convidou você para uma entrevista para a vaga de ' || v_job_title,
    '/candidato/candidaturas',
    jsonb_build_object(
      'jobId', NEW.job_id,
      'jobTitle', v_job_title,
      'companyName', v_company_name,
      'companyId', NEW.company_id,
      'newStage', 'interview'
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_interview_created ON public.interviews;
CREATE TRIGGER trg_notify_interview_created
  AFTER INSERT ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_interview_created();

COMMENT ON FUNCTION public.trg_notify_interview_created() IS
  'Notifica candidato quando empresa cria convite de entrevista';

-- =====================================================
-- PHASE 4: JOB MATCH (basic matching)
-- =====================================================

-- Index para preferred_sectors (necessario para matching)
CREATE INDEX IF NOT EXISTS idx_candidates_preferred_sectors
  ON public.candidates USING GIN (preferred_sectors);

-- 4.1 Job approved -> notify matching candidates
CREATE OR REPLACE FUNCTION public.trg_notify_job_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_name TEXT;
  v_display_name TEXT;
  r_candidate RECORD;
BEGIN
  -- Only when job becomes approved and is active
  IF NEW.moderation_status != 'approved' THEN RETURN NEW; END IF;
  IF OLD.moderation_status = 'approved' THEN RETURN NEW; END IF;
  IF NEW.status != 'active' THEN RETURN NEW; END IF;

  SELECT name INTO v_company_name FROM public.companies WHERE id = NEW.company_id;

  -- Respect anonymous jobs
  IF NEW.is_anonymous THEN
    v_display_name := 'Empresa Confidencial';
  ELSE
    v_display_name := COALESCE(v_company_name, 'Empresa');
  END IF;

  FOR r_candidate IN
    SELECT c.id AS candidate_id, c.profile_id
    FROM public.candidates c
    JOIN public.profiles p ON p.id = c.profile_id
    WHERE p.type = 'candidate'
      AND p.status = 'active'
      AND c.status = 'active'
      -- Exclude candidates who already applied to this job
      AND NOT EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.candidate_id = c.id AND a.job_id = NEW.id
      )
      -- Area match: candidate has no preference OR job area matches
      AND (c.preferred_sectors = '{}' OR c.preferred_sectors IS NULL OR NEW.area = ANY(c.preferred_sectors))
      -- Work model match: candidate has no preference OR job type matches
      AND (c.work_model = '{}' OR c.work_model IS NULL OR NEW.type = ANY(c.work_model))
      -- Salary overlap (NULLs = no restriction)
      AND (c.salary_min IS NULL OR NEW.salary_max IS NULL OR c.salary_min <= NEW.salary_max)
      AND (c.salary_max IS NULL OR NEW.salary_min IS NULL OR c.salary_max >= NEW.salary_min)
    ORDER BY c.updated_at DESC NULLS LAST
    LIMIT 50
  LOOP
    INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
    VALUES (
      r_candidate.profile_id,
      'job_match',
      'Nova vaga compatível com seu perfil',
      v_display_name || ' publicou a vaga de ' || NEW.title || '. Confira!',
      '/candidato/vagas',
      jsonb_build_object(
        'jobId', NEW.id,
        'jobTitle', NEW.title,
        'companyName', CASE WHEN NEW.is_anonymous THEN NULL ELSE v_company_name END,
        'companyId', NEW.company_id
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_job_match ON public.jobs;
CREATE TRIGGER trg_notify_job_match
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  WHEN (OLD.moderation_status IS DISTINCT FROM NEW.moderation_status)
  EXECUTE FUNCTION public.trg_notify_job_match();

COMMENT ON FUNCTION public.trg_notify_job_match() IS
  'Notifica candidatos compativeis quando vaga e aprovada (match basico: area, work_model, salario, limit 50)';

-- =====================================================
-- REALTIME: Enable for notifications table
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
