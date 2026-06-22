# Ocultação e revelação de dados sensíveis do candidato com consentimento LGPD

- **Data:** 2026-06-20
- **Branch:** `worktree-lgpd-consent` (worktree isolado a partir de `origin/main` @ e1964b2)
- **Status:** Design aprovado — pronto para plano de implementação
- **Origem:** brainstorming guiado + auditoria multi-agente do código (6 agentes, 41 achados)

---

## 1. Contexto e problema

Hoje, os dados de contato/identificação do candidato são expostos à empresa **cedo demais** e de forma **apenas cosmética**, o que viola o princípio de minimização da LGPD (Lei 13.709/2018, Art. 6).

Evidências da auditoria do código:

- A máscara de e-mail/telefone em [`CandidateProfile.tsx`](src/pages/empresa/CandidateProfile.tsx) (`maskEmail`/`maskPhone`, L204-217) é **client-side**: o objeto `candidate` cru (com `email`, `phone`, `cpf`, `date_of_birth`) já trafega no payload e fica no cache do React Query — inspecionável via DevTools/Network. Além disso, destrava em `hasActiveApplication` (L345-349), que inclui o status `pending` — ou seja, revela **no primeiro contato**, não na aprovação.
- [`candidatesService.supabase.ts`](src/services/candidates/candidatesService.supabase.ts) usa `select('*')` (L39, L114, L132); a RLS `candidates_select_company` libera a **linha inteira**.
- A RLS [`curriculums_select_company`](sql/migrations/009_curriculums.sql) está **aberta** (`USING get_user_type='company'`, sem predicado de linha): qualquer empresa lê e-mail/telefone/localização/salário de **todos** os candidatos, sem candidatura nem consentimento. **É o vazamento mais grave.**
- O **PDF "Dossiê"** ([`CurriculumSections.tsx`](src/components/empresa/pdf/sections/CurriculumSections.tsx) L22-36) e o **Excel** ([`exportToExcel.ts`](src/components/export/exportToExcel.ts) L115-116) emitem e-mail/telefone crus, sem gate — artefatos **offline permanentes**.

## 2. Objetivo

O dado sensível **não deve chegar ao navegador da empresa** sem um consentimento **aceito** do candidato, específico para aquela **candidatura × empresa**, e somente **após a aprovação** no processo seletivo. O aceite deve ser **documentado, auditável e imprimível** para ambas as partes, com possibilidade de **revogação**.

### Dados sensíveis (no escopo)
`cpf` · `email` · `phone` · `date_of_birth` · `endereço`.

> **Nota:** a coluna `location` é apenas cidade/estado (confirmado em [`types/candidate.ts`](src/types/candidate.ts) L121 e no parser do `matchCalculator`). Cidade/estado **permanecem visíveis** (necessários para avaliação/match). Não há coluna de endereço de rua/CEP exposta ao cliente hoje; o "endereço" do escopo cobre qualquer campo de endereço detalhado caso passe a existir.

### Permanecem sempre visíveis
`name`/`display_name` e cidade/estado (`location`, `city`, `state`).

## 3. Decisões do brainstorming (congeladas)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Superfície endurecida | Visão da **empresa/recrutador** (admin mantém acesso técnico) |
| 2 | Dados sensíveis | cpf, email, phone, date_of_birth, endereço |
| 3 | Gatilho do pedido de consentimento | Transição da candidatura para **`offer`** ("Aprovado") |
| 4 | Recusa/pendência | **Candidato no controle**; `Contratar` (→`hired`) bloqueado até aceite |
| 5 | Canal de aceite | **In-app** (modal em "Minhas Candidaturas") + **e-mail** de aviso |
| 6 | Documento | Termo **HTML + PDF** com auditoria (data/hora, IP, hash, versão) |
| 7 | Revogação | **Simples na v1**: re-oculta + notifica empresa + registra |
| 8 | Arquitetura | **Proteção server-side real** (não cosmética) |

## 4. Arquitetura — defesa em profundidade (server-side)

A RPC é **necessária mas não suficiente**: enquanto a RLS de tabela liberar a linha inteira, a empresa contorna via `select('*')` direto. São **6 camadas**:

1. **Mascaramento de coluna na fonte.** A empresa deixa de receber `cpf · email · phone · date_of_birth · endereço` de `candidates` e `curriculums` sem disclosure `accepted` — inclusive via `select('*')` direto. Implementado por reescrita das políticas/`REVOKE` de coluna para o papel `company`, de modo que o caminho direto retorne as colunas sensíveis como `null`.
2. **Fechar o 2º caminho.** Endurecer `curriculums_select_company` (hoje totalmente aberta).
3. **Porta única de leitura.**
   - **Listas (lote):** view `candidates_for_company` que devolve o **mesmo shape** de `candidates` com colunas sensíveis mascaradas — resolve o problema dos call sites que carregam 1000 candidatos.
   - **Ficha (revelação):** a **mesma view** `candidates_for_company` (`SECURITY DEFINER`) já revela os campos sensíveis automaticamente quando há disclosure `accepted` daquela empresa+candidatura — não é necessária uma RPC separada. O currículo é servido por `curriculums_for_company` (pai) + queries dos filhos por `curriculum_id`.
   - **Currículo:** RPC/uso equivalente para `curriculums` (consumido pela ficha e como fallback do PDF).
4. **Exportações.** PDF (Dossiê) e Excel passam a receber dados **já mascarados**; a seção "dados pessoais" do PDF só inclui contato quando há aceite (`isAvailable` condicional, não `true` fixo). Fechar o fallback `candidate.email ?? curriculum?.email`. Cada geração com PII revelada vira evento de auditoria.
5. **Trigger `BEFORE UPDATE` em `applications`.** Bloqueia a transição para `hired` sem disclosure `accepted` (a UI sozinha é cosmética — `updateApplicationStatus` é JS puro e não valida transições). Opcionalmente, `AFTER UPDATE → offer` cria o disclosure `pending`.
6. **Auditoria append-only.** Cada aceite, revogação e **revelação** de PII é registrada (sem UPDATE/DELETE), alimentando o `LGPDReport` já existente.

### Isolamento por candidatura × empresa
A revelação é checada por `company_id` (derivado de `get_company_id(auth.uid())`) **e** `application_id` em status `offer`/`hired`. Consentir com a empresa A **nunca** revela para a empresa B.

## 5. Modelo de dados

### Nova tabela `candidate_data_disclosures`
| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | uuid PK | |
| `application_id` | uuid FK → applications | |
| `candidate_id` | uuid FK → candidates | |
| `company_id` | uuid FK → companies | |
| `status` | text/enum | `pending` \| `accepted` \| `refused` \| `revoked` |
| `term_version` | text | versão do texto jurídico aceito |
| `term_hash` | text | SHA-256 do conteúdo do termo |
| `accepted_at` | timestamptz | |
| `revoked_at` | timestamptz | |
| `ip` | text | IP do aceite (mascarado na exibição) |
| `user_agent` | text | |
| `created_at` | timestamptz | default now() |

**Índices:** `application_id`, `company_id`, `candidate_id`, e único parcial por `(application_id, company_id)` ativo.

**RLS:**
- Candidato (own): SELECT/UPDATE dos seus disclosures (aceitar/revogar).
- Empresa: SELECT apenas do **status** dos seus (não dos metadados sensíveis de auditoria além do necessário).
- Admin: tudo.

> `candidates.lgpd_consent_at` é consentimento **global de cadastro** e **não serve** como gate por-empresa. Não reaproveitar para esse fim.

### Auditoria
Reaproveitar `test_audit_logs` + [`auditLog.ts`](src/utils/auditLog.ts) (já tem `lgpd_report_generated`). Adicionar `AuditAction`: `consent_granted`, `consent_revoked`, `sensitive_data_revealed`. Aparecem automaticamente no [`LGPDReport.tsx`](src/components/corporate-tests/LGPDReport.tsx).

## 6. Máquina de estados do consentimento

```
Candidatura ativa (pending/reviewing/interview)
        │ recrutador aprova (→ offer)
        ▼
   PENDENTE  ──(candidato aceita)──▶  ACEITO     → dados revelados + termo gerado
        │                                  │ (candidato revoga)
        │                                  ▼
        ├──(candidato recusa)──▶ RECUSADO   REVOGADO → dados re-ocultos + empresa notificada
        │
        └──(sem resposta)──▶ permanece PENDENTE

Botão "Contratar" (→ hired): habilitado apenas em ACEITO (enforced por trigger).
```

Re-solicitação após RECUSADO/REVOGADO (nova rodada de pedido) é permitida e volta o disclosure a `pending`.

## 7. Fluxos

### 7.1 Recrutador aprova (→ `offer`)
Ponto único: [`applicationsService.updateApplicationStatus`](src/services/applications/applicationsService.supabase.ts) (L263-307). Após o INSERT em `application_history`, com guarda `status === 'offer' && previousStatus !== 'offer'`:
1. cria/garante `candidate_data_disclosures` em `pending`;
2. `createNotification` para o candidato ("Você foi aprovado — autorize o compartilhamento", `action_url=/candidato/candidaturas`);
3. `invoke('send-email', { action: 'send_consent_request_email', ... })`.

UI da empresa converge em `handleMove` ([Applications.tsx](src/pages/empresa/Applications.tsx) L566-602) — Select "Mover para" (SelectItem `offer` L1585-1587) e drag-and-drop (L546-559).

### 7.2 Candidato decide
Modal em [`pages/candidato/Applications.tsx`](src/pages/candidato/Applications.tsx) (cards L173-232; segue o padrão do AlertDialog de cancelamento L261-280). Novo hook `useConsentDecision` (accept/refuse/revoke). Reusa a estrutura visual do [`AnonymizationModal`](src/components/team-management/AnonymizationModal.tsx) ("será revelado / será preservado" + confirmação).
- **Aceitar:** disclosure → `accepted` (grava `accepted_at`, `ip`, `user_agent`, `term_version`, `term_hash`); gera termo; notifica empresa; auditoria `consent_granted`.
- **Recusar:** disclosure → `refused`; empresa vê "não autorizado".
- **Revogar (de accepted):** disclosure → `revoked` (grava `revoked_at`); dados re-ocultos; notifica empresa; auditoria `consent_revoked`.

### 7.3 Contratar (→ `hired`)
Botão só renderiza em `offer` ([Applications.tsx](src/pages/empresa/Applications.tsx) L1508-1524) → abre [`HiringModal`](src/components/empresa/HiringModal.tsx). Gate de UI por novo hook `useConsentStatus`; **enforcement real** por trigger `BEFORE UPDATE` que rejeita `→ hired` sem disclosure `accepted`.

## 8. Superfícies de vazamento a fechar (checklist de implementação)

| Severidade | Superfície | Arquivo(s) | Ação |
|---|---|---|---|
| crítico | `select('*')` em candidates | [candidatesService.supabase.ts](src/services/candidates/candidatesService.supabase.ts) L39,114,132 | Trocar pela view `candidates_for_company` (serve lista e ficha) |
| crítico | RLS curriculums aberta | [009_curriculums.sql](sql/migrations/009_curriculums.sql) L147-149 + [curriculumsService.supabase.ts](src/services/curriculums/curriculumsService.supabase.ts) L198-210 | Endurecer policy; servir currículo da empresa via RPC mascarada |
| crítico | Mascaramento de coluna ausente | policies de `candidates` (mig 001/039) | Reescrita/REVOKE de coluna p/ papel company sem disclosure ativo |
| alto | PDF Dossiê com PII crua | [CurriculumSections.tsx](src/components/empresa/pdf/sections/CurriculumSections.tsx) L22-36 + [ExportCandidateProfileModal.tsx](src/components/empresa/pdf/ExportCandidateProfileModal.tsx) L42,64-70 + [CandidateProfile.tsx](src/pages/empresa/CandidateProfile.tsx) L562-572 | Receber dados mascarados; gate da seção; fechar fallback `curriculum?.email/phone`; auditar revelação |
| alto | Excel com email/phone | [exportToExcel.ts](src/components/export/exportToExcel.ts) L115-116 | Herdar máscara da fonte (RPC); não depender só de `isAnonymous` |
| alto | Máscara client-side cosmética | [CandidateProfile.tsx](src/pages/empresa/CandidateProfile.tsx) L204-217,345-349,803-836 | Remover máscara/gate `hasActiveApplication`; consumir objeto já mascarado; revelar só com disclosure ativo; ajustar tooltip |
| alto | Converter/tipos não toleram máscara | [supabaseConverters.ts](src/lib/supabaseConverters.ts) L39-97 + [types/candidate.ts](src/types/candidate.ts) L60,L63 | Relaxar `email`/`location` para `string \| undefined`; sensíveis `undefined` quando omitidos |
| médio | hired sem validação server-side | [applicationsService.supabase.ts](src/services/applications/applicationsService.supabase.ts) L263-307 | Trigger BEFORE UPDATE bloqueia `→ hired` sem aceite |
| médio | Realtime/embeds seguem RLS base | [applicationsService](src/services/applications/applicationsService.supabase.ts) (APPLICATION_SELECT) + [messagesService](src/services/messages/messagesService.supabase.ts) L15 | Garantir que embeds nunca incluam colunas sensíveis (hoje só `name`/`avatar_url` — invariante a não regredir) |
| baixo | getCompanyCandidates JOIN profiles.email | [companyTestsService.supabase.ts](src/services/companyTests/companyTestsService.supabase.ts) L342-377 | Mitigado pela RLS de `profiles` (só team). Padronizar, não prioritário |

## 9. Telas (UI)

Validadas em mockup no companheiro visual:

1. **Ficha da empresa** ([CandidateProfile.tsx](src/pages/empresa/CandidateProfile.tsx)): durante o processo, `cpf · nascimento · email · telefone` aparecem como "🔒 oculto" com cadeado; nome e cidade/estado visíveis; comunicação pelo chat interno. Após aceite: dados revelados, faixa "Liberado em DD/MM, HH:MM", link para o termo, nota de auditoria.
2. **Modal de aceite do candidato** ([candidato/Applications.tsx](src/pages/candidato/Applications.tsx)): cabeçalho de aprovação (vaga/empresa), lista dos dados a compartilhar, finalidade, direitos (revogação + link do termo), **checkbox obrigatório**, botões "Agora não" / "Autorizar e compartilhar"; rodapé sobre registro/impressão.
3. **Termo de consentimento** (`ConsentTermDocument`, novo, em `src/components/empresa/pdf/` ou pasta compartilhada): documento com nº, partes (titular × controladora × operadora), objeto, dados, finalidade + base legal (Art. 7º, I), direitos do titular, **bloco de auditoria** (data/hora, IP mascarado, navegador, versão, hash SHA-256), carimbo de aceite eletrônico. **HTML imprimível + exportar PDF.** Acessível ao candidato (Minhas Candidaturas) e à empresa (ficha).
   - **CPF no termo:** exibir **parcial** (`***.740.429-**`). A empresa já vê o completo na ficha após o aceite.

## 10. Reuso de infraestrutura

- **Notificações in-app:** [`notificationsService.createNotification`](src/services/notifications/notificationsService.supabase.ts) L57-77 (Realtime + sino já ligados).
- **E-mail:** Edge Function [`send-email`](supabase/functions/send-email/index.ts) (Resend) — nova action `send_consent_request_email` replicando `buildInvitationEmailHtml` (L189-269) + case no switch (~L597-613). Deploy `verify_jwt=false`. **Atenção:** `functions.invoke` trata não-2xx como `FunctionsHttpError` com `data=null` — ler `error.context.json()`.
- **PDF:** pipeline `@react-pdf/renderer` de [`ExportCandidateProfileModal`](src/components/empresa/pdf/ExportCandidateProfileModal.tsx) L87-125 + blocos `Header`/`Footer`/`styles` em `src/components/empresa/pdf/`.
- **Modal:** estrutura visual de [`AnonymizationModal`](src/components/team-management/AnonymizationModal.tsx) L48-63,177-345.
- **Precedente de mascaramento:** [`manage-team-anonymization`](supabase/functions/manage-team-anonymization/index.ts) L144-188 define quais colunas são sensíveis. **Diferença:** anonimização é destrutiva; consentimento é máscara em **leitura**, reversível.
- **Padrão RPC:** `replace_curriculum_children`, `check_cpf_exists`, `get_company_id` — `get_company_id(auth.uid())` **sempre com argumento uuid**.

## 11. Plano de módulos / migrations (faseado)

1. **Migration 1** — tabela `candidate_data_disclosures` + RLS + índices.
2. **Migration 2** — endurecer `curriculums_select_company`; mascaramento de coluna real em `candidates` para o papel `company` sem disclosure ativo (preservar candidato `own` e admin).
3. **Migration 3** — views `candidates_for_company` e `curriculums_for_company` (`SECURITY DEFINER`, mascaram por consentimento; servem lista e ficha; currículo expõe o pai, filhos vêm por `curriculum_id`); log append-only de revelação.
4. **Migration 4** — trigger `BEFORE UPDATE` em `applications` (bloqueia `→ hired` sem aceite); opcional `AFTER UPDATE → offer` cria disclosure `pending`.
5. **Serviços** — `candidatesService`/`curriculumsService` (uso empresa) passam a consumir view/RPC; novo `consentService` (create/getStatus/accept/revoke); `applicationsService.updateApplicationStatus` dispara comunicação no `offer`.
6. **Converter/tipos** — `candidateRowToCandidate` tolera máscara; `Application` + `applicationRowToApplication` ganham status do disclosure.
7. **Hooks** — `useConsentStatus` (empresa), `useConsentDecision` (candidato); invalidações em `useApplicationsQuery`/`useCandidates`; reusar `useAddTestAuditLog`.
8. **UI empresa** — `CandidateProfile` (remover máscara, consumir RPC, gate); `Applications`/`HiringModal` (bloquear Contratar); `ExportCandidateProfileModal` + `CurriculumSections` + `exportData` + `exportToExcel` (dados mascarados + fechar fallback).
9. **UI candidato** — modal de aceite/recusa/revogação + `ConsentTermDocument`.
10. **Edge/PDF/Audit** — action `send_consent_request_email`; `ConsentTermDocument`; novas `AuditAction`; ligar export do `LGPDReport`.
11. **Verificação** — testes adversariais de RLS (ver §13).

## 12. Decisões / defaults (assumidos, ajustáveis)

- **Listas → view mascarada; ficha → RPC reveladora** (performance: evita N chamadas por linha).
- **`Candidate.email`/`location` → `string | undefined`** (mais limpo que placeholder).
- **`curriculums` → exigir disclosure ativo para email/phone**; cidade/estado seguem visíveis.
- **Revogação → re-oculta + notifica + audita.**
- **Gatilho → híbrido:** trigger garante o registro de disclosure; serviço dispara e-mail/notificação.
- **CPF no termo → parcial.** IP na auditoria → exibido **mascarado**.

## 13. Critérios de aceitação / verificação

Testes adversariais de RLS (uma empresa autenticada):
- `from('candidates').select('*')` de candidato **sem** disclosure ativo → `cpf/email/phone/date_of_birth` vêm `null`/omitidos.
- `from('curriculums').select(...)` direto → email/phone **não** retornam sem disclosure ativo.
- `candidates_for_company` com disclosure `accepted` → revela; sem → mascarado.
- **Cross-vaga:** empresa B **não** vê dados liberados para a empresa A.
- Tentar `update applications set status='hired'` sem disclosure `accepted` → **rejeitado** pelo trigger.
- Realtime/embeds (`applications`/`conversations` JOIN candidates) → **nunca** trazem colunas sensíveis.
- PDF/Excel gerados sem aceite → **sem** email/phone; com aceite → presentes e auditados.
- Revogação → ficha/PDF subsequentes voltam a ocultar; evento `consent_revoked` registrado.

## 14. Riscos e limitações (transparência)

- **Artefatos offline já baixados** (PDF/Excel) **não são recolhíveis** pela revogação (Art. 18 difícil de cumprir 100% para arquivos exportados). Isso fica **escrito no termo**.
- **Texto jurídico do termo** (finalidade, base legal, prazo de retenção, DPO) precisa de revisão do cliente/jurídico — o spec entrega um rascunho; a redação final é responsabilidade do titular do negócio.
- **Retenção/expiração:** v1 mantém o disclosure ativo enquanto a candidatura não atinge status terminal; expiração automática pós-terminal fica registrada como melhoria.
- **Banco de talentos:** o mascaramento server-side (camada 1) **também** fecha o vazamento estrutural de candidatos públicos a qualquer empresa — efeito colateral positivo desta arquitetura.

## 15. Fora de escopo (v1)

- Mudanças na visão **admin** (mantém acesso técnico).
- Consentimento **granular por campo** (v1 é pacote único).
- Expiração automática por retenção e relatório de eliminação de dados (Art. 18 completo).
- Página de aceite **sem login** via token por e-mail (v1 é in-app + e-mail de aviso).
