-- =====================================================
-- RecrutaRS: Team Management Tables
-- PRD-064: Schema Core + Seeds Transacionais
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 009_curriculums.sql has been applied.
-- =====================================================

-- =====================================================
-- TABLE: departments
-- Company departments for team organization.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments(company_id);

-- =====================================================
-- TABLE: positions
-- Job positions within departments.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_positions_department_id ON public.positions(department_id);

-- =====================================================
-- TABLE: team_members
-- Internal team members of a company.
-- Can be imported from candidates.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  hire_date TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  imported_from_candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,

  -- Gauge behavioral assessment data
  gauge_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (gauge_status IN ('not_started', 'pending', 'completed')),
  gauge_scores JSONB,
  archetype TEXT,
  last_test_date TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_company_id ON public.team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_department_id ON public.team_members(department_id);
CREATE INDEX IF NOT EXISTS idx_team_members_position_id ON public.team_members(position_id);

-- =====================================================
-- TABLE: development_plans
-- Personal development plans for team members.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.development_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_development_plans_member_id ON public.development_plans(member_id);

-- =====================================================
-- TABLE: development_objectives
-- Individual objectives within a development plan.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.development_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.development_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  dimension TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  due_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_development_objectives_plan_id ON public.development_objectives(plan_id);

-- =====================================================
-- TABLE: retest_schedules
-- Scheduled behavioral re-tests for team members.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.retest_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL DEFAULT 'quarterly'
    CHECK (frequency IN ('monthly', 'quarterly', 'semiannual', 'annual')),
  next_date TEXT NOT NULL,
  last_sent_at TIMESTAMPTZ,
  auto_send BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retest_schedules_member_id ON public.retest_schedules(member_id);

-- =====================================================
-- TABLE: evolution_annotations
-- Notes tracking team member behavioral evolution.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.evolution_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'observation'
    CHECK (type IN ('observation', 'improvement', 'concern', 'milestone')),
  date TEXT NOT NULL DEFAULT CURRENT_DATE::TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evolution_annotations_member_id ON public.evolution_annotations(member_id);

-- =====================================================
-- TRIGGERS: Auto-update updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_development_plans_updated_at ON public.development_plans;
CREATE TRIGGER update_development_plans_updated_at
  BEFORE UPDATE ON public.development_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retest_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_annotations ENABLE ROW LEVEL SECURITY;

-- ----- departments -----

CREATE POLICY "departments_select_company_own"
  ON public.departments FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "departments_select_admin"
  ON public.departments FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "departments_insert_company_own"
  ON public.departments FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "departments_update_company_own"
  ON public.departments FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "departments_delete_company_own"
  ON public.departments FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));

-- ----- positions -----

CREATE POLICY "positions_select_company"
  ON public.positions FOR SELECT
  USING (
    department_id IN (
      SELECT id FROM public.departments WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "positions_select_admin"
  ON public.positions FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "positions_insert_company"
  ON public.positions FOR INSERT
  WITH CHECK (
    department_id IN (
      SELECT id FROM public.departments WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "positions_update_company"
  ON public.positions FOR UPDATE
  USING (
    department_id IN (
      SELECT id FROM public.departments WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "positions_delete_company"
  ON public.positions FOR DELETE
  USING (
    department_id IN (
      SELECT id FROM public.departments WHERE company_id = public.get_company_id(auth.uid())
    )
  );

-- ----- team_members -----

CREATE POLICY "team_members_select_company_own"
  ON public.team_members FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "team_members_select_admin"
  ON public.team_members FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "team_members_insert_company_own"
  ON public.team_members FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "team_members_update_company_own"
  ON public.team_members FOR UPDATE
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "team_members_delete_company_own"
  ON public.team_members FOR DELETE
  USING (company_id = public.get_company_id(auth.uid()));

-- ----- development_plans -----

CREATE POLICY "development_plans_select_company"
  ON public.development_plans FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "development_plans_select_admin"
  ON public.development_plans FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "development_plans_insert_company"
  ON public.development_plans FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "development_plans_update_company"
  ON public.development_plans FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "development_plans_delete_company"
  ON public.development_plans FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

-- ----- development_objectives -----

CREATE POLICY "development_objectives_select_company"
  ON public.development_objectives FOR SELECT
  USING (
    plan_id IN (
      SELECT dp.id FROM public.development_plans dp
      JOIN public.team_members tm ON dp.member_id = tm.id
      WHERE tm.company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "development_objectives_select_admin"
  ON public.development_objectives FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "development_objectives_insert_company"
  ON public.development_objectives FOR INSERT
  WITH CHECK (
    plan_id IN (
      SELECT dp.id FROM public.development_plans dp
      JOIN public.team_members tm ON dp.member_id = tm.id
      WHERE tm.company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "development_objectives_update_company"
  ON public.development_objectives FOR UPDATE
  USING (
    plan_id IN (
      SELECT dp.id FROM public.development_plans dp
      JOIN public.team_members tm ON dp.member_id = tm.id
      WHERE tm.company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "development_objectives_delete_company"
  ON public.development_objectives FOR DELETE
  USING (
    plan_id IN (
      SELECT dp.id FROM public.development_plans dp
      JOIN public.team_members tm ON dp.member_id = tm.id
      WHERE tm.company_id = public.get_company_id(auth.uid())
    )
  );

-- ----- retest_schedules -----

CREATE POLICY "retest_schedules_select_company"
  ON public.retest_schedules FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "retest_schedules_select_admin"
  ON public.retest_schedules FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "retest_schedules_insert_company"
  ON public.retest_schedules FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "retest_schedules_update_company"
  ON public.retest_schedules FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "retest_schedules_delete_company"
  ON public.retest_schedules FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

-- ----- evolution_annotations -----

CREATE POLICY "evolution_annotations_select_company"
  ON public.evolution_annotations FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "evolution_annotations_select_admin"
  ON public.evolution_annotations FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "evolution_annotations_insert_company"
  ON public.evolution_annotations FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "evolution_annotations_update_company"
  ON public.evolution_annotations FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

CREATE POLICY "evolution_annotations_delete_company"
  ON public.evolution_annotations FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM public.team_members WHERE company_id = public.get_company_id(auth.uid())
    )
  );

COMMENT ON TABLE public.departments IS 'Company departments for organizational structure (PRD-064)';
COMMENT ON TABLE public.positions IS 'Job positions within departments (PRD-064)';
COMMENT ON TABLE public.team_members IS 'Internal team members with behavioral assessment data (PRD-064)';
COMMENT ON TABLE public.development_plans IS 'Personal development plans for team members (PRD-064)';
COMMENT ON TABLE public.development_objectives IS 'Individual objectives within development plans (PRD-064)';
COMMENT ON TABLE public.retest_schedules IS 'Scheduled behavioral re-tests for team members (PRD-064)';
COMMENT ON TABLE public.evolution_annotations IS 'Notes tracking team member behavioral evolution (PRD-064)';
