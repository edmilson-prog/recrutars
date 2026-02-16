-- Migration 022: Fix applications_count to exclude withdrawn
-- O trigger anterior so disparava em INSERT/DELETE.
-- Candidaturas com status 'withdrawn' continuavam contadas no applications_count.
-- Agora o trigger trata UPDATE de status para manter contagem precisa.

-- 1) Atualizar funcao trigger
CREATE OR REPLACE FUNCTION public.update_job_applications_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'withdrawn' THEN
      UPDATE public.jobs
        SET applications_count = applications_count + 1
        WHERE id = NEW.job_id;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'withdrawn' THEN
      UPDATE public.jobs
        SET applications_count = applications_count - 1
        WHERE id = OLD.job_id;
    END IF;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status <> 'withdrawn' AND NEW.status = 'withdrawn' THEN
      UPDATE public.jobs
        SET applications_count = applications_count - 1
        WHERE id = NEW.job_id;
    ELSIF OLD.status = 'withdrawn' AND NEW.status <> 'withdrawn' THEN
      UPDATE public.jobs
        SET applications_count = applications_count + 1
        WHERE id = NEW.job_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- 2) Recriar trigger com suporte a UPDATE OF status
DROP TRIGGER IF EXISTS trg_update_job_applications_count ON public.applications;
CREATE TRIGGER trg_update_job_applications_count
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_applications_count();

-- 3) Recalcular contagens existentes (excluindo withdrawn)
UPDATE public.jobs j
SET applications_count = (
  SELECT COUNT(*)
  FROM public.applications a
  WHERE a.job_id = j.id
    AND a.status <> 'withdrawn'
);
