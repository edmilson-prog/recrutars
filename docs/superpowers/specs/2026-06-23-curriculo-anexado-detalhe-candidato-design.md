# Spec — Currículo anexado na tela de detalhes do candidato (empresa)

**Data:** 2026-06-23
**Status:** Aprovado para implementação
**Autor:** Edmilson Souza (AILA) + Claude

## Objetivo

Exibir, dentro da tela de detalhes do candidato no painel da empresa
([CandidateProfile.tsx](../../../src/pages/empresa/CandidateProfile.tsx)), o
**currículo em PDF** e o **vídeo de apresentação** que o candidato anexou no seu
perfil profissional. Os documentos são liberados para a empresa **somente após o
aceite do termo de consentimento LGPD** (mesma regra de e-mail/CPF/nascimento).

## Contexto / estado atual

- O candidato anexa o PDF e cadastra o vídeo em
  [DocumentsTab.tsx](../../../src/components/profile/DocumentsTab.tsx). O arquivo
  vai para o bucket `candidate-documents` (URL pública via `getPublicUrl`) e as
  referências ficam na tabela `curriculums`:
  - `resume_pdf_url`, `resume_pdf_name`, `resume_pdf_size`, `resume_pdf_uploaded_at`
  - `presentation_video_url`, `presentation_video_type`, `presentation_video_name`
- O tipo `Curriculum` ([types/curriculum.ts](../../../src/types/curriculum.ts))
  já declara esses campos, e o mapper `rowToCurriculum`
  ([curriculumsService.supabase.ts](../../../src/services/curriculums/curriculumsService.supabase.ts))
  já converte as colunas snake_case → camelCase.
- A empresa lê o currículo por `getProfileForCompany`, que consulta a **view
  mascarada** `curriculums_for_company` com `select('*')`.
- **Problema:** a view `curriculums_for_company` (migrations 113/115/116) expõe
  uma lista explícita de colunas que **não inclui** nenhum dos 7 campos de
  documentos. Logo, hoje a empresa **nunca** recebe o PDF nem o vídeo.

## Decisões de produto (confirmadas)

1. **Liberação:** só com consentimento — mascarar igual a e-mail/CPF
   (`admin OR company_has_data_consent`). **Não** usar o carve-out de "em
   processo seletivo" (`company_has_application_from_candidate`) que hoje libera
   só o telefone. Motivo: o PDF normalmente contém e-mail/CPF/telefone, que o
   sistema de consentimento mantém ocultos até o aceite.
2. **Escopo:** currículo PDF **+** vídeo de apresentação.
3. **Posicionamento:** card dedicado na coluna principal da tela de detalhes.

## Arquitetura da solução

### 1. Banco de dados — `sql/migrations/117_expose_documents_in_company_view.sql`

`CREATE OR REPLACE VIEW public.curriculums_for_company` preservando **todo** o
conteúdo da migration 116 (predicado de visibilidade do WHERE, máscara de
e-mail/CPF, e o carve-out de telefone via `company_has_application_from_candidate`)
e **acrescentando 7 colunas** mascaradas por consentimento:

```sql
CASE WHEN public.get_user_type(auth.uid()) = 'admin'
          OR public.company_has_data_consent(public.get_company_id(auth.uid()), cu.candidate_id)
     THEN cu.resume_pdf_url ELSE NULL END AS resume_pdf_url,
-- idem para resume_pdf_name, resume_pdf_size, resume_pdf_uploaded_at,
--          presentation_video_url, presentation_video_type, presentation_video_name
```

- Atualizar o `COMMENT ON VIEW` para mencionar os documentos.
- Incluir bloco de **verificação adversarial comentado** (no padrão das migrations
  113/116): confirmar que as colunas existem e que, sem consentimento, voltam
  `NULL`; com `candidate_data_disclosures.status='accepted'`, voltam preenchidas.
- Aplicar via MCP Supabase **e** salvar o arquivo em `sql/migrations/`.

> Nenhuma mudança em RLS de tabela: a tabela base `curriculums` não tem mais
> SELECT direto para company (migration 113). O acesso continua só pela view.

### 2. Serviço / hook — sem mudanças

`getProfileForCompany` já faz `select('*')` e `rowToCurriculum` já mapeia os 7
campos. Assim que a view os expuser, o objeto `Curriculum` retornado para a
empresa passa a carregá-los (preenchidos quando há consentimento, `undefined`
quando mascarados como `NULL`).

### 3. Frontend

**3a. Helper compartilhado** — extrair de `DocumentsTab.tsx` para
`src/lib/videoThumbnail.ts`:
- `extractYouTubeId`, `extractVimeoId`, `getVideoThumbnail` (+ tipo `VideoThumbnail`).
- `DocumentsTab.tsx` passa a importar do novo módulo (remover as cópias locais).

**3b. Novo componente** `src/components/empresa/CandidateDocumentsCard.tsx`
(read-only). Props: os campos de documentos do `Curriculum` (PDF + vídeo).
- Sub-bloco **PDF** (quando há `resumePdfUrl`): ícone, `resumePdfName`,
  `resumePdfSize` formatado, `resumePdfUploadedAt` formatado, botão **Visualizar**
  (abre em nova aba) e botão **Baixar**.
- Sub-bloco **Vídeo** (quando há `presentationVideoUrl`): thumbnail (YouTube/Vimeo
  via helper) ou ícone genérico, botão **Assistir** (abre em nova aba).
- Estilo coerente com os cards existentes da página (shadcn `Card`, ícones lucide,
  `motion` para entrada).

**3c. Integração em `CandidateProfile.tsx`** — inserir o card na coluna principal
(`lg:col-span-2`), após o card "Formação Acadêmica". Lógica de renderização:

```text
hasResume = !!profile?.resumePdfUrl
hasVideo  = !!profile?.presentationVideoUrl
hasDocs   = hasResume || hasVideo

if (hasDocs)                              -> <CandidateDocumentsCard ... />
else if (isInCompanyProcess && !isPiiRevealed) -> card "bloqueado" (cadeado)
else                                      -> não renderiza nada
```

- O card "bloqueado" reaproveita o padrão visual dos campos "oculto" do header
  (ícone `Lock`, texto: *"Currículo e vídeo de apresentação — Liberados após o
  candidato autorizar o compartilhamento dos dados (LGPD)"*).
- `isInCompanyProcess` e `isPiiRevealed` já existem no componente.

## Fora de escopo

- Blindar o arquivo no Storage com signed URLs. O bucket `candidate-documents`
  serve URLs públicas; a view controla a *descoberta* da URL, não o objeto em si.
  Comportamento já existente; alteração não solicitada.
- Incluir os documentos no PDF de exportação do dossiê (`ExportCandidateProfileModal`).
  O `exportData` já recebe `curriculum: profile`; expor os anexos no PDF pode ser
  um incremento futuro, não pedido aqui.

## Verificação

- **DB:** rodar o bloco adversarial da migration — colunas presentes; sem
  consentimento `NULL`, com consentimento preenchidas.
- **Build/lint:** `npm run build` e `npm run lint` sem novos erros.
- **Visual (dev server porta 3000):** logar como empresa
  (`rh@techsolutions.com`), abrir um candidato com candidatura:
  - sem consentimento aceito → card bloqueado (cadeado);
  - com consentimento aceito e PDF/vídeo anexados → documentos visíveis,
    "Visualizar"/"Assistir" abrindo os arquivos.

## Convenção final

- Atualizar `public/changelog.json` (com `details`: description/files/routes) e as
  constantes em `src/constants/app.ts` (version bump **MINOR** + codename).
