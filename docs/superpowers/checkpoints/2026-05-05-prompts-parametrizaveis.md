# Checkpoint: Parametrização de Prompts de IA + UI Admin Reforçada

**Data:** 2026-05-05
**Branch:** `feat/ai-match`
**Versão atual da branch:** `v1.60.0` "Curator" (commit `d3f361b`)
**Último commit:** `7ea6811` (`docs(checkpoint): document pending uncommitted changes`)
**Solicitado por:** Edmilson Souza

> **🟢 STATUS — 2026-05-05 (auditoria de pendências):**
> R1 (mover AI Match prompt) e R2 (PromptEditor reforçado) **JÁ FORAM IMPLEMENTADAS** no commit `d3f361b` (v1.60.0 "Curator") — parte foi feita em sessão paralela depois deste checkpoint inicial. Conferir a seção "Status pós-implementação" abaixo. As únicas pendências reais agora são: (a) commit do arquivo `097_fix_ai_match_quota_subscription_lookup.sql` (já aplicado no banco) e (b) decidir/commitar mudanças de wording em `AIMatchQuotaBadge`/`RegenerateConfirmDialog`.

---

## Contexto

A feature **AI Match v1.59.0 "Insight"** (análise inteligente candidato↔vaga via Claude com cota mensal por empresa) já foi implementada e está funcionando em produção (16 commits + 4 fixes pós-implementação). O usuário validou em ambiente real com a candidata Gabrielli Cruz (vaga "Desenvolvedor TypeScript" da TechSolutions). Persistência confirmada em `ai_match_analyses` (1582 tokens in / 2219 out / 24.9s / score algorítmico 71%).

Após a validação, três melhorias foram solicitadas:

1. **✅ JÁ APLICADO** — Colapsáveis fechados por padrão (commit `e0acfa1`).
2. **🔜 PENDENTE — ESTE CHECKPOINT** — Mover o system prompt do AI Match para `system_settings` (mesma mecânica do prompt da Análise Comportamental existente), preservando byte-a-byte o conteúdo atual.
3. **🔜 PENDENTE — ESTE CHECKPOINT** — Adicionar UI reforçada para edição de qualquer prompt parametrizado: advertência ao iniciar edição, **dupla confirmação** ao salvar, **histórico de alterações** visível por prompt. Aplicar a **TODOS** os prompts parametrizáveis (não só o do AI Match — também os 3 prompts existentes do teste comportamental).

---

## Estado atual do código (fatos verificados)

### Prompts já parametrizados (3 existentes)

Definidos em `src/data/settingsConfig.ts` na subcategoria **`admin-ai-prompts`** (panel `admin`, category `ai`, subcategory `prompts`):

| Field key | Nome exibido | Default value (excerpt) |
|-----------|--------------|--------------------------|
| `systemPrompt` | Prompt do Sistema (Persona) | "Você é um especialista em psicologia organizacional e avaliação comportamental, com profundo conhecimento em avaliação comportamental, incluindo modelos como Predictive Index (PI) e Big Five (OCEAN)..." |
| `practicalPromptTemplate` | Template da Análise Prática | "CONTEXTO: Você está gerando uma análise para um recrutador ou gestor de contratação que NÃO tem formação em psicologia..." |
| `technicalPromptTemplate` | Template da Análise Técnica | "CONTEXTO: Você está gerando uma análise técnica para um profissional de RH com formação em psicologia organizacional..." |

Carregados via `loadAgentSettingsAsync()` em `src/lib/aiAgent/settingsLoader.ts` (linhas 105-107). Consumidos por `analysisGenerator.ts` (linhas 34-39).

### Prompt AI Match (HARDCODED — alvo da migração)

- **Arquivo:** `src/services/aiMatch/aiMatchPromptBuilder.ts`
- **Constante:** `AI_MATCH_SYSTEM_PROMPT` (linhas ~14-58)
- **Tamanho aproximado:** ~1.500 caracteres
- **Última alteração:** commit `c065ea9` — corrigido para descrever Gauge-Pro/PI corretamente, removendo referências a DISC. **PRESERVAR ESTE CONTEÚDO EXATO** ao mover para system_settings.

### Infraestrutura de histórico já existe

Tabela `settings_history` (verificada via Supabase MCP) com colunas:
```
id uuid, panel text, category_key text, subcategory_key text,
field_key text, field_name text, previous_value jsonb, new_value jsonb,
entity_id uuid, changed_by uuid, changed_by_name text, created_at timestamptz
```

A tabela já é populada por settings updates existentes (`settingsService` deve gravar nela em UPDATEs). A peça que falta é **UI de visualização do histórico por prompt** + **fluxo de edição com advertência + dupla confirmação**.

### Componente atual de edição de prompts

A subcategoria `admin-ai-prompts` é renderizada pela tela genérica de configurações (`src/pages/admin/Configuracoes.tsx` ou similar). Os campos `textarea` aparecem como editáveis simples — sem advertência, sem dupla confirmação, sem histórico inline.

**Pesquisar para localizar o renderer:**
```bash
grep -rn "admin-ai-prompts\|practicalPromptTemplate" src/pages/admin/ src/components/admin/
```

---

## Requisitos da próxima sessão (consolidados)

### R1 — Migrar AI Match system prompt para system_settings

- Adicionar 4º campo na subcategoria `admin-ai-prompts` em `src/data/settingsConfig.ts`:
  - `id: 'prompt-ai-match'`
  - `key: 'aiMatchSystemPrompt'` (camelCase, novo)
  - `name: 'Prompt do Sistema — AI Match (Análise candidato↔vaga)'`
  - `description: 'Persona e regras enviadas à IA ao gerar a Análise IA do match candidato↔vaga. Os dados da vaga, candidato e resultado do match algorítmico são inseridos automaticamente antes deste texto.'`
  - `type: 'textarea'`
  - `defaultValue:` **copiar BYTE A BYTE** o conteúdo atual de `AI_MATCH_SYSTEM_PROMPT` em `src/services/aiMatch/aiMatchPromptBuilder.ts` (preservar quebras de linha `\n` e backticks como literal)
  - `validation: { required: true, minLength: 200, maxLength: 8000 }`
  - `order: 4`

- Atualizar `src/lib/aiAgent/settingsLoader.ts` para também ler `aiMatchSystemPrompt` do `prompts` settings (linhas ~105-107). Adicionar campo opcional ao tipo `AIAgentSettings` em `src/types/aiAnalysis.ts`.

- Atualizar `src/services/aiMatch/aiMatchPromptBuilder.ts`:
  - Manter a constante `AI_MATCH_SYSTEM_PROMPT` como **DEFAULT_AI_MATCH_SYSTEM_PROMPT** (renomear) — passa a ser o fallback.
  - `buildAIMatchRequest()` recebe um novo parâmetro `customSystemPrompt?: string`. Se presente, usa ele; senão usa o default.
  - Atualizar `useAIMatchQuery.ts` (`mutationFn`) para passar `settings.aiMatchSystemPrompt ?? undefined` ao builder.

- Verificar build, gerar análise no app, confirmar comportamento idêntico ao atual (prompt hardcoded e parametrizado byte-a-byte iguais).

### R2 — UI reforçada para edição de prompts (TODOS os 4)

Aplicar para os 4 fields: `systemPrompt`, `practicalPromptTemplate`, `technicalPromptTemplate`, `aiMatchSystemPrompt`.

**Comportamentos a implementar:**

1. **Advertência de pré-edição** — Antes de abrir o textarea para edição, mostrar AlertDialog:
   > ⚠️ **Você está prestes a editar um prompt usado pela IA**
   >
   > Mudanças no prompt afetam diretamente a qualidade e a estrutura das análises geradas. Edite com atenção:
   >
   > - Se o prompt define uma **estrutura obrigatória de seções** (ex.: 5 títulos `##`), preserve essas seções — o front-end pode depender disso para renderizar.
   > - Não remova **regras críticas** (ex.: "responda em português", "não invente fatos").
   > - Mudanças entram em vigor imediatamente para todas as próximas análises.
   >
   > Botões: `[Cancelar]` `[Entendi, vou editar]`

2. **Edição habilitada após confirmação** — só após "Entendi, vou editar" o textarea fica editável. Adicionar botão **"Restaurar valor padrão"** ao lado, que carrega o `defaultValue` do field config (volta para o prompt-fábrica).

3. **Dupla confirmação ao salvar** — Ao clicar em Salvar, mostrar AlertDialog com **diff** (linhas adicionadas em verde / removidas em vermelho — usar lib `diff` ou impl simples linha-a-linha). Caixa de digitação obrigando a digitar a palavra **"CONFIRMAR"** para habilitar o botão `[Salvar definitivamente]`. Botão `[Cancelar]` retorna sem salvar.

4. **Histórico de alterações** — Drawer/Sheet/Accordion lateral abrindo via botão **"Ver histórico"** próximo ao campo. Lista cronológica decrescente de entries de `settings_history` filtradas por `(panel='admin', category_key='ai', subcategory_key='prompts', field_key=<key>)`. Cada entry mostra:
   - Data/hora (`created_at`, formatada `dd/MM/yyyy HH:mm`)
   - Quem alterou (`changed_by_name`)
   - **Diff colapsado** entre `previous_value` e `new_value`
   - Botão **"Restaurar esta versão"** que pré-popula o textarea com o valor antigo (mas não salva ainda — o admin precisa passar de novo pelo fluxo de dupla confirmação).

**Componentes prováveis a criar:**
- `src/components/admin/PromptEditor.tsx` — wrapper que envolve um textarea com toda a guarda
- `src/components/admin/PromptEditConfirmDialog.tsx` — dialog com diff + caixa de "CONFIRMAR"
- `src/components/admin/PromptHistorySheet.tsx` — sheet com timeline de mudanças
- `src/components/admin/PromptDiffView.tsx` — diff inline simples
- `src/hooks/useSettingsHistoryByField.ts` — query que lê settings_history filtrada

**Componente a modificar (renderer atual de fields):**
- Localizar o componente que hoje renderiza os textareas dos prompts existentes (provavelmente `src/components/admin/SettingsField.tsx` ou similar). Para `type: 'textarea'` na subcategoria `admin-ai-prompts`, **substituir** o renderer padrão pelo novo `PromptEditor`.

**Service:**
- Verificar se `settings_history` é gravada automaticamente por `settingsService.updateSetting()`. Se não for, adicionar um trigger Postgres ou explicitar o INSERT no service. Verificar com:
  ```sql
  SELECT * FROM settings_history WHERE field_key IN
    ('systemPrompt','practicalPromptTemplate','technicalPromptTemplate')
   ORDER BY created_at DESC LIMIT 5;
  ```
  Se vazio, é forte sinal de que não há gravação automática.

### R3 — Verificação end-to-end

1. Login como admin, navegar para `/admin/configuracoes`, abrir subcategoria "Prompts de Análise"
2. Confirmar que existem 4 campos de prompt (3 antigos + AI Match novo)
3. Tentar editar `systemPrompt` → deve aparecer AlertDialog de advertência
4. Aceitar → editar texto → clicar Salvar → AlertDialog de dupla confirmação com diff
5. Digitar "CONFIRMAR" → salvar → toast de sucesso
6. Abrir "Ver histórico" → confirma que a edição aparece com diff e quem alterou
7. Clicar "Restaurar esta versão" em uma entry antiga → textarea preenchido com valor antigo
8. Sair sem salvar → reabrir → estado salvo permanece o salvo (não o restaurado)
9. Gerar Análise IA num candidato → verificar que usa o prompt salvo (validar via tokens_input no banco — comprimento muda)

---

## Decisões já tomadas (NÃO repetir brainstorming)

| Decisão | Valor |
|---------|-------|
| Armazenamento dos 4 prompts | `system_settings`, panel `admin`, category `ai`, subcategory `prompts` (mesmo lugar dos 3 atuais) |
| Conteúdo inicial do `aiMatchSystemPrompt` | Cópia byte-a-byte do `AI_MATCH_SYSTEM_PROMPT` em `aiMatchPromptBuilder.ts` (commit `c065ea9` é a versão correta) |
| Histórico | Reutilizar tabela `settings_history` existente (não criar tabela nova) |
| Confirmação dupla | Diff + digitação obrigatória da palavra "CONFIRMAR" |
| Onde aplicar UI reforçada | Todos os 4 campos da subcategoria `admin-ai-prompts` (sem exceção) |
| Restauração do default | Botão dedicado "Restaurar padrão" ao lado do textarea |
| Restauração de versão anterior | Pré-popula textarea, mas precisa passar pelo fluxo de dupla confirmação para salvar |

---

## Plano de execução sugerido para a próxima sessão

Recomendo dispatch via `superpowers:writing-plans` (este checkpoint é o spec). Ordem de tasks:

0. **PRIMEIRO — limpar pendências detectadas no estado git**:
   - **0a.** Commitar a migration `097_fix_ai_match_quota_subscription_lookup.sql` (já aplicada no banco, só falta versionar): `git add sql/migrations/097_fix_ai_match_quota_subscription_lookup.sql && git commit -m "fix(ai-match): correct subscription lookup join (use companies.profile_id)"`
   - **0b.** Confirmar com o usuário a mudança de "restantes" → "utilizadas" em `AIMatchQuotaBadge.tsx` e `RegenerateConfirmDialog.tsx`. Se confirmado, varrer os outros componentes (`AIMatchHeader`, `AIMatchEmptyState`, `AIMatchExhaustedState`) para checar consistência e commitar tudo junto: `feat(ai-match): rephrase quota copy from "restantes" to "utilizadas"`.
   - **0c.** Push de tudo para o remote: `git push`.

1. **Schema/data:** estender `settingsConfig.ts` com o 4º field
2. **Service/loader:** atualizar `settingsLoader.ts` + `aiAgent/types`
3. **Migrar AI Match builder:** aceitar custom prompt + manter default
4. **Migrar hook:** `useAIMatchQuery` passa o prompt custom
5. **Verificar persistência de histórico:** confirmar que settings_history grava — se não, adicionar
6. **Criar `useSettingsHistoryByField` hook**
7. **Criar `PromptDiffView`** (componente leaf)
8. **Criar `PromptHistorySheet`** (sheet com timeline)
9. **Criar `PromptEditConfirmDialog`** (dialog com diff + CONFIRMAR)
10. **Criar `PromptEditor`** (wrapper orquestrador)
11. **Localizar e refatorar `SettingsField`** para usar PromptEditor em prompts da subcategoria `admin-ai-prompts`
12. **Testar end-to-end** conforme R3
13. **Bump versão** para `v1.60.0` (codename a escolher — sugestões: "Curator", "Quill", "Scribe", "Edit")
14. **Atualizar changelog**

**Estimativa:** 12-15 commits, ~3-4 horas de implementação focada.

---

## Estado git relevante (para retomar)

### Branch e push

- **Branch:** `feat/ai-match`
- **Tracking:** `origin/feat/ai-match`
- **Commits ahead of origin:** **0** (todos os commits abaixo já foram pushed)

### Histórico de commits da feature (já no remote)

```
4cc3329 docs(checkpoint): parametrização de prompts de IA + UI admin reforçada
e0acfa1 fix(ai-match): collapsible sections default to closed (was expanded)
f04af37 feat(ai-match): collapsible sections in dossier (default expanded)
ae5a65c feat(ai-match): thread Gauge-Pro result through MatchTabs to prompt builder
c065ea9 fix(ai-match): use Gauge-Pro test data in prompt + correct system prompt
059415e fix(ai-match): replace require() with ESM static import in service factory
1f085b6 chore: bump version to 1.59.0 'Insight' (AI Match)
9cae6a5 fix(ai-match): use camelCase Candidate/Job types and update prompt builder
aacf9ad feat(ai-match): integrate MatchTabs into candidate profile page
9cdd33d feat(ai-match): add MatchTabs wrapper (algorithmic + AI tabs)
7199f5c feat(ai-match): add tab orchestrator with all states
9c4271a feat(ai-match): add content renderer
9bb1814 feat(ai-match): add regenerate dialog and analysis header
62696ee feat(ai-match): add quota visualization components (badge, empty, exhausted)
3283a4e feat(ai-match): add React Query hooks (analysis, quota, generate, regenerate)
fc7a2df feat(ai-match): add prompt builder with prompt caching on system+job
63087ad feat(ai-match): add Supabase service implementation
7b0fa35 feat(ai-match): add service interface and factory
35193f7 feat(ai-match): add domain types
0cded53 chore(types): regenerate database.ts to match current schema (incl. ai_match)
426d64b feat(ai-match): add RPCs (consume, save, refund, get_status)
81db934 feat(ai-match): add migration skeleton (tables, indexes, RLS, capability)
```

### ⚠️ ATENÇÃO — ALTERAÇÕES PENDENTES DE COMMIT/PUSH

Detectadas após o checkpoint inicial. **TRATAR PRIMEIRO**, antes de iniciar o trabalho de parametrização (R1/R2/R3 acima):

#### 1. Bugfix CRÍTICO já aplicado no banco mas migration UNTRACKED

`sql/migrations/097_fix_ai_match_quota_subscription_lookup.sql` (untracked) — corrige bug grave nas 4 RPCs do AI Match: o lookup de subscription usava `s.user_id = v_company_id`, mas `subscriptions.user_id` armazena `companies.profile_id`, não `companies.id`. Sem a fix, **todas as empresas caíam no fallback (3 análises)** e a configuração `ai_match_monthly_quota` por plano era ignorada silenciosamente.

A fix muda o JOIN para:
```sql
INNER JOIN public.companies c
  ON c.profile_id = s.user_id AND c.id = v_company_id
```

**Status:** já aplicada via MCP Supabase (`pg_proc.prosrc` confirma o INNER JOIN está em produção). O arquivo `.sql` precisa só ser commitado e pushed para o remote.

**Ação na próxima sessão:** `git add sql/migrations/097_fix_ai_match_quota_subscription_lookup.sql && git commit -m "fix(ai-match): correct subscription lookup join (use companies.profile_id)"` + `git push`.

#### 2. Modificações WIP em arquivos do próprio AI Match

Mudanças de **wording** ainda não commitadas (provavelmente ajuste de UX feito pelo usuário entre sessões):

- `src/components/aiMatch/AIMatchQuotaBadge.tsx` — texto e `aria-label` mudados de **"X de N restantes"** para **"X de N utilizadas"** (e usa `status.used` em vez de `status.remaining`).
- `src/components/aiMatch/RegenerateConfirmDialog.tsx` — descrição mudada de _"Isso irá consumir 1 de N análises restantes este mês. Após regeneração, sua cota disponível será X."_ para _"Isso irá consumir 1 análise. Você já utilizou N de M este mês. Após regeneração, ainda restarão X análises."_

**Ação na próxima sessão:** confirmar com o usuário se as mudanças são definitivas e commitar como `feat(ai-match): rephrase quota copy from "restantes" to "utilizadas"`. Verificar se há outros lugares que ainda dizem "restantes" para manter consistência (`AIMatchHeader.tsx`, `AIMatchEmptyState.tsx`, `AIMatchExhaustedState.tsx` — todos usam `AIMatchQuotaBadge` com a nova frase, mas podem ter texto adjacente que ainda fale em "restantes").

### WIP em outras features (NÃO MEXER)

Modificações pertencentes a outras features em curso, alheias ao AI Match. Não comitar junto com o trabalho de parametrização:

- `.claude/settings.local.json`
- `src/components/billing/CancelSubscriptionModal.tsx`
- `src/hooks/useStripeQuery.ts`
- `src/lib/formatters.ts`
- `src/pages/empresa/MyPlan.tsx`
- `src/pages/empresa/Packages.tsx`
- `src/services/plans/plansService.supabase.ts`
- `supabase/config.toml`
- `supabase/functions/stripe-webhook/index.ts`
- Untracked: `supabase/functions/stripe-cancel-subscription/`

> **Nota:** A migration `095_count_candidate_external_applications.sql` e o hook `useExternalApplicationsCount.ts` que apareciam como untracked no início desta sessão **foram commitados em algum momento** entre as sessões — não estão mais na working tree.

---

## Status pós-implementação (auditoria 2026-05-05)

### ✅ R1 — Migração do AI Match prompt para system_settings — **CONCLUÍDO** em commit `d3f361b`

Implementado:
- Adicionado 4º field `aiMatchSystemPrompt` na subcategoria `admin-ai-prompts` em `src/data/settingsConfig.ts`
- `settingsLoader.ts` lê `aiMatchSystemPrompt` junto com os 3 prompts existentes
- `aiMatchPromptBuilder.ts` aceita `customSystemPrompt` (fallback para `DEFAULT_AI_MATCH_SYSTEM_PROMPT`)
- `useAIMatchQuery` passa `settings.aiMatchSystemPrompt` para o builder

### ✅ R2 — UI reforçada para edição de prompts — **CONCLUÍDO** em commit `d3f361b`

Implementado para os 4 prompts (`systemPrompt`, `practicalPromptTemplate`, `technicalPromptTemplate`, `aiMatchSystemPrompt`):
- `PromptEditor.tsx` — wrapper com warning dialog ao iniciar edição, botão "Restaurar padrão", discard guard
- `PromptEditConfirmDialog.tsx` — diff view + caixa obrigatória digitando "CONFIRMAR" para habilitar Salvar
- `PromptHistorySheet.tsx` — timeline cronológica de `settings_history` com diff e botão restaurar
- `PromptDiffView.tsx` — diff inline LCS sem dependência externa
- `useSettingsHistoryByField.ts` — hook React Query filtrando settings_history por field
- `useSettings.saveField()` — persistência atômica per-field
- `ConfigContent` detecta `admin/ai/prompts` e usa `PromptEditor` em vez de textarea simples

### 🎁 Extras feitos no mesmo commit

- `viewOnly` prop em `AIMatchHeader` (esconde badge de cota em fluxo de impersonação)
- `AIMatchImpersonationNotice` componente novo
- `AIMatchTab` detecta impersonação e propaga `viewOnly`

### 📦 Versão

- Bumped: **v1.59.0 "Insight" → v1.60.0 "Curator"**
- Changelog atualizado em `public/changelog.json`

---

## Pendências REAIS para próxima sessão (curtas)

1. **Commitar migration 097** (já aplicada no banco):
   ```
   git add sql/migrations/097_fix_ai_match_quota_subscription_lookup.sql
   git commit -m "fix(ai-match): correct subscription lookup join (use companies.profile_id)"
   ```

2. **Decidir + commitar mudanças de wording** em `AIMatchQuotaBadge.tsx` e `RegenerateConfirmDialog.tsx` ("restantes" → "utilizadas"). Verificar consistência com `AIMatchHeader`/`AIMatchEmptyState`/`AIMatchExhaustedState`.

3. **Push final** para o remote.

---

## Como retomar

> "Limpar pendências do checkpoint `2026-05-05-prompts-parametrizaveis.md` (097 migration + wording)."

---

**Fim do checkpoint.**
