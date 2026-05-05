-- =====================================================
-- RecrutaRS: Count External Applications RPC
-- Returns the number of active applications a candidate
-- has at OTHER companies (not the caller's company).
-- Only exposes an integer count — no sensitive data.
-- =====================================================

CREATE OR REPLACE FUNCTION public.count_candidate_external_applications(p_candidate_id UUID)
RETURNS INTEGER
STABLE
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_company_id UUID;
  v_count INTEGER;
BEGIN
  v_company_id := public.get_company_id(auth.uid());

  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.applications a
  JOIN public.jobs j ON j.id = a.job_id
  WHERE a.candidate_id = p_candidate_id
    AND j.company_id IS DISTINCT FROM v_company_id
    AND a.status IN ('pending', 'reviewing', 'interview', 'offer');

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.count_candidate_external_applications(UUID)
  IS 'Returns count of active applications for a candidate at companies other than the caller''s. SECURITY DEFINER to bypass RLS.';
