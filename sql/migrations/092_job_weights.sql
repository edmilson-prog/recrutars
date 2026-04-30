-- 092_job_weights.sql
-- Adiciona 5 colunas de peso por vaga para o algoritmo de match
-- Defaults preservam proporção atual (40/30/20/10) redistribuída em 5 categorias

ALTER TABLE jobs
  ADD COLUMN weight_skills_technical  smallint NOT NULL DEFAULT 25,
  ADD COLUMN weight_skills_behavioral smallint NOT NULL DEFAULT 15,
  ADD COLUMN weight_experience        smallint NOT NULL DEFAULT 30,
  ADD COLUMN weight_gauge_pro         smallint NOT NULL DEFAULT 20,
  ADD COLUMN weight_location          smallint NOT NULL DEFAULT 10;

ALTER TABLE jobs
  ADD CONSTRAINT jobs_weights_sum_check
    CHECK (
      weight_skills_technical + weight_skills_behavioral +
      weight_experience + weight_gauge_pro + weight_location = 100
    );

ALTER TABLE jobs
  ADD CONSTRAINT jobs_weights_range_check
    CHECK (
      weight_skills_technical  BETWEEN 0 AND 70 AND
      weight_skills_behavioral BETWEEN 0 AND 70 AND
      weight_experience        BETWEEN 0 AND 70 AND
      weight_gauge_pro         BETWEEN 0 AND 70 AND
      weight_location          BETWEEN 0 AND 70
    );

COMMENT ON COLUMN jobs.weight_skills_technical IS 'Peso da categoria Skills Técnicas no match (0-70, soma=100)';
COMMENT ON COLUMN jobs.weight_skills_behavioral IS 'Peso da categoria Skills Comportamentais no match (0-70, soma=100)';
COMMENT ON COLUMN jobs.weight_experience IS 'Peso da categoria Experiência no match (0-70, soma=100)';
COMMENT ON COLUMN jobs.weight_gauge_pro IS 'Peso da categoria Perfil Comportamental (Gauge-Pro) no match (0-70, soma=100)';
COMMENT ON COLUMN jobs.weight_location IS 'Peso da categoria Localização no match (0-70, soma=100)';
