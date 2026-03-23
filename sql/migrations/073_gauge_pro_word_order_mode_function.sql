-- ============================================================================
-- Migration 073: SECURITY DEFINER function for word order mode
-- Allows non-admin users (collaborators) to read the configured word order
-- mode from system_settings without being blocked by RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_gauge_pro_word_order_mode()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (values -> 'gaugepro' ->> 'wordOrderMode')::TEXT,
    'random'
  )
  FROM public.system_settings
  WHERE panel = 'admin' AND category = 'ai' AND entity_id IS NULL
  LIMIT 1;
$$;
