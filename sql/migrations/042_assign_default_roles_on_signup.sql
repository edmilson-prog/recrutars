-- 042: Assign default roles on signup
-- Candidates get 'candidate' role, companies get 'recruiter' role
-- Also backfills existing profiles without a role

-- Step 1: Disable audit trigger during backfill to avoid UUID cast errors
ALTER TABLE profiles DISABLE TRIGGER audit_profile_changes_trigger;

-- Step 2: Backfill existing profiles without a role
UPDATE profiles SET role_id = (SELECT id::text FROM roles WHERE slug = 'candidate')
WHERE type = 'candidate' AND role_id IS NULL;

UPDATE profiles SET role_id = (SELECT id::text FROM roles WHERE slug = 'recruiter')
WHERE type = 'company' AND role_id IS NULL;

-- Step 3: Re-enable audit trigger
ALTER TABLE profiles ENABLE TRIGGER audit_profile_changes_trigger;

-- Step 4: Update handle_new_user() to assign role_id on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _type TEXT;
  _name TEXT;
  _phone TEXT;
  _cpf TEXT;
  _invited BOOLEAN;
  _invited_company_id TEXT;
  _invited_role TEXT;
  -- CNPJ fields (PRD-078)
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
  -- PRD-079: Trial subscription
  _basico_plan_id UUID;
  _trial_days INTEGER;
BEGIN
  _type  := COALESCE(NEW.raw_user_meta_data->>'type', 'candidate');
  _name  := COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuario');
  _phone := NEW.raw_user_meta_data->>'phone';
  _cpf   := NEW.raw_user_meta_data->>'cpf';
  _invited := COALESCE((NEW.raw_user_meta_data->>'invited')::BOOLEAN, FALSE);

  -- Normalize candidate names to UPPERCASE
  IF _type = 'candidate' THEN
    _name := UPPER(_name);
  END IF;

  -- 1. Create profile with default role
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

  -- 2. Create type-specific record
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
      -- Invited user: link to existing company via company_users
      INSERT INTO public.company_users (company_id, profile_id, role)
      VALUES (_invited_company_id::UUID, NEW.id, _invited_role);

      -- Mark invite as accepted
      UPDATE public.company_invites
      SET status = 'accepted', accepted_at = NOW()
      WHERE company_id = _invited_company_id::UUID AND email = NEW.email AND status = 'pending';
    ELSE
      -- Normal signup: create new company (with CNPJ data if available)
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

      -- Add owner to company_users as admin
      INSERT INTO public.company_users (company_id, profile_id, role)
      VALUES (
        (SELECT id FROM public.companies WHERE profile_id = NEW.id),
        NEW.id,
        'admin'
      );

      -- PRD-079: Auto-create trial subscription with dynamic duration (RF-003)
      SELECT id, COALESCE(trial_duration_days, 90)
      INTO _basico_plan_id, _trial_days
      FROM public.plans
      WHERE slug = 'basico-empresas' AND type = 'company'
      LIMIT 1;

      IF _basico_plan_id IS NOT NULL THEN
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
          NOW() + (_trial_days || ' days')::INTERVAL,
          NOW() + (_trial_days || ' days')::INTERVAL,
          TRUE,
          NOW(),
          NOW() + (_trial_days || ' days')::INTERVAL,
          FALSE,
          'company',
          _name,
          'basico-empresas',
          'Basico Empresas'
        );
      END IF;
    END IF;
  END IF;
  -- Admin type: only profile row, no additional table

  RETURN NEW;
END;
$function$;
