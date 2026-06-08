-- =====================================================
-- RecrutaRS: Fix missing DELETE policies (Team Development)
-- =====================================================
-- Context: The live database was consolidated to *_insert / *_select /
-- *_update policies (PRD-064 child tables), but the DELETE policies were
-- never (re)created. With RLS enabled and no DELETE policy, every DELETE is
-- silently blocked (0 rows removed, no error).
--
-- Impact: saveDevelopmentPlan() deletes objectives by plan_id and then
-- re-inserts them with the SAME primary keys. Because the DELETE removed
-- 0 rows, the INSERT collides on the PK -> 409 Conflict ("Erro ao salvar
-- objetivo").
--
-- This migration is ADDITIVE only: it restores the missing DELETE policies
-- for the four affected child tables, mirroring the company-OR-admin
-- expression already used by the live UPDATE policies. It is idempotent.
-- =====================================================

-- ----- development_objectives -----
DROP POLICY IF EXISTS "development_objectives_delete" ON public.development_objectives;
CREATE POLICY "development_objectives_delete"
  ON public.development_objectives FOR DELETE
  USING (
    plan_id IN (
      SELECT dp.id FROM public.development_plans dp
      JOIN public.team_members tm ON dp.member_id = tm.id
      WHERE tm.company_id = public.get_company_id(auth.uid())
    )
    OR public.get_user_type(auth.uid()) = 'admin'
  );

-- ----- development_plans -----
DROP POLICY IF EXISTS "development_plans_delete" ON public.development_plans;
CREATE POLICY "development_plans_delete"
  ON public.development_plans FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM public.team_members
      WHERE company_id = public.get_company_id(auth.uid())
    )
    OR public.get_user_type(auth.uid()) = 'admin'
  );

-- ----- retest_schedules -----
DROP POLICY IF EXISTS "retest_schedules_delete" ON public.retest_schedules;
CREATE POLICY "retest_schedules_delete"
  ON public.retest_schedules FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM public.team_members
      WHERE company_id = public.get_company_id(auth.uid())
    )
    OR public.get_user_type(auth.uid()) = 'admin'
  );

-- ----- evolution_annotations -----
DROP POLICY IF EXISTS "evolution_annotations_delete" ON public.evolution_annotations;
CREATE POLICY "evolution_annotations_delete"
  ON public.evolution_annotations FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM public.team_members
      WHERE company_id = public.get_company_id(auth.uid())
    )
    OR public.get_user_type(auth.uid()) = 'admin'
  );
