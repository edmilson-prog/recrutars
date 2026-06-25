# Design — Navegação multi-modo das Candidaturas

- **Data:** 2026-06-24
- **Tela:** `/empresa/candidaturas` — `src/pages/empresa/Applications.tsx`
- **Tipo:** Feature de UI (frontend puro, sem backend/migration)
- **Status:** Aprovado, pronto para planejamento de implementação

---

## 1. Problema

A tela de Candidaturas usa um `<Select>` cru ([Applications.tsx:856-867](../../../src/pages/empresa/Applications.tsx#L856)) para escolher a vaga cujo pipeline Kanban será exibido. Com empresas de 15–40+ vagas, isso falha em três pontos:

1. **Não escala** — vira uma lista de scroll infinito, sem busca, sem agrupamento, sem hierarquia visual.
2. **Mistura status** — o filtro atual ([Applications.tsx:471-476](../../../src/pages/empresa/Applications.tsx#L471)) traz `status === 'active' || status === 'paused'`, então vagas pausadas aparecem junto das ativas.
3. **Itens pobres** — cada opção é só texto (`"Vendedor(a) (8 candidaturas)"`), sem status, sem progresso do funil, sem sinais de urgência.

Os status possíveis de uma vaga são `'active' | 'paused' | 'closed'` (`src/types/job.ts:7`).

## 2. Objetivo

Implementar **três modos de navegação de vagas** intercambiáveis por um **switcher na UI**, todos consumindo os mesmos dados e desembocando no mesmo Kanban. Aplicar regras de exibição que limpam o menu (só vagas ativas com candidaturas por padrão) sem perder acesso a candidaturas de vagas inativas.

## 3. Decisões travadas (com o usuário)

| Decisão | Escolha |
|---|---|
| Modos | **A (Combobox) + B (Lista lateral) + C (Cards)** — todos implementados |
| Modo padrão | **C — Cards** (inclusive para usuários atuais) |
| Persistência do modo | **localStorage** (sem backend, por navegador) |
| Vagas visíveis (padrão) | Só `active` **com ≥1 candidatura** no pipeline |
| Vagas vazias (0 candidaturas) | **Escondidas** por padrão |
| Vagas pausadas/fechadas | Acessíveis via **filtro visível e rotulado** (toggle) |
| Kanban, drawer e filtros de candidato | **Inalterados** |

## 4. Arquitetura: 1 motor, 3 cascas, 1 switcher

Um **motor compartilhado** (dados + regras) é consumido por **três cascas de navegação** intercambiáveis; todas selecionam uma vaga (`selectedJobId`) e renderizam o **mesmo Kanban + drawer**, que permanecem em `Applications.tsx`.

Isso também serve para extrair a navegação de vagas para componentes focados, enxugando o `Applications.tsx` (hoje com ~2085 linhas).

### 4.1 Motor — `useJobsNavigation`

Hook único, fonte de verdade para os 3 modos. Responsabilidades:

- **Conjunto de vagas visíveis.** Regra padrão: `job.status === 'active'` **E** `applicationsCountByJob[job.id] > 0`. Substitui o filtro `companyJobs` atual ([Applications.tsx:471-476](../../../src/pages/empresa/Applications.tsx#L471)).
- **Estado do filtro de status** (ver `JobStatusFilter`): conjunto de status incluídos (`Ativas` sempre; `Pausadas` e `Fechadas` opcionais) + flag `incluirVazias`. Padrão: apenas `Ativas`, `incluirVazias = false`.
  - Conjunto visível final = `jobs.filter(j => statusIncluidos.has(j.status) && (incluirVazias || count[j.id] > 0))`.
- **Dados por vaga, pré-computados para todas as visíveis:**
  - `total` ativo no pipeline (status em `['pending','reviewing','interview','offer']`).
  - `breakdown` por etapa: `{ pending, reviewing, interview, offer }` — alimenta o mini-funil (B e C). Derivado de `applications`, mesma lógica do Summary Strip atual ([Applications.tsx:935-953](../../../src/pages/empresa/Applications.tsx#L935)).
  - `novos` = `breakdown.pending` (sinal de urgência).
- **Seleção:** `selectedJobId` + `setSelectedJobId`, **sincronizado com a URL** via `?jobId=` (`useSearchParams`) para deep-link — hoje o jobId só é lido na montagem ([Applications.tsx:357-359](../../../src/pages/empresa/Applications.tsx#L357)); passa a ser escrito também.

> **Stretch (não bloqueante):** chip de qualidade de match nos cards (ex.: "5 >80%"). Exige calcular match por (candidato × vaga), o que multiplica o custo do `calculateMatch` atual (hoje amarrado a `currentSelectedJobId`). Entra apenas se a performance permitir; caso contrário, fica para fase posterior. O sinal `novos` cobre a urgência sem esse custo.

### 4.2 Persistência do modo — `useViewMode`

Segue o padrão de `src/hooks/useSidebarCollapse.ts` (load/save com `try/catch`, `useEffect` para persistir):

- Chave: `recrutars-applications-view-mode` (mesmo estilo kebab-case da chave existente `recrutars-sidebar-collapsed`).
- Valores: `'combobox' | 'sidebar' | 'cards'`.
- Default (sem valor salvo ou valor inválido): `'cards'`.
- API: `{ viewMode, setViewMode }`.

## 5. Os três modos

### Modo A — Combobox (`JobCombobox`)
Substitui o `<Select>` por `Popover` + `Command` (cmdk, já instalado em `src/components/ui/command.tsx`):
- Trigger compacto mostra a vaga atual + total.
- Dropdown: campo de busca por digitação; itens agrupados por status (`Ativas` / `Pausadas` / `Fechadas`) via `CommandGroup`; cada item usa `JobNavItem`.
- Rodapé fixo do popover: ação "Mostrar pausadas e fechadas" que liga os status no filtro sem fechar o menu.
- Abaixo: Summary Strip + Kanban como hoje.

### Modo B — Lista lateral (`JobSidebar`)
Layout master-detail dentro do `DashboardLayout`:
- Coluna esquerda (~300px): header com busca + `JobStatusFilter`; lista vertical scrollável de vagas (`JobNavItem`), item selecionado destacado (barra lateral cyan + `aria-current="true"`).
- Coluna direita: Summary Strip + Kanban.
- `< 1024px`: a coluna esquerda colapsa em um `Sheet` (`src/components/ui/sheet.tsx`) acionado por um botão "Trocar vaga (N)".

### Modo C — Cards (`JobCardsGrid`) — padrão
- Sem vaga selecionada: grid responsivo de `JobCard` (`grid-cols-1` mobile / `2` tablet / `3` desktop), com busca + `JobStatusFilter` no topo.
- Cada `JobCard`: status (cor + texto), total em destaque, `JobFunnelBar`, sinal de urgência (`N novos`).
- Ao clicar num card: seleciona a vaga e mostra o **board em tela cheia** com cabeçalho (título da vaga + botão "← Vagas" que limpa a seleção + um `JobCombobox` de troca rápida para pular de vaga sem voltar ao grid).
- Deep-link: `?jobId=` presente na montagem abre direto o board daquela vaga.

## 6. Switcher

- **`JobNavSwitcher`**: segmented control com 3 botões (ícone + rótulo: Combobox / Lista / Cards), colocado no slot `actions` do `PageHeader` (`src/components/layout/PageHeader.tsx` já expõe `actions`).
- Acessível como `radiogroup`/`tablist`; teclado por setas; estado ativo com cor + peso (não só cor).
- Lê/grava via `useViewMode`.

## 7. Componentes compartilhados (presentational)

- **`JobFunnelBar`** — barra empilhada de 4 segmentos (Novos/Análise/Entrevista/Aprovados) reaproveitando as cores do `STATUS_CONFIG` ([Applications.tsx:130-169](../../../src/pages/empresa/Applications.tsx#L130)).
- **`JobNavItem`** — linha de vaga (status dot + título truncado + total + mini-funil). Usada na sidebar (B) e no dropdown do combobox (A).
- **`JobCard`** — card do grid (modo C).
- **`JobStatusFilter`** — controle **visível e rotulado** (estilo `ToggleGroup`/popover) com: `Ativas` (sempre on), `Pausadas`, `Fechadas`, e toggle `Incluir vagas sem candidaturas`. Evita o anti-pattern de "filtro escondido".

Regra transversal: status sempre comunicado por **cor + texto/ícone**, nunca só cor.

## 8. Estrutura de arquivos

```
src/components/empresa/applications/
  useJobsNavigation.ts     -- motor: vagas visíveis, filtros, seleção, breakdowns
  useViewMode.ts           -- localStorage do modo (default 'cards')
  JobNavSwitcher.tsx       -- segmented control
  JobStatusFilter.tsx      -- filtro Ativas/Pausadas/Fechadas/vazias
  JobFunnelBar.tsx         -- mini-funil empilhado
  JobNavItem.tsx           -- linha de vaga (sidebar + combobox)
  JobCard.tsx              -- card (modo C)
  JobCombobox.tsx          -- modo A
  JobSidebar.tsx           -- modo B (+ Sheet mobile)
  JobCardsGrid.tsx         -- modo C (grid + detalhe)
```

`Applications.tsx` passa a orquestrar: `PageHeader` (+ switcher no `actions`) + `JobStatusFilter` + casca-do-modo + board (Kanban) + drawer. Kanban e drawer permanecem no arquivo.

## 9. Comportamento de seleção por modo

- **A e B:** auto-selecionam a primeira vaga visível quando nenhuma está selecionada (mantém o comportamento atual de [Applications.tsx:479-483](../../../src/pages/empresa/Applications.tsx#L479)).
- **C:** **não** auto-seleciona — mostra o grid primeiro; só abre o board ao clicar num card ou via `?jobId=`.
- A auto-seleção, portanto, passa a depender do `viewMode`.
- Os filtros de candidato existentes (match/perfil/teste) e o botão "Exportar Lista" aparecem **quando há um board visível** (sempre em A/B; em C somente no detalhe da vaga).

## 10. Responsivo, acessibilidade e microinterações

- **Responsivo:** A usável em popover (idealmente vira `Sheet`/bottom-sheet em telas muito pequenas); B colapsa em `Sheet` `< 1024px`; C em coluna única no mobile. Touch targets ≥ 44×44px. Sem scroll horizontal no container do seletor em mobile.
- **A11y:** cmdk entrega busca + navegação por setas + `Esc`; sidebar/grid navegáveis por teclado com `aria-current`; focus ring visível em todos os itens; status por cor **+ texto**; contraste 4.5:1 nos chips de status (checar `text-yellow-600`/`text-blue-600` sobre `bg-*/10` no light mode).
- **Microinterações:** transições 150–300ms (`transform`/`opacity`), respeitando `prefers-reduced-motion` (consistente com o uso atual de `motion` no Summary Strip). Realce do item selecionado com `layoutId` (shared layout do Framer Motion). Sem `scale` em hover que cause layout shift.

## 11. Escopo e entrega

- **Sem backend, sem migration.** Persistência só em localStorage. Frontend puro.
- **Fasamento sugerido:**
  1. **Motor + filtro** (`useJobsNavigation`, `JobStatusFilter`, `JobFunnelBar`) e adoção no seletor atual — já corrige o bug de pausadas/vazias. Entrega valor sozinho.
  2. **Switcher + modo A** (`useViewMode`, `JobNavSwitcher`, `JobCombobox`, `JobNavItem`).
  3. **Modo B** (`JobSidebar` + fallback `Sheet`).
  4. **Modo C** (`JobCardsGrid` + `JobCard` + detalhe com combobox de troca rápida; default).
  5. **Polish** (a11y, mobile, animações) + **bump de versão MINOR + changelog** (`public/changelog.json`, `src/constants/app.ts`) conforme convenção do projeto.

## 12. Riscos e mitigações

- **Performance do match por vaga (cards):** tratado como stretch; usar `novos` como sinal primário. Se implementado, memoizar por (candidato, vaga) e/ou limitar ao subconjunto visível.
- **Largura do Kanban no modo B:** a sidebar rouba espaço horizontal; manter o board com scroll horizontal já existente e o fallback em `Sheet` em telas médias.
- **Crescimento do `Applications.tsx`:** mitigado pela extração da navegação para `src/components/empresa/applications/`.

## 13. Fora de escopo

- Alterações no Kanban, no drawer do candidato ou nos filtros de candidato.
- Persistência do modo por conta/Supabase (poderia ser uma fase 2 futura).
- Chip de qualidade de match nos cards, caso a performance não permita na fase 4.
