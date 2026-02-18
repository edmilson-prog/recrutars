-- =====================================================
-- RecrutaRS: PRD-079 — Vinculacao Obrigatoria de Plano e Trial
-- Aplicado via MCP Supabase em 2026-02-18
-- =====================================================
-- Este arquivo documenta as duas migracoes aplicadas:
-- 1. update_handle_new_user_trial_subscription
-- 2. migrate_existing_companies_trial_subscription
-- =====================================================

-- =====================================================
-- 1. Atualizar trigger handle_new_user() para criar
--    trial subscription com duracao dinamica (RF-003)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _type TEXT;
  _name TEXT;
  _phone TEXT;
  _invited_company_id TEXT;
  _invited_role TEXT;
  -- Campos CNPJ (PRD-078)
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

  -- 1. Create profile
  INSERT INTO public.profiles (id, name, email, type, status)
  VALUES (
    NEW.id,
    _name,
    NEW.email,
    _type,
    'active'
  );

  -- 2. Create type-specific record
  IF _type = 'candidate' THEN
    INSERT INTO public.candidates (
      profile_id, name, email, phone, anonymous_id
    )
    VALUES (
      NEW.id,
      _name,
      NEW.email,
      _phone,
      LPAD(FLOOR(1000 + RANDOM() * 9000)::TEXT, 4, '0')
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
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Auto-creates profiles + company/candidate row on auth.users INSERT. '
  'For companies (normal signup), also creates a trial subscription with dynamic duration from plans.trial_duration_days (PRD-079). '
  'Handles CNPJ data (PRD-078) and invited company users (PRD-078). '
  'Reads name, type, phone, cnpj fields from raw_user_meta_data.';

-- =====================================================
-- 2. Migrar empresas existentes sem subscription
-- =====================================================

INSERT INTO public.subscriptions (
  user_id, plan_id, status, period, price_paid,
  start_date, end_date, renewal_date,
  is_trial, trial_start_date, trial_end_date,
  is_early_adopter,
  user_type, user_name, plan_slug, plan_name
)
SELECT
  c.profile_id,
  p.id,
  'trial',
  'monthly',
  0,
  NOW(),
  NOW() + (COALESCE(p.trial_duration_days, 90) || ' days')::INTERVAL,
  NOW() + (COALESCE(p.trial_duration_days, 90) || ' days')::INTERVAL,
  TRUE,
  NOW(),
  NOW() + (COALESCE(p.trial_duration_days, 90) || ' days')::INTERVAL,
  FALSE,
  'company',
  c.name,
  'basico-empresas',
  'Basico Empresas'
FROM public.companies c
CROSS JOIN (
  SELECT id, trial_duration_days
  FROM public.plans
  WHERE slug = 'basico-empresas' AND type = 'company'
  LIMIT 1
) p
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = c.profile_id
);

-- Normalize companies.plan field
UPDATE public.companies
SET plan = 'Basico Empresas'
WHERE plan != 'Basico Empresas'
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = companies.profile_id
      AND s.status = 'active'
  );

-- Audit trail
INSERT INTO public.subscription_history (
  subscription_id, action, to_plan_id, notes
)
SELECT
  s.id,
  'created',
  s.plan_id,
  'PRD-079 migration: company normalized to trial'
FROM public.subscriptions s
INNER JOIN public.companies c ON c.profile_id = s.user_id
WHERE s.is_trial = TRUE
  AND s.plan_slug = 'basico-empresas'
  AND NOT EXISTS (
    SELECT 1 FROM public.subscription_history sh WHERE sh.subscription_id = s.id
  );
