-- ============================================================================
-- Migration 074: SECURITY DEFINER function for scenario order mode
-- Allows non-admin users (collaborators) to read the configured scenario order
-- mode from system_settings without being blocked by RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_gauge_pro_scenario_order_mode()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (values -> 'gaugepro' ->> 'scenarioOrderMode')::TEXT,
    'fixed'
  )
  FROM public.system_settings
  WHERE panel = 'admin' AND category = 'ai' AND entity_id IS NULL
  LIMIT 1;
$$;
