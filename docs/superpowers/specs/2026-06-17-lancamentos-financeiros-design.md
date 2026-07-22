# Design — Lançamentos Financeiros Avulsos (Fluxo de Caixa)

- **Data:** 2026-06-17 · **revisado em 2026-07-21** após mockup navegável das 4 telas e auditoria de UI/UX
- **Branch:** `feat/financial-entries` (PR #32)
- **Status:** Aprovado
- **Escopo do versionamento:** MINOR. Entregue em **3 PRs**, cada um com seu bump — ver `2026-07-21-implementacao-financeiro-faseada-design.md`. Codename **"Ledger"** no primeiro (v1.75.0).

> **Revisão de 21/07 — o que mudou.** Seis decisões substituem o desenho original e estão marcadas inline com "(decidido em 21/07)": o filtro de vencimento separado do status (§7.1, corrige um bug funcional), os tokens `--fin-*` calibrados e o desvio de matiz para teal (§9, corrige contraste de 2,42:1 no dark), a paleta de gráficos refeita (§7.3), o `ToggleGroup` único de repetição (§7.2), as cores do seed de categorias (§4.1, muda **dados** da migration 120) e a view Foco redefinida como modo de teclado sem Sheet (§7.1).

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

Migrations a partir de **120** (última aplicada é `119_sync_candidate_visibility_on_lifecycle.sql`). Padrão: `NNN_descricao_snake_case.sql`, `snake_case`, `TIMESTAMPTZ`, `gen_random_uuid()`, trigger `update_updated_at()`, RLS habilitada.

### 4.1 `financial_categories`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `name` | text NOT NULL | |
| `type` | text NOT NULL | CHECK (`income`, `expense`) |
| `color` | text NULL | hex — ver restrição de matiz abaixo |
| `is_active` | boolean DEFAULT true | desativar sem apagar |
| `sort_order` | int DEFAULT 0 | |
| `created_at`/`updated_at` | timestamptz | |
- UNIQUE(`name`, `type`).
- **RLS:** SELECT/INSERT/UPDATE/DELETE somente admin.
- **Seed inicial** (desativável): despesas — Marketing, Infraestrutura, Serviços, Equipamentos, Ocupação, Impostos, Pessoal; receitas — Consultoria avulsa, Reembolso, Outras receitas.
- **⚠️ Restrição de matiz nas cores** (decidida em 21/07 na revisão do mockup): a cor da categoria é renderizada como dot **dentro de cada linha da lista**, onde convive com a cor de natureza (valor), o badge de status e a régua de atraso. Cores nas faixas **0–20°** (vermelho de atraso), **150–170°** (verde de receita) e **190–205°** (cyan de interação) fazem o dot contradizer a semântica da própria linha — uma categoria de despesa com dot verde, por exemplo. O seed usa tons dessaturados fora dessas faixas:

  | Categoria | Cor | | Categoria | Cor |
  |---|---|---|---|---|
  | Marketing | `#9a7b4f` | | Pessoal | `#7c6f9e` |
  | Infraestrutura | `#5b6b8c` | | Consultoria avulsa | `#5f8a85` |
  | Serviços | `#4f7a8b` | | Reembolso | `#6e7fa3` |
  | Equipamentos | `#3f4d6b` | | Outras receitas | `#8b7fa8` |
  | Ocupação | `#6b7f5e` | | | |
  | Impostos | `#8a6d5a` | | | |

  O CRUD de categorias (§7.4) oferece **swatches fixos** dessa paleta, não color picker livre — senão o admin recria o problema na primeira categoria que cadastrar.

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
- `FinancialKpiHeader` — 4 KPIs por horizonte: Saldo do período (herói), Entradas, Saídas, **Vencido** (clicável, seta o filtro de vencimento). Mesma razão da §7.3 para não repetir "A vencer 7d" aqui: quem quer essa recorte usa o filtro de vencimento, que fica logo abaixo. **Os KPIs e a filter bar são idênticos e ficam na mesma posição nas 3 views** — só a área de conteúdo troca. É isso que faz o switcher parecer uma lente, e não navegação.
- `FinancialFilterBar` — busca, **status**, **vencimento**, categoria, range de datas, natureza (receita/despesa); filtros ativos viram **chips removíveis**.
  - **⚠️ Status e vencimento são dois eixos separados** (decidido em 21/07). `overdue` **não** aparece no select de status. Status filtra o valor armazenado (`pending` / `paid` / `canceled`); vencimento é um segundo controle independente e combinável: `Todos | Atrasados | Vencem em 7d | 8–30d | Futuros`.
  - **Por quê:** atrasado é derivado (`pending` + `due_date < hoje`). Se "Atrasado" morasse no select de status ao lado de "Pendente", filtrar "Pendente" ou esconderia os atrasados — que também são pendentes — ou os incluiria e o rótulo mentiria. Não existe resposta correta com um controle só. Com dois eixos, "Pendente + atrasado" e "Pendente + não atrasado" viram perguntas expressáveis, e ambas são reais.
  - Os presets **Atrasados** e **A vencer 7d** (e os blocos clicáveis da faixa de urgência do dashboard) passam a setar o filtro de *vencimento*, não o de status. O chip removível mostra qual eixo foi afetado.
- `FinancialViewSwitcher` — segmented control **Tabela | Foco | Fluxo**.
- `FinancialEntrySheet` — painel de detalhe (Sheet) aberto ao clicar qualquer linha **nas views Tabela e Fluxo**: todos os campos, anexos (thumbnail + signed URL), timeline, **"Marcar como pago"**. Na view Foco o Sheet **não** existe — ver B abaixo.
- `FinancialBulkActionBar` — seleção via checkbox → Marcar como pago / Cancelar / Exportar.

**Views:**
- **A · Tabela** (`FinancialEntriesTable`, default): shadcn `<Table>` (padrão de `UserTable`/`NotificationSendsTable`), header sticky, rodapé de totais, régua vermelha (`border-left`) em atrasados, menu `...` por linha, `overflow-x-auto`, colunas responsivas (`hidden md:table-cell` para forma/anexo/competência; abaixo de `md` colapsa em card de 2 linhas), valores `tabular-nums` à direita.
- **B · Foco** (`FinancialEntriesMasterDetail`): lista enxuta à esquerda + painel de detalhe/baixa à direita (master-detail) para conciliação item-a-item. **É um modo de trabalho por teclado, não uma lista alternativa** (decidido em 21/07): `J`/`K` navegam, `↵` dá baixa e **avança para o próximo item**, e o `FinancialEntrySheet` não abre nesta view. Sem essa distinção, Foco é "um Sheet que não fecha" e não justifica seu custo. A lista à esquerda não tem colunas nem header — cada item são duas linhas (contraparte + valor; data + status). Os atalhos aparecem na tela como `<kbd>`.
- **C · Fluxo** (`FinancialEntriesGrouped`): seções por vencimento — **Atrasados** / **A vencer 7d** / **8–30d** / **Pagos** / **Cancelados** — cada uma com mini-total e contador; "Pagos" e "Cancelados" recolhidas por padrão. **As seções precisam cobrir todos os registros**: sem a seção "Cancelados", um lançamento cancelado não se encaixa em faixa nenhuma e simplesmente desaparece nesta view, fazendo a contagem divergir da Tabela. Layout de extrato: data numa coluna estreita à esquerda, descrição no meio, valor à direita. É view de **leitura** — sem checkbox e sem menu de ações.

### 7.2 Formulário — `/admin/financeiro/lancamentos/novo` (e edição)
Base **A (linear em seções)** + **resumo ao vivo da B como rodapé sticky inteligente** (não coluna lateral, para não quebrar em <760px). Componente **`FinancialEntryForm` (FormBody) compartilhado** entre a página `/novo` e um **Sheet de edição rápida**.

Seções:
1. **Essencial:** tipo (`ToggleGroup` Receita|Despesa que define o acento verde/vermelho), valor (grande, `tabular-nums`), categoria, contraparte (texto livre + vínculo opcional a empresa em receitas), forma de pagamento.
2. **Datas e status:** competência, vencimento, status; **`paid_date` condicional** (só aparece com status=Pago) — progressive disclosure com microcopy via `Tooltip`.
3. **Anexos:** `AttachmentDropzone` reutilizável (drag-and-drop + clique, múltiplos arquivos, progresso por arquivo, validação).
4. **Repetição** — um único `ToggleGroup` de opções mutuamente exclusivas (decidido em 21/07): dois toggles booleanos que se excluem são um radio group disfarçado, e o usuário vai tentar ligar os dois.
   - **Desenho final:** `Único | Parcelado | Recorrente`.
   - **No PR A:** apenas `Único | Parcelado`. "Recorrente" só entra no PR C, junto com a RPC `generate_due_recurrences` e o pg_cron que a materializam — oferecer antes gravaria uma regra que nada executa.
   - `Parcelado` expande **preview de parcelas** (tabela via `calcInstallments`, máx. 6 linhas visíveis + "…e mais N", com aviso de ajuste de centavos na última).
   - `Recorrente` expande uma **frase em linguagem natural com os controles embutidos nela**: `Repete [mensalmente ▾] no dia [5 ▾] até [31/12/2026 ▾]` — não a frase acompanhada de campos soltos abaixo.

Rodapé sticky: resumo ao vivo (valor, parcelas, anexos) + **"Salvar" com guarda de submit** (desabilitado enquanto houver upload incompleto, com spinner de loading) + Cancelar.

### 7.3 Dashboard de Fluxo de Caixa — `/admin/financeiro`
Base **A (Espelho do Dashboard de Assinaturas)** — máxima consistência com `ReportsFinancial.tsx`/`SubscriptionDashboard.tsx`. Componentes reais: `Card`/`KPICard`/`ComparisonIndicator`/`AdminTabNav`, animações `motion.div` staggered. Recharts ^2.15.4.

**⚠️ Paleta de gráficos refeita em 21/07.** A paleta original (`#06b6d4` / `#3b82f6` / `#10b981` / `#f59e0b` / `#1e3a8a`) tinha três problemas simultâneos: `#06b6d4` é o cyan **reservado a interação** (faz o usuário procurar onde clicar), `#10b981` é o **verde de receita** aparecendo numa rosca de *despesas*, e três dos cinco são azuis que se fundem em fatias pequenas no dark. A substituição separa por função, porque são dois problemas diferentes:

- **Gráfico âncora (entradas × saídas):** as séries **são** a natureza, então usam os próprios `--fin-income` / `--fin-expense` da §9. Assinaturas × Avulsos se distinguem por **luminância + textura** (a camada Avulsos recebe `L +14` e um `<pattern>` diagonal), nunca por matiz. Projeção em `--muted-foreground`.
- **Rosca de categorias:** rampa **monocromática navy→cyan** de 6 passos, variando H e L juntos, **sensível ao tema** (no light `L 28%→62%`; no dark `L 52%→76%`). Todas as fatias são despesas — a diferença é só qual, e uma rampa diz isso honestamente. Com a rampa fixa do light, a maior fatia rendia **1,46:1** no dark, reprovando o mínimo de 3:1 da WCAG 1.4.11 para elementos não-textuais. Separador de `2px` na cor do card entre segmentos.

- **Toggle Consolidado | Avulsos | Assinaturas** (padrão de `TimeFilter`).
- **1 KPI herói + 3 secundários** (revisto em 21/07): Resultado do mês (herói), Receita total (nota "inclui assinaturas/MRR"), Despesas, Margem do mês.
  - O KPI **"A vencer 7d" foi eliminado**: repetia um número que a faixa de urgência já mostra, e ler o mesmo valor em dois lugares faz duvidar de qual é o certo.
  - **"Saldo em caixa" saiu da faixa de KPIs** para uma linha de contexto no header, ao lado do toggle de escopo (`Saldo em caixa · R$ … · atualizado agora`). É um *snapshot de agora*, não uma métrica do período — ao lado de quatro métricas mensais, o usuário lê os cinco como sendo do mesmo recorte.
  - Hierarquia do herói por **três eixos somados**, não por tamanho isolado: valor a 40px/700 contra 22px nos secundários; **cor exclusiva** (só o herói tem valor colorido, na cor da natureza do resultado); e **elevação exclusiva** (herói com fundo `--card` sólido + `border-left` 3px + sombra; secundários vazados, só borda). Sparkline de 6 meses só no herói.
- **Faixa de vencimento clicável** (Atrasado / 7d / 8–30d, cor escalando) logo abaixo dos KPIs — **componente de primeira classe, largura total, não colapsável**. É a coisa mais acionável da tela e absorveu o KPI eliminado. Cada bloco leva para `/lancamentos` com o **filtro de vencimento** correspondente já aplicado (§7.1).
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
- **`--fin-income` / `--fin-expense` — valores calibrados, não derivados de `--success`/`--destructive`** (decidido em 21/07):

  ```css
  :root { --fin-income: 160 84% 27%;  --fin-expense:   0 72% 42%; }  /* 5,03:1 e 6,46:1 sobre --card */
  .dark { --fin-income: 160 55% 45%;  --fin-expense:   4 80% 66%; }  /* 6,5:1  e 5,5:1  sobre --card */
  ```

  **Por que não reusar os tokens de status:** no dark, `--destructive` é `0 62% 40%` e rende **2,42:1** sobre `--card` — ele é um token de *fundo*, usado com `--destructive-foreground` branco por cima. Como cor de texto, tornaria o valor (o número mais importante da tela) ilegível justamente no tema que o admin mais usa. O mesmo vale para `--success` no dark.

  **Por que 160° e não o verde 142° do `--success`:** sob deuteranopia, 142° e 0° convergem para dois marrons quase idênticos; 160° (teal) e 4° (coral) continuam separáveis. **Não alterar o `--success` global** — ele permanece como o status "Pago".

- **Território de cor — cada família tem zona exclusiva:**

  | Família | Pode aparecer em | Nunca em |
  |---|---|---|
  | Natureza (`--fin-*`) | o glifo do **valor** (número + sinal) e o `border-left` do KPI herói | fundo de linha, badge, ícone, legenda |
  | Status (`--success`/`--warning`/`--destructive`/`--muted`) | dentro do badge (tint ~12% + ícone + texto) e na régua de atraso | valores, títulos, gráficos |
  | Cyan (`--secondary`) | link, foco, item selecionado, aba ativa, botão primário | qualquer dado |
  | Categóricas | dentro da moldura do gráfico, sua legenda, e o swatch da tela Categorias | tabela, KPIs, badges |

  Teto: **no máximo 2 cores saturadas simultâneas por linha**. Em repouso, o valor é a única cor da linha.

- **Dupla codificação (daltonismo)** — quatro camadas, e a primeira já resolve sozinha:
  1. **Sinal explícito sempre**: `+ R$ 12.480,00` / `− R$ 3.219,50`, com **U+2212** (−), não hífen — em monoespaçada tem a mesma largura e é visivelmente mais longo.
  2. **Ícone próprio por status**, nunca o mesmo ícone em cor diferente: `CheckCircle` pago · `Clock` pendente · `AlertTriangle` atrasado · `Ban` cancelado.
  3. Matiz deslocado (160°/4°, acima).
  4. No gráfico: entradas = área preenchida, saídas = linha **tracejada**; a legenda reproduz o padrão de traço, não só o quadrado de cor.

  Teste de sanidade: screenshot em grayscale — receita/despesa e atrasado/pago devem continuar distinguíveis.

- **Linha atrasada = 4 sinais de baixa intensidade**, nunca a linha inteira colorida: `border-left` 3px `--destructive`; fundo `--destructive / .04` no light e **`/.07` no dark** (diferenças de luminância são menos perceptíveis no escuro); badge "Atrasado" com ícone; e a **data de vencimento** em `--fin-expense` (é o fato que está errado). O ganho real do tint é que várias linhas atrasadas seguidas formam uma **faixa** visível de longe.
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

1. **Fundação de dados** — migrations 120+ (categories, entries, attachments, recurrences), RLS, índices, RPCs (`mark_paid`, `create_with_installments`), bucket `financial-documents` + policies, seed de categorias; tipos TS + converters.
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
