# Implementação Faseada do Módulo Financeiro — Design

> **Escopo deste documento:** a **estratégia de entrega** do módulo de lançamentos financeiros — como fatiar, em que ordem, o que entra em cada PR e o que precisa mudar no material existente antes de codar.
>
> Ele **não** redefine o produto. O desenho funcional do módulo (telas, modelo de dados, RPCs) continua em `2026-06-17-lancamentos-financeiros-design.md`, e as tasks continuam em `../plans/2026-06-17-lancamentos-financeiros.md`. Este documento diz **como executar** aqueles dois, e registra as decisões que os alteram.

**Data:** 2026-07-21
**Branch:** `feat/financial-entries` (PR #32, draft)
**Versão base:** v1.74.0 "Herald"

---

## 1. Contexto

O módulo está especificado desde 17/06 num plano de 8 fases / 58 tasks / 328 steps, mas parou em 22/06. Em 21/07 a branch foi rebaseada na `main` (de 19 commits atrás para zero), as migrations foram renumeradas para 120–127 e a Fase 1 foi auditada contra o código.

**Estado real:**

| Item | Situação |
|---|---|
| Tasks 1.1–1.4 | ✅ concluídas — tipos, `effectiveStatus`, converters `rowToX`, Vitest (80 testes verdes) |
| Tasks 1.5–1.10 | ⬜ as 6 migrations — **nenhum SQL criado, nenhuma tabela `financial_*` no banco** |
| Fases 2–8 | ⬜ não iniciadas |
| Pendência menor | o smoke test `sanity.test.ts` deveria ter sido removido na Task 1.3 e continua na suíte |

Em 21/07 também foi produzido um **mockup navegável das 4 telas**, revisado por um consultor de UI/UX. Dele saíram seis decisões que divergem do spec original — incluindo um **bug funcional** de filtro e um problema de contraste que inutilizaria o módulo no tema escuro. Essas decisões estão documentadas na aba "Notas de design" do mockup e consolidadas na seção 4 abaixo.

---

## 2. Decisões de entrega

Quatro decisões tomadas em 21/07:

1. **Fatiar em 3 PRs por capacidade**, não por fase e não em entrega única. Um PR de 300+ steps é irrevisável e adia o primeiro uso real por semanas.
2. **Reescrever o spec de produto e as tasks afetadas antes de codar**, em vez de registrar as decisões num adendo. O plano já sofreu uma vez com "nota de consistência diz X, corpo da task diz Y" — foi o que gerou duas numerações conflitantes de migration e custou uma renumeração inteira. A fonte de verdade tem que ser única.
3. **View Foco sai do PR A.** É a mais cara da Fase 3 (master-detail + navegação por teclado + ficha completa) e a única cujo valor depende de existir volume de lançamentos para conciliar — que ainda não existe.
4. **Execução fase a fase com checkpoint humano** ao fim de cada uma, sem paralelizar por subagentes. A Fase 1 mexe no banco de produção; ver a fundação de pé antes de construir 100+ steps de UI sobre ela vale a lentidão.

---

## 3. Escopo dos PRs

Contagem medida task a task, não estimada: **PR A ~171 · PR B 75 · PR C ~61** — 307 dos 308 steps restantes.

**Cada PR fecha com seu próprio MINOR + changelog** (A → v1.75.0 "Ledger", B → v1.76.0, C → v1.77.0). A Task 8.5 do plano atual prevê um único bump para `1.75.0`; ela passa a ser o bump do **PR C**, e os PRs A e B ganham tasks de bump próprias. Codenames de B e C são definidos no momento do release.

### PR A — módulo utilizável (~171 steps)

**Fases 1, 2, 4 completas + Fase 3 sem a view Foco + Tasks 8.1–8.2.**

Ao fim do PR A, um admin consegue: criar um lançamento (receita ou despesa, à vista ou parcelado), anexar a nota fiscal, listar com filtros, ver o que está atrasado e marcar como pago.

| Fase | Conteúdo |
|---|---|
| 1 | 6 migrations (120–125): categorias, entries, attachments, recurrences, RPCs, bucket privado. Tipos e converters já prontos. |
| 2 | Camada de serviço (factory + impl Supabase), hooks React Query, `calcInstallments` e `aggregateCashflow` com TDD |
| 3 | KPI header, filter bar, **view Tabela** (default) e **view Fluxo**, Sheet de detalhe, ações em massa |
| 4 | Formulário completo: seções, upload com dropzone, preview de parcelas, rodapé sticky |
| 8.1–8.2 | Tokens `--fin-*` e sua aplicação nos componentes de lista e formulário (antecipadas — ver seção 5) |

A tabela `financial_recurrences` **é criada na Fase 1** (migration 123) porque `financial_entries.recurrence_id` tem FK para ela. Ela apenas fica sem uso até o PR C.

**A Task 3.8 precisa ser dividida.** Hoje ela entrega `FinancialEntriesMasterDetail` (Foco) e `FinancialEntriesGrouped` (Fluxo) numa task só, e as duas caem em PRs diferentes. Vira **3.8a — view Fluxo** (PR A) e **3.8b — view Foco** (PR C). A Task 3.9 (container que orquestra as views) fica no PR A e nasce com duas views registradas; o PR C acrescenta a terceira.

### PR B — visualização (75 steps)

**Fases 5 e 6.** Dashboard de fluxo de caixa (KPIs, faixa de urgência, gráfico entradas×saídas, donut de despesas, cards de origem) e CRUD de categorias.

Vem depois do PR A por dependência de dados: um dashboard sem lançamentos cadastrados não pode ser avaliado.

### PR C — automação e acabamento (~61 steps)

**Fase 7 + Task 3.8b (Foco) + Tasks 8.3–8.6.** Recorrência automática (RPC idempotente + pg_cron, migrations 126–127), a view Foco como modo de conciliação, empty states, acessibilidade e o polimento final.

É aqui que o formulário ganha a terceira opção do ToggleGroup ("Recorrente"), junto com o mecanismo que a materializa — ver seção 5.2.

---

## 4. Decisões de design a incorporar

As seis decisões do mockup, com o arquivo que cada uma altera. **Todas devem ser aplicadas antes de a fase correspondente começar.**

| # | Decisão | Motivo | Onde aplicar |
|---|---|---|---|
| 1 | **"Atrasado" sai do filtro de status** e vira filtro de vencimento independente e combinável | Bug funcional: atrasado é derivado (`pending` + `due_date < hoje`). Num select único junto de "Pendente", ou os atrasados somem ao filtrar "Pendente", ou o filtro mente. Não há resposta correta com um controle só. | spec §7.1, Fase 3 |
| 2 | **Tokens `--fin-income` / `--fin-expense` dedicados**, não `--success` / `--destructive` | No dark, `--destructive` rende **2,42:1** sobre `--card` — é token de fundo, usado com foreground branco por cima. Como cor de texto, tornaria o valor ilegível. Os novos ficam entre 5,0:1 e 6,5:1 nos dois temas. | spec §9, Task 8.1 |
| 3 | **Receita em teal (160°)**, não no verde 142° do `--success` | Sob deuteranopia, 142° e 0° convergem para dois marrons quase idênticos; 160° e 4° continuam separáveis. O `--success` global permanece intacto como status "Pago". | spec §9, Task 8.1 |
| 4 | **Paleta de gráficos refeita** — âncora usa os `--fin-*`, donut usa rampa navy→cyan sensível ao tema | A paleta original usava `#06b6d4` (o cyan reservado a interação) e `#10b981` (verde de receita) numa rosca de **despesas**. A rampa monocromática também resolve o contraste da maior fatia no dark, que ficava em 1,46:1. | spec §7.3, Fase 5 |
| 5 | **Cores do seed de categorias dessaturadas**, evitando 0–20°, 150–170° e 190–205° | As cores originais são renderizadas como dot **dentro de cada linha** da tabela, onde colidem com a semântica de status e natureza. É mudança de **dados**, não de CSS. O CRUD deve oferecer swatches fixos, não color picker livre. | **migration 120**, Fase 6 |
| 6 | **View Foco não abre o Sheet** — ela é o modo conciliação, com `J`/`K` navegando e `↵` dando baixa e avançando | Se o Sheet abre em qualquer linha de qualquer view, Foco vira "um Sheet que não fecha" e não justifica seu custo. | spec §7.1, Fase 3 (PR C) |

---

## 5. Correções de sequência exigidas pelo fatiamento

Duas consequências do corte que não existiam no plano original:

**5.1 — Tasks 8.1 e 8.2 sobem para o PR A, como pré-requisito da Fase 3.**
A 8.1 cria os tokens `--fin-*`; a 8.2 os aplica ao valor nos componentes de lista e formulário. As duas estão na Fase 8 (polimento). Se permanecerem no PR C, a lista e o formulário do PR A nascem sem a cor que distingue receita de despesa — e precisariam ser reescritos depois. Antecipar a 8.1 sem a 8.2 não resolve: os tokens existiriam sem ninguém consumindo. O restante da Fase 8 (empty states, acessibilidade, changelog final) continua no PR C.

**5.2 — O formulário do PR A tem ToggleGroup de 2, não de 3.**
O desenho final é `Único | Parcelado | Recorrente`. Mas a materialização das recorrências (RPC `generate_due_recurrences` + pg_cron) é Fase 7, no PR C. Oferecer "Recorrente" no PR A gravaria uma regra que nada executa — pior que não oferecer. O PR A entrega `Único | Parcelado`; a terceira opção entra no PR C junto com o mecanismo que a faz funcionar.

---

## 6. Restrições

- **Banco de produção, sem staging.** O projeto tem um único ambiente Supabase (150+ migrations aplicadas direto; a última é a 119, de 20/07). As 6 migrations do PR A são **aditivas** — criam tabelas novas e não alteram nem migram nenhuma tabela existente —, mas o bucket `financial-documents` e as RPCs são irreversíveis na prática. É por isso que o checkpoint ao fim da Fase 1 é o mais crítico dos três.
- **Conferir a numeração no momento da execução.** O bloco 120–127 assume que a `main` está na 119. Rodar `ls sql/migrations/ | tail -5` antes de criar o primeiro arquivo; se a `main` avançou, deslocar o bloco inteiro mantendo a ordem relativa.
- **Colisão pré-existente de número 117 na `main`** (`117_expose_documents_in_company_view` e `117_permission_audit_logs_user_set_null`). É da `main`, não desta feature. Não tentar corrigir renumerando o que já foi aplicado.
- **Admin-only.** RLS por `public.get_user_type(auth.uid()) = 'admin'`, mais policy `service_role` para a RPC agendada. A tabela `public.users` não existe — nunca referenciá-la.
- **Anexos em bucket privado** com signed URLs, nunca `getPublicUrl`.
- **`.delete()` e `.update()` sob RLS retornam sem erro ao serem bloqueados** — sempre encadear `.select()` e conferir as linhas afetadas.

---

## 7. Verificação

Cada fase fecha com:

| Camada | Como |
|---|---|
| Lógica pura | Vitest com TDD real — `calcInstallments`, `aggregateCashflow`, helpers de recorrência. Teste escrito antes da implementação. |
| TypeScript | `npx tsc --noEmit` limpo |
| Lint | `npm run lint` sem novos problemas nos arquivos da feature (a `main` tem 113 problemas pré-existentes — o baseline é esse número, não zero) |
| Banco | MCP Supabase `list_tables` + `get_advisors` (security) após cada migration; confirmar RLS habilitada e nenhum advisor novo |
| UI | Validação visual no dev server (**porta 3000**, não 8080) |

**Definição de pronto do PR A:** um lançamento pode ser criado com anexo e parcelamento, aparece nas duas views com o status efetivo correto, o filtro de vencimento separa atrasados de pendentes sem ambiguidade, e "marcar como pago" funciona da tabela e do Sheet.

---

## 8. Fora de escopo

Não entram em nenhum dos três PRs:

- Conciliação bancária, importação de OFX/extrato, integração com banco
- Relatórios contábeis, DRE, regime de competência formal
- Exportação de dados (o botão "Exportar" aparece no mockup como sinalização de produto, mas não é implementado)
- Multi-empresa: o módulo é admin-only da plataforma, não financeiro por empresa cliente
- Conversão dos 6 templates de peso do match em CRUD (backlog separado, PRD-092)
