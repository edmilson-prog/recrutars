-- Migration 076: Fix team_member_events.performed_by FK
-- Redirects FK from auth.users to profiles so PostgREST can resolve
-- the embedded resource query: profiles:performed_by(name)
-- Without this, the query returns 400 Bad Request.

ALTER TABLE public.team_member_events
  DROP CONSTRAINT IF EXISTS team_member_events_performed_by_fkey;

ALTER TABLE public.team_member_events
  ADD CONSTRAINT team_member_events_performed_by_fkey
  FOREIGN KEY (performed_by) REFERENCES public.profiles(id)
  ON DELETE SET NULL;
