# Paginação/Filtro Real no Servidor para Candidatos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar o teto de 1000 candidatos que faz 33 candidatos (os mais antigos) sumirem do Dashboard admin e da Gestão de Candidatos, movendo essas duas telas para paginação/filtro real no servidor; e no Banco de Talentos (empresa), corrigir o mesmo vazamento de dados sem mexer no motor de match client-side (que depende de um projeto de porte maior, já registrado como PRD-093).

**Architecture:** `candidatesService.supabase.ts` já usa `count: 'exact'` + `.range()` corretamente — o bug está nas telas, que chamavam `useCandidates(undefined, { page: 1, pageSize: 1000 })` e tratavam o array retornado como se fosse "todos os candidatos", usando `.length` em vez do campo `total`. A correção usa três táticas por caso: (1) contagens exatas via `count: 'exact', head: true` para números que não precisam das linhas; (2) paginação real (`page`/`pageSize` enviados ao service, sem fetch prévio de tudo) para listas com filtro/paginação de UI; (3) um utilitário `fetchAllPages` (sem teto arbitrário, para de buscar quando `total` é atingido) para os poucos casos em que a tela genuinamente precisa do dataset completo em memória (cálculo de match client-side).

**Tech Stack:** React Query, Supabase JS (`count: 'exact'`), PostgreSQL (migration em `sql/migrations/`), Vitest.

## Global Constraints

- Nunca remover ou alterar comportamento de LGPD/masking das views `candidates_for_company`/`curriculums_for_company` — só adicionar colunas não sensíveis.
- Seguir Conventional Commits em inglês (ver CLAUDE.md global): `fix:`, `feat:`, `docs:`.
- Não portar o algoritmo de match (`calculateMatchBreakdown`) para SQL nesta tarefa — está reservado para o PRD-093 (Task 9), para não conflitar com o trabalho de pesos de match já em andamento na branch `dreamy-dirac`.
- Toda migration nova segue o padrão já estabelecido nas migrations 113-119 (`CREATE OR REPLACE VIEW`, bloco de "ADVERSARIAL VERIFICATION" comentado ao final).
- Próximo número de migration livre: **129** (117 já está duplicado localmente; 120-127 estão reservados pelo módulo financeiro em outra branch/worktree, já aplicados no projeto Supabase remoto).

---

### Task 1: Migration — expor `visibility_locked` e `behavioral_archetype_id` na view `candidates_for_company`

**Contexto descoberto durante a investigação:** a coluna `visibility_locked` existe em `public.candidates` (migration 039) mas **não é selecionada** pela view `candidates_for_company` (migration 116, a versão vigente). Isso significa que `candidateRowToCandidate` sempre recebe `undefined` para esse campo e cai no fallback `?? false` (`src/lib/supabaseConverters.ts:88`) — ou seja, o filtro "Origem: Colaborador" e o badge "Colaborador" em `admin/Candidates.tsx` **nunca funcionaram corretamente via este service**, independente do valor real no banco. Esta task corrige isso como pré-requisito do filtro server-side da Task 6.

Também adiciona `behavioral_archetype_id`, uma subquery correlacionada que traz o `archetype_id` do resultado Gauge-Pro mais recente do candidato (`gauge_pro_results.candidate_id` já tem índice `idx_gauge_pro_results_candidate_id`), permitindo filtrar por perfil comportamental no servidor sem precisar buscar todos os `gauge_pro_results` no cliente.

**Files:**
- Create: `sql/migrations/129_expose_visibility_and_archetype_in_company_view.sql`

**Interfaces:**
- Produces: view `public.candidates_for_company` agora retorna, além das colunas já existentes, `visibility_locked BOOLEAN` e `behavioral_archetype_id TEXT` (pode ser `NULL` se o candidato nunca fez o teste Gauge-Pro).

- [ ] **Step 1: Escrever a migration**

```sql
-- Migration 129: expose visibility_locked (bugfix — never selected since the
-- view existed) and behavioral_archetype_id (latest Gauge-Pro archetype) on
-- candidates_for_company, so admin/Candidates.tsx can filter by "origin"
-- (colaborador vs candidato) and behavioral profile entirely on the server,
-- instead of fetching every candidate row into the browser to filter there.
--
-- Both new columns are non-sensitive (no LGPD masking change): visibility_locked
-- is an internal flag, behavioral_archetype_id is a text id already exposed to
-- companies/admin via the Gauge-Pro results screens.
--
-- WHERE-clause visibility predicate and existing email/cpf/date_of_birth/phone
-- masking are kept byte-for-byte identical to migration 116.

CREATE OR REPLACE VIEW public.candidates_for_company
WITH (security_invoker = off) AS
SELECT
  c.id,
  c.profile_id,
  c.name,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.email ELSE NULL END AS email,
  c.avatar_url,
  c.title,
  c.location,
  c.city,
  c.state,
  c.experience_years,
  c.education,
  c.skills,
  c.salary_min,
  c.salary_max,
  c.salary_currency,
  c.availability,
  c.profile_completion,
  c.has_test,
  c.status,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
            OR public.company_has_application_from_candidate(public.get_company_id(auth.uid()), c.id)
       THEN c.phone ELSE NULL END AS phone,
  c.linkedin,
  c.about,
  c.plan,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.date_of_birth ELSE NULL END AS date_of_birth,
  CASE WHEN public.get_user_type(auth.uid()) = 'admin'
            OR public.company_has_data_consent(public.get_company_id(auth.uid()), c.id)
       THEN c.cpf ELSE NULL END AS cpf,
  c.visibility_mode,
  c.anonymous_id,
  c.visibility_locked,
  (
    SELECT gpr.archetype_id
    FROM public.gauge_pro_results gpr
    WHERE gpr.candidate_id = c.id
    ORDER BY gpr.generated_at DESC
    LIMIT 1
  ) AS behavioral_archetype_id,
  c.created_at,
  c.deactivated_at,
  c.updated_at
FROM public.candidates c
WHERE public.get_user_type(auth.uid()) = 'admin'
  OR (
    public.get_user_type(auth.uid()) = 'company'
    AND (
      c.visibility_mode IS DISTINCT FROM 'private'
      OR EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        WHERE a.candidate_id = c.id
          AND j.company_id = public.get_company_id(auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE (
                tm.imported_from_candidate_id = c.id
                OR tm.email = (SELECT p.email FROM public.profiles p WHERE p.id = c.profile_id)
              )
          AND tm.company_id = public.get_company_id(auth.uid())
          AND tm.is_active = TRUE
      )
    )
  );

GRANT SELECT ON public.candidates_for_company TO authenticated;

COMMENT ON VIEW public.candidates_for_company IS
  'Company (masked by consent) + admin (full) candidate read surface; email/cpf/date_of_birth NULL for company without accepted disclosure; phone revealed once the candidate is in the company''s selective process; visibility_locked + behavioral_archetype_id added in migration 129 for server-side filtering';

-- =====================================================
-- ADVERSARIAL VERIFICATION (run to verify, do not apply)
-- =====================================================
-- -- New columns present:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'candidates_for_company' AND column_name IN ('visibility_locked', 'behavioral_archetype_id');
-- Expected: both rows present.
--
-- -- visibility_locked reflects the real table value (was always NULL/false before):
-- SELECT count(*) FROM public.candidates WHERE visibility_locked = true;
-- -- compare against (as admin):
-- SELECT count(*) FROM public.candidates_for_company WHERE visibility_locked = true;
-- Expected: same count.
--
-- -- behavioral_archetype_id matches the candidate's most recent Gauge-Pro result:
-- SELECT cfc.id, cfc.behavioral_archetype_id, gpr.archetype_id, gpr.generated_at
-- FROM public.candidates_for_company cfc
-- JOIN public.gauge_pro_results gpr ON gpr.candidate_id = cfc.id
-- WHERE cfc.id = '<some_candidate_id_with_multiple_gauge_results>'
-- ORDER BY gpr.generated_at DESC;
-- Expected: cfc.behavioral_archetype_id equals the archetype_id of the most recent row.
--
-- -- Masking of email/cpf/date_of_birth/phone is unchanged from migration 116
-- -- (same CASE expressions, byte-for-byte) — no re-verification needed.
```

- [ ] **Step 2: Aplicar a migration**

Usar a ferramenta MCP do Supabase (não commitar sem antes confirmar que aplicou sem erro):
- `mcp__supabase__apply_migration` com `name: "expose_visibility_and_archetype_in_company_view"` e o SQL acima.

- [ ] **Step 3: Rodar a verificação adversarial**

Executar as 3 queries do bloco de verificação via `mcp__supabase__execute_sql` (como admin, ou simulando `request.jwt.claims` como no padrão das migrations anteriores). Confirmar:
1. As duas colunas aparecem em `information_schema.columns`.
2. `count(*) FROM candidates WHERE visibility_locked = true` bate com o mesmo filtro em `candidates_for_company` (execute como admin: basta rodar direto, já que a sessão MCP roda com privilégios que satisfazem `get_user_type(auth.uid()) = 'admin'` apenas se houver um JWT — como fallback, comparar via `SELECT count(*) FROM candidates WHERE visibility_locked=true` vs. rodar a mesma coisa contra a view protegida por um teste manual no app depois da Task 6).
3. Nenhum erro de sintaxe/tipo ao aplicar.

- [ ] **Step 4: Commit**

```bash
git add sql/migrations/129_expose_visibility_and_archetype_in_company_view.sql
git commit -m "fix(db): expose visibility_locked and behavioral_archetype_id on candidates_for_company view"
```

---

### Task 2: Utilitário `fetchAllPages` + teste unitário

**Files:**
- Create: `src/lib/fetchAllPages.ts`
- Test: `src/lib/__tests__/fetchAllPages.test.ts`

**Interfaces:**
- Produces: `fetchAllPages<T>(fetchPage: (pagination: PaginationConfig) => Promise<PaginatedResult<T>>, pageSize?: number): Promise<T[]>` — usado pelas Tasks 5 e 6.

- [ ] **Step 1: Escrever o teste que falha**

```typescript
// src/lib/__tests__/fetchAllPages.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchAllPages } from '../fetchAllPages';
import type { PaginatedResult, PaginationConfig } from '@/services/types';

describe('fetchAllPages', () => {
  it('stops as soon as total is reached, even across a batch boundary', async () => {
    const allItems = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    const fetchPage = vi.fn(
      async ({ page, pageSize }: PaginationConfig): Promise<PaginatedResult<{ id: number }>> => {
        const from = (page - 1) * pageSize;
        const data = allItems.slice(from, from + pageSize);
        return { data, total: allItems.length, page, pageSize, hasMore: from + pageSize < allItems.length };
      }
    );

    const result = await fetchAllPages(fetchPage, 10);

    expect(result).toHaveLength(25);
    expect(result.map((r) => r.id)).toEqual(allItems.map((r) => r.id));
    expect(fetchPage).toHaveBeenCalledTimes(3); // 10 + 10 + 5
  });

  it('returns an empty array without looping when total is 0', async () => {
    const fetchPage = vi.fn(async (): Promise<PaginatedResult<{ id: number }>> => ({
      data: [], total: 0, page: 1, pageSize: 1000, hasMore: false,
    }));

    const result = await fetchAllPages(fetchPage);

    expect(result).toEqual([]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/__tests__/fetchAllPages.test.ts`
Expected: FAIL — `Cannot find module '../fetchAllPages'`

- [ ] **Step 3: Implementar `fetchAllPages`**

```typescript
// src/lib/fetchAllPages.ts
import type { PaginatedResult, PaginationConfig } from '@/services/types';

/**
 * Fetches every page of a paginated service call, stopping as soon as the
 * server-reported `total` is reached (not a hardcoded page count). Use this
 * ONLY for the few screens that genuinely need the full dataset in memory
 * (client-side match scoring) — for everything else, pass real page/pageSize
 * to the service and use `total` for counts, instead of fetching everything.
 */
export async function fetchAllPages<T>(
  fetchPage: (pagination: PaginationConfig) => Promise<PaginatedResult<T>>,
  pageSize = 1000,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  for (;;) {
    const result = await fetchPage({ page, pageSize });
    all.push(...result.data);
    if (result.data.length === 0 || all.length >= result.total) break;
    page += 1;
  }

  return all;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/__tests__/fetchAllPages.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/fetchAllPages.ts src/lib/__tests__/fetchAllPages.test.ts
git commit -m "feat: add fetchAllPages utility for uncapped dataset fetches"
```

---

### Task 3: `CandidateFilters` + `candidatesService.supabase.ts` — filtros server-side novos

**Files:**
- Modify: `src/services/candidates/candidatesService.ts:16-23`
- Modify: `src/services/candidates/candidatesService.supabase.ts:44-71`

**Interfaces:**
- Consumes: colunas `visibility_locked` e `behavioral_archetype_id` da view (Task 1).
- Produces: `CandidateFilters` com dois campos novos, aplicados em `getCandidates()`.

- [ ] **Step 1: Adicionar os campos em `CandidateFilters`**

Em `src/services/candidates/candidatesService.ts`, substituir:

```typescript
export interface CandidateFilters {
  status?: Candidate['status'];
  search?: string;
  skills?: string[];
  location?: string;
  hasTest?: boolean;
  plan?: Candidate['plan'];
}
```

por:

```typescript
export interface CandidateFilters {
  status?: Candidate['status'];
  search?: string;
  skills?: string[];
  location?: string;
  hasTest?: boolean;
  plan?: Candidate['plan'];
  /** Origem: true = colaborador importado (visibilidade travada), false = candidato orgânico */
  visibilityLocked?: boolean;
  /** Filtra pelo archetype_id do resultado Gauge-Pro mais recente do candidato */
  archetypeId?: string;
}
```

- [ ] **Step 2: Aplicar os filtros na query**

Em `src/services/candidates/candidatesService.supabase.ts`, logo após o bloco `if (filters?.plan) { ... }` (linha 69-71) e antes do comentário `// --- Sorting ---`, adicionar:

```typescript
    if (filters?.visibilityLocked !== undefined) {
      query = query.eq('visibility_locked', filters.visibilityLocked);
    }

    if (filters?.archetypeId) {
      query = query.eq('behavioral_archetype_id', filters.archetypeId);
    }
```

- [ ] **Step 3: Verificação manual via SQL**

Rodar via `mcp__supabase__execute_sql` (contexto admin simulado como no bloco de verificação da Task 1):

```sql
SELECT count(*) FROM public.candidates_for_company WHERE visibility_locked = true;
SELECT count(*) FROM public.candidates_for_company WHERE behavioral_archetype_id IS NOT NULL;
```

Confirmar que ambos retornam números plausíveis (não erro de coluna inexistente) — isso já valida que a Task 1 está aplicada e que os nomes de coluna batem com o que o service vai filtrar.

- [ ] **Step 4: Commit**

```bash
git add src/services/candidates/candidatesService.ts src/services/candidates/candidatesService.supabase.ts
git commit -m "feat(candidates): support server-side filtering by origin and behavioral archetype"
```

---

### Task 4: Hooks fetch-all — `useAllCandidates`, `useAllApplications`, `useAllJobs`

**Files:**
- Modify: `src/hooks/useCandidatesQuery.ts`
- Modify: `src/hooks/useApplicationsQuery.ts`
- Modify: `src/hooks/useJobsQuery.ts`

**Interfaces:**
- Consumes: `fetchAllPages` (Task 2), `getCandidatesService`/`getApplicationsService`/`getJobsService` (já existentes).
- Produces: `useAllCandidates(filters?, sort?)`, `useAllApplications(filters?, sort?)`, `useAllJobs(filters?, sort?)` — cada um retorna `UseQueryResult<T[]>` (array puro, não `PaginatedResult`), usados pelas Tasks 5, 7 e 8.

- [ ] **Step 1: `useAllCandidates` em `src/hooks/useCandidatesQuery.ts`**

Adicionar ao final do arquivo (depois de `useUpdateCandidate`):

```typescript
// ---------------------------------------------------------------------------
// useAllCandidates — fetches every candidate matching filters, no hardcoded
// page-size cap. Use ONLY when the screen genuinely needs the full dataset
// in memory (e.g. client-side match scoring in the Talent Pool) — for
// paginated lists, use useCandidates with real page/pageSize instead.
// ---------------------------------------------------------------------------

export function useAllCandidates(
  filters?: CandidateFilters,
  sort?: SortConfig,
  options?: Omit<UseQueryOptions<Candidate[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Candidate[]>({
    queryKey: [...candidateKeys.lists(), 'all', { filters, sort }],
    queryFn: async () => {
      const service = await getCandidatesService();
      return fetchAllPages((pagination) => service.getCandidates(filters, pagination, sort));
    },
    ...options,
  });
}
```

Adicionar o import no topo do arquivo:

```typescript
import { fetchAllPages } from '@/lib/fetchAllPages';
```

- [ ] **Step 2: `useAllApplications` em `src/hooks/useApplicationsQuery.ts`**

Confirmado o formato exato do arquivo: `applicationKeys` (linha 19-35), `ApplicationFilters` (importado de `@/services/applications/applicationsService`, linha 11), `getApplicationsService` (linha 10), `UseQueryOptions` ainda não importado neste arquivo. Adicionar ao final do arquivo:

```typescript
import type { Application } from '@/types';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { fetchAllPages } from '@/lib/fetchAllPages';

// ---------------------------------------------------------------------------
// useAllApplications — fetches every application matching filters, no
// hardcoded page-size cap. Use ONLY when the screen genuinely needs the full
// dataset in memory (e.g. admin Dashboard match-scoring section) — for
// paginated lists, use useApplications with real page/pageSize instead.
// ---------------------------------------------------------------------------

export function useAllApplications(
  filters?: ApplicationFilters,
  sort?: SortConfig,
  options?: Omit<UseQueryOptions<Application[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Application[]>({
    queryKey: [...applicationKeys.lists(), 'all', { filters, sort }],
    queryFn: async () => {
      const service = await getApplicationsService();
      return fetchAllPages((pagination) => service.getApplications(filters, pagination, sort));
    },
    ...options,
  });
}
```

Note que `useQuery`/`useMutation`/`useQueryClient` já são importados de `@tanstack/react-query` na linha 9 do arquivo — ajustar essa linha existente para incluir `type UseQueryOptions` em vez de duplicar o import.

- [ ] **Step 3: `useAllJobs` em `src/hooks/useJobsQuery.ts`**

Confirmado o formato exato: `jobKeys` (linha 12-22), `JobFilters` (linha 8), `getJobsService` (linha 7), `Job` (linha 10). Atualizar a linha 6 do arquivo para incluir `type UseQueryOptions`:

```typescript
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { fetchAllPages } from '@/lib/fetchAllPages';
```

E adicionar ao final do arquivo:

```typescript
export function useAllJobs(
  filters?: JobFilters,
  sort?: SortConfig,
  options?: Omit<UseQueryOptions<Job[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Job[]>({
    queryKey: [...jobKeys.lists(), 'all', { filters, sort }],
    queryFn: async () => {
      const service = await getJobsService();
      return fetchAllPages((pagination) => service.getJobs(filters, pagination, sort));
    },
    ...options,
  });
}
```

- [ ] **Step 4: `npm run lint` e `npx tsc --noEmit`**

Run: `npm run lint && npx tsc --noEmit`
Expected: sem erros novos nos 3 arquivos modificados.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCandidatesQuery.ts src/hooks/useApplicationsQuery.ts src/hooks/useJobsQuery.ts
git commit -m "feat: add fetch-all hooks for candidates, applications and jobs"
```

---

### Task 5: `empresa/Candidates.tsx` (Banco de Talentos) — corrigir o vazamento sem mexer no match

**Contexto:** o motor de match (`calculateAllJobScores` → `calculateMatchBreakdown`) roda no navegador e precisa do array completo de candidatos. Portar isso para SQL é o PRD-093 (Task 9) — fora do escopo aqui. Esta task só garante que nenhum candidato seja descartado por um teto arbitrário.

**Files:**
- Modify: `src/pages/empresa/Candidates.tsx:366`

**Interfaces:**
- Consumes: `useAllCandidates()` (Task 4).

- [ ] **Step 1: Trocar a busca de candidatos**

Substituir (linha 366):

```typescript
  const { data: candidatesResult } = useCandidates(undefined, { page: 1, pageSize: 1000 });
  const allCandidates = useMemo(() => candidatesResult?.data ?? [], [candidatesResult]);
```

por:

```typescript
  const { data: allCandidates = [] } = useAllCandidates();
```

- [ ] **Step 2: Atualizar o import**

Substituir (linha 96):

```typescript
import { useCandidates } from '@/hooks/useCandidatesQuery';
```

por:

```typescript
import { useAllCandidates } from '@/hooks/useCandidatesQuery';
```

- [ ] **Step 3: Verificar que nada mais no arquivo referencia `candidatesResult`**

Run: `grep -n "candidatesResult" "src/pages/empresa/Candidates.tsx"`
Expected: nenhuma ocorrência (já eliminado no Step 1).

- [ ] **Step 4: Teste manual no navegador**

Com o dev server rodando (porta 3000), logar como `rh@techsolutions.com` / `Company@123`, abrir `/empresa/candidatos` (Banco de Talentos), conferir:
- O card "Total Candidatos" mostra um número igual ou maior que 1000 (deve refletir o total real, hoje 1033).
- Rolar até a última página e confirmar que aparecem candidatos com `Desde` (data de cadastro) próxima de fevereiro/2026 (os que antes sumiam).

- [ ] **Step 5: Commit**

```bash
git add src/pages/empresa/Candidates.tsx
git commit -m "fix(empresa): stop truncating Banco de Talentos at 1000 candidates"
```

---

### Task 6: `admin/Candidates.tsx` — paginação e filtro real no servidor

**Files:**
- Modify: `src/pages/admin/Candidates.tsx`

**Interfaces:**
- Consumes: `useCandidates(filters, pagination, sort)` já existente (Task 3 adiciona os filtros novos); `candidatesResult.total`/`.data` diretamente.

- [ ] **Step 1: Remover o fetch-all e montar os filtros server-side**

Substituir (linhas 270-277):

```typescript
  // Fetch candidates via service layer
  const { data: candidatesResult, isLoading: isLoadingCandidates } = useCandidates(
    undefined,
    { page: 1, pageSize: 1000 }
  );
```

por (posicionar DEPOIS do bloco `useAdminCandidateFilters` e `usePaginationParams`, já que os filtros dependem deles — mover a leitura de filtros/paginação para cima do fetch):

```typescript
  // Filters synced with URL search params (survive navigation to candidate detail)
  const {
    searchTerm,
    statusFilter,
    testStatusFilter,
    behavioralProfileFilter,
    originFilter,
    setSearchTerm,
    setStatusFilter,
    setTestStatusFilter,
    setBehavioralProfileFilter: setDiscProfileFilter,
    setOriginFilter,
    clearFilters: handleClearFilters,
  } = useAdminCandidateFilters();

  // Search input: local state for responsive typing, debounced sync to URL
  const [searchInput, setSearchInput] = useState(searchTerm);
  const debouncedSearch = useDebounce(searchInput, 300);

  const lastUrlSearchRef = useRef(searchTerm);
  useEffect(() => {
    if (searchTerm !== lastUrlSearchRef.current) {
      lastUrlSearchRef.current = searchTerm;
      setSearchInput(searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      lastUrlSearchRef.current = debouncedSearch;
      setSearchTerm(debouncedSearch);
    }
  }, [debouncedSearch, searchTerm, setSearchTerm]);

  // Pagination (synced with URL search params)
  const { page: currentPage, setPage: setCurrentPage, resetPage } = usePaginationParams({ defaultPage: 1 });

  // Server-side filters derived from URL state
  const candidateFilters = useMemo((): CandidateFilters => ({
    status: statusFilter !== 'all' ? (statusFilter as Candidate['status']) : undefined,
    search: debouncedSearch || undefined,
    hasTest: testStatusFilter === 'completed' ? true : testStatusFilter === 'not_completed' ? false : undefined,
    visibilityLocked: originFilter === 'collaborator' ? true : originFilter === 'candidate' ? false : undefined,
    archetypeId: behavioralProfileFilter !== 'all' ? behavioralProfileFilter : undefined,
  }), [statusFilter, debouncedSearch, testStatusFilter, originFilter, behavioralProfileFilter]);

  // Fetch candidates via service layer — real server-side pagination + filtering
  const { data: candidatesResult, isLoading: isLoadingCandidates } = useCandidates(
    candidateFilters,
    { page: currentPage, pageSize: ITEMS_PER_PAGE },
  );

  // Global (unfiltered) header counts — cheap count-exact queries, independent
  // of the active filters, so they always reflect the whole candidate pool.
  const { data: totalCandidatesCount } = useQuery({
    queryKey: ['admin', 'candidates-header-count', 'total'],
    queryFn: async () => {
      const { count, error } = await supabase.from('candidates_for_company').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: activeCandidatesCount } = useQuery({
    queryKey: ['admin', 'candidates-header-count', 'active'],
    queryFn: async () => {
      const { count, error } = await supabase.from('candidates_for_company').select('*', { count: 'exact', head: true }).eq('status', 'active');
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: testedCandidatesCount } = useQuery({
    queryKey: ['admin', 'candidates-header-count', 'tested'],
    queryFn: async () => {
      const { count, error } = await supabase.from('candidates_for_company').select('*', { count: 'exact', head: true }).eq('has_test', true);
      if (error) throw error;
      return count ?? 0;
    },
  });
```

- [ ] **Step 2: Remover a duplicata dos blocos antigos de filtros/paginação mais abaixo**

O arquivo original tinha os blocos `useAdminCandidateFilters()`, `useState(searchInput)`, os dois `useEffect` de sync e `usePaginationParams` **depois** do fetch (linhas 279-314 do arquivo original). Como o Step 1 já os moveu para antes do fetch, remover as cópias antigas dessas linhas — o arquivo não deve ter dois `const { searchTerm, ... } = useAdminCandidateFilters()`.

- [ ] **Step 3: Remover o motor de filtro client-side e o `useAllGaugeProResults`**

Remover por completo (linhas 329-345 do arquivo original):

```typescript
  // Gauge-Pro result for selected candidate (side panel)
  const { data: selectedGaugeResult } = useGaugeProResultByCandidate(selectedCandidate?.id || '');

  // All Gauge-Pro results for behavioral profile filtering
  const { data: allGaugeResults } = useAllGaugeProResults();
  const gaugeResultsMap = useMemo(() => {
    const map = new Map<string, string>();
    if (allGaugeResults) {
      for (const r of allGaugeResults) {
        // Keep latest result per candidate (already sorted by generated_at desc)
        if (!map.has(r.candidateId)) {
          map.set(r.candidateId, r.archetype?.id ?? '');
        }
      }
    }
    return map;
  }, [allGaugeResults]);
```

Manter apenas:

```typescript
  // Gauge-Pro result for selected candidate (side panel)
  const { data: selectedGaugeResult } = useGaugeProResultByCandidate(selectedCandidate?.id || '');
```

Remover o import agora não usado `useAllGaugeProResults` (linha 232): trocar

```typescript
import { useGaugeProResultByCandidate, useAllGaugeProResults } from '@/hooks/useGaugeProQuery';
```

por

```typescript
import { useGaugeProResultByCandidate } from '@/hooks/useGaugeProQuery';
```

Remover todo o bloco `filteredCandidates = candidates.filter(...)` (linhas 363-388 do arquivo original) e a linha de pagination client-side:

```typescript
  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
```

substituindo por:

```typescript
  const totalCandidatesFiltered = candidatesResult?.total ?? 0;
  const totalPages = Math.ceil(totalCandidatesFiltered / ITEMS_PER_PAGE);
  const paginatedCandidates = candidates; // already the current server page
```

(`candidates` continua sendo o `useState<Candidate[]>` local já existente, sincronizado via o `useEffect` que já existe em `if (candidatesResult?.data) setCandidates(candidatesResult.data)` — agora ele guarda só a página atual, não mais 1000 linhas. Isso preserva o comportamento atual dos botões Desativar/Reativar/Resetar Teste, que já eram apenas otimista-local, sem persistir no backend — bug pré-existente fora do escopo desta correção.)

- [ ] **Step 4: Atualizar os badges do header e o texto de resultados**

Substituir (linhas 1035-1051 do arquivo original):

```typescript
          badges={
            candidates.length > 0 ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  <User className="w-3 h-3" />
                  {candidates.length} {candidates.length === 1 ? 'candidato' : 'candidatos'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {candidates.filter(c => c.status === 'active').length} ativos
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 text-xs font-medium text-violet-600 dark:text-violet-400">
                  <Brain className="w-3 h-3" />
                  {candidates.filter(c => c.hasTest === true).length} com teste
                </span>
              </>
            ) : undefined
          }
```

por:

```typescript
          badges={
            totalCandidatesCount !== undefined ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  <User className="w-3 h-3" />
                  {totalCandidatesCount} {totalCandidatesCount === 1 ? 'candidato' : 'candidatos'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {activeCandidatesCount ?? 0} ativos
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 text-xs font-medium text-violet-600 dark:text-violet-400">
                  <Brain className="w-3 h-3" />
                  {testedCandidatesCount ?? 0} com teste
                </span>
              </>
            ) : undefined
          }
```

Substituir (linha 1116-1118 do arquivo original):

```typescript
              <p className="text-sm text-muted-foreground">
                {filteredCandidates.length} candidato(s) encontrado(s)
              </p>
```

por:

```typescript
              <p className="text-sm text-muted-foreground">
                {totalCandidatesFiltered} candidato(s) encontrado(s)
              </p>
```

- [ ] **Step 5: Adicionar os imports novos**

No topo do arquivo, adicionar:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CandidateFilters } from '@/services/candidates/candidatesService';
```

- [ ] **Step 6: `npm run lint` e `npx tsc --noEmit`**

Run: `npm run lint && npx tsc --noEmit`
Expected: sem erros. Prestar atenção especial a variáveis agora não usadas (`filteredCandidates` não deve mais existir em lugar nenhum do arquivo).

- [ ] **Step 7: Teste manual no navegador**

Logar como `admin@recrutars.com` / `Admin@123`, abrir `/admin/candidatos`:
- Badge "candidatos" no header deve mostrar 1033 (ou o total real na hora do teste).
- "X candidato(s) encontrado(s)" sem filtro deve bater com o mesmo número.
- Aplicar filtro de status "Inativo" e confirmar que o número muda e a paginação recalcula.
- Aplicar filtro "Perfil Comportamental" com um arquétipo específico e confirmar que só aparecem candidatos com aquele resultado Gauge-Pro.
- Aplicar filtro "Origem: Colaborador" e confirmar que aparece pelo menos 1 resultado (antes da Task 1 este filtro nunca retornava nada, mesmo havendo colaboradores).
- Navegar até a última página e confirmar que aparecem os candidatos mais antigos (criados em fevereiro/2026).

- [ ] **Step 8: Commit**

```bash
git add src/pages/admin/Candidates.tsx
git commit -m "fix(admin): move Gestão de Candidatos to real server-side pagination and filtering"
```

---

### Task 7: `admin/Dashboard.tsx` — stats, growth chart e ranking de empresas 100% servidor

**Contexto:** durante a investigação foi descoberto que `useJobs()` (sem argumentos) já usa o pageSize padrão do `jobsService` (`pagination?.pageSize ?? 10`, ver `src/services/jobs/jobsService.supabase.ts:121`) — ou seja, a seção "Vagas com poucos candidatos de alto match" e "Taxa de Match" **já operam hoje sobre apenas 10 das 78 vagas existentes**, silenciosamente, pelo mesmo motivo do bug de candidatos. Isso é corrigido nesta task usando `useAllJobs()` (Task 4), sem portar o cálculo de match para SQL (fora de escopo — ver PRD-093, Task 9).

**Files:**
- Modify: `src/pages/admin/Dashboard.tsx`

**Interfaces:**
- Consumes: `useAllCandidates`, `useAllApplications`, `useAllJobs` (Task 4); `useCompanies(filters, pagination, sort)` já existente.

- [ ] **Step 1: Trocar os 4 cards de estatística por contagens exatas**

Substituir (linhas 97-134):

```typescript
export default function AdminDashboard() {
  // Fetch data via React Query hooks
  const { data: jobsResult } = useJobs();
  const { data: candidatesResult } = useCandidates(undefined, { page: 1, pageSize: 1000 });
  const { data: companiesResult } = useCompanies();
  const { data: applicationsResult } = useApplications(undefined, { page: 1, pageSize: 1000 });
  const { data: testsResult } = useBehavioralTests();

  // Gauge-Pro completed tests count (modern test system)
  const { data: gaugeProCount } = useQuery({
    queryKey: ['admin', 'gauge-pro-completed-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('gauge_pro_results')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: gaugeProThisMonthCount } = useQuery({
    queryKey: ['admin', 'gauge-pro-completed-this-month'],
    queryFn: async () => {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count, error } = await supabase
        .from('gauge_pro_results')
        .select('*', { count: 'exact', head: true })
        .gte('generated_at', startOfMonth);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const jobs = jobsResult?.data ?? [];
  const candidates = candidatesResult?.data ?? [];
  const companies = companiesResult?.data ?? [];
  const applications = applicationsResult?.data ?? [];
  const tests = testsResult ?? [];
```

por:

```typescript
export default function AdminDashboard() {
  const startOfMonthIso = useMemo(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    [],
  );

  // Stat cards: exact counts, no row fetch at all.
  const { data: totalCompanies } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'companies-total'],
    queryFn: async () => {
      const { count, error } = await supabase.from('companies').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: newCompaniesThisMonth } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'companies-this-month'],
    queryFn: async () => {
      const { count, error } = await supabase.from('companies').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonthIso);
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: totalCandidates } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'candidates-total'],
    queryFn: async () => {
      const { count, error } = await supabase.from('candidates_for_company').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: newCandidatesThisMonth } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'candidates-this-month'],
    queryFn: async () => {
      const { count, error } = await supabase.from('candidates_for_company').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonthIso);
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: activeJobsCount } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'jobs-active'],
    queryFn: async () => {
      const { count, error } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active');
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: newJobsThisMonth } = useQuery({
    queryKey: ['admin', 'dashboard-count', 'jobs-this-month'],
    queryFn: async () => {
      const { count, error } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', startOfMonthIso);
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Gauge-Pro completed tests count (modern test system)
  const { data: gaugeProCount } = useQuery({
    queryKey: ['admin', 'gauge-pro-completed-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('gauge_pro_results')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: gaugeProThisMonthCount } = useQuery({
    queryKey: ['admin', 'gauge-pro-completed-this-month'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('gauge_pro_results')
        .select('*', { count: 'exact', head: true })
        .gte('generated_at', startOfMonthIso);
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: testsResult } = useBehavioralTests();
  const tests = testsResult ?? [];

  // Recent + top companies: two small, dedicated, already-sorted queries —
  // no need to fetch every company just to show 4 or 5 of them.
  const { data: recentCompaniesResult } = useCompanies(undefined, { page: 1, pageSize: 4 }, { field: 'createdAt', direction: 'desc' });
  const recentCompanies = recentCompaniesResult?.data ?? [];
  const { data: topCompaniesResult } = useCompanies(undefined, { page: 1, pageSize: 5 }, { field: 'activeJobs', direction: 'desc' });
  const topCompanies = topCompaniesResult?.data ?? [];

  // Growth chart (last 30 days): lightweight created_at-only rows, bounded to
  // the window, plus a baseline count of everything created before it — never
  // fetches the full historical table, so it can't be capped by row count.
  const growthWindowStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const { data: companiesBaseline } = useQuery({
    queryKey: ['admin', 'dashboard-growth', 'companies-baseline', growthWindowStart.toISOString()],
    queryFn: async () => {
      const { count, error } = await supabase.from('companies').select('*', { count: 'exact', head: true }).lt('created_at', growthWindowStart.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: candidatesBaseline } = useQuery({
    queryKey: ['admin', 'dashboard-growth', 'candidates-baseline', growthWindowStart.toISOString()],
    queryFn: async () => {
      const { count, error } = await supabase.from('candidates_for_company').select('*', { count: 'exact', head: true }).lt('created_at', growthWindowStart.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
  });
  const { data: companiesInWindow = [] } = useQuery({
    queryKey: ['admin', 'dashboard-growth', 'companies-window', growthWindowStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('created_at').gte('created_at', growthWindowStart.toISOString());
      if (error) throw error;
      return (data ?? []) as { created_at: string }[];
    },
  });
  const { data: candidatesInWindow = [] } = useQuery({
    queryKey: ['admin', 'dashboard-growth', 'candidates-window', growthWindowStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.from('candidates_for_company').select('created_at').gte('created_at', growthWindowStart.toISOString());
      if (error) throw error;
      return (data ?? []) as { created_at: string }[];
    },
  });

  // Full datasets, uncapped — only for the client-side match-scoring section
  // below (matchStatistics / lowMatchJobs). See PRD-093 for the plan to move
  // match scoring server-side and drop this fetch-all entirely.
  const { data: jobs = [] } = useAllJobs();
  const { data: candidates = [] } = useAllCandidates();
  const { data: applications = [] } = useAllApplications();
```

- [ ] **Step 2: Simplificar `adminStats`**

Substituir (linhas 136-161):

```typescript
  // Compute real metrics from Supabase data
  const adminStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalCompanies = companies.length;
    const totalCandidates = candidates.length;
    const activeJobs = jobs.filter((j: any) => (j.status ?? j.status) === 'active').length;
    const legacyCompleted = tests.filter((t: any) => (t.status ?? t.status) === 'completed').length;
    const testsCompleted = (gaugeProCount ?? 0) + legacyCompleted;

    const getCreatedAt = (item: any) => new Date(item.createdAt ?? item.created_at);

    const newCompaniesThisMonth = companies.filter(c => getCreatedAt(c) >= startOfMonth).length;
    const newCandidatesThisMonth = candidates.filter(c => getCreatedAt(c) >= startOfMonth).length;
    const newJobsThisMonth = jobs.filter((j: any) => (j.status ?? j.status) === 'active' && getCreatedAt(j) >= startOfMonth).length;
    const legacyTestsThisMonth = tests.filter((t: any) => (t.status ?? t.status) === 'completed' && getCreatedAt(t) >= startOfMonth).length;
    const newTestsThisMonth = (gaugeProThisMonthCount ?? 0) + legacyTestsThisMonth;

    // Match rate: percentage of applications with high match (>= 80%)
    const matchRate = applications.length > 0
      ? Math.round((applications.filter((a: any) => (a.matchScore ?? a.match_score ?? 0) >= 80).length / applications.length) * 100)
      : 0;

    return { totalCompanies, totalCandidates, activeJobs, testsCompleted, newCompaniesThisMonth, newCandidatesThisMonth, newJobsThisMonth, newTestsThisMonth, matchRate };
  }, [companies, candidates, jobs, tests, applications, gaugeProCount, gaugeProThisMonthCount]);
```

por:

```typescript
  // Compute real metrics — stat-card numbers now come straight from the
  // exact-count queries above; only the match rate still needs the full
  // applications array (client-side scoring, see PRD-093).
  const adminStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const legacyCompleted = tests.filter((t: any) => (t.status ?? t.status) === 'completed').length;
    const testsCompleted = (gaugeProCount ?? 0) + legacyCompleted;
    const legacyTestsThisMonth = tests.filter((t: any) => (t.status ?? t.status) === 'completed' && new Date(t.createdAt ?? t.created_at) >= startOfMonth).length;
    const newTestsThisMonth = (gaugeProThisMonthCount ?? 0) + legacyTestsThisMonth;

    // Match rate: percentage of applications with high match (>= 80%)
    const matchRate = applications.length > 0
      ? Math.round((applications.filter((a: any) => (a.matchScore ?? a.match_score ?? 0) >= 80).length / applications.length) * 100)
      : 0;

    return {
      totalCompanies: totalCompanies ?? 0,
      totalCandidates: totalCandidates ?? 0,
      activeJobs: activeJobsCount ?? 0,
      testsCompleted,
      newCompaniesThisMonth: newCompaniesThisMonth ?? 0,
      newCandidatesThisMonth: newCandidatesThisMonth ?? 0,
      newJobsThisMonth: newJobsThisMonth ?? 0,
      newTestsThisMonth,
      matchRate,
    };
  }, [totalCompanies, totalCandidates, activeJobsCount, tests, applications, gaugeProCount, gaugeProThisMonthCount, newCompaniesThisMonth, newCandidatesThisMonth, newJobsThisMonth]);
```

- [ ] **Step 3: Reescrever `growthData` para usar as janelas leves**

Substituir (linhas 198-227):

```typescript
  // Growth chart data: cumulative companies/candidates + same-day sign-ups over last 30 days
  const growthData = useMemo<GrowthDataPoint[]>(() => {
    const days = 30;
    const now = new Date();
    const data: GrowthDataPoint[] = [];
    const getCreatedAt = (item: any) => new Date(item.createdAt ?? item.created_at);

    for (let i = days - 1; i >= 0; i--) {
      const dayEnd = new Date(now);
      dayEnd.setDate(dayEnd.getDate() - i);
      dayEnd.setHours(23, 59, 59, 999);
      const dayStart = new Date(dayEnd);
      dayStart.setHours(0, 0, 0, 0);
      const dateStr = dayEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      const companiesCount = companies.filter(c => getCreatedAt(c) <= dayEnd).length;
      const candidatesCount = candidates.filter(c => getCreatedAt(c) <= dayEnd).length;
      const newCompanies = companies.filter(c => {
        const created = getCreatedAt(c);
        return created >= dayStart && created <= dayEnd;
      }).length;
      const newCandidates = candidates.filter(c => {
        const created = getCreatedAt(c);
        return created >= dayStart && created <= dayEnd;
      }).length;

      data.push({ date: dateStr, companies: companiesCount, candidates: candidatesCount, newCompanies, newCandidates });
    }
    return data;
  }, [companies, candidates]);
```

por:

```typescript
  // Growth chart data: cumulative companies/candidates + same-day sign-ups
  // over the last 30 days. Built from the lightweight windowed queries above
  // (created_at only, last 30 days) plus a baseline count for everything
  // before the window — never touches the full historical table.
  const growthData = useMemo<GrowthDataPoint[]>(() => {
    const days = 30;
    const now = new Date();
    const data: GrowthDataPoint[] = [];

    let companiesRunning = companiesBaseline ?? 0;
    let candidatesRunning = candidatesBaseline ?? 0;

    for (let i = days - 1; i >= 0; i--) {
      const dayEnd = new Date(now);
      dayEnd.setDate(dayEnd.getDate() - i);
      dayEnd.setHours(23, 59, 59, 999);
      const dayStart = new Date(dayEnd);
      dayStart.setHours(0, 0, 0, 0);
      const dateStr = dayEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      const newCompanies = companiesInWindow.filter((c) => {
        const created = new Date(c.created_at);
        return created >= dayStart && created <= dayEnd;
      }).length;
      const newCandidates = candidatesInWindow.filter((c) => {
        const created = new Date(c.created_at);
        return created >= dayStart && created <= dayEnd;
      }).length;

      companiesRunning += newCompanies;
      candidatesRunning += newCandidates;

      data.push({ date: dateStr, companies: companiesRunning, candidates: candidatesRunning, newCompanies, newCandidates });
    }
    return data;
  }, [companiesBaseline, candidatesBaseline, companiesInWindow, candidatesInWindow]);
```

- [ ] **Step 4: Atualizar "Empresas Recentes" e "Top Empresas" para usar as novas queries dedicadas**

Substituir (linha 496): `{companies.slice(0, 4).map((company) => (` por `{recentCompanies.map((company) => (`

Substituir (linhas 577-579):

```typescript
              {[...companies]
                .sort((a, b) => b.activeJobs - a.activeJobs)
                .slice(0, 5)
                .map((company, index) => (
```

por:

```typescript
              {topCompanies.map((company, index) => (
```

- [ ] **Step 5: Atualizar os imports**

Substituir (linhas 7-10):

```typescript
import { useJobs } from '@/hooks/useJobsQuery';
import { useCandidates } from '@/hooks/useCandidatesQuery';
import { useCompanies } from '@/hooks/useCompaniesQuery';
import { useApplications } from '@/hooks/useApplicationsQuery';
```

por:

```typescript
import { useAllJobs } from '@/hooks/useJobsQuery';
import { useAllCandidates } from '@/hooks/useCandidatesQuery';
import { useCompanies } from '@/hooks/useCompaniesQuery';
import { useAllApplications } from '@/hooks/useApplicationsQuery';
```

- [ ] **Step 6: `npm run lint` e `npx tsc --noEmit`**

Run: `npm run lint && npx tsc --noEmit`
Expected: sem erros. Conferir especialmente que nenhuma referência a `companiesResult`, `jobsResult`, `applicationsResult`, `candidatesResult` sobrou no arquivo (foram todos substituídos).

- [ ] **Step 7: Teste manual no navegador**

Logar como admin, abrir `/admin` (Dashboard):
- "Candidatos cadastrados" deve mostrar o total real (1033+), não mais 1.000.
- "Vagas ativas" e seu delta mensal continuam corretos.
- Gráfico de crescimento (30 dias) renderiza sem erro e os totais acumulados no tooltip do último dia batem com os cards de estatística.
- "Vagas com poucos candidatos de alto match" agora pode considerar as 78 vagas (antes só via 10).

- [ ] **Step 8: Commit**

```bash
git add src/pages/admin/Dashboard.tsx
git commit -m "fix(admin): compute dashboard stats and growth chart server-side, uncap job/candidate/application fetches used by match stats"
```

---

### Task 8: PRD-093 — documentação detalhada do trabalho futuro (match 100% server-side)

**Files:**
- Create: `docs/prds/PRD-093-match-scoring-server-side-e-paginacao-banco-talentos.md`

- [ ] **Step 1: Escrever o documento**

```markdown
# PRD-093: Match Scoring Server-Side + Paginação Real no Banco de Talentos

## Status
Backlog — não iniciado. Depende de coordenação com o trabalho de pesos de match em andamento na branch `dreamy-dirac` (Compass v1.56.0, Plano A completo; Planos B/C pendentes).

## Contexto

Durante a investigação do bug "Banco de Talentos mostra só 1000 candidatos" (2026-07-24),
ficou confirmado que:

1. `empresa/Candidates.tsx` (Banco de Talentos) e a seção "Taxa de Match" /
   "Vagas com poucos candidatos de alto match" do `admin/Dashboard.tsx`
   dependem de `calculateMatchBreakdown` (`src/lib/matchCalculator.ts`),
   que roda inteiramente no navegador e precisa do array completo de
   candidatos, vagas, testes comportamentais e skills padronizadas em
   memória para computar o ranking por match.
2. Isso torna paginação/ordenação real no servidor impossível sem antes
   portar esse algoritmo (overlap de skills padronizadas + compatibilidade
   comportamental + perfil ideal por vaga) para uma function/RPC do
   PostgreSQL — ou pelo menos para uma Edge Function que compute e
   armazene os scores.
3. Como correção imediata (ver commit `fix(empresa): stop truncating Banco
   de Talentos at 1000 candidates`), o vazamento de dados foi resolvido
   trocando o fetch de `pageSize: 1000` fixo por `useAllCandidates()`
   (busca todas as páginas até bater o `total` real, sem teto arbitrário).
   Isso resolve a CORREÇÃO mas não a ESCALABILIDADE: à medida que a base
   de candidatos cresce (hoje 1033+), o Banco de Talentos e a seção de
   match do Dashboard continuam buscando o dataset inteiro no cliente a
   cada carregamento de página.

## Bugs relacionados encontrados durante a investigação (já corrigidos)

- `admin/Dashboard.tsx` chamava `useJobs()` sem argumentos, que por padrão
  aplica `pageSize: 10` (`jobsService.supabase.ts:121`) — a seção de match
  do Dashboard já operava sobre só 10 das 78 vagas existentes, silenciosamente.
  Corrigido junto com esta task usando `useAllJobs()` (sem porte do match).
- A view `candidates_for_company` nunca expunha `visibility_locked`, então o
  filtro "Origem: Colaborador" da Gestão de Candidatos nunca funcionou
  (sempre `false`). Corrigido na migration 129.

## Escopo deste PRD (não implementado ainda)

1. **Function/RPC de scoring**: portar `calculateMatchBreakdown` (skills
   técnicas/comportamentais padronizadas, compatibilidade de perfil
   Gauge-Pro, perfil ideal por vaga) para uma function SQL ou Edge Function
   que aceite `job_id` e devolva candidatos ordenados por score, paginados
   de verdade (`LIMIT`/`OFFSET` ou keyset pagination).
2. **Coordenar com a branch `dreamy-dirac`** (pesos de match, Compass
   v1.56.0) antes de iniciar — os pesos usados no cálculo são a mesma
   entrada que aquele trabalho está tornando configurável (ver PRD-092,
   CRUD de templates de pesos). Portar o algoritmo duas vezes
   (uma vez ali, outra aqui) geraria retrabalho ou divergência de lógica.
3. **Banco de Talentos (`empresa/Candidates.tsx`)**: trocar
   `useAllCandidates()` por uma chamada paginada real contra a nova
   function/RPC, incluindo os filtros hoje client-side (estado, cidade,
   experiência, skills, foto) — a maioria já é trivial de mover (ver
   `CandidateFilters` estendido na Task 3 deste ciclo), só a ordenação por
   match depende do item 1.
4. **`admin/Dashboard.tsx`**: seção "Taxa de Match" / "Vagas com poucos
   candidatos de alto match" passa a consumir a mesma function/RPC via
   agregação (`GROUP BY job_id`), sem precisar buscar candidatos/vagas/
   candidaturas completos no cliente.
5. **Migração de dados**: nenhuma — o algoritmo já existe e é determinístico;
   a migração é só de "onde ele roda".

## Fora de escopo

- Mudar a fórmula de match em si (isso é o PRD-092/branch `dreamy-dirac`).
- Qualquer UI nova — o objetivo é paridade de comportamento, só que paginado
  de verdade no servidor.

## Critério de pronto

- Banco de Talentos pagina no servidor (sem `useAllCandidates()`/fetch-all)
  mesmo com "Maior Match" selecionado como ordenação.
- `admin/Dashboard.tsx` não busca mais candidatos/vagas/candidaturas
  completos para computar `matchStatistics`/`lowMatchJobs`.
- Nenhuma regressão nos filtros existentes (estado, cidade, perfil
  comportamental, experiência, skills, foto).
```

- [ ] **Step 2: Commit**

```bash
git add docs/prds/PRD-093-match-scoring-server-side-e-paginacao-banco-talentos.md
git commit -m "docs: add PRD-093 for future match-scoring server-side migration"
```

---

### Task 9: Criar issue no GitHub referenciando o PRD-093

**Pré-requisito:** Task 8 commitada (o link do arquivo no GitHub só funciona depois do push).

- [ ] **Step 1: Confirmar o remote e abrir a issue**

```bash
gh issue create \
  --title "Match scoring no Banco de Talentos deveria rodar no servidor (paginação real)" \
  --body "$(cat <<'EOF'
## Contexto

Ao investigar por que o Banco de Talentos (`/empresa/candidatos`) e o Dashboard
admin mostravam só 1000 candidatos (ver commits desta branch), ficou claro que
o motor de match (`calculateMatchBreakdown`, `src/lib/matchCalculator.ts`) roda
inteiramente no navegador e por isso essas duas telas precisam do dataset
completo de candidatos/vagas/candidaturas em memória para ordenar por match.

A correção imediata (já mergeada) trocou o fetch de `pageSize: 1000` fixo por
uma busca que traz o total real (sem teto arbitrário) — o vazamento de dados
está resolvido, mas a paginação real no servidor continua bloqueada até o
algoritmo de match ser portado para SQL/RPC.

## O que precisa ser feito

Documentação completa em [`docs/prds/PRD-093-match-scoring-server-side-e-paginacao-banco-talentos.md`](../blob/main/docs/prds/PRD-093-match-scoring-server-side-e-paginacao-banco-talentos.md).

Resumo:
- [ ] Portar `calculateMatchBreakdown` para uma function/RPC do Postgres (ou Edge Function)
- [ ] Coordenar com a branch `dreamy-dirac` (pesos de match / PRD-092) antes de iniciar, para não duplicar/divergir a fórmula
- [ ] Banco de Talentos: paginação real no servidor, inclusive ordenando por match
- [ ] Dashboard admin: seção de match ("Taxa de Match", "Vagas com poucos candidatos de alto match") deixa de depender de fetch-all

## Prioridade

Não bloqueia nada hoje (o bug de dados sumindo já foi corrigido), mas a
performance/escalabilidade do Banco de Talentos vai piorar conforme a base de
candidatos crescer, já que cada carregamento busca todos os candidatos.
EOF
)"
```

- [ ] **Step 2: Guardar o número da issue retornado para referência**

Anotar o número/URL da issue retornada pelo comando acima (será usado ao reportar a conclusão desta tarefa ao usuário).

---

### Task 10: Verificação final

- [ ] **Step 1: Build completo**

Run: `npm run build`
Expected: build sem erros.

- [ ] **Step 2: Lint completo**

Run: `npm run lint`
Expected: sem erros novos (podem já existir warnings pré-existentes no projeto — não introduzir novos).

- [ ] **Step 3: Testes unitários**

Run: `npm run test`
Expected: todos passam, incluindo os 2 novos testes de `fetchAllPages`.

- [ ] **Step 4: Confirmação final via SQL**

```sql
-- Deve bater com o total real de candidatos (1033 na investigação original,
-- pode ter crescido desde então — o importante é que os dois números batam).
SELECT count(*) FROM public.candidates;
```

Comparar com o badge "candidatos" do Dashboard e da Gestão de Candidatos no navegador — devem ser iguais.

- [ ] **Step 5: Checklist de regressão manual (CLAUDE.md — "completeness checklist")**

Reconfirmar no navegador, como admin e como empresa:
- [ ] `/admin` — 4 cards de estatística corretos, gráfico de crescimento renderiza, "Top Empresas"/"Empresas Recentes" corretos.
- [ ] `/admin/candidatos` — todos os filtros funcionam (status, busca, teste, perfil comportamental, origem), paginação avança até a última página, badge de contadores bate com o total real.
- [ ] `/empresa/candidatos` (Banco de Talentos) — nenhum candidato falta, filtros e ordenação por match continuam funcionando como antes.
- [ ] Ações do drawer de candidato (Desativar/Reativar/Resetar Teste/Notificar) continuam com o mesmo comportamento de antes (otimista local, sem persistir — bug pré-existente, não regredido nem corrigido nesta tarefa).
