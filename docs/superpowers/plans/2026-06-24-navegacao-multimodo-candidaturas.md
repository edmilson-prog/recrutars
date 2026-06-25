# Navegação multi-modo das Candidaturas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o seletor de vagas da tela de Candidaturas por três modos de navegação intercambiáveis (combobox, lista lateral, cards), alternáveis por um switcher na UI, mostrando por padrão só vagas ativas com candidaturas.

**Architecture:** Um motor compartilhado (helpers puros + hook `useJobsNavigation`) deriva as vagas visíveis e os contadores por etapa a partir de `jobs` + `applications`. Três cascas de navegação consomem esse motor e selecionam uma vaga (`selectedJobId`), que alimenta o Kanban existente (inalterado). O modo escolhido persiste em `localStorage`.

**Tech Stack:** React 18 + TypeScript, Vite, Tailwind + shadcn/ui (Radix), `cmdk`, Framer Motion, React Router v6, Vitest (ambiente node, só lógica pura).

## Global Constraints

- **Sem backend, sem migration.** Persistência apenas em `localStorage`. Frontend puro.
- **Chave de localStorage:** `recrutars-applications-view-mode` (kebab-case, como `recrutars-sidebar-collapsed`).
- **Modo padrão final:** `'cards'` (inclusive para usuários atuais). Durante as fases intermediárias o default fica `'combobox'` e é alterado para `'cards'` na Fase 4.
- **Vagas visíveis (padrão):** `status === 'active'` E com ≥1 candidatura no pipeline. Vazias e inativas escondidas por padrão.
- **Filtro de status:** controle **visível e rotulado** (nunca escondido). `Ativas` sempre incluído.
- **Etapas do pipeline (ordem e cor):** Novos=`blue`, Em Análise=`yellow`, Entrevista=`purple`, Aprovados=`green`. Status ativos no pipeline: `pending`, `reviewing`, `interview`, `offer`.
- **Status comunicado por cor + texto/ícone**, nunca só cor.
- **Kanban, drawer e filtros de candidato:** inalterados.
- **Vitest:** ambiente `node`, `globals: false` → `import { describe, it, expect } from 'vitest'`; só testar lógica pura (sem render, sem `localStorage`). Tests em `src/**/*.test.ts`.
- **Idioma:** UI em pt-BR com acentuação correta; código/identificadores em inglês.
- **Versionamento:** ao final, bump de versão **MINOR** + entrada no `public/changelog.json` (cada item com `details` = `description`/`files`/`routes`; tipos válidos: `added`/`changed`/`fixed`...) + `src/constants/app.ts`.

## File Structure

```
src/components/empresa/applications/
  jobsNavigation.helpers.ts        -- (novo) tipos + funções puras: breakdowns, filtro
  jobsNavigation.helpers.test.ts   -- (novo) testes vitest da lógica pura
  statusColors.ts                  -- (novo) constantes de cor das etapas e do status da vaga
  useViewMode.ts                   -- (novo) localStorage do modo + parseViewMode (puro)
  useViewMode.test.ts              -- (novo) testes de parseViewMode
  useJobsNavigation.ts             -- (novo) hook motor (filtro + derivados)
  JobFunnelBar.tsx                 -- (novo) barra empilhada de 4 segmentos
  JobNavItem.tsx                   -- (novo) linha de vaga (sidebar + combobox)
  JobCard.tsx                      -- (novo) card de vaga (modo C)
  JobStatusFilter.tsx              -- (novo) filtro Ativas/Pausadas/Fechadas/vazias
  JobNavSwitcher.tsx               -- (novo) segmented control do modo
  JobCombobox.tsx                  -- (novo) modo A
  JobSidebar.tsx                   -- (novo) modo B (painel interno)
  JobCardsGrid.tsx                 -- (novo) modo C (grid)
src/pages/empresa/Applications.tsx -- (modificado) integra motor + cascas + switcher
```

---

## FASE 1 — Motor + filtro (corrige o bug de pausadas/vazias)

### Task 1: Helpers puros de navegação (breakdowns + filtro)

**Files:**
- Create: `src/components/empresa/applications/jobsNavigation.helpers.ts`
- Test: `src/components/empresa/applications/jobsNavigation.helpers.test.ts`

**Interfaces:**
- Produces:
  - `interface JobBreakdown { pending: number; reviewing: number; interview: number; offer: number; total: number; novos: number }`
  - `interface JobStatusFilterState { statuses: JobStatus[]; includeEmpty: boolean }`
  - `const DEFAULT_JOB_STATUS_FILTER: JobStatusFilterState`
  - `function computeJobBreakdowns(applications: Pick<Application,'jobId'|'status'>[]): Map<string, JobBreakdown>`
  - `function filterVisibleJobs(jobs: Job[], breakdowns: Map<string, JobBreakdown>, filter: JobStatusFilterState): Job[]`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/empresa/applications/jobsNavigation.helpers.test.ts
import { describe, it, expect } from 'vitest';
import {
  computeJobBreakdowns,
  filterVisibleJobs,
  DEFAULT_JOB_STATUS_FILTER,
} from '@/components/empresa/applications/jobsNavigation.helpers';
import type { Job } from '@/types/job';

const app = (jobId: string, status: string) => ({ jobId, status }) as { jobId: string; status: string };

function job(id: string, status: Job['status'], title = id): Job {
  return {
    id, companyId: 'c1', companyName: 'C', isAnonymous: false, title,
    description: '', requirements: [], benefits: [], location: '', type: 'onsite',
    level: '', salary: { min: 0, max: 0 }, status, moderationStatus: 'approved',
    applicationsCount: 0, positionsCount: 1, createdAt: '2026-01-01', area: '',
  } as Job;
}

describe('computeJobBreakdowns', () => {
  it('counts only active-pipeline statuses per job and sets novos = pending', () => {
    const m = computeJobBreakdowns([
      app('j1', 'pending'), app('j1', 'pending'), app('j1', 'interview'),
      app('j1', 'rejected'), app('j1', 'hired'),
      app('j2', 'offer'),
    ]);
    expect(m.get('j1')).toEqual({ pending: 2, reviewing: 0, interview: 1, offer: 0, total: 3, novos: 2 });
    expect(m.get('j2')).toEqual({ pending: 0, reviewing: 0, interview: 0, offer: 1, total: 1, novos: 0 });
  });

  it('omits jobs with no active applications', () => {
    const m = computeJobBreakdowns([app('j1', 'rejected')]);
    expect(m.has('j1')).toBe(false);
  });
});

describe('filterVisibleJobs', () => {
  const jobs = [job('j1', 'active'), job('j2', 'active'), job('j3', 'paused'), job('j4', 'closed')];
  const breakdowns = computeJobBreakdowns([
    app('j1', 'pending'), app('j1', 'pending'),
    app('j3', 'offer'),
    app('j4', 'interview'),
    // j2 active but empty
  ]);

  it('default: only active jobs with at least one application', () => {
    const result = filterVisibleJobs(jobs, breakdowns, DEFAULT_JOB_STATUS_FILTER);
    expect(result.map(j => j.id)).toEqual(['j1']);
  });

  it('includes paused/closed when their statuses are added', () => {
    const result = filterVisibleJobs(jobs, breakdowns, { statuses: ['active', 'paused', 'closed'], includeEmpty: false });
    expect(result.map(j => j.id).sort()).toEqual(['j1', 'j3', 'j4']);
  });

  it('includeEmpty reveals active jobs with zero applications', () => {
    const result = filterVisibleJobs(jobs, breakdowns, { statuses: ['active'], includeEmpty: true });
    expect(result.map(j => j.id).sort()).toEqual(['j1', 'j2']);
  });

  it('sorts by total desc, then title asc', () => {
    const bd = computeJobBreakdowns([
      app('j1', 'pending'),
      app('j2', 'pending'), app('j2', 'reviewing'),
    ]);
    const result = filterVisibleJobs([job('j1', 'active', 'B'), job('j2', 'active', 'A')], bd, DEFAULT_JOB_STATUS_FILTER);
    expect(result.map(j => j.id)).toEqual(['j2', 'j1']); // j2 has 2, j1 has 1
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- jobsNavigation.helpers`
Expected: FAIL — module/exports não existem.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/empresa/applications/jobsNavigation.helpers.ts
import type { Application } from '@/types';
import type { Job, JobStatus } from '@/types/job';

export interface JobBreakdown {
  pending: number;
  reviewing: number;
  interview: number;
  offer: number;
  total: number;
  novos: number;
}

export interface JobStatusFilterState {
  statuses: JobStatus[];
  includeEmpty: boolean;
}

export const DEFAULT_JOB_STATUS_FILTER: JobStatusFilterState = {
  statuses: ['active'],
  includeEmpty: false,
};

const ACTIVE_STAGES = ['pending', 'reviewing', 'interview', 'offer'] as const;
type ActiveStage = (typeof ACTIVE_STAGES)[number];

function emptyBreakdown(): JobBreakdown {
  return { pending: 0, reviewing: 0, interview: 0, offer: 0, total: 0, novos: 0 };
}

export function computeJobBreakdowns(
  applications: Pick<Application, 'jobId' | 'status'>[],
): Map<string, JobBreakdown> {
  const map = new Map<string, JobBreakdown>();
  for (const appn of applications) {
    if (!ACTIVE_STAGES.includes(appn.status as ActiveStage)) continue;
    let b = map.get(appn.jobId);
    if (!b) {
      b = emptyBreakdown();
      map.set(appn.jobId, b);
    }
    b[appn.status as ActiveStage] += 1;
    b.total += 1;
  }
  for (const b of map.values()) b.novos = b.pending;
  return map;
}

export function filterVisibleJobs(
  jobs: Job[],
  breakdowns: Map<string, JobBreakdown>,
  filter: JobStatusFilterState,
): Job[] {
  const allowed = new Set(filter.statuses);
  return jobs
    .filter((j) => allowed.has(j.status))
    .filter((j) => filter.includeEmpty || (breakdowns.get(j.id)?.total ?? 0) > 0)
    .sort((a, b) => {
      const ta = breakdowns.get(a.id)?.total ?? 0;
      const tb = breakdowns.get(b.id)?.total ?? 0;
      if (tb !== ta) return tb - ta;
      return a.title.localeCompare(b.title, 'pt-BR');
    });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- jobsNavigation.helpers`
Expected: PASS (todos os casos).

- [ ] **Step 5: Commit**

```bash
git add src/components/empresa/applications/jobsNavigation.helpers.ts src/components/empresa/applications/jobsNavigation.helpers.test.ts
git commit -m "feat(applications): pure helpers for job breakdowns and visible-job filtering"
```

---

### Task 2: Constantes de cor das etapas e status (`statusColors.ts`)

**Files:**
- Create: `src/components/empresa/applications/statusColors.ts`

**Interfaces:**
- Produces:
  - `type PipelineStageKey = 'pending' | 'reviewing' | 'interview' | 'offer'`
  - `const PIPELINE_STAGES: { key: PipelineStageKey; label: string; barClass: string; textClass: string }[]`
  - `const JOB_STATUS_META: Record<JobStatus, { label: string; dotClass: string; textClass: string }>`

- [ ] **Step 1: Create the file**

```ts
// src/components/empresa/applications/statusColors.ts
import type { JobStatus } from '@/types/job';

export type PipelineStageKey = 'pending' | 'reviewing' | 'interview' | 'offer';

export const PIPELINE_STAGES: {
  key: PipelineStageKey;
  label: string;
  barClass: string;
  textClass: string;
}[] = [
  { key: 'pending', label: 'Novos', barClass: 'bg-blue-500', textClass: 'text-blue-600' },
  { key: 'reviewing', label: 'Em Análise', barClass: 'bg-yellow-500', textClass: 'text-yellow-600' },
  { key: 'interview', label: 'Entrevista', barClass: 'bg-purple-500', textClass: 'text-purple-600' },
  { key: 'offer', label: 'Aprovados', barClass: 'bg-green-500', textClass: 'text-green-600' },
];

export const JOB_STATUS_META: Record<JobStatus, { label: string; dotClass: string; textClass: string }> = {
  active: { label: 'Ativa', dotClass: 'bg-emerald-500', textClass: 'text-emerald-600' },
  paused: { label: 'Pausada', dotClass: 'bg-amber-500', textClass: 'text-amber-600' },
  closed: { label: 'Fechada', dotClass: 'bg-slate-400', textClass: 'text-slate-500' },
};
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run build`
Expected: build OK (sem erros de TS no novo arquivo).

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/applications/statusColors.ts
git commit -m "feat(applications): shared color constants for pipeline stages and job status"
```

---

### Task 3: `JobFunnelBar` — barra empilhada do funil

**Files:**
- Create: `src/components/empresa/applications/JobFunnelBar.tsx`

**Interfaces:**
- Consumes: `JobBreakdown` (Task 1), `PIPELINE_STAGES` (Task 2)
- Produces: `function JobFunnelBar(props: { breakdown: JobBreakdown; className?: string }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
// src/components/empresa/applications/JobFunnelBar.tsx
import { cn } from '@/lib/utils';
import { PIPELINE_STAGES } from './statusColors';
import type { JobBreakdown } from './jobsNavigation.helpers';

interface JobFunnelBarProps {
  breakdown: JobBreakdown;
  className?: string;
}

export function JobFunnelBar({ breakdown, className }: JobFunnelBarProps) {
  const { total } = breakdown;
  return (
    <div
      className={cn('flex h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
      role="img"
      aria-label={`Funil: ${PIPELINE_STAGES.map((s) => `${breakdown[s.key]} ${s.label}`).join(', ')}`}
    >
      {total > 0 &&
        PIPELINE_STAGES.map((s) => {
          const value = breakdown[s.key];
          if (value === 0) return null;
          return <span key={s.key} className={s.barClass} style={{ width: `${(value / total) * 100}%` }} />;
        })}
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/applications/JobFunnelBar.tsx
git commit -m "feat(applications): JobFunnelBar stacked pipeline bar"
```

---

### Task 4: `JobStatusFilter` — filtro visível de status

**Files:**
- Create: `src/components/empresa/applications/JobStatusFilter.tsx`

**Interfaces:**
- Consumes: `JobStatusFilterState` (Task 1)
- Produces: `function JobStatusFilter(props: { value: JobStatusFilterState; onChange: (next: JobStatusFilterState) => void }): JSX.Element`

> **Pré-checagem:** confirme que `src/components/ui/popover.tsx`, `src/components/ui/checkbox.tsx` e `src/components/ui/label.tsx` existem (todos já usados no projeto).

- [ ] **Step 1: Create the component**

```tsx
// src/components/empresa/applications/JobStatusFilter.tsx
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { JobStatusFilterState } from './jobsNavigation.helpers';

interface JobStatusFilterProps {
  value: JobStatusFilterState;
  onChange: (next: JobStatusFilterState) => void;
}

export function JobStatusFilter({ value, onChange }: JobStatusFilterProps) {
  const has = (s: 'paused' | 'closed') => value.statuses.includes(s);
  const toggle = (s: 'paused' | 'closed') => {
    const statuses = has(s) ? value.statuses.filter((x) => x !== s) : [...value.statuses, s];
    onChange({ ...value, statuses });
  };
  const extra = (has('paused') ? 1 : 0) + (has('closed') ? 1 : 0) + (value.includeEmpty ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtrar vagas
          {extra > 0 && (
            <span className="ml-1 rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">{extra}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mostrar vagas</p>

        <div className="flex items-center gap-2 opacity-70">
          <Checkbox checked disabled id="jf-active" />
          <Label htmlFor="jf-active" className="text-sm">
            Ativas <span className="text-muted-foreground">(sempre)</span>
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="jf-paused" checked={has('paused')} onCheckedChange={() => toggle('paused')} />
          <Label htmlFor="jf-paused" className="text-sm">Pausadas</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="jf-closed" checked={has('closed')} onCheckedChange={() => toggle('closed')} />
          <Label htmlFor="jf-closed" className="text-sm">Fechadas</Label>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Checkbox
            id="jf-empty"
            checked={value.includeEmpty}
            onCheckedChange={(c) => onChange({ ...value, includeEmpty: c === true })}
          />
          <Label htmlFor="jf-empty" className="text-sm">Incluir vagas sem candidaturas</Label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/applications/JobStatusFilter.tsx
git commit -m "feat(applications): JobStatusFilter visible status/empty filter"
```

---

### Task 5: Hook motor `useJobsNavigation` + integração mínima na página (corrige pausadas/vazias)

**Files:**
- Create: `src/components/empresa/applications/useJobsNavigation.ts`
- Modify: `src/pages/empresa/Applications.tsx` (imports; substituir memo `companyJobs` 470-476; auto-seleção 479-483; Select 855-868; `selectedJob` 787; remover `applicationsCountByJob` 431-439)

**Interfaces:**
- Consumes: `computeJobBreakdowns`, `filterVisibleJobs`, `DEFAULT_JOB_STATUS_FILTER`, `JobBreakdown`, `JobStatusFilterState` (Task 1)
- Produces:
  - `interface UseJobsNavigationResult { visibleJobs: Job[]; breakdowns: Map<string, JobBreakdown>; statusFilter: JobStatusFilterState; setStatusFilter: (next: JobStatusFilterState) => void }`
  - `function useJobsNavigation(jobs: Job[], applications: Pick<Application,'jobId'|'status'>[]): UseJobsNavigationResult`

- [ ] **Step 1: Create the hook**

```ts
// src/components/empresa/applications/useJobsNavigation.ts
import { useMemo, useState } from 'react';
import type { Job } from '@/types/job';
import type { Application } from '@/types';
import {
  computeJobBreakdowns,
  filterVisibleJobs,
  DEFAULT_JOB_STATUS_FILTER,
  type JobBreakdown,
  type JobStatusFilterState,
} from './jobsNavigation.helpers';

export interface UseJobsNavigationResult {
  visibleJobs: Job[];
  breakdowns: Map<string, JobBreakdown>;
  statusFilter: JobStatusFilterState;
  setStatusFilter: (next: JobStatusFilterState) => void;
}

export function useJobsNavigation(
  jobs: Job[],
  applications: Pick<Application, 'jobId' | 'status'>[],
): UseJobsNavigationResult {
  const [statusFilter, setStatusFilter] = useState<JobStatusFilterState>(DEFAULT_JOB_STATUS_FILTER);
  const breakdowns = useMemo(() => computeJobBreakdowns(applications), [applications]);
  const visibleJobs = useMemo(() => filterVisibleJobs(jobs, breakdowns, statusFilter), [jobs, breakdowns, statusFilter]);
  return { visibleJobs, breakdowns, statusFilter, setStatusFilter };
}
```

- [ ] **Step 2: Add imports to Applications.tsx**

Após os imports de `useJobsByCompany`/`useApplicationsQuery` (perto da linha 86-92), adicione:

```tsx
import { useJobsNavigation } from '@/components/empresa/applications/useJobsNavigation';
import { JobStatusFilter } from '@/components/empresa/applications/JobStatusFilter';
import { useSearchParams } from 'react-router-dom'; // já importado na linha 12 — NÃO duplicar
```

(`useSearchParams` já é importado de `react-router-dom` na linha 12; apenas garanta que existe.)

- [ ] **Step 3: Substituir o memo `companyJobs` e a auto-seleção**

Remova o bloco atual (linhas ~470-483):

```tsx
  // Get company jobs (active or paused)
  const companyJobs = useMemo(() =>
    fetchedCompanyJobs.filter(
      (job) => job.status === 'active' || job.status === 'paused'
    ),
    [fetchedCompanyJobs]
  );

  // Set default job on load
  useEffect(() => {
    if (companyJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(companyJobs[0].id);
    }
  }, [companyJobs, selectedJobId]);
```

E coloque no lugar:

```tsx
  // Job navigation engine (visible jobs + per-stage breakdowns + status filter)
  const { visibleJobs, breakdowns, statusFilter, setStatusFilter } = useJobsNavigation(
    fetchedCompanyJobs,
    applications,
  );

  // Set default job on load (first visible job)
  useEffect(() => {
    if (visibleJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(visibleJobs[0].id);
    }
  }, [visibleJobs, selectedJobId]);

  // Sync selected job to the URL (?jobId=) for deep-linking
  const [, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (selectedJobId) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('jobId', selectedJobId);
        return next;
      }, { replace: true });
    }
  }, [selectedJobId, setSearchParams]);
```

> Nota: `applications` (linha ~396) e `selectedJobId` (linha ~362) já existem antes deste ponto. Mantenha a ordem: este bloco fica após a declaração de `applications`.

- [ ] **Step 4: Remover o memo `applicationsCountByJob` redundante**

Remova o bloco (linhas ~430-439):

```tsx
  // Real application count per job (only active pipeline statuses)
  const applicationsCountByJob = useMemo(() => {
    const map: Record<string, number> = {};
    for (const app of applications) {
      if (activeStatuses.includes(app.status)) {
        map[app.jobId] = (map[app.jobId] ?? 0) + 1;
      }
    }
    return map;
  }, [applications]);
```

(`activeStatuses` na linha ~428 e `totalActiveApplications` na linha ~442 continuam — não remova.)

- [ ] **Step 5: Substituir o `<Select>` de vaga pelo seletor alimentado pelo motor + filtro**

Substitua o bloco do "Job Selector" (linhas ~854-868) por:

```tsx
          {/* Job Selector */}
          <div className="flex flex-1 gap-2">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full lg:w-80">
                <SelectValue placeholder="Selecione uma vaga" />
              </SelectTrigger>
              <SelectContent>
                {visibleJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} ({breakdowns.get(job.id)?.total ?? 0} candidaturas)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <JobStatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>
```

- [ ] **Step 6: Corrigir o lookup de `selectedJob`**

Na linha ~787, troque:

```tsx
  const selectedJob = companyJobs.find((j) => j.id === selectedJobId);
```

por:

```tsx
  const selectedJob = fetchedCompanyJobs.find((j) => j.id === selectedJobId);
```

- [ ] **Step 7: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: sem erros. (Se o lint apontar `companyJobs`/`applicationsCountByJob` não usados, é porque alguma referência ficou — remova-a.)

- [ ] **Step 8: Verificação visual no preview**

Inicie o preview e abra `/empresa/candidaturas` com a empresa `rh@techsolutions.com`. Confirme:
- O seletor lista **só vagas ativas com candidaturas** (sem pausadas, sem "(0 candidaturas)").
- Clicar em "Filtrar vagas" → marcar "Pausadas"/"Fechadas" e "Incluir vagas sem candidaturas" passa a exibi-las.
- Selecionar uma vaga atualiza a URL para `?jobId=...` e o Kanban funciona como antes.

- [ ] **Step 9: Commit**

```bash
git add src/components/empresa/applications/useJobsNavigation.ts src/pages/empresa/Applications.tsx
git commit -m "feat(applications): drive job selector via navigation engine; show only active jobs with applications"
```

---

## FASE 2 — Switcher + Modo A (combobox)

### Task 6: `useViewMode` + `parseViewMode` (localStorage)

**Files:**
- Create: `src/components/empresa/applications/useViewMode.ts`
- Test: `src/components/empresa/applications/useViewMode.test.ts`

**Interfaces:**
- Produces:
  - `type ViewMode = 'combobox' | 'sidebar' | 'cards'`
  - `const VIEW_MODES: ViewMode[]` (Fase 2 = `['combobox']`)
  - `const DEFAULT_VIEW_MODE: ViewMode` (Fase 2 = `'combobox'`)
  - `function parseViewMode(value: string | null): ViewMode`
  - `function useViewMode(): { viewMode: ViewMode; setViewMode: (m: ViewMode) => void }`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/empresa/applications/useViewMode.test.ts
import { describe, it, expect } from 'vitest';
import { parseViewMode, DEFAULT_VIEW_MODE } from '@/components/empresa/applications/useViewMode';

describe('parseViewMode', () => {
  it('returns the stored mode when valid', () => {
    expect(parseViewMode('combobox')).toBe('combobox');
    expect(parseViewMode('sidebar')).toBe('sidebar');
    expect(parseViewMode('cards')).toBe('cards');
  });
  it('falls back to the default for null or unknown values', () => {
    expect(parseViewMode(null)).toBe(DEFAULT_VIEW_MODE);
    expect(parseViewMode('bogus')).toBe(DEFAULT_VIEW_MODE);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- useViewMode`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/empresa/applications/useViewMode.ts
import { useState, useEffect } from 'react';

export type ViewMode = 'combobox' | 'sidebar' | 'cards';

// Phases 3/4 append 'sidebar' and 'cards', and Phase 4 flips DEFAULT to 'cards'.
export const VIEW_MODES: ViewMode[] = ['combobox'];
export const DEFAULT_VIEW_MODE: ViewMode = 'combobox';

const STORAGE_KEY = 'recrutars-applications-view-mode';

export function parseViewMode(value: string | null): ViewMode {
  return value === 'combobox' || value === 'sidebar' || value === 'cards' ? value : DEFAULT_VIEW_MODE;
}

function loadViewMode(): ViewMode {
  try {
    return parseViewMode(localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_VIEW_MODE;
  }
}

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, viewMode);
    } catch (error) {
      console.error('Erro ao salvar modo de visualização:', error);
    }
  }, [viewMode]);

  return { viewMode, setViewMode };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- useViewMode`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/empresa/applications/useViewMode.ts src/components/empresa/applications/useViewMode.test.ts
git commit -m "feat(applications): useViewMode hook with localStorage persistence"
```

---

### Task 7: `JobNavItem` — linha de vaga compartilhada

**Files:**
- Create: `src/components/empresa/applications/JobNavItem.tsx`

**Interfaces:**
- Consumes: `JobBreakdown` (Task 1), `JobFunnelBar` (Task 3), `JOB_STATUS_META` (Task 2)
- Produces: `function JobNavItem(props: { job: Job; breakdown: JobBreakdown; selected?: boolean; onSelect: () => void }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
// src/components/empresa/applications/JobNavItem.tsx
import { cn } from '@/lib/utils';
import { JobFunnelBar } from './JobFunnelBar';
import { JOB_STATUS_META } from './statusColors';
import type { JobBreakdown } from './jobsNavigation.helpers';
import type { Job } from '@/types/job';

interface JobNavItemProps {
  job: Job;
  breakdown: JobBreakdown;
  selected?: boolean;
  onSelect: () => void;
}

export function JobNavItem({ job, breakdown, selected, onSelect }: JobNavItemProps) {
  const meta = JOB_STATUS_META[job.status];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'group flex w-full flex-col gap-1.5 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors',
        'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'border-primary/30 bg-primary/5 shadow-[inset_3px_0_0_0_hsl(var(--primary))]',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dotClass)} aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{job.title}</span>
        <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">{breakdown.total}</span>
      </div>
      <JobFunnelBar breakdown={breakdown} />
      <div className="flex items-center justify-between text-[11px]">
        <span className={meta.textClass}>{meta.label}</span>
        {breakdown.novos > 0 && <span className="text-blue-600">{breakdown.novos} novos</span>}
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/applications/JobNavItem.tsx
git commit -m "feat(applications): JobNavItem shared job row"
```

---

### Task 8: `JobNavSwitcher` — segmented control

**Files:**
- Create: `src/components/empresa/applications/JobNavSwitcher.tsx`

**Interfaces:**
- Consumes: `VIEW_MODES`, `ViewMode` (Task 6); `ToggleGroup`/`ToggleGroupItem` (`src/components/ui/toggle-group.tsx`)
- Produces: `function JobNavSwitcher(props: { value: ViewMode; onChange: (mode: ViewMode) => void }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
// src/components/empresa/applications/JobNavSwitcher.tsx
import type { ReactNode } from 'react';
import { ChevronsUpDown, PanelLeft, LayoutGrid } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { VIEW_MODES, type ViewMode } from './useViewMode';

const ICONS: Record<ViewMode, ReactNode> = {
  combobox: <ChevronsUpDown className="h-4 w-4" />,
  sidebar: <PanelLeft className="h-4 w-4" />,
  cards: <LayoutGrid className="h-4 w-4" />,
};

const LABELS: Record<ViewMode, string> = {
  combobox: 'Combobox',
  sidebar: 'Lista',
  cards: 'Cards',
};

interface JobNavSwitcherProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function JobNavSwitcher({ value, onChange }: JobNavSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as ViewMode)}
      aria-label="Modo de visualização das vagas"
      className="rounded-lg border border-border bg-card p-1"
    >
      {VIEW_MODES.map((mode) => (
        <ToggleGroupItem
          key={mode}
          value={mode}
          aria-label={LABELS[mode]}
          className="gap-2 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {ICONS[mode]}
          <span className="hidden sm:inline">{LABELS[mode]}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/applications/JobNavSwitcher.tsx
git commit -m "feat(applications): JobNavSwitcher view-mode segmented control"
```

---

### Task 9: `JobCombobox` — modo A

**Files:**
- Create: `src/components/empresa/applications/JobCombobox.tsx`

**Interfaces:**
- Consumes: `JobBreakdown`, `JobStatusFilterState` (Task 1), `JOB_STATUS_META` (Task 2); `Command*` (`src/components/ui/command.tsx`), `Popover*` (`src/components/ui/popover.tsx`)
- Produces: `function JobCombobox(props: { jobs: Job[]; breakdowns: Map<string, JobBreakdown>; selectedJobId: string; onSelect: (jobId: string) => void; statusFilter: JobStatusFilterState; onStatusFilterChange: (next: JobStatusFilterState) => void; className?: string }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
// src/components/empresa/applications/JobCombobox.tsx
import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { JOB_STATUS_META } from './statusColors';
import type { JobBreakdown, JobStatusFilterState } from './jobsNavigation.helpers';
import type { Job, JobStatus } from '@/types/job';

interface JobComboboxProps {
  jobs: Job[];
  breakdowns: Map<string, JobBreakdown>;
  selectedJobId: string;
  onSelect: (jobId: string) => void;
  statusFilter: JobStatusFilterState;
  onStatusFilterChange: (next: JobStatusFilterState) => void;
  className?: string;
}

const GROUP_ORDER: JobStatus[] = ['active', 'paused', 'closed'];
const GROUP_HEADING: Record<JobStatus, string> = { active: 'Ativas', paused: 'Pausadas', closed: 'Fechadas' };

export function JobCombobox({
  jobs,
  breakdowns,
  selectedJobId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
  className,
}: JobComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = jobs.find((j) => j.id === selectedJobId);
  const showInactive = statusFilter.statuses.includes('paused') || statusFilter.statuses.includes('closed');

  const grouped = GROUP_ORDER.map((status) => ({
    status,
    items: jobs.filter((j) => j.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between lg:w-80', className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected && <span className={cn('h-2 w-2 shrink-0 rounded-full', JOB_STATUS_META[selected.status].dotClass)} />}
            <span className="truncate">{selected ? selected.title : 'Selecione uma vaga'}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {selected && <span className="text-sm font-bold tabular-nums">{breakdowns.get(selected.id)?.total ?? 0}</span>}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar vaga..." />
          <CommandList className="max-h-[60vh]">
            <CommandEmpty>Nenhuma vaga encontrada.</CommandEmpty>
            {grouped.map((group) => (
              <CommandGroup key={group.status} heading={GROUP_HEADING[group.status]}>
                {group.items.map((job) => {
                  const b = breakdowns.get(job.id);
                  return (
                    <CommandItem
                      key={job.id}
                      value={`${job.title} ${job.id}`}
                      onSelect={() => {
                        onSelect(job.id);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', job.id === selectedJobId ? 'opacity-100' : 'opacity-0')} />
                      <span className={cn('mr-2 h-2 w-2 rounded-full', JOB_STATUS_META[job.status].dotClass)} />
                      <span className="flex-1 truncate">{job.title}</span>
                      <span className="ml-2 text-sm font-bold tabular-nums text-muted-foreground">{b?.total ?? 0}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
          {!showInactive && (
            <button
              type="button"
              onClick={() => onStatusFilterChange({ ...statusFilter, statuses: ['active', 'paused', 'closed'] })}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-sm text-primary hover:bg-muted/60"
            >
              <Plus className="h-4 w-4" /> Mostrar pausadas e fechadas
            </button>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/applications/JobCombobox.tsx
git commit -m "feat(applications): JobCombobox (mode A) searchable grouped selector"
```

---

### Task 10: Integrar switcher + restruturar a página com dispatch por modo

**Files:**
- Modify: `src/pages/empresa/Applications.tsx`

**Interfaces:**
- Consumes: `useViewMode` (Task 6), `JobNavSwitcher` (Task 8), `JobCombobox` (Task 9)

Esta task restrutura a região de navegação para um dispatch por modo. Em casos ainda não implementados (`sidebar`, `cards`) o `default` cai no modo combobox — as Fases 3 e 4 preenchem esses ramos.

- [ ] **Step 1: Adicionar imports**

Junto aos imports de applications (perto da linha 86):

```tsx
import { useViewMode } from '@/components/empresa/applications/useViewMode';
import { JobNavSwitcher } from '@/components/empresa/applications/JobNavSwitcher';
import { JobCombobox } from '@/components/empresa/applications/JobCombobox';
```

- [ ] **Step 2: Instanciar o modo e colocar o switcher no header**

Logo após a chamada de `useJobsNavigation` (Task 5), adicione:

```tsx
  const { viewMode, setViewMode } = useViewMode();
```

No `<PageHeader>` (linha ~833), adicione a prop `actions`:

```tsx
        <PageHeader
          title="Candidaturas"
          description="Acompanhe e gerencie todas as candidaturas das suas vagas. Filtre por status, avalie candidatos e avance no processo seletivo."
          actions={<JobNavSwitcher value={viewMode} onChange={setViewMode} />}
          badges={
            <Badge
              variant="secondary"
              className="text-base font-semibold px-3 py-1 bg-secondary/10 text-secondary"
              aria-label={`${totalActiveApplications} candidaturas no total`}
            >
              {totalActiveApplications}
            </Badge>
          }
          howItWorks={[
            'Acompanhe todas as candidaturas das suas vagas',
            'Arraste cards no pipeline Kanban para avançar candidatos',
            'Filtre por vaga, status e perfil comportamental',
          ]}
        />
```

- [ ] **Step 3: Extrair `board`, `summaryStrip` e `candidateFilters` como variáveis**

Antes do `return (` (após a linha ~828, junto das outras derivações), declare três variáveis com o JSX que **hoje** está inline. Recorte o conteúdo existente e mova para cá:

- `summaryStrip`: o bloco do "Summary Strip" atualmente em ~922-955 (a `<motion.div>` inteira, incluindo a condição `selectedJobId && !isLoading`).
- `candidateFilters`: o bloco "Filters" atualmente em ~870-919 (a `<div className="flex flex-wrap gap-2">...`) incluindo os três `Select` e o botão Exportar.
- `board`: o bloco que vai do `{!isLoading && selectedJobId ? (` até o fechamento do empty-state, atualmente em ~957-1082 (toda a área de loading + DndContext + seções rejected/hired + empty-state).

```tsx
  const summaryStrip = selectedJobId && !isLoading ? (
    /* … cole aqui exatamente a <motion.div> do Summary Strip (linhas ~924-954) … */
  ) : null;

  const candidateFilters = (
    /* … cole aqui exatamente a <div className="flex flex-wrap gap-2"> dos filtros + Exportar (linhas ~871-919) … */
  );

  const board = (
    <>
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {/* … cole aqui exatamente o restante do board: o ternário {!isLoading && selectedJobId ? (<>…</>) : (<emptyState/>)} das linhas ~964-1082 … */}
    </>
  );
```

> O conteúdo colado é **idêntico** ao que já existe — só está sendo movido para variáveis para reaproveitamento entre modos. Não altere a lógica interna.

- [ ] **Step 4: Substituir a antiga região "Job Selector and Filters" + "Summary Strip" + "Kanban Board" pelo dispatch por modo**

No `return`, troque tudo que ia do bloco `{/* Job Selector and Filters */}` até o fim do board (o que antes eram as linhas ~852-1082, agora parcialmente extraído) por:

```tsx
        {viewMode === 'combobox' ? (
          <>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex flex-1 gap-2">
                <JobCombobox
                  jobs={visibleJobs}
                  breakdowns={breakdowns}
                  selectedJobId={selectedJobId}
                  onSelect={setSelectedJobId}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
                <JobStatusFilter value={statusFilter} onChange={setStatusFilter} />
              </div>
              {candidateFilters}
            </div>
            {summaryStrip}
            {board}
          </>
        ) : (
          /* Modos 'sidebar' e 'cards' são preenchidos nas Fases 3 e 4. Fallback: combobox. */
          <>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex flex-1 gap-2">
                <JobCombobox
                  jobs={visibleJobs}
                  breakdowns={breakdowns}
                  selectedJobId={selectedJobId}
                  onSelect={setSelectedJobId}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
                <JobStatusFilter value={statusFilter} onChange={setStatusFilter} />
              </div>
              {candidateFilters}
            </div>
            {summaryStrip}
            {board}
          </>
        )}
```

> O `<Select>` simples + `JobStatusFilter` adicionados na Task 5 são **removidos** aqui (substituídos pelo `JobCombobox`). Confira que a `<div className="flex flex-col lg:flex-row gap-4">` original foi inteiramente substituída.

- [ ] **Step 5: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: sem erros e sem variáveis órfãs.

- [ ] **Step 6: Verificação visual no preview**

Em `/empresa/candidaturas`: o switcher aparece no topo direito (1 botão "Combobox" nesta fase); o seletor agora é o combobox com busca e grupos; o rodapé "Mostrar pausadas e fechadas" funciona; o board permanece idêntico.

- [ ] **Step 7: Commit**

```bash
git add src/pages/empresa/Applications.tsx
git commit -m "feat(applications): add view-mode switcher and mode-A combobox navigation"
```

---

## FASE 3 — Modo B (lista lateral)

### Task 11: `JobSidebar` — painel interno da lista lateral

**Files:**
- Create: `src/components/empresa/applications/JobSidebar.tsx`

**Interfaces:**
- Consumes: `JobNavItem` (Task 7), `JobStatusFilter` (Task 4), `JobBreakdown`/`JobStatusFilterState` (Task 1); `Input` (`src/components/ui/input.tsx`), `ScrollArea` (`src/components/ui/scroll-area.tsx`)
- Produces: `function JobSidebar(props: { jobs: Job[]; breakdowns: Map<string, JobBreakdown>; selectedJobId: string; onSelect: (jobId: string) => void; statusFilter: JobStatusFilterState; onStatusFilterChange: (next: JobStatusFilterState) => void }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
// src/components/empresa/applications/JobSidebar.tsx
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JobNavItem } from './JobNavItem';
import { JobStatusFilter } from './JobStatusFilter';
import type { JobBreakdown, JobStatusFilterState } from './jobsNavigation.helpers';
import type { Job } from '@/types/job';

const EMPTY_BREAKDOWN: JobBreakdown = { pending: 0, reviewing: 0, interview: 0, offer: 0, total: 0, novos: 0 };

interface JobSidebarProps {
  jobs: Job[];
  breakdowns: Map<string, JobBreakdown>;
  selectedJobId: string;
  onSelect: (jobId: string) => void;
  statusFilter: JobStatusFilterState;
  onStatusFilterChange: (next: JobStatusFilterState) => void;
}

export function JobSidebar({
  jobs,
  breakdowns,
  selectedJobId,
  onSelect,
  statusFilter,
  onStatusFilterChange,
}: JobSidebarProps) {
  const [query, setQuery] = useState('');
  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar vaga..."
            className="pl-8"
            aria-label="Buscar vaga"
          />
        </div>
        <JobStatusFilter value={statusFilter} onChange={onStatusFilterChange} />
      </div>
      <ScrollArea className="-mx-1 flex-1 px-1">
        <div className="space-y-1 pb-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma vaga encontrada</p>
          ) : (
            filtered.map((job) => (
              <JobNavItem
                key={job.id}
                job={job}
                breakdown={breakdowns.get(job.id) ?? EMPTY_BREAKDOWN}
                selected={job.id === selectedJobId}
                onSelect={() => onSelect(job.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/applications/JobSidebar.tsx
git commit -m "feat(applications): JobSidebar (mode B) master list panel"
```

---

### Task 12: Renderizar o modo B na página (desktop split + Sheet mobile)

**Files:**
- Modify: `src/pages/empresa/Applications.tsx`
- Modify: `src/components/empresa/applications/useViewMode.ts` (adicionar `'sidebar'` a `VIEW_MODES`)

**Interfaces:**
- Consumes: `JobSidebar` (Task 11); `Sheet*` (`src/components/ui/sheet.tsx`)

- [ ] **Step 1: Habilitar o modo no switcher**

Em `useViewMode.ts`, troque:

```ts
export const VIEW_MODES: ViewMode[] = ['combobox'];
```

por:

```ts
export const VIEW_MODES: ViewMode[] = ['combobox', 'sidebar'];
```

- [ ] **Step 2: Imports na página**

```tsx
import { JobSidebar } from '@/components/empresa/applications/JobSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft } from 'lucide-react'; // adicionar ao import existente de lucide-react (linha ~28-44)
```

> `PanelLeft` deve ser adicionado à lista de ícones já importada de `lucide-react`, não em um import separado.

- [ ] **Step 3: Adicionar o ramo `sidebar` no dispatch**

No dispatch da Task 10, adicione um ramo antes do fallback:

```tsx
        ) : viewMode === 'sidebar' ? (
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Desktop: coluna fixa */}
            <aside className="hidden w-[300px] shrink-0 lg:block">
              <div className="sticky top-4 h-[calc(100vh-8rem)]">
                <JobSidebar
                  jobs={visibleJobs}
                  breakdowns={breakdowns}
                  selectedJobId={selectedJobId}
                  onSelect={setSelectedJobId}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
              </div>
            </aside>

            {/* Mobile: botão que abre Sheet */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <PanelLeft className="h-4 w-4" />
                    {selectedJob ? selectedJob.title : 'Trocar vaga'}
                    <span className="ml-auto rounded-full bg-primary/15 px-2 text-xs text-primary">
                      {visibleJobs.length}
                    </span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[88vw] max-w-sm p-4">
                  <JobSidebar
                    jobs={visibleJobs}
                    breakdowns={breakdowns}
                    selectedJobId={selectedJobId}
                    onSelect={setSelectedJobId}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Conteúdo */}
            <div className="min-w-0 flex-1 space-y-6">
              <div className="flex flex-wrap justify-end">{candidateFilters}</div>
              {summaryStrip}
              {board}
            </div>
          </div>
```

A estrutura do dispatch passa a ser: `viewMode === 'combobox' ? (…) : viewMode === 'sidebar' ? (…) : (fallback combobox)`.

- [ ] **Step 4: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: sem erros.

- [ ] **Step 5: Verificação visual no preview**

Alterne para "Lista" no switcher. Em desktop (≥1024px): coluna de vagas à esquerda, board à direita, item selecionado destacado com barra cyan. Em largura <1024px (use o resize do preview): a coluna some e aparece o botão "Trocar vaga" que abre o Sheet. Selecionar uma vaga no Sheet fecha e atualiza o board.

- [ ] **Step 6: Commit**

```bash
git add src/pages/empresa/Applications.tsx src/components/empresa/applications/useViewMode.ts
git commit -m "feat(applications): render mode-B sidebar (desktop split + mobile sheet)"
```

---

## FASE 4 — Modo C (cards) + default

### Task 13: `JobCard` — card de vaga

**Files:**
- Create: `src/components/empresa/applications/JobCard.tsx`

**Interfaces:**
- Consumes: `JobBreakdown` (Task 1), `JobFunnelBar` (Task 3), `JOB_STATUS_META`/`PIPELINE_STAGES` (Task 2)
- Produces: `function JobCard(props: { job: Job; breakdown: JobBreakdown; onOpen: () => void; index?: number }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
// src/components/empresa/applications/JobCard.tsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { JobFunnelBar } from './JobFunnelBar';
import { JOB_STATUS_META, PIPELINE_STAGES } from './statusColors';
import type { JobBreakdown } from './jobsNavigation.helpers';
import type { Job } from '@/types/job';

interface JobCardProps {
  job: Job;
  breakdown: JobBreakdown;
  onOpen: () => void;
  index?: number;
}

export function JobCard({ job, breakdown, onOpen, index = 0 }: JobCardProps) {
  const meta = JOB_STATUS_META[job.status];
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors',
        'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dotClass)} aria-hidden />
          <span className="truncate text-sm font-semibold text-foreground">{job.title}</span>
        </div>
        <span className={cn('shrink-0 text-[11px] font-medium', meta.textClass)}>{meta.label}</span>
      </div>

      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold tabular-nums text-foreground">{breakdown.total}</span>
        {breakdown.novos > 0 && (
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600">
            {breakdown.novos} novos
          </span>
        )}
      </div>

      <JobFunnelBar breakdown={breakdown} className="h-2" />

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {PIPELINE_STAGES.map((s) => (
          <span key={s.key}>
            <span className={cn('font-semibold', s.textClass)}>{breakdown[s.key]}</span> {s.label}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/applications/JobCard.tsx
git commit -m "feat(applications): JobCard for cards mode"
```

---

### Task 14: `JobCardsGrid` — grid do modo C

**Files:**
- Create: `src/components/empresa/applications/JobCardsGrid.tsx`

**Interfaces:**
- Consumes: `JobCard` (Task 13), `JobStatusFilter` (Task 4), `JobBreakdown`/`JobStatusFilterState` (Task 1); `Input`
- Produces: `function JobCardsGrid(props: { jobs: Job[]; breakdowns: Map<string, JobBreakdown>; onOpen: (jobId: string) => void; statusFilter: JobStatusFilterState; onStatusFilterChange: (next: JobStatusFilterState) => void }): JSX.Element`

- [ ] **Step 1: Create the component**

```tsx
// src/components/empresa/applications/JobCardsGrid.tsx
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { JobCard } from './JobCard';
import { JobStatusFilter } from './JobStatusFilter';
import type { JobBreakdown, JobStatusFilterState } from './jobsNavigation.helpers';
import type { Job } from '@/types/job';

const EMPTY_BREAKDOWN: JobBreakdown = { pending: 0, reviewing: 0, interview: 0, offer: 0, total: 0, novos: 0 };

interface JobCardsGridProps {
  jobs: Job[];
  breakdowns: Map<string, JobBreakdown>;
  onOpen: (jobId: string) => void;
  statusFilter: JobStatusFilterState;
  onStatusFilterChange: (next: JobStatusFilterState) => void;
}

export function JobCardsGrid({ jobs, breakdowns, onOpen, statusFilter, onStatusFilterChange }: JobCardsGridProps) {
  const [query, setQuery] = useState('');
  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar vaga..."
            className="pl-8"
            aria-label="Buscar vaga"
          />
        </div>
        <JobStatusFilter value={statusFilter} onChange={onStatusFilterChange} />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-12 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Nenhuma vaga ativa com candidaturas. Ajuste o filtro para incluir pausadas/fechadas ou vagas sem candidaturas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              breakdown={breakdowns.get(job.id) ?? EMPTY_BREAKDOWN}
              onOpen={() => onOpen(job.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/empresa/applications/JobCardsGrid.tsx
git commit -m "feat(applications): JobCardsGrid (mode C) job overview grid"
```

---

### Task 15: Renderizar o modo C + tornar `'cards'` o padrão + auto-seleção mode-aware

**Files:**
- Modify: `src/components/empresa/applications/useViewMode.ts` (append `'cards'`; default → `'cards'`)
- Modify: `src/pages/empresa/Applications.tsx` (ramo `cards`; auto-seleção mode-aware; substituir o fallback)

**Interfaces:**
- Consumes: `JobCardsGrid` (Task 14), `JobCombobox` (Task 9)

- [ ] **Step 1: Finalizar modos e default**

Em `useViewMode.ts`, troque:

```ts
export const VIEW_MODES: ViewMode[] = ['combobox', 'sidebar'];
export const DEFAULT_VIEW_MODE: ViewMode = 'combobox';
```

por:

```ts
export const VIEW_MODES: ViewMode[] = ['combobox', 'sidebar', 'cards'];
export const DEFAULT_VIEW_MODE: ViewMode = 'cards';
```

- [ ] **Step 2: Import na página**

```tsx
import { JobCardsGrid } from '@/components/empresa/applications/JobCardsGrid';
import { ArrowLeft } from 'lucide-react'; // adicionar à lista de ícones lucide-react existente
```

- [ ] **Step 3: Auto-seleção mode-aware**

Localize o efeito de auto-seleção (Task 5, Step 3):

```tsx
  useEffect(() => {
    if (visibleJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(visibleJobs[0].id);
    }
  }, [visibleJobs, selectedJobId]);
```

Troque por (não auto-seleciona no modo cards — mostra o grid primeiro):

```tsx
  useEffect(() => {
    if (viewMode !== 'cards' && visibleJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(visibleJobs[0].id);
    }
  }, [viewMode, visibleJobs, selectedJobId]);
```

- [ ] **Step 4: Substituir o ramo fallback pelo modo `cards` real**

No dispatch, troque o ramo final (o `: (fallback combobox)`) por:

```tsx
        ) : (
          /* Modo C — cards */
          !selectedJobId ? (
            <JobCardsGrid
              jobs={visibleJobs}
              breakdowns={breakdowns}
              onOpen={setSelectedJobId}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedJobId('')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Vagas
                  </Button>
                  <h2 className="truncate text-lg font-semibold text-foreground">{selectedJob?.title}</h2>
                </div>
                <JobCombobox
                  jobs={visibleJobs}
                  breakdowns={breakdowns}
                  selectedJobId={selectedJobId}
                  onSelect={setSelectedJobId}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
              </div>
              <div className="flex flex-wrap justify-end">{candidateFilters}</div>
              {summaryStrip}
              {board}
            </div>
          )
        )}
```

> Atenção ao botão "← Vagas": ele faz `setSelectedJobId('')`. Como o efeito da URL (Task 5) só escreve quando `selectedJobId` é truthy, ao voltar para o grid a query `?jobId` permanece a última — isso é aceitável. Opcional: no `onClick`, também limpar via `setSearchParams` removendo `jobId`. Não obrigatório.

- [ ] **Step 5: Verify lint + build + testes**

Run: `npm run lint && npm run build && npm run test`
Expected: tudo verde.

- [ ] **Step 6: Verificação visual no preview**

Recarregue `/empresa/candidaturas` (limpe o `localStorage` da chave `recrutars-applications-view-mode` se necessário). Padrão agora é **Cards**: grid de cards de vaga; clicar abre o board em tela cheia com "← Vagas" e o combobox de troca rápida; voltar mostra o grid. Alternar entre os 3 modos no switcher persiste após reload.

- [ ] **Step 7: Commit**

```bash
git add src/pages/empresa/Applications.tsx src/components/empresa/applications/useViewMode.ts
git commit -m "feat(applications): render mode-C cards grid and make it the default view"
```

---

## FASE 5 — Polish + versionamento

### Task 16: Acessibilidade, `prefers-reduced-motion` e revisão de contraste

**Files:**
- Modify: `src/components/empresa/applications/JobCard.tsx` (respeitar reduced-motion)
- Verify: demais componentes da pasta

- [ ] **Step 1: Respeitar `prefers-reduced-motion` no `JobCard`**

Em `JobCard.tsx`, importe e use o hook do Framer Motion:

```tsx
import { motion, useReducedMotion } from 'framer-motion';
```

Dentro do componente:

```tsx
  const reduce = useReducedMotion();
```

E ajuste as props de animação:

```tsx
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : Math.min(index * 0.03, 0.3) }}
```

- [ ] **Step 2: Checklist de acessibilidade (manual)**

Verifique no preview com navegação por teclado (Tab/Setas/Enter/Esc):
- Switcher navegável e com foco visível.
- Combobox: busca, setas e `Esc` funcionam; `Mostrar pausadas e fechadas` alcançável.
- Sidebar e cards: itens focáveis, `aria-current` no selecionado, focus ring visível.
- Status sempre tem texto além da cor (dot + label).

Corrija qualquer item que falhar (ex.: adicionar `aria-label` faltante).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 4: Commit**

```bash
git add src/components/empresa/applications/
git commit -m "fix(applications): respect reduced-motion and tighten a11y on job navigation"
```

---

### Task 17: Bump de versão MINOR + changelog

**Files:**
- Modify: `src/constants/app.ts` (`APP_VERSION`, `APP_CODENAME`)
- Modify: `public/changelog.json` (nova versão com `isCurrent: true`; mover o `isCurrent` da versão anterior para `false`)
- Modify: `package.json` (`version`)

> Consulte os valores atuais antes de editar: `APP_VERSION` em `src/constants/app.ts` e a versão atual em `public/changelog.json`. A versão atual de referência é `1.68.1` no `package.json` (confirme o estado real). Aplique bump **MINOR** (ex.: `1.69.x` → `1.70.0`) e escolha um codename em inglês contextual (ex.: "Switchboard"). Confirme o número exato com o estado do repo.

- [ ] **Step 1: Atualizar constantes**

Em `src/constants/app.ts`, atualize `APP_VERSION` para a nova MINOR e `APP_CODENAME` para o codename escolhido.

- [ ] **Step 2: Adicionar entrada no changelog**

Em `public/changelog.json`, adicione a nova versão no topo com `isCurrent: true` (e troque o `isCurrent` da anterior para `false`). Cada item DEVE ter `details` com `description` (string), `files` (string[]) e `routes` (string[]). Use tipos válidos (`added`, `changed`, `fixed`). Exemplo:

```json
{
  "version": "1.70.0",
  "codename": "Switchboard",
  "date": "2026-06-24",
  "isCurrent": true,
  "items": [
    {
      "type": "added",
      "title": "Três modos de navegação nas Candidaturas (Combobox, Lista e Cards)",
      "details": {
        "0": {
          "description": "Novo switcher permite alternar entre seletor com busca, lista lateral e painel de cards. A preferência fica salva no navegador.",
          "files": ["src/pages/empresa/Applications.tsx", "src/components/empresa/applications/"],
          "routes": ["/empresa/candidaturas"]
        }
      }
    },
    {
      "type": "changed",
      "title": "Seletor de vagas mostra apenas vagas ativas com candidaturas",
      "details": {
        "0": {
          "description": "Vagas pausadas, fechadas e sem candidaturas ficam escondidas por padrão e podem ser reveladas por um filtro visível.",
          "files": ["src/components/empresa/applications/jobsNavigation.helpers.ts"],
          "routes": ["/empresa/candidaturas"]
        }
      }
    }
  ]
}
```

- [ ] **Step 3: Atualizar `package.json`**

Ajuste o campo `version` para a nova MINOR (ex.: `"version": "1.70.0"`).

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build OK e o changelog renderiza sem crash (abra a página "Sobre" / tooltip de versão no preview).

- [ ] **Step 5: Commit**

```bash
git add src/constants/app.ts public/changelog.json package.json
git commit -m "chore(release): v1.70.0 Switchboard — multi-mode job navigation in Candidaturas"
```

---

## Self-Review (preenchido)

**1. Spec coverage:**
- Motor/regras (spec §4.1) → Tasks 1, 5. Filtro visível (§7) → Task 4. Persistência localStorage (§4.2) → Task 6. Modos A/B/C (§5) → Tasks 9/10, 11/12, 13/14/15. Switcher (§6) → Tasks 8, 10. Componentes compartilhados (§7) → Tasks 2, 3, 7, 13. Estrutura de arquivos (§8) → respeitada. Seleção mode-aware + URL (§9) → Tasks 5, 15. A11y/responsivo/microinterações (§10) → Tasks 11/12 (Sheet), 16. Escopo/fasamento (§11) → Fases 1-5. Match-chip stretch (§13) → deliberadamente fora; documentado.
- **Gap conhecido e aceito:** chip de qualidade de match nos cards não é implementado (stretch da spec §13). Sinal `novos` cobre urgência.

**2. Placeholder scan:** sem TBD/TODO de implementação. Trechos "cole aqui" da Task 10 referenciam código **existente** sendo movido (com faixas de linha exatas), não código a inventar.

**3. Type consistency:** `JobBreakdown`, `JobStatusFilterState`, `ViewMode` definidos nas Tasks 1/6 e consumidos com as mesmas assinaturas em todos os componentes. `breakdowns: Map<string, JobBreakdown>`, `statusFilter`/`onStatusFilterChange`, `selectedJobId: string`, `onSelect: (jobId: string) => void` consistentes entre `JobCombobox`/`JobSidebar`/`JobCardsGrid`. `EMPTY_BREAKDOWN` repetido localmente onde necessário (sidebar/grid) — intencional para evitar import cruzado desnecessário.
