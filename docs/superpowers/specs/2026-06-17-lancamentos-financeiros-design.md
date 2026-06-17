# Design — Lançamentos Financeiros Avulsos (Fluxo de Caixa)

- **Data:** 2026-06-17
- **Branch:** `feat/financial-entries`
- **Status:** Aprovado (parte visual) — aguardando revisão do spec
- **Escopo do versionamento:** MINOR (nova feature). Codename sugerido: **"Ledger"**.

---

## 1. Objetivo

Hoje o "Financeiro" do admin (`src/pages/admin/BillingDashboard.tsx`) é **somente leitura e só de assinaturas**: deriva MRR, churn e conversão automaticamente das tabelas `subscriptions` e `test_credits` (Stripe). Não existe nenhuma forma de o operador da plataforma registrar **receitas e despesas avulsas do próprio negócio** (ex.: despesa de marketing com NF, receita de consultoria, aluguel, fornecedores).

Esta feature adiciona um módulo de **lançamentos financeiros manuais** — contas a pagar e a receber + caixa realizado — com anexo de notas fiscais/comprovantes, formas de pagamento, parcelamento, recorrência e um dashboard de fluxo de caixa que **consolida** assinaturas (automático/Stripe) + avulsos (manual).

## 2. Escopo

### Dentro
- Módulo **admin-only** (operador da plataforma). RLS via `get_user_type(auth.uid()) = 'admin'`.
- Lançamentos de **receita e despesa**, com **vencimento e status** (a pagar/receber + caixa).
- **Categorias gerenciáveis** (CRUD, separadas por receita/despesa). **Formas de pagamento** em lista fixa.
- **Múltiplos anexos** por lançamento (PDF/JPG/PNG): NF, comprovante, recibo.
- **Parcelamento** (divide em N parcelas com vencimentos) e **recorrência** (repetição automática).
- Tela de **Lançamentos** com **3 visualizações alternáveis** (Tabela / Foco / Fluxo) sob um seletor.
- **Dashboard de Fluxo de Caixa** consolidando assinaturas + avulsos.

### Fora (fase 2 / futuro)
- Parsing/validação de **XML da NFe** e escrituração fiscal.
- **Multi-moeda** (só BRL agora).
- Conciliação bancária / import OFX, exportação contábil/SPED.
- Workflow de aprovação de despesas.
- O `BillingDashboard` de assinaturas atual é **preservado intacto**.

## 3. Arquitetura de Informação e Navegação

Confere com `src/config/adminTabConfig.ts` e `src/components/layout/DashboardLayout.tsx`.

**Novo item no sidebar** (grupo "Financeiro" de `adminNavGroups`, em `DashboardLayout.tsx`):
```
{ href: '/admin/financeiro', label: 'Fluxo de Caixa', icon: Wallet }
```
Posicionado após "Pacotes de Créditos". O item "Financeiro" existente (`/admin/assinaturas/billing`) permanece.

**Novo grupo de abas** em `ADMIN_TAB_GROUPS` (`adminTabConfig.ts`):
```
{
  id: 'fluxo-caixa',
  parentHref: '/admin/financeiro',
  tabs: [
    { href: '/admin/financeiro',             label: 'Visão Geral',  icon: BarChart3 },  // dashboard fluxo de caixa
    { href: '/admin/financeiro/lancamentos', label: 'Lançamentos',  icon: List },        // lista 3-views
    { href: '/admin/financeiro/categorias',  label: 'Categorias',   icon: FolderTree },  // CRUD
  ],
}
```

**Rotas** (registrar em `App.tsx`, dentro de `<ProtectedRoute allowedTypes={['admin']}>`):
| Rota | Página | Função |
|---|---|---|
| `/admin/financeiro` | `FluxoCaixaDashboard` | Dashboard de fluxo de caixa (Visão Geral) |
| `/admin/financeiro/lancamentos` | `FinancialEntries` | Lista de lançamentos (3 views) |
| `/admin/financeiro/lancamentos/novo` | `FinancialEntryNew` | Formulário de criação |
| `/admin/financeiro/lancamentos/:id` | `FinancialEntryEdit` | Edição (reusa o formulário) |
| `/admin/financeiro/categorias` | `FinancialCategories` | CRUD de categorias |

Todas as páginas usam `<DashboardLayout userType="admin">` + `AdminTabNav`.

## 4. Modelo de Dados

Migrations a partir de **108** (última aplicada é `107_candidate_documents_image_mimes.sql`). Padrão: `NNN_descricao_snake_case.sql`, `snake_case`, `TIMESTAMPTZ`, `gen_random_uuid()`, trigger `update_updated_at()`, RLS habilitada.

### 4.1 `financial_categories`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `type` | text NOT NULL | CHECK (`income`, `expense`) |
| `color` | text NULL | hex para gráficos/badges |
| `is_active` | boolean DEFAULT true | desativar sem apagar |
| `sort_order` | int DEFAULT 0 | |
| `created_at`/`updated_at` | timestamptz | |
- UNIQUE(`name`, `type`).
- **RLS:** SELECT/INSERT/UPDATE/DELETE somente admin.
- **Seed inicial** (desativável): despesas — Marketing, Infraestrutura, Serviços, Equipamentos, Ocupação, Impostos, Pessoal; receitas — Consultoria avulsa, Reembolso, Outras receitas.

### 4.2 `financial_entries`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `type` | text NOT NULL | CHECK (`income`, `expense`) |
| `status` | text NOT NULL DEFAULT `pending` | CHECK (`pending`, `paid`, `canceled`) — **`overdue` é derivado** |
| `category_id` | uuid NULL FK → financial_categories | ON DELETE SET NULL |
| `description` | text NOT NULL | |
| `counterparty_name` | text NULL | fornecedor/cliente (texto livre) |
| `counterparty_company_id` | uuid NULL FK → companies | vínculo opcional (típico em receitas) |
| `amount` | numeric(12,2) NOT NULL | CHECK > 0 — **sempre positivo**, sinal vem do `type` |
| `currency` | text NOT NULL DEFAULT `BRL` | |
| `payment_method` | text NULL | CHECK (`card_credit`,`card_debit`,`pix`,`boleto`,`transfer`,`cash`,`other`) |
| `competence_date` | date NOT NULL | competência |
| `due_date` | date NOT NULL | vencimento |
| `paid_date` | date NULL | preenchido quando `status=paid` |
| `notes` | text NULL | |
| `installment_group_id` | uuid NULL | agrupa parcelas de uma mesma compra |
| `installment_number` | int NULL | 1..N |
| `installment_total` | int NULL | N |
| `recurrence_id` | uuid NULL FK → financial_recurrences | origem recorrente |
| `created_by` | uuid FK → profiles | |
| `created_at`/`updated_at` | timestamptz | |
- **Índices:** `status`, `due_date`, `competence_date`, `type`, `category_id`, `installment_group_id`, `counterparty_company_id`.
- **RLS:** todas as operações somente admin; policy adicional `service_role` para Edge Functions (recorrência).
- **`overdue` derivado:** `status = 'pending' AND due_date < current_date`. Computado em query/serviço — não armazenado. (Opcional: view `financial_entries_view` expondo `effective_status`.)

### 4.3 `financial_attachments`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `entry_id` | uuid NOT NULL FK → financial_entries | ON DELETE CASCADE |
| `storage_path` | text NOT NULL | caminho no bucket (privado) |
| `file_name` | text NOT NULL | nome original |
| `file_type` | text NOT NULL | mime (`application/pdf`,`image/png`,`image/jpeg`) |
| `file_size` | int | bytes |
| `kind` | text NULL | CHECK (`invoice`,`receipt`,`other`) — NF vs comprovante |
| `uploaded_by` | uuid FK → profiles | |
| `created_at` | timestamptz | |
- **RLS:** somente admin.
- Numa série parcelada, a NF original anexa-se à **parcela 1** (`installment_number = 1`); comprovantes podem ser anexados por parcela quando dada baixa.

### 4.4 `financial_recurrences`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `type` | text NOT NULL | income/expense |
| `description` | text NOT NULL | |
| `category_id` | uuid NULL FK | |
| `counterparty_name` | text NULL | |
| `counterparty_company_id` | uuid NULL FK → companies | |
| `amount` | numeric(12,2) NOT NULL | |
| `payment_method` | text NULL | |
| `frequency` | text NOT NULL DEFAULT `monthly` | CHECK (`weekly`,`monthly`,`quarterly`,`yearly`) |
| `interval` | int NOT NULL DEFAULT 1 | a cada N períodos |
| `day_of_month` | int NULL | dia do vencimento (monthly) |
| `start_date` | date NOT NULL | |
| `end_date` | date NULL | ou rodar indefinidamente |
| `next_run_date` | date NULL | próxima ocorrência a materializar |
| `is_active` | boolean DEFAULT true | |
| `created_by`, `created_at`, `updated_at` | | |
- **RLS:** admin + service_role.

### 4.5 Funções / RPCs
- `create_financial_entry_with_installments(...)` — **SECURITY DEFINER**, atômica: cria N parcelas com `installment_group_id` compartilhado (padrão de `replace_curriculum_children`, migration 104).
- `mark_financial_entry_paid(p_entry_id uuid, p_paid_date date, p_payment_method text)` — set `status='paid'`, `paid_date`.
- `generate_due_recurrences()` — para cada `financial_recurrences` ativa, materializa as ocorrências faltantes até `current_date` (+ horizonte). Agendada via **pg_cron diário** ou Edge Function.
- Bulk: marcar várias como pagas / cancelar várias (loop sobre RPC ou update em lote no serviço, com `.select()` para confirmar linhas — RLS de DELETE/UPDATE retorna sem erro ao bloquear).

## 5. Storage

- **Bucket novo, privado:** `financial-documents` (NF/comprovantes contêm dados sensíveis → **não público**, diferente de `candidate-documents`).
- **Path:** `financial/{entry_id}/{timestamp}-{safeName}.{ext}` (sanitização igual ao padrão de `ProfessionalProfile.tsx`/`DocumentsTab.tsx`).
- **Visualização:** `createSignedUrl` (URL temporária), não `getPublicUrl`.
- **Validação:** mime ∈ {pdf, png, jpeg}; tamanho ≤ 10 MB; progresso por arquivo.
- **RLS de Storage:** policies admin-only no bucket.

## 6. Camada de Serviço e Hooks

Seguindo o padrão `interface + factory lazy + impl Supabase + normalizadores rowToX` (ex.: `plansService`).

**Módulos** (`src/services/`):
- `finance/financeService.ts` (+ `.supabase.ts`) — entries (CRUD, list paginado/filtrado, markPaid, bulk), attachments (upload/list/remove + signed URL), installments (via RPC), recurrences (CRUD), e agregações do dashboard.
- `financialCategories/financialCategoriesService.ts` (+ `.supabase.ts`) — CRUD de categorias.

**Tipos** (`src/types/`): `finance.ts` — `FinancialEntry`, `FinancialCategory`, `FinancialAttachment`, `FinancialRecurrence`, enums, `EntryFilters`, `CashflowSummary`. Conversão snake↔camel em `supabaseConverters.ts` ou no próprio serviço.

**Hooks React Query** (`src/hooks/`): `useFinancialEntriesQuery.ts` (key factory, paginação, filtros, `PaginatedResult`), `useFinancialCategoriesQuery.ts`, `useFinancialDashboardQuery.ts`, e mutations (`useCreateEntry`, `useUpdateEntry`, `useMarkEntryPaid`, `useCancelEntry`, `useBulkMarkPaid`, `useUploadAttachment`) com `invalidateQueries`.

## 7. Telas e Componentes

### 7.1 Lançamentos — `/admin/financeiro/lancamentos`
Container `FinancialEntries` carrega dados + estado de filtros + **view selecionada** (`localStorage 'finance:listView'`, default `table`). Elementos **comuns às 3 views**:
- `FinancialKpiHeader` — KPIs por horizonte: Saldo do período, Entradas, Saídas, **Vencido** (clicável), **A vencer 7d** (clicável).
- `FinancialFilterBar` — busca, status, categoria, range de datas, natureza (receita/despesa); filtros ativos viram **chips removíveis**; presets **Atrasados** e **A vencer 7d**.
- `FinancialViewSwitcher` — segmented control **Tabela | Foco | Fluxo**.
- `FinancialEntrySheet` — painel de detalhe (Sheet) aberto ao clicar qualquer linha em qualquer view: todos os campos, anexos (thumbnail + signed URL), timeline, **"Marcar como pago"**.
- `FinancialBulkActionBar` — seleção via checkbox → Marcar como pago / Cancelar / Exportar.

**Views:**
- **A · Tabela** (`FinancialEntriesTable`, default): shadcn `<Table>` (padrão de `UserTable`/`NotificationSendsTable`), header sticky, rodapé de totais, régua vermelha (`border-left`) em atrasados, menu `...` por linha, `overflow-x-auto`, colunas responsivas (`hidden md:table-cell` para forma/anexo/competência; abaixo de `md` colapsa em card de 2 linhas), valores `tabular-nums` à direita.
- **B · Foco** (`FinancialEntriesMasterDetail`): lista enxuta à esquerda + painel de detalhe/baixa à direita (master-detail) para conciliação item-a-item.
- **C · Fluxo** (`FinancialEntriesGrouped`): seções por vencimento — **Atrasados** / **A vencer 7d** / **8–30d** / **Pagos** — cada uma com mini-total e contador; "Pagos" recolhida por padrão.

### 7.2 Formulário — `/admin/financeiro/lancamentos/novo` (e edição)
Base **A (linear em seções)** + **resumo ao vivo da B como rodapé sticky inteligente** (não coluna lateral, para não quebrar em <760px). Componente **`FinancialEntryForm` (FormBody) compartilhado** entre a página `/novo` e um **Sheet de edição rápida**.

Seções:
1. **Essencial:** tipo (`ToggleGroup` Receita|Despesa que define o acento verde/vermelho), valor (grande, `tabular-nums`), categoria, contraparte (texto livre + vínculo opcional a empresa em receitas), forma de pagamento.
2. **Datas e status:** competência, vencimento, status; **`paid_date` condicional** (só aparece com status=Pago) — progressive disclosure com microcopy via `Tooltip`.
3. **Anexos:** `AttachmentDropzone` reutilizável (drag-and-drop + clique, múltiplos arquivos, progresso por arquivo, validação).
4. **Parcelamento e recorrência** (toggles, **mutuamente exclusivos**): parcelamento expande **preview de parcelas** (tabela via `calcInstallments`, com aviso de ajuste de centavos na última); recorrência expande **frase em linguagem natural** ("Repete mensalmente no dia 5 até …").

Rodapé sticky: resumo ao vivo (valor, parcelas, anexos) + **"Salvar" com guarda de submit** (desabilitado enquanto houver upload incompleto, com spinner de loading) + Cancelar.

### 7.3 Dashboard de Fluxo de Caixa — `/admin/financeiro`
Base **A (Espelho do Dashboard de Assinaturas)** — máxima consistência com `ReportsFinancial.tsx`/`SubscriptionDashboard.tsx`. Componentes reais: `Card`/`KPICard`/`ComparisonIndicator`/`AdminTabNav`, animações `motion.div` staggered. Paleta de gráficos **`#06b6d4` / `#3b82f6` / `#10b981` / `#f59e0b` / `#1e3a8a`** (Recharts ^2.15.4).

- **Toggle Consolidado | Avulsos | Assinaturas** (padrão de `TimeFilter`).
- **5 KPIs:** Resultado do mês (herói), Receita total (nota "inclui assinaturas/MRR"), Despesas, A vencer 7d (clicável), **Saldo em caixa** (acumulado de entradas pagas − saídas pagas até a data; caixa realizado).
- **Faixa de vencimento clicável** (Atrasado / 7d / 8–30d, cor escalando) logo abaixo dos KPIs — enxerto da variação C (acionabilidade), secundária/colapsável.
- **Gráfico âncora** entradas × saídas (6 meses): `ComposedChart` — entradas como `Area` + `stackId` (Assinaturas + Avulsos empilhados), saídas como `Line` tracejada (leitura daltônica); **linha de projeção** pontilhada (`dataKey` separada) — enxerto da B.
- **Composição de despesas por categoria:** donut (`Pie` com `innerRadius`) — substitui o donut+barras redundante.
- **Cards de origem** (Assinaturas ⚡ auto/Stripe vs Avulsos ✎ manual) — enxerto da B; componente `OriginBadge variant="auto|manual"` reutilizável em gráfico, cards e lista.

### 7.4 Categorias — `/admin/financeiro/categorias`
CRUD simples: tabela (nome, tipo, cor, ativo, ordem) + dialog de criar/editar; ativar/desativar; reordenar. Confirma exclusão (e verifica uso por lançamentos — bloqueia ou faz SET NULL conforme FK).

## 8. Lógica de Negócio

- **`calcInstallments(total, n, firstDueDate, frequency)`** — util **puro e testável** (TDD): rateio igual com **ajuste de centavos na última parcela** (soma exata = total); retorna `[{ number, dueDate, amount }]`. A frase de recorrência reusa o mesmo cálculo de datas — evita dessincronização.
- **Status / overdue** — `status` armazenado ∈ {pending, paid, canceled}; "Atrasado" é derivado (`pending` + `due_date < hoje`). KPIs/filtros/faixas usam essa derivação.
- **Baixa** — "Marcar como pago" via `mark_financial_entry_paid` (define `paid_date`, opcionalmente forma de pagamento). Disponível no Sheet e inline no menu `...`.
- **Recorrência** — regra em `financial_recurrences`; `generate_due_recurrences()` (pg_cron diário/Edge Function) materializa `financial_entries` `pending` conforme as datas chegam.
- **Parcelamento** — `create_financial_entry_with_installments` cria N entries atômicas com `installment_group_id`.

## 9. Design System

Adicionar em `src/index.css` (light **e** dark), seguindo o padrão `--test-*`:
- `--fin-income`, `--fin-income-bg`, `--fin-income-text` (verde) e `--fin-expense*` (vermelho) — para o **valor** (natureza).
- Status reusa `--success` (pago) / `--warning` (pendente) / `--destructive` (atrasado) / `--muted` (cancelado) — em **badge com ícone+texto**.
- `cyan` (`--secondary`) reservado a **interação**, nunca a status.
- Gráficos: paleta fixa `#06b6d4/#3b82f6/#10b981/#f59e0b/#1e3a8a`.
- Roboto Mono, `tabular-nums`, BRL pt-BR (`formatBRL`), contraste WCAG AA, `prefers-reduced-motion`.

## 10. Decisões assumidas (revisar)

1. Navegação: item "Fluxo de Caixa" no grupo Financeiro; rotas `/admin/financeiro/*`; abas Visão Geral/Lançamentos/Categorias. `BillingDashboard` preservado.
2. Bucket **privado** `financial-documents` + **signed URLs** (privacidade da NF).
3. `amount` sempre positivo; sinal/cor vêm do `type`.
4. `overdue` **derivado**, não armazenado.
5. Parcelamento gera N entries (`installment_group_id`); recorrência via tabela de regra + geração agendada.
6. Anexos por entry; NF da série parcelada fica na parcela 1.
7. Só **BRL**. Categorias gerenciáveis; formas de pagamento em **enum fixo**.

## 11. Fases de Implementação (entrada para o plano)

1. **Fundação de dados** — migrations 108+ (categories, entries, attachments, recurrences), RLS, índices, RPCs (`mark_paid`, `create_with_installments`), bucket `financial-documents` + policies, seed de categorias; tipos TS + converters.
2. **Serviço + hooks + util** — `finance`/`financialCategories` services, hooks React Query, `calcInstallments` (TDD).
3. **Tela de Lançamentos** — rotas/abas/menu, KPIs, filtros, 3 views, Sheet de detalhe, bulk actions.
4. **Formulário** — `FinancialEntryForm` (FormBody), `AttachmentDropzone`, parcelamento (preview), recorrência; página `/novo` + Sheet de edição.
5. **Dashboard Fluxo de Caixa** — KPIs, faixas de vencimento, gráficos (Recharts), cards de origem, projeção, toggle consolidado.
6. **Categorias** — CRUD.
7. **Recorrência automática** — `generate_due_recurrences()` + pg_cron/Edge Function.
8. **Polimento** — tokens `--fin-*`, acessibilidade, empty states, changelog (`public/changelog.json` com `details`) + version bump (`src/constants/app.ts`, codename "Ledger").

## 12. Riscos

- **`overdue` derivado** exige cuidado em filtros/ordenfações e nos KPIs (não confundir com status armazenado).
- **Recorrência** depende de pg_cron/Edge Function — testar geração idempotente (não duplicar ocorrências).
- **Signed URLs** expiram — gerar sob demanda na abertura do anexo.
- **DELETE/UPDATE sob RLS retornam sem erro** ao bloquear (ver memória do projeto): sempre `.select()` após mutação e verificar linhas afetadas.
- **Consolidação** assinaturas+avulsos: o dashboard cruza dados de `subscriptions`/`test_credits` (existentes) com `financial_entries` (novo) — garantir que os números batam e estejam rotulados.
