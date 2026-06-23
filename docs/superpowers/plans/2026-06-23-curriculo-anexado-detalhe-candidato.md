# Currículo anexado na tela de detalhes do candidato — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir, na tela de detalhes do candidato (empresa), o currículo PDF e o vídeo de apresentação que o candidato anexou, liberados somente após o aceite do termo de consentimento LGPD.

**Architecture:** A view mascarada `curriculums_for_company` passa a expor 7 colunas de documentos (mascaradas por consentimento). O service/hook já mapeiam esses campos — nenhuma mudança ali. No frontend, um novo card read-only renderiza os anexos; quando o candidato está em processo mas sem consentimento, mostra um card "bloqueado".

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind + shadcn/ui, Supabase (Postgres view + Storage público), Vitest.

## Global Constraints

- Conteúdo voltado ao usuário em **português do Brasil** com acentuação correta (ã, ç, é, í, ó, ú, â, ê, ô).
- Código (identificadores, comentários) em **inglês**; DB em `snake_case`, TS em `camelCase`.
- Edge/DB: a tabela `curriculums` **não** tem SELECT direto para company (migration 113) — acesso só pela view.
- Bucket `candidate-documents` é **público** (`getPublicUrl` funciona em nova aba).
- `changelog.json`: cada item DEVE ter `details` com `description` (string), `files` (string[]), `routes` (string[]); tipos válidos: `added|changed|deprecated|removed|fixed|security`; **exatamente uma** versão com `isCurrent: true`.
- Liberação dos documentos = **só com consentimento**: `get_user_type(auth.uid())='admin' OR company_has_data_consent(get_company_id(auth.uid()), candidate_id)`. **Não** usar `company_has_application_from_candidate` para os documentos (esse carve-out continua exclusivo do telefone).
- Última migration aplicada: **116** → a nova é **117**. Versão atual: **1.68.1 "Beacon"** → bump MINOR para **1.69.0**.

---

### Task 1: Migration 117 — expor documentos na view `curriculums_for_company`

**Files:**
- Create: `sql/migrations/117_expose_documents_in_company_view.sql`
- Apply: via MCP Supabase `apply_migration` (name: `expose_documents_in_company_view`)

**Interfaces:**
- Consumes: funções existentes `get_user_type(uuid)`, `get_company_id(uuid)`, `company_has_data_consent(uuid,uuid)`, `company_has_application_from_candidate(uuid,uuid)`.
- Produces: a view `public.curriculums_for_company` passa a conter as colunas `resume_pdf_url`, `resume_pdf_name`, `resume_pdf_size`, `resume_pdf_uploaded_at`, `presentation_video_url`, `presentation_video_type`, `presentation_video_name` (mascaradas por consentimento). O mapper `rowToCurriculum` já as lê via `select('*')`.

- [ ] **Step 1: Criar o arquivo da migration**

Criar `sql/migrations/117_expose_documents_in_company_view.sql` com o conteúdo abaixo (preserva integralmente a definição da migration 116 — predicado do WHERE, máscara de e-mail/CPF e carve-out de telefone — e adiciona os 7 campos de documentos mascarados por consentimento):

```sql
-- Migration 117: expose the candidate's attached documents (resume PDF + presentation
-- video) to the company through curriculums_for_company, MASKED BY CONSENT — same rule
-- as email/cpf/date_of_birth (admin OR accepted data disclosure).
--
-- Rationale: the resume PDF typically contains email/cpf/phone, which the LGPD consent
-- system keeps hidden until the candidate accepts the data-sharing term. So the documents
-- are revealed ONLY with an accepted disclosure — NOT under the in-process phone carve-out.
--
-- This only ADDS 7 masked columns. The WHERE-clause visibility predicate, the
-- email/cpf masking and the phone in-process reveal are kept exactly as migration 116.

CREATE OR REPLACE VIEW public.curriculums_for_company
WITH (security_invoker = off) AS
SELECT
  cu.id,
  cu.candidate_id,
  cu.name,
  cu.title,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.email ELSE NULL END AS email,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.phone ELSE NULL END AS phone,
  cu.location,
  cu.city,
  cu.state,
  cu.linkedin,
  cu.about,
  cu.availability,
  cu.salary_min,
  cu.salary_max,
  cu.is_default,
  cu.is_archived,
  cu.created_at,
  cu.updated_at,
  -- Documents (resume PDF + presentation video): revealed only with consent.
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_url ELSE NULL END AS resume_pdf_url,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_name ELSE NULL END AS resume_pdf_name,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_size ELSE NULL END AS resume_pdf_size,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.resume_pdf_uploaded_at ELSE NULL END AS resume_pdf_uploaded_at,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.presentation_video_url ELSE NULL END AS presentation_video_url,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.presentation_video_type ELSE NULL END AS presentation_video_type,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
       THEN cu.presentation_video_name ELSE NULL END AS presentation_video_name
FROM public.curriculums cu
JOIN public.candidates c ON c.id = cu.candidate_id
WHERE public.get_user_type(auth.uid()) = 'admin'
  OR (
    public.get_user_type(auth.uid()) = 'company'
    AND (
      c.visibility_mode IS DISTINCT FROM 'private'
      OR EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        WHERE a.candidate_id = c.id
          AND j.company_id = public.get_company_id(auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE (
                tm.imported_from_candidate_id = c.id
                OR tm.email = (SELECT p.email FROM public.profiles p WHERE p.id = c.profile_id)
              )
          AND tm.company_id = public.get_company_id(auth.uid())
          AND tm.is_active = TRUE
      )
    )
  );

GRANT SELECT ON public.curriculums_for_company TO authenticated;

COMMENT ON VIEW public.curriculums_for_company IS
  'Company (masked by consent) + admin (full) parent curriculum view (no child embeds); phone revealed once the candidate is in the company''s selective process; resume PDF + presentation video revealed only with accepted data disclosure';

-- =====================================================
-- ADVERSARIAL VERIFICATION (run to verify, do not apply)
-- =====================================================
-- -- 1) The 7 document columns exist on the view:
-- SELECT array_agg(column_name ORDER BY column_name) AS cols
-- FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='curriculums_for_company'
--   AND column_name IN ('resume_pdf_url','resume_pdf_name','resume_pdf_size',
--                       'resume_pdf_uploaded_at','presentation_video_url',
--                       'presentation_video_type','presentation_video_name');
-- Expected: array with all 7 names.
--
-- -- 2) Company WITHOUT consent (applicant in process): documents NULL, phone filled.
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT phone, resume_pdf_url, presentation_video_url
-- FROM public.curriculums_for_company WHERE candidate_id='<applicant_candidate_id>';
-- ROLLBACK;
-- Expected: phone filled; resume_pdf_url and presentation_video_url = NULL.
--
-- -- 3) Company WITH accepted disclosure: documents filled.
-- INSERT INTO public.candidate_data_disclosures(application_id, candidate_id, company_id, status, accepted_at)
-- VALUES ('<application_id>','<candidate_id>','<company_id>','accepted', now())
-- ON CONFLICT (application_id, company_id) DO UPDATE SET status='accepted', accepted_at=now();
-- BEGIN;
-- SELECT set_config('request.jwt.claims', json_build_object('sub','<company_profile_id>','role','authenticated')::text, true);
-- SET LOCAL role authenticated;
-- SELECT resume_pdf_url, presentation_video_url FROM public.curriculums_for_company WHERE candidate_id='<candidate_id>';
-- ROLLBACK;
-- -- Cleanup: DELETE FROM public.candidate_data_disclosures WHERE application_id='<application_id>' AND company_id='<company_id>';
-- Expected: both filled (when the candidate actually uploaded them).
```

- [ ] **Step 2: Aplicar a migration via MCP Supabase**

Usar a tool `mcp__supabase__apply_migration` com `name: "expose_documents_in_company_view"` e o mesmo SQL (sem o bloco de verificação comentado é opcional; pode enviar o arquivo inteiro — comentários são ignorados).

- [ ] **Step 3: Verificar que as 7 colunas existem (verificação 1)**

Rodar via `mcp__supabase__execute_sql`:

```sql
SELECT array_agg(column_name ORDER BY column_name) AS cols
FROM information_schema.columns
WHERE table_schema='public' AND table_name='curriculums_for_company'
  AND column_name IN ('resume_pdf_url','resume_pdf_name','resume_pdf_size',
                      'resume_pdf_uploaded_at','presentation_video_url',
                      'presentation_video_type','presentation_video_name');
```

Expected: um array com os 7 nomes.

- [ ] **Step 4: Confirmar que o resto da view não regrediu**

Rodar:

```sql
SELECT array_agg(column_name ORDER BY column_name) AS cols
FROM information_schema.columns
WHERE table_schema='public' AND table_name='curriculums_for_company';
```

Expected: contém também `email, phone, location, city, state, linkedin, about, availability, salary_min, salary_max, title, name, id, candidate_id, is_default, is_archived, created_at, updated_at` (nenhuma coluna anterior sumiu).

- [ ] **Step 5: Commit**

```bash
git add sql/migrations/117_expose_documents_in_company_view.sql
git commit -m "feat(lgpd): expose candidate documents in company curriculum view (consent-gated)"
```

---

### Task 2: Extrair helper de thumbnail de vídeo para `src/lib/videoThumbnail.ts` (TDD)

**Files:**
- Create: `src/lib/videoThumbnail.ts`
- Create: `src/lib/__tests__/videoThumbnail.test.ts`
- Modify: `src/components/profile/DocumentsTab.tsx:47-71` (remover cópias locais e importar do novo módulo)

**Interfaces:**
- Produces:
  - `export type VideoThumbnail = { type: 'youtube' | 'vimeo'; id: string } | null;`
  - `export function extractYouTubeId(url: string): string | null;`
  - `export function extractVimeoId(url: string): string | null;`
  - `export function getVideoThumbnail(url: string): VideoThumbnail;`
- Consumes: nada (funções puras).

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/__tests__/videoThumbnail.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { extractYouTubeId, extractVimeoId, getVideoThumbnail } from '@/lib/videoThumbnail';

describe('videoThumbnail', () => {
  it('extracts a YouTube id from a watch URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts a YouTube id from a youtu.be short URL', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for a non-YouTube URL', () => {
    expect(extractYouTubeId('https://example.com/video')).toBeNull();
  });

  it('extracts a Vimeo id', () => {
    expect(extractVimeoId('https://vimeo.com/123456789')).toBe('123456789');
  });

  it('getVideoThumbnail returns youtube descriptor', () => {
    expect(getVideoThumbnail('https://youtu.be/dQw4w9WgXcQ')).toEqual({ type: 'youtube', id: 'dQw4w9WgXcQ' });
  });

  it('getVideoThumbnail returns vimeo descriptor', () => {
    expect(getVideoThumbnail('https://vimeo.com/123456789')).toEqual({ type: 'vimeo', id: '123456789' });
  });

  it('getVideoThumbnail returns null for unknown provider', () => {
    expect(getVideoThumbnail('https://example.com/video.mp4')).toBeNull();
  });
});
```

- [ ] **Step 2: Rodar o teste para confirmar que falha**

Run: `npm run test -- src/lib/__tests__/videoThumbnail.test.ts`
Expected: FAIL — "Failed to resolve import '@/lib/videoThumbnail'" (módulo ainda não existe).

- [ ] **Step 3: Implementar o módulo (mesma lógica hoje em DocumentsTab)**

Criar `src/lib/videoThumbnail.ts`:

```ts
// Video thumbnail helpers shared by the candidate's DocumentsTab (editable)
// and the company's read-only CandidateDocumentsCard.

export type VideoThumbnail = { type: 'youtube' | 'vimeo'; id: string } | null;

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export function getVideoThumbnail(url: string): VideoThumbnail {
  const ytId = extractYouTubeId(url);
  if (ytId) return { type: 'youtube', id: ytId };
  const vimeoId = extractVimeoId(url);
  if (vimeoId) return { type: 'vimeo', id: vimeoId };
  return null;
}
```

- [ ] **Step 4: Rodar o teste para confirmar que passa**

Run: `npm run test -- src/lib/__tests__/videoThumbnail.test.ts`
Expected: PASS (7 testes).

- [ ] **Step 5: Atualizar `DocumentsTab.tsx` para importar do módulo compartilhado**

Em `src/components/profile/DocumentsTab.tsx`:

1. Remover as definições locais (linhas ~47-71): `extractYouTubeId`, `extractVimeoId`, o tipo `VideoThumbnail` e `getVideoThumbnail`.
2. Adicionar o import junto aos demais imports de `@/`:

```ts
import { getVideoThumbnail } from '@/lib/videoThumbnail';
```

(Os usos existentes de `getVideoThumbnail(...)` no componente permanecem iguais.)

- [ ] **Step 6: Verificar build + lint + testes**

Run: `npm run build` → Expected: sucesso, sem novos erros de tipo.
Run: `npm run lint` → Expected: sem novos erros (sem "unused var" de funções removidas).
Run: `npm run test` → Expected: toda a suíte passa.

- [ ] **Step 7: Commit**

```bash
git add src/lib/videoThumbnail.ts src/lib/__tests__/videoThumbnail.test.ts src/components/profile/DocumentsTab.tsx
git commit -m "refactor: extract video thumbnail helpers to shared lib"
```

---

### Task 3: Componente read-only `CandidateDocumentsCard`

**Files:**
- Create: `src/components/empresa/CandidateDocumentsCard.tsx`

**Interfaces:**
- Consumes: `getVideoThumbnail` de `@/lib/videoThumbnail`; primitives shadcn `Card/CardContent/CardHeader/CardTitle`, `Button`; `motion` de framer-motion.
- Produces:
  ```ts
  export interface CandidateDocumentsCardProps {
    resumePdfUrl?: string | null;
    resumePdfName?: string | null;
    resumePdfSize?: number | null;
    resumePdfUploadedAt?: string | null;
    presentationVideoUrl?: string | null;
    presentationVideoType?: 'upload' | 'external' | null;
    presentationVideoName?: string | null;
    delay?: number;
  }
  export function CandidateDocumentsCard(props: CandidateDocumentsCardProps): JSX.Element | null;
  ```
  Retorna `null` quando não há nem PDF nem vídeo.

- [ ] **Step 1: Criar o componente**

Criar `src/components/empresa/CandidateDocumentsCard.tsx`:

```tsx
/**
 * Read-only card that shows the documents a candidate attached to their profile
 * (resume PDF + presentation video) on the company's candidate detail page.
 * Visibility is enforced server-side by the curriculums_for_company view, which
 * masks these fields until the candidate accepts the LGPD data-disclosure term.
 */
import { motion } from 'framer-motion';
import { Paperclip, FileText, Eye, Download, Video, ExternalLink, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getVideoThumbnail } from '@/lib/videoThumbnail';

export interface CandidateDocumentsCardProps {
  resumePdfUrl?: string | null;
  resumePdfName?: string | null;
  resumePdfSize?: number | null;
  resumePdfUploadedAt?: string | null;
  presentationVideoUrl?: string | null;
  presentationVideoType?: 'upload' | 'external' | null;
  presentationVideoName?: string | null;
  delay?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function CandidateDocumentsCard({
  resumePdfUrl,
  resumePdfName,
  resumePdfSize,
  resumePdfUploadedAt,
  presentationVideoUrl,
  presentationVideoType,
  presentationVideoName,
  delay = 0,
}: CandidateDocumentsCardProps): JSX.Element | null {
  const hasResume = !!resumePdfUrl;
  const hasVideo = !!presentationVideoUrl;
  if (!hasResume && !hasVideo) return null;

  const videoThumb =
    hasVideo && presentationVideoType === 'external'
      ? getVideoThumbnail(presentationVideoUrl!)
      : null;

  // Public bucket supports forcing a download with the ?download query param.
  const downloadUrl = resumePdfUrl
    ? `${resumePdfUrl}${resumePdfUrl.includes('?') ? '&' : '?'}download=${encodeURIComponent(
        resumePdfName ?? 'curriculo.pdf',
      )}`
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Currículo Anexado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resume PDF */}
          {hasResume && (
            <div className="flex items-start gap-4 rounded-xl border bg-gradient-to-r from-cyan-500/5 to-transparent p-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <FileText className="h-6 w-6 text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {resumePdfName ?? 'Currículo.pdf'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {typeof resumePdfSize === 'number' && <span>{formatBytes(resumePdfSize)}</span>}
                  {resumePdfUploadedAt && <span>Enviado em {formatDate(resumePdfUploadedAt)}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => window.open(resumePdfUrl!, '_blank', 'noopener,noreferrer')}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Visualizar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Presentation video */}
          {hasVideo && (
            <div className="flex items-start gap-4 rounded-xl border bg-gradient-to-r from-cyan-500/5 to-transparent p-4">
              <div className="relative flex-shrink-0">
                {videoThumb?.type === 'youtube' ? (
                  <div className="relative h-16 w-28 overflow-hidden rounded-lg">
                    <img
                      src={`https://img.youtube.com/vi/${videoThumb.id}/hqdefault.jpg`}
                      alt="Thumbnail do vídeo"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-6 w-6 fill-white text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  Vídeo de apresentação
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {presentationVideoType === 'upload' ? 'Arquivo enviado' : 'Link externo'}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => window.open(presentationVideoUrl!, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Assistir
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

> Nota: `presentationVideoName` está nas props para paridade com o modelo de dados, mas a UI mostra um rótulo fixo ("Vídeo de apresentação") em vez do nome do arquivo, igual ao card do candidato. Mantê-lo na interface evita refator futuro.

- [ ] **Step 2: Verificar build + lint**

Run: `npm run build` → Expected: sucesso.
Run: `npm run lint` → Expected: sem novos erros. Se o lint reclamar de `presentationVideoName` não usado, prefixar com `_` na desestruturação OU removê-lo das props (decisão do implementador; manter consistência com o uso real).

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/CandidateDocumentsCard.tsx
git commit -m "feat(empresa): add read-only CandidateDocumentsCard (resume + video)"
```

---

### Task 4: Integrar o card em `CandidateProfile.tsx` (+ estado bloqueado)

**Files:**
- Modify: `src/pages/empresa/CandidateProfile.tsx` (import do lucide `Paperclip`; import do novo card; bloco JSX entre o card de "Formação Acadêmica" e o de "Notas Internas", ~linha 1322-1324)

**Interfaces:**
- Consumes: `profile` (de `useProfileForCompany`, já presente — agora com campos de documentos); `isInCompanyProcess` e `isPiiRevealed` (já calculados no componente); `CandidateDocumentsCard` da Task 3.

- [ ] **Step 1: Adicionar `Paperclip` ao import do lucide-react**

Em `src/pages/empresa/CandidateProfile.tsx`, no bloco `import { ... } from 'lucide-react';` (que hoje termina em `Search,`), adicionar `Paperclip`:

```ts
  Search,
  Paperclip,
```

- [ ] **Step 2: Importar o novo card**

Adicionar perto dos demais imports de componentes de `@/components/empresa/...` (ex.: logo após o import de `ScheduleInterviewModal`):

```ts
import { CandidateDocumentsCard } from '@/components/empresa/CandidateDocumentsCard';
```

- [ ] **Step 3: Inserir o bloco JSX entre "Formação Acadêmica" e "Notas Internas"**

Localizar o fechamento do card de Formação Acadêmica (o `</motion.div>` imediatamente antes do comentário `{/* Notas Internas */}`, ~linha 1322) e inserir logo abaixo dele:

```tsx
            {/* Currículo Anexado — PDF + vídeo, liberados após o consentimento LGPD */}
            {profile?.resumePdfUrl || profile?.presentationVideoUrl ? (
              <CandidateDocumentsCard
                resumePdfUrl={profile.resumePdfUrl}
                resumePdfName={profile.resumePdfName}
                resumePdfSize={profile.resumePdfSize}
                resumePdfUploadedAt={profile.resumePdfUploadedAt}
                presentationVideoUrl={profile.presentationVideoUrl}
                presentationVideoType={profile.presentationVideoType}
                presentationVideoName={profile.presentationVideoName}
                delay={0.32}
              />
            ) : isInCompanyProcess && !isPiiRevealed ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="w-5 h-5" />
                      Currículo Anexado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Currículo e vídeo de apresentação serão liberados após o candidato
                        autorizar o compartilhamento dos dados (LGPD).
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
```

(`Lock`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `motion` já estão importados no arquivo.)

- [ ] **Step 4: Verificar build + lint**

Run: `npm run build` → Expected: sucesso.
Run: `npm run lint` → Expected: sem novos erros.

- [ ] **Step 5: Verificação visual (dev server porta 3000)**

Garantir o dev server rodando (`preview_start` se necessário — porta 3000). Logar como empresa (`rh@techsolutions.com` / `Company@123`), abrir um candidato **com candidatura à empresa**:

- **Sem consentimento aceito:** deve aparecer o card "Currículo Anexado" com o estado **bloqueado** (cadeado + texto LGPD).
- **Com consentimento aceito e PDF/vídeo anexados:** deve aparecer o card com o(s) documento(s); "Visualizar"/"Baixar" abrem o PDF e "Assistir" abre o vídeo em nova aba.

Capturar screenshot (`preview_screenshot`) do card como evidência. Conferir `preview_console_logs` sem novos erros.

> Dica p/ criar dado de teste de consentimento (se não houver candidato com consentimento aceito): inserir/atualizar `candidate_data_disclosures` (status `accepted`) via MCP `execute_sql` para uma application existente, e garantir que o candidato tem `resume_pdf_url` preenchido na tabela `curriculums`. Limpar depois.

- [ ] **Step 6: Commit**

```bash
git add src/pages/empresa/CandidateProfile.tsx
git commit -m "feat(empresa): show attached resume + video on candidate detail page"
```

---

### Task 5: Changelog + version bump (1.69.0)

**Files:**
- Modify: `src/constants/app.ts:7-8`
- Modify: `public/changelog.json` (novo bloco de versão no topo do array `versions`; `isCurrent` da 1.68.1 → `false`)

**Interfaces:**
- Consumes: nada. Encerra a entrega.

- [ ] **Step 1: Bump das constantes**

Em `src/constants/app.ts`:

```ts
export const APP_VERSION = "1.69.0";
export const APP_CODENAME = "Folio";
```

(`Folio` = folha/documento; codename contextual em inglês para o tema "documentos". Ajustável se preferir outro.)

- [ ] **Step 2: Marcar a 1.68.1 como não-atual**

Em `public/changelog.json`, no objeto da versão `"1.68.1"`, trocar `"isCurrent": true` por `"isCurrent": false`.

- [ ] **Step 3: Adicionar o novo bloco de versão no topo do array `versions`**

Inserir como primeiro item de `"versions"`:

```json
    {
      "version": "1.69.0",
      "codename": "Folio",
      "type": "minor",
      "releaseDate": "2026-06-23",
      "description": "A empresa passa a ver, na tela de detalhes do candidato, o currículo em PDF e o vídeo de apresentação que o candidato anexou — liberados somente após o candidato autorizar o compartilhamento dos dados (LGPD).",
      "isCurrent": true,
      "changes": [
        {
          "type": "added",
          "items": [
            "Currículo anexado (PDF) e vídeo de apresentação do candidato agora aparecem na tela de detalhes, com botões para visualizar, baixar e assistir.",
            "Enquanto o candidato não autorizar o compartilhamento dos dados, a empresa vê um aviso de que o currículo e o vídeo serão liberados após o aceite (LGPD)."
          ],
          "details": {
            "0": {
              "description": "Na página de detalhes do candidato, um novo card 'Currículo Anexado' exibe o currículo em PDF (nome, tamanho e data de envio, com 'Visualizar' e 'Baixar') e o vídeo de apresentação (com 'Assistir'). Os arquivos só ficam disponíveis para a empresa depois que o candidato aceita o termo de compartilhamento de dados.",
              "files": [
                "src/pages/empresa/CandidateProfile.tsx",
                "src/components/empresa/CandidateDocumentsCard.tsx",
                "src/lib/videoThumbnail.ts",
                "sql/migrations/117_expose_documents_in_company_view.sql"
              ],
              "routes": [
                "/empresa/candidatos/:id"
              ]
            },
            "1": {
              "description": "Quando o candidato está em um processo seletivo da empresa mas ainda não autorizou o compartilhamento, o card 'Currículo Anexado' mostra um aviso com cadeado explicando que o currículo e o vídeo serão liberados após o aceite do termo (LGPD), em linha com os demais dados sensíveis ocultos.",
              "files": [
                "src/pages/empresa/CandidateProfile.tsx",
                "src/components/empresa/CandidateDocumentsCard.tsx"
              ],
              "routes": [
                "/empresa/candidatos/:id"
              ]
            }
          }
        }
      ]
    },
```

- [ ] **Step 4: Validar o JSON e o build**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/changelog.json','utf8')); console.log('changelog OK')"`
Expected: `changelog OK`.
Run: `npm run build` → Expected: sucesso.

- [ ] **Step 5: Conferir uma única `isCurrent: true`**

Run: `node -e "const v=JSON.parse(require('fs').readFileSync('public/changelog.json','utf8')).versions; console.log('current count:', v.filter(x=>x.isCurrent).length)"`
Expected: `current count: 1`.

- [ ] **Step 6: Commit**

```bash
git add src/constants/app.ts public/changelog.json
git commit -m "chore(release): v1.69.0 Folio — attached resume + video on candidate detail"
```

---

## Self-Review

**Spec coverage:**
- Migration 117 expõe os 7 campos mascarados por consentimento → Task 1. ✅
- Service/hook sem mudança (já mapeia) → confirmado, sem task. ✅
- Helper de thumbnail extraído e reusado → Task 2. ✅
- Componente read-only do card → Task 3. ✅
- Integração + estado bloqueado na coluna principal → Task 4. ✅
- Fora de escopo (signed URLs, PDF de exportação) → não há task, conforme spec. ✅
- Changelog + version bump MINOR → Task 5. ✅

**Placeholder scan:** sem TBD/TODO; todo passo tem código/comando concreto. ✅

**Type consistency:** `CandidateDocumentsCardProps` (Task 3) é consumido com os mesmos nomes na integração (Task 4); `getVideoThumbnail`/`VideoThumbnail` idênticos entre Task 2 e Task 3. Campos `resumePdf*`/`presentationVideo*` batem com `Curriculum` (types/curriculum.ts) e com o `rowToCurriculum`. ✅

**Verificação honesta:** TDD real só no helper puro (Vitest, sem RTL no projeto); view validada por SQL adversarial via MCP; card/integração validados por build/lint + verificação visual no preview. ✅
