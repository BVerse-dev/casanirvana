-- Phase 7: Policy smell cleanup (Notifications domain)
-- Replaces permissive policies with scoped admin/service/user access.

-- Helper admin role check:
-- EXISTS (
--   SELECT 1 FROM profiles p
--   WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
--     AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
-- )

-- notifications: replace system insert policy
drop policy if exists "System can insert notifications" on public.notifications;
create policy "service_role_insert_notifications"
  on public.notifications
  for insert to service_role
  with check (auth.role() = 'service_role');

-- notification_analytics: replace service_role_all
drop policy if exists "service_role_all" on public.notification_analytics;
create policy "service_role_all"
  on public.notification_analytics
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- notification_campaigns: replace service_role_all
drop policy if exists "notification_campaigns_service_role_all" on public.notification_campaigns;
create policy "notification_campaigns_service_role_all"
  on public.notification_campaigns
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- notification_channel_configs: replace service_role_all
drop policy if exists "service_role_all" on public.notification_channel_configs;
create policy "service_role_all"
  on public.notification_channel_configs
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- notification_metrics: replace service_role_all
drop policy if exists "service_role_all" on public.notification_metrics;
create policy "service_role_all"
  on public.notification_metrics
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- notification_rules: replace service_role_all
drop policy if exists "service_role_all" on public.notification_rules;
create policy "service_role_all"
  on public.notification_rules
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- notification_logs: replace service_role policy
drop policy if exists "Service role can manage all notification logs" on public.notification_logs;
create policy "service_role_all_notification_logs"
  on public.notification_logs
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- notification_templates: remove public dev policy and tighten admin access
drop policy if exists "Public access for development" on public.notification_templates;
drop policy if exists "Super admin access" on public.notification_templates;
create policy "admin_all_notification_templates"
  on public.notification_templates
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_notification_templates"
  on public.notification_templates
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- in_app_notifications: replace permissive policies
drop policy if exists "in_app_notifications_delete" on public.in_app_notifications;
drop policy if exists "in_app_notifications_insert" on public.in_app_notifications;
drop policy if exists "in_app_notifications_select" on public.in_app_notifications;
drop policy if exists "in_app_notifications_update" on public.in_app_notifications;
create policy "admin_all_in_app_notifications"
  on public.in_app_notifications
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_in_app_notifications"
  on public.in_app_notifications
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- in_app_notification_metrics: replace permissive policies
drop policy if exists "in_app_notification_metrics_insert" on public.in_app_notification_metrics;
drop policy if exists "in_app_notification_metrics_select" on public.in_app_notification_metrics;
create policy "admin_all_in_app_notification_metrics"
  on public.in_app_notification_metrics
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_in_app_notification_metrics"
  on public.in_app_notification_metrics
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- in_app_notification_recipients: replace permissive policies
drop policy if exists "in_app_notification_recipients_insert" on public.in_app_notification_recipients;
drop policy if exists "in_app_notification_recipients_select" on public.in_app_notification_recipients;
create policy "admin_all_in_app_notification_recipients"
  on public.in_app_notification_recipients
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_in_app_notification_recipients"
  on public.in_app_notification_recipients
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
create policy "user_read_in_app_notification_recipients"
  on public.in_app_notification_recipients
  for select to authenticated
  using (user_id = auth.uid());

-- in_app_notification_settings: replace permissive policy
drop policy if exists "Allow all operations for authenticated users" on public.in_app_notification_settings;
create policy "admin_all_in_app_notification_settings"
  on public.in_app_notification_settings
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- push_notifications: add admin_all and tighten service_role_all
drop policy if exists "admin_read" on public.push_notifications;
drop policy if exists "service_role_all" on public.push_notifications;
create policy "admin_all_push_notifications"
  on public.push_notifications
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_push_notifications"
  on public.push_notifications
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- push_notification_devices: add admin_all and tighten service_role_all
drop policy if exists "admin_read" on public.push_notification_devices;
drop policy if exists "service_role_all" on public.push_notification_devices;
create policy "admin_all_push_notification_devices"
  on public.push_notification_devices
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_push_notification_devices"
  on public.push_notification_devices
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- push_notification_templates: add admin_all and tighten service_role_all
drop policy if exists "admin_read" on public.push_notification_templates;
drop policy if exists "service_role_all" on public.push_notification_templates;
create policy "admin_all_push_notification_templates"
  on public.push_notification_templates
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_push_notification_templates"
  on public.push_notification_templates
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- push_notification_audiences: add admin_all and tighten service_role_all
drop policy if exists "admin_read" on public.push_notification_audiences;
drop policy if exists "service_role_all" on public.push_notification_audiences;
create policy "admin_all_push_notification_audiences"
  on public.push_notification_audiences
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_push_notification_audiences"
  on public.push_notification_audiences
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- sms tables: add admin_all and tighten service_role_all
drop policy if exists "admin_read" on public.sms_notifications;
drop policy if exists "service_role_all" on public.sms_notifications;
create policy "admin_all_sms_notifications"
  on public.sms_notifications
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_sms_notifications"
  on public.sms_notifications
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "admin_read" on public.sms_notification_recipients;
drop policy if exists "service_role_all" on public.sms_notification_recipients;
create policy "admin_all_sms_notification_recipients"
  on public.sms_notification_recipients
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_sms_notification_recipients"
  on public.sms_notification_recipients
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "admin_read" on public.sms_credits;
drop policy if exists "service_role_all" on public.sms_credits;
create policy "admin_all_sms_credits"
  on public.sms_credits
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_sms_credits"
  on public.sms_credits
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "admin_read" on public.sms_analytics;
drop policy if exists "service_role_all" on public.sms_analytics;
create policy "admin_all_sms_analytics"
  on public.sms_analytics
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_sms_analytics"
  on public.sms_analytics
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "admin_read" on public.sms_recipient_groups;
drop policy if exists "service_role_all" on public.sms_recipient_groups;
create policy "admin_all_sms_recipient_groups"
  on public.sms_recipient_groups
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_sms_recipient_groups"
  on public.sms_recipient_groups
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "admin_read" on public.sms_templates;
drop policy if exists "service_role_all" on public.sms_templates;
create policy "admin_all_sms_templates"
  on public.sms_templates
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
create policy "service_role_all_sms_templates"
  on public.sms_templates
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- email_notification_settings: replace permissive policy
drop policy if exists "Allow all operations for authenticated users" on public.email_notification_settings;
create policy "admin_all_email_notification_settings"
  on public.email_notification_settings
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );
