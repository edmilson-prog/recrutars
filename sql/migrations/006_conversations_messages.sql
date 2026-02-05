-- =====================================================
-- RecrutaRS: Conversations & Messages
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 005_applications.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: conversations
-- A conversation thread between a candidate and a company,
-- optionally linked to a specific job.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Functional unique index: one conversation per candidate+company+job
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_participants
  ON public.conversations (candidate_id, company_id, COALESCE(job_id, '00000000-0000-0000-0000-000000000000'::UUID));

CREATE INDEX IF NOT EXISTS idx_conversations_candidate_id ON public.conversations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_conversations_company_id ON public.conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- =====================================================
-- TABLE: messages
-- Individual messages within a conversation.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('candidate', 'company', 'admin', 'system')),
  content TEXT NOT NULL,
  subject TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'system', 'notification', 'interview_invite', 'test_request')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read) WHERE read = FALSE;

-- =====================================================
-- FUNCTION + TRIGGER: update_conversation_on_message
-- Updates conversation.updated_at when a new message
-- is inserted.
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_conversation_on_message ON public.messages;
CREATE TRIGGER trg_update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

COMMENT ON FUNCTION public.update_conversation_on_message() IS 'Updates conversation.updated_at when a new message is inserted (PRD-064)';

-- =====================================================
-- TRIGGER: Auto-update updated_at for conversations
-- =====================================================

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ----- conversations -----

-- Candidate: can read own conversations
CREATE POLICY "conversations_select_candidate"
  ON public.conversations FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can read own conversations
CREATE POLICY "conversations_select_company"
  ON public.conversations FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

-- Admin: can read all conversations
CREATE POLICY "conversations_select_admin"
  ON public.conversations FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Candidate: can create conversations
CREATE POLICY "conversations_insert_candidate"
  ON public.conversations FOR INSERT
  WITH CHECK (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can create conversations
CREATE POLICY "conversations_insert_company"
  ON public.conversations FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

-- ----- messages -----

-- Participants: can read messages in their conversations
CREATE POLICY "messages_select_candidate"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE candidate_id = public.get_candidate_id(auth.uid())
    )
  );

CREATE POLICY "messages_select_company"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE company_id = public.get_company_id(auth.uid())
    )
  );

-- Admin: can read all messages
CREATE POLICY "messages_select_admin"
  ON public.messages FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Participants: can send messages in their conversations
CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT id FROM public.conversations
      WHERE candidate_id = public.get_candidate_id(auth.uid())
         OR company_id = public.get_company_id(auth.uid())
    )
  );

-- Admin: can send messages in any conversation
CREATE POLICY "messages_insert_admin"
  ON public.messages FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- Participants: can update messages (mark as read)
CREATE POLICY "messages_update_participant"
  ON public.messages FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE candidate_id = public.get_candidate_id(auth.uid())
         OR company_id = public.get_company_id(auth.uid())
    )
  );

COMMENT ON TABLE public.conversations IS 'Conversation threads between candidates and companies, optionally linked to jobs (PRD-064)';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations (PRD-064)';
