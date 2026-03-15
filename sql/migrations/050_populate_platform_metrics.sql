-- Migration 050: Populate platform_metrics_daily
-- Creates a reusable function to aggregate daily metrics and backfills historical data

-- Function to populate metrics for a single day
CREATE OR REPLACE FUNCTION populate_daily_metrics(target_date DATE)
RETURNS VOID AS $$
DECLARE
  v_total_candidates   INT;
  v_total_companies    INT;
  v_new_candidates     INT;
  v_new_companies      INT;
  v_active_jobs        INT;
  v_new_jobs           INT;
  v_applications       INT;
  v_interviews_sched   INT;
  v_interviews_done    INT;
  v_hires              INT;
  v_tests_started      INT;
  v_tests_completed    INT;
  v_mrr                NUMERIC;
  v_new_subs           INT;
  v_cancellations      INT;
  v_revenue            NUMERIC;
BEGIN
  -- Candidates
  SELECT COUNT(*) INTO v_total_candidates
    FROM candidates WHERE created_at::date <= target_date;

  SELECT COUNT(*) INTO v_new_candidates
    FROM candidates WHERE created_at::date = target_date;

  -- Companies
  SELECT COUNT(*) INTO v_total_companies
    FROM companies WHERE created_at::date <= target_date;

  SELECT COUNT(*) INTO v_new_companies
    FROM companies WHERE created_at::date = target_date;

  -- Jobs
  SELECT COUNT(*) INTO v_active_jobs
    FROM jobs WHERE created_at::date <= target_date
      AND (status = 'active' OR status = 'open' OR status = 'published');

  SELECT COUNT(*) INTO v_new_jobs
    FROM jobs WHERE created_at::date = target_date;

  -- Applications
  SELECT COUNT(*) INTO v_applications
    FROM applications WHERE applied_at::date = target_date;

  -- Interviews
  SELECT COUNT(*) INTO v_interviews_sched
    FROM interviews WHERE created_at::date = target_date;

  SELECT COUNT(*) INTO v_interviews_done
    FROM interviews WHERE created_at::date = target_date
      AND (status = 'completed' OR status = 'done');

  -- Hires
  SELECT COUNT(*) INTO v_hires
    FROM applications WHERE updated_at::date = target_date
      AND status = 'hired';

  -- Behavioral tests
  SELECT COUNT(*) INTO v_tests_started
    FROM behavioral_tests WHERE created_at::date = target_date;

  SELECT COUNT(*) INTO v_tests_completed
    FROM behavioral_tests WHERE completed_at::date = target_date;

  -- Subscriptions
  SELECT COUNT(*) INTO v_new_subs
    FROM subscriptions WHERE created_at::date = target_date;

  SELECT COUNT(*) INTO v_cancellations
    FROM subscriptions WHERE cancelled_at::date = target_date;

  -- MRR from active subscriptions as of target_date
  SELECT COALESCE(SUM(price_paid), 0) INTO v_mrr
    FROM subscriptions
    WHERE status = 'active'
      AND created_at::date <= target_date
      AND (cancelled_at IS NULL OR cancelled_at::date > target_date);

  -- Daily revenue (new subscriptions on that day)
  SELECT COALESCE(SUM(price_paid), 0) INTO v_revenue
    FROM subscriptions WHERE created_at::date = target_date;

  -- Upsert
  INSERT INTO platform_metrics_daily (
    metric_date, total_candidates, total_companies,
    new_candidates, new_companies, active_jobs, new_jobs,
    applications, interviews_scheduled, interviews_done,
    hires, tests_started, tests_completed,
    mrr, new_subscriptions, cancellations, revenue
  ) VALUES (
    target_date, v_total_candidates, v_total_companies,
    v_new_candidates, v_new_companies, v_active_jobs, v_new_jobs,
    v_applications, v_interviews_sched, v_interviews_done,
    v_hires, v_tests_started, v_tests_completed,
    v_mrr, v_new_subs, v_cancellations, v_revenue
  )
  ON CONFLICT (metric_date) DO UPDATE SET
    total_candidates    = EXCLUDED.total_candidates,
    total_companies     = EXCLUDED.total_companies,
    new_candidates      = EXCLUDED.new_candidates,
    new_companies       = EXCLUDED.new_companies,
    active_jobs         = EXCLUDED.active_jobs,
    new_jobs            = EXCLUDED.new_jobs,
    applications        = EXCLUDED.applications,
    interviews_scheduled = EXCLUDED.interviews_scheduled,
    interviews_done     = EXCLUDED.interviews_done,
    hires               = EXCLUDED.hires,
    tests_started       = EXCLUDED.tests_started,
    tests_completed     = EXCLUDED.tests_completed,
    mrr                 = EXCLUDED.mrr,
    new_subscriptions   = EXCLUDED.new_subscriptions,
    cancellations       = EXCLUDED.cancellations,
    revenue             = EXCLUDED.revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: populate from earliest data date to today
DO $$
DECLARE
  d DATE;
  start_date DATE;
BEGIN
  -- Find the earliest date with any data
  SELECT MIN(earliest) INTO start_date FROM (
    SELECT MIN(created_at::date) AS earliest FROM candidates
    UNION ALL
    SELECT MIN(created_at::date) FROM companies
    UNION ALL
    SELECT MIN(created_at::date) FROM jobs
  ) sub;

  -- If no data exists, skip
  IF start_date IS NULL THEN
    RETURN;
  END IF;

  -- Loop from start_date to today
  FOR d IN SELECT generate_series(start_date, CURRENT_DATE, '1 day'::interval)::date
  LOOP
    PERFORM populate_daily_metrics(d);
  END LOOP;
END;
$$;
