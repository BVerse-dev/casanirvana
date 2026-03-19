# Active Migration Rollback Notes

These notes cover the active post-baseline migration set in `/Users/andromeda/casanirvana/supabase/migrations`.

Use this file together with:
- `/Users/andromeda/casanirvana/superadmin/PRODUCTION_TENANT_RLS_REMEDIATION_CHECKLIST.md`
- `/Users/andromeda/casanirvana/supabase/audit/phase11_tenant_scope_verification.sql`
- the direct live verification queries already recorded in the progress trackers

Rules:
- Prefer rollback only for the latest isolated migration in an affected domain.
- If later migrations depend on the target migration, use a forward fix or snapshot restore instead of a destructive rollback.
- On production, never rerun historical SQL blindly after a history repair. Verify live objects first, then decide whether the fix is metadata-only, forward-fix, or true rollback.

## Playbooks

### Playbook A: Policy / RLS rollback
Use for migrations that mainly replace RLS policies, helper functions, or scoped access predicates.

Procedure:
1. Export the current policy/function state for the affected tables with `pg_policies` and `pg_proc`.
2. Drop only the policies and helper functions introduced by the target migration.
3. Reapply the last known good policy snapshot from the immediately preceding migration state or baseline snapshot.
4. Rerun the domain verification queries and the affected app smoke checks.

### Playbook B: Data backfill / cleanup rollback
Use for migrations that backfill, archive, detach, or realign data.

Procedure:
1. Restore from the named backup table if the migration created one.
2. If no backup exists, reverse only rows clearly attributable to the migration; otherwise use a forward-fix instead of destructive rollback.
3. Rebuild derived fields, rerun counts, and verify no tenant-scope regressions remain.

### Playbook C: Additive schema / helper rollback
Use for migrations that add columns, indexes, triggers, functions, buckets, or helper RPCs without rebuilding an entire domain.

Procedure:
1. Confirm no later migration depends on the added object.
2. Drop added triggers, indexes, constraints, functions, and columns in reverse dependency order.
3. Revert the corresponding backend/frontend contract before re-enabling writes.
4. Rerun the affected verification queries and build/test the dependent apps.

### Playbook D: Structural contract / domain rebuild rollback
Use for migrations that rebuild foreign keys, table contracts, payment domains, or other structural boundaries.

Procedure:
1. Treat rollback as a domain restore, not a single `DROP` sequence.
2. Restore from the pre-migration snapshot or named backup tables first.
3. Repoint foreign keys, views, policies, and triggers to the prior contract.
4. Rerun full domain verification before reopening writes.

### Playbook E: History repair only
Use only for remote `supabase_migrations.schema_migrations` metadata repairs where the live schema was verified separately.

Procedure:
1. Do not rerun the historical migration SQL on production.
2. Remove the metadata row only if you prove the target environment does not actually contain the migrated schema state.
3. If the schema state exists, leave the repaired history row in place and treat regressions as forward-fix work.

## Per-Migration Mapping

### Playbook A
- `20260206234500_phase7_rls_financial_tables.sql` [history repaired on prod 2026-03-16]
- `20260206235500_phase7_rls_pii_tables.sql` [history repaired on prod 2026-03-16]
- `20260207001000_phase7_policy_cleanup_payments.sql` [history repaired on prod 2026-03-16]
- `20260207002000_phase7_policy_cleanup_notifications.sql` [history repaired on prod 2026-03-16]
- `20260207003000_phase7_policy_cleanup_profiles_users.sql` [history repaired on prod 2026-03-16]
- `20260207004000_phase7_policy_cleanup_messaging.sql` [history repaired on prod 2026-03-16]
- `20260207005000_phase7_policy_cleanup_system.sql` [history repaired on prod 2026-03-16]
- `20260207006000_phase7_fix_profiles_policy_recursion.sql` [history repaired on prod 2026-03-16]
- `20260207112132_fix_notifications_and_chat_policy_recursion.sql`
- `20260207141234_phase9_slice3_messages_rls_insert_fix.sql`
- `20260207145514_phase9_slice4_saved_accounts_policies.sql`
- `20260207150526_phase9_slice5_marketplace_followers.sql`
- `20260207152555_phase9_slice5_user_addresses.sql`
- `20260220194744_phase11_tenant_scope_rls_hardening.sql`
- `20260221004421_phase13_notices_rls_scope_hardening.sql`
- `20260221115418_phase15_amenities_rls_contract_cleanup.sql`
- `20260221140227_phase16_inquiries_rls_hardening.sql`
- `20260221145445_phase17_complaint_comments_rls_hardening.sql`
- `20260221150555_phase17_complaints_community_visibility_scope.sql`
- `20260221182810_phase20_services_and_service_bookings_rls_hardening.sql`
- `20260221210105_phase21_payments_rls_actor_scope_fix.sql`
- `20260221220537_phase22_family_members_rls_hardening.sql`
- `20260221224136_phase22_profile_directory_admin_read_scope.sql`
- `20260222182257_phase25_guard_visitor_entry_rls_alignment.sql`
- `20260222182327_phase25_guard_visitor_insert_policy_fix.sql`
- `20260222184534_phase25_guard_profiles_read_scope.sql`
- `20260222214458_phase25_guard_emergency_alert_update_policy.sql`
- `20260222215502_phase25_guard_emergency_recipient_notify_policy.sql`
- `20260222220109_phase25_guard_notify_user_profile_fallback.sql`
- `20260222224130_phase26_guard_profile_update_policy.sql`
- `20260227165429_phase27_admin_roles_rls_recursion_fix.sql`
- `20260302082140_phase32_payout_rls_hardening.sql`
- `20260303_phase34_guard_agency_scope_rls_hardening.sql`
- `20260310184500_phase36_marketplace_guard_internal_rls_cleanup.sql` (use the embedded rollback notes in the SQL file first, then this playbook if further cleanup is needed)

### Playbook B
- `20260220160000_phase10_community_directory_memberships.sql`
- `20260220200318_phase11_profile_resolution_prefer_user_id.sql`
- `20260220213222_phase12_visitor_passes_community_backfill.sql`
- `20260220221003_phase12_reversible_visitor_created_by_cleanup_v2.sql` (restore from the migration backup table noted in the SQL file)
- `20260220222100_phase12_align_superadmin_scope_to_casa_nirvana.sql` (restore from the migration backup noted in the SQL file)
- `20260221101410_phase14_payments_rls_and_datafix.sql` (restore from the migration backup table and use the in-file rollback notes)
- `20260221112539_phase14_personal_hub_user_id_backfill_pass2_auth_only.sql`
- `20260221161045_phase18_maintenance_profile_unit_alignment_cleanup.sql` (use the rollback helper documented in the SQL file)
- `20260221201404_phase20_service_requests_scope_guardrail.sql` (restore from `datafix_phase20_service_request_scope_mismatch_backup` before reattaching service ids)
- `20260221215412_phase14_personal_hub_null_user_archival.sql`
- `20260222190401_phase25_walkin_entry_artifacts_backfill.sql` (restore from `datafix_phase25_walkin_pass_artifacts_backup`)
- `20260222193112_phase25_guard_profile_sync_on_users.sql` (restore from `datafix_phase25_guard_profile_backfill_backup`)
- `20260307203000_phase34_email_scope_backfill.sql` [history repaired on prod 2026-03-16]
- `20260310101500_phase35_personal_hub_expresspay_catalog_alignment.sql`
- `20260319113000_phase41_archive_legacy_unattributed_visitor_passes.sql` (restore from `datafix_phase41_legacy_visitor_passes_archive` and `datafix_phase41_legacy_visitor_entry_logs_archive`)

### Playbook C
- `20260220201027_phase11_profiles_identity_guard.sql`
- `20260221104014_phase14_public_service_provider_catalog_rpc.sql`
- `20260221164728_phase18_maintenance_attachments_support.sql`
- `20260221175254_phase19_chat_calls_and_storage_hardening.sql`
- `20260222002101_phase24_emergency_contract_and_recipients_hardening.sql`
- `20260227153916_phase27_expresspay_secure_gateway_config.sql`
- `20260227161950_phase27_vault_secret_helper_rpcs.sql`
- `20260306180000_phase34_guard_assignment_scope_sync.sql` [history repaired on prod 2026-03-16]
- `20260307191500_phase34_notification_template_linkage.sql` [history repaired on prod 2026-03-16]
- `20260311130500_phase35_profiles_roles_and_users_updated_at.sql`
- `20260313190000_phase40_system_settings_scoping_and_app_assets.sql`

### Playbook D
- `20260221005336_phase13_comments_notice_contract_hardening.sql`
- `20260301104546_phase28_payment_domain_rebuild.sql`
- `20260301132629_phase29_payment_source_alignment.sql`
- `20260301194127_phase30_payment_charge_management.sql`
- `20260301220953_phase31_payouts_foundation.sql`
- `20260311235500_phase37_guard_identity_normalization.sql`
- `20260313103000_phase38_notification_campaign_tenant_scope.sql`
- `20260313153000_phase39_notice_comment_launch_hardening.sql`

### Playbook E
- The remote history repair completed on 2026-03-16 for:
  - `20260206234500_phase7_rls_financial_tables.sql`
  - `20260206235500_phase7_rls_pii_tables.sql`
  - `20260207001000_phase7_policy_cleanup_payments.sql`
  - `20260207002000_phase7_policy_cleanup_notifications.sql`
  - `20260207003000_phase7_policy_cleanup_profiles_users.sql`
  - `20260207004000_phase7_policy_cleanup_messaging.sql`
  - `20260207005000_phase7_policy_cleanup_system.sql`
  - `20260207006000_phase7_fix_profiles_policy_recursion.sql`
  - `20260306180000_phase34_guard_assignment_scope_sync.sql`
  - `20260307191500_phase34_notification_template_linkage.sql`
  - `20260307203000_phase34_email_scope_backfill.sql`
- For those versions, production already had the verified schema state before the metadata insert. Treat them as metadata-alignment entries, not migrations to be replayed.
