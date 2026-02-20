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
| `homeScreen` | Notices card, unread badge, module visibility | Uses `useHasJoinedCommunity`, `useUnreadNotificationsCount`, `useListNotices`, and module settings with disabled-card UX (`Coming Soon`) for toggled-off modules | `Wired` | Keep; continue using shared profile resolver path for community status reads |
| `joinCommunityScreen` | Community/unit search, submit request | Uses search hooks and join/manual request mutations | `Wired` | Verify final mutations map to canonical profile/community columns |
| `notificationScreen` | Notification list, mark read/delete | Uses `useNotifications`, `useMarkNotificationAsRead`, `useDeleteNotification` | `Wired` | Keep; verify RLS policy path with current profiles policy |
| `notificationDetailScreen` | Mark-read on open | Uses `useMarkNotificationAsRead` | `Wired` | Keep |
| `notificationSettingsScreen` | Toggle switches and preferences save | Resolves profile ID (`user_id` then `id`) before preferences write | `Wired` | Keep; enforce same resolver in any new profile-setting write |
| `useNotificationToken` | Push token save/clear | Resolves profile ID (`user_id` then `id`) before token write/clear | `Wired` | Keep; ensure token rotation path uses same resolver |
| `noticeBoardScreen` | Notices feed and realtime refresh | Uses `useListNotices` + Supabase channel invalidation | `Wired` | Keep |
| `noticeDetailScreen` | Per-notice detail state | Reads profile via `useUserProfile` and guards against cross-community notice access | `Wired` | Keep |

## 2) Complaints + Maintenance + Help Desk
| Screen/Component | Data-Bound UI Elements | Current Wiring | Status | Wiring Checklist |
|---|---|---|---|---|
| `complaintsScreen` | Personal/community tabs | Container; delegates data to tab components | `Wired` | Keep |
| `components/complaintsPersonalTab` | Personal complaint list and detail navigation | Uses `useListPersonalComplaints` with authenticated profile ID only (no hardcoded fallback profile id) | `Wired` | Keep; retain DB-only path and avoid reintroducing sample fallback in production |
| `components/complaintsCommunityTab` | Community complaints list | Uses `useListCommunityComplaints` with realtime invalidation | `Wired` | Keep; simplify filter condition if not needed |
| `addComplaintScreen` | Complaint form + image upload | Uses `useCreateComplaint` and `useCreateComplaintWithImage` | `Wired` | Keep; validate image payload schema consistency |
| `complaintDetailScreen` | Complaint details, comments, status updates | Uses `useGetComplaint`, `useListComplaintComments`, `useCreateComplaintComment`, `useUpdateComplaint` | `Wired` | Keep |
| `maintenanceRequestsScreen` | List + create + realtime | Uses `useListMaintenanceRequests`, `useCreateMaintenanceRequest`, `useGetUserUnit`; create/read path uses profile ID for `requested_by` | `Wired` | Keep; maintain profile-ID consistency for maintenance writes/reads |
| `addMaintenanceRequestScreen` | New maintenance form + images | Uses `useCreateMaintenanceRequest` | `Wired` | Keep |
| `maintenanceDetailScreen` | Detail + comments + status | Uses maintenance detail/comment hooks | `Wired` | Keep |
| `helpDeskScreen` | Start support chat, route to inquiry forms | Uses `useStartSupportChat` | `Wired` | Keep; verify admin lookup in profiles meets RLS |
| `useSupportChat` | Chat creation and participant linking | Queries `profiles`, `chat_participants`, `chats` | `Wired` | Keep; ensure indexes and RLS on participant checks |
| `generalInquiryScreen` + `useGeneralInquiry` | Submit inquiry | Writes to `inquiries` with `inquiry_type='general_inquiry'` | `Wired` | Keep |
| `technicalSupportScreen` + `useTechnicalSupport` | Submit support + attachment upload | Writes `inquiries`; uploads to storage bucket `attachments` | `Wired` | Keep; ensure storage bucket/policies are present |
| `feedbackScreen` + `useFeedback` | Submit feedback | Writes `inquiries` with `inquiry_type='feedback'` | `Wired` | Keep |
| `suggestionsScreen` + `useSuggestions` | Submit suggestion | Writes `inquiries` with `inquiry_type='suggestion'` | `Wired` | Keep |

## 3) Messaging + Visitors + Emergency
| Screen/Component | Data-Bound UI Elements | Current Wiring | Status | Wiring Checklist |
|---|---|---|---|---|
| `chatScreen` | Conversation list shell | Top-tab container for DB-backed `chatsTab` and `residentsTab` conversation/member sources | `Wired` | Keep |
| `messageScreen` | Send/receive messages, attachments, call events | Uses `useMessages`, `useRealTimeMessages`, storage `attachments` bucket | `Wired` | Keep; verify bucket policies and message schema consistency |
| `useMessages` | Message/call fetch + send/update | Reads/writes `messages` and reads `calls` | `Wired` | Keep; ensure message column names match DB exactly |
| `visitorsScreen` | Visitor list, delete, gate pass modal, realtime | Uses `useListVisitors`, `useDeleteVisitor`, realtime on `visitor_passes` | `Wired` | Keep |
| `preApproveVisitorsScreen` | Create guest/cab/delivery/service | Uses `useListVisitors` and `useCreateService` | `Wired` | Keep |
| `bottomTab` emergency quick actions | Emergency buttons and admin/guard chat shortcuts | Uses typed `emergencyService` helpers and passes canonical `id/memberId` params to `messageScreen` | `Wired` | Keep; add integration test for admin/guard shortcut -> chat open |
| `services/emergencyService` | Emergency alert creation/dispatch | Canonical write to `emergency_alerts`; stakeholder resolution from `profiles` only | `Wired` | Keep; if fan-out notifications are needed, implement server-side dispatch (service role) |
| `emergencyContactsScreen` | Contact list + tap to call | Reads community emergency contacts from `community_configurations.emergency_contacts` and persists user custom contacts in `profiles.preferences.custom_emergency_contacts` | `Wired` | Keep |

## 4) Payments + Personal Hub
| Screen/Component | Data-Bound UI Elements | Current Wiring | Status | Wiring Checklist |
|---|---|---|---|---|
| `paymentScreen` | Pending/history/statements tabs, receipt downloads | Uses `useListPendingPayments`, `useListPaymentHistory`, `useListPaymentStatements` | `Wired` | Keep |
| `billingHistoryScreen` | Billing history + statement downloads | Uses same hooks as payment screen | `Wired` | Keep |
| `paymentHistoryScreen` | Personal hub transaction history by type | Uses `usePersonalHubTransactions` | `Wired` | Keep |
| `services/personalHubService` | Create transaction records + transaction status updates | Writes/reads `airtime_purchases`, `data_purchases`, `money_transfers`, `bill_payments`, `insurance_payments`, `shopping_payments`, `personal_hub_transactions` | `Wired` | Keep |
| `hooks/usePersonalHubTransactions.ts` | Typed transaction hooks | Uses `@tanstack/react-query` and `personalHubService` | `Wired` | Keep |
| `services/paymentService.js` | Generic payments CRUD | Uses canonical `utils/supabase` | `Wired` | Keep |
| `services/billPaymentService.js` | Bill payment + saved account methods | Uses canonical `utils/supabase`; `saved_bill_accounts` schema restored via migration `20260207145514_phase9_slice4_saved_accounts_policies.sql` and synced into shared DB types | `Wired` | Keep |
| `services/insuranceService.js` | Insurance payment + saved policy methods | Uses canonical `utils/supabase`; `saved_policies` schema restored via migration `20260207145514_phase9_slice4_saved_accounts_policies.sql` and synced into shared DB types | `Wired` | Keep |
| `hooks/useBillPayments.ts` | Bill hooks and cache invalidation | Migrated to `@tanstack/react-query` (v4 API + query key invalidation) | `Wired` | Keep |
| `hooks/useInsurancePayments.ts` | Insurance hooks and cache invalidation | Migrated to `@tanstack/react-query` (v4 API + query key invalidation) | `Wired` | Keep |
| `airtimeScreen` / `dataScreen` / `transferScreen` / `reviewPayScreen` | Payment flow UI state | Route payload propagated through canonical personal-hub fields (`transactionType`, recipient, amount, bundle metadata); active checkout persists through payment-method flow (`reviewPayScreen` removed from active navigator route map) | `Wired` | Keep `reviewPayScreen` out of active navigation unless fully refactored to persisted checkout flow |
| `paymentMethodScreen` and sub-screens | Method selection and checkout transition | Enforces one canonical personal-hub payload contract; mobile-money path receives full typed payload for transaction writes | `Wired` | Keep; personal-hub transactions are intentionally constrained to supported payment method path |

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
| `profileScreen` | Family/daily help/vehicles/frequent entries/gate pass cards | Uses authenticated user ID and `useUserGatePass` (no hardcoded demo identity) | `Wired` | Keep; continue replacing remaining static copy labels with profile/community fields as needed |
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
