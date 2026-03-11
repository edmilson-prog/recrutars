-- Migration: sync_archetype_to_team_members
-- Purpose: Create trigger to auto-sync archetype from test_results to team_members
--          and backfill existing data where archetype was NULL

-- 1. Trigger function: sync test_results → team_members on INSERT
CREATE OR REPLACE FUNCTION public.sync_test_result_to_team_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_member_id UUID;
BEGIN
  -- Only proceed if there's an invitation_id
  IF NEW.invitation_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Look up the team_member_id from test_invitations
  SELECT ti.team_member_id INTO v_team_member_id
  FROM public.test_invitations ti
  WHERE ti.id = NEW.invitation_id;

  -- If linked to a team member, sync archetype and scores
  IF v_team_member_id IS NOT NULL THEN
    UPDATE public.team_members
    SET archetype = COALESCE(NEW.archetype_id, archetype),
        gauge_scores = COALESCE(NEW.scores, gauge_scores),
        updated_at = NOW()
    WHERE id = v_team_member_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Create trigger on test_results
DROP TRIGGER IF EXISTS trg_sync_test_result_to_team_member ON public.test_results;

CREATE TRIGGER trg_sync_test_result_to_team_member
  AFTER INSERT ON public.test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_test_result_to_team_member();

-- 3. Backfill scenario 1: sync from test_results → team_members via test_invitations
UPDATE public.team_members tm
SET archetype = tr.archetype_id,
    gauge_scores = tr.scores,
    updated_at = NOW()
FROM public.test_results tr
JOIN public.test_invitations ti ON tr.invitation_id = ti.id
WHERE ti.team_member_id = tm.id
  AND tm.archetype IS NULL
  AND tr.archetype_id IS NOT NULL;

-- 4. Backfill scenario 2: compute archetype from gauge_scores using primary+secondary fallback
-- Classification thresholds: low=0-33, medium=34-66, high=67-100
-- Uses the same fallback map as determineArchetype() in TypeScript
WITH classified AS (
  SELECT
    id,
    gauge_scores,
    CASE WHEN (gauge_scores->>'D1')::int <= 33 THEN 'low'
         WHEN (gauge_scores->>'D1')::int <= 66 THEN 'medium'
         ELSE 'high' END AS d1_class,
    CASE WHEN (gauge_scores->>'D2')::int <= 33 THEN 'low'
         WHEN (gauge_scores->>'D2')::int <= 66 THEN 'medium'
         ELSE 'high' END AS d2_class,
    CASE WHEN (gauge_scores->>'D3')::int <= 33 THEN 'low'
         WHEN (gauge_scores->>'D3')::int <= 66 THEN 'medium'
         ELSE 'high' END AS d3_class,
    CASE WHEN (gauge_scores->>'D4')::int <= 33 THEN 'low'
         WHEN (gauge_scores->>'D4')::int <= 66 THEN 'medium'
         ELSE 'high' END AS d4_class,
    CASE WHEN (gauge_scores->>'D5')::int <= 33 THEN 'low'
         WHEN (gauge_scores->>'D5')::int <= 66 THEN 'medium'
         ELSE 'high' END AS d5_class,
    (SELECT dim FROM (VALUES
      ('D1', (gauge_scores->>'D1')::int),
      ('D2', (gauge_scores->>'D2')::int),
      ('D3', (gauge_scores->>'D3')::int),
      ('D4', (gauge_scores->>'D4')::int),
      ('D5', (gauge_scores->>'D5')::int)
    ) AS dims(dim, score) ORDER BY score DESC LIMIT 1) AS primary_dim,
    (SELECT dim FROM (VALUES
      ('D1', (gauge_scores->>'D1')::int),
      ('D2', (gauge_scores->>'D2')::int),
      ('D3', (gauge_scores->>'D3')::int),
      ('D4', (gauge_scores->>'D4')::int),
      ('D5', (gauge_scores->>'D5')::int)
    ) AS dims(dim, score) ORDER BY score DESC LIMIT 1 OFFSET 1) AS secondary_dim
  FROM public.team_members
  WHERE archetype IS NULL
    AND gauge_scores IS NOT NULL
    AND gauge_status = 'mapped'
),
resolved AS (
  SELECT
    id,
    CASE
      WHEN d1_class = 'medium' AND d2_class = 'medium' AND d3_class = 'medium' AND d4_class = 'medium' AND d5_class = 'medium' THEN 'versatile'
      WHEN primary_dim = 'D1' AND secondary_dim = 'D4' THEN 'commander'
      WHEN primary_dim = 'D1' AND secondary_dim = 'D2' THEN 'influencer'
      WHEN primary_dim = 'D1' AND secondary_dim = 'D3' THEN 'agile_executor'
      WHEN primary_dim = 'D1' AND secondary_dim = 'D5' THEN 'captain'
      WHEN primary_dim = 'D2' AND secondary_dim = 'D5' THEN 'counselor'
      WHEN primary_dim = 'D2' AND secondary_dim = 'D1' THEN 'influencer'
      WHEN primary_dim = 'D2' AND secondary_dim = 'D4' THEN 'facilitator'
      WHEN primary_dim = 'D2' AND secondary_dim = 'D3' THEN 'promoter'
      WHEN primary_dim = 'D3' AND secondary_dim = 'D4' THEN 'specialist'
      WHEN primary_dim = 'D3' AND secondary_dim = 'D5' THEN 'supporter'
      WHEN primary_dim = 'D3' AND secondary_dim = 'D1' THEN 'strategist'
      WHEN primary_dim = 'D3' AND secondary_dim = 'D2' THEN 'facilitator'
      WHEN primary_dim = 'D4' AND secondary_dim = 'D3' THEN 'artisan'
      WHEN primary_dim = 'D4' AND secondary_dim = 'D1' THEN 'strategist'
      WHEN primary_dim = 'D4' AND secondary_dim = 'D5' THEN 'guardian'
      WHEN primary_dim = 'D4' AND secondary_dim = 'D2' THEN 'specialist'
      WHEN primary_dim = 'D5' AND secondary_dim = 'D2' THEN 'counselor'
      WHEN primary_dim = 'D5' AND secondary_dim = 'D3' THEN 'supporter'
      WHEN primary_dim = 'D5' AND secondary_dim = 'D1' THEN 'captain'
      WHEN primary_dim = 'D5' AND secondary_dim = 'D4' THEN 'mediator'
      ELSE 'versatile'
    END AS computed_archetype
  FROM classified
)
UPDATE public.team_members tm
SET archetype = r.computed_archetype,
    updated_at = NOW()
FROM resolved r
WHERE tm.id = r.id;
