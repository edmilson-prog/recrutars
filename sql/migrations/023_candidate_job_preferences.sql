-- Migration 023: Adicionar colunas de preferencias de vagas ao candidates
-- Complementa os campos salary_min/salary_max ja existentes

ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS preferred_sectors TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_roles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_model TEXT[] DEFAULT ARRAY['presencial'],
  ADD COLUMN IF NOT EXISTS contract_type TEXT[] DEFAULT ARRAY['clt'],
  ADD COLUMN IF NOT EXISTS salary_negotiable BOOLEAN DEFAULT true;

-- Index para buscas por modelo de trabalho (usado em filtros de vagas)
CREATE INDEX IF NOT EXISTS idx_candidates_work_model ON public.candidates USING GIN (work_model);
