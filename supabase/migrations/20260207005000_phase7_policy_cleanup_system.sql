-- Phase 7: Policy smell cleanup (System domain)
-- System tables, audit logs, activity logs.

-- Helper admin role check:
-- EXISTS (
--   SELECT 1 FROM profiles p
--   WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
--     AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
-- )

-- activity_logs: remove permissive/legacy policies
DROP POLICY IF EXISTS activity_logs_insert ON public.activity_logs;
DROP POLICY IF EXISTS activity_logs_specific_user ON public.activity_logs;
DROP POLICY IF EXISTS activity_logs_super_admin_all ON public.activity_logs;

-- activity_logs: admin full access
CREATE POLICY "admin_all_activity_logs"
  ON public.activity_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- audit_logs: admin read (keep select_own_audit_logs for users)
DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_read_audit_logs"
  ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- system_activities: replace service_role true policy
DROP POLICY IF EXISTS system_activities_admin_read ON public.system_activities;
DROP POLICY IF EXISTS system_activities_service_role_all ON public.system_activities;
CREATE POLICY "system_activities_admin_read"
  ON public.system_activities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
CREATE POLICY "system_activities_service_role_all"
  ON public.system_activities
  FOR ALL TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- system_alerts
DROP POLICY IF EXISTS system_alerts_admin_read ON public.system_alerts;
DROP POLICY IF EXISTS system_alerts_service_role_all ON public.system_alerts;
CREATE POLICY "system_alerts_admin_read"
  ON public.system_alerts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
CREATE POLICY "system_alerts_service_role_all"
  ON public.system_alerts
  FOR ALL TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- system_components
DROP POLICY IF EXISTS system_components_admin_read ON public.system_components;
DROP POLICY IF EXISTS system_components_service_role_all ON public.system_components;
CREATE POLICY "system_components_admin_read"
  ON public.system_components
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
CREATE POLICY "system_components_service_role_all"
  ON public.system_components
  FOR ALL TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- system_overview
DROP POLICY IF EXISTS system_overview_admin_read ON public.system_overview;
DROP POLICY IF EXISTS system_overview_service_role_all ON public.system_overview;
CREATE POLICY "system_overview_admin_read"
  ON public.system_overview
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
CREATE POLICY "system_overview_service_role_all"
  ON public.system_overview
  FOR ALL TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- system_performance
DROP POLICY IF EXISTS system_performance_admin_read ON public.system_performance;
DROP POLICY IF EXISTS system_performance_service_role_all ON public.system_performance;
CREATE POLICY "system_performance_admin_read"
  ON public.system_performance
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
CREATE POLICY "system_performance_service_role_all"
  ON public.system_performance
  FOR ALL TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- system_settings: replace permissive check
DROP POLICY IF EXISTS "Admin read access to system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Superadmin full access to system_settings" ON public.system_settings;
CREATE POLICY "admin_read_system_settings"
  ON public.system_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
CREATE POLICY "superadmin_all_system_settings"
  ON public.system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  );

-- security_settings: replace permissive check
DROP POLICY IF EXISTS "Superadmin full access to security_settings" ON public.security_settings;
CREATE POLICY "superadmin_all_security_settings"
  ON public.security_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  );
