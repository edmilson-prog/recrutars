-- =====================================================
-- PRD-077: Fluxo de Contratacao e Transicao para Gestao de Equipes
-- Migration 027: hiring_flow
-- =====================================================

-- 1A. Adicionar positions_count a jobs
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS positions_count INTEGER NOT NULL DEFAULT 1;
COMMENT ON COLUMN public.jobs.positions_count IS 'Numero total de posicoes abertas para esta vaga (PRD-077)';

-- 1B. Adicionar talent_pool ao CHECK de applications.status
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending','reviewing','interview','offer','rejected','hired','withdrawn','talent_pool'));

-- 1C. Criar tabela hirings (registro de contratacoes + metricas)
CREATE TABLE IF NOT EXISTS public.hirings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  position_title TEXT NOT NULL,
  hire_date TEXT NOT NULL,
  salary NUMERIC,
  notes TEXT,
  days_to_fill INTEGER,
  days_in_pipeline INTEGER,
  pipeline_stages_count INTEGER,
  match_score INTEGER,
  gauge_pro_status TEXT,
  hired_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hirings_application_unique UNIQUE (application_id)
);

CREATE INDEX IF NOT EXISTS idx_hirings_job_id ON public.hirings(job_id);
CREATE INDEX IF NOT EXISTS idx_hirings_company_id ON public.hirings(company_id);
CREATE INDEX IF NOT EXISTS idx_hirings_candidate_id ON public.hirings(candidate_id);

-- 1D. RLS policies para hirings
ALTER TABLE public.hirings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hirings_select_company_own"
  ON public.hirings FOR SELECT
  USING (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "hirings_select_admin"
  ON public.hirings FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

CREATE POLICY "hirings_select_candidate_own"
  ON public.hirings FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

CREATE POLICY "hirings_insert_company"
  ON public.hirings FOR INSERT
  WITH CHECK (company_id = public.get_company_id(auth.uid()));

CREATE POLICY "hirings_insert_admin"
  ON public.hirings FOR INSERT
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- 1E. RPC hire_candidate — operacao atomica SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.hire_candidate(
  p_application_id UUID,
  p_department_id UUID,
  p_position_title TEXT,
  p_hire_date TEXT,
  p_salary NUMERIC DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app RECORD;
  v_candidate RECORD;
  v_gauge RECORD;
  v_user_id UUID;
  v_company_id UUID;
  v_team_member_id UUID;
  v_hiring_id UUID;
  v_days_to_fill INTEGER;
  v_days_in_pipeline INTEGER;
  v_stage_count INTEGER;
  v_hired_count INTEGER;
  v_positions_count INTEGER;
  v_gauge_status TEXT;
BEGIN
  v_user_id := auth.uid();
  v_company_id := public.get_company_id(v_user_id);

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Apenas usuarios de empresa podem contratar candidatos';
  END IF;

  SELECT a.id AS app_id, a.candidate_id, a.job_id, a.status AS app_status,
         a.applied_at, a.test_status,
         j.company_id AS job_company_id, j.created_at AS job_created_at,
         j.positions_count AS job_positions, j.title AS job_title, j.status AS job_status
  INTO v_app
  FROM public.applications a
  JOIN public.jobs j ON a.job_id = j.id
  WHERE a.id = p_application_id
  FOR UPDATE OF a;

  IF NOT FOUND THEN RAISE EXCEPTION 'Candidatura nao encontrada'; END IF;
  IF v_app.job_company_id != v_company_id THEN RAISE EXCEPTION 'Nao autorizado a contratar para esta vaga'; END IF;
  IF v_app.app_status = 'hired' THEN RAISE EXCEPTION 'Candidato ja foi contratado para esta candidatura'; END IF;
  IF v_app.app_status != 'offer' THEN RAISE EXCEPTION 'Apenas candidatos aprovados podem ser contratados (status atual: %)', v_app.app_status; END IF;
  IF v_app.job_status = 'closed' THEN RAISE EXCEPTION 'Nao e possivel contratar para uma vaga encerrada'; END IF;

  SELECT c.id, c.name, c.avatar_url, c.profile_id
  INTO v_candidate
  FROM public.candidates c
  WHERE c.id = v_app.candidate_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Candidato nao encontrado'; END IF;

  SELECT gpr.final_scores, COALESCE(gpr.archetype_id, '') AS archetype_id
  INTO v_gauge
  FROM public.gauge_pro_results gpr
  JOIN public.gauge_pro_assessments gpa ON gpr.assessment_id = gpa.id
  WHERE gpa.candidate_id = v_app.candidate_id
  ORDER BY gpr.generated_at DESC NULLS LAST
  LIMIT 1;

  v_gauge_status := CASE WHEN v_gauge IS NOT NULL AND v_gauge.final_scores IS NOT NULL THEN 'completed' ELSE 'not_started' END;

  INSERT INTO public.team_members (
    company_id, department_id, position_id, name, email, avatar_url,
    hire_date, gauge_status, gauge_scores, archetype, is_active,
    imported_from_candidate_id, last_test_date
  ) VALUES (
    v_company_id, p_department_id, NULL, v_candidate.name,
    (SELECT email FROM public.profiles WHERE id = v_candidate.profile_id),
    v_candidate.avatar_url, p_hire_date, v_gauge_status,
    CASE WHEN v_gauge IS NOT NULL THEN v_gauge.final_scores ELSE NULL END,
    CASE WHEN v_gauge IS NOT NULL THEN NULLIF(v_gauge.archetype_id, '') ELSE NULL END,
    TRUE, v_app.candidate_id,
    CASE WHEN v_gauge_status = 'completed' THEN NOW()::TEXT ELSE NULL END
  ) RETURNING id INTO v_team_member_id;

  UPDATE public.applications SET status = 'hired', updated_at = NOW() WHERE id = p_application_id;

  INSERT INTO public.application_history (application_id, from_status, to_status, changed_by, reason)
  VALUES (p_application_id, v_app.app_status, 'hired', v_user_id, 'Candidato contratado');

  v_days_to_fill := GREATEST(0, EXTRACT(DAY FROM NOW() - v_app.job_created_at)::INTEGER);
  v_days_in_pipeline := GREATEST(0, EXTRACT(DAY FROM NOW() - v_app.applied_at)::INTEGER);
  SELECT COUNT(*) INTO v_stage_count FROM public.application_history WHERE application_id = p_application_id;

  INSERT INTO public.hirings (
    application_id, job_id, candidate_id, company_id, team_member_id,
    department_id, position_title, hire_date, salary, notes,
    days_to_fill, days_in_pipeline, pipeline_stages_count,
    match_score, gauge_pro_status, hired_by
  ) VALUES (
    p_application_id, v_app.job_id, v_app.candidate_id, v_company_id,
    v_team_member_id, p_department_id, p_position_title, p_hire_date,
    p_salary, p_notes, v_days_to_fill, v_days_in_pipeline,
    v_stage_count, NULL, v_app.test_status, v_user_id
  ) RETURNING id INTO v_hiring_id;

  SELECT COUNT(*) INTO v_hired_count FROM public.hirings WHERE job_id = v_app.job_id;
  v_positions_count := COALESCE(v_app.job_positions, 1);

  INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
  VALUES (
    v_candidate.profile_id, 'application_hired',
    'Parabens! Voce foi contratado(a)!',
    'Voce foi selecionado(a) para a vaga de ' || v_app.job_title || '. Parabens pela conquista!',
    '/candidato/candidaturas',
    jsonb_build_object('jobId', v_app.job_id, 'jobTitle', v_app.job_title, 'applicationId', p_application_id, 'companyId', v_company_id)
  );

  RETURN jsonb_build_object(
    'hiring_id', v_hiring_id, 'team_member_id', v_team_member_id,
    'hired_count', v_hired_count, 'positions_count', v_positions_count,
    'all_positions_filled', v_hired_count >= v_positions_count,
    'job_id', v_app.job_id, 'job_title', v_app.job_title, 'candidate_name', v_candidate.name
  );
END;
$$;

COMMENT ON FUNCTION public.hire_candidate IS 'Operacao atomica de contratacao (PRD-077)';

-- 1F. RPC close_job_with_remaining — encerramento atomico
CREATE OR REPLACE FUNCTION public.close_job_with_remaining(
  p_job_id UUID,
  p_action TEXT,
  p_notify BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_job RECORD;
  v_affected_count INTEGER := 0;
BEGIN
  v_user_id := auth.uid();
  v_company_id := public.get_company_id(v_user_id);

  IF v_company_id IS NULL THEN RAISE EXCEPTION 'Apenas usuarios de empresa podem encerrar vagas'; END IF;

  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id AND company_id = v_company_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Vaga nao encontrada ou sem autorizacao'; END IF;

  IF p_action = 'talent_pool' THEN
    WITH updated AS (
      UPDATE public.applications SET status = 'talent_pool', updated_at = NOW()
      WHERE job_id = p_job_id AND status NOT IN ('hired','rejected','withdrawn','talent_pool')
      RETURNING id, candidate_id
    ),
    hist AS (
      INSERT INTO public.application_history (application_id, from_status, to_status, changed_by, reason)
      SELECT id, 'offer', 'talent_pool', v_user_id, 'Vaga encerrada - banco de talentos' FROM updated
    )
    SELECT COUNT(*) INTO v_affected_count FROM updated;

    IF p_notify THEN
      INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
      SELECT c.profile_id, 'application_talent_pool', 'Atualização sobre sua candidatura',
        'A vaga de ' || v_job.title || ' foi encerrada. Seu perfil foi adicionado ao banco de talentos para futuras oportunidades.',
        '/candidato/candidaturas', jsonb_build_object('jobId', p_job_id, 'jobTitle', v_job.title)
      FROM public.applications a JOIN public.candidates c ON a.candidate_id = c.id
      WHERE a.job_id = p_job_id AND a.status = 'talent_pool';
    END IF;

  ELSIF p_action = 'reject' THEN
    WITH updated AS (
      UPDATE public.applications SET status = 'rejected', updated_at = NOW()
      WHERE job_id = p_job_id AND status NOT IN ('hired','rejected','withdrawn','talent_pool')
      RETURNING id, candidate_id
    ),
    hist AS (
      INSERT INTO public.application_history (application_id, from_status, to_status, changed_by, reason)
      SELECT id, 'offer', 'rejected', v_user_id, 'Vaga encerrada - posicoes preenchidas' FROM updated
    )
    SELECT COUNT(*) INTO v_affected_count FROM updated;

    IF p_notify THEN
      INSERT INTO public.notifications (user_id, type, title, description, action_url, metadata)
      SELECT c.profile_id, 'application_rejected', 'Atualização sobre sua candidatura',
        'A vaga de ' || v_job.title || ' foi preenchida. Agradecemos seu interesse! Seu perfil permanece na plataforma para futuras oportunidades.',
        '/candidato/candidaturas', jsonb_build_object('jobId', p_job_id, 'jobTitle', v_job.title)
      FROM public.applications a JOIN public.candidates c ON a.candidate_id = c.id
      WHERE a.job_id = p_job_id AND a.status = 'rejected' AND a.updated_at >= NOW() - INTERVAL '5 seconds';
    END IF;
  END IF;

  IF p_action != 'keep_active' THEN
    UPDATE public.jobs SET status = 'closed', finalized_at = NOW(), finalization_reason = 'filled' WHERE id = p_job_id;
  END IF;

  RETURN jsonb_build_object(
    'job_id', p_job_id, 'action', p_action,
    'affected_applications', v_affected_count, 'job_closed', p_action != 'keep_active'
  );
END;
$$;

COMMENT ON FUNCTION public.close_job_with_remaining IS 'Encerramento atomico de vaga (PRD-077)';
