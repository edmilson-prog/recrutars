-- Migration 094: Calcular candidates.experience_years a partir de curriculum_experiences
-- Antes: experience_years tinha DEFAULT 0 e nunca era preenchido, fazendo todos os candidatos
-- aparecerem com "0 anos de experiência" na UI.
-- Agora: o campo é calculado automaticamente somando os meses das experiências profissionais
-- válidas (formato YYYY-MM) e mantido sincronizado via trigger.

CREATE OR REPLACE FUNCTION public.calculate_candidate_experience_years(p_candidate_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_months INTEGER := 0;
  v_curriculum_id UUID;
  v_now_months INTEGER;
BEGIN
  v_now_months := EXTRACT(YEAR FROM CURRENT_DATE)::INT * 12 + EXTRACT(MONTH FROM CURRENT_DATE)::INT;

  SELECT id INTO v_curriculum_id
  FROM public.curriculums
  WHERE candidate_id = p_candidate_id
  LIMIT 1;

  IF v_curriculum_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(
    GREATEST(0,
      (CASE
        WHEN is_current OR end_date IS NULL OR end_date = '' OR end_date !~ '^\d{4}-\d{2}'
          THEN v_now_months
        ELSE
          (split_part(end_date, '-', 1))::INT * 12 + (split_part(end_date, '-', 2))::INT
      END)
      - ((split_part(start_date, '-', 1))::INT * 12 + (split_part(start_date, '-', 2))::INT)
    )
  ), 0) INTO v_total_months
  FROM public.curriculum_experiences
  WHERE curriculum_id = v_curriculum_id
    AND start_date ~ '^\d{4}-\d{2}';

  RETURN ROUND(v_total_months::NUMERIC / 12);
END;
$$;

COMMENT ON FUNCTION public.calculate_candidate_experience_years(UUID)
  IS 'Calculates total years of experience from curriculum_experiences, summing all valid YYYY-MM dated entries.';

CREATE OR REPLACE FUNCTION public.sync_candidate_experience_years()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_candidate_id UUID;
  v_curriculum_id UUID;
BEGIN
  v_curriculum_id := COALESCE(NEW.curriculum_id, OLD.curriculum_id);

  SELECT candidate_id INTO v_candidate_id
  FROM public.curriculums
  WHERE id = v_curriculum_id;

  IF v_candidate_id IS NOT NULL THEN
    UPDATE public.candidates
    SET experience_years = public.calculate_candidate_experience_years(v_candidate_id)
    WHERE id = v_candidate_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS sync_candidate_experience_years_trigger ON public.curriculum_experiences;
CREATE TRIGGER sync_candidate_experience_years_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.curriculum_experiences
FOR EACH ROW
EXECUTE FUNCTION public.sync_candidate_experience_years();

-- Backfill: popula experience_years para todos os candidatos que tem currículo
UPDATE public.candidates c
SET experience_years = public.calculate_candidate_experience_years(c.id)
WHERE EXISTS (
  SELECT 1 FROM public.curriculums cur WHERE cur.candidate_id = c.id
);
