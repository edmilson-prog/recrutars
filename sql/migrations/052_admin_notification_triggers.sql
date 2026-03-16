-- =====================================================
-- RecrutaRS: Admin Notification Triggers
-- Notificacoes automaticas para administradores
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 051_notification_triggers.sql
-- =====================================================

-- =====================================================
-- HELPER: notify_admins
-- Insere 1 notificacao por perfil admin ativo
-- =====================================================

CREATE OR REPLACE FUNCTION public.notify_admins(
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
  SELECT p.id, p_type, p_title, p_description, p_action_url, p_metadata
  FROM public.profiles p
  WHERE p.type = 'admin'
    AND p.status = 'active';
END;
$$;

COMMENT ON FUNCTION public.notify_admins(TEXT, TEXT, TEXT, TEXT, JSONB) IS
  'Insere uma notificacao para cada admin ativo da plataforma';

-- =====================================================
-- TRIGGER 1: New user registered -> notify admins
-- Fires on profiles INSERT (separate from handle_new_user)
-- =====================================================

CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify for company and candidate registrations
  IF NEW.type = 'admin' THEN RETURN NEW; END IF;

  IF NEW.type = 'company' THEN
    PERFORM public.notify_admins(
      'new_company',
      'Nova empresa cadastrada',
      'A empresa ' || COALESCE(NEW.name, 'Sem nome') || ' se cadastrou na plataforma',
      '/admin/empresas',
      jsonb_build_object(
        'userId', NEW.id,
        'userName', NEW.name,
        'userEmail', NEW.email,
        'userType', 'company'
      )
    );
  ELSIF NEW.type = 'candidate' THEN
    PERFORM public.notify_admins(
      'new_candidate',
      'Novo candidato cadastrado',
      COALESCE(NEW.name, 'Novo candidato') || ' se cadastrou na plataforma',
      '/admin/candidatos',
      jsonb_build_object(
        'userId', NEW.id,
        'userName', NEW.name,
        'userEmail', NEW.email,
        'userType', 'candidate'
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_new_user ON public.profiles;
CREATE TRIGGER trg_notify_admin_new_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_admin_new_user();

COMMENT ON FUNCTION public.trg_notify_admin_new_user() IS
  'Notifica admins quando nova empresa ou candidato se cadastra';

-- =====================================================
-- TRIGGER 2: Job pending moderation -> notify admins
-- =====================================================

CREATE OR REPLACE FUNCTION public.trg_notify_admin_job_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_name TEXT;
BEGIN
  -- Only when moderation_status becomes pending
  IF NEW.moderation_status != 'pending' THEN RETURN NEW; END IF;

  -- For UPDATE, skip if was already pending
  IF TG_OP = 'UPDATE' AND OLD.moderation_status = 'pending' THEN RETURN NEW; END IF;

  SELECT name INTO v_company_name FROM public.companies WHERE id = NEW.company_id;

  PERFORM public.notify_admins(
    'job_pending_moderation',
    'Vaga aguardando aprovação',
    COALESCE(v_company_name, 'Empresa') || ' publicou a vaga "' || NEW.title || '" para moderação',
    '/admin/vagas',
    jsonb_build_object(
      'jobId', NEW.id,
      'jobTitle', NEW.title,
      'companyName', v_company_name
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_job_pending ON public.jobs;
CREATE TRIGGER trg_notify_admin_job_pending
  AFTER INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_admin_job_pending();

COMMENT ON FUNCTION public.trg_notify_admin_job_pending() IS
  'Notifica admins quando vaga e submetida para moderacao';

-- =====================================================
-- TRIGGER 3: New ticket -> notify admins
-- =====================================================

CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT name INTO v_user_name FROM public.profiles WHERE id = NEW.user_id;

  PERFORM public.notify_admins(
    'new_ticket',
    'Novo ticket de suporte',
    COALESCE(v_user_name, 'Usuário') || ' abriu o ticket: ' || NEW.subject,
    '/admin/helpdesk',
    jsonb_build_object(
      'ticketId', NEW.id,
      'ticketSubject', NEW.subject,
      'ticketPriority', NEW.priority,
      'ticketNumber', NEW.number,
      'userName', v_user_name
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_new_ticket ON public.tickets;
CREATE TRIGGER trg_notify_admin_new_ticket
  AFTER INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_admin_new_ticket();

COMMENT ON FUNCTION public.trg_notify_admin_new_ticket() IS
  'Notifica admins quando novo ticket de suporte e criado';

-- =====================================================
-- TRIGGER 4: Ticket reply from user -> notify admins
-- (with 5-min dedup per ticket)
-- =====================================================

CREATE OR REPLACE FUNCTION public.trg_notify_admin_ticket_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket RECORD;
  v_sender_name TEXT;
  v_has_recent BOOLEAN;
BEGIN
  -- Only notify for non-admin messages
  IF NEW.sender_type = 'admin' OR NEW.sender_type = 'system' THEN RETURN NEW; END IF;

  -- Get ticket info
  SELECT id, subject, number INTO v_ticket
  FROM public.tickets WHERE id = NEW.ticket_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Get sender name
  SELECT name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

  -- Dedup: check if there's an unread admin notification for this ticket in last 5 min
  SELECT EXISTS (
    SELECT 1 FROM public.notifications
    WHERE type = 'ticket_reply'
      AND read = false
      AND created_at > NOW() - INTERVAL '5 minutes'
      AND metadata->>'ticketId' = v_ticket.id::TEXT
      AND user_id IN (SELECT p.id FROM public.profiles p WHERE p.type = 'admin')
    LIMIT 1
  ) INTO v_has_recent;

  IF v_has_recent THEN RETURN NEW; END IF;

  PERFORM public.notify_admins(
    'ticket_reply',
    'Nova resposta no ticket',
    COALESCE(v_sender_name, 'Usuário') || ' respondeu no ticket: ' || v_ticket.subject,
    '/admin/helpdesk',
    jsonb_build_object(
      'ticketId', v_ticket.id,
      'ticketSubject', v_ticket.subject,
      'ticketNumber', v_ticket.number,
      'userName', v_sender_name
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_ticket_reply ON public.ticket_messages;
CREATE TRIGGER trg_notify_admin_ticket_reply
  AFTER INSERT ON public.ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_admin_ticket_reply();

COMMENT ON FUNCTION public.trg_notify_admin_ticket_reply() IS
  'Notifica admins quando usuario responde em ticket (com dedup de 5min)';
