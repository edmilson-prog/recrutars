# Spec: Aba IA com Accordion de Analises por Teste

**Date:** 2026-03-18
**Status:** Approved
**Scope:** `MemberProfile.tsx` (aba IA) + `storageService.ts`

## Problem

The IA tab in the collaborator profile tries to show AI analysis filtered by the selected test in the timeline, but localStorage cache always returns the oldest analysis. Multiple fix attempts failed because the dual-write pattern (localStorage + Supabase) always falls back to the candidate-level cache.

## Solution

Replace the per-test filtering approach with a simple "show everything" design:

1. Fetch ALL AI analyses for the candidate from Supabase
2. Group by `test_result_id`
3. Display as a Radix Accordion (component already exists in the project)
4. Most recent test open by default, others collapsed
5. IA tab becomes independent of the timeline selector

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Layout | Accordion per test | Compact, expandable, familiar UX pattern |
| Order | Most recent first, open | User cares most about latest result |
| No analysis | Show item + "Gerar Analise" button | Gives user control to generate on demand |
| Timeline coupling | Independent | Eliminates the cache/filter bug entirely |

## Data Flow

```
ai_analyses table
    |
    v
loadAllAnalysesFromSupabase(candidateId)
    |  - SELECT * WHERE candidate_id = X ORDER BY created_at DESC
    |  - Group rows by test_result_id
    |  - Return AIAnalysisResult[]
    v
MemberProfile IA tab (useQuery)
    |
    v
Accordion (Radix)
    |-- AccordionItem (test 3 - Atual) [open]
    |     |-- renderAnalysisContent(practical)
    |     |-- renderAnalysisContent(technical)
    |-- AccordionItem (test 2) [collapsed]
    |-- AccordionItem (test 1) [collapsed]
    v
AIRecommendationsTab (still tied to selected test)
```

## Files Changed

| File | Change |
|------|--------|
| `src/lib/aiAgent/storageService.ts` | Add `loadAllAnalysesFromSupabase()` |
| `src/components/team-management/MemberProfile.tsx` | Replace IA tab content with accordion |

## What Does NOT Change

- `PracticalAnalysisCard`, `TechnicalAnalysisCard` (used elsewhere)
- `useAIAnalysis` hook (used by candidate GaugeProResult page)
- Other tabs (Visao Geral, Competencias, Respostas)
- `AIRecommendationsTab` (kept, tied to selected test)

## Verification

- Open collaborator profile with multiple tests
- IA tab shows accordion with all tests
- Most recent open by default
- Correct dates and "Atual" badge
- Analysis content renders properly
- Test without analysis shows "Gerar Analise" button
- Other tabs unaffected
