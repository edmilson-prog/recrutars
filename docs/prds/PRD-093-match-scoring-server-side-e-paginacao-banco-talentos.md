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
