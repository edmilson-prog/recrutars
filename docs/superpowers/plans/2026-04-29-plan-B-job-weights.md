# Plano B — Pesos por Vaga

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que cada vaga tenha pesos próprios para as 5 categorias de match (Skills Técnicas, Skills Comportamentais, Experiência, Perfil Comportamental, Localização), substituindo a constante global 40/30/20/10. Adicionar 6 templates pré-definidos e UI completa de criação/edição na aba "Match" do JobForm.

**Architecture:** 5 colunas `weight_*` em `jobs` com CHECK constraints (soma=100, range 0-70). Calculator passa a ler pesos do `job` em vez da constante global. UI implementada como nova 7ª aba no `JobForm` usando shadcn `Slider` (Radix) + input numérico + footer sticky com indicador de soma. 6 templates hardcoded em `src/lib/matchWeightTemplates.ts`. Defaults para vagas existentes preservam a proporção atual: 25/15/30/20/10.

**Tech Stack:** PostgreSQL + Supabase migration, React 18 + TypeScript, shadcn/ui (Slider, Input, Tabs), React Hook Form + Zod, Tailwind. Validação por type-check + build + lint + verificação manual em browser.

**Dependências:** **Requer Plano A mergeado em main** (este plano altera o calculator que foi refatorado em A).

**Spec:** [docs/superpowers/specs/2026-04-29-match-skills-pesos-design.md](../specs/2026-04-29-match-skills-pesos-design.md)

---

## File Structure

**Criados:**
- `sql/migrations/092_job_weights.sql` — ALTER TABLE jobs com 5 colunas + CHECK constraints
- `src/types/matchWeights.ts` — tipo `MatchWeights` + defaults
- `src/lib/matchWeightTemplates.ts` — array dos 6 templates hardcoded
- `src/components/empresa/job-form/JobFormMatchWeights.tsx` — conteúdo da aba completo
- `src/components/empresa/job-form/MatchWeightsTemplateCards.tsx` — cards horizontais de templates
- `src/components/empresa/job-form/MatchWeightsSliders.tsx` — 5 sliders + inputs numéricos
- `src/components/empresa/job-form/MatchWeightsSumIndicator.tsx` — footer sticky com soma + estados

**Modificados:**
- `src/types/database.ts` — adicionar 5 colunas weight_* em `Tables['jobs']`
- `src/lib/supabaseConverters.ts` — converter snake_case ↔ camelCase
- `src/types/index.ts` (ou onde `Job` está) — adicionar campos de peso ao tipo TS
- `src/lib/matchCalculator.ts` — ler pesos do `job` em vez de constante global
- `src/pages/empresa/JobForm.tsx` — adicionar 7ª aba "Match"
- `src/hooks/useJobForm.ts` — campos de peso no form state, dirty tracking
- `src/services/jobs/jobsService.supabase.ts` — incluir weights no INSERT/UPDATE

**Não criados:** Edge Function de update (entra no Plano C). Tabela de histórico (entra no Plano C).

---

## Task 1: Migration — adicionar colunas de peso em `jobs`

**Files:**
- Create: `sql/migrations/092_job_weights.sql`

- [ ] **Step 1: Criar arquivo de migration**

Conteúdo:

```sql
-- 092_job_weights.sql
-- Adiciona 5 colunas de peso por vaga para o algoritmo de match
-- Defaults preservam proporção atual (40/30/20/10) redistribuída em 5 categorias

ALTER TABLE jobs
  ADD COLUMN weight_skills_technical  smallint NOT NULL DEFAULT 25,
  ADD COLUMN weight_skills_behavioral smallint NOT NULL DEFAULT 15,
  ADD COLUMN weight_experience        smallint NOT NULL DEFAULT 30,
  ADD COLUMN weight_gauge_pro         smallint NOT NULL DEFAULT 20,
  ADD COLUMN weight_location          smallint NOT NULL DEFAULT 10;

ALTER TABLE jobs
  ADD CONSTRAINT jobs_weights_sum_check
    CHECK (
      weight_skills_technical + weight_skills_behavioral +
      weight_experience + weight_gauge_pro + weight_location = 100
    );

ALTER TABLE jobs
  ADD CONSTRAINT jobs_weights_range_check
    CHECK (
      weight_skills_technical  BETWEEN 0 AND 70 AND
      weight_skills_behavioral BETWEEN 0 AND 70 AND
      weight_experience        BETWEEN 0 AND 70 AND
      weight_gauge_pro         BETWEEN 0 AND 70 AND
      weight_location          BETWEEN 0 AND 70
    );

COMMENT ON COLUMN jobs.weight_skills_technical IS 'Peso da categoria Skills Técnicas no match (0-70, soma=100)';
COMMENT ON COLUMN jobs.weight_skills_behavioral IS 'Peso da categoria Skills Comportamentais no match (0-70, soma=100)';
COMMENT ON COLUMN jobs.weight_experience IS 'Peso da categoria Experiência no match (0-70, soma=100)';
COMMENT ON COLUMN jobs.weight_gauge_pro IS 'Peso da categoria Perfil Comportamental (Gauge-Pro) no match (0-70, soma=100)';
COMMENT ON COLUMN jobs.weight_location IS 'Peso da categoria Localização no match (0-70, soma=100)';
```

- [ ] **Step 2: Aplicar migration via MCP Supabase**

Run via MCP `apply_migration` (canal Supabase no projeto):

```
name: 092_job_weights
query: <conteúdo do SQL acima>
```

Expected: aplicado com sucesso. As 19 vagas existentes recebem defaults 25/15/30/20/10.

- [ ] **Step 3: Validar com query**

Run via MCP `execute_sql`:

```sql
SELECT
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (
    WHERE weight_skills_technical + weight_skills_behavioral +
          weight_experience + weight_gauge_pro + weight_location = 100
  ) as valid_sum,
  MIN(weight_skills_technical) as min_tech,
  MAX(weight_location) as max_loc
FROM jobs;
```

Expected: `total_jobs = valid_sum` (todas com soma=100), `min_tech = 25`, `max_loc = 10`.

- [ ] **Step 4: Commit**

```bash
git add sql/migrations/092_job_weights.sql
git commit -m "feat(db): add job match weight columns with constraints"
```

---

## Task 2: Atualizar tipos TypeScript

**Files:**
- Modify: `src/types/database.ts`
- Modify: `src/types/index.ts` (ou local de `Job`)

- [ ] **Step 1: Adicionar colunas em `Tables['jobs']`**

Em `src/types/database.ts`, localizar `jobs:` e adicionar dentro de `Row`, `Insert`, `Update`:

```typescript
weight_skills_technical: number;
weight_skills_behavioral: number;
weight_experience: number;
weight_gauge_pro: number;
weight_location: number;
```

(Em `Insert` e `Update`, marcar como `?:` para permitir defaults.)

- [ ] **Step 2: Localizar tipo TS `Job`**

Run:
```bash
grep -rn "export interface Job\b\|export type Job =" src/types/
```

Expected: encontrar definição.

- [ ] **Step 3: Adicionar campos opcionais ao tipo `Job`**

Em `src/types/index.ts` (ou onde estiver), adicionar:

```typescript
export interface Job {
  // ... campos existentes
  weightSkillsTechnical?: number;
  weightSkillsBehavioral?: number;
  weightExperience?: number;
  weightGaugePro?: number;
  weightLocation?: number;
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/database.ts src/types/index.ts
git commit -m "feat(types): add job match weight fields"
```

---

## Task 3: Criar tipo `MatchWeights` + defaults

**Files:**
- Create: `src/types/matchWeights.ts`

- [ ] **Step 1: Criar arquivo**

Conteúdo:

```typescript
/**
 * Pesos das categorias do match para uma vaga.
 * Soma deve ser exatamente 100. Cada peso entre 0 e 70.
 */
export interface MatchWeights {
  skillsTechnical: number;
  skillsBehavioral: number;
  experience: number;
  gaugePro: number;
  location: number;
}

/**
 * Defaults aplicados a vagas que não têm pesos próprios definidos.
 * Preserva a proporção do antigo 40/30/20/10 redistribuída em 5 categorias.
 */
export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  skillsTechnical: 25,
  skillsBehavioral: 15,
  experience: 30,
  gaugePro: 20,
  location: 10,
};

/**
 * Soma os 5 pesos. Útil para validação em tempo real na UI.
 */
export function sumWeights(w: MatchWeights): number {
  return w.skillsTechnical + w.skillsBehavioral + w.experience + w.gaugePro + w.location;
}

/**
 * Valida se os pesos estão dentro das regras (range 0-70 e soma=100).
 */
export function validateWeights(w: MatchWeights): { valid: boolean; error?: string } {
  const values = [w.skillsTechnical, w.skillsBehavioral, w.experience, w.gaugePro, w.location];
  for (const v of values) {
    if (v < 0 || v > 70) {
      return { valid: false, error: 'Cada peso deve estar entre 0 e 70%' };
    }
  }
  const sum = sumWeights(w);
  if (sum !== 100) {
    return { valid: false, error: sum < 100 ? `Faltam ${100 - sum}% para distribuir` : `Excedeu em ${sum - 100}%` };
  }
  return { valid: true };
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/types/matchWeights.ts
git commit -m "feat(types): add MatchWeights type with validation helpers"
```

---

## Task 4: Criar `matchWeightTemplates.ts` com os 6 presets

**Files:**
- Create: `src/lib/matchWeightTemplates.ts`

- [ ] **Step 1: Criar arquivo**

Conteúdo completo:

```typescript
/**
 * Templates de pesos pré-definidos para vagas.
 * Cada template é um atalho que preenche os 5 sliders no formulário de criação.
 *
 * Para evolução futura (CRUD por empresa): ver PRD-092.
 */
import type { MatchWeights } from '@/types/matchWeights';

export interface MatchWeightTemplate {
  id: string;
  name: string;
  description: string;
  examples: string;
  weights: MatchWeights;
  sortOrder: number;
}

export const MATCH_WEIGHT_TEMPLATES: readonly MatchWeightTemplate[] = [
  {
    id: 'operacional',
    name: 'Operacional',
    description: 'Comportamental e localização pesam mais; técnica importa pouco. Vagas que dependem de presença, atitude e disposição.',
    examples: 'Caixa, Estoquista, Operador, Auxiliar de loja',
    weights: { skillsTechnical: 10, skillsBehavioral: 30, experience: 15, gaugePro: 25, location: 20 },
    sortOrder: 1,
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Domínio de máquina e tempo de casa pesam; cliente final ausente reduz comportamental.',
    examples: 'Op. de Balancim, Costureira, Soldador, Produção',
    weights: { skillsTechnical: 25, skillsBehavioral: 15, experience: 30, gaugePro: 15, location: 15 },
    sortOrder: 2,
  },
  {
    id: 'administrativo',
    name: 'Administrativo',
    description: 'Distribuição equilibrada com leve viés para Gauge-Pro. Atendimento interno e externo.',
    examples: 'Aux. Administrativo, Recepcionista, Secretária',
    weights: { skillsTechnical: 20, skillsBehavioral: 20, experience: 20, gaugePro: 25, location: 15 },
    sortOrder: 3,
  },
  {
    id: 'tecnico',
    name: 'Técnico',
    description: 'Skills técnicas e experiência dominam; localização pouco relevante (remoto/híbrido).',
    examples: 'Dev, Analista, Designer, Engenheiro',
    weights: { skillsTechnical: 45, skillsBehavioral: 10, experience: 25, gaugePro: 15, location: 5 },
    sortOrder: 4,
  },
  {
    id: 'lideranca',
    name: 'Liderança',
    description: 'Experiência e perfil de gestão são críticos; técnica e comportamental balanceadas.',
    examples: 'Gerente, Coordenador, Supervisor',
    weights: { skillsTechnical: 20, skillsBehavioral: 20, experience: 30, gaugePro: 25, location: 5 },
    sortOrder: 5,
  },
  {
    id: 'comercial',
    name: 'Comercial',
    description: 'Perfil Gauge-Pro e comportamental dominam — vender é mais sobre pessoa do que técnica.',
    examples: 'Vendedor, SDR, Atendimento, Caixa+vendas',
    weights: { skillsTechnical: 15, skillsBehavioral: 25, experience: 15, gaugePro: 30, location: 15 },
    sortOrder: 6,
  },
] as const;

/**
 * Procura um template que bata exatamente com os pesos atuais.
 * Útil para destacar o template ativo na UI.
 */
export function matchTemplate(weights: MatchWeights): MatchWeightTemplate | null {
  return (
    MATCH_WEIGHT_TEMPLATES.find(
      (t) =>
        t.weights.skillsTechnical === weights.skillsTechnical &&
        t.weights.skillsBehavioral === weights.skillsBehavioral &&
        t.weights.experience === weights.experience &&
        t.weights.gaugePro === weights.gaugePro &&
        t.weights.location === weights.location,
    ) ?? null
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npx tsc --noEmit
git add src/lib/matchWeightTemplates.ts
git commit -m "feat(match): add 6 hardcoded weight templates with helpers"
```

---

## Task 5: Atualizar `supabaseConverters.ts` para weights

**Files:**
- Modify: `src/lib/supabaseConverters.ts`

- [ ] **Step 1: Localizar `jobFromSupabase` e `jobToSupabase`**

Run:
```bash
grep -n "jobFromSupabase\|jobToSupabase\|weight_" src/lib/supabaseConverters.ts
```

Expected: encontrar conversores. Se a estrutura é genérica (snake↔camel automático), pode não precisar alteração explícita.

- [ ] **Step 2: Adicionar mapeamento explícito se necessário**

Se há conversor manual `jobFromSupabase`, adicionar:

```typescript
weightSkillsTechnical: row.weight_skills_technical,
weightSkillsBehavioral: row.weight_skills_behavioral,
weightExperience: row.weight_experience,
weightGaugePro: row.weight_gauge_pro,
weightLocation: row.weight_location,
```

E em `jobToSupabase`:

```typescript
weight_skills_technical: job.weightSkillsTechnical,
weight_skills_behavioral: job.weightSkillsBehavioral,
weight_experience: job.weightExperience,
weight_gauge_pro: job.weightGaugePro,
weight_location: job.weightLocation,
```

Se o conversor é automático (camelCase ↔ snake_case via lib), pular para Step 3.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabaseConverters.ts
git commit -m "feat(converters): handle job weight columns"
```

---

## Task 6: Calculator passa a ler pesos do `job`

**Files:**
- Modify: `src/lib/matchCalculator.ts`

- [ ] **Step 1: Importar `MatchWeights` e `DEFAULT_MATCH_WEIGHTS`**

No topo:

```typescript
import { DEFAULT_MATCH_WEIGHTS, type MatchWeights } from '@/types/matchWeights';
```

- [ ] **Step 2: Substituir `CATEGORY_WEIGHTS` constante por função `getJobWeights`**

Localizar a constante `CATEGORY_WEIGHTS` (linha ~20-25). Substituir por:

```typescript
/**
 * Lê os pesos de match da vaga, com fallback para defaults globais.
 */
function getJobWeights(job: Partial<Job>): MatchWeights {
  return {
    skillsTechnical: job.weightSkillsTechnical ?? DEFAULT_MATCH_WEIGHTS.skillsTechnical,
    skillsBehavioral: job.weightSkillsBehavioral ?? DEFAULT_MATCH_WEIGHTS.skillsBehavioral,
    experience: job.weightExperience ?? DEFAULT_MATCH_WEIGHTS.experience,
    gaugePro: job.weightGaugePro ?? DEFAULT_MATCH_WEIGHTS.gaugePro,
    location: job.weightLocation ?? DEFAULT_MATCH_WEIGHTS.location,
  };
}
```

- [ ] **Step 3: Atualizar montagem de categorias para usar 5 pesos**

Localizar onde as `categories` são montadas dentro de `calculateMatchBreakdown` (linha ~659). Substituir o array atual por:

```typescript
const weights = getJobWeights(job);

const categories: MatchCategory[] = [
  {
    id: 'skills_technical',
    name: 'Skills Técnicas',
    weight: weights.skillsTechnical,
    score: technicalScore,
    description: 'Habilidades técnicas declaradas pelo candidato vs requisitadas pela vaga.',
  },
  {
    id: 'skills_behavioral',
    name: 'Skills Comportamentais',
    weight: weights.skillsBehavioral,
    score: behavioralScore,
    description: 'Soft skills declaradas pelo candidato vs requisitadas pela vaga.',
  },
  {
    id: 'experience',
    name: 'Experiência',
    weight: weights.experience,
    score: experienceScore,
    description: DEFAULT_MATCH_CATEGORIES[1].description,
  },
  {
    id: 'gauge_pro',
    name: 'Perfil Comportamental',
    weight: weights.gaugePro,
    score: behavioralProfileScore, // já existe — antiga 'behavioral'
    description: DEFAULT_MATCH_CATEGORIES[2].description,
  },
  {
    id: 'location',
    name: 'Localização',
    weight: weights.location,
    score: locationScore,
    description: DEFAULT_MATCH_CATEGORIES[3].description,
  },
];
```

(Ajustar nome local da variável de score do perfil comportamental se necessário — antes era `behavioralScore`, agora colide com o de skills. Renomear o de DISC/Gauge-Pro para `behavioralProfileScore`.)

- [ ] **Step 4: Renomear `behavioralScore` (DISC) para `behavioralProfileScore`**

Localizar (linha ~648):

```typescript
const behavioralScore = candidateProfile && idealProfile ? ...
```

Renomear para:

```typescript
const behavioralProfileScore = candidateProfile && idealProfile ? ...
```

E atualizar todas as referências subsequentes na função.

- [ ] **Step 5: Atualizar a montagem do `skillsScore` combinado**

Como agora há 2 categorias separadas, **remover** a linha que computa `skillsScore` combinado (era da etapa A para compat). Cada categoria tem seu próprio score.

- [ ] **Step 6: Build**

```bash
npm run build
```

Expected: PASS. Eventuais erros em consumidores que esperavam 4 categorias serão tratados nas próximas tasks.

- [ ] **Step 7: Commit**

```bash
git add src/lib/matchCalculator.ts
git commit -m "feat(match): read weights from job and emit 5 categories"
```

---

## Task 7: Atualizar `MatchBreakdown.tsx` para 5 categorias

**Files:**
- Modify: `src/components/match/MatchBreakdown.tsx`

- [ ] **Step 1: Verificar `DEFAULT_MATCH_CATEGORIES`**

Run:
```bash
grep -n "DEFAULT_MATCH_CATEGORIES" src/components/match/MatchBreakdown.tsx
```

Expected: array de 4 categorias hardcoded.

- [ ] **Step 2: Atualizar para 5 categorias**

Substituir o array `DEFAULT_MATCH_CATEGORIES`:

```typescript
export const DEFAULT_MATCH_CATEGORIES = [
  { id: 'skills_technical', name: 'Skills Técnicas', weight: 25, description: 'Habilidades técnicas declaradas pelo candidato vs requisitadas pela vaga.' },
  { id: 'skills_behavioral', name: 'Skills Comportamentais', weight: 15, description: 'Soft skills declaradas pelo candidato vs requisitadas pela vaga.' },
  { id: 'experience', name: 'Experiência', weight: 30, description: 'Anos de experiência do candidato vs nível exigido pela vaga.' },
  { id: 'gauge_pro', name: 'Perfil Comportamental', weight: 20, description: 'Distância do perfil Gauge-Pro do candidato ao perfil ideal cadastrado.' },
  { id: 'location', name: 'Localização', weight: 10, description: 'Compatibilidade entre cidade do candidato e cidade da vaga (considera tipo presencial/híbrido/remoto).' },
] as const;
```

- [ ] **Step 3: Verificar consumidores**

Run:
```bash
grep -rn "DEFAULT_MATCH_CATEGORIES\[" src/
```

Expected: lista de places que indexam o array. Antes era `[0]=skills, [1]=experience, [2]=behavioral, [3]=location`. Agora `[0]=skills_technical, [1]=skills_behavioral, [2]=experience, [3]=gauge_pro, [4]=location`. Atualizar índices em todos os places.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: PASS após ajustes de índices.

- [ ] **Step 5: Commit**

```bash
git add src/components/match/MatchBreakdown.tsx
git commit -m "feat(match): expand DEFAULT_MATCH_CATEGORIES to 5 entries"
```

---

## Task 8: Criar componente `MatchWeightsSliders.tsx`

**Files:**
- Create: `src/components/empresa/job-form/MatchWeightsSliders.tsx`

- [ ] **Step 1: Verificar Slider shadcn já instalado**

Run:
```bash
ls src/components/ui/slider.tsx
```

Expected: arquivo existe (shadcn/ui Slider já está no projeto, package.json mostra `@radix-ui/react-slider`).

- [ ] **Step 2: Criar componente**

Conteúdo:

```typescript
import { useId } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MatchWeights } from '@/types/matchWeights';
import { cn } from '@/lib/utils';

const CATEGORY_META: Array<{
  key: keyof MatchWeights;
  label: string;
  color: string;
}> = [
  { key: 'skillsTechnical', label: 'Skills Técnicas', color: 'bg-amber-500' },
  { key: 'skillsBehavioral', label: 'Skills Comportamentais', color: 'bg-red-500' },
  { key: 'experience', label: 'Experiência', color: 'bg-cyan-500' },
  { key: 'gaugePro', label: 'Perfil Comportamental', color: 'bg-violet-400' },
  { key: 'location', label: 'Localização', color: 'bg-emerald-400' },
];

export interface MatchWeightsSlidersProps {
  weights: MatchWeights;
  onChange: (next: MatchWeights) => void;
  disabled?: boolean;
}

export function MatchWeightsSliders({ weights, onChange, disabled }: MatchWeightsSlidersProps) {
  const baseId = useId();

  function setWeight(key: keyof MatchWeights, value: number) {
    const clamped = Math.max(0, Math.min(70, Math.round(value)));
    onChange({ ...weights, [key]: clamped });
  }

  return (
    <div className="space-y-3">
      {CATEGORY_META.map(({ key, label, color }) => {
        const id = `${baseId}-${key}`;
        const value = weights[key];
        return (
          <div
            key={key}
            className="grid grid-cols-[180px_1fr_72px_20px] items-center gap-3"
          >
            <Label htmlFor={id} className="flex items-center gap-2 text-sm">
              <span className={cn('inline-block w-2 h-2 rounded-sm', color)} />
              {label}
            </Label>
            <Slider
              id={id}
              min={0}
              max={70}
              step={1}
              value={[value]}
              onValueChange={(v) => setWeight(key, v[0] ?? 0)}
              disabled={disabled}
              aria-label={`Peso de ${label}, 0 a 70 por cento`}
            />
            <Input
              type="number"
              min={0}
              max={70}
              value={value}
              onChange={(e) => setWeight(key, Number(e.target.value))}
              disabled={disabled}
              className="text-right h-8"
              aria-label={`Valor numérico de ${label}`}
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/components/empresa/job-form/MatchWeightsSliders.tsx
git commit -m "feat(form): add MatchWeightsSliders component"
```

---

## Task 9: Criar componente `MatchWeightsTemplateCards.tsx`

**Files:**
- Create: `src/components/empresa/job-form/MatchWeightsTemplateCards.tsx`

- [ ] **Step 1: Criar componente**

Conteúdo:

```typescript
import { MATCH_WEIGHT_TEMPLATES, matchTemplate, type MatchWeightTemplate } from '@/lib/matchWeightTemplates';
import type { MatchWeights } from '@/types/matchWeights';
import { cn } from '@/lib/utils';

export interface MatchWeightsTemplateCardsProps {
  currentWeights: MatchWeights;
  onApply: (template: MatchWeightTemplate) => void;
  disabled?: boolean;
}

export function MatchWeightsTemplateCards({ currentWeights, onApply, disabled }: MatchWeightsTemplateCardsProps) {
  const activeTemplate = matchTemplate(currentWeights);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {MATCH_WEIGHT_TEMPLATES.map((tpl) => {
        const isActive = activeTemplate?.id === tpl.id;
        return (
          <button
            key={tpl.id}
            type="button"
            disabled={disabled}
            onClick={() => onApply(tpl)}
            aria-pressed={isActive}
            className={cn(
              'flex-shrink-0 w-[136px] text-left p-3 rounded-md border bg-card transition-all',
              'hover:border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500',
              isActive ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-border',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            <div className="font-semibold text-sm mb-1">{tpl.name}</div>
            <div className="text-[10px] text-muted-foreground line-clamp-2 mb-2 min-h-[24px]">
              {tpl.examples}
            </div>
            <div className="flex h-1.5 rounded-sm overflow-hidden bg-muted">
              <span className="bg-amber-500" style={{ width: `${tpl.weights.skillsTechnical}%` }} />
              <span className="bg-red-500" style={{ width: `${tpl.weights.skillsBehavioral}%` }} />
              <span className="bg-cyan-500" style={{ width: `${tpl.weights.experience}%` }} />
              <span className="bg-violet-400" style={{ width: `${tpl.weights.gaugePro}%` }} />
              <span className="bg-emerald-400" style={{ width: `${tpl.weights.location}%` }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/components/empresa/job-form/MatchWeightsTemplateCards.tsx
git commit -m "feat(form): add MatchWeightsTemplateCards component"
```

---

## Task 10: Criar componente `MatchWeightsSumIndicator.tsx`

**Files:**
- Create: `src/components/empresa/job-form/MatchWeightsSumIndicator.tsx`

- [ ] **Step 1: Criar componente**

Conteúdo:

```typescript
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { sumWeights, DEFAULT_MATCH_WEIGHTS, type MatchWeights } from '@/types/matchWeights';
import { cn } from '@/lib/utils';

export interface MatchWeightsSumIndicatorProps {
  weights: MatchWeights;
  onDistributeRemaining: () => void;
  onNormalize: () => void;
  onResetDefaults: () => void;
  disabled?: boolean;
}

export function MatchWeightsSumIndicator({
  weights,
  onDistributeRemaining,
  onNormalize,
  onResetDefaults,
  disabled,
}: MatchWeightsSumIndicatorProps) {
  const sum = sumWeights(weights);
  const state = sum === 100 ? 'valid' : sum < 100 ? 'incomplete' : 'excess';

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-muted/40"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="w-32">
          <Progress
            value={Math.min(100, sum)}
            className={cn(
              state === 'valid' && '[&>div]:bg-cyan-500',
              state === 'incomplete' && '[&>div]:bg-amber-500',
              state === 'excess' && '[&>div]:bg-destructive',
            )}
          />
        </div>
        {state === 'valid' && (
          <span className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
            <CheckCircle2 className="w-3 h-3" /> Soma 100%
          </span>
        )}
        {state === 'incomplete' && (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded" role="alert">
            <AlertTriangle className="w-3 h-3" /> Faltam {100 - sum}% para distribuir
          </span>
        )}
        {state === 'excess' && (
          <span className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded" role="alert">
            <XCircle className="w-3 h-3" /> Excedeu em {sum - 100}%
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {state === 'incomplete' && (
          <Button type="button" variant="outline" size="sm" onClick={onDistributeRemaining} disabled={disabled}>
            Distribuir restante
          </Button>
        )}
        {state === 'excess' && (
          <Button type="button" variant="outline" size="sm" onClick={onNormalize} disabled={disabled}>
            Normalizar
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onResetDefaults} disabled={disabled}>
          ↺ Restaurar padrão
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/components/empresa/job-form/MatchWeightsSumIndicator.tsx
git commit -m "feat(form): add MatchWeightsSumIndicator with 3 visual states"
```

---

## Task 11: Criar componente `JobFormMatchWeights.tsx` (orquestrador da aba)

**Files:**
- Create: `src/components/empresa/job-form/JobFormMatchWeights.tsx`

- [ ] **Step 1: Criar componente**

Conteúdo:

```typescript
import { Info } from 'lucide-react';
import { MatchWeightsTemplateCards } from './MatchWeightsTemplateCards';
import { MatchWeightsSliders } from './MatchWeightsSliders';
import { MatchWeightsSumIndicator } from './MatchWeightsSumIndicator';
import { DEFAULT_MATCH_WEIGHTS, sumWeights, type MatchWeights } from '@/types/matchWeights';

export interface JobFormMatchWeightsProps {
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  disabled?: boolean;
}

export function JobFormMatchWeights({ weights, onChange, disabled }: JobFormMatchWeightsProps) {
  function distributeRemaining() {
    const remaining = 100 - sumWeights(weights);
    if (remaining <= 0) return;
    // Distribuir igualmente entre as 5 categorias
    const perCategory = Math.floor(remaining / 5);
    const extra = remaining - perCategory * 5;
    onChange({
      skillsTechnical: weights.skillsTechnical + perCategory + (extra > 0 ? 1 : 0),
      skillsBehavioral: weights.skillsBehavioral + perCategory + (extra > 1 ? 1 : 0),
      experience: weights.experience + perCategory + (extra > 2 ? 1 : 0),
      gaugePro: weights.gaugePro + perCategory + (extra > 3 ? 1 : 0),
      location: weights.location + perCategory + (extra > 4 ? 1 : 0),
    });
  }

  function normalize() {
    const sum = sumWeights(weights);
    if (sum === 100 || sum === 0) return;
    const factor = 100 / sum;
    const next = {
      skillsTechnical: Math.round(weights.skillsTechnical * factor),
      skillsBehavioral: Math.round(weights.skillsBehavioral * factor),
      experience: Math.round(weights.experience * factor),
      gaugePro: Math.round(weights.gaugePro * factor),
      location: Math.round(weights.location * factor),
    };
    // Corrigir arredondamento residual jogando na maior categoria
    const newSum = sumWeights(next);
    const diff = 100 - newSum;
    if (diff !== 0) {
      const largestKey = (Object.keys(next) as Array<keyof MatchWeights>).reduce(
        (acc, k) => (next[k] > next[acc] ? k : acc),
        'skillsTechnical' as keyof MatchWeights,
      );
      next[largestKey] = Math.max(0, Math.min(70, next[largestKey] + diff));
    }
    onChange(next);
  }

  function resetDefaults() {
    onChange({ ...DEFAULT_MATCH_WEIGHTS });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-start p-3 bg-cyan-500/5 border-l-2 border-cyan-500 rounded text-xs">
        <Info className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          Os pesos definem como o algoritmo ranqueia candidatos para esta vaga. Aplique um template ou
          ajuste manualmente. A soma deve fechar em 100%.
        </p>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Templates</div>
        <MatchWeightsTemplateCards currentWeights={weights} onApply={(tpl) => onChange({ ...tpl.weights })} disabled={disabled} />
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Pesos por categoria</div>
        <MatchWeightsSliders weights={weights} onChange={onChange} disabled={disabled} />
      </div>

      <MatchWeightsSumIndicator
        weights={weights}
        onDistributeRemaining={distributeRemaining}
        onNormalize={normalize}
        onResetDefaults={resetDefaults}
        disabled={disabled}
      />
    </div>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/components/empresa/job-form/JobFormMatchWeights.tsx
git commit -m "feat(form): add JobFormMatchWeights orchestrator"
```

---

## Task 12: Adicionar 7ª aba "Match" no `JobForm.tsx`

**Files:**
- Modify: `src/pages/empresa/JobForm.tsx`
- Modify: `src/hooks/useJobForm.ts`

- [ ] **Step 1: Atualizar `useJobForm.ts` para incluir weights**

Run:
```bash
grep -n "formData\|updateFormData" src/hooks/useJobForm.ts | head -20
```

Localizar a inicialização do `formData` e adicionar:

```typescript
weightSkillsTechnical: 25,
weightSkillsBehavioral: 15,
weightExperience: 30,
weightGaugePro: 20,
weightLocation: 10,
```

(Quando edita vaga existente, popular dos campos do `job` carregado.)

Adicionar handlers expostos:

```typescript
return {
  // ... outros campos
  weights: {
    skillsTechnical: formData.weightSkillsTechnical,
    skillsBehavioral: formData.weightSkillsBehavioral,
    experience: formData.weightExperience,
    gaugePro: formData.weightGaugePro,
    location: formData.weightLocation,
  },
  setWeights: (w: MatchWeights) => {
    updateFormData({
      weightSkillsTechnical: w.skillsTechnical,
      weightSkillsBehavioral: w.skillsBehavioral,
      weightExperience: w.experience,
      weightGaugePro: w.gaugePro,
      weightLocation: w.location,
    });
  },
};
```

Importar `MatchWeights`.

- [ ] **Step 2: Adicionar gate de validação no submit**

Em `handleSaveJob`, antes de salvar, adicionar:

```typescript
import { sumWeights, validateWeights } from '@/types/matchWeights';

// dentro de handleSaveJob:
const weightsValidation = validateWeights({
  skillsTechnical: formData.weightSkillsTechnical,
  skillsBehavioral: formData.weightSkillsBehavioral,
  experience: formData.weightExperience,
  gaugePro: formData.weightGaugePro,
  location: formData.weightLocation,
});
if (!weightsValidation.valid) {
  toast.error(`Pesos inválidos: ${weightsValidation.error}`);
  return;
}
```

- [ ] **Step 3: Adicionar a aba no `JobForm.tsx`**

Localizar o bloco de `TabsList` (linha ~155) e adicionar após o `TabsTrigger value="skills"`:

```tsx
<TabsTrigger value="match" className="gap-2">
  <Settings className="h-4 w-4" />
  Match
</TabsTrigger>
```

Importar `Settings` de `lucide-react`.

Adicionar o `TabsContent` correspondente após o de `skills`:

```tsx
<TabsContent value="match" className="mt-6">
  <JobFormMatchWeights
    weights={weights}
    onChange={setWeights}
  />
</TabsContent>
```

Importar `JobFormMatchWeights` e usar `weights` + `setWeights` do hook.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Verificar manualmente**

Login como empresa, abrir `/empresa/vagas/nova`. Ir até a 7ª aba "Match". Aplicar template "Operacional" → sliders preenchem 10/30/15/25/20. Editar slider Localização para 25 → footer mostra "Excedeu em 5%". Clicar "Normalizar" → valores ajustam, footer volta a 100%.

- [ ] **Step 6: Commit**

```bash
git add src/pages/empresa/JobForm.tsx src/hooks/useJobForm.ts
git commit -m "feat(form): add Match tab with weights to JobForm"
```

---

## Task 13: Atualizar service de jobs para persistir weights

**Files:**
- Modify: `src/services/jobs/jobsService.supabase.ts`

- [ ] **Step 1: Identificar funções de create/update**

Run:
```bash
grep -n "createJob\|updateJob\|insert\|update" src/services/jobs/jobsService.supabase.ts | head -20
```

- [ ] **Step 2: Garantir que os 5 campos são incluídos no INSERT/UPDATE**

Se o service usa `jobToSupabase` (do Task 5), os campos já são serializados. Caso contrário, ao construir o objeto antes de `.insert()` ou `.update()`, incluir:

```typescript
weight_skills_technical: job.weightSkillsTechnical ?? 25,
weight_skills_behavioral: job.weightSkillsBehavioral ?? 15,
weight_experience: job.weightExperience ?? 30,
weight_gauge_pro: job.weightGaugePro ?? 20,
weight_location: job.weightLocation ?? 10,
```

- [ ] **Step 3: Build + verificar manualmente**

```bash
npm run build
```

Criar nova vaga em `/empresa/vagas/nova`, aplicar template "Industrial", salvar. Validar via Supabase MCP:

```sql
SELECT title, weight_skills_technical, weight_skills_behavioral, weight_experience, weight_gauge_pro, weight_location
FROM jobs
ORDER BY created_at DESC
LIMIT 1;
```

Expected: linha com 25/15/30/15/15.

- [ ] **Step 4: Commit**

```bash
git add src/services/jobs/jobsService.supabase.ts
git commit -m "feat(jobs): persist match weights on create/update"
```

---

## Task 14: Atualizar invalidação de cache

**Files:**
- Modify: `src/hooks/useJobsQuery.ts` (se houver mutations)

- [ ] **Step 1: Verificar invalidações existentes**

Run:
```bash
grep -n "invalidateQueries\|useUpdateJob\|useCreateJob" src/hooks/useJobsQuery.ts
```

- [ ] **Step 2: Confirmar que invalidação cobre o cache de match**

Se houver `applicationKeys` ou similar que cacheia match scores, garantir que `onSuccess` da mutation `updateJob` invalida:

```typescript
queryClient.invalidateQueries({ queryKey: ['jobs'] });
queryClient.invalidateQueries({ queryKey: ['applications'] }); // se match é cacheado por applicaiton
```

(Sem invalidar, scores ficam stale após edição de pesos.)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useJobsQuery.ts
git commit -m "fix(jobs): invalidate match-related caches on weight update"
```

---

## Task 15: Atualizar changelog

**Files:**
- Modify: `public/changelog.json`
- Modify: `src/constants/app.ts`
- Modify: `package.json`

- [ ] **Step 1: Adicionar versão MINOR**

No topo do array de versões em `public/changelog.json`:

```json
{
  "version": "1.56.0",
  "codename": "Tailor",
  "date": "2026-04-30",
  "isCurrent": true,
  "items": [
    {
      "type": "added",
      "title": "Pesos de match parametrizáveis por vaga",
      "description": "Empresa agora define pesos específicos para cada vaga em 5 categorias (Skills Técnicas, Skills Comportamentais, Experiência, Perfil Comportamental, Localização). 6 templates pré-definidos (Operacional, Industrial, Administrativo, Técnico, Liderança, Comercial) aceleram a configuração.",
      "details": {
        "0": {
          "description": "Migration adiciona 5 colunas weight_* em jobs com CHECK constraints (soma=100, range 0-70). Calculator passa a ler pesos da vaga em vez de constante global. Aba Match no JobForm com sliders Radix + cards de templates + indicador de soma com 3 estados (válido/faltam/excedeu).",
          "files": [
            "sql/migrations/092_job_weights.sql",
            "src/types/matchWeights.ts",
            "src/lib/matchWeightTemplates.ts",
            "src/lib/matchCalculator.ts",
            "src/components/empresa/job-form/JobFormMatchWeights.tsx",
            "src/components/empresa/job-form/MatchWeightsSliders.tsx",
            "src/components/empresa/job-form/MatchWeightsTemplateCards.tsx",
            "src/components/empresa/job-form/MatchWeightsSumIndicator.tsx",
            "src/pages/empresa/JobForm.tsx",
            "src/hooks/useJobForm.ts",
            "src/services/jobs/jobsService.supabase.ts"
          ],
          "routes": [
            "/empresa/vagas/nova",
            "/empresa/vagas/:id/editar"
          ]
        }
      }
    },
    {
      "type": "changed",
      "title": "Tela de match exibe 5 categorias separadas",
      "description": "Skills Técnicas e Skills Comportamentais agora aparecem como categorias distintas no breakdown do match, refletindo a distinção do banco de skills padronizadas.",
      "details": {
        "0": {
          "description": "DEFAULT_MATCH_CATEGORIES expandiu de 4 para 5 entradas. MatchBreakdown renderiza 5 barras de progresso ordenadas por categoria.",
          "files": [
            "src/components/match/MatchBreakdown.tsx",
            "src/lib/matchCalculator.ts"
          ],
          "routes": [
            "/candidato/vagas/:id",
            "/empresa/candidatos",
            "/empresa/candidatos/:id"
          ]
        }
      }
    }
  ]
},
```

E remover `"isCurrent": true` de v1.55.0.

- [ ] **Step 2: Atualizar `src/constants/app.ts` para `1.56.0` "Tailor"**

- [ ] **Step 3: Atualizar `package.json` `version: "1.56.0"`**

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add public/changelog.json src/constants/app.ts package.json
git commit -m "chore: bump version to 1.56.0 Tailor"
```

---

## Task 16: Verificação manual end-to-end

- [ ] **Step 1: Criar nova vaga "Operador Teste" com template Industrial**

- Login como empresa
- Abrir `/empresa/vagas/nova`
- Preencher abas Básicas, Salário, Descrição (mínimo)
- Ir para aba "⚙ Match"
- Clicar template "Industrial"
- Verificar: sliders mostram 25/15/30/15/15
- Footer mostra "Soma 100%" em cyan
- Salvar vaga

- [ ] **Step 2: Verificar persistência via SQL**

```sql
SELECT title, weight_skills_technical, weight_skills_behavioral, weight_experience, weight_gauge_pro, weight_location
FROM jobs WHERE title = 'Operador Teste';
```

Expected: linha com 25/15/30/15/15.

- [ ] **Step 3: Editar vaga e mexer slider individualmente**

- Abrir vaga criada
- Aba Match, slider Localização: arrastar para 25
- Footer deve mostrar "Excedeu em 10%" (vermelho)
- Botão Salvar deve estar desabilitado (se gate de validação foi adicionado no Step 2 do Task 12)
- Clicar "Normalizar" → valores recalculam, footer volta a 100%
- Salvar

- [ ] **Step 4: Logar como candidato e ver match com vaga personalizada**

- Login Sul Santana
- Abrir `/candidato/vagas/<operador-teste-id>`
- Verificar: 5 categorias aparecem no breakdown
- Pesos exibidos refletem 25/15/30/15/15 (não os defaults globais)

- [ ] **Step 5: Smoke test: vaga sem mexer nos pesos**

- Como empresa, criar nova vaga sem abrir aba Match
- Verificar SQL: pesos = 25/15/30/20/10 (defaults da migration)
- Como candidato, ver match: pesos refletem defaults

---

## Critérios de aceite (do spec)

- [x] Migration aplicada, 19 vagas com defaults 25/15/30/20/10
- [x] CHECK constraints validam soma=100 e range 0-70
- [x] Aba "Match" renderiza no `JobForm` com 6 templates
- [x] Sliders Radix + inputs numéricos funcionam (teclado, mouse)
- [x] Footer sticky mostra 3 estados de validação
- [x] Calculator lê pesos do `job` em vez de constante
- [x] Salvar bloqueado com toast quando soma ≠ 100
- [x] Card "ativo" aparece quando weights batem com algum template

## Notas importantes

- **Card "Personalizado"** (mencionado no design) entra na etapa C ou pode ser feito agora — está implícito quando nenhum template casa via `matchTemplate(weights)` retornando `null`. Se quiser exibir explicitamente, basta adicionar um card extra no `MatchWeightsTemplateCards` quando `activeTemplate === null`.
- **Edição com candidaturas existentes**: este plano permite edição livre. A dupla confirmação + notificação aos candidatos vem na **etapa C**.
- **Histórico de alterações**: também vem na etapa C (tabela `jobs_weight_history`).
- **Pesos = 0** ainda não escondem categorias no breakdown — isso vem na etapa C.
