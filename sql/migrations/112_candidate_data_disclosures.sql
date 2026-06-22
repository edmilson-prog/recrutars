-- Migration 112: candidate_data_disclosures (LGPD per-application consent)
-- Creates the disclosure table + RLS + indexes, the consent-check function,
-- and extends test_audit_logs.resource_type CHECK to include 'consent'.

-- =====================================================
-- TABLE: candidate_data_disclosures
-- One consent record per (application, company) for revealing
-- the candidate's sensitive contact/identity data.
-- =====================================================
CREATE TABLE IF NOT EXISTS public.candidate_data_disclosures (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'refused', 'revoked')),
  term_version  TEXT,
  term_hash     TEXT,
  accepted_at   TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,
  ip            TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT candidate_data_disclosures_app_company_unique UNIQUE (application_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_cdd_application_id ON public.candidate_data_disclosures(application_id);
CREATE INDEX IF NOT EXISTS idx_cdd_company_id     ON public.candidate_data_disclosures(company_id);
CREATE INDEX IF NOT EXISTS idx_cdd_candidate_id   ON public.candidate_data_disclosures(candidate_id);
-- Fast consent lookups by (company, candidate, status)
CREATE INDEX IF NOT EXISTS idx_cdd_company_candidate_status
  ON public.candidate_data_disclosures(company_id, candidate_id, status);

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS update_candidate_data_disclosures_updated_at ON public.candidate_data_disclosures;
CREATE TRIGGER update_candidate_data_disclosures_updated_at
  BEFORE UPDATE ON public.candidate_data_disclosures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.candidate_data_disclosures ENABLE ROW LEVEL SECURITY;

-- Candidate (own): can SELECT and UPDATE their own disclosures (accept/refuse/revoke).
-- Note: the canonical write path is the Edge Function (service role), which captures
-- IP/user_agent server-side. These policies keep the candidate able to read state and
-- allow direct UPDATE as a fallback. No INSERT for candidate (created by trigger/service).
CREATE POLICY "cdd_select_candidate_own"
  ON public.candidate_data_disclosures FOR SELECT
  USING (candidate_id = public.get_candidate_id(auth.uid()));

CREATE POLICY "cdd_update_candidate_own"
  ON public.candidate_data_disclosures FOR UPDATE
  USING (candidate_id = public.get_candidate_id(auth.uid()))
  WITH CHECK (candidate_id = public.get_candidate_id(auth.uid()));

-- Company: can SELECT only its own disclosures (gate the Contratar button by status).
CREATE POLICY "cdd_select_company"
  ON public.candidate_data_disclosures FOR SELECT
  USING (
    public.get_user_type(auth.uid()) = 'company'
    AND company_id = public.get_company_id(auth.uid())
  );

-- Admin: full read.
CREATE POLICY "cdd_select_admin"
  ON public.candidate_data_disclosures FOR SELECT
  USING (public.get_user_type(auth.uid()) = 'admin');

-- =====================================================
-- FUNCTION: company_has_data_consent
-- TRUE when an 'accepted' disclosure exists for (company, candidate).
-- SECURITY DEFINER so it can be used inside the SECURITY DEFINER views (B2)
-- and from the masking CASE WHEN expression without exposing the table to company role.
-- =====================================================
CREATE OR REPLACE FUNCTION public.company_has_data_consent(
  p_company_id UUID,
  p_candidate_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.candidate_data_disclosures d
    WHERE d.company_id = p_company_id
      AND d.candidate_id = p_candidate_id
      AND d.status = 'accepted'
  );
$$;

GRANT EXECUTE ON FUNCTION public.company_has_data_consent(UUID, UUID) TO authenticated;

-- =====================================================
-- Extend test_audit_logs.resource_type CHECK to include 'consent'
-- (consent audit always uses resource_type='consent')
-- =====================================================
ALTER TABLE public.test_audit_logs
  DROP CONSTRAINT IF EXISTS test_audit_logs_resource_type_check;
ALTER TABLE public.test_audit_logs
  ADD CONSTRAINT test_audit_logs_resource_type_check
  CHECK (resource_type IN ('test', 'invitation', 'result', 'report', 'consent'));

COMMENT ON TABLE public.candidate_data_disclosures IS
  'Per (application,company) LGPD consent for revealing candidate sensitive data (cpf,email,phone,date_of_birth)';
COMMENT ON FUNCTION public.company_has_data_consent(UUID, UUID) IS
  'TRUE when an accepted disclosure exists for the given company+candidate (LGPD gate)';

-- =====================================================
-- ADVERSARIAL VERIFICATION (run to verify, do not apply)
-- =====================================================
-- SELECT to_regclass('public.candidate_data_disclosures') IS NOT NULL AS table_ok,
--        EXISTS(SELECT 1 FROM pg_proc WHERE proname='company_has_data_consent') AS fn_ok,
--        (SELECT pg_get_constraintdef(oid) FROM pg_constraint
--          WHERE conname='test_audit_logs_resource_type_check') AS audit_check,
--        EXISTS(SELECT 1 FROM pg_constraint
--               WHERE conname='candidate_data_disclosures_app_company_unique') AS unique_ok;
-- Expected: table_ok=t, fn_ok=t, audit_check contains 'consent', unique_ok=t.
--
-- -- Test idempotency and consent function:
-- WITH a AS (
--   SELECT ap.id AS app_id, ap.candidate_id, j.company_id
--   FROM public.applications ap JOIN public.jobs j ON j.id = ap.job_id LIMIT 1
-- )
-- INSERT INTO public.candidate_data_disclosures(application_id, candidate_id, company_id, status)
-- SELECT app_id, candidate_id, company_id, 'pending' FROM a
-- ON CONFLICT (application_id, company_id) DO NOTHING
-- RETURNING id;
-- -- should_be_false = f (status is pending, not accepted)
-- SELECT public.company_has_data_consent(
--   (SELECT company_id FROM public.candidate_data_disclosures LIMIT 1),
--   (SELECT candidate_id FROM public.candidate_data_disclosures LIMIT 1)
-- ) AS should_be_false;
-- -- After: UPDATE ... SET status='accepted' -> re-run -> should return t.
-- -- Cleanup: DELETE FROM public.candidate_data_disclosures WHERE status IN ('pending','accepted') (test rows only).
