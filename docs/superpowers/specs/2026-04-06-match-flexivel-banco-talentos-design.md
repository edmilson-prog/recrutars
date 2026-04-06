# Match Flexível no Banco de Talentos

**Data:** 2026-04-06
**Status:** Aprovado
**Versão alvo:** a definir no plano de implementação

---

## Contexto

Atualmente, o match score no Banco de Talentos (lista e detalhamento) é calculado automaticamente contra a **primeira vaga ativa** da empresa (`jobs[0]`). Isso gera confusão — se a primeira vaga é "Costureira", todos os candidatos mostram "Match com Costureira" sem possibilidade de trocar. A empresa precisa poder **escolher contra qual vaga comparar** os candidatos, e ver como cada candidato se encaixa em **diferentes vagas** simultaneamente.

---

## Escopo

### Tela 1: Lista do Banco de Talentos (`/empresa/candidatos`)

**Seletor global de vaga:**
- Dropdown "Comparar com:" posicionado entre a área de filtros/stats e a lista de resultados
- Componente: `Select` do shadcn (< 8 vagas) ou `Popover` + `Command` combobox (8+ vagas)
- Opção padrão: "Melhor match (todas as vagas)" — mostra o maior score entre todas as vagas ativas para cada candidato
- Ao selecionar uma vaga específica, todos os cards recalculam os scores e a lista reordena
- Texto informativo atualiza: "127 candidatos · ordenados por melhor match" ou "...por match com Costureira"

**Mini barras multi-vaga nos cards:**
- Cada card de candidato exibe mini barras horizontais mostrando o score de cada vaga
- Máximo de 3 vagas visíveis; se houver mais, mostrar "+N vagas" como link expandível
- **Modo "Todas as vagas":** Ring mostra o melhor score com label "Melhor". Barras ordenadas por score decrescente. A melhor vaga destacada com borda e texto verde
- **Modo vaga específica:** Ring mostra o score daquela vaga com label do nome da vaga. A barra da vaga selecionada fica destacada com borda e ícone
- Ordenação da lista sempre pelo score exibido no ring

**Navegação lista → detalhe:**
- "Ver perfil" passa a vaga selecionada via query param `?jobId=<id>`
- Se "Todas as vagas" estiver selecionado, passa a vaga com melhor score para aquele candidato

### Tela 2: Detalhamento do Candidato (`/empresa/candidatos/:id`)

**Seletor de vaga híbrido (sidebar de match):**
- **≤5 vagas ativas:** Pills horizontais com score visível (ex: `Costureira 82%` | `Atendente 49%`)
  - Usa Radix `Tabs` com `role="tablist"` e navegação por setas
  - Pill ativa: fundo azul, texto branco, bold
  - Pills inativas: fundo escuro, borda sutil, texto cinza
  - Touch target mínimo: `min-h-[44px] px-4`
- **6+ vagas ativas:** Dropdown com score na label (ex: "Costureira — 82%")
  - Componente: `Select` do shadcn
- **0 vagas ativas:** Empty state "Nenhuma vaga ativa para comparar" com botão "Criar vaga"

**Donut + Breakdown dinâmico:**
- O `MatchScoreCircle` (donut) e o `MatchBreakdown` (barras de Skills, Experiência, Comportamental, Localização) atualizam ao trocar de vaga
- Título dinâmico: "Match com {vaga.title}"
- `MatchStrengths` e `MatchOpportunities` também recalculam por vaga

**Card "Comparativo entre vagas":**
- Novo card separado abaixo do breakdown
- Barras horizontais mostrando o score total de cada vaga, ordenadas por score
- A vaga ativa fica destacada (borda azul, nome bold)
- Clicar em uma barra troca a pill/dropdown ativa (navegação secundária)

**Estado inicial:**
- Se URL tem `?jobId=`, seleciona essa vaga
- Senão, seleciona a vaga com melhor score (consistente com o modo padrão da lista)

---

## Componentes

### Novos componentes a criar

| Componente | Arquivo | Descrição |
|---|---|---|
| `JobMatchSelector` | `src/components/match/JobMatchSelector.tsx` | Dropdown global para a lista. Props: `jobs`, `selectedJobId`, `onJobChange`. Opções: "best" + cada vaga ativa |
| `JobMatchTabs` | `src/components/match/JobMatchTabs.tsx` | Pills/dropdown híbrido para o detalhe. Props: `jobs`, `selectedJobId`, `onJobChange`, `matchScores`. Auto-switch pills↔dropdown no threshold de 5 vagas |
| `MatchOverviewChart` | `src/components/match/MatchOverviewChart.tsx` | Barras comparativas entre vagas. Props: `jobScores: {jobId, title, score}[]`, `activeJobId`, `onJobClick` |

### Componentes existentes a modificar

| Componente | Arquivo | Mudança |
|---|---|---|
| `MatchRing` (inline) | `src/pages/empresa/Candidates.tsx` | Adicionar prop `jobLabel` para texto embaixo do ring |
| `MatchBreakdown` | `src/components/match/MatchBreakdown.tsx` | Aceitar `title` dinâmico (já aceita) |

### Páginas a modificar

| Página | Arquivo | Mudanças |
|---|---|---|
| Lista de candidatos | `src/pages/empresa/Candidates.tsx` | Adicionar `selectedJobId` state. Integrar `JobMatchSelector`. Refatorar `calculateMatch` para aceitar job específico ou calcular best. Adicionar mini barras multi-vaga nos cards. Passar `jobId` na navegação |
| Detalhe do candidato | `src/pages/empresa/CandidateProfile.tsx` | Adicionar `selectedMatchJobId` state. Integrar `JobMatchTabs`. Integrar `MatchOverviewChart`. Calcular scores de todas as vagas. Wrapper com `AnimatePresence` |

---

## Lógica de cálculo

### Lista — Modo "Melhor match (todas as vagas)"
```
Para cada candidato:
  Para cada vaga ativa da empresa:
    score = calculateMatchBreakdown(candidato, vaga, idealProfile, candidateProfile).totalScore
  bestScore = max(scores)
  bestJob = vaga correspondente ao bestScore
  Exibir: ring=bestScore, barras=todas as vagas ordenadas por score
```

### Lista — Modo vaga específica
```
Para cada candidato:
  selectedScore = calculateMatchBreakdown(candidato, vagaSelecionada, ...).totalScore
  Exibir: ring=selectedScore, barras=todas (selecionada destacada)
```

### Detalhe
```
Para cada vaga ativa da empresa:
  matchResults[vagaId] = calculateMatchBreakdown(candidato, vaga, idealProfile, candidateProfile)
Exibir: pills/dropdown com scores, donut/breakdown da vaga ativa, comparativo de todas
```

### Performance
- O cálculo `calculateMatchBreakdown` é client-side e leve (~1ms por par candidato-vaga)
- Lista com 100 candidatos × 5 vagas = 500 cálculos ≈ 500ms — aceitável
- Usar `useMemo` para cachear resultados por `[candidatos, vagas, gaugeResults]`
- Para listas muito grandes (1000+), considerar calcular apenas candidatos visíveis (virtualização futura)

---

## Animações

- **Donut (detalhe):** Re-key com `key={selectedJobId}` para re-trigger da animação de stroke existente no `MatchScoreCircle`
- **Breakdown barras:** Re-key para re-trigger do stagger animation existente
- **Strengths/Opportunities:** `AnimatePresence mode="wait"` com crossfade (opacity + translateY 8px)
- **Pills indicator:** `motion.div` com `layoutId="activeJobTab"` para sliding highlight
- **Lista — Ring score:** Transição CSS no `strokeDashoffset` (200ms)
- **Lista — Reordenação:** `layout` prop do framer-motion nos cards (já parcialmente implementado)
- **Reduced motion:** Respeitar `prefers-reduced-motion` via hook `useReducedMotion` existente

---

## Acessibilidade

- `MatchRing` na lista: adicionar `role="img"` e `aria-label="Compatibilidade {score}% com {vaga}"`
- Breakdown area no detalhe: `aria-live="polite"` para anunciar mudanças ao trocar vaga
- Pills: Radix `Tabs` fornece `role="tablist"`, navegação por setas, `aria-selected`
- Touch targets das pills: mínimo `min-h-[44px]`
- Barras do comparativo: `role="button"` + `aria-label="Ver match com {vaga}: {score}%"`
- Todas as barras coloridas incluem valor textual (percentual) — não dependem só de cor

---

## Responsividade

### Lista
- **lg+:** Dropdown inline ao lado do results count. Mini barras visíveis nos cards
- **< md:** Dropdown full-width acima dos sort controls. Mini barras colapsam — toque no ring abre tooltip com scores de todas as vagas

### Detalhe
- **sm+:** Pills horizontais com `flex-wrap` (≤5 vagas) ou dropdown
- **< sm:** Sempre dropdown (independente da quantidade). Comparativo com barras compactas

---

## Estados especiais

| Estado | Comportamento |
|---|---|
| 0 vagas ativas | Lista: sem dropdown, sem barras, ring mostra "—". Detalhe: empty state com CTA "Criar vaga" |
| 1 vaga ativa | Lista: dropdown com "Melhor match" + 1 vaga (mesmos scores). Detalhe: sem pills/dropdown, layout atual (vaga fixa) |
| Candidato sem teste Gauge-Pro | Score comportamental = 20% (fallback existente). Ring e barras funcionam normalmente |
| Candidato sem skills | Score de skills = 0%. Barras funcionam normalmente |

---

## Arquivos críticos

```
src/pages/empresa/Candidates.tsx          — Lista (principal modificação)
src/pages/empresa/CandidateProfile.tsx    — Detalhe (principal modificação)
src/lib/matchCalculator.ts                — Engine de cálculo (sem mudança)
src/lib/behavioralProfiles.ts             — Perfis ideais (sem mudança)
src/components/match/MatchBreakdown.tsx    — Breakdown existente (sem mudança)
src/components/match/MatchScoreCircle.tsx  — Donut existente (sem mudança)
src/components/match/MatchStrengths.tsx    — Strengths existente (sem mudança)
src/components/match/MatchOpportunities.tsx — Opportunities existente (sem mudança)
src/components/match/JobMatchSelector.tsx  — NOVO
src/components/match/JobMatchTabs.tsx      — NOVO
src/components/match/MatchOverviewChart.tsx — NOVO
src/hooks/useJobsQuery.ts                 — Hook existente (reutilizar)
```
