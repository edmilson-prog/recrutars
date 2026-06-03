-- Migration 100: RLS gaps for manual plan change by admin
--
-- Context: the admin "Alterar Plano" flow (CompanyDetail) updates the company's
-- subscription, syncs the denormalized companies.plan column, and records an
-- audit row in subscription_history. Two RLS policies were missing:
--
--   1. companies had no admin UPDATE policy (only companies_update_own), so the
--      admin's companies.plan sync matched 0 rows and .single() threw 406.
--   2. subscription_history had no INSERT policy at all, so every audit insert
--      (plan change AND cancellation) was silently blocked with 403.
--
-- Both use get_user_type(auth.uid()) = 'admin', the project-standard admin check.

-- 1) Admin can update any company
CREATE POLICY companies_update_admin ON public.companies
  FOR UPDATE
  USING (public.get_user_type(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_type(auth.uid()) = 'admin');

-- 2) Insert into subscription_history: the subscription owner or an admin
CREATE POLICY subscription_history_insert ON public.subscription_history
  FOR INSERT
  WITH CHECK (
    (subscription_id IN (
      SELECT s.id FROM public.subscriptions s WHERE s.user_id = auth.uid()
    ))
    OR public.get_user_type(auth.uid()) = 'admin'
  );
