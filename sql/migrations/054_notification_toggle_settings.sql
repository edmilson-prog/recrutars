-- =====================================================
-- RecrutaRS: Notification Toggle Settings
-- Permite habilitar/desabilitar triggers de notificacao
-- via system_settings (admin > notifications > triggers)
-- =====================================================

-- Helper: verifica se um trigger de notificacao esta habilitado
CREATE OR REPLACE FUNCTION public.is_notification_enabled(p_trigger_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (values->'triggers'->>p_trigger_key)::BOOLEAN
     FROM public.system_settings
     WHERE panel = 'admin'
       AND category = 'notifications'
       AND entity_id IS NULL
     LIMIT 1),
    TRUE
  );
$$;

COMMENT ON FUNCTION public.is_notification_enabled(TEXT) IS
  'Verifica se um trigger de notificacao esta habilitado nas configuracoes admin. Default: TRUE.';

-- =====================================================
-- ATUALIZAR TRIGGERS COM CHECK DE HABILITACAO
-- =====================================================

-- 1. Application status change (candidato)
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
  IF NOT public.is_notification_enabled('triggerApplicationStatus') THEN RETURN NEW; END IF;
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.status IN ('hired', 'talent_pool') THEN RETURN NEW; END IF;
  IF NEW.status = 'withdrawn' THEN RETURN NEW; END IF;

  SELECT j.title, c.name, j.company_id
  INTO v_job_title, v_company_name, v_company_id
  FROM public.jobs j
  JOIN public.companies c ON j.company_id = c.id
  WHERE j.id = NEW.job_id;

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
    NEW.candidate_id, v_notif_type, v_title, v_description, '/candidato/candidaturas',
    jsonb_build_object('jobId', NEW.job_id, 'jobTitle', v_job_title, 'companyName', v_company_name, 'companyId', v_company_id, 'applicationId', NEW.id, 'newStage', NEW.status)
  );
  RETURN NEW;
END;
$$;

-- 2. Test requested (candidato)
CREATE OR REPLACE FUNCTION public.trg_notify_test_requested()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_job_title TEXT; v_company_name TEXT; v_company_id UUID;
BEGIN
  IF NOT public.is_notification_enabled('triggerTestRequest') THEN RETURN NEW; END IF;
  IF OLD.test_status = NEW.test_status THEN RETURN NEW; END IF;
  IF NEW.test_status != 'pending' THEN RETURN NEW; END IF;

  SELECT j.title, c.name, j.company_id INTO v_job_title, v_company_name, v_company_id
  FROM public.jobs j JOIN public.companies c ON j.company_id = c.id WHERE j.id = NEW.job_id;
  IF v_job_title IS NULL OR v_company_name IS NULL THEN RETURN NEW; END IF;

  PERFORM public.notify_candidate(NEW.candidate_id, 'test_request', 'Teste comportamental solicitado',
    v_company_name || ' solicita que você realize o teste Gauge-Pro para a vaga de ' || v_job_title,
    '/candidato/testes', jsonb_build_object('jobId', NEW.job_id, 'jobTitle', v_job_title, 'companyName', v_company_name, 'companyId', v_company_id, 'applicationId', NEW.id, 'testDeadline', NEW.test_deadline));
  RETURN NEW;
END;
$$;

-- 3. New message (bidirecional)
CREATE OR REPLACE FUNCTION public.trg_notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_conv RECORD; v_target_profile_id UUID; v_has_recent BOOLEAN;
BEGIN
  IF NEW.sender_type IN ('system', 'admin') THEN RETURN NEW; END IF;

  SELECT conv.candidate_id, conv.company_id, cand.name AS candidate_name, comp.name AS company_name
  INTO v_conv FROM public.conversations conv
  LEFT JOIN public.candidates cand ON conv.candidate_id = cand.id
  LEFT JOIN public.companies comp ON conv.company_id = comp.id
  WHERE conv.id = NEW.conversation_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  IF NEW.sender_type = 'company' THEN
    IF NOT public.is_notification_enabled('triggerNewMessage') THEN RETURN NEW; END IF;
    SELECT profile_id INTO v_target_profile_id FROM public.candidates WHERE id = v_conv.candidate_id;
    IF v_target_profile_id IS NOT NULL THEN
      SELECT EXISTS (SELECT 1 FROM public.notifications WHERE user_id = v_target_profile_id AND type = 'message' AND read = false AND created_at > NOW() - INTERVAL '5 minutes' AND metadata->>'companyId' = v_conv.company_id::TEXT) INTO v_has_recent;
      IF NOT v_has_recent THEN
        PERFORM public.notify_candidate(v_conv.candidate_id, 'message', 'Nova mensagem de ' || COALESCE(v_conv.company_name, 'Empresa'), LEFT(NEW.content, 100), '/candidato/mensagens',
          jsonb_build_object('companyName', v_conv.company_name, 'companyId', v_conv.company_id, 'messagePreview', LEFT(NEW.content, 100)));
      END IF;
    END IF;
  ELSIF NEW.sender_type = 'candidate' THEN
    IF NOT public.is_notification_enabled('triggerNewMessageCompany') THEN RETURN NEW; END IF;
    SELECT EXISTS (SELECT 1 FROM public.notifications n JOIN public.company_users cu ON n.user_id = cu.profile_id WHERE cu.company_id = v_conv.company_id AND n.type = 'new_message' AND n.read = false AND n.created_at > NOW() - INTERVAL '5 minutes' AND n.metadata->>'candidateId' = v_conv.candidate_id::TEXT) INTO v_has_recent;
    IF NOT v_has_recent THEN
      PERFORM public.notify_company_users(v_conv.company_id, 'new_message', 'Nova mensagem de ' || COALESCE(v_conv.candidate_name, 'Candidato'), LEFT(NEW.content, 100), '/empresa/mensagens',
        jsonb_build_object('candidateId', v_conv.candidate_id, 'candidateName', v_conv.candidate_name, 'messagePreview', LEFT(NEW.content, 100)));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. New application (empresa)
CREATE OR REPLACE FUNCTION public.trg_notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_candidate_name TEXT; v_job_title TEXT; v_company_id UUID;
BEGIN
  IF NOT public.is_notification_enabled('triggerNewApplication') THEN RETURN NEW; END IF;
  SELECT name INTO v_candidate_name FROM public.candidates WHERE id = NEW.candidate_id;
  SELECT title, company_id INTO v_job_title, v_company_id FROM public.jobs WHERE id = NEW.job_id;
  IF v_candidate_name IS NULL OR v_job_title IS NULL OR v_company_id IS NULL THEN RETURN NEW; END IF;

  PERFORM public.notify_company_users(v_company_id, 'new_application', 'Nova candidatura recebida',
    v_candidate_name || ' se candidatou para a vaga de ' || v_job_title, '/empresa/candidatos',
    jsonb_build_object('candidateId', NEW.candidate_id, 'candidateName', v_candidate_name, 'jobId', NEW.job_id, 'jobTitle', v_job_title, 'applicationId', NEW.id));
  RETURN NEW;
END;
$$;

-- 5. Test completed (empresa)
CREATE OR REPLACE FUNCTION public.trg_notify_test_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_candidate_name TEXT; v_job_title TEXT;
BEGIN
  IF NOT public.is_notification_enabled('triggerTestCompleted') THEN RETURN NEW; END IF;
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.status != 'completed' THEN RETURN NEW; END IF;
  IF NEW.company_id IS NULL THEN RETURN NEW; END IF;

  SELECT name INTO v_candidate_name FROM public.candidates WHERE id = NEW.candidate_id;
  IF v_candidate_name IS NULL THEN RETURN NEW; END IF;
  IF NEW.job_id IS NOT NULL THEN SELECT title INTO v_job_title FROM public.jobs WHERE id = NEW.job_id; END IF;

  PERFORM public.notify_company_users(NEW.company_id, 'test_completed', 'Teste comportamental concluído',
    v_candidate_name || ' completou o teste comportamental' || CASE WHEN v_job_title IS NOT NULL THEN ' para a vaga de ' || v_job_title ELSE '' END,
    '/empresa/testes', jsonb_build_object('candidateId', NEW.candidate_id, 'candidateName', v_candidate_name, 'jobId', NEW.job_id, 'jobTitle', v_job_title));
  RETURN NEW;
END;
$$;

-- 6. Interview status (empresa)
CREATE OR REPLACE FUNCTION public.trg_notify_interview_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_candidate_name TEXT; v_job_title TEXT; v_notif_type TEXT; v_title_text TEXT; v_description TEXT;
BEGIN
  IF NOT public.is_notification_enabled('triggerInterviewStatus') THEN RETURN NEW; END IF;
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;

  SELECT name INTO v_candidate_name FROM public.candidates WHERE id = NEW.candidate_id;
  IF v_candidate_name IS NULL THEN RETURN NEW; END IF;
  v_job_title := COALESCE((SELECT title FROM public.jobs WHERE id = NEW.job_id), NEW.title, 'a vaga');

  CASE NEW.status
    WHEN 'confirmed' THEN v_notif_type := 'interview_confirmed'; v_title_text := 'Entrevista confirmada'; v_description := v_candidate_name || ' confirmou a entrevista para ' || v_job_title;
    WHEN 'suggestion_sent' THEN v_notif_type := 'interview_suggested'; v_title_text := 'Novo horário sugerido'; v_description := v_candidate_name || ' sugeriu um novo horário para a entrevista de ' || v_job_title;
    WHEN 'cancelled' THEN v_notif_type := 'interview_cancelled'; v_title_text := 'Entrevista cancelada'; v_description := 'A entrevista com ' || v_candidate_name || ' para ' || v_job_title || ' foi cancelada';
    ELSE RETURN NEW;
  END CASE;

  PERFORM public.notify_company_users(NEW.company_id, v_notif_type, v_title_text, v_description, '/empresa/candidatos',
    jsonb_build_object('candidateId', NEW.candidate_id, 'candidateName', v_candidate_name, 'jobId', NEW.job_id, 'jobTitle', v_job_title, 'interviewDate', NEW.confirmed_datetime));
  RETURN NEW;
END;
$$;

-- 7. Interview created (candidato)
CREATE OR REPLACE FUNCTION public.trg_notify_interview_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_job_title TEXT; v_company_name TEXT;
BEGIN
  IF NOT public.is_notification_enabled('triggerInterviewCreated') THEN RETURN NEW; END IF;
  SELECT j.title, c.name INTO v_job_title, v_company_name FROM public.jobs j JOIN public.companies c ON j.company_id = c.id WHERE j.id = NEW.job_id;
  IF v_job_title IS NULL OR v_company_name IS NULL THEN RETURN NEW; END IF;

  PERFORM public.notify_candidate(NEW.candidate_id, 'application_update', 'Convite para entrevista',
    v_company_name || ' convidou você para uma entrevista para a vaga de ' || v_job_title, '/candidato/candidaturas',
    jsonb_build_object('jobId', NEW.job_id, 'jobTitle', v_job_title, 'companyName', v_company_name, 'companyId', NEW.company_id, 'newStage', 'interview'));
  RETURN NEW;
END;
$$;

-- 8. Job match (candidato)
CREATE OR REPLACE FUNCTION public.trg_notify_job_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_company_name TEXT; v_display_name TEXT; r_candidate RECORD;
BEGIN
  IF NOT public.is_notification_enabled('triggerJobMatch') THEN RETURN NEW; END IF;
  IF NEW.moderation_status != 'approved' THEN RETURN NEW; END IF;
  IF OLD.moderation_status = 'approved' THEN RETURN NEW; END IF;
  IF NEW.status != 'active' THEN RETURN NEW; END IF;

  SELECT name INTO v_company_name FROM public.companies WHERE id = NEW.company_id;
  IF NEW.is_anonymous THEN v_display_name := 'Empresa Confidencial'; ELSE v_display_name := COALESCE(v_company_name, 'Empresa'); END IF;

  FOR r_candidate IN
    SELECT c.id AS candidate_id, c.profile_id FROM public.candidates c JOIN public.profiles p ON p.id = c.profile_id
    WHERE p.type = 'candidate' AND p.status = 'active' AND c.status = 'active'
      AND NOT EXISTS (SELECT 1 FROM public.applications a WHERE a.candidate_id = c.id AND a.job_id = NEW.id)
      AND (c.preferred_sectors = '{}' OR c.preferred_sectors IS NULL OR NEW.area = ANY(c.preferred_sectors))
      AND (c.work_model = '{}' OR c.work_model IS NULL OR NEW.type = ANY(c.work_model))
      AND (c.salary_min IS NULL OR NEW.salary_max IS NULL OR c.salary_min <= NEW.salary_max)
      AND (c.salary_max IS NULL OR NEW.salary_min IS NULL OR c.salary_max >= NEW.salary_min)
    ORDER BY c.updated_at DESC NULLS LAST LIMIT 50
  LOOP
    INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
    VALUES (r_candidate.profile_id, 'job_match', 'Nova vaga compatível com seu perfil',
      v_display_name || ' publicou a vaga de ' || NEW.title || '. Confira!', '/candidato/vagas',
      jsonb_build_object('jobId', NEW.id, 'jobTitle', NEW.title, 'companyName', CASE WHEN NEW.is_anonymous THEN NULL ELSE v_company_name END, 'companyId', NEW.company_id));
  END LOOP;
  RETURN NEW;
END;
$$;

-- 9. Admin new user
CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_notification_enabled('triggerAdminNewUser') THEN RETURN NEW; END IF;
  IF NEW.type = 'admin' THEN RETURN NEW; END IF;

  IF NEW.type = 'company' THEN
    PERFORM public.notify_admins('new_company', 'Nova empresa cadastrada',
      'A empresa ' || COALESCE(NEW.name, 'Sem nome') || ' se cadastrou na plataforma', '/admin/empresas',
      jsonb_build_object('userId', NEW.id, 'userName', NEW.name, 'userEmail', NEW.email, 'userType', 'company'));
  ELSIF NEW.type = 'candidate' THEN
    PERFORM public.notify_admins('new_candidate', 'Novo candidato cadastrado',
      COALESCE(NEW.name, 'Novo candidato') || ' se cadastrou na plataforma', '/admin/candidatos',
      jsonb_build_object('userId', NEW.id, 'userName', NEW.name, 'userEmail', NEW.email, 'userType', 'candidate'));
  END IF;
  RETURN NEW;
END;
$$;

-- 10. Admin job pending
CREATE OR REPLACE FUNCTION public.trg_notify_admin_job_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_company_name TEXT;
BEGIN
  IF NOT public.is_notification_enabled('triggerAdminJobPending') THEN RETURN NEW; END IF;
  IF NEW.moderation_status != 'pending' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.moderation_status = 'pending' THEN RETURN NEW; END IF;

  SELECT name INTO v_company_name FROM public.companies WHERE id = NEW.company_id;
  PERFORM public.notify_admins('job_pending_moderation', 'Vaga aguardando aprovação',
    COALESCE(v_company_name, 'Empresa') || ' publicou a vaga "' || NEW.title || '" para moderação', '/admin/vagas',
    jsonb_build_object('jobId', NEW.id, 'jobTitle', NEW.title, 'companyName', v_company_name));
  RETURN NEW;
END;
$$;

-- 11. Admin new ticket
CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user_name TEXT;
BEGIN
  IF NOT public.is_notification_enabled('triggerAdminTicket') THEN RETURN NEW; END IF;
  SELECT name INTO v_user_name FROM public.profiles WHERE id = NEW.user_id;
  PERFORM public.notify_admins('new_ticket', 'Novo ticket de suporte',
    COALESCE(v_user_name, 'Usuário') || ' abriu o ticket: ' || NEW.subject, '/admin/helpdesk',
    jsonb_build_object('ticketId', NEW.id, 'ticketSubject', NEW.subject, 'ticketPriority', NEW.priority, 'ticketNumber', NEW.number, 'userName', v_user_name));
  RETURN NEW;
END;
$$;

-- 12. Admin ticket reply
CREATE OR REPLACE FUNCTION public.trg_notify_admin_ticket_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_ticket RECORD; v_sender_name TEXT; v_has_recent BOOLEAN;
BEGIN
  IF NOT public.is_notification_enabled('triggerAdminTicket') THEN RETURN NEW; END IF;
  IF NEW.sender_type = 'admin' OR NEW.sender_type = 'system' THEN RETURN NEW; END IF;

  SELECT id, subject, number INTO v_ticket FROM public.tickets WHERE id = NEW.ticket_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  SELECT name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

  SELECT EXISTS (SELECT 1 FROM public.notifications WHERE type = 'ticket_reply' AND read = false AND created_at > NOW() - INTERVAL '5 minutes' AND metadata->>'ticketId' = v_ticket.id::TEXT AND user_id IN (SELECT p.id FROM public.profiles p WHERE p.type = 'admin') LIMIT 1) INTO v_has_recent;
  IF v_has_recent THEN RETURN NEW; END IF;

  PERFORM public.notify_admins('ticket_reply', 'Nova resposta no ticket',
    COALESCE(v_sender_name, 'Usuário') || ' respondeu no ticket: ' || v_ticket.subject, '/admin/helpdesk',
    jsonb_build_object('ticketId', v_ticket.id, 'ticketSubject', v_ticket.subject, 'ticketNumber', v_ticket.number, 'userName', v_sender_name));
  RETURN NEW;
END;
$$;
