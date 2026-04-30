# Plano A — Fix do Calculator (std_skills + separação técnica/comportamental)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o `calculateMatchBreakdown` para usar IDs de skills padronizadas separadas em técnica/comportamental, atualizar os 11 call-sites, e eliminar o algoritmo legado tokenizado.

**Architecture:** Adicionar parâmetros opcionais `MatchSkillsInput` e `MatchWeights` em `calculateMatchBreakdown`. Internamente, calcular skills em duas chamadas separadas a `calculateStandardizedSkillsScore` (técnica e comportamental) e compor o resultado. Cada call-site usa o novo hook `useMatchSkillIds(candidateId, jobId)` que combina `useCandidateStandardizedSkills` + `useJobStandardizedSkills` e separa por `skill.type`. Pesos globais 40/30/20/10 são preservados (a divisão em 5 categorias acontece na etapa B).

**Tech Stack:** React 18, TypeScript, React Query, Supabase. Validação por type-check (TS) + build (Vite) + lint (ESLint) + script de auditoria empírica (`scripts/match-audit.ts`).

**Dependências:** Nenhuma — este plano é auto-contido. Pode ser executado e mergeado em main independente dos planos B e C.

**Spec:** [docs/superpowers/specs/2026-04-29-match-skills-pesos-design.md](../specs/2026-04-29-match-skills-pesos-design.md)

---

## File Structure

**Criados:**
- `src/hooks/useMatchSkillIds.ts` — combinador dos hooks std_skills, separa por type
- `scripts/match-audit-after-fix.ts` — script de validação pós-fix (compara antes/depois)

**Modificados:**
- `src/lib/matchCalculator.ts` — nova assinatura, novos params, marca legacy `@deprecated`
- `src/pages/candidato/JobDetails.tsx` — usa novo hook, passa params
- `src/pages/candidato/JobSearch.tsx` — usa novo hook (loop por job)
- `src/pages/empresa/Candidates.tsx` — usa novo hook
- `src/pages/empresa/CandidateProfile.tsx` — usa novo hook (Map)
- `src/pages/empresa/Applications.tsx` — usa novo hook
- `src/pages/empresa/SavedCandidates.tsx` — usa novo hook
- `src/pages/admin/Dashboard.tsx` — usa novo hook (statistics)
- `src/lib/jobRecommendation.ts` — recebe std_skills como parâmetro
- `src/lib/candidateRecommendation.ts` — recebe std_skills como parâmetro

**Não criados:** vitest/jest. O projeto não tem framework de teste — validação é por type-check + build + lint + auditoria empírica.

---

## Task 1: Adicionar tipos `MatchSkillsInput` e estender `MatchCategory`

**Files:**
- Modify: `src/types/disc.ts` (onde `MatchCategory` está definido — confirmar com grep)

- [ ] **Step 1: Localizar `MatchCategory` e `MatchResult`**

Run:
```bash
grep -rn "interface MatchCategory\|interface MatchResult" src/
```

Expected: aponta para `src/types/disc.ts`. Se for outro path, ajustar todas as referências abaixo.

- [ ] **Step 2: Adicionar campo opcional `dataMissing` e `effectiveWeight` em `MatchCategory`**

Em `src/types/disc.ts`, localizar `interface MatchCategory` e adicionar:

```typescript
export interface MatchCategory {
  id: string;
  name: string;
  weight: number;
  /** Peso após redistribuição quando outra categoria foi removida (Q4 caso 2). Quando ausente = weight. */
  effectiveWeight?: number;
  score: number;
  description: string;
  /** Sinaliza ausência de dado para tratamento na UI:
   * - 'job-side': vaga não cadastrou (peso é redistribuído entre as outras categorias)
   * - 'candidate-side': candidato não tem dado (score = 0, card mostra flag)
   */
  dataMissing?: 'job-side' | 'candidate-side' | null;
}
```

- [ ] **Step 3: Adicionar tipo `MatchSkillsInput` no mesmo arquivo**

```typescript
/**
 * Entrada de skills padronizadas para o cálculo de match.
 * Quando passado, substitui completamente o caminho legado tokenizado.
 */
export interface MatchSkillsInput {
  /** IDs de skills técnicas do candidato, ordenados por priority (1 = mais prioritária) */
  candidateTechnical: string[];
  /** IDs de skills comportamentais do candidato, ordenados por priority */
  candidateBehavioral: string[];
  /** IDs de skills técnicas requeridas pela vaga, ordenados por priority */
  jobTechnical: string[];
  /** IDs de skills comportamentais requeridas pela vaga, ordenados por priority */
  jobBehavioral: string[];
}
```

- [ ] **Step 4: Verificar com type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS sem novos erros. Se houver erros em consumidores de `MatchCategory`, são pré-existentes — não tratar aqui.

- [ ] **Step 5: Commit**

```bash
git add src/types/disc.ts
git commit -m "feat(match): add MatchSkillsInput and dataMissing field to MatchCategory"
```

---

## Task 2: Estender assinatura de `calculateMatchBreakdown` com params opcionais

**Files:**
- Modify: `src/lib/matchCalculator.ts` (linha ~618)

- [ ] **Step 1: Importar o novo tipo**

No topo de `src/lib/matchCalculator.ts`, atualizar import:

```typescript
import type {
  BehavioralProfile,
  MatchResult,
  MatchCategory,
  MatchStrength,
  MatchOpportunity,
  MatchSkillsInput,
} from '@/types/disc';
```

- [ ] **Step 2: Adicionar parâmetro opcional `skillsInput`**

Localizar a função `calculateMatchBreakdown` (linha ~618) e atualizar a assinatura:

```typescript
export function calculateMatchBreakdown(
  candidate: Partial<Candidate>,
  job: Partial<Job>,
  idealProfile?: BehavioralProfile,
  candidateBehavioralProfile?: BehavioralProfile,
  skillsInput?: MatchSkillsInput,
): MatchResult {
```

(Os params antigos `candidateStdSkillIds` e `jobStdSkillIds` nas linhas 624-625 vão ser substituídos pelo novo `skillsInput` no Task 3. Por agora, deixe os antigos no lugar para não quebrar nada.)

- [ ] **Step 3: Verificar com type-check**

Run:
```bash
npx tsc --noEmit
```

Expected: PASS. A função aceita params extras opcionais, callers existentes continuam compilando.

- [ ] **Step 4: Commit**

```bash
git add src/lib/matchCalculator.ts
git commit -m "feat(match): add skillsInput param to calculateMatchBreakdown signature"
```

---

## Task 3: Implementar cálculo de skills com separação técnica/comportamental

**Files:**
- Modify: `src/lib/matchCalculator.ts`

- [ ] **Step 1: Adicionar helper `computeSkillsScore` no topo do arquivo**

Adicionar logo após o bloco de constantes (próximo da linha 80):

```typescript
/**
 * Computa scores de skills técnicas e comportamentais separadamente.
 * Substitui o caminho legado tokenizado quando `skillsInput` é fornecido.
 *
 * @returns objeto com { technicalScore, behavioralScore }
 */
function computeSkillsScore(
  skillsInput: MatchSkillsInput | undefined,
  fallbackCandidateSkills: string[],
  fallbackJobRequirements: string[],
): { technicalScore: number; behavioralScore: number } {
  if (skillsInput) {
    const technicalScore = calculateStandardizedSkillsScore(
      skillsInput.candidateTechnical,
      skillsInput.jobTechnical,
    );
    const behavioralScore = calculateStandardizedSkillsScore(
      skillsInput.candidateBehavioral,
      skillsInput.jobBehavioral,
    );
    return { technicalScore, behavioralScore };
  }

  // Fallback legado: usa string-based, distribui igualmente entre técnica e comportamental
  const legacyScore = calculateSkillsScore(fallbackCandidateSkills, fallbackJobRequirements);
  return { technicalScore: legacyScore, behavioralScore: legacyScore };
}
```

- [ ] **Step 2: Substituir o bloco de cálculo de skills em `calculateMatchBreakdown`**

Localizar (linha ~639-641):

```typescript
const skillsScore = (candidateStdSkillIds?.length && jobStdSkillIds?.length)
  ? calculateStandardizedSkillsScore(candidateStdSkillIds, jobStdSkillIds)
  : calculateSkillsScore(candidate.skills || [], job.requirements || []);
```

Substituir por:

```typescript
const { technicalScore, behavioralScore } = computeSkillsScore(
  skillsInput,
  candidate.skills || [],
  job.requirements || [],
);

// Score combinado para compatibilidade com a categoria única "Skills Técnicas" atual.
// Etapa B do roadmap divide isso em duas categorias separadas com pesos próprios.
const skillsScore = Math.round((technicalScore + behavioralScore) / 2);
```

- [ ] **Step 3: Remover params legados não usados**

Remover os params `candidateStdSkillIds?: string[]` e `jobStdSkillIds?: string[]` da assinatura de `calculateMatchBreakdown` (eles eram código morto pelo audit).

- [ ] **Step 4: Verificar build**

Run:
```bash
npm run build
```

Expected: build conclui sem erro. Se algum call-site passava os params antigos, ajustar agora (todos os 11 não passavam — comprovado no audit).

- [ ] **Step 5: Commit**

```bash
git add src/lib/matchCalculator.ts
git commit -m "feat(match): compute technical and behavioral skills separately"
```

---

## Task 4: Marcar `calculateSkillsScore` legado como `@deprecated`

**Files:**
- Modify: `src/lib/matchCalculator.ts` (linha ~110)

- [ ] **Step 1: Atualizar JSDoc da função**

Localizar a função `calculateSkillsScore` (linha 110) e substituir o JSDoc:

```typescript
/**
 * @deprecated Algoritmo legado tokenizado com viés tech (SKILL_ALIASES).
 * Causa falsos negativos em vagas não-tech (auditoria empírica abril/2026:
 * 0/20 candidatos com skills passaram de 20%, 4/20 ficaram abaixo).
 * Use `computeSkillsScore` com `MatchSkillsInput` baseado em std_skills.
 *
 * Mantido apenas como fallback quando std_skills não estão disponíveis em ambos os lados.
 *
 * Calcula o score de skills comparando as habilidades do candidato
 * com os requisitos da vaga (path texto livre).
 */
export function calculateSkillsScore(
```

- [ ] **Step 2: Verificar lint**

Run:
```bash
npm run lint
```

Expected: PASS sem novos warnings.

- [ ] **Step 3: Commit**

```bash
git add src/lib/matchCalculator.ts
git commit -m "docs(match): deprecate legacy calculateSkillsScore"
```

---

## Task 5: Criar hook `useMatchSkillIds`

**Files:**
- Create: `src/hooks/useMatchSkillIds.ts`

- [ ] **Step 1: Criar arquivo do hook**

Conteúdo completo:

```typescript
/**
 * useMatchSkillIds — combina os hooks de skills padronizadas do candidato e da vaga,
 * separando por tipo (technical/behavioral) e ordenando por priority.
 *
 * Retorna o input pronto para `calculateMatchBreakdown`.
 */
import { useMemo } from 'react';
import {
  useCandidateStandardizedSkills,
  useJobStandardizedSkills,
} from '@/hooks/useStandardizedSkillsQuery';
import type { MatchSkillsInput } from '@/types/disc';

export interface UseMatchSkillIdsResult {
  skillsInput: MatchSkillsInput | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function useMatchSkillIds(
  candidateId: string | undefined,
  jobId: string | undefined,
): UseMatchSkillIdsResult {
  const candidateQuery = useCandidateStandardizedSkills(candidateId ?? '');
  const jobQuery = useJobStandardizedSkills(jobId ?? '');

  const skillsInput = useMemo<MatchSkillsInput | undefined>(() => {
    if (!candidateQuery.data || !jobQuery.data) return undefined;

    const candTech = candidateQuery.data
      .filter((s) => s.skill?.type === 'technical')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);

    const candBeh = candidateQuery.data
      .filter((s) => s.skill?.type === 'behavioral')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);

    const jobTech = jobQuery.data
      .filter((s) => s.skill?.type === 'technical')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);

    const jobBeh = jobQuery.data
      .filter((s) => s.skill?.type === 'behavioral')
      .sort((a, b) => a.priority - b.priority)
      .map((s) => s.skillId);

    return {
      candidateTechnical: candTech,
      candidateBehavioral: candBeh,
      jobTechnical: jobTech,
      jobBehavioral: jobBeh,
    };
  }, [candidateQuery.data, jobQuery.data]);

  return {
    skillsInput,
    isLoading: candidateQuery.isLoading || jobQuery.isLoading,
    isError: candidateQuery.isError || jobQuery.isError,
  };
}
```

- [ ] **Step 2: Verificar build**

Run:
```bash
npm run build
```

Expected: PASS sem erro.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMatchSkillIds.ts
git commit -m "feat(hooks): add useMatchSkillIds combiner for match calculation"
```

---

## Task 6: Atualizar `JobDetails.tsx` (candidato vendo uma vaga)

**Files:**
- Modify: `src/pages/candidato/JobDetails.tsx` (linha 18, 60-63)

- [ ] **Step 1: Importar o novo hook e o auth**

Localizar imports no topo de `src/pages/candidato/JobDetails.tsx`. Adicionar:

```typescript
import { useMatchSkillIds } from '@/hooks/useMatchSkillIds';
```

Verificar se `useAuth` já está importado (linha 15).

- [ ] **Step 2: Chamar o hook e passar resultado para o calculator**

Localizar o bloco que chama `calculateMatchBreakdown` (linha 60-63):

```typescript
const idealProfile = job ? getOrGenerateIdealProfile(job) : undefined;
const matchResult = job && currentCandidate
  ? calculateMatchBreakdown(currentCandidate, job, idealProfile)
  : undefined;
```

Substituir por:

```typescript
const idealProfile = job ? getOrGenerateIdealProfile(job) : undefined;
const { skillsInput } = useMatchSkillIds(currentCandidate?.id, job?.id);
const matchResult = job && currentCandidate
  ? calculateMatchBreakdown(currentCandidate, job, idealProfile, undefined, skillsInput)
  : undefined;
```

- [ ] **Step 3: Verificar build**

Run:
```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Verificar manualmente em browser**

Run:
```bash
# Dev server já está rodando na porta 3000 segundo SessionStart
# Login como candidato Sul Santana
# Navegar para /candidato/vagas/<id-analista-financeiro>
```

Expected: na tela de match, "Skills Técnicas" deve mostrar score significativamente maior que 6% (esperado ~44% com std_skills cadastradas).

- [ ] **Step 5: Commit**

```bash
git add src/pages/candidato/JobDetails.tsx
git commit -m "feat(match): wire useMatchSkillIds into JobDetails"
```

---

## Task 7: Atualizar `JobSearch.tsx` (candidato pesquisando vagas)

**Files:**
- Modify: `src/pages/candidato/JobSearch.tsx` (linhas ~200-205)

- [ ] **Step 1: Identificar como o cálculo é feito (loop por job)**

Run:
```bash
grep -B 3 -A 8 "calculateMatchBreakdown" src/pages/candidato/JobSearch.tsx
```

Expected: encontrar um loop ou map sobre `jobs` chamando `calculateMatchBreakdown` para cada um.

- [ ] **Step 2: Avaliar abordagem para cálculo em massa**

Como `useMatchSkillIds` é um hook, não pode ser chamado dentro de loop. Para `JobSearch` (lista de vagas), há duas opções:

**Opção A (recomendada):** carregar std_skills do candidato uma vez (hook fora do loop) e std_skills de cada vaga via `Promise.all` em um `useQuery` separado, depois compor `skillsInput` por job em um `useMemo`.

**Opção B:** usar `useQueries` do React Query para carregar todas as `useJobStandardizedSkills` em paralelo.

Por simplicidade e respeitando o padrão existente, este plano usa **Opção B**.

- [ ] **Step 3: Implementar carregamento em massa**

Adicionar imports:

```typescript
import { useQueries } from '@tanstack/react-query';
import { getStandardizedSkillsService } from '@/services/standardizedSkills/standardizedSkillsService';
import { standardizedSkillKeys } from '@/hooks/useStandardizedSkillsQuery';
import { useCandidateStandardizedSkills } from '@/hooks/useStandardizedSkillsQuery';
import type { MatchSkillsInput } from '@/types/disc';
```

Localizar onde `jobs` está disponível (após o fetch). Adicionar:

```typescript
const candidateSkillsQuery = useCandidateStandardizedSkills(currentCandidate?.id ?? '');

const jobSkillsQueries = useQueries({
  queries: (jobs ?? []).map((job) => ({
    queryKey: standardizedSkillKeys.jobSkills(job.id),
    queryFn: async () => {
      const service = await getStandardizedSkillsService();
      return service.getJobSkills(job.id);
    },
    enabled: !!job.id,
  })),
});

const skillsInputByJobId = useMemo<Record<string, MatchSkillsInput | undefined>>(() => {
  const candidateData = candidateSkillsQuery.data;
  if (!candidateData) return {};

  const candTech = candidateData
    .filter((s) => s.skill?.type === 'technical')
    .sort((a, b) => a.priority - b.priority)
    .map((s) => s.skillId);
  const candBeh = candidateData
    .filter((s) => s.skill?.type === 'behavioral')
    .sort((a, b) => a.priority - b.priority)
    .map((s) => s.skillId);

  const result: Record<string, MatchSkillsInput | undefined> = {};
  (jobs ?? []).forEach((job, idx) => {
    const jobSkills = jobSkillsQueries[idx]?.data;
    if (!jobSkills) {
      result[job.id] = undefined;
      return;
    }
    result[job.id] = {
      candidateTechnical: candTech,
      candidateBehavioral: candBeh,
      jobTechnical: jobSkills
        .filter((s) => s.skill?.type === 'technical')
        .sort((a, b) => a.priority - b.priority)
        .map((s) => s.skillId),
      jobBehavioral: jobSkills
        .filter((s) => s.skill?.type === 'behavioral')
        .sort((a, b) => a.priority - b.priority)
        .map((s) => s.skillId),
    };
  });
  return result;
}, [jobs, candidateSkillsQuery.data, jobSkillsQueries]);
```

- [ ] **Step 4: Atualizar a chamada do calculator no loop**

Localizar (linha ~200-205):

```typescript
const idealProfile = getOrGenerateIdealProfile(job);
const result = calculateMatchBreakdown(currentCandidate, job, idealProfile);
scores[job.id] = result.totalScore;
```

Substituir por:

```typescript
const idealProfile = getOrGenerateIdealProfile(job);
const result = calculateMatchBreakdown(
  currentCandidate,
  job,
  idealProfile,
  undefined,
  skillsInputByJobId[job.id],
);
scores[job.id] = result.totalScore;
```

- [ ] **Step 5: Verificar build**

Run:
```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/candidato/JobSearch.tsx
git commit -m "feat(match): wire useMatchSkillIds into JobSearch via useQueries"
```

---

## Task 8: Atualizar telas da empresa que veem candidatos

**Files:**
- Modify: `src/pages/empresa/Candidates.tsx`
- Modify: `src/pages/empresa/CandidateProfile.tsx`
- Modify: `src/pages/empresa/Applications.tsx`
- Modify: `src/pages/empresa/SavedCandidates.tsx`

Estas 4 telas seguem o mesmo padrão: a empresa vê candidatos. O cálculo de match é por par (candidato, vaga). Cada arquivo é tratado em sequência abaixo.

### 8.1: `src/pages/empresa/Candidates.tsx`

- [ ] **Step 1: Identificar a chamada**

Run:
```bash
grep -B 3 -A 5 "calculateMatchBreakdown" src/pages/empresa/Candidates.tsx
```

Expected: dois call-sites (linhas 172 e 197) — um dentro de uma função helper e um em outro contexto.

- [ ] **Step 2: Refatorar para usar `useMatchSkillIds`**

Como ambas as chamadas dependem de pares (candidate, job) que vêm de iterações, mesma abordagem do `JobSearch`: carregar dados via `useQueries` por candidato + por job.

Adicionar imports:

```typescript
import { useQueries } from '@tanstack/react-query';
import { getStandardizedSkillsService } from '@/services/standardizedSkills/standardizedSkillsService';
import { standardizedSkillKeys } from '@/hooks/useStandardizedSkillsQuery';
import type { MatchSkillsInput } from '@/types/disc';
```

Identificar quais candidatos e quais jobs são iterados. Construir um `Map<candidateId, std_skills>` e `Map<jobId, std_skills>` via `useQueries`. Depois, no helper que chama `calculateMatchBreakdown`, montar `skillsInput` a partir dos maps.

```typescript
// Após carregar `candidates` e `jobs`:
const candidateSkillsQueries = useQueries({
  queries: (candidates ?? []).map((c) => ({
    queryKey: standardizedSkillKeys.candidateSkills(c.id),
    queryFn: async () => {
      const service = await getStandardizedSkillsService();
      return service.getCandidateSkills(c.id);
    },
    enabled: !!c.id,
  })),
});

const jobSkillsQueries = useQueries({
  queries: (jobs ?? []).map((j) => ({
    queryKey: standardizedSkillKeys.jobSkills(j.id),
    queryFn: async () => {
      const service = await getStandardizedSkillsService();
      return service.getJobSkills(j.id);
    },
    enabled: !!j.id,
  })),
});

const candidateSkillsMap = useMemo(() => {
  const m = new Map<string, { tech: string[]; beh: string[] }>();
  (candidates ?? []).forEach((c, i) => {
    const data = candidateSkillsQueries[i]?.data;
    if (data) {
      m.set(c.id, {
        tech: data.filter((s) => s.skill?.type === 'technical').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
        beh: data.filter((s) => s.skill?.type === 'behavioral').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
      });
    }
  });
  return m;
}, [candidates, candidateSkillsQueries]);

const jobSkillsMap = useMemo(() => {
  const m = new Map<string, { tech: string[]; beh: string[] }>();
  (jobs ?? []).forEach((j, i) => {
    const data = jobSkillsQueries[i]?.data;
    if (data) {
      m.set(j.id, {
        tech: data.filter((s) => s.skill?.type === 'technical').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
        beh: data.filter((s) => s.skill?.type === 'behavioral').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
      });
    }
  });
  return m;
}, [jobs, jobSkillsQueries]);

function buildSkillsInput(candidateId: string, jobId: string): MatchSkillsInput | undefined {
  const c = candidateSkillsMap.get(candidateId);
  const j = jobSkillsMap.get(jobId);
  if (!c || !j) return undefined;
  return {
    candidateTechnical: c.tech,
    candidateBehavioral: c.beh,
    jobTechnical: j.tech,
    jobBehavioral: j.beh,
  };
}
```

- [ ] **Step 3: Atualizar as duas chamadas para usar `buildSkillsInput`**

Linha 172:
```typescript
const result = calculateMatchBreakdown(candidate, job, idealProfile, candidateProfile, buildSkillsInput(candidate.id, job.id));
```

Linha 197:
```typescript
return calculateMatchBreakdown(candidate, job, idealProfile, candidateProfile, buildSkillsInput(candidate.id, job.id)).totalScore;
```

- [ ] **Step 4: Verificar build**

Run:
```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/empresa/Candidates.tsx
git commit -m "feat(match): wire skills input into empresa Candidates page"
```

### 8.2: `src/pages/empresa/CandidateProfile.tsx`

- [ ] **Step 1: Aplicar o mesmo padrão da 8.1**

Identificar a chamada (linha ~272), em geral dentro de um `forEach` que constrói um `Map<jobId, MatchResult>`.

Add `useQueries` para todos os `jobs` e o `useCandidateStandardizedSkills` para o `candidate` único da página.

- [ ] **Step 2: Construir helper local `buildSkillsInput(jobId)` e passar nas chamadas**

```typescript
const candidateSkillsQuery = useCandidateStandardizedSkills(candidate.id);
const jobSkillsQueries = useQueries({
  queries: (jobs ?? []).map((j) => ({
    queryKey: standardizedSkillKeys.jobSkills(j.id),
    queryFn: async () => {
      const service = await getStandardizedSkillsService();
      return service.getJobSkills(j.id);
    },
    enabled: !!j.id,
  })),
});

const candTech = useMemo(() => {
  return (candidateSkillsQuery.data ?? [])
    .filter((s) => s.skill?.type === 'technical')
    .sort((a, b) => a.priority - b.priority)
    .map((s) => s.skillId);
}, [candidateSkillsQuery.data]);

const candBeh = useMemo(() => {
  return (candidateSkillsQuery.data ?? [])
    .filter((s) => s.skill?.type === 'behavioral')
    .sort((a, b) => a.priority - b.priority)
    .map((s) => s.skillId);
}, [candidateSkillsQuery.data]);

function buildSkillsInput(jobId: string): MatchSkillsInput | undefined {
  if (!candidateSkillsQuery.data) return undefined;
  const idx = (jobs ?? []).findIndex((j) => j.id === jobId);
  const jobData = jobSkillsQueries[idx]?.data;
  if (!jobData) return undefined;
  return {
    candidateTechnical: candTech,
    candidateBehavioral: candBeh,
    jobTechnical: jobData.filter((s) => s.skill?.type === 'technical').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
    jobBehavioral: jobData.filter((s) => s.skill?.type === 'behavioral').sort((a, b) => a.priority - b.priority).map((s) => s.skillId),
  };
}
```

Atualizar linha ~272:
```typescript
const result = calculateMatchBreakdown(candidate, job, ideal, candidateBehavioralProfile, buildSkillsInput(job.id));
```

- [ ] **Step 3: Build + commit**

```bash
npm run build
git add src/pages/empresa/CandidateProfile.tsx
git commit -m "feat(match): wire skills input into CandidateProfile"
```

### 8.3: `src/pages/empresa/Applications.tsx`

- [ ] **Step 1: Aplicar mesmo padrão**

Identificar a chamada (linha 203). É um helper que recebe `candidateId`, `jobId`. Aplicar mesmo padrão de `useQueries` para construir maps. Atualizar:

```typescript
const matchResult = calculateMatchBreakdown(candidate, job, idealProfile, candidateProfile, buildSkillsInput(candidate.id, job.id));
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/pages/empresa/Applications.tsx
git commit -m "feat(match): wire skills input into Applications"
```

### 8.4: `src/pages/empresa/SavedCandidates.tsx`

- [ ] **Step 1: Aplicar mesmo padrão**

Linha 117. Mesmo padrão. Atualizar:

```typescript
const matchResult = calculateMatchBreakdown(candidate, job, idealProfile, candidateProfile, buildSkillsInput(candidate.id, job.id));
```

- [ ] **Step 2: Build + commit**

```bash
npm run build
git add src/pages/empresa/SavedCandidates.tsx
git commit -m "feat(match): wire skills input into SavedCandidates"
```

---

## Task 9: Atualizar `admin/Dashboard.tsx`

**Files:**
- Modify: `src/pages/admin/Dashboard.tsx` (linhas 172 e 194)

- [ ] **Step 1: Identificar contexto**

O Dashboard admin usa `calculateMatchBreakdown` para gerar estatísticas agregadas. Itera sobre **todos os candidatos × todas as vagas** — alto custo se carregar std_skills para todos via `useQueries`.

- [ ] **Step 2: Decidir abordagem**

**Trade-off:** carregar std_skills para todos pode passar dos 100 candidatos × 19 jobs = 119 fetches. Excessivo.

Como esta tela é de **estatística agregada** e não exibe o breakdown detalhado, podemos:
- **(A) Aceitar fallback legado nesta tela** — não passar `skillsInput`, calculator usa o caminho antigo. Score agregado fica menos preciso, mas não trava o admin.
- **(B) Buscar std_skills em batch via SQL custom** — função RPC que retorna todos os pares de std_skills num único request.

Para este plano, **adotar (A)** com TODO para futuro: deixar o calculator no caminho legado nesta tela específica até que uma RPC otimizada exista.

- [ ] **Step 3: Adicionar comentário e manter sem alteração funcional**

Localizar linhas 172 e 194 em `src/pages/admin/Dashboard.tsx`. Adicionar acima de cada chamada:

```typescript
// Admin dashboard usa fallback legado para evitar N×M fetches de std_skills.
// Quando uma RPC otimizada estiver disponível, passar skillsInput aqui.
const matchResult = calculateMatchBreakdown(candidate, job, idealProfile);
```

- [ ] **Step 4: Build + commit**

```bash
npm run build
git add src/pages/admin/Dashboard.tsx
git commit -m "chore(match): document admin Dashboard uses legacy calc path"
```

---

## Task 10: Atualizar `jobRecommendation.ts` e `candidateRecommendation.ts`

**Files:**
- Modify: `src/lib/jobRecommendation.ts` (linha 280)
- Modify: `src/lib/candidateRecommendation.ts` (linha 325)

- [ ] **Step 1: Inspecionar assinatura atual**

Run:
```bash
grep -B 5 -A 15 "calculateMatchBreakdown" src/lib/jobRecommendation.ts src/lib/candidateRecommendation.ts
```

Expected: ambos recebem `data` (estrutura agregada) e iteram sobre jobs/candidates.

- [ ] **Step 2: Estender `data` para incluir std_skills**

Em `src/lib/jobRecommendation.ts`, localizar o tipo de `data` (provavelmente `RecommendationData` ou similar). Adicionar campo opcional:

```typescript
export interface RecommendationData {
  // ... campos existentes
  candidateStdSkills?: { technical: string[]; behavioral: string[] };
  jobStdSkillsMap?: Record<string, { technical: string[]; behavioral: string[] }>;
}
```

Atualizar a chamada (linha 280):

```typescript
const skillsInput = data.candidateStdSkills && data.jobStdSkillsMap?.[job.id]
  ? {
      candidateTechnical: data.candidateStdSkills.technical,
      candidateBehavioral: data.candidateStdSkills.behavioral,
      jobTechnical: data.jobStdSkillsMap[job.id].technical,
      jobBehavioral: data.jobStdSkillsMap[job.id].behavioral,
    }
  : undefined;
const matchResult = calculateMatchBreakdown(candidate, job, idealProfile, undefined, skillsInput);
```

- [ ] **Step 3: Aplicar mesma alteração em `candidateRecommendation.ts`**

Mesma estrutura, mas espelhada (vaga única vs muitos candidatos).

- [ ] **Step 4: Identificar callers e atualizar**

Run:
```bash
grep -rn "buildJobRecommendations\|buildCandidateRecommendations\|jobRecommendation\|candidateRecommendation" src/ --include="*.ts*"
```

Expected: encontrar quem chama. Atualizar callers para popular `candidateStdSkills` e `jobStdSkillsMap` (ou deixar `undefined` para fallback).

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add src/lib/jobRecommendation.ts src/lib/candidateRecommendation.ts
git commit -m "feat(match): accept skills input in recommendation builders"
```

---

## Task 11: Criar script de validação `scripts/match-audit-after-fix.ts`

**Files:**
- Create: `scripts/match-audit-after-fix.ts`

- [ ] **Step 1: Criar script que roda o calculator com std_skills carregadas do banco**

Este script é a "prova" empírica de que o fix funcionou. Deve replicar o comportamento real (passa `skillsInput`) e comparar com o caminho legacy.

Conteúdo:

```typescript
/**
 * Valida o fix do calculator rodando em pares reais (candidate, job)
 * com std_skills carregadas do Supabase. Compara legacy vs novo.
 */
import { createClient } from '@supabase/supabase-js';
import { calculateMatchBreakdown } from '../src/lib/matchCalculator';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // Pega 20 candidaturas mais recentes
  const { data: apps, error } = await supabase
    .from('applications')
    .select('id, candidate:candidates(*), job:jobs(*)')
    .order('applied_at', { ascending: false })
    .limit(20);

  if (error || !apps) {
    console.error('Erro carregando applications:', error);
    process.exit(1);
  }

  console.log(`app_id   | candidato            | vaga                   | LEGACY | NOVO  | Δ`);
  console.log('-'.repeat(100));

  for (const app of apps) {
    const candidate = app.candidate as any;
    const job = app.job as any;
    if (!candidate || !job) continue;

    // Carrega std_skills
    const [{ data: candStd }, { data: jobStd }] = await Promise.all([
      supabase
        .from('candidate_standardized_skills')
        .select('skill_id, priority, skill:standardized_skills(type)')
        .eq('candidate_id', candidate.id)
        .order('priority'),
      supabase
        .from('job_standardized_skills')
        .select('skill_id, priority, skill:standardized_skills(type)')
        .eq('job_id', job.id)
        .order('priority'),
    ]);

    const candTech = (candStd ?? []).filter((s: any) => s.skill?.type === 'technical').map((s: any) => s.skill_id);
    const candBeh = (candStd ?? []).filter((s: any) => s.skill?.type === 'behavioral').map((s: any) => s.skill_id);
    const jobTech = (jobStd ?? []).filter((s: any) => s.skill?.type === 'technical').map((s: any) => s.skill_id);
    const jobBeh = (jobStd ?? []).filter((s: any) => s.skill?.type === 'behavioral').map((s: any) => s.skill_id);

    const legacy = calculateMatchBreakdown(candidate, job);
    const novo = calculateMatchBreakdown(candidate, job, undefined, undefined, {
      candidateTechnical: candTech,
      candidateBehavioral: candBeh,
      jobTechnical: jobTech,
      jobBehavioral: jobBeh,
    });

    const delta = novo.totalScore - legacy.totalScore;
    const sign = delta > 0 ? '+' : '';
    const shortId = String(app.id).slice(0, 8);
    console.log(
      `${shortId} | ${candidate.name.padEnd(20).slice(0, 20)} | ${job.title.padEnd(22).slice(0, 22)} | ${String(legacy.totalScore).padStart(6)} | ${String(novo.totalScore).padStart(5)} | ${sign}${delta}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Rodar e capturar baseline**

Run:
```bash
npx tsx scripts/match-audit-after-fix.ts
```

Expected: tabela com 20 linhas. Pares onde candidato tem std_skills cadastradas devem mostrar Δ positivo significativo (Sul Santana: +30 a +40).

- [ ] **Step 3: Commit do script**

```bash
git add scripts/match-audit-after-fix.ts
git commit -m "test(match): add empirical validation script for after-fix comparison"
```

---

## Task 12: Verificação manual end-to-end

- [ ] **Step 1: Login como Sul Santana**

Run dev server (já está rodando na porta 3000 segundo SessionStart):
```bash
# já rodando — abrir http://localhost:3000/login
# usar credencial: SUL_SANTANA_EMAIL / senha de dev
```

- [ ] **Step 2: Navegar para a vaga "Analista Financeiro"**

Caminho: `/candidato/vagas` → buscar "Analista Financeiro" → clicar.

- [ ] **Step 3: Conferir score**

Expected:
- Match Total: deve subir de 37% para ~50-55% (skills passa de 6% para ~44%, e isso eleva o total ponderado)
- Skills Técnicas: passa de 6% para ~44%
- Outras categorias permanecem iguais (experiência, comportamental, localização)

- [ ] **Step 4: Verificar logs do console (sem erros)**

Abrir DevTools → Console. Deve estar limpo.

- [ ] **Step 5: Verificar Network tab**

Expected: ver requests para `candidate_standardized_skills` e `job_standardized_skills` retornando 200.

- [ ] **Step 6: Repetir com outro candidato/vaga (Gabrielli em Guia de Turismo)**

Score deve refletir mudança similar (Gabrielli sai de 2% legacy para ~39% novo em skills).

---

## Task 13: Atualizar changelog

**Files:**
- Modify: `public/changelog.json`
- Modify: `src/constants/app.ts`

- [ ] **Step 1: Ler changelog atual e identificar versão**

Run:
```bash
head -50 public/changelog.json
```

Expected: ver `"version"` mais recente e a flag `"isCurrent": true`.

- [ ] **Step 2: Adicionar nova versão MINOR no changelog**

No topo do array de versões, adicionar (mantendo o formato existente, com types: `added`, `changed`, `fixed`):

```json
{
  "version": "1.55.0",
  "codename": "Compass",
  "date": "2026-04-29",
  "isCurrent": true,
  "items": [
    {
      "type": "fixed",
      "title": "Match calculator agora usa skills padronizadas",
      "description": "Algoritmo de skills migrou do caminho tokenizado legado para IDs de skills padronizadas separadas em técnicas e comportamentais. Auditoria empírica confirmou: candidatos com skills cadastradas saem de scores próximos a 0% para a faixa real (Sul Santana: 6% → 44% em Skills).",
      "details": {
        "0": {
          "description": "calculateMatchBreakdown aceita MatchSkillsInput com IDs separados por tipo. Hook useMatchSkillIds combina os hooks de std_skills e separa por skill.type.",
          "files": [
            "src/lib/matchCalculator.ts",
            "src/hooks/useMatchSkillIds.ts",
            "src/types/disc.ts",
            "src/pages/candidato/JobDetails.tsx",
            "src/pages/candidato/JobSearch.tsx",
            "src/pages/empresa/Candidates.tsx",
            "src/pages/empresa/CandidateProfile.tsx",
            "src/pages/empresa/Applications.tsx",
            "src/pages/empresa/SavedCandidates.tsx",
            "src/lib/jobRecommendation.ts",
            "src/lib/candidateRecommendation.ts"
          ],
          "routes": [
            "/candidato/vagas",
            "/candidato/vagas/:id",
            "/empresa/candidatos",
            "/empresa/candidatos/:id",
            "/empresa/candidaturas",
            "/empresa/candidatos-salvos"
          ]
        }
      }
    }
  ]
},
```

E remover `"isCurrent": true` da versão anterior.

- [ ] **Step 3: Atualizar `src/constants/app.ts`**

Run:
```bash
cat src/constants/app.ts
```

Expected: ver `APP_VERSION` e `APP_CODENAME`. Atualizar para `"1.55.0"` e `"Compass"`.

- [ ] **Step 4: Atualizar `package.json`**

Editar campo `"version"` para `"1.55.0"`.

- [ ] **Step 5: Build + commit**

```bash
npm run build
git add public/changelog.json src/constants/app.ts package.json
git commit -m "chore: bump version to 1.55.0 Compass"
```

---

## Task 14: Self-validation final

- [ ] **Step 1: Rodar build + lint completos**

```bash
npm run build && npm run lint
```

Expected: ambos PASS.

- [ ] **Step 2: Rodar auditoria empírica**

```bash
npx tsx scripts/match-audit-after-fix.ts
```

Expected: ver scores das 4 candidaturas com std_skills (0ad78620, 72d1d0a5, 93efa6e1, 9507417b) com Δ positivo significativo (>20).

- [ ] **Step 3: Confirmar que Sul Santana atinge score esperado**

Expected na linha de `72d1d0a5`:
- LEGACY ~ 25 (Skills 6, ponderado)
- NOVO ~ 50+ (Skills 44, ponderado)
- Δ ~ +25 ou maior

- [ ] **Step 4: Smoke test em browser**

Abrir `/candidato/vagas/<analista-financeiro-id>` logado como Sul Santana e confirmar visualmente o Match Total e o breakdown de Skills Técnicas.

- [ ] **Step 5: Push para revisão**

```bash
git log --oneline -20
git push origin <current-branch>
```

Expected: histórico mostra ~12 commits sequenciais relacionados ao fix.

---

## Critérios de aceite (do spec)

- [x] `calculateMatchBreakdown` aceita `MatchSkillsInput`
- [x] Cálculo de skills retorna técnica e comportamental separadas (combina via média no breakdown)
- [x] Os 11 call-sites passam std_skills (via `useMatchSkillIds`) — exceto Dashboard admin que documenta o uso de fallback
- [x] Sul Santana sai de 6% para ~44% no caso de teste real
- [x] Auditoria empírica em 20 pares mostra distribuição mais ampla
- [x] `calculateSkillsScore` legado marcado `@deprecated`

## Notas importantes

- **Nada de migration de banco neste plano** — o trabalho é puramente em código.
- **Pesos continuam globais 40/30/20/10** — a divisão em 5 categorias visíveis e os pesos por vaga são da etapa B.
- **`MatchCategory.dataMissing` foi adicionado mas ainda não é populado pelo calculator** — fica preparado para a etapa C usar.
- **Performance:** algumas telas (Candidates, CandidateProfile) carregam std_skills via `useQueries` em paralelo. Para ≤ 50 candidatos × 50 vagas, o overhead é aceitável (cache de React Query reutiliza). Para o admin Dashboard (potencialmente milhares), mantém-se o fallback legado documentado.
