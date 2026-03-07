# Guard App Schema Alignment Gaps

Date: 2026-02-22

## Audit Baseline
- App code to scan: `/Users/andromeda/casanirvana/Guard/screens`, `/Users/andromeda/casanirvana/Guard/hooks`, `/Users/andromeda/casanirvana/Guard/services`.
- Shared type baseline: `/Users/andromeda/casanirvana/supabase/database.types.ts`.
- Goal: list runtime DB dependencies, then decide `migration` vs `code alignment` per gap.

## Confirmed Missing DB Objects
| Object | Type | Referenced In | In `database.types.ts` | Decision | Rationale |
|---|---|---|---|---|---|
| `is_guard_role()` | Function | Guard visitor-entry and notification RLS scope | `No` (new helper) | `Migration` | Existing `is_admin_role()` excluded guards, blocking guard-scoped visitor operations. |
| `current_guard_community_id()` | Function | Guard tenant scoping in RLS checks | `No` (new helper) | `Migration` | Guard access needed community derivation independent of `profiles`. |
| `guard_can_access_community(uuid)` | Function | `visitor_passes` select/insert/update policies | `No` (new helper) | `Migration` | Required deterministic community scope for guard role. |
| `guard_can_access_unit(uuid)` | Function | `visitor_passes` select/update policies | `No` (new helper) | `Migration` | Guard should operate only on units in assigned community. |
| `guard_can_notify_user(uuid)` | Function | `notifications` insert policy for guard flows | `No` (new helper) | `Migration` | Guard notification insert needed same-community recipient check. |
| `p25_*` guard policies | RLS policies | `visitor_passes`, `notifications` | `No` (policies, not types) | `Migration` | Guard app code paths were blocked by admin-only policy checks. |
| `sync_guard_profile_from_user()` + `trg_sync_guard_profile_from_user` | Function + Trigger | Guard auth/signup bootstrap | `No` (new helper) | `Migration (completed)` | Ensures `users.role='guard'` always has a backing `guards` row for stable sign-in wiring. |

## Additional Alignment Gaps (Code vs Runtime Contract)
| Gap | Evidence | Impact | Decision |
|---|---|---|---|
| `notifications` payload mismatch (`message/type/visitor_pass_id`) vs DB columns (`body/notification_type/reference_id`) | `/Users/andromeda/casanirvana/Guard/screens/allowedScreen.js`, `/Users/andromeda/casanirvana/Guard/screens/cancelledScreen.js` | Insert failures and missing resident alerts | `Code alignment` |
| Visitor deny status used `rejected` instead of canonical `denied` | `/Users/andromeda/casanirvana/Guard/screens/cancelledScreen.js` | Inconsistent status rendering/filters across apps | `Code alignment` |
| Visitor pass updates swallowed hook errors | `/Users/andromeda/casanirvana/Guard/hooks/useVisitorPasses.js` | UI false-positive success under RLS failures | `Code alignment` |
| QR scanner mock flow (no camera + no DB lookup) | `/Users/andromeda/casanirvana/Guard/screens/qrScanner.js` | No production visitor-entry scanning | `Code alignment` |
| Gate-pass code confirm path skipped DB validation | `/Users/andromeda/casanirvana/Guard/screens/homeScreen.js` | Invalid code progression into fake confirmation | `Code alignment` |
| Walk-in guard-created entries lacked `entry_code` + `qr_code_data` | `/Users/andromeda/casanirvana/Guard/hooks/useVisitorPasses.js`, `/Users/andromeda/casanirvana/Guard/hooks/useCabEntries.js`, `/Users/andromeda/casanirvana/Guard/hooks/useDeliveryEntries.js`, `/Users/andromeda/casanirvana/Guard/hooks/useServiceEntries.js` | Guard-approved visitors could not be re-verified by code/QR with consistent parity to user-created pre-approvals | `Code alignment` |
| Legacy historical walk-in rows had null pass artifacts | `public.visitor_passes` historical data | Older entries were non-scannable/non-searchable by `entry_code` until backfill | `Migration (completed)` |
| Auth bootstrap context missing/deleted at runtime | `/Users/andromeda/casanirvana/Guard/contexts/GuardAuthContext.js`, `/Users/andromeda/casanirvana/Guard/App.js` | Session/user/guard state could not be hydrated consistently; startup route and hook consumers were unstable | `Code alignment (completed)` |
| Splash routing was timer-only and not auth-aware | `/Users/andromeda/casanirvana/Guard/screens/splashScreen.js` | Signed-in guards were always pushed through login; stack duplication risk | `Code alignment (completed)` |
| OTP verification screen bypassed Supabase auth | `/Users/andromeda/casanirvana/Guard/screens/auth/verificationScreen.js` | 4-digit local entry granted access without server verification | `Code alignment (completed)` |
| Home header and unread badge used hardcoded placeholder data | `/Users/andromeda/casanirvana/Guard/screens/homeScreen.js` | Tenant identity and notification indicators were not production-traceable | `Code alignment (completed)` |
| Notification inbox/detail screens used mock/local-only state and non-persistent actions | `/Users/andromeda/casanirvana/Guard/screens/notificationScreen.js`, `/Users/andromeda/casanirvana/Guard/screens/notificationDetailScreen.js`, `/Users/andromeda/casanirvana/Guard/hooks/useNotifications.js` | Guard could not view real notification history, read state did not persist, and home unread counts drifted from detail/list behavior | `Code alignment (completed)` |
| Supabase client lacked robust env fallback for Expo runtime variants | `/Users/andromeda/casanirvana/Guard/utils/supabase.js` | Env resolution could fail between `expoConfig.extra` and process env | `Code alignment (completed)` |
| In/Out tab counts fetched full pass datasets | `/Users/andromeda/casanirvana/Guard/screens/inOutScreen.js` | Unnecessary duplicate reads/subscriptions and avoidable runtime churn | `Code alignment (completed)` |
| In/Out card/detail mapping drifted and produced invalid durations (`NaN`) in edge cases | `/Users/andromeda/casanirvana/Guard/components/checkedInTab.js`, `/Users/andromeda/casanirvana/Guard/components/checkedOutTab.js` | Inconsistent list payloads and poor UX for partial historical pass timestamps | `Code alignment (completed)` |
| Host lookup in pass list used N+1 user queries | `/Users/andromeda/casanirvana/Guard/hooks/useVisitorPasses.js` | Performance/scalability risk and less reliable tenant-scoped host resolution | `Code alignment (completed)` |
| Emergency alerts screen used local mock dataset (no DB scope/filter/realtime) | `/Users/andromeda/casanirvana/Guard/screens/emergencyScreen.js` | Guard app showed non-production incidents unrelated to community and stale runtime state | `Code alignment (completed)` |
| Emergency detail triage actions (`acknowledge` / `investigating` / `resolved`) were UI-only | `/Users/andromeda/casanirvana/Guard/screens/emergencyDetailScreen.js` | Guard could not progress incidents from detail view, blocking operational response workflow | `Code + Migration alignment (completed)` |
| Guard profile update writes blocked on `public.guards` RLS | `/Users/andromeda/casanirvana/Guard/screens/editProfileScreen.js` | Profile edit save/update would fail for authenticated guards despite valid ownership | `Migration (completed)` |
| Guard settings screens used local-only placeholder state (no DB persistence) | `/Users/andromeda/casanirvana/Guard/screens/notificationSettingsScreen.js`, `/Users/andromeda/casanirvana/Guard/screens/chatSettingsScreen.js` | Settings reset after restart/device and produced non-production UX behavior | `Code alignment (completed)` |
| Guard call create flow could insert `calls` with null/invalid callee and non-profile caller fallback | `/Users/andromeda/casanirvana/Guard/screens/callScreen.js`, `/Users/andromeda/casanirvana/Guard/hooks/useCallManager.js` | Violated hardened call RLS contract (`caller_id/callee_id` must map to actor-accessible `profiles.id`) and caused runtime call failures | `Code alignment (completed)` |
| Visitor-detail call policy required split behavior (resident host in-app, visitor/personnel direct phone) | `/Users/andromeda/casanirvana/Guard/screens/visitorDetailScreen.js` | Needed explicit production rule so host/resident calls stay auditable in-app while guest/cab/delivery/service contacts use submitted phone numbers | `Code alignment (completed)` |
| `community_memberships` lacked tenant backfill and profile/community sync enforcement after direct resident profile edits | `supabase/migrations/20260220160000_phase10_community_directory_memberships.sql`, `/Users/andromeda/casanirvana/superadmin/src/hooks/useResidents.ts`, `/Users/andromeda/casanirvana/Guard/hooks/useCommunityDirectoryMembers.js` | Resident/tenant directory rows could disappear from Guard/User flows or remain active in the wrong community after profile edits moved the source-of-truth `profiles.community_id` | `Migration + Code alignment (completed via 20260307220000_phase35_community_directory_membership_integrity.sql + Guard/User directory freshness hardening)` |

## Migration vs Code Alignment Plan
### A) Objects to Migrate
1. `supabase/migrations/20260222194000_phase25_guard_visitor_entry_rls_alignment.sql`
2. `supabase/migrations/20260222195500_phase25_guard_visitor_insert_policy_fix.sql`
3. `supabase/migrations/20260222201500_phase25_guard_profiles_read_scope.sql`
4. `supabase/migrations/20260222213000_phase25_walkin_entry_artifacts_backfill.sql`
5. `supabase/migrations/20260222225000_phase25_guard_profile_sync_on_users.sql`
6. `supabase/migrations/20260222234000_phase25_guard_emergency_alert_update_policy.sql`
7. `supabase/migrations/20260223000500_phase25_guard_emergency_recipient_notify_policy.sql`
8. `supabase/migrations/20260223003000_phase25_guard_notify_user_profile_fallback.sql`
9. `supabase/migrations/20260223103000_phase26_guard_profile_update_policy.sql`
10. `supabase/migrations/20260307220000_phase35_community_directory_membership_integrity.sql`

### B) Objects to Refactor/Remove
1. Replace mock QR scanner path with camera + DB lookup in `/Users/andromeda/casanirvana/Guard/screens/qrScanner.js`
2. Replace static visitor pass defaults in `/Users/andromeda/casanirvana/Guard/screens/confirmScreen.js`
3. Align notification payload contract in `/Users/andromeda/casanirvana/Guard/screens/allowedScreen.js` and `/Users/andromeda/casanirvana/Guard/screens/cancelledScreen.js`
4. Centralize gate-pass/QR pass resolution in `/Users/andromeda/casanirvana/Guard/services/visitorEntryService.js`
5. Centralize walk-in `entry_code`/`qr_code_data` generation in `/Users/andromeda/casanirvana/Guard/services/visitorPassArtifacts.js`
6. Replace local-only settings state in `/Users/andromeda/casanirvana/Guard/screens/notificationSettingsScreen.js` and `/Users/andromeda/casanirvana/Guard/screens/chatSettingsScreen.js` with persistence service reads/writes

### C) Storage / RPC Prerequisites
1. None for this slice.
