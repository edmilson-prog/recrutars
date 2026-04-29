-- =====================================================
-- RecrutaRS Migration 081: Add structured city/state to jobs
-- =====================================================
-- Migra o campo `location` (texto livre) para `city` + `state` estruturados
-- (espelhando o padrão já usado em `candidates`). O campo `location` é
-- mantido e sincronizado automaticamente por trigger para retrocompatibilidade
-- com os ~20 pontos de leitura que ainda consomem job.location como string.
--
-- Estratégia:
--   1. Adiciona colunas city (TEXT) e state (CHAR(2)) — opcionais.
--   2. Cria função helper parse_legacy_location() para extrair UF + cidade
--      de strings livres ("São Paulo, SP", "São Paulo - SP", "São Paulo/SP").
--   3. Backfill: tenta popular city/state a partir de location existente.
--   4. Trigger BEFORE INSERT/UPDATE sincroniza location = "city, state"
--      quando ambos os campos estruturados estão presentes.
--   5. Índice composto (state, city) para acelerar match e filtros.
-- =====================================================

-- -----------------------------------------------------
-- 1. ADD COLUMNS
-- -----------------------------------------------------

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state CHAR(2);

COMMENT ON COLUMN public.jobs.city  IS 'Cidade da vaga (estruturado). NULL quando type=remote ou legado não-parseado.';
COMMENT ON COLUMN public.jobs.state IS 'UF brasileira (2 letras maiúsculas, padrão IBGE). NULL quando type=remote ou legado não-parseado.';

-- CHECK constraint: state deve ser uma UF brasileira válida quando preenchida
ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_state_valid_uf;
ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_state_valid_uf
  CHECK (state IS NULL OR state IN (
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ));

-- -----------------------------------------------------
-- 2. PARSE HELPER (legacy location → city, state)
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.parse_legacy_location(loc TEXT)
RETURNS TABLE(parsed_city TEXT, parsed_state CHAR(2))
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cleaned TEXT;
  tokens  TEXT[];
  tok     TEXT;
  uf_re   TEXT := '^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$';
  uf_match TEXT;
  city_match TEXT;
BEGIN
  IF loc IS NULL OR btrim(loc) = '' THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::CHAR(2);
    RETURN;
  END IF;

  -- Normaliza separadores comuns: vírgula, hífen, barra, pipe → vírgula
  cleaned := regexp_replace(loc, '[/|]|\s-\s|\s+-\s+', ',', 'g');
  -- Quebra em tokens
  tokens  := regexp_split_to_array(cleaned, '\s*,\s*');

  -- Procura uma UF entre os tokens (2 letras maiúsculas válidas)
  FOREACH tok IN ARRAY tokens LOOP
    tok := upper(btrim(tok));
    IF tok ~ uf_re THEN
      uf_match := tok;
      EXIT;
    END IF;
  END LOOP;

  -- Cidade = primeiro token não-UF e não-vazio
  FOREACH tok IN ARRAY tokens LOOP
    IF tok IS NOT NULL AND btrim(tok) <> '' AND upper(btrim(tok)) !~ uf_re THEN
      city_match := btrim(tok);
      EXIT;
    END IF;
  END LOOP;

  RETURN QUERY SELECT city_match, uf_match::CHAR(2);
END;
$$;

COMMENT ON FUNCTION public.parse_legacy_location(TEXT) IS
  'Parser de localização legada (texto livre) para par (cidade, UF). Retorna NULLs quando não consegue identificar UF brasileira válida.';

-- -----------------------------------------------------
-- 3. BACKFILL existing rows
-- -----------------------------------------------------
-- Postgres não permite referenciar a tabela alvo do UPDATE em LATERAL na FROM,
-- por isso usamos um CTE intermediário que computa (id, parsed_city, parsed_state)
-- e fazemos o UPDATE FROM esse CTE.

WITH parsed AS (
  SELECT
    j.id,
    p.parsed_city,
    p.parsed_state
  FROM public.jobs j
  CROSS JOIN LATERAL public.parse_legacy_location(j.location) AS p
  WHERE j.location IS NOT NULL
    AND (j.city IS NULL OR j.state IS NULL)
)
UPDATE public.jobs j
SET city  = parsed.parsed_city,
    state = parsed.parsed_state
FROM parsed
WHERE parsed.id = j.id;

-- -----------------------------------------------------
-- 4. TRIGGER: keep location in sync with city/state
-- -----------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_job_location_from_city_state()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se ambos estruturados presentes, location = "Cidade, UF" (canônico)
  IF NEW.city IS NOT NULL AND NEW.state IS NOT NULL THEN
    NEW.location := NEW.city || ', ' || NEW.state;
  END IF;
  -- Caso contrário, mantém location como veio (preserva legado / remotos)
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_jobs_location ON public.jobs;
CREATE TRIGGER sync_jobs_location
  BEFORE INSERT OR UPDATE OF city, state ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_job_location_from_city_state();

-- -----------------------------------------------------
-- 5. INDEX para match e filtros geográficos
-- -----------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_jobs_state_city
  ON public.jobs(state, city)
  WHERE state IS NOT NULL;

-- -----------------------------------------------------
-- 6. Relatório do backfill (informativo)
-- -----------------------------------------------------

DO $$
DECLARE
  total_jobs INTEGER;
  resolved_jobs INTEGER;
  unresolved_jobs INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_jobs FROM public.jobs WHERE location IS NOT NULL;
  SELECT COUNT(*) INTO resolved_jobs FROM public.jobs WHERE state IS NOT NULL;
  unresolved_jobs := total_jobs - resolved_jobs;
  RAISE NOTICE 'Backfill concluído: % vagas com location | % resolvidas (city+state) | % não-resolvidas (UF não detectada — admin pode revisar)',
    total_jobs, resolved_jobs, unresolved_jobs;
END $$;
