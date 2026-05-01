-- 093_jobs_weight_history.sql
-- Histórico de alterações de pesos de match em vagas + trigger de notificação

CREATE TABLE jobs_weight_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  old_weights jsonb NOT NULL,
  new_weights jsonb NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  active_applications_count integer NOT NULL DEFAULT 0,
  reason text
);

CREATE INDEX idx_jobs_weight_history_job ON jobs_weight_history(job_id, changed_at DESC);

ALTER TABLE jobs_weight_history ENABLE ROW LEVEL SECURITY;

-- Empresas veem histórico das próprias vagas; candidatos veem histórico de vagas em que se candidataram; admin vê tudo
CREATE POLICY "Companies and candidates see related history"
  ON jobs_weight_history FOR SELECT
  USING (
    job_id IN (SELECT id FROM jobs WHERE company_id = public.get_company_id(auth.uid()))
    OR job_id IN (SELECT job_id FROM applications WHERE candidate_id IN (SELECT id FROM candidates WHERE profile_id = auth.uid()))
    OR public.get_user_type(auth.uid()) = 'admin'
  );

-- INSERT/UPDATE/DELETE somente via Edge Function (service role bypassa RLS)
CREATE POLICY "No direct inserts" ON jobs_weight_history FOR INSERT WITH CHECK (false);
CREATE POLICY "No updates" ON jobs_weight_history FOR UPDATE USING (false);
CREATE POLICY "No deletes" ON jobs_weight_history FOR DELETE USING (false);

-- Trigger: notifica candidatos ativos quando pesos mudam
CREATE OR REPLACE FUNCTION notify_candidates_on_weight_change()
RETURNS TRIGGER AS $$
DECLARE
  app_record RECORD;
BEGIN
  IF NEW.active_applications_count > 0 THEN
    FOR app_record IN
      SELECT a.candidate_id, c.profile_id, j.title AS job_title
      FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      JOIN jobs j ON j.id = a.job_id
      WHERE a.job_id = NEW.job_id
        AND a.status NOT IN ('rejected', 'hired')
    LOOP
      INSERT INTO notifications (user_id, type, title, description, metadata, action_url)
      VALUES (
        app_record.profile_id,
        'job_weights_changed',
        'Critérios da vaga foram atualizados',
        'A empresa ajustou os critérios de match da vaga "' || app_record.job_title || '". Seu score foi recalculado.',
        jsonb_build_object('job_id', NEW.job_id, 'changed_at', NEW.changed_at),
        '/candidato/vagas/' || NEW.job_id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER jobs_weight_history_notify
  AFTER INSERT ON jobs_weight_history
  FOR EACH ROW EXECUTE FUNCTION notify_candidates_on_weight_change();
