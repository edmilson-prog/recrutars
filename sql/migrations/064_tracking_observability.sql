-- ============================================================================
-- Migration 064: PRD-089 — Rastreamento e Observabilidade Ponta a Ponta
-- ============================================================================

-- 1A. New columns: chain linking (RF-005, RF-006)
-- -------------------------------------------------------------------

-- Reverse chain: result -> invitation
ALTER TABLE public.gauge_pro_results
  ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES public.test_invitations(id) ON DELETE SET NULL;

-- Chain: AI analysis -> result (proper FK, alongside existing test_result_id TEXT)
ALTER TABLE public.ai_analyses
  ADD COLUMN IF NOT EXISTS result_id UUID REFERENCES public.gauge_pro_results(id) ON DELETE SET NULL;


-- 1B. Indexes for performance
-- -------------------------------------------------------------------

-- Audit log: paginated queries by company + time (RF-018)
CREATE INDEX IF NOT EXISTS idx_test_audit_logs_company_created
  ON public.test_audit_logs(company_id, created_at DESC);

-- Invitation: active invitations per team member (performance)
CREATE INDEX IF NOT EXISTS idx_test_invitations_tm_test_status
  ON public.test_invitations(team_member_id, test_id, status);

-- Invitation: on-demand abandonment detection (RF-003)
CREATE INDEX IF NOT EXISTS idx_test_invitations_abandonment
  ON public.test_invitations(status, started_at)
  WHERE status = 'started';

-- Result: reverse chain lookup (result -> invitation)
CREATE INDEX IF NOT EXISTS idx_gauge_pro_results_invitation
  ON public.gauge_pro_results(invitation_id)
  WHERE invitation_id IS NOT NULL;

-- idx_retest_schedules_next_date already exists — skipped


-- 1C. View: Full tracking chain (RF-007)
-- -------------------------------------------------------------------

CREATE OR REPLACE VIEW public.vw_test_tracking_chain AS
SELECT
  ti.id AS invitation_id,
  ti.status AS invitation_status,
  ti.sent_at,
  ti.viewed_at,
  ti.started_at,
  ti.completed_at,
  ti.assessment_id,
  ti.team_member_id,
  ti.candidate_id,
  ti.candidate_name,
  ti.test_id,
  ct.name AS test_name,
  ct.company_id,
  gpa.id AS assessment_uuid,
  gpa.phase AS assessment_phase,
  gpr.id AS result_id,
  gpr.archetype_id,
  gpr.final_scores,
  gpr.primary_dimension,
  gpr.secondary_dimension,
  aa.id AS ai_analysis_id,
  aa.status AS ai_analysis_status
FROM public.test_invitations ti
LEFT JOIN public.company_tests ct ON ct.id = ti.test_id
LEFT JOIN public.gauge_pro_assessments gpa ON gpa.id = ti.assessment_id
LEFT JOIN public.gauge_pro_results gpr ON gpr.assessment_id = gpa.id
LEFT JOIN public.ai_analyses aa ON (aa.result_id = gpr.id OR aa.test_result_id = gpr.id::text);


-- 1D. RPC: Metrics per company with period filter (RF-019/RF-020)
-- -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_test_metrics(
  p_company_id UUID,
  p_from TIMESTAMPTZ DEFAULT NULL,
  p_to TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_total_invitations INTEGER;
  v_completed INTEGER;
  v_abandoned INTEGER;
  v_pending INTEGER;
  v_started INTEGER;
  v_viewed INTEGER;
  v_completion_rate NUMERIC;
  v_abandon_rate NUMERIC;
  v_avg_completion_hours NUMERIC;
  v_mapped_members INTEGER;
  v_total_members INTEGER;
  v_credits_used INTEGER;
  v_credits_available INTEGER;
  v_pending_retests INTEGER;
BEGIN
  -- Invitation metrics with optional period filter
  SELECT
    COUNT(*),
    COUNT(CASE WHEN ti.status = 'completed' THEN 1 END),
    COUNT(CASE WHEN ti.status = 'abandoned' THEN 1 END),
    COUNT(CASE WHEN ti.status IN ('sent', 'viewed') THEN 1 END),
    COUNT(CASE WHEN ti.status = 'started' THEN 1 END),
    COUNT(CASE WHEN ti.status IN ('viewed', 'started', 'completed', 'abandoned') THEN 1 END)
  INTO v_total_invitations, v_completed, v_abandoned, v_pending, v_started, v_viewed
  FROM public.test_invitations ti
  JOIN public.company_tests ct ON ct.id = ti.test_id
  WHERE ct.company_id = p_company_id
    AND (p_from IS NULL OR ti.sent_at >= p_from)
    AND (p_to IS NULL OR ti.sent_at <= p_to);

  -- Rates
  IF v_total_invitations > 0 THEN
    v_completion_rate := ROUND(v_completed::NUMERIC / v_total_invitations * 100, 1);
    v_abandon_rate := ROUND(v_abandoned::NUMERIC / v_total_invitations * 100, 1);
  ELSE
    v_completion_rate := 0;
    v_abandon_rate := 0;
  END IF;

  -- Average completion time in hours
  SELECT COALESCE(ROUND(AVG(
    EXTRACT(EPOCH FROM (ti.completed_at - ti.sent_at)) / 3600
  )::NUMERIC, 1), 0)
  INTO v_avg_completion_hours
  FROM public.test_invitations ti
  JOIN public.company_tests ct ON ct.id = ti.test_id
  WHERE ct.company_id = p_company_id
    AND ti.status = 'completed'
    AND ti.completed_at IS NOT NULL
    AND ti.sent_at IS NOT NULL
    AND (p_from IS NULL OR ti.sent_at >= p_from)
    AND (p_to IS NULL OR ti.sent_at <= p_to);

  -- Team member counts
  SELECT
    COUNT(CASE WHEN gauge_status = 'mapped' THEN 1 END),
    COUNT(*)
  INTO v_mapped_members, v_total_members
  FROM public.team_members
  WHERE company_id = p_company_id;

  -- Credits used in period
  SELECT COALESCE(SUM(ABS(amount)), 0)
  INTO v_credits_used
  FROM public.test_credit_transactions tct
  WHERE tct.company_id = p_company_id
    AND tct.type = 'consume'
    AND (p_from IS NULL OR tct.created_at >= p_from)
    AND (p_to IS NULL OR tct.created_at <= p_to);

  -- Credits available (total balance, not period-filtered)
  SELECT COALESCE(public.get_company_credit_balance(p_company_id), 0)
  INTO v_credits_available;

  -- Pending retests
  SELECT COUNT(*)
  INTO v_pending_retests
  FROM public.retest_schedules rs
  JOIN public.team_members tm ON tm.id = rs.member_id
  WHERE tm.company_id = p_company_id
    AND rs.next_date <= CURRENT_DATE;

  -- Build result JSON
  v_result := json_build_object(
    'totalInvitations', v_total_invitations,
    'completed', v_completed,
    'abandoned', v_abandoned,
    'pending', v_pending,
    'started', v_started,
    'viewed', v_viewed,
    'completionRate', v_completion_rate,
    'abandonRate', v_abandon_rate,
    'avgCompletionHours', v_avg_completion_hours,
    'mappedMembers', v_mapped_members,
    'totalMembers', v_total_members,
    'creditsUsed', v_credits_used,
    'creditsAvailable', v_credits_available,
    'pendingRetests', v_pending_retests
  );

  RETURN v_result;
END;
$$;


-- 1E. RPC: On-demand abandonment detection (RF-003)
-- -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.detect_abandoned_invitations(p_company_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH abandoned AS (
    UPDATE public.test_invitations ti
    SET status = 'abandoned'
    FROM public.company_tests ct
    WHERE ct.id = ti.test_id
      AND ct.company_id = p_company_id
      AND ti.status = 'started'
      AND ti.started_at < NOW() - INTERVAL '24 hours'
    RETURNING ti.id
  )
  SELECT COUNT(*) INTO v_count FROM abandoned;

  RETURN v_count;
END;
$$;


-- 1F. RLS: Append-only for audit logs and credit transactions (RNF-003)
-- -------------------------------------------------------------------

-- Deny UPDATE on test_audit_logs
CREATE POLICY "test_audit_logs_deny_update"
  ON public.test_audit_logs
  FOR UPDATE
  USING (false);

-- Deny DELETE on test_audit_logs
CREATE POLICY "test_audit_logs_deny_delete"
  ON public.test_audit_logs
  FOR DELETE
  USING (false);

-- Deny UPDATE on test_credit_transactions
CREATE POLICY "test_credit_transactions_deny_update"
  ON public.test_credit_transactions
  FOR UPDATE
  USING (false);

-- Deny DELETE on test_credit_transactions
CREATE POLICY "test_credit_transactions_deny_delete"
  ON public.test_credit_transactions
  FOR DELETE
  USING (false);
