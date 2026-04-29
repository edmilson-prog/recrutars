# Handoff — Migração de Localização de Vagas (texto livre → city/state estruturados)

**Data:** 2026-04-29
**Branch:** `dreamy-dirac`
**Origem:** sessão anterior travou no MCP do Supabase (sem permissão na organização do projeto Recrutars). Continuação deve ser feita em uma sessão com MCP funcionando.

---

## 1. Contexto e Problema

### O que o usuário relatou
> "no perfil da empresa, no cadastro de vagas, no campo localização, o usuário tem que preencher a localização manualmente, e isso ta gerando muita fricção e discrepância no match das vagas. o candidato, não tem esse campo livre pra preeencher, na verdade é dropdown com o estado, e outro dropdown com as cidades filtradas pelo estado escolhido. temos que mudar isso e migrar os dados preenchidos de forma livre para dados novos engessados."

### Causa-raiz da discrepância
- `jobs.location` é **TEXT livre** ("São Paulo, SP", "São Paulo - SP", "São Paulo/SP", "Sao Paulo")
- `candidates.city` + `candidates.state` são **estruturados** (dropdowns + IBGE)
- Algoritmo de match em [src/lib/matchCalculator.ts](../../../src/lib/matchCalculator.ts) fazia `loc.split(',')` esperando formato canônico "Cidade, Estado" — qualquer variação derruba o score (`sameCity` falsa-negativa)

### Estratégia adotada (Opção A — aditiva e reversível)
1. Adicionar `city TEXT` e `state CHAR(2)` na tabela `jobs`
2. Manter `location TEXT` sincronizado via trigger SQL (`location = "city, state"`) para retrocompat com **20 leitores** que ainda consomem `job.location` como string
3. Backfill SQL parseando legacy
4. UI passa a usar dropdowns Estado→Cidade
5. Match usa dados estruturados quando disponíveis, com fallback ao parser legado

---

## 2. Status — O que JÁ foi feito ✅

### Schema (arquivo pronto, **falta APLICAR**)

📄 [sql/migrations/081_jobs_city_state.sql](../../../sql/migrations/081_jobs_city_state.sql)

Conteúdo:
- `ALTER TABLE jobs ADD COLUMN city TEXT, state CHAR(2)`
- CHECK constraint nas 27 UFs IBGE válidas
- Função `parse_legacy_location(text)` — parser robusto: vírgula, hífen `\s-\s`, barra `/`, pipe `|`
- `UPDATE` de backfill em todas as linhas existentes
- Trigger `sync_jobs_location` (`BEFORE INSERT/UPDATE OF city, state`) que sincroniza `location = "city, state"` quando ambos preenchidos
- Index parcial `idx_jobs_state_city` (state, city) WHERE state IS NOT NULL
- Bloco DO com `RAISE NOTICE` reportando contagem do backfill

### Types

📄 [src/types/job.ts](../../../src/types/job.ts) — adicionado:
```ts
state?: string;   // UF brasileira (2 letras)
city?: string;    // Cidade
```

📄 [src/types/database.ts:1959](../../../src/types/database.ts:1959) — adicionado `city: string | null` e `state: string | null` em `jobs.Row`, `Insert`, `Update`. **Atenção:** se a próxima sessão regerar types via `supabase gen types`, isso será sobrescrito pelos campos reais — OK, fica idêntico.

### Service

📄 [src/services/jobs/jobsService.supabase.ts](../../../src/services/jobs/jobsService.supabase.ts)
- `jobRowToJob()`: mapeia `row.city` → `Job.city`, `row.state` → `Job.state` (com cast pontual)
- `createJob()`: insere `city: job.city ?? null` e `state: job.state ?? null`
- `updateJob()`: inclui no `updatePayload` se vierem definidos
- `jobRowToAdminJob()` **NÃO** foi atualizado — admin ainda usa só `location` para display, sem prejuízo

### Formulário (UI da empresa)

📄 [src/components/empresa/job-form/JobFormBasicInfo.tsx](../../../src/components/empresa/job-form/JobFormBasicInfo.tsx) — **reescrito**:
- Substituiu `<Input id="location">` por **2 selects shadcn em cascata**
- Estado: dropdown ordenado alfabeticamente por nome completo (usa `STATE_NAMES`)
- Cidade: dropdown filtrado por UF, **disabled** até estado escolhido
- Trocar UF limpa cidade (evita combinação inválida)
- Label dinâmica: "Estado *" se `type !== 'remote'`, "Estado (opcional)" se remoto
- Importa `brazilianCitiesByState` de `@/data/brazilianCities`

### Hook

📄 [src/hooks/useJobForm.ts](../../../src/hooks/useJobForm.ts):
- `INITIAL_FORM_STATE`: `location: ''` → `state: '', city: ''`
- Helper `parseLegacyLocation()` (client-side fallback) — regex robusta igual à da migration SQL
- Constante `VALID_UFS` (27 UFs)
- `useEffect` de carregamento ao editar: prefere `state`/`city` estruturados; cai no parser se vazios
- `validate()`: `state`/`city` obrigatórios apenas quando `type !== 'remote'`
- `progress`: conta como "preenchido" se `type === 'remote' OU (state && city)`
- `handleApplySuggestion('location', value)`: usa `parseLegacyLocation` pra dividir sugestão da IA em state+city
- `handleSaveJob`: deriva `location = "${city}, ${state}"` ou `'Remoto'` (envia tudo: state, city, location)

### Hook auxiliar

📄 [src/hooks/useJobAnalyzer.ts](../../../src/hooks/useJobAnalyzer.ts) — `createJobFormData()`:
- Assinatura mudou: `formState.location: string` → `formState.state: string; formState.city: string`
- Internamente deriva `location` para passar pro analisador de IA (que espera string livre)

### Match (estrutura pronta — pesos pendentes)

📄 [src/lib/matchCalculator.ts](../../../src/lib/matchCalculator.ts):
- Nova interface `LocationInput { state?, city?, location? }` exportada
- Função `resolveCityState(input)` — extrai `{city, state}` preferindo estruturados, com fallback ao parse legado
- `calculateLocationScore(candidate, job, jobType)` agora aceita `LocationInput | string` (compat) nos dois primeiros args
- Comparações usam UFs canônicas (CHAR(2)) — discrepância de formato eliminada
- Helper `_normalizeLoc()` para acentos (preservado)
- Chamada interna em `calculateMatch` (linha ~662) atualizada para passar `{ city, state, location }` dos dois lados

**⚠️ TODO(human) pendente em [src/lib/matchCalculator.ts:354](../../../src/lib/matchCalculator.ts:354)** — ver seção 3.3 abaixo.

---

## 3. Status — O que FALTA fazer ❌

### 3.1. Aplicar a migration 081 no Supabase ⚠️ BLOQUEADOR

**Projeto Supabase:** `filackbesialiapjwijb`

**Por que travou:** o MCP da sessão anterior (token AILA-org `ivghwqplzylonfqdkbaq`) não tem permissão nesse projeto, que vive em outra organização Supabase.

**Como aplicar (escolha uma):**

```ts
// Via MCP — preferido se você tem token com acesso à org do Recrutars
mcp__supabase__apply_migration({
  project_id: "filackbesialiapjwijb",
  name: "jobs_city_state",
  query: <conteúdo de sql/migrations/081_jobs_city_state.sql>
})
```

Após aplicar, **conferir o NOTICE do backfill** (quantas vagas foram resolvidas vs. não-resolvidas). Vagas com `state IS NULL` após a migration são strings de localização não-parseáveis ("Brasil", "Remoto", "Trabalho de casa") — admin pode revisar manualmente depois.

**Verificar com:**
```sql
SELECT
  COUNT(*) FILTER (WHERE location IS NOT NULL) AS total,
  COUNT(*) FILTER (WHERE state IS NOT NULL)    AS resolved,
  COUNT(*) FILTER (WHERE location IS NOT NULL AND state IS NULL) AS unresolved
FROM public.jobs;
```

Listar não-resolvidas (úteis pro time olhar):
```sql
SELECT id, title, location FROM public.jobs
WHERE location IS NOT NULL AND state IS NULL
ORDER BY created_at DESC LIMIT 20;
```

### 3.2. Filtros de busca de vagas

📄 [src/hooks/useJobSearchFilters.ts](../../../src/hooks/useJobSearchFilters.ts) — atualmente expõe `locationFilter: string` como dropdown de strings distintas (de `getJobLocations()`).

📄 [src/pages/candidato/JobSearch.tsx:287](../../../src/pages/candidato/JobSearch.tsx:287) — Select com `setLocationFilter` (string única).

**O que fazer:**
1. Adicionar `stateFilter: string` + `cityFilter: string` no hook (mantendo `locationFilter` legado pra não quebrar admin)
2. Adicionar 2 dropdowns Estado→Cidade em cascata na UI de busca, padrão idêntico ao do form de vaga
3. No filtro client-side da `JobSearch.tsx:211` (`matchesLocation = ... job.location.includes(locationFilter)`), trocar por:
   ```ts
   const matchesState = stateFilter === 'all' || job.state === stateFilter;
   const matchesCity  = cityFilter  === 'all' || job.city  === cityFilter;
   ```
4. (Opcional) Adicionar método `getJobStates()` + `getJobCities(state)` no service em vez do `getJobLocations()`

📄 [src/services/jobs/jobsService.ts:37](../../../src/services/jobs/jobsService.ts) e `.supabase.ts:382` — `getJobLocations()` continua funcionando porque o trigger mantém `location` populado.

### 3.3. TODO(human) — Tabela de pesos do match score

📄 [src/lib/matchCalculator.ts:354](../../../src/lib/matchCalculator.ts:354)

**Estado atual:** estrutura pronta, mas o bloco de score retorna `50` placeholder.

```ts
// Variáveis booleanas já calculadas:
//   - sameCity:  candidato e vaga na mesma cidade
//   - sameState: mesmo estado, cidade diferente
//   - cityOnly:  faltou UF de algum lado, só dá pra comparar cidade
//   - jobType:   'hybrid' | 'onsite'  (remote já retornou 100 antes)
const score: number = (() => {
  // ⬇️ AGUARDANDO IMPLEMENTAÇÃO HUMANA
  void sameCity; void sameState; void cityOnly;
  return 50;
})();
```

**Decisão pendente do usuário** (Edmilson) — é decisão de produto, não de engenharia. Sugestão compatível com o algoritmo antigo (use como ponto de partida e ajuste se quiser):

| Cenário                          | onsite | hybrid |
|----------------------------------|--------|--------|
| `sameCity`                       | 100    | 100    |
| `sameState` (cidade ≠)           | 70     | 85     |
| Estado diferente                 | 30     | 50     |
| `cityOnly` + cidade igual        | 100    | 100    |
| `cityOnly` + cidade diferente    | 30     | 50     |

Pergunta a fazer ao usuário: "esses pesos atendem o seu produto, ou quer ajustar (ex.: penalizar mais `cityOnly` por ser dado incompleto)?"

### 3.4. Verificação final

Depois de tudo aplicado:

1. **Lint:** `npm run lint` — não deve introduzir erros nos arquivos tocados (warnings pré-existentes em outros arquivos podem ser ignorados)
2. **Dev server:** `npm run dev` (porta 8080 segundo CLAUDE.md, ou 3000 se SessionStart hook iniciou)
3. **Browser:**
   - `/empresa/vagas/criar` → criar vaga onsite com SP/São Paulo → conferir que salva com `city`/`state` no DB
   - `/empresa/vagas/:id/editar` → abrir vaga LEGADA (criada antes da migration) → conferir que dropdowns vêm pré-preenchidos via fallback parser
   - `/empresa/vagas/criar` → tipo "Remoto" → estado/cidade devem ficar opcionais e validação passar mesmo sem preencher
   - `/candidato/vagas` → vaga aparece com `<MapPin>` exibindo location derivada
   - Match: candidato com `state='SP', city='São Paulo'` aplicando em vaga com mesmos valores → score de localização deve ser 100
4. **DB sanity check:**
   ```sql
   SELECT id, title, location, city, state, type
   FROM public.jobs
   ORDER BY created_at DESC LIMIT 10;
   ```
   Toda vaga com `city` e `state` preenchidos deve ter `location = "city, state"` (sincronizado pelo trigger).

---

## 4. Arquivos modificados (relação completa)

```
sql/migrations/081_jobs_city_state.sql                       NOVO
src/types/job.ts                                             +city?,+state?
src/types/database.ts                                        +city,+state em jobs (Row/Insert/Update)
src/services/jobs/jobsService.supabase.ts                    mapper, create, update
src/components/empresa/job-form/JobFormBasicInfo.tsx         REESCRITO (2 dropdowns cascade)
src/hooks/useJobForm.ts                                      state/city no formData + fallback parsing
src/hooks/useJobAnalyzer.ts                                  createJobFormData assinatura
src/lib/matchCalculator.ts                                   refator estrutural — falta TODO(human)
docs/superpowers/specs/2026-04-29-jobs-city-state-migration.md   ESTE ARQUIVO
```

---

## 5. Notas técnicas / gotchas

- **Retrocompatibilidade dos 20 leitores de `job.location`:** o trigger SQL `sync_jobs_location` garante que `location` continua populado como `"Cidade, UF"`. Nenhum arquivo da camada de display foi tocado e tudo continua funcionando.
- **`Job.location` no tipo TS continua como `string`** (não opcional) — sempre vem do trigger ou do hook (que deriva no save). Não foi alterado.
- **Vagas remotas:** podem ter `city`/`state` (escritório-base) OU vir vazias. `validate()` só exige se `type !== 'remote'`. No save, `derivedLocation = 'Remoto'` se ambos vazios.
- **Parser legado idempotente:** rodar a migration de novo após backfill não muda nada porque `WHERE city IS NULL OR state IS NULL` filtra. Trigger é idempotente também.
- **Acentos:** `parse_legacy_location` SQL não normaliza acentos antes de detectar UF (UF é sempre ASCII-only, então não precisa). Mas o nome da cidade é preservado **com acentos** no banco — bom pro display.
- **CHECK constraint pode falhar** se houver lixo histórico tipo `state = 'XX'`. Backfill sempre seta UFs válidas, mas se alguma migration futura inserir lixo, vai estourar — é o comportamento desejado.
- **Index parcial** `idx_jobs_state_city WHERE state IS NOT NULL` — vagas remotas sem state não pesam no índice.
- **Padrão de UI:** os dropdowns seguem exatamente o pattern de [src/components/admin/users/CandidateProfileFields.tsx](../../../src/components/admin/users/CandidateProfileFields.tsx) e [src/pages/candidato/OnboardingPersonalProfile.tsx](../../../src/pages/candidato/OnboardingPersonalProfile.tsx) — reutilizando `brazilianCitiesByState` de `@/data/brazilianCities`. Consistência mantida.

---

## 6. Plano de execução pra próxima sessão

```
1. Ler este documento inteiro.
2. Aplicar migration 081 via mcp__supabase__apply_migration.
3. Confirmar contagem de backfill (NOTICE no log).
4. Pedir ao usuário a tabela de pesos pro TODO(human) em matchCalculator.ts:354.
5. Implementar filtros (3.2).
6. Rodar lint, dev server, e verificar no browser (3.4).
7. Commit final com mensagem do tipo:
     feat: migrate job location from free text to structured city/state
8. Atualizar changelog (public/changelog.json) seguindo as regras do CLAUDE.md.
```

---

## 7. Credenciais / Ambiente

- **Projeto Supabase:** `filackbesialiapjwijb`
- **URL:** `https://filackbesialiapjwijb.supabase.co` (em `.env`)
- **Branch atual:** `dreamy-dirac`
- **Working directory:** `D:\claude\recrutars-maike`
- **Dev server:** porta 3000 (SessionStart hook iniciou) ou 8080 (CLAUDE.md padrão)

---

**Fim do handoff.** Em caso de dúvida sobre o porquê de uma decisão, consulte o histórico do plano da Fase 2 (aprovado pelo usuário antes da implementação) — está implícito nos arquivos e nesta seção 1.
