# User App Schema Alignment Gaps

Date: 2026-02-07

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
| `attachments` | Supabase Storage bucket | `/Users/andromeda/casanirvana/user/screens/messageScreen.js`, `/Users/andromeda/casanirvana/user/hooks/useTechnicalSupport.js` | Not a Postgres migration; ensure bucket + storage RLS/policies exist |

## Additional Alignment Gaps (Code vs Runtime Contract)
| Gap | Evidence | Impact | Decision |
|---|---|---|---|
| Invalid Supabase client import path | `/Users/andromeda/casanirvana/user/services/billPaymentService.js`, `/Users/andromeda/casanirvana/user/services/insuranceService.js` import `../supabase/client` (file not present) | Runtime import failure in those paths | `Code alignment` |
| Supabase client fragmentation | Mixed imports from `../utils/supabase` and `../lib/supabase` across hooks/services | Auth/session inconsistency risk | `Code alignment` |
| React Query API version mismatch | `/Users/andromeda/casanirvana/user/hooks/useBillPayments.ts`, `/Users/andromeda/casanirvana/user/hooks/useInsurancePayments.ts` use `react-query` while app uses `@tanstack/react-query` elsewhere | Cache and mutation behavior drift | `Code alignment` |
| Profile identifier strategy mismatch | `useGetProfile` uses `.eq('user_id', auth.uid())`, while notification settings/token writes use `.eq('id', user.id)` | Frequent empty reads/writes and policy edge cases | `Code alignment` |

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
1. Ensure storage bucket `attachments` exists.
2. Ensure bucket-level write/read policies match messaging + support workflows.

## Recommended Immediate Sequence
1. Keep current code-alignment baseline (`events` deferred; no dead schema dependencies).
2. For newly approved features, add forward-only SQL migrations in `/Users/andromeda/casanirvana/supabase/migrations`.
3. Re-run this gap check after each migration/types sync cycle.
