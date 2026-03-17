-- Migration 058: Normalizar todos os nomes para UPPERCASE
-- Converte dados existentes e atualiza trigger handle_new_user

-- ============================================================================
-- 1. Converter dados existentes para UPPERCASE
-- ============================================================================

UPDATE profiles SET name = UPPER(name) WHERE name IS NOT NULL AND name != UPPER(name);
UPDATE candidates SET display_name = UPPER(display_name) WHERE display_name IS NOT NULL AND display_name != UPPER(display_name);
UPDATE companies SET name = UPPER(name) WHERE name IS NOT NULL AND name != UPPER(name);
UPDATE team_members SET name = UPPER(name) WHERE name IS NOT NULL AND name != UPPER(name);
UPDATE test_invitations SET candidate_name = UPPER(candidate_name) WHERE candidate_name IS NOT NULL AND candidate_name != UPPER(candidate_name);
UPDATE behavioral_tests SET candidate_name = UPPER(candidate_name) WHERE candidate_name IS NOT NULL AND candidate_name != UPPER(candidate_name);
UPDATE messages SET sender_name = UPPER(sender_name) WHERE sender_name IS NOT NULL AND sender_name != UPPER(sender_name);
UPDATE messages SET receiver_name = UPPER(receiver_name) WHERE receiver_name IS NOT NULL AND receiver_name != UPPER(receiver_name);
UPDATE subscriptions SET user_name = UPPER(user_name) WHERE user_name IS NOT NULL AND user_name != UPPER(user_name);
UPDATE test_audit_logs SET user_name = UPPER(user_name) WHERE user_name IS NOT NULL AND user_name != UPPER(user_name);
UPDATE audit_logs SET performed_by_name = UPPER(performed_by_name) WHERE performed_by_name IS NOT NULL AND performed_by_name != UPPER(performed_by_name);
UPDATE audit_logs SET target_user_name = UPPER(target_user_name) WHERE target_user_name IS NOT NULL AND target_user_name != UPPER(target_user_name);
UPDATE permission_audit_logs SET performed_by_name = UPPER(performed_by_name) WHERE performed_by_name IS NOT NULL AND performed_by_name != UPPER(performed_by_name);
UPDATE permission_audit_logs SET target_user_name = UPPER(target_user_name) WHERE target_user_name IS NOT NULL AND target_user_name != UPPER(target_user_name);
UPDATE settings_history SET changed_by_name = UPPER(changed_by_name) WHERE changed_by_name IS NOT NULL AND changed_by_name != UPPER(changed_by_name);

-- ============================================================================
-- 2. Atualizar trigger handle_new_user para UPPER em TODOS os nomes
-- ============================================================================
-- Mudanca: antes era IF _type = 'candidate' THEN _name := UPPER(_name); END IF;
-- Agora: _name := UPPER(_name); (para candidatos E empresas)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
  _trial_days INTEGER;
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
      INSERT INTO public.company_users (company_id, profile_id, role)
      VALUES (_invited_company_id::UUID, NEW.id, _invited_role);

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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
