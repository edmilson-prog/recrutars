# Checkpoint: Parametrização de Prompts de IA + UI Admin Reforçada

**Data:** 2026-05-05
**Branch:** `feat/ai-match`
**Versão atual da branch:** `v1.59.0` "Insight" (já em commit `1f085b6`)
**Último commit:** `e0acfa1` (`fix(ai-match): collapsible sections default to closed`)
**Solicitado por:** Edmilson Souza
**Continua em:** próxima sessão (auto mode estava ativo, sessão pausada para retomada)

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

```
Branch: feat/ai-match
HEAD : e0acfa1 fix(ai-match): collapsible sections default to closed
       f04af37 feat(ai-match): collapsible sections in dossier
       ae5a65c feat(ai-match): thread Gauge-Pro result through MatchTabs
       c065ea9 fix(ai-match): use Gauge-Pro test data in prompt + correct system prompt
       059415e fix(ai-match): replace require() with ESM static import
       1f085b6 chore: bump version to 1.59.0 'Insight' (AI Match)
       ... (mais 14 commits da feature AI Match)
```

WIP em outras features (NÃO mexer):
- `.claude/settings.local.json`, `CancelSubscriptionModal.tsx`, `useStripeQuery.ts`, `formatters.ts`, `MyPlan.tsx`, `Packages.tsx`, `plansService.supabase.ts`, `supabase/config.toml`, `supabase/functions/stripe-webhook/index.ts`
- Untracked: migration `095_count_candidate_external_applications.sql`, `useExternalApplicationsCount.ts`, `supabase/functions/stripe-cancel-subscription/`

---

## Como retomar

Na próxima sessão, comando recomendado:

```
/superpowers:writing-plans

Spec aprovada em D:\claude\recrutars-maike\docs\superpowers\checkpoints\2026-05-05-prompts-parametrizaveis.md — Parametrizar prompts de IA via system_settings com UI reforçada (advertência, dupla confirmação, histórico). Aplicar a 4 prompts (3 existentes + AI Match novo).
```

Ou simplesmente:

> "Continue do checkpoint `2026-05-05-prompts-parametrizaveis.md`."

---

**Fim do checkpoint.** Esta sessão pausa aqui.
