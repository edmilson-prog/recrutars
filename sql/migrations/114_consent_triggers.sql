-- Migration 114: consent enforcement triggers on applications.
--   enforce_hire_consent     (BEFORE UPDATE): block ->hired without accepted disclosure.
--   create_disclosure_on_offer (AFTER UPDATE): on ->offer, create a pending disclosure
--                                              (idempotent via unique(application_id,company_id)).

-- =====================================================
-- FUNCTION + TRIGGER: enforce_hire_consent (BEFORE UPDATE)
-- Raises if transitioning to 'hired' without an accepted disclosure for the
-- application's company+candidate.
-- =====================================================
CREATE OR REPLACE FUNCTION public.enforce_hire_consent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF NEW.status = 'hired' AND OLD.status IS DISTINCT FROM 'hired' THEN
    SELECT j.company_id INTO v_company_id
    FROM public.jobs j
    WHERE j.id = NEW.job_id;

    IF NOT EXISTS (
      SELECT 1 FROM public.candidate_data_disclosures d
      WHERE d.application_id = NEW.id
        AND d.company_id = v_company_id
        AND d.status = 'accepted'
    ) THEN
      RAISE EXCEPTION 'Contratação bloqueada: o candidato ainda não autorizou o compartilhamento dos dados (LGPD).'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_hire_consent ON public.applications;
CREATE TRIGGER trg_enforce_hire_consent
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_hire_consent();

-- =====================================================
-- FUNCTION + TRIGGER: create_disclosure_on_offer (AFTER UPDATE)
-- On transition to 'offer', insert a pending disclosure (idempotent).
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_disclosure_on_offer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  IF NEW.status = 'offer' AND OLD.status IS DISTINCT FROM 'offer' THEN
    SELECT j.company_id INTO v_company_id
    FROM public.jobs j
    WHERE j.id = NEW.job_id;

    IF v_company_id IS NOT NULL THEN
      INSERT INTO public.candidate_data_disclosures(application_id, candidate_id, company_id, status)
      VALUES (NEW.id, NEW.candidate_id, v_company_id, 'pending')
      ON CONFLICT (application_id, company_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_disclosure_on_offer ON public.applications;
CREATE TRIGGER trg_create_disclosure_on_offer
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_disclosure_on_offer();

COMMENT ON FUNCTION public.enforce_hire_consent() IS
  'Blocks applications.status -> hired without an accepted LGPD disclosure';
COMMENT ON FUNCTION public.create_disclosure_on_offer() IS
  'Creates a pending disclosure when applications.status -> offer (idempotent)';

-- =====================================================
-- ADVERSARIAL VERIFICATION (run to verify, do not apply)
-- =====================================================
-- SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname='enforce_hire_consent') AS fn1,
--        EXISTS(SELECT 1 FROM pg_proc WHERE proname='create_disclosure_on_offer') AS fn2,
--        EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='trg_enforce_hire_consent') AS t1,
--        EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='trg_create_disclosure_on_offer') AS t2;
-- Expected: all t.
--
-- -- Test create_disclosure_on_offer (auto-pending on ->offer):
-- WITH a AS (
--   SELECT ap.id, ap.status FROM public.applications ap
--   WHERE ap.status NOT IN ('offer','hired') LIMIT 1
-- )
-- SELECT id, status FROM a;  -- note original status
-- UPDATE public.applications SET status='offer' WHERE id='<app_id>';
-- SELECT status FROM public.candidate_data_disclosures WHERE application_id='<app_id>'; -- expected: 'pending'
-- -- Idempotency: re-transition should not duplicate (unique constraint):
-- UPDATE public.applications SET status='reviewing' WHERE id='<app_id>';
-- UPDATE public.applications SET status='offer' WHERE id='<app_id>';
-- SELECT count(*) FROM public.candidate_data_disclosures WHERE application_id='<app_id>'; -- expected: 1
-- -- Restore:
-- UPDATE public.applications SET status='<status_original>' WHERE id='<app_id>';
-- DELETE FROM public.candidate_data_disclosures WHERE application_id='<app_id>';
--
-- -- Test enforce_hire_consent BLOCKS without accepted disclosure:
-- DELETE FROM public.candidate_data_disclosures WHERE application_id='<app_id>';
-- UPDATE public.applications SET status='offer' WHERE id='<app_id>'; -- creates pending again
-- UPDATE public.applications SET status='hired' WHERE id='<app_id>'; -- expected: ERROR check_violation "Contratação bloqueada..."
--
-- -- Test enforce_hire_consent ALLOWS with accepted disclosure:
-- UPDATE public.candidate_data_disclosures SET status='accepted', accepted_at=now()
-- WHERE application_id='<app_id>';
-- UPDATE public.applications SET status='hired' WHERE id='<app_id>'; -- expected: success
-- SELECT status FROM public.applications WHERE id='<app_id>'; -- 'hired'
-- -- Restore:
-- UPDATE public.applications SET status='<status_original>' WHERE id='<app_id>';
-- DELETE FROM public.candidate_data_disclosures WHERE application_id='<app_id>';
