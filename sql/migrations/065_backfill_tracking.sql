-- ============================================================================
-- Migration 065: PRD-089 — Backfill tracking chain for legacy data
-- ============================================================================

-- Backfill: Link invitation_id in gauge_pro_results via assessment_id chain
-- (for results that have matching assessment already linked to an invitation)
UPDATE public.gauge_pro_results r
SET invitation_id = ti.id
FROM public.test_invitations ti
WHERE ti.assessment_id = r.assessment_id
  AND ti.status = 'completed'
  AND r.invitation_id IS NULL;

-- Backfill: Link assessment_id in test_invitations via candidate_id + temporal proximity
-- For completed invitations that have no assessment_id yet
UPDATE public.test_invitations ti
SET assessment_id = matched.assessment_id
FROM (
  SELECT DISTINCT ON (ti2.id)
    ti2.id AS invitation_id,
    gpa.id AS assessment_id
  FROM public.test_invitations ti2
  JOIN public.gauge_pro_assessments gpa ON (
    (gpa.candidate_id IS NOT NULL AND gpa.candidate_id = ti2.candidate_id)
    OR (gpa.team_member_id IS NOT NULL AND gpa.team_member_id = ti2.team_member_id)
  )
  WHERE ti2.status = 'completed'
    AND ti2.assessment_id IS NULL
    AND gpa.phase = 'completed'
  ORDER BY ti2.id, ABS(EXTRACT(EPOCH FROM (COALESCE(gpa.completed_at, gpa.started_at) - ti2.completed_at)))
) matched
WHERE ti.id = matched.invitation_id;

-- Second pass: now link invitation_id in gauge_pro_results for newly matched assessments
UPDATE public.gauge_pro_results r
SET invitation_id = ti.id
FROM public.test_invitations ti
WHERE ti.assessment_id = r.assessment_id
  AND ti.status = 'completed'
  AND r.invitation_id IS NULL;

-- Backfill: Link result_id in ai_analyses via test_result_id (text -> uuid)
UPDATE public.ai_analyses aa
SET result_id = gpr.id
FROM public.gauge_pro_results gpr
WHERE aa.test_result_id = gpr.id::text
  AND aa.result_id IS NULL;
