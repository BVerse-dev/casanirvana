-- Phase 7: Fix infinite recursion in profiles RLS policies
-- Use security definer helper functions instead of self-referencing subqueries.

-- Helper functions (bypass RLS safely)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE (p.id = auth.uid()) OR (p.user_id = auth.uid())
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_community_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT p.community_id
  FROM public.profiles p
  WHERE (p.id = auth.uid()) OR (p.user_id = auth.uid())
  LIMIT 1;
$$;

-- Replace profiles policies that referenced profiles (causing recursion)
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_read_profiles_same_community" ON public.profiles;

CREATE POLICY "admin_all_profiles"
  ON public.profiles
  FOR ALL TO authenticated
  USING (
    public.current_user_role() IN ('admin','superadmin','agency_manager','facility_manager')
  )
  WITH CHECK (
    public.current_user_role() IN ('admin','superadmin','agency_manager','facility_manager')
  );

CREATE POLICY "users_read_profiles_same_community"
  ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.current_user_community_id() IS NOT NULL
    AND public.current_user_community_id() = profiles.community_id
  );
