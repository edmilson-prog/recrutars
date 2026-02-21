-- Migration 036: Create get_chatbot_config() function
-- Exposes chatbot enablement settings to non-admin users via SECURITY DEFINER
-- so the ChatbotWidget can check if it should render for candidates/companies.

CREATE OR REPLACE FUNCTION public.get_chatbot_config()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (values -> 'chatbot')::jsonb,
    '{"chatbotEnabledCandidates": true, "chatbotEnabledCompanies": true}'::jsonb
  )
  FROM public.system_settings
  WHERE panel = 'admin'
    AND category = 'ai'
    AND entity_id IS NULL
  LIMIT 1;
$$;
