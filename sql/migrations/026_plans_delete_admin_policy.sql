-- Migration 026: Add missing DELETE policy for plans table
-- The plans table had SELECT, INSERT, and UPDATE policies but was missing DELETE.
-- Without this policy, RLS silently blocks DELETE operations (returns 0 rows, no error).

CREATE POLICY plans_delete_admin ON public.plans
  FOR DELETE
  TO authenticated
  USING (get_user_type(auth.uid()) = 'admin');
