# User App Screen Wiring Checklist (Production Audit)

Date: 2026-02-07

## Scope
- This document started as a code audit and now tracks remediation status as wiring changes are implemented.
- Coverage is the agreed sequence:
  - Auth + Home + Notifications
  - Complaints + Maintenance + Help Desk
  - Messaging + Visitors + Emergency
  - Payments + Personal Hub
  - Marketplace
  - Profile + Settings
- Included both screens and in-screen components/hooks where they directly drive DB reads/writes.

## Status Legend
- `Wired`: connected to DB with expected flow.
- `Partial`: connected, but has gaps or unsafe fallback logic.
- `Stub`: mostly static/demo UI; no production DB wiring.
- `Broken`: wired path exists but blocks correct production behavior.

## Cross-Cutting Blockers (Fix First)
| Area | Evidence | Risk | Status | Required Action |
|---|---|---|---|---|
| OTP verification bypass | `/Users/andromeda/casanirvana/user/screens/auth/verificationScreen.js` | OTP entry now verifies through `supabase.auth.verifyOtp` before any protected navigation | `Wired` | Keep; ensure OTP provider is enabled in each environment |
| Profile key mismatch (`auth.users.id` vs `profiles.id/user_id`) | Shared resolver now used in `/Users/andromeda/casanirvana/user/utils/profileResolver.ts` and adopted in notification, support, emergency, community-profile, and settings flows | Prior invisibility/write-failure risk reduced | `Wired` | Keep all new profile lookups on shared resolver utility |
| Multiple Supabase client entry points | Canonical client is now `/Users/andromeda/casanirvana/user/utils/supabase.js`; `/Users/andromeda/casanirvana/user/lib/supabase.js` is a compatibility re-export only | Prior auth context drift risk reduced | `Wired` | Keep canonical import path for all new code; remove compatibility shim once no external references remain |
| Module toggle enforcement consistency | `/Users/andromeda/casanirvana/user/services/moduleSettingsService.js`, `/Users/andromeda/casanirvana/user/screens/homeScreen.js`, `/Users/andromeda/casanirvana/user/components/ModuleGuardScreen.js` | Scoped module cache + route-level guards + disabled-card UX prevent bypass when modules are toggled off | `Wired` | Keep all module checks on shared service and preserve guard coverage for mapped entry screens |
| React Query v3/v4 mix (remaining hooks) | User app imports now use `@tanstack/react-query` (no `react-query` imports found in hooks/screens/services/components) | Cache invalidation mismatch risk removed | `Wired` | Keep |

## 1) Auth + Home + Notifications
| Screen/Component | Data-Bound UI Elements | Current Wiring | Status | Wiring Checklist |
|---|---|---|---|---|
| `splashScreen` | Initial auth gate, first navigation | Checks Supabase session and routes to `bottomTab` or onboarding | `Wired` | Keep; add onboarding completion flag when product flow requires it |
| `auth/loginScreen` | Phone input, Login button | Calls `supabase.auth.signInWithOtp` | `Wired` | Keep OTP send flow; ensure provider/env checks are explicit |
| `auth/emailLoginScreen` | Email/password inputs, Sign in button | Calls `supabase.auth.signInWithPassword` then `navigation.replace("bottomTab")` | `Wired` | Keep; add post-login profile readiness guard |
| `auth/registerScreen` | Registration form submit | Calls `supabase.auth.signUp` with user metadata and routes by signup outcome (verified session vs email-confirmation flow) | `Wired` | Keep; maintain consistent post-signup messaging across environments |
| `auth/verificationScreen` | OTP digits + Verify button | Verifies OTP with `supabase.auth.verifyOtp` before navigation | `Wired` | Keep; ensure OTP provider is enabled in each environment |
| `homeScreen` | Notices card, unread badge, module visibility | Uses `useHasJoinedCommunity`, `useUnreadNotificationsCount`, `useListNotices`, module settings, and live Personal Hub catalog availability checks so the Insurance card is disabled when no insurer is exposed and the Pay Bills card truthfully reflects whether only TV billers are live | `Wired` | Keep; continue using shared profile resolver path for community status reads and preserve live catalog gating for Personal Hub entry cards |
| `joinCommunityScreen` | Community/unit search, submit request | Uses search hooks and join/manual request mutations | `Wired` | Verify final mutations map to canonical profile/community columns |
| `notificationScreen` | Notification list, mark read/delete | Uses `useNotifications`, `useMarkNotificationAsRead`, `useDeleteNotification` | `Wired` | Keep; verify RLS policy path with current profiles policy |
| `notificationDetailScreen` | Mark-read on open | Uses `useMarkNotificationAsRead` | `Wired` | Keep |
| `notificationSettingsScreen` | Toggle switches and preferences save | Resolves profile ID (`user_id` then `id`) before preferences write | `Wired` | Keep; enforce same resolver in any new profile-setting write |
| `useNotificationToken` | Push token save/clear | Resolves profile ID (`user_id` then `id`) before token write/clear | `Wired` | Keep; ensure token rotation path uses same resolver |
| `noticeBoardScreen` | Notices feed and realtime refresh | Uses `useListNotices`; realtime invalidation handled centrally by global `AuthContext` subscriptions; resident actions are share/favorite/detail only (no non-wired delete path) | `Wired` | Keep |
| `noticeDetailScreen` | Per-notice detail state | Reads profile via `useUserProfile`, accepts both `{ notice }` and `{ noticeId }` navigation payloads with DB fallback, and guards against cross-community notice access | `Wired` | Keep |

## 2) Complaints + Maintenance + Help Desk
| Screen/Component | Data-Bound UI Elements | Current Wiring | Status | Wiring Checklist |
|---|---|---|---|---|
| `complaintsScreen` | Personal/community tabs | Container; delegates data to tab components | `Wired` | Keep |
| `components/complaintsPersonalTab` | Personal complaint list and detail navigation | Uses `useListPersonalComplaints` with authenticated profile ID only (no hardcoded fallback profile id) | `Wired` | Keep; retain DB-only path and avoid reintroducing sample fallback in production |
| `components/complaintsCommunityTab` | Community complaints list | Uses `useListCommunityComplaints(profile.community_id)` with community-scoped query + realtime invalidation | `Wired` | Keep; community tab now relies on explicit community scope (not broad all-community query) |
| `addComplaintScreen` | Complaint form + image upload | Uses `useCreateComplaint` and `useCreateComplaintWithImage`; submission now blocks when profile has no assigned `unit_id` (no null-unit fallback) | `Wired` | Keep; validate image payload schema consistency and maintain strict unit assignment gate |
| `complaintDetailScreen` | Complaint details, comments, status updates | Uses `useGetComplaint`, `useListComplaintComments`, `useCreateComplaintComment`, `useUpdateComplaint`; legacy route-param fallback removed (DB-backed detail contract only) | `Wired` | Keep |
| `maintenanceRequestsScreen` | List + filter + detail navigation | Uses `useListMaintenanceRequests(profile.id)` and relies on global `AuthContext` realtime subscription (screen-level duplicate removed); UI now renders full status set including `in_progress` | `Wired` | Keep; preserve DB-only detail contract and status enum `pending/in_progress/completed/cancelled` |
| `addMaintenanceRequestScreen` | New maintenance form + optional image attachments + submission success modal | Uses `useCreateMaintenanceRequest` / `useCreateMaintenanceRequestWithImages`; image uploads go to Storage bucket `attachments` and persist as `maintenance_requests.images` | `Wired` | Keep; attachment cap is 5 images and DB enforces max-5 guardrail |
| `maintenanceDetailScreen` | Detail + comments + status | Uses DB-backed `useGetMaintenanceRequest`, `useListMaintenanceComments`, `useCreateMaintenanceComment`, `useUpdateMaintenanceRequest`; legacy route-param fallback removed | `Wired` | Keep; status toggle now writes completion fields (`completed_at`, `resolved_at`, `resolved_by_profile_id`) |
| `helpDeskScreen` | Start support chat, route to inquiry forms | Uses `useStartSupportChat` | `Wired` | Keep; verify admin lookup in profiles meets RLS |
| `useSupportChat` | Chat creation and participant linking | Queries `profiles`, `chat_participants`, `chats` | `Wired` | Keep; fallback is now community-scoped only (no cross-community admin fallback/reuse) |
| `generalInquiryScreen` + `useGeneralInquiry` | Submit inquiry | Writes DB-aligned payload to `inquiries` with `inquiry_type='general_inquiry'` | `Wired` | Keep; canonical mapper now enforces snake_case contract |
| `technicalSupportScreen` + `useTechnicalSupport` | Submit support + attachment upload | Uploads to bucket `attachments`, then writes DB-aligned `inquiries` payload (`technical_support`) | `Wired` | Keep; canonical mapper now enforces snake_case contract |
| `feedbackScreen` + `useFeedback` | Submit feedback | Writes DB-aligned payload to `inquiries` with `inquiry_type='feedback'` | `Wired` | Keep; anonymous mode now preserves actor `user_id` for RLS while masking identity fields |
| `suggestionsScreen` + `useSuggestions` | Submit suggestion | Writes DB-aligned payload to `inquiries` with `inquiry_type='suggestion'` | `Wired` | Keep; canonical mapper now enforces snake_case contract |

## 3) Messaging + Visitors + Emergency
| Screen/Component | Data-Bound UI Elements | Current Wiring | Status | Wiring Checklist |
|---|---|---|---|---|
| `chatScreen` | Conversation list shell | Top-tab container for DB-backed `chatsTab` and `residentsTab` conversation/member sources | `Wired` | Keep |
| `messageScreen` | Send/receive messages, attachments, call events | Uses `useMessages`, `useRealTimeMessages`, writes chat files to storage bucket `chat-attachments` with owner-scoped path (`{auth.uid}/chat/*`) | `Wired` | Keep; preserve owner-scoped upload path and DB message contract (`from_user`/`to_user`, `message_type`, `attachments`) |
| `useMessages` | Message/call fetch + send/update | Reads/writes `messages` and reads `calls`; handles `read`/`is_read` fallback and conversation invalidation | `Wired` | Keep; preserve canonical message columns and TanStack v5 object-form invalidation keys |
| `serviceScreen` (bottom tab) | Service catalog, request create flow, request list | Uses `useListCommunityServices`, `useCreateServiceRequest`, `useListMyServiceRequests` with `services` + `service_requests` contracts (no local mock catalog/booking state); realtime invalidation now includes `service_requests` actor updates and community `services` catalog changes | `Wired` | Keep DB as source of truth; preserve actor-scoped query keys |
| `serviceModal` | Request date/time/details submit and success actions | Submits real `service_requests` insert through parent mutation callback and passes canonical `requestId` to payment route payload; success modal now requires confirmed persisted request id | `Wired` | Keep validation + submit lock; avoid synthetic local booking writes |
| `serviceBookingDetailScreen` | Request detail rendering and timeline | Fetches by `bookingId` via `useGetServiceRequest` with DB-first contract and route-param fallback; fixed hardware-back cleanup subscription; status rendering now aligned to canonical request states and supports pay-later navigation for pending paid requests | `Wired` | Keep DB-first contract; remove fallback once all callers pass `bookingId` |
| `visitorsScreen` | Visitor list, delete, gate pass modal, realtime | Uses `useListVisitors`, `useDeleteVisitor`, realtime on `visitor_passes` | `Wired` | Keep |
| `preApproveVisitorsScreen` | Create guest/cab/delivery/service | Uses `useListVisitors` and `useCreateService` | `Wired` | Keep |
| `bottomTab` emergency quick actions | Emergency buttons and admin/guard chat shortcuts | Uses typed `emergencyService` helpers and passes canonical `id/memberId` params to `messageScreen` | `Wired` | Keep; add integration test for admin/guard shortcut -> chat open |
| `services/emergencyService` | Emergency alert creation/dispatch | Canonical write to `emergency_alerts` with quick-action alias normalization (`fire_alert/stuck_lift/animal_threat/visitor_threat` -> canonical superadmin types) and recipient fan-out persisted in `emergency_alert_recipients` | `Wired` | Keep; if push delivery fan-out is required, add server-side dispatcher (service role) keyed from persisted recipients |
| `emergencyContactsScreen` | Contact list + tap to call | Reads community emergency contacts from `community_configurations.emergency_contacts` and persists user custom contacts in `profiles.preferences.custom_emergency_contacts` | `Wired` | Keep |

## 4) Payments + Personal Hub
| Screen/Component | Data-Bound UI Elements | Current Wiring | Status | Wiring Checklist |
|---|---|---|---|---|
| `paymentScreen` | Pending/history/statements tabs, receipt downloads | Uses `useListPendingPayments`, `useListPaymentHistory`, `useListPaymentStatements` | `Wired` | Keep |
| `billingHistoryScreen` | Billing history + statement downloads | Uses same hooks as payment screen | `Wired` | Keep |
| `paymentHistoryScreen` | Personal + maintenance transaction history and retry actions | Uses `usePersonalHubTransactions` for personal-hub records plus `useListPendingPayments`/`useListPaymentHistory` for real maintenance payments; pending personal retries route through canonical personal-hub checkout payload | `Wired` | Keep; no demo/sample rows remain |
| `services/personalHubService` | Create transaction records + transaction status updates | Writes/reads `airtime_purchases`, `data_purchases`, `money_transfers`, `bill_payments`, `insurance_payments`, `shopping_payments`, `personal_hub_transactions` | `Wired` | Keep; Phase 14 hardened provider/status-log/view access contracts in DB (`20260221101410_phase14_payments_rls_and_datafix.sql`) |
| `hooks/usePersonalHubTransactions.ts` | Typed transaction hooks | Uses `@tanstack/react-query` and `personalHubService` | `Wired` | Keep |
| `services/paymentService.js` | Generic payments CRUD | Uses canonical `utils/supabase` | `Wired` | Keep |
| `services/billPaymentService.js` | Bill payment + saved account methods | Uses canonical `utils/supabase`; `saved_bill_accounts` schema restored via migration `20260207145514_phase9_slice4_saved_accounts_policies.sql` and synced into shared DB types | `Wired` | Keep |
| `services/insuranceService.js` | Insurance payment + saved policy methods | Uses canonical `utils/supabase`; `saved_policies` schema restored via migration `20260207145514_phase9_slice4_saved_accounts_policies.sql` and synced into shared DB types | `Wired` | Keep |
| `services/serviceProviderCatalogService.js` | Provider catalog reads for payment entry screens | Reads Personal Hub providers through backend `GET /personal-hub/catalog/providers`, which now fronts the cached ExpressPay service catalog; local fallback is gated to dev or explicit env opt-in so production builds surface truthful unavailable states when live catalog/config is missing | `Wired` | Keep backend catalog as source of truth; do not silently re-enable fallback in production-like builds |
| `hooks/useBillPayments.ts` | Bill hooks and cache invalidation | Migrated to `@tanstack/react-query` (v4 API + query key invalidation) | `Wired` | Keep |
| `hooks/useInsurancePayments.ts` | Insurance hooks and cache invalidation | Migrated to `@tanstack/react-query` (v4 API + query key invalidation) | `Wired` | Keep |
| `airtimeScreen` / `dataScreen` / `transferScreen` / `utilitiesScreen` / `tvScreen` / `insuranceScreen` | Provider selection entry state | Provider lists now load from the backend-backed cached ExpressPay catalog, route payloads carry `providerId`, `externalServiceCode`, and bill-category metadata needed for query-first checkout, and the unsupported utilities/insurance categories now stay explicitly unavailable against the live catalog instead of relying on dev fallback data | `Wired` | Keep backend catalog as source of truth; preserve no-fallback truth gating for unsupported categories until the synced catalog actually exposes them |
| `accountDetailsScreen` / `dataAccountDetailsScreen` / `billAccountDetailsScreen` / `policyDetailsScreen` | Recipient/account/policy validation before checkout | These entry screens now call backend `POST /personal-hub/catalog/query` to validate the selected number/account/policy and fetch provider-returned options before moving into amount selection or checkout | `Wired` | Keep provider validation/query-first behavior; do not reintroduce client-side static package or account heuristics |
| `reviewPayScreen` (legacy) | Legacy review+checkout fallback | No longer uses local simulated success timer; if reached, it now routes into canonical payment processing screens with full personal-hub payload contract | `Wired` | Keep out of active navigator unless product intentionally restores this UX |
| `amountScreen` / `otherAmountScreen` / `dataAmountScreen` / `billAmountScreen` / `insuranceAmountScreen` | Amount/package selection and review | These screens now consume provider-returned `queryContext` / `queryOptions`, render provider-supplied preset options when available, and fall back to controlled custom-amount entry only when the provider does not return fixed options | `Wired` | Keep query-first selection contract; preset options should remain authoritative whenever returned by the provider |
| `services/expressPayService.js` | Authenticated backend checkout + catalog client | Calls backend catalog/query/initiate/status endpoints for Personal Hub plus the hosted ExpressPay payment verification/status endpoints, all with the authenticated Supabase access token; runtime reconciliation now distinguishes checkout settlement from downstream provider fulfillment (`completed`, `fulfillment_pending`, `fulfillment_failed`) | `Wired` | Keep as the canonical ExpressPay client for user checkout flows; do not bypass it with direct provider calls from mobile |
| `paymentMethodScreen` and sub-screens | Method selection and checkout transition | Enforces one canonical Personal Hub payload contract including `externalServiceCode`, `billCategory`, `queryContext`, and `selectedOption`; card/mobile-money checkout screens now use backend source-row-first initiation for catalog-backed Personal Hub services | `Wired` | Keep the canonical payload contract across retries/history and maintain shopping as the excluded non-catalog path |
| `mobileMoneyScreen` | Payment initiation + confirmation modal | Initiates catalog-backed Personal Hub checkout through backend `POST /personal-hub/transactions/initiate`, links source rows via `payment_ref_id`, persists saved bill/policy upserts, and reconciles both payment settlement and provider fulfillment before presenting the final outcome | `Wired` | Keep; manual QA must explicitly cover `completed`, `fulfillment_pending`, and `fulfillment_failed` outcomes |
| `creditCardScreen` / `paypalScreen` | Hosted checkout handoff | Replaced direct `payments` inserts with hosted ExpressPay initiation + reconciliation for both booking flows and catalog-backed Personal Hub flows; booking/payment state and provider-fulfillment state are now treated as separate concerns in the result UX | `Wired` | Keep; card remains hosted checkout in this phase, PayPal stays disabled in live method policy, and runtime signoff must verify truthful fulfillment-state messaging |

## 5) Marketplace
| Screen/Component | Data-Bound UI Elements | Current Wiring | Status | Wiring Checklist |
|---|---|---|---|---|
| `marketplaceHomeScreen` | Categories/products/cart badge | Uses `useCategories`, `useProducts`, `useCart`; production path is DB-driven with dev-only placeholder fallback | `Wired` | Keep; continue replacing remaining static category metadata with DB config over time |
| `categoryListingScreen` | Filter/sort products by category/country | Uses `useProducts`; production path is DB-driven with dev-only placeholder fallback | `Wired` | Keep |
| `marketplaceSearchScreen` | Search results + recent searches | Uses `useSearchProducts`, `useSearchHistory`, `useSaveSearchHistory`; production path is DB-driven with dev-only placeholder fallback | `Wired` | Keep |
| `productDetailScreen` | Product details + add to cart | Uses `useProduct`, `useAddToCart` | `Wired` | Keep |
| `shoppingCartScreen` | Cart list + quantity + checkout | Uses `useCart`, `useUpdateCartItem`, `useRemoveFromCart`, `useClearCart` | `Wired` | Keep |
| `deliveryAddressScreen` | Delivery/pickup + address selection | Uses `useUserAddresses` + `useCreateUserAddress` backed by `user_addresses`; production path reads/saves persisted addresses | `Wired` | Keep; add edit/delete/default UX when product confirms that scope |
| `ordersScreen` | Orders list | Uses `useOrders` | `Wired` | Keep |
| `orderReviewScreen` | Order payload build + place order | Uses `useCreateOrder`, `useClearCart` | `Wired` | Keep |
| `orderConfirmationScreen` | Confirm and fetch created order | Uses `useOrder` | `Wired` | Keep |
| `orderTrackingScreen` | Live order status | Uses `useOrder`; realtime subscription cleanup | `Wired` | Keep |
| `services/marketplaceService.js` | Marketplace API for all screens | Uses canonical `utils/supabase`; vendor follow schema restored and follower count maintained by DB trigger (no generic `increment`/`decrement` RPC dependency), with synced shared DB types | `Wired` | Keep |
| `App.js` route registration | Marketplace route map | Single `ordersScreen` declaration in active navigator map | `Wired` | Keep |

## 6) Profile + Settings
| Screen/Component | Data-Bound UI Elements | Current Wiring | Status | Wiring Checklist |
|---|---|---|---|---|
| `profileScreen` | Family/daily help/vehicles/frequent entries/gate pass cards | Uses authenticated user ID and `useUserGatePass` (no hardcoded demo identity); related create/edit/delete modals now resolve actor from auth session (no demo UUID writes) | `Wired` | Keep; `family_members` RLS owner policies restored via `supabase/migrations/20260221220537_phase22_family_members_rls_hardening.sql` |
| `memberDirectoryScreen` | Members/admin/committee list with call/chat actions | Uses `useCommunityMembers`, `useCommunityAdmins`, `useCommunityCommittee` backed by `community_memberships` (community-scoped roles) | `Wired` | Keep |
| `components/memberTab` | Member list | Uses `useCommunityMembers` sourced from `community_memberships` role `member` | `Wired` | Keep |
| `components/adminTab` | Admin list | Uses `useCommunityAdmins` sourced from `community_memberships` role `admin` | `Wired` | Keep |
| `components/committeeTab` | Committee list | Uses `useCommunityCommittee` sourced from `community_memberships` role `committee` | `Wired` | Keep |
| `hooks/useCommunityMembers.ts` | Member/admin/committee fetch | Canonical source is `community_memberships` + `profiles` join with legacy fallback (`profiles.role` + `community_admins`) when migration is not yet applied | `Wired` | Keep |
| `editProfileScreen` | Profile fields + save | Loads core profile fields plus persisted profile preferences, updates full profile payload in `profiles`, and uploads/removes avatar via storage-backed `avatar_url` | `Wired` | Keep; if desired, move avatar uploads from shared `attachments` bucket to a dedicated profile-avatar bucket |
| `communityInfoScreen` | Community metadata card | Uses `useUserProfile` + DB queries (`communities`, `community_configurations`, `amenities`, `units` count) for live metadata, contact details, and amenities/features with empty-state fallback | `Wired` | Keep |
| `unitInformationScreen` | Unit details | Queries `units` and user ownership relation | `Wired` | Keep; validate relation keys and role scope |
| `settingScreen` | Toggle/settings navigation | Persists dark theme + biometric toggles to `profiles.preferences` (with local biometric cache sync) | `Wired` | Keep; connect global theme application once design system is finalized |
| `languageScreen` | Language preference | Persists language to `profiles.preferences` and local language cache before applying i18n change | `Wired` | Keep |
| `emergencyContactsScreen` | Emergency contacts | Reads community-configured contacts from DB and persists user custom contacts in `profiles.preferences.custom_emergency_contacts` (create/remove + call actions) | `Wired` | Keep; if needed later, move user custom contacts to dedicated table for auditability |
| `chatSettingsScreen` | Chat preferences | Persists per-user chat toggles to `chat_settings.app_info_preferences.chat_preferences` | `Wired` | Keep; migrate to typed settings columns if product requires granular analytics/reporting |
| `backupRestoreScreen` | Backup/restore controls | Uses backend account backup endpoints (`/account/backup/status`, `/account/backup/export`, `/account/backup/restore`, `/account/backup/cleanup`) plus persisted backup preferences in `chat_settings` | `Wired` | Keep; ensure backup bucket retention policy and restore scope are documented for support |
| `appUpdatesScreen` | Update settings/history | Uses backend update-status endpoint (`/account/app-updates/status`) for release metadata + Expo OTA/store update flow; persists update preferences in `chat_settings.app_info_preferences` | `Wired` | Keep; production release metadata depends on `system_settings` category `app_updates` |
| `deleteAccountScreen` | Deletion/deactivation flow | Multi-step UI wired to backend account endpoints (`/account/delete`, `/account/deactivate`) with password re-auth + confirmation text before permanent deletion | `Wired` | Keep; route support/export placeholders to production endpoints when those services are available |

## Naming Consistency Check
- Runtime user-facing labels and navigation now use `Community`.
- Generated DB type metadata still contains legacy `*_society_*` foreign-key identifier names (schema artifact, not UI copy).

## Recommended Execution Order (After This Audit)
1. Fix cross-cutting blockers (`verificationScreen`, profile-key strategy, client import standardization, React Query version consistency).
2. Remove remaining demo/static fallbacks from live paths (complaint/member demo paths and non-DB community metadata content).
3. Resolve schema gaps in `/Users/andromeda/casanirvana/user/SCHEMA_ALIGNMENT_GAPS.md`.
4. Run end-to-end screen verification by domain in this exact order: Auth/Home/Notifications -> Complaints/Maintenance/Help Desk -> Messaging/Visitors/Emergency -> Payments/Personal Hub -> Marketplace -> Profile/Settings.
