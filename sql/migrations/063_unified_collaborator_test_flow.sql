-- Migration 063: Unified collaborator test flow
-- PRD-088: Redesign do Fluxo Unificado de Teste Gauge-Pro para Colaboradores
--
-- Steps:
--   1. Add target_audience to company_tests
--   2. Add team_member_id to gauge_pro_assessments (make candidate_id nullable)
--   3. Add team_member_id to gauge_pro_results (make candidate_id nullable)
--   4. Add RLS policies for company access via team_member_id

BEGIN;

-- =========================================================================
-- 1. Add target_audience to company_tests
-- =========================================================================
ALTER TABLE public.company_tests
  ADD COLUMN IF NOT EXISTS target_audience TEXT NOT NULL DEFAULT 'candidate';

-- Add CHECK constraint separately (IF NOT EXISTS not supported for constraints)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_company_tests_target_audience'
  ) THEN
    ALTER TABLE public.company_tests
      ADD CONSTRAINT chk_company_tests_target_audience
      CHECK (target_audience IN ('candidate', 'collaborator'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_company_tests_target_audience
  ON public.company_tests(target_audience);

-- =========================================================================
-- 2. Add team_member_id to gauge_pro_assessments
-- =========================================================================
ALTER TABLE public.gauge_pro_assessments
  ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL;

-- Make candidate_id nullable (currently NOT NULL)
ALTER TABLE public.gauge_pro_assessments
  ALTER COLUMN candidate_id DROP NOT NULL;

-- At least one owner must be present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_assessment_owner'
  ) THEN
    ALTER TABLE public.gauge_pro_assessments
      ADD CONSTRAINT chk_assessment_owner
      CHECK (candidate_id IS NOT NULL OR team_member_id IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gauge_pro_assessments_team_member_id
  ON public.gauge_pro_assessments(team_member_id)
  WHERE team_member_id IS NOT NULL;

-- =========================================================================
-- 3. Add team_member_id to gauge_pro_results
-- =========================================================================
ALTER TABLE public.gauge_pro_results
  ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL;

-- Make candidate_id nullable (currently NOT NULL)
ALTER TABLE public.gauge_pro_results
  ALTER COLUMN candidate_id DROP NOT NULL;

-- At least one owner must be present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_result_owner'
  ) THEN
    ALTER TABLE public.gauge_pro_results
      ADD CONSTRAINT chk_result_owner
      CHECK (candidate_id IS NOT NULL OR team_member_id IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gauge_pro_results_team_member_id
  ON public.gauge_pro_results(team_member_id)
  WHERE team_member_id IS NOT NULL;

-- =========================================================================
-- 4. RLS policies: company can read assessments/results for their team members
-- =========================================================================

-- gauge_pro_assessments: company read via team_member
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'gauge_pro_assessments_select_company_team_member'
      AND tablename = 'gauge_pro_assessments'
  ) THEN
    CREATE POLICY "gauge_pro_assessments_select_company_team_member"
      ON public.gauge_pro_assessments FOR SELECT
      USING (
        team_member_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.id = gauge_pro_assessments.team_member_id
            AND tm.company_id = public.get_company_id(auth.uid())
        )
      );
  END IF;
END $$;

-- gauge_pro_results: company read via team_member
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'gauge_pro_results_select_company_team_member'
      AND tablename = 'gauge_pro_results'
  ) THEN
    CREATE POLICY "gauge_pro_results_select_company_team_member"
      ON public.gauge_pro_results FOR SELECT
      USING (
        team_member_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.id = gauge_pro_results.team_member_id
            AND tm.company_id = public.get_company_id(auth.uid())
        )
      );
  END IF;
END $$;

COMMIT;
