-- ============================================================================
-- Migration 066: Fix AI analyses for collaborator flow (PRD-088/089)
-- Make candidate_id nullable, add team_member_id column
-- ============================================================================

-- Make candidate_id nullable for collaborator flow
ALTER TABLE public.ai_analyses ALTER COLUMN candidate_id DROP NOT NULL;

-- Add team_member_id for collaborator AI analyses
ALTER TABLE public.ai_analyses ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL;

-- Drop old unique constraint if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_analyses_candidate_id_test_result_id_analysis_type_key'
  ) THEN
    ALTER TABLE public.ai_analyses DROP CONSTRAINT ai_analyses_candidate_id_test_result_id_analysis_type_key;
  END IF;
END $$;

-- Uniqueness on (test_result_id, analysis_type) — works for both candidates and collaborators
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_analyses_result_type_unique
  ON public.ai_analyses(test_result_id, analysis_type);

-- Index for team_member queries
CREATE INDEX IF NOT EXISTS idx_ai_analyses_team_member_id
  ON public.ai_analyses(team_member_id) WHERE team_member_id IS NOT NULL;
