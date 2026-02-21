-- PRD-083: Candidate Onboarding - New columns and CPF check function
-- Adds onboarding tracking, consent timestamps, and personal profile fields

-- New columns on candidates table
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS marital_status TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Brasileira';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'registration'
  CHECK (onboarding_step IN ('registration','personal_profile','professional_profile','gauge_pro_test','completed'));
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS lgpd_consent_at TIMESTAMPTZ;

-- Backfill: existing candidates already completed onboarding
UPDATE candidates SET onboarding_step = 'completed' WHERE onboarding_step IS NULL OR onboarding_step = 'registration';

-- RPC to check CPF uniqueness without authentication (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_cpf_exists(p_cpf TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM candidates WHERE cpf = p_cpf);
END;
$$;

-- Updated handle_new_user() with CPF support and onboarding_step
-- See trigger definition in migration applied via MCP
