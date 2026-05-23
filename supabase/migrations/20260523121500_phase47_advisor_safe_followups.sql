-- Phase 47: Safe Advisor follow-ups after Phase 46.
-- Scope: do not alter authenticated app behavior; remove anonymous function execution and add service-role policies to already-locked RLS tables.

-- RLS-enabled tables with no policies remain closed to app users; service_role gets explicit maintenance access.
grant all on public."admin_users" to service_role;
drop policy if exists "p47_service_role_all" on public."admin_users";
create policy "p47_service_role_all" on public."admin_users" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."community_configuration" to service_role;
drop policy if exists "p47_service_role_all" on public."community_configuration";
create policy "p47_service_role_all" on public."community_configuration" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."community_units" to service_role;
drop policy if exists "p47_service_role_all" on public."community_units";
create policy "p47_service_role_all" on public."community_units" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."complaint_categories" to service_role;
drop policy if exists "p47_service_role_all" on public."complaint_categories";
create policy "p47_service_role_all" on public."complaint_categories" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."daily_helps" to service_role;
drop policy if exists "p47_service_role_all" on public."daily_helps";
create policy "p47_service_role_all" on public."daily_helps" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."documents" to service_role;
drop policy if exists "p47_service_role_all" on public."documents";
create policy "p47_service_role_all" on public."documents" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."frequent_visitors" to service_role;
drop policy if exists "p47_service_role_all" on public."frequent_visitors";
create policy "p47_service_role_all" on public."frequent_visitors" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."gate_passes" to service_role;
drop policy if exists "p47_service_role_all" on public."gate_passes";
create policy "p47_service_role_all" on public."gate_passes" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."gatepasses" to service_role;
drop policy if exists "p47_service_role_all" on public."gatepasses";
create policy "p47_service_role_all" on public."gatepasses" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."maintenance" to service_role;
drop policy if exists "p47_service_role_all" on public."maintenance";
create policy "p47_service_role_all" on public."maintenance" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."members" to service_role;
drop policy if exists "p47_service_role_all" on public."members";
create policy "p47_service_role_all" on public."members" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."old_services" to service_role;
drop policy if exists "p47_service_role_all" on public."old_services";
create policy "p47_service_role_all" on public."old_services" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."payment_charge_runs" to service_role;
drop policy if exists "p47_service_role_all" on public."payment_charge_runs";
create policy "p47_service_role_all" on public."payment_charge_runs" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."payment_charge_template_targets" to service_role;
drop policy if exists "p47_service_role_all" on public."payment_charge_template_targets";
create policy "p47_service_role_all" on public."payment_charge_template_targets" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."payment_charge_templates" to service_role;
drop policy if exists "p47_service_role_all" on public."payment_charge_templates";
create policy "p47_service_role_all" on public."payment_charge_templates" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."payment_gateway_currencies" to service_role;
drop policy if exists "p47_service_role_all" on public."payment_gateway_currencies";
create policy "p47_service_role_all" on public."payment_gateway_currencies" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."personal_hub_analytics" to service_role;
drop policy if exists "p47_service_role_all" on public."personal_hub_analytics";
create policy "p47_service_role_all" on public."personal_hub_analytics" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."profile_settings" to service_role;
drop policy if exists "p47_service_role_all" on public."profile_settings";
create policy "p47_service_role_all" on public."profile_settings" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."recent_searches" to service_role;
drop policy if exists "p47_service_role_all" on public."recent_searches";
create policy "p47_service_role_all" on public."recent_searches" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."service_packages" to service_role;
drop policy if exists "p47_service_role_all" on public."service_packages";
create policy "p47_service_role_all" on public."service_packages" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."service_subtypes" to service_role;
drop policy if exists "p47_service_role_all" on public."service_subtypes";
create policy "p47_service_role_all" on public."service_subtypes" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."storage" to service_role;
drop policy if exists "p47_service_role_all" on public."storage";
create policy "p47_service_role_all" on public."storage" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."support_messages" to service_role;
drop policy if exists "p47_service_role_all" on public."support_messages";
create policy "p47_service_role_all" on public."support_messages" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."support_requests" to service_role;
drop policy if exists "p47_service_role_all" on public."support_requests";
create policy "p47_service_role_all" on public."support_requests" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."user_profiles" to service_role;
drop policy if exists "p47_service_role_all" on public."user_profiles";
create policy "p47_service_role_all" on public."user_profiles" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

grant all on public."visitors" to service_role;
drop policy if exists "p47_service_role_all" on public."visitors";
create policy "p47_service_role_all" on public."visitors" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Security-definer functions should not be directly executable by anonymous clients.
revoke execute on function public."actor_profile_in_accessible_community"(target_actor_id uuid) from anon;
revoke execute on function public."admin_get_all_logs"() from anon;
revoke execute on function public."can_access_agency"(target_agency_id uuid) from anon;
revoke execute on function public."can_access_chat_attachment"(object_name text) from anon;
revoke execute on function public."can_access_community"(target_community_id uuid) from anon;
revoke execute on function public."can_access_payout_agency"(target_agency_id uuid) from anon;
revoke execute on function public."can_access_payout_request"(target_payout_request_id uuid) from anon;
revoke execute on function public."can_access_personal_hub_transaction"(target_transaction_type text, target_transaction_id uuid) from anon;
revoke execute on function public."can_access_unit"(target_unit_id uuid) from anon;
revoke execute on function public."current_guard_community_id"() from anon;
revoke execute on function public."current_profile_id"() from anon;
revoke execute on function public."current_user_community_id"() from anon;
revoke execute on function public."current_user_role"() from anon;
revoke execute on function public."enforce_service_request_service_scope"() from anon;
revoke execute on function public."get_activity_logs_stats"() from anon;
revoke execute on function public."get_all_activity_logs"(user_id_param uuid) from anon;
revoke execute on function public."get_auth_users_with_last_sign_in"() from anon;
revoke execute on function public."get_current_profile_id"() from anon;
revoke execute on function public."get_my_role"() from anon;
revoke execute on function public."get_pending_visitor_passes"() from anon;
revoke execute on function public."get_society_units"(society_id uuid) from anon;
revoke execute on function public."guard_can_access_community"(target_community_id uuid) from anon;
revoke execute on function public."guard_can_access_unit"(target_unit_id uuid) from anon;
revoke execute on function public."guard_can_notify_user"(target_user_id uuid) from anon;
revoke execute on function public."handle_guard_assignment_scope_sync"() from anon;
revoke execute on function public."handle_new_auth_user"() from anon;
revoke execute on function public."increment_comment_likes"(comment_id uuid) from anon;
revoke execute on function public."is_admin_role"() from anon;
revoke execute on function public."is_chat_participant"(target_chat_id uuid, target_user_id uuid) from anon;
revoke execute on function public."is_current_user_admin"() from anon;
revoke execute on function public."is_guard_role"() from anon;
revoke execute on function public."is_platform_admin_role"() from anon;
revoke execute on function public."is_superadmin_role"() from anon;
revoke execute on function public."is_unit_occupant"(target_unit_id uuid) from anon;
revoke execute on function public."list_active_service_providers"(p_service_type text) from anon;
revoke execute on function public."log_activity"(p_action character varying, p_action_type character varying, p_resource character varying, p_resource_id character varying, p_details text, p_status character varying, p_severity character varying, p_metadata jsonb, p_ip_address inet, p_user_agent text, p_location character varying) from anon;
revoke execute on function public."mark_message_read"(message_id uuid) from anon;
revoke execute on function public."marketplace_vendor_followers_sync_trigger"() from anon;
revoke execute on function public."matches_current_actor"(target_id uuid) from anon;
revoke execute on function public."notify_users_on_notice_creation"() from anon;
revoke execute on function public."p27_read_vault_secret"(secret_name text) from anon;
revoke execute on function public."p27_read_vault_secret_by_id"(secret_id uuid) from anon;
revoke execute on function public."p27_upsert_vault_secret"(secret_name text, secret_value text, secret_description text) from anon;
revoke execute on function public."refresh_guard_assignment_scope"(target_guard_id uuid) from anon;
revoke execute on function public."send_join_request_approval_notification"() from anon;
revoke execute on function public."sync_amenity_booking_contract_fields"() from anon;
revoke execute on function public."sync_guard_profile_from_user"() from anon;
revoke execute on function public."sync_marketplace_vendor_follower_count"(target_vendor_id uuid) from anon;
revoke execute on function public."visitor_passes_set_community_id_from_unit"() from anon;

