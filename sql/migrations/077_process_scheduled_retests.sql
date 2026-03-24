-- Migration 077: Automated retest scheduling via pg_cron
-- Processes retest_schedules where next_date has arrived and auto_send is enabled.
-- Creates test_invitations and updates the schedule for the next cycle.
-- Applied via MCP on 2026-03-24.

CREATE OR REPLACE FUNCTION public.process_scheduled_retests()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_rec RECORD;
  v_test_id UUID;
  v_test_name TEXT;
  v_new_next_date DATE;
  v_interval INTERVAL;
  v_existing_count INTEGER;
BEGIN
  -- Find all due schedules with active members
  FOR v_rec IN
    SELECT
      rs.id AS schedule_id,
      rs.member_id,
      rs.frequency,
      rs.next_date,
      tm.name AS member_name,
      tm.email AS member_email,
      tm.company_id,
      tm.department_id
    FROM retest_schedules rs
    JOIN team_members tm ON tm.id = rs.member_id
    WHERE rs.auto_send = TRUE
      AND rs.next_date::date <= CURRENT_DATE
      AND tm.status = 'active'
  LOOP
    BEGIN
      -- Find the most recent active test for this company
      SELECT ct.id, ct.name INTO v_test_id, v_test_name
      FROM company_tests ct
      WHERE ct.company_id = v_rec.company_id
        AND ct.status = 'active'
      ORDER BY ct.created_at DESC
      LIMIT 1;

      -- Skip if no active test exists
      IF v_test_id IS NULL THEN
        RAISE NOTICE '[process_scheduled_retests] No active test for company %, skipping member %',
          v_rec.company_id, v_rec.member_id;
        CONTINUE;
      END IF;

      -- Check for existing pending invitation (avoid duplicates)
      SELECT COUNT(*) INTO v_existing_count
      FROM test_invitations
      WHERE test_id = v_test_id
        AND team_member_id = v_rec.member_id
        AND status IN ('sent', 'viewed', 'started');

      IF v_existing_count > 0 THEN
        RAISE NOTICE '[process_scheduled_retests] Pending invitation already exists for member %, skipping',
          v_rec.member_id;
        CONTINUE;
      END IF;

      -- Create test invitation
      INSERT INTO test_invitations (
        test_id,
        team_member_id,
        candidate_name,
        candidate_email,
        method,
        status,
        expires_at,
        sent_by,
        invite_origin,
        delivery_channel,
        department_id
      ) VALUES (
        v_test_id,
        v_rec.member_id,
        v_rec.member_name,
        v_rec.member_email,
        'email',
        'sent',
        NOW() + INTERVAL '30 days',
        NULL,
        'retest_schedule',
        'email',
        v_rec.department_id
      );

      -- Calculate next date based on frequency
      v_interval := CASE v_rec.frequency
        WHEN '3months' THEN INTERVAL '3 months'
        WHEN '6months' THEN INTERVAL '6 months'
        WHEN '9months' THEN INTERVAL '9 months'
        WHEN '12months' THEN INTERVAL '12 months'
        ELSE INTERVAL '6 months'
      END;
      v_new_next_date := CURRENT_DATE + v_interval;

      -- Update schedule: last_sent_at and next_date
      UPDATE retest_schedules
      SET last_sent_at = NOW(),
          next_date = v_new_next_date::text
      WHERE id = v_rec.schedule_id;

      -- Log event in team_member_events
      INSERT INTO team_member_events (
        team_member_id,
        company_id,
        event_type,
        event_date,
        description,
        metadata,
        performed_by,
        visibility
      ) VALUES (
        v_rec.member_id,
        v_rec.company_id,
        'retest_scheduled_sent',
        CURRENT_DATE,
        'Reteste automático enviado — Teste: ' || v_test_name,
        jsonb_build_object(
          'test_id', v_test_id,
          'test_name', v_test_name,
          'frequency', v_rec.frequency,
          'next_date', v_new_next_date::text,
          'source', 'cron_process_scheduled_retests'
        ),
        NULL,
        'all_managers'
      );

      v_count := v_count + 1;
      RAISE NOTICE '[process_scheduled_retests] Sent retest for member % (test: %)', v_rec.member_id, v_test_name;

    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '[process_scheduled_retests] Error processing schedule %: %', v_rec.schedule_id, SQLERRM;
      CONTINUE;
    END;
  END LOOP;

  RAISE NOTICE '[process_scheduled_retests] Processed % retests', v_count;
  RETURN v_count;
END;
$$;

-- Schedule cron job: daily at 8 AM UTC
SELECT cron.schedule(
  'process-scheduled-retests',
  '0 8 * * *',
  $$SELECT public.process_scheduled_retests()$$
);
