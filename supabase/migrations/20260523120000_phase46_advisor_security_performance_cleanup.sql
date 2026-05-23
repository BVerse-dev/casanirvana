-- Phase 46: Supabase Advisor hardening before release freeze.
-- Generated from the Casa Nirvana Advisor report on 2026-05-23.
-- Scope: hard ERROR security items plus low-risk performance/schema cleanup.

set check_function_bodies = off;

-- Replace auth.users-backed views with public-profile-backed equivalents.
create or replace view public.groups_with_leaders as
select
  g.id,
  g.name,
  g.description,
  g.color,
  g.type,
  g.member_count,
  g.max_members,
  g.is_active,
  g.auto_assign,
  g.assignment_rules,
  g.leader_id,
  g.tags,
  g.created_at,
  g.updated_at,
  g.created_by,
  g.updated_by,
  coalesce(lp.email, lu.email)::character varying(255) as leader_email,
  coalesce(
    nullif(trim(both from concat_ws(' ', lp.first_name, lp.last_name)), ''),
    nullif(lp.full_name, ''),
    lp.email::text,
    lu.email::text
  ) as leader_name
from public.user_groups g
left join lateral (
  select p.first_name, p.last_name, p.full_name, p.email
  from public.profiles p
  where p.id = g.leader_id or p.user_id = g.leader_id
  order by case when p.id = g.leader_id then 0 else 1 end, p.id
  limit 1
) lp on true
left join public.users lu on lu.id = g.leader_id;

create or replace view public.users_with_preference_stats as
select
  p.id,
  p.email::character varying(255) as email,
  p.full_name as user_name,
  p.role as user_role,
  count(upv.id) as customizations,
  max(upv.updated_at) as last_updated
from public.profiles p
left join public.user_preference_values upv on upv.user_id = p.id
group by p.id, p.email, p.full_name, p.role;

-- Make Advisor-flagged views run with the querying role so RLS is enforced.
alter view public."activity_statistics" set (security_invoker = true);
alter view public."admin_join_request_notifications" set (security_invoker = true);
alter view public."group_statistics" set (security_invoker = true);
alter view public."groups_with_leaders" set (security_invoker = true);
alter view public."guard_performance_detailed" set (security_invoker = true);
alter view public."guard_performance_reviews_detailed" set (security_invoker = true);
alter view public."permissions_with_role_count" set (security_invoker = true);
alter view public."preference_settings_with_stats" set (security_invoker = true);
alter view public."recent_activities" set (security_invoker = true);
alter view public."role_permissions_detailed" set (security_invoker = true);
alter view public."security_events" set (security_invoker = true);
alter view public."users_with_preference_stats" set (security_invoker = true);

-- These are authenticated admin/superadmin views, not anonymous API surfaces.
revoke all on public."activity_statistics" from anon;
grant select on public."activity_statistics" to authenticated;
grant select on public."activity_statistics" to service_role;
revoke all on public."admin_join_request_notifications" from anon;
grant select on public."admin_join_request_notifications" to authenticated;
grant select on public."admin_join_request_notifications" to service_role;
revoke all on public."group_statistics" from anon;
grant select on public."group_statistics" to authenticated;
grant select on public."group_statistics" to service_role;
revoke all on public."groups_with_leaders" from anon;
grant select on public."groups_with_leaders" to authenticated;
grant select on public."groups_with_leaders" to service_role;
revoke all on public."guard_performance_detailed" from anon;
grant select on public."guard_performance_detailed" to authenticated;
grant select on public."guard_performance_detailed" to service_role;
revoke all on public."guard_performance_reviews_detailed" from anon;
grant select on public."guard_performance_reviews_detailed" to authenticated;
grant select on public."guard_performance_reviews_detailed" to service_role;
revoke all on public."permissions_with_role_count" from anon;
grant select on public."permissions_with_role_count" to authenticated;
grant select on public."permissions_with_role_count" to service_role;
revoke all on public."preference_settings_with_stats" from anon;
grant select on public."preference_settings_with_stats" to authenticated;
grant select on public."preference_settings_with_stats" to service_role;
revoke all on public."recent_activities" from anon;
grant select on public."recent_activities" to authenticated;
grant select on public."recent_activities" to service_role;
revoke all on public."role_permissions_detailed" from anon;
grant select on public."role_permissions_detailed" to authenticated;
grant select on public."role_permissions_detailed" to service_role;
revoke all on public."security_events" from anon;
grant select on public."security_events" to authenticated;
grant select on public."security_events" to service_role;
revoke all on public."users_with_preference_stats" from anon;
grant select on public."users_with_preference_stats" to authenticated;
grant select on public."users_with_preference_stats" to service_role;

-- Lock data-fix/archive tables behind RLS and service-role-only policies.
alter table public."_backup_phase18_maintenance_unit_fix" enable row level security;
revoke all on public."_backup_phase18_maintenance_unit_fix" from anon;
revoke all on public."_backup_phase18_maintenance_unit_fix" from authenticated;
grant all on public."_backup_phase18_maintenance_unit_fix" to service_role;
drop policy if exists "p46_service_role_all" on public."_backup_phase18_maintenance_unit_fix";
create policy "p46_service_role_all" on public."_backup_phase18_maintenance_unit_fix" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."amenity_bookings_cleanup_backup_20260221" enable row level security;
revoke all on public."amenity_bookings_cleanup_backup_20260221" from anon;
revoke all on public."amenity_bookings_cleanup_backup_20260221" from authenticated;
grant all on public."amenity_bookings_cleanup_backup_20260221" to service_role;
drop policy if exists "p46_service_role_all" on public."amenity_bookings_cleanup_backup_20260221";
create policy "p46_service_role_all" on public."amenity_bookings_cleanup_backup_20260221" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase12_profiles_inserted_backup" enable row level security;
revoke all on public."datafix_phase12_profiles_inserted_backup" from anon;
revoke all on public."datafix_phase12_profiles_inserted_backup" from authenticated;
grant all on public."datafix_phase12_profiles_inserted_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase12_profiles_inserted_backup";
create policy "p46_service_role_all" on public."datafix_phase12_profiles_inserted_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase12_superadmin_scope_backup" enable row level security;
revoke all on public."datafix_phase12_superadmin_scope_backup" from anon;
revoke all on public."datafix_phase12_superadmin_scope_backup" from authenticated;
grant all on public."datafix_phase12_superadmin_scope_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase12_superadmin_scope_backup";
create policy "p46_service_role_all" on public."datafix_phase12_superadmin_scope_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase12_visitor_created_by_backup" enable row level security;
revoke all on public."datafix_phase12_visitor_created_by_backup" from anon;
revoke all on public."datafix_phase12_visitor_created_by_backup" from authenticated;
grant all on public."datafix_phase12_visitor_created_by_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase12_visitor_created_by_backup";
create policy "p46_service_role_all" on public."datafix_phase12_visitor_created_by_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase13_legacy_notice_comments_backup" enable row level security;
revoke all on public."datafix_phase13_legacy_notice_comments_backup" from anon;
revoke all on public."datafix_phase13_legacy_notice_comments_backup" from authenticated;
grant all on public."datafix_phase13_legacy_notice_comments_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase13_legacy_notice_comments_backup";
create policy "p46_service_role_all" on public."datafix_phase13_legacy_notice_comments_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase14_orphan_airtime_purchases_archive" enable row level security;
revoke all on public."datafix_phase14_orphan_airtime_purchases_archive" from anon;
revoke all on public."datafix_phase14_orphan_airtime_purchases_archive" from authenticated;
grant all on public."datafix_phase14_orphan_airtime_purchases_archive" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase14_orphan_airtime_purchases_archive";
create policy "p46_service_role_all" on public."datafix_phase14_orphan_airtime_purchases_archive" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase14_orphan_bill_payments_archive" enable row level security;
revoke all on public."datafix_phase14_orphan_bill_payments_archive" from anon;
revoke all on public."datafix_phase14_orphan_bill_payments_archive" from authenticated;
grant all on public."datafix_phase14_orphan_bill_payments_archive" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase14_orphan_bill_payments_archive";
create policy "p46_service_role_all" on public."datafix_phase14_orphan_bill_payments_archive" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase14_orphan_data_purchases_archive" enable row level security;
revoke all on public."datafix_phase14_orphan_data_purchases_archive" from anon;
revoke all on public."datafix_phase14_orphan_data_purchases_archive" from authenticated;
grant all on public."datafix_phase14_orphan_data_purchases_archive" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase14_orphan_data_purchases_archive";
create policy "p46_service_role_all" on public."datafix_phase14_orphan_data_purchases_archive" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase14_orphan_money_transfers_archive" enable row level security;
revoke all on public."datafix_phase14_orphan_money_transfers_archive" from anon;
revoke all on public."datafix_phase14_orphan_money_transfers_archive" from authenticated;
grant all on public."datafix_phase14_orphan_money_transfers_archive" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase14_orphan_money_transfers_archive";
create policy "p46_service_role_all" on public."datafix_phase14_orphan_money_transfers_archive" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase14_payment_user_id_backfill_backup" enable row level security;
revoke all on public."datafix_phase14_payment_user_id_backfill_backup" from anon;
revoke all on public."datafix_phase14_payment_user_id_backfill_backup" from authenticated;
grant all on public."datafix_phase14_payment_user_id_backfill_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase14_payment_user_id_backfill_backup";
create policy "p46_service_role_all" on public."datafix_phase14_payment_user_id_backfill_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase14_personal_hub_user_id_backfill_pass2_backup" enable row level security;
revoke all on public."datafix_phase14_personal_hub_user_id_backfill_pass2_backup" from anon;
revoke all on public."datafix_phase14_personal_hub_user_id_backfill_pass2_backup" from authenticated;
grant all on public."datafix_phase14_personal_hub_user_id_backfill_pass2_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase14_personal_hub_user_id_backfill_pass2_backup";
create policy "p46_service_role_all" on public."datafix_phase14_personal_hub_user_id_backfill_pass2_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase20_service_request_scope_mismatch_backup" enable row level security;
revoke all on public."datafix_phase20_service_request_scope_mismatch_backup" from anon;
revoke all on public."datafix_phase20_service_request_scope_mismatch_backup" from authenticated;
grant all on public."datafix_phase20_service_request_scope_mismatch_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase20_service_request_scope_mismatch_backup";
create policy "p46_service_role_all" on public."datafix_phase20_service_request_scope_mismatch_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase24_emergency_recipients_backup" enable row level security;
revoke all on public."datafix_phase24_emergency_recipients_backup" from anon;
revoke all on public."datafix_phase24_emergency_recipients_backup" from authenticated;
grant all on public."datafix_phase24_emergency_recipients_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase24_emergency_recipients_backup";
create policy "p46_service_role_all" on public."datafix_phase24_emergency_recipients_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase25_checked_in_exit_repair_backup" enable row level security;
revoke all on public."datafix_phase25_checked_in_exit_repair_backup" from anon;
revoke all on public."datafix_phase25_checked_in_exit_repair_backup" from authenticated;
grant all on public."datafix_phase25_checked_in_exit_repair_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase25_checked_in_exit_repair_backup";
create policy "p46_service_role_all" on public."datafix_phase25_checked_in_exit_repair_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase25_guard_profile_backfill_backup" enable row level security;
revoke all on public."datafix_phase25_guard_profile_backfill_backup" from anon;
revoke all on public."datafix_phase25_guard_profile_backfill_backup" from authenticated;
grant all on public."datafix_phase25_guard_profile_backfill_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase25_guard_profile_backfill_backup";
create policy "p46_service_role_all" on public."datafix_phase25_guard_profile_backfill_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase25_walkin_pass_artifacts_backup" enable row level security;
revoke all on public."datafix_phase25_walkin_pass_artifacts_backup" from anon;
revoke all on public."datafix_phase25_walkin_pass_artifacts_backup" from authenticated;
grant all on public."datafix_phase25_walkin_pass_artifacts_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase25_walkin_pass_artifacts_backup";
create policy "p46_service_role_all" on public."datafix_phase25_walkin_pass_artifacts_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase35_community_membership_insert_backup" enable row level security;
revoke all on public."datafix_phase35_community_membership_insert_backup" from anon;
revoke all on public."datafix_phase35_community_membership_insert_backup" from authenticated;
grant all on public."datafix_phase35_community_membership_insert_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase35_community_membership_insert_backup";
create policy "p46_service_role_all" on public."datafix_phase35_community_membership_insert_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase35_community_membership_repair_backup" enable row level security;
revoke all on public."datafix_phase35_community_membership_repair_backup" from anon;
revoke all on public."datafix_phase35_community_membership_repair_backup" from authenticated;
grant all on public."datafix_phase35_community_membership_repair_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase35_community_membership_repair_backup";
create policy "p46_service_role_all" on public."datafix_phase35_community_membership_repair_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase37_guard_assignment_orphans_backup" enable row level security;
revoke all on public."datafix_phase37_guard_assignment_orphans_backup" from anon;
revoke all on public."datafix_phase37_guard_assignment_orphans_backup" from authenticated;
grant all on public."datafix_phase37_guard_assignment_orphans_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase37_guard_assignment_orphans_backup";
create policy "p46_service_role_all" on public."datafix_phase37_guard_assignment_orphans_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase37_guard_certification_orphans_backup" enable row level security;
revoke all on public."datafix_phase37_guard_certification_orphans_backup" from anon;
revoke all on public."datafix_phase37_guard_certification_orphans_backup" from authenticated;
grant all on public."datafix_phase37_guard_certification_orphans_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase37_guard_certification_orphans_backup";
create policy "p46_service_role_all" on public."datafix_phase37_guard_certification_orphans_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase37_guard_duplicates_backup" enable row level security;
revoke all on public."datafix_phase37_guard_duplicates_backup" from anon;
revoke all on public."datafix_phase37_guard_duplicates_backup" from authenticated;
grant all on public."datafix_phase37_guard_duplicates_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase37_guard_duplicates_backup";
create policy "p46_service_role_all" on public."datafix_phase37_guard_duplicates_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase37_guard_performance_metric_duplicates_backup" enable row level security;
revoke all on public."datafix_phase37_guard_performance_metric_duplicates_backup" from anon;
revoke all on public."datafix_phase37_guard_performance_metric_duplicates_backup" from authenticated;
grant all on public."datafix_phase37_guard_performance_metric_duplicates_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase37_guard_performance_metric_duplicates_backup";
create policy "p46_service_role_all" on public."datafix_phase37_guard_performance_metric_duplicates_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase37_guard_performance_metric_orphans_backup" enable row level security;
revoke all on public."datafix_phase37_guard_performance_metric_orphans_backup" from anon;
revoke all on public."datafix_phase37_guard_performance_metric_orphans_backup" from authenticated;
grant all on public."datafix_phase37_guard_performance_metric_orphans_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase37_guard_performance_metric_orphans_backup";
create policy "p46_service_role_all" on public."datafix_phase37_guard_performance_metric_orphans_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase37_guard_performance_review_orphans_backup" enable row level security;
revoke all on public."datafix_phase37_guard_performance_review_orphans_backup" from anon;
revoke all on public."datafix_phase37_guard_performance_review_orphans_backup" from authenticated;
grant all on public."datafix_phase37_guard_performance_review_orphans_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase37_guard_performance_review_orphans_backup";
create policy "p46_service_role_all" on public."datafix_phase37_guard_performance_review_orphans_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase37_guard_reference_audit" enable row level security;
revoke all on public."datafix_phase37_guard_reference_audit" from anon;
revoke all on public."datafix_phase37_guard_reference_audit" from authenticated;
grant all on public."datafix_phase37_guard_reference_audit" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase37_guard_reference_audit";
create policy "p46_service_role_all" on public."datafix_phase37_guard_reference_audit" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase37_guard_schedule_orphans_backup" enable row level security;
revoke all on public."datafix_phase37_guard_schedule_orphans_backup" from anon;
revoke all on public."datafix_phase37_guard_schedule_orphans_backup" from authenticated;
grant all on public."datafix_phase37_guard_schedule_orphans_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase37_guard_schedule_orphans_backup";
create policy "p46_service_role_all" on public."datafix_phase37_guard_schedule_orphans_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase37_guard_training_enrollment_orphans_backup" enable row level security;
revoke all on public."datafix_phase37_guard_training_enrollment_orphans_backup" from anon;
revoke all on public."datafix_phase37_guard_training_enrollment_orphans_backup" from authenticated;
grant all on public."datafix_phase37_guard_training_enrollment_orphans_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase37_guard_training_enrollment_orphans_backup";
create policy "p46_service_role_all" on public."datafix_phase37_guard_training_enrollment_orphans_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase41_legacy_visitor_entry_logs_archive" enable row level security;
revoke all on public."datafix_phase41_legacy_visitor_entry_logs_archive" from anon;
revoke all on public."datafix_phase41_legacy_visitor_entry_logs_archive" from authenticated;
grant all on public."datafix_phase41_legacy_visitor_entry_logs_archive" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase41_legacy_visitor_entry_logs_archive";
create policy "p46_service_role_all" on public."datafix_phase41_legacy_visitor_entry_logs_archive" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase41_legacy_visitor_passes_archive" enable row level security;
revoke all on public."datafix_phase41_legacy_visitor_passes_archive" from anon;
revoke all on public."datafix_phase41_legacy_visitor_passes_archive" from authenticated;
grant all on public."datafix_phase41_legacy_visitor_passes_archive" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase41_legacy_visitor_passes_archive";
create policy "p46_service_role_all" on public."datafix_phase41_legacy_visitor_passes_archive" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase43_community_membership_insert_backup" enable row level security;
revoke all on public."datafix_phase43_community_membership_insert_backup" from anon;
revoke all on public."datafix_phase43_community_membership_insert_backup" from authenticated;
grant all on public."datafix_phase43_community_membership_insert_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase43_community_membership_insert_backup";
create policy "p46_service_role_all" on public."datafix_phase43_community_membership_insert_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase43_community_membership_repair_backup" enable row level security;
revoke all on public."datafix_phase43_community_membership_repair_backup" from anon;
revoke all on public."datafix_phase43_community_membership_repair_backup" from authenticated;
grant all on public."datafix_phase43_community_membership_repair_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase43_community_membership_repair_backup";
create policy "p46_service_role_all" on public."datafix_phase43_community_membership_repair_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table public."datafix_phase45_visitor_artifact_backfill_backup" enable row level security;
revoke all on public."datafix_phase45_visitor_artifact_backfill_backup" from anon;
revoke all on public."datafix_phase45_visitor_artifact_backfill_backup" from authenticated;
grant all on public."datafix_phase45_visitor_artifact_backfill_backup" to service_role;
drop policy if exists "p46_service_role_all" on public."datafix_phase45_visitor_artifact_backfill_backup";
create policy "p46_service_role_all" on public."datafix_phase45_visitor_artifact_backfill_backup" for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- equipment_assignments is used by the superadmin Guard equipment screen; keep scoped authenticated access.
alter table public.equipment_assignments enable row level security;
grant select, insert, update, delete on public.equipment_assignments to authenticated;
grant all on public.equipment_assignments to service_role;
drop policy if exists "p46_equipment_assignments_select" on public.equipment_assignments;
create policy "p46_equipment_assignments_select"
on public.equipment_assignments
for select
to authenticated
using (
  is_admin_role()
  or guard_id = auth.uid()
  or exists (
    select 1
    from public.guards g
    where g.id = equipment_assignments.guard_id
      and g.user_id = auth.uid()
  )
);
drop policy if exists "p46_equipment_assignments_insert" on public.equipment_assignments;
create policy "p46_equipment_assignments_insert"
on public.equipment_assignments
for insert
to authenticated
with check (
  is_admin_role()
  and (
    is_superadmin_role()
    or exists (
      select 1
      from public.guards g
      where g.id = equipment_assignments.guard_id
        and can_access_community(g.community_id)
    )
  )
);
drop policy if exists "p46_equipment_assignments_update" on public.equipment_assignments;
create policy "p46_equipment_assignments_update"
on public.equipment_assignments
for update
to authenticated
using (
  is_admin_role()
  and (
    is_superadmin_role()
    or exists (
      select 1
      from public.guards g
      where g.id = equipment_assignments.guard_id
        and can_access_community(g.community_id)
    )
  )
)
with check (
  is_admin_role()
  and (
    is_superadmin_role()
    or exists (
      select 1
      from public.guards g
      where g.id = equipment_assignments.guard_id
        and can_access_community(g.community_id)
    )
  )
);
drop policy if exists "p46_equipment_assignments_delete" on public.equipment_assignments;
create policy "p46_equipment_assignments_delete"
on public.equipment_assignments
for delete
to authenticated
using (
  is_admin_role()
  and (
    is_superadmin_role()
    or exists (
      select 1
      from public.guards g
      where g.id = equipment_assignments.guard_id
        and can_access_community(g.community_id)
    )
  )
);
drop policy if exists "p46_equipment_assignments_service_role" on public.equipment_assignments;
create policy "p46_equipment_assignments_service_role" on public.equipment_assignments for all to service_role using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Add primary keys to empty Advisor-flagged backup tables that were created as heap snapshots.
alter table public."datafix_phase43_community_membership_insert_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase43_community_membership_insert_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase43_community_membership_insert_backup" add constraint "p46_datafix_phase43_community_membership_insert_bac_d5cb5da8" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase37_guard_certification_orphans_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase37_guard_certification_orphans_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase37_guard_certification_orphans_backup" add constraint "p46_datafix_phase37_guard_certification_orphans_bac_022fd7de" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase37_guard_schedule_orphans_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase37_guard_schedule_orphans_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase37_guard_schedule_orphans_backup" add constraint "p46_datafix_phase37_guard_schedule_orphans_backup_a_a6b29d95" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase37_guard_performance_metric_orphans_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase37_guard_performance_metric_orphans_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase37_guard_performance_metric_orphans_backup" add constraint "p46_datafix_phase37_guard_performance_metric_orphan_5f2b3930" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase37_guard_duplicates_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase37_guard_duplicates_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase37_guard_duplicates_backup" add constraint "p46_datafix_phase37_guard_duplicates_backup_archive_fdac232d" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase37_guard_performance_metric_duplicates_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase37_guard_performance_metric_duplicates_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase37_guard_performance_metric_duplicates_backup" add constraint "p46_datafix_phase37_guard_performance_metric_duplic_83e70fd4" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."amenity_bookings_cleanup_backup_20260221" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.amenity_bookings_cleanup_backup_20260221'::regclass
      and contype = 'p'
  ) then
    alter table public."amenity_bookings_cleanup_backup_20260221" add constraint "p46_amenity_bookings_cleanup_backup_20260221_archiv_8f8a0368" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase37_guard_training_enrollment_orphans_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase37_guard_training_enrollment_orphans_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase37_guard_training_enrollment_orphans_backup" add constraint "p46_datafix_phase37_guard_training_enrollment_orpha_607202db" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase24_emergency_recipients_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase24_emergency_recipients_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase24_emergency_recipients_backup" add constraint "p46_datafix_phase24_emergency_recipients_backup_arc_e13c99ea" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase37_guard_performance_review_orphans_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase37_guard_performance_review_orphans_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase37_guard_performance_review_orphans_backup" add constraint "p46_datafix_phase37_guard_performance_review_orphan_86c793a8" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase35_community_membership_repair_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase35_community_membership_repair_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase35_community_membership_repair_backup" add constraint "p46_datafix_phase35_community_membership_repair_bac_66416319" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase37_guard_assignment_orphans_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase37_guard_assignment_orphans_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase37_guard_assignment_orphans_backup" add constraint "p46_datafix_phase37_guard_assignment_orphans_backup_be925b52" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase35_community_membership_insert_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase35_community_membership_insert_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase35_community_membership_insert_backup" add constraint "p46_datafix_phase35_community_membership_insert_bac_eceefb2a" primary key (datafix_archive_row_id);
  end if;
end $$;
alter table public."datafix_phase43_community_membership_repair_backup" add column if not exists datafix_archive_row_id bigserial;
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.datafix_phase43_community_membership_repair_backup'::regclass
      and contype = 'p'
  ) then
    alter table public."datafix_phase43_community_membership_repair_backup" add constraint "p46_datafix_phase43_community_membership_repair_bac_4e4eb65e" primary key (datafix_archive_row_id);
  end if;
end $$;

-- Pin mutable function search paths to avoid role-dependent lookup behavior.
alter function public."add_column_if_not_exists"(_table_name text, _column_name text, _column_type text, _default_value text) set search_path = public, extensions, auth, pg_temp;
alter function public."add_fk_constraint_if_not_exists"(_table_name text, _column_name text, _referenced_table text, _referenced_column text, _constraint_name text) set search_path = public, extensions, auth, pg_temp;
alter function public."admin_get_all_logs"() set search_path = public, extensions, auth, pg_temp;
alter function public."auto_log_changes"() set search_path = public, extensions, auth, pg_temp;
alter function public."column_exists"(_table_name text, _column_name text) set search_path = public, extensions, auth, pg_temp;
alter function public."generate_user_gate_pass_on_approval"() set search_path = public, extensions, auth, pg_temp;
alter function public."get_admin_unread_notifications"(admin_user_id uuid) set search_path = public, extensions, auth, pg_temp;
alter function public."get_all_activity_logs"(user_id_param uuid) set search_path = public, extensions, auth, pg_temp;
alter function public."get_complaint_comments_with_profiles"(complaint_uuid uuid) set search_path = public, extensions, auth, pg_temp;
alter function public."get_my_role"() set search_path = public, extensions, auth, pg_temp;
alter function public."get_notification_system_status"() set search_path = public, extensions, auth, pg_temp;
alter function public."get_pending_visitor_passes"() set search_path = public, extensions, auth, pg_temp;
alter function public."get_society_units"(society_id uuid) set search_path = public, extensions, auth, pg_temp;
alter function public."increment_notice_likes"(notice_id uuid) set search_path = public, extensions, auth, pg_temp;
alter function public."increment_notice_views"(notice_id uuid) set search_path = public, extensions, auth, pg_temp;
alter function public."log_activity"(p_action character varying, p_action_type character varying, p_resource character varying, p_resource_id character varying, p_details text, p_status character varying, p_severity character varying, p_metadata jsonb, p_ip_address inet, p_user_agent text, p_location character varying) set search_path = public, extensions, auth, pg_temp;
alter function public."mark_message_read"(message_id uuid) set search_path = public, extensions, auth, pg_temp;
alter function public."mark_notification_read"(notification_id uuid, admin_user_id uuid) set search_path = public, extensions, auth, pg_temp;
alter function public."notify_admins_new_join_request"() set search_path = public, extensions, auth, pg_temp;
alter function public."notify_users_on_notice_creation"() set search_path = public, extensions, auth, pg_temp;
alter function public."p35_directory_role_for_profile"(profile_role text) set search_path = public, extensions, auth, pg_temp;
alter function public."p35_is_directory_profile_role"(profile_role text) set search_path = public, extensions, auth, pg_temp;
alter function public."p35_sync_profile_directory_membership"() set search_path = public, extensions, auth, pg_temp;
alter function public."p35_validate_community_membership_profile_scope"() set search_path = public, extensions, auth, pg_temp;
alter function public."process_pending_notifications"() set search_path = public, extensions, auth, pg_temp;
alter function public."queue_join_request_notifications"() set search_path = public, extensions, auth, pg_temp;
alter function public."send_join_request_approval_notification"() set search_path = public, extensions, auth, pg_temp;
alter function public."table_exists"(_table_name text) set search_path = public, extensions, auth, pg_temp;
alter function public."test_rpc_function"() set search_path = public, extensions, auth, pg_temp;
alter function public."trigger_set_timestamp"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_agency_configurations_updated_at"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_complaints_updated_at"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_group_member_count"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_guard_display_name"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_guard_performance_metrics"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_guard_performance_updated_at"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_guard_training_names"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_guard_training_program_names"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_society_services_updated_at"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_timestamp"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_updated_at_column"() set search_path = public, extensions, auth, pg_temp;
alter function public."update_user_payment_methods_updated_at"() set search_path = public, extensions, auth, pg_temp;

-- Remove duplicate unique indexes that duplicate primary-key btree indexes on archive tables.
drop index if exists public."datafix_phase14_orphan_airtime_purchases_archive_id_uidx";
drop index if exists public."datafix_phase14_orphan_bill_payments_archive_id_uidx";
drop index if exists public."datafix_phase14_orphan_data_purchases_archive_id_uidx";
drop index if exists public."datafix_phase14_orphan_money_transfers_archive_id_uidx";

-- Add covering indexes for Advisor-flagged foreign keys. Current live row estimates are zero for these targets, so non-concurrent creation is low-risk.
create index if not exists "idx_p46_admin_users_role_id_fk" on public."admin_users" ("role_id");
create index if not exists "idx_p46_admin_users_user_id_fk" on public."admin_users" ("user_id");
create index if not exists "idx_p46_agency_billing_agency_id_fk" on public."agency_billing" ("agency_id");
create index if not exists "idx_p46_agency_documents_agency_id_fk" on public."agency_documents" ("agency_id");
create index if not exists "idx_p46_agency_documents_uploaded_by_fk" on public."agency_documents" ("uploaded_by");
create index if not exists "idx_p46_agency_services_agency_id_fk" on public."agency_services" ("agency_id");
create index if not exists "idx_p46_agency_transactions_agency_id_fk" on public."agency_transactions" ("agency_id");
create index if not exists "idx_p46_airtime_purchases_package_id_fk" on public."airtime_purchases" ("package_id");
create index if not exists "idx_p46_airtime_purchases_payment_ref_id_fk" on public."airtime_purchases" ("payment_ref_id");
create index if not exists "idx_p46_airtime_purchases_processed_by_fk" on public."airtime_purchases" ("processed_by");
create index if not exists "idx_p46_airtime_purchases_profile_id_fk" on public."airtime_purchases" ("profile_id");
create index if not exists "idx_p46_airtime_purchases_user_id_fk" on public."airtime_purchases" ("user_id");
create index if not exists "idx_p46_amenity_bookings_community_id_fk" on public."amenity_bookings" ("community_id");
create index if not exists "idx_p46_app_static_content_language_id_fk" on public."app_static_content" ("language_id");
create index if not exists "idx_p46_bill_payments_payment_ref_id_fk" on public."bill_payments" ("payment_ref_id");
create index if not exists "idx_p46_bill_payments_processed_by_fk" on public."bill_payments" ("processed_by");
create index if not exists "idx_p46_bill_payments_profile_id_fk" on public."bill_payments" ("profile_id");
create index if not exists "idx_p46_bill_payments_user_id_fk" on public."bill_payments" ("user_id");
create index if not exists "idx_p46_bookings_amenity_id_fk" on public."bookings" ("amenity_id");
create index if not exists "idx_p46_bookings_confirmed_by_fk" on public."bookings" ("confirmed_by");
create index if not exists "idx_p46_bookings_member_id_fk" on public."bookings" ("member_id");
create index if not exists "idx_p46_chat_messages_chat_id_fk" on public."chat_messages" ("chat_id");
create index if not exists "idx_p46_chat_messages_sender_id_fk" on public."chat_messages" ("sender_id");
create index if not exists "idx_p46_chat_participants_user_id_fk" on public."chat_participants" ("user_id");
create index if not exists "idx_p46_chats_last_message_id_fk" on public."chats" ("last_message_id");
create index if not exists "idx_p46_chats_community_id_fk" on public."chats" ("community_id");
create index if not exists "idx_p46_communities_agency_id_fk" on public."communities" ("agency_id");
create index if not exists "idx_p46_community_admins_user_id_fk" on public."community_admins" ("user_id");
create index if not exists "idx_p46_community_amenities_community_id_fk" on public."community_amenities" ("community_id");
create index if not exists "idx_p46_community_configuration_community_id_fk" on public."community_configuration" ("community_id");
create index if not exists "idx_p46_community_documents_uploaded_by_fk" on public."community_documents" ("uploaded_by");
create index if not exists "idx_p46_community_financial_records_created_by_fk" on public."community_financial_records" ("created_by");
create index if not exists "idx_p46_community_financial_records_unit_id_fk" on public."community_financial_records" ("unit_id");
create index if not exists "idx_p46_community_memberships_created_by_fk" on public."community_memberships" ("created_by");
create index if not exists "idx_p46_community_memberships_updated_by_fk" on public."community_memberships" ("updated_by");
create index if not exists "idx_p46_community_module_overrides_module_id_fk" on public."community_module_overrides" ("module_id");
create index if not exists "idx_p46_complaint_categories_community_id_fk" on public."complaint_categories" ("community_id");
create index if not exists "idx_p46_complaint_comments_complaint_id_fk" on public."complaint_comments" ("complaint_id");
create index if not exists "idx_p46_complaint_comments_created_by_fk" on public."complaint_comments" ("created_by");
create index if not exists "idx_p46_complaints_created_by_profile_id_fk" on public."complaints" ("created_by_profile_id");
create index if not exists "idx_p46_complaints_resolved_by_profile_id_fk" on public."complaints" ("resolved_by_profile_id");
create index if not exists "idx_p46_daily_help_user_id_fk" on public."daily_help" ("user_id");
create index if not exists "idx_p46_daily_helps_user_id_fk" on public."daily_helps" ("user_id");
create index if not exists "idx_p46_data_purchases_package_id_fk" on public."data_purchases" ("package_id");
create index if not exists "idx_p46_data_purchases_payment_ref_id_fk" on public."data_purchases" ("payment_ref_id");
create index if not exists "idx_p46_data_purchases_processed_by_fk" on public."data_purchases" ("processed_by");
create index if not exists "idx_p46_data_purchases_profile_id_fk" on public."data_purchases" ("profile_id");
create index if not exists "idx_p46_data_purchases_user_id_fk" on public."data_purchases" ("user_id");
create index if not exists "idx_p46_documents_associated_complaint_id_fk" on public."documents" ("associated_complaint_id");
create index if not exists "idx_p46_documents_associated_maintenance_id_fk" on public."documents" ("associated_maintenance_id");
create index if not exists "idx_p46_documents_associated_notice_id_fk" on public."documents" ("associated_notice_id");
create index if not exists "idx_p46_documents_associated_payment_id_fk" on public."documents" ("associated_payment_id");
create index if not exists "idx_p46_documents_associated_unit_id_fk" on public."documents" ("associated_unit_id");
create index if not exists "idx_p46_documents_uploaded_by_fk" on public."documents" ("uploaded_by");
create index if not exists "idx_p46_email_notifications_template_id_fk" on public."email_notifications" ("template_id");
create index if not exists "idx_p46_emergency_alerts_resolved_by_fk" on public."emergency_alerts" ("resolved_by");
create index if not exists "idx_p46_emergency_alerts_unit_id_fk" on public."emergency_alerts" ("unit_id");
create index if not exists "idx_p46_emergency_alerts_user_id_fk" on public."emergency_alerts" ("user_id");
create index if not exists "idx_p46_entry_logs_guard_id_fk" on public."entry_logs" ("guard_id");
create index if not exists "idx_p46_entry_logs_pass_id_fk" on public."entry_logs" ("pass_id");
create index if not exists "idx_p46_equipment_assignments_equipment_id_fk" on public."equipment_assignments" ("equipment_id");
create index if not exists "idx_p46_equipment_assignments_guard_id_fk" on public."equipment_assignments" ("guard_id");
create index if not exists "idx_p46_equipment_id_mapping_uuid_id_fk" on public."equipment_id_mapping" ("uuid_id");
create index if not exists "idx_p46_equipment_maintenance_equipment_id_fk" on public."equipment_maintenance" ("equipment_id");
create index if not exists "idx_p46_family_members_user_id_fk" on public."family_members" ("user_id");
create index if not exists "idx_p46_frequent_entries_user_id_fk" on public."frequent_entries" ("user_id");
create index if not exists "idx_p46_frequent_visitors_user_id_fk" on public."frequent_visitors" ("user_id");
create index if not exists "idx_p46_gate_passes_visitor_id_fk" on public."gate_passes" ("visitor_id");
create index if not exists "idx_p46_gatepasses_entry_id_fk" on public."gatepasses" ("entry_id");
create index if not exists "idx_p46_gatepasses_user_id_fk" on public."gatepasses" ("user_id");
create index if not exists "idx_p46_group_messages_from_user_fk" on public."group_messages" ("from_user");
create index if not exists "idx_p46_group_messages_group_id_fk" on public."group_messages" ("group_id");
create index if not exists "idx_p46_groups_created_by_fk" on public."groups" ("created_by");
create index if not exists "idx_p46_guard_assignments_backup_guard_id_fk" on public."guard_assignments" ("backup_guard_id");
create index if not exists "idx_p46_guard_assignments_supervisor_id_fk" on public."guard_assignments" ("supervisor_id");
create index if not exists "idx_p46_guard_equipment_assigned_to_fk" on public."guard_equipment" ("assigned_to");
create index if not exists "idx_p46_guard_id_mapping_uuid_id_fk" on public."guard_id_mapping" ("uuid_id");
create index if not exists "idx_p46_guard_performance_guard_id_fk" on public."guard_performance" ("guard_id");
create index if not exists "idx_p46_guard_schedules_replacement_id_fk" on public."guard_schedules" ("replacement_id");
create index if not exists "idx_p46_guard_shifts_guard_id_fk" on public."guard_shifts" ("guard_id");
create index if not exists "idx_p46_guard_shifts_community_id_fk" on public."guard_shifts" ("community_id");
create index if not exists "idx_p46_guard_training_guard_id_fk" on public."guard_training" ("guard_id");
create index if not exists "idx_p46_in_app_notification_recipients_user_id_fk" on public."in_app_notification_recipients" ("user_id");
create index if not exists "idx_p46_inquiries_assigned_to_fk" on public."inquiries" ("assigned_to");
create index if not exists "idx_p46_insurance_payments_payment_ref_id_fk" on public."insurance_payments" ("payment_ref_id");
create index if not exists "idx_p46_insurance_payments_processed_by_fk" on public."insurance_payments" ("processed_by");
create index if not exists "idx_p46_insurance_payments_profile_id_fk" on public."insurance_payments" ("profile_id");
create index if not exists "idx_p46_insurance_payments_user_id_fk" on public."insurance_payments" ("user_id");
create index if not exists "idx_p46_join_request_email_queue_join_request_id_fk" on public."join_request_email_queue" ("join_request_id");
create index if not exists "idx_p46_join_request_sms_queue_join_request_id_fk" on public."join_request_sms_queue" ("join_request_id");
create index if not exists "idx_p46_join_requests_reviewed_by_fk" on public."join_requests" ("reviewed_by");
create index if not exists "idx_p46_join_requests_unit_id_fk" on public."join_requests" ("unit_id");
create index if not exists "idx_p46_maintenance_unit_id_fk" on public."maintenance" ("unit_id");
create index if not exists "idx_p46_maintenance_requests_assigned_to_fk" on public."maintenance_requests" ("assigned_to");
create index if not exists "idx_p46_maintenance_requests_requested_by_fk" on public."maintenance_requests" ("requested_by");
create index if not exists "idx_p46_maintenance_requests_resolved_by_profile_id_fk" on public."maintenance_requests" ("resolved_by_profile_id");
create index if not exists "idx_p46_marketplace_cart_items_product_id_fk" on public."marketplace_cart_items" ("product_id");
create index if not exists "idx_p46_marketplace_favorites_product_id_fk" on public."marketplace_favorites" ("product_id");
create index if not exists "idx_p46_marketplace_order_items_order_id_fk" on public."marketplace_order_items" ("order_id");
create index if not exists "idx_p46_marketplace_order_items_product_id_fk" on public."marketplace_order_items" ("product_id");
create index if not exists "idx_p46_marketplace_orders_user_id_fk" on public."marketplace_orders" ("user_id");
create index if not exists "idx_p46_marketplace_orders_vendor_id_fk" on public."marketplace_orders" ("vendor_id");
create index if not exists "idx_p46_marketplace_products_category_id_fk" on public."marketplace_products" ("category_id");
create index if not exists "idx_p46_marketplace_products_vendor_id_fk" on public."marketplace_products" ("vendor_id");
create index if not exists "idx_p46_marketplace_reviews_order_id_fk" on public."marketplace_reviews" ("order_id");
create index if not exists "idx_p46_marketplace_reviews_product_id_fk" on public."marketplace_reviews" ("product_id");
create index if not exists "idx_p46_marketplace_reviews_user_id_fk" on public."marketplace_reviews" ("user_id");
create index if not exists "idx_p46_marketplace_search_history_user_id_fk" on public."marketplace_search_history" ("user_id");
create index if not exists "idx_p46_members_community_id_fk" on public."members" ("community_id");
create index if not exists "idx_p46_members_unit_id_fk" on public."members" ("unit_id");
create index if not exists "idx_p46_members_user_id_fk" on public."members" ("user_id");
create index if not exists "idx_p46_messages_reply_to_id_fk" on public."messages" ("reply_to_id");
create index if not exists "idx_p46_money_transfers_payment_ref_id_fk" on public."money_transfers" ("payment_ref_id");
create index if not exists "idx_p46_money_transfers_processed_by_fk" on public."money_transfers" ("processed_by");
create index if not exists "idx_p46_money_transfers_profile_id_fk" on public."money_transfers" ("profile_id");
create index if not exists "idx_p46_money_transfers_user_id_fk" on public."money_transfers" ("user_id");
create index if not exists "idx_p46_notification_rules_template_id_fk" on public."notification_rules" ("template_id");
create index if not exists "idx_p46_payment_charge_runs_agency_id_fk" on public."payment_charge_runs" ("agency_id");
create index if not exists "idx_p46_payment_gateway_configs_community_id_fk" on public."payment_gateway_configs" ("community_id");
create index if not exists "idx_p46_payment_gateway_configs_created_by_fk" on public."payment_gateway_configs" ("created_by");
create index if not exists "idx_p46_payment_gateway_configs_updated_by_fk" on public."payment_gateway_configs" ("updated_by");
create index if not exists "idx_p46_payments_booking_id_fk" on public."payments" ("booking_id");
create index if not exists "idx_p46_payments_payout_batch_id_fk" on public."payments" ("payout_batch_id");
create index if not exists "idx_p46_payout_destinations_community_id_fk" on public."payout_destinations" ("community_id");
create index if not exists "idx_p46_payout_ledger_entries_community_id_fk" on public."payout_ledger_entries" ("community_id");
create index if not exists "idx_p46_payout_ledger_entries_payout_request_id_fk" on public."payout_ledger_entries" ("payout_request_id");
create index if not exists "idx_p46_payout_request_items_payment_id_fk" on public."payout_request_items" ("payment_id");
create index if not exists "idx_p46_payout_requests_community_id_fk" on public."payout_requests" ("community_id");
create index if not exists "idx_p46_payout_requests_destination_id_fk" on public."payout_requests" ("destination_id");
create index if not exists "idx_p46_payout_rules_community_id_fk" on public."payout_rules" ("community_id");
create index if not exists "idx_p46_permissions_created_by_fk" on public."permissions" ("created_by");
create index if not exists "idx_p46_permissions_updated_by_fk" on public."permissions" ("updated_by");
create index if not exists "idx_p46_personal_hub_analytics_provider_id_fk" on public."personal_hub_analytics" ("provider_id");
create index if not exists "idx_p46_profiles_role_id_fk" on public."profiles" ("role_id");
create index if not exists "idx_p46_recent_searches_user_id_fk" on public."recent_searches" ("user_id");
create index if not exists "idx_p46_role_permissions_granted_by_fk" on public."role_permissions" ("granted_by");
create index if not exists "idx_p46_saved_bill_accounts_profile_id_fk" on public."saved_bill_accounts" ("profile_id");
create index if not exists "idx_p46_saved_policies_profile_id_fk" on public."saved_policies" ("profile_id");
create index if not exists "idx_p46_service_bookings_service_id_fk" on public."service_bookings" ("service_id");
create index if not exists "idx_p46_service_bookings_user_id_fk" on public."service_bookings" ("user_id");
create index if not exists "idx_p46_service_subtypes_service_id_fk" on public."service_subtypes" ("service_id");
create index if not exists "idx_p46_services_community_id_fk" on public."services" ("community_id");
create index if not exists "idx_p46_shopping_payments_payment_ref_id_fk" on public."shopping_payments" ("payment_ref_id");
create index if not exists "idx_p46_shopping_payments_processed_by_fk" on public."shopping_payments" ("processed_by");
create index if not exists "idx_p46_shopping_payments_profile_id_fk" on public."shopping_payments" ("profile_id");
create index if not exists "idx_p46_shopping_payments_user_id_fk" on public."shopping_payments" ("user_id");
create index if not exists "idx_p46_storage_user_id_fk" on public."storage" ("user_id");
create index if not exists "idx_p46_support_messages_user_id_fk" on public."support_messages" ("user_id");
create index if not exists "idx_p46_support_requests_user_id_fk" on public."support_requests" ("user_id");
create index if not exists "idx_p46_transaction_status_logs_changed_by_fk" on public."transaction_status_logs" ("changed_by");
create index if not exists "idx_p46_user_groups_created_by_fk" on public."user_groups" ("created_by");
create index if not exists "idx_p46_user_groups_updated_by_fk" on public."user_groups" ("updated_by");
create index if not exists "idx_p46_user_settings_language_id_fk" on public."user_settings" ("language_id");
create index if not exists "idx_p46_user_settings_user_id_fk" on public."user_settings" ("user_id");
create index if not exists "idx_p46_vehicles_user_id_fk" on public."vehicles" ("user_id");
create index if not exists "idx_p46_visitor_passes_approved_by_fk" on public."visitor_passes" ("approved_by");
create index if not exists "idx_p46_visitor_passes_checked_in_by_fk" on public."visitor_passes" ("checked_in_by");
create index if not exists "idx_p46_visitor_passes_checked_out_by_fk" on public."visitor_passes" ("checked_out_by");
create index if not exists "idx_p46_visitors_member_id_fk" on public."visitors" ("member_id");

-- Public buckets do not need broad SELECT policies for public URL access; dropping these prevents object listing.
drop policy if exists "Anyone can view attachments" on storage.objects;
drop policy if exists "Allow complaint image viewing" on storage.objects;

set check_function_bodies = on;
