# Dossiê Empresa + Notas Internas — Design

**Data:** 2026-05-06
**Autor:** Edmilson Souza (com brainstorming Claude)
**Status:** Aprovado para implementação
**Branch sugerida:** `feat/dossie-empresa-notas`

---

## 1. Problema

No detalhamento do candidato (`/empresa/candidatos/:id` em `src/pages/empresa/CandidateProfile.tsx`), o botão **"Exportar Perfil"** dispara apenas um `toast.success` falso (linha 556-558) sem produzir nenhum arquivo. Além disso, o sistema atual de notas internas (`application_notes`) é por candidatura, não cobrindo o caso de uso de "memória da empresa sobre o candidato" que persiste entre vagas.

## 2. Objetivos

1. Implementar exportação de PDF "Dossiê Empresa" com seções específicas para tomada de decisão de recrutadores (match score, comportamental, notas, histórico).
2. Adicionar segundo escopo de notas internas: por candidato + empresa (perenes), sem visibilidade para o candidato.
3. Adicionar audit trail completo (criação, edição, exclusão) em ambos os escopos de notas (`application_notes` e `candidate_notes`).
4. Modelo de permissões liberal nas notas (qualquer membro da empresa edita/deleta), mas com rastreabilidade total.

## 3. Não-objetivos

- Não substituir o sistema atual de `application_notes` — coexistem.
- Não criar templates novos para o lado candidato (modal `ExportPDFModal` em `src/components/candidato/` permanece intocado).
- Não gerar análise de IA on-the-fly no PDF (sumário executivo do template Dossiê é estático/mecânico, não generativo).
- Não suportar mídia (imagens/anexos) em notas — texto puro apenas.

---

## 4. Arquitetura

### 4.1 Camada de dados (Supabase)

**Migração nova `0XX_candidate_notes_and_audit.sql`:**

```sql
-- Tabela: notas perenes por candidato + empresa
CREATE TABLE public.candidate_notes (
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

CREATE INDEX idx_candidate_notes_candidate_company
  ON public.candidate_notes(candidate_id, company_id) WHERE is_deleted = false;
CREATE INDEX idx_candidate_notes_company ON public.candidate_notes(company_id);

-- Audit trail
CREATE TABLE public.candidate_notes_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.candidate_notes(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'restored')),
  actor_id uuid NOT NULL REFERENCES public.profiles(id),
  previous_content text,
  new_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_candidate_notes_history_note ON public.candidate_notes_history(note_id, created_at DESC);

-- Trigger: registra mudanças
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
      VALUES (NEW.id, 'deleted', NEW.deleted_by, OLD.content);
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

CREATE TRIGGER trg_candidate_note_audit
  BEFORE INSERT OR UPDATE ON public.candidate_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_candidate_note_change();

-- RLS
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidate_notes_select_company" ON public.candidate_notes
  FOR SELECT TO authenticated
  USING (company_id = public.get_company_id(auth.uid()) OR public.get_user_type(auth.uid()) = 'admin');

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

-- DELETE não exposto via policy (forçar soft delete pela aplicação)

CREATE POLICY "candidate_notes_history_select_company" ON public.candidate_notes_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_notes cn
      WHERE cn.id = candidate_notes_history.note_id
        AND (cn.company_id = public.get_company_id(auth.uid()) OR public.get_user_type(auth.uid()) = 'admin')
    )
  );
```

**Migração `0XX_application_notes_audit.sql`** (estende o existente):

```sql
ALTER TABLE public.application_notes
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN is_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN deleted_at timestamptz,
  ADD COLUMN deleted_by uuid REFERENCES public.profiles(id);

CREATE TABLE public.application_notes_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.application_notes(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'restored')),
  actor_id uuid NOT NULL REFERENCES public.profiles(id),
  previous_content text,
  new_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_application_notes_history_note
  ON public.application_notes_history(note_id, created_at DESC);

-- Função de log e trigger espelhando candidate_notes
CREATE OR REPLACE FUNCTION public.log_application_note_change() ...; -- mesmo padrão

CREATE TRIGGER trg_application_note_audit
  BEFORE INSERT OR UPDATE ON public.application_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_application_note_change();

-- Adicionar policies UPDATE (que hoje não existem)
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
        AND (j.company_id = public.get_company_id(auth.uid()) OR public.get_user_type(auth.uid()) = 'admin')
    )
  );
```

### 4.2 Camada de serviço

**Novo módulo `src/services/candidateNotes/`:**

```ts
// types
export interface CandidateNote {
  id: string;
  candidateId: string;
  companyId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface NoteHistoryEntry {
  id: string;
  noteId: string;
  action: 'created' | 'updated' | 'deleted' | 'restored';
  actorId: string;
  actorName?: string;
  previousContent?: string;
  newContent?: string;
  createdAt: string;
}

// candidateNotesService.ts
export interface CandidateNotesService {
  list(candidateId: string, companyId: string, opts?: { includeDeleted?: boolean }): Promise<CandidateNote[]>;
  listHistory(noteId: string): Promise<NoteHistoryEntry[]>;
  create(input: { candidateId: string; companyId: string; content: string }): Promise<CandidateNote>;
  update(noteId: string, content: string): Promise<CandidateNote>;
  softDelete(noteId: string): Promise<void>;
  restore(noteId: string): Promise<CandidateNote>;
}
```

**Estender `src/services/applications/applicationsService.ts`:**
```ts
updateNote(noteId: string, content: string): Promise<ApplicationNote>;
softDeleteNote(noteId: string): Promise<void>;
restoreNote(noteId: string): Promise<ApplicationNote>;
listNoteHistory(noteId: string): Promise<NoteHistoryEntry[]>;
```

### 4.3 Hooks React Query

Novo `src/hooks/useCandidateNotesQuery.ts`:
```ts
export const candidateNoteKeys = {
  all: ['candidateNotes'] as const,
  list: (candidateId: string, companyId: string) =>
    [...candidateNoteKeys.all, 'list', candidateId, companyId] as const,
  history: (noteId: string) =>
    [...candidateNoteKeys.all, 'history', noteId] as const,
};

useCandidateNotes(candidateId, companyId)
useCandidateNoteHistory(noteId)
useCreateCandidateNote()
useUpdateCandidateNote()
useDeleteCandidateNote()
useRestoreCandidateNote()
```

Estender `src/hooks/useApplicationsQuery.ts`:
```ts
useApplicationNoteHistory(noteId)
useUpdateApplicationNote()
useDeleteApplicationNote()
useRestoreApplicationNote()
```

Cada mutation invalida cache + dispara evento em `useCandidateActivity` (action: `note_created` / `note_updated` / `note_deleted`).

### 4.4 UI das notas

**Novos componentes `src/components/empresa/notes/`:**

| Componente | Responsabilidade |
|---|---|
| `NoteListItem.tsx` | Renderiza uma nota: avatar autor, nome, timestamps (`createdAt` + "editado em X" se diferente), texto, menu kebab (Editar/Excluir/Histórico) |
| `NoteEditor.tsx` | Textarea com contador `{n}/2000`, validação min 1 char, botões Salvar/Cancelar; aceita modo "create" e "edit" |
| `NoteHistoryModal.tsx` | Dialog com timeline vertical: cada entrada mostra ação, autor, timestamp, e diff (previous → new) com cores |
| `CandidateNotesCard.tsx` | Card "Notas sobre o Candidato": título + descrição + lista (cronológica reversa) + botão "Adicionar nota"; usa `useCandidateNotes` |
| `ApplicationNotesCard.tsx` | Card "Notas desta Candidatura": idêntico mas escopo `application_id`; usa `useApplicationNotes` (hook existente) |

**Layout em `CandidateProfile.tsx`:**
- Inserir os dois cards no corpo principal, abaixo do bloco "Formação Acadêmica"
- `ApplicationNotesCard` só renderiza se `selectedApplication` existir
- `CandidateNotesCard` sempre renderiza (passa `candidate.id` + `currentCompany.id`)
- Substituir botão "Adicionar Anotação" da sidebar por `DropdownMenu`:
  - Item 1: "Sobre esta candidatura" (disabled se sem application) → scroll + foco no editor
  - Item 2: "Sobre o candidato" → scroll + foco no editor
- Refs nos cards para suportar o scroll programático

### 4.5 Sistema de PDF "Dossiê Empresa"

**Estrutura `src/components/empresa/pdf/`:**

```
ExportCandidateProfileModal.tsx     -- modal específico empresa
PDFEmpresaDocument.tsx              -- raiz, roteia por template
templates/
  PDFTemplateClassic.tsx            -- delegates pro pkg do candidato
  PDFTemplateModern.tsx             -- idem
  PDFTemplateMinimal.tsx            -- idem
  PDFTemplateDossie.tsx             -- NOVO (capa + sumário executivo + seções)
sections/
  Header.tsx                        -- logo empresa + nome empresa (top de cada página exceto capa)
  Footer.tsx                        -- "Documento Interno - Uso Restrito | {empresa} | gerado em DD/MM/AAAA HH:mm"
  CoverPage.tsx                     -- só no Dossiê
  ExecutiveSummary.tsx              -- só no Dossiê
  MatchScoreSection.tsx
  GaugeProAnalysisSection.tsx
  InternalNotesSection.tsx          -- combina app notes + candidate notes (subtítulos)
  ApplicationHistorySection.tsx
  PracticalAnalysisSection.tsx
  InterviewsSection.tsx
  HighlightsSection.tsx
  FavoriteEvaluationSection.tsx
  LanguagesSection.tsx
  AvailabilitySection.tsx
  ActivityLogSection.tsx
styles.ts                           -- paleta empresa (navy + cyan + neutros)
types.ts                            -- PDFEmpresaSectionConfig, PDFEmpresaTemplateType
```

**Tipos:**
```ts
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

export interface PDFEmpresaData {
  curriculum: Curriculum;
  candidate: Candidate;
  company: Company;                  // empresa exportadora
  application?: Application;          // opcional (vaga de contexto)
  matchResult?: MatchResult;
  gaugeProResult?: GaugeProResult;
  applicationNotes?: ApplicationNote[];
  candidateNotes?: CandidateNote[];
  applicationHistory?: Application[];
  practicalAnalysis?: PracticalAnalysis;
  interviews?: Interview[];
  highlights?: ApplicationHighlight[];
  favoriteEvaluation?: { isFavorite: boolean; tags: string[] };
  activityLog?: CandidateActivityEvent[];
}
```

**`ExportCandidateProfileModal`:**
- Props: `data: PDFEmpresaData`, `open`, `onOpenChange`
- Estado interno: `template` (default 'dossie'), `sections` (todas true por default exceto seções sem dados)
- Para cada seção sem dados (ex: `matchResult` undefined): checkbox renderiza `disabled` + tooltip "Sem dados disponíveis"
- Botão "Baixar PDF" gera blob via `pdf(<PDFEmpresaDocument data={data} template={template} sections={sections} />).toBlob()`
- Filename: `Dossie_{Nome}_{DDMMAAAA}.pdf`

**Substituição em `CandidateProfile.tsx`:**
```tsx
// Estado
const [exportModalOpen, setExportModalOpen] = useState(false);

// Pré-carregar dados (alguns hooks já existem, outros adicionar)
const { data: profile } = useProfile(candidate?.id || '');
const { data: gaugeProResult } = useGaugeProResultByCandidate(candidate?.id);
const { data: candidateNotes } = useCandidateNotes(candidate?.id, currentCompany?.id);
const { data: applicationHistory } = useApplicationsByCandidateAndCompany(candidate?.id, currentCompany?.id);
const { data: interviews } = useCompanyInterviews(/* filtro por candidato */);
const { data: highlights } = useApplicationHighlights(selectedApplication?.id);

const handleExportProfile = () => setExportModalOpen(true);

// JSX
<ExportCandidateProfileModal
  open={exportModalOpen}
  onOpenChange={setExportModalOpen}
  data={{
    curriculum: profile,
    candidate,
    company: currentCompany,
    application: selectedApplication,
    matchResult,
    gaugeProResult,
    applicationNotes: notes,
    candidateNotes,
    applicationHistory,
    interviews,
    highlights,
    favoriteEvaluation: { isFavorite, tags: [] },
    activityLog: candidateActivity,
  }}
/>
```

**Layout do template "Dossiê":**
- Página 1 (capa): logo empresa + título grande "Dossiê do Candidato" + nome candidato + cargo da vaga (se houver) + data de geração + carimbo "CONFIDENCIAL"
- Página 2 (sumário executivo): bloco com nome, foto (se houver), match score destacado em badge grande colorido (verde/amarelo/vermelho), 2-3 linhas de sumário (puxado de `summary` do curriculum), badges de tags principais
- Páginas seguintes: cada seção marcada renderiza com header próprio
- Header recorrente (top): logo empresa + nome candidato (pequeno, à direita)
- Footer recorrente: "Documento Interno - Uso Restrito | {empresa} | gerado em {data} | página {n}/{total}"

---

## 5. Edge cases

| Caso | Comportamento |
|---|---|
| Sem candidatura ativa | `ApplicationNotesCard` oculto; `matchScore`, `practicalAnalysis`, `highlights` checkboxes desabilitados no modal |
| Sem logo da empresa | Header usa initial fallback (mesma lógica do avatar) |
| Edição concorrente | Last-write-wins; histórico captura todas as versões |
| Nota deletada | Some da lista padrão; modal de histórico mostra ação 'deleted'; admin pode optar por "Mostrar deletadas" (toggle no card, fase 2 — não escopo agora) |
| Sem dados Gauge-Pro | Checkbox desabilitado; se forçado, seção mostra "Avaliação não realizada" |
| PDF longo | `@react-pdf/renderer` faz paginação automática; testar com 13 seções marcadas |
| Activity log muito longo | Truncar para últimos 20 eventos relevantes na seção do PDF |

---

## 6. Permissões (resumo)

- **Leitura de notas:** todos os membros da `company_id` (Liberal)
- **Criação:** todos os membros da `company_id` (`author_id = auth.uid()`)
- **Edição:** todos os membros da `company_id` (Liberal)
- **Exclusão:** todos os membros da `company_id` (soft delete via UPDATE; DELETE físico bloqueado)
- **Histórico:** todos os membros da `company_id` (audit trail visível para todos)
- **Candidato:** zero acesso (sem policy de SELECT)
- **Admin global:** acesso total via `get_user_type(auth.uid()) = 'admin'`

---

## 7. Testes manuais (golden path)

1. **Criar nota sobre candidato** → aparece no card, history registra 'created'
2. **Editar nota** → texto muda, badge "editado em X" aparece, history registra 'updated' com previous_content
3. **Deletar nota** → some da lista, history registra 'deleted'
4. **Login como segundo recrutador** → vê notas do colega, consegue editar/deletar (Liberal); history registra novo `actor_id`
5. **Login como candidato** → não vê NADA (chamada Supabase retorna lista vazia ou 403)
6. **Login como empresa B** → não vê notas da empresa A sobre o mesmo candidato
7. **Exportar PDF Dossiê com tudo marcado** → arquivo gerado, abre, todas as seções presentes
8. **Exportar sem candidatura selecionada** → seções de candidatura desabilitadas, PDF gera só com dados perenes
9. **Botão sidebar "Adicionar Anotação"** → dropdown abre, opções fazem scroll + focam editor
10. **Modal de histórico** → mostra timeline completa, diff visual entre versões

---

## 8. Arquivos afetados

**Novos:**
- `sql/migrations/0XX_candidate_notes_and_audit.sql`
- `sql/migrations/0XX_application_notes_audit.sql`
- `src/services/candidateNotes/candidateNotesService.ts`
- `src/services/candidateNotes/candidateNotesService.supabase.ts`
- `src/services/candidateNotes/types.ts`
- `src/hooks/useCandidateNotesQuery.ts`
- `src/components/empresa/notes/NoteListItem.tsx`
- `src/components/empresa/notes/NoteEditor.tsx`
- `src/components/empresa/notes/NoteHistoryModal.tsx`
- `src/components/empresa/notes/CandidateNotesCard.tsx`
- `src/components/empresa/notes/ApplicationNotesCard.tsx`
- `src/components/empresa/pdf/ExportCandidateProfileModal.tsx`
- `src/components/empresa/pdf/PDFEmpresaDocument.tsx`
- `src/components/empresa/pdf/templates/PDFTemplateDossie.tsx`
- `src/components/empresa/pdf/sections/*.tsx` (11 seções + Header + Footer + CoverPage + ExecutiveSummary)
- `src/components/empresa/pdf/styles.ts`
- `src/components/empresa/pdf/types.ts`
- `src/types/notes.ts` (CandidateNote, NoteHistoryEntry)

**Modificados:**
- `src/pages/empresa/CandidateProfile.tsx` (handleExportProfile + cards de notas + dropdown sidebar)
- `src/services/applications/applicationsService.ts` (interface)
- `src/services/applications/applicationsService.supabase.ts` (impl)
- `src/hooks/useApplicationsQuery.ts` (history + update + delete + restore)
- `src/types/database.ts` (tipos das novas tabelas — gerar via MCP Supabase)

---

## 9. Versão & Changelog

- Bump: **MINOR** (1.60.0 → 1.61.0)
- Codename sugerido: **"Dossier"**
- Categorias do changelog: `Added` (notas perenes, PDF Dossiê, audit trail), `Fixed` (botão Exportar Perfil que não funcionava), `Changed` (botão sidebar vira dropdown)

---

## 10. Decisões abertas (resolvidas durante implementação)

- Exato nome em PT do template: "Dossiê" (vs "Executivo" / "Empresarial") — fica "Dossiê"
- Layout fino do template Dossiê (cores, tipografia, espaçamentos): refinar com agente `frontend-design` durante implementação
- Lista de cores do badge de match score: verde (≥80), amarelo (60-79), laranja (40-59), vermelho (<40)
