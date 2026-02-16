-- Migration 028: Fix type casts in hire_candidate RPC
-- team_members.hire_date e DATE, p_hire_date e TEXT → cast ::DATE
-- team_members.last_test_date e timestamptz → remover ::TEXT de NOW()

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
  -- Get caller identity
  v_user_id := auth.uid();
  v_company_id := public.get_company_id(v_user_id);

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Apenas usuarios de empresa podem contratar candidatos';
  END IF;

  -- Lock and fetch application with job data
  SELECT a.id AS app_id, a.candidate_id, a.job_id, a.status AS app_status,
         a.applied_at, a.test_status,
         j.company_id AS job_company_id, j.created_at AS job_created_at,
         j.positions_count AS job_positions, j.title AS job_title, j.status AS job_status
  INTO v_app
  FROM public.applications a
  JOIN public.jobs j ON a.job_id = j.id
  WHERE a.id = p_application_id
  FOR UPDATE OF a;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Candidatura nao encontrada';
  END IF;

  IF v_app.job_company_id != v_company_id THEN
    RAISE EXCEPTION 'Nao autorizado a contratar para esta vaga';
  END IF;

  IF v_app.app_status = 'hired' THEN
    RAISE EXCEPTION 'Candidato ja foi contratado para esta candidatura';
  END IF;

  IF v_app.app_status != 'offer' THEN
    RAISE EXCEPTION 'Apenas candidatos aprovados podem ser contratados (status atual: %)', v_app.app_status;
  END IF;

  IF v_app.job_status = 'closed' THEN
    RAISE EXCEPTION 'Nao e possivel contratar para uma vaga encerrada';
  END IF;

  -- Fetch candidate data
  SELECT c.id, c.name, c.avatar_url, c.profile_id
  INTO v_candidate
  FROM public.candidates c
  WHERE c.id = v_app.candidate_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Candidato nao encontrado';
  END IF;

  -- Fetch Gauge-Pro result (optional, latest)
  SELECT gpr.final_scores, gpa.candidate_id AS gp_cand,
         COALESCE(gpr.archetype_id, '') AS archetype_id
  INTO v_gauge
  FROM public.gauge_pro_results gpr
  JOIN public.gauge_pro_assessments gpa ON gpr.assessment_id = gpa.id
  WHERE gpa.candidate_id = v_app.candidate_id
  ORDER BY gpr.generated_at DESC NULLS LAST
  LIMIT 1;

  -- Determine gauge status
  IF v_gauge IS NOT NULL AND v_gauge.final_scores IS NOT NULL THEN
    v_gauge_status := 'completed';
  ELSE
    v_gauge_status := 'not_started';
  END IF;

  -- Create team member (hire_date cast TEXT->DATE)
  INSERT INTO public.team_members (
    company_id, department_id, position_id, name, email, avatar_url,
    hire_date, gauge_status, gauge_scores, archetype, is_active,
    imported_from_candidate_id, last_test_date
  ) VALUES (
    v_company_id,
    p_department_id,
    NULL,
    v_candidate.name,
    (SELECT email FROM public.profiles WHERE id = v_candidate.profile_id),
    v_candidate.avatar_url,
    p_hire_date::DATE,
    v_gauge_status,
    CASE WHEN v_gauge IS NOT NULL THEN v_gauge.final_scores ELSE NULL END,
    CASE WHEN v_gauge IS NOT NULL THEN NULLIF(v_gauge.archetype_id, '') ELSE NULL END,
    TRUE,
    v_app.candidate_id,
    CASE WHEN v_gauge_status = 'completed' THEN NOW() ELSE NULL END
  )
  RETURNING id INTO v_team_member_id;

  -- Update application status to 'hired'
  UPDATE public.applications
  SET status = 'hired', updated_at = NOW()
  WHERE id = p_application_id;

  -- Record status change in application_history
  INSERT INTO public.application_history (
    application_id, from_status, to_status, changed_by, reason
  ) VALUES (
    p_application_id, v_app.app_status, 'hired', v_user_id, 'Candidato contratado'
  );

  -- Calculate metrics
  v_days_to_fill := GREATEST(0, EXTRACT(DAY FROM NOW() - v_app.job_created_at)::INTEGER);
  v_days_in_pipeline := GREATEST(0, EXTRACT(DAY FROM NOW() - v_app.applied_at)::INTEGER);

  SELECT COUNT(*) INTO v_stage_count
  FROM public.application_history
  WHERE application_id = p_application_id;

  -- Create hiring record
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
  )
  RETURNING id INTO v_hiring_id;

  -- Count total hired for this job
  SELECT COUNT(*) INTO v_hired_count
  FROM public.hirings WHERE job_id = v_app.job_id;

  v_positions_count := COALESCE(v_app.job_positions, 1);

  -- Create notification for the hired candidate
  INSERT INTO public.notifications (
    user_id, type, title, description, action_url, metadata
  ) VALUES (
    v_candidate.profile_id,
    'application_hired',
    'Parabens! Voce foi contratado(a)!',
    'Voce foi selecionado(a) para a vaga de ' || v_app.job_title || '. Parabens pela conquista!',
    '/candidato/candidaturas',
    jsonb_build_object(
      'jobId', v_app.job_id,
      'jobTitle', v_app.job_title,
      'applicationId', p_application_id,
      'companyId', v_company_id
    )
  );

  RETURN jsonb_build_object(
    'hiring_id', v_hiring_id,
    'team_member_id', v_team_member_id,
    'hired_count', v_hired_count,
    'positions_count', v_positions_count,
    'all_positions_filled', v_hired_count >= v_positions_count,
    'job_id', v_app.job_id,
    'job_title', v_app.job_title,
    'candidate_name', v_candidate.name
  );
END;
$$;
