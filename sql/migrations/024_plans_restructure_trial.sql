-- =====================================================
-- RecrutaRS: Plans Restructure & Trial System
-- PRD-074: Reestruturacao dos Planos de Empresas
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 023_candidate_job_preferences.sql has been applied.
-- =====================================================

-- =====================================================
-- 1. ALTER TABLE plans — new columns for trial, discount, bonus
-- =====================================================

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS trial_duration_days INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_min_period TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bonus_tests JSONB DEFAULT NULL;

COMMENT ON COLUMN public.plans.trial_duration_days IS 'Duration of trial in days (null = not a trial plan)';
COMMENT ON COLUMN public.plans.discount_percentage IS 'Discount % for long-term subscriptions (e.g. 10)';
COMMENT ON COLUMN public.plans.discount_min_period IS 'Minimum period to qualify for discount (e.g. semiannual)';
COMMENT ON COLUMN public.plans.bonus_tests IS 'Bonus behavioral tests per period JSON (e.g. {"semiannual": 3, "annual": 3})';

-- =====================================================
-- 2. ALTER TABLE subscriptions — trial columns + missing columns
-- =====================================================

-- Add trial-specific columns
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bonus_tests_remaining INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_tests_total INTEGER DEFAULT 0;

-- Add columns that the service layer already uses but may be missing from DDL
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS plan_slug TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT NULL;

-- Index for trial queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_trial ON public.subscriptions(is_trial);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end_date ON public.subscriptions(trial_end_date);

COMMENT ON COLUMN public.subscriptions.is_trial IS 'Whether this subscription is a trial (PRD-074)';
COMMENT ON COLUMN public.subscriptions.trial_start_date IS 'Trial start date (PRD-074)';
COMMENT ON COLUMN public.subscriptions.trial_end_date IS 'Trial end date — after this date, access is blocked (PRD-074)';
COMMENT ON COLUMN public.subscriptions.bonus_tests_remaining IS 'Remaining bonus behavioral tests credits (PRD-074)';
COMMENT ON COLUMN public.subscriptions.bonus_tests_total IS 'Total bonus behavioral tests credited (PRD-074)';

-- =====================================================
-- 3. SEED: Update existing company plans + insert Basico
-- =====================================================

-- 3a. Update "Essencial Empresas" (was free, now paid R$199)
UPDATE public.plans
SET
  name = 'Essencial Empresas',
  slug = 'essencial-empresas',
  description = 'Para empresas em crescimento. Acesso intermediario com mensagens, banco de talentos e comparacao de candidatos.',
  description_short = 'Para empresas em crescimento',
  is_free = FALSE,
  prices = '{"monthly": 199, "quarterly": 199, "semiannual": 179.10, "annual": 179.10}'::JSONB,
  badge = NULL,
  sort_order = 2,
  discount_percentage = 10,
  discount_min_period = 'semiannual',
  bonus_tests = '{"semiannual": 3, "annual": 3}'::JSONB,
  features = ARRAY[
    'Ate 5 vagas ativas/mes',
    'Ate 10 candidatos por vaga ativa',
    'Curriculo do candidato: acesso completo',
    'Perfil comportamental: acesso intermediario',
    'Compatibilidade vaga/candidato com IA',
    'Mensagens com agendamento de entrevistas',
    'Dashboard intermediario com comparacao',
    'Banco de talentos',
    'Suporte por e-mail e chat'
  ]
WHERE slug = 'essencial-empresas' AND type = 'company';

-- 3b. Update "Selecao Inteligente" -> "Avancar Empresas"
UPDATE public.plans
SET
  name = 'Avancar Empresas',
  slug = 'avancar-empresas',
  description = 'Para empresas que buscam os melhores talentos. Sugestao de candidatos via IA e entrevistas online.',
  description_short = 'Para empresas que buscam os melhores talentos',
  is_free = FALSE,
  prices = '{"monthly": 249, "quarterly": 249, "semiannual": 224.10, "annual": 224.10}'::JSONB,
  badge = 'Mais popular',
  sort_order = 3,
  discount_percentage = 10,
  discount_min_period = 'semiannual',
  bonus_tests = '{"semiannual": 5, "annual": 5}'::JSONB,
  features = ARRAY[
    'Ate 10 vagas ativas/mes',
    'Ate 15 candidatos por vaga ativa',
    'Curriculo do candidato: acesso completo',
    'Perfil comportamental: acesso avancado',
    'Sugestao de candidatos compativeis via IA',
    'Mensagens com entrevistas online na plataforma',
    'Dashboard avancado com comparacao',
    'Banco de talentos',
    'Suporte por e-mail e chat'
  ]
WHERE slug = 'selecao-inteligente' AND type = 'company';

-- 3c. Update "Recrutamento Premium" -> "Premium Empresas"
UPDATE public.plans
SET
  name = 'Premium Empresas',
  slug = 'premium-empresas',
  description = 'Para empresas que querem o melhor do recrutamento. Vagas ilimitadas, gestao de equipes e IA completa.',
  description_short = 'Para empresas que querem o melhor do recrutamento',
  is_free = FALSE,
  prices = '{"monthly": 349, "quarterly": 349, "semiannual": 314.10, "annual": 314.10}'::JSONB,
  badge = 'Completo',
  sort_order = 4,
  discount_percentage = 10,
  discount_min_period = 'semiannual',
  bonus_tests = '{"semiannual": 10, "annual": 10}'::JSONB,
  features = ARRAY[
    'Vagas ativas ILIMITADAS',
    'Candidatos por vaga ILIMITADOS',
    'Curriculo do candidato: acesso completo',
    'Perfil comportamental: acesso COMPLETO',
    'Destaque MAXIMO com IA indicando melhores talentos',
    'Mensagens com entrevistas online na plataforma',
    'Dashboard COMPLETO com gestao e relatorios',
    'Gestao de equipes com testes por setor e IA',
    'Banco de talentos',
    'Suporte por e-mail, chat e WhatsApp'
  ]
WHERE slug = 'recrutamento-premium' AND type = 'company';

-- 3d. Insert "Basico Empresas" (trial plan)
INSERT INTO public.plans (
  name, slug, type, description, description_short, features,
  prices, badge, is_free, is_active, sort_order,
  trial_duration_days, discount_percentage, discount_min_period, bonus_tests
)
VALUES (
  'Basico Empresas',
  'basico-empresas',
  'company',
  'Plano gratuito de teste por 3 meses para empresas que estao comecando a recrutar.',
  'Para empresas que estao comecando',
  ARRAY[
    'Ate 2 vagas ativas/mes',
    'Ate 5 candidatos por vaga ativa',
    'Curriculo do candidato: acesso completo',
    'Perfil comportamental: acesso basico',
    'Compatibilidade vaga/candidato: indicacao basica',
    'Dashboard basico',
    'Suporte por e-mail'
  ],
  '{"monthly": 0, "quarterly": 0, "semiannual": 0, "annual": 0}'::JSONB,
  'Trial Gratuito',
  TRUE,
  TRUE,
  1,
  90,
  0,
  NULL,
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  description_short = EXCLUDED.description_short,
  features = EXCLUDED.features,
  prices = EXCLUDED.prices,
  badge = EXCLUDED.badge,
  is_free = EXCLUDED.is_free,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  trial_duration_days = EXCLUDED.trial_duration_days,
  discount_percentage = EXCLUDED.discount_percentage;

-- =====================================================
-- 4. Update default plan on companies table
-- =====================================================

ALTER TABLE public.companies
  ALTER COLUMN plan SET DEFAULT 'Basico Empresas';

-- =====================================================
-- 5. Update handle_new_user() trigger to create trial subscription
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
  _company_id UUID;
  _basico_plan_id UUID;
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
    -- Create company with Basico plan
    INSERT INTO public.companies (
      profile_id, name, phone, plan
    )
    VALUES (
      NEW.id,
      _name,
      _phone,
      'Basico Empresas'
    )
    RETURNING id INTO _company_id;

    -- PRD-074: Auto-create trial subscription for new companies
    SELECT id INTO _basico_plan_id
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
        NOW() + INTERVAL '90 days',
        NOW() + INTERVAL '90 days',
        TRUE,
        NOW(),
        NOW() + INTERVAL '90 days',
        FALSE,
        'company',
        _name,
        'basico-empresas',
        'Basico Empresas'
      );
    END IF;
  END IF;
  -- Admin type: only profile row, no additional table

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Auto-creates profiles + company/candidate row on auth.users INSERT. '
  'For companies, also creates a trial subscription for Basico Empresas plan (PRD-074). '
  'Reads name, type, phone from raw_user_meta_data.';

-- =====================================================
-- Done. PRD-074 migration complete.
-- =====================================================
