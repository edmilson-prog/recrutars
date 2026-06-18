-- Migration 110: Collaborator notification preferences (Fase 3)
-- Per-collaborator (company_users) channel opt-in for email/WhatsApp.
-- Theme stays in localStorage (next-themes). No backfill; no handle_new_user change.

CREATE TABLE IF NOT EXISTS public.collaborator_preferences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  email_opt_in    boolean NOT NULL DEFAULT true,
  whatsapp_opt_in boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collaborator_preferences_company_profile_unique
    UNIQUE (company_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_collaborator_preferences_profile
  ON public.collaborator_preferences (profile_id);
CREATE INDEX IF NOT EXISTS idx_collaborator_preferences_company
  ON public.collaborator_preferences (company_id);

-- updated_at trigger (reuses public.update_updated_at() from migration 001)
DROP TRIGGER IF EXISTS update_collaborator_preferences_updated_at
  ON public.collaborator_preferences;
CREATE TRIGGER update_collaborator_preferences_updated_at
  BEFORE UPDATE ON public.collaborator_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.collaborator_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS collab_prefs_select ON public.collaborator_preferences;
CREATE POLICY collab_prefs_select ON public.collaborator_preferences
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR company_id = public.get_company_id(auth.uid())
  );

DROP POLICY IF EXISTS collab_prefs_insert ON public.collaborator_preferences;
CREATE POLICY collab_prefs_insert ON public.collaborator_preferences
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND company_id = public.get_company_id(auth.uid())
  );

DROP POLICY IF EXISTS collab_prefs_update ON public.collaborator_preferences;
CREATE POLICY collab_prefs_update ON public.collaborator_preferences
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS collab_prefs_delete ON public.collaborator_preferences;
CREATE POLICY collab_prefs_delete ON public.collaborator_preferences
  FOR DELETE TO authenticated
  USING (profile_id = auth.uid());
