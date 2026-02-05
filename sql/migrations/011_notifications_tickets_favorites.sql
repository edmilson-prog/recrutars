-- =====================================================
-- RecrutaRS: Notifications, Tickets & Favorites
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 010_team_management.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: notifications
-- In-app notifications for users.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  action_url TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =====================================================
-- TABLE: tickets
-- Support tickets from users.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general', 'technical', 'billing', 'account', 'feedback', 'bug')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

-- =====================================================
-- TABLE: ticket_messages
-- Messages within a support ticket thread.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  sender_type TEXT NOT NULL DEFAULT 'user'
    CHECK (sender_type IN ('user', 'admin', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);

-- =====================================================
-- TABLE: favorites
-- User favorites (saved jobs, candidates, etc.).
-- Unique constraint prevents duplicate favorites.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One favorite per user per resource
  CONSTRAINT favorites_unique_resource UNIQUE (user_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_resource ON public.favorites(resource_type, resource_id);

-- =====================================================
-- TRIGGERS: Auto-update updated_at for tickets
-- =====================================================

DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ----- notifications -----

-- User: can read own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Admin: can read all notifications
CREATE POLICY "notifications_select_admin"
  ON public.notifications FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- System/Admin: can create notifications for any user
CREATE POLICY "notifications_insert"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- User: can update own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- User: can delete own notifications
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- ----- tickets -----

-- User: can read own tickets
CREATE POLICY "tickets_select_own"
  ON public.tickets FOR SELECT
  USING (user_id = auth.uid());

-- Admin: can read all tickets
CREATE POLICY "tickets_select_admin"
  ON public.tickets FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- User: can create tickets
CREATE POLICY "tickets_insert_own"
  ON public.tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- User: can update own tickets
CREATE POLICY "tickets_update_own"
  ON public.tickets FOR UPDATE
  USING (user_id = auth.uid());

-- Admin: can update any ticket
CREATE POLICY "tickets_update_admin"
  ON public.tickets FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- ----- ticket_messages -----

-- User: can read messages in own tickets
CREATE POLICY "ticket_messages_select_own"
  ON public.ticket_messages FOR SELECT
  USING (
    ticket_id IN (SELECT id FROM public.tickets WHERE user_id = auth.uid())
  );

-- Admin: can read all ticket messages
CREATE POLICY "ticket_messages_select_admin"
  ON public.ticket_messages FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- User: can send messages in own tickets
CREATE POLICY "ticket_messages_insert_own"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND ticket_id IN (SELECT id FROM public.tickets WHERE user_id = auth.uid())
  );

-- Admin: can send messages in any ticket
CREATE POLICY "ticket_messages_insert_admin"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- ----- favorites -----

-- User: can read own favorites
CREATE POLICY "favorites_select_own"
  ON public.favorites FOR SELECT
  USING (user_id = auth.uid());

-- Admin: can read all favorites
CREATE POLICY "favorites_select_admin"
  ON public.favorites FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- User: can insert own favorites
CREATE POLICY "favorites_insert_own"
  ON public.favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- User: can delete own favorites
CREATE POLICY "favorites_delete_own"
  ON public.favorites FOR DELETE
  USING (user_id = auth.uid());

COMMENT ON TABLE public.notifications IS 'In-app notifications for users with read status (PRD-064)';
COMMENT ON TABLE public.tickets IS 'Support tickets from users with priority and status workflow (PRD-064)';
COMMENT ON TABLE public.ticket_messages IS 'Messages within support ticket threads (PRD-064)';
COMMENT ON TABLE public.favorites IS 'User favorites for saving jobs, candidates, etc. with unique constraint (PRD-064)';
