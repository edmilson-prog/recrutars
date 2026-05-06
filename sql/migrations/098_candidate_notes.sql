-- Migration 098: candidate_notes + audit trail
-- Notas perenes da empresa sobre o candidato (visíveis em qualquer vaga)

CREATE TABLE IF NOT EXISTS public.candidate_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_notes_candidate_company
  ON public.candidate_notes(candidate_id, company_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_candidate_notes_company
  ON public.candidate_notes(company_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_author
  ON public.candidate_notes(author_id);

CREATE TABLE IF NOT EXISTS public.candidate_notes_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.candidate_notes(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'restored')),
  actor_id uuid NOT NULL REFERENCES public.profiles(id),
  previous_content text,
  new_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_history_note
  ON public.candidate_notes_history(note_id, created_at DESC);

-- BEFORE UPDATE: bump updated_at when content changes (NEW must be mutable)
CREATE OR REPLACE FUNCTION public.touch_candidate_note_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_candidate_note_touch ON public.candidate_notes;
CREATE TRIGGER trg_candidate_note_touch
  BEFORE UPDATE ON public.candidate_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_candidate_note_updated_at();

-- AFTER INSERT/UPDATE: write audit row (FK to candidate_notes requires row to exist)
CREATE OR REPLACE FUNCTION public.log_candidate_note_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.candidate_notes_history(note_id, action, actor_id, new_content)
    VALUES (NEW.id, 'created', NEW.author_id, NEW.content);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
      INSERT INTO public.candidate_notes_history(note_id, action, actor_id, previous_content)
      VALUES (NEW.id, 'deleted', COALESCE(NEW.deleted_by, auth.uid()), OLD.content);
    ELSIF NEW.is_deleted = false AND OLD.is_deleted = true THEN
      INSERT INTO public.candidate_notes_history(note_id, action, actor_id, new_content)
      VALUES (NEW.id, 'restored', auth.uid(), NEW.content);
    ELSIF NEW.content IS DISTINCT FROM OLD.content THEN
      INSERT INTO public.candidate_notes_history(note_id, action, actor_id, previous_content, new_content)
      VALUES (NEW.id, 'updated', auth.uid(), OLD.content, NEW.content);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_candidate_note_audit ON public.candidate_notes;
CREATE TRIGGER trg_candidate_note_audit
  AFTER INSERT OR UPDATE ON public.candidate_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_candidate_note_change();

ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidate_notes_select_company" ON public.candidate_notes
  FOR SELECT TO authenticated
  USING (
    company_id = public.get_company_id(auth.uid())
    OR public.get_user_type(auth.uid()) = 'admin'
  );

CREATE POLICY "candidate_notes_insert_company" ON public.candidate_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id = public.get_company_id(auth.uid())
    AND author_id = auth.uid()
  );

CREATE POLICY "candidate_notes_update_company" ON public.candidate_notes
  FOR UPDATE TO authenticated
  USING (company_id = public.get_company_id(auth.uid()))
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

-- DELETE não exposto: usar soft delete via UPDATE is_deleted=true

CREATE POLICY "candidate_notes_history_select_company" ON public.candidate_notes_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_notes cn
      WHERE cn.id = candidate_notes_history.note_id
        AND (cn.company_id = public.get_company_id(auth.uid())
             OR public.get_user_type(auth.uid()) = 'admin')
    )
  );

COMMENT ON TABLE public.candidate_notes IS 'Notas internas perenes da empresa sobre o candidato — invisíveis ao candidato (PRD-098)';
COMMENT ON TABLE public.candidate_notes_history IS 'Audit trail de todas as mudanças em candidate_notes';
