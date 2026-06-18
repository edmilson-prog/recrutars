# Fase 4 — Tour guiado do colaborador (Design)

> Épico: onboarding de colaboradores convidados. Fases 1 (acesso por senha), 2 (perfil +
> gate) e 3 (preferências de notificação) concluídas. Esta é a **Fase 4**: um tour guiado
> interativo (spotlight no menu lateral) que apresenta o painel da empresa ao colaborador
> de primeira viagem, com opção de refazer depois.

**Data:** 2026-06-17
**Branch:** `feat/collaborator-guided-tour` (a partir de `main`, que já tem a Fase 2)

---

## 1. Objetivo e escopo

### Dentro do escopo
- Tour spotlight que escurece a tela, destaca cada item do **menu lateral** da empresa e
  mostra um card explicativo com Avançar / Anterior / Pular e progresso.
- **Auto-início não-bloqueante** no `/empresa` na primeira vez (após o perfil da Fase 2),
  uma única vez por colaborador.
- Persistência **no banco**: nova coluna `company_users.tour_completed_at` (device-agnostic).
- Botão **"Refazer tour"** para reabrir quando quiser.
- Degradação graciosa quando um alvo não é mensurável (sidebar recolhida / telas pequenas):
  card centralizado, sem spotlight, mantendo o texto do passo.

### Fora do escopo (explicitamente)
- Nenhuma biblioteca de tour nova (react-joyride/driver.js) — construído com Radix Popover
  + framer-motion + a técnica de `box-shadow` spotlight (sem dependência nova).
- Tour de páginas internas (vagas, candidatos etc.) — esta fase cobre o **menu** (mapa do
  painel), não fluxos dentro de cada página.
- Tour para candidatos (`/candidato/*`) — só colaboradores de empresa.
- Não bloqueia o acesso ao painel (não é etapa do `onboarding_step`).

### Decisões confirmadas com o usuário
- Estilo: **spotlight no menu lateral**.
- Disparo + persistência: **auto-inicia no painel + flag no banco**.
- **Refazer**: sim, botão de replay.

---

## 2. Modelo de dados

Migração `sql/migrations/111_collaborator_tour.sql`:

```sql
-- Migration 111: collaborator guided tour completion flag (Fase 4)
ALTER TABLE public.company_users
  ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz;

-- Backfill: existing collaborators are NOT first-timers — mark as already seen,
-- so only collaborators created after this migration get the tour (default NULL).
UPDATE public.company_users
  SET tour_completed_at = now()
  WHERE tour_completed_at IS NULL;
```

- `NULL` = ainda não viu o tour → elegível ao auto-início. Linhas novas (membros
  convidados / novos donos via `handle_new_user`) nascem `NULL`.
- **Sem mudança no `handle_new_user`** e **sem CHECK** — additivo e idempotente.
- RLS: a coluna fica na `company_users` existente. **Nenhuma policy nova é necessária** —
  a policy de UPDATE existente `company_users_update_own_company`
  (`USING company_id = get_company_id(auth.uid())`, confirmada via MCP) já cobre a escrita,
  como na Fase 2 (job_title/onboarding_step). A escrita do tour escopa ao próprio usuário no
  nível da query: `.update(...).eq('profile_id', auth.uid()).eq('company_id', companyId).select()`
  e valida o retorno (RLS bloqueia em silêncio).

`src/types/database.ts`: adicionar `tour_completed_at: string | null` em
`company_users` Row/Insert/Update (edição cirúrgica).

---

## 3. AuthContext

`src/contexts/AuthContext.tsx`:
- Expor `companyTourCompleted: boolean | null` (`true` se `tour_completed_at` não nulo;
  `false` se nulo; `null` fora de empresa).
- As duas queries da branch de empresa em `loadUserData` e `refreshCurrentCompany` passam
  a selecionar `tour_completed_at` junto de `role, onboarding_step`.
- `null` durante impersonação (não disparar tour de outrem) e nas branches não-empresa.

---

## 4. Persistência (marcar como visto)

Hook `src/hooks/useCompanyTourQuery.ts`:
- `useCompleteCompanyTour()` — mutation que faz
  `supabase.from('company_users').update({ tour_completed_at: new Date().toISOString() })
   .eq('profile_id', user.id).eq('company_id', companyId).select()`, valida retorno
  (lança se 0 linhas), e atualiza o estado do AuthContext via `refreshCurrentCompany()`.

> "Refazer tour" **não** limpa o banco — apenas reabre o tour na sessão (chama
> `startTour()`). Concluir/pular de novo regrava `tour_completed_at` (idempotente).

---

## 5. Configuração dos passos

`src/data/companyTourSteps.ts` — array tipado, dados de referência (segue o padrão de
`src/data/`):

```ts
export interface CompanyTourStep {
  /** data-tour value on the target nav item; undefined = centered card (no spotlight) */
  tourId?: string;
  title: string;
  body: string;
}

export const COMPANY_TOUR_STEPS: CompanyTourStep[] = [
  { title: 'Bem-vindo(a) ao RecrutaRS!', body: '...' },              // intro, centered
  { tourId: 'dashboard', title: 'Painel', body: '...' },
  { tourId: 'vagas', title: 'Minhas Vagas', body: '...' },
  { tourId: 'candidatos', title: 'Banco de Talentos', body: '...' },
  { tourId: 'testes', title: 'Testes Gauge-Pro', body: '...' },
  { tourId: 'equipes', title: 'Gestão de Equipes', body: '...' },
  { tourId: 'mensagens', title: 'Mensagens', body: '...' },
  { tourId: 'configuracoes', title: 'Configurações', body: '...' },
  { title: 'Tudo pronto!', body: '...' },                            // outro, centered
];
```

Textos pt-BR acessíveis (linguagem de usuário). O plano fixa os textos finais.

---

## 6. Componentes do tour

`src/components/tour/` (nova pasta):
- **`CompanyTourProvider.tsx`** — context provider montado no `DashboardLayout` quando
  `userType === 'company'`. Mantém `{ active, stepIndex }`, expõe
  `useCompanyTour()` → `{ startTour, isActive }`. Auto-início (§7). Renderiza
  `<CompanyTourOverlay/>` quando `active`.
- **`CompanyTourOverlay.tsx`** — desenha o spotlight e o card:
  - Resolve o alvo do passo via `document.querySelector('[data-tour="<tourId>"]')` e
    `getBoundingClientRect()`.
  - **Spotlight**: um `div` `position: fixed` no rect do alvo com
    `box-shadow: 0 0 0 9999px rgba(0,0,0,0.6)` + `border-radius` + `pointer-events: none`
    (escurece tudo menos o alvo, sem cálculo de recorte).
  - **Card** (Radix Popover/Tooltip ou um card posicionado): título, corpo, indicador de
    progresso (passo N de M), botões **Anterior**, **Pular tour**, **Avançar/Concluir**.
  - Recalcula o rect em mudança de passo e nos eventos `resize`/`scroll` (listener com
    cleanup); `scrollIntoView` suave no alvo antes de medir.
  - **Degradação graciosa**: se o alvo não existe ou `rect` é vazio/fora da viewport →
    renderiza o card **centralizado** sem spotlight (passos `intro`/`outro` também).
  - Respeita `prefers-reduced-motion` (sem animações de transição se ativo).
  - `Esc` e clique em "Pular" encerram; encerrar/concluir chama `useCompleteCompanyTour`.

`useCompanyTour()` é consumido pelo botão de replay.

---

## 7. Anchoring no menu + montagem

`src/components/layout/DashboardLayout.tsx`:
- Estender `NavItem` com `tourId?: string` e, em `renderNavItem`, aplicar
  `data-tour={item.tourId}` no `<Link>`.
- Preencher `tourId` nos itens do `companyNavGroups`: `dashboard` (`/empresa`), `vagas`,
  `candidatos` (`/empresa/candidatos`), `testes`, `equipes`, `mensagens`, `configuracoes`.
- Montar `<CompanyTourProvider>` em volta do conteúdo quando `userType === 'company'`
  (envolvendo o `<main>` para que o provider e o overlay existam em todo `/empresa/*`).

---

## 8. Auto-início + replay

- **Auto-início** (efeito no provider): dispara **uma vez** quando
  `companyOnboardingStep === 'completed'` **E** `companyTourCompleted === false` **E**
  `!isImpersonationActive`. Como o `CompanyOnboardingGuard` (Fase 2) só deixa chegar ao
  painel com `onboarding_step === 'completed'`, na prática basta `companyTourCompleted ===
  false`. Um `ref` evita re-disparo na mesma sessão.
- **Replay**: botão **"Refazer tour"** chama `startTour()`. Local: na página
  `src/pages/empresa/Dashboard.tsx` (cabeçalho), um botão discreto "Refazer tour guiado".
  Evita tocar no `Settings.tsx` (em alteração paralela na Fase 3) e fica visível no painel.

---

## 9. Edge cases

- **Impersonação** → `companyTourCompleted = null` → não auto-inicia; replay também checa
  `!isImpersonationActive` (não gravar `tour_completed_at` de outrem).
- **Sidebar recolhida / telas pequenas / alvo ausente** → card centralizado (degradação).
- **Resize/scroll durante o tour** → recalcular rect; listeners com cleanup.
- **`prefers-reduced-motion`** → sem animações.
- **Colaboradores existentes** (backfill `now()`) → não veem o auto-início; só via replay.
- **Concluir/pular** → grava `tour_completed_at`; não reaparece em outro dispositivo.
- **Navegação durante o tour**: o tour aponta itens do menu sem navegar; o card fica fixo
  no painel atual (não força troca de rota). Avançar só muda o destaque.

---

## 10. Testes (sem framework de teste)

`npm run lint` + `npm run build` + e2e no preview (porta 3000), conta de teste
`rh@techsolutions.com` (nunca clientes reais), restaurando o estado ao fim:
1. Forçar `tour_completed_at = NULL` para a conta de teste (via MCP) e entrar em `/empresa`
   → o tour auto-inicia com o card de boas-vindas.
2. Avançar pelos passos → o spotlight destaca cada item do menu na ordem; progresso correto.
3. Concluir → `tour_completed_at` gravado (checar via MCP); recarregar → **não** reabre.
4. Clicar "Refazer tour" → reabre; pular no meio → encerra e regrava.
5. Recolher a sidebar e refazer → passos do menu caem no card centralizado (degradação).
6. Sob impersonação → não auto-inicia.
7. Restaurar conta de teste: `tour_completed_at = now()` (ou o valor original). Console limpo.

---

## 11. Constraints globais (herdadas)

- Migração additiva/idempotente aplicada na Supabase compartilhada via MCP (inerte em prod
  até o deploy deste front). Salvar `.sql` em `sql/migrations/`.
- RLS: usar `auth.uid()`/`get_company_id(auth.uid())`; nunca `public.users`. `.update()` +
  `.select()` para detectar bloqueio silencioso. Confirmar/Garantir policy de UPDATE em
  `company_users` para self-update.
- snake_case (DB) ↔ camelCase (TS); tipos em `database.ts` editados cirurgicamente.
- UI em pt-BR com acentuação correta; identificadores em inglês.
- Sem dependência nova. Sem alterar `handle_new_user`. Sem mexer em `Settings.tsx` (evita
  conflito com a Fase 3 em paralelo).
- changelog/versionamento ao final (MINOR — novo codename).
