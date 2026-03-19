-- Migration 062: Fix duplicate invitations + add constraints
-- PRD-087: Convites Duplicados, Link Indisponivel e Rastreabilidade
--
-- Steps:
--   1a. Expire duplicate pending invitations (keep most recent per team_member_id + test_id)
--   1b. Expire duplicate completed invitations (keep most recent per team_member_id + test_id)
--   1c. Backfill assessment_id on completed invitations via candidate link
--   1d. Clean invalid assessment_id values + add FK constraint
--   1e. Add partial UNIQUE index to prevent future duplicates

BEGIN;

-- =========================================================================
-- 1a. Expire pending duplicates where a completed invitation already exists
-- =========================================================================
UPDATE public.test_invitations ti
SET status = 'expired',
    updated_at = NOW()
WHERE ti.team_member_id IS NOT NULL
  AND ti.status IN ('sent', 'viewed', 'started')
  AND EXISTS (
    SELECT 1
    FROM public.test_invitations ti2
    WHERE ti2.team_member_id = ti.team_member_id
      AND ti2.test_id = ti.test_id
      AND ti2.id != ti.id
      AND ti2.status = 'completed'
  );

-- =========================================================================
-- 1b. Expire duplicate pending invitations where NO completed exists
--     Keep only the most recent pending per (team_member_id, test_id)
-- =========================================================================
UPDATE public.test_invitations ti
SET status = 'expired',
    updated_at = NOW()
WHERE ti.team_member_id IS NOT NULL
  AND ti.status IN ('sent', 'viewed', 'started')
  AND ti.id NOT IN (
    SELECT DISTINCT ON (sub.team_member_id, sub.test_id) sub.id
    FROM public.test_invitations sub
    WHERE sub.team_member_id IS NOT NULL
      AND sub.status IN ('sent', 'viewed', 'started')
    ORDER BY sub.team_member_id, sub.test_id, sub.sent_at DESC NULLS LAST
  );

-- =========================================================================
-- 1c. Expire duplicate completed invitations
--     Keep only the most recent completed per (team_member_id, test_id)
-- =========================================================================
UPDATE public.test_invitations ti
SET status = 'expired',
    updated_at = NOW()
WHERE ti.team_member_id IS NOT NULL
  AND ti.status = 'completed'
  AND ti.id NOT IN (
    SELECT DISTINCT ON (sub.team_member_id, sub.test_id) sub.id
    FROM public.test_invitations sub
    WHERE sub.team_member_id IS NOT NULL
      AND sub.status = 'completed'
    ORDER BY sub.team_member_id, sub.test_id, sub.completed_at DESC NULLS LAST
  );

-- =========================================================================
-- 1d. Backfill assessment_id on completed invitations
--     Match via: invitation -> team_member -> candidate (imported_from_candidate_id) -> assessment
--     Use closest temporal match (completed_at proximity)
-- =========================================================================
UPDATE public.test_invitations ti
SET assessment_id = sub.assessment_id
FROM (
  SELECT DISTINCT ON (ti_inner.id)
    ti_inner.id AS invitation_id,
    gpa.id AS assessment_id
  FROM public.test_invitations ti_inner
  JOIN public.team_members tm ON tm.id = ti_inner.team_member_id
  JOIN public.candidates c ON c.id = tm.imported_from_candidate_id
  JOIN public.gauge_pro_assessments gpa ON gpa.candidate_id = c.id
  WHERE ti_inner.status = 'completed'
    AND ti_inner.assessment_id IS NULL
    AND ti_inner.team_member_id IS NOT NULL
    AND tm.imported_from_candidate_id IS NOT NULL
    AND gpa.phase = 'completed'
  ORDER BY ti_inner.id,
    ABS(EXTRACT(EPOCH FROM (COALESCE(gpa.completed_at, gpa.started_at) - COALESCE(ti_inner.completed_at, ti_inner.updated_at))))
) sub
WHERE ti.id = sub.invitation_id;

-- =========================================================================
-- 1e. Clean invalid assessment_id values before adding FK
-- =========================================================================
UPDATE public.test_invitations
SET assessment_id = NULL
WHERE assessment_id IS NOT NULL
  AND assessment_id NOT IN (SELECT id FROM public.gauge_pro_assessments);

-- =========================================================================
-- 1f. Add FK constraint: assessment_id -> gauge_pro_assessments(id)
-- =========================================================================
ALTER TABLE public.test_invitations
  ADD CONSTRAINT fk_test_invitations_assessment
  FOREIGN KEY (assessment_id)
  REFERENCES public.gauge_pro_assessments(id)
  ON DELETE SET NULL;

-- =========================================================================
-- 1g. Add partial UNIQUE index to prevent future duplicate active invitations
-- =========================================================================
CREATE UNIQUE INDEX idx_unique_active_invitation_per_member
  ON public.test_invitations (team_member_id, test_id)
  WHERE status IN ('sent', 'viewed', 'started')
    AND team_member_id IS NOT NULL;

COMMIT;
