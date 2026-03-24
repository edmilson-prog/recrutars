-- Migration 046: Allow authenticated users to read integrations settings
-- Needed so useStripeEnvironment hook can read stripeActiveEnvironment
-- from system_settings for non-admin users (company, candidate).
-- Sensitive keys are masked by the service layer (maskSensitiveFields).

CREATE POLICY "system_settings_public_integrations_read"
ON public.system_settings
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND panel = 'admin'
  AND category = 'integrations'
  AND entity_id IS NULL
);
