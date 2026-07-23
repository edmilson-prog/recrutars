# Lançamentos Financeiros (Fluxo de Caixa) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um módulo admin de lançamentos financeiros manuais (receitas/despesas, contas a pagar/receber + caixa) com anexo de NFs, parcelamento, recorrência e um dashboard de fluxo de caixa que consolida assinaturas (Stripe) + avulsos.

**Architecture:** Módulo admin-only sobre Supabase (4 tabelas novas + RLS + RPCs + bucket privado), camada de serviço (factory lazy + impl Supabase) + hooks React Query, e UI React/shadcn com lista de 3 visualizações alternáveis, formulário com upload, e dashboard Recharts. Spec aprovado: `docs/superpowers/specs/2026-06-17-lancamentos-financeiros-design.md`.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind + shadcn/ui (Radix), React Router v6, React Query v5, React Hook Form + Zod, Recharts 2.15, Supabase, Vitest (já presente, v3.2.6).

---

## 🚦 Roteiro de entrega — 3 PRs

> **Decidido em 2026-07-22.** Spec de entrega: `../specs/2026-07-21-implementacao-financeiro-faseada-design.md`.
> As fases **não** são executadas em sequência corrida até o fim: elas se agrupam em três PRs, cada um com seu bump MINOR e changelog.

| PR | Conteúdo | Steps | Versão |
|---|---|---|---|
| **A** | Fases 1, 2, 4 · Fase 3 **sem a view Foco** · Tasks 8.1–8.2 | ~171 | v1.75.0 "Ledger" |
| **B** | Fases 5 e 6 (dashboard + categorias) | 75 | v1.76.0 |
| **C** | Fase 7 · Task 3.8b (view Foco) · Tasks 8.3–8.6 | ~61 | v1.77.0 |

**Ao executar, respeite estes desvios do texto original das fases:**

1. **Tasks 8.1 e 8.2 rodam ANTES da Fase 3**, não no fim. Elas criam os tokens `--fin-*` e os aplicam nos componentes de valor. Se ficarem para o PR C, a lista e o formulário nascem sem a cor que distingue receita de despesa e precisam ser reescritos.
2. **A Task 3.8 foi dividida** em `3.8a` (view Fluxo — PR A) e `3.8b` (view Foco — PR C), porque as duas views caem em PRs diferentes. A Task 3.9 (container) fica no PR A e nasce registrando **duas** views; o PR C acrescenta a terceira.
3. **O formulário do PR A tem `ToggleGroup` de 2 opções** (`Único | Parcelado`). "Recorrente" só aparece no PR C, junto com a RPC e o cron que o materializam — oferecer antes gravaria regras que nada executa.
4. **A Task 8.5 (version bump) é o bump do PR C.** Os PRs A e B fecham com tasks de bump próprias, criadas na execução seguindo o mesmo formato da 8.5.
5. **O spec de produto foi revisado em 21/07** com seis decisões vindas do mockup navegável. Onde o texto de uma task divergir do spec, **o spec prevalece** — as divergências conhecidas estão sinalizadas com `⚠️ REVISADO 21/07` na própria task.

## Global Constraints

- **Branch:** `feat/financial-entries`.
- **Admin-only:** RLS `get_user_type(auth.uid()) = 'admin'` (+ policy `service_role` para Edge Function/cron). A tabela `public.users` NÃO existe — nunca usar.
- `get_company_id(auth.uid())` sempre com argumento uuid.
- **snake_case (DB) ↔ camelCase (TS)** via normalizadores `rowToX` no serviço (ver `supabaseConverters.ts`).
- Imports com alias `@/`; `cn()` para classes; `formatBRL` para moeda (pt-BR).
- `amount` **sempre positivo**; sinal/cor vêm do `type`. **`overdue` é DERIVADO** (`status='pending' AND due_date < hoje`), não armazenado.
- `.delete()`/`.update()` sob RLS **retornam sem erro ao bloquear** — sempre `.select()` e conferir linhas afetadas.
- **Anexos:** bucket privado `financial-documents` + **signed URLs** (nunca `getPublicUrl`).
- **Tokens** HSL `--fin-income`/`--fin-expense` (light+dark) no padrão `--test-*`, com os **valores calibrados da Task 8.1** (`160 84% 27%` / `0 72% 42%` no light; `160 55% 45%` / `4 80% 66%` no dark) — **não** derivar de `--success`/`--destructive`. Cyan só para interação; status em badge (success/warning/destructive/muted). Roboto Mono, `tabular-nums`, `prefers-reduced-motion`.
- **Paleta de charts (⚠️ REVISADA 21/07):** a antiga `#06b6d4 / #3b82f6 / #10b981 / #f59e0b / #1e3a8a` foi **descartada** — usava o cyan de interação e o verde de receita numa rosca de despesas. Gráfico âncora usa os próprios `--fin-*` (Assinaturas × Avulsos por luminância + textura); rosca de categorias usa rampa navy→cyan sensível ao tema. Detalhes no topo da Fase 5.
- **Cores de categoria** evitam as faixas **0–20°**, **150–170°** e **190–205°** (colidem com atraso, receita e interação dentro da linha da lista). Paleta do seed na Task 1.5.
- **Dois eixos de filtro:** `status` (armazenado) e `dueWindow` (derivado) são **independentes e combináveis**. `'overdue'` nunca é valor de status. Ver Task 1.11.
- **UI em PT-BR** com acentuação correta (UTF-8).
- **Migrations a partir de 120** (a `main` já tem até `119_sync_candidate_visibility_on_lifecycle`), salvas em `sql/migrations/` e aplicadas via MCP Supabase `apply_migration`.
- `public/changelog.json`: cada item com `details` (description/files/routes); tipos válidos (added/changed/deprecated/removed/fixed/security); `isCurrent` em exatamente uma versão.
- **Verificação:** Vitest (TDD) para lógica pura; `npm run lint` + `npx tsc --noEmit` para TS; verificação visual no dev server (porta 3000) para UI.

---

## Notas de consistência (ler antes de executar)

> Correções que reconciliam divergências entre fases geradas em paralelo. **Em caso de conflito, estas notas prevalecem sobre o texto das tasks.**

0. **⚠️ NUMERAÇÃO DE MIGRATIONS (crítico):** o corpo deste plano **já foi renumerado** — não aplique nenhum deslocamento adicional. A `main` contém migrations até `119_sync_candidate_visibility_on_lifecycle`, então esta feature ocupa **120–127**:

   | # | Arquivo | Fase |
   |---|---------|------|
   | 120 | `120_financial_categories.sql` | 1 |
   | 121 | `121_financial_entries.sql` | 1 |
   | 122 | `122_financial_attachments.sql` | 1 |
   | 123 | `123_financial_recurrences.sql` | 1 |
   | 124 | `124_financial_rpcs.sql` | 1 |
   | 125 | `125_financial_storage_bucket.sql` | 1 |
   | 126 | `126_generate_due_recurrences.sql` | 7 |
   | 127 | `127_schedule_recurrences_cron.sql` | 7 |

   **Antes de criar a primeira migration, confira `ls sql/migrations/ | tail -5`.** Se a `main` tiver avançado além de 119 desde este rebase, desloque o bloco inteiro mantendo a ordem relativa. Nota: a `main` tem uma colisão pré-existente de número (dois arquivos `117_*`) — é dela, não desta feature; não tente "consertar" renumerando o que já foi aplicado.

1. **O helper de status efetivo (`overdue`) é ÚNICO.** Canônico: `effectiveStatus(status: EntryStatus, dueDateISO: string, todayISO?: string): EffectiveStatus` em `src/lib/finance/status.ts` (Fase 2, Task 2.2), ao lado de `todayISO()` e `daysUntil()`.
   - **Fase 1 / Task 1.3:** NÃO criar `deriveEffectiveStatus` em `financeConverters.ts`. Crie-o já como `effectiveStatus` em `src/lib/finance/status.ts` (mesma lógica e testes). Os `rowToX` de `financeConverters.ts` permanecem puros sobre a row (não computam overdue).
   - **Fase 3:** onde aparece `getEffectiveStatus(entry, today?: Date)`, use o canônico `effectiveStatus(entry.status, entry.dueDate)` de `@/lib/finance/status`. Não crie um terceiro helper.

2. **Localização da lógica pura de finanças (todas com testes Vitest):** `status.ts` (effectiveStatus/daysUntil/todayISO), `installments.ts` (calcInstallments/addByFrequency), `recurrence.ts` (nextRunFromDate/enumerateDueDates), `cashflow.ts` (aggregateCashflow), `financeConverters.ts` (rowToX) — todos em `src/lib/finance/`.

3. **Ordem de execução:** 1 → 2 → (3, 4, 5, 6 podem rodar em paralelo após a 2) → 7 → 8. A Fase 3 registra as rotas de Dashboard (Fase 5) e Categorias (Fase 6) com componentes placeholder; substitua-os ao chegar nessas fases.

4. **Versão alvo (Fase 8):** o texto assume bump de `1.74.0 "Herald"` (estado da `main` neste rebase) para **`1.75.0 "Ledger"`**. Como a Fase 8 só roda no fim, **releia `src/constants/app.ts` antes do bump** — se a `main` já tiver avançado, use o próximo MINOR a partir do que estiver lá, mantendo o codename "Ledger". O mesmo vale para a versão a marcar como `isCurrent: false` em `public/changelog.json`.

---

## Fase 1: Fundação de dados (migrations, RLS, RPCs, Storage, tipos)

> **📍 STATUS (auditado em 2026-07-21): parte TypeScript concluída, parte SQL não iniciada.**
>
> | Task | Estado |
> |------|--------|
> | 1.1 Vitest | ✅ concluída (já na `main`, v3.2.6) |
> | 1.2 Tipos canônicos | ✅ concluída |
> | 1.3 `effectiveStatus` | ✅ concluída (em `status.ts`, ver Nota 1) |
> | 1.4 Converters `rowToX` | ✅ concluída |
> | 1.5–1.10 Migrations 120–125 | ⬜ **não iniciadas** |
>
> **Nenhum arquivo SQL foi criado e nenhuma tabela `financial_*` existe no Supabase** (verificado no banco). O próximo passo da feature é a **Task 1.5**. Pendência menor: o smoke test `sanity.test.ts` deveria ter sido removido na 1.3 e continua na suíte.

> Pré-requisitos lidos do projeto:
> - Última migration aplicada: `sql/migrations/119_sync_candidate_visibility_on_lifecycle.sql` → esta fase usa **120–125** (a Fase 7 usa 126–127).
> - Trigger compartilhado já existe: `public.update_updated_at()` (migration 001).
> - RLS admin: `public.get_user_type(auth.uid()) = 'admin'` (migration 001). **NUNCA** `EXISTS (SELECT 1 FROM public.users …)` — tabela não existe.
> - Padrão de bucket: `032_create_brand_assets_bucket.sql` (mas **privado**, com signed URLs).
> - Padrão de RPC atômica: `replace_curriculum_children` (migration 104) e `create_financial_entry_with_installments` espelha o estilo `jsonb_to_recordset`.
> - `tsconfig.app.json` tem `strict:false`, `noImplicitAny:false` → tipagem dos converters pode usar `Record<string, unknown>`.
> - ESLint usa `globals.browser` (sem `describe/it/expect`). **Solução**: importar `describe/it/expect` explicitamente de `vitest` nos testes (sem mexer no eslint).
> - Migrations são salvas em `sql/migrations/` **E** aplicadas via MCP Supabase `apply_migration`.

Convenção de verificação desta fase:
- **Lógica pura** (converters, `deriveEffectiveStatus`) → TDD real com Vitest.
- **Migrations** → salvar `.sql` + `apply_migration` via MCP + verificar com `list_tables` / `get_advisors`.
- **Tipos** → `npx tsc --noEmit`.

---

### Task 1.1: Instalar e configurar Vitest

> ✅ **JÁ CONCLUÍDA — não reexecutar.** O runner do Vitest chegou à `main` por esta própria branch e depois foi atualizado para **v3.2.6**. `vitest.config.ts`, os scripts `test`/`test:watch` e o alias `@/` já existem. **O `npm install` abaixo faria downgrade para a v2 — pule-o.** Para conferir: `npm test` deve rodar a suíte inteira verde.

**Files:**
- Modify: `package.json` (devDep + scripts `test`/`test:watch`)
- Create: `vitest.config.ts`
- Create: `src/lib/finance/__tests__/sanity.test.ts` (smoke test, removido na 1.3)

**Interfaces:**
- Consumes: nada.
- Produces: comando `npm test` (alias `vitest run`) funcional, com alias `@/` resolvido e ambiente `node`.

**Steps:**

- [x] ~~Instalar a devDependency do Vitest~~ — já presente como `vitest@^3.2.6`. **Não rodar `npm install -D vitest@^2.1.8`** (downgrade). Apenas confirme:
```bash
npm test
```
Saída esperada: a suíte roda verde (inclui os testes de `src/lib/finance/` e os já existentes na `main`).

- [x] Criar `vitest.config.ts` com resolução do alias `@/` (mesmo de `vite.config.ts`) e ambiente `node` (lógica pura não precisa de DOM):
```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [x] Adicionar os scripts `test` e `test:watch` ao `package.json` (bloco `scripts`, após `"preview": "vite preview"`):
```json
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
```

- [x] Criar `src/lib/finance/__tests__/sanity.test.ts` para validar o runner e o alias:
```ts
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [x] Rodar e ver passar:
```bash
npm test
```
Saída esperada: `Test Files  1 passed (1)` / `Tests  1 passed (1)`.

- [x] Commit:
```bash
git add package.json package-lock.json vitest.config.ts src/lib/finance/__tests__/sanity.test.ts && git commit -m "$(cat <<'EOF'
chore(finance): set up vitest runner for pure logic tests

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1.2: Tipos canônicos do módulo financeiro

> ✅ **JÁ CONCLUÍDA** (commit `2e7dde3`). `src/types/finance.ts` existe com os 6 tipos e as 7 interfaces do contrato. `tsc --noEmit` limpo.

**Files:**
- Create: `src/types/finance.ts`

**Interfaces:**
- Consumes: nada.
- Produces (fonte de verdade para todas as fases):
  - `type FinancialType = 'income' | 'expense'`
  - `type EntryStatus = 'pending' | 'paid' | 'canceled'`
  - `type EffectiveStatus = EntryStatus | 'overdue'`
  - `type PaymentMethod = 'card_credit'|'card_debit'|'pix'|'boleto'|'transfer'|'cash'|'other'`
  - `type RecurrenceFrequency = 'weekly'|'monthly'|'quarterly'|'yearly'`
  - `type AttachmentKind = 'invoice'|'receipt'|'other'`
  - interfaces `FinancialCategory`, `FinancialAttachment`, `FinancialEntry`, `FinancialRecurrence`, `EntryFilters`, `InstallmentItem`, `CashflowSummary`.

**Steps:**

- [x] Implementar `src/types/finance.ts` com o CONTRATO exato:
```ts
/**
 * Types for the Financial / Cash Flow module (manual entries).
 * Design spec: docs/superpowers/specs/2026-06-17-lancamentos-financeiros-design.md
 */

// ---------------------------------------------------------------------------
// Enums (literal unions)
// ---------------------------------------------------------------------------

export type FinancialType = 'income' | 'expense';

/** Stored status. `overdue` is NEVER stored — it is derived from status+dueDate. */
export type EntryStatus = 'pending' | 'paid' | 'canceled';

/** Derived status used by KPIs, filters and bands. */
export type EffectiveStatus = EntryStatus | 'overdue';

export type PaymentMethod =
  | 'card_credit'
  | 'card_debit'
  | 'pix'
  | 'boleto'
  | 'transfer'
  | 'cash'
  | 'other';

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type AttachmentKind = 'invoice' | 'receipt' | 'other';

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface FinancialCategory {
  id: string;
  name: string;
  type: FinancialType;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAttachment {
  id: string;
  entryId: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  kind?: AttachmentKind;
  uploadedBy?: string;
  createdAt: string;
}

export interface FinancialEntry {
  id: string;
  type: FinancialType;
  status: EntryStatus;
  categoryId?: string;
  /** Denormalized for table/list display; resolved on read when joined. */
  categoryName?: string;
  description: string;
  counterpartyName?: string;
  counterpartyCompanyId?: string;
  /** Always positive; the sign/colour comes from `type`. */
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  competenceDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  installmentGroupId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
  recurrenceId?: string;
  attachments?: FinancialAttachment[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRecurrence {
  id: string;
  type: FinancialType;
  description: string;
  categoryId?: string;
  counterpartyName?: string;
  counterpartyCompanyId?: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  frequency: RecurrenceFrequency;
  interval: number;
  dayOfMonth?: number;
  startDate: string;
  endDate?: string;
  nextRunDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Query / aggregation shapes
// ---------------------------------------------------------------------------

export interface EntryFilters {
  search?: string;
  type?: FinancialType;
  /** May be `overdue` (derived) — the service translates it to status+date. */
  status?: EffectiveStatus;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  dateField?: 'due' | 'competence';
  dateFrom?: string;
  dateTo?: string;
}

export interface InstallmentItem {
  number: number;
  dueDate: string;
  amount: number;
}

export interface CashflowSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  cashBalance: number;
  overdueAmount: number;
  overdueCount: number;
  dueSoon7Amount: number;
  dueSoon7Count: number;
  byCategory: { categoryId: string; name: string; total: number; color?: string }[];
  monthly: {
    month: string;
    assinaturas: number;
    avulsos: number;
    income: number;
    expense: number;
    projected?: number;
  }[];
  mrr: number;
}
```

- [x] Typecheck:
```bash
npx tsc --noEmit
```
Saída esperada: sem erros (0 de saída).

- [x] Commit:
```bash
git add src/types/finance.ts && git commit -m "$(cat <<'EOF'
feat(finance): add canonical finance domain types

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1.3: `deriveEffectiveStatus` (TDD puro)

> ✅ **JÁ CONCLUÍDA** (commit `c1982bb`) — **porém implementada conforme a Nota de consistência 1, não conforme o texto abaixo.** O helper canônico é `effectiveStatus(status, dueDateISO, todayISO?)` em **`src/lib/finance/status.ts`** (testes em `src/lib/finance/status.test.ts`, 6 casos verdes) — **não** `deriveEffectiveStatus` dentro de `financeConverters.ts`, como os steps dizem. Ignore as menções a `financeConverters.ts` nesta task; elas pertencem à Task 1.4.
>
> ⚠️ **Único step pendente da Fase 1 fora as migrations:** o smoke test `src/lib/finance/__tests__/sanity.test.ts` **não foi removido** e continua rodando na suíte. Removê-lo é inofensivo (é só um `expect(1+1).toBe(2)`).

**Files:**
- Create: `src/lib/finance/__tests__/financeConverters.test.ts`
- Create: `src/lib/finance/financeConverters.ts`
- Delete: `src/lib/finance/__tests__/sanity.test.ts`

**Interfaces:**
- Consumes: `EntryStatus`, `EffectiveStatus` de `@/types/finance`.
- Produces: `deriveEffectiveStatus(status: EntryStatus, dueDateISO: string, todayISO: string): EffectiveStatus` — `pending` + `dueDate < hoje` ⇒ `'overdue'`; caso contrário retorna o próprio `status`.

**Steps:**

- [ ] Remover o smoke test da Task 1.1:
```bash
rm src/lib/finance/__tests__/sanity.test.ts
```

- [x] Escrever o teste falhando em `src/lib/finance/__tests__/financeConverters.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { deriveEffectiveStatus } from '@/lib/finance/financeConverters';

describe('deriveEffectiveStatus', () => {
  const today = '2026-06-17';

  it('returns overdue when pending and due date is in the past', () => {
    expect(deriveEffectiveStatus('pending', '2026-06-16', today)).toBe('overdue');
  });

  it('returns pending when due date is today', () => {
    expect(deriveEffectiveStatus('pending', '2026-06-17', today)).toBe('pending');
  });

  it('returns pending when due date is in the future', () => {
    expect(deriveEffectiveStatus('pending', '2026-06-30', today)).toBe('pending');
  });

  it('never marks a paid entry as overdue', () => {
    expect(deriveEffectiveStatus('paid', '2026-01-01', today)).toBe('paid');
  });

  it('never marks a canceled entry as overdue', () => {
    expect(deriveEffectiveStatus('canceled', '2026-01-01', today)).toBe('canceled');
  });
});
```

- [x] Rodar e ver falhar:
```bash
npm test
```
Saída esperada: falha com `Failed to resolve import "@/lib/finance/financeConverters"` (o módulo ainda não existe).

- [x] Implementar o mínimo em `src/lib/finance/financeConverters.ts`:
```ts
/**
 * Finance row converters (snake_case DB -> camelCase TS) + derived helpers.
 * Pure & unit-tested. No Supabase imports here.
 */

import type { EntryStatus, EffectiveStatus } from '@/types/finance';

/**
 * Derives the effective status. `overdue` is computed, never stored:
 * a `pending` entry whose due date is strictly before today is overdue.
 * Dates are ISO `YYYY-MM-DD`; string comparison is correct for that format.
 */
export function deriveEffectiveStatus(
  status: EntryStatus,
  dueDateISO: string,
  todayISO: string,
): EffectiveStatus {
  if (status === 'pending' && dueDateISO < todayISO) return 'overdue';
  return status;
}
```

- [x] Rodar e ver passar:
```bash
npm test
```
Saída esperada: `Tests  5 passed (5)`.

- [x] Commit:
```bash
git add src/lib/finance/financeConverters.ts src/lib/finance/__tests__/financeConverters.test.ts && git commit -m "$(cat <<'EOF'
feat(finance): add deriveEffectiveStatus helper (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1.4: Normalizadores de linha `rowToX` (TDD puro)

> ✅ **JÁ CONCLUÍDA** (commits `9041d93`, `9f86047`, `fec3f89`). As 4 funções `rowToFinancialCategory` / `rowToFinancialAttachment` / `rowToFinancialEntry` / `rowToFinancialRecurrence` existem em `src/lib/finance/financeConverters.ts`, com 11 testes verdes — incluindo o mapeamento do join `attachments` e a coerção de campos numéricos que o Supabase devolve como string (`numeric` → `string`). Lint e `tsc --noEmit` limpos nesses arquivos.

**Files:**
- Modify: `src/lib/finance/__tests__/financeConverters.test.ts` (adicionar describes)
- Modify: `src/lib/finance/financeConverters.ts` (adicionar normalizadores)

**Interfaces:**
- Consumes: tipos de `@/types/finance`.
- Produces:
  - `rowToFinancialCategory(row: Record<string, unknown>): FinancialCategory`
  - `rowToFinancialAttachment(row: Record<string, unknown>): FinancialAttachment`
  - `rowToFinancialEntry(row: Record<string, unknown>): FinancialEntry` (mapeia join `financial_categories.name` em `categoryName` quando presente em `row.category_name`; mapeia `row.attachments` quando array)
  - `rowToFinancialRecurrence(row: Record<string, unknown>): FinancialRecurrence`

**Steps:**

- [x] Escrever os testes falhando (append no arquivo de teste). Adicionar ao topo o import:
```ts
import {
  deriveEffectiveStatus,
  rowToFinancialCategory,
  rowToFinancialAttachment,
  rowToFinancialEntry,
  rowToFinancialRecurrence,
} from '@/lib/finance/financeConverters';
```
e adicionar os describes ao final do arquivo:
```ts
describe('rowToFinancialCategory', () => {
  it('maps snake_case to camelCase with defaults', () => {
    const cat = rowToFinancialCategory({
      id: 'c1',
      name: 'Marketing',
      type: 'expense',
      color: '#f59e0b',
      is_active: true,
      sort_order: 2,
      created_at: '2026-06-01T00:00:00Z',
      updated_at: '2026-06-02T00:00:00Z',
    });
    expect(cat).toEqual({
      id: 'c1',
      name: 'Marketing',
      type: 'expense',
      color: '#f59e0b',
      isActive: true,
      sortOrder: 2,
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-02T00:00:00Z',
    });
  });

  it('defaults isActive to true and sortOrder to 0 when missing', () => {
    const cat = rowToFinancialCategory({ id: 'c2', name: 'X', type: 'income' });
    expect(cat.isActive).toBe(true);
    expect(cat.sortOrder).toBe(0);
    expect(cat.color).toBeUndefined();
  });
});

describe('rowToFinancialAttachment', () => {
  it('maps fields and coerces fileSize to number', () => {
    const att = rowToFinancialAttachment({
      id: 'a1',
      entry_id: 'e1',
      storage_path: 'financial/e1/123-nf.pdf',
      file_name: 'nf.pdf',
      file_type: 'application/pdf',
      file_size: '20480',
      kind: 'invoice',
      uploaded_by: 'u1',
      created_at: '2026-06-01T00:00:00Z',
    });
    expect(att.entryId).toBe('e1');
    expect(att.fileSize).toBe(20480);
    expect(att.kind).toBe('invoice');
  });
});

describe('rowToFinancialEntry', () => {
  it('maps core fields, coerces amount and maps category_name join', () => {
    const entry = rowToFinancialEntry({
      id: 'e1',
      type: 'expense',
      status: 'pending',
      category_id: 'c1',
      category_name: 'Marketing',
      description: 'Anúncios',
      counterparty_name: 'Google',
      counterparty_company_id: null,
      amount: '1500.50',
      currency: 'BRL',
      payment_method: 'pix',
      competence_date: '2026-06-01',
      due_date: '2026-06-10',
      paid_date: null,
      notes: null,
      installment_group_id: null,
      installment_number: null,
      installment_total: null,
      recurrence_id: null,
      created_by: 'u1',
      created_at: '2026-06-01T00:00:00Z',
      updated_at: '2026-06-01T00:00:00Z',
    });
    expect(entry.amount).toBe(1500.5);
    expect(entry.categoryName).toBe('Marketing');
    expect(entry.counterpartyCompanyId).toBeUndefined();
    expect(entry.attachments).toBeUndefined();
  });

  it('maps nested attachments array when present', () => {
    const entry = rowToFinancialEntry({
      id: 'e2',
      type: 'income',
      status: 'paid',
      description: 'Consultoria',
      amount: 1000,
      currency: 'BRL',
      competence_date: '2026-06-01',
      due_date: '2026-06-01',
      created_at: '2026-06-01T00:00:00Z',
      updated_at: '2026-06-01T00:00:00Z',
      attachments: [
        {
          id: 'a1',
          entry_id: 'e2',
          storage_path: 'financial/e2/1-recibo.pdf',
          file_name: 'recibo.pdf',
          file_type: 'application/pdf',
          created_at: '2026-06-01T00:00:00Z',
        },
      ],
    });
    expect(entry.attachments).toHaveLength(1);
    expect(entry.attachments?.[0].id).toBe('a1');
  });
});

describe('rowToFinancialRecurrence', () => {
  it('maps fields with interval default 1 and isActive default true', () => {
    const rec = rowToFinancialRecurrence({
      id: 'r1',
      type: 'expense',
      description: 'Aluguel',
      category_id: 'c5',
      amount: '3000.00',
      frequency: 'monthly',
      day_of_month: 5,
      start_date: '2026-06-01',
      created_at: '2026-06-01T00:00:00Z',
      updated_at: '2026-06-01T00:00:00Z',
    });
    expect(rec.amount).toBe(3000);
    expect(rec.interval).toBe(1);
    expect(rec.isActive).toBe(true);
    expect(rec.dayOfMonth).toBe(5);
  });
});
```

- [x] Rodar e ver falhar:
```bash
npm test
```
Saída esperada: falha (`rowToFinancialCategory is not a function` / import sem export).

- [x] Implementar os normalizadores em `src/lib/finance/financeConverters.ts` (append, mantendo `deriveEffectiveStatus`). Adicionar imports de tipo no topo:
```ts
import type {
  EntryStatus,
  EffectiveStatus,
  FinancialType,
  PaymentMethod,
  RecurrenceFrequency,
  AttachmentKind,
  FinancialCategory,
  FinancialAttachment,
  FinancialEntry,
  FinancialRecurrence,
} from '@/types/finance';
```
e adicionar ao final:
```ts
/** Maps a `financial_categories` row to FinancialCategory. */
export function rowToFinancialCategory(row: Record<string, unknown>): FinancialCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as FinancialType,
    color: (row.color as string) ?? undefined,
    isActive: (row.is_active as boolean) ?? true,
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

/** Maps a `financial_attachments` row to FinancialAttachment. */
export function rowToFinancialAttachment(row: Record<string, unknown>): FinancialAttachment {
  return {
    id: row.id as string,
    entryId: row.entry_id as string,
    storagePath: row.storage_path as string,
    fileName: row.file_name as string,
    fileType: row.file_type as string,
    fileSize: row.file_size != null ? Number(row.file_size) : undefined,
    kind: (row.kind as AttachmentKind) ?? undefined,
    uploadedBy: (row.uploaded_by as string) ?? undefined,
    createdAt: (row.created_at as string) ?? '',
  };
}

/**
 * Maps a `financial_entries` row to FinancialEntry.
 * `category_name` (from a join) and a nested `attachments` array are optional.
 */
export function rowToFinancialEntry(row: Record<string, unknown>): FinancialEntry {
  const rawAttachments = row.attachments;
  const attachments = Array.isArray(rawAttachments)
    ? rawAttachments.map((a) => rowToFinancialAttachment(a as Record<string, unknown>))
    : undefined;

  return {
    id: row.id as string,
    type: row.type as FinancialType,
    status: row.status as EntryStatus,
    categoryId: (row.category_id as string) ?? undefined,
    categoryName: (row.category_name as string) ?? undefined,
    description: row.description as string,
    counterpartyName: (row.counterparty_name as string) ?? undefined,
    counterpartyCompanyId: (row.counterparty_company_id as string) ?? undefined,
    amount: Number(row.amount ?? 0),
    currency: (row.currency as string) ?? 'BRL',
    paymentMethod: (row.payment_method as PaymentMethod) ?? undefined,
    competenceDate: row.competence_date as string,
    dueDate: row.due_date as string,
    paidDate: (row.paid_date as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    installmentGroupId: (row.installment_group_id as string) ?? undefined,
    installmentNumber: (row.installment_number as number) ?? undefined,
    installmentTotal: (row.installment_total as number) ?? undefined,
    recurrenceId: (row.recurrence_id as string) ?? undefined,
    attachments,
    createdBy: (row.created_by as string) ?? undefined,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

/** Maps a `financial_recurrences` row to FinancialRecurrence. */
export function rowToFinancialRecurrence(row: Record<string, unknown>): FinancialRecurrence {
  return {
    id: row.id as string,
    type: row.type as FinancialType,
    description: row.description as string,
    categoryId: (row.category_id as string) ?? undefined,
    counterpartyName: (row.counterparty_name as string) ?? undefined,
    counterpartyCompanyId: (row.counterparty_company_id as string) ?? undefined,
    amount: Number(row.amount ?? 0),
    paymentMethod: (row.payment_method as PaymentMethod) ?? undefined,
    frequency: (row.frequency as RecurrenceFrequency) ?? 'monthly',
    interval: (row.interval as number) ?? 1,
    dayOfMonth: (row.day_of_month as number) ?? undefined,
    startDate: row.start_date as string,
    endDate: (row.end_date as string) ?? undefined,
    nextRunDate: (row.next_run_date as string) ?? undefined,
    isActive: (row.is_active as boolean) ?? true,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}
```

- [x] Rodar e ver passar:
```bash
npm test
```
Saída esperada: `Tests  11 passed (11)` (5 da 1.3 + 6 desta task).

- [x] Lint + typecheck:
```bash
npm run lint && npx tsc --noEmit
```
Saída esperada: ESLint sem erros novos; `tsc` sem saída.

- [x] Commit:
```bash
git add src/lib/finance/financeConverters.ts src/lib/finance/__tests__/financeConverters.test.ts && git commit -m "$(cat <<'EOF'
feat(finance): add rowToX converters for finance rows (TDD)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1.5: Migration 120 — `financial_categories` (tabela + RLS + seed)

**Files:**
- Create: `sql/migrations/120_financial_categories.sql`

**Interfaces:**
- Consumes: `public.update_updated_at()`, `public.get_user_type(uuid)`.
- Produces: tabela `public.financial_categories` com RLS admin-only (4 policies), `UNIQUE(name, type)`, trigger `update_updated_at`, e 10 categorias seed (`is_active=true`).

**Steps:**

- [x] Criar `sql/migrations/120_financial_categories.sql` com o SQL COMPLETO:
```sql
-- Migration 120: financial_categories
-- Categorias gerenciaveis de receitas/despesas para o modulo de fluxo de caixa.
-- Admin-only (operador da plataforma). Seed inicial desativavel via is_active.

CREATE TABLE public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, type)
);

ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

-- RLS: admin-only (todas as operacoes)
CREATE POLICY "financial_categories_select_admin"
  ON public.financial_categories FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_categories_insert_admin"
  ON public.financial_categories FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_categories_update_admin"
  ON public.financial_categories FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_categories_delete_admin"
  ON public.financial_categories FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Index para ordenacao por tipo
CREATE INDEX idx_financial_categories_type ON public.financial_categories(type, sort_order);

-- Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.financial_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed: despesas + receitas (cores da paleta de graficos do dashboard)
-- ⚠️ REVISADO 21/07 — cores dessaturadas, fora das faixas 0-20deg (vermelho de
-- atraso), 150-170deg (verde de receita) e 190-205deg (cyan de interacao).
-- O dot da categoria e renderizado DENTRO da linha da lista, ao lado do valor
-- colorido e do badge de status; as cores originais faziam o dot contradizer a
-- semantica da propria linha (ex.: despesa de "Ocupacao" com dot verde).
-- Ver spec de produto, secao 4.1.
INSERT INTO public.financial_categories (name, type, color, sort_order) VALUES
  ('Marketing',          'expense', '#9a7b4f', 1),
  ('Infraestrutura',     'expense', '#5b6b8c', 2),
  ('Serviços',           'expense', '#4f7a8b', 3),
  ('Equipamentos',       'expense', '#3f4d6b', 4),
  ('Ocupação',           'expense', '#6b7f5e', 5),
  ('Impostos',           'expense', '#8a6d5a', 6),
  ('Pessoal',            'expense', '#7c6f9e', 7),
  ('Consultoria avulsa', 'income',  '#5f8a85', 1),
  ('Reembolso',          'income',  '#6e7fa3', 2),
  ('Outras receitas',    'income',  '#8b7fa8', 3);
```

- [x] Aplicar via MCP Supabase `apply_migration` com `name: "financial_categories"` e o conteúdo idêntico ao arquivo acima.

- [x] Verificar com MCP `list_tables` (schema `public`): confirmar que `financial_categories` aparece com RLS habilitada e 8 colunas. Em seguida rodar via MCP `execute_sql`:
```sql
SELECT type, count(*) FROM public.financial_categories GROUP BY type ORDER BY type;
```
Saída esperada: `expense 7`, `income 3`.

- [x] Rodar MCP `get_advisors` (type `security`) e confirmar que **não** há advisor novo do tipo "RLS disabled" ou "policy missing" sobre `financial_categories`.

- [x] Commit:
```bash
git add sql/migrations/120_financial_categories.sql && git commit -m "$(cat <<'EOF'
feat(finance): add financial_categories table with admin RLS and seed

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1.6: Migration 121 — `financial_entries` (tabela + RLS + índices)

**Files:**
- Create: `sql/migrations/121_financial_entries.sql`

**Interfaces:**
- Consumes: `public.update_updated_at()`, `public.get_user_type(uuid)`, FK → `public.financial_categories`, `public.companies`, `public.profiles`.
- Produces: tabela `public.financial_entries` com RLS admin-only + policy `service_role` (para `generate_due_recurrences`), CHECK constraints (`type`, `status`, `payment_method`, `amount > 0`), 7 índices, trigger `update_updated_at`. FK `recurrence_id` adicionada **depois** (migration 123 cria `financial_recurrences`) — aqui a coluna existe sem FK e a constraint é adicionada na 123.

**Steps:**

- [x] Criar `sql/migrations/121_financial_entries.sql`:
```sql
-- Migration 121: financial_entries
-- Lancamentos manuais de receita/despesa (contas a pagar/receber + caixa).
-- amount SEMPRE positivo; sinal/cor vem do type. overdue e DERIVADO (nao armazenado).
-- recurrence_id existe aqui sem FK; a FK e adicionada na migration 123.

CREATE TABLE public.financial_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled')),
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  counterparty_name TEXT,
  counterparty_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_method TEXT CHECK (payment_method IN ('card_credit','card_debit','pix','boleto','transfer','cash','other')),
  competence_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  installment_group_id UUID,
  installment_number INTEGER,
  installment_total INTEGER,
  recurrence_id UUID,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;

-- RLS: admin-only para SELECT/INSERT/UPDATE/DELETE
CREATE POLICY "financial_entries_select_admin"
  ON public.financial_entries FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_entries_insert_admin"
  ON public.financial_entries FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_entries_update_admin"
  ON public.financial_entries FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_entries_delete_admin"
  ON public.financial_entries FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- RLS: service_role pode inserir (geracao de recorrencias via Edge Function/cron)
CREATE POLICY "financial_entries_insert_service"
  ON public.financial_entries FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_financial_entries_status ON public.financial_entries(status);
CREATE INDEX idx_financial_entries_due_date ON public.financial_entries(due_date);
CREATE INDEX idx_financial_entries_competence_date ON public.financial_entries(competence_date);
CREATE INDEX idx_financial_entries_type ON public.financial_entries(type);
CREATE INDEX idx_financial_entries_category ON public.financial_entries(category_id);
CREATE INDEX idx_financial_entries_installment_group ON public.financial_entries(installment_group_id);
CREATE INDEX idx_financial_entries_counterparty_company ON public.financial_entries(counterparty_company_id);

-- Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.financial_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

- [x] Aplicar via MCP Supabase `apply_migration` (`name: "financial_entries"`).

- [x] Verificar com MCP `execute_sql` que constraints e índices existem:
```sql
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'financial_entries'
ORDER BY indexname;
```
Saída esperada: 7 índices `idx_financial_entries_*` + a PK.

- [x] Rodar MCP `get_advisors` (type `security`); confirmar ausência de advisor "RLS disabled" sobre `financial_entries`.

- [x] Commit:
```bash
git add sql/migrations/121_financial_entries.sql && git commit -m "$(cat <<'EOF'
feat(finance): add financial_entries table with admin/service RLS and indexes

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1.7: Migration 122 — `financial_attachments` (tabela + RLS)

**Files:**
- Create: `sql/migrations/122_financial_attachments.sql`

**Interfaces:**
- Consumes: FK → `public.financial_entries` (ON DELETE CASCADE), `public.profiles`, `public.get_user_type(uuid)`.
- Produces: tabela `public.financial_attachments` com RLS admin-only, CHECK em `kind`, índice por `entry_id`.

**Steps:**

- [x] Criar `sql/migrations/122_financial_attachments.sql`:
```sql
-- Migration 122: financial_attachments
-- Multiplos anexos (NF/comprovante/recibo) por lancamento. Bucket privado.
-- ON DELETE CASCADE: apagar o lancamento remove os registros de anexo.

CREATE TABLE public.financial_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.financial_entries(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  kind TEXT CHECK (kind IN ('invoice', 'receipt', 'other')),
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_attachments ENABLE ROW LEVEL SECURITY;

-- RLS: admin-only
CREATE POLICY "financial_attachments_select_admin"
  ON public.financial_attachments FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_attachments_insert_admin"
  ON public.financial_attachments FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_attachments_update_admin"
  ON public.financial_attachments FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_attachments_delete_admin"
  ON public.financial_attachments FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- Index por lancamento (carregar anexos no Sheet de detalhe)
CREATE INDEX idx_financial_attachments_entry ON public.financial_attachments(entry_id);
```

- [x] Aplicar via MCP Supabase `apply_migration` (`name: "financial_attachments"`).

- [x] Verificar com MCP `execute_sql`:
```sql
SELECT count(*) AS policies FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'financial_attachments';
```
Saída esperada: `policies = 4`.

- [x] Commit:
```bash
git add sql/migrations/122_financial_attachments.sql && git commit -m "$(cat <<'EOF'
feat(finance): add financial_attachments table with admin RLS

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1.8: Migration 123 — `financial_recurrences` (tabela + RLS + FK em entries)

**Files:**
- Create: `sql/migrations/123_financial_recurrences.sql`

**Interfaces:**
- Consumes: `public.update_updated_at()`, `public.get_user_type(uuid)`, `public.financial_categories`, `public.companies`, `public.profiles`, `public.financial_entries` (para a FK `recurrence_id`).
- Produces: tabela `public.financial_recurrences` (RLS admin + service_role) e a FK `financial_entries.recurrence_id → financial_recurrences(id) ON DELETE SET NULL`.

**Steps:**

- [x] Criar `sql/migrations/123_financial_recurrences.sql`:
```sql
-- Migration 123: financial_recurrences
-- Regras de recorrencia que materializam financial_entries pendentes ao longo do tempo.
-- Tambem adiciona a FK financial_entries.recurrence_id (a tabela ja existia na 121).

CREATE TABLE public.financial_recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  counterparty_name TEXT,
  counterparty_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT CHECK (payment_method IN ('card_credit','card_debit','pix','boleto','transfer','cash','other')),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly','monthly','quarterly','yearly')),
  interval INTEGER NOT NULL DEFAULT 1 CHECK (interval > 0),
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_recurrences ENABLE ROW LEVEL SECURITY;

-- RLS: admin-only
CREATE POLICY "financial_recurrences_select_admin"
  ON public.financial_recurrences FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_recurrences_insert_admin"
  ON public.financial_recurrences FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_recurrences_update_admin"
  ON public.financial_recurrences FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "financial_recurrences_delete_admin"
  ON public.financial_recurrences FOR DELETE
  USING (public.get_user_type(auth.uid()) = 'admin');

-- RLS: service_role pode ler/atualizar (cron de geracao avanca next_run_date)
CREATE POLICY "financial_recurrences_select_service"
  ON public.financial_recurrences FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "financial_recurrences_update_service"
  ON public.financial_recurrences FOR UPDATE
  TO service_role
  USING (true);

-- Index para geracao (recorrencias ativas com proxima execucao vencida)
CREATE INDEX idx_financial_recurrences_active_next
  ON public.financial_recurrences(is_active, next_run_date);

-- Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.financial_recurrences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- FK retroativa em financial_entries.recurrence_id (coluna criada na 121)
ALTER TABLE public.financial_entries
  ADD CONSTRAINT financial_entries_recurrence_id_fkey
  FOREIGN KEY (recurrence_id) REFERENCES public.financial_recurrences(id) ON DELETE SET NULL;

CREATE INDEX idx_financial_entries_recurrence ON public.financial_entries(recurrence_id);
```

- [x] Aplicar via MCP Supabase `apply_migration` (`name: "financial_recurrences"`).

- [x] Verificar a FK com MCP `execute_sql`:
```sql
SELECT conname FROM pg_constraint
WHERE conname = 'financial_entries_recurrence_id_fkey';
```
Saída esperada: 1 linha.

- [x] Commit:
```bash
git add sql/migrations/123_financial_recurrences.sql && git commit -m "$(cat <<'EOF'
feat(finance): add financial_recurrences table and entries FK

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1.9: Migration 124 — RPCs (`create_with_installments`, `mark_paid`, `generate_due_recurrences`)

**Files:**
- Create: `sql/migrations/124_financial_rpcs.sql`

**Interfaces:**
- Consumes: `public.financial_entries`, `public.financial_recurrences`, `public.get_user_type(uuid)`.
- Produces:
  - `public.create_financial_entry_with_installments(p_base jsonb, p_items jsonb) RETURNS SETOF public.financial_entries` — SECURITY INVOKER (RLS aplica), gera N parcelas com `installment_group_id` compartilhado, retorna as linhas criadas.
  - `public.mark_financial_entry_paid(p_entry_id uuid, p_paid_date date, p_payment_method text) RETURNS public.financial_entries` — SECURITY INVOKER; seta `status='paid'`, `paid_date`, opcionalmente `payment_method`.
  - `public.generate_due_recurrences() RETURNS integer` — SECURITY DEFINER; materializa entries pendentes faltantes idempotentemente, retorna a contagem criada.

**Steps:**

- [x] Criar `sql/migrations/124_financial_rpcs.sql`:
```sql
-- Migration 124: financial RPCs
-- create_financial_entry_with_installments: cria N parcelas atomicamente.
-- mark_financial_entry_paid: baixa de um lancamento.
-- generate_due_recurrences: materializa ocorrencias pendentes (idempotente).

-- ============================================================================
-- create_financial_entry_with_installments(p_base jsonb, p_items jsonb)
--   p_base: campos comuns (type, status, category_id, description,
--           counterparty_name, counterparty_company_id, currency,
--           payment_method, competence_date, notes, created_by)
--   p_items: [{ number, dueDate, amount }] (1..N)
-- SECURITY INVOKER: RLS de financial_entries (admin-only) ainda se aplica.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_financial_entry_with_installments(
  p_base jsonb,
  p_items jsonb
)
RETURNS SETOF public.financial_entries
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID := gen_random_uuid();
  v_total INTEGER := jsonb_array_length(p_items);
BEGIN
  IF v_total < 1 THEN
    RAISE EXCEPTION 'Pelo menos uma parcela e obrigatoria';
  END IF;

  RETURN QUERY
  INSERT INTO public.financial_entries (
    type, status, category_id, description, counterparty_name,
    counterparty_company_id, amount, currency, payment_method,
    competence_date, due_date, notes,
    installment_group_id, installment_number, installment_total, created_by
  )
  SELECT
    (p_base->>'type')::text,
    COALESCE(p_base->>'status', 'pending')::text,
    NULLIF(p_base->>'category_id', '')::uuid,
    (p_base->>'description')::text,
    NULLIF(p_base->>'counterparty_name', '')::text,
    NULLIF(p_base->>'counterparty_company_id', '')::uuid,
    (item->>'amount')::numeric,
    COALESCE(p_base->>'currency', 'BRL')::text,
    NULLIF(p_base->>'payment_method', '')::text,
    (p_base->>'competence_date')::date,
    (item->>'dueDate')::date,
    NULLIF(p_base->>'notes', '')::text,
    v_group_id,
    (item->>'number')::int,
    v_total,
    NULLIF(p_base->>'created_by', '')::uuid
  FROM jsonb_array_elements(p_items) AS item;
END;
$$;

COMMENT ON FUNCTION public.create_financial_entry_with_installments IS
  'Cria N parcelas de financial_entries atomicamente com installment_group_id compartilhado. SECURITY INVOKER: RLS admin-only aplica.';

-- ============================================================================
-- mark_financial_entry_paid(p_entry_id uuid, p_paid_date date, p_payment_method text)
-- SECURITY INVOKER: RLS de UPDATE (admin) aplica; o RETURNING vazio sinaliza bloqueio.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mark_financial_entry_paid(
  p_entry_id UUID,
  p_paid_date DATE,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS public.financial_entries
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_row public.financial_entries;
BEGIN
  UPDATE public.financial_entries
  SET status = 'paid',
      paid_date = p_paid_date,
      payment_method = COALESCE(p_payment_method, payment_method)
  WHERE id = p_entry_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lancamento nao encontrado ou sem permissao'
      USING ERRCODE = '42501';
  END IF;

  RETURN v_row;
END;
$$;

COMMENT ON FUNCTION public.mark_financial_entry_paid IS
  'Marca um lancamento como pago (status=paid, paid_date). SECURITY INVOKER: RLS admin aplica.';

-- ============================================================================
-- generate_due_recurrences()
-- Para cada recorrencia ativa, materializa as ocorrencias pendentes faltantes
-- ate hoje. Idempotente: nao recria uma ocorrencia ja existente (mesmo
-- recurrence_id + due_date). Avanca next_run_date. SECURITY DEFINER (roda no cron).
-- Retorna o numero de entries criadas.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_due_recurrences()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec RECORD;
  v_due DATE;
  v_created INTEGER := 0;
  v_step INTERVAL;
BEGIN
  FOR v_rec IN
    SELECT * FROM public.financial_recurrences
    WHERE is_active = true
      AND start_date <= current_date
      AND (end_date IS NULL OR end_date >= start_date)
  LOOP
    -- Passo conforme a frequencia x intervalo
    v_step := CASE v_rec.frequency
      WHEN 'weekly'    THEN make_interval(weeks  => v_rec.interval)
      WHEN 'monthly'   THEN make_interval(months => v_rec.interval)
      WHEN 'quarterly' THEN make_interval(months => v_rec.interval * 3)
      WHEN 'yearly'    THEN make_interval(years  => v_rec.interval)
    END;

    v_due := COALESCE(v_rec.next_run_date, v_rec.start_date);

    WHILE v_due <= current_date
      AND (v_rec.end_date IS NULL OR v_due <= v_rec.end_date)
    LOOP
      -- Idempotencia: so insere se ainda nao existe ocorrencia nesta data
      IF NOT EXISTS (
        SELECT 1 FROM public.financial_entries
        WHERE recurrence_id = v_rec.id AND due_date = v_due
      ) THEN
        INSERT INTO public.financial_entries (
          type, status, category_id, description, counterparty_name,
          counterparty_company_id, amount, currency, payment_method,
          competence_date, due_date, recurrence_id, created_by
        ) VALUES (
          v_rec.type, 'pending', v_rec.category_id, v_rec.description,
          v_rec.counterparty_name, v_rec.counterparty_company_id, v_rec.amount,
          'BRL', v_rec.payment_method, v_due, v_due, v_rec.id, v_rec.created_by
        );
        v_created := v_created + 1;
      END IF;

      v_due := (v_due + v_step)::date;
    END LOOP;

    -- Avanca next_run_date para a proxima ocorrencia futura
    UPDATE public.financial_recurrences
    SET next_run_date = v_due
    WHERE id = v_rec.id;
  END LOOP;

  RETURN v_created;
END;
$$;

COMMENT ON FUNCTION public.generate_due_recurrences IS
  'Materializa financial_entries pendentes para recorrencias ativas ate a data atual. Idempotente. Agendar via pg_cron diario na Fase 7.';
```

- [x] Aplicar via MCP Supabase `apply_migration` (`name: "financial_rpcs"`).

- [x] Verificar que as 3 funções existem via MCP `execute_sql`:
```sql
SELECT proname FROM pg_proc
WHERE proname IN ('create_financial_entry_with_installments','mark_financial_entry_paid','generate_due_recurrences')
ORDER BY proname;
```
Saída esperada: 3 linhas.

- [x] Smoke test de idempotência da geração via MCP `execute_sql` (não cria dados — só confirma que roda sem erro e retorna inteiro):
```sql
SELECT public.generate_due_recurrences() AS created;
```
Saída esperada: `created = 0` (nenhuma recorrência cadastrada ainda) — confirma que a função executa.

- [x] Rodar MCP `get_advisors` (type `security`); se aparecer advisor "Function search_path mutable", confirmar que **não** é sobre estas funções (todas já têm `SET search_path = public`).

- [x] Commit:
```bash
git add sql/migrations/124_financial_rpcs.sql && git commit -m "$(cat <<'EOF'
feat(finance): add installments, mark-paid and recurrence RPCs

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 1.10: Migration 125 — bucket privado `financial-documents` + policies de Storage

**Files:**
- Create: `sql/migrations/125_financial_storage_bucket.sql`

**Interfaces:**
- Consumes: `public.get_user_type(uuid)`, `storage.buckets`, `storage.objects`.
- Produces: bucket **privado** `financial-documents` (10 MB, mimes pdf/png/jpeg) + 4 policies admin-only sobre `storage.objects` restritas a `bucket_id = 'financial-documents'`. Consumido pela Fase 4 (`AttachmentDropzone` via `createSignedUrl`).

**Steps:**

- [x] Criar `sql/migrations/125_financial_storage_bucket.sql`:
```sql
-- Migration 125: bucket privado financial-documents
-- NF/comprovantes contem dados sensiveis -> bucket PRIVADO (public=false).
-- Visualizacao via createSignedUrl (URL temporaria), nunca getPublicUrl.
-- Path: financial/{entry_id}/{timestamp}-{safeName}.{ext}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'financial-documents',
  'financial-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/png', 'image/jpeg']
) ON CONFLICT (id) DO NOTHING;

-- Leitura somente admin (signed URL e gerada server-side respeitando esta policy)
CREATE POLICY "financial_documents_select_admin"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'financial-documents'
    AND public.get_user_type(auth.uid()) = 'admin'
  );

-- Upload somente admin
CREATE POLICY "financial_documents_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'financial-documents'
    AND public.get_user_type(auth.uid()) = 'admin'
  );

-- Update somente admin
CREATE POLICY "financial_documents_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'financial-documents'
    AND public.get_user_type(auth.uid()) = 'admin'
  );

-- Delete somente admin
CREATE POLICY "financial_documents_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'financial-documents'
    AND public.get_user_type(auth.uid()) = 'admin'
  );
```

- [x] Aplicar via MCP Supabase `apply_migration` (`name: "financial_storage_bucket"`).

- [x] Verificar o bucket via MCP `execute_sql`:
```sql
SELECT id, public, file_size_limit FROM storage.buckets WHERE id = 'financial-documents';
```
Saída esperada: 1 linha, `public = false`, `file_size_limit = 10485760`.

- [x] Verificar as 4 policies via MCP `execute_sql`:
```sql
SELECT policyname FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'financial_documents_%'
ORDER BY policyname;
```
Saída esperada: 4 linhas (`select`/`insert`/`update`/`delete`).

- [x] Verificação final consolidada da fase (tipos + testes não regrediram):
```bash
npm test && npx tsc --noEmit
```
Saída esperada: `Tests  11 passed (11)`; `tsc` sem saída.

- [x] Commit:
```bash
git add sql/migrations/125_financial_storage_bucket.sql && git commit -m "$(cat <<'EOF'
feat(finance): add private financial-documents storage bucket and policies

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

---

### Task 1.11: Separar `status` de `dueWindow` em `EntryFilters` + helper `dueWindowOf` (TDD)

> ⚠️ **Task criada em 22/07.** Corrige código **já commitado** na Task 1.2. O `EntryFilters` atual declara `status?: EffectiveStatus` com o comentário *"May be `overdue` (derived) — the service translates it to status+date"* — ou seja, carrega exatamente o bug que a revisão do spec eliminou (§7.1). Enquanto o tipo permitir `status: 'overdue'`, todo consumidor pode reintroduzi-lo.
>
> Este helper também vira a **fonte única** de classificação por janela, consumida por três lugares que hoje divergiriam: o filtro de vencimento (Task 3.5), as seções da view Fluxo (Task 3.8a) e a faixa de urgência do dashboard (Task 5.5).

**Files:**
- Modify: `src/types/finance.ts` (interface `EntryFilters` + novo `DueWindow`)
- Modify: `src/lib/finance/status.ts` (adicionar `dueWindowOf` e `daysBetween`)
- Test: `src/lib/finance/status.test.ts` (append)

**Interfaces:**
- Consumes: `EntryStatus` de `@/types/finance`.
- Produces:
  - `type DueWindow = 'overdue' | 'due7' | 'due8_30' | 'future'`
  - `daysBetween(fromISO: string, toISO: string): number`
  - `dueWindowOf(status: EntryStatus, dueDateISO: string, todayISO?: string): DueWindow | null` — retorna `null` para lançamentos que não estão `pending` (pagos e cancelados não têm janela de vencimento).
  - `EntryFilters.status` passa a ser `EntryStatus` (não `EffectiveStatus`); ganha `dueWindow?: DueWindow`.

**Steps:**

- [x] **Passo 1: Escrever os testes falhando.** Append em `src/lib/finance/status.test.ts`:

```ts
import { dueWindowOf, daysBetween } from './status';

describe('daysBetween', () => {
  it('conta dias entre datas ISO ignorando timezone', () => {
    expect(daysBetween('2026-07-21', '2026-07-28')).toBe(7);
    expect(daysBetween('2026-07-28', '2026-07-21')).toBe(-7);
    expect(daysBetween('2026-07-21', '2026-07-21')).toBe(0);
  });

  it('atravessa virada de mes e de ano', () => {
    expect(daysBetween('2026-07-31', '2026-08-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });
});

describe('dueWindowOf', () => {
  const TODAY = '2026-07-21';

  it('classifica pendente vencido como overdue', () => {
    expect(dueWindowOf('pending', '2026-07-20', TODAY)).toBe('overdue');
  });

  it('classifica vencimento hoje e ate 7 dias como due7', () => {
    expect(dueWindowOf('pending', TODAY, TODAY)).toBe('due7');
    expect(dueWindowOf('pending', '2026-07-28', TODAY)).toBe('due7');
  });

  it('classifica 8 a 30 dias como due8_30', () => {
    expect(dueWindowOf('pending', '2026-07-29', TODAY)).toBe('due8_30');
    expect(dueWindowOf('pending', '2026-08-20', TODAY)).toBe('due8_30');
  });

  it('classifica alem de 30 dias como future', () => {
    expect(dueWindowOf('pending', '2026-08-21', TODAY)).toBe('future');
  });

  it('retorna null para pago e cancelado, mesmo vencidos', () => {
    expect(dueWindowOf('paid', '2026-07-01', TODAY)).toBeNull();
    expect(dueWindowOf('canceled', '2026-07-01', TODAY)).toBeNull();
  });
});
```

- [x] **Passo 2: Rodar e ver falhar.**

Run: `npx vitest run src/lib/finance/status.test.ts`
Esperado: FAIL — `dueWindowOf is not a function` / `daysBetween is not a function`.

- [x] **Passo 3: Implementar.** Append em `src/lib/finance/status.ts`:

```ts
/** Derived due-date window. Orthogonal to the stored EntryStatus. */
export type DueWindow = 'overdue' | 'due7' | 'due8_30' | 'future';

/** Parses an ISO `YYYY-MM-DD` into a UTC epoch, avoiding timezone drift. */
function toUTCDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Whole days from `fromISO` to `toISO`. Negative when `toISO` is earlier. */
export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((toUTCDay(toISO) - toUTCDay(fromISO)) / 86_400_000);
}

/**
 * Classifies an entry into a due-date window.
 *
 * Returns `null` for anything not `pending`: paid and canceled entries have no
 * meaningful due window, and letting them fall into one would make the totals
 * of the Flow view and the dashboard urgency band disagree with the table.
 */
export function dueWindowOf(
  status: EntryStatus,
  dueDateISO: string,
  todayISO?: string,
): DueWindow | null {
  if (status !== 'pending') return null;
  const today = todayISO ?? new Date().toISOString().slice(0, 10);
  if (dueDateISO < today) return 'overdue';
  const days = daysBetween(today, dueDateISO);
  if (days <= 7) return 'due7';
  if (days <= 30) return 'due8_30';
  return 'future';
}
```

- [x] **Passo 4: Rodar e ver passar.**

Run: `npx vitest run src/lib/finance/status.test.ts`
Esperado: PASS — todos os describes verdes.

- [x] **Passo 5: Corrigir `EntryFilters`.** Em `src/types/finance.ts`, substituir a interface inteira por:

```ts
export interface EntryFilters {
  search?: string;
  type?: FinancialType;
  /**
   * Stored status only. `overdue` is NOT valid here — it is derived.
   * Use `dueWindow` for the orthogonal due-date axis.
   */
  status?: EntryStatus;
  /** Derived due-date window. Combines freely with `status`. */
  dueWindow?: DueWindow;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  dateField?: 'due' | 'competence';
  dateFrom?: string;
  dateTo?: string;
}
```

E adicionar o re-export do tipo, logo abaixo de `EffectiveStatus`:

```ts
export type { DueWindow } from '@/lib/finance/status';
```

- [x] **Passo 6: Typecheck e suíte completa.**

Run: `npx tsc --noEmit && npx vitest run`
Esperado: `tsc` sem saída; Vitest com todos os arquivos verdes (o total sobe de 80 para 86).

- [x] **Passo 7: Commit.**

```bash
git add src/types/finance.ts src/lib/finance/status.ts src/lib/finance/status.test.ts
git commit -m "$(cat <<'EOF'
fix(finance): split derived due window out of the status filter

EntryFilters typed status as EffectiveStatus, which allowed `overdue` --
a derived value, not a stored one. Filtering by `pending` would then either
hide overdue entries (which are pending) or include them and contradict the
label; there is no correct answer with a single axis.

Status now accepts only stored values, and dueWindow carries the derived
axis. dueWindowOf() becomes the single classifier shared by the filter bar,
the Flow view sections and the dashboard urgency band, so those three cannot
drift apart.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

**Fim da Fase 1.** Saída para a Fase 2: tipos em `@/types/finance` (com `status` e `dueWindow` em eixos separados), converters puros testados em `@/lib/finance/financeConverters`, helpers `effectiveStatus` / `dueWindowOf` / `daysBetween` em `@/lib/finance/status`, schema completo no banco (4 tabelas + 3 RPCs + bucket privado), e Vitest para o TDD de `calcInstallments` e da agregação pura de `CashflowSummary`.

---

## Fase 2: Camada de servico, hooks React Query e calcInstallments

> **Pre-requisitos (entregues pela Fase 1):**
> - `src/types/finance.ts` exportando os tipos do CONTRATO (`FinancialType`, `EntryStatus`, `EffectiveStatus`, `PaymentMethod`, `RecurrenceFrequency`, `AttachmentKind`, `FinancialCategory`, `FinancialAttachment`, `FinancialEntry`, `FinancialRecurrence`, `EntryFilters`, `InstallmentItem`, `CashflowSummary`).
> - Vitest instalado e configurado: `package.json` com scripts `"test": "vitest run"` e `"test:watch": "vitest"`, e bloco `test` no `vite.config.ts` (ou `vitest.config.ts`) com `environment: 'node'` e o alias `@`.
> - Migrations 120-125 aplicadas (tabelas `financial_categories`, `financial_entries`, `financial_attachments`, `financial_recurrences`; RPCs `create_financial_entry_with_installments`, `mark_financial_entry_paid`, `generate_due_recurrences`; bucket privado `financial-documents`).
>
> Esta fase NAO toca em componentes/paginas/rotas — entrega apenas `src/lib/finance/*` (puro, TDD), `src/services/finance/*`, `src/services/financialCategories/*` e os 3 arquivos de hooks. Verificacao de logica pura = vitest; verificacao de servico/hooks = `npm run lint` + `npx tsc --noEmit -p tsconfig.app.json`.

---

### Task 2.1: Util puro `calcInstallments` + `addByFrequency` (TDD)

Calculo de parcelamento em **centavos** (rateio igual, ultima parcela absorve o resto) e datas por frequencia/intervalo. Util 100% puro, sem dependencias de Supabase/React → TDD real com vitest.

**Files:**
- Create: `src/lib/finance/installments.ts`
- Test: `src/lib/finance/installments.test.ts`

**Interfaces:**
- Consumes: `import type { InstallmentItem, RecurrenceFrequency } from '@/types/finance'`
- Produces:
  - `export function addByFrequency(dateISO: string, frequency: RecurrenceFrequency, intervalN: number): string` — soma `intervalN` periodos a uma data `YYYY-MM-DD`, retorna `YYYY-MM-DD`. `monthly`/`quarterly`/`yearly` somam meses (1/3/12 * intervalN) com clamp de fim de mes; `weekly` soma `7 * intervalN` dias.
  - `export function calcInstallments(totalCents: number, count: number, firstDueDateISO: string, frequency: RecurrenceFrequency, intervalN: number): InstallmentItem[]` — divide `totalCents` em `count` parcelas iguais (floor) e soma o resto na ULTIMA; cada `amount` retornado em reais (number, 2 casas via `cents/100`); `dueDate` da parcela `k` (1-based) = `addByFrequency(firstDueDateISO, frequency, intervalN * (k-1))`.

**Steps:**

- [x] Escrever o teste falhando em `src/lib/finance/installments.test.ts` com o conteudo COMPLETO:
```ts
import { describe, it, expect } from 'vitest';
import { calcInstallments, addByFrequency } from './installments';

describe('addByFrequency', () => {
  it('soma meses (monthly) com intervalo 1', () => {
    expect(addByFrequency('2026-01-15', 'monthly', 1)).toBe('2026-02-15');
  });

  it('soma meses (monthly) com intervalo 0 mantem a data', () => {
    expect(addByFrequency('2026-01-15', 'monthly', 0)).toBe('2026-01-15');
  });

  it('faz clamp para o ultimo dia do mes quando o dia nao existe', () => {
    // 31/jan + 1 mes -> fev nao tem dia 31 -> 28 (2026 nao e bissexto)
    expect(addByFrequency('2026-01-31', 'monthly', 1)).toBe('2026-02-28');
  });

  it('soma trimestres (quarterly = 3 meses por intervalo)', () => {
    expect(addByFrequency('2026-01-10', 'quarterly', 2)).toBe('2026-07-10');
  });

  it('soma anos (yearly = 12 meses por intervalo)', () => {
    expect(addByFrequency('2026-03-01', 'yearly', 1)).toBe('2027-03-01');
  });

  it('soma semanas (weekly = 7 dias por intervalo)', () => {
    expect(addByFrequency('2026-01-01', 'weekly', 2)).toBe('2026-01-15');
  });
});

describe('calcInstallments', () => {
  it('divide valor exato igualmente', () => {
    const items = calcInstallments(30000, 3, '2026-01-10', 'monthly', 1);
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.amount)).toEqual([100, 100, 100]);
    expect(items.map((i) => i.number)).toEqual([1, 2, 3]);
    expect(items.map((i) => i.dueDate)).toEqual(['2026-01-10', '2026-02-10', '2026-03-10']);
  });

  it('joga o resto dos centavos na ULTIMA parcela', () => {
    // 100,00 / 3 = 33,33 + 33,33 + 33,34
    const items = calcInstallments(10000, 3, '2026-01-10', 'monthly', 1);
    expect(items.map((i) => i.amount)).toEqual([33.33, 33.33, 33.34]);
    const sum = items.reduce((s, i) => s + Math.round(i.amount * 100), 0);
    expect(sum).toBe(10000);
  });

  it('soma exata em qualquer divisao (10,01 em 3)', () => {
    const items = calcInstallments(1001, 3, '2026-05-05', 'monthly', 1);
    const sum = items.reduce((s, i) => s + Math.round(i.amount * 100), 0);
    expect(sum).toBe(1001);
    expect(items[2].amount).toBeCloseTo(3.35, 2);
  });

  it('1 parcela retorna o total integral', () => {
    const items = calcInstallments(4990, 1, '2026-02-01', 'monthly', 1);
    expect(items).toEqual([{ number: 1, dueDate: '2026-02-01', amount: 49.9 }]);
  });

  it('respeita intervalo > 1 (a cada 2 meses)', () => {
    const items = calcInstallments(20000, 2, '2026-01-31', 'monthly', 2);
    expect(items.map((i) => i.dueDate)).toEqual(['2026-01-31', '2026-03-31']);
  });

  it('lanca erro para count < 1', () => {
    expect(() => calcInstallments(1000, 0, '2026-01-01', 'monthly', 1)).toThrow();
  });
});
```
- [x] Rodar e ver falhar: `npx vitest run src/lib/finance/installments.test.ts` — esperado: erro de import (`Failed to resolve import "./installments"`) / "No test files were able to be collected" para esse arquivo. Confirma que os testes existem e falham.
- [x] Implementar o minimo em `src/lib/finance/installments.ts` com o conteudo COMPLETO:
```ts
/**
 * Lancamentos Financeiros — calculo puro de parcelas e datas de recorrencia.
 * Trabalha em CENTAVOS internamente para evitar erros de ponto flutuante;
 * os amounts retornados sao em reais (number, 2 casas).
 */

import type { InstallmentItem, RecurrenceFrequency } from '@/types/finance';

/** Quantos meses cada intervalo representa para frequencias baseadas em mes. */
const MONTHS_PER_INTERVAL: Record<Exclude<RecurrenceFrequency, 'weekly'>, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

/**
 * Soma `intervalN` periodos a uma data ISO (YYYY-MM-DD), preservando o dia
 * quando possivel e fazendo clamp para o ultimo dia do mes quando o dia nao
 * existe (ex.: 31/jan + 1 mes -> 28/29 de fev).
 */
export function addByFrequency(
  dateISO: string,
  frequency: RecurrenceFrequency,
  intervalN: number,
): string {
  const [y, m, d] = dateISO.split('-').map(Number);

  if (frequency === 'weekly') {
    // Aritmetica de dias via Date (UTC para evitar shift de timezone).
    const base = new Date(Date.UTC(y, m - 1, d));
    base.setUTCDate(base.getUTCDate() + 7 * intervalN);
    return fmt(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate());
  }

  const monthsToAdd = MONTHS_PER_INTERVAL[frequency] * intervalN;
  // Indice de mes 0-based total para resolver overflow de ano.
  const totalMonthIndex = (m - 1) + monthsToAdd;
  const targetYear = y + Math.floor(totalMonthIndex / 12);
  const targetMonth = ((totalMonthIndex % 12) + 12) % 12; // 0-based
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(d, lastDay);
  return fmt(targetYear, targetMonth + 1, targetDay);
}

/**
 * Divide `totalCents` em `count` parcelas iguais (floor) e soma o resto na
 * ultima parcela, garantindo soma exata. Datas via addByFrequency.
 */
export function calcInstallments(
  totalCents: number,
  count: number,
  firstDueDateISO: string,
  frequency: RecurrenceFrequency,
  intervalN: number,
): InstallmentItem[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('O numero de parcelas deve ser um inteiro >= 1.');
  }
  if (!Number.isFinite(totalCents) || totalCents <= 0) {
    throw new Error('O valor total (em centavos) deve ser maior que zero.');
  }

  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count; // vai todo na ultima parcela

  const items: InstallmentItem[] = [];
  for (let k = 1; k <= count; k++) {
    const cents = k === count ? base + remainder : base;
    items.push({
      number: k,
      dueDate: addByFrequency(firstDueDateISO, frequency, intervalN * (k - 1)),
      amount: cents / 100,
    });
  }
  return items;
}

function fmt(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}
```
- [x] Rodar e ver passar: `npx vitest run src/lib/finance/installments.test.ts` — esperado: `Test Files  1 passed (1)` e todos os `it` verdes (13 testes).
- [x] Commit: `git add src/lib/finance/installments.ts src/lib/finance/installments.test.ts && git commit -m "feat(finance): add pure calcInstallments util with cent-rounding (TDD)"`

---

### Task 2.2: Helper puro `effectiveStatus` (overdue derivado) + `daysUntil` (TDD)

`overdue` nao e armazenado: deriva de `status === 'pending' && due_date < hoje`. Util puro para reuso em servico (filtros) e UI (KPIs/faixas). TDD real.

**Files:**
- Create: `src/lib/finance/status.ts`
- Test: `src/lib/finance/status.test.ts`

**Interfaces:**
- Consumes: `import type { EntryStatus, EffectiveStatus } from '@/types/finance'`
- Produces:
  - `export function todayISO(): string` — data local de hoje em `YYYY-MM-DD`.
  - `export function effectiveStatus(status: EntryStatus, dueDateISO: string, today?: string): EffectiveStatus` — retorna `'overdue'` apenas quando `status === 'pending'` e `dueDateISO < today`; caso contrario retorna o proprio `status`.
  - `export function daysUntil(dueDateISO: string, today?: string): number` — diferenca em dias inteiros entre `dueDateISO` e `today` (positivo = futuro, negativo = atrasado, 0 = vence hoje).

**Steps:**

- [x] Escrever o teste falhando em `src/lib/finance/status.test.ts` com o conteudo COMPLETO:
```ts
import { describe, it, expect } from 'vitest';
import { effectiveStatus, daysUntil, todayISO } from './status';

const TODAY = '2026-06-17';

describe('effectiveStatus', () => {
  it('pending vencido vira overdue', () => {
    expect(effectiveStatus('pending', '2026-06-10', TODAY)).toBe('overdue');
  });

  it('pending vencendo hoje NAO e overdue', () => {
    expect(effectiveStatus('pending', '2026-06-17', TODAY)).toBe('pending');
  });

  it('pending futuro permanece pending', () => {
    expect(effectiveStatus('pending', '2026-07-01', TODAY)).toBe('pending');
  });

  it('paid nunca vira overdue mesmo com due_date passado', () => {
    expect(effectiveStatus('paid', '2026-01-01', TODAY)).toBe('paid');
  });

  it('canceled nunca vira overdue', () => {
    expect(effectiveStatus('canceled', '2026-01-01', TODAY)).toBe('canceled');
  });

  it('usa a data de hoje quando today nao e informado', () => {
    const future = '2999-01-01';
    expect(effectiveStatus('pending', future)).toBe('pending');
  });
});

describe('daysUntil', () => {
  it('retorna positivo para datas futuras', () => {
    expect(daysUntil('2026-06-24', TODAY)).toBe(7);
  });

  it('retorna 0 quando vence hoje', () => {
    expect(daysUntil('2026-06-17', TODAY)).toBe(0);
  });

  it('retorna negativo para datas passadas', () => {
    expect(daysUntil('2026-06-10', TODAY)).toBe(-7);
  });
});

describe('todayISO', () => {
  it('retorna no formato YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
```
- [x] Rodar e ver falhar: `npx vitest run src/lib/finance/status.test.ts` — esperado: falha por import nao resolvido (`./status`).
- [x] Implementar o minimo em `src/lib/finance/status.ts` com o conteudo COMPLETO:
```ts
/**
 * Lancamentos Financeiros — derivacao pura de status (overdue) e dias ate o
 * vencimento. `overdue` NAO e armazenado: deriva de status+due_date.
 */

import type { EntryStatus, EffectiveStatus } from '@/types/finance';

/** Data local de hoje em YYYY-MM-DD. */
export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Status efetivo: 'overdue' quando pendente e vencido; caso contrario o
 * proprio status armazenado.
 */
export function effectiveStatus(
  status: EntryStatus,
  dueDateISO: string,
  today: string = todayISO(),
): EffectiveStatus {
  if (status === 'pending' && dueDateISO < today) return 'overdue';
  return status;
}

/** Dias inteiros entre due_date e hoje (positivo = futuro, negativo = atrasado). */
export function daysUntil(dueDateISO: string, today: string = todayISO()): number {
  const [dy, dm, dd] = dueDateISO.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  const due = Date.UTC(dy, dm - 1, dd);
  const now = Date.UTC(ty, tm - 1, td);
  return Math.round((due - now) / 86_400_000);
}
```
- [x] Rodar e ver passar: `npx vitest run src/lib/finance/status.test.ts` — esperado: `Test Files  1 passed (1)`, 10 testes verdes.
- [x] Commit: `git add src/lib/finance/status.ts src/lib/finance/status.test.ts && git commit -m "feat(finance): add pure effectiveStatus/daysUntil helpers (TDD)"`

---

### Task 2.3: Agregacao pura `aggregateCashflow` (parte testavel do CashflowSummary) (TDD)

Extrai a logica de agregacao do dashboard para uma funcao pura, testavel sem Supabase. O servico (Task 2.6) busca as linhas e o MRR e delega o calculo aqui — evita logica nao testada dentro de uma chamada async.

**Files:**
- Create: `src/lib/finance/cashflow.ts`
- Test: `src/lib/finance/cashflow.test.ts`

**Interfaces:**
- Consumes: `import type { FinancialEntry, CashflowSummary } from '@/types/finance'`; `import { effectiveStatus, daysUntil } from './status'`
- Produces:
  - `export interface AggregateParams { from: string; to: string; today?: string }`
  - `export function aggregateCashflow(entries: FinancialEntry[], params: AggregateParams, mrr?: number): CashflowSummary` — entradas ja filtradas pelo periodo. Calcula `totalIncome`/`totalExpense` (somatorio por `type`, somente nao-cancelados), `balance = totalIncome - totalExpense`, `cashBalance` (somente `status==='paid'`: income pago − expense pago), `overdueAmount`/`overdueCount` (effectiveStatus==='overdue'), `dueSoon7Amount`/`dueSoon7Count` (pending, `0 <= daysUntil <= 7`), `byCategory` (somatorio de despesas por categoria), `monthly` (buckets `YYYY-MM` com income/expense; `assinaturas`/`avulsos`/`projected` ficam 0 aqui — preenchidos pela camada de dashboard que cruza Stripe), e `mrr` repassado.

**Steps:**

- [x] Escrever o teste falhando em `src/lib/finance/cashflow.test.ts` com o conteudo COMPLETO:
```ts
import { describe, it, expect } from 'vitest';
import { aggregateCashflow } from './cashflow';
import type { FinancialEntry } from '@/types/finance';

function entry(p: Partial<FinancialEntry>): FinancialEntry {
  return {
    id: p.id ?? crypto.randomUUID(),
    type: p.type ?? 'expense',
    status: p.status ?? 'pending',
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    description: p.description ?? 'x',
    amount: p.amount ?? 0,
    currency: 'BRL',
    competenceDate: p.competenceDate ?? '2026-06-01',
    dueDate: p.dueDate ?? '2026-06-20',
    paidDate: p.paidDate,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  };
}

const PARAMS = { from: '2026-06-01', to: '2026-06-30', today: '2026-06-17' };

describe('aggregateCashflow', () => {
  it('soma income e expense ignorando cancelados', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'income', amount: 1000, status: 'paid' }),
        entry({ type: 'expense', amount: 300, status: 'pending' }),
        entry({ type: 'expense', amount: 999, status: 'canceled' }),
      ],
      PARAMS,
    );
    expect(r.totalIncome).toBe(1000);
    expect(r.totalExpense).toBe(300);
    expect(r.balance).toBe(700);
  });

  it('cashBalance considera apenas pagos', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'income', amount: 500, status: 'paid', paidDate: '2026-06-05' }),
        entry({ type: 'income', amount: 800, status: 'pending' }),
        entry({ type: 'expense', amount: 200, status: 'paid', paidDate: '2026-06-06' }),
      ],
      PARAMS,
    );
    expect(r.cashBalance).toBe(300);
  });

  it('deriva overdue (pending + due passado)', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'expense', amount: 100, status: 'pending', dueDate: '2026-06-10' }),
        entry({ type: 'expense', amount: 50, status: 'pending', dueDate: '2026-06-25' }),
      ],
      PARAMS,
    );
    expect(r.overdueAmount).toBe(100);
    expect(r.overdueCount).toBe(1);
  });

  it('conta a vencer em 7 dias (inclui hoje e D+7)', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'expense', amount: 10, status: 'pending', dueDate: '2026-06-17' }),
        entry({ type: 'expense', amount: 20, status: 'pending', dueDate: '2026-06-24' }),
        entry({ type: 'expense', amount: 40, status: 'pending', dueDate: '2026-06-25' }),
      ],
      PARAMS,
    );
    expect(r.dueSoon7Count).toBe(2);
    expect(r.dueSoon7Amount).toBe(30);
  });

  it('agrupa despesas por categoria', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'expense', amount: 100, categoryId: 'c1', categoryName: 'Marketing' }),
        entry({ type: 'expense', amount: 50, categoryId: 'c1', categoryName: 'Marketing' }),
        entry({ type: 'expense', amount: 70, categoryId: 'c2', categoryName: 'Infra' }),
      ],
      PARAMS,
    );
    const marketing = r.byCategory.find((c) => c.categoryId === 'c1');
    expect(marketing?.total).toBe(150);
    expect(r.byCategory).toHaveLength(2);
  });

  it('monta buckets mensais por competencia', () => {
    const r = aggregateCashflow(
      [
        entry({ type: 'income', amount: 1000, competenceDate: '2026-06-10' }),
        entry({ type: 'expense', amount: 400, competenceDate: '2026-06-12' }),
      ],
      PARAMS,
    );
    const jun = r.monthly.find((m) => m.month === '2026-06');
    expect(jun?.income).toBe(1000);
    expect(jun?.expense).toBe(400);
  });

  it('repassa o mrr informado', () => {
    const r = aggregateCashflow([], PARAMS, 12345);
    expect(r.mrr).toBe(12345);
  });
});
```
- [x] Rodar e ver falhar: `npx vitest run src/lib/finance/cashflow.test.ts` — esperado: falha por import nao resolvido (`./cashflow`).
- [x] Implementar em `src/lib/finance/cashflow.ts` com o conteudo COMPLETO:
```ts
/**
 * Lancamentos Financeiros — agregacao PURA do resumo de fluxo de caixa.
 * Recebe lancamentos JA filtrados pelo periodo + (opcional) MRR das
 * assinaturas (Stripe), calculado fora. assinaturas/avulsos/projected nos
 * buckets mensais ficam 0 aqui; a camada de dashboard que cruza Stripe os
 * preenche.
 */

import type { FinancialEntry, CashflowSummary } from '@/types/finance';
import { effectiveStatus, daysUntil, todayISO } from './status';

export interface AggregateParams {
  from: string;
  to: string;
  today?: string;
}

export function aggregateCashflow(
  entries: FinancialEntry[],
  params: AggregateParams,
  mrr: number = 0,
): CashflowSummary {
  const today = params.today ?? todayISO();

  let totalIncome = 0;
  let totalExpense = 0;
  let cashBalance = 0;
  let overdueAmount = 0;
  let overdueCount = 0;
  let dueSoon7Amount = 0;
  let dueSoon7Count = 0;

  const catMap = new Map<string, { categoryId: string; name: string; total: number; color?: string }>();
  const monthMap = new Map<string, { month: string; income: number; expense: number }>();

  for (const e of entries) {
    if (e.status === 'canceled') continue;

    const signedAmount = e.amount;
    if (e.type === 'income') totalIncome += signedAmount;
    else totalExpense += signedAmount;

    // Caixa realizado: apenas pagos.
    if (e.status === 'paid') {
      cashBalance += e.type === 'income' ? signedAmount : -signedAmount;
    }

    // Faixas de vencimento (apenas pendentes/derivado).
    const eff = effectiveStatus(e.status, e.dueDate, today);
    if (eff === 'overdue') {
      overdueAmount += signedAmount;
      overdueCount += 1;
    } else if (e.status === 'pending') {
      const d = daysUntil(e.dueDate, today);
      if (d >= 0 && d <= 7) {
        dueSoon7Amount += signedAmount;
        dueSoon7Count += 1;
      }
    }

    // Composicao de despesas por categoria.
    if (e.type === 'expense') {
      const key = e.categoryId ?? '__none__';
      const existing = catMap.get(key);
      if (existing) {
        existing.total += signedAmount;
      } else {
        catMap.set(key, {
          categoryId: e.categoryId ?? '',
          name: e.categoryName ?? 'Sem categoria',
          total: signedAmount,
        });
      }
    }

    // Buckets mensais por competencia (YYYY-MM).
    const month = e.competenceDate.slice(0, 7);
    const bucket = monthMap.get(month) ?? { month, income: 0, expense: 0 };
    if (e.type === 'income') bucket.income += signedAmount;
    else bucket.expense += signedAmount;
    monthMap.set(month, bucket);
  }

  const monthly = Array.from(monthMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      month: m.month,
      assinaturas: 0,
      avulsos: m.income,
      income: m.income,
      expense: m.expense,
      projected: 0,
    }));

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    cashBalance,
    overdueAmount,
    overdueCount,
    dueSoon7Amount,
    dueSoon7Count,
    byCategory: Array.from(catMap.values()).sort((a, b) => b.total - a.total),
    monthly,
    mrr,
  };
}
```
- [x] Rodar e ver passar: `npx vitest run src/lib/finance/cashflow.test.ts` — esperado: `Test Files  1 passed (1)`, 7 testes verdes.
- [x] Rodar a suite completa: `npm test` — esperado: `Test Files  3 passed (3)` (installments + status + cashflow), todos verdes.
- [x] Commit: `git add src/lib/finance/cashflow.ts src/lib/finance/cashflow.test.ts && git commit -m "feat(finance): add pure aggregateCashflow summary builder (TDD)"`

---

### Task 2.4: Servico de categorias financeiras (interface + factory + impl Supabase)

CRUD de `financial_categories` seguindo o padrao `plansService` (interface + factory lazy + impl `.supabase.ts` + normalizador `rowToX`). Verificacao = lint + typecheck (depende de Supabase, sem TDD).

**Files:**
- Create: `src/services/financialCategories/financialCategoriesService.ts`
- Create: `src/services/financialCategories/financialCategoriesService.supabase.ts`

**Interfaces:**
- Consumes: `import { supabase } from '@/lib/supabase'`; `import type { FinancialCategory, FinancialType } from '@/types/finance'`
- Produces:
  - `export interface IFinancialCategoriesService { getCategories(type?: FinancialType): Promise<FinancialCategory[]>; createCategory(input: Partial<FinancialCategory>): Promise<FinancialCategory>; updateCategory(id: string, updates: Partial<FinancialCategory>): Promise<FinancialCategory>; deleteCategory(id: string): Promise<void>; }`
  - `export async function getFinancialCategoriesService(): Promise<IFinancialCategoriesService>` (singleton lazy)
  - `export function resetFinancialCategoriesService(): void`
  - `export function rowToFinancialCategory(row: Record<string, unknown>): FinancialCategory`

**Steps:**

- [x] Implementar a interface + factory em `src/services/financialCategories/financialCategoriesService.ts` com o conteudo COMPLETO:
```ts
/**
 * Financial Categories Service — Interface & Factory
 * Lancamentos Financeiros (Fluxo de Caixa) — CRUD de categorias.
 */

import type { FinancialCategory, FinancialType } from '@/types/finance';

export interface IFinancialCategoriesService {
  /** Lista categorias (admin), opcionalmente filtradas por natureza. */
  getCategories(type?: FinancialType): Promise<FinancialCategory[]>;
  /** Cria uma categoria. */
  createCategory(input: Partial<FinancialCategory>): Promise<FinancialCategory>;
  /** Atualiza campos de uma categoria. */
  updateCategory(id: string, updates: Partial<FinancialCategory>): Promise<FinancialCategory>;
  /** Exclui uma categoria (FK em entries usa SET NULL). */
  deleteCategory(id: string): Promise<void>;
}

let _instance: IFinancialCategoriesService | null = null;

export async function getFinancialCategoriesService(): Promise<IFinancialCategoriesService> {
  if (_instance) return _instance;
  const { SupabaseFinancialCategoriesService } = await import(
    './financialCategoriesService.supabase'
  );
  _instance = new SupabaseFinancialCategoriesService();
  return _instance;
}

export function resetFinancialCategoriesService(): void {
  _instance = null;
}
```
- [x] Implementar a impl Supabase em `src/services/financialCategories/financialCategoriesService.supabase.ts` com o conteudo COMPLETO:
```ts
/**
 * Financial Categories Service — Supabase Implementation
 * Consulta/escreve a tabela financial_categories. RLS admin-only.
 */

import { supabase } from '@/lib/supabase';
import type { FinancialCategory, FinancialType } from '@/types/finance';
import type { IFinancialCategoriesService } from './financialCategoriesService';

/** Converte um row snake_case em FinancialCategory (camelCase). */
export function rowToFinancialCategory(row: Record<string, unknown>): FinancialCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as FinancialType,
    color: (row.color as string | null) ?? undefined,
    isActive: (row.is_active as boolean) ?? true,
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

export class SupabaseFinancialCategoriesService implements IFinancialCategoriesService {
  async getCategories(type?: FinancialType): Promise<FinancialCategory[]> {
    let query = supabase
      .from('financial_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r) => rowToFinancialCategory(r as Record<string, unknown>));
  }

  async createCategory(input: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const { data, error } = await supabase
      .from('financial_categories')
      .insert({
        name: input.name,
        type: input.type,
        color: input.color ?? null,
        is_active: input.isActive ?? true,
        sort_order: input.sortOrder ?? 0,
      })
      .select()
      .single();

    if (error) throw error;
    return rowToFinancialCategory(data as Record<string, unknown>);
  }

  async updateCategory(id: string, updates: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    // .select() obrigatorio: UPDATE bloqueado por RLS retorna 0 linhas sem erro.
    const { data, error } = await supabase
      .from('financial_categories')
      .update(dbUpdates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nao foi possivel atualizar a categoria (sem permissao ou inexistente).');
    }
    return rowToFinancialCategory(data[0] as Record<string, unknown>);
  }

  async deleteCategory(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('financial_categories')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Falha ao excluir categoria. Verifique permissoes de admin.');
    }
  }
}
```
- [x] Verificar lint: `npm run lint` — esperado: zero erros nos arquivos novos (`financialCategoriesService.ts`, `financialCategoriesService.supabase.ts`).
- [x] Verificar typecheck: `npx tsc --noEmit -p tsconfig.app.json` — esperado: sem erros relacionados a `financialCategories` (depende de `src/types/finance.ts` da Fase 1).
- [x] Commit: `git add src/services/financialCategories && git commit -m "feat(finance): add financialCategories service (CRUD via Supabase)"`

---

### Task 2.5: Servico financeiro — Parte A (interface + factory + entries CRUD/list/markPaid/installments)

Interface `IFinanceService` completa + factory + a impl Supabase dos metodos de entries: `getEntries` (filtros+paginacao+sort), `getEntry`, `createEntry`, `createEntryWithInstallments` (RPC), `updateEntry`, `markPaid` (RPC), `cancelEntry`, `bulkMarkPaid`, `deleteEntry`. Anexos/dashboard/recorrencias ficam na Task 2.6 (mesmo arquivo).

**Files:**
- Create: `src/services/finance/financeService.ts`
- Create: `src/services/finance/financeService.supabase.ts`

**Interfaces:**
- Consumes: `import { supabase } from '@/lib/supabase'`; `import type { PaginatedResult, PaginationConfig, SortConfig } from '@/services/types'`; `import type { FinancialEntry, FinancialAttachment, FinancialRecurrence, EntryFilters, InstallmentItem, CashflowSummary, PaymentMethod, AttachmentKind, FinancialType, EntryStatus } from '@/types/finance'`; `import { effectiveStatus, todayISO } from '@/lib/finance/status'`
- Produces:
  - `export interface IFinanceService { ... }` (assinatura EXATA do CONTRATO — ver step)
  - `export async function getFinanceService(): Promise<IFinanceService>` (singleton lazy)
  - `export function resetFinanceService(): void`
  - `export function rowToFinancialEntry(row: Record<string, unknown>): FinancialEntry`

**Steps:**

- [x] Implementar a interface + factory em `src/services/finance/financeService.ts` com o conteudo COMPLETO:
```ts
/**
 * Finance Service — Interface & Factory
 * Lancamentos Financeiros (Fluxo de Caixa): entries, anexos, parcelas,
 * recorrencias e agregacoes do dashboard. RLS admin-only.
 */

import type { PaginatedResult, PaginationConfig, SortConfig } from '@/services/types';
import type {
  FinancialEntry,
  FinancialAttachment,
  FinancialRecurrence,
  EntryFilters,
  InstallmentItem,
  CashflowSummary,
  PaymentMethod,
  AttachmentKind,
} from '@/types/finance';

export interface IFinanceService {
  // --- Entries -----------------------------------------------------------
  getEntries(
    filters?: EntryFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<FinancialEntry>>;
  getEntry(id: string): Promise<FinancialEntry | null>;
  createEntry(input: Partial<FinancialEntry>): Promise<FinancialEntry>;
  createEntryWithInstallments(
    base: Partial<FinancialEntry>,
    items: InstallmentItem[],
  ): Promise<FinancialEntry[]>;
  updateEntry(id: string, updates: Partial<FinancialEntry>): Promise<FinancialEntry>;
  markPaid(id: string, paidDate: string, paymentMethod?: PaymentMethod): Promise<FinancialEntry>;
  cancelEntry(id: string): Promise<FinancialEntry>;
  bulkMarkPaid(ids: string[], paidDate: string): Promise<number>;
  deleteEntry(id: string): Promise<void>;

  // --- Attachments -------------------------------------------------------
  uploadAttachment(entryId: string, file: File, kind?: AttachmentKind): Promise<FinancialAttachment>;
  getAttachmentSignedUrl(storagePath: string): Promise<string>;
  removeAttachment(id: string): Promise<void>;

  // --- Dashboard ---------------------------------------------------------
  getCashflowSummary(params: {
    from: string;
    to: string;
    scope: 'consolidated' | 'avulsos' | 'assinaturas';
  }): Promise<CashflowSummary>;

  // --- Recurrences -------------------------------------------------------
  getRecurrences(): Promise<FinancialRecurrence[]>;
  createRecurrence(input: Partial<FinancialRecurrence>): Promise<FinancialRecurrence>;
  updateRecurrence(id: string, updates: Partial<FinancialRecurrence>): Promise<FinancialRecurrence>;
  deleteRecurrence(id: string): Promise<void>;
}

let _instance: IFinanceService | null = null;

export async function getFinanceService(): Promise<IFinanceService> {
  if (_instance) return _instance;
  const { SupabaseFinanceService } = await import('./financeService.supabase');
  _instance = new SupabaseFinanceService();
  return _instance;
}

export function resetFinanceService(): void {
  _instance = null;
}
```
- [x] Criar a impl Supabase em `src/services/finance/financeService.supabase.ts` com a PRIMEIRA metade (normalizador + entries). Conteudo COMPLETO desta parte (a Task 2.6 acrescenta os metodos restantes no MESMO arquivo, antes do `}` final da classe):
```ts
/**
 * Finance Service — Supabase Implementation
 * Tabelas: financial_entries, financial_attachments, financial_recurrences.
 * RPCs: create_financial_entry_with_installments, mark_financial_entry_paid.
 * Storage: bucket privado financial-documents (signed URLs).
 */

import { supabase } from '@/lib/supabase';
import type { PaginatedResult, PaginationConfig, SortConfig } from '@/services/types';
import type {
  FinancialEntry,
  FinancialAttachment,
  FinancialRecurrence,
  EntryFilters,
  InstallmentItem,
  CashflowSummary,
  PaymentMethod,
  AttachmentKind,
  FinancialType,
  EntryStatus,
} from '@/types/finance';
import { effectiveStatus, todayISO } from '@/lib/finance/status';
import { aggregateCashflow } from '@/lib/finance/cashflow';
import type { IFinanceService } from './financeService';

const BUCKET = 'financial-documents';

// Map camelCase sort fields -> snake_case DB columns.
const ENTRY_SORT_MAP: Record<string, string> = {
  dueDate: 'due_date',
  competenceDate: 'competence_date',
  amount: 'amount',
  createdAt: 'created_at',
  status: 'status',
  description: 'description',
};

/** Converte um row de financial_entries (com join opcional de categoria/anexos). */
export function rowToFinancialEntry(row: Record<string, unknown>): FinancialEntry {
  const category = row.financial_categories as Record<string, unknown> | null | undefined;
  const attachmentsRaw = row.financial_attachments as Record<string, unknown>[] | null | undefined;
  return {
    id: row.id as string,
    type: row.type as FinancialType,
    status: row.status as EntryStatus,
    categoryId: (row.category_id as string | null) ?? undefined,
    categoryName: (category?.name as string | undefined) ?? undefined,
    description: row.description as string,
    counterpartyName: (row.counterparty_name as string | null) ?? undefined,
    counterpartyCompanyId: (row.counterparty_company_id as string | null) ?? undefined,
    amount: Number(row.amount ?? 0),
    currency: (row.currency as string) ?? 'BRL',
    paymentMethod: (row.payment_method as PaymentMethod | null) ?? undefined,
    competenceDate: row.competence_date as string,
    dueDate: row.due_date as string,
    paidDate: (row.paid_date as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    installmentGroupId: (row.installment_group_id as string | null) ?? undefined,
    installmentNumber: (row.installment_number as number | null) ?? undefined,
    installmentTotal: (row.installment_total as number | null) ?? undefined,
    recurrenceId: (row.recurrence_id as string | null) ?? undefined,
    attachments: attachmentsRaw
      ? attachmentsRaw.map((a) => rowToAttachment(a))
      : undefined,
    createdBy: (row.created_by as string | null) ?? undefined,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

export function rowToAttachment(row: Record<string, unknown>): FinancialAttachment {
  return {
    id: row.id as string,
    entryId: row.entry_id as string,
    storagePath: row.storage_path as string,
    fileName: row.file_name as string,
    fileType: row.file_type as string,
    fileSize: (row.file_size as number | null) ?? undefined,
    kind: (row.kind as AttachmentKind | null) ?? undefined,
    uploadedBy: (row.uploaded_by as string | null) ?? undefined,
    createdAt: (row.created_at as string) ?? '',
  };
}

export function rowToRecurrence(row: Record<string, unknown>): FinancialRecurrence {
  return {
    id: row.id as string,
    type: row.type as FinancialType,
    description: row.description as string,
    categoryId: (row.category_id as string | null) ?? undefined,
    counterpartyName: (row.counterparty_name as string | null) ?? undefined,
    counterpartyCompanyId: (row.counterparty_company_id as string | null) ?? undefined,
    amount: Number(row.amount ?? 0),
    paymentMethod: (row.payment_method as PaymentMethod | null) ?? undefined,
    frequency: row.frequency as FinancialRecurrence['frequency'],
    interval: (row.interval as number) ?? 1,
    dayOfMonth: (row.day_of_month as number | null) ?? undefined,
    startDate: row.start_date as string,
    endDate: (row.end_date as string | null) ?? undefined,
    nextRunDate: (row.next_run_date as string | null) ?? undefined,
    isActive: (row.is_active as boolean) ?? true,
    createdAt: (row.created_at as string) ?? '',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

/** Converte um Partial<FinancialEntry> (camelCase) em colunas snake_case. */
function entryToRow(input: Partial<FinancialEntry>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.type !== undefined) row.type = input.type;
  if (input.status !== undefined) row.status = input.status;
  if (input.categoryId !== undefined) row.category_id = input.categoryId ?? null;
  if (input.description !== undefined) row.description = input.description;
  if (input.counterpartyName !== undefined) row.counterparty_name = input.counterpartyName ?? null;
  if (input.counterpartyCompanyId !== undefined) row.counterparty_company_id = input.counterpartyCompanyId ?? null;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.currency !== undefined) row.currency = input.currency;
  if (input.paymentMethod !== undefined) row.payment_method = input.paymentMethod ?? null;
  if (input.competenceDate !== undefined) row.competence_date = input.competenceDate;
  if (input.dueDate !== undefined) row.due_date = input.dueDate;
  if (input.paidDate !== undefined) row.paid_date = input.paidDate ?? null;
  if (input.notes !== undefined) row.notes = input.notes ?? null;
  if (input.installmentGroupId !== undefined) row.installment_group_id = input.installmentGroupId ?? null;
  if (input.installmentNumber !== undefined) row.installment_number = input.installmentNumber ?? null;
  if (input.installmentTotal !== undefined) row.installment_total = input.installmentTotal ?? null;
  if (input.recurrenceId !== undefined) row.recurrence_id = input.recurrenceId ?? null;
  return row;
}

const ENTRY_SELECT = '*, financial_categories(name), financial_attachments(*)';

export class SupabaseFinanceService implements IFinanceService {
  // -----------------------------------------------------------------------
  // Entries — list with filters / pagination / sort
  // -----------------------------------------------------------------------
  async getEntries(
    filters?: EntryFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<FinancialEntry>> {
    const dateField = filters?.dateField === 'competence' ? 'competence_date' : 'due_date';
    let query = supabase.from('financial_entries').select(ENTRY_SELECT, { count: 'exact' });

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
    if (filters?.paymentMethod) query = query.eq('payment_method', filters.paymentMethod);

    if (filters?.search) {
      const term = `%${filters.search}%`;
      query = query.or(`description.ilike.${term},counterparty_name.ilike.${term}`);
    }

    if (filters?.dateFrom) query = query.gte(dateField, filters.dateFrom);
    if (filters?.dateTo) query = query.lte(dateField, filters.dateTo);

    // Status: 'overdue' e derivado (pending + due_date < hoje), nao armazenado.
    if (filters?.status) {
      if (filters.status === 'overdue') {
        query = query.eq('status', 'pending').lt('due_date', todayISO());
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (sort) {
      const column = ENTRY_SORT_MAP[sort.field] ?? 'due_date';
      query = query.order(column, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('due_date', { ascending: true });
    }

    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw new Error(`Failed to fetch entries: ${error.message}`);

    const total = count ?? 0;
    return {
      data: (data ?? []).map((r) => rowToFinancialEntry(r as Record<string, unknown>)),
      total,
      page,
      pageSize,
      hasMore: from + pageSize < total,
    };
  }

  async getEntry(id: string): Promise<FinancialEntry | null> {
    const { data, error } = await supabase
      .from('financial_entries')
      .select(ENTRY_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? rowToFinancialEntry(data as Record<string, unknown>) : null;
  }

  async createEntry(input: Partial<FinancialEntry>): Promise<FinancialEntry> {
    const { data, error } = await supabase
      .from('financial_entries')
      .insert(entryToRow(input))
      .select(ENTRY_SELECT)
      .single();

    if (error) throw error;
    return rowToFinancialEntry(data as Record<string, unknown>);
  }

  async createEntryWithInstallments(
    base: Partial<FinancialEntry>,
    items: InstallmentItem[],
  ): Promise<FinancialEntry[]> {
    // RPC atomica (SECURITY DEFINER): cria N parcelas com installment_group_id
    // compartilhado. Retorna os ids criados.
    const { data, error } = await supabase.rpc('create_financial_entry_with_installments', {
      p_base: entryToRow(base),
      p_items: items.map((i) => ({
        number: i.number,
        due_date: i.dueDate,
        amount: i.amount,
      })),
    });

    if (error) throw error;

    const ids = (data ?? []) as string[];
    if (ids.length === 0) return [];

    const { data: rows, error: fetchError } = await supabase
      .from('financial_entries')
      .select(ENTRY_SELECT)
      .in('id', ids)
      .order('installment_number', { ascending: true });

    if (fetchError) throw fetchError;
    return (rows ?? []).map((r) => rowToFinancialEntry(r as Record<string, unknown>));
  }

  async updateEntry(id: string, updates: Partial<FinancialEntry>): Promise<FinancialEntry> {
    // .select() obrigatorio: UPDATE bloqueado por RLS retorna 0 linhas sem erro.
    const { data, error } = await supabase
      .from('financial_entries')
      .update(entryToRow(updates))
      .eq('id', id)
      .select(ENTRY_SELECT);

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nao foi possivel atualizar o lancamento (sem permissao ou inexistente).');
    }
    return rowToFinancialEntry(data[0] as Record<string, unknown>);
  }

  async markPaid(
    id: string,
    paidDate: string,
    paymentMethod?: PaymentMethod,
  ): Promise<FinancialEntry> {
    const { error } = await supabase.rpc('mark_financial_entry_paid', {
      p_entry_id: id,
      p_paid_date: paidDate,
      p_payment_method: paymentMethod ?? null,
    });
    if (error) throw error;

    const entry = await this.getEntry(id);
    if (!entry) {
      throw new Error('Lancamento nao encontrado apos a baixa.');
    }
    return entry;
  }

  async cancelEntry(id: string): Promise<FinancialEntry> {
    return this.updateEntry(id, { status: 'canceled' });
  }

  async bulkMarkPaid(ids: string[], paidDate: string): Promise<number> {
    let count = 0;
    for (const id of ids) {
      const { error } = await supabase.rpc('mark_financial_entry_paid', {
        p_entry_id: id,
        p_paid_date: paidDate,
        p_payment_method: null,
      });
      if (!error) count += 1;
      else console.warn('[Finance] bulkMarkPaid: falha em', id, error.message);
    }
    return count;
  }

  async deleteEntry(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('financial_entries')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Falha ao excluir lancamento. Verifique permissoes de admin.');
    }
  }
}
```

> **Nota:** o uso de `effectiveStatus`/`aggregateCashflow` importados acima e consumido pela Task 2.6 (`getCashflowSummary`). Ate a Task 2.6 ser concluida o lint pode acusar import nao usado — por isso o lint/typecheck "verde" e validado ao final da 2.6, nao aqui. Para nao quebrar o pipeline, este step termina com typecheck (que ignora unused imports) e o lint completo roda na 2.6.

- [x] Verificar typecheck: `npx tsc --noEmit -p tsconfig.app.json` — esperado: sem erros de tipo nos arquivos `financeService.ts`/`financeService.supabase.ts` (a classe ainda nao implementa todos os metodos da interface, entao `class SupabaseFinanceService implements IFinanceService` ACUSARA erro de membros ausentes — isso e esperado e sera resolvido na Task 2.6; confirmar que os UNICOS erros sao "Class incorrectly implements interface ... missing: uploadAttachment, getAttachmentSignedUrl, removeAttachment, getCashflowSummary, getRecurrences, createRecurrence, updateRecurrence, deleteRecurrence").
- [x] Commit: `git add src/services/finance && git commit -m "feat(finance): add finance service entries CRUD/list/markPaid/installments (WIP)"`

---

### Task 2.6: Servico financeiro — Parte B (anexos + signed URL, dashboard, recorrencias)

Acrescenta os metodos restantes a classe `SupabaseFinanceService` (anexos via bucket privado + signed URLs, `getCashflowSummary` delegando a `aggregateCashflow` + MRR de assinaturas, CRUD de recorrencias). Ao final, a classe implementa toda a `IFinanceService` → lint+typecheck limpos.

**Files:**
- Modify: `src/services/finance/financeService.supabase.ts`

**Interfaces:**
- Consumes: `aggregateCashflow` de `@/lib/finance/cashflow`; bucket `financial-documents`; RPC `mark_financial_entry_paid` (ja usada); tabelas `subscriptions` (MRR) e `financial_recurrences`.
- Produces: implementacao completa de `uploadAttachment`, `getAttachmentSignedUrl`, `removeAttachment`, `getCashflowSummary`, `getRecurrences`, `createRecurrence`, `updateRecurrence`, `deleteRecurrence`.

**Steps:**

- [x] Inserir os metodos restantes ANTES do `}` final da classe `SupabaseFinanceService` em `src/services/finance/financeService.supabase.ts`. Codigo COMPLETO a inserir:
```ts
  // -----------------------------------------------------------------------
  // Attachments — bucket privado, signed URLs
  // -----------------------------------------------------------------------
  async uploadAttachment(
    entryId: string,
    file: File,
    kind?: AttachmentKind,
  ): Promise<FinancialAttachment> {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
      throw new Error('Formato invalido. Aceitos: PDF, PNG, JPEG.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('O arquivo excede o limite de 10 MB.');
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `financial/${entryId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) throw uploadError;

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('financial_attachments')
      .insert({
        entry_id: entryId,
        storage_path: path,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        kind: kind ?? null,
        uploaded_by: user?.id ?? null,
      })
      .select()
      .single();

    if (error) {
      // Best-effort cleanup: remove o objeto se o insert falhar (orfao).
      await supabase.storage.from(BUCKET).remove([path]);
      throw error;
    }
    return rowToAttachment(data as Record<string, unknown>);
  }

  async getAttachmentSignedUrl(storagePath: string): Promise<string> {
    // URL temporaria (1h) — bucket e privado, nunca getPublicUrl.
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  }

  async removeAttachment(id: string): Promise<void> {
    // Busca o path antes para limpar o objeto no Storage.
    const { data: row, error: fetchError } = await supabase
      .from('financial_attachments')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle();
    if (fetchError) throw fetchError;

    const { data: deleted, error } = await supabase
      .from('financial_attachments')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!deleted || deleted.length === 0) {
      throw new Error('Falha ao remover anexo. Verifique permissoes de admin.');
    }

    const path = (row?.storage_path as string | undefined) ?? undefined;
    if (path) {
      // Best-effort.
      await supabase.storage.from(BUCKET).remove([path]);
    }
  }

  // -----------------------------------------------------------------------
  // Dashboard — agregacao via funcao pura + MRR das assinaturas (Stripe)
  // -----------------------------------------------------------------------
  async getCashflowSummary(params: {
    from: string;
    to: string;
    scope: 'consolidated' | 'avulsos' | 'assinaturas';
  }): Promise<CashflowSummary> {
    // Busca os lancamentos avulsos do periodo (por competencia) — paginado em
    // lote unico amplo; o dashboard opera sobre meses, nao milhares de linhas.
    const { data, error } = await supabase
      .from('financial_entries')
      .select(ENTRY_SELECT)
      .gte('competence_date', params.from)
      .lte('competence_date', params.to)
      .range(0, 4999);
    if (error) throw error;

    const entries = (data ?? []).map((r) => rowToFinancialEntry(r as Record<string, unknown>));

    // MRR: soma price_paid das assinaturas ativas pagas (nao trial).
    let mrr = 0;
    if (params.scope !== 'avulsos') {
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('price_paid, status, is_trial')
        .eq('status', 'active')
        .eq('is_trial', false);
      mrr = (subs ?? []).reduce((s, r) => s + Number((r as Record<string, unknown>).price_paid ?? 0), 0);
    }

    // Em escopo 'assinaturas' ignoramos lancamentos avulsos.
    const scopedEntries = params.scope === 'assinaturas' ? [] : entries;

    return aggregateCashflow(
      scopedEntries,
      { from: params.from, to: params.to, today: todayISO() },
      mrr,
    );
  }

  // -----------------------------------------------------------------------
  // Recurrences — CRUD da regra
  // -----------------------------------------------------------------------
  async getRecurrences(): Promise<FinancialRecurrence[]> {
    const { data, error } = await supabase
      .from('financial_recurrences')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => rowToRecurrence(r as Record<string, unknown>));
  }

  async createRecurrence(input: Partial<FinancialRecurrence>): Promise<FinancialRecurrence> {
    const { data, error } = await supabase
      .from('financial_recurrences')
      .insert(recurrenceToRow(input))
      .select()
      .single();
    if (error) throw error;
    return rowToRecurrence(data as Record<string, unknown>);
  }

  async updateRecurrence(
    id: string,
    updates: Partial<FinancialRecurrence>,
  ): Promise<FinancialRecurrence> {
    const { data, error } = await supabase
      .from('financial_recurrences')
      .update(recurrenceToRow(updates))
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Nao foi possivel atualizar a recorrencia (sem permissao ou inexistente).');
    }
    return rowToRecurrence(data[0] as Record<string, unknown>);
  }

  async deleteRecurrence(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('financial_recurrences')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Falha ao excluir recorrencia. Verifique permissoes de admin.');
    }
  }
```
- [x] Adicionar o helper `recurrenceToRow` no nivel do modulo (apos a funcao `entryToRow`, fora da classe) em `src/services/finance/financeService.supabase.ts`. Codigo COMPLETO:
```ts
/** Converte um Partial<FinancialRecurrence> (camelCase) em colunas snake_case. */
function recurrenceToRow(input: Partial<FinancialRecurrence>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.type !== undefined) row.type = input.type;
  if (input.description !== undefined) row.description = input.description;
  if (input.categoryId !== undefined) row.category_id = input.categoryId ?? null;
  if (input.counterpartyName !== undefined) row.counterparty_name = input.counterpartyName ?? null;
  if (input.counterpartyCompanyId !== undefined) row.counterparty_company_id = input.counterpartyCompanyId ?? null;
  if (input.amount !== undefined) row.amount = input.amount;
  if (input.paymentMethod !== undefined) row.payment_method = input.paymentMethod ?? null;
  if (input.frequency !== undefined) row.frequency = input.frequency;
  if (input.interval !== undefined) row.interval = input.interval;
  if (input.dayOfMonth !== undefined) row.day_of_month = input.dayOfMonth ?? null;
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.endDate !== undefined) row.end_date = input.endDate ?? null;
  if (input.nextRunDate !== undefined) row.next_run_date = input.nextRunDate ?? null;
  if (input.isActive !== undefined) row.is_active = input.isActive;
  return row;
}
```
- [x] Remover o import nao utilizado de `effectiveStatus` se o lint acusar: a `getCashflowSummary` usa apenas `todayISO` e `aggregateCashflow` (a derivacao de overdue acontece dentro de `aggregateCashflow`). Editar a linha de import para `import { todayISO } from '@/lib/finance/status';` e manter `import { aggregateCashflow } from '@/lib/finance/cashflow';`.
- [x] Verificar lint: `npm run lint` — esperado: zero erros/warnings nos arquivos `src/services/finance/*`.
- [x] Verificar typecheck: `npx tsc --noEmit -p tsconfig.app.json` — esperado: ZERO erros (a classe agora implementa toda a `IFinanceService`; o erro "incorrectly implements interface" da Task 2.5 desaparece).
- [x] Commit: `git add src/services/finance && git commit -m "feat(finance): complete finance service (attachments, cashflow summary, recurrences)"`

---

### Task 2.7: Hooks React Query (entries, dashboard, categorias) com key factories e invalidacao

Tres arquivos de hooks seguindo o padrao `usePlansQuery`/`useCandidatesQuery`: query key factories, `useQuery` com paginacao, mutations com `invalidateQueries`. Verificacao = lint + typecheck.

**Files:**
- Create: `src/hooks/useFinancialEntriesQuery.ts`
- Create: `src/hooks/useFinancialDashboardQuery.ts`
- Create: `src/hooks/useFinancialCategoriesQuery.ts`

**Interfaces:**
- Consumes: `getFinanceService`, `getFinancialCategoriesService`; tipos de `@/types/finance` e `@/services/types`.
- Produces (key factories + hooks):
  - `export const financeKeys` com `all`, `lists()`, `list(filters,pag,sort)`, `details()`, `detail(id)`, `summary(params)`.
  - `export const categoryKeys` com `all`, `list(type)`.
  - `export const recurrenceKeys` com `all`, `list()`.
  - Entries: `useFinancialEntries(filters?,pagination?,sort?)`, `useFinancialEntry(id)`, `useCreateEntry()`, `useUpdateEntry()`, `useMarkEntryPaid()`, `useCancelEntry()`, `useBulkMarkPaid()`, `useDeleteEntry()`, `useUploadAttachment()`.
  - Dashboard: `useCashflowSummary(params)`, `useRecurrences()`, `useCreateRecurrence()`, `useUpdateRecurrence()`, `useDeleteRecurrence()`.
  - Categorias: `useFinancialCategories(type?)`, `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()`.

**Steps:**

- [x] Criar `src/hooks/useFinancialCategoriesQuery.ts` com o conteudo COMPLETO:
```ts
/**
 * React Query Hooks — Financial Categories
 * Lancamentos Financeiros (Fluxo de Caixa).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFinancialCategoriesService } from '@/services/financialCategories/financialCategoriesService';
import type { FinancialCategory, FinancialType } from '@/types/finance';

export const categoryKeys = {
  all: ['financial-categories'] as const,
  list: (type?: FinancialType) => [...categoryKeys.all, { type }] as const,
};

export function useFinancialCategories(type?: FinancialType) {
  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: async () => {
      const svc = await getFinancialCategoriesService();
      return svc.getCategories(type);
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<FinancialCategory>) => {
      const svc = await getFinancialCategoriesService();
      return svc.createCategory(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err) => console.error('[Finance] createCategory failed:', err),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FinancialCategory> }) => {
      const svc = await getFinancialCategoriesService();
      return svc.updateCategory(id, updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err) => console.error('[Finance] updateCategory failed:', err),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getFinancialCategoriesService();
      return svc.deleteCategory(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err) => console.error('[Finance] deleteCategory failed:', err),
  });
}
```
- [x] Criar `src/hooks/useFinancialEntriesQuery.ts` com o conteudo COMPLETO:
```ts
/**
 * React Query Hooks — Financial Entries
 * Lancamentos Financeiros (Fluxo de Caixa): list paginada/filtrada,
 * detalhe, mutations (criar, atualizar, baixa, cancelar, bulk, excluir,
 * upload de anexo) com invalidacao de cache.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { getFinanceService } from '@/services/finance/financeService';
import type { PaginatedResult, PaginationConfig, SortConfig } from '@/services/types';
import type {
  FinancialEntry,
  EntryFilters,
  PaymentMethod,
  AttachmentKind,
} from '@/types/finance';

export const financeKeys = {
  all: ['financial-entries'] as const,
  lists: () => [...financeKeys.all, 'list'] as const,
  list: (filters?: EntryFilters, pagination?: PaginationConfig, sort?: SortConfig) =>
    [...financeKeys.lists(), { filters, pagination, sort }] as const,
  details: () => [...financeKeys.all, 'detail'] as const,
  detail: (id: string) => [...financeKeys.details(), id] as const,
  summary: (params: { from: string; to: string; scope: string }) =>
    [...financeKeys.all, 'summary', params] as const,
};

export function useFinancialEntries(
  filters?: EntryFilters,
  pagination?: PaginationConfig,
  sort?: SortConfig,
  options?: Omit<UseQueryOptions<PaginatedResult<FinancialEntry>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PaginatedResult<FinancialEntry>>({
    queryKey: financeKeys.list(filters, pagination, sort),
    queryFn: async () => {
      const svc = await getFinanceService();
      return svc.getEntries(filters, pagination, sort);
    },
    ...options,
  });
}

export function useFinancialEntry(id: string | undefined) {
  return useQuery({
    queryKey: financeKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const svc = await getFinanceService();
      return svc.getEntry(id);
    },
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      input,
      installments,
    }: {
      input: Partial<FinancialEntry>;
      installments?: import('@/types/finance').InstallmentItem[];
    }) => {
      const svc = await getFinanceService();
      if (installments && installments.length > 1) {
        return svc.createEntryWithInstallments(input, installments);
      }
      return svc.createEntry(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] createEntry failed:', err),
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FinancialEntry> }) => {
      const svc = await getFinanceService();
      return svc.updateEntry(id, updates);
    },
    onSuccess: (updated) => {
      qc.setQueryData(financeKeys.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: financeKeys.lists() });
      qc.invalidateQueries({ queryKey: [...financeKeys.all, 'summary'] });
    },
    onError: (err) => console.error('[Finance] updateEntry failed:', err),
  });
}

export function useMarkEntryPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      paidDate,
      paymentMethod,
    }: {
      id: string;
      paidDate: string;
      paymentMethod?: PaymentMethod;
    }) => {
      const svc = await getFinanceService();
      return svc.markPaid(id, paidDate, paymentMethod);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] markPaid failed:', err),
  });
}

export function useCancelEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getFinanceService();
      return svc.cancelEntry(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] cancelEntry failed:', err),
  });
}

export function useBulkMarkPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, paidDate }: { ids: string[]; paidDate: string }) => {
      const svc = await getFinanceService();
      return svc.bulkMarkPaid(ids, paidDate);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] bulkMarkPaid failed:', err),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getFinanceService();
      return svc.deleteEntry(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.all }),
    onError: (err) => console.error('[Finance] deleteEntry failed:', err),
  });
}

export function useUploadAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      entryId,
      file,
      kind,
    }: {
      entryId: string;
      file: File;
      kind?: AttachmentKind;
    }) => {
      const svc = await getFinanceService();
      return svc.uploadAttachment(entryId, file, kind);
    },
    onSuccess: (attachment) => {
      qc.invalidateQueries({ queryKey: financeKeys.detail(attachment.entryId) });
      qc.invalidateQueries({ queryKey: financeKeys.lists() });
    },
    onError: (err) => console.error('[Finance] uploadAttachment failed:', err),
  });
}
```
- [x] Criar `src/hooks/useFinancialDashboardQuery.ts` com o conteudo COMPLETO:
```ts
/**
 * React Query Hooks — Financial Dashboard & Recurrences
 * Lancamentos Financeiros (Fluxo de Caixa): resumo agregado e CRUD de
 * recorrencias.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFinanceService } from '@/services/finance/financeService';
import { financeKeys } from './useFinancialEntriesQuery';
import type { FinancialRecurrence } from '@/types/finance';

export const recurrenceKeys = {
  all: ['financial-recurrences'] as const,
  list: () => [...recurrenceKeys.all, 'list'] as const,
};

export function useCashflowSummary(params: {
  from: string;
  to: string;
  scope: 'consolidated' | 'avulsos' | 'assinaturas';
}) {
  return useQuery({
    queryKey: financeKeys.summary(params),
    queryFn: async () => {
      const svc = await getFinanceService();
      return svc.getCashflowSummary(params);
    },
  });
}

export function useRecurrences() {
  return useQuery({
    queryKey: recurrenceKeys.list(),
    queryFn: async () => {
      const svc = await getFinanceService();
      return svc.getRecurrences();
    },
  });
}

export function useCreateRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<FinancialRecurrence>) => {
      const svc = await getFinanceService();
      return svc.createRecurrence(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: recurrenceKeys.all }),
    onError: (err) => console.error('[Finance] createRecurrence failed:', err),
  });
}

export function useUpdateRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FinancialRecurrence> }) => {
      const svc = await getFinanceService();
      return svc.updateRecurrence(id, updates);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: recurrenceKeys.all }),
    onError: (err) => console.error('[Finance] updateRecurrence failed:', err),
  });
}

export function useDeleteRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const svc = await getFinanceService();
      return svc.deleteRecurrence(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: recurrenceKeys.all }),
    onError: (err) => console.error('[Finance] deleteRecurrence failed:', err),
  });
}
```
- [x] Verificar lint: `npm run lint` — esperado: zero erros/warnings nos 3 arquivos de hooks.
- [x] Verificar typecheck: `npx tsc --noEmit -p tsconfig.app.json` — esperado: ZERO erros (hooks tipados contra `IFinanceService`/`IFinancialCategoriesService`).
- [x] Rodar a suite de testes puros novamente para confirmar que nada regrediu: `npm test` — esperado: `Test Files  3 passed (3)`.
- [x] Commit: `git add src/hooks/useFinancialEntriesQuery.ts src/hooks/useFinancialDashboardQuery.ts src/hooks/useFinancialCategoriesQuery.ts && git commit -m "feat(finance): add React Query hooks for entries, dashboard and categories"`

---

#### Checklist de conclusao da Fase 2
- [x] `npm test` verde (3 arquivos: installments, status, cashflow).
- [x] `npm run lint` sem erros nos arquivos de `src/lib/finance`, `src/services/finance`, `src/services/financialCategories`, `src/hooks/useFinancial*`.
- [x] `npx tsc --noEmit -p tsconfig.app.json` sem erros.
- [x] Servicos `getFinanceService` e `getFinancialCategoriesService` exportados com assinaturas EXATAS do CONTRATO.
- [x] Hooks `useFinancial*` com key factories `financeKeys`/`categoryKeys`/`recurrenceKeys` prontos para as Fases 3-6 consumirem.

---

## Fase 3: Tela de Lancamentos (lista 3-views)

> **Pre-requisitos:** Fases 1 e 2 concluidas. Esta fase **consome** o que elas produziram e nao reimplementa nada disso:
> - **Tipos** (`src/types/finance.ts`): `FinancialType`, `EntryStatus`, `EffectiveStatus`, `PaymentMethod`, `FinancialEntry`, `FinancialCategory`, `FinancialAttachment`, `EntryFilters`, `CashflowSummary`.
> - **Servico** (`src/services/finance/financeService.ts`): `getFinanceService()` com `getAttachmentSignedUrl(storagePath): Promise<string>`, `markPaid`, `cancelEntry`, `bulkMarkPaid`.
> - **Hooks** (`src/hooks/useFinancialEntriesQuery.ts`): `useFinancialEntries(filters?, pagination?, sort?)`, `useFinancialEntry(id)`, `useMarkEntryPaid()`, `useCancelEntry()`, `useBulkMarkPaid()`, `financeKeys`. `useFinancialCategories(type?)` em `src/hooks/useFinancialCategoriesQuery.ts`.
> - **Util** (`src/lib/finance/installments.ts`): nao usado aqui (parcelamento e Fase 4).
> - **Vitest** ja instalado e configurado na Fase 1 (`npm run test`).
>
> **Padroes do projeto que esta fase copia (verificados):**
> - Pagina admin: `<DashboardLayout userType="admin">` + `<PageHeader .../>` + `<AdminTabNav />` (ex.: `src/pages/admin/PlansManagement.tsx`).
> - Tabela: shadcn `Table/TableHeader/TableBody/TableRow/TableHead/TableCell` + `Checkbox` + `DropdownMenu` + colunas com `hidden md:table-cell` (ex.: `src/components/admin/users/UserTable.tsx`).
> - Bulk bar flutuante: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50` + `AlertDialog` (ex.: `src/components/corporate-tests/InvitationBulkActionBar.tsx`).
> - Moeda/datas: `formatBRL`, `formatDateBR`, `formatRelativeDate` de `src/lib/formatters.ts`.
> - Toast: `import { toast } from 'sonner'`.
> - Rotas admin: `<Route path=... element={<ProtectedRoute allowedTypes={['admin']}>...</ProtectedRoute>} />` em `src/App.tsx`.
> - Tokens de natureza `--fin-income*` / `--fin-expense*` chegam na Fase 8; aqui usamos classes utilitarias `text-emerald-600`/`text-red-600`/`text-destructive`/`text-amber-600` (mesmas ja usadas em `UserTable.tsx`).

---

### Task 3.1: Navegacao — rotas, grupo de abas e item de sidebar

**Files:**
- Modify: `src/config/adminTabConfig.ts`
- Modify: `src/components/layout/DashboardLayout.tsx`
- Modify: `src/App.tsx`
- Create: `src/pages/admin/FluxoCaixaDashboard.tsx` (placeholder — implementacao real na Fase 5)
- Create: `src/pages/admin/FinancialCategories.tsx` (placeholder — implementacao real na Fase 6)

**Interfaces:**
- Consumes: `ADMIN_TAB_GROUPS: AdminTabGroup[]` (de `adminTabConfig.ts`), `adminNavGroups: NavGroup[]` (interno de `DashboardLayout.tsx`), `DashboardLayout`, `PageHeader`, `AdminTabNav`, `ProtectedRoute`.
- Produces: rotas `/admin/financeiro`, `/admin/financeiro/lancamentos`, `/admin/financeiro/categorias` montadas; grupo de abas `id: 'fluxo-caixa'` com `parentHref: '/admin/financeiro'`; item de sidebar `{ href: '/admin/financeiro', label: 'Fluxo de Caixa', icon: Wallet }` no grupo Financeiro.

**Steps:**

- [ ] Adicionar `Wallet` e `List` aos imports de `lucide-react` em `src/config/adminTabConfig.ts` (o arquivo ja importa de `lucide-react`; `List` ja existe na lista, adicionar apenas `Wallet`). Ajustar a linha de import existente:

```ts
import {
  Users, UsersRound, Shield, ScrollText,
  FolderTree, FileQuestion,
  LayoutDashboard, List, CheckCircle, Calendar, UserCheck,
  DollarSign, TrendingUp, Activity, Rss, Download,
  CreditCard, BarChart3, ToggleLeft, Webhook, FlaskConical, Settings,
  Headset, MessageSquare, BookOpen, Phone,
  Type, UserCircle, Wallet,
} from 'lucide-react';
```

- [ ] Inserir o novo grupo de abas `fluxo-caixa` em `ADMIN_TAB_GROUPS` (logo apos o grupo `financeiro` existente, antes de `feature-flags`) em `src/config/adminTabConfig.ts`:

```ts
  {
    id: 'fluxo-caixa',
    parentHref: '/admin/financeiro',
    tabs: [
      { href: '/admin/financeiro', label: 'Visao Geral', icon: BarChart3 },
      { href: '/admin/financeiro/lancamentos', label: 'Lancamentos', icon: List },
      { href: '/admin/financeiro/categorias', label: 'Categorias', icon: FolderTree },
    ],
  },
```

- [ ] Adicionar `Wallet` ao import de `lucide-react` em `src/components/layout/DashboardLayout.tsx` (a linha que ja importa `Package, Store`):

```ts
  ShieldCheck, BarChart3, CreditCard, DollarSign, ToggleLeft, Headset, Package, Store,
  Fingerprint, Wallet,
```

- [ ] Adicionar o item `Fluxo de Caixa` ao grupo `Financeiro` de `adminNavGroups` em `src/components/layout/DashboardLayout.tsx` (apos `Pacotes de Creditos`):

```ts
  {
    label: 'Financeiro',
    items: [
      { href: '/admin/planos', label: 'Planos & Assinaturas', icon: CreditCard },
      { href: '/admin/pacotes', label: 'Pacotes de Creditos', icon: Package },
      { href: '/admin/financeiro', label: 'Fluxo de Caixa', icon: Wallet },
      { href: '/admin/assinaturas/billing', label: 'Financeiro', icon: DollarSign },
    ],
  },
```

- [ ] Criar `src/pages/admin/FluxoCaixaDashboard.tsx` como placeholder (a Fase 5 substitui o miolo; o shell de navegacao ja fica correto):

```tsx
/**
 * FluxoCaixaDashboard page (Visao Geral do Fluxo de Caixa)
 * Modulo financeiro — lancamentos manuais (cash flow).
 * NOTE: Conteudo de KPIs/graficos sera implementado na Fase 5.
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function FluxoCaixaDashboard() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Fluxo de Caixa"
          description="Consolide receitas e despesas avulsas com as assinaturas da plataforma."
        />
        <AdminTabNav />
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Dashboard de fluxo de caixa em construcao.
        </div>
      </div>
    </DashboardLayout>
  );
}
```

- [ ] Criar `src/pages/admin/FinancialCategories.tsx` como placeholder (a Fase 6 substitui o miolo):

```tsx
/**
 * FinancialCategories page
 * Modulo financeiro — CRUD de categorias.
 * NOTE: CRUD completo sera implementado na Fase 6.
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function FinancialCategories() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Categorias"
          description="Organize receitas e despesas em categorias gerenciaveis."
        />
        <AdminTabNav />
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          CRUD de categorias em construcao.
        </div>
      </div>
    </DashboardLayout>
  );
}
```

- [ ] Registrar os imports em `src/App.tsx` (junto ao bloco de imports admin, apos a linha `import AdminTests from "./pages/admin/AdminTests";`):

```tsx
// Financial Entries (cash flow module)
import AdminFluxoCaixaDashboard from "./pages/admin/FluxoCaixaDashboard";
import AdminFinancialEntries from "./pages/admin/FinancialEntries";
import AdminFinancialCategories from "./pages/admin/FinancialCategories";
```

> Nota: `FinancialEntries` so existe a partir da Task 3.9. Para esta task, registrar primeiro apenas as duas paginas placeholders e a rota de `lancamentos` apontando temporariamente para `AdminFluxoCaixaDashboard` **nao** — em vez disso, criar um stub minimo de `FinancialEntries` agora para o import resolver. Criar o stub abaixo.

- [ ] Criar stub inicial `src/pages/admin/FinancialEntries.tsx` (sera totalmente reescrito na Task 3.9; serve para o import compilar ja nesta task):

```tsx
/**
 * FinancialEntries page (lista de lancamentos, 3 visualizacoes)
 * NOTE: Stub inicial — implementacao completa na Task 3.9.
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';

export default function FinancialEntries() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Lancamentos"
          description="Receitas e despesas avulsas, contas a pagar e a receber."
        />
        <AdminTabNav />
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Lista de lancamentos em construcao.
        </div>
      </div>
    </DashboardLayout>
  );
}
```

- [ ] Registrar as rotas em `src/App.tsx` (logo apos o bloco `/admin/assinaturas/billing`, antes do comentario `{/* Admin Tests Overview */}`):

```tsx
            {/* Financial Entries (cash flow module) */}
            <Route path="/admin/financeiro" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminFluxoCaixaDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/financeiro/lancamentos" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminFinancialEntries />
              </ProtectedRoute>
            } />
            <Route path="/admin/financeiro/categorias" element={
              <ProtectedRoute allowedTypes={['admin']}>
                <AdminFinancialCategories />
              </ProtectedRoute>
            } />
```

- [ ] Rodar lint + typecheck:

```bash
npm run lint && npx tsc --noEmit
```

Saida esperada: sem erros. (Os 3 imports resolvem, as 3 rotas montam.)

- [ ] Verificar visual na porta 3000: `npm run dev`, logar como `admin@recrutars.com` / `Admin@123`, abrir `http://localhost:3000/admin/financeiro`. Observar: item **Fluxo de Caixa** (icone carteira) no grupo Financeiro do sidebar marcado como ativo; barra de abas com **Visao Geral | Lancamentos | Categorias**; trocar de aba navega entre as 3 paginas placeholders sem recarregar; aba ativa com underline primary.

- [ ] Commit:

```bash
git add -A && git commit -m "feat(finance): scaffold cash-flow routes, tabs and sidebar entry"
```

---

### Task 3.2: Helpers puros de status efetivo e faixas de vencimento (TDD)

**Files:**
- Create: `src/lib/finance/entryStatus.ts`
- Test: `src/lib/finance/entryStatus.test.ts`

**Interfaces:**
- Consumes: `FinancialEntry`, `EntryStatus`, `EffectiveStatus` (de `@/types/finance`).
- Produces:
  - `getEffectiveStatus(entry: Pick<FinancialEntry, 'status' | 'dueDate'>, today?: Date): EffectiveStatus`
  - `isOverdue(entry: Pick<FinancialEntry, 'status' | 'dueDate'>, today?: Date): boolean`
  - `daysUntilDue(entry: Pick<FinancialEntry, 'dueDate'>, today?: Date): number`
  - `type DueBucket = 'overdue' | 'due7' | 'due8to30' | 'paid' | 'other'`
  - `bucketForEntry(entry: Pick<FinancialEntry, 'status' | 'dueDate'>, today?: Date): DueBucket`

**Steps:**

- [ ] Escrever o teste falhando `src/lib/finance/entryStatus.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  getEffectiveStatus,
  isOverdue,
  daysUntilDue,
  bucketForEntry,
} from './entryStatus';

const T = new Date(2026, 5, 17); // 2026-06-17 local (mes 0-based)

describe('getEffectiveStatus', () => {
  it('mantem paid', () => {
    expect(getEffectiveStatus({ status: 'paid', dueDate: '2026-06-01' }, T)).toBe('paid');
  });
  it('mantem canceled', () => {
    expect(getEffectiveStatus({ status: 'canceled', dueDate: '2026-06-01' }, T)).toBe('canceled');
  });
  it('pending com vencimento no passado vira overdue', () => {
    expect(getEffectiveStatus({ status: 'pending', dueDate: '2026-06-16' }, T)).toBe('overdue');
  });
  it('pending vencendo hoje continua pending (nao atrasado)', () => {
    expect(getEffectiveStatus({ status: 'pending', dueDate: '2026-06-17' }, T)).toBe('pending');
  });
  it('pending com vencimento futuro continua pending', () => {
    expect(getEffectiveStatus({ status: 'pending', dueDate: '2026-06-30' }, T)).toBe('pending');
  });
});

describe('isOverdue', () => {
  it('true so para pending vencido', () => {
    expect(isOverdue({ status: 'pending', dueDate: '2026-06-16' }, T)).toBe(true);
    expect(isOverdue({ status: 'pending', dueDate: '2026-06-18' }, T)).toBe(false);
    expect(isOverdue({ status: 'paid', dueDate: '2026-06-01' }, T)).toBe(false);
  });
});

describe('daysUntilDue', () => {
  it('0 no dia, negativo no passado, positivo no futuro', () => {
    expect(daysUntilDue({ dueDate: '2026-06-17' }, T)).toBe(0);
    expect(daysUntilDue({ dueDate: '2026-06-16' }, T)).toBe(-1);
    expect(daysUntilDue({ dueDate: '2026-06-24' }, T)).toBe(7);
  });
});

describe('bucketForEntry', () => {
  it('paid -> paid', () => {
    expect(bucketForEntry({ status: 'paid', dueDate: '2026-06-01' }, T)).toBe('paid');
  });
  it('canceled -> other', () => {
    expect(bucketForEntry({ status: 'canceled', dueDate: '2026-06-01' }, T)).toBe('other');
  });
  it('pending vencido -> overdue', () => {
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-06-16' }, T)).toBe('overdue');
  });
  it('pending vencendo em 0..7 dias -> due7', () => {
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-06-17' }, T)).toBe('due7');
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-06-24' }, T)).toBe('due7');
  });
  it('pending vencendo em 8..30 dias -> due8to30', () => {
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-06-25' }, T)).toBe('due8to30');
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-07-17' }, T)).toBe('due8to30');
  });
  it('pending vencendo alem de 30 dias -> other', () => {
    expect(bucketForEntry({ status: 'pending', dueDate: '2026-08-01' }, T)).toBe('other');
  });
});
```

- [ ] Rodar e ver falhar:

```bash
npm run test -- src/lib/finance/entryStatus.test.ts
```

Saida esperada: falha por modulo inexistente (`Failed to resolve import './entryStatus'`).

- [ ] Implementar o minimo em `src/lib/finance/entryStatus.ts`:

```ts
/**
 * Helpers puros de status efetivo e faixas de vencimento de lancamentos.
 * "overdue" e derivado (nunca armazenado): pending + due_date < hoje.
 * Datas date-only (YYYY-MM-DD) sao tratadas como locais para evitar shift de fuso.
 */

import type { EntryStatus, EffectiveStatus } from '@/types/finance';

export type DueBucket = 'overdue' | 'due7' | 'due8to30' | 'paid' | 'other';

/** Parseia YYYY-MM-DD como data local (00:00) — espelha lib/formatters parseDate. */
function parseLocalDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

/** Zera horas para comparar so a data. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Dias inteiros entre hoje e o vencimento (negativo = ja venceu). */
export function daysUntilDue(
  entry: { dueDate: string },
  today: Date = new Date(),
): number {
  const due = startOfDay(parseLocalDate(entry.dueDate)).getTime();
  const now = startOfDay(today).getTime();
  return Math.round((due - now) / 86_400_000);
}

export function isOverdue(
  entry: { status: EntryStatus; dueDate: string },
  today: Date = new Date(),
): boolean {
  return entry.status === 'pending' && daysUntilDue(entry, today) < 0;
}

export function getEffectiveStatus(
  entry: { status: EntryStatus; dueDate: string },
  today: Date = new Date(),
): EffectiveStatus {
  if (isOverdue(entry, today)) return 'overdue';
  return entry.status;
}

export function bucketForEntry(
  entry: { status: EntryStatus; dueDate: string },
  today: Date = new Date(),
): DueBucket {
  if (entry.status === 'paid') return 'paid';
  if (entry.status === 'canceled') return 'other';
  const days = daysUntilDue(entry, today);
  if (days < 0) return 'overdue';
  if (days <= 7) return 'due7';
  if (days <= 30) return 'due8to30';
  return 'other';
}
```

- [ ] Rodar e ver passar:

```bash
npm run test -- src/lib/finance/entryStatus.test.ts
```

Saida esperada: todos os testes passando (`6 passed` em `getEffectiveStatus`/`isOverdue`/`daysUntilDue`/`bucketForEntry`).

- [ ] Commit:

```bash
git add -A && git commit -m "feat(finance): add pure effective-status and due-bucket helpers with tests"
```

---

### Task 3.3: Metadados de exibicao (labels, cores de badge) + OriginBadge

**Files:**
- Create: `src/lib/finance/entryDisplay.ts`
- Create: `src/components/finance/OriginBadge.tsx`

**Interfaces:**
- Consumes: `EntryStatus`, `EffectiveStatus`, `PaymentMethod`, `FinancialType`, `FinancialEntry` (de `@/types/finance`), `Badge` (`@/components/ui/badge`), `cn` (`@/lib/utils`), `formatDateBR` (`@/lib/formatters`).
- Produces:
  - `EFFECTIVE_STATUS_META: Record<EffectiveStatus, { label: string; className: string; icon: LucideIcon }>`
  - `PAYMENT_METHOD_LABELS: Record<PaymentMethod, string>`
  - `TYPE_META: Record<FinancialType, { label: string; amountClass: string; sign: string }>`
  - `formatSignedBRL(type: FinancialType, amount: number): string`
  - `formatCompetencePeriod(competenceDate: string): string`
  - Componente `OriginBadge({ variant }: { variant: 'auto' | 'manual' })`

**Steps:**

- [ ] Implementar `src/lib/finance/entryDisplay.ts`:

```ts
/**
 * Metadados de exibicao para lancamentos financeiros: labels PT-BR,
 * classes de badge (status) e formatacao de valor com sinal pela natureza.
 * Status reusa as escalas WCAG ja usadas em UserTable (emerald/amber/red/gray).
 */

import {
  CheckCircle2, Clock, AlertTriangle, Ban,
  type LucideIcon,
} from 'lucide-react';
import type {
  EntryStatus, EffectiveStatus, PaymentMethod, FinancialType,
} from '@/types/finance';
import { formatBRL } from '@/lib/formatters';

interface StatusMeta {
  label: string;
  className: string;
  icon: LucideIcon;
}

export const EFFECTIVE_STATUS_META: Record<EffectiveStatus, StatusMeta> = {
  paid: {
    label: 'Pago',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Pendente',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    icon: Clock,
  },
  overdue: {
    label: 'Atrasado',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: AlertTriangle,
  },
  canceled: {
    label: 'Cancelado',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300',
    icon: Ban,
  },
};

/** Subconjunto usado em filtros que so aceitam status armazenado. */
export const STATUS_META: Record<EntryStatus, StatusMeta> = {
  paid: EFFECTIVE_STATUS_META.paid,
  pending: EFFECTIVE_STATUS_META.pending,
  canceled: EFFECTIVE_STATUS_META.canceled,
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card_credit: 'Cartao de credito',
  card_debit: 'Cartao de debito',
  pix: 'Pix',
  boleto: 'Boleto',
  transfer: 'Transferencia',
  cash: 'Dinheiro',
  other: 'Outro',
};

export const TYPE_META: Record<FinancialType, { label: string; amountClass: string; sign: string }> = {
  income: { label: 'Receita', amountClass: 'text-emerald-600 dark:text-emerald-400', sign: '+' },
  expense: { label: 'Despesa', amountClass: 'text-red-600 dark:text-red-400', sign: '-' },
};

/** Valor formatado em BRL com sinal pela natureza (+ receita / - despesa). */
export function formatSignedBRL(type: FinancialType, amount: number): string {
  const { sign } = TYPE_META[type];
  return `${sign} ${formatBRL(Math.abs(amount))}`;
}

/** "06/2026" a partir de uma data de competencia date-only. */
export function formatCompetencePeriod(competenceDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(competenceDate)) {
    const [y, m] = competenceDate.split('-');
    return `${m}/${y}`;
  }
  const d = new Date(competenceDate);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
```

- [ ] Implementar `src/components/finance/OriginBadge.tsx` (reutilizavel em tabela, cards e graficos; assinaturas = auto/Stripe, avulsos = manual):

```tsx
/**
 * OriginBadge — distingue lancamentos automaticos (assinaturas/Stripe) de
 * lancamentos manuais (avulsos). Reutilizavel em tabela, cards e graficos.
 */

import { Zap, PenLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OriginBadgeProps {
  variant: 'auto' | 'manual';
  className?: string;
}

const META = {
  auto: {
    label: 'Assinaturas',
    icon: Zap,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  manual: {
    label: 'Avulsos',
    icon: PenLine,
    className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  },
} as const;

export function OriginBadge({ variant, className }: OriginBadgeProps) {
  const meta = META[variant];
  const Icon = meta.icon;
  return (
    <Badge variant="outline" className={cn('gap-1 border-0 text-xs font-medium', meta.className, className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}
```

- [ ] Rodar lint + typecheck:

```bash
npm run lint && npx tsc --noEmit
```

Saida esperada: sem erros.

- [ ] Commit:

```bash
git add -A && git commit -m "feat(finance): add entry display metadata and OriginBadge"
```

---

### Task 3.4: FinancialKpiHeader (KPIs por horizonte, clicaveis)

> ⚠️ **REVISADO 21/07 — são 4 KPIs, não 5.** Remova **"A vencer 7d"** do header: ele repete um número que o filtro de vencimento (Task 3.5) e a faixa do dashboard já expõem, e o mesmo valor em dois lugares faz o admin duvidar de qual é o certo. Ficam: **Saldo do período** (herói), **Entradas**, **Saídas**, **Vencido** (clicável).
> O clique em "Vencido" seta `filters.dueWindow = 'overdue'` — **não** `filters.status`. Ver Task 1.11.

**Files:**
- Create: `src/components/finance/FinancialKpiHeader.tsx`

**Interfaces:**
- Consumes: `FinancialEntry` (de `@/types/finance`), `getEffectiveStatus`/`isOverdue`/`bucketForEntry` (de `@/lib/finance/entryStatus`), `formatBRL` (`@/lib/formatters`), `Card`/`CardContent` (`@/components/ui/card`), `cn` (`@/lib/utils`), `motion` (framer-motion).
- Produces:
  - `interface FinancialKpis { balance: number; income: number; expense: number; overdueAmount: number; overdueCount: number; dueSoon7Amount: number; dueSoon7Count: number }`
  - `computeKpisFromEntries(entries: FinancialEntry[], today?: Date): FinancialKpis`
  - Componente `FinancialKpiHeader({ entries, isLoading, onSelectPreset })` onde `onSelectPreset: (preset: 'overdue' | 'due7') => void`.

**Steps:**

- [ ] Implementar `src/components/finance/FinancialKpiHeader.tsx`:

```tsx
/**
 * FinancialKpiHeader — KPIs por horizonte para a tela de lancamentos.
 * Saldo do periodo, Entradas, Saidas, Vencido (clicavel) e A vencer 7d (clicavel).
 * "Vencido" usa derivacao de overdue; clicar aplica o preset no filtro pai.
 */

import { motion } from 'framer-motion';
import {
  Scale, ArrowDownCircle, ArrowUpCircle, AlertTriangle, CalendarClock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';
import { isOverdue, bucketForEntry, getEffectiveStatus } from '@/lib/finance/entryStatus';
import type { FinancialEntry } from '@/types/finance';

export interface FinancialKpis {
  balance: number;
  income: number;
  expense: number;
  overdueAmount: number;
  overdueCount: number;
  dueSoon7Amount: number;
  dueSoon7Count: number;
}

/** Agrega KPIs a partir da lista (pagina atual / filtrada). Caixa real fica no dashboard. */
export function computeKpisFromEntries(
  entries: FinancialEntry[],
  today: Date = new Date(),
): FinancialKpis {
  let income = 0;
  let expense = 0;
  let overdueAmount = 0;
  let overdueCount = 0;
  let dueSoon7Amount = 0;
  let dueSoon7Count = 0;

  for (const e of entries) {
    if (getEffectiveStatus(e, today) === 'canceled') continue;
    if (e.type === 'income') income += e.amount;
    else expense += e.amount;

    if (isOverdue(e, today)) {
      overdueAmount += e.amount;
      overdueCount += 1;
    }
    if (bucketForEntry(e, today) === 'due7') {
      dueSoon7Amount += e.amount;
      dueSoon7Count += 1;
    }
  }

  return {
    balance: income - expense,
    income,
    expense,
    overdueAmount,
    overdueCount,
    dueSoon7Amount,
    dueSoon7Count,
  };
}

interface FinancialKpiHeaderProps {
  entries: FinancialEntry[];
  isLoading?: boolean;
  onSelectPreset: (preset: 'overdue' | 'due7') => void;
}

export function FinancialKpiHeader({ entries, isLoading, onSelectPreset }: FinancialKpiHeaderProps) {
  const kpis = computeKpisFromEntries(entries);

  const cards: Array<{
    key: string;
    title: string;
    value: string;
    sub?: string;
    icon: typeof Scale;
    valueClass?: string;
    onClick?: () => void;
  }> = [
    {
      key: 'balance',
      title: 'Saldo do periodo',
      value: formatBRL(kpis.balance),
      icon: Scale,
      valueClass: kpis.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
    },
    { key: 'income', title: 'Entradas', value: formatBRL(kpis.income), icon: ArrowUpCircle, valueClass: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'expense', title: 'Saidas', value: formatBRL(kpis.expense), icon: ArrowDownCircle, valueClass: 'text-red-600 dark:text-red-400' },
    {
      key: 'overdue',
      title: 'Vencido',
      value: formatBRL(kpis.overdueAmount),
      sub: `${kpis.overdueCount} lancamento${kpis.overdueCount === 1 ? '' : 's'}`,
      icon: AlertTriangle,
      valueClass: 'text-destructive',
      onClick: () => onSelectPreset('overdue'),
    },
    {
      key: 'due7',
      title: 'A vencer 7d',
      value: formatBRL(kpis.dueSoon7Amount),
      sub: `${kpis.dueSoon7Count} lancamento${kpis.dueSoon7Count === 1 ? '' : 's'}`,
      icon: CalendarClock,
      valueClass: 'text-amber-600 dark:text-amber-400',
      onClick: () => onSelectPreset('due7'),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const interactive = !!c.onClick;
        const inner = (
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-medium">{c.title}</span>
            </div>
            <div className={cn('truncate text-xl font-bold tabular-nums', c.valueClass)}>
              {isLoading ? '—' : c.value}
            </div>
            {c.sub && <div className="mt-0.5 text-xs text-muted-foreground">{c.sub}</div>}
          </CardContent>
        );
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            {interactive ? (
              <button
                type="button"
                onClick={c.onClick}
                className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Filtrar por ${c.title}`}
              >
                <Card className="transition-shadow hover:shadow-md hover:ring-1 hover:ring-primary/30">{inner}</Card>
              </button>
            ) : (
              <Card className="transition-shadow hover:shadow-md">{inner}</Card>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
```

- [ ] Rodar lint + typecheck:

```bash
npm run lint && npx tsc --noEmit
```

Saida esperada: sem erros.

- [ ] Commit:

```bash
git add -A && git commit -m "feat(finance): add FinancialKpiHeader with horizon KPIs"
```

---

### Task 3.5: FinancialFilterBar + FinancialViewSwitcher

> ⚠️ **REVISADO 21/07 — duas mudanças obrigatórias.**
>
> **1. O filtro de vencimento é um select próprio, separado do status.** O texto abaixo trata "Atrasados" como preset sobre o status; ele passa a ser um valor do novo controle. A barra tem **dois selects independentes e combináveis**:
> - `Status: todos | Pendente | Pago | Cancelado` → escreve em `filters.status` (`EntryStatus`, nunca `'overdue'`)
> - `Vencimento: todos | Atrasados | Vencem em 7 dias | 8 a 30 dias | Futuros` → escreve em `filters.dueWindow` (`DueWindow`, da Task 1.11)
>
> Os chips removíveis mostram **qual eixo** cada filtro afeta (`Vencimento: atrasados`), e `onApplyPreset('overdue' | 'due7')` passa a setar `dueWindow`. Um select em estado neutro ("todos") **não** deve receber destaque de cor — só fica com a borda cyan quando há valor ativo, senão um filtro vazio parece aplicado.
>
> **2. No PR A o switcher tem 2 opções, não 3.** `FinancialListView` continua sendo `'table' | 'focus' | 'flow'` no tipo, mas o componente renderiza apenas **Tabela** e **Fluxo** — a view Foco é a Task 3.8b, do PR C. Renderize a partir de um array de opções para que o PR C acrescente a terceira sem reescrever o componente.

**Files:**
- Create: `src/components/finance/FinancialFilterBar.tsx`
- Create: `src/components/finance/FinancialViewSwitcher.tsx`

**Interfaces:**
- Consumes: `EntryFilters`, `FinancialType`, `EffectiveStatus`, `PaymentMethod`, `FinancialCategory` (de `@/types/finance`); `useFinancialCategories` (de `@/hooks/useFinancialCategoriesQuery`); `EFFECTIVE_STATUS_META`, `PAYMENT_METHOD_LABELS`, `TYPE_META` (de `@/lib/finance/entryDisplay`); `Input`, `Select`, `Button`, `Badge`, `ToggleGroup`/`ToggleGroupItem` (`@/components/ui/*`); `cn` (`@/lib/utils`).
- Produces:
  - `type FinancialListView = 'table' | 'focus' | 'flow'`
  - Componente `FinancialFilterBar({ filters, onChange, onApplyPreset })` com `onChange: (next: EntryFilters) => void` e `onApplyPreset: (preset: 'overdue' | 'due7') => void`.
  - Componente `FinancialViewSwitcher({ value, onChange })` com `value: FinancialListView`, `onChange: (v: FinancialListView) => void`.

**Steps:**

- [ ] Implementar `src/components/finance/FinancialViewSwitcher.tsx`:

```tsx
/**
 * FinancialViewSwitcher — segmented control Tabela | Foco | Fluxo.
 */

import { Table2, Columns2, Layers } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type FinancialListView = 'table' | 'focus' | 'flow';

interface FinancialViewSwitcherProps {
  value: FinancialListView;
  onChange: (value: FinancialListView) => void;
}

const OPTIONS: Array<{ value: FinancialListView; label: string; icon: typeof Table2 }> = [
  { value: 'table', label: 'Tabela', icon: Table2 },
  { value: 'focus', label: 'Foco', icon: Columns2 },
  { value: 'flow', label: 'Fluxo', icon: Layers },
];

export function FinancialViewSwitcher({ value, onChange }: FinancialViewSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onChange(v as FinancialListView); }}
      className="justify-start"
      aria-label="Modo de visualizacao"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        return (
          <ToggleGroupItem key={opt.value} value={opt.value} aria-label={opt.label} className="gap-1.5">
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{opt.label}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
```

- [ ] Implementar `src/components/finance/FinancialFilterBar.tsx` (busca, natureza, status, categoria, forma, dateField + range; presets Atrasados / A vencer 7d; chips removiveis):

```tsx
/**
 * FinancialFilterBar — filtros da tela de lancamentos.
 * Busca, natureza, status (efetivo), categoria, forma de pagamento e range de datas.
 * Filtros ativos viram chips removiveis. Presets: Atrasados / A vencer 7d.
 */

import { Search, X, AlertTriangle, CalendarClock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useFinancialCategories } from '@/hooks/useFinancialCategoriesQuery';
import {
  EFFECTIVE_STATUS_META, PAYMENT_METHOD_LABELS, TYPE_META,
} from '@/lib/finance/entryDisplay';
import type {
  EntryFilters, FinancialType, EffectiveStatus, PaymentMethod,
} from '@/types/finance';

interface FinancialFilterBarProps {
  filters: EntryFilters;
  onChange: (next: EntryFilters) => void;
  onApplyPreset: (preset: 'overdue' | 'due7') => void;
}

const ALL = '__all__';

const EFFECTIVE_STATUSES: EffectiveStatus[] = ['pending', 'overdue', 'paid', 'canceled'];
const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

export function FinancialFilterBar({ filters, onChange, onApplyPreset }: FinancialFilterBarProps) {
  const { data: categories = [] } = useFinancialCategories();

  const set = (patch: Partial<EntryFilters>) => onChange({ ...filters, ...patch });

  const clearAll = () =>
    onChange({ dateField: filters.dateField ?? 'due' });

  const categoryName = (id?: string) =>
    categories.find((c) => c.id === id)?.name ?? 'Categoria';

  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
  if (filters.type) chips.push({ key: 'type', label: TYPE_META[filters.type].label, onRemove: () => set({ type: undefined }) });
  if (filters.status) chips.push({ key: 'status', label: EFFECTIVE_STATUS_META[filters.status].label, onRemove: () => set({ status: undefined }) });
  if (filters.categoryId) chips.push({ key: 'cat', label: categoryName(filters.categoryId), onRemove: () => set({ categoryId: undefined }) });
  if (filters.paymentMethod) chips.push({ key: 'pm', label: PAYMENT_METHOD_LABELS[filters.paymentMethod], onRemove: () => set({ paymentMethod: undefined }) });
  if (filters.dateFrom) chips.push({ key: 'from', label: `De ${filters.dateFrom}`, onRemove: () => set({ dateFrom: undefined }) });
  if (filters.dateTo) chips.push({ key: 'to', label: `Ate ${filters.dateTo}`, onRemove: () => set({ dateTo: undefined }) });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        {/* Busca */}
        <div className="relative flex-1 lg:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search ?? ''}
            onChange={(e) => set({ search: e.target.value || undefined })}
            placeholder="Buscar por descricao ou contraparte..."
            className="pl-9"
            aria-label="Buscar lancamentos"
          />
        </div>

        {/* Natureza */}
        <Select value={filters.type ?? ALL} onValueChange={(v) => set({ type: v === ALL ? undefined : (v as FinancialType) })}>
          <SelectTrigger className="w-full lg:w-[150px]" aria-label="Natureza"><SelectValue placeholder="Natureza" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as naturezas</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filters.status ?? ALL} onValueChange={(v) => set({ status: v === ALL ? undefined : (v as EffectiveStatus) })}>
          <SelectTrigger className="w-full lg:w-[150px]" aria-label="Status"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os status</SelectItem>
            {EFFECTIVE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{EFFECTIVE_STATUS_META[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Categoria */}
        <Select value={filters.categoryId ?? ALL} onValueChange={(v) => set({ categoryId: v === ALL ? undefined : v })}>
          <SelectTrigger className="w-full lg:w-[170px]" aria-label="Categoria"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Forma de pagamento */}
        <Select value={filters.paymentMethod ?? ALL} onValueChange={(v) => set({ paymentMethod: v === ALL ? undefined : (v as PaymentMethod) })}>
          <SelectTrigger className="w-full lg:w-[170px]" aria-label="Forma de pagamento"><SelectValue placeholder="Forma" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as formas</SelectItem>
            {PAYMENT_METHODS.map((pm) => (
              <SelectItem key={pm} value={pm}>{PAYMENT_METHOD_LABELS[pm]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campo de data + range */}
        <Select value={filters.dateField ?? 'due'} onValueChange={(v) => set({ dateField: v as 'due' | 'competence' })}>
          <SelectTrigger className="w-full lg:w-[150px]" aria-label="Campo de data"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="due">Vencimento</SelectItem>
            <SelectItem value="competence">Competencia</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={filters.dateFrom ?? ''} onChange={(e) => set({ dateFrom: e.target.value || undefined })} className="w-full lg:w-[150px]" aria-label="Data inicial" />
        <Input type="date" value={filters.dateTo ?? ''} onChange={(e) => set({ dateTo: e.target.value || undefined })} className="w-full lg:w-[150px]" aria-label="Data final" />
      </div>

      {/* Presets + chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Presets:</span>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => onApplyPreset('overdue')}>
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Atrasados
        </Button>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => onApplyPreset('due7')}>
          <CalendarClock className="h-3.5 w-3.5 text-amber-600" /> A vencer 7d
        </Button>

        {chips.length > 0 && <div className="mx-1 h-4 w-px bg-border" />}
        {chips.map((chip) => (
          <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
            {chip.label}
            <button
              type="button"
              onClick={chip.onRemove}
              className="rounded-sm hover:bg-muted-foreground/20"
              aria-label={`Remover filtro ${chip.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {chips.length > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearAll}>
            Limpar tudo
          </Button>
        )}
      </div>
    </div>
  );
}
```

- [ ] Rodar lint + typecheck:

```bash
npm run lint && npx tsc --noEmit
```

Saida esperada: sem erros.

- [ ] Commit:

```bash
git add -A && git commit -m "feat(finance): add FinancialFilterBar and view switcher"
```

---

### Task 3.6: FinancialEntrySheet (detalhe compartilhado — anexos, timeline, marcar como pago)

**Files:**
- Create: `src/components/finance/FinancialEntrySheet.tsx`

**Interfaces:**
- Consumes: `FinancialEntry` (de `@/types/finance`); `useFinancialEntry` + `useMarkEntryPaid` + `useCancelEntry` (de `@/hooks/useFinancialEntriesQuery`); `getFinanceService` (de `@/services/finance/financeService`) para `getAttachmentSignedUrl`; `EFFECTIVE_STATUS_META`/`PAYMENT_METHOD_LABELS`/`TYPE_META`/`formatSignedBRL`/`formatCompetencePeriod` (de `@/lib/finance/entryDisplay`); `getEffectiveStatus` (de `@/lib/finance/entryStatus`); `Sheet`/`SheetContent`/`SheetHeader`/`SheetTitle` (`@/components/ui/sheet`); `Button`, `Badge`, `Separator` (`@/components/ui/*`); `formatBRL`, `formatDateBR` (`@/lib/formatters`); `toast` (sonner); `Link` (react-router-dom); `useNavigate`.
- Produces: Componente `FinancialEntrySheet({ entryId, open, onOpenChange })` com `entryId: string | null`, `open: boolean`, `onOpenChange: (open: boolean) => void`.

**Steps:**

- [ ] Implementar `src/components/finance/FinancialEntrySheet.tsx`:

```tsx
/**
 * FinancialEntrySheet — painel de detalhe compartilhado por todas as views.
 * Mostra todos os campos, anexos (signed URL sob demanda), timeline e
 * acoes "Marcar como pago" / "Cancelar".
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ExternalLink, Loader2, CheckCircle2, Ban, Pencil, Paperclip,
} from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatBRL, formatDateBR } from '@/lib/formatters';
import {
  EFFECTIVE_STATUS_META, PAYMENT_METHOD_LABELS, TYPE_META,
  formatSignedBRL, formatCompetencePeriod,
} from '@/lib/finance/entryDisplay';
import { getEffectiveStatus } from '@/lib/finance/entryStatus';
import { useFinancialEntry, useMarkEntryPaid, useCancelEntry } from '@/hooks/useFinancialEntriesQuery';
import { getFinanceService } from '@/services/finance/financeService';
import type { FinancialEntry } from '@/types/finance';

interface FinancialEntrySheetProps {
  entryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

export function FinancialEntrySheet({ entryId, open, onOpenChange }: FinancialEntrySheetProps) {
  const navigate = useNavigate();
  const { data: entry, isLoading } = useFinancialEntry(entryId ?? '');
  const markPaid = useMarkEntryPaid();
  const cancelEntry = useCancelEntry();
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  const handleOpenAttachment = async (storagePath: string) => {
    setOpeningPath(storagePath);
    try {
      const svc = await getFinanceService();
      const url = await svc.getAttachmentSignedUrl(storagePath);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Nao foi possivel abrir o anexo.');
    } finally {
      setOpeningPath(null);
    }
  };

  const handleMarkPaid = async (e: FinancialEntry) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await markPaid.mutateAsync({ id: e.id, paidDate: today, paymentMethod: e.paymentMethod });
      toast.success('Lancamento marcado como pago.');
    } catch {
      toast.error('Erro ao marcar como pago.');
    }
  };

  const handleCancel = async (e: FinancialEntry) => {
    try {
      await cancelEntry.mutateAsync(e.id);
      toast.success('Lancamento cancelado.');
    } catch {
      toast.error('Erro ao cancelar lancamento.');
    }
  };

  const effective = entry ? getEffectiveStatus(entry) : null;
  const statusMeta = effective ? EFFECTIVE_STATUS_META[effective] : null;
  const StatusIcon = statusMeta?.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {isLoading || !entry ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <SheetHeader className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                {statusMeta && StatusIcon && (
                  <Badge variant="outline" className={`gap-1 border-0 ${statusMeta.className}`}>
                    <StatusIcon className="h-3 w-3" />{statusMeta.label}
                  </Badge>
                )}
                <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
                  {TYPE_META[entry.type].label}
                </Badge>
              </div>
              <SheetTitle className="text-lg">{entry.description}</SheetTitle>
              <div className={`text-2xl font-bold tabular-nums ${TYPE_META[entry.type].amountClass}`}>
                {formatSignedBRL(entry.type, entry.amount)}
              </div>
            </SheetHeader>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field label="Categoria">{entry.categoryName ?? '—'}</Field>
              <Field label="Contraparte">{entry.counterpartyName ?? '—'}</Field>
              <Field label="Forma de pagamento">{entry.paymentMethod ? PAYMENT_METHOD_LABELS[entry.paymentMethod] : '—'}</Field>
              <Field label="Competencia">{formatCompetencePeriod(entry.competenceDate)}</Field>
              <Field label="Vencimento">{formatDateBR(entry.dueDate)}</Field>
              <Field label="Pagamento">{entry.paidDate ? formatDateBR(entry.paidDate) : '—'}</Field>
              {entry.installmentTotal && entry.installmentTotal > 1 && (
                <Field label="Parcela">{entry.installmentNumber}/{entry.installmentTotal}</Field>
              )}
            </div>

            {entry.notes && (
              <>
                <Separator className="my-4" />
                <Field label="Observacoes">{entry.notes}</Field>
              </>
            )}

            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" /> Anexos
              </div>
              {(entry.attachments?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum anexo.</p>
              ) : (
                <ul className="space-y-1.5">
                  {entry.attachments!.map((att) => (
                    <li key={att.id}>
                      <button
                        type="button"
                        onClick={() => handleOpenAttachment(att.storagePath)}
                        disabled={openingPath === att.storagePath}
                        className="flex w-full items-center gap-2 rounded-md border border-border p-2 text-left text-sm hover:bg-muted/50 disabled:opacity-60"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{att.fileName}</span>
                        {openingPath === att.storagePath
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Linha do tempo</div>
              <ol className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Criado em {formatDateBR(entry.createdAt)}
                </li>
                {entry.paidDate && (
                  <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Pago em {formatDateBR(entry.paidDate)}
                  </li>
                )}
                {effective === 'overdue' && (
                  <li className="flex items-center gap-2 text-destructive">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    Vencido desde {formatDateBR(entry.dueDate)}
                  </li>
                )}
              </ol>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {entry.status === 'pending' && (
                <Button onClick={() => handleMarkPaid(entry)} disabled={markPaid.isPending} className="gap-2">
                  {markPaid.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Marcar como pago
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => navigate(`/admin/financeiro/lancamentos/${entry.id}`)}
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
                {entry.status !== 'canceled' && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-destructive hover:text-destructive"
                    onClick={() => handleCancel(entry)}
                    disabled={cancelEntry.isPending}
                  >
                    {cancelEntry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] Rodar lint + typecheck:

```bash
npm run lint && npx tsc --noEmit
```

Saida esperada: sem erros.

- [ ] Commit:

```bash
git add -A && git commit -m "feat(finance): add FinancialEntrySheet detail panel"
```

---

### Task 3.7: FinancialBulkActionBar + FinancialEntriesTable (view A, default)

**Files:**
- Create: `src/components/finance/FinancialBulkActionBar.tsx`
- Create: `src/components/finance/FinancialEntriesTable.tsx`

**Interfaces:**
- Consumes: `FinancialEntry` (de `@/types/finance`); `getEffectiveStatus` (de `@/lib/finance/entryStatus`); `EFFECTIVE_STATUS_META`/`PAYMENT_METHOD_LABELS`/`TYPE_META`/`formatSignedBRL`/`formatCompetencePeriod` (de `@/lib/finance/entryDisplay`); `formatBRL`/`formatDateBR` (`@/lib/formatters`); `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` + `Checkbox` + `DropdownMenu*` + `Button` + `Badge` (`@/components/ui/*`); `cn` (`@/lib/utils`); `AlertDialog*` (`@/components/ui/alert-dialog`).
- Produces:
  - Componente `FinancialBulkActionBar({ selectedCount, onBulkMarkPaid, onBulkCancel, onClearSelection })` com handlers `() => Promise<void>`.
  - Componente `FinancialEntriesTable({ entries, isLoading, selectedIds, onToggleSelect, onToggleAll, onRowClick, onMarkPaid, onCancel })` produzindo `onRowClick: (id: string) => void`, `onMarkPaid: (id: string) => void`, `onCancel: (id: string) => void`.

**Steps:**

- [ ] Implementar `src/components/finance/FinancialBulkActionBar.tsx` (copia do padrao de `InvitationBulkActionBar`):

```tsx
/**
 * FinancialBulkActionBar — toolbar flutuante de acoes em massa.
 * Marcar como pago (em lote) e Cancelar (em lote, com confirmacao).
 */

import { useState } from 'react';
import { CheckCircle2, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FinancialBulkActionBarProps {
  selectedCount: number;
  onBulkMarkPaid: () => Promise<void>;
  onBulkCancel: () => Promise<void>;
  onClearSelection: () => void;
}

export function FinancialBulkActionBar({
  selectedCount, onBulkMarkPaid, onBulkCancel, onClearSelection,
}: FinancialBulkActionBarProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (selectedCount === 0) return null;

  const handlePay = async () => {
    setIsPaying(true);
    try { await onBulkMarkPaid(); } finally { setIsPaying(false); }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCancelling(true);
    try { await onBulkCancel(); } finally { setIsCancelling(false); }
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-5 py-3 shadow-lg backdrop-blur-md"
      role="toolbar"
      aria-label="Acoes em lote"
    >
      <span className="text-sm font-medium">
        {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
      </span>
      <div className="h-4 w-px bg-border" />
      <Button variant="outline" size="sm" onClick={handlePay} disabled={isPaying || isCancelling} className="gap-1.5">
        {isPaying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        Marcar como pago
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPaying || isCancelling} className="gap-1.5">
            {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
            Cancelar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar {selectedCount} lancamento{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Os lancamentos selecionados serao marcados como cancelados e deixarao de contar no fluxo de caixa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar lancamentos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="h-4 w-px bg-border" />
      <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-xs text-muted-foreground">
        Limpar selecao
      </Button>
    </div>
  );
}
```

- [ ] Implementar `src/components/finance/FinancialEntriesTable.tsx` (shadcn Table, header sticky, totais, regua vermelha em atrasados, colunas responsivas, menu `...`):

```tsx
/**
 * FinancialEntriesTable — view A (Tabela, default).
 * Header sticky, rodape de totais, regua vermelha (border-left) em atrasados,
 * colunas responsivas (forma/competencia escondem abaixo de md), menu por linha.
 */

import { MoreHorizontal, CheckCircle2, Ban, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBRL, formatDateBR } from '@/lib/formatters';
import { getEffectiveStatus } from '@/lib/finance/entryStatus';
import {
  EFFECTIVE_STATUS_META, PAYMENT_METHOD_LABELS, TYPE_META,
  formatSignedBRL, formatCompetencePeriod,
} from '@/lib/finance/entryDisplay';
import type { FinancialEntry } from '@/types/finance';

interface FinancialEntriesTableProps {
  entries: FinancialEntry[];
  isLoading?: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onRowClick: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onCancel: (id: string) => void;
}

export function FinancialEntriesTable({
  entries, isLoading, selectedIds, onToggleSelect, onToggleAll, onRowClick, onMarkPaid, onCancel,
}: FinancialEntriesTableProps) {
  const allSelected = entries.length > 0 && selectedIds.length === entries.length;

  const totalIncome = entries.filter((e) => e.type === 'income' && e.status !== 'canceled').reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter((e) => e.type === 'expense' && e.status !== 'canceled').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={onToggleAll} aria-label="Selecionar todos" />
            </TableHead>
            <TableHead>Descricao</TableHead>
            <TableHead className="hidden md:table-cell">Categoria</TableHead>
            <TableHead className="hidden lg:table-cell">Forma</TableHead>
            <TableHead className="hidden lg:table-cell">Competencia</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-12 text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={9} className="py-8">
                <Skeleton className="h-5 w-full" />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                Nenhum lancamento encontrado com os filtros aplicados.
              </TableCell>
            </TableRow>
          )}
          {!isLoading && entries.map((entry) => {
            const effective = getEffectiveStatus(entry);
            const statusMeta = EFFECTIVE_STATUS_META[effective];
            const StatusIcon = statusMeta.icon;
            const isSelected = selectedIds.includes(entry.id);
            return (
              <TableRow
                key={entry.id}
                data-state={isSelected ? 'selected' : undefined}
                className={cn(
                  'cursor-pointer',
                  effective === 'overdue' && 'border-l-2 border-l-destructive',
                )}
                onClick={() => onRowClick(entry.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(entry.id)}
                    aria-label={`Selecionar ${entry.description}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{entry.description}</div>
                    {entry.counterpartyName && (
                      <div className="truncate text-xs text-muted-foreground">{entry.counterpartyName}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{entry.categoryName ?? '—'}</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {entry.paymentMethod ? PAYMENT_METHOD_LABELS[entry.paymentMethod] : '—'}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground tabular-nums">{formatCompetencePeriod(entry.competenceDate)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm tabular-nums">{formatDateBR(entry.dueDate)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('gap-1 border-0 text-xs font-medium', statusMeta.className)}>
                    <StatusIcon className="h-3 w-3" />{statusMeta.label}
                  </Badge>
                </TableCell>
                <TableCell className={cn('text-right font-semibold tabular-nums', TYPE_META[entry.type].amountClass)}>
                  {formatSignedBRL(entry.type, entry.amount)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acoes</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {entry.status === 'pending' && (
                        <DropdownMenuItem onClick={() => onMarkPaid(entry.id)}>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Marcar como pago
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/financeiro/lancamentos/${entry.id}`}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </Link>
                      </DropdownMenuItem>
                      {entry.status !== 'canceled' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => onCancel(entry.id)}>
                            <Ban className="mr-2 h-4 w-4" /> Cancelar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        {!isLoading && entries.length > 0 && (
          <tfoot className="border-t border-border bg-muted/30">
            <tr>
              <td colSpan={7} className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                Totais (exclui cancelados)
              </td>
              <td className="px-4 py-2 text-right text-sm font-bold tabular-nums">
                <span className="text-emerald-600 dark:text-emerald-400">+ {formatBRL(totalIncome)}</span>
                {' / '}
                <span className="text-red-600 dark:text-red-400">- {formatBRL(totalExpense)}</span>
              </td>
              <td />
            </tr>
          </tfoot>
        )}
      </Table>
    </div>
  );
}
```

- [ ] Rodar lint + typecheck:

```bash
npm run lint && npx tsc --noEmit
```

Saida esperada: sem erros.

- [ ] Commit:

```bash
git add -A && git commit -m "feat(finance): add bulk action bar and entries table view"
```

---

### Task 3.8: ~~MasterDetail (view B) + Grouped (view C)~~ → DIVIDIDA em 3.8a e 3.8b

> ⚠️ **DIVIDIDA em 22/07.** Esta task entregava as duas views numa só, mas elas caem em PRs diferentes. Execute **apenas a parte correspondente ao PR em curso**:
>
> **`3.8a` — view Fluxo (`FinancialEntriesGrouped`) · PR A.** Use as instruções de `FinancialEntriesGrouped` abaixo, com duas correções:
> - As seções são **Atrasados / A vencer 7d / 8–30d / Pagos / Cancelados** — a seção "Cancelados" é obrigatória. Sem ela um lançamento cancelado não pertence a faixa nenhuma e **some** desta view, fazendo a contagem divergir da Tabela.
> - A classificação vem de `dueWindowOf()` (Task 1.11), não de lógica local. "Pagos" e "Cancelados" são as duas seções onde `dueWindowOf` retorna `null`, separadas por `status`. "Pagos" e "Cancelados" nascem recolhidas.
> - É view de **leitura**: sem checkbox de seleção e sem menu `...` por linha.
>
> **`3.8b` — view Foco (`FinancialEntriesMasterDetail`) · PR C.** Use as instruções de `FinancialEntriesMasterDetail` abaixo, com uma correção: **o `FinancialEntrySheet` não abre nesta view.** Foco é um modo de conciliação por teclado — `J`/`K` navegam, `↵` dá baixa **e avança para o próximo item**, e os atalhos aparecem na tela como `<kbd>`. Se o Sheet abrisse aqui também, a view seria "um Sheet que não fecha" e não justificaria seu custo.

**Files:**
- Create: `src/components/finance/FinancialEntriesMasterDetail.tsx`
- Create: `src/components/finance/FinancialEntriesGrouped.tsx`

**Interfaces:**
- Consumes: `FinancialEntry` (de `@/types/finance`); `getEffectiveStatus`/`bucketForEntry`/`DueBucket` (de `@/lib/finance/entryStatus`); `EFFECTIVE_STATUS_META`/`TYPE_META`/`formatSignedBRL` (de `@/lib/finance/entryDisplay`); `formatBRL`/`formatDateBR` (`@/lib/formatters`); `FinancialEntrySheet` (de `@/components/finance/FinancialEntrySheet`) **nao** — o detalhe da view B e inline; o Sheet e do container; `Accordion*` (`@/components/ui/accordion`); `Checkbox`, `Badge`, `Button`, `Card`/`CardContent` (`@/components/ui/*`); `cn` (`@/lib/utils`).
- Produces:
  - Componente `FinancialEntriesMasterDetail({ entries, isLoading, selectedId, onSelect })` com `selectedId: string | null`, `onSelect: (id: string) => void` (master-detail interno; o painel direito reaproveita o detalhe leve).
  - Componente `FinancialEntriesGrouped({ entries, isLoading, selectedIds, onToggleSelect, onRowClick })` (secoes por vencimento via `bucketForEntry`; "Pagos" recolhida por padrao).

**Steps:**

- [ ] Implementar `src/components/finance/FinancialEntriesMasterDetail.tsx`:

```tsx
/**
 * FinancialEntriesMasterDetail — view B (Foco).
 * Lista enxuta a esquerda + painel de detalhe leve a direita para
 * conciliacao item-a-item. Em telas estreitas vira lista (detalhe via Sheet).
 */

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateBR } from '@/lib/formatters';
import { getEffectiveStatus } from '@/lib/finance/entryStatus';
import {
  EFFECTIVE_STATUS_META, PAYMENT_METHOD_LABELS, TYPE_META,
  formatSignedBRL, formatCompetencePeriod,
} from '@/lib/finance/entryDisplay';
import type { FinancialEntry } from '@/types/finance';

interface FinancialEntriesMasterDetailProps {
  entries: FinancialEntry[];
  isLoading?: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function FinancialEntriesMasterDetail({
  entries, isLoading, selectedId, onSelect,
}: FinancialEntriesMasterDetailProps) {
  const selected = entries.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
      {/* Master list */}
      <div className="space-y-1.5 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
        {isLoading && <Skeleton className="h-16 w-full" />}
        {!isLoading && entries.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">Nenhum lancamento.</p>
        )}
        {!isLoading && entries.map((entry) => {
          const effective = getEffectiveStatus(entry);
          const statusMeta = EFFECTIVE_STATUS_META[effective];
          const active = entry.id === selectedId;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                effective === 'overdue' && 'border-l-2 border-l-destructive',
                active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{entry.description}</div>
                <div className="truncate text-xs text-muted-foreground">
                  Vence {formatDateBR(entry.dueDate)}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={cn('text-sm font-semibold tabular-nums', TYPE_META[entry.type].amountClass)}>
                  {formatSignedBRL(entry.type, entry.amount)}
                </span>
                <Badge variant="outline" className={cn('border-0 text-[10px]', statusMeta.className)}>
                  {statusMeta.label}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail */}
      <Card className="hidden lg:block">
        <CardContent className="p-5">
          {!selected ? (
            <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
              Selecione um lancamento para ver os detalhes.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground">{TYPE_META[selected.type].label}</div>
                <h3 className="text-lg font-semibold text-foreground">{selected.description}</h3>
                <div className={cn('text-2xl font-bold tabular-nums', TYPE_META[selected.type].amountClass)}>
                  {formatSignedBRL(selected.type, selected.amount)}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-muted-foreground">Categoria</dt><dd className="font-medium">{selected.categoryName ?? '—'}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Contraparte</dt><dd className="font-medium">{selected.counterpartyName ?? '—'}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Forma</dt><dd className="font-medium">{selected.paymentMethod ? PAYMENT_METHOD_LABELS[selected.paymentMethod] : '—'}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Competencia</dt><dd className="font-medium tabular-nums">{formatCompetencePeriod(selected.competenceDate)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Vencimento</dt><dd className="font-medium tabular-nums">{formatDateBR(selected.dueDate)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Pagamento</dt><dd className="font-medium tabular-nums">{selected.paidDate ? formatDateBR(selected.paidDate) : '—'}</dd></div>
              </dl>
              {selected.notes && (
                <div><div className="text-xs text-muted-foreground">Observacoes</div><p className="text-sm">{selected.notes}</p></div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] Implementar `src/components/finance/FinancialEntriesGrouped.tsx` (secoes por vencimento via Accordion; "Pagos" recolhida por padrao):

```tsx
/**
 * FinancialEntriesGrouped — view C (Fluxo).
 * Secoes por vencimento: Atrasados / A vencer 7d / 8-30d / Pagos.
 * Cada secao com mini-total e contador; "Pagos" recolhida por padrao.
 */

import { cn } from '@/lib/utils';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBRL, formatDateBR } from '@/lib/formatters';
import { bucketForEntry, getEffectiveStatus, type DueBucket } from '@/lib/finance/entryStatus';
import {
  EFFECTIVE_STATUS_META, TYPE_META, formatSignedBRL,
} from '@/lib/finance/entryDisplay';
import type { FinancialEntry } from '@/types/finance';

interface FinancialEntriesGroupedProps {
  entries: FinancialEntry[];
  isLoading?: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onRowClick: (id: string) => void;
}

const SECTIONS: Array<{ bucket: DueBucket | 'other'; title: string; accent: string }> = [
  { bucket: 'overdue', title: 'Atrasados', accent: 'text-destructive' },
  { bucket: 'due7', title: 'A vencer (7 dias)', accent: 'text-amber-600 dark:text-amber-400' },
  { bucket: 'due8to30', title: 'A vencer (8-30 dias)', accent: 'text-foreground' },
  { bucket: 'other', title: 'Demais pendentes', accent: 'text-muted-foreground' },
  { bucket: 'paid', title: 'Pagos', accent: 'text-emerald-600 dark:text-emerald-400' },
];

export function FinancialEntriesGrouped({
  entries, isLoading, selectedIds, onToggleSelect, onRowClick,
}: FinancialEntriesGroupedProps) {
  if (isLoading) return <Skeleton className="h-40 w-full" />;

  const grouped = new Map<string, FinancialEntry[]>();
  for (const e of entries) {
    const b = bucketForEntry(e);
    const arr = grouped.get(b) ?? [];
    arr.push(e);
    grouped.set(b, arr);
  }

  // Abertas por padrao: tudo menos "paid".
  const defaultOpen = SECTIONS
    .filter((s) => s.bucket !== 'paid' && (grouped.get(s.bucket)?.length ?? 0) > 0)
    .map((s) => s.bucket as string);

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-2">
      {SECTIONS.map((section) => {
        const items = grouped.get(section.bucket) ?? [];
        if (items.length === 0) return null;
        const total = items.reduce((s, e) => s + (e.type === 'income' ? e.amount : -e.amount), 0);
        return (
          <AccordionItem key={section.bucket} value={section.bucket} className="rounded-lg border border-border px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-3">
                <span className={cn('text-sm font-semibold', section.accent)}>
                  {section.title}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {items.length} item{items.length > 1 ? 's' : ''}
                  </span>
                </span>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">{formatBRL(total)}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5 pb-2">
                {items.map((entry) => {
                  const statusMeta = EFFECTIVE_STATUS_META[getEffectiveStatus(entry)];
                  const isSelected = selectedIds.includes(entry.id);
                  return (
                    <li
                      key={entry.id}
                      className={cn(
                        'flex items-center gap-3 rounded-md border border-transparent p-2 hover:bg-muted/50',
                        entry.id && 'cursor-pointer',
                      )}
                    >
                      <span onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelect(entry.id)}
                          aria-label={`Selecionar ${entry.description}`}
                        />
                      </span>
                      <button
                        type="button"
                        onClick={() => onRowClick(entry.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">{entry.description}</div>
                          <div className="truncate text-xs text-muted-foreground">Vence {formatDateBR(entry.dueDate)}</div>
                        </div>
                        <Badge variant="outline" className={cn('border-0 text-[10px]', statusMeta.className)}>{statusMeta.label}</Badge>
                        <span className={cn('shrink-0 text-sm font-semibold tabular-nums', TYPE_META[entry.type].amountClass)}>
                          {formatSignedBRL(entry.type, entry.amount)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
```

- [ ] Rodar lint + typecheck:

```bash
npm run lint && npx tsc --noEmit
```

Saida esperada: sem erros.

- [ ] Commit:

```bash
git add -A && git commit -m "feat(finance): add master-detail and grouped entry views"
```

---

### Task 3.9: Container FinancialEntries (orquestracao das 3 views, filtros, selecao, Sheet, bulk)

**Files:**
- Modify: `src/pages/admin/FinancialEntries.tsx` (reescreve o stub da Task 3.1)

**Interfaces:**
- Consumes: `useFinancialEntries`/`useMarkEntryPaid`/`useCancelEntry`/`useBulkMarkPaid` (de `@/hooks/useFinancialEntriesQuery`); `EntryFilters`, `FinancialEntry` (de `@/types/finance`); `PaginatedResult`, `PaginationConfig`, `SortConfig` (de `@/services/types`); `FinancialKpiHeader`, `FinancialFilterBar`, `FinancialViewSwitcher` (+ `FinancialListView`), `FinancialEntriesTable`, `FinancialEntriesMasterDetail`, `FinancialEntriesGrouped`, `FinancialEntrySheet`, `FinancialBulkActionBar` (de `@/components/finance/*`); `DashboardLayout`, `PageHeader`, `AdminTabNav`; `Button` + `Plus` icon; `useNavigate`; `toast`.
- Produces: pagina `/admin/financeiro/lancamentos` funcional com view persistida em `localStorage('finance:listView')` (default `'table'`), filtros/presets, paginacao, selecao, Sheet de detalhe e bulk bar.

**Steps:**

- [ ] Reescrever `src/pages/admin/FinancialEntries.tsx` por completo:

```tsx
/**
 * FinancialEntries page — lista de lancamentos com 3 visualizacoes (Tabela / Foco / Fluxo).
 * Container: carrega dados (paginado/filtrado), mantem filtros + view (localStorage)
 * + selecao; abre Sheet de detalhe; expoe acoes em massa.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Button } from '@/components/ui/button';
import { FinancialKpiHeader } from '@/components/finance/FinancialKpiHeader';
import { FinancialFilterBar } from '@/components/finance/FinancialFilterBar';
import { FinancialViewSwitcher, type FinancialListView } from '@/components/finance/FinancialViewSwitcher';
import { FinancialEntriesTable } from '@/components/finance/FinancialEntriesTable';
import { FinancialEntriesMasterDetail } from '@/components/finance/FinancialEntriesMasterDetail';
import { FinancialEntriesGrouped } from '@/components/finance/FinancialEntriesGrouped';
import { FinancialEntrySheet } from '@/components/finance/FinancialEntrySheet';
import { FinancialBulkActionBar } from '@/components/finance/FinancialBulkActionBar';
import {
  useFinancialEntries, useMarkEntryPaid, useCancelEntry, useBulkMarkPaid,
} from '@/hooks/useFinancialEntriesQuery';
import { addDays } from '@/lib/finance/dateUtils';
import type { EntryFilters } from '@/types/finance';
import type { PaginationConfig } from '@/services/types';

const VIEW_STORAGE_KEY = 'finance:listView';
const PAGE_SIZE = 50;

function loadView(): FinancialListView {
  const v = typeof window !== 'undefined' ? window.localStorage.getItem(VIEW_STORAGE_KEY) : null;
  return v === 'focus' || v === 'flow' ? v : 'table';
}

export default function FinancialEntries() {
  const navigate = useNavigate();

  const [view, setView] = useState<FinancialListView>(loadView);
  const [filters, setFilters] = useState<EntryFilters>({ dateField: 'due' });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const pagination: PaginationConfig = useMemo(() => ({ page, pageSize: PAGE_SIZE }), [page]);
  const { data, isLoading } = useFinancialEntries(filters, pagination);
  const entries = data?.data ?? [];

  const markPaid = useMarkEntryPaid();
  const cancelEntry = useCancelEntry();
  const bulkMarkPaid = useBulkMarkPaid();

  // Persist view
  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  // Reset selection/page when filters change
  useEffect(() => {
    setSelectedIds([]);
    setPage(1);
  }, [filters]);

  const handleApplyPreset = useCallback((preset: 'overdue' | 'due7') => {
    const today = new Date().toISOString().slice(0, 10);
    if (preset === 'overdue') {
      setFilters({ dateField: 'due', status: 'overdue' });
    } else {
      setFilters({ dateField: 'due', status: 'pending', dateFrom: today, dateTo: addDays(today, 7) });
    }
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => prev.length === entries.length ? [] : entries.map((e) => e.id));
  }, [entries]);

  const handleRowClick = useCallback((id: string) => {
    setSheetId(id);
  }, []);

  const handleMarkPaid = useCallback(async (id: string) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await markPaid.mutateAsync({ id, paidDate: today });
      toast.success('Lancamento marcado como pago.');
    } catch {
      toast.error('Erro ao marcar como pago.');
    }
  }, [markPaid]);

  const handleCancel = useCallback(async (id: string) => {
    try {
      await cancelEntry.mutateAsync(id);
      toast.success('Lancamento cancelado.');
    } catch {
      toast.error('Erro ao cancelar lancamento.');
    }
  }, [cancelEntry]);

  const handleBulkMarkPaid = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const count = await bulkMarkPaid.mutateAsync({ ids: selectedIds, paidDate: today });
      toast.success(`${count} lancamento${count === 1 ? '' : 's'} marcado${count === 1 ? '' : 's'} como pago.`);
      setSelectedIds([]);
    } catch {
      toast.error('Erro ao marcar lancamentos como pagos.');
    }
  }, [bulkMarkPaid, selectedIds]);

  const handleBulkCancel = useCallback(async () => {
    try {
      for (const id of selectedIds) {
        await cancelEntry.mutateAsync(id);
      }
      toast.success(`${selectedIds.length} lancamento${selectedIds.length === 1 ? '' : 's'} cancelado${selectedIds.length === 1 ? '' : 's'}.`);
      setSelectedIds([]);
    } catch {
      toast.error('Erro ao cancelar lancamentos.');
    }
  }, [cancelEntry, selectedIds]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Lancamentos"
          description="Receitas e despesas avulsas, contas a pagar e a receber."
          actions={
            <Button onClick={() => navigate('/admin/financeiro/lancamentos/novo')} className="gap-2">
              <Plus className="h-4 w-4" /> Novo lancamento
            </Button>
          }
        />
        <AdminTabNav />

        <FinancialKpiHeader entries={entries} isLoading={isLoading} onSelectPreset={handleApplyPreset} />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <FinancialFilterBar filters={filters} onChange={setFilters} onApplyPreset={handleApplyPreset} />
          </div>
          <FinancialViewSwitcher value={view} onChange={setView} />
        </div>

        {view === 'table' && (
          <FinancialEntriesTable
            entries={entries}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            onRowClick={handleRowClick}
            onMarkPaid={handleMarkPaid}
            onCancel={handleCancel}
          />
        )}
        {view === 'focus' && (
          <FinancialEntriesMasterDetail
            entries={entries}
            isLoading={isLoading}
            selectedId={focusedId}
            onSelect={(id) => { setFocusedId(id); setSheetId(id); }}
          />
        )}
        {view === 'flow' && (
          <FinancialEntriesGrouped
            entries={entries}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onRowClick={handleRowClick}
          />
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Proxima
            </Button>
          </div>
        )}
      </div>

      <FinancialEntrySheet
        entryId={sheetId}
        open={sheetId !== null}
        onOpenChange={(o) => { if (!o) setSheetId(null); }}
      />

      <FinancialBulkActionBar
        selectedCount={selectedIds.length}
        onBulkMarkPaid={handleBulkMarkPaid}
        onBulkCancel={handleBulkCancel}
        onClearSelection={() => setSelectedIds([])}
      />
    </DashboardLayout>
  );
}
```

- [ ] Criar o helper de data puro `src/lib/finance/dateUtils.ts` usado pelos presets (somar dias em string YYYY-MM-DD, local):

```ts
/**
 * Utilitarios puros de data para o modulo financeiro (date-only, local).
 */

/** Soma N dias a uma data YYYY-MM-DD e retorna no mesmo formato. */
export function addDays(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  base.setDate(base.getDate() + days);
  const yy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const dd = String(base.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
```

- [ ] Escrever teste falhando `src/lib/finance/dateUtils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { addDays } from './dateUtils';

describe('addDays', () => {
  it('soma dias dentro do mes', () => {
    expect(addDays('2026-06-17', 7)).toBe('2026-06-24');
  });
  it('atravessa virada de mes', () => {
    expect(addDays('2026-06-28', 7)).toBe('2026-07-05');
  });
  it('aceita zero', () => {
    expect(addDays('2026-06-17', 0)).toBe('2026-06-17');
  });
});
```

- [ ] Rodar e ver passar (a implementacao ja existe; valida o comportamento):

```bash
npm run test -- src/lib/finance/dateUtils.test.ts
```

Saida esperada: `3 passed`.

- [ ] Rodar lint + typecheck do conjunto:

```bash
npm run lint && npx tsc --noEmit
```

Saida esperada: sem erros.

- [ ] Commit:

```bash
git add -A && git commit -m "feat(finance): wire FinancialEntries container with 3 views and bulk actions"
```

---

### Task 3.10: Verificacao visual ponta-a-ponta e empty states

**Files:**
- Modify: `src/pages/admin/FinancialEntries.tsx` (apenas se a verificacao revelar ajuste; sem mudanca estrutural)

**Interfaces:**
- Consumes: tudo das tasks anteriores.
- Produces: confirmacao visual de que as 3 views, KPIs, filtros, presets, Sheet, selecao e bulk bar funcionam na porta 3000; nenhuma nova interface.

**Steps:**

- [ ] Subir o dev server:

```bash
npm run dev
```

Saida esperada: `Local: http://localhost:3000/`.

- [ ] Logar como `admin@recrutars.com` / `Admin@123` e abrir `http://localhost:3000/admin/financeiro/lancamentos`. Observar (view **Tabela** default): KPIs no topo (Saldo, Entradas, Saidas, Vencido, A vencer 7d); tabela com header sticky ao rolar; linhas atrasadas com regua vermelha (`border-l-destructive`); rodape de totais (verde `+` / vermelho `-`); valores `tabular-nums` alinhados a direita. Se nao houver lancamentos ainda (Fase 4 cria o formulario), confirmar o empty state "Nenhum lancamento encontrado com os filtros aplicados.".

- [ ] Clicar no card KPI **Vencido**: o filtro deve aplicar o preset (status Atrasado) e aparecer o chip removivel correspondente na barra de filtros. Clicar no `X` do chip remove o filtro.

- [ ] Trocar para a view **Foco** no switcher: confirmar layout master-detail (lista a esquerda, painel a direita em telas largas); recarregar a pagina e confirmar que a view **Foco** persiste (localStorage `finance:listView`). Trocar para **Fluxo**: confirmar secoes Atrasados / A vencer (7 dias) / A vencer (8-30 dias) / Demais pendentes / Pagos, com a secao **Pagos** recolhida por padrao e cada secao mostrando contador + mini-total.

- [ ] Selecionar 1+ linhas via checkbox (view Tabela ou Fluxo): confirmar que a `FinancialBulkActionBar` aparece flutuante no rodape com "N selecionado(s)", "Marcar como pago" e "Cancelar"; "Limpar selecao" zera a selecao e esconde a barra. (As mutacoes em si dependem de dados reais; se houver dados, validar o toast de sucesso.)

- [ ] Clicar em uma linha (qualquer view): confirmar abertura do `FinancialEntrySheet` a direita com todos os campos, secao de anexos, linha do tempo e botoes "Marcar como pago" (so se pendente) / "Editar" / "Cancelar". Fechar o Sheet (overlay ou X) e confirmar que `sheetId` reseta.

- [ ] Redimensionar para largura mobile (<768px) via DevTools: confirmar que a tabela faz `overflow-x-auto` (scroll horizontal) e que colunas `hidden md:table-cell`/`hidden lg:table-cell` (Categoria/Forma/Competencia) desaparecem; o switcher mostra so icones (labels `hidden sm:inline`).

- [ ] Conferir o console do navegador: nenhum erro/warning de React (chaves duplicadas, controlled/uncontrolled, etc.).

- [ ] Rodar a suite completa de testes puros + lint + typecheck uma ultima vez:

```bash
npm run test && npm run lint && npx tsc --noEmit
```

Saida esperada: todos os testes passando; sem erros de lint/typecheck.

- [ ] Commit final da fase (mesmo que seja apenas um ajuste menor ou um no-op de verificacao registrado no historico via `--allow-empty` se nada mudou):

```bash
git add -A && git commit -m "test(finance): verify entries list views, filters, sheet and bulk actions" --allow-empty
```


---

## Fase 4: Formulario de lancamento (FormBody + upload + parcelamento + recorrencia)

Esta fase constroi a camada de formulario de lancamentos financeiros. Ela **consome** os tipos (`src/types/finance.ts`), o util puro (`src/lib/finance/installments.ts`), os servicos (`getFinanceService`, `getFinancialCategoriesService`) e os hooks React Query (`useCreateEntry`, `useUpdateEntry`, `useUploadAttachment`, `useFinancialCategories`, `useFinancialEntry`) entregues nas Fases 1-3, alem das rotas `/admin/financeiro/lancamentos/novo` e `/:id` ja registradas na Fase 3 (apontando para `FinancialEntryNew`/`FinancialEntryEdit`, que esta fase implementa de fato).

**Pre-condicoes (de fases anteriores):**
- `src/types/finance.ts` exporta: `FinancialType`, `EntryStatus`, `PaymentMethod`, `RecurrenceFrequency`, `AttachmentKind`, `FinancialEntry`, `FinancialAttachment`, `InstallmentItem`.
- `src/lib/finance/installments.ts` exporta `calcInstallments(totalCents, count, firstDueDateISO, frequency, intervalN): InstallmentItem[]` (TDD via Vitest na Fase 2).
- `src/hooks/useFinancialEntriesQuery.ts` exporta `useFinancialEntry(id)`, `useCreateEntry()`, `useUpdateEntry()`, `useUploadAttachment()`.
- `src/hooks/useFinancialCategoriesQuery.ts` exporta `useFinancialCategories(type?)`.
- `IFinanceService.createEntryWithInstallments(base, items)` e `createRecurrence(input)` existem.
- Vitest configurado (Fase 1): `npm run test` roda specs.

**Verificacao desta fase:** TDD real para helpers puros de recorrencia (`recurrence.ts`); para componentes/paginas (React + Supabase) a verificacao por step e `npm run lint` + `npx tsc --noEmit` + verificacao visual no dev server (porta **3000**, conforme memoria do projeto — NAO 8080). Commits frequentes (Conventional Commits em ingles, co-autoria Claude).

---

### Task 4.1: Helpers puros de recorrencia (`recurrence.ts`) — TDD

Util puro e testavel: a frase em linguagem natural da recorrencia e o calculo das proximas datas de ocorrencia. Mantido separado de `installments.ts` para nao misturar responsabilidades, mas reutiliza o mesmo passo de avanco de data por `frequency`/`interval` (evita dessincronizacao com `calcInstallments`).

**Files:**
- Test: `src/lib/finance/recurrence.test.ts` (Create)
- Create: `src/lib/finance/recurrence.ts`

**Interfaces:**
- Consumes: `RecurrenceFrequency` de `@/types/finance`.
- Produces:
  - `addByFrequency(dateISO: string, frequency: RecurrenceFrequency, interval: number): string` (retorna ISO `YYYY-MM-DD`)
  - `buildRecurrencePhrase(frequency: RecurrenceFrequency, interval: number, dayOfMonth?: number, endDate?: string): string`
  - `nextRecurrenceDates(startDateISO: string, frequency: RecurrenceFrequency, interval: number, count: number): string[]`

**Steps:**

- [ ] Escrever o teste falhando em `src/lib/finance/recurrence.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { addByFrequency, buildRecurrencePhrase, nextRecurrenceDates } from './recurrence';

describe('addByFrequency', () => {
  it('avanca semanas', () => {
    expect(addByFrequency('2026-01-01', 'weekly', 1)).toBe('2026-01-08');
    expect(addByFrequency('2026-01-01', 'weekly', 2)).toBe('2026-01-15');
  });
  it('avanca meses preservando o dia quando possivel', () => {
    expect(addByFrequency('2026-01-15', 'monthly', 1)).toBe('2026-02-15');
    expect(addByFrequency('2026-01-15', 'monthly', 3)).toBe('2026-04-15');
  });
  it('clampa o dia no fim de mes mais curto (31 jan -> 28 fev)', () => {
    expect(addByFrequency('2026-01-31', 'monthly', 1)).toBe('2026-02-28');
  });
  it('avanca trimestres e anos', () => {
    expect(addByFrequency('2026-01-10', 'quarterly', 1)).toBe('2026-04-10');
    expect(addByFrequency('2026-01-10', 'yearly', 2)).toBe('2028-01-10');
  });
});

describe('buildRecurrencePhrase', () => {
  it('mensal no dia X com fim', () => {
    expect(buildRecurrencePhrase('monthly', 1, 5, '2026-12-31'))
      .toBe('Repete mensalmente no dia 5 ate 31/12/2026.');
  });
  it('mensal sem fim', () => {
    expect(buildRecurrencePhrase('monthly', 1, 10))
      .toBe('Repete mensalmente no dia 10 por tempo indeterminado.');
  });
  it('a cada N meses', () => {
    expect(buildRecurrencePhrase('monthly', 2, 1))
      .toBe('Repete a cada 2 meses no dia 1 por tempo indeterminado.');
  });
  it('semanal', () => {
    expect(buildRecurrencePhrase('weekly', 1)).toBe('Repete semanalmente por tempo indeterminado.');
    expect(buildRecurrencePhrase('weekly', 3)).toBe('Repete a cada 3 semanas por tempo indeterminado.');
  });
  it('trimestral e anual', () => {
    expect(buildRecurrencePhrase('quarterly', 1)).toBe('Repete trimestralmente por tempo indeterminado.');
    expect(buildRecurrencePhrase('yearly', 1)).toBe('Repete anualmente por tempo indeterminado.');
  });
});

describe('nextRecurrenceDates', () => {
  it('gera N datas inclusive a inicial', () => {
    expect(nextRecurrenceDates('2026-01-05', 'monthly', 1, 3))
      .toEqual(['2026-01-05', '2026-02-05', '2026-03-05']);
  });
});
```

- [ ] Rodar e ver falhar: `npm run test -- src/lib/finance/recurrence.test.ts`
  Saida esperada: `FAIL` com `Cannot find module './recurrence'` (arquivo ainda nao existe).

- [ ] Implementar o minimo em `src/lib/finance/recurrence.ts`:
```ts
import type { RecurrenceFrequency } from '@/types/finance';

/** Parse "YYYY-MM-DD" como data local (evita shift de UTC). */
function parseISO(dateISO: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateISO.split('-').map(Number);
  return { y, m, d };
}

function toISO(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function daysInMonth(year: number, month1: number): number {
  // month1 e 1-based
  return new Date(year, month1, 0).getDate();
}

/**
 * Avanca uma data ISO por frequencia x interval.
 * Em saltos mensais/trimestrais/anuais, preserva o dia quando possivel e
 * faz clamp no ultimo dia do mes destino (ex.: 31 jan + 1 mes = 28 fev).
 */
export function addByFrequency(
  dateISO: string,
  frequency: RecurrenceFrequency,
  interval: number,
): string {
  const { y, m, d } = parseISO(dateISO);

  if (frequency === 'weekly') {
    const base = new Date(y, m - 1, d);
    base.setDate(base.getDate() + 7 * interval);
    return toISO(base.getFullYear(), base.getMonth() + 1, base.getDate());
  }

  const monthsToAdd =
    frequency === 'monthly' ? interval : frequency === 'quarterly' ? 3 * interval : 12 * interval;

  const totalMonths = (m - 1) + monthsToAdd;
  const targetYear = y + Math.floor(totalMonths / 12);
  const targetMonth1 = (totalMonths % 12) + 1;
  const clampedDay = Math.min(d, daysInMonth(targetYear, targetMonth1));
  return toISO(targetYear, targetMonth1, clampedDay);
}

const FREQ_ADVERB: Record<RecurrenceFrequency, string> = {
  weekly: 'semanalmente',
  monthly: 'mensalmente',
  quarterly: 'trimestralmente',
  yearly: 'anualmente',
};

const FREQ_PLURAL: Record<RecurrenceFrequency, string> = {
  weekly: 'semanas',
  monthly: 'meses',
  quarterly: 'trimestres',
  yearly: 'anos',
};

function formatDateBR(dateISO: string): string {
  const { y, m, d } = parseISO(dateISO);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

/** Frase em linguagem natural para o resumo da recorrencia. */
export function buildRecurrencePhrase(
  frequency: RecurrenceFrequency,
  interval: number,
  dayOfMonth?: number,
  endDate?: string,
): string {
  const cadence =
    interval <= 1
      ? `Repete ${FREQ_ADVERB[frequency]}`
      : `Repete a cada ${interval} ${FREQ_PLURAL[frequency]}`;
  const dayPart =
    frequency !== 'weekly' && dayOfMonth ? ` no dia ${dayOfMonth}` : '';
  const endPart = endDate ? ` ate ${formatDateBR(endDate)}` : ' por tempo indeterminado';
  return `${cadence}${dayPart}${endPart}.`;
}

/** Gera N datas (inclui a inicial) avancando por frequencia x interval. */
export function nextRecurrenceDates(
  startDateISO: string,
  frequency: RecurrenceFrequency,
  interval: number,
  count: number,
): string[] {
  const dates: string[] = [];
  let cursor = startDateISO;
  for (let i = 0; i < count; i++) {
    dates.push(cursor);
    cursor = addByFrequency(cursor, frequency, interval);
  }
  return dates;
}
```

- [ ] Rodar e ver passar: `npm run test -- src/lib/finance/recurrence.test.ts`
  Saida esperada: `PASS` com todos os `describe` verdes (3 suites).

- [ ] Typecheck: `npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Commit:
```bash
git add src/lib/finance/recurrence.ts src/lib/finance/recurrence.test.ts
git commit -m "$(cat <<'EOF'
feat(finance): add pure recurrence date/phrase helpers with tests

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4.2: `OriginBadge` reutilizavel

Badge `auto` (assinatura/Stripe) vs `manual` (avulso). Reutilizado em gráfico, cards e lista (consumido tambem nas Fases 3 e 5). Componente puro de apresentacao, sem dependencia de dados.

**Files:**
- Create: `src/components/finance/OriginBadge.tsx`

**Interfaces:**
- Consumes: `Badge` de `@/components/ui/badge`, `cn` de `@/lib/utils`, icones `Zap`/`PenLine` de `lucide-react`.
- Produces: `OriginBadge({ variant, className }: { variant: 'auto' | 'manual'; className?: string })`.

**Steps:**

- [ ] Implementar `src/components/finance/OriginBadge.tsx`:
```tsx
import { Zap, PenLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OriginBadgeProps {
  variant: 'auto' | 'manual';
  className?: string;
}

/**
 * Indica a origem de um lancamento financeiro:
 * - auto: assinatura/Stripe (gerado automaticamente)
 * - manual: lancamento avulso (registrado pelo operador)
 */
export function OriginBadge({ variant, className }: OriginBadgeProps) {
  if (variant === 'auto') {
    return (
      <Badge
        variant="outline"
        className={cn('gap-1 border-blue-500/40 text-blue-600 dark:text-blue-400', className)}
      >
        <Zap className="h-3 w-3" />
        Assinatura
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 border-cyan-500/40 text-cyan-600 dark:text-cyan-400', className)}
    >
      <PenLine className="h-3 w-3" />
      Avulso
    </Badge>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros nem warnings novos.

- [ ] Commit:
```bash
git add src/components/finance/OriginBadge.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add reusable OriginBadge (auto vs manual)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4.3: `AttachmentDropzone` reutilizavel (drag-drop, multiplos, progresso, validacao)

Dropzone que aceita PDF/PNG/JPEG (<= 10 MB), multiplos arquivos, com progresso por arquivo. Sobe via `useUploadAttachment` quando ja existe `entryId`; quando o lancamento ainda nao foi criado (modo `/novo`), acumula os arquivos selecionados em memoria e expoe via callback para o form subir apos criar a entry. Reaproveita o visual da `DropZone` de `DocumentsTab.tsx`.

**Files:**
- Create: `src/components/finance/AttachmentDropzone.tsx`

**Interfaces:**
- Consumes: `useUploadAttachment` de `@/hooks/useFinancialEntriesQuery`; tipos `FinancialAttachment`, `AttachmentKind` de `@/types/finance`; `Progress`, `Button` de `@/components/ui`; `cn` de `@/lib/utils`; `toast` de `sonner`.
- Produces:
```ts
interface PendingFile { id: string; file: File; progress: number; status: 'queued' | 'uploading' | 'done' | 'error' }
interface AttachmentDropzoneProps {
  entryId?: string;                                   // quando definido, sobe imediatamente
  existing?: FinancialAttachment[];                   // anexos ja salvos (modo edicao)
  onPendingChange?: (files: File[]) => void;          // modo criacao: arquivos a subir depois
  onUploadingChange?: (uploading: boolean) => void;   // trava o submit do form
  onUploaded?: (att: FinancialAttachment) => void;    // modo edicao: anexo salvo
  onRemoveExisting?: (id: string) => void;
  kind?: AttachmentKind;
}
export function AttachmentDropzone(props: AttachmentDropzoneProps): JSX.Element
```

**Steps:**

- [ ] Implementar `src/components/finance/AttachmentDropzone.tsx`:
```tsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, FileText, Image as ImageIcon, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUploadAttachment } from '@/hooks/useFinancialEntriesQuery';
import type { FinancialAttachment, AttachmentKind } from '@/types/finance';

const ACCEPT = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg';
const ALLOWED_MIME = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_BYTES = 10 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validate(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type)) return 'Formato aceito: PDF, PNG ou JPEG.';
  if (file.size > MAX_BYTES) return 'O arquivo excede o limite de 10 MB.';
  return null;
}

interface PendingFile {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
}

interface AttachmentDropzoneProps {
  entryId?: string;
  existing?: FinancialAttachment[];
  onPendingChange?: (files: File[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onUploaded?: (att: FinancialAttachment) => void;
  onRemoveExisting?: (id: string) => void;
  kind?: AttachmentKind;
}

export function AttachmentDropzone({
  entryId,
  existing = [],
  onPendingChange,
  onUploadingChange,
  onUploaded,
  onRemoveExisting,
  kind = 'other',
}: AttachmentDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadAttachment();

  const anyUploading = pending.some((p) => p.status === 'uploading');
  useEffect(() => {
    onUploadingChange?.(anyUploading);
  }, [anyUploading, onUploadingChange]);

  // Modo criacao: expoe os arquivos validos ainda nao salvos.
  useEffect(() => {
    if (entryId) return;
    onPendingChange?.(pending.filter((p) => p.status !== 'error').map((p) => p.file));
  }, [pending, entryId, onPendingChange]);

  const uploadOne = useCallback(
    async (pf: PendingFile) => {
      if (!entryId) return; // criacao: sobe depois
      setPending((prev) => prev.map((p) => (p.id === pf.id ? { ...p, status: 'uploading', progress: 20 } : p)));
      try {
        const att = await uploadMutation.mutateAsync({ entryId, file: pf.file, kind });
        setPending((prev) => prev.map((p) => (p.id === pf.id ? { ...p, status: 'done', progress: 100 } : p)));
        onUploaded?.(att);
        toast.success(`Anexo "${pf.file.name}" enviado.`);
      } catch (err) {
        setPending((prev) => prev.map((p) => (p.id === pf.id ? { ...p, status: 'error', progress: 0 } : p)));
        toast.error(`Erro ao enviar "${pf.file.name}".`, {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    },
    [entryId, kind, uploadMutation, onUploaded],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const next: PendingFile[] = [];
      for (const file of Array.from(files)) {
        const error = validate(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
          continue;
        }
        next.push({ id: crypto.randomUUID(), file, progress: 0, status: 'queued' });
      }
      if (next.length === 0) return;
      setPending((prev) => [...prev, ...next]);
      if (entryId) next.forEach(uploadOne);
    },
    [entryId, uploadOne],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  };

  const removePending = (id: string) => setPending((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
        className={cn(
          'w-full rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2',
          'hover:border-cyan-500 hover:bg-cyan-500/5',
          isDragging ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]' : 'border-border bg-muted/30',
        )}
        aria-label="Area de upload de anexos"
      >
        <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={handleChange} />
        <div className="flex flex-col items-center gap-2">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-colors',
            isDragging ? 'bg-cyan-500/20 text-cyan-500' : 'bg-muted text-muted-foreground')}>
            <Paperclip className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {isDragging ? 'Solte os arquivos aqui' : 'Arraste NF / comprovantes ou clique para selecionar'}
          </p>
          <p className="text-xs text-muted-foreground">PDF, PNG ou JPEG · Multiplos · Maximo 10 MB cada</p>
        </div>
      </button>

      {/* Anexos ja salvos (edicao) */}
      {existing.length > 0 && (
        <ul className="space-y-2">
          {existing.map((att) => (
            <li key={att.id} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2">
              {att.fileType === 'application/pdf'
                ? <FileText className="h-4 w-4 shrink-0 text-red-500" />
                : <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />}
              <span className="min-w-0 flex-1 truncate text-sm">{att.fileName}</span>
              {att.fileSize ? <span className="text-xs text-muted-foreground">{formatBytes(att.fileSize)}</span> : null}
              {onRemoveExisting && (
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemoveExisting(att.id)}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Fila / progresso */}
      <AnimatePresence>
        {pending.map((pf) => (
          <motion.div
            key={pf.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2"
          >
            {pf.file.type === 'application/pdf'
              ? <FileText className="h-4 w-4 shrink-0 text-red-500" />
              : <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{pf.file.name}</p>
              {pf.status === 'uploading' && <Progress value={pf.progress} className="mt-1 h-1.5" />}
            </div>
            {pf.status === 'uploading' && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-500" />}
            {pf.status === 'done' && <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />}
            {pf.status === 'error' && <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />}
            {pf.status !== 'uploading' && (
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removePending(pf.id)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Commit:
```bash
git add src/components/finance/AttachmentDropzone.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add AttachmentDropzone with multi-file upload and progress

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4.4: `InstallmentPreview` + `RecurrenceFields`

Dois componentes de apoio das secoes "Parcelamento" e "Recorrencia". `InstallmentPreview` consome `calcInstallments` (Fase 2) e mostra a tabela de parcelas com aviso de ajuste de centavos. `RecurrenceFields` mostra os campos da recorrencia + a frase via `buildRecurrencePhrase` (Task 4.1).

**Files:**
- Create: `src/components/finance/InstallmentPreview.tsx`
- Create: `src/components/finance/RecurrenceFields.tsx`

**Interfaces:**
- Consumes: `calcInstallments` de `@/lib/finance/installments`; `buildRecurrencePhrase` de `@/lib/finance/recurrence`; tipos `RecurrenceFrequency`, `InstallmentItem` de `@/types/finance`; `formatBRL`, `formatDateBR` de `@/lib/formatters`; `Table*`, `Select*`, `Input`, `Label` de `@/components/ui`.
- Produces:
```ts
function InstallmentPreview(props: { totalCents: number; count: number; firstDueDate: string; frequency: RecurrenceFrequency; interval: number }): JSX.Element
interface RecurrenceValue { frequency: RecurrenceFrequency; interval: number; dayOfMonth?: number; startDate: string; endDate?: string }
function RecurrenceFields(props: { value: RecurrenceValue; onChange: (v: RecurrenceValue) => void }): JSX.Element
```

**Steps:**

- [ ] Implementar `src/components/finance/InstallmentPreview.tsx`:
```tsx
import { useMemo } from 'react';
import { Info } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { calcInstallments } from '@/lib/finance/installments';
import type { RecurrenceFrequency } from '@/types/finance';
import { formatBRL, formatDateBR } from '@/lib/formatters';

interface InstallmentPreviewProps {
  totalCents: number;
  count: number;
  firstDueDate: string;
  frequency: RecurrenceFrequency;
  interval: number;
}

export function InstallmentPreview({
  totalCents,
  count,
  firstDueDate,
  frequency,
  interval,
}: InstallmentPreviewProps) {
  const items = useMemo(() => {
    if (totalCents <= 0 || count < 2 || !firstDueDate) return [];
    return calcInstallments(totalCents, count, firstDueDate, frequency, interval);
  }, [totalCents, count, firstDueDate, frequency, interval]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Informe valor, numero de parcelas e a data do primeiro vencimento para ver a previsao.
      </p>
    );
  }

  const equalShare = items.length > 1 && items[0].amount !== items[items.length - 1].amount;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Parcela</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.number}>
                <TableCell className="font-medium">{it.number}/{items.length}</TableCell>
                <TableCell>{formatDateBR(it.dueDate)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatBRL(it.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {equalShare && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-500" />
          <span>A ultima parcela absorve o ajuste de centavos para somar exatamente o total.</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] Implementar `src/components/finance/RecurrenceFields.tsx`:
```tsx
import { CalendarClock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { buildRecurrencePhrase } from '@/lib/finance/recurrence';
import type { RecurrenceFrequency } from '@/types/finance';

export interface RecurrenceValue {
  frequency: RecurrenceFrequency;
  interval: number;
  dayOfMonth?: number;
  startDate: string;
  endDate?: string;
}

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
];

interface RecurrenceFieldsProps {
  value: RecurrenceValue;
  onChange: (v: RecurrenceValue) => void;
}

export function RecurrenceFields({ value, onChange }: RecurrenceFieldsProps) {
  const set = <K extends keyof RecurrenceValue>(key: K, v: RecurrenceValue[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Frequencia</Label>
          <Select
            value={value.frequency}
            onValueChange={(v) => set('frequency', v as RecurrenceFrequency)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rec-interval">A cada</Label>
          <Input
            id="rec-interval"
            type="number"
            min={1}
            value={value.interval}
            onChange={(e) => set('interval', Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {value.frequency !== 'weekly' && (
          <div className="space-y-2">
            <Label htmlFor="rec-day">Dia do vencimento</Label>
            <Input
              id="rec-day"
              type="number"
              min={1}
              max={31}
              value={value.dayOfMonth ?? ''}
              placeholder="Ex: 5"
              onChange={(e) => {
                const n = parseInt(e.target.value);
                set('dayOfMonth', Number.isNaN(n) ? undefined : Math.min(31, Math.max(1, n)));
              }}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="rec-start">Inicio</Label>
          <Input
            id="rec-start"
            type="date"
            value={value.startDate}
            onChange={(e) => set('startDate', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rec-end">Termino (opcional)</Label>
          <Input
            id="rec-end"
            type="date"
            value={value.endDate ?? ''}
            onChange={(e) => set('endDate', e.target.value || undefined)}
          />
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-3 text-sm">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
        <span>{buildRecurrencePhrase(value.frequency, value.interval, value.dayOfMonth, value.endDate)}</span>
      </div>
    </div>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Commit:
```bash
git add src/components/finance/InstallmentPreview.tsx src/components/finance/RecurrenceFields.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add InstallmentPreview and RecurrenceFields components

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4.5: `FinancialEntryForm` (FormBody) com RHF+Zod, secoes e rodape sticky

> ⚠️ **REVISADO 21/07 — a seção 4 do formulário muda.**
>
> **Um único `ToggleGroup`, não dois toggles.** O texto abaixo trata parcelamento e recorrência como dois switches mutuamente exclusivos — que é um radio group disfarçado, e o usuário tentará ligar os dois. Substitua por um `ToggleGroup type="single"` com valor `'once' | 'installments' | 'recurring'`, rotulado **Repetição**.
>
> **No PR A, apenas `Único | Parcelado`.** A opção "Recorrente" entra no PR C, junto com a RPC `generate_due_recurrences` e o pg_cron que a materializam. Oferecê-la antes gravaria uma regra em `financial_recurrences` que nada executa — pior do que não oferecer. Monte as opções a partir de um array para o PR C só acrescentar a terceira.
>
> **Propagação do acento — exatamente 3 pontos, nunca mais:** (1) o segmento ativo do ToggleGroup de natureza (tint 12% + texto + borda na cor), (2) o campo Valor (`border-left` 3px + o prefixo `R$` na cor) e (3) o número no rodapé sticky. **Não** propague para o título da página, para o botão Salvar (que segue cyan — é interação) nem para as bordas dos outros campos: se a tela inteira fica verde, verde deixa de significar "isto é o valor".
>
> **Guarda ao trocar a natureza:** Receita↔Despesa invalida a categoria selecionada (categorias são tipadas). Limpe o campo **com aviso inline** — "Categoria redefinida: as opções mudam por natureza" — nunca silenciosamente.

O componente central da fase. RHF + Zod, seguindo o padrao de `QuestionForm.tsx` (`Form`, `FormField`, `FormItem`, `zodResolver`). Quatro secoes (Essencial, Datas e status, Anexos, Parcelamento+Recorrencia), rodape sticky com resumo ao vivo e botao Salvar com guarda de submit (desabilitado durante upload). Funciona em modo `create` e `edit`, e tambem `embedded` (dentro do Sheet de edicao rapida — sem rodape full-screen).

**Files:**
- Create: `src/components/finance/FinancialEntryForm.tsx`

**Interfaces:**
- Consumes: `useFinancialCategories` de `@/hooks/useFinancialCategoriesQuery`; `useCreateEntry`, `useUpdateEntry`, `useUploadAttachment` de `@/hooks/useFinancialEntriesQuery`; `getFinanceService` de `@/services/finance/financeService`; `useCompanies` de `@/hooks/useCompaniesQuery`; `calcInstallments` de `@/lib/finance/installments`; tipos de `@/types/finance`; componentes `AttachmentDropzone`, `InstallmentPreview`, `RecurrenceFields` (Tasks 4.3/4.4); `formatBRL` de `@/lib/formatters`; `Form*`, `ToggleGroup`, `Tooltip*`, `Select*`, `Input`, `Textarea`, `Switch`, `Button` de `@/components/ui`.
- Produces:
```ts
interface FinancialEntryFormProps {
  mode: 'create' | 'edit';
  entry?: FinancialEntry;            // obrigatorio em edit
  embedded?: boolean;                // true dentro do Sheet
  onSaved?: (entry: FinancialEntry) => void;
  onCancel?: () => void;
}
export function FinancialEntryForm(props: FinancialEntryFormProps): JSX.Element
export const financeEntryFormSchema: ZodSchema  // reutilizavel
```

**Steps:**

- [ ] Implementar `src/components/finance/FinancialEntryForm.tsx`:
```tsx
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, HelpCircle, Repeat, Layers } from 'lucide-react';
import { toast } from 'sonner';

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatBRL } from '@/lib/formatters';

import { useFinancialCategories } from '@/hooks/useFinancialCategoriesQuery';
import { useCreateEntry, useUpdateEntry } from '@/hooks/useFinancialEntriesQuery';
import { getFinanceService } from '@/services/finance/financeService';
import { useCompanies } from '@/hooks/useCompaniesQuery';
import { calcInstallments } from '@/lib/finance/installments';
import type {
  FinancialEntry, FinancialType, PaymentMethod, RecurrenceFrequency,
} from '@/types/finance';

import { AttachmentDropzone } from './AttachmentDropzone';
import { InstallmentPreview } from './InstallmentPreview';
import { RecurrenceFields, type RecurrenceValue } from './RecurrenceFields';

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card_credit', label: 'Cartao de credito' },
  { value: 'card_debit', label: 'Cartao de debito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'other', label: 'Outro' },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

export const financeEntryFormSchema = z
  .object({
    type: z.enum(['income', 'expense']),
    amount: z.number().positive('Informe um valor maior que zero'),
    categoryId: z.string().optional(),
    counterpartyName: z.string().optional(),
    counterpartyCompanyId: z.string().optional(),
    paymentMethod: z.string().optional(),
    description: z.string().min(2, 'Descreva o lancamento'),
    competenceDate: z.string().min(1, 'Informe a competencia'),
    dueDate: z.string().min(1, 'Informe o vencimento'),
    status: z.enum(['pending', 'paid', 'canceled']),
    paidDate: z.string().optional(),
    notes: z.string().optional(),
    installmentEnabled: z.boolean(),
    installmentCount: z.number().int().min(2).optional(),
    recurrenceEnabled: z.boolean(),
  })
  .refine((d) => d.status !== 'paid' || !!d.paidDate, {
    message: 'Informe a data de pagamento',
    path: ['paidDate'],
  })
  .refine((d) => !d.installmentEnabled || (d.installmentCount ?? 0) >= 2, {
    message: 'O parcelamento exige ao menos 2 parcelas',
    path: ['installmentCount'],
  });

type FormValues = z.infer<typeof financeEntryFormSchema>;

interface FinancialEntryFormProps {
  mode: 'create' | 'edit';
  entry?: FinancialEntry;
  embedded?: boolean;
  onSaved?: (entry: FinancialEntry) => void;
  onCancel?: () => void;
}

export function FinancialEntryForm({
  mode, entry, embedded = false, onSaved, onCancel,
}: FinancialEntryFormProps) {
  const createMutation = useCreateEntry();
  const updateMutation = useUpdateEntry();
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceValue>({
    frequency: 'monthly', interval: 1, dayOfMonth: undefined, startDate: todayISO(), endDate: undefined,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(financeEntryFormSchema),
    defaultValues: {
      type: entry?.type ?? 'expense',
      amount: entry?.amount ?? 0,
      categoryId: entry?.categoryId ?? undefined,
      counterpartyName: entry?.counterpartyName ?? '',
      counterpartyCompanyId: entry?.counterpartyCompanyId ?? undefined,
      paymentMethod: entry?.paymentMethod ?? undefined,
      description: entry?.description ?? '',
      competenceDate: entry?.competenceDate ?? todayISO(),
      dueDate: entry?.dueDate ?? todayISO(),
      status: entry?.status ?? 'pending',
      paidDate: entry?.paidDate ?? undefined,
      notes: entry?.notes ?? '',
      installmentEnabled: false,
      installmentCount: 2,
      recurrenceEnabled: false,
    },
  });

  const type = form.watch('type');
  const amount = form.watch('amount');
  const status = form.watch('status');
  const dueDate = form.watch('dueDate');
  const installmentEnabled = form.watch('installmentEnabled');
  const installmentCount = form.watch('installmentCount') ?? 2;
  const recurrenceEnabled = form.watch('recurrenceEnabled');

  // Categorias filtradas pela natureza (receita/despesa).
  const { data: categories = [] } = useFinancialCategories(type);
  // Vinculo opcional de empresa (tipico em receitas).
  const { data: companiesPage } = useCompanies(undefined, { page: 1, pageSize: 100 });
  const companies = companiesPage?.data ?? [];

  // Toggles mutuamente exclusivos.
  useEffect(() => {
    if (installmentEnabled && recurrenceEnabled) form.setValue('recurrenceEnabled', false);
  }, [installmentEnabled, recurrenceEnabled, form]);

  const isIncome = type === 'income';
  const accent = isIncome
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400';

  const totalCents = Math.round((amount || 0) * 100);
  const installmentItems = useMemo(() => {
    if (!installmentEnabled || totalCents <= 0 || installmentCount < 2 || !dueDate) return [];
    return calcInstallments(totalCents, installmentCount, dueDate, 'monthly', 1);
  }, [installmentEnabled, totalCents, installmentCount, dueDate]);

  const onSubmit = async (values: FormValues) => {
    try {
      const base: Partial<FinancialEntry> = {
        type: values.type,
        amount: values.amount,
        currency: 'BRL',
        categoryId: values.categoryId || undefined,
        counterpartyName: values.counterpartyName || undefined,
        counterpartyCompanyId: values.counterpartyCompanyId || undefined,
        paymentMethod: (values.paymentMethod as PaymentMethod) || undefined,
        description: values.description,
        competenceDate: values.competenceDate,
        dueDate: values.dueDate,
        status: values.status,
        paidDate: values.status === 'paid' ? values.paidDate : undefined,
        notes: values.notes || undefined,
      };

      const svc = await getFinanceService();
      let saved: FinancialEntry;

      // Recorrencia: cria a regra (a materializacao fica para a Fase 7).
      if (values.recurrenceEnabled && mode === 'create') {
        await svc.createRecurrence({
          type: values.type,
          description: values.description,
          categoryId: values.categoryId || undefined,
          counterpartyName: values.counterpartyName || undefined,
          counterpartyCompanyId: values.counterpartyCompanyId || undefined,
          amount: values.amount,
          paymentMethod: (values.paymentMethod as PaymentMethod) || undefined,
          frequency: recurrence.frequency,
          interval: recurrence.interval,
          dayOfMonth: recurrence.dayOfMonth,
          startDate: recurrence.startDate,
          endDate: recurrence.endDate,
          isActive: true,
        });
      }

      if (mode === 'create' && values.installmentEnabled && installmentItems.length >= 2) {
        const created = await svc.createEntryWithInstallments(base, installmentItems);
        saved = created[0];
      } else if (mode === 'edit' && entry) {
        saved = await updateMutation.mutateAsync({ id: entry.id, updates: base });
      } else {
        saved = await createMutation.mutateAsync(base);
      }

      // Sobe anexos pendentes apos a entry existir (modo criacao).
      if (pendingFiles.length > 0) {
        for (const file of pendingFiles) {
          await svc.uploadAttachment(saved.id, file, 'other');
        }
      }

      toast.success(mode === 'create' ? 'Lancamento criado!' : 'Lancamento atualizado!');
      onSaved?.(saved);
    } catch (err) {
      toast.error('Erro ao salvar lancamento.', {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || form.formState.isSubmitting;
  const submitDisabled = isSubmitting || uploading;

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-8', !embedded && 'pb-28')}>
          {/* ---------------- Secao Essencial ---------------- */}
          <section className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Natureza</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(v) => v && field.onChange(v)}
                      className="justify-start"
                    >
                      <ToggleGroupItem value="income" className="data-[state=on]:bg-emerald-500/15 data-[state=on]:text-emerald-600">
                        Receita
                      </ToggleGroupItem>
                      <ToggleGroupItem value="expense" className="data-[state=on]:bg-red-500/15 data-[state=on]:text-red-600">
                        Despesa
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        placeholder="0,00"
                        className={cn('text-2xl font-semibold tabular-nums h-14', accent)}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descricao</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Anuncio Meta Ads, Consultoria avulsa..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="counterpartyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isIncome ? 'Cliente' : 'Fornecedor'}</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome (texto livre)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isIncome && (
                <FormField
                  control={form.control}
                  name="counterpartyCompanyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa vinculada (opcional)</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Sem vinculo" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((co) => (
                            <SelectItem key={co.id} value={co.id}>{co.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de pagamento</FormLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHOD_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* ---------------- Secao Datas e status ---------------- */}
          <section className="space-y-6 border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground">Datas e status</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="competenceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      Competencia
                      <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent>Mes a que o lancamento se refere, independente do vencimento.</TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="canceled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Progressive disclosure: paid_date so com status=Pago */}
            {status === 'paid' && (
              <FormField
                control={form.control}
                name="paidDate"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel className="flex items-center gap-1.5">
                      Data de pagamento
                      <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent>Quando o valor entrou ou saiu do caixa de fato.</TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ?? ''} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observacoes (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Anotacoes internas..." className="min-h-[60px] resize-y" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          {/* ---------------- Secao Anexos ---------------- */}
          <section className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground">Anexos</h3>
            <AttachmentDropzone
              entryId={mode === 'edit' ? entry?.id : undefined}
              existing={mode === 'edit' ? entry?.attachments ?? [] : []}
              onPendingChange={setPendingFiles}
              onUploadingChange={setUploading}
            />
          </section>

          {/* ---------------- Secao Parcelamento e Recorrencia (criacao) ---------------- */}
          {mode === 'create' && (
            <section className="space-y-6 border-t pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground">Parcelamento e recorrencia</h3>

              <FormField
                control={form.control}
                name="installmentEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Parcelar</FormLabel>
                        <FormDescription>Divide o valor em N parcelas mensais.</FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={recurrenceEnabled} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {installmentEnabled && (
                <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
                  <FormField
                    control={form.control}
                    name="installmentCount"
                    render={({ field }) => (
                      <FormItem className="max-w-[160px]">
                        <FormLabel>Numero de parcelas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={2}
                            value={field.value ?? 2}
                            onChange={(e) => field.onChange(Math.max(2, parseInt(e.target.value) || 2))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <InstallmentPreview
                    totalCents={totalCents}
                    count={installmentCount}
                    firstDueDate={dueDate}
                    frequency="monthly"
                    interval={1}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="recurrenceEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Recorrente</FormLabel>
                        <FormDescription>Cria uma regra que repete o lancamento automaticamente.</FormDescription>
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={installmentEnabled} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {recurrenceEnabled && (
                <div className="rounded-lg border bg-muted/10 p-4">
                  <RecurrenceFields value={recurrence} onChange={setRecurrence} />
                </div>
              )}
            </section>
          )}

          {/* ---------------- Rodape ---------------- */}
          {embedded ? (
            <div className="flex justify-end gap-3 border-t pt-4">
              {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
              <Button type="submit" disabled={submitDisabled}>
                {submitDisabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {uploading ? 'Enviando anexos...' : 'Salvar'}
              </Button>
            </div>
          ) : (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className={cn('text-lg font-semibold tabular-nums', accent)}>{formatBRL(amount || 0)}</span>
                  {installmentEnabled && installmentItems.length >= 2 && (
                    <span className="text-muted-foreground">{installmentItems.length}x</span>
                  )}
                  {pendingFiles.length > 0 && (
                    <span className="text-muted-foreground">{pendingFiles.length} anexo(s)</span>
                  )}
                </div>
                <div className="flex gap-3">
                  {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
                  <Button type="submit" disabled={submitDisabled}>
                    {submitDisabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {uploading ? 'Enviando anexos...' : 'Salvar lancamento'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>
    </TooltipProvider>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros. (Se `useCompanies` exigir um campo de paginacao diferente do `{ page, pageSize }`, ajustar conforme o `PaginationConfig` real exportado em `@/services/types`.)

- [ ] Commit:
```bash
git add src/components/finance/FinancialEntryForm.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add FinancialEntryForm (FormBody) with RHF+Zod sections

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4.6: Paginas `FinancialEntryNew` e `FinancialEntryEdit`

As duas paginas que embrulham o `FormBody` com `DashboardLayout userType="admin"` + `AdminTabNav`, header e navegacao de volta. A edicao carrega a entry por `useFinancialEntry(:id)`. As rotas ja foram registradas na Fase 3 — esta task substitui os componentes-placeholder pelo conteudo real (ou cria os arquivos, se a Fase 3 apenas referenciou os imports).

**Files:**
- Create: `src/pages/admin/FinancialEntryNew.tsx`
- Create: `src/pages/admin/FinancialEntryEdit.tsx`

**Interfaces:**
- Consumes: `DashboardLayout` de `@/components/layout/DashboardLayout`; `AdminTabNav` de `@/components/layout/AdminTabNav` (mesmo usado pelas demais paginas de `/admin/financeiro`); `FinancialEntryForm` (Task 4.5); `useFinancialEntry` de `@/hooks/useFinancialEntriesQuery`; `useNavigate`, `useParams` de `react-router-dom`.
- Produces: `export default function FinancialEntryNew()` e `export default function FinancialEntryEdit()`.

**Steps:**

- [ ] Implementar `src/pages/admin/FinancialEntryNew.tsx`:
```tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/layout/AdminTabNav';
import { Button } from '@/components/ui/button';
import { FinancialEntryForm } from '@/components/finance/FinancialEntryForm';

export default function FinancialEntryNew() {
  const navigate = useNavigate();

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <AdminTabNav />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/financeiro/lancamentos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Novo lancamento</h1>
            <p className="text-muted-foreground">Registre uma receita ou despesa avulsa.</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <FinancialEntryForm
            mode="create"
            onSaved={() => navigate('/admin/financeiro/lancamentos')}
            onCancel={() => navigate('/admin/financeiro/lancamentos')}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
```

- [ ] Implementar `src/pages/admin/FinancialEntryEdit.tsx`:
```tsx
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/layout/AdminTabNav';
import { Button } from '@/components/ui/button';
import { FinancialEntryForm } from '@/components/finance/FinancialEntryForm';
import { useFinancialEntry } from '@/hooks/useFinancialEntriesQuery';

export default function FinancialEntryEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: entry, isLoading } = useFinancialEntry(id);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <AdminTabNav />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/financeiro/lancamentos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Editar lancamento</h1>
            <p className="text-muted-foreground">Atualize os dados ou anexos deste lancamento.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : !entry ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-muted-foreground">Lancamento nao encontrado.</p>
            <Button onClick={() => navigate('/admin/financeiro/lancamentos')}>Voltar</Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <FinancialEntryForm
              mode="edit"
              entry={entry}
              onSaved={() => navigate('/admin/financeiro/lancamentos')}
              onCancel={() => navigate('/admin/financeiro/lancamentos')}
            />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
```

- [ ] Confirmar que as rotas em `App.tsx` apontam para estes componentes (registradas na Fase 3). Se os imports forem lazy/placeholder, garantir que importam de `@/pages/admin/FinancialEntryNew` e `@/pages/admin/FinancialEntryEdit`. Comando de checagem:
```bash
grep -n "FinancialEntryNew\|FinancialEntryEdit" src/App.tsx
```
  Saida esperada: duas linhas de import e duas `<Route ...>` em `/admin/financeiro/lancamentos/novo` e `/admin/financeiro/lancamentos/:id` dentro de `<ProtectedRoute allowedTypes={['admin']}>`.

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Verificacao visual (dev server porta 3000):
```bash
npm run dev
```
  Logar como `admin@recrutars.com` / `Admin@123`. Navegar para `/admin/financeiro/lancamentos/novo`. Observar:
  - ToggleGroup Receita/Despesa muda o acento do valor (verde/vermelho) e a lista de categorias.
  - Valor grande com `tabular-nums`; rodape sticky no rodape da viewport mostra o valor ao vivo.
  - Mudar Status para "Pago" revela o campo "Data de pagamento" (progressive disclosure); tooltips aparecem ao passar o mouse nos icones `?`.
  - Ligar "Parcelar" desabilita "Recorrente" e mostra a tabela de parcelas (e vice-versa).
  - Arrastar um PDF para o dropzone mostra a fila; tentar um arquivo > 10 MB ou tipo invalido dispara toast de erro.
  - Salvar redireciona para `/admin/financeiro/lancamentos` e o lancamento aparece na lista (Fase 3).
  - Abrir `/admin/financeiro/lancamentos/:id` de um lancamento existente pre-preenche os campos; secao Parcelamento/Recorrencia oculta; anexos existentes listados.

- [ ] Commit:
```bash
git add src/pages/admin/FinancialEntryNew.tsx src/pages/admin/FinancialEntryEdit.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add FinancialEntryNew and FinancialEntryEdit pages

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4.7: `FinancialEntrySheet` (edicao rapida)

Sheet lateral que envolve o `FormBody` em modo `embedded`, para edicao rapida disparada da lista/Sheet de detalhe (Fase 3). Reusa exatamente o mesmo `FinancialEntryForm` — DRY: zero duplicacao de campos.

**Files:**
- Create: `src/components/finance/FinancialEntrySheet.tsx`

**Interfaces:**
- Consumes: `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription` de `@/components/ui/sheet`; `FinancialEntryForm` (Task 4.5); tipo `FinancialEntry` de `@/types/finance`.
- Produces:
```ts
interface FinancialEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: FinancialEntry;             // undefined => modo criacao rapida
  onSaved?: (entry: FinancialEntry) => void;
}
export function FinancialEntrySheet(props: FinancialEntrySheetProps): JSX.Element
```

**Steps:**

- [ ] Implementar `src/components/finance/FinancialEntrySheet.tsx`:
```tsx
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { FinancialEntryForm } from './FinancialEntryForm';
import type { FinancialEntry } from '@/types/finance';

interface FinancialEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: FinancialEntry;
  onSaved?: (entry: FinancialEntry) => void;
}

export function FinancialEntrySheet({ open, onOpenChange, entry, onSaved }: FinancialEntrySheetProps) {
  const mode = entry ? 'edit' : 'create';
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{mode === 'edit' ? 'Editar lancamento' : 'Novo lancamento'}</SheetTitle>
          <SheetDescription>
            {mode === 'edit' ? 'Ajuste rapido sem sair da lista.' : 'Registre uma receita ou despesa avulsa.'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <FinancialEntryForm
            mode={mode}
            entry={entry}
            embedded
            onSaved={(saved) => { onSaved?.(saved); onOpenChange(false); }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Verificacao visual (dev server porta 3000): se a Fase 3 ja tiver um gatilho de edicao rapida na lista, abrir o Sheet a partir do menu `...` de uma linha; confirmar que o `FormBody` aparece sem o rodape fixo (usa o rodape `embedded` dentro do Sheet) e que salvar fecha o Sheet e atualiza a lista. Caso a Fase 3 ainda nao acione o Sheet, validar isoladamente que o componente compila e que o import esta disponivel para a Fase 3/5 consumir.

- [ ] Commit:
```bash
git add src/components/finance/FinancialEntrySheet.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add FinancialEntrySheet for quick inline editing

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

**Resultado da Fase 4:** formulario completo de lancamentos funcionando em tres superficies (pagina `/novo`, pagina `/:id` e Sheet de edicao rapida), com upload multiplo de anexos com progresso, parcelamento (preview via `calcInstallments`), `ToggleGroup` unico de repeticao (`Único | Parcelado` no PR A), rodape sticky com resumo ao vivo e guarda de submit durante upload. Helpers puros de recorrencia cobertos por testes Vitest.

---

### Task 4.8: Version bump v1.75.0 "Ledger" + changelog — **fecha o PR A**

> **Task criada em 22/07.** O plano original previa um único bump (Task 8.5). Com a entrega em 3 PRs, cada um fecha com o seu: este é o do **PR A**. A Task 8.5 passa a ser o bump do PR C.

**Files:**
- Modify: `src/constants/app.ts`
- Modify: `public/changelog.json`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: nada.
- Produces: `APP_VERSION = "1.75.0"`, `APP_CODENAME = "Ledger"`, nova entrada de versão com `isCurrent: true`.

**Steps:**

- [ ] **Passo 1: Conferir a versão de partida.** O plano assume que a `main` está em `1.74.0 "Herald"`.

Run: `grep -E 'APP_VERSION|APP_CODENAME' src/constants/app.ts`
Se a `main` avançou desde 22/07, use o próximo MINOR a partir do que estiver lá, mantendo o codename "Ledger".

- [ ] **Passo 2: Atualizar `src/constants/app.ts`.**

```ts
export const APP_VERSION = "1.75.0";
export const APP_CODENAME = "Ledger";
```

- [ ] **Passo 3: Marcar a versão anterior como não-atual** em `public/changelog.json` — no objeto `1.74.0`, trocar `"isCurrent": true` por `"isCurrent": false`. **Exatamente uma versão pode ter `isCurrent: true`.**

- [ ] **Passo 4: Inserir a nova versão** como PRIMEIRO item do array `versions`. Cada item de `changes` **precisa** de `details` com `description` (string), `files` (string[]) e `routes` (string[]) — as chaves de `details` são índices string ("0", "1"…) correspondendo à posição no array `items`. Tipos válidos: `added`, `changed`, `deprecated`, `removed`, `fixed`, `security` — **nunca** `enhanced` (causa crash no `VersionAccordion`).

- [ ] **Passo 5: Acrescentar a entrada em `CHANGELOG.md`** no formato Keep a Changelog, com `## [1.75.0] - <data> "Ledger"`.

- [ ] **Passo 6: Validar o changelog.**

Run: `node -e "const d=require('./public/changelog.json');const v=d.versions||d;console.log('isCurrent:',v.filter(x=>x.isCurrent).map(x=>x.version));v[0].changes.forEach(c=>c.items.forEach((_,i)=>{if(!c.details||!c.details[String(i)])throw new Error('details ausente em '+c.type+'['+i+']')}));console.log('details OK')"`
Esperado: `isCurrent: [ '1.75.0' ]` e `details OK`.

- [ ] **Passo 7: Verificação visual.** Com o dev server na **porta 3000**, abrir `http://localhost:3000/sobre` e confirmar que `1.75.0 — Ledger` aparece como atual e que o accordion expande sem crash.

- [ ] **Passo 8: Commit.**

```bash
git add src/constants/app.ts public/changelog.json CHANGELOG.md
git commit -m "chore: bump version to v1.75.0 Ledger and update changelog"
```


---

## Fase 5: Dashboard de Fluxo de Caixa

> ⚠️ **REVISADO 21/07 — três mudanças que atravessam a fase inteira (PR B).**
>
> **1. A paleta `#06b6d4 / #3b82f6 / #10b981 / #f59e0b / #1e3a8a` foi descartada.** Ela usava o cyan reservado a interação, o verde de receita numa rosca de *despesas*, e três azuis que se fundem no dark. Substituição:
> - **Gráfico âncora:** as séries *são* a natureza → usam `--fin-income` / `--fin-expense`. Assinaturas × Avulsos se distinguem por **luminância (`L +14`) + textura** (`<pattern>` diagonal na camada Avulsos), nunca por matiz. Projeção em `--muted-foreground`.
> - **Rosca de categorias:** rampa monocromática **navy→cyan** de 6 passos, **sensível ao tema** (light `L 28%→62%`, dark `L 52%→76%`). Com a rampa fixa do light, a maior fatia rendia **1,46:1** no dark — reprova o mínimo de 3:1 da WCAG 1.4.11. Separador de 2px na cor do card entre segmentos.
>
> **2. São 4 KPIs, não 5.** "A vencer 7d" sai (duplicava a faixa de urgência) e **"Saldo em caixa" sai da faixa de KPIs** para uma linha de contexto no header, ao lado do toggle de escopo — é snapshot de agora, não métrica do período. Ficam: Resultado do mês (herói), Receita total, Despesas, Margem do mês.
>
> **3. A faixa de vencimento é componente de primeira classe** — largura total, logo abaixo dos KPIs, **não colapsável**. Cada bloco navega para `/lancamentos` setando `filters.dueWindow` (Task 1.11), e seus totais vêm de `dueWindowOf()` — a mesma fonte da view Fluxo, para que os dois não divirjam.

Constroi a pagina `FluxoCaixaDashboard` (rota `/admin/financeiro`, aba "Visao Geral") espelhando o layout de `src/pages/admin/ReportsFinancial.tsx` para maxima consistencia. Consome `useCashflowSummary(params)` (Fase 2) e produz: toggle de escopo Consolidado|Avulsos|Assinaturas, 5 KPIs clicaveis, faixa de vencimento clicavel, grafico ancora (Recharts `ComposedChart` com Area empilhada assinaturas+avulsos, Line tracejada de saidas e linha de projecao pontilhada), donut de despesas por categoria, e cards de origem com `OriginBadge`.

**Pre-condicoes (entregues por fases anteriores):**
- Fase 2 ja exporta `useCashflowSummary(params: { from: string; to: string; scope: 'consolidated' | 'avulsos' | 'assinaturas' })` de `src/hooks/useFinancialDashboardQuery.ts`, retornando `UseQueryResult<CashflowSummary>`.
- Fase 2 ja exporta o tipo `CashflowSummary` de `src/types/finance.ts` com os campos do contrato: `totalIncome`, `totalExpense`, `balance`, `cashBalance`, `overdueAmount`, `overdueCount`, `dueSoon7Amount`, `dueSoon7Count`, `byCategory[]`, `monthly[]` (`{month, assinaturas, avulsos, income, expense, projected?}`), `mrr`.
- Fase 1 ja configurou Vitest (`npm run test`, `npm run test:watch`).
- Fase 3 ja registrou a rota `/admin/financeiro/lancamentos` (`FinancialEntries`) e le filtros via query string (`useSearchParams`). Esta fase apenas navega para ela com parametros; se a Fase 3 ainda nao estiver pronta na execucao, a navegacao leva a uma rota existente sem quebrar o build.

**Verificacao geral da fase:** `npm run lint` + `npx tsc --noEmit` sem erros + inspecao visual no dev server (porta 3000) em `/admin/financeiro` logado como `admin@recrutars.com` / `Admin@123`.

---

### Task 5.1: Paleta de cores e util puro de navegacao por escopo

Cria a constante de paleta (DRY: reusada por todos os graficos da fase) e um util **puro e testavel** que converte a navegacao do dashboard (clique em KPI / faixa / toggle de escopo) na query string consumida pela tela de Lancamentos.

**Files:**
- Create: `src/lib/finance/chartColors.ts`
- Create: `src/lib/finance/dashboardNav.ts`
- Test: `src/lib/finance/dashboardNav.test.ts`

**Interfaces:**
- Consumes: `EffectiveStatus`, `FinancialType` (de `src/types/finance.ts`, Fase 1)
- Produces:
  - `FINANCE_CHART_COLORS: { cyan: string; blue: string; green: string; amber: string; navy: string }` e `FINANCE_PIE_COLORS: string[]`
  - `type DashboardScope = 'consolidated' | 'avulsos' | 'assinaturas'`
  - `buildScopeNavFilters(target: { scope: DashboardScope; status?: EffectiveStatus; type?: FinancialType; dueWithinDays?: number }): URLSearchParams` — produz a query string para `/admin/financeiro/lancamentos`

**Steps:**

- [ ] Criar `src/lib/finance/chartColors.ts` com a paleta fixa do spec (secao 7.3 / 9):

```ts
/**
 * Paleta fixa de cores para os graficos do modulo financeiro (Recharts).
 * Espelha a paleta usada em ReportsFinancial.tsx para consistencia visual.
 */
export const FINANCE_CHART_COLORS = {
  cyan: '#06b6d4',
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  navy: '#1e3a8a',
} as const;

/** Cores ciclicas para fatias do donut de despesas por categoria. */
export const FINANCE_PIE_COLORS: string[] = [
  FINANCE_CHART_COLORS.navy,
  FINANCE_CHART_COLORS.blue,
  FINANCE_CHART_COLORS.cyan,
  FINANCE_CHART_COLORS.green,
  FINANCE_CHART_COLORS.amber,
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

/** Estilo de tooltip Recharts compartilhado (mesmo padrao de ReportsFinancial). */
export const FINANCE_TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
} as const;
```

- [ ] Escrever teste falhando em `src/lib/finance/dashboardNav.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildScopeNavFilters } from './dashboardNav';

describe('buildScopeNavFilters', () => {
  it('mapeia escopo consolidado sem filtro de origem', () => {
    const qs = buildScopeNavFilters({ scope: 'consolidated' });
    expect(qs.get('origin')).toBeNull();
  });

  it('mapeia escopo avulsos para origin=manual', () => {
    const qs = buildScopeNavFilters({ scope: 'avulsos' });
    expect(qs.get('origin')).toBe('manual');
  });

  it('mapeia escopo assinaturas para origin=auto', () => {
    const qs = buildScopeNavFilters({ scope: 'assinaturas' });
    expect(qs.get('origin')).toBe('auto');
  });

  it('inclui status quando informado', () => {
    const qs = buildScopeNavFilters({ scope: 'consolidated', status: 'overdue' });
    expect(qs.get('status')).toBe('overdue');
  });

  it('inclui type quando informado', () => {
    const qs = buildScopeNavFilters({ scope: 'avulsos', type: 'expense' });
    expect(qs.get('type')).toBe('expense');
    expect(qs.get('origin')).toBe('manual');
  });

  it('traduz dueWithinDays para preset de filtro por vencimento', () => {
    const qs = buildScopeNavFilters({ scope: 'consolidated', dueWithinDays: 7 });
    expect(qs.get('dueWithin')).toBe('7');
    expect(qs.get('dateField')).toBe('due');
  });
});
```

- [ ] Rodar e ver falhar: `npm run test -- dashboardNav`
  Saida esperada: `Error: Failed to resolve import "./dashboardNav"` (modulo ainda nao existe).

- [ ] Implementar minimo em `src/lib/finance/dashboardNav.ts`:

```ts
/**
 * Util puro: traduz uma navegacao do dashboard de fluxo de caixa
 * (clique em KPI, faixa de vencimento ou toggle de escopo) na query string
 * consumida pela tela de Lancamentos (/admin/financeiro/lancamentos).
 */
import type { EffectiveStatus, FinancialType } from '@/types/finance';

export type DashboardScope = 'consolidated' | 'avulsos' | 'assinaturas';

export interface ScopeNavTarget {
  scope: DashboardScope;
  status?: EffectiveStatus;
  type?: FinancialType;
  /** Filtra lancamentos com vencimento nos proximos N dias. */
  dueWithinDays?: number;
}

const SCOPE_TO_ORIGIN: Record<DashboardScope, 'auto' | 'manual' | null> = {
  consolidated: null,
  avulsos: 'manual',
  assinaturas: 'auto',
};

export function buildScopeNavFilters(target: ScopeNavTarget): URLSearchParams {
  const params = new URLSearchParams();

  const origin = SCOPE_TO_ORIGIN[target.scope];
  if (origin) params.set('origin', origin);

  if (target.status) params.set('status', target.status);
  if (target.type) params.set('type', target.type);

  if (target.dueWithinDays !== undefined) {
    params.set('dueWithin', String(target.dueWithinDays));
    params.set('dateField', 'due');
  }

  return params;
}
```

- [ ] Rodar e passar: `npm run test -- dashboardNav`
  Saida esperada: `Test Files 1 passed (1)` / `Tests 6 passed (6)`.

- [ ] Verificar typecheck: `npx tsc --noEmit`
  Saida esperada: sem output (exit 0).

- [ ] Commit:

```bash
git add src/lib/finance/chartColors.ts src/lib/finance/dashboardNav.ts src/lib/finance/dashboardNav.test.ts
git commit -m "$(cat <<'EOF'
feat(finance): add cashflow chart palette and dashboard nav helper

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5.2: Componente OriginBadge

Cria o badge de origem reutilizavel (Assinaturas/Stripe = auto, Avulsos/manual = manual). Usado nos cards de origem, no grafico (legenda) e — quando a Fase 3 consumir — na lista de lancamentos.

**Files:**
- Create: `src/components/finance/OriginBadge.tsx`

**Interfaces:**
- Consumes: `Badge` (`@/components/ui/badge`), `cn` (`@/lib/utils`), icones `Zap`/`PenLine` (`lucide-react`)
- Produces: `OriginBadge({ variant, showLabel?, className? }: { variant: 'auto' | 'manual'; showLabel?: boolean; className?: string })`

**Steps:**

- [ ] Implementar `src/components/finance/OriginBadge.tsx`:

```tsx
/**
 * OriginBadge — indica a origem de um valor financeiro.
 * - auto: assinaturas/pacotes (Stripe), geradas automaticamente.
 * - manual: lancamentos avulsos registrados pelo operador.
 * Reutilizavel em cards de origem, legendas de grafico e lista de lancamentos.
 */
import { Zap, PenLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OriginBadgeProps {
  variant: 'auto' | 'manual';
  showLabel?: boolean;
  className?: string;
}

const CONFIG = {
  auto: {
    label: 'Assinaturas',
    Icon: Zap,
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  manual: {
    label: 'Avulsos',
    Icon: PenLine,
    className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  },
} as const;

export function OriginBadge({ variant, showLabel = true, className }: OriginBadgeProps) {
  const { label, Icon, className: variantClass } = CONFIG[variant];
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 font-medium', variantClass, className)}
    >
      <Icon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      {showLabel && <span>{label}</span>}
    </Badge>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros de lint no arquivo novo; `tsc` exit 0.

- [ ] Commit:

```bash
git add src/components/finance/OriginBadge.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add OriginBadge for auto/manual entry source

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5.3: Toggle de escopo (Consolidado | Avulsos | Assinaturas)

Segmented control com 3 opcoes, baseado em `ToggleGroup` (Radix, ja existe). Single-select, sempre com um valor ativo.

**Files:**
- Create: `src/components/finance/CashflowScopeToggle.tsx`

**Interfaces:**
- Consumes: `ToggleGroup`/`ToggleGroupItem` (`@/components/ui/toggle-group`), `cn`, `DashboardScope` (`@/lib/finance/dashboardNav`), icones `Layers`/`PenLine`/`Zap`
- Produces: `CashflowScopeToggle({ value, onChange }: { value: DashboardScope; onChange: (s: DashboardScope) => void })`

**Steps:**

- [ ] Implementar `src/components/finance/CashflowScopeToggle.tsx`:

```tsx
/**
 * CashflowScopeToggle — alterna a visao do dashboard entre
 * Consolidado (assinaturas + avulsos), Avulsos (manual) e Assinaturas (Stripe).
 */
import { Layers, PenLine, Zap } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { DashboardScope } from '@/lib/finance/dashboardNav';

interface CashflowScopeToggleProps {
  value: DashboardScope;
  onChange: (scope: DashboardScope) => void;
}

const OPTIONS: { value: DashboardScope; label: string; Icon: typeof Layers }[] = [
  { value: 'consolidated', label: 'Consolidado', Icon: Layers },
  { value: 'avulsos', label: 'Avulsos', Icon: PenLine },
  { value: 'assinaturas', label: 'Assinaturas', Icon: Zap },
];

export function CashflowScopeToggle({ value, onChange }: CashflowScopeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as DashboardScope);
      }}
      className="bg-muted rounded-lg p-1 justify-start"
      aria-label="Escopo do fluxo de caixa"
    >
      {OPTIONS.map(({ value: optValue, label, Icon }) => (
        <ToggleGroupItem
          key={optValue}
          value={optValue}
          className="text-xs px-3 h-8 gap-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Commit:

```bash
git add src/components/finance/CashflowScopeToggle.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add cashflow scope toggle (consolidated/manual/auto)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5.4: CashflowKpis — 5 KPIs clicaveis

5 cartoes: Resultado do mes (heroi), Receita total (com nota MRR), Despesas, A vencer 7d (clicavel), Saldo em caixa. Reusa `KPICard` para os 4 secundarios e um cartao heroi proprio para o Resultado. Os clicaveis chamam `onNavigate`.

**Files:**
- Create: `src/components/finance/dashboard/CashflowKpis.tsx`

**Interfaces:**
- Consumes: `CashflowSummary` (`@/types/finance`), `KPICard` (`@/components/admin/reports/KPICard`), `Card`/`CardContent` (`@/components/ui/card`), `formatBRL` (`@/lib/formatters`), `cn`, `motion` (`framer-motion`), icones; tipo de navegacao `{ status?: 'overdue'; dueWithinDays?: number; type?: 'expense' }`
- Produces: `CashflowKpis({ summary, onNavigate }: { summary: CashflowSummary; onNavigate: (target: { status?: 'overdue'; dueWithinDays?: number; type?: 'income' | 'expense' }) => void })`

**Steps:**

- [ ] Implementar `src/components/finance/dashboard/CashflowKpis.tsx`:

```tsx
/**
 * CashflowKpis — 5 KPIs do dashboard de fluxo de caixa.
 * Resultado do mes (heroi), Receita total (nota MRR), Despesas,
 * A vencer 7d (clicavel) e Saldo em caixa (caixa realizado).
 */
import { motion } from 'framer-motion';
import { TrendingDown, ArrowDownCircle, CalendarClock, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { KPICard } from '@/components/admin/reports/KPICard';
import { formatBRL } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashflowSummary } from '@/types/finance';

interface CashflowKpisProps {
  summary: CashflowSummary;
  onNavigate: (target: {
    status?: 'overdue';
    dueWithinDays?: number;
    type?: 'income' | 'expense';
  }) => void;
}

export function CashflowKpis({ summary, onNavigate }: CashflowKpisProps) {
  const isPositive = summary.balance >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Resultado do mes — heroi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.3 }}
        className="col-span-2 lg:col-span-1"
      >
        <Card
          className={cn(
            'h-full border-l-4',
            isPositive ? 'border-l-emerald-500' : 'border-l-red-500',
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400',
                )}
              >
                {isPositive ? (
                  <TrendingDown className="w-5 h-5 rotate-180" aria-hidden="true" />
                ) : (
                  <TrendingDown className="w-5 h-5" aria-hidden="true" />
                )}
              </div>
            </div>
            <div
              className={cn(
                'text-2xl font-bold mb-1 tabular-nums truncate',
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {formatBRL(summary.balance)}
            </div>
            <div className="text-sm text-muted-foreground">Resultado do mes</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Receita total — com nota MRR */}
      <div>
        <KPICard
          title="Receita total"
          value={summary.totalIncome}
          format="currency"
          icon={ArrowDownCircle}
          index={1}
        />
        <p className="mt-1 px-1 text-[11px] text-muted-foreground">
          Inclui MRR de assinaturas: {formatBRL(summary.mrr)}
        </p>
      </div>

      {/* Despesas */}
      <KPICard
        title="Despesas"
        value={summary.totalExpense}
        format="currency"
        icon={TrendingDown}
        index={2}
      />

      {/* A vencer 7d — clicavel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3 * 0.05, duration: 0.3 }}
      >
        <Card
          role="button"
          tabIndex={0}
          onClick={() => onNavigate({ dueWithinDays: 7 })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate({ dueWithinDays: 7 });
            }
          }}
          className="h-full cursor-pointer transition-shadow hover:shadow-md hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
              {summary.dueSoon7Count > 0 && (
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {summary.dueSoon7Count} {summary.dueSoon7Count === 1 ? 'conta' : 'contas'}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-foreground mb-1 tabular-nums truncate">
              {formatBRL(summary.dueSoon7Amount)}
            </div>
            <div className="text-sm text-muted-foreground">A vencer em 7 dias</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Saldo em caixa */}
      <KPICard
        title="Saldo em caixa"
        value={summary.cashBalance}
        format="currency"
        icon={Wallet}
        index={4}
      />
    </div>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Commit:

```bash
git add src/components/finance/dashboard/CashflowKpis.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add cashflow KPI header with clickable due-soon card

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5.5: DueBands — faixa de vencimento clicavel

Tres faixas com cor escalando (Atrasado / Proximos 7d / 8-30d), cada uma clicavel navegando para a lista filtrada. Colapsavel/secundaria abaixo dos KPIs. Como `CashflowSummary` expoe apenas `overdue*` e `dueSoon7*`, a faixa "8-30d" deriva de `byCategory`/`monthly` nao disponiveis diretamente — portanto exibimos as duas faixas garantidas pelo contrato (Atrasado, 7d) e a faixa "8-30d" e derivada e marcada quando `dueSoon7` ja cobre 7d; usamos os campos disponiveis e exibimos "8-30d" como navegacao por preset (`dueWithinDays: 30`) sem valor monetario proprio quando nao houver no summary.

**Files:**
- Create: `src/components/finance/dashboard/DueBands.tsx`

**Interfaces:**
- Consumes: `CashflowSummary`, `Card`/`CardContent`, `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent` (`@/components/ui/collapsible`), `formatBRL`, `cn`, icones `AlertTriangle`/`Clock`/`Calendar`/`ChevronDown`
- Produces: `DueBands({ summary, onNavigate }: { summary: CashflowSummary; onNavigate: (target: { status?: 'overdue'; dueWithinDays?: number }) => void })`

**Steps:**

- [ ] Implementar `src/components/finance/dashboard/DueBands.tsx`:

```tsx
/**
 * DueBands — faixas de vencimento clicaveis (acionabilidade).
 * Atrasado (vermelho) / A vencer 7d (ambar) / 8-30d (amarelo claro).
 * Colapsavel, secundaria aos KPIs.
 */
import { AlertTriangle, Clock, Calendar, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { formatBRL } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { CashflowSummary } from '@/types/finance';

interface DueBandsProps {
  summary: CashflowSummary;
  onNavigate: (target: { status?: 'overdue'; dueWithinDays?: number }) => void;
}

export function DueBands({ summary, onNavigate }: DueBandsProps) {
  const bands = [
    {
      key: 'overdue',
      label: 'Atrasado',
      Icon: AlertTriangle,
      amount: summary.overdueAmount,
      count: summary.overdueCount,
      tone: 'border-l-red-500 bg-red-500/5 text-red-600 dark:text-red-400',
      onClick: () => onNavigate({ status: 'overdue' }),
    },
    {
      key: 'dueSoon7',
      label: 'A vencer em 7 dias',
      Icon: Clock,
      amount: summary.dueSoon7Amount,
      count: summary.dueSoon7Count,
      tone: 'border-l-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400',
      onClick: () => onNavigate({ dueWithinDays: 7 }),
    },
    {
      key: 'due30',
      label: 'A vencer em 8-30 dias',
      Icon: Calendar,
      amount: null as number | null,
      count: null as number | null,
      tone: 'border-l-yellow-400 bg-yellow-400/5 text-yellow-700 dark:text-yellow-400',
      onClick: () => onNavigate({ dueWithinDays: 30 }),
    },
  ];

  return (
    <Collapsible defaultOpen>
      <div className="rounded-lg border border-border/60 bg-card">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors rounded-lg group">
            <span className="text-sm font-medium text-foreground">
              Vencimentos
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 pt-0">
            {bands.map(({ key, label, Icon, amount, count, tone, onClick }) => (
              <button
                key={key}
                type="button"
                onClick={onClick}
                className={cn(
                  'flex items-center gap-3 rounded-md border border-border/60 border-l-4 p-3 text-left',
                  'transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-ring',
                  tone,
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-base font-bold tabular-nums truncate text-foreground">
                    {amount === null ? 'Ver lista' : formatBRL(amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {label}
                    {count !== null && count > 0 ? ` - ${count}` : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Commit:

```bash
git add src/components/finance/dashboard/DueBands.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add clickable due-date bands (overdue/7d/8-30d)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5.6: CashflowAreaChart + ExpenseDonut

Grafico ancora (`ComposedChart`: Area empilhada assinaturas+avulsos para entradas, Line tracejada para saidas, Line pontilhada para projecao) e donut de despesas por categoria (`Pie` com `innerRadius`).

**Files:**
- Create: `src/components/finance/dashboard/CashflowAreaChart.tsx`
- Create: `src/components/finance/dashboard/ExpenseDonut.tsx`

**Interfaces:**
- Consumes: `CashflowSummary['monthly']` e `CashflowSummary['byCategory']` (`@/types/finance`), Recharts (`ComposedChart`, `Area`, `Line`, `PieChart`, `Pie`, `Cell`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `ResponsiveContainer`), `FINANCE_CHART_COLORS`/`FINANCE_PIE_COLORS`/`FINANCE_TOOLTIP_STYLE` (`@/lib/finance/chartColors`), `Card`/`CardHeader`/`CardTitle`/`CardContent`, `formatBRL`
- Produces:
  - `CashflowAreaChart({ monthly }: { monthly: CashflowSummary['monthly'] })`
  - `ExpenseDonut({ byCategory }: { byCategory: CashflowSummary['byCategory'] })`

**Steps:**

- [ ] Implementar `src/components/finance/dashboard/CashflowAreaChart.tsx`:

```tsx
/**
 * CashflowAreaChart — grafico ancora entradas x saidas (ultimos meses).
 * Entradas: Area empilhada (Assinaturas + Avulsos).
 * Saidas: Line tracejada (leitura daltonica).
 * Projecao: Line pontilhada (dataKey separada).
 */
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/formatters';
import { FINANCE_CHART_COLORS, FINANCE_TOOLTIP_STYLE } from '@/lib/finance/chartColors';
import type { CashflowSummary } from '@/types/finance';

interface CashflowAreaChartProps {
  monthly: CashflowSummary['monthly'];
}

const SERIES_LABELS: Record<string, string> = {
  assinaturas: 'Assinaturas',
  avulsos: 'Avulsos',
  expense: 'Saidas',
  projected: 'Projecao',
};

export function CashflowAreaChart({ monthly }: CashflowAreaChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Entradas x Saidas (6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={monthly}>
            <defs>
              <linearGradient id="finAssinaturas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={FINANCE_CHART_COLORS.blue} stopOpacity={0.4} />
                <stop offset="95%" stopColor={FINANCE_CHART_COLORS.blue} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="finAvulsos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={FINANCE_CHART_COLORS.cyan} stopOpacity={0.4} />
                <stop offset="95%" stopColor={FINANCE_CHART_COLORS.cyan} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
            <YAxis
              fontSize={11}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={FINANCE_TOOLTIP_STYLE}
              formatter={(value: number, name: string) => [
                formatBRL(value),
                SERIES_LABELS[name] ?? name,
              ]}
            />
            <Legend
              formatter={(value: string) => SERIES_LABELS[value] ?? value}
            />
            <Area
              type="monotone"
              dataKey="assinaturas"
              stackId="income"
              stroke={FINANCE_CHART_COLORS.blue}
              strokeWidth={2}
              fill="url(#finAssinaturas)"
              name="assinaturas"
            />
            <Area
              type="monotone"
              dataKey="avulsos"
              stackId="income"
              stroke={FINANCE_CHART_COLORS.cyan}
              strokeWidth={2}
              fill="url(#finAvulsos)"
              name="avulsos"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              name="expense"
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke={FINANCE_CHART_COLORS.amber}
              strokeWidth={2}
              strokeDasharray="2 4"
              dot={false}
              name="projected"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] Implementar `src/components/finance/dashboard/ExpenseDonut.tsx`:

```tsx
/**
 * ExpenseDonut — composicao de despesas por categoria (donut).
 * Usa a cor da categoria quando disponivel, senao a paleta ciclica.
 */
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/formatters';
import { FINANCE_PIE_COLORS, FINANCE_TOOLTIP_STYLE } from '@/lib/finance/chartColors';
import type { CashflowSummary } from '@/types/finance';

interface ExpenseDonutProps {
  byCategory: CashflowSummary['byCategory'];
}

export function ExpenseDonut({ byCategory }: ExpenseDonutProps) {
  const data = byCategory.filter((c) => c.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Despesas por categoria</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {data.length === 0 ? (
          <p className="py-16 text-sm text-muted-foreground text-center">
            Nenhuma despesa registrada no periodo.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="total"
                nameKey="name"
              >
                {data.map((entry, idx) => (
                  <Cell
                    key={entry.categoryId}
                    fill={entry.color ?? FINANCE_PIE_COLORS[idx % FINANCE_PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={FINANCE_TOOLTIP_STYLE}
                formatter={(value: number, name: string) => [formatBRL(value), name]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Commit:

```bash
git add src/components/finance/dashboard/CashflowAreaChart.tsx src/components/finance/dashboard/ExpenseDonut.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add cashflow composed chart and expense donut

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5.7: OriginCards e pagina FluxoCaixaDashboard

Cards de origem (Assinaturas auto/Stripe vs Avulsos manual) com `OriginBadge`, e a pagina que monta tudo: `DashboardLayout` + `PageHeader` + `AdminTabNav` + `CashflowScopeToggle` + `CashflowKpis` + `DueBands` + `CashflowAreaChart` + `ExpenseDonut` + `OriginCards`. Estado de escopo local, periodo do mes corrente, navegacao via `useNavigate` + `buildScopeNavFilters`.

**Files:**
- Create: `src/components/finance/dashboard/OriginCards.tsx`
- Create: `src/pages/admin/FluxoCaixaDashboard.tsx`

**Interfaces:**
- Consumes: `useCashflowSummary` (`@/hooks/useFinancialDashboardQuery`), `CashflowSummary`, todos os componentes das tasks 5.2-5.6, `buildScopeNavFilters`/`DashboardScope` (`@/lib/finance/dashboardNav`), `DashboardLayout`, `PageHeader`, `AdminTabNav`, `useNavigate` (`react-router-dom`), `Skeleton` (`@/components/ui/skeleton`)
- Produces:
  - `OriginCards({ summary }: { summary: CashflowSummary })`
  - `FluxoCaixaDashboard()` (default export) montado em `/admin/financeiro`

**Steps:**

- [ ] Implementar `src/components/finance/dashboard/OriginCards.tsx`:

```tsx
/**
 * OriginCards — separa o resultado por origem:
 * Assinaturas (Stripe, automatico) vs Avulsos (manual).
 * Assinaturas usa o MRR do summary; Avulsos e o restante da receita.
 */
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { OriginBadge } from '@/components/finance/OriginBadge';
import { formatBRL } from '@/lib/formatters';
import type { CashflowSummary } from '@/types/finance';

interface OriginCardsProps {
  summary: CashflowSummary;
}

export function OriginCards({ summary }: OriginCardsProps) {
  const assinaturas = summary.mrr;
  const avulsos = Math.max(summary.totalIncome - summary.mrr, 0);

  const cards = [
    { variant: 'auto' as const, value: assinaturas, hint: 'Receita recorrente (MRR/Stripe)' },
    { variant: 'manual' as const, value: avulsos, hint: 'Receitas avulsas registradas' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.variant}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <OriginBadge variant={card.variant} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1 tabular-nums truncate">
                {formatBRL(card.value)}
              </div>
              <div className="text-sm text-muted-foreground">{card.hint}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
```

- [ ] Implementar `src/pages/admin/FluxoCaixaDashboard.tsx`:

```tsx
/**
 * FluxoCaixaDashboard — Visao Geral do modulo financeiro (/admin/financeiro).
 * Consolida assinaturas (Stripe/auto) + avulsos (manual): KPIs, faixas de
 * vencimento, grafico entradas x saidas, donut de despesas e cards de origem.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Skeleton } from '@/components/ui/skeleton';
import { CashflowScopeToggle } from '@/components/finance/CashflowScopeToggle';
import { CashflowKpis } from '@/components/finance/dashboard/CashflowKpis';
import { DueBands } from '@/components/finance/dashboard/DueBands';
import { CashflowAreaChart } from '@/components/finance/dashboard/CashflowAreaChart';
import { ExpenseDonut } from '@/components/finance/dashboard/ExpenseDonut';
import { OriginCards } from '@/components/finance/dashboard/OriginCards';
import { useCashflowSummary } from '@/hooks/useFinancialDashboardQuery';
import { buildScopeNavFilters, type DashboardScope } from '@/lib/finance/dashboardNav';
import type { EffectiveStatus, FinancialType } from '@/types/finance';

/** Retorna { from, to } cobrindo o mes corrente em ISO (YYYY-MM-DD). */
function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { from: iso(first), to: iso(last) };
}

export default function FluxoCaixaDashboard() {
  const navigate = useNavigate();
  const [scope, setScope] = useState<DashboardScope>('consolidated');
  const { from, to } = useMemo(currentMonthRange, []);

  const { data: summary, isLoading } = useCashflowSummary({ from, to, scope });

  const goToEntries = (target: {
    status?: EffectiveStatus;
    type?: FinancialType;
    dueWithinDays?: number;
  }) => {
    const params = buildScopeNavFilters({ scope, ...target });
    const qs = params.toString();
    navigate(`/admin/financeiro/lancamentos${qs ? `?${qs}` : ''}`);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Fluxo de Caixa"
          description="Visao consolidada de receitas e despesas — assinaturas (Stripe) e lancamentos avulsos."
          actions={<CashflowScopeToggle value={scope} onChange={setScope} />}
          howItWorks={[
            'O escopo Consolidado soma assinaturas (automaticas via Stripe) e lancamentos avulsos (manuais)',
            'Os KPIs mostram o resultado do mes, receitas, despesas, contas a vencer em 7 dias e o saldo em caixa realizado',
            'Clique em "A vencer em 7 dias" ou nas faixas de vencimento para abrir a lista de lancamentos ja filtrada',
            'O grafico empilha assinaturas e avulsos nas entradas, traceja as saidas e pontilha a projecao',
          ]}
        />

        <AdminTabNav />

        {isLoading || !summary ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-16 rounded-lg" />
            <div className="grid lg:grid-cols-2 gap-6">
              <Skeleton className="h-80 rounded-lg" />
              <Skeleton className="h-80 rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <CashflowKpis summary={summary} onNavigate={goToEntries} />

            <DueBands summary={summary} onNavigate={goToEntries} />

            <div className="grid lg:grid-cols-2 gap-6">
              <CashflowAreaChart monthly={summary.monthly} />
              <ExpenseDonut byCategory={summary.byCategory} />
            </div>

            <OriginCards summary={summary} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros. (Nota: `useCashflowSummary` deve existir da Fase 2; se ainda nao, este step bloqueia ate a Fase 2 estar mergeada.)

- [ ] Commit:

```bash
git add src/components/finance/dashboard/OriginCards.tsx src/pages/admin/FluxoCaixaDashboard.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add origin cards and FluxoCaixaDashboard page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5.8: Registrar rota, aba e item de sidebar + verificacao visual

Liga a pagina a navegacao: nova rota em `App.tsx`, novo grupo `fluxo-caixa` em `adminTabConfig.ts`, e item "Fluxo de Caixa" no grupo Financeiro do sidebar em `DashboardLayout.tsx`. Verificacao visual final no dev server.

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/config/adminTabConfig.ts`
- Modify: `src/components/layout/DashboardLayout.tsx`

**Interfaces:**
- Consumes: `FluxoCaixaDashboard` (default export de `@/pages/admin/FluxoCaixaDashboard`), padrao `ProtectedRoute allowedTypes={['admin']}`
- Produces: rota `/admin/financeiro`; grupo de abas `fluxo-caixa` em `ADMIN_TAB_GROUPS`; item de sidebar `{ href: '/admin/financeiro', label: 'Fluxo de Caixa', icon: Wallet }`

**Steps:**

- [ ] Localizar o ponto de import e de registro de rotas admin em `App.tsx`:

```bash
grep -n "ReportsFinancial\|BillingDashboard\|allowedTypes={\['admin'\]}" src/App.tsx | head
```
Saida esperada: linhas mostrando os imports lazy/estaticos das paginas admin e o bloco de `<Route>` admin.

- [ ] Adicionar o import de `FluxoCaixaDashboard` em `src/App.tsx` junto aos demais imports de paginas admin (seguir o estilo de import ja usado no arquivo — estatico ou `lazy`, conforme `BillingDashboard`):

```tsx
import FluxoCaixaDashboard from '@/pages/admin/FluxoCaixaDashboard';
```

- [ ] Registrar a rota em `src/App.tsx` dentro do bloco protegido admin (mesmo padrao das demais rotas `/admin/*`), antes da rota `/admin/financeiro/lancamentos` (registrada na Fase 3):

```tsx
<Route
  path="/admin/financeiro"
  element={
    <ProtectedRoute allowedTypes={['admin']}>
      <FluxoCaixaDashboard />
    </ProtectedRoute>
  }
/>
```

- [ ] Adicionar o grupo de abas em `src/config/adminTabConfig.ts`. Primeiro, garantir os icones no import (adicionar `Wallet` e `List`/`FolderTree`/`BarChart3` se faltarem):

```ts
import {
  Users, UsersRound, Shield, ScrollText,
  FolderTree, FileQuestion,
  LayoutDashboard, List, CheckCircle, Calendar, UserCheck,
  DollarSign, TrendingUp, Activity, Rss, Download,
  CreditCard, BarChart3, ToggleLeft, Webhook, FlaskConical, Settings,
  Headset, MessageSquare, BookOpen, Phone,
  Type, UserCircle, Wallet,
} from 'lucide-react';
```

- [ ] Inserir o novo grupo no array `ADMIN_TAB_GROUPS` (apos o grupo `financeiro` existente), em `src/config/adminTabConfig.ts`:

```ts
  {
    id: 'fluxo-caixa',
    parentHref: '/admin/financeiro',
    tabs: [
      { href: '/admin/financeiro', label: 'Visao Geral', icon: BarChart3 },
      { href: '/admin/financeiro/lancamentos', label: 'Lancamentos', icon: List },
      { href: '/admin/financeiro/categorias', label: 'Categorias', icon: FolderTree },
    ],
  },
```

- [ ] Localizar `adminNavGroups` e o grupo "Financeiro" em `DashboardLayout.tsx`:

```bash
grep -n "adminNavGroups\|Financeiro\|Pacotes de" src/components/layout/DashboardLayout.tsx | head
```
Saida esperada: a definicao de `adminNavGroups` e o array de itens do grupo Financeiro (com "Pacotes de Creditos").

- [ ] Garantir o import do icone `Wallet` no bloco de imports `lucide-react` de `src/components/layout/DashboardLayout.tsx` (adicionar `Wallet` se ausente — usar Edit pontual no import existente).

- [ ] Adicionar o item ao grupo "Financeiro" em `adminNavGroups`, logo apos o item "Pacotes de Creditos" (manter o item existente `/admin/assinaturas/billing` intacto):

```tsx
{ href: '/admin/financeiro', label: 'Fluxo de Caixa', icon: Wallet },
```

- [ ] Lint + typecheck: `npm run lint && npx tsc --noEmit`
  Saida esperada: sem erros.

- [ ] Iniciar o dev server: `npm run dev` (porta 3000). Aguardar `Local: http://localhost:3000`.

- [ ] Verificacao visual em `http://localhost:3000/admin/financeiro` (login `admin@recrutars.com` / `Admin@123`). Confirmar:
  - Sidebar mostra "Fluxo de Caixa" (icone carteira) no grupo Financeiro; item fica ativo na rota.
  - Tabs "Visao Geral | Lancamentos | Categorias" aparecem; "Visao Geral" ativa.
  - Toggle Consolidado | Avulsos | Assinaturas no header; alternar muda os numeros (re-fetch do summary).
  - 5 KPIs renderizam com valores em BRL e `tabular-nums`; "Resultado do mes" com borda colorida (verde se >=0, vermelho se <0); "A vencer em 7 dias" tem cursor pointer e abre `/admin/financeiro/lancamentos?dueWithin=7&dateField=due` ao clicar.
  - Faixa de vencimentos colapsavel; clicar "Atrasado" navega para `?status=overdue`.
  - Grafico mostra Area empilhada (azul assinaturas + ciano avulsos), Line vermelha tracejada (saidas) e Line ambar pontilhada (projecao); legenda em portugues.
  - Donut de despesas com `innerRadius`; empty state correto quando sem despesas.
  - Cards de origem com `OriginBadge` auto (Assinaturas) e manual (Avulsos).
  - Sem erros no console do navegador; layout responsivo abaixo de 760px (KPIs em 2 colunas, grafico+donut empilham).

- [ ] Parar o dev server (Ctrl+C no terminal do `npm run dev`).

- [ ] Commit:

```bash
git add src/App.tsx src/config/adminTabConfig.ts src/components/layout/DashboardLayout.tsx
git commit -m "$(cat <<'EOF'
feat(finance): wire FluxoCaixaDashboard route, tabs and sidebar

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

**Deliverable da Fase 5:** dashboard de fluxo de caixa funcional em `/admin/financeiro`, com toggle de escopo, 5 KPIs (um clicavel), faixas de vencimento clicaveis, grafico ancora `ComposedChart`, donut de despesas e cards de origem — todos alimentados por `useCashflowSummary` e navegando para a lista de lancamentos filtrada. `OriginBadge`, `FINANCE_CHART_COLORS` e `buildScopeNavFilters` ficam disponiveis para reuso pelas demais fases.

---

## Fase 6: CRUD de Categorias

Esta fase implementa a tela `/admin/financeiro/categorias` (`FinancialCategories`): tabela com nome, tipo (receita/despesa), cor, ativo e ordem; Dialog de criar/editar; toggle de ativar/desativar inline; reordenar por setas; e confirmacao de exclusao (FK `ON DELETE SET NULL` ja garante que lancamentos nao quebrem).

**Dependencias de fases anteriores (CONSOME):**
- Fase 1 — `src/types/finance.ts`: `FinancialCategory { id; name; type; color?; isActive; sortOrder; createdAt; updatedAt }` e `FinancialType = 'income' | 'expense'`.
- Fase 3 — `src/hooks/useFinancialCategoriesQuery.ts`: `useFinancialCategories(type?)`, `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()`; e a tab `{ href: '/admin/financeiro/categorias', label: 'Categorias', icon: FolderTree }` ja registrada no grupo `fluxo-caixa` de `src/config/adminTabConfig.ts`.
- `IFinancialCategoriesService.updateCategory(id, updates)` aceita `Partial<FinancialCategory>` (camelCase) ou objeto snake_case — o servico `.supabase.ts` normaliza. Nesta fase usamos chaves **camelCase** (`{ name, type, color, isActive, sortOrder }`), consistentes com `FinancialCategory`.

**Verificacao desta fase:** `npm run lint` + `npx tsc --noEmit` + verificacao visual no dev server (porta 3000). Sem TDD (UI + hooks dependem de Supabase/React).

> Observacao de cores: os tokens `--fin-income`/`--fin-expense` so entram na Fase 8. Aqui usamos `Badge` `variant="secondary"` (receita) e `variant="destructive"` (despesa) com icone, mais a cor hex da categoria exibida num "dot" (`FinancialCategoryColorDot`). A interacao (cyan/`--secondary`) nao e usada para status.

---

### Task 6.1: Componente FinancialCategoryColorDot

Componente puro de apresentacao que mostra a cor hex de uma categoria como um circulo (ou um circulo "vazio" quando nao ha cor). Reutilizado na tabela e no Dialog.

**Files:**
- Create: `src/components/finance/FinancialCategoryColorDot.tsx`

**Interfaces:**
- Consumes: nada (componente isolado, so React).
- Produces: `export function FinancialCategoryColorDot(props: { color?: string | null; size?: number; className?: string }): JSX.Element`

**Steps:**

- [ ] Criar `src/components/finance/FinancialCategoryColorDot.tsx` com o conteudo completo:

```tsx
/**
 * FinancialCategoryColorDot — Mostra a cor de uma categoria financeira.
 *
 * Quando `color` esta vazio/nulo, renderiza um circulo com borda tracejada
 * (estado "sem cor") em vez de preenchimento.
 */

import { cn } from '@/lib/utils';

interface FinancialCategoryColorDotProps {
  color?: string | null;
  /** Diametro em pixels. Default 14. */
  size?: number;
  className?: string;
}

export function FinancialCategoryColorDot({
  color,
  size = 14,
  className,
}: FinancialCategoryColorDotProps) {
  const hasColor = typeof color === 'string' && color.trim().length > 0;

  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-full border',
        hasColor ? 'border-black/10 dark:border-white/15' : 'border-dashed border-muted-foreground/40',
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: hasColor ? (color as string) : 'transparent',
      }}
      aria-hidden="true"
    />
  );
}
```

- [ ] Rodar typecheck: `npx tsc --noEmit`
  - Saida esperada: sem erros (exit code 0). O comando nao imprime nada quando passa.

- [ ] Rodar lint apenas no arquivo novo: `npx eslint src/components/finance/FinancialCategoryColorDot.tsx`
  - Saida esperada: sem warnings nem errors (exit code 0).

- [ ] Commit:

```bash
git add src/components/finance/FinancialCategoryColorDot.tsx
git commit -m "feat(finance): add FinancialCategoryColorDot presentational component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6.2: Dialog de criar/editar categoria (FinancialCategoryDialog)

Dialog controlado com formulario (nome, tipo, cor, ativo). Suporta modo "criar" (`category={null}`) e "editar" (`category` preenchida). Faz validacao minima (nome obrigatorio) e chama o callback `onSubmit` com os valores camelCase. O submit/loading e controlado pelo pai.

**Files:**
- Create: `src/components/finance/FinancialCategoryDialog.tsx`

**Interfaces:**
- Consumes: `FinancialCategory`, `FinancialType` de `@/types/finance`; `FinancialCategoryColorDot` de `@/components/finance/FinancialCategoryColorDot` (Task 6.1).
- Produces:
  - `export interface FinancialCategoryFormValues { name: string; type: FinancialType; color: string | null; isActive: boolean }`
  - `export function FinancialCategoryDialog(props: { open: boolean; onOpenChange: (open: boolean) => void; category: FinancialCategory | null; isSubmitting: boolean; onSubmit: (values: FinancialCategoryFormValues) => void }): JSX.Element`

**Steps:**

- [ ] Criar `src/components/finance/FinancialCategoryDialog.tsx` com o conteudo completo:

```tsx
/**
 * FinancialCategoryDialog — Criar/editar uma categoria financeira.
 *
 * `category = null` => modo criacao. `category` preenchida => modo edicao.
 * O estado de submit/loading e controlado pelo componente pai via `isSubmitting`.
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { Loader2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinancialCategoryColorDot } from '@/components/finance/FinancialCategoryColorDot';
import type { FinancialCategory, FinancialType } from '@/types/finance';

export interface FinancialCategoryFormValues {
  name: string;
  type: FinancialType;
  color: string | null;
  isActive: boolean;
}

interface FinancialCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: FinancialCategory | null;
  isSubmitting: boolean;
  onSubmit: (values: FinancialCategoryFormValues) => void;
}

/**
 * Paleta de swatches — REVISADA 21/07.
 *
 * A cor da categoria e renderizada como dot DENTRO da linha da lista, ao lado
 * do valor colorido e do badge de status. Cores em 0-20deg (vermelho de
 * atraso), 150-170deg (verde de receita) e 190-205deg (cyan de interacao)
 * fazem o dot contradizer a semantica da propria linha.
 *
 * Estes swatches sao a UNICA forma de escolher cor — nao ha color picker
 * livre, senao o admin recria o problema na primeira categoria que cadastrar.
 */
const COLOR_SWATCHES = [
  '#9a7b4f', '#5b6b8c', '#4f7a8b', '#3f4d6b', '#6b7f5e',
  '#8a6d5a', '#7c6f9e', '#5f8a85', '#6e7fa3', '#8b7fa8', '#64748b',
];

export function FinancialCategoryDialog({
  open,
  onOpenChange,
  category,
  isSubmitting,
  onSubmit,
}: FinancialCategoryDialogProps) {
  const isEditing = !!category;

  const [name, setName] = useState('');
  const [type, setType] = useState<FinancialType>('expense');
  const [color, setColor] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState(false);

  // Sincroniza o form sempre que o dialog abre (com ou sem categoria).
  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? '');
    setType(category?.type ?? 'expense');
    setColor(category?.color ?? null);
    setIsActive(category?.isActive ?? true);
    setTouched(false);
  }, [open, category]);

  const trimmedName = name.trim();
  const nameError = touched && trimmedName.length === 0;
  const canSubmit = trimmedName.length > 0 && !isSubmitting;

  const handleSubmit = () => {
    setTouched(true);
    if (trimmedName.length === 0 || isSubmitting) return;
    onSubmit({
      name: trimmedName,
      type,
      color: color && color.trim().length > 0 ? color : null,
      isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere as informacoes da categoria financeira.'
              : 'Crie uma categoria para classificar receitas ou despesas.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(v) => v && setType(v as FinancialType)}
              className="justify-start"
            >
              <ToggleGroupItem value="income" aria-label="Receita" className="gap-1.5">
                <ArrowUpCircle className="h-4 w-4" />
                Receita
              </ToggleGroupItem>
              <ToggleGroupItem value="expense" aria-label="Despesa" className="gap-1.5">
                <ArrowDownCircle className="h-4 w-4" />
                Despesa
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="fin-cat-name">Nome</Label>
            <Input
              id="fin-cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Ex.: Marketing, Consultoria avulsa"
              autoFocus
              maxLength={80}
              aria-invalid={nameError}
            />
            {nameError && (
              <p className="text-xs text-destructive">Informe um nome para a categoria.</p>
            )}
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label>Cor (opcional)</Label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  className={cn(
                    'h-7 w-7 rounded-full border transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    color === swatch ? 'ring-2 ring-ring ring-offset-2' : 'border-black/10 dark:border-white/15',
                  )}
                  style={{ backgroundColor: swatch }}
                  aria-label={`Selecionar cor ${swatch}`}
                />
              ))}
              <button
                type="button"
                onClick={() => setColor(null)}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors hover:bg-muted',
                  color === null ? 'ring-2 ring-ring ring-offset-2' : 'border-dashed border-muted-foreground/40',
                )}
                aria-label="Sem cor"
              >
                <FinancialCategoryColorDot color={null} size={12} />
                Sem cor
              </button>
            </div>
          </div>

          {/* Ativo */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="fin-cat-active" className="cursor-pointer">Categoria ativa</Label>
              <p className="text-xs text-muted-foreground">
                Categorias inativas nao aparecem ao criar lancamentos.
              </p>
            </div>
            <Switch id="fin-cat-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Salvar' : 'Criar categoria'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] Confirmar que `src/components/ui/toggle-group.tsx` exporta `ToggleGroup` e `ToggleGroupItem`:

```bash
grep -n "export" src/components/ui/toggle-group.tsx
```
  - Saida esperada: linha contendo `export { ToggleGroup, ToggleGroupItem }`. Se o arquivo nao existir, instalar com `npx shadcn@latest add toggle-group` antes de prosseguir.

- [ ] Rodar typecheck: `npx tsc --noEmit`
  - Saida esperada: sem erros (exit code 0).

- [ ] Rodar lint no arquivo: `npx eslint src/components/finance/FinancialCategoryDialog.tsx`
  - Saida esperada: sem warnings nem errors (exit code 0).

- [ ] Commit:

```bash
git add src/components/finance/FinancialCategoryDialog.tsx
git commit -m "feat(finance): add FinancialCategoryDialog for create/edit

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git commit --amend --no-edit 2>/dev/null || true
```

> (Se `toggle-group` foi instalado nesta task, incluir `src/components/ui/toggle-group.tsx` no mesmo commit: `git add src/components/ui/toggle-group.tsx` antes do `git commit`.)

---

### Task 6.3: Pagina FinancialCategories — tabela + Dialog criar/editar

Pagina container que usa `DashboardLayout` + `PageHeader` + `AdminTabNav`, carrega categorias via `useFinancialCategories()`, renderiza uma tabela (nome com color dot, tipo, ativo, ordem) e integra o Dialog da Task 6.2 com `useCreateCategory`/`useUpdateCategory`. Sem reordenar nem excluir ainda (entram nas Tasks 6.4 e 6.5). Inclui estados de loading e vazio.

**Files:**
- Create: `src/pages/admin/FinancialCategories.tsx`

**Interfaces:**
- Consumes: `useFinancialCategories`, `useCreateCategory`, `useUpdateCategory` de `@/hooks/useFinancialCategoriesQuery` (Fase 3); `FinancialCategoryDialog`, `FinancialCategoryFormValues` (Task 6.2); `FinancialCategoryColorDot` (Task 6.1); `FinancialCategory` de `@/types/finance`.
- Produces: `export default function FinancialCategories(): JSX.Element` (registrada como rota na Task 6.5).

**Steps:**

- [ ] Criar `src/pages/admin/FinancialCategories.tsx` com o conteudo completo:

```tsx
/**
 * FinancialCategories — CRUD de categorias do modulo financeiro (admin).
 * Rota: /admin/financeiro/categorias
 */

import { useMemo, useState } from 'react';
import { Plus, FolderTree, Pencil, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FinancialCategoryDialog,
  type FinancialCategoryFormValues,
} from '@/components/finance/FinancialCategoryDialog';
import { FinancialCategoryColorDot } from '@/components/finance/FinancialCategoryColorDot';
import {
  useFinancialCategories,
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/useFinancialCategoriesQuery';
import type { FinancialCategory } from '@/types/finance';
import { toast } from 'sonner';

export default function FinancialCategories() {
  const { data: categories = [], isLoading } = useFinancialCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialCategory | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Ordena por tipo (despesa, receita) e depois por sortOrder/nome para exibicao.
  const sorted = useMemo(
    () =>
      [...categories].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'expense' ? -1 : 1;
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name, 'pt-BR');
      }),
    [categories],
  );

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const handleNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: FinancialCategory) => {
    setEditing(category);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: FinancialCategoryFormValues) => {
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, updates: values });
        toast.success(`Categoria "${values.name}" atualizada.`);
      } else {
        // Coloca a nova categoria no fim da lista do mesmo tipo.
        const maxOrder = categories
          .filter((c) => c.type === values.type)
          .reduce((max, c) => Math.max(max, c.sortOrder), 0);
        await createCategory.mutateAsync({ ...values, sortOrder: maxOrder + 1 });
        toast.success(`Categoria "${values.name}" criada.`);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar categoria.';
      // UNIQUE(name, type) — mensagem amigavel para duplicidade.
      toast.error(
        /duplicate|unique|23505/i.test(msg)
          ? 'Ja existe uma categoria com esse nome e tipo.'
          : msg,
      );
    }
  };

  const handleToggleActive = async (category: FinancialCategory) => {
    setTogglingId(category.id);
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        updates: { isActive: !category.isActive },
      });
      toast.success(
        category.isActive
          ? `Categoria "${category.name}" desativada.`
          : `Categoria "${category.name}" ativada.`,
      );
    } catch {
      toast.error('Erro ao alterar status da categoria.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Categorias Financeiras"
          description="Classifique receitas e despesas dos lancamentos manuais por categoria."
          actions={
            <Button onClick={handleNew} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Nova categoria
            </Button>
          }
          howItWorks={[
            'Categorias separam receitas e despesas e alimentam os graficos do fluxo de caixa.',
            'Desative uma categoria para esconde-la de novos lancamentos sem apagar o historico.',
            'Use a ordem para controlar a exibicao nos seletores.',
          ]}
        />

        <AdminTabNav />

        <div className="rounded-lg border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Carregando categorias...
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-full bg-muted p-3">
                <FolderTree className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Nenhuma categoria cadastrada</p>
                <p className="text-sm text-muted-foreground">
                  Crie sua primeira categoria para classificar os lancamentos.
                </p>
              </div>
              <Button onClick={handleNew} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nova categoria
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell w-20 text-center">Ordem</TableHead>
                  <TableHead className="w-24 text-center">Ativa</TableHead>
                  <TableHead className="w-16 text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((category) => (
                  <TableRow key={category.id} className={category.isActive ? '' : 'opacity-60'}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <FinancialCategoryColorDot color={category.color} />
                        <span className="font-medium">{category.name}</span>
                        {/* Tipo visivel em telas pequenas (coluna dedicada some abaixo de sm) */}
                        <Badge
                          variant={category.type === 'income' ? 'secondary' : 'destructive'}
                          className="sm:hidden"
                        >
                          {category.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={category.type === 'income' ? 'secondary' : 'destructive'}>
                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center tabular-nums text-muted-foreground">
                      {category.sortOrder}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={category.isActive}
                        disabled={togglingId === category.id}
                        onCheckedChange={() => handleToggleActive(category)}
                        aria-label={category.isActive ? 'Desativar categoria' : 'Ativar categoria'}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        aria-label={`Editar ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <FinancialCategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          category={editing}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
    </DashboardLayout>
  );
}
```

- [ ] Confirmar a assinatura de `useUpdateCategory`/`useCreateCategory` (devem aceitar/receber camelCase compativel). Inspecionar o hook da Fase 3:

```bash
grep -n "useCreateCategory\|useUpdateCategory\|mutationFn" src/hooks/useFinancialCategoriesQuery.ts
```
  - Saida esperada: `useCreateCategory` com `mutationFn` recebendo o input da categoria e `useUpdateCategory` recebendo `{ id, updates }`. Se a forma divergir (ex.: `updateCategory.mutateAsync(id, updates)` posicional), ajustar as chamadas em `FinancialCategories.tsx` para casar exatamente com o hook.

- [ ] Rodar typecheck: `npx tsc --noEmit`
  - Saida esperada: sem erros (exit code 0).

- [ ] Rodar lint: `npx eslint src/pages/admin/FinancialCategories.tsx`
  - Saida esperada: sem warnings nem errors (exit code 0).

- [ ] Commit:

```bash
git add src/pages/admin/FinancialCategories.tsx
git commit -m "feat(finance): add FinancialCategories page with table and create/edit dialog

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6.4: Reordenar categorias (setas subir/descer)

Adiciona controles de ordenacao por setas em cada linha. Subir/descer troca o `sortOrder` com o vizinho do **mesmo tipo** (despesas e receitas sao listas independentes), persistindo via `useUpdateCategory` para os dois itens trocados.

**Files:**
- Modify: `src/pages/admin/FinancialCategories.tsx`

**Interfaces:**
- Consumes: `useUpdateCategory` (ja importado); `FinancialCategory`.
- Produces: nenhuma nova exportacao (comportamento interno da pagina).

**Steps:**

- [ ] Em `src/pages/admin/FinancialCategories.tsx`, adicionar os icones de seta ao import existente do lucide. Substituir:

```tsx
import { Plus, FolderTree, Pencil, Loader2 } from 'lucide-react';
```

por:

```tsx
import { Plus, FolderTree, Pencil, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
```

- [ ] Adicionar o estado de reordenacao e o handler logo apos a declaracao de `togglingId`. Substituir:

```tsx
  const [togglingId, setTogglingId] = useState<string | null>(null);
```

por:

```tsx
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  /** Troca a posicao de `category` com o vizinho (acima/abaixo) do mesmo tipo. */
  const handleReorder = async (category: FinancialCategory, direction: 'up' | 'down') => {
    const sameType = sorted.filter((c) => c.type === category.type);
    const index = sameType.findIndex((c) => c.id === category.id);
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    const neighbor = sameType[neighborIndex];
    if (!neighbor) return;

    setReorderingId(category.id);
    try {
      // Troca os sortOrder dos dois itens.
      await Promise.all([
        updateCategory.mutateAsync({ id: category.id, updates: { sortOrder: neighbor.sortOrder } }),
        updateCategory.mutateAsync({ id: neighbor.id, updates: { sortOrder: category.sortOrder } }),
      ]);
    } catch {
      toast.error('Erro ao reordenar categoria.');
    } finally {
      setReorderingId(null);
    }
  };
```

- [ ] Trocar a celula de "Acoes" para incluir as setas. Substituir o bloco:

```tsx
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        aria-label={`Editar ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
```

por (note que esta task adiciona uma coluna nova de reordenacao; o `<TableHead>` correspondente entra no proximo step):

```tsx
                    <TableCell className="hidden md:table-cell">
                      {(() => {
                        const sameType = sorted.filter((c) => c.type === category.type);
                        const idx = sameType.findIndex((c) => c.id === category.id);
                        const isFirst = idx === 0;
                        const isLast = idx === sameType.length - 1;
                        const busy = reorderingId === category.id;
                        return (
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled={isFirst || busy}
                              onClick={() => handleReorder(category, 'up')}
                              aria-label={`Mover ${category.name} para cima`}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled={isLast || busy}
                              onClick={() => handleReorder(category, 'down')}
                              aria-label={`Mover ${category.name} para baixo`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        aria-label={`Editar ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
```

- [ ] Adicionar o cabecalho da nova coluna. Substituir:

```tsx
                  <TableHead className="w-24 text-center">Ativa</TableHead>
                  <TableHead className="w-16 text-right">Acoes</TableHead>
```

por:

```tsx
                  <TableHead className="w-24 text-center">Ativa</TableHead>
                  <TableHead className="hidden md:table-cell w-28 text-center">Reordenar</TableHead>
                  <TableHead className="w-16 text-right">Acoes</TableHead>
```

- [ ] Rodar typecheck: `npx tsc --noEmit`
  - Saida esperada: sem erros (exit code 0).

- [ ] Rodar lint: `npx eslint src/pages/admin/FinancialCategories.tsx`
  - Saida esperada: sem warnings nem errors (exit code 0).

- [ ] Commit:

```bash
git add src/pages/admin/FinancialCategories.tsx
git commit -m "feat(finance): allow reordering financial categories via up/down arrows

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6.5: Excluir categoria com confirmacao + registrar rota

Adiciona o botao de excluir (lixeira) com `AlertDialog` de confirmacao, usando `useDeleteCategory`. Como a FK em `financial_entries.category_id` e `ON DELETE SET NULL` (Fase 1), excluir nao quebra lancamentos — apenas remove a classificacao; o texto do dialog avisa isso. Por fim, registra a rota `/admin/financeiro/categorias` em `App.tsx` e verifica visualmente toda a tela.

**Files:**
- Modify: `src/pages/admin/FinancialCategories.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Consumes: `useDeleteCategory` de `@/hooks/useFinancialCategoriesQuery` (Fase 3); componentes `AlertDialog*` de `@/components/ui/alert-dialog`.
- Produces: rota `/admin/financeiro/categorias` apontando para `FinancialCategories` dentro de `<ProtectedRoute allowedTypes={['admin']}>`.

**Steps:**

- [ ] Em `src/pages/admin/FinancialCategories.tsx`, adicionar `Trash2` ao import do lucide. Substituir:

```tsx
import { Plus, FolderTree, Pencil, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
```

por:

```tsx
import { Plus, FolderTree, Pencil, Loader2, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
```

- [ ] Adicionar o import do `AlertDialog` logo apos o import do `Switch`. Inserir:

```tsx
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
```

- [ ] Adicionar `useDeleteCategory` ao import dos hooks. Substituir:

```tsx
import {
  useFinancialCategories,
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/useFinancialCategoriesQuery';
```

por:

```tsx
import {
  useFinancialCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useFinancialCategoriesQuery';
```

- [ ] Instanciar o hook e o estado de exclusao. Substituir:

```tsx
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
```

por:

```tsx
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
```

- [ ] Adicionar o estado e o handler de exclusao logo apos o handler `handleReorder` (antes do `return`). Inserir:

```tsx
  const [deleting, setDeleting] = useState<FinancialCategory | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCategory.mutateAsync(deleting.id);
      toast.success(`Categoria "${deleting.name}" excluida.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir categoria.';
      toast.error(msg);
    } finally {
      setDeleting(null);
    }
  };
```

- [ ] Adicionar o botao de lixeira na celula de acoes. Substituir:

```tsx
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        aria-label={`Editar ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
```

por:

```tsx
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          aria-label={`Editar ${category.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleting(category)}
                          aria-label={`Excluir ${category.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
```

- [ ] Adicionar o `AlertDialog` de confirmacao logo apos o `<FinancialCategoryDialog ... />` (ainda dentro do `<div className="space-y-6">`). Substituir:

```tsx
        <FinancialCategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          category={editing}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
    </DashboardLayout>
```

por:

```tsx
        <FinancialCategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          category={editing}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />

        <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
              <AlertDialogDescription>
                A categoria <strong>{deleting?.name}</strong> sera removida. Lancamentos que a usavam
                permanecem, mas ficarao <strong>sem categoria</strong>. Esta acao nao pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteCategory.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteCategory.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  void handleConfirmDelete();
                }}
              >
                {deleteCategory.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
```

> Nota (memoria do projeto): `AlertDialogAction` fecha o dialog ao clicar; por isso usamos `e.preventDefault()` e fechamos manualmente no `finally` do handler (`setDeleting(null)`), evitando fechar antes da conclusao do delete async.

- [ ] Localizar o ponto de registro das rotas admin em `App.tsx` para inserir a nova rota junto das demais `/admin/*`:

```bash
grep -n "admin/financeiro\|admin/planos\|FinancialCategories\|ProtectedRoute allowedTypes={\['admin'\]}" App.tsx
```
  - Saida esperada: linhas mostrando rotas admin existentes (ex.: `/admin/planos`) dentro de `<ProtectedRoute allowedTypes={['admin']}>`. Se ja houver rotas `/admin/financeiro` (Fases 3/5), inserir a de categorias ao lado delas. Caso contrario, inserir junto ao bloco de rotas admin.

- [ ] Adicionar o import lazy de `FinancialCategories` em `App.tsx`, junto aos demais imports de paginas admin (seguir o mesmo padrao `lazy`/import direto ja usado no arquivo). Exemplo (lazy, se o arquivo usa `lazy(() => import(...))`):

```tsx
const FinancialCategories = lazy(() => import('@/pages/admin/FinancialCategories'));
```

  Se `App.tsx` usa import direto no topo (padrao das demais paginas admin), usar:

```tsx
import FinancialCategories from '@/pages/admin/FinancialCategories';
```

- [ ] Adicionar a rota dentro do bloco `<ProtectedRoute allowedTypes={['admin']}>` (mesmo agrupamento das outras rotas admin). Inserir:

```tsx
<Route path="/admin/financeiro/categorias" element={<FinancialCategories />} />
```

- [ ] Rodar typecheck: `npx tsc --noEmit`
  - Saida esperada: sem erros (exit code 0).

- [ ] Rodar lint: `npx eslint src/pages/admin/FinancialCategories.tsx App.tsx`
  - Saida esperada: sem warnings nem errors (exit code 0).

- [ ] Verificacao visual no dev server. Iniciar (se ainda nao estiver rodando) e abrir a tela:

```bash
npm run dev
```
  - Acessar `http://localhost:3000/login`, entrar com `admin@recrutars.com` / `Admin@123`.
  - Navegar para `http://localhost:3000/admin/financeiro/categorias`.
  - Confirmar visualmente:
    1. A tab "Categorias" aparece ativa no `AdminTabNav` do grupo Fluxo de Caixa.
    2. Se houver seed de categorias (Fase 1), a tabela lista nome + color dot, badge Receita/Despesa, ordem e o Switch de Ativa.
    3. "Nova categoria" abre o Dialog; criar uma categoria (ex.: tipo Despesa, nome "Teste 6.5", cor cyan) -> toast de sucesso e a linha aparece na tabela.
    4. Editar (lapis) reabre o Dialog com os valores; alterar o nome salva e atualiza a linha.
    5. As setas de reordenar (>= md) trocam a posicao com o vizinho do mesmo tipo e persistem apos refresh.
    6. O Switch desativa/ativa (linha fica com `opacity-60` quando inativa) e mostra toast.
    7. A lixeira abre o `AlertDialog`; "Excluir" remove a linha com toast e nao deixa erro no console.
    8. Estado vazio: se nao houver categorias, aparece o bloco "Nenhuma categoria cadastrada" com botao.

- [ ] Commit:

```bash
git add src/pages/admin/FinancialCategories.tsx App.tsx
git commit -m "feat(finance): add delete confirmation and register categories route

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```


---

## Fase 7: Recorrência automática (geração agendada)

> **Pré-requisitos (já entregues por fases anteriores):**
> - Fase 1: tabelas `financial_entries`, `financial_recurrences`, RPCs base (`create_financial_entry_with_installments`, `mark_financial_entry_paid`), e um **stub** de `generate_due_recurrences()` (migration 124). Vitest configurado (`npm run test`).
> - Fase 2: serviço `IFinanceService` com `getRecurrences/createRecurrence/updateRecurrence/deleteRecurrence`, hooks `useRecurrences/useCreateRecurrence/useUpdateRecurrence/useDeleteRecurrence` em `src/hooks/useFinancialDashboardQuery.ts`, query keys `recurrenceKeys` e `financeKeys`. Util `calcInstallments` em `src/lib/finance/installments.ts`.
> - Fase 4: componente `RecurrenceFields` (form de regra).
>
> **Objetivo desta fase:** materializar automaticamente os `financial_entries` pendentes a partir das regras em `financial_recurrences`, de forma **idempotente** (nunca duplicar uma ocorrência), agendar a execução diária via **pg_cron** (extensão `pg_cron 1.6.4` já instalada — `generate_due_recurrences()` é SQL puro, não precisa de `pg_net`/Edge Function), expor um gatilho manual ("Gerar agora") e uma tela de gerenciamento das regras.
>
> **Decisão de arquitetura — pg_cron direto (sem Edge Function):** como a materialização é 100% feita dentro do Postgres (sem chamada HTTP externa), agendamos `cron.schedule(...)` chamando a RPC diretamente. Isso evita o overhead de `pg_net` + uma Edge Function + segredos. A seção "Alternativa" da Task 7.3 documenta o caminho via Edge Function caso seja necessário no futuro (ex.: disparar webhook/notificação ao gerar).

---

### Task 7.1: Lógica pura de datas de recorrência (TDD)

Extrai a aritmética de datas da recorrência para um util **puro e testável** com vitest, espelhando o cálculo de datas de `calcInstallments`. A RPC SQL (Task 7.2) replica essa mesma lógica em PL/pgSQL — manter as duas em sincronia é a razão de isolar e testar a versão TS primeiro (serve de especificação executável).

**Files:**
- Test: `src/lib/finance/recurrence.test.ts` (Create)
- Create: `src/lib/finance/recurrence.ts`

**Interfaces:**
- Consumes: `RecurrenceFrequency` de `src/types/finance.ts` (`'weekly'|'monthly'|'quarterly'|'yearly'`)
- Produces:
  - `nextRunFromDate(currentISO: string, frequency: RecurrenceFrequency, intervalN: number, dayOfMonth?: number): string` — dada uma data de ocorrência (ISO `YYYY-MM-DD`), retorna a próxima data ISO. Para `monthly`/`quarterly`/`yearly` com `dayOfMonth`, fixa o dia (clamp ao último dia do mês). Para `weekly`, soma `7*intervalN` dias.
  - `enumerateDueDates(startISO: string, todayISO: string, frequency: RecurrenceFrequency, intervalN: number, dayOfMonth: number | undefined, endISO: string | undefined): string[]` — lista todas as datas de vencimento `>= startISO` e `<= todayISO` (e `<= endISO` se houver), em ordem crescente. Limite duro de 240 iterações (guarda contra loop infinito).

**Steps:**

- [ ] Escrever o teste falhando em `src/lib/finance/recurrence.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { nextRunFromDate, enumerateDueDates } from './recurrence';

describe('nextRunFromDate', () => {
  it('avança 1 mês mantendo o dia 5', () => {
    expect(nextRunFromDate('2026-01-05', 'monthly', 1, 5)).toBe('2026-02-05');
  });

  it('faz clamp do dia 31 para fevereiro (28)', () => {
    expect(nextRunFromDate('2026-01-31', 'monthly', 1, 31)).toBe('2026-02-28');
  });

  it('avança a cada 2 meses (interval=2)', () => {
    expect(nextRunFromDate('2026-01-10', 'monthly', 2, 10)).toBe('2026-03-10');
  });

  it('avança 1 semana', () => {
    expect(nextRunFromDate('2026-01-05', 'weekly', 1)).toBe('2026-01-12');
  });

  it('avança trimestral (3 meses por unidade de interval)', () => {
    expect(nextRunFromDate('2026-01-15', 'quarterly', 1, 15)).toBe('2026-04-15');
  });

  it('avança anual', () => {
    expect(nextRunFromDate('2026-02-28', 'yearly', 1, 28)).toBe('2027-02-28');
  });
});

describe('enumerateDueDates', () => {
  it('lista ocorrências mensais de jan a abr (start no dia 5, hoje 2026-04-10)', () => {
    expect(
      enumerateDueDates('2026-01-05', '2026-04-10', 'monthly', 1, 5, undefined),
    ).toEqual(['2026-01-05', '2026-02-05', '2026-03-05', '2026-04-05']);
  });

  it('respeita endDate cortando ocorrências futuras', () => {
    expect(
      enumerateDueDates('2026-01-05', '2026-12-31', 'monthly', 1, 5, '2026-03-05'),
    ).toEqual(['2026-01-05', '2026-02-05', '2026-03-05']);
  });

  it('retorna vazio quando start é depois de hoje', () => {
    expect(
      enumerateDueDates('2026-06-05', '2026-04-10', 'monthly', 1, 5, undefined),
    ).toEqual([]);
  });

  it('lista ocorrências semanais (interval=2) sem ultrapassar hoje', () => {
    expect(
      enumerateDueDates('2026-01-01', '2026-01-30', 'weekly', 2, undefined, undefined),
    ).toEqual(['2026-01-01', '2026-01-15', '2026-01-29']);
  });
});
```

- [ ] Rodar e ver falhar (módulo ainda não existe):
```bash
npm run test -- src/lib/finance/recurrence.test.ts
```
Saída esperada: `Error: Failed to load url ./recurrence` / `No test files found` falha de import — testes não passam.

- [ ] Implementar o mínimo em `src/lib/finance/recurrence.ts`:
```ts
/**
 * Pure date arithmetic for financial recurrences.
 *
 * Mirrors the PL/pgSQL `next_recurrence_date` used inside
 * `generate_due_recurrences()` — keep both in sync. Works on ISO date
 * strings (YYYY-MM-DD) in UTC to avoid timezone drift.
 */

import type { RecurrenceFrequency } from '@/types/finance';

const MAX_ITERATIONS = 240;

/** Parse an ISO YYYY-MM-DD into a UTC Date (no time component). */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a UTC Date back to YYYY-MM-DD. */
function toISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Last day of the month for a given year/month (month is 0-based). */
function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Add N months to a date, clamping the day to the target month's length. */
function addMonths(date: Date, months: number, dayOfMonth?: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const desiredDay = dayOfMonth ?? date.getUTCDate();
  const clampedDay = Math.min(desiredDay, lastDayOfMonth(targetYear, targetMonth));
  return new Date(Date.UTC(targetYear, targetMonth, clampedDay));
}

/**
 * Given an occurrence date, returns the next occurrence date for the rule.
 * - weekly: +7 * interval days
 * - monthly: +interval months (clamp day)
 * - quarterly: +3 * interval months (clamp day)
 * - yearly: +12 * interval months (clamp day)
 */
export function nextRunFromDate(
  currentISO: string,
  frequency: RecurrenceFrequency,
  intervalN: number,
  dayOfMonth?: number,
): string {
  const date = parseISO(currentISO);
  const step = Math.max(1, intervalN);

  if (frequency === 'weekly') {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 7 * step);
    return toISO(next);
  }

  const monthsPerStep =
    frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 : 12;
  return toISO(addMonths(date, monthsPerStep * step, dayOfMonth));
}

/**
 * Lists all due dates from startISO up to (and including) todayISO, bounded by
 * endISO when present. Inclusive on both ends.
 */
export function enumerateDueDates(
  startISO: string,
  todayISO: string,
  frequency: RecurrenceFrequency,
  intervalN: number,
  dayOfMonth: number | undefined,
  endISO: string | undefined,
): string[] {
  const today = parseISO(todayISO);
  const end = endISO ? parseISO(endISO) : null;
  const dates: string[] = [];

  let cursorISO = startISO;
  let cursor = parseISO(cursorISO);

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (cursor.getTime() > today.getTime()) break;
    if (end && cursor.getTime() > end.getTime()) break;
    dates.push(cursorISO);
    cursorISO = nextRunFromDate(cursorISO, frequency, intervalN, dayOfMonth);
    cursor = parseISO(cursorISO);
  }

  return dates;
}
```

- [ ] Rodar e ver passar:
```bash
npm run test -- src/lib/finance/recurrence.test.ts
```
Saída esperada: `Test Files  1 passed (1)` / `Tests  10 passed (10)`.

- [ ] Typecheck:
```bash
npx tsc --noEmit
```
Saída esperada: sem erros (exit 0).

- [ ] Commit:
```bash
git add src/lib/finance/recurrence.ts src/lib/finance/recurrence.test.ts
git commit -m "$(cat <<'EOF'
feat(finance): add pure recurrence date helpers with vitest coverage

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7.2: RPC `generate_due_recurrences()` idempotente (migration 126)

Reescreve a função `generate_due_recurrences()` (substituindo o stub da migration 124) para materializar, de cada `financial_recurrences` ativa, todos os `financial_entries` `pending` cujos vencimentos já chegaram — **sem duplicar** (guarda por `recurrence_id + due_date`). Replica a aritmética de datas do util da Task 7.1 num helper PL/pgSQL `next_recurrence_date`. Avança `next_run_date` da regra ao final. `SECURITY DEFINER`, padrão das migrations 057/060.

**Files:**
- Create: `sql/migrations/126_generate_due_recurrences.sql`

**Interfaces:**
- Consumes: tabelas `financial_recurrences` e `financial_entries` (Fase 1)
- Produces: função SQL `public.generate_due_recurrences() RETURNS integer` (nº de entries criados) + `public.next_recurrence_date(p_date date, p_frequency text, p_interval int, p_day_of_month int) RETURNS date` (SECURITY DEFINER, IMMUTABLE)

**Steps:**

- [ ] Escrever a migration completa em `sql/migrations/126_generate_due_recurrences.sql`:
```sql
-- Migration 126: generate_due_recurrences (idempotent materialization)
-- Substitui o stub da migration 124. Para cada regra ativa em
-- financial_recurrences, cria os financial_entries pendentes cujos vencimentos
-- ja chegaram (ate current_date), sem duplicar (guarda por recurrence_id + due_date).
-- Agendada via pg_cron (migration 127).

-- ============================================================================
-- Helper: next_recurrence_date — espelha src/lib/finance/recurrence.ts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.next_recurrence_date(
  p_date DATE,
  p_frequency TEXT,
  p_interval INT,
  p_day_of_month INT
) RETURNS DATE AS $$
DECLARE
  v_step INT := GREATEST(1, COALESCE(p_interval, 1));
  v_months INT;
  v_target DATE;
  v_year INT;
  v_month INT;
  v_last_day INT;
  v_day INT;
BEGIN
  IF p_frequency = 'weekly' THEN
    RETURN p_date + (7 * v_step);
  END IF;

  v_months := v_step * CASE p_frequency
    WHEN 'monthly' THEN 1
    WHEN 'quarterly' THEN 3
    WHEN 'yearly' THEN 12
    ELSE 1
  END;

  -- Avança v_months e faz clamp do dia (last day of month)
  v_target := (date_trunc('month', p_date) + (v_months || ' months')::INTERVAL)::DATE;
  v_year := EXTRACT(YEAR FROM v_target)::INT;
  v_month := EXTRACT(MONTH FROM v_target)::INT;
  v_last_day := EXTRACT(DAY FROM (date_trunc('month', v_target) + INTERVAL '1 month - 1 day'))::INT;
  v_day := LEAST(COALESCE(p_day_of_month, EXTRACT(DAY FROM p_date)::INT), v_last_day);

  RETURN make_date(v_year, v_month, v_day);
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER;

-- ============================================================================
-- generate_due_recurrences — materializa ocorrencias pendentes (idempotente)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_due_recurrences()
RETURNS INTEGER AS $$
DECLARE
  v_rule RECORD;
  v_due DATE;
  v_created INTEGER := 0;
  v_guard INTEGER;
BEGIN
  FOR v_rule IN
    SELECT * FROM public.financial_recurrences
    WHERE is_active = true
      AND start_date <= current_date
  LOOP
    -- Ponto de partida: maior vencimento ja materializado + 1 ocorrencia, ou start_date.
    SELECT MAX(due_date) INTO v_due
    FROM public.financial_entries
    WHERE recurrence_id = v_rule.id;

    IF v_due IS NULL THEN
      v_due := v_rule.start_date;
    ELSE
      v_due := public.next_recurrence_date(
        v_due, v_rule.frequency, v_rule.interval, v_rule.day_of_month
      );
    END IF;

    v_guard := 0;
    WHILE v_due <= current_date LOOP
      EXIT WHEN v_guard >= 240;                       -- guarda anti-loop
      EXIT WHEN v_rule.end_date IS NOT NULL AND v_due > v_rule.end_date;

      -- Idempotencia: so insere se nao existir entry para (recurrence_id, due_date)
      IF NOT EXISTS (
        SELECT 1 FROM public.financial_entries
        WHERE recurrence_id = v_rule.id AND due_date = v_due
      ) THEN
        INSERT INTO public.financial_entries (
          type, status, category_id, description,
          counterparty_name, counterparty_company_id,
          amount, currency, payment_method,
          competence_date, due_date, recurrence_id, created_by
        ) VALUES (
          v_rule.type, 'pending', v_rule.category_id, v_rule.description,
          v_rule.counterparty_name, v_rule.counterparty_company_id,
          v_rule.amount, 'BRL', v_rule.payment_method,
          v_due, v_due, v_rule.id, v_rule.created_by
        );
        v_created := v_created + 1;
      END IF;

      v_due := public.next_recurrence_date(
        v_due, v_rule.frequency, v_rule.interval, v_rule.day_of_month
      );
      v_guard := v_guard + 1;
    END LOOP;

    -- Atualiza next_run_date da regra (proxima ocorrencia ainda nao materializada).
    UPDATE public.financial_recurrences
    SET next_run_date = v_due
    WHERE id = v_rule.id;
  END LOOP;

  RETURN v_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permite chamada via API autenticada (RPC) e por superuser/cron.
GRANT EXECUTE ON FUNCTION public.generate_due_recurrences() TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_recurrence_date(DATE, TEXT, INT, INT) TO authenticated;
```

- [ ] Aplicar a migration via MCP Supabase (project_id `filackbesialiapjwijb`), `name: "126_generate_due_recurrences"`, com o SQL acima. Saída esperada: sucesso, sem erro.

- [ ] Verificar idempotência manualmente via `execute_sql` (criar regra de teste, gerar duas vezes, conferir que a 2ª gera 0):
```sql
-- Regra mensal retroativa (dia 5, de jan/2026 ate hoje 2026-06-17)
INSERT INTO public.financial_recurrences
  (type, description, amount, frequency, interval, day_of_month, start_date, is_active)
VALUES
  ('expense', 'TESTE aluguel mensal', 2500.00, 'monthly', 1, 5, '2026-01-05', true)
RETURNING id;

-- 1a geracao: deve criar 6 entries (jan,fev,mar,abr,mai,jun)
SELECT public.generate_due_recurrences() AS first_run;

-- 2a geracao: deve retornar 0 (idempotente)
SELECT public.generate_due_recurrences() AS second_run;

-- Conferir total materializado e next_run_date
SELECT count(*) AS entries,
       (SELECT next_run_date FROM public.financial_recurrences WHERE description = 'TESTE aluguel mensal') AS next_run
FROM public.financial_entries
WHERE recurrence_id = (SELECT id FROM public.financial_recurrences WHERE description = 'TESTE aluguel mensal');
```
Saída esperada: `first_run = 6`, `second_run = 0`, `entries = 6`, `next_run = 2026-07-05`.

- [ ] Limpar os dados de teste via `execute_sql`:
```sql
DELETE FROM public.financial_entries
WHERE recurrence_id = (SELECT id FROM public.financial_recurrences WHERE description = 'TESTE aluguel mensal');
DELETE FROM public.financial_recurrences WHERE description = 'TESTE aluguel mensal';
```
Saída esperada: linhas removidas, sem erro.

- [ ] Rodar advisors (segurança) para confirmar que as funções SECURITY DEFINER não geraram alertas novos de `search_path`:
```
get_advisors(project_id="filackbesialiapjwijb", type="security")
```
Se aparecer `function_search_path_mutable` para as duas funções novas, anexar `SET search_path = public` na definição e reaplicar a migration (substituir `LANGUAGE plpgsql ... SECURITY DEFINER` por `LANGUAGE plpgsql ... SECURITY DEFINER SET search_path = public`). Caso contrário, seguir.

- [ ] Commit:
```bash
git add sql/migrations/126_generate_due_recurrences.sql
git commit -m "$(cat <<'EOF'
feat(finance): idempotent generate_due_recurrences RPC (migration 126)

Materializes pending financial_entries per active recurrence rule up to
current_date, guarded by (recurrence_id, due_date) to never duplicate.
Mirrors src/lib/finance/recurrence.ts date math in next_recurrence_date.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7.3: Agendamento diário via pg_cron (migration 127)

Agenda `generate_due_recurrences()` para rodar todo dia às 06:15 UTC (≈ 03:15 BRT) via pg_cron (extensão já instalada, `1.6.4`). Como a função é SQL puro, o cron a chama diretamente — sem pg_net nem Edge Function. Idempotente por design (Task 7.2), então rodar diariamente é seguro.

**Files:**
- Create: `sql/migrations/127_schedule_recurrences_cron.sql`

**Interfaces:**
- Consumes: `public.generate_due_recurrences()` (Task 7.2), extensão `pg_cron`
- Produces: job pg_cron `generate-financial-recurrences` (cron `15 6 * * *`)

**Steps:**

- [ ] Escrever a migration em `sql/migrations/127_schedule_recurrences_cron.sql`:
```sql
-- Migration 127: agenda generate_due_recurrences via pg_cron
-- pg_cron 1.6.4 ja instalado. A funcao e SQL puro (sem HTTP), entao o cron a
-- chama diretamente. Idempotente: rodar diariamente nao duplica ocorrencias.

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove agendamento anterior se reaplicada (idempotente).
DO $$
BEGIN
  PERFORM cron.unschedule('generate-financial-recurrences')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'generate-financial-recurrences'
  );
END;
$$;

-- 06:15 UTC diariamente (~03:15 BRT).
SELECT cron.schedule(
  'generate-financial-recurrences',
  '15 6 * * *',
  $$ SELECT public.generate_due_recurrences(); $$
);
```

- [ ] Aplicar via MCP Supabase, `name: "127_schedule_recurrences_cron"`. Saída esperada: sucesso.

- [ ] Confirmar o job criado via `execute_sql`:
```sql
SELECT jobid, jobname, schedule, active, command
FROM cron.job
WHERE jobname = 'generate-financial-recurrences';
```
Saída esperada: 1 linha, `schedule = '15 6 * * *'`, `active = true`, `command` contendo `generate_due_recurrences()`.

- [ ] (Opcional, confirmar execução) Disparar o job manualmente e checar o histórico via `execute_sql`:
```sql
-- Executa a mesma chamada que o cron faria (deve retornar nº de entries gerados).
SELECT public.generate_due_recurrences() AS generated_now;
```
Saída esperada: inteiro `>= 0` sem erro. (O histórico real do cron aparece em `cron.job_run_details` após o horário agendado.)

- [ ] Documentar no spec a alternativa Edge Function (apenas referência, **não** implementar agora). Adicionar como comentário no topo da própria migration 127 — **já incluído** no cabeçalho. Para o caso futuro (disparar webhook/notificação ao gerar), o caminho seria: habilitar `pg_net`, criar Edge Function `generate-financial-recurrences` (`verify_jwt = false`, validada por `x-cron-key` header igual ao padrão de `migrate-certificates-to-storage`) que chama a RPC via `service_role`, e trocar o `command` do cron por `SELECT net.http_post(...)`. Registrar isso no design spec.

- [ ] Atualizar o design spec com a decisão de agendamento. Editar `docs/superpowers/specs/2026-06-17-lancamentos-financeiros-design.md`, na seção "4.5 Funções / RPCs", substituindo a linha de `generate_due_recurrences()` para refletir pg_cron direto:
```
- `generate_due_recurrences()` — para cada `financial_recurrences` ativa, materializa as ocorrências `pending` faltantes até `current_date`. **Idempotente** (guarda por `recurrence_id + due_date`). Agendada via **pg_cron diário** (`15 6 * * *`, migration 127) chamando a RPC diretamente — função é SQL puro, não requer pg_net/Edge Function. Alternativa documentada (Edge Function + pg_net) reservada para disparo de webhook/notificação no futuro.
```

- [ ] Commit:
```bash
git add sql/migrations/127_schedule_recurrences_cron.sql "docs/superpowers/specs/2026-06-17-lancamentos-financeiros-design.md"
git commit -m "$(cat <<'EOF'
feat(finance): schedule generate_due_recurrences daily via pg_cron

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7.4: Gatilho manual no serviço e hook (`generateDueRecurrences` + `useGenerateDueRecurrences`)

Expõe a RPC `generate_due_recurrences()` na camada de serviço e via React Query, para o botão "Gerar agora" da tela de gerenciamento (Task 7.5). Segue o padrão de mutation com `invalidateQueries` de `useFinancialDashboardQuery.ts`.

**Files:**
- Modify: `src/services/finance/financeService.ts`
- Modify: `src/services/finance/financeService.supabase.ts`
- Modify: `src/hooks/useFinancialDashboardQuery.ts`

**Interfaces:**
- Consumes: RPC `generate_due_recurrences` (Task 7.2); `supabase` client (`src/lib/supabase.ts`); `financeKeys`, `recurrenceKeys` (Fase 2)
- Produces:
  - `IFinanceService.generateDueRecurrences(): Promise<{ generated: number }>`
  - `useGenerateDueRecurrences()` hook (mutation, invalida `financeKeys.all` + `recurrenceKeys.all`)

**Steps:**

- [ ] Adicionar o método à interface em `src/services/finance/financeService.ts`. Após a última assinatura de recorrências (`deleteRecurrence(id: string): Promise<void>;`), inserir:
```ts
  /**
   * Runs the server-side recurrence materializer on demand (same RPC the daily
   * pg_cron job calls). Idempotent — safe to invoke repeatedly. Returns the
   * number of financial_entries created in this run.
   */
  generateDueRecurrences(): Promise<{ generated: number }>;
```

- [ ] Implementar em `src/services/finance/financeService.supabase.ts`. Adicionar o método à classe (junto dos demais métodos de recorrência), usando o `supabase` client já importado no arquivo:
```ts
  async generateDueRecurrences(): Promise<{ generated: number }> {
    const { data, error } = await supabase.rpc('generate_due_recurrences');
    if (error) {
      throw { code: 'GENERATE_RECURRENCES_FAILED', message: error.message, details: error } as ServiceError;
    }
    return { generated: typeof data === 'number' ? data : 0 };
  }
```
> Nota: se `ServiceError` ainda não estiver importado neste arquivo, adicionar `import type { ServiceError } from '@/services/types';` no topo (verificar imports existentes antes de duplicar).

- [ ] Adicionar o hook em `src/hooks/useFinancialDashboardQuery.ts`, ao final do bloco de recorrências:
```ts
/**
 * Mutation: materialize pending recurrence occurrences on demand.
 * Invalidates dashboard summary, entry lists and recurrence rules so the new
 * pending entries (and updated next_run_date) appear immediately.
 */
export function useGenerateDueRecurrences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const svc = await getFinanceService();
      return svc.generateDueRecurrences();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.all });
      qc.invalidateQueries({ queryKey: recurrenceKeys.all });
    },
    onError: (err) => {
      console.error('[Finance] generateDueRecurrences failed:', err);
    },
  });
}
```
> Verificar que `useMutation`, `useQueryClient`, `getFinanceService`, `financeKeys` e `recurrenceKeys` já estão importados no arquivo (foram criados na Fase 2); não duplicar imports.

- [ ] Regenerar os tipos do banco (a RPC nova aparece em `Database['public']['Functions']`) para o `.rpc('generate_due_recurrences')` tipar sem erro. Via MCP Supabase `generate_typescript_types` (project_id `filackbesialiapjwijb`) e sobrescrever `src/types/database.ts` com a saída (manter o arquivo no padrão atual do projeto). Saída esperada: arquivo regenerado contendo `generate_due_recurrences` em `Functions`.

- [ ] Lint + typecheck:
```bash
npm run lint
npx tsc --noEmit
```
Saída esperada: sem erros (exit 0). Se `tsc` reclamar que `generate_due_recurrences` não existe em `Functions`, confirmar a regeneração dos tipos do passo anterior.

- [ ] Commit:
```bash
git add src/services/finance/financeService.ts src/services/finance/financeService.supabase.ts src/hooks/useFinancialDashboardQuery.ts src/types/database.ts
git commit -m "$(cat <<'EOF'
feat(finance): manual generateDueRecurrences trigger (service + hook)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7.5: Tela de gerenciamento de regras de recorrência

Tela admin que lista as regras de `financial_recurrences`, permite criar/editar (reusando o `RecurrenceFields` da Fase 4), ativar/desativar, excluir, e disparar a geração imediata ("Gerar agora", via `useGenerateDueRecurrences`). Usa `DashboardLayout userType="admin"` + `AdminTabNav`, padrão das demais telas admin. Registra rota e aba.

**Files:**
- Create: `src/components/finance/RecurrenceRulesTable.tsx`
- Create: `src/pages/admin/FinancialRecurrences.tsx`
- Modify: `src/config/adminTabConfig.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useRecurrences`, `useCreateRecurrence`, `useUpdateRecurrence`, `useDeleteRecurrence` (Fase 2), `useGenerateDueRecurrences` (Task 7.4), `FinancialRecurrence`, `RecurrenceFrequency` (types), `RecurrenceFields` (Fase 4), shadcn `Table`/`Sheet`/`Switch`/`Button`/`AlertDialog`, `useToast`
- Produces: rota `/admin/financeiro/recorrencias` → `FinancialRecurrences`; entrada de aba `Recorrências` no grupo `fluxo-caixa` de `ADMIN_TAB_GROUPS`; componente `RecurrenceRulesTable`

**Steps:**

- [ ] Criar `src/components/finance/RecurrenceRulesTable.tsx` (tabela pura de apresentação; recebe callbacks):
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { OriginBadge } from '@/components/finance/OriginBadge';
import type { FinancialRecurrence, RecurrenceFrequency } from '@/types/finance';

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function describeSchedule(r: FinancialRecurrence): string {
  const freq = FREQUENCY_LABELS[r.frequency].toLowerCase();
  const everyN = r.interval > 1 ? `a cada ${r.interval} ` : '';
  if (r.frequency === 'monthly' && r.dayOfMonth) {
    return `Repete ${everyN}${freq} no dia ${r.dayOfMonth}`;
  }
  return `Repete ${everyN}${freq}`.trim();
}

interface RecurrenceRulesTableProps {
  recurrences: FinancialRecurrence[];
  onEdit: (rule: FinancialRecurrence) => void;
  onToggleActive: (rule: FinancialRecurrence) => void;
  onDelete: (rule: FinancialRecurrence) => void;
  busyId?: string | null;
}

export function RecurrenceRulesTable({
  recurrences,
  onEdit,
  onToggleActive,
  onDelete,
  busyId,
}: RecurrenceRulesTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead className="hidden md:table-cell">Natureza</TableHead>
            <TableHead className="hidden md:table-cell">Frequência</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="hidden lg:table-cell">Próxima geração</TableHead>
            <TableHead className="text-center">Ativa</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recurrences.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                <div>{r.description}</div>
                <div className="text-xs text-muted-foreground md:hidden">{describeSchedule(r)}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant={r.type === 'income' ? 'default' : 'secondary'}>
                  {r.type === 'income' ? 'Receita' : 'Despesa'}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {describeSchedule(r)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatBRL(r.amount)}</TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {r.nextRunDate
                  ? new Date(`${r.nextRunDate}T00:00:00`).toLocaleDateString('pt-BR')
                  : '—'}
              </TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={r.isActive}
                  disabled={busyId === r.id}
                  onCheckedChange={() => onToggleActive(r)}
                  aria-label={r.isActive ? 'Desativar recorrência' : 'Ativar recorrência'}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(r)} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(r)}
                  aria-label="Excluir"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {recurrences.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Nenhuma regra de recorrência cadastrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] Criar a página `src/pages/admin/FinancialRecurrences.tsx`:
```tsx
import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RecurrenceRulesTable } from '@/components/finance/RecurrenceRulesTable';
import { RecurrenceFields } from '@/components/finance/RecurrenceFields';
import {
  useRecurrences, useCreateRecurrence, useUpdateRecurrence,
  useDeleteRecurrence, useGenerateDueRecurrences,
} from '@/hooks/useFinancialDashboardQuery';
import { useToast } from '@/hooks/use-toast';
import type { FinancialRecurrence } from '@/types/finance';

export default function FinancialRecurrences() {
  const { data: recurrences = [], isLoading } = useRecurrences();
  const createRule = useCreateRecurrence();
  const updateRule = useUpdateRecurrence();
  const deleteRule = useDeleteRecurrence();
  const generate = useGenerateDueRecurrences();
  const { toast } = useToast();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialRecurrence | null>(null);
  const [draft, setDraft] = useState<Partial<FinancialRecurrence>>({});
  const [toDelete, setToDelete] = useState<FinancialRecurrence | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setDraft({ type: 'expense', frequency: 'monthly', interval: 1, isActive: true });
    setSheetOpen(true);
  }

  function openEdit(rule: FinancialRecurrence) {
    setEditing(rule);
    setDraft({ ...rule });
    setSheetOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateRule.mutateAsync({ id: editing.id, updates: draft });
        toast({ title: 'Recorrência atualizada' });
      } else {
        await createRule.mutateAsync(draft);
        toast({ title: 'Recorrência criada' });
      }
      setSheetOpen(false);
    } catch {
      toast({ title: 'Erro ao salvar recorrência', variant: 'destructive' });
    }
  }

  async function handleToggle(rule: FinancialRecurrence) {
    setBusyId(rule.id);
    try {
      await updateRule.mutateAsync({ id: rule.id, updates: { isActive: !rule.isActive } });
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!toDelete) return;
    try {
      await deleteRule.mutateAsync(toDelete.id);
      toast({ title: 'Recorrência excluída' });
    } catch {
      toast({ title: 'Erro ao excluir recorrência', variant: 'destructive' });
    } finally {
      setToDelete(null);
    }
  }

  async function handleGenerateNow() {
    try {
      const { generated } = await generate.mutateAsync();
      toast({
        title: 'Geração concluída',
        description:
          generated > 0
            ? `${generated} lançamento(s) gerado(s).`
            : 'Nenhum lançamento pendente para gerar.',
      });
    } catch {
      toast({ title: 'Erro ao gerar lançamentos', variant: 'destructive' });
    }
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recorrências</h1>
            <p className="text-sm text-muted-foreground">
              Regras que geram lançamentos automaticamente. A geração roda diariamente; use
              "Gerar agora" para materializar imediatamente as ocorrências vencidas.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateNow} disabled={generate.isPending}>
              <RefreshCw className={`mr-2 h-4 w-4 ${generate.isPending ? 'animate-spin' : ''}`} />
              Gerar agora
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova recorrência
            </Button>
          </div>
        </div>

        <AdminTabNav />

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Carregando…</div>
        ) : (
          <RecurrenceRulesTable
            recurrences={recurrences}
            onEdit={openEdit}
            onToggleActive={handleToggle}
            onDelete={setToDelete}
            busyId={busyId}
          />
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing ? 'Editar recorrência' : 'Nova recorrência'}</SheetTitle>
            <SheetDescription>
              Defina natureza, valor, frequência e período. Os lançamentos serão gerados
              automaticamente conforme os vencimentos chegam.
            </SheetDescription>
          </SheetHeader>

          <div className="py-4">
            <RecurrenceFields value={draft} onChange={setDraft} />
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={createRule.isPending || updateRule.isPending}
            >
              {editing ? 'Salvar' : 'Criar'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir recorrência?</AlertDialogTitle>
            <AlertDialogDescription>
              A regra "{toDelete?.description}" será removida. Os lançamentos já gerados
              permanecem. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
```
> Notas de consistência com fases anteriores: `RecurrenceFields` (Fase 4) deve expor a assinatura `{ value: Partial<FinancialRecurrence>; onChange: (next: Partial<FinancialRecurrence>) => void }`. Se a Fase 4 tiver definido outra assinatura (ex.: props de React Hook Form), adaptar a chamada aqui ao contrato real do componente — verificar `src/components/finance/RecurrenceFields.tsx` antes de codar e, se divergir, ajustar este wrapper (não reescrever o `RecurrenceFields`). O caminho do hook `use-toast` deve seguir o existente no projeto (`@/hooks/use-toast`).

- [ ] Registrar a aba em `src/config/adminTabConfig.ts`. No grupo `fluxo-caixa` de `ADMIN_TAB_GROUPS` (criado na Fase 3), adicionar a aba de Recorrências após "Categorias":
```ts
      { href: '/admin/financeiro/recorrencias', label: 'Recorrências', icon: Repeat },
```
> Importar o ícone no topo do arquivo: adicionar `Repeat` à lista de imports de `lucide-react` (junto de `BarChart3`, `List`, `FolderTree` já usados pelo grupo). Verificar os imports existentes para não duplicar.

- [ ] Registrar a rota em `src/App.tsx`. Junto das demais rotas `/admin/financeiro/*` (dentro do `<ProtectedRoute allowedTypes={['admin']}>`), adicionar:
```tsx
<Route path="/admin/financeiro/recorrencias" element={<FinancialRecurrences />} />
```
> Adicionar o import (no padrão de imports de páginas usado no arquivo — lazy ou direto, conforme as outras páginas `/admin/financeiro/*` registradas na Fase 3): `import FinancialRecurrences from '@/pages/admin/FinancialRecurrences';` (ou `const FinancialRecurrences = lazy(() => import('@/pages/admin/FinancialRecurrences'));` se as páginas financeiras usarem `lazy`). Verificar o padrão real antes de inserir.

- [ ] Lint + typecheck:
```bash
npm run lint
npx tsc --noEmit
```
Saída esperada: sem erros (exit 0).

- [ ] Verificação visual no dev server (porta 3000). Iniciar `npm run dev`, logar como `admin@recrutars.com` / `Admin@123`, navegar para `/admin/financeiro/recorrencias`. Observar: (1) a aba "Recorrências" aparece no `AdminTabNav` do grupo Fluxo de Caixa e fica ativa; (2) o botão "Nova recorrência" abre o Sheet com os campos de `RecurrenceFields`; criar uma regra mensal dia 10, valor 1500, despesa → toast "Recorrência criada" e a linha aparece na tabela com "Repete mensal no dia 10"; (3) o Switch "Ativa" alterna sem erro; (4) "Gerar agora" mostra spinner e toast com a contagem de lançamentos gerados (verificar em `/admin/financeiro/lancamentos` que as ocorrências `pending` apareceram, e clicar "Gerar agora" de novo → toast "Nenhum lançamento pendente para gerar", confirmando idempotência no frontend); (5) excluir a regra via ícone de lixeira → AlertDialog → confirma → toast "Recorrência excluída".

- [ ] (Limpeza) Remover quaisquer lançamentos e regra de teste criados na verificação visual, via UI (excluir a regra) ou `execute_sql` (mesmo padrão de limpeza da Task 7.2), para não poluir os dados de desenvolvimento.

- [ ] Commit:
```bash
git add src/components/finance/RecurrenceRulesTable.tsx src/pages/admin/FinancialRecurrences.tsx src/config/adminTabConfig.ts src/App.tsx
git commit -m "$(cat <<'EOF'
feat(finance): recurrence rules management page with manual generation

Lists financial_recurrences, create/edit via RecurrenceFields sheet,
toggle active, delete, and "Gerar agora" trigger reusing the cron RPC.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

**Resultado da Fase 7:** as regras de recorrência geram `financial_entries` pendentes automaticamente (pg_cron diário, idempotente) e sob demanda ("Gerar agora"), com tela admin de gerenciamento integrada às abas do Fluxo de Caixa. A lógica de datas tem cobertura de testes (vitest) e está espelhada entre TS (`src/lib/finance/recurrence.ts`) e SQL (`next_recurrence_date`).

---

## Fase 8: Polimento (tokens, a11y, empty states, changelog, version bump)

Esta fase fecha o módulo financeiro: define os tokens de cor `--fin-*` (receita verde / despesa vermelho) em light e dark seguindo o padrão `--test-*` ja existente, padroniza os empty states (sem lancamentos vs. sem resultado de filtro), reforca acessibilidade (aria, foco, contraste WCAG AA, `prefers-reduced-motion`), faz revisao responsiva e publica a release com changelog + version bump MINOR (codename "Ledger").

> Pre-requisitos: Fases 1-7 concluidas. Os componentes `FinancialEntriesTable`, `FinancialEntriesGrouped`, `FinancialEntriesMasterDetail`, `FinancialFilterBar`, `CashflowAreaChart`, `ExpenseDonut`, as paginas `FinancialEntries`, `FluxoCaixaDashboard`, `FinancialCategories` e os tokens `--test-*` em `src/index.css` ja existem. O projeto NAO tem test runner para UI; verificacao por step e `npm run lint` + `npx tsc --noEmit` + verificacao visual no dev server (porta 3000).

> Convencao de cor (do spec, secao 9): o **valor** usa a natureza (`--fin-income` verde / `--fin-expense` vermelho). O **status** reusa `--success` (pago) / `--warning` (pendente) / `--destructive` (atrasado) / `--muted` (cancelado). `cyan`/`--secondary` e reservado a **interacao**, nunca a status.

---

### Task 8.1: Tokens `--fin-*` em `src/index.css` (light + dark) + tailwind.config

Adiciona os tokens semanticos de receita/despesa em ambos os temas, espelhando o bloco `--test-*`, e os expoe no `tailwind.config.ts` sob a chave de cor `fin` para uso via classes (`text-fin-income-text`, `bg-fin-expense-bg`, etc.).

**Files:**
- Modify: `src/index.css` (bloco `:root` apos `--test-complete-text`; bloco `.dark` apos `--test-complete-text`)
- Modify: `tailwind.config.ts` (objeto `colors`, apos a chave `test`)

**Interfaces:**
- Consumes: tokens `--test-*` existentes (padrao de nomenclatura HSL `H S% L%`), chave `test` em `tailwind.config.ts` (padrao de mapeamento).
- Produces (CSS custom properties light + dark):
  - `--fin-income`, `--fin-income-bg`, `--fin-income-text`
  - `--fin-expense`, `--fin-expense-bg`, `--fin-expense-text`
- Produces (tailwind): chave de cor `fin` -> `{ income: { DEFAULT, bg, text }, expense: { DEFAULT, bg, text } }`.

**Steps:**

- [x] Adicionar tokens `--fin-*` no bloco `:root` de `src/index.css`, logo apos a linha `--test-complete-text: 142 60% 28%;` (antes do fechamento `}` do `:root`). Codigo COMPLETO a inserir:

⚠️ **REVISADO 21/07 — não use os valores antigos (`142 70% 38%` / `0 72% 48%`).** Duas correções, ambas verificadas por cálculo de contraste:
> 1. **Não derivar de `--success`/`--destructive`.** No dark, `--destructive` (`0 62% 40%`) rende **2,42:1** sobre `--card` — é token de *fundo*, usado com foreground branco por cima. Como cor do valor, o número mais importante da tela ficaria ilegível.
> 2. **Receita em teal 160°, não verde 142°.** Sob deuteranopia, 142° e 0° convergem para dois marrons quase idênticos; 160° e 4° continuam separáveis.

```css
    /* Finance semantic tokens (income/expense — light) */
    /* income = teal 160deg (NAO o verde 142deg do --success; ver spec 9)     */
    /* --fin-income 5,03:1 e --fin-expense 6,46:1 sobre --card (WCAG AA)      */
    --fin-income: 160 84% 27%;
    --fin-income-bg: 160 60% 95%;
    --fin-income-text: 160 84% 24%;
    --fin-expense: 0 72% 42%;
    --fin-expense-bg: 0 75% 96%;
    --fin-expense-text: 0 72% 38%;
```

- [x] Adicionar tokens `--fin-*` no bloco `.dark` de `src/index.css`, logo apos a linha `--test-complete-text: 142 50% 75%;` (antes do fechamento `}` do `.dark`). Codigo COMPLETO a inserir:

```css
    /* Finance semantic tokens (income/expense — dark) */
    /* Saturacao mais baixa e luminancia mais alta que no light: vermelho      */
    /* saturado sobre navy escuro causa chromostereopsis (parece flutuar).     */
    /* --fin-income 6,5:1 e --fin-expense 5,5:1 sobre --card dark.             */
    --fin-income: 160 55% 45%;
    --fin-income-bg: 160 40% 15%;
    --fin-income-text: 160 50% 72%;
    --fin-expense: 4 80% 66%;
    --fin-expense-bg: 4 45% 17%;
    --fin-expense-text: 4 75% 78%;
```

- [x] Expor os tokens no `tailwind.config.ts`, no objeto `colors`, imediatamente apos a chave `test: { ... }` (e antes de `cyan: { ... }`). Codigo COMPLETO a inserir:

```ts
        fin: {
          income: {
            DEFAULT: "hsl(var(--fin-income))",
            bg: "hsl(var(--fin-income-bg))",
            text: "hsl(var(--fin-income-text))",
          },
          expense: {
            DEFAULT: "hsl(var(--fin-expense))",
            bg: "hsl(var(--fin-expense-bg))",
            text: "hsl(var(--fin-expense-text))",
          },
        },
```

- [x] Rodar typecheck e lint:

```bash
npx tsc --noEmit && npm run lint
```

Saida esperada: `tsc` termina sem output (exit 0); `npm run lint` sem novos erros (apenas warnings pre-existentes, se houver).

- [x] Verificacao visual: iniciar o dev server e conferir que a app sobe sem erro de CSS/Tailwind.

```bash
npm run dev
```

Abrir `http://localhost:3000/admin/financeiro/lancamentos`. Esperado: pagina carrega normalmente; nenhum erro de "unknown utility class" no console (os tokens ainda nao estao em uso, so disponiveis). Alternar tema claro/escuro no header e confirmar que nao quebra.

- [x] Commit:

```bash
git add src/index.css tailwind.config.ts
git commit -m "$(cat <<'EOF'
style(finance): add --fin-income/--fin-expense design tokens (light+dark)

Mirror the --test-* token pattern for income (green) and expense (red)
amount colors, exposed via tailwind `fin` color key. Status keeps using
success/warning/destructive/muted; cyan stays reserved for interaction.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8.2: Aplicar tokens `--fin-*` ao valor (natureza) nos componentes de lista e form

Substitui as cores ad-hoc de receita/despesa (que ate aqui podem estar usando `text-green-600`/`text-red-600` literais) pelos tokens semanticos `--fin-*`, garantindo que o **valor** reflita a natureza em todos os lugares e que o contraste seja consistente em dark mode.

**Files:**
- Create: `src/components/finance/amountColor.ts` (helper puro de classe de cor)
- Test: `src/components/finance/amountColor.test.ts`
- Modify: `src/components/finance/FinancialEntriesTable.tsx`
- Modify: `src/components/finance/FinancialEntriesGrouped.tsx`
- Modify: `src/components/finance/FinancialEntrySheet.tsx`
- Modify: `src/components/finance/FinancialEntryForm.tsx`

**Interfaces:**
- Consumes: `FinancialType` (`'income' | 'expense'`) de `src/types/finance.ts`; tokens `fin` do Tailwind (Task 8.1); `cn` de `@/lib/utils`.
- Produces: `amountColorClass(type: FinancialType): string` em `src/components/finance/amountColor.ts`.

**Steps:**

- [ ] Escrever teste falhando para o helper de cor. Criar `src/components/finance/amountColor.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { amountColorClass } from './amountColor';

describe('amountColorClass', () => {
  it('returns the income token class for income', () => {
    expect(amountColorClass('income')).toBe('text-fin-income-text');
  });

  it('returns the expense token class for expense', () => {
    expect(amountColorClass('expense')).toBe('text-fin-expense-text');
  });
});
```

- [ ] Rodar e ver falhar:

```bash
npx vitest run src/components/finance/amountColor.test.ts
```

Saida esperada: falha de import (`Failed to resolve import './amountColor'`) ou `amountColorClass is not a function`.

- [ ] Implementar o minimo. Criar `src/components/finance/amountColor.ts`:

```ts
import type { FinancialType } from '@/types/finance';

/**
 * Returns the Tailwind text-color class for a financial amount, based on its
 * nature (income = green, expense = red), using the --fin-* design tokens.
 */
export function amountColorClass(type: FinancialType): string {
  return type === 'income' ? 'text-fin-income-text' : 'text-fin-expense-text';
}
```

- [ ] Rodar e ver passar:

```bash
npx vitest run src/components/finance/amountColor.test.ts
```

Saida esperada: `2 passed`.

- [ ] Aplicar o helper no `FinancialEntriesTable.tsx`: localizar a celula que renderiza `amount` (a coluna de valor `tabular-nums` a direita) e trocar a classe de cor literal pelo helper. Importar no topo do arquivo: `import { amountColorClass } from '@/components/finance/amountColor';`. Na celula do valor, garantir o uso: `className={cn('text-right tabular-nums font-medium', amountColorClass(entry.type))}`. Prefixar valores de receita com `+` e despesa com `-` para leitura daltonica: `{entry.type === 'income' ? '+' : '-'}{formatBRL(entry.amount)}`.

- [ ] Aplicar o mesmo padrao no `FinancialEntriesGrouped.tsx` (valor de cada item da secao) e no `FinancialEntrySheet.tsx` (valor no cabecalho do detalhe): importar `amountColorClass`, aplicar `className={cn('tabular-nums', amountColorClass(entry.type))}` e o prefixo `+`/`-`.

- [ ] Aplicar no `FinancialEntryForm.tsx`: no resumo ao vivo do rodape sticky e no valor grande da secao Essencial, usar `amountColorClass(type)` (onde `type` e o valor atual do `ToggleGroup` Receita|Despesa) para tingir o numero conforme a natureza selecionada.

- [ ] Rodar lint + typecheck:

```bash
npx tsc --noEmit && npm run lint
```

Saida esperada: exit 0, sem novos erros.

- [ ] Verificacao visual em `http://localhost:3000/admin/financeiro/lancamentos`: confirmar (1) receitas em verde com `+`, despesas em vermelho com `-`; (2) alternar tema claro/escuro e validar que o contraste do valor continua legivel (WCAG AA) sobre o fundo do card/linha; (3) no formulario `/novo`, alternar o `ToggleGroup` Receita/Despesa e ver o valor mudar de cor ao vivo.

- [ ] Commit:

```bash
git add src/components/finance/amountColor.ts src/components/finance/amountColor.test.ts src/components/finance/FinancialEntriesTable.tsx src/components/finance/FinancialEntriesGrouped.tsx src/components/finance/FinancialEntrySheet.tsx src/components/finance/FinancialEntryForm.tsx
git commit -m "$(cat <<'EOF'
style(finance): tint amounts by nature via --fin-* tokens

Add amountColorClass helper (TDD) and apply it across list table, grouped
view, detail sheet and form. Income shows green with + prefix, expense red
with - prefix for colorblind-safe reading.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8.3: Empty states — `FinanceEmptyState` (sem lancamentos vs. sem resultado de filtro)

Cria um componente unico de empty state com duas variantes — "ainda nao ha lancamentos" (CTA para criar) e "nenhum resultado para o filtro" (CTA para limpar filtros) — e o liga na pagina de lancamentos para as 3 views. Segue o idioma de empty state do projeto (`text-center py-8 text-muted-foreground` + icone com `opacity-50`, visto em `src/pages/admin/Candidates.tsx`).

**Files:**
- Create: `src/components/finance/FinanceEmptyState.tsx`
- Modify: `src/pages/admin/FinancialEntries.tsx`

**Interfaces:**
- Consumes: `EntryFilters` de `src/types/finance.ts`; `Button` de `@/components/ui/button`; icones `Wallet`, `SearchX`, `Plus` de `lucide-react`; `cn` de `@/lib/utils`.
- Produces: componente `<FinanceEmptyState>` com props:

```ts
interface FinanceEmptyStateProps {
  variant: 'no-entries' | 'no-results';
  onAction?: () => void;  // 'no-entries' -> criar lancamento
  onClear?: () => void;   // 'no-results' -> limpar filtros
}
```

**Steps:**

- [ ] Criar `src/components/finance/FinanceEmptyState.tsx`. Codigo COMPLETO:

```tsx
import { Wallet, SearchX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FinanceEmptyStateProps {
  variant: 'no-entries' | 'no-results';
  /** 'no-entries' -> ir para criacao de lancamento */
  onAction?: () => void;
  /** 'no-results' -> limpar todos os filtros ativos */
  onClear?: () => void;
}

/**
 * Empty states do modulo financeiro:
 * - 'no-entries': ainda nao existe nenhum lancamento cadastrado.
 * - 'no-results': existem lancamentos, mas o filtro atual nao retornou nada.
 */
export function FinanceEmptyState({ variant, onAction, onClear }: FinanceEmptyStateProps) {
  if (variant === 'no-results') {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center text-center py-12 px-4 text-muted-foreground"
      >
        <SearchX className="h-12 w-12 mb-4 opacity-50" aria-hidden="true" />
        <p className="mb-1 font-medium text-foreground">Nenhum lançamento encontrado</p>
        <p className="text-sm max-w-sm">
          Não há lançamentos para os filtros aplicados. Ajuste os critérios ou limpe os filtros.
        </p>
        {onClear && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
            Limpar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center text-center py-12 px-4 text-muted-foreground"
    >
      <Wallet className="h-12 w-12 mb-4 opacity-50" aria-hidden="true" />
      <p className="mb-1 font-medium text-foreground">Ainda não há lançamentos</p>
      <p className="text-sm max-w-sm">
        Registre receitas e despesas avulsas do negócio (notas fiscais, comprovantes, aluguel,
        fornecedores) para acompanhar o fluxo de caixa.
      </p>
      {onAction && (
        <Button size="sm" className="mt-4" onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Novo lançamento
        </Button>
      )}
    </div>
  );
}
```

- [ ] Ligar na pagina `src/pages/admin/FinancialEntries.tsx`. Importar no topo: `import { FinanceEmptyState } from '@/components/finance/FinanceEmptyState';` e `import { useNavigate } from 'react-router-dom';` (se ainda nao importado). Garantir `const navigate = useNavigate();`. No bloco de renderizacao, antes de montar a view selecionada (Tabela/Foco/Fluxo), inserir a logica de empty state:

```tsx
const hasActiveFilters =
  Boolean(filters.search) ||
  Boolean(filters.type) ||
  Boolean(filters.status) ||
  Boolean(filters.categoryId) ||
  Boolean(filters.paymentMethod) ||
  Boolean(filters.dateFrom) ||
  Boolean(filters.dateTo);

const isEmpty = !isLoading && (data?.items.length ?? 0) === 0;

// ...no JSX, no lugar onde a view seria renderizada:
{isEmpty ? (
  hasActiveFilters ? (
    <FinanceEmptyState variant="no-results" onClear={handleClearFilters} />
  ) : (
    <FinanceEmptyState
      variant="no-entries"
      onAction={() => navigate('/admin/financeiro/lancamentos/novo')}
    />
  )
) : (
  /* ...switcher das 3 views existente... */
)}
```

> Reusar o `handleClearFilters` ja criado na Fase 3 para o `FinancialFilterBar`. Se o nome local diferir, usar o handler existente que zera `filters` para `{}`.

- [ ] Rodar lint + typecheck:

```bash
npx tsc --noEmit && npm run lint
```

Saida esperada: exit 0, sem novos erros.

- [ ] Verificacao visual em `http://localhost:3000/admin/financeiro/lancamentos`: (1) com base sem lancamentos, ver "Ainda não há lançamentos" + botao "Novo lançamento" que navega para `/novo`; (2) aplicar um filtro de busca improvavel (ex.: "zzzzz"), ver "Nenhum lançamento encontrado" + botao "Limpar filtros" que zera os chips e volta a listar.

- [ ] Commit:

```bash
git add src/components/finance/FinanceEmptyState.tsx src/pages/admin/FinancialEntries.tsx
git commit -m "$(cat <<'EOF'
feat(finance): add empty states for entries list

FinanceEmptyState with two variants: no-entries (CTA to create) and
no-results (CTA to clear filters). Wired into FinancialEntries to
distinguish an empty dataset from a filtered-out one.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8.4: Acessibilidade e responsividade (aria, foco, `prefers-reduced-motion`, contraste)

Reforca a11y e revisao responsiva nos pontos de maior risco do modulo: badges de status (icone+texto, nao so cor), KPIs clicaveis (semantica de botao + foco visivel), faixas de vencimento clicaveis, charts (titulo acessivel + `aria-label`), e `motion.div` respeitando `prefers-reduced-motion`. Revisa o colapso responsivo da tabela em < `md`.

**Files:**
- Modify: `src/components/finance/FinancialKpiHeader.tsx`
- Modify: `src/components/finance/dashboard/DueBands.tsx`
- Modify: `src/components/finance/dashboard/CashflowKpis.tsx`
- Modify: `src/components/finance/dashboard/CashflowAreaChart.tsx`
- Modify: `src/components/finance/dashboard/ExpenseDonut.tsx`
- Modify: `src/components/finance/FinancialEntriesTable.tsx`

**Interfaces:**
- Consumes: componentes shadcn `Button`/`Card` existentes; `useReducedMotion` de `framer-motion`; tokens de status (`--success`/`--warning`/`--destructive`/`--muted`).
- Produces: nenhuma nova API publica (somente atributos a11y e ajustes de classes responsivas).

**Steps:**

- [ ] KPIs e faixas clicaveis devem ser `<button>` reais (nao `div` com `onClick`) para foco/teclado. Em `FinancialKpiHeader.tsx`, os cartoes "Vencido" e "A vencer 7d" que filtram a lista: garantir que sejam `<button type="button">` com `aria-label` explicito, ex.:

```tsx
<button
  type="button"
  onClick={onFilterOverdue}
  aria-label={`Filtrar por vencidos: ${overdueCount} lançamentos, ${formatBRL(overdueAmount)}`}
  className="text-left rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  {/* conteudo do KPI */}
</button>
```

Aplicar o mesmo (button + `aria-label` + `focus-visible:ring-2 focus-visible:ring-ring`) em `DueBands.tsx` (Atrasado / 7d / 8-30d) e em `CashflowKpis.tsx` (KPI "A vencer 7d" clicavel).

- [ ] Badges de status devem comunicar por icone+texto, nao so cor (daltonismo / contraste). Onde o status do lancamento e renderizado (no `FinancialEntrySheet.tsx`, `FinancialEntriesTable.tsx` e views agrupadas — ja implementados nas fases anteriores), confirmar que cada badge tem icone + rotulo textual. Padronizar o mapeamento (caso ainda nao centralizado) num helper local ja existente; se faltar, garantir: pago = `CheckCircle2` + "Pago" (`--success`); pendente = `Clock` + "Pendente" (`--warning`); atrasado = `AlertTriangle` + "Atrasado" (`--destructive`); cancelado = `Ban` + "Cancelado" (`--muted-foreground`). Cada badge com `aria-label` redundante so quando o texto nao for visivel.

- [ ] Charts acessiveis. Em `CashflowAreaChart.tsx` e `ExpenseDonut.tsx`, envolver o `ResponsiveContainer` num wrapper com `role="img"` e `aria-label` descritivo, e fornecer um titulo visivel. Exemplo para o donut:

```tsx
<div role="img" aria-label="Composição de despesas por categoria no período">
  <ResponsiveContainer width="100%" height={260}>
    {/* PieChart */}
  </ResponsiveContainer>
</div>
```

E para o `ComposedChart` de entradas x saidas:

```tsx
<div role="img" aria-label="Entradas e saídas dos últimos 6 meses, com linha de projeção">
  {/* ResponsiveContainer + ComposedChart */}
</div>
```

- [ ] `prefers-reduced-motion` nos `motion.div` staggered do dashboard. Em `FluxoCaixaDashboard.tsx` / `CashflowKpis.tsx` (onde houver animacao de entrada), respeitar a preferencia do usuario:

```tsx
import { motion, useReducedMotion } from 'framer-motion';
// ...
const prefersReducedMotion = useReducedMotion();
const cardMotion = prefersReducedMotion
  ? { initial: false, animate: { opacity: 1 } }
  : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };
// <motion.div {...cardMotion} transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: i * 0.05 }}>
```

- [ ] Revisao responsiva da tabela. Em `FinancialEntriesTable.tsx`, confirmar `overflow-x-auto` no wrapper e colunas secundarias com `hidden md:table-cell` (forma de pagamento, anexo, competencia); abaixo de `md`, garantir que a linha continue legivel (descricao + valor sempre visiveis). Verificar que o `border-l` vermelho de atrasado usa o token: `border-l-2 border-l-[hsl(var(--destructive))]` (nao cor literal).

- [ ] Rodar lint + typecheck:

```bash
npx tsc --noEmit && npm run lint
```

Saida esperada: exit 0, sem novos erros.

- [ ] Verificacao visual + teclado em `http://localhost:3000/admin/financeiro` e `/admin/financeiro/lancamentos`: (1) navegar so com Tab e confirmar anel de foco visivel nos KPIs e nas faixas clicaveis, e que Enter/Espaco aciona o filtro; (2) inspecionar um chart no DevTools e confirmar `role="img"` + `aria-label`; (3) ativar "Reduzir movimento" no SO e recarregar o dashboard — cards aparecem sem deslize; (4) estreitar a janela para ~375px e confirmar que a tabela rola na horizontal e que descricao+valor permanecem visiveis; (5) alternar dark mode e validar contraste dos badges de status (texto legivel).

- [ ] Commit:

```bash
git add src/components/finance/FinancialKpiHeader.tsx src/components/finance/dashboard/DueBands.tsx src/components/finance/dashboard/CashflowKpis.tsx src/components/finance/dashboard/CashflowAreaChart.tsx src/components/finance/dashboard/ExpenseDonut.tsx src/components/finance/FinancialEntriesTable.tsx
git commit -m "$(cat <<'EOF'
a11y(finance): keyboard-focusable KPIs, labeled charts, reduced-motion

Turn clickable KPIs and due bands into real buttons with aria-labels and
focus rings; wrap Recharts in role=img with descriptive labels; honor
prefers-reduced-motion in dashboard cards; status badges keep icon+text.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8.5: Version bump MINOR -> 1.75.0 "Ledger" + changelog

Eleva a versao para `1.75.0` com codename "Ledger" em `src/constants/app.ts` e adiciona a nova entrada de versao no `public/changelog.json` (com `details` por item: `description`/`files`/`routes`; tipos validos; `isCurrent` unico). Marca a versao anterior `1.74.0` como `isCurrent: false`.

**Files:**
- Modify: `src/constants/app.ts`
- Modify: `public/changelog.json`

**Interfaces:**
- Consumes: `Version`/`ChangeCategory`/`ChangeItemDetail` de `src/types/changelog.ts` (tipos: `added`/`changed`/`deprecated`/`removed`/`fixed`/`security`).
- Produces: `APP_VERSION="1.75.0"`, `APP_CODENAME="Ledger"`; nova entrada de versao `1.75.0` no array `versions` (primeira posicao) com `isCurrent: true`.

**Steps:**

- [ ] Atualizar `src/constants/app.ts`. Trocar:

```ts
export const APP_VERSION = "1.74.0";
export const APP_CODENAME = "Switchboard";
```

por:

```ts
export const APP_VERSION = "1.75.0";
export const APP_CODENAME = "Ledger";
```

- [ ] Em `public/changelog.json`, no objeto da versao `1.74.0` (atualmente `"isCurrent": true`), trocar para `"isCurrent": false`.

- [ ] Inserir a nova versao como PRIMEIRO item do array `versions` (logo apos `"versions": [`), antes do objeto `1.74.0`. Codigo COMPLETO do objeto a inserir (atentar para a virgula apos o `}` de fechamento, separando do objeto `1.74.0`):

```json
    {
      "version": "1.75.0",
      "codename": "Ledger",
      "type": "minor",
      "releaseDate": "2026-06-17",
      "description": "Novo módulo de Fluxo de Caixa no admin: registre receitas e despesas avulsas do negócio (notas fiscais, comprovantes, aluguel, fornecedores) com vencimento, status, formas de pagamento, parcelamento e recorrência. A lista de lançamentos tem três visualizações (Tabela, Foco e Fluxo), filtros, ações em massa e baixa rápida. O painel de Fluxo de Caixa consolida as assinaturas (automático/Stripe) com os lançamentos avulsos em KPIs e gráficos. Categorias de receita e despesa são gerenciáveis.",
      "isCurrent": true,
      "changes": [
        {
          "type": "added",
          "items": [
            "Novo módulo Financeiro · Fluxo de Caixa no admin, com painel consolidado de assinaturas (Stripe) e lançamentos avulsos, KPIs e gráficos de entradas x saídas e composição de despesas.",
            "Lançamentos manuais de receita e despesa com vencimento, status (pendente, pago, cancelado e atrasado derivado), categoria, contraparte, forma de pagamento, anexos de notas fiscais e comprovantes, parcelamento e recorrência.",
            "Tela de Lançamentos com três visualizações alternáveis (Tabela, Foco e Fluxo), filtros com chips removíveis, ações em massa (marcar como pago, cancelar) e baixa rápida pelo painel de detalhe.",
            "Gestão de Categorias financeiras (CRUD) separadas por receita e despesa, com cor, ordem e ativação.",
            "Geração automática de lançamentos recorrentes (aluguel, mensalidades) por agendamento diário no banco de dados."
          ],
          "details": {
            "0": {
              "description": "O painel de Fluxo de Caixa cruza as assinaturas (automático/Stripe) com os lançamentos avulsos manuais. Traz cinco KPIs (Resultado do mês, Receita total, Despesas, A vencer em 7 dias e Saldo em caixa realizado), faixas de vencimento clicáveis, gráfico de entradas x saídas dos últimos 6 meses com linha de projeção, e a composição de despesas por categoria. Um seletor permite ver Consolidado, apenas Avulsos ou apenas Assinaturas.",
              "files": [
                "src/pages/admin/FluxoCaixaDashboard.tsx",
                "src/components/finance/dashboard/CashflowKpis.tsx",
                "src/components/finance/dashboard/DueBands.tsx",
                "src/components/finance/dashboard/OriginCards.tsx",
                "src/components/finance/dashboard/CashflowAreaChart.tsx",
                "src/components/finance/dashboard/ExpenseDonut.tsx",
                "src/hooks/useFinancialDashboardQuery.ts"
              ],
              "routes": ["/admin/financeiro"]
            },
            "1": {
              "description": "Cada lançamento guarda tipo (receita/despesa), valor sempre positivo (a cor e o sinal vêm da natureza), competência, vencimento e data de pagamento. O status 'Atrasado' é derivado de pendentes com vencimento no passado. É possível anexar PDF/JPG/PNG (notas fiscais e comprovantes) em um bucket privado com link temporário, dividir em parcelas com ajuste de centavos na última, e definir recorrências (semanal, mensal, trimestral, anual).",
              "files": [
                "src/types/finance.ts",
                "src/services/finance/financeService.ts",
                "src/services/finance/financeService.supabase.ts",
                "src/lib/finance/installments.ts",
                "sql/migrations/121_financial_entries.sql",
                "sql/migrations/122_financial_attachments.sql",
                "sql/migrations/123_financial_recurrences.sql",
                "sql/migrations/124_financial_rpcs.sql",
                "sql/migrations/125_financial_storage_bucket.sql"
              ],
              "routes": ["/admin/financeiro/lancamentos", "/admin/financeiro/lancamentos/novo"]
            },
            "2": {
              "description": "A lista de lançamentos oferece três modos: Tabela (visão completa com totais e régua vermelha nos atrasados), Foco (lista enxuta + painel de baixa item a item) e Fluxo (seções por vencimento: Atrasados, A vencer 7 dias, 8 a 30 dias e Pagos). A barra de filtros mostra os critérios ativos como chips removíveis, com presets de Atrasados e A vencer 7 dias. A seleção por caixas permite marcar várias como pagas ou cancelar em lote.",
              "files": [
                "src/pages/admin/FinancialEntries.tsx",
                "src/components/finance/FinancialKpiHeader.tsx",
                "src/components/finance/FinancialFilterBar.tsx",
                "src/components/finance/FinancialViewSwitcher.tsx",
                "src/components/finance/FinancialEntriesTable.tsx",
                "src/components/finance/FinancialEntriesMasterDetail.tsx",
                "src/components/finance/FinancialEntriesGrouped.tsx",
                "src/components/finance/FinancialEntrySheet.tsx",
                "src/components/finance/FinancialBulkActionBar.tsx",
                "src/hooks/useFinancialEntriesQuery.ts"
              ],
              "routes": ["/admin/financeiro/lancamentos"]
            },
            "3": {
              "description": "As categorias financeiras são gerenciáveis em tela própria: criar, editar, ativar/desativar e reordenar, separadas por receita e despesa, com cor para os gráficos e badges. A exclusão verifica o uso por lançamentos.",
              "files": [
                "src/pages/admin/FinancialCategories.tsx",
                "src/services/financialCategories/financialCategoriesService.ts",
                "src/services/financialCategories/financialCategoriesService.supabase.ts",
                "src/hooks/useFinancialCategoriesQuery.ts",
                "sql/migrations/120_financial_categories.sql"
              ],
              "routes": ["/admin/financeiro/categorias"]
            },
            "4": {
              "description": "Lançamentos recorrentes (como aluguel e mensalidades) são materializados automaticamente conforme as datas chegam, por uma rotina diária no banco de dados, de forma idempotente para não duplicar ocorrências.",
              "files": [
                "sql/migrations/124_financial_rpcs.sql",
                "src/hooks/useFinancialDashboardQuery.ts"
              ],
              "routes": ["/admin/financeiro"]
            }
          }
        },
        {
          "type": "changed",
          "items": [
            "O menu Financeiro do admin ganhou o item 'Fluxo de Caixa'; o painel de Assinaturas (Billing) existente foi preservado intacto."
          ],
          "details": {
            "0": {
              "description": "Um novo item 'Fluxo de Caixa' foi adicionado ao grupo Financeiro do menu do admin, com abas Visão Geral, Lançamentos e Categorias. O painel de Assinaturas (cobrança via Stripe) continua disponível e inalterado.",
              "files": [
                "src/App.tsx",
                "src/config/adminTabConfig.ts",
                "src/components/layout/DashboardLayout.tsx"
              ],
              "routes": ["/admin/financeiro", "/admin/assinaturas/billing"]
            }
          }
        },
        {
          "type": "added",
          "items": [
            "Tokens de cor de receita (verde) e despesa (vermelho) e novos empty states no módulo financeiro, com acessibilidade e contraste revisados (WCAG AA, foco por teclado, redução de movimento)."
          ],
          "details": {
            "0": {
              "description": "O valor de cada lançamento passa a usar tokens semânticos (verde para receita, vermelho para despesa) consistentes em tema claro e escuro, com sinais + e - para leitura daltônica. A tela de lançamentos distingue 'ainda não há lançamentos' de 'nenhum resultado para o filtro'. KPIs e faixas clicáveis são focáveis por teclado, os gráficos têm rótulos acessíveis e as animações respeitam a preferência de redução de movimento.",
              "files": [
                "src/index.css",
                "tailwind.config.ts",
                "src/components/finance/amountColor.ts",
                "src/components/finance/FinanceEmptyState.tsx"
              ],
              "routes": ["/admin/financeiro", "/admin/financeiro/lancamentos"]
            }
          }
        }
      ]
    },
```

- [ ] Validar o JSON (sintaxe):

```bash
node -e "JSON.parse(require('fs').readFileSync('public/changelog.json','utf8')); console.log('changelog.json OK')"
```

Saida esperada: `changelog.json OK`. Se der `SyntaxError`, corrigir virgula/colchete e repetir.

- [ ] Validar que existe exatamente uma versao com `isCurrent: true`:

```bash
node -e "const v=require('./public/changelog.json').versions; const c=v.filter(x=>x.isCurrent); console.log('isCurrent count:', c.length, '->', c.map(x=>x.version).join(','))"
```

Saida esperada: `isCurrent count: 1 -> 1.75.0`.

- [ ] Validar que todos os items de cada categoria possuem `details` com a chave de indice correspondente:

```bash
node -e "const v=require('./public/changelog.json').versions[0]; v.changes.forEach((c,ci)=>c.items.forEach((_,i)=>{if(!c.details||!c.details[String(i)]){throw new Error('faltando details '+ci+'/'+i)}})); console.log('details OK para', v.version)"
```

Saida esperada: `details OK para 1.75.0`.

- [ ] Rodar lint + typecheck:

```bash
npx tsc --noEmit && npm run lint
```

Saida esperada: exit 0, sem novos erros.

- [ ] Commit:

```bash
git add src/constants/app.ts public/changelog.json
git commit -m "$(cat <<'EOF'
chore: bump version to v1.75.0 Ledger and update changelog

Cash flow / manual financial entries module: dashboard, entries list with
3 views, categories CRUD, attachments, installments and recurrences.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8.6: Verificacao final — pagina "Sobre" e checklist de completude

Confirma que a release aparece corretamente na pagina "Sobre" (renderizada a partir do `changelog.json` via `VersionAccordion`) sem crash, que o tooltip de versao no footer reflete `1.75.0 Ledger`, e fecha o modulo com uma revisao de regressao.

**Files:**
- Test: nenhum arquivo de codigo alterado (verificacao manual + leitura).

**Interfaces:**
- Consumes: `APP_VERSION`/`APP_CODENAME` (Task 8.5), `public/changelog.json` (Task 8.5), `src/components/about/VersionAccordion.tsx`, `src/pages/About.tsx`.
- Produces: nada (gate de verificacao).

**Steps:**

- [ ] Confirmar que o build de producao passa (garante que o JSON e os tipos batem):

```bash
npm run build
```

Saida esperada: build conclui com sucesso (`✓ built in ...`), sem erro de TypeScript nem de import.

- [ ] Verificacao visual da pagina Sobre. Com o dev server rodando, abrir `http://localhost:3000/sobre`. Esperado: (1) a versao `1.75.0 — Ledger` aparece no topo marcada como atual; (2) expandir o accordion da `1.75.0` e confirmar que renderiza os grupos "Adicionado"/"Alterado" sem crash (nenhum tipo invalido tipo `enhanced`); (3) clicar nos items e confirmar que `description`, `files` e `routes` aparecem nos detalhes.

- [ ] Verificacao do footer/tooltip de versao: em qualquer pagina publica (`http://localhost:3000/`), passar o mouse sobre a versao no rodape e confirmar que mostra `v1.75.0 "Ledger"`.

- [ ] Checklist de completude (regressao): navegar e confirmar que o modulo financeiro continua funcional ponta a ponta — (1) `/admin/financeiro` carrega KPIs e graficos com o toggle Consolidado/Avulsos/Assinaturas; (2) `/admin/financeiro/lancamentos` alterna as 3 views, filtra, e abre o Sheet de detalhe; (3) `/admin/financeiro/lancamentos/novo` cria um lancamento com anexo e parcelamento; (4) `/admin/financeiro/categorias` cria/edita categoria; (5) o `BillingDashboard` de assinaturas (`/admin/assinaturas/billing`) continua intacto. Confirmar tema claro e escuro em cada tela.

- [ ] Sem alteracoes de codigo nesta task, nao ha commit proprio. Se algo falhar na verificacao, corrigir na task correspondente (8.1-8.5) e recomeçar o checklist. Encerrada a Fase 8, a feature esta pronta para abertura de PR (fora do escopo do plano).

