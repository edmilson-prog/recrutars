-- Migration 099: audit trail para application_notes
-- Adiciona soft delete + history table + triggers no padrão do candidate_notes (migration 098)

ALTER TABLE public.application_notes
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES public.profiles(id);

CREATE TABLE IF NOT EXISTS public.application_notes_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.application_notes(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'restored')),
  actor_id uuid NOT NULL REFERENCES public.profiles(id),
  previous_content text,
  new_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_application_notes_history_note
  ON public.application_notes_history(note_id, created_at DESC);

-- BEFORE UPDATE: just touches updated_at when content changes
CREATE OR REPLACE FUNCTION public.touch_application_note_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_note_touch_updated ON public.application_notes;
CREATE TRIGGER trg_application_note_touch_updated
  BEFORE UPDATE ON public.application_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_application_note_updated_at();

-- AFTER INSERT OR UPDATE: writes to history table (FK requires parent committed first)
CREATE OR REPLACE FUNCTION public.log_application_note_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.application_notes_history(note_id, action, actor_id, new_content)
    VALUES (NEW.id, 'created', NEW.author_id, NEW.content);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
      INSERT INTO public.application_notes_history(note_id, action, actor_id, previous_content)
      VALUES (NEW.id, 'deleted', COALESCE(NEW.deleted_by, auth.uid()), OLD.content);
    ELSIF NEW.is_deleted = false AND OLD.is_deleted = true THEN
      INSERT INTO public.application_notes_history(note_id, action, actor_id, new_content)
      VALUES (NEW.id, 'restored', auth.uid(), NEW.content);
    ELSIF NEW.content IS DISTINCT FROM OLD.content THEN
      INSERT INTO public.application_notes_history(note_id, action, actor_id, previous_content, new_content)
      VALUES (NEW.id, 'updated', auth.uid(), OLD.content, NEW.content);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_note_audit ON public.application_notes;
CREATE TRIGGER trg_application_note_audit
  AFTER INSERT OR UPDATE ON public.application_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_application_note_change();

-- Add UPDATE policy (only SELECT/INSERT exist today from migration 005)
DROP POLICY IF EXISTS "application_notes_update_company" ON public.application_notes;
CREATE POLICY "application_notes_update_company" ON public.application_notes
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_notes.application_id
        AND j.company_id = public.get_company_id(auth.uid())
    )
  );

ALTER TABLE public.application_notes_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "application_notes_history_select_company" ON public.application_notes_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.application_notes an
      JOIN public.applications a ON a.id = an.application_id
      JOIN public.jobs j ON j.id = a.job_id
      WHERE an.id = application_notes_history.note_id
        AND (j.company_id = public.get_company_id(auth.uid())
             OR public.get_user_type(auth.uid()) = 'admin')
    )
  );

COMMENT ON TABLE public.application_notes_history IS 'Audit trail de application_notes (soft delete + history)';
