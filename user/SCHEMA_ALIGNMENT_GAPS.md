# User App Schema Alignment Gaps

Date: 2026-02-07 (updated 2026-02-21)

## Audit Baseline
- App code scanned: `/Users/andromeda/casanirvana/user/screens`, `/Users/andromeda/casanirvana/user/hooks`, `/Users/andromeda/casanirvana/user/services`.
- Type baseline compared against: `/Users/andromeda/casanirvana/supabase/database.types.ts`.
- Goal: map referenced DB objects that are not present in generated types, then decide `migration` vs `code alignment`.

## Confirmed Missing DB Objects
| Object | Type | Referenced In | In `database.types.ts` | Decision | Rationale |
|---|---|---|---|---|---|
| `events` | table | Legacy `/Users/andromeda/casanirvana/user/services/eventService.js` (removed) | No | `Code alignment` (completed) | Deferred out-of-scope for current user app production path; no active screen/hook references remain |
| `marketplace_vendor_followers` | table | `/Users/andromeda/casanirvana/user/services/marketplaceService.js` | Yes | `Migration` (completed) | Added in `supabase/migrations/20260207150526_phase9_slice5_marketplace_followers.sql` |
| `saved_bill_accounts` | table | `/Users/andromeda/casanirvana/user/services/billPaymentService.js` | Yes | `Migration` (completed) | Added in `supabase/migrations/20260207145514_phase9_slice4_saved_accounts_policies.sql` |
| `saved_policies` | table | `/Users/andromeda/casanirvana/user/services/insuranceService.js` | Yes | `Migration` (completed) | Added in `supabase/migrations/20260207145514_phase9_slice4_saved_accounts_policies.sql` |
| `user_addresses` | table | `/Users/andromeda/casanirvana/user/screens/deliveryAddressScreen.js`, `/Users/andromeda/casanirvana/user/services/marketplaceService.js` | Yes | `Migration` (completed) | Added in `supabase/migrations/20260207152555_phase9_slice5_user_addresses.sql` |
| `community_memberships` | table | `/Users/andromeda/casanirvana/user/hooks/useCommunityMembers.ts`, `/Users/andromeda/casanirvana/Guard/hooks/useCommunityDirectoryMembers.js`, `/Users/andromeda/casanirvana/superadmin/src/hooks/useCommunityDirectoryMembers.ts` | Yes | `Migration` (completed) | Added in `supabase/migrations/20260220160000_phase10_community_directory_memberships.sql` as canonical community-scoped role source |
| `increment` | RPC/function | `/Users/andromeda/casanirvana/user/services/marketplaceService.js` | No | `Code alignment` (completed) | Removed dependency; follower count now maintained via DB trigger |
| `decrement` | RPC/function | `/Users/andromeda/casanirvana/user/services/marketplaceService.js` | No | `Code alignment` (completed) | Removed dependency; follower count now maintained via DB trigger |

## Non-Table Clarification
| Object | Used As | Referenced In | Decision |
|---|---|---|---|
| `attachments` | Supabase Storage bucket | `/Users/andromeda/casanirvana/user/hooks/useTechnicalSupport.js` | Not a Postgres migration; bucket + storage policies required |
| `chat-attachments` | Supabase Storage bucket | `/Users/andromeda/casanirvana/user/screens/messageScreen.js`, `/Users/andromeda/casanirvana/superadmin/src/app/(admin)/messages/components/ChatArea.tsx` | `Migration` (completed via `supabase/migrations/20260221175254_phase19_chat_calls_and_storage_hardening.sql`) |

## Additional Alignment Gaps (Code vs Runtime Contract)
| Gap | Evidence | Impact | Decision |
|---|---|---|---|
| Invalid Supabase client import path | `/Users/andromeda/casanirvana/user/services/billPaymentService.js`, `/Users/andromeda/casanirvana/user/services/insuranceService.js` import `../supabase/client` (file not present) | Runtime import failure in those paths | `Code alignment` |
| `family_members` had RLS enabled without active policies | `public.family_members` returned no `pg_policies` rows while table RLS was enabled | Profile module family-member reads/writes blocked at runtime for authenticated users | `Migration` (completed via `supabase/migrations/20260221220537_phase22_family_members_rls_hardening.sql`) |
| Supabase client fragmentation | Mixed imports from `../utils/supabase` and `../lib/supabase` across hooks/services | Auth/session inconsistency risk | `Code alignment` |
| React Query API version mismatch | `/Users/andromeda/casanirvana/user/hooks/useBillPayments.ts`, `/Users/andromeda/casanirvana/user/hooks/useInsurancePayments.ts` use `react-query` while app uses `@tanstack/react-query` elsewhere | Cache and mutation behavior drift | `Code alignment` |
| Profile identifier strategy mismatch | `useGetProfile` uses `.eq('user_id', auth.uid())`, while notification settings/token writes use `.eq('id', user.id)` | Frequent empty reads/writes and policy edge cases | `Code alignment` |
| Notice read policies were previously over-permissive | Legacy `public.notices` policies included broad read paths (`USING true`) | Tenant scope leakage risk in superadmin/user contexts | `Migration` (completed via `supabase/migrations/20260221113000_phase13_notices_rls_scope_hardening.sql`) |
| Notice comments identifier contract mismatch | Historical `public.comments.notice_id` text/static IDs were normalized to UUID with backup preservation | Data integrity is now enforced via FK to `notices(id)`; legacy rows preserved in `datafix_phase13_legacy_notice_comments_backup` | `Migration` (completed via `supabase/migrations/20260221115000_phase13_comments_notice_contract_hardening.sql`) |
| Complaint comments read path was over-permissive and profile mapping was partial | Legacy `public.complaint_comments` policy allowed authenticated global read (`USING true`); `get_complaint_comments_with_profiles` joined only on `profiles.user_id` | Cross-tenant visibility risk and intermittent missing commenter profile data | `Migration` (completed via `supabase/migrations/20260221152000_phase17_complaint_comments_rls_hardening.sql`) |
| Community complaint visibility model was implicit/ambiguous | `public.complaints` select policies covered actor/unit occupant/admin scope, while community tab intended community-wide complaint feed | Residents could miss valid community complaints outside their own unit and behavior depended on policy side effects | `Migration + Code alignment` (completed via `supabase/migrations/20260221164500_phase17_complaints_community_visibility_scope.sql` + community-scoped `useListCommunityComplaints`) |
| Legacy maintenance requester/unit mismatch rows (user profile moved while pending rows pointed to old unit) | `public.maintenance_requests` contained pending rows for `thebornless144@gmail.com` where `maintenance_requests.unit_id <> profiles.unit_id` | Superadmin/user maintenance views could appear under wrong community/unit scope | `Migration` (completed via reversible cleanup in `supabase/migrations/20260221161045_phase18_maintenance_profile_unit_alignment_cleanup.sql`) |
| Maintenance attachment contract missing from DB | `addMaintenanceRequestScreen` needed image uploads while `public.maintenance_requests` had no attachment column | Attachment UI could not persist/read real maintenance images | `Migration + Code alignment` (completed via `supabase/migrations/20260221173000_phase18_maintenance_attachments_support.sql` + user create-flow upload wiring) |
| Service request rows could reference services from a different community | Legacy data had `service_requests.community_id <> services.community_id` in 24 rows, which broke tenant-safe attribution and service join consistency | Cross-community linkage risk and inconsistent service labels in user/superadmin details | `Migration + Code alignment` (completed via `supabase/migrations/20260221202000_phase20_service_requests_scope_guardrail.sql`; rows backed up into `datafix_phase20_service_request_scope_mismatch_backup`, mismatched links detached with title preservation, and trigger guardrail added) |
| Personal hub provider/status-log access was under-hardened | `service_providers`/`transaction_status_logs` had RLS enabled but no scoped policies, and `personal_hub_transactions` view/grants were broad | Leakage or write-path unpredictability for payment operations | `Migration` (completed via `supabase/migrations/20260221101410_phase14_payments_rls_and_datafix.sql`) |
| User payment entry providers were hardcoded after `service_providers` RLS hardening | User entry screens (`airtime`/`data`/`transfer`/`utilities`/`tv`/`insurance`) used static arrays because direct `service_providers` reads are admin-scoped | Superadmin provider changes would not propagate to user app; catalog drift risk | `Migration + Code alignment` (completed via `supabase/migrations/20260221104014_phase14_public_service_provider_catalog_rpc.sql` + `/Users/andromeda/casanirvana/user/services/serviceProviderCatalogService.js`) |
| Personal Hub service selection/fulfillment lacked ExpressPay bill-payments metadata and query context | `service_providers`/`service_packages` did not track external service codes, query/pay/status capability, or synced provider payloads; Personal Hub source tables could not persist provider query/fulfillment state | User app and superadmin Personal Hub flows could not use ExpressPay as the authoritative service catalog and had to rely on hardcoded bundles/provider assumptions | `Migration + Code alignment` (foundation completed via `supabase/migrations/20260310101500_phase35_personal_hub_expresspay_catalog_alignment.sql`, backend bill-pay adapter/services, and user query-first flow refactor; superadmin service-workspace remediation remains in progress) |
| Legacy personal-hub transaction actor mapping gaps (`user_id` null) | Existing rows in `airtime_purchases`/`data_purchases`/`money_transfers`/`bill_payments` lacked `user_id` for many records | User-scoped filtering and analytics gaps in `personal_hub_transactions` view | `Migration` (completed via reversible cleanup + archival in `supabase/migrations/20260221101410_phase14_payments_rls_and_datafix.sql` and `supabase/migrations/20260221215412_phase14_personal_hub_null_user_archival.sql`; live rows now have `user_id` populated) |
| Bill/insurance amount verification used simulated timeout payloads | `billAmountScreen` and `insuranceAmountScreen` auto-filled fake customer/policy data after timeout | False-positive UX and non-production behavior | `Code alignment` (completed: simulation removed; user-entered amount contract only) |
| Mobile money flow used fake success timer and did not persist save toggles | `mobileMoneyScreen` marked success after timeout without provider callback and skipped `saved_bill_accounts`/`saved_policies` writes | Incorrect transaction state UX and lost user preferences | `Code alignment` (completed: pending-state confirmation + saved account/policy upsert wiring) |
| Calls table retained permissive legacy RLS policies | `public.calls` had overlapping permissive policies (including unconditional `with check true`) from legacy phases | Cross-tenant call visibility/update risk and inconsistent runtime behavior | `Migration` (completed via `supabase/migrations/20260221175254_phase19_chat_calls_and_storage_hardening.sql`) |
| Chat attachment bucket had no explicit policies | `storage.objects` had no `chat-attachments` policy set | Chat file uploads/reads could fail or behave inconsistently by environment/session | `Migration` (completed via `supabase/migrations/20260221175254_phase19_chat_calls_and_storage_hardening.sql`) |

## Migration vs Code Alignment Plan

### A) Objects to Migrate (if corresponding feature remains in production scope)
1. `marketplace_vendor_followers` table. (done)
2. `saved_bill_accounts` table. (done)
3. `saved_policies` table. (done)
4. `user_addresses` table. (done)
5. RPC equivalents for `increment`/`decrement` or service-level replacements. (done via service-level replacement + trigger)

### B) Objects to Remove/Refactor Instead of Migrating
1. `events` table path. (done)
   - Product scope decision: deferred/out-of-scope for current release.
   - Legacy `eventService` path removed to avoid dead schema dependency.
   - Re-introduce only with explicit product scope and forward-only migration.

### C) Storage Prerequisite
1. Ensure storage bucket `attachments` exists for support/help-desk file uploads.
2. Ensure storage bucket `chat-attachments` exists with owner-scoped write/delete policies for messaging.
3. Ensure bucket-level write/read policies match messaging + support workflows.

## Recommended Immediate Sequence
1. Keep current code-alignment baseline (`events` deferred; no dead schema dependencies).
2. For newly approved features, add forward-only SQL migrations in `/Users/andromeda/casanirvana/supabase/migrations`.
3. Re-run this gap check after each migration/types sync cycle.
