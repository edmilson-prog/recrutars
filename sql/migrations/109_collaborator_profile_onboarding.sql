-- =====================================================
-- RecrutaRS: Collaborator Profile + Onboarding Gate
-- Fase 2 do épico de onboarding de colaboradores
-- =====================================================
-- Adds job_title + onboarding_step to company_users and
-- phone to profiles. Backfills non-owners to 'profile'.
-- Updates handle_new_user() to gate new invited members.
-- =====================================================

-- 1. New columns -----------------------------------------------------

ALTER TABLE public.company_users
  ADD COLUMN IF NOT EXISTS job_title TEXT;

ALTER TABLE public.company_users
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT NOT NULL DEFAULT 'completed'
  CHECK (onboarding_step IN ('profile', 'completed'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

COMMENT ON COLUMN public.company_users.job_title IS 'Collaborator job title/role within the company (Fase 2)';
COMMENT ON COLUMN public.company_users.onboarding_step IS 'Collaborator onboarding step: profile | completed (Fase 2)';
COMMENT ON COLUMN public.profiles.phone IS 'Personal phone of the user (Fase 2)';

-- 2. Backfill: mark invited (non-owner) members as needing profile ----
-- Owner = company_users row whose profile owns that company.
UPDATE public.company_users cu
SET onboarding_step = 'profile'
WHERE cu.onboarding_step = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = cu.company_id AND c.profile_id = cu.profile_id
  );

-- 3. Update handle_new_user() ----------------------------------------
-- Live definition reproduced verbatim; ONLY change is the invited-member
-- company_users INSERT, which now sets onboarding_step = 'profile'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  _type TEXT;
  _name TEXT;
  _phone TEXT;
  _cpf TEXT;
  _invited BOOLEAN;
  _invited_company_id TEXT;
  _invited_role TEXT;
  _cnpj TEXT;
  _razao_social TEXT;
  _nome_fantasia TEXT;
  _cep TEXT;
  _logradouro TEXT;
  _numero TEXT;
  _complemento TEXT;
  _bairro TEXT;
  _city TEXT;
  _state TEXT;
  _address TEXT;
  _situacao_cadastral TEXT;
  _industry TEXT;
  _size TEXT;
  _basico_plan_id UUID;
BEGIN
  _type  := COALESCE(NEW.raw_user_meta_data->>'type', 'candidate');
  _name  := COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuario');
  _phone := NEW.raw_user_meta_data->>'phone';
  _cpf   := NEW.raw_user_meta_data->>'cpf';
  _invited := COALESCE((NEW.raw_user_meta_data->>'invited')::BOOLEAN, FALSE);

  -- Normalizar nome para UPPERCASE (candidatos E empresas)
  _name := UPPER(_name);

  INSERT INTO public.profiles (id, name, email, type, status, role_id)
  VALUES (
    NEW.id,
    _name,
    NEW.email,
    _type,
    CASE WHEN _invited THEN 'pending' ELSE 'active' END,
    CASE
      WHEN _type = 'candidate' THEN (SELECT id::text FROM public.roles WHERE slug = 'candidate')
      WHEN _type = 'company'   THEN (SELECT id::text FROM public.roles WHERE slug = 'recruiter')
      ELSE NULL
    END
  );

  IF _type = 'candidate' THEN
    INSERT INTO public.candidates (
      profile_id, name, email, phone, cpf, anonymous_id, onboarding_step,
      visibility_mode, visibility_locked
    )
    VALUES (
      NEW.id,
      _name,
      NEW.email,
      _phone,
      _cpf,
      LPAD(FLOOR(1000 + RANDOM() * 9000)::TEXT, 4, '0'),
      CASE WHEN _invited THEN 'completed' ELSE 'personal_profile' END,
      CASE WHEN _invited THEN 'private' ELSE 'public' END,
      _invited
    );
  ELSIF _type = 'company' THEN
    _invited_company_id := NEW.raw_user_meta_data->>'invited_company_id';
    _invited_role := COALESCE(NEW.raw_user_meta_data->>'invited_role', 'member');

    IF _invited_company_id IS NOT NULL THEN
      INSERT INTO public.company_users (company_id, profile_id, role, onboarding_step)
      VALUES (_invited_company_id::UUID, NEW.id, _invited_role, 'profile');

      UPDATE public.company_invites
      SET status = 'accepted', accepted_at = NOW()
      WHERE company_id = _invited_company_id::UUID AND email = NEW.email AND status = 'pending';
    ELSE
      _cnpj := NEW.raw_user_meta_data->>'cnpj';
      _razao_social := NEW.raw_user_meta_data->>'razao_social';
      _nome_fantasia := NEW.raw_user_meta_data->>'nome_fantasia';
      _cep := NEW.raw_user_meta_data->>'cep';
      _logradouro := NEW.raw_user_meta_data->>'logradouro';
      _numero := NEW.raw_user_meta_data->>'numero';
      _complemento := NEW.raw_user_meta_data->>'complemento';
      _bairro := NEW.raw_user_meta_data->>'bairro';
      _city := NEW.raw_user_meta_data->>'city';
      _state := NEW.raw_user_meta_data->>'state';
      _address := NEW.raw_user_meta_data->>'address';
      _situacao_cadastral := NEW.raw_user_meta_data->>'situacao_cadastral';
      _industry := NEW.raw_user_meta_data->>'industry';
      _size := NEW.raw_user_meta_data->>'size';

      INSERT INTO public.companies (
        profile_id, name, phone, plan,
        cnpj, razao_social, nome_fantasia,
        cep, logradouro, numero, complemento, bairro,
        city, state, address,
        situacao_cadastral, industry, size
      )
      VALUES (
        NEW.id, _name, _phone, 'Basico Empresas',
        _cnpj, _razao_social, _nome_fantasia,
        _cep, _logradouro, _numero, _complemento, _bairro,
        _city, _state, _address,
        _situacao_cadastral, _industry, _size
      );

      INSERT INTO public.company_users (company_id, profile_id, role)
      VALUES (
        (SELECT id FROM public.companies WHERE profile_id = NEW.id),
        NEW.id,
        'admin'
      );

      SELECT id
      INTO _basico_plan_id
      FROM public.plans
      WHERE slug = 'basico-empresas' AND type = 'company'
      LIMIT 1;

      IF _basico_plan_id IS NOT NULL THEN
        -- Empresa nova nasce TRAVADA: trial de 0 dias, aguardando liberação
        -- manual do admin (trial_released_at fica NULL).
        INSERT INTO public.subscriptions (
          user_id, plan_id, status, period, price_paid,
          start_date, end_date, renewal_date,
          is_trial, trial_start_date, trial_end_date,
          is_early_adopter,
          user_type, user_name, plan_slug, plan_name
        )
        VALUES (
          NEW.id,
          _basico_plan_id,
          'trial',
          'monthly',
          0,
          NOW(),
          NOW(),
          NOW(),
          TRUE,
          NOW(),
          NOW(),
          FALSE,
          'company',
          _name,
          'basico-empresas',
          'Basico Empresas'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
