-- =====================================================
-- RecrutaRS: Fix missing UPDATE policy on evolution_annotations
-- =====================================================
-- Context: During the PRD-064 RLS consolidation, evolution_annotations was
-- left with only INSERT and SELECT policies. With RLS enabled and no UPDATE
-- policy, every UPDATE is silently blocked (0 rows changed, no error) — the
-- same class of drift fixed for the DELETE policies in migration 101.
--
-- This migration is ADDITIVE only and idempotent. It mirrors the
-- company-OR-admin expression already used by the sibling UPDATE policies
-- (development_plans_update, retest_schedules_update).
-- =====================================================

DROP POLICY IF EXISTS "evolution_annotations_update" ON public.evolution_annotations;
CREATE POLICY "evolution_annotations_update"
  ON public.evolution_annotations FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM public.team_members
      WHERE company_id = public.get_company_id(auth.uid())
    )
    OR public.get_user_type(auth.uid()) = 'admin'
  );
