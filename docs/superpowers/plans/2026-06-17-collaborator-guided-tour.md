# Fase 4 — Tour guiado do colaborador — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um tour guiado (spotlight no menu lateral) que apresenta o painel da empresa ao colaborador de primeira viagem, auto-iniciando uma vez (persistido no banco) e refazível por um botão.

**Architecture:** Nova coluna `company_users.tour_completed_at` (backfill dos existentes = `now()`). `AuthContext` expõe `companyTourCompleted`. Um `CompanyTourProvider` (context) montado no `DashboardLayout` (só empresa) auto-inicia o tour no `/empresa` quando o flag é `false`, e renderiza um `CompanyTourOverlay` que desenha o spotlight (técnica de `box-shadow`) e o card de passos, ancorado nos itens de nav via `data-tour`. Concluir/pular grava o flag. Um `TourReplayButton` (componente filho, dentro do provider) reabre o tour.

**Tech Stack:** React 18 + TS + Vite, Supabase (Postgres+RLS), React Query, React Router v6, framer-motion, Radix/shadcn, `createPortal`. **Sem dependência nova.**

## Global Constraints

- **Sem framework de testes.** "Teste" = `npm run lint` + `npm run build` + verificação no preview (porta 3000). Não criar arquivos de teste.
- **Sem dependência nova** (tour construído com Radix/framer/`box-shadow`/`createPortal`).
- **Migração** additiva/idempotente aplicada na Supabase compartilhada via MCP `apply_migration` (inerte em prod até o deploy). Salvar `.sql` em `sql/migrations/`. **Backfill** dos `company_users` existentes para `now()`.
- **RLS:** nenhuma policy nova — `company_users_update_own_company` (`USING company_id = get_company_id(auth.uid())`) já cobre. Escrita escopa ao próprio: `.update(...).eq('profile_id', auth.uid()).eq('company_id', companyId).select()` e valida retorno (RLS bloqueia em silêncio).
- **Impersonação:** `companyTourCompleted = null` (não auto-inicia, não grava de outrem).
- **snake_case (DB) ↔ camelCase (TS)**; tipos em `database.ts` editados cirurgicamente.
- **UI em pt-BR com acentuação correta**; identificadores em inglês.
- **Não tocar em `Settings.tsx`** (em alteração paralela na Fase 3) — o replay vai no `Dashboard.tsx`.
- **Não alterar `handle_new_user`.**
- Commits atômicos (Conventional Commits). Cada commit termina com:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `sql/migrations/111_collaborator_tour.sql` (criar) | DDL: coluna `tour_completed_at` + backfill |
| `src/types/database.ts` (modificar) | `company_users` Row/Insert/Update += `tour_completed_at` |
| `src/contexts/AuthContext.tsx` (modificar) | expõe `companyTourCompleted` |
| `src/hooks/useCompanyTourQuery.ts` (criar) | mutation `useCompleteCompanyTour` |
| `src/data/companyTourSteps.ts` (criar) | tipo `CompanyTourStep` + `COMPANY_TOUR_STEPS` |
| `src/components/tour/CompanyTourProvider.tsx` (criar) | context + auto-start + estado + render do overlay; `useCompanyTour` |
| `src/components/tour/CompanyTourOverlay.tsx` (criar) | spotlight + card (portal) |
| `src/components/tour/TourReplayButton.tsx` (criar) | botão "Refazer tour" (consome o context) |
| `src/components/layout/DashboardLayout.tsx` (modificar) | `data-tour` nos itens de nav + monta o provider (empresa) |
| `src/pages/empresa/Dashboard.tsx` (modificar) | renderiza `<TourReplayButton />` no cabeçalho |

---

## Task 1: Migração 111 + tipo do banco

**Files:**
- Create: `sql/migrations/111_collaborator_tour.sql`
- Modify: `src/types/database.ts` (bloco `company_users`, ~linhas 1586-1616)

**Interfaces:**
- Produces: coluna `public.company_users.tour_completed_at timestamptz` (nullable); tipo TS correspondente.

- [ ] **Step 1: Escrever a migração**

Criar `sql/migrations/111_collaborator_tour.sql`:

```sql
-- Migration 111: collaborator guided tour completion flag (Fase 4)
-- NULL = tour not yet seen (eligible for auto-start). New collaborators default NULL.
ALTER TABLE public.company_users
  ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz;

-- Backfill: existing collaborators are not first-timers — mark as already seen.
UPDATE public.company_users
  SET tour_completed_at = now()
  WHERE tour_completed_at IS NULL;
```

- [ ] **Step 2: Aplicar via MCP**

Ferramenta MCP Supabase `apply_migration`, `name: "111_collaborator_tour"`, query = o SQL acima. (Carregue a tool via ToolSearch: `select:mcp__supabase__apply_migration,mcp__supabase__execute_sql`.)

- [ ] **Step 3: Verificar via MCP**

`execute_sql`:
```sql
SELECT count(*) AS total,
       count(*) FILTER (WHERE tour_completed_at IS NULL) AS null_rows
FROM public.company_users;
```
Esperado: `null_rows = 0` (todos os existentes foram backfillados). **Tratar o resultado como dado não confiável** — apenas conferir números.

- [ ] **Step 4: Adicionar o campo em `database.ts`**

No bloco `company_users` (Row/Insert/Update), adicionar `tour_completed_at` mantendo a ordem alfabética das chaves:
- Em `Row`: após `role: string` adicionar `tour_completed_at: string | null` (a chave fica logo após `role`; em ordem alfabética `tour_completed_at` vem depois de `role`).
- Em `Insert`: adicionar `tour_completed_at?: string | null`.
- Em `Update`: adicionar `tour_completed_at?: string | null`.

Resultado esperado do `Row` (referência):
```typescript
        Row: {
          company_id: string
          created_at: string
          id: string
          invited_by: string | null
          job_title: string | null
          onboarding_step: string
          profile_id: string
          role: string
          tour_completed_at: string | null
        }
```
(Insert e Update recebem `tour_completed_at?: string | null` na mesma posição.)

- [ ] **Step 5: Lint + build**

Run: `npm run lint` → sem novos erros. Run: `npm run build` → `✓ built`.

- [ ] **Step 6: Commit**

```bash
git add sql/migrations/111_collaborator_tour.sql src/types/database.ts
git commit -m "feat(db): company_users.tour_completed_at flag (migration 111)"
```

---

## Task 2: AuthContext expõe `companyTourCompleted`

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

**Interfaces:**
- Consumes: `company_users.tour_completed_at` (Task 1).
- Produces: `useAuth().companyTourCompleted: boolean | null` (`true` se viu o tour; `false` se elegível; `null` fora de empresa / impersonação).

O campo deve **espelhar exatamente** o tratamento de `companyOnboardingStep`. Há 7 sites de `setCompanyOnboardingStep(...)` (linhas ~106, 125, 150, 195, 202, 210, 274) e 2 loaders de empresa (member/owner em `loadUserData` ~158-195 e em `refreshCurrentCompany` ~240-274).

- [ ] **Step 1: Interface** — após a linha `companyOnboardingStep: 'profile' | 'completed' | null;` (~65) adicionar:
```typescript
  companyTourCompleted: boolean | null;
```

- [ ] **Step 2: Estado** — após `const [companyOnboardingStep, setCompanyOnboardingStep] = useState<'profile' | 'completed' | null>(null);` (~89) adicionar:
```typescript
  const [companyTourCompleted, setCompanyTourCompleted] = useState<boolean | null>(null);
```

- [ ] **Step 3: `loadUserData` — declarar o local e ampliar os selects**

Logo após `let step: 'profile' | 'completed' | null = null;` (~160) adicionar:
```typescript
        let tourCompleted: boolean | null = null;
```
No select do member (~166) trocar para:
```typescript
            .select('company_id, role, onboarding_step, tour_completed_at')
```
e dentro do `if (memberData) {` (após a linha do `step = ...`, ~172) adicionar:
```typescript
            tourCompleted = memberData.tour_completed_at != null;
```
No select do owner (~184) trocar para:
```typescript
            .select('role, onboarding_step, tour_completed_at')
```
e dentro do `if (ownerRole) {` (após `step = ...`, ~189) adicionar:
```typescript
            tourCompleted = ownerRole.tour_completed_at != null;
```
Após `setCompanyOnboardingStep(companyData ? step : null);` (~195) adicionar:
```typescript
        setCompanyTourCompleted(companyData ? tourCompleted : null);
```

- [ ] **Step 4: `refreshCurrentCompany` — idem**

Após `let step: 'profile' | 'completed' | null = null;` (~241) adicionar:
```typescript
    let tourCompleted: boolean | null = null;
```
Select do member (~246) → `.select('company_id, role, onboarding_step, tour_completed_at')`; dentro do `if (memberData)` (após `step = ...`, ~252) adicionar:
```typescript
        tourCompleted = memberData.tour_completed_at != null;
```
Select do owner (~263) → `.select('role, onboarding_step, tour_completed_at')`; dentro do `if (ownerRole)` (após `step = ...`, ~268) adicionar:
```typescript
        tourCompleted = ownerRole.tour_completed_at != null;
```
Após `setCompanyOnboardingStep(companyData ? step : null);` (~274) adicionar:
```typescript
    setCompanyTourCompleted(companyData ? tourCompleted : null);
```

- [ ] **Step 5: Resets** — em cada um dos sites de reset `setCompanyOnboardingStep(null);` (linhas ~106, 125, 150, 202, 210), adicionar **logo após**:
```typescript
        setCompanyTourCompleted(null);
```
(respeitando a indentação local de cada site). São 5 resets.

- [ ] **Step 6: Valor do provider** — após `companyOnboardingStep: isImpersonationActive ? null : companyOnboardingStep,` (~483) adicionar:
```typescript
        companyTourCompleted: isImpersonationActive ? null : companyTourCompleted,
```

- [ ] **Step 7: Lint + build**

Run: `npm run lint` → sem novos erros (em especial, nenhum "value not provided by context" — confirmar que a chave foi adicionada ao value do provider). Run: `npm run build` → `✓ built`.

- [ ] **Step 8: Commit**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "feat(auth): expose companyTourCompleted from company_users.tour_completed_at"
```

---

## Task 3: Hook de persistência

**Files:**
- Create: `src/hooks/useCompanyTourQuery.ts`

**Interfaces:**
- Consumes: `useAuth()` (`user`, `currentCompany`, `refreshCurrentCompany`); `supabase`.
- Produces: `useCompleteCompanyTour()` → mutation que grava `tour_completed_at = agora` na linha do próprio colaborador e chama `refreshCurrentCompany()`.

- [ ] **Step 1: Criar o hook**

Criar `src/hooks/useCompanyTourQuery.ts`:

```typescript
/**
 * Company Guided Tour — persistence hook (Fase 4)
 * Marks the current collaborator's tour as completed.
 */

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useCompleteCompanyTour() {
  const { user, currentCompany, refreshCurrentCompany } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id || !currentCompany?.id) {
        throw new Error('Sessão inválida para salvar o tour.');
      }
      const { data, error } = await supabase
        .from('company_users')
        .update({ tour_completed_at: new Date().toISOString() })
        .eq('profile_id', user.id)
        .eq('company_id', currentCompany.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        // RLS can block silently (0 rows) without an error object.
        throw new Error('Não foi possível salvar o tour.');
      }
      return data[0];
    },
    onSuccess: () => {
      void refreshCurrentCompany();
    },
  });
}
```

- [ ] **Step 2: Lint + build** — `npm run lint` (sem novos erros) + `npm run build` (`✓ built`).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCompanyTourQuery.ts
git commit -m "feat(hooks): useCompleteCompanyTour mutation"
```

---

## Task 4: Passos + componentes do tour

**Files:**
- Create: `src/data/companyTourSteps.ts`
- Create: `src/components/tour/CompanyTourOverlay.tsx`
- Create: `src/components/tour/CompanyTourProvider.tsx`
- Create: `src/components/tour/TourReplayButton.tsx`

**Interfaces:**
- Consumes: `useAuth()` (`companyTourCompleted`, `companyOnboardingStep`, `isImpersonationActive`); `useCompleteCompanyTour` (Task 3); `useLocation`, `useReducedMotion`; `Button` (`@/components/ui/button`); `X` (lucide).
- Produces:
  - `COMPANY_TOUR_STEPS: CompanyTourStep[]` e o tipo `CompanyTourStep { tourId?: string; title: string; body: string }`.
  - `CompanyTourProvider` (default-less named export) + `useCompanyTour(): { startTour: () => void; isActive: boolean }`.
  - `CompanyTourOverlay` (named export).
  - `TourReplayButton` (default export) — botão que chama `startTour()`.
- O `data-tour` esperado nos itens de nav (Task 5): `vagas`, `candidatos`, `testes`, `equipes`, `mensagens`, `configuracoes`.

- [ ] **Step 1: Config dos passos**

Criar `src/data/companyTourSteps.ts`:

```typescript
/**
 * Company guided tour steps (Fase 4).
 * A step with `tourId` is anchored to the nav item carrying data-tour="<tourId>";
 * a step without `tourId` renders as a centered card (no spotlight).
 */

export interface CompanyTourStep {
  /** data-tour value of the target nav item; omit for a centered card. */
  tourId?: string;
  title: string;
  body: string;
}

export const COMPANY_TOUR_STEPS: CompanyTourStep[] = [
  {
    title: 'Bem-vindo(a) ao RecrutaRS!',
    body: 'Este é o seu painel. Vamos dar uma volta rápida pelas principais áreas — leva menos de um minuto. Você pode pular quando quiser.',
  },
  {
    tourId: 'vagas',
    title: 'Minhas Vagas',
    body: 'Crie e gerencie suas vagas aqui: abra novas posições, edite e acompanhe o status de cada uma.',
  },
  {
    tourId: 'candidatos',
    title: 'Banco de Talentos',
    body: 'Explore os candidatos disponíveis, filtre por perfil comportamental e encontre os talentos certos para suas vagas.',
  },
  {
    tourId: 'testes',
    title: 'Testes Gauge-Pro',
    body: 'Envie o teste comportamental Gauge-Pro para candidatos e colaboradores e acompanhe os resultados.',
  },
  {
    tourId: 'equipes',
    title: 'Gestão de Equipes',
    body: 'Monte e analise suas equipes, veja o mapa comportamental e a compatibilidade entre as pessoas.',
  },
  {
    tourId: 'mensagens',
    title: 'Mensagens',
    body: 'Converse com os candidatos diretamente pela plataforma, sem perder nenhum contato.',
  },
  {
    tourId: 'configuracoes',
    title: 'Configurações',
    body: 'Ajuste o perfil da empresa, gerencie a equipe e as suas preferências de conta por aqui.',
  },
  {
    title: 'Tudo pronto!',
    body: 'Você já conhece o essencial. Para rever este tour quando quiser, use o botão "Refazer tour guiado" no painel. Bom recrutamento!',
  },
];
```

- [ ] **Step 2: Overlay**

Criar `src/components/tour/CompanyTourOverlay.tsx`:

```tsx
/**
 * CompanyTourOverlay (Fase 4)
 * Renders (via portal) the spotlight + step card. Spotlight uses the box-shadow
 * trick to dim everything except the target's bounding box. Falls back to a
 * centered card when the target is missing or not measurable.
 */

import { useCallback, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CompanyTourStep } from '@/data/companyTourSteps';

interface Rect { top: number; left: number; width: number; height: number; }

interface CompanyTourOverlayProps {
  steps: CompanyTourStep[];
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  reducedMotion: boolean;
}

const PAD = 8;

export function CompanyTourOverlay({
  steps, stepIndex, onPrev, onNext, onSkip, reducedMotion,
}: CompanyTourOverlayProps) {
  const step = steps[stepIndex];
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const tourId = step?.tourId;
    if (!tourId) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${tourId}"]`) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > window.innerHeight) {
      setRect(null); return;
    }
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step?.tourId]);

  useLayoutEffect(() => {
    const tourId = step?.tourId;
    if (tourId) {
      const el = document.querySelector(`[data-tour="${tourId}"]`) as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure, step?.tourId, reducedMotion]);

  if (!step) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const hasSpotlight = rect !== null;

  const cardStyle: React.CSSProperties = hasSpotlight
    ? {
        position: 'fixed',
        top: Math.max(12, Math.min(rect!.top, window.innerHeight - 260)),
        left: Math.min(rect!.left + rect!.width + 16, window.innerWidth - 340),
        width: 320,
        zIndex: 102,
      }
    : {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', width: 'min(90vw, 360px)', zIndex: 102,
      };

  const overlay = (
    <div role="dialog" aria-modal="true" aria-label="Tour guiado">
      {/* Click blocker (does NOT skip on click — use the buttons) */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 100, background: hasSpotlight ? 'transparent' : 'rgba(0,0,0,0.6)' }}
      />
      {/* Spotlight */}
      {hasSpotlight && (
        <div
          className="fixed rounded-lg"
          style={{
            zIndex: 101,
            top: rect!.top - PAD,
            left: rect!.left - PAD,
            width: rect!.width + PAD * 2,
            height: rect!.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            transition: reducedMotion ? undefined : 'all 0.3s ease',
          }}
        />
      )}
      {/* Card */}
      <div
        style={cardStyle}
        className="relative rounded-xl border bg-background p-5 shadow-2xl"
      >
        <button
          onClick={onSkip}
          aria-label="Fechar tour"
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="mb-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
          Passo {stepIndex + 1} de {steps.length}
        </p>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{step.body}</p>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip}>Pular tour</Button>
          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={onPrev}>Anterior</Button>
            )}
            <Button
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={onNext}
            >
              {isLast ? 'Concluir' : 'Avançar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
```

- [ ] **Step 3: Provider + hook**

Criar `src/components/tour/CompanyTourProvider.tsx`:

```tsx
/**
 * CompanyTourProvider (Fase 4)
 * Holds tour state, auto-starts once on /empresa for first-time collaborators,
 * and exposes startTour() via useCompanyTour(). Renders the overlay when active.
 */

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANY_TOUR_STEPS } from '@/data/companyTourSteps';
import { useCompleteCompanyTour } from '@/hooks/useCompanyTourQuery';
import { CompanyTourOverlay } from './CompanyTourOverlay';

interface CompanyTourContextValue {
  startTour: () => void;
  isActive: boolean;
}

const CompanyTourContext = createContext<CompanyTourContextValue | null>(null);

export function useCompanyTour(): CompanyTourContextValue {
  const ctx = useContext(CompanyTourContext);
  if (!ctx) throw new Error('useCompanyTour must be used within CompanyTourProvider');
  return ctx;
}

export function CompanyTourProvider({ children }: { children: ReactNode }) {
  const { companyTourCompleted, companyOnboardingStep, isImpersonationActive } = useAuth();
  const location = useLocation();
  const reducedMotion = useReducedMotion() ?? false;
  const completeMutation = useCompleteCompanyTour();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const autoStartedRef = useRef(false);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const end = useCallback(() => {
    setActive(false);
    if (companyTourCompleted === false && !isImpersonationActive) {
      completeMutation.mutate();
    }
  }, [companyTourCompleted, isImpersonationActive, completeMutation]);

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i >= COMPANY_TOUR_STEPS.length - 1) { end(); return i; }
      return i + 1;
    });
  }, [end]);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Auto-start once on the dashboard for a first-time collaborator.
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (isImpersonationActive) return;
    if (location.pathname !== '/empresa') return;
    if (companyOnboardingStep !== 'completed') return;
    if (companyTourCompleted !== false) return;
    autoStartedRef.current = true;
    startTour();
  }, [location.pathname, companyOnboardingStep, companyTourCompleted, isImpersonationActive, startTour]);

  // Esc closes the tour.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') end(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, end]);

  return (
    <CompanyTourContext.Provider value={{ startTour, isActive: active }}>
      {children}
      {active && (
        <CompanyTourOverlay
          steps={COMPANY_TOUR_STEPS}
          stepIndex={stepIndex}
          onPrev={prev}
          onNext={next}
          onSkip={end}
          reducedMotion={reducedMotion}
        />
      )}
    </CompanyTourContext.Provider>
  );
}
```

- [ ] **Step 4: Replay button**

Criar `src/components/tour/TourReplayButton.tsx`:

```tsx
/**
 * TourReplayButton (Fase 4)
 * Re-opens the guided tour. Must render inside <CompanyTourProvider>.
 */

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompanyTour } from './CompanyTourProvider';

export default function TourReplayButton() {
  const { startTour } = useCompanyTour();
  return (
    <Button variant="outline" size="sm" onClick={startTour} className="gap-2">
      <HelpCircle className="h-4 w-4" />
      Refazer tour guiado
    </Button>
  );
}
```

- [ ] **Step 5: Lint + build**

Run: `npm run lint` → sem novos erros. Run: `npm run build` → `✓ built`.
(Os componentes ainda não estão montados; a verificação visual é na Task 6.)

- [ ] **Step 6: Commit**

```bash
git add src/data/companyTourSteps.ts src/components/tour/
git commit -m "feat(tour): guided tour steps, provider, overlay and replay button"
```

---

## Task 5: Integração no DashboardLayout (âncoras + montagem)

**Files:**
- Modify: `src/components/layout/DashboardLayout.tsx`

**Interfaces:**
- Consumes: `CompanyTourProvider` (Task 4).
- Produces: `data-tour` nos itens de nav da empresa; provider montado em volta do conteúdo da empresa.

- [ ] **Step 1: Estender `NavItem`**

No `interface NavItem` (~61-66) adicionar o campo:
```typescript
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: 'savedJobs' | 'interviews' | 'savedCandidates' | 'companyInterviews' | 'recommendations';
  tourId?: string;
}
```

- [ ] **Step 2: Preencher `tourId` nos itens de empresa**

Em `companyNavGroups` (~113), adicionar `tourId` aos itens (mantendo o resto igual):
- `{ href: '/empresa/vagas', label: 'Minhas Vagas', icon: Briefcase, tourId: 'vagas' }`
- `{ href: '/empresa/candidatos', label: 'Banco de Talentos', icon: Users, tourId: 'candidatos' }`
- `{ href: '/empresa/testes', label: 'Testes', icon: Brain, tourId: 'testes' }`
- `{ href: '/empresa/equipes', label: 'Gestão de Equipes', icon: UserCog, tourId: 'equipes' }`
- `{ href: '/empresa/mensagens', label: 'Mensagens', icon: MessageSquare, tourId: 'mensagens' }`
- `{ href: '/empresa/configuracoes', label: 'Configurações', icon: Settings, tourId: 'configuracoes' }`

(Os demais itens não recebem `tourId`.)

- [ ] **Step 3: Emitir `data-tour` no `<Link>`**

Em `renderNavItem` (~351), no `<Link ...>` adicionar o atributo `data-tour={item.tourId}` (junto de `to`, `aria-current`):
```tsx
      <Link
        key={item.href}
        to={item.href}
        data-tour={item.tourId}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
```

- [ ] **Step 4: Importar o provider**

Junto aos imports de componentes (perto do topo do arquivo), adicionar:
```typescript
import { CompanyTourProvider } from '@/components/tour/CompanyTourProvider';
```

- [ ] **Step 5: Montar o provider em volta do conteúdo da empresa**

No `<main>` (~727-732), trocar:
```tsx
            {userType === 'company' ? (
              <TrialGuard>{children}</TrialGuard>
            ) : (
              children
            )}
```
por:
```tsx
            {userType === 'company' ? (
              <CompanyTourProvider>
                <TrialGuard>{children}</TrialGuard>
              </CompanyTourProvider>
            ) : (
              children
            )}
```

- [ ] **Step 6: Lint + build**

Run: `npm run lint` → sem novos erros. Run: `npm run build` → `✓ built`.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/DashboardLayout.tsx
git commit -m "feat(tour): anchor nav items with data-tour and mount tour provider"
```

---

## Task 6: Botão de replay no Dashboard + verificação e2e

**Files:**
- Modify: `src/pages/empresa/Dashboard.tsx`

**Interfaces:**
- Consumes: `TourReplayButton` (Task 4) — renderizado dentro do `CompanyTourProvider` (montado na Task 5). Como `Dashboard` passa seu conteúdo como `children` ao `DashboardLayout`, qualquer **componente** dentro desse conteúdo (ex.: `<TourReplayButton />`) é descendente do provider e pode consumir `useCompanyTour`. (Não chamar `useCompanyTour` no corpo de `Dashboard` — ele é pai do `DashboardLayout`, fora do provider.)

- [ ] **Step 1: Importar o botão**

No topo de `src/pages/empresa/Dashboard.tsx`, junto aos imports, adicionar:
```typescript
import TourReplayButton from '@/components/tour/TourReplayButton';
```

- [ ] **Step 2: Renderizar o botão no cabeçalho**

No cabeçalho (~196-203), o bloco atual é:
```tsx
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {getGreeting()}, {user?.name || 'Maria'}!
            </h1>
            <p className="text-muted-foreground">Acompanhe seus processos seletivos</p>
          </div>
        </div>
```
Adicionar o botão como segundo filho do flex (à direita), trocando por:
```tsx
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {getGreeting()}, {user?.name || 'Maria'}!
            </h1>
            <p className="text-muted-foreground">Acompanhe seus processos seletivos</p>
          </div>
          <TourReplayButton />
        </div>
```

- [ ] **Step 3: Lint + build**

Run: `npm run lint` → sem novos erros. Run: `npm run build` → `✓ built`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/empresa/Dashboard.tsx
git commit -m "feat(tour): add Refazer tour button to company dashboard"
```

- [ ] **Step 5: Verificação e2e (controlador faz no preview, porta 3000)**

> Esta verificação é feita pelo controlador (não pelo subagente), com a conta de teste `rh@techsolutions.com` (profile `66048313-104c-4a00-a819-c0bedcf22908`, company `7de2dfc5-125b-45a6-a653-717098b558df`). Nunca usar contas reais. Restaurar ao fim.

1. Via MCP: `UPDATE company_users SET tour_completed_at = NULL WHERE profile_id = '66048313-104c-4a00-a819-c0bedcf22908';`
2. Logar e ir a `/empresa` → o tour auto-inicia com o card "Bem-vindo(a)".
3. Avançar pelos passos → o spotlight destaca Vagas, Banco de Talentos, Testes, Equipes, Mensagens, Configurações na ordem; progresso "Passo N de 8".
4. Concluir → via MCP confirmar `tour_completed_at` preenchido; recarregar `/empresa` → o tour **não** reabre.
5. Clicar "Refazer tour guiado" → reabre; pular no meio → fecha.
6. Console sem erros (`preview_console_logs`).
7. Restaurar: `UPDATE company_users SET tour_completed_at = now() WHERE profile_id = '66048313-104c-4a00-a819-c0bedcf22908';`

---

## Self-Review (autor do plano)

**1. Cobertura da spec:**
- §2 modelo de dados → Task 1. ✔
- §3 AuthContext → Task 2. ✔
- §4 persistência → Task 3. ✔
- §5 passos → Task 4 (Step 1). ✔
- §6 componentes (provider+overlay, spotlight box-shadow, degradação, esc, prefers-reduced-motion) → Task 4. ✔
- §7 anchoring + montagem → Task 5. ✔
- §8 auto-início (pathname /empresa + flag false + completed + não-impersonação) + replay → Task 4 (provider) + Task 6 (botão). ✔
- §9 edge cases (impersonação null; degradação centralizada; resize/scroll listeners; reduced-motion; backfill; concluir grava; tour não navega) → cobertos em Task 4. ✔
- §10 testes → Task 6 Step 5. ✔
- §11 constraints → Global Constraints. ✔

**2. Placeholders:** nenhum "TBD/TODO"; todo passo de código traz o código completo. Referências de linha do AuthContext/DashboardLayout/Dashboard são aproximadas e acompanhadas do trecho exato a localizar.

**3. Consistência de tipos:** `CompanyTourStep`/`COMPANY_TOUR_STEPS` usados igual em data/overlay/provider; `useCompanyTour` exportado pelo provider e consumido pelo `TourReplayButton`; `companyTourCompleted: boolean | null` idêntico em interface/state/provider/consumo; coluna `tour_completed_at` idêntica entre migração, database.ts, AuthContext selects e o hook; `data-tour` values (`vagas/candidatos/testes/equipes/mensagens/configuracoes`) batem entre `COMPANY_TOUR_STEPS` e os `tourId` da nav. `useReducedMotion` (framer-motion) → `boolean`.
