-- =====================================================
-- RecrutaRS: WhatsApp Integration (Evolution API)
-- Templates, mensagens e funcao de candidatos pendentes
-- =====================================================

-- =====================================================
-- TABLE: whatsapp_templates
-- Templates reutilizaveis para mensagens WhatsApp
-- =====================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  message_text TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('convite', 'lembrete', 'informativo', 'operacional')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.whatsapp_templates IS
  'Templates reutilizaveis para envio de mensagens WhatsApp via Evolution API. Suporta variaveis: {{nome}}, {{link}}, {{empresa}}, {{vaga}}.';

-- =====================================================
-- RLS: whatsapp_templates (admin-only)
-- =====================================================

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_templates_admin_select"
  ON public.whatsapp_templates FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "whatsapp_templates_admin_insert"
  ON public.whatsapp_templates FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "whatsapp_templates_admin_update"
  ON public.whatsapp_templates FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "whatsapp_templates_admin_delete"
  ON public.whatsapp_templates FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- =====================================================
-- TABLE: whatsapp_messages
-- Historico de mensagens WhatsApp enviadas
-- =====================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_send_id UUID REFERENCES public.notification_sends(id) ON DELETE SET NULL,
  campaign_id UUID,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  recipient_type TEXT
    CHECK (recipient_type IN ('candidate', 'company')),
  recipient_id UUID,
  message_text TEXT NOT NULL,
  template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  whatsapp_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'failed')),
  error_message TEXT,
  sent_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.whatsapp_messages IS
  'Historico de mensagens WhatsApp enviadas via Evolution API. Vincula a notification_sends e campanhas em massa.';

-- =====================================================
-- INDEXES: whatsapp_messages
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_recipient_phone
  ON public.whatsapp_messages(recipient_phone);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_campaign_id
  ON public.whatsapp_messages(campaign_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status
  ON public.whatsapp_messages(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at
  ON public.whatsapp_messages(created_at DESC);

-- =====================================================
-- RLS: whatsapp_messages (admin-only)
-- =====================================================

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_messages_admin_select"
  ON public.whatsapp_messages FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "whatsapp_messages_admin_insert"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "whatsapp_messages_admin_update"
  ON public.whatsapp_messages FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- =====================================================
-- ALTER TABLE: notification_sends
-- Adiciona coluna channel para distinguir canal de envio
-- =====================================================

ALTER TABLE public.notification_sends
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'in_app'
    CHECK (channel IN ('in_app', 'whatsapp', 'both'));

COMMENT ON COLUMN public.notification_sends.channel IS
  'Canal de envio: in_app (notificacao interna), whatsapp (via Evolution API), both (ambos).';

-- =====================================================
-- RPC: get_pending_gauge_pro_candidates
-- Retorna candidatos ativos com telefone que ainda nao
-- completaram o teste Gauge-Pro
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_pending_gauge_pro_candidates()
RETURNS TABLE (
  id UUID,
  profile_id UUID,
  name TEXT,
  phone TEXT,
  email TEXT,
  onboarding_step TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.profile_id, c.name, c.phone, p.email, c.onboarding_step, c.created_at
  FROM public.candidates c
  JOIN public.profiles p ON p.id = c.profile_id
  WHERE c.status = 'active'
    AND c.phone IS NOT NULL
    AND (c.onboarding_step != 'completed' OR c.has_test = false)
  ORDER BY c.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_pending_gauge_pro_candidates() TO authenticated;

COMMENT ON FUNCTION public.get_pending_gauge_pro_candidates() IS
  'Retorna candidatos ativos com telefone que nao completaram o teste Gauge-Pro. Usado para campanhas WhatsApp de convite.';

-- =====================================================
-- SEED: Template padrao "Convite Teste Gauge-Pro"
-- =====================================================

INSERT INTO public.whatsapp_templates (name, description, message_text, category, is_active)
VALUES (
  'Convite Teste Gauge-Pro',
  'Convite para candidatos realizarem o teste comportamental Gauge-Pro',
  E'Olá {{nome}}! 👋\n\nVocê foi convidado(a) a realizar o teste comportamental Gauge-Pro na plataforma RecrutaRS.\n\nO teste leva apenas alguns minutos e é essencial para completar seu perfil.\n\nAcesse aqui: {{link}}\n\nEquipe RecrutaRS',
  'convite',
  true
)
ON CONFLICT DO NOTHING;
