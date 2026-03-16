-- =====================================================
-- RecrutaRS: Notification Sends (Admin Management)
-- Central de gerenciamento de notificacoes manuais
-- =====================================================

-- =====================================================
-- TABLE: notification_sends
-- Historico de notificacoes enviadas manualmente por admins
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notification_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_url TEXT,
  category TEXT NOT NULL DEFAULT 'informativo'
    CHECK (category IN ('informativo', 'operacional', 'alerta')),
  priority TEXT NOT NULL DEFAULT 'media'
    CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  target_type TEXT NOT NULL
    CHECK (target_type IN ('all_users', 'all_candidates', 'all_companies', 'specific_user')),
  target_user_id UUID REFERENCES public.profiles(id),
  target_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  read_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('draft', 'scheduled', 'sent', 'failed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_by UUID NOT NULL REFERENCES public.profiles(id),
  template_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_sends_status
  ON public.notification_sends(status);
CREATE INDEX IF NOT EXISTS idx_notification_sends_sent_by
  ON public.notification_sends(sent_by);
CREATE INDEX IF NOT EXISTS idx_notification_sends_created_at
  ON public.notification_sends(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_sends_category
  ON public.notification_sends(category);

-- =====================================================
-- RLS: Only admins can access notification_sends
-- =====================================================

ALTER TABLE public.notification_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_sends_admin_select"
  ON public.notification_sends FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "notification_sends_admin_insert"
  ON public.notification_sends FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "notification_sends_admin_update"
  ON public.notification_sends FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "notification_sends_admin_delete"
  ON public.notification_sends FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- =====================================================
-- RPC: send_manual_notification
-- Envia notificacao manual para usuarios/grupos
-- =====================================================

CREATE OR REPLACE FUNCTION public.send_manual_notification(
  p_title TEXT,
  p_description TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_category TEXT DEFAULT 'informativo',
  p_priority TEXT DEFAULT 'media',
  p_target_type TEXT DEFAULT 'all_users',
  p_target_user_id UUID DEFAULT NULL,
  p_scheduled_at TIMESTAMPTZ DEFAULT NULL,
  p_template_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_send_id UUID;
  v_sender_id UUID;
  v_target_count INTEGER := 0;
  v_status TEXT;
  v_notif_type TEXT := 'system_notification';
BEGIN
  v_sender_id := auth.uid();

  -- Check admin permission
  IF public.get_user_type(v_sender_id) != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Determine status
  IF p_scheduled_at IS NOT NULL AND p_scheduled_at > NOW() THEN
    v_status := 'scheduled';
  ELSE
    v_status := 'sent';
  END IF;

  -- Create send record
  INSERT INTO public.notification_sends (
    title, description, action_url, category, priority,
    target_type, target_user_id, status, scheduled_at,
    sent_at, sent_by, template_id
  ) VALUES (
    p_title, p_description, p_action_url, p_category, p_priority,
    p_target_type, p_target_user_id, v_status, p_scheduled_at,
    CASE WHEN v_status = 'sent' THEN NOW() ELSE NULL END,
    v_sender_id, p_template_id
  ) RETURNING id INTO v_send_id;

  -- If scheduled, don't send now
  IF v_status = 'scheduled' THEN
    RETURN jsonb_build_object(
      'success', true,
      'sendId', v_send_id,
      'status', 'scheduled',
      'scheduledAt', p_scheduled_at
    );
  END IF;

  -- Send notifications based on target type
  IF p_target_type = 'specific_user' AND p_target_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
    VALUES (
      p_target_user_id, v_notif_type, p_title, p_description, p_action_url,
      jsonb_build_object('sendId', v_send_id, 'category', p_category, 'priority', p_priority)
    );
    v_target_count := 1;

  ELSIF p_target_type = 'all_candidates' THEN
    INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
    SELECT p.id, v_notif_type, p_title, p_description, p_action_url,
      jsonb_build_object('sendId', v_send_id, 'category', p_category, 'priority', p_priority)
    FROM public.profiles p
    WHERE p.type = 'candidate' AND p.status = 'active';
    GET DIAGNOSTICS v_target_count = ROW_COUNT;

  ELSIF p_target_type = 'all_companies' THEN
    INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
    SELECT p.id, v_notif_type, p_title, p_description, p_action_url,
      jsonb_build_object('sendId', v_send_id, 'category', p_category, 'priority', p_priority)
    FROM public.profiles p
    WHERE p.type = 'company' AND p.status = 'active';
    GET DIAGNOSTICS v_target_count = ROW_COUNT;

  ELSIF p_target_type = 'all_users' THEN
    INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
    SELECT p.id, v_notif_type, p_title, p_description, p_action_url,
      jsonb_build_object('sendId', v_send_id, 'category', p_category, 'priority', p_priority)
    FROM public.profiles p
    WHERE p.type IN ('candidate', 'company') AND p.status = 'active';
    GET DIAGNOSTICS v_target_count = ROW_COUNT;
  END IF;

  -- Update counts
  UPDATE public.notification_sends
  SET target_count = v_target_count,
      delivered_count = v_target_count
  WHERE id = v_send_id;

  RETURN jsonb_build_object(
    'success', true,
    'sendId', v_send_id,
    'status', 'sent',
    'targetCount', v_target_count
  );
END;
$$;

COMMENT ON FUNCTION public.send_manual_notification IS
  'Envia notificacao manual para usuarios/grupos. Apenas admins.';

COMMENT ON TABLE public.notification_sends IS
  'Historico de notificacoes manuais enviadas por admins com metricas de entrega';
