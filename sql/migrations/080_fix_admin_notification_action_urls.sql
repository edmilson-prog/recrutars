-- =====================================================
-- RecrutaRS: Fix admin notification action_url deep links
-- Problem: triggers used profile_id but routes need
-- candidate_id / company_id from their respective tables
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 079_get_or_create_conversation_rpc.sql
-- =====================================================

-- =====================================================
-- STEP 1: Remove candidate/company notifications from
-- trg_notify_admin_new_user (fires on profiles INSERT
-- where only profile_id is available, not candidate_id)
-- Now this trigger does nothing — kept as no-op to avoid
-- DROP TRIGGER issues
-- =====================================================

CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notifications moved to trg_notify_admin_new_candidate
  -- and trg_notify_admin_new_company (fire on their respective tables
  -- where we have the correct entity ID for deep-linking)
  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 2: New trigger on candidates INSERT
-- Has access to NEW.id (candidate_id) for correct URL
-- =====================================================

CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_candidate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT name, email INTO v_profile
  FROM public.profiles WHERE id = NEW.profile_id;

  IF v_profile.name IS NULL THEN RETURN NEW; END IF;

  PERFORM public.notify_admins(
    'new_candidate',
    'Novo candidato cadastrado',
    COALESCE(v_profile.name, 'Novo candidato') || ' se cadastrou na plataforma',
    '/admin/candidatos/' || NEW.id::TEXT,
    jsonb_build_object(
      'userId', NEW.profile_id,
      'candidateId', NEW.id,
      'userName', v_profile.name,
      'userEmail', v_profile.email,
      'userType', 'candidate'
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_new_candidate ON public.candidates;
CREATE TRIGGER trg_notify_admin_new_candidate
  AFTER INSERT ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_admin_new_candidate();

COMMENT ON FUNCTION public.trg_notify_admin_new_candidate() IS
  'Notifica admins quando novo candidato é cadastrado (usa candidate_id para deep-link)';

-- =====================================================
-- STEP 3: New trigger on companies INSERT
-- Has access to NEW.id (company_id) for correct URL
-- =====================================================

CREATE OR REPLACE FUNCTION public.trg_notify_admin_new_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT name, email INTO v_profile
  FROM public.profiles WHERE id = NEW.profile_id;

  IF v_profile.name IS NULL THEN RETURN NEW; END IF;

  PERFORM public.notify_admins(
    'new_company',
    'Nova empresa cadastrada',
    'A empresa ' || COALESCE(v_profile.name, 'Sem nome') || ' se cadastrou na plataforma',
    '/admin/empresas/' || NEW.id::TEXT,
    jsonb_build_object(
      'userId', NEW.profile_id,
      'companyId', NEW.id,
      'userName', v_profile.name,
      'userEmail', v_profile.email,
      'userType', 'company'
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_new_company ON public.companies;
CREATE TRIGGER trg_notify_admin_new_company
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_admin_new_company();

COMMENT ON FUNCTION public.trg_notify_admin_new_company() IS
  'Notifica admins quando nova empresa é cadastrada (usa company_id para deep-link)';

-- =====================================================
-- STEP 4: Fix Gauge-Pro completion trigger
-- Use NEW.candidate_id (candidates.id) instead of
-- v_profile_id (profiles.id) in action_url
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

  FOR v_app IN
    SELECT a.job_id, j.title AS job_title, j.company_id
    FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE a.candidate_id = NEW.candidate_id
      AND a.test_status = 'pending'
  LOOP
    v_has_company_request := TRUE;

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

    UPDATE public.applications
    SET test_status = 'completed'
    WHERE candidate_id = NEW.candidate_id
      AND job_id = v_app.job_id
      AND test_status = 'pending';
  END LOOP;

  -- Use NEW.candidate_id (candidates.id) for correct deep-link
  PERFORM public.notify_admins(
    'new_candidate',
    CASE WHEN v_has_company_request
      THEN 'Teste Gauge-Pro concluído (solicitado)'
      ELSE 'Teste Gauge-Pro concluído (onboarding)'
    END,
    v_candidate_name || ' completou o teste comportamental Gauge-Pro'
      || CASE WHEN v_has_company_request THEN ' (solicitado por empresa)' ELSE ' (onboarding)' END,
    '/admin/candidatos/' || NEW.candidate_id::TEXT,
    jsonb_build_object(
      'userId', v_profile_id,
      'candidateId', NEW.candidate_id,
      'userName', v_candidate_name,
      'userType', 'candidate',
      'archetype', v_archetype
    )
  );

  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 5: Fix remaining admin triggers (job, ticket)
-- These were already correct but updating for consistency
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
  IF NEW.moderation_status != 'pending' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.moderation_status = 'pending' THEN RETURN NEW; END IF;

  SELECT name INTO v_company_name FROM public.companies WHERE id = NEW.company_id;

  PERFORM public.notify_admins(
    'job_pending_moderation',
    'Vaga aguardando aprovação',
    COALESCE(v_company_name, 'Empresa') || ' publicou a vaga "' || NEW.title || '" para moderação',
    '/admin/vagas/' || NEW.id::TEXT,
    jsonb_build_object(
      'jobId', NEW.id,
      'jobTitle', NEW.title,
      'companyName', v_company_name
    )
  );

  RETURN NEW;
END;
$$;

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
    '/admin/helpdesk/tickets/' || NEW.id::TEXT,
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
  IF NEW.sender_type = 'admin' OR NEW.sender_type = 'system' THEN RETURN NEW; END IF;

  SELECT id, subject, number INTO v_ticket
  FROM public.tickets WHERE id = NEW.ticket_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  SELECT name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

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
    '/admin/helpdesk/tickets/' || v_ticket.id::TEXT,
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

-- =====================================================
-- STEP 6: BACKFILL existing notifications
-- Resolve profile_id -> candidate_id / company_id
-- =====================================================

-- Fix candidate notifications: resolve profile_id to candidate_id
UPDATE public.notifications n
SET action_url = '/admin/candidatos/' || c.id::TEXT,
    metadata = n.metadata || jsonb_build_object('candidateId', c.id)
FROM public.candidates c
WHERE n.type = 'new_candidate'
  AND n.metadata->>'userId' IS NOT NULL
  AND c.profile_id = (n.metadata->>'userId')::UUID
  AND n.action_url NOT LIKE '/admin/candidatos/' || c.id::TEXT;

-- Fix company notifications: resolve profile_id to company_id
UPDATE public.notifications n
SET action_url = '/admin/empresas/' || c.id::TEXT,
    metadata = n.metadata || jsonb_build_object('companyId', c.id)
FROM public.companies c
WHERE n.type = 'new_company'
  AND n.metadata->>'userId' IS NOT NULL
  AND c.profile_id = (n.metadata->>'userId')::UUID
  AND n.action_url NOT LIKE '/admin/empresas/' || c.id::TEXT;

-- Fix job moderation notifications (already had correct jobId)
UPDATE public.notifications
SET action_url = '/admin/vagas/' || (metadata->>'jobId')
WHERE type = 'job_pending_moderation'
  AND metadata->>'jobId' IS NOT NULL
  AND action_url = '/admin/vagas';

-- Fix ticket notifications (already had correct ticketId)
UPDATE public.notifications
SET action_url = '/admin/helpdesk/tickets/' || (metadata->>'ticketId')
WHERE type IN ('new_ticket', 'ticket_reply')
  AND metadata->>'ticketId' IS NOT NULL
  AND action_url = '/admin/helpdesk';
