-- =====================================================
-- RecrutaRS: Expand handle_new_user Trigger
-- PRD-063: Creates company/candidate rows atomically
-- =====================================================
-- Execute this in: Supabase Dashboard > SQL Editor
-- AFTER 001_identity_schema.sql has been applied.
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
BEGIN
  _type  := COALESCE(NEW.raw_user_meta_data->>'type', 'candidate');
  _name  := COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuario');
  _phone := NEW.raw_user_meta_data->>'phone';

  -- 1. Create profile (same as before)
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
    INSERT INTO public.companies (
      profile_id, name, phone
    )
    VALUES (
      NEW.id,
      _name,
      _phone
    );
  END IF;
  -- Admin type: only profile row, no additional table

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Auto-creates profiles + company/candidate row on auth.users INSERT. '
  'Reads name, type, phone from raw_user_meta_data. (PRD-063 expanded)';
