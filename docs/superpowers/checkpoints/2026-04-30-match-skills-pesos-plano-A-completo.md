# Checkpoint — Match Calculator + Pesos por Vaga

> **Data do snapshot:** 2026-04-30
> **Branch:** `dreamy-dirac`
> **HEAD atual:** `8179dd1` (chore: bump version to 1.56.0 Compass)
> **Status do escopo:** Plano A 13/14 completo · Plano B 0/16 · Plano C 0/15
> **Como retomar:** ver seção [Como continuar em outra sessão](#como-continuar-em-outra-sessão)

---

## TL;DR

A entrega trifásica (A → B → C) que conserta o algoritmo de match e adiciona pesos parametrizáveis por vaga está com a **Etapa A completa e validada empiricamente** (Sul Santana saiu de 6% para 44% em Skills, exatamente como projetado).

Falta pushar para o remote (Task 14) e executar Etapas B (UI da aba "Match") e C (polimento, modal "Ver critérios", toggle).

---

## Documentos-mãe

- **Spec:** [`docs/superpowers/specs/2026-04-29-match-skills-pesos-design.md`](../specs/2026-04-29-match-skills-pesos-design.md)
- **Plano A:** [`docs/superpowers/plans/2026-04-29-plan-A-calculator-fix.md`](../plans/2026-04-29-plan-A-calculator-fix.md) — feito
- **Plano B:** [`docs/superpowers/plans/2026-04-29-plan-B-job-weights.md`](../plans/2026-04-29-plan-B-job-weights.md) — pendente
- **Plano C:** [`docs/superpowers/plans/2026-04-29-plan-C-match-ui-polish.md`](../plans/2026-04-29-plan-C-match-ui-polish.md) — pendente
- **PRD futuro (CRUD templates):** [`docs/prds/PRD-092-emp-crud-templates-pesos-match.md`](../../prds/PRD-092-emp-crud-templates-pesos-match.md)
- **Mockups da brainstorm:** `.superpowers/brainstorm/519-1777510714/content/` (HTML files)

---

## Plano A · COMPLETO (13/14 tasks · falta apenas push)

### Commits gerados

15 commits sequenciais a partir de `61bdcad` (último commit antes da execução):

```
fc61a55  feat(match): add MatchSkillsInput and dataMissing field to MatchCategory
13d76c9  feat(match): add skillsInput param to calculateMatchBreakdown signature
9471610  feat(match): compute technical and behavioral skills separately
e61b1ce  docs(match): deprecate legacy calculateSkillsScore
82cc283  feat(hooks): add useMatchSkillIds combiner for match calculation
654fe5b  feat(match): wire useMatchSkillIds into JobDetails
49864dc  feat(match): wire useMatchSkillIds into JobSearch via useQueries
5e9a400  feat(match): wire skills input into empresa Candidates page
8fad394  feat(match): wire skills input into CandidateProfile
e7eb132  feat(match): wire skills input into Applications
51a6d24  feat(match): wire skills input into SavedCandidates
d9e3570  chore(match): document admin Dashboard uses legacy calc path
19ecf19  feat(match): accept skills input in recommendation builders
d22e03f  test(match): add empirical validation script for after-fix comparison
8179dd1  chore: bump version to 1.56.0 Compass
```

(Houve 1 reset durante a execução: o subagente do changelog inicialmente usou v1.55.0 sobrescrevendo Atlas; refeito como v1.56.0.)

### Validação empírica · `npx tsx scripts/match-audit-std.ts`

```
app_id   | candidato            | vaga                | LEGACY | tech | beh  | NOVO  | Δ
0ad78620 | ELISANDRA FRANZMANN  | Caixa               |     12 |   20 |   11 |    16 | +4
72d1d0a5 | SUL ELEN TEREZA      | Analista Financeiro |      6 |   49 |   39 |    44 | +38  ← objetivo
93efa6e1 | WAGNER MACHADO       | Estoquista          |      0 |   30 |   20 |    25 | +25
9507417b | GABRIELLI DA CRUZ    | Guia de Turismo     |      2 |   43 |   34 |    39 | +37
```

A previsão do design ("Sul Santana 6→44") foi confirmada empiricamente.

### Verificações de gate

- `npm run build` → ✅ PASS (32s)
- `npm run lint` → 40 errors / 74 warnings, **todos pré-existentes** (nada introduzido pelo Plano A)
- `npx tsc --noEmit` → executado por subagentes em cada task, sem erros novos

### Task 14 pendente

Documenta no plano: rodar lint, build, auditoria empírica como gate final + `git push origin dreamy-dirac`.

**Comandos prontos:**

```bash
cd D:/claude/recrutars-maike
npm run build && npm run lint
npx tsx scripts/match-audit-std.ts
git push origin dreamy-dirac
```

---

## Plano B · NÃO INICIADO (0/16 tasks)

**Goal:** Permitir que cada vaga tenha pesos próprios para as 5 categorias (Skills Técnicas, Skills Comportamentais, Experiência, Perfil Comportamental, Localização). Adiciona aba "⚙ Match" no JobForm com 6 templates + sliders + footer sticky validador.

### O que será criado/modificado

**Migration:**
- `sql/migrations/092_job_weights.sql` — 5 colunas `weight_*` em `jobs` com CHECK constraints (soma=100, range 0-70)

**Novos arquivos:**
- `src/types/matchWeights.ts` — tipo `MatchWeights` + `DEFAULT_MATCH_WEIGHTS` + helpers
- `src/lib/matchWeightTemplates.ts` — 6 templates hardcoded (Operacional, Industrial, Administrativo, Técnico, Liderança, Comercial)
- `src/components/empresa/job-form/JobFormMatchWeights.tsx` — orquestrador da aba
- `src/components/empresa/job-form/MatchWeightsTemplateCards.tsx` — cards horizontais
- `src/components/empresa/job-form/MatchWeightsSliders.tsx` — 5 sliders + inputs
- `src/components/empresa/job-form/MatchWeightsSumIndicator.tsx` — footer sticky com 3 estados

**Modificados:**
- `src/types/database.ts` — colunas `weight_*` em `Tables['jobs']`
- `src/lib/supabaseConverters.ts` — converter snake↔camel
- `src/types/index.ts` (ou onde `Job` está) — campos opcionais
- `src/lib/matchCalculator.ts` — ler pesos do `job` em vez de constante global, montar 5 categorias
- `src/components/match/MatchBreakdown.tsx` — `DEFAULT_MATCH_CATEGORIES` cresce para 5
- `src/pages/empresa/JobForm.tsx` — adicionar 7ª aba "⚙ Match"
- `src/hooks/useJobForm.ts` — campos de peso, dirty tracking, validação
- `src/services/jobs/jobsService.supabase.ts` — INSERT/UPDATE com weights

### Defaults para vagas existentes

`25 / 15 / 30 / 20 / 10` (Tech / Beh / Exp / Gauge / Loc) — preserva a proporção atual de 40/30/20/10 redistribuindo skills em 5 categorias.

### Templates (hardcoded)

| Template | Tech | Beh | Exp | Gauge | Loc |
|---|---|---|---|---|---|
| Operacional | 10 | 30 | 15 | 25 | 20 |
| Industrial | 25 | 15 | 30 | 15 | 15 |
| Administrativo | 20 | 20 | 20 | 25 | 15 |
| Técnico | 45 | 10 | 25 | 15 | 5 |
| Liderança | 20 | 20 | 30 | 25 | 5 |
| Comercial | 15 | 25 | 15 | 30 | 15 |

### Versionamento sugerido

v1.57.0 "Tailor" (alfaiataria dos pesos)

### Pré-requisito

**Plano A precisa estar mergeado em `main`** (ou pelo menos pushado e em revisão). O Plano B mexe no `matchCalculator.ts` que A acabou de refatorar — paralelizar gera conflito de merge garantido.

---

## Plano C · NÃO INICIADO (0/15 tasks)

**Goal:** Completar a UX do match com (a) edição segura de pesos via dupla confirmação + histórico + notificação, (b) modal "Ver critérios da vaga" para o candidato, (c) toggle "Combinar skills" colapsando 5 categorias em 4, (d) tratamento visual dos casos especiais Q4.

### O que será criado

**Migration:**
- `sql/migrations/093_jobs_weight_history.sql` — tabela + RLS + trigger que notifica candidatos

**Edge Function:**
- `supabase/functions/update-job-weights/index.ts` — Deno + Supabase service role
- Configurar `verify_jwt = false` em `supabase/config.toml` (memoria do projeto: SEMPRE)

**Novos arquivos:**
- `src/components/empresa/job-form/EditWeightsConfirmDialog.tsx` — dupla confirmação
- `src/hooks/useJobWeightHistoryQuery.ts` — fetch do histórico
- `src/components/match/MatchCriteriaModal.tsx` — modal "Ver critérios"
- `src/hooks/useMatchCombineSkills.ts` — localStorage persistence
- `src/components/match/MatchCombineSkillsToggle.tsx` — switch reutilizável

**Modificados:**
- `src/lib/matchCalculator.ts` — `applyDataAvailability` (casos Q4)
- `src/components/match/MatchBreakdown.tsx` — toggle, esconde peso=0, renderiza dataMissing
- `src/components/match/MatchProgressBar.tsx` — flag "não avaliado"
- `src/pages/candidato/JobDetails.tsx` — botão "Ver critérios"
- `src/hooks/useJobForm.ts` — chamar Edge Function quando vaga publicada com candidaturas
- `src/types/notifications.ts` — tipo `job_weights_changed`
- Tela de notificações do candidato — render do tipo novo

### Versionamento sugerido

v1.58.0 "Mirror" (transparência ao candidato)

### Pré-requisito

**Plano B precisa estar mergeado**. C consome `weight_*` (criado em B) e a separação de 5 categorias visíveis (introduzida em B).

---

## Como continuar em outra sessão

### 1. Para fechar o Plano A (se ainda não pushado)

```bash
cd D:/claude/recrutars-maike
git status                              # confirma que está em dreamy-dirac
git log --oneline 61bdcad..HEAD         # confirma 15 commits acima
npm run build                           # gate final
npx tsx scripts/match-audit-std.ts      # confirma Sul Santana 6→44
git push origin dreamy-dirac            # ← push
```

### 2. Para iniciar o Plano B em sessão separada

```
Eu quero executar o Plano B (pesos por vaga) que está em
docs/superpowers/plans/2026-04-29-plan-B-job-weights.md.

Use subagent-driven-development. O Plano A já está mergeado/pushado
(branch dreamy-dirac, HEAD 8179dd1 ou superior). 16 tasks.

Pré-leitura obrigatória:
- O spec mãe: docs/superpowers/specs/2026-04-29-match-skills-pesos-design.md
- O checkpoint: docs/superpowers/checkpoints/2026-04-30-match-skills-pesos-plano-A-completo.md
```

### 3. Para iniciar o Plano C em sessão separada

```
Eu quero executar o Plano C (polimento UX) que está em
docs/superpowers/plans/2026-04-29-plan-C-match-ui-polish.md.

Use subagent-driven-development. Planos A e B já estão mergeados.
15 tasks.

Pré-leitura: spec + checkpoint atualizado pós-Plano-B.
```

---

## Riscos e cuidados conhecidos

### Hooks shadowing
- Em `src/lib/matchCalculator.ts`, há 2 variáveis chamadas `behavioralScore`: uma do skills (renomeada para `skillsBehavioralScore` em commit 9471610) e outra do DISC/Gauge-Pro (preservada). Quem mexer no calculator precisa cuidar do shadow.

### Module-level closure pattern
- `src/pages/empresa/Applications.tsx` usa pattern pré-existente de globals (`_candidatesMap`, `_companyJobs`, `_skillsInputBuilder`). Funciona, mas seria melhor refatorar pra `useCallback` num momento futuro. Não bloqueia, mas registrar.

### Lint pré-existente
- 40 errors / 74 warnings no `npm run lint`. Não foram introduzidos pelo Plano A. Quem fizer Plano B não deve ser confundido por isso.

### Admin Dashboard fallback intencional
- `src/pages/admin/Dashboard.tsx` (linhas 172-194 aprox.) intencionalmente usa o caminho legado para evitar N×M fetches de std_skills. Comentário inline documenta. Quando uma RPC otimizada existir, dá pra revisar.

### Recomendation libs (Task 10) NÃO atualizam callers
- `src/lib/jobRecommendation.ts` e `src/lib/candidateRecommendation.ts` aceitam std_skills como params opcionais. Os callers (`useJobRecommendations`, `useCandidateRecommendations`) ainda não populam. Isso é deliberado — eles continuam usando fallback legado até alguém priorizar a integração. Não é bug, é entrega faseada.

---

## Glossário rápido para a próxima sessão

| Termo | O que é |
|---|---|
| **Plano A / Compass** | Fix do calculator (algoritmo std_skills + tipos + 11 call-sites) — feito |
| **Plano B / Tailor** | Pesos por vaga (migration + UI) — pendente |
| **Plano C / Mirror** | Polimento UX (toggle, modal, dupla confirmação) — pendente |
| **Sul Santana 6→44** | Caso emblemático: candidata real com 20 std_skills financeiras tirava 6% no Analista Financeiro (legado) → 44% no algoritmo correto |
| **Q1-Q8** | Perguntas resolvidas no brainstorming, registradas no spec |
| **`useMatchSkillIds`** | Hook combinador criado em Plano A (Task 5) |
| **`MatchSkillsInput`** | Estrutura `{candidateTechnical, candidateBehavioral, jobTechnical, jobBehavioral}` |
| **`@deprecated calculateSkillsScore`** | Algoritmo legado tokenizado, mantido como fallback |
| **Std skills** | 40 técnicas + 40 comportamentais em `standardized_skills` (catálogo); `candidate_standardized_skills` e `job_standardized_skills` armazenam seleções com `priority` |

---

## Estado das memórias

- [x] `MEMORY.md` global atualizado com PRD-092
- [ ] Adicionar entrada apontando para este checkpoint (próxima ação após salvar este arquivo)
