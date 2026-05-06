# Dossiê Empresa + Notas Internas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar exportação funcional de PDF "Dossiê Empresa" (substituindo handler fake) e novo escopo de notas internas perenes por candidato + empresa, ambos com audit trail completo.

**Architecture:** Nova tabela `candidate_notes` (perene por candidato + empresa) + tabela espelho `*_history` para auditoria via triggers. Estensão de `application_notes` com mesmo padrão. UI com 2 cards inline em `CandidateProfile.tsx`. PDF "Dossiê Empresa" como módulo isolado em `src/components/empresa/pdf/` com 4 templates (3 reusados + 1 novo) e 13 seções configuráveis via checkbox.

**Tech Stack:** PostgreSQL/Supabase (RLS, triggers), React 18 + TypeScript, React Query, shadcn/ui, `@react-pdf/renderer`, Tailwind.

**Spec:** `docs/superpowers/specs/2026-05-06-dossie-empresa-notas-internas-design.md`

---

## Conventions

- **Verificação:** Sem testes unitários — após cada task: `npm run lint` deve passar, type check via `npx tsc --noEmit` deve passar, e teste manual no browser (`npm run dev` na porta 3000).
- **Migrações:** Aplicar via MCP Supabase (`mcp__claude_ai_Supabase__apply_migration`) E salvar em `sql/migrations/` com mesmo conteúdo.
- **Edge Functions:** N/A neste plano (tudo via RLS/triggers).
- **Commits:** Atômicos, conventional commits em inglês, padrão do projeto.

---

## Phase 1 — Database

### Task 1: Migração 098 — `candidate_notes` + audit trail

**Files:**
- Create: `sql/migrations/098_candidate_notes.sql`
- Apply via MCP: nome `098_candidate_notes`

- [ ] **Step 1: Criar arquivo de migração**

Conteúdo de `sql/migrations/098_candidate_notes.sql`:

```sql
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
      NEW.updated_at = now();
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
  BEFORE INSERT OR UPDATE ON public.candidate_notes
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
```

- [ ] **Step 2: Aplicar migração via MCP Supabase**

Use ferramenta `mcp__claude_ai_Supabase__apply_migration` com:
- name: `098_candidate_notes`
- query: o conteúdo SQL acima

- [ ] **Step 3: Verificar criação das tabelas**

Use `mcp__claude_ai_Supabase__list_tables` filtrando por schema `public`. Confirme presença de `candidate_notes` e `candidate_notes_history`.

- [ ] **Step 4: Smoke test RLS via SQL**

Execute via `mcp__claude_ai_Supabase__execute_sql`:
```sql
-- Como admin (sem auth context, usa role postgres)
INSERT INTO public.candidate_notes (candidate_id, company_id, author_id, content)
SELECT
  (SELECT id FROM public.candidates LIMIT 1),
  (SELECT id FROM public.companies LIMIT 1),
  (SELECT profile_id FROM public.companies LIMIT 1),
  'Nota teste de smoke';

SELECT id, action, previous_content, new_content
FROM public.candidate_notes_history
ORDER BY created_at DESC LIMIT 3;
```
Esperado: ver 1 entrada com action='created' e new_content='Nota teste de smoke'.

- [ ] **Step 5: Limpar dados de smoke test**
```sql
DELETE FROM public.candidate_notes WHERE content = 'Nota teste de smoke';
```

- [ ] **Step 6: Commit**
```bash
git add sql/migrations/098_candidate_notes.sql
git commit -m "feat(db): add candidate_notes table with audit trail (migration 098)"
```

---

### Task 2: Migração 099 — Audit trail em `application_notes`

**Files:**
- Create: `sql/migrations/099_application_notes_audit.sql`

- [ ] **Step 1: Criar arquivo de migração**

```sql
-- Migration 099: audit trail para application_notes
-- Adiciona soft delete + history table + triggers no padrão do candidate_notes

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
      NEW.updated_at = now();
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
  BEFORE INSERT OR UPDATE ON public.application_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_application_note_change();

-- Adicionar policy UPDATE (não existe hoje)
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
```

- [ ] **Step 2: Aplicar via MCP**

`mcp__claude_ai_Supabase__apply_migration` com name=`099_application_notes_audit`.

- [ ] **Step 3: Verificar via list_tables**

Confirmar `application_notes_history` criada.

- [ ] **Step 4: Smoke test soft delete**
```sql
-- Pegar uma application_note existente
SELECT id, content, is_deleted FROM public.application_notes LIMIT 1;
-- Marcar como deletada (substituir <ID> pelo id retornado)
UPDATE public.application_notes
  SET is_deleted = true, deleted_at = now(), deleted_by = author_id
  WHERE id = '<ID>';
-- Ver history
SELECT action, previous_content FROM public.application_notes_history
  WHERE note_id = '<ID>' ORDER BY created_at DESC LIMIT 2;
-- Restaurar
UPDATE public.application_notes
  SET is_deleted = false, deleted_at = NULL, deleted_by = NULL
  WHERE id = '<ID>';
```
Esperado: history mostra 'deleted' depois 'restored'.

- [ ] **Step 5: Commit**
```bash
git add sql/migrations/099_application_notes_audit.sql
git commit -m "feat(db): add audit trail and soft delete to application_notes (migration 099)"
```

---

### Task 3: Regenerar tipos Supabase

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Regenerar via MCP**

Use `mcp__claude_ai_Supabase__generate_typescript_types` (sem args). Copie o output completo.

- [ ] **Step 2: Substituir conteúdo de `src/types/database.ts`**

Sobrescrever o arquivo inteiro com o output da MCP. Verificar que aparecem as novas tabelas: `candidate_notes`, `candidate_notes_history`, `application_notes_history`, e que `application_notes` tem novas colunas.

- [ ] **Step 3: Type check**
```bash
npx tsc --noEmit
```
Esperado: 0 erros (ou apenas erros pré-existentes não relacionados).

- [ ] **Step 4: Commit**
```bash
git add src/types/database.ts
git commit -m "chore(types): regenerate database types after migrations 098/099"
```

---

## Phase 2 — Service Layer & Hooks

### Task 4: Tipos compartilhados de notas

**Files:**
- Create: `src/types/notes.ts`

- [ ] **Step 1: Criar arquivo**

```ts
// src/types/notes.ts

export type NoteAction = 'created' | 'updated' | 'deleted' | 'restored';

export interface CandidateNote {
  id: string;
  candidateId: string;
  companyId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface NoteHistoryEntry {
  id: string;
  noteId: string;
  action: NoteAction;
  actorId: string;
  actorName?: string;
  previousContent?: string | null;
  newContent?: string | null;
  createdAt: string;
}

export interface CreateCandidateNoteInput {
  candidateId: string;
  companyId: string;
  content: string;
}

export interface UpdateNoteInput {
  noteId: string;
  content: string;
}
```

- [ ] **Step 2: Type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**
```bash
git add src/types/notes.ts
git commit -m "feat(types): add CandidateNote and NoteHistoryEntry types"
```

---

### Task 5: Service `candidateNotes`

**Files:**
- Create: `src/services/candidateNotes/types.ts`
- Create: `src/services/candidateNotes/candidateNotesService.ts`
- Create: `src/services/candidateNotes/candidateNotesService.supabase.ts`
- Create: `src/services/candidateNotes/index.ts`

- [ ] **Step 1: Criar `types.ts`**
```ts
// src/services/candidateNotes/types.ts
export type {
  CandidateNote,
  NoteHistoryEntry,
  NoteAction,
  CreateCandidateNoteInput,
  UpdateNoteInput,
} from '@/types/notes';
```

- [ ] **Step 2: Criar interface + factory**

`src/services/candidateNotes/candidateNotesService.ts`:
```ts
import type {
  CandidateNote,
  NoteHistoryEntry,
  CreateCandidateNoteInput,
  UpdateNoteInput,
} from './types';
import { createCandidateNotesService } from './candidateNotesService.supabase';

export interface CandidateNotesService {
  list(
    candidateId: string,
    companyId: string,
    opts?: { includeDeleted?: boolean },
  ): Promise<CandidateNote[]>;
  listHistory(noteId: string): Promise<NoteHistoryEntry[]>;
  create(input: CreateCandidateNoteInput): Promise<CandidateNote>;
  update(input: UpdateNoteInput): Promise<CandidateNote>;
  softDelete(noteId: string): Promise<void>;
  restore(noteId: string): Promise<CandidateNote>;
}

let _instance: CandidateNotesService | null = null;

export function getCandidateNotesService(): CandidateNotesService {
  if (!_instance) {
    _instance = createCandidateNotesService();
  }
  return _instance;
}
```

- [ ] **Step 3: Criar implementação Supabase**

`src/services/candidateNotes/candidateNotesService.supabase.ts`:
```ts
import { supabase } from '@/lib/supabase';
import type {
  CandidateNote,
  NoteHistoryEntry,
  CreateCandidateNoteInput,
  UpdateNoteInput,
} from './types';
import type { CandidateNotesService } from './candidateNotesService';

interface RawCandidateNote {
  id: string;
  candidate_id: string;
  company_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  author?: { full_name: string | null; avatar_url: string | null } | null;
}

interface RawNoteHistory {
  id: string;
  note_id: string;
  action: 'created' | 'updated' | 'deleted' | 'restored';
  actor_id: string;
  previous_content: string | null;
  new_content: string | null;
  created_at: string;
  actor?: { full_name: string | null } | null;
}

function mapNote(row: RawCandidateNote): CandidateNote {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    companyId: row.company_id,
    authorId: row.author_id,
    authorName: row.author?.full_name ?? undefined,
    authorAvatar: row.author?.avatar_url ?? null,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted,
    deletedAt: row.deleted_at,
    deletedBy: row.deleted_by,
  };
}

function mapHistory(row: RawNoteHistory): NoteHistoryEntry {
  return {
    id: row.id,
    noteId: row.note_id,
    action: row.action,
    actorId: row.actor_id,
    actorName: row.actor?.full_name ?? undefined,
    previousContent: row.previous_content,
    newContent: row.new_content,
    createdAt: row.created_at,
  };
}

export function createCandidateNotesService(): CandidateNotesService {
  return {
    async list(candidateId, companyId, opts) {
      let query = supabase
        .from('candidate_notes')
        .select(`
          *,
          author:profiles!candidate_notes_author_id_fkey(full_name, avatar_url)
        `)
        .eq('candidate_id', candidateId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (!opts?.includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as RawCandidateNote[]).map(mapNote);
    },

    async listHistory(noteId) {
      const { data, error } = await supabase
        .from('candidate_notes_history')
        .select(`
          *,
          actor:profiles!candidate_notes_history_actor_id_fkey(full_name)
        `)
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as RawNoteHistory[]).map(mapHistory);
    },

    async create(input) {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('candidate_notes')
        .insert({
          candidate_id: input.candidateId,
          company_id: input.companyId,
          author_id: userId,
          content: input.content,
        })
        .select(`
          *,
          author:profiles!candidate_notes_author_id_fkey(full_name, avatar_url)
        `)
        .single();
      if (error) throw error;
      return mapNote(data as unknown as RawCandidateNote);
    },

    async update(input) {
      const { data, error } = await supabase
        .from('candidate_notes')
        .update({ content: input.content })
        .eq('id', input.noteId)
        .select(`
          *,
          author:profiles!candidate_notes_author_id_fkey(full_name, avatar_url)
        `)
        .single();
      if (error) throw error;
      return mapNote(data as unknown as RawCandidateNote);
    },

    async softDelete(noteId) {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const { error, data } = await supabase
        .from('candidate_notes')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
        })
        .eq('id', noteId)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Nota não encontrada ou sem permissão');
      }
    },

    async restore(noteId) {
      const { data, error } = await supabase
        .from('candidate_notes')
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
        })
        .eq('id', noteId)
        .select(`
          *,
          author:profiles!candidate_notes_author_id_fkey(full_name, avatar_url)
        `)
        .single();
      if (error) throw error;
      return mapNote(data as unknown as RawCandidateNote);
    },
  };
}
```

- [ ] **Step 4: Criar `index.ts`**
```ts
// src/services/candidateNotes/index.ts
export { getCandidateNotesService } from './candidateNotesService';
export type { CandidateNotesService } from './candidateNotesService';
export type * from './types';
```

- [ ] **Step 5: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 6: Commit**
```bash
git add src/services/candidateNotes/
git commit -m "feat(services): add candidateNotes service for perennial company notes"
```

---

### Task 6: Hooks React Query para `candidateNotes`

**Files:**
- Create: `src/hooks/useCandidateNotesQuery.ts`

- [ ] **Step 1: Criar arquivo**

```ts
// src/hooks/useCandidateNotesQuery.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCandidateNotesService } from '@/services/candidateNotes';
import type {
  CandidateNote,
  NoteHistoryEntry,
  CreateCandidateNoteInput,
  UpdateNoteInput,
} from '@/types/notes';
import { toast } from 'sonner';

export const candidateNoteKeys = {
  all: ['candidateNotes'] as const,
  list: (candidateId: string, companyId: string) =>
    [...candidateNoteKeys.all, 'list', candidateId, companyId] as const,
  history: (noteId: string) =>
    [...candidateNoteKeys.all, 'history', noteId] as const,
};

export function useCandidateNotes(
  candidateId: string | undefined,
  companyId: string | undefined,
  opts?: { includeDeleted?: boolean },
) {
  return useQuery<CandidateNote[]>({
    queryKey: candidateNoteKeys.list(candidateId ?? '', companyId ?? ''),
    queryFn: () =>
      getCandidateNotesService().list(candidateId!, companyId!, opts),
    enabled: !!candidateId && !!companyId,
  });
}

export function useCandidateNoteHistory(noteId: string | undefined) {
  return useQuery<NoteHistoryEntry[]>({
    queryKey: candidateNoteKeys.history(noteId ?? ''),
    queryFn: () => getCandidateNotesService().listHistory(noteId!),
    enabled: !!noteId,
  });
}

export function useCreateCandidateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCandidateNoteInput) =>
      getCandidateNotesService().create(input),
    onSuccess: (note) => {
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.list(note.candidateId, note.companyId),
      });
      toast.success('Nota adicionada');
    },
    onError: (e: Error) => {
      toast.error('Erro ao adicionar nota', { description: e.message });
    },
  });
}

export function useUpdateCandidateNote(candidateId: string, companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNoteInput) =>
      getCandidateNotesService().update(input),
    onSuccess: (note) => {
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.list(candidateId, companyId),
      });
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.history(note.id),
      });
      toast.success('Nota atualizada');
    },
    onError: (e: Error) => {
      toast.error('Erro ao atualizar nota', { description: e.message });
    },
  });
}

export function useDeleteCandidateNote(candidateId: string, companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) =>
      getCandidateNotesService().softDelete(noteId),
    onSuccess: (_, noteId) => {
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.list(candidateId, companyId),
      });
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.history(noteId),
      });
      toast.success('Nota excluída');
    },
    onError: (e: Error) => {
      toast.error('Erro ao excluir nota', { description: e.message });
    },
  });
}

export function useRestoreCandidateNote(candidateId: string, companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) =>
      getCandidateNotesService().restore(noteId),
    onSuccess: (note) => {
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.list(candidateId, companyId),
      });
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.history(note.id),
      });
      toast.success('Nota restaurada');
    },
    onError: (e: Error) => {
      toast.error('Erro ao restaurar nota', { description: e.message });
    },
  });
}
```

- [ ] **Step 2: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**
```bash
git add src/hooks/useCandidateNotesQuery.ts
git commit -m "feat(hooks): add React Query hooks for candidate_notes CRUD + history"
```

---

### Task 7: Estender `applicationsService` com update/delete/history

**Files:**
- Modify: `src/services/applications/applicationsService.ts`
- Modify: `src/services/applications/applicationsService.supabase.ts`

- [ ] **Step 1: Adicionar métodos na interface**

Em `src/services/applications/applicationsService.ts`, adicionar à interface `ApplicationsService`:
```ts
import type { NoteHistoryEntry, UpdateNoteInput } from '@/types/notes';
// ... existing imports

// Dentro da interface ApplicationsService:
updateNote(input: UpdateNoteInput): Promise<ApplicationNote>;
softDeleteNote(noteId: string): Promise<void>;
restoreNote(noteId: string): Promise<ApplicationNote>;
listNoteHistory(noteId: string): Promise<NoteHistoryEntry[]>;
```

- [ ] **Step 2: Adicionar implementação Supabase**

Em `src/services/applications/applicationsService.supabase.ts`, adicionar dentro do objeto retornado por `createApplicationsService`:

```ts
async updateNote(input) {
  const { data, error } = await supabase
    .from('application_notes')
    .update({ content: input.content })
    .eq('id', input.noteId)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as ApplicationNote;
},

async softDeleteNote(noteId) {
  const { data: userData } = await supabase.auth.getUser();
  const { error, data } = await supabase
    .from('application_notes')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: userData.user?.id,
    })
    .eq('id', noteId)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Nota não encontrada ou sem permissão');
  }
},

async restoreNote(noteId) {
  const { data, error } = await supabase
    .from('application_notes')
    .update({ is_deleted: false, deleted_at: null, deleted_by: null })
    .eq('id', noteId)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as ApplicationNote;
},

async listNoteHistory(noteId) {
  const { data, error } = await supabase
    .from('application_notes_history')
    .select(`
      *,
      actor:profiles!application_notes_history_actor_id_fkey(full_name)
    `)
    .eq('note_id', noteId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as Array<{
    id: string; note_id: string; action: 'created' | 'updated' | 'deleted' | 'restored';
    actor_id: string; previous_content: string | null; new_content: string | null;
    created_at: string;
    actor?: { full_name: string | null } | null;
  }>).map(row => ({
    id: row.id,
    noteId: row.note_id,
    action: row.action,
    actorId: row.actor_id,
    actorName: row.actor?.full_name ?? undefined,
    previousContent: row.previous_content,
    newContent: row.new_content,
    createdAt: row.created_at,
  }));
},
```

- [ ] **Step 3: Atualizar `list` de notas para filtrar deletadas por padrão**

Localize o método existente que lê `application_notes` (provavelmente `getApplicationNotes` ou similar). Adicionar `.eq('is_deleted', false)` no select padrão.

- [ ] **Step 4: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 5: Commit**
```bash
git add src/services/applications/
git commit -m "feat(services): add update/delete/history methods to applicationsService"
```

---

### Task 8: Estender hooks de application notes

**Files:**
- Modify: `src/hooks/useApplicationsQuery.ts`

- [ ] **Step 1: Adicionar query keys novas**

Localizar o objeto `applicationKeys` (ou similar) e adicionar:
```ts
noteHistory: (noteId: string) => [...applicationKeys.all, 'noteHistory', noteId] as const,
```

- [ ] **Step 2: Adicionar hook `useApplicationNoteHistory`**
```ts
export function useApplicationNoteHistory(noteId: string | undefined) {
  return useQuery<NoteHistoryEntry[]>({
    queryKey: applicationKeys.noteHistory(noteId ?? ''),
    queryFn: () => getApplicationsService().listNoteHistory(noteId!),
    enabled: !!noteId,
  });
}
```

- [ ] **Step 3: Adicionar hooks `useUpdateApplicationNote` / `useDeleteApplicationNote` / `useRestoreApplicationNote`**

```ts
export function useUpdateApplicationNote(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNoteInput) =>
      getApplicationsService().updateNote(input),
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: applicationKeys.notes(applicationId) });
      qc.invalidateQueries({ queryKey: applicationKeys.noteHistory(note.id) });
      toast.success('Nota atualizada');
    },
    onError: (e: Error) => toast.error('Erro ao atualizar', { description: e.message }),
  });
}

export function useDeleteApplicationNote(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => getApplicationsService().softDeleteNote(noteId),
    onSuccess: (_, noteId) => {
      qc.invalidateQueries({ queryKey: applicationKeys.notes(applicationId) });
      qc.invalidateQueries({ queryKey: applicationKeys.noteHistory(noteId) });
      toast.success('Nota excluída');
    },
    onError: (e: Error) => toast.error('Erro ao excluir', { description: e.message }),
  });
}

export function useRestoreApplicationNote(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => getApplicationsService().restoreNote(noteId),
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: applicationKeys.notes(applicationId) });
      qc.invalidateQueries({ queryKey: applicationKeys.noteHistory(note.id) });
      toast.success('Nota restaurada');
    },
    onError: (e: Error) => toast.error('Erro ao restaurar', { description: e.message }),
  });
}
```

Os imports adicionais necessários (`NoteHistoryEntry`, `UpdateNoteInput` de `@/types/notes`, `toast` de `'sonner'`) — adicionar no topo se não existirem.

- [ ] **Step 4: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 5: Commit**
```bash
git add src/hooks/useApplicationsQuery.ts
git commit -m "feat(hooks): add update/delete/history hooks for application_notes"
```

---

## Phase 3 — UI Components for Notes

### Task 9: Componente `NoteEditor`

**Files:**
- Create: `src/components/empresa/notes/NoteEditor.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// src/components/empresa/notes/NoteEditor.tsx
import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_CHARS = 2000;

interface NoteEditorProps {
  initialContent?: string;
  placeholder?: string;
  onSave: (content: string) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  autoFocus?: boolean;
}

export function NoteEditor({
  initialContent = '',
  placeholder = 'Escreva uma nota interna…',
  onSave,
  onCancel,
  isSubmitting = false,
  autoFocus = true,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [autoFocus, content.length]);

  const trimmed = content.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_CHARS;
  const overLimit = content.length > MAX_CHARS;

  const handleSave = async () => {
    if (!isValid) return;
    await onSave(trimmed);
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
        maxLength={MAX_CHARS + 100}
        disabled={isSubmitting}
        className={cn(overLimit && 'border-destructive focus-visible:ring-destructive')}
      />
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs',
            overLimit ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {content.length}/{MAX_CHARS}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/notes/NoteEditor.tsx
git commit -m "feat(ui): add NoteEditor component with char counter"
```

---

### Task 10: Componente `NoteHistoryModal`

**Files:**
- Create: `src/components/empresa/notes/NoteHistoryModal.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// src/components/empresa/notes/NoteHistoryModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NoteHistoryEntry } from '@/types/notes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ACTION_META: Record<
  NoteHistoryEntry['action'],
  { label: string; icon: typeof Plus; tone: string }
> = {
  created: { label: 'Criada', icon: Plus, tone: 'text-green-700 bg-green-50 border-green-200' },
  updated: { label: 'Editada', icon: Pencil, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  deleted: { label: 'Excluída', icon: Trash2, tone: 'text-red-700 bg-red-50 border-red-200' },
  restored: { label: 'Restaurada', icon: RotateCcw, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
};

interface NoteHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: NoteHistoryEntry[] | undefined;
  isLoading: boolean;
}

export function NoteHistoryModal({
  open,
  onOpenChange,
  history,
  isLoading,
}: NoteHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico da nota</DialogTitle>
          <DialogDescription>
            Todas as alterações registradas, da mais recente para a mais antiga.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !history || history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sem histórico disponível.
          </p>
        ) : (
          <ol className="relative border-l border-border pl-6 space-y-6 mt-4">
            {history.map((entry) => {
              const meta = ACTION_META[entry.action];
              const Icon = meta.icon;
              return (
                <li key={entry.id} className="relative">
                  <span
                    className={cn(
                      'absolute -left-9 flex h-6 w-6 items-center justify-center rounded-full border',
                      meta.tone,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={meta.tone}>
                      {meta.label}
                    </Badge>
                    <span className="text-sm font-medium">
                      {entry.actorName ?? 'Usuário'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {entry.action === 'updated' && (
                    <div className="mt-2 grid gap-2 text-sm">
                      <div className="rounded border border-red-200 bg-red-50 p-2">
                        <div className="text-xs font-semibold text-red-700 mb-1">Antes</div>
                        <div className="whitespace-pre-wrap text-foreground/80">
                          {entry.previousContent}
                        </div>
                      </div>
                      <div className="rounded border border-green-200 bg-green-50 p-2">
                        <div className="text-xs font-semibold text-green-700 mb-1">Depois</div>
                        <div className="whitespace-pre-wrap text-foreground/80">
                          {entry.newContent}
                        </div>
                      </div>
                    </div>
                  )}
                  {entry.action === 'deleted' && entry.previousContent && (
                    <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm">
                      <div className="text-xs font-semibold text-red-700 mb-1">Conteúdo excluído</div>
                      <div className="whitespace-pre-wrap text-foreground/80">
                        {entry.previousContent}
                      </div>
                    </div>
                  )}
                  {(entry.action === 'created' || entry.action === 'restored') && entry.newContent && (
                    <div className="mt-2 rounded border bg-muted/40 p-2 text-sm whitespace-pre-wrap">
                      {entry.newContent}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/notes/NoteHistoryModal.tsx
git commit -m "feat(ui): add NoteHistoryModal with timeline and diff"
```

---

### Task 11: Componente `NoteListItem`

**Files:**
- Create: `src/components/empresa/notes/NoteListItem.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// src/components/empresa/notes/NoteListItem.tsx
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Pencil, Trash2, History } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NoteEditor } from './NoteEditor';
import type { CandidateNote } from '@/types/notes';

interface NoteListItemProps {
  note: CandidateNote;
  onUpdate: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onShowHistory: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function NoteListItem({
  note,
  onUpdate,
  onDelete,
  onShowHistory,
  isUpdating = false,
  isDeleting = false,
}: NoteListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const wasEdited = note.updatedAt !== note.createdAt;
  const initials = (note.authorName ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = async (content: string) => {
    await onUpdate(content);
    setIsEditing(false);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await onDelete();
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex gap-3 p-4 rounded-lg border bg-card">
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={note.authorAvatar ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-medium text-sm">{note.authorName ?? 'Usuário'}</span>
            <span
              className="text-xs text-muted-foreground"
              title={format(new Date(note.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            >
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ptBR })}
            </span>
            {wasEdited && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                editado
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onShowHistory}>
                <History className="h-4 w-4 mr-2" /> Ver histórico
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setConfirmDelete(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isEditing ? (
          <div className="mt-2">
            <NoteEditor
              initialContent={note.content}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isUpdating}
            />
          </div>
        ) : (
          <p className="text-sm mt-2 whitespace-pre-wrap break-words">{note.content}</p>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir nota?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação fica registrada no histórico e pode ser revertida posteriormente por qualquer membro da equipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo…' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

- [ ] **Step 2: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/notes/NoteListItem.tsx
git commit -m "feat(ui): add NoteListItem with edit/delete/history actions"
```

---

### Task 12: Componente `CandidateNotesCard`

**Files:**
- Create: `src/components/empresa/notes/CandidateNotesCard.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// src/components/empresa/notes/CandidateNotesCard.tsx
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, StickyNote, Plus } from 'lucide-react';
import { NoteEditor } from './NoteEditor';
import { NoteListItem } from './NoteListItem';
import { NoteHistoryModal } from './NoteHistoryModal';
import {
  useCandidateNotes,
  useCreateCandidateNote,
  useUpdateCandidateNote,
  useDeleteCandidateNote,
  useCandidateNoteHistory,
} from '@/hooks/useCandidateNotesQuery';

export interface CandidateNotesCardHandle {
  scrollIntoView: () => void;
  startCreating: () => void;
}

interface CandidateNotesCardProps {
  candidateId: string;
  companyId: string;
}

export const CandidateNotesCard = forwardRef<
  CandidateNotesCardHandle,
  CandidateNotesCardProps
>(function CandidateNotesCard({ candidateId, companyId }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [historyNoteId, setHistoryNoteId] = useState<string | null>(null);

  const { data: notes, isLoading } = useCandidateNotes(candidateId, companyId);
  const createMut = useCreateCandidateNote();
  const updateMut = useUpdateCandidateNote(candidateId, companyId);
  const deleteMut = useDeleteCandidateNote(candidateId, companyId);
  const { data: history, isLoading: historyLoading } = useCandidateNoteHistory(
    historyNoteId ?? undefined,
  );

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    startCreating: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsCreating(true);
    },
  }));

  const handleCreate = async (content: string) => {
    await createMut.mutateAsync({ candidateId, companyId, content });
    setIsCreating(false);
  };

  return (
    <div ref={containerRef}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            Notas sobre o Candidato
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Anotações perenes da equipe — visíveis em qualquer vaga, invisíveis para o candidato.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCreating ? (
            <NoteEditor
              onSave={handleCreate}
              onCancel={() => setIsCreating(false)}
              isSubmitting={createMut.isPending}
              placeholder="Escreva uma observação sobre este candidato…"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar nota
            </Button>
          )}

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !notes || notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma nota ainda. Adicione a primeira observação sobre este candidato.
            </p>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  onUpdate={(content) => updateMut.mutateAsync({ noteId: note.id, content })}
                  onDelete={() => deleteMut.mutateAsync(note.id)}
                  onShowHistory={() => setHistoryNoteId(note.id)}
                  isUpdating={updateMut.isPending && updateMut.variables?.noteId === note.id}
                  isDeleting={deleteMut.isPending && deleteMut.variables === note.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NoteHistoryModal
        open={!!historyNoteId}
        onOpenChange={(open) => !open && setHistoryNoteId(null)}
        history={history}
        isLoading={historyLoading}
      />
    </div>
  );
});
```

- [ ] **Step 2: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/notes/CandidateNotesCard.tsx
git commit -m "feat(ui): add CandidateNotesCard for perennial notes"
```

---

### Task 13: Componente `ApplicationNotesCard`

**Files:**
- Create: `src/components/empresa/notes/ApplicationNotesCard.tsx`

- [ ] **Step 1: Criar componente**

Espelha o `CandidateNotesCard` mas usa `useApplicationNotes` + os hooks novos do Task 8. Estrutura idêntica, só muda hooks e textos.

```tsx
// src/components/empresa/notes/ApplicationNotesCard.tsx
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Plus } from 'lucide-react';
import { NoteEditor } from './NoteEditor';
import { NoteListItem } from './NoteListItem';
import { NoteHistoryModal } from './NoteHistoryModal';
import {
  useApplicationNotes,
  useAddApplicationNote,
  useUpdateApplicationNote,
  useDeleteApplicationNote,
  useApplicationNoteHistory,
} from '@/hooks/useApplicationsQuery';
import type { CandidateNote } from '@/types/notes';

export interface ApplicationNotesCardHandle {
  scrollIntoView: () => void;
  startCreating: () => void;
}

interface ApplicationNotesCardProps {
  applicationId: string;
  jobTitle?: string;
}

// Adapter — application_notes do projeto pode ter shape ligeiramente diferente.
// Mapeia para CandidateNote para reusar NoteListItem.
function adaptApplicationNote(raw: {
  id: string;
  applicationId?: string;
  application_id?: string;
  authorId?: string;
  author_id?: string;
  authorName?: string;
  author?: string;
  content: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  isDeleted?: boolean;
  is_deleted?: boolean;
}): CandidateNote {
  return {
    id: raw.id,
    candidateId: '',
    companyId: '',
    authorId: raw.authorId ?? raw.author_id ?? '',
    authorName: raw.authorName ?? raw.author ?? undefined,
    authorAvatar: null,
    content: raw.content,
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.updated_at ?? raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    isDeleted: raw.isDeleted ?? raw.is_deleted ?? false,
  };
}

export const ApplicationNotesCard = forwardRef<
  ApplicationNotesCardHandle,
  ApplicationNotesCardProps
>(function ApplicationNotesCard({ applicationId, jobTitle }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [historyNoteId, setHistoryNoteId] = useState<string | null>(null);

  const { data: rawNotes, isLoading } = useApplicationNotes(applicationId);
  const createMut = useAddApplicationNote();
  const updateMut = useUpdateApplicationNote(applicationId);
  const deleteMut = useDeleteApplicationNote(applicationId);
  const { data: history, isLoading: historyLoading } = useApplicationNoteHistory(
    historyNoteId ?? undefined,
  );

  const notes = (rawNotes ?? []).map(adaptApplicationNote);

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    startCreating: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsCreating(true);
    },
  }));

  const handleCreate = async (content: string) => {
    await createMut.mutateAsync({ applicationId, content });
    setIsCreating(false);
  };

  return (
    <div ref={containerRef}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600" />
            Notas desta Candidatura
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Observações específicas {jobTitle ? `sobre a vaga "${jobTitle}"` : 'sobre esta candidatura'} — invisíveis para o candidato.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCreating ? (
            <NoteEditor
              onSave={handleCreate}
              onCancel={() => setIsCreating(false)}
              isSubmitting={createMut.isPending}
              placeholder="Escreva uma observação sobre esta candidatura…"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar nota
            </Button>
          )}

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma nota ainda nesta candidatura.
            </p>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  onUpdate={(content) => updateMut.mutateAsync({ noteId: note.id, content })}
                  onDelete={() => deleteMut.mutateAsync(note.id)}
                  onShowHistory={() => setHistoryNoteId(note.id)}
                  isUpdating={updateMut.isPending && updateMut.variables?.noteId === note.id}
                  isDeleting={deleteMut.isPending && deleteMut.variables === note.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NoteHistoryModal
        open={!!historyNoteId}
        onOpenChange={(open) => !open && setHistoryNoteId(null)}
        history={history}
        isLoading={historyLoading}
      />
    </div>
  );
});
```

- [ ] **Step 2: Type check + lint**

Se houver discrepância de assinatura entre `useAddApplicationNote` (existente) e o esperado, alinhar. Verificar shape real de `application_notes` em `src/services/applications/applicationsService.supabase.ts` e ajustar o `adaptApplicationNote` se necessário.

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/notes/ApplicationNotesCard.tsx
git commit -m "feat(ui): add ApplicationNotesCard for per-application notes"
```

---

### Task 14: Integração em `CandidateProfile.tsx`

**Files:**
- Modify: `src/pages/empresa/CandidateProfile.tsx`

- [ ] **Step 1: Adicionar imports**

No topo do arquivo, junto com outros imports de empresa:
```tsx
import { CandidateNotesCard, type CandidateNotesCardHandle } from '@/components/empresa/notes/CandidateNotesCard';
import { ApplicationNotesCard, type ApplicationNotesCardHandle } from '@/components/empresa/notes/ApplicationNotesCard';
import { useRef } from 'react';
```

- [ ] **Step 2: Adicionar refs no componente**

Após os outros `useState`/`useRef` no topo do componente:
```tsx
const candidateNotesRef = useRef<CandidateNotesCardHandle>(null);
const applicationNotesRef = useRef<ApplicationNotesCardHandle>(null);
```

- [ ] **Step 3: Inserir os cards no corpo principal**

Localizar o bloco de "Formação Acadêmica" (busca por `Formação Acadêmica` no JSX). Logo após o card que o renderiza, adicionar:

```tsx
{/* Notas Internas */}
{currentCompany?.id && candidate?.id && (
  <CandidateNotesCard
    ref={candidateNotesRef}
    candidateId={candidate.id}
    companyId={currentCompany.id}
  />
)}

{selectedApplication?.id && (
  <ApplicationNotesCard
    ref={applicationNotesRef}
    applicationId={selectedApplication.id}
    jobTitle={selectedApplication.job?.title}
  />
)}
```

- [ ] **Step 4: Substituir botão "Adicionar Anotação" da sidebar por DropdownMenu**

Localizar o botão atual (busca por `Adicionar Anotação` no JSX, dentro do card "Ações"). Substituir por:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground"
    >
      <StickyNote className="w-4 h-4 mr-2" />
      Adicionar Anotação
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuItem
      onSelect={() => applicationNotesRef.current?.startCreating()}
      disabled={!selectedApplication}
    >
      <FileText className="w-4 h-4 mr-2" />
      Sobre esta candidatura
    </DropdownMenuItem>
    <DropdownMenuItem
      onSelect={() => candidateNotesRef.current?.startCreating()}
    >
      <StickyNote className="w-4 h-4 mr-2" />
      Sobre o candidato
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Garantir que `StickyNote` e `FileText` já estão nos imports do lucide-react (já estão pelo grep prévio).

- [ ] **Step 5: Remover handler obsoleto**

Manter `handleExportProfile` por enquanto (será reescrito no Task 28). Mas verificar se há código morto após substituições e remover.

- [ ] **Step 6: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 7: Teste manual no browser**

Iniciar dev server (porta 3000):
```bash
npm run dev
```
- Login como empresa (`rh@techsolutions.com` / `Company@123`)
- Abrir candidato no Banco de Talentos
- Verificar: card "Notas sobre o Candidato" aparece, "Notas desta Candidatura" só se houver candidatura selecionada
- Adicionar nota nos dois → ver renderizar
- Editar nota → ver badge "editado"
- Excluir nota → ver desaparecer
- Abrir histórico → ver timeline
- Botão sidebar "Adicionar Anotação" → abre dropdown, cada opção rola até e foca o editor

- [ ] **Step 8: Commit**
```bash
git add src/pages/empresa/CandidateProfile.tsx
git commit -m "feat(empresa): integrate notes cards and dropdown into candidate profile"
```

---

## Phase 4 — PDF Dossiê Empresa

### Task 15: Tipos e estilos do módulo PDF empresa

**Files:**
- Create: `src/components/empresa/pdf/types.ts`
- Create: `src/components/empresa/pdf/styles.ts`

- [ ] **Step 1: Criar `types.ts`**

```ts
// src/components/empresa/pdf/types.ts
import type { Curriculum } from '@/types';
import type { CandidateNote } from '@/types/notes';

export type PDFEmpresaTemplateType = 'classic' | 'modern' | 'minimal' | 'dossie';

export interface PDFEmpresaSectionConfig {
  // Base (do candidato)
  personalInfo: boolean;
  summary: boolean;
  technicalSkills: boolean;
  behavioralSkills: boolean;
  experience: boolean;
  education: boolean;
  courses: boolean;
  salary: boolean;
  // Empresa
  matchScore: boolean;
  gaugeProAnalysis: boolean;
  internalNotes: boolean;
  applicationHistory: boolean;
  practicalAnalysis: boolean;
  interviews: boolean;
  highlights: boolean;
  favoriteEvaluation: boolean;
  languages: boolean;
  availability: boolean;
  activityLog: boolean;
}

export type SectionKey = keyof PDFEmpresaSectionConfig;

export interface PDFEmpresaData {
  curriculum: Curriculum | null | undefined;
  candidate: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
    city?: string;
    state?: string;
  };
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  application?: {
    id: string;
    jobTitle?: string;
    status?: string;
    createdAt?: string;
  } | null;
  matchResult?: {
    overallScore: number;
    technicalScore?: number;
    experienceScore?: number;
    behavioralScore?: number;
    strengths?: string[];
    opportunities?: string[];
  } | null;
  gaugeProResult?: {
    archetype?: string;
    archetypeDescription?: string;
    dimensions?: { name: string; score: number }[];
  } | null;
  applicationNotes?: CandidateNote[];
  candidateNotes?: CandidateNote[];
  applicationHistory?: Array<{
    id: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
  }>;
  practicalAnalysis?: {
    summary?: string;
    points?: string[];
  } | null;
  interviews?: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    feedback?: string;
  }>;
  highlights?: Array<{ id: string; section: string; label: string }>;
  favoriteEvaluation?: { isFavorite: boolean; tags?: string[] };
  languages?: Array<{ name: string; level: string }>;
  availability?: {
    workModel?: string;
    availableForRelocation?: boolean;
    immediateStart?: boolean;
  };
  activityLog?: Array<{ id: string; action: string; createdAt: string; description?: string }>;
}
```

- [ ] **Step 2: Criar `styles.ts`**

```ts
// src/components/empresa/pdf/styles.ts
import { StyleSheet, Font } from '@react-pdf/renderer';

export const empresaColors = {
  primary: '#0F172A',     // navy
  accent: '#06B6D4',      // cyan
  accentDark: '#0E7490',
  text: '#1E293B',
  muted: '#64748B',
  border: '#E2E8F0',
  bgSubtle: '#F1F5F9',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  white: '#FFFFFF',
};

export const empresaStyles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: empresaColors.text,
    backgroundColor: empresaColors.white,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: empresaColors.border,
  },
  headerCompany: {
    fontSize: 9,
    color: empresaColors.muted,
    fontWeight: 'bold',
  },
  headerCandidate: {
    fontSize: 9,
    color: empresaColors.muted,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: empresaColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8,
    color: empresaColors.muted,
  },
  confidential: {
    fontWeight: 'bold',
    color: empresaColors.danger,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: empresaColors.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: empresaColors.accent,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 2,
    marginLeft: 12,
  },
  badge: {
    fontSize: 8,
    backgroundColor: empresaColors.bgSubtle,
    color: empresaColors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  scoreBadge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: empresaColors.white,
    backgroundColor: empresaColors.accent,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    width: 80,
  },
  // Capa
  coverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  coverLogo: {
    width: 100,
    height: 100,
    marginBottom: 32,
    objectFit: 'contain',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: empresaColors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 16,
    color: empresaColors.accent,
    marginBottom: 24,
    textAlign: 'center',
  },
  coverCandidateName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: empresaColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 11,
    color: empresaColors.muted,
    marginTop: 16,
  },
  coverConfidential: {
    position: 'absolute',
    bottom: 60,
    fontSize: 12,
    fontWeight: 'bold',
    color: empresaColors.danger,
    letterSpacing: 2,
  },
});

export function getScoreColor(score: number): string {
  if (score >= 80) return empresaColors.success;
  if (score >= 60) return empresaColors.warning;
  if (score >= 40) return '#EA580C';
  return empresaColors.danger;
}
```

- [ ] **Step 3: Type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**
```bash
git add src/components/empresa/pdf/types.ts src/components/empresa/pdf/styles.ts
git commit -m "feat(pdf): add empresa PDF types and shared styles"
```

---

### Task 16: Componentes globais de página (Header, Footer, CoverPage, ExecutiveSummary)

**Files:**
- Create: `src/components/empresa/pdf/sections/Header.tsx`
- Create: `src/components/empresa/pdf/sections/Footer.tsx`
- Create: `src/components/empresa/pdf/sections/CoverPage.tsx`
- Create: `src/components/empresa/pdf/sections/ExecutiveSummary.tsx`

- [ ] **Step 1: Criar `Header.tsx`**

```tsx
// src/components/empresa/pdf/sections/Header.tsx
import { View, Text, Image } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';

interface HeaderProps {
  companyName: string;
  companyLogo?: string | null;
  candidateName?: string;
}

export function Header({ companyName, companyLogo, candidateName }: HeaderProps) {
  return (
    <View style={empresaStyles.header} fixed>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {companyLogo ? (
          <Image src={companyLogo} style={{ width: 24, height: 24, objectFit: 'contain' }} />
        ) : null}
        <Text style={empresaStyles.headerCompany}>{companyName}</Text>
      </View>
      {candidateName ? (
        <Text style={empresaStyles.headerCandidate}>{candidateName}</Text>
      ) : null}
    </View>
  );
}
```

- [ ] **Step 2: Criar `Footer.tsx`**

```tsx
// src/components/empresa/pdf/sections/Footer.tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';

interface FooterProps {
  companyName: string;
  generatedAt: string;
}

export function Footer({ companyName, generatedAt }: FooterProps) {
  return (
    <View style={empresaStyles.footer} fixed>
      <Text style={empresaStyles.confidential}>DOCUMENTO INTERNO — USO RESTRITO</Text>
      <Text>{companyName}</Text>
      <Text>Gerado em {generatedAt}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
    </View>
  );
}
```

- [ ] **Step 3: Criar `CoverPage.tsx`**

```tsx
// src/components/empresa/pdf/sections/CoverPage.tsx
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { Footer } from './Footer';

interface CoverPageProps {
  data: PDFEmpresaData;
  generatedAt: string;
}

export function CoverPage({ data, generatedAt }: CoverPageProps) {
  return (
    <Page size="A4" style={empresaStyles.page}>
      <View style={empresaStyles.coverContainer}>
        {data.company.logoUrl ? (
          <Image src={data.company.logoUrl} style={empresaStyles.coverLogo} />
        ) : (
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: empresaColors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <Text style={{ color: empresaColors.white, fontSize: 36, fontWeight: 'bold' }}>
              {data.company.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={empresaStyles.coverTitle}>Dossiê do Candidato</Text>
        <Text style={empresaStyles.coverSubtitle}>{data.company.name}</Text>
        <Text style={empresaStyles.coverCandidateName}>
          {data.candidate.name ?? 'Candidato'}
        </Text>
        {data.application?.jobTitle ? (
          <Text style={{ fontSize: 13, color: empresaColors.muted, marginTop: 4 }}>
            Vaga: {data.application.jobTitle}
          </Text>
        ) : null}
        <Text style={empresaStyles.coverDate}>Gerado em {generatedAt}</Text>
      </View>
      <Text style={empresaStyles.coverConfidential}>CONFIDENCIAL</Text>
      <Footer companyName={data.company.name} generatedAt={generatedAt} />
    </Page>
  );
}
```

- [ ] **Step 4: Criar `ExecutiveSummary.tsx`**

```tsx
// src/components/empresa/pdf/sections/ExecutiveSummary.tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors, getScoreColor } from '../styles';
import type { PDFEmpresaData } from '../types';

interface ExecutiveSummaryProps {
  data: PDFEmpresaData;
}

export function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  const score = data.matchResult?.overallScore;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Sumário Executivo</Text>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
        {typeof score === 'number' ? (
          <View
            style={{
              backgroundColor: getScoreColor(score),
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              width: 90,
            }}
          >
            <Text style={{ color: empresaColors.white, fontSize: 28, fontWeight: 'bold' }}>
              {score}%
            </Text>
            <Text style={{ color: empresaColors.white, fontSize: 8, marginTop: 2 }}>
              MATCH
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold' }]}>
            {data.candidate.name}
          </Text>
          {data.candidate.city || data.candidate.state ? (
            <Text style={[empresaStyles.paragraph, { color: empresaColors.muted }]}>
              {[data.candidate.city, data.candidate.state].filter(Boolean).join(' / ')}
            </Text>
          ) : null}
          {data.curriculum?.summary ? (
            <Text style={empresaStyles.paragraph}>
              {data.curriculum.summary.slice(0, 400)}
              {data.curriculum.summary.length > 400 ? '…' : ''}
            </Text>
          ) : null}
          {data.gaugeProResult?.archetype ? (
            <Text
              style={[
                empresaStyles.paragraph,
                { fontStyle: 'italic', color: empresaColors.accentDark, marginTop: 4 },
              ]}
            >
              Perfil comportamental: {data.gaugeProResult.archetype}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 5: Type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**
```bash
git add src/components/empresa/pdf/sections/Header.tsx src/components/empresa/pdf/sections/Footer.tsx src/components/empresa/pdf/sections/CoverPage.tsx src/components/empresa/pdf/sections/ExecutiveSummary.tsx
git commit -m "feat(pdf): add Header, Footer, CoverPage, ExecutiveSummary"
```

---

### Task 17: Seções de currículo base reutilizando componentes existentes

**Files:**
- Create: `src/components/empresa/pdf/sections/CurriculumSections.tsx`

- [ ] **Step 1: Criar arquivo**

Reusa os blocos do PDF do candidato para as 8 seções base. Como os templates do candidato (`PDFTemplateClassic` etc.) já renderizam essas seções, a estratégia é renderizar os blocos individualmente para o template Dossiê.

```tsx
// src/components/empresa/pdf/sections/CurriculumSections.tsx
// Renderiza as 8 seções base do currículo do candidato adaptadas ao estilo empresa.
// Para os templates 'classic' / 'modern' / 'minimal' o módulo do candidato é usado direto.
// Para 'dossie' usamos esses blocos.
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { Curriculum } from '@/types';

export function PersonalInfoSection({ curriculum, candidate }: {
  curriculum: Curriculum;
  candidate: { name?: string; email?: string; phone?: string; city?: string; state?: string };
}) {
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Informações Pessoais</Text>
      {candidate.name ? <Text style={empresaStyles.paragraph}>Nome: {candidate.name}</Text> : null}
      {candidate.email ? <Text style={empresaStyles.paragraph}>Email: {candidate.email}</Text> : null}
      {candidate.phone ? <Text style={empresaStyles.paragraph}>Telefone: {candidate.phone}</Text> : null}
      {candidate.city || candidate.state ? (
        <Text style={empresaStyles.paragraph}>
          Localização: {[candidate.city, candidate.state].filter(Boolean).join(' / ')}
        </Text>
      ) : null}
    </View>
  );
}

export function SummarySection({ summary }: { summary?: string }) {
  if (!summary) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Resumo Profissional</Text>
      <Text style={empresaStyles.paragraph}>{summary}</Text>
    </View>
  );
}

export function TechnicalSkillsSection({ skills }: { skills?: Array<{ name: string; level?: string }> }) {
  if (!skills || skills.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Habilidades Técnicas</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {skills.map((s, i) => (
          <Text key={i} style={empresaStyles.badge}>
            {s.name}{s.level ? ` · ${s.level}` : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function BehavioralSkillsSection({ skills }: { skills?: string[] }) {
  if (!skills || skills.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Habilidades Comportamentais</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {skills.map((s, i) => (
          <Text key={i} style={empresaStyles.badge}>{s}</Text>
        ))}
      </View>
    </View>
  );
}

export function ExperienceSection({ experiences }: {
  experiences?: Array<{ position?: string; company?: string; startDate?: string; endDate?: string; description?: string }>;
}) {
  if (!experiences || experiences.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Experiência Profissional</Text>
      {experiences.map((exp, i) => (
        <View key={i} style={{ marginBottom: 8 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold' }]}>
            {exp.position}{exp.company ? ` — ${exp.company}` : ''}
          </Text>
          <Text style={[empresaStyles.paragraph, { color: empresaColors.muted, fontSize: 9 }]}>
            {exp.startDate} {exp.endDate ? `até ${exp.endDate}` : ''}
          </Text>
          {exp.description ? <Text style={empresaStyles.paragraph}>{exp.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}

export function EducationSection({ educations }: {
  educations?: Array<{ degree?: string; institution?: string; startDate?: string; endDate?: string; status?: string }>;
}) {
  if (!educations || educations.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Formação Acadêmica</Text>
      {educations.map((ed, i) => (
        <View key={i} style={{ marginBottom: 6 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold' }]}>
            {ed.degree}{ed.institution ? ` — ${ed.institution}` : ''}
          </Text>
          <Text style={[empresaStyles.paragraph, { color: empresaColors.muted, fontSize: 9 }]}>
            {ed.startDate} {ed.endDate ? `– ${ed.endDate}` : ''} {ed.status ? `(${ed.status})` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function CoursesSection({ courses }: {
  courses?: Array<{ name?: string; institution?: string; year?: string }>;
}) {
  if (!courses || courses.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Cursos e Certificações</Text>
      {courses.map((c, i) => (
        <Text key={i} style={empresaStyles.bullet}>
          • {c.name}{c.institution ? ` — ${c.institution}` : ''}{c.year ? ` (${c.year})` : ''}
        </Text>
      ))}
    </View>
  );
}

export function SalarySection({ salary }: { salary?: { min?: number; max?: number; currency?: string } | null }) {
  if (!salary || (!salary.min && !salary.max)) return null;
  const fmt = (v?: number) => v ? `${salary.currency ?? 'R$'} ${v.toLocaleString('pt-BR')}` : '—';
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Pretensão Salarial</Text>
      <Text style={empresaStyles.paragraph}>De {fmt(salary.min)} a {fmt(salary.max)}</Text>
    </View>
  );
}
```

> Nota de implementação: as assinaturas dos campos (`Curriculum.summary`, `experiences`, etc.) podem variar levemente — ao implementar, abrir `src/types/curriculum.ts` ou `src/types/index.ts` e ajustar os tipos para corresponder.

- [ ] **Step 2: Type check**
```bash
npx tsc --noEmit
```
Se houver erros de tipo (Curriculum shape diferente), ajustar usando o tipo real do projeto.

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/pdf/sections/CurriculumSections.tsx
git commit -m "feat(pdf): add curriculum base sections for empresa template"
```

---

### Task 18: Seções específicas da empresa (parte 1 — Match, GaugePro, InternalNotes)

**Files:**
- Create: `src/components/empresa/pdf/sections/MatchScoreSection.tsx`
- Create: `src/components/empresa/pdf/sections/GaugeProAnalysisSection.tsx`
- Create: `src/components/empresa/pdf/sections/InternalNotesSection.tsx`

- [ ] **Step 1: Criar `MatchScoreSection.tsx`**

```tsx
// src/components/empresa/pdf/sections/MatchScoreSection.tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors, getScoreColor } from '../styles';
import type { PDFEmpresaData } from '../types';

export function MatchScoreSection({ data }: { data: PDFEmpresaData }) {
  if (!data.matchResult || !data.application) return null;
  const m = data.matchResult;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Match Score — {data.application.jobTitle}</Text>
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
        <View style={{
          backgroundColor: getScoreColor(m.overallScore),
          padding: 10, borderRadius: 6, width: 70, alignItems: 'center',
        }}>
          <Text style={{ color: empresaColors.white, fontSize: 22, fontWeight: 'bold' }}>{m.overallScore}%</Text>
          <Text style={{ color: empresaColors.white, fontSize: 7 }}>GERAL</Text>
        </View>
        <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
          {typeof m.technicalScore === 'number' && (
            <Text style={empresaStyles.paragraph}>Técnico: <Text style={{ fontWeight: 'bold' }}>{m.technicalScore}%</Text></Text>
          )}
          {typeof m.experienceScore === 'number' && (
            <Text style={empresaStyles.paragraph}>Experiência: <Text style={{ fontWeight: 'bold' }}>{m.experienceScore}%</Text></Text>
          )}
          {typeof m.behavioralScore === 'number' && (
            <Text style={empresaStyles.paragraph}>Comportamental: <Text style={{ fontWeight: 'bold' }}>{m.behavioralScore}%</Text></Text>
          )}
        </View>
      </View>

      {m.strengths && m.strengths.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', color: empresaColors.success }]}>Pontos Fortes</Text>
          {m.strengths.map((s, i) => <Text key={i} style={empresaStyles.bullet}>✓ {s}</Text>)}
        </View>
      )}
      {m.opportunities && m.opportunities.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', color: empresaColors.warning }]}>Oportunidades</Text>
          {m.opportunities.map((o, i) => <Text key={i} style={empresaStyles.bullet}>↗ {o}</Text>)}
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Criar `GaugeProAnalysisSection.tsx`**

```tsx
// src/components/empresa/pdf/sections/GaugeProAnalysisSection.tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';

export function GaugeProAnalysisSection({ data }: { data: PDFEmpresaData }) {
  if (!data.gaugeProResult) return null;
  const g = data.gaugeProResult;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Análise Comportamental (Gauge-Pro)</Text>
      {g.archetype && (
        <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', color: empresaColors.accentDark, fontSize: 12 }]}>
          Arquétipo: {g.archetype}
        </Text>
      )}
      {g.archetypeDescription && (
        <Text style={empresaStyles.paragraph}>{g.archetypeDescription}</Text>
      )}
      {g.dimensions && g.dimensions.length > 0 && (
        <View style={{ marginTop: 8, gap: 4 }}>
          {g.dimensions.map((d, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ width: 100, fontSize: 9 }}>{d.name}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: empresaColors.bgSubtle, borderRadius: 4 }}>
                <View style={{
                  width: `${Math.min(100, Math.max(0, d.score))}%`,
                  height: 8,
                  backgroundColor: empresaColors.accent,
                  borderRadius: 4,
                }} />
              </View>
              <Text style={{ width: 30, fontSize: 9, textAlign: 'right' }}>{d.score}%</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 3: Criar `InternalNotesSection.tsx`**

```tsx
// src/components/empresa/pdf/sections/InternalNotesSection.tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function InternalNotesSection({ data }: { data: PDFEmpresaData }) {
  const candidateNotes = (data.candidateNotes ?? []).filter(n => !n.isDeleted);
  const appNotes = (data.applicationNotes ?? []).filter(n => !n.isDeleted);
  if (candidateNotes.length === 0 && appNotes.length === 0) return null;

  const renderNote = (n: { id: string; authorName?: string; content: string; createdAt: string }) => (
    <View key={n.id} style={{ marginBottom: 6, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: empresaColors.accent }}>
      <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', fontSize: 9 }]}>
        {n.authorName ?? 'Recrutador'} · {format(new Date(n.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
      </Text>
      <Text style={empresaStyles.paragraph}>{n.content}</Text>
    </View>
  );

  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Notas Internas</Text>
      {candidateNotes.length > 0 && (
        <>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', marginTop: 4, color: empresaColors.muted }]}>
            Sobre o Candidato (perenes)
          </Text>
          {candidateNotes.map(renderNote)}
        </>
      )}
      {appNotes.length > 0 && (
        <>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold', marginTop: 8, color: empresaColors.muted }]}>
            Sobre esta Candidatura
          </Text>
          {appNotes.map(renderNote)}
        </>
      )}
    </View>
  );
}
```

- [ ] **Step 4: Type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**
```bash
git add src/components/empresa/pdf/sections/MatchScoreSection.tsx src/components/empresa/pdf/sections/GaugeProAnalysisSection.tsx src/components/empresa/pdf/sections/InternalNotesSection.tsx
git commit -m "feat(pdf): add MatchScore, GaugePro, InternalNotes PDF sections"
```

---

### Task 19: Seções específicas da empresa (parte 2 — restantes)

**Files:**
- Create: `src/components/empresa/pdf/sections/ApplicationHistorySection.tsx`
- Create: `src/components/empresa/pdf/sections/PracticalAnalysisSection.tsx`
- Create: `src/components/empresa/pdf/sections/InterviewsSection.tsx`
- Create: `src/components/empresa/pdf/sections/HighlightsSection.tsx`
- Create: `src/components/empresa/pdf/sections/FavoriteEvaluationSection.tsx`
- Create: `src/components/empresa/pdf/sections/LanguagesSection.tsx`
- Create: `src/components/empresa/pdf/sections/AvailabilitySection.tsx`
- Create: `src/components/empresa/pdf/sections/ActivityLogSection.tsx`

- [ ] **Step 1: Criar todos os arquivos no padrão das seções anteriores**

Conteúdo de cada um (cópia + ajuste):

`ApplicationHistorySection.tsx`:
```tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ApplicationHistorySection({ data }: { data: PDFEmpresaData }) {
  if (!data.applicationHistory || data.applicationHistory.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Histórico de Candidaturas</Text>
      {data.applicationHistory.map(app => (
        <View key={app.id} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={{ width: 80, fontSize: 9, color: empresaColors.muted }}>
            {format(new Date(app.appliedAt), 'dd/MM/yy', { locale: ptBR })}
          </Text>
          <Text style={[empresaStyles.paragraph, { flex: 1 }]}>{app.jobTitle}</Text>
          <Text style={empresaStyles.badge}>{app.status}</Text>
        </View>
      ))}
    </View>
  );
}
```

`PracticalAnalysisSection.tsx`:
```tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData } from '../types';

export function PracticalAnalysisSection({ data }: { data: PDFEmpresaData }) {
  if (!data.practicalAnalysis) return null;
  const a = data.practicalAnalysis;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Análise Prática</Text>
      {a.summary && <Text style={empresaStyles.paragraph}>{a.summary}</Text>}
      {a.points && a.points.map((p, i) => <Text key={i} style={empresaStyles.bullet}>• {p}</Text>)}
    </View>
  );
}
```

`InterviewsSection.tsx`:
```tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function InterviewsSection({ data }: { data: PDFEmpresaData }) {
  if (!data.interviews || data.interviews.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Entrevistas</Text>
      {data.interviews.map(iv => (
        <View key={iv.id} style={{ marginBottom: 6 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold' }]}>
            {format(new Date(iv.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            {' — '}
            <Text style={{ color: empresaColors.accentDark }}>{iv.status}</Text>
          </Text>
          {iv.feedback && <Text style={empresaStyles.paragraph}>{iv.feedback}</Text>}
        </View>
      ))}
    </View>
  );
}
```

`HighlightsSection.tsx`:
```tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData } from '../types';

export function HighlightsSection({ data }: { data: PDFEmpresaData }) {
  if (!data.highlights || data.highlights.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Destaques da Candidatura</Text>
      {data.highlights.map(h => (
        <Text key={h.id} style={empresaStyles.bullet}>★ {h.section}: {h.label}</Text>
      ))}
    </View>
  );
}
```

`FavoriteEvaluationSection.tsx`:
```tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';

export function FavoriteEvaluationSection({ data }: { data: PDFEmpresaData }) {
  if (!data.favoriteEvaluation) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Avaliação Interna</Text>
      <Text style={empresaStyles.paragraph}>
        {data.favoriteEvaluation.isFavorite ? '★ Marcado como favorito pela equipe' : 'Não marcado como favorito'}
      </Text>
      {data.favoriteEvaluation.tags && data.favoriteEvaluation.tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {data.favoriteEvaluation.tags.map((t, i) => (
            <Text key={i} style={empresaStyles.badge}>{t}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
```

`LanguagesSection.tsx`:
```tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData } from '../types';

export function LanguagesSection({ data }: { data: PDFEmpresaData }) {
  if (!data.languages || data.languages.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Idiomas</Text>
      {data.languages.map((l, i) => (
        <Text key={i} style={empresaStyles.bullet}>• {l.name} — {l.level}</Text>
      ))}
    </View>
  );
}
```

`AvailabilitySection.tsx`:
```tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData } from '../types';

export function AvailabilitySection({ data }: { data: PDFEmpresaData }) {
  if (!data.availability) return null;
  const a = data.availability;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Disponibilidade</Text>
      {a.workModel && <Text style={empresaStyles.paragraph}>Modelo de trabalho preferido: {a.workModel}</Text>}
      <Text style={empresaStyles.paragraph}>Disponível para mudança: {a.availableForRelocation ? 'Sim' : 'Não'}</Text>
      <Text style={empresaStyles.paragraph}>Início imediato: {a.immediateStart ? 'Sim' : 'Não'}</Text>
    </View>
  );
}
```

`ActivityLogSection.tsx`:
```tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import type { PDFEmpresaData } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ActivityLogSection({ data }: { data: PDFEmpresaData }) {
  if (!data.activityLog || data.activityLog.length === 0) return null;
  const events = data.activityLog.slice(0, 20);
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Histórico de Atividade</Text>
      {events.map(ev => (
        <View key={ev.id} style={{ flexDirection: 'row', marginBottom: 3 }}>
          <Text style={{ width: 80, fontSize: 9, color: empresaColors.muted }}>
            {format(new Date(ev.createdAt), 'dd/MM/yy HH:mm', { locale: ptBR })}
          </Text>
          <Text style={[empresaStyles.paragraph, { flex: 1, fontSize: 9 }]}>
            {ev.description ?? ev.action}
          </Text>
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 2: Type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/pdf/sections/
git commit -m "feat(pdf): add remaining empresa PDF sections"
```

---

### Task 20: Template `PDFTemplateDossie`

**Files:**
- Create: `src/components/empresa/pdf/templates/PDFTemplateDossie.tsx`

- [ ] **Step 1: Criar arquivo**

```tsx
// src/components/empresa/pdf/templates/PDFTemplateDossie.tsx
import { Page, View } from '@react-pdf/renderer';
import { empresaStyles } from '../styles';
import type { PDFEmpresaData, PDFEmpresaSectionConfig } from '../types';
import { Header } from '../sections/Header';
import { Footer } from '../sections/Footer';
import { CoverPage } from '../sections/CoverPage';
import { ExecutiveSummary } from '../sections/ExecutiveSummary';
import {
  PersonalInfoSection,
  SummarySection,
  TechnicalSkillsSection,
  BehavioralSkillsSection,
  ExperienceSection,
  EducationSection,
  CoursesSection,
  SalarySection,
} from '../sections/CurriculumSections';
import { MatchScoreSection } from '../sections/MatchScoreSection';
import { GaugeProAnalysisSection } from '../sections/GaugeProAnalysisSection';
import { InternalNotesSection } from '../sections/InternalNotesSection';
import { ApplicationHistorySection } from '../sections/ApplicationHistorySection';
import { PracticalAnalysisSection } from '../sections/PracticalAnalysisSection';
import { InterviewsSection } from '../sections/InterviewsSection';
import { HighlightsSection } from '../sections/HighlightsSection';
import { FavoriteEvaluationSection } from '../sections/FavoriteEvaluationSection';
import { LanguagesSection } from '../sections/LanguagesSection';
import { AvailabilitySection } from '../sections/AvailabilitySection';
import { ActivityLogSection } from '../sections/ActivityLogSection';

interface Props {
  data: PDFEmpresaData;
  sections: PDFEmpresaSectionConfig;
  generatedAt: string;
}

export function PDFTemplateDossie({ data, sections, generatedAt }: Props) {
  const c = data.curriculum;
  return (
    <>
      <CoverPage data={data} generatedAt={generatedAt} />
      <Page size="A4" style={empresaStyles.page}>
        <Header
          companyName={data.company.name}
          companyLogo={data.company.logoUrl}
          candidateName={data.candidate.name}
        />
        <ExecutiveSummary data={data} />
        {sections.matchScore && <MatchScoreSection data={data} />}
        {sections.personalInfo && c && (
          <PersonalInfoSection curriculum={c} candidate={data.candidate} />
        )}
        {sections.summary && c?.summary && <SummarySection summary={c.summary} />}
        {sections.technicalSkills && (
          <TechnicalSkillsSection skills={(c as { technicalSkills?: Array<{ name: string; level?: string }> } | null | undefined)?.technicalSkills} />
        )}
        {sections.behavioralSkills && (
          <BehavioralSkillsSection skills={(c as { behavioralSkills?: string[] } | null | undefined)?.behavioralSkills} />
        )}
        {sections.gaugeProAnalysis && <GaugeProAnalysisSection data={data} />}
        {sections.experience && (
          <ExperienceSection experiences={(c as { experiences?: Array<{ position?: string; company?: string; startDate?: string; endDate?: string; description?: string }> } | null | undefined)?.experiences} />
        )}
        {sections.education && (
          <EducationSection educations={(c as { educations?: Array<{ degree?: string; institution?: string; startDate?: string; endDate?: string; status?: string }> } | null | undefined)?.educations} />
        )}
        {sections.courses && (
          <CoursesSection courses={(c as { courses?: Array<{ name?: string; institution?: string; year?: string }> } | null | undefined)?.courses} />
        )}
        {sections.languages && <LanguagesSection data={data} />}
        {sections.availability && <AvailabilitySection data={data} />}
        {sections.salary && (
          <SalarySection salary={(c as { salary?: { min?: number; max?: number; currency?: string } } | null | undefined)?.salary} />
        )}
        {sections.highlights && <HighlightsSection data={data} />}
        {sections.favoriteEvaluation && <FavoriteEvaluationSection data={data} />}
        {sections.practicalAnalysis && <PracticalAnalysisSection data={data} />}
        {sections.interviews && <InterviewsSection data={data} />}
        {sections.applicationHistory && <ApplicationHistorySection data={data} />}
        {sections.internalNotes && <InternalNotesSection data={data} />}
        {sections.activityLog && <ActivityLogSection data={data} />}
        <View>
          <Footer companyName={data.company.name} generatedAt={generatedAt} />
        </View>
      </Page>
    </>
  );
}
```

- [ ] **Step 2: Type check**
```bash
npx tsc --noEmit
```

Se houver erros sobre os campos do `Curriculum` (`technicalSkills`, etc.), abrir `src/types/curriculum.ts` ou similar e ajustar os casts para usar o tipo real exportado. A intenção dos casts é cobrir incertezas de shape — substituir por acesso direto quando o tipo real for confirmado.

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/pdf/templates/PDFTemplateDossie.tsx
git commit -m "feat(pdf): add PDFTemplateDossie composing all sections"
```

---

### Task 21: Wrappers para templates Classic/Modern/Minimal

**Files:**
- Create: `src/components/empresa/pdf/templates/PDFTemplateBaseEmpresa.tsx`

- [ ] **Step 1: Criar wrapper**

Os 3 templates do candidato (`PDFTemplateClassic`, `PDFTemplateModern`, `PDFTemplateMinimal` em `src/components/candidato/pdf/`) já renderizam currículo. Para a versão empresa eles precisam só receber as seções base e ignorar as seções empresa (que vão como página adicional).

```tsx
// src/components/empresa/pdf/templates/PDFTemplateBaseEmpresa.tsx
import { Page } from '@react-pdf/renderer';
import {
  PDFTemplateClassic,
  PDFTemplateModern,
  PDFTemplateMinimal,
  type PDFSectionConfig,
} from '@/components/candidato/pdf';
import { empresaStyles } from '../styles';
import { Header } from '../sections/Header';
import { Footer } from '../sections/Footer';
import { MatchScoreSection } from '../sections/MatchScoreSection';
import { GaugeProAnalysisSection } from '../sections/GaugeProAnalysisSection';
import { InternalNotesSection } from '../sections/InternalNotesSection';
import { ApplicationHistorySection } from '../sections/ApplicationHistorySection';
import { PracticalAnalysisSection } from '../sections/PracticalAnalysisSection';
import { InterviewsSection } from '../sections/InterviewsSection';
import { HighlightsSection } from '../sections/HighlightsSection';
import { FavoriteEvaluationSection } from '../sections/FavoriteEvaluationSection';
import { LanguagesSection } from '../sections/LanguagesSection';
import { AvailabilitySection } from '../sections/AvailabilitySection';
import { ActivityLogSection } from '../sections/ActivityLogSection';
import type { PDFEmpresaData, PDFEmpresaSectionConfig, PDFEmpresaTemplateType } from '../types';

interface Props {
  template: Exclude<PDFEmpresaTemplateType, 'dossie'>;
  data: PDFEmpresaData;
  sections: PDFEmpresaSectionConfig;
  includeLinks: boolean;
  generatedAt: string;
}

export function PDFTemplateBaseEmpresa({
  template,
  data,
  sections,
  includeLinks,
  generatedAt,
}: Props) {
  if (!data.curriculum) return null;

  const baseSections: PDFSectionConfig = {
    personalInfo: sections.personalInfo,
    summary: sections.summary,
    technicalSkills: sections.technicalSkills,
    behavioralSkills: sections.behavioralSkills,
    experience: sections.experience,
    education: sections.education,
    courses: sections.courses,
    salary: sections.salary,
  };

  const Tpl =
    template === 'classic' ? PDFTemplateClassic :
    template === 'modern' ? PDFTemplateModern :
    PDFTemplateMinimal;

  const hasEmpresaSections =
    sections.matchScore || sections.gaugeProAnalysis || sections.internalNotes ||
    sections.applicationHistory || sections.practicalAnalysis || sections.interviews ||
    sections.highlights || sections.favoriteEvaluation || sections.languages ||
    sections.availability || sections.activityLog;

  return (
    <>
      <Tpl curriculum={data.curriculum} sections={baseSections} includeLinks={includeLinks} />
      {hasEmpresaSections && (
        <Page size="A4" style={empresaStyles.page}>
          <Header
            companyName={data.company.name}
            companyLogo={data.company.logoUrl}
            candidateName={data.candidate.name}
          />
          {sections.matchScore && <MatchScoreSection data={data} />}
          {sections.gaugeProAnalysis && <GaugeProAnalysisSection data={data} />}
          {sections.internalNotes && <InternalNotesSection data={data} />}
          {sections.applicationHistory && <ApplicationHistorySection data={data} />}
          {sections.practicalAnalysis && <PracticalAnalysisSection data={data} />}
          {sections.interviews && <InterviewsSection data={data} />}
          {sections.highlights && <HighlightsSection data={data} />}
          {sections.favoriteEvaluation && <FavoriteEvaluationSection data={data} />}
          {sections.languages && <LanguagesSection data={data} />}
          {sections.availability && <AvailabilitySection data={data} />}
          {sections.activityLog && <ActivityLogSection data={data} />}
          <Footer companyName={data.company.name} generatedAt={generatedAt} />
        </Page>
      )}
    </>
  );
}
```

- [ ] **Step 2: Type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/pdf/templates/PDFTemplateBaseEmpresa.tsx
git commit -m "feat(pdf): add wrapper that combines candidato templates with empresa sections"
```

---

### Task 22: Documento raiz `PDFEmpresaDocument`

**Files:**
- Create: `src/components/empresa/pdf/PDFEmpresaDocument.tsx`

- [ ] **Step 1: Criar arquivo**

```tsx
// src/components/empresa/pdf/PDFEmpresaDocument.tsx
import { Document } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PDFTemplateDossie } from './templates/PDFTemplateDossie';
import { PDFTemplateBaseEmpresa } from './templates/PDFTemplateBaseEmpresa';
import type { PDFEmpresaData, PDFEmpresaSectionConfig, PDFEmpresaTemplateType } from './types';

interface PDFEmpresaDocumentProps {
  data: PDFEmpresaData;
  template: PDFEmpresaTemplateType;
  sections: PDFEmpresaSectionConfig;
  includeLinks?: boolean;
}

export function PDFEmpresaDocument({
  data,
  template,
  sections,
  includeLinks = false,
}: PDFEmpresaDocumentProps) {
  const generatedAt = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  return (
    <Document
      title={`Dossiê ${data.candidate.name ?? 'Candidato'}`}
      author={data.company.name}
      subject="Documento Interno - Uso Restrito"
    >
      {template === 'dossie' ? (
        <PDFTemplateDossie data={data} sections={sections} generatedAt={generatedAt} />
      ) : (
        <PDFTemplateBaseEmpresa
          template={template}
          data={data}
          sections={sections}
          includeLinks={includeLinks}
          generatedAt={generatedAt}
        />
      )}
    </Document>
  );
}
```

- [ ] **Step 2: Type check**
```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/pdf/PDFEmpresaDocument.tsx
git commit -m "feat(pdf): add PDFEmpresaDocument router for templates"
```

---

### Task 23: Modal `ExportCandidateProfileModal`

**Files:**
- Create: `src/components/empresa/pdf/ExportCandidateProfileModal.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// src/components/empresa/pdf/ExportCandidateProfileModal.tsx
import { useMemo, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileDown, FileText, Layout, Loader2, Columns, AlignCenter, Sparkles, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PDFEmpresaDocument } from './PDFEmpresaDocument';
import type { PDFEmpresaData, PDFEmpresaSectionConfig, PDFEmpresaTemplateType, SectionKey } from './types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PDFEmpresaData;
}

const TEMPLATES: Array<{
  value: PDFEmpresaTemplateType; label: string; description: string; icon: typeof FileText;
}> = [
  { value: 'dossie',  label: 'Dossiê',       description: 'Capa + sumário + tudo', icon: Sparkles },
  { value: 'modern',  label: 'Moderno',      description: 'Duas colunas',          icon: Columns },
  { value: 'classic', label: 'Clássico',     description: 'Linear tradicional',    icon: FileText },
  { value: 'minimal', label: 'Minimalista',  description: 'Limpo e centralizado',  icon: AlignCenter },
];

interface SectionDef {
  key: SectionKey;
  label: string;
  group: 'base' | 'empresa';
  isAvailable: (d: PDFEmpresaData) => boolean;
  unavailableHint: string;
}

const SECTIONS: SectionDef[] = [
  { key: 'personalInfo',       label: 'Informações pessoais',         group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'summary',            label: 'Resumo profissional',          group: 'base',    isAvailable: d => !!d.curriculum?.summary,                     unavailableHint: 'Sem resumo no perfil' },
  { key: 'technicalSkills',    label: 'Habilidades técnicas',         group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'behavioralSkills',   label: 'Habilidades comportamentais',  group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'experience',         label: 'Experiência profissional',     group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'education',          label: 'Formação acadêmica',           group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'courses',            label: 'Cursos e certificações',       group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'salary',             label: 'Pretensão salarial',           group: 'base',    isAvailable: () => true,                                       unavailableHint: '' },
  { key: 'matchScore',         label: 'Match Score (vaga atual)',     group: 'empresa', isAvailable: d => !!d.matchResult && !!d.application,         unavailableHint: 'Requer candidatura ativa' },
  { key: 'gaugeProAnalysis',   label: 'Análise comportamental Gauge-Pro', group: 'empresa', isAvailable: d => !!d.gaugeProResult,                     unavailableHint: 'Sem teste Gauge-Pro' },
  { key: 'internalNotes',      label: 'Notas internas',               group: 'empresa', isAvailable: d => (d.candidateNotes?.length ?? 0) + (d.applicationNotes?.length ?? 0) > 0, unavailableHint: 'Sem notas registradas' },
  { key: 'applicationHistory', label: 'Histórico de candidaturas',    group: 'empresa', isAvailable: d => (d.applicationHistory?.length ?? 0) > 0,    unavailableHint: 'Sem histórico' },
  { key: 'practicalAnalysis',  label: 'Análise prática (IA)',         group: 'empresa', isAvailable: d => !!d.practicalAnalysis,                       unavailableHint: 'Análise não gerada' },
  { key: 'interviews',         label: 'Entrevistas',                  group: 'empresa', isAvailable: d => (d.interviews?.length ?? 0) > 0,             unavailableHint: 'Sem entrevistas' },
  { key: 'highlights',         label: 'Destaques da candidatura',     group: 'empresa', isAvailable: d => (d.highlights?.length ?? 0) > 0,             unavailableHint: 'Sem destaques' },
  { key: 'favoriteEvaluation', label: 'Avaliação interna',            group: 'empresa', isAvailable: d => !!d.favoriteEvaluation,                      unavailableHint: 'Sem avaliação' },
  { key: 'languages',          label: 'Idiomas',                      group: 'empresa', isAvailable: d => (d.languages?.length ?? 0) > 0,              unavailableHint: 'Sem idiomas registrados' },
  { key: 'availability',       label: 'Disponibilidade',              group: 'empresa', isAvailable: d => !!d.availability,                            unavailableHint: 'Sem disponibilidade declarada' },
  { key: 'activityLog',        label: 'Histórico de atividade',       group: 'empresa', isAvailable: d => (d.activityLog?.length ?? 0) > 0,            unavailableHint: 'Sem atividade' },
];

function buildDefaultSections(data: PDFEmpresaData): PDFEmpresaSectionConfig {
  const result = {} as PDFEmpresaSectionConfig;
  for (const s of SECTIONS) {
    result[s.key] = s.key === 'salary' ? false : s.isAvailable(data);
  }
  return result;
}

export function ExportCandidateProfileModal({ open, onOpenChange, data }: Props) {
  const [template, setTemplate] = useState<PDFEmpresaTemplateType>('dossie');
  const [sections, setSections] = useState<PDFEmpresaSectionConfig>(() => buildDefaultSections(data));
  const [includeLinks, setIncludeLinks] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Resetar default quando o data muda significativamente
  useMemo(() => {
    setSections(buildDefaultSections(data));
  }, [data]);

  const toggle = (key: SectionKey) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const doc = (
        <PDFEmpresaDocument
          data={data}
          template={template}
          sections={sections}
          includeLinks={includeLinks}
        />
      );
      const blob = await pdf(doc).toBlob();

      const nameParts = (data.candidate.name ?? 'Candidato').split(' ');
      const firstName = nameParts[0] ?? 'Candidato';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const namePart = lastName ? `${firstName}${lastName}` : firstName;
      const d = new Date();
      const dateStr = `${String(d.getDate()).padStart(2,'0')}${String(d.getMonth()+1).padStart(2,'0')}${d.getFullYear()}`;
      const filename = `Dossie_${namePart}_${dateStr}.pdf`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF gerado', { description: `Arquivo ${filename} baixado.` });
      onOpenChange(false);
    } catch (e) {
      console.error('Erro PDF Dossiê:', e);
      toast.error('Erro ao gerar PDF', { description: 'Tente novamente em alguns instantes.' });
    } finally {
      setGenerating(false);
    }
  };

  const baseSections = SECTIONS.filter(s => s.group === 'base');
  const empresaSections = SECTIONS.filter(s => s.group === 'empresa');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            Exportar Dossiê do Candidato
          </DialogTitle>
          <DialogDescription>
            Documento interno confidencial. Escolha o template e selecione as seções a incluir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Templates */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Template</Label>
            <RadioGroup
              value={template}
              onValueChange={v => setTemplate(v as PDFEmpresaTemplateType)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {TEMPLATES.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.value}>
                    <RadioGroupItem value={t.value} id={`tpl-${t.value}`} className="peer sr-only" />
                    <Label
                      htmlFor={`tpl-${t.value}`}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <Icon className="h-5 w-5 mb-1 text-primary" />
                      <span className="text-sm font-medium">{t.label}</span>
                      <span className="text-[10px] text-muted-foreground text-center mt-0.5">{t.description}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <Separator />

          {/* Seções base */}
          <TooltipProvider>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Currículo</Label>
              <div className="grid grid-cols-2 gap-2">
                {baseSections.map(s => {
                  const available = s.isAvailable(data);
                  const checkbox = (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`sec-${s.key}`}
                        checked={sections[s.key]}
                        disabled={!available}
                        onCheckedChange={() => toggle(s.key)}
                      />
                      <Label
                        htmlFor={`sec-${s.key}`}
                        className={`text-sm cursor-pointer ${!available ? 'text-muted-foreground' : ''}`}
                      >
                        {s.label}
                      </Label>
                    </div>
                  );
                  return available ? (
                    <div key={s.key}>{checkbox}</div>
                  ) : (
                    <Tooltip key={s.key}>
                      <TooltipTrigger asChild><div>{checkbox}</div></TooltipTrigger>
                      <TooltipContent>{s.unavailableHint}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Seções empresa */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Visão da Empresa</Label>
              <div className="grid grid-cols-2 gap-2">
                {empresaSections.map(s => {
                  const available = s.isAvailable(data);
                  const checkbox = (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`sec-${s.key}`}
                        checked={sections[s.key]}
                        disabled={!available}
                        onCheckedChange={() => toggle(s.key)}
                      />
                      <Label
                        htmlFor={`sec-${s.key}`}
                        className={`text-sm cursor-pointer ${!available ? 'text-muted-foreground' : ''}`}
                      >
                        {s.label}
                      </Label>
                    </div>
                  );
                  return available ? (
                    <div key={s.key}>{checkbox}</div>
                  ) : (
                    <Tooltip key={s.key}>
                      <TooltipTrigger asChild><div>{checkbox}</div></TooltipTrigger>
                      <TooltipContent>{s.unavailableHint}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>

          <Separator />

          {/* Opções */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Opções</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-links"
                checked={includeLinks}
                onCheckedChange={c => setIncludeLinks(c as boolean)}
              />
              <Label htmlFor="include-links" className="text-sm cursor-pointer flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5" />
                Incluir link do LinkedIn
              </Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancelar
          </Button>
          <Button onClick={handleDownload} disabled={generating}>
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando…</>
            ) : (
              <><FileDown className="h-4 w-4 mr-2" /> Baixar PDF</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 3: Commit**
```bash
git add src/components/empresa/pdf/ExportCandidateProfileModal.tsx
git commit -m "feat(pdf): add ExportCandidateProfileModal with section selection and tooltips"
```

---

### Task 24: Substituir handler fake em `CandidateProfile.tsx`

**Files:**
- Modify: `src/pages/empresa/CandidateProfile.tsx`

- [ ] **Step 1: Adicionar imports**
```tsx
import { ExportCandidateProfileModal } from '@/components/empresa/pdf/ExportCandidateProfileModal';
import type { PDFEmpresaData } from '@/components/empresa/pdf/types';
```

- [ ] **Step 2: Adicionar state**
```tsx
const [exportModalOpen, setExportModalOpen] = useState(false);
```

- [ ] **Step 3: Substituir o handler**

Localizar `handleExportProfile` (linha ~556) e substituir por:
```tsx
const handleExportProfile = () => {
  if (!candidate || !currentCompany) {
    toast.error('Dados incompletos para exportar perfil');
    return;
  }
  setExportModalOpen(true);
};
```

- [ ] **Step 4: Montar o objeto `PDFEmpresaData`**

Logo antes do `return` do componente, ou via `useMemo`:
```tsx
const exportData = useMemo<PDFEmpresaData | null>(() => {
  if (!candidate || !currentCompany) return null;
  return {
    curriculum: profile,
    candidate: {
      id: candidate.id,
      name: getCandidateDisplayName(candidate),
      email: candidate.email,
      phone: candidate.phone,
      avatar: candidate.avatar,
      city: candidate.city,
      state: candidate.state,
    },
    company: {
      id: currentCompany.id,
      name: currentCompany.name ?? 'Empresa',
      logoUrl: currentCompany.logoUrl ?? null,
    },
    application: selectedApplication ? {
      id: selectedApplication.id,
      jobTitle: selectedApplication.job?.title,
      status: selectedApplication.status,
      createdAt: selectedApplication.createdAt,
    } : null,
    matchResult: matchResult ? {
      overallScore: matchResult.overallScore,
      technicalScore: matchResult.technicalScore,
      experienceScore: matchResult.experienceScore,
      behavioralScore: matchResult.behavioralScore,
      strengths: matchResult.strengths?.map(s => typeof s === 'string' ? s : s.text ?? s.label ?? ''),
      opportunities: matchResult.opportunities?.map(o => typeof o === 'string' ? o : o.text ?? o.label ?? ''),
    } : null,
    gaugeProResult: gaugeProResult ? {
      archetype: gaugeProResult.archetype?.name ?? gaugeProResult.archetypeName,
      archetypeDescription: gaugeProResult.archetype?.description,
      dimensions: Object.entries(gaugeProResult.dimensions ?? {}).map(([name, score]) => ({
        name,
        score: typeof score === 'number' ? score : 0,
      })),
    } : null,
    applicationNotes: (notes ?? []).map(n => ({
      id: n.id,
      candidateId: candidate.id,
      companyId: currentCompany.id,
      authorId: n.authorId ?? '',
      authorName: n.author,
      authorAvatar: null,
      content: n.content,
      createdAt: n.createdAt,
      updatedAt: n.createdAt,
      isDeleted: false,
    })),
    candidateNotes,
    applicationHistory: undefined,    // adicionar quando hook estiver pronto
    practicalAnalysis: undefined,
    interviews: undefined,
    highlights: undefined,
    favoriteEvaluation: { isFavorite, tags: [] },
    languages: undefined,
    availability: undefined,
    activityLog: undefined,
  };
}, [candidate, currentCompany, profile, selectedApplication, matchResult, gaugeProResult, notes, candidateNotes, isFavorite]);
```

> Nota: as fontes de dados não cobertas (`applicationHistory`, `interviews`, etc.) ficam undefined — as seções correspondentes aparecem como desabilitadas no modal (já tratado em `SECTIONS.isAvailable`). Cobrir progressivamente depois.

- [ ] **Step 5: Adicionar `useCandidateNotes` no topo do componente**

```tsx
import { useCandidateNotes } from '@/hooks/useCandidateNotesQuery';
// ...
const { data: candidateNotes } = useCandidateNotes(candidate?.id, currentCompany?.id);
```

- [ ] **Step 6: Renderizar o modal**

Próximo aos outros modals/dialogs:
```tsx
{exportData && (
  <ExportCandidateProfileModal
    open={exportModalOpen}
    onOpenChange={setExportModalOpen}
    data={exportData}
  />
)}
```

- [ ] **Step 7: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

Ajustar shapes que diferirem do tipo real (`matchResult.strengths`, `gaugeProResult.dimensions`, etc.) — abrir os tipos relevantes em `src/types/disc.ts` e `src/types/gaugePro.ts`.

- [ ] **Step 8: Teste manual no browser**

```bash
npm run dev
```
- Login empresa
- Abrir candidato (com candidatura selecionada)
- Clicar "Exportar Perfil" → modal abre
- Trocar entre 4 templates
- Marcar/desmarcar seções
- Verificar tooltips em seções desabilitadas
- Clicar "Baixar PDF" → arquivo `Dossie_NomeCandidato_DDMMAAAA.pdf` baixa
- Abrir PDF: verificar capa (template Dossiê), header, footer "Documento Interno - Uso Restrito", paginação
- Repetir abrindo um candidato direto do Banco de Talentos (sem candidatura): seções de candidatura aparecem desabilitadas

- [ ] **Step 9: Commit**
```bash
git add src/pages/empresa/CandidateProfile.tsx
git commit -m "feat(empresa): wire up Exportar Perfil to functional Dossie modal"
```

---

## Phase 5 — Versionamento e Changelog

### Task 25: Bump versão + changelog

**Files:**
- Modify: `package.json`
- Modify: `src/constants/app.ts`
- Modify: `public/changelog.json`

- [ ] **Step 1: Bumpar version em `package.json`**

Mudar `"version": "1.59.0"` → `"version": "1.60.0"`.

- [ ] **Step 2: Atualizar constantes**

Em `src/constants/app.ts`:
```ts
export const APP_VERSION = '1.60.0';
export const APP_CODENAME = 'Dossier';
```

- [ ] **Step 3: Atualizar `public/changelog.json`**

- Marcar versão atual existente como `isCurrent: false`
- Adicionar nova entrada no topo:

```json
{
  "version": "1.60.0",
  "codename": "Dossier",
  "date": "2026-05-06",
  "isCurrent": true,
  "items": [
    {
      "type": "added",
      "title": "Notas internas perenes sobre candidatos",
      "description": "Recrutadores podem registrar observações que persistem entre vagas, invisíveis ao candidato.",
      "details": {
        "0": {
          "description": "Nova tabela candidate_notes com RLS bloqueando candidatos. Card 'Notas sobre o Candidato' no detalhamento. Audit trail completo via candidate_notes_history (criação, edição, exclusão e restauração rastreadas).",
          "files": [
            "sql/migrations/098_candidate_notes.sql",
            "src/services/candidateNotes/candidateNotesService.supabase.ts",
            "src/hooks/useCandidateNotesQuery.ts",
            "src/components/empresa/notes/CandidateNotesCard.tsx"
          ],
          "routes": ["/empresa/candidatos/:id"]
        }
      }
    },
    {
      "type": "added",
      "title": "Audit trail em notas de candidatura",
      "description": "Edições e exclusões em application_notes agora geram histórico rastreável.",
      "details": {
        "0": {
          "description": "Soft delete + tabela application_notes_history + triggers de log. Modal de histórico com diff visual entre versões.",
          "files": [
            "sql/migrations/099_application_notes_audit.sql",
            "src/services/applications/applicationsService.supabase.ts",
            "src/components/empresa/notes/NoteHistoryModal.tsx"
          ],
          "routes": ["/empresa/candidatos/:id"]
        }
      }
    },
    {
      "type": "added",
      "title": "Exportação de Dossiê do Candidato em PDF",
      "description": "Novo modal de exportação com 4 templates e até 19 seções configuráveis para visão da empresa.",
      "details": {
        "0": {
          "description": "Templates Clássico, Moderno, Minimalista e Dossiê (com capa + sumário executivo). Seções incluem Match Score, análise Gauge-Pro, notas internas, histórico de candidaturas, entrevistas, destaques, idiomas, disponibilidade e activity log. Rodapé 'Documento Interno - Uso Restrito' em todas as páginas.",
          "files": [
            "src/components/empresa/pdf/PDFEmpresaDocument.tsx",
            "src/components/empresa/pdf/ExportCandidateProfileModal.tsx",
            "src/components/empresa/pdf/templates/PDFTemplateDossie.tsx",
            "src/components/empresa/pdf/sections/"
          ],
          "routes": ["/empresa/candidatos/:id"]
        }
      }
    },
    {
      "type": "fixed",
      "title": "Botão 'Exportar Perfil' agora funciona",
      "description": "Anteriormente o botão apenas exibia um toast falso sem produzir nenhum arquivo.",
      "details": {
        "0": {
          "description": "Handler substituído por integração com o modal de Dossiê funcional. Suporta exportação com ou sem candidatura selecionada (seções dependentes ficam desabilitadas com tooltip explicativo).",
          "files": ["src/pages/empresa/CandidateProfile.tsx"],
          "routes": ["/empresa/candidatos/:id"]
        }
      }
    },
    {
      "type": "changed",
      "title": "Botão 'Adicionar Anotação' vira menu de escopo",
      "description": "Agora oferece duas opções: 'Sobre esta candidatura' (contextual) e 'Sobre o candidato' (perene).",
      "details": {
        "0": {
          "description": "Cada opção rola até o card respectivo e foca o editor de nota. Item 'Sobre esta candidatura' fica desabilitado quando não há candidatura selecionada.",
          "files": ["src/pages/empresa/CandidateProfile.tsx"],
          "routes": ["/empresa/candidatos/:id"]
        }
      }
    }
  ]
}
```

- [ ] **Step 4: Type check + lint**
```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 5: Verificar que página "Sobre" exibe a nova versão**

```bash
npm run dev
```
Acessar `/sobre` (ou rota equivalente). Confirmar que v1.60.0 "Dossier" aparece como atual e o accordion expande sem erros.

- [ ] **Step 6: Commit**
```bash
git add package.json src/constants/app.ts public/changelog.json
git commit -m "chore(release): v1.60.0 'Dossier' — Dossie Empresa + internal notes"
```

---

## End-to-End Verification

### Task 26: Smoke test final + cenários LGPD

- [ ] **Step 1: Verificar isolamento entre empresas**

Login como `rh@inovacaodigital.com`. Acessar candidato compartilhado com TechSolutions. Confirmar que **NÃO** vê notas criadas pela TechSolutions.

- [ ] **Step 2: Verificar bloqueio para candidato**

Login como `joao.santos@email.com`. Tentar acessar `/candidato/perfil` ou outras rotas de candidato. Confirmar que nenhum endpoint lista `candidate_notes` (verificar Network no DevTools — deve retornar 0 linhas mesmo se chamar a API).

- [ ] **Step 3: Verificar audit trail end-to-end**

Como TechSolutions:
1. Criar nota → abrir histórico → ver 1 entrada 'created'
2. Editar nota → abrir histórico → ver 'updated' com previous + new
3. Excluir nota → abrir histórico via SQL (porque a UI esconde deletadas) ou pela própria nota recém-criada antes de deletar (capturar id) → ver 'deleted'

- [ ] **Step 4: Verificar PDF em todos os templates**

Gerar 4 PDFs (um por template) com todas as seções marcadas. Conferir cada um abre corretamente, tem header/footer, e seções estão presentes.

- [ ] **Step 5: Confirmar no banco que tudo persistiu**

Via MCP `execute_sql`:
```sql
SELECT count(*) FROM public.candidate_notes WHERE is_deleted = false;
SELECT count(*) FROM public.candidate_notes_history;
SELECT count(*) FROM public.application_notes_history;
```

Esperado: contagens consistentes com as ações tomadas no smoke test.

- [ ] **Step 6: Sem commit (apenas verificação)**

Se algum problema, voltar à task afetada e corrigir.

---

## Self-Review (executar ao final)

- [ ] Todas as seções do spec estão cobertas em alguma task? (mapa: dados → 1-3, services → 5-8, UI notas → 9-14, PDF → 15-24, release → 25)
- [ ] Sem placeholders TODO/TBD nos steps?
- [ ] Tipos `CandidateNote`, `NoteHistoryEntry`, `PDFEmpresaSectionConfig` consistentes entre tasks?
- [ ] Handler novo em `CandidateProfile.tsx` substitui o fake (linha 556)?
- [ ] Migrações 098/099 aplicadas via MCP **e** salvas em `sql/migrations/`?
- [ ] Cards de notas referenciam `currentCompany.id` (corretamente do `useAuth`)?

---

## Notas para o implementador

1. **Tipos do `Curriculum`**: o shape pode diferir do que o plano assume. Antes de Task 17, abrir `src/types/curriculum.ts` (se existir) e ajustar.
2. **Hook `useApplicationNotes`**: já existe — verificar shape retornado e ajustar o `adaptApplicationNote` no Task 13 para mapear corretamente.
3. **Hook `useFavoriteCandidates`**: pode retornar shape diferente; se `isFavorite` não for direto, ajustar Task 24 step 4.
4. **`@react-pdf/renderer`**: já é dependência do projeto (usado em `src/components/candidato/pdf/`). Não precisa instalar.
5. **`date-fns`**: também já é dependência (verificar `package.json` se em dúvida).
6. **MCP Supabase**: usar `apply_migration` para aplicar e simultaneamente salvar SQL local em `sql/migrations/` para versionamento.
7. **Shape de RLS / `get_company_id`**: a memória do projeto registra que `get_company_id` exige `(auth.uid())` — sempre passar o argumento.
