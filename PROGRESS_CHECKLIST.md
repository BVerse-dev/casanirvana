# Casa Nirvana Production Readiness - Progress Checklist

Date: 2026-02-06

## Decisions (Locked)
- [x] Express backend is the privileged API for admin operations and sensitive writes.
- [x] Admin onboarding is invite-first; sign-up page remains visible but disabled (invite-only message).
- [x] Admin roles include: `superadmin`, `agency_manager`, `facility_manager`, `admin`.

## Phase 1 - Security Hardening (Critical)
- [x] Removed Supabase service-role usage from client-side superadmin code; privileged ops are server-side only.
- [x] Added `supabaseAdmin` for server-only use in superadmin API routes.
- [x] Admin auth options updated to recognize new admin roles.
- [x] Backend admin routes enforce auth/permissions (multiple write endpoints fixed).
- [x] Upload endpoints require auth, size/type limits, and signed URLs.
- [x] Backend CORS restricted to allowlist.
- [ ] Verify NextAuth secret is only in env (no hardcoded secret) and demo auth paths removed everywhere.

## Phase 2 - Auth & RBAC Consolidation
- [x] Roles & permissions UI updated to include `agency_manager` and `facility_manager`.
- [x] Backend `POST /admin/invites` added for invite flow.
- [x] Admin Users page uses invite flow (no password creation in client).
- [x] Admin Roles/Permissions page uses backend endpoints for updates/deletes.
- [x] System settings (system_settings) now read/write via backend endpoints (no direct Supabase client).
- [ ] Confirm RLS policies in Supabase match backend expectations for all roles.

## Phase 3 - Admin Onboarding (Agency/Facility Managers)
- [x] DB migration added: `admin_onboarding_requests`.
- [x] Public request endpoint: `POST /onboarding/requests` (API key protected).
- [x] Admin review endpoints: `GET/PATCH /admin/onboarding-requests`.
- [x] Superadmin UI page: `/settings/admin/onboarding` with filters, approve/reject, approve+invite, and review notes modal.
- [ ] Wire WordPress “Get Started” form to `POST /onboarding/requests` with `x-onboarding-api-key`.

## Phase 4 - Configuration & Build Hygiene
- [x] Added env vars: `ADMIN_INVITE_REDIRECT_URL`, `ONBOARDING_REQUEST_API_KEY`, `NEXT_PUBLIC_ADMIN_SIGNUP_DISABLED`.
- [x] Standardize package manager (removed extra lockfiles in superadmin).
- [x] Remove build-ignore flags in `next.config.mjs`.
- [x] Add CI workflows for lint/test/build.

## Phase 4.5 - Privileged API Migration (Admin Writes)
- [x] Communities, units, profiles, messages, complaints, and payments writes routed through backend admin endpoints.
- [x] Notification campaign writes routed through backend admin endpoints.

## Phase 5 - Data & Migrations
- [x] Choose single source of truth for Supabase migrations (`/supabase/migrations`).
- [x] Generate and distribute shared `database.types.ts` to all apps (canonical: `/supabase/database.types.ts`).
- [x] Lock down system + notification analytics/queues RLS (admin read, service role all).
- [ ] Apply Phase 5B internal tables/marketplace/guard RLS (migration `20260206170000_phase5_rls_internal_tables.sql`).
- [ ] Align seeds and RLS policies across apps.

## Phase 6 - Quality & Observability
- [ ] Add request validation (Zod/Yup) on backend endpoints.
- [ ] Normalize error responses across backend.
- [ ] Add monitoring/logging (Sentry/Logtail or similar).
- [ ] Add rate limiting and security headers (rate limiting pending).
- [ ] Add tests (backend unit/integration, admin Playwright smoke tests, mobile regression tests).

## Phase 7 - Migrations/Types Alignment
- [x] Fix Supabase types generation script for current CLI.
- [x] Generate and sync shared `supabase/database.types.ts` to all apps.
- [x] Schema drift audit exports + drift report stored in `supabase/audit/*`.
- [x] Baseline live DB to `supabase/migrations/20260206_baseline_schema.sql`.
- [x] Archive pre-baseline migrations to `supabase/migrations/_archive/2026-02-06-pre-baseline`.
- [x] Update `supabase/migrations/README.md` to document the baseline.
- [x] Run `supabase migration repair` equivalent (manual baseline insert) on remote.
- [ ] Confirm `supabase db push` is clean after baseline on staging/prod.
- [x] Apply financial RLS migration `20260206234500_phase7_rls_financial_tables.sql` and verify flows.
- [x] Apply PII RLS migration `20260206235500_phase7_rls_pii_tables.sql` and verify flows.
- [x] Apply payments policy cleanup migration `20260207001000_phase7_policy_cleanup_payments.sql` and verify flows.
- [x] Apply notifications policy cleanup migration `20260207002000_phase7_policy_cleanup_notifications.sql` and verify flows.
- [x] Apply profiles/users policy cleanup migration `20260207003000_phase7_policy_cleanup_profiles_users.sql` and verify flows.
- [x] Apply messaging policy cleanup migration `20260207004000_phase7_policy_cleanup_messaging.sql` and verify flows.
- [ ] Apply system policy cleanup migration `20260207005000_phase7_policy_cleanup_system.sql` and verify flows.

## Phase 8 - Deployment Readiness
- [x] Create per-app deployment checklist in `DEPLOYMENT_CHECKLIST.md`.
- [ ] Configure per-app CI/CD pipelines and hosting targets (backend, superadmin, user, Guard).
- [ ] Store all production secrets in CI/CD or secrets manager.
- [ ] Document rollback procedure per app.

## Phase 9 - User App Fullstack Wiring Audit
- [x] Complete deep screen-level DB wiring audit for user app domains in sequence.
- [x] Document screen/component wiring status in `user/SCREEN_WIRING_CHECKLIST.md`.
- [x] Map schema/type mismatches and migration-vs-code decisions in `user/SCHEMA_ALIGNMENT_GAPS.md`.
- [x] Verify naming consistency (`society` removed from user app code).
- [x] Verify `useCommunityMembers.js` is a re-export (no empty hook shadow).
- [x] Remediation Wave 1 (cross-cutting): OTP verification wiring, profile ID strategy normalization, Supabase client import standardization, React Query version standardization.
- [x] Remediation Wave 2 (domain-by-domain): Auth/Home/Notifications -> Complaints/Maintenance/Help Desk -> Messaging/Visitors/Emergency -> Payments/Personal Hub -> Marketplace -> Profile/Settings. (Implementation complete; manual runtime QA deferred by request)
- [x] Confirm product scope decision for deferred `events` feature (migration remains intentionally out-of-scope).

### Phase 9 Progress Notes (2026-02-07)
- [x] Wave 1 (partial): OTP verification now uses Supabase `verifyOtp` in `verificationScreen`.
- [x] Wave 1 (partial): Profile ID fallback (`user_id` -> `id`) applied for notification settings/token writes and notification hooks.
- [x] Wave 2: Domain 1 (`Auth/Home/Notifications`) remediation started and implemented for auth routing + notification wiring.
- [x] Wave 2: Domain 1 fixed `notificationScreen` render loop (`Maximum update depth exceeded`) caused by unstable `notificationList` fallback/state sync.
- [x] Wave 2: Domain 1 runtime smoke verified signed-in flow `Home -> Notifications -> Help Desk -> Start Live Chat` (chat created and `messageScreen` opened).
- [x] Wave 2: Domain 1 completed register post-signup routing (`registerScreen`) for both confirmation-required and active-session outcomes.
- [x] Wave 2: Domain 1 hardened `homeScreen` module visibility by gating cards until module settings load completes.
- [x] Wave 2: Domain 1 completed module-toggle production wiring (`moduleSettingsService` scoped cache + canonical Supabase client, disabled-card `Coming Soon` UX, and route-level module guards for mapped entry screens).
- [x] Wave 2: Domain 1 added notice audience safety checks in `noticeDetailScreen` (community match guard) and fixed notice screen hardware-back listener cleanup.
- [x] Wave 2: Domain 2 (`Complaints/Maintenance/Help Desk`) fixed maintenance create-flow navigation blocker (`maintenanceRequestsScreen` -> `addMaintenanceRequestScreen`).
- [x] Wave 2: Domain 2 fixed complaint detail reporter mapping via `reporter_profile` enrichment and display fallback hardening.
- [x] Wave 2: Domain 2 fixed complaints back-navigation behavior (header + hardware back).
- [x] Wave 2: Domain 2 replaced `AwesomeButton` CTA usage in complaints tabs and maintenance/add-maintenance screens with native `TouchableOpacity` for stable web/runtime click behavior.
- [x] Wave 2: Domain 2 smoke pass verified signed-in flow: `Home -> Maintenance -> Request New Maintenance`, `Submit Request` modal open, `Home -> Complaints -> Complaint Detail -> Back`, `Complaints -> Back -> Home`.
- [x] Wave 2: Domain 2 fixed maintenance submit completion UX in `addMaintenanceRequestScreen` (success modal + `Back to Requests`, guarded against duplicate submit taps).
- [x] Wave 2: Domain 2 re-smoke verified signed-in flow: `Home -> Complaints -> Complaint Detail -> Back -> Home`, `Home -> Maintenance -> Submit -> Success Modal -> Back to Requests`, `Home -> Help Desk -> Start Live Chat`.
- [x] Wave 2: Domain 3 (`Messaging/Visitors/Emergency`) fixed emergency chat shortcut routing (`bottomTab`) to pass canonical recipient ids (`id/memberId`) used by `messageScreen`.
- [x] Wave 2: Domain 3 simplified `emergencyService` to a single canonical emergency write path (`emergency_alerts`) and profile-based stakeholder resolution (removed multi-fallback notification/message writes).
- [x] Wave 2: Domain 3 fixed hardware back handler cleanup in `visitorsScreen` and `preApproveVisitorsScreen` to avoid duplicate listener registration.
- [x] Wave 2: Domain 3 applied migration `20260207141234_phase9_slice3_messages_rls_insert_fix.sql` to restore `messages` insert policy and remove over-permissive legacy update policy.
- [x] Wave 2: Domain 3 signed-in runtime smoke pass deferred to manual QA by request (no automated smoke run in this pass).
- [x] Wave 2: Domain 4 (`Payments/Personal Hub`) migrated `useBillPayments` and `useInsurancePayments` from `react-query` v3 API to `@tanstack/react-query` with stable query-key invalidation.
- [x] Wave 2: Domain 4 fixed broken Supabase client imports in `billPaymentService` and `insuranceService` (`../supabase/client` -> `../utils/supabase`).
- [x] Wave 2: Domain 4 enforced canonical personal-hub payment payload propagation in `paymentMethodScreen` (removed hardcoded `transactionType: 'airtime'`, preserved transaction metadata end-to-end).
- [x] Wave 2: Domain 4 fixed `mobileMoneyScreen` personal-hub payload consumption for `data`/`transfer` fields and unified user-id fallback handling.
- [x] Wave 2: Domain 4 constrained personal-hub checkout to supported payment path in `paymentMethodScreen` to prevent unsupported-method runtime failures.
- [x] Wave 2: Domain 4 schema gap closed for `saved_bill_accounts` and `saved_policies` via migration `20260207145514_phase9_slice4_saved_accounts_policies.sql` (RLS + indexes + updated_at triggers).
- [x] Wave 2: Domain 4 removed legacy `reviewPayScreen` from active navigator map (`user/App.js`) to eliminate non-persistent local checkout path and close remaining slice-4 partial flow gap.
- [x] Wave 2: Domain 4 removed simulated bill/policy verification placeholders in `billAmountScreen` and `insuranceAmountScreen`; both flows now use explicit user-entered amounts and pass canonical payload only.
- [x] Wave 2: Domain 4 removed fake mobile-money success timer in `mobileMoneyScreen`; checkout now records pending status and shows a production-safe `Payment Initiated` confirmation with reference.
- [x] Wave 2: Domain 4 wired `saveAccount` / `savePolicy` preferences to persisted upsert writes (`saved_bill_accounts`, `saved_policies`) after successful personal-hub payment initiation.
- [x] Wave 2: Domain 4 replaced hardcoded provider catalogs in user entry screens (`airtime`, `data`, `transfer`, `utilities`, `tv`, `insurance`) with DB-backed provider loading via safe RPC contract plus resilient fallback catalog.
- [x] Wave 2: Domain 4 propagated `providerId` end-to-end through personal-hub checkout payload and now persists `provider_id` on new personal-hub transaction rows where schema supports it.
- [x] Wave 2: Domain 4 removed remaining simulated-success behavior from legacy `reviewPayScreen`; if reached, it now forwards to canonical payment processing screens instead of local fake completion.
- [x] Wave 2: Domain 4 removed demo maintenance payment rows from `paymentHistoryScreen`; maintenance tab now renders real `payments` data (`pending` + `completed`) scoped by authenticated unit.
- [x] Wave 2: Domain 4 fixed pending "Pay Now" retry path in `paymentHistoryScreen` for personal-hub records to re-enter canonical personal-hub checkout (`paymentMethodScreen` with transaction metadata) instead of generic payment payload.
- [x] Wave 2: Domain 4 fixed hardware-back listener cleanup in `paymentHistoryScreen` and `paymentReceiptScreen` to prevent duplicate listener registration.
- [x] Wave 2: Payments UX hardening pass removed debug-noise + simulated delay behavior from `creditCardScreen` checkout (`setTimeout` processing removed; flow now uses direct DB write/update response path).
- [x] Wave 2: Domain 5 (`Marketplace`) restored follow schema via migration `20260207150526_phase9_slice5_marketplace_followers.sql` (`marketplace_vendor_followers`, vendor `follower_count`, trigger-based counter sync, owner-scoped RLS).
- [x] Wave 2: Domain 5 removed generic `increment`/`decrement` RPC dependency from `marketplaceService` follow/unfollow flow.
- [x] Wave 2: Domain 5 normalized marketplace hook user-key fallback (`profile.user_id` -> `profile.user_id || profile.id`) in `useMarketplace`.
- [x] Wave 2: Domain 5 migrated marketplace screens to production DB-first behavior (`marketplaceHomeScreen`, `categoryListingScreen`, `marketplaceSearchScreen`) and wired search history persistence via marketplace hooks.
- [x] Wave 2: Domain 5 added `user_addresses` schema with RLS via migration `20260207152555_phase9_slice5_user_addresses.sql` and synced shared DB types.
- [x] Wave 2: Domain 5 wired `deliveryAddressScreen` to persisted addresses using `useUserAddresses` and `useCreateUserAddress` (removed local mock address state).
- [x] Wave 2: Domain 6 (`Profile + Settings`) removed hardcoded profile demo identity in `profileScreen` (`demoUserId`) and switched profile cards/lists to authenticated user + `useUserGatePass`.
- [x] Wave 2: Domain 6 removed sample-data fallback from `useCommunityMembers` / `useCommunityAdmins` / `useCommunityCommittee` so member directory uses DB-only results (or empty state).
- [x] Wave 2: Domain 6 fully wired `communityInfoScreen` to live DB for metadata, contact details, and amenities/features (`communities`, `community_configurations`, `amenities`, `units` count) with fallback-safe rendering.
- [x] Wave 2: Domain 6 completed `editProfileScreen` persistence for profile + preferences fields and added storage-backed avatar update/removal flow (`avatar_url`) during profile save.
- [x] Wave 2: Domain 6 remediated settings persistence (`settingScreen`, `languageScreen`, `chatSettingsScreen`) with DB-backed preference storage (`profiles.preferences` and `chat_settings`) plus local language/biometric cache sync.
- [x] Wave 2: Domain 6 wired `emergencyContactsScreen` to DB-backed community config (`community_configurations.emergency_contacts`) with resilient fallback parsing.
- [x] Wave 2: Domain 6 completed `emergencyContactsScreen` custom-contact workflow (create/remove persisted in `profiles.preferences.custom_emergency_contacts` and merged with community-config contacts).
- [x] Wave 2: Domain 6 completed production wiring for `backupRestoreScreen` and `appUpdatesScreen` (backend account endpoints for backup status/export/restore/cleanup + app-update status, with `chat_settings` persistence retained for user preferences).
- [x] Wave 2: Domain 6 wired `deleteAccountScreen` to secure backend account endpoints (`/account/delete`, `/account/deactivate`) with password re-auth requirement and signed-out completion flow.
- [x] Wave 1: Supabase client import standardization across full user app (all active imports now resolve through `utils/supabase`; `lib/supabase` retained as compatibility shim).
- [x] Wave 1: React Query version standardization across hooks (`react-query` legacy imports removed; `@tanstack/react-query` only).
- [x] Wave 1 (partial): Introduced shared profile resolver utility (`user/utils/profileResolver.ts`) and applied it across notification, community/profile, gate-pass, and chat enhancement profile lookups.
- [x] Wave 1: Completed profile ID strategy normalization by routing profile lookups through shared resolver (`user/utils/profileResolver.ts`) across support/emergency/settings and notification flows.
- [x] Phase 9: Deferred `events` feature confirmed out-of-scope for current production release; legacy unused `user/services/eventService.js` removed (no `events` table migration planned).
- [x] Phase 10: Added canonical community directory table `community_memberships` via migration `supabase/migrations/20260220160000_phase10_community_directory_memberships.sql`.
- [x] Phase 10: Rewired superadmin community management tab role assignment flow to `community_memberships` (member/admin/committee with committee tenure metadata).
- [x] Phase 10: Rewired user app member/admin/committee directories to `community_memberships` with safe legacy fallback (`profiles` + `community_admins`) and realtime invalidation.
- [x] Phase 10: Rewired guard residents/search directories to `community_memberships` with safe legacy fallback; removed hardcoded resident ID mapping source.
- [x] Phase 10: Added `Units` and `Residents` tabs to superadmin community details (positioned before `Analytics`) with searchable, DB-backed visibility for resident-to-unit/community mapping.

## Phase 11 - Tenant Scope + RLS Hardening (Superadmin)
- [x] Created execution checklist: `superadmin/PRODUCTION_TENANT_RLS_REMEDIATION_CHECKLIST.md`.
- [x] Extended NextAuth JWT/session claims with tenant scope (`agencyId`, `communityId`, scoped lists) in `superadmin/src/app/api/auth/[...nextauth]/options.ts`.
- [x] Added shared admin scope helper + UUID guards in `superadmin/src/lib/adminAuth.ts`.
- [x] Enforced scoped API authorization for module settings routes:
- `superadmin/src/app/api/module-settings/route.ts`
- `superadmin/src/app/api/module-settings/communities/route.ts`
- [x] Applied migration `phase11_tenant_scope_rls_hardening` (file: `supabase/migrations/20260220200500_phase11_tenant_scope_rls_hardening.sql`) to remove legacy permissive policies and recreate scoped policies for critical tables.
- [x] Applied follow-up migration `phase11_profile_resolution_prefer_user_id` (file: `supabase/migrations/20260220213000_phase11_profile_resolution_prefer_user_id.sql`) to fix canonical profile resolution for accounts with both `profiles.id = auth.uid()` and `profiles.user_id = auth.uid()` rows.
- [x] Applied follow-up migration `phase11_profiles_identity_guard` (file: `supabase/migrations/20260220215500_phase11_profiles_identity_guard.sql`) to block future dual profile/auth mappings and clean known mis-mapped `profiles.user_id`.
- [x] Added DB verification script: `supabase/audit/phase11_tenant_scope_verification.sql`.
- [ ] Manual QA pass pending (superadmin + scoped admin + resident/guard app flows).

## Phase 12 - Visitors Cross-App Sync Hardening
- [x] Superadmin visitor create flow wired to real `visitor_passes` inserts (simulation removed).
- [x] Superadmin add-visitor UX polished for production: removed non-wired photo upload block, aligned create payload/QR contract with user app, expanded unit selector coverage, and added post-create gate-pass modal (entry code + QR actions).
- [x] Superadmin visitor lifecycle actions wired (approve/deny/check-in/check-out/delete).
- [x] Superadmin visitors list/grid polished: replaced placeholder controls with real filter bars (search/status/type/community), added clear/view toggles, and wired row/card lifecycle actions.
- [x] Superadmin visitors list/grid navigation UX polished: visitor rows/cards and names are clickable to details while keeping explicit Details action buttons; grid card spacing/gutters corrected for clean separation.
- [x] Superadmin visitors grid action bar polished: lifecycle buttons stay on one line in card view with compact equal-width layout.
- [x] Superadmin visitor list/detail attribution enriched with real joins (`Community`, `Unit`, `Created By`, `Agency`).
- [x] Superadmin visitors list/grid search, filter, and pagination are now data-driven (placeholder slicing removed).
- [x] Applied migration `20260220213222_phase12_visitor_passes_community_backfill.sql` to backfill `visitor_passes.community_id` from `unit_id` and keep it synced via trigger.
- [x] Applied migration `20260220221003_phase12_reversible_visitor_created_by_cleanup_v2.sql` to close visitor actor/profile mapping gaps with reversible backup tables (`datafix_phase12_*`).
- [x] Applied migration `20260220222100_phase12_align_superadmin_scope_to_casa_nirvana.sql` to align primary superadmin profile default scope to Casa Nirvana (`A-203`) with rollback backup.
- [x] User app visitor status mapping normalized to canonical DB statuses (`pending/approved/denied/checked_in/checked_out/cancelled/expired`).
- [x] Removed duplicate visitor realtime subscription from `visitorsScreen` (global subscription in `AuthContext` retained as canonical).
- [x] Fixed delivery company confirm/submit mismatch and cleaned dead pre-approve visitor state.
- [x] Added lifecycle contract doc: `user/VISITORS_LIFECYCLE_CONTRACT.md`.
- [ ] Remaining legacy seed rows with `visitor_passes.created_by IS NULL` (15) and `unit_id/community_id` both null (3) require manual attribution or archival (intentionally unchanged by safe cleanup).

## Phase 13 - Notice Module Hardening
- [x] Superadmin notice create flow now derives `community_id` from authenticated admin scope (removed hardcoded `default-community`).
- [x] User notice detail now supports both navigation contracts (`{ notice }` and `{ noticeId }`) with safe DB fallback and no runtime crash path.
- [x] Applied migration `supabase/migrations/20260221113000_phase13_notices_rls_scope_hardening.sql` (removed permissive notice read policies and enforced scoped notice access via `can_access_community`).
- [x] Applied migration `supabase/migrations/20260221115000_phase13_comments_notice_contract_hardening.sql` to normalize `comments.notice_id` to UUID + FK, rebuild comments RLS join contract, and preserve legacy static/unlinked rows in backup table `datafix_phase13_legacy_notice_comments_backup` (15 rows).
- [x] Retired static-notice comment write path in superadmin notice details (static placeholders are now read-only for comments).
- [x] Removed duplicate notice realtime subscription in user notice board screen (global `AuthContext` realtime invalidation remains canonical).
- [x] Hardened user notice service error propagation (`getNoticesForCommunity`) so query failures surface through React Query error states.
- [x] Normalized superadmin notice category contract for new creates (lowercase canonical values) and made article filtering case-insensitive for legacy rows.
- [x] Removed broken superadmin dependency on missing RPC `increment_comment_likes` by switching to direct comment like-count update flow.
- [x] Added production notice edit route (`/post/edit?id=...`) and wired details-page edit action to a real DB-backed update form.
- [x] Removed non-functional resident notice delete CTA from user `noticeBoardScreen` (read-only user flow preserved with share/favorite/detail actions).
- [x] Superadmin notice comments/replies now attribute `author_name`/`author_avatar` from active session instead of hardcoded placeholders.
- [x] Superadmin notice details sidebar (`Blogs`/`PhotoCard`) now uses DB-only notice/media data (static fallback content removed), with functional search/tag filtering and empty states.
- [x] Superadmin notice details metrics row now displays live notice like/view counts and computed comment totals; non-functional overflow menu actions removed.

## Phase 14 - Payments Domain Hardening
- [x] Applied migration `supabase/migrations/20260221101410_phase14_payments_rls_and_datafix.sql`.
- [x] Applied migration `supabase/migrations/20260221104014_phase14_public_service_provider_catalog_rpc.sql`.
- [x] Hardened `service_providers` access model (RLS policies rebuilt; admin-scoped read, superadmin-scoped writes, service-role full access).
- [x] Added secure provider catalog read function `public.list_active_service_providers(text)` (security-definer, row-security-off, non-sensitive columns only, execute granted to `authenticated`/`service_role`).
- [x] Hardened `transaction_status_logs` access model (scoped read via transaction ownership/tenant checks; admin-scoped inserts; service-role full access).
- [x] Switched `personal_hub_transactions` view to `security_invoker = true` and reduced grants to `SELECT` only for `authenticated`/`service_role`.
- [x] Ran reversible cleanup for personal-hub transaction user attribution with backup table `public.datafix_phase14_payment_user_id_backfill_backup` and cleanup tag `phase14_payments_user_id_cleanup_20260221`.
- [x] Ran reversible pass-2 cleanup for personal-hub transaction user attribution (`phase14_personal_hub_user_id_backfill_pass2_auth_only`) using backup table `public.datafix_phase14_personal_hub_user_id_backfill_pass2_backup` and cleanup tag `phase14_payments_user_id_cleanup_pass2_20260221`.
- [x] Archived unresolved legacy personal-hub rows with null `user_id` into reversible phase-14 archive tables and removed them from live transaction tables via migration `supabase/migrations/20260221215412_phase14_personal_hub_null_user_archival.sql` (`airtime` 12, `data` 12, `money_transfers` 6, `bill_payments` 6).
- [x] Payments module closure gate met for production runtime flows; `personal_hub_transactions` now has zero null-actor rows in live data (`user_id IS NULL` = 0).
- [x] Fixed user payment insert runtime blockers: moved non-schema card fields to `payments.metadata`, enforced `unit_id` + `payer_id` in card/paypal payment creation flows, and replaced legacy `payments` RLS with actor/unit scoped Phase 21 policies (`supabase/migrations/20260221213000_phase21_payments_rls_actor_scope_fix.sql`).
- [x] Fixed payments FK runtime blocker (`payments_booking_id_fkey`) by removing invalid `booking_id` writes from user checkout screens (amenity/service request IDs are now stored as `metadata.source_booking_id` + `metadata.source_booking_type` instead of writing into `payments.booking_id` which references `service_bookings` only).
- [x] Reworked user `successScreen` into a context-aware receipt view (service booking vs amenity booking vs generic payment), fixed nested navigation target (`bottomTab -> homeScreen`), and added Expo Go-safe receipt fallback when native PDF module is unavailable.
- [x] Fixed remaining direct `homeScreen` navigation calls in non-tab stack screens (`messageScreen`, `guardCallingScreen`, `paymentReceiptScreen`, `mobileMoneyScreen`) by routing through nested navigator target (`bottomTab -> homeScreen`).
- [x] Fixed amenity post-payment RLS violation path by updating only `payment_status` (not booking `status`) for user-driven amenity payment completion.

## Phase 15 - Book Amenities Hardening
- [x] Applied migration `supabase/migrations/20260221124000_phase15_amenities_rls_contract_cleanup.sql`.
- [x] Added reversible backup table `public.amenity_bookings_cleanup_backup_20260221` before amenity booking cleanup.
- [x] Backfilled and normalized `amenity_bookings` contract fields (`community_id`, `total_amount`, `booking_date`, `start_time`, `end_time`).
- [x] Added trigger `trg_sync_amenity_booking_contract_fields` to keep booking contract fields synced on insert/update.
- [x] Replaced permissive legacy RLS on `amenities` and `amenity_bookings` with tenant-scoped policy set (`p15_*`).
- [x] Wired superadmin amenity bookings actions (approve/reject) to real DB mutation flow in list and details views.
- [x] Fixed user app amenities query invalidation mismatch (`amenityBookings` key) and corrected hardware-back listener cleanup in amenity screens.
- [x] Aligned user booking create payload with DB contract (`user_id` as profile id, plus `community_id`, `total_amount`, `is_paid`).
- [x] Removed remaining Book Amenities UI “Societies” wording in superadmin surfaces (`Community` naming retained).
- [x] Fixed free-amenity booking UX in user app: free bookings now bypass payment-method selection and complete via booking confirmation path.
- [x] Added user-app `amenityBookingReviewScreen` as a dedicated final review/confirm step and wired post-submit modal actions (`Continue to Payment` for paid bookings, `View Bookings`/`Back Home` for free bookings).
- [x] Polished amenity final-review UX card + confirmation modal (paid/free badge, rate display, booking reference pill) for production consistency.
- [x] Fixed paid/free consistency bug on `bookAmenityScreen`: status badge + price label now respect amenity `is_paid`, and price calculation now enforces explicit free amenities as zero-cost.
- [x] Manual end-to-end QA completed (user create/list/details + superadmin approve/reject + cross-app visibility).

## Phase 16 - Help Desk Hardening
- [x] Fixed user-app Help Desk hook contract mismatch (`useSubmitGeneralInquiry`/`useSubmitTechnicalSupport`) by exposing expected submit function aliases.
- [x] Added canonical inquiry payload mappers in `user/utils/inquiryPayloadMappers.js` and rewired user forms to send DB-aligned snake_case fields only.
- [x] Fixed user-form state key mismatches blocking persisted values (`preferredContactMethod`, `reproductionSteps`).
- [x] Added profile/community guardrails before inquiry submission for user-side forms.
- [x] Normalized inquiry actor mapping to auth user identity (`user_id = profile.user_id || profile.id`) to satisfy current `inquiries` RLS contract.
- [x] Built superadmin inquiries operations module (list/filter/detail with assign/respond/resolve actions) mapped to `public.inquiries` at `/help-desk/inquiries`.
- [x] Hardened `public.inquiries` RLS via migration `supabase/migrations/20260221140227_phase16_inquiries_rls_hardening.sql` and applied it to the Casa Nirvana project.
- [x] Tightened support-chat fallback to community-scoped admins only (removed cross-community fallback and cross-community existing-chat reuse).

## Phase 17 - Complaints Hardening
- [x] Wired superadmin complaints hooks to include reporter/unit/community context (`profiles`, `units`, `communities`) with profile fallback resolution by `profiles.id` and `profiles.user_id`.
- [x] Wired superadmin complaints status/priority actions in list and details pages to real backend mutations (`PATCH /admin/complaints/:id`) and real delete flow.
- [x] Replaced superadmin complaints comments sample/simulated flow with DB-backed read/write (`get_complaint_comments_with_profiles` + `complaint_comments` insert).
- [x] Fixed backend complaint create default status contract (`open` -> `pending`) in `/Users/andromeda/casanirvana/backend/src/services/complaint.ts`.
- [x] Expanded backend complaint update validation to include production action fields (`priority`, `resolution_notes`, `resolved_by_profile_id`, `updated_at`, editable `subject/details`).
- [x] Added and applied migration `supabase/migrations/20260221152000_phase17_complaint_comments_rls_hardening.sql` to harden `complaint_comments` RLS to complaint-scoped tenant access and to upgrade comment-profile resolution fallback.
- [x] Removed user-app complaint null-unit fallback path in `/Users/andromeda/casanirvana/user/screens/addComplaintScreen.js`; complaint submission now requires assigned unit.
- [x] Added and applied migration `supabase/migrations/20260221164500_phase17_complaints_community_visibility_scope.sql` to explicitly allow `complaint_type='community'` reads within accessible community scope (`can_access_community(units.community_id)`).
- [x] Aligned user `useListCommunityComplaints` query to authenticated `profile.community_id` and replaced per-row profile fetches with joined/fallback profile resolution.
- [x] Removed legacy route-param complaint fallback path from user complaint navigation/details (`complaintsPersonalTab`, `complaintsCommunityTab`, `complaintDetailScreen`); detail screen now uses canonical DB complaint payload.
- [x] Hardened user complaint reporter profile resolution in `useGetComplaint` with direct joins plus fallback lookup on both `profiles.id` and `profiles.user_id`.

## Phase 18 - Maintenance Hardening
- [x] Normalized maintenance status contract to canonical DB enum (`pending`, `in_progress`, `completed`) across user and superadmin flows (removed `resolved` write-path usage).
- [x] Wired superadmin maintenance list actions to real operations (view/details route, complete/reopen status mutation, delete with confirmation).
- [x] Hardened superadmin maintenance detail actions to write completion metadata (`completed_at`, `resolved_at`) and removed non-wired quick-action placeholders.
- [x] Removed user maintenance legacy route-param fallback from detail flow; maintenance detail now reads DB-backed payload only.
- [x] Consolidated maintenance realtime to global `AuthContext` subscription (`requested_by=profile.id`) and removed duplicate screen-level subscription in `maintenanceRequestsScreen`.
- [x] Added and applied migration `supabase/migrations/20260221161045_phase18_maintenance_profile_unit_alignment_cleanup.sql` (reversible backup + targeted pending-row unit alignment for `thebornless144@gmail.com`).
- [x] Added and applied migration `supabase/migrations/20260221173000_phase18_maintenance_attachments_support.sql` to add `maintenance_requests.images text[]` with max-5 attachment guardrail.
- [x] Re-enabled maintenance image attachments in user create flow (`addMaintenanceRequestScreen`) and wired uploads to Storage bucket `attachments` via `useCreateMaintenanceRequestWithImages`.
- [x] Wired superadmin maintenance details Attachments tab to render real `maintenance_requests.images` gallery with preview modal and external open action.
- [x] Aligned user maintenance status presentation with full DB enum (`pending`, `in_progress`, `completed`, `cancelled`) and strengthened realtime invalidation for maintenance list/detail updates.

## Phase 19 - Chat Module Hardening
- [x] Removed hardcoded superadmin chat sender identity in `/Users/andromeda/casanirvana/superadmin/src/app/(admin)/messages/components/ChatArea.tsx`; sender now resolves from authenticated session profile (`session.user.id`).
- [x] Prevented self-chat default in superadmin contact sourcing by excluding current profile from `useListChatUsers` and keeping only auth-backed profiles.
- [x] Aligned superadmin chat attachment upload path to owner-scoped storage key format (`{auth.uid}/chat/{file}`) for policy-safe writes.
- [x] Aligned user chat attachment uploads to bucket `chat-attachments` with owner-scoped key prefix (`{auth.uid}/chat/{file}`).
- [x] Normalized remaining React Query invalidation calls in user messaging hooks to TanStack v5 object-form query keys.
- [x] Applied migration `supabase/migrations/20260221175254_phase19_chat_calls_and_storage_hardening.sql` (legacy calls policy cleanup, scoped calls RLS rebuild, and explicit `chat-attachments` storage policies for authenticated owner + service role).
- [ ] Manual runtime QA pending for end-to-end chat lifecycle (`superadmin -> user`, attachments, read receipts, call state transitions).

## Phase 20 - Service Module Hardening (Bottom Tab)
- [x] Replaced user `serviceScreen` local mock catalog/bookings with DB-backed wiring (`services` + `service_requests`) and removed local-only booking state from runtime flow.
- [x] Rewired user `serviceModal` submit path to real `service_requests` insert mutation with unit/community/auth actor enforcement and retained post-submit booking/payment navigation.
- [x] Added user hooks `useListCommunityServices`, `useListMyServiceRequests`, `useGetServiceRequest`, and `useCreateServiceRequest` in `/Users/andromeda/casanirvana/user/hooks/useServiceRequests.js`.
- [x] Fixed `serviceBookingDetailScreen` back-handler cleanup bug and added canonical request fetch by `bookingId` with DB-first fallback.
- [x] Added module-toggle coverage for bottom-tab `serviceScreen` in `/Users/andromeda/casanirvana/user/services/moduleSettingsService.js` (`services` slug).
- [x] Removed superadmin service-request mock fallback/debug path by rewriting `/Users/andromeda/casanirvana/superadmin/src/hooks/useServiceRequests.ts` to DB-only joined queries with profile resolution.
- [x] Wired superadmin service-request status actions (`pending -> in_progress -> completed`) in list/details screens.
- [x] Applied migration `supabase/migrations/20260221191500_phase20_services_and_service_bookings_rls_hardening.sql` (tightened `services` and `service_bookings` RLS scope; removed permissive legacy policies).
- [x] Resume checkpoint validated after crash (latest service edits preserved through `2026-02-21 18:29` in user + superadmin service files).
- [x] Removed non-functional/placeholder controls from superadmin service-request details and view pages (disabled edit/export, placeholder history/actions, static sidebar statistics, unlinked `New Request` button replaced with `Manage Services`).
- [x] Applied migration `supabase/migrations/20260221202000_phase20_service_requests_scope_guardrail.sql` to resolve `service_requests`↔`services` community mismatch safely (24 mismatched rows backed up and detached with title preservation) and enforce future scope match by trigger (`trg_service_requests_enforce_service_scope`).
- [x] Aligned service module presentation contract across apps (canonical status labels and GHS currency formatting in service requests list/detail surfaces).
- [x] Added service module realtime invalidation in user app for `service_requests` and community `services` changes via `/Users/andromeda/casanirvana/user/hooks/useRealtimeSubscriptions.ts`.
- [x] Hardened user service-create UX confirmation path so success modal only opens when `service_requests` insert returns a persisted request id (`useCreateServiceRequest` + `serviceModal`).
- [x] Fixed service booking payment summary amount propagation (`serviceScreen -> paymentMethodScreen`) by passing canonical `amount/amountFormatted` and prioritizing booking payload totals over stale route params.
- [ ] Manual runtime QA pending for service lifecycle (`user create -> user list/detail -> superadmin status update -> user reflects update`).

## Phase 22 - Profile Module Hardening (Bottom Tab)
- [x] Applied migration `supabase/migrations/20260221220537_phase22_family_members_rls_hardening.sql` to close `family_members` RLS gap (table had RLS enabled with no policies).
- [x] Added owner-scoped authenticated policies for `family_members` (`SELECT`/`INSERT`/`UPDATE`/`DELETE` on `user_id = auth.uid()`) plus explicit `service_role` full-access policy for operational tooling.
- [x] Normalized React Query v5 invalidation calls in profile entry hooks (`useFamilyMembers`, `useDailyHelp`, `useVehicles`, `useFrequentEntries`) to object-form query keys.
- [x] Removed hardcoded demo-user IDs from profile entry create/edit/delete flows and enforced authenticated actor resolution in profile modals (`addFamilyMemberModal`, `myVehiclesModal`, `edit*` entry modals, `entryDetailModal`).
- [x] Removed profile/gate-pass debug logging noise from runtime-critical paths (`profileScreen`, `gatePassModal`, `useUserGatePass`, and profile edit modals) while retaining error logging paths.
- [x] Replaced superadmin resident details placeholder sections (`Community Feedback`, `Resident Documents`) with DB-backed `Resident Access Directory` tables for `family_members`, `daily_help`, `vehicles`, and `frequent_entries`.
- [x] Applied migration `supabase/migrations/20260221224136_phase22_profile_directory_admin_read_scope.sql` to allow tenant-scoped admin `SELECT` access on resident profile-directory tables.
- [ ] Manual runtime QA pending for profile lifecycle (`family/daily help/vehicle/frequent entry create -> edit -> soft delete -> gate pass modal data`).

## Phase 23 - Settings UX Consistency Hardening
- [x] Removed `Service Management` section from user app settings menu (`serviceProvidersScreen` + `bookingHistoryScreen` entry points removed from settings list).
- [x] Refactored settings item interaction contract to action-based items (`navigate`/`toggle`/`logout`) and replaced stack-duplicating `navigation.push` with `navigation.navigate`.
- [x] Hardened `pinCodeScreen` into a real lock-management flow (set/change PIN, current PIN verification, disable PIN lock) wired to `AppLockContext`.
- [x] Updated `AppLockContext.enablePin` to preserve existing biometric preference when updating PIN (prevents accidental biometric reset during PIN change).
- [x] Replaced non-functional chat-settings action buttons with explicit informational state to avoid dead-end UX.
- [x] Targeted lint validation completed for changed settings files (no errors/warnings in touched files).

## Phase 24 - Emergency Alerts Hardening
- [x] Aligned emergency type contract across user and superadmin write/read paths (user quick-action aliases now normalize to canonical superadmin types before insert).
- [x] Hardened superadmin emergency create mutation to auto-derive authenticated actor profile and scoped `community_id`/`user_id` payload fields required by RLS.
- [x] Applied migration `supabase/migrations/20260222101000_phase24_emergency_contract_and_recipients_hardening.sql` (legacy alert-type normalization + `emergency_alert_recipients.alert_id` UUID/FK repair + recipient RLS policies).
- [x] Wired user emergency create flow to persist `emergency_alert_recipients` rows (deduplicated recipient fan-out with role attribution).
- [x] Wired remaining superadmin emergency detail actions (`Assign to Team`, `Escalate`, `Update Status`, `Reopen`, `Generate Report`, and response action controls) to functional handlers.
- [x] Replaced superadmin emergency overview placeholder metrics (`averageResponseTime`, `acknowledgedPercentage`) with DB-derived calculations.
- [x] Removed user-app emergency modal debug logging and replaced hardcoded emergency flow strings with `bottomTab` i18n keys + defaults.
- [x] Added emergency i18n keys to `/Users/andromeda/casanirvana/user/languages/en.json` and ensured non-English locales use safe fallback defaults.
- [ ] Manual runtime QA pending for emergency lifecycle (`user emergency send -> superadmin list/detail visibility -> recipient tracking row creation`).

## Phase 25 - Guard App Bootstrap
- [x] Resolved Guard Expo startup blocker (`ConfigError: Cannot determine the project's Expo SDK version ... expo is not installed`) by installing dependencies in `/Users/andromeda/casanirvana/Guard` (`npm install`).
- [x] Verified Guard Expo runtime config resolves correctly (`npx expo --version`, `npx expo config --type public --json`).
- [x] Upgraded Guard app to Expo SDK 54 compatibility (Expo Go 54): `expo`/`react`/`react-native` and Expo module versions aligned in `/Users/andromeda/casanirvana/Guard/package.json` and lockfile regenerated.
- [x] Fixed Guard startup blocker introduced by SDK 54 web config validation by changing `/Users/andromeda/casanirvana/Guard/app.json` `web.output` from `static` to `single` (no `expo-router` dependency required).
- [x] Fixed Guard runtime red-screen (`Cannot read property 'pSBCr' of undefined`) by patching `react-native-really-awesome-button` color helper to avoid invalid `this` usage under SDK 54/Hermes (`/Users/andromeda/casanirvana/Guard/scripts/patch-awesome-button.js`, wired into `postinstall`).
- [x] Fixed Guard runtime red-screen (`Worklets mismatch 0.7.4 vs 0.5.1`) by pinning `react-native-worklets` to `0.5.1` in `/Users/andromeda/casanirvana/Guard/package.json` and reinstalling lockfile resolution.
- [x] Created Guard audit tracking files: `/Users/andromeda/casanirvana/Guard/SCREEN_WIRING_CHECKLIST.md`, `/Users/andromeda/casanirvana/Guard/SCHEMA_ALIGNMENT_GAPS.md`.
- [x] Started Guard module-by-module production wiring/remediation with Visitor Entry (gate-pass code + QR scan): real pass lookup service (`/Users/andromeda/casanirvana/Guard/services/visitorEntryService.js`), home/QR/confirm flow rewiring, canonical notification payload fixes, and nested home navigation fixes.
- [x] Applied migration `supabase/migrations/20260222194000_phase25_guard_visitor_entry_rls_alignment.sql` to add guard-scoped visitor-pass and notification RLS helpers/policies.
- [x] Applied follow-up migration `supabase/migrations/20260222195500_phase25_guard_visitor_insert_policy_fix.sql` to correct insert policy unit/community qualification.
- [x] Applied migration `supabase/migrations/20260222201500_phase25_guard_profiles_read_scope.sql` to allow guard-scoped resident profile reads required by unit-host lookups.
- [x] Applied migration `supabase/migrations/20260222225000_phase25_guard_profile_sync_on_users.sql` to auto-sync `users.role='guard'` into `guards` and backfill missing guard profiles (`12` rows recorded in `public.datafix_phase25_guard_profile_backfill_backup` with `cleanup_tag = phase25_guard_profile_backfill_20260222`).
- [x] Completed Guard Guest Entry flow remediation (`guestEntryScreen`, `cabEntryScreen`, `deliveryEntryScreen`, `serviceEntryScreen`, `flatNoScreen`, `flatNoTab`, `entryConfirmationScreen`, `ringingScreen`) with required-field validation, ISO time propagation, and deterministic unit/host pass-through.
- [x] Added canonical walk-in pass artifact generation (`entry_code`, `qr_code_data`) for all guard-created visitor types via `/Users/andromeda/casanirvana/Guard/services/visitorPassArtifacts.js` and hooked into create flows (`useVisitorPasses`, `useCabEntries`, `useDeliveryEntries`, `useServiceEntries`).
- [x] Updated Guard approval screen to display persisted entry code/QR payload from DB instead of local random code generation.
- [x] Applied migration `supabase/migrations/20260222213000_phase25_walkin_entry_artifacts_backfill.sql` to backfill legacy walk-in pass artifacts (`entry_code` + `qr_code_data`) with reversible backup table `public.datafix_phase25_walkin_pass_artifacts_backup` (`cleanup_tag = phase25_walkin_entry_artifacts_backfill_20260222`).
- [x] Completed Guard auth/bootstrap hardening from splash to home: rebuilt `/Users/andromeda/casanirvana/Guard/contexts/GuardAuthContext.js` (guard-only + active + community-scoped session hydration), made `/Users/andromeda/casanirvana/Guard/screens/splashScreen.js` auth-aware, and fixed progress-safe submit behavior in `/Users/andromeda/casanirvana/Guard/screens/auth/emailLoginScreen.js` and `/Users/andromeda/casanirvana/Guard/screens/auth/registerScreen.js`.
- [x] Replaced phone OTP placeholder flow with real Supabase verification/resend in `/Users/andromeda/casanirvana/Guard/screens/auth/verificationScreen.js` and routed success back through splash-auth decision.
- [x] Wired home header identity and unread notification badge to DB-backed guard/user/community state (`/Users/andromeda/casanirvana/Guard/screens/homeScreen.js` + realtime count subscription) and removed hardcoded `Kwame Mensah / Gate A / Casa Nirvana` placeholder values.
- [x] Completed Guard Notifications module production wiring: replaced mock notification list/detail runtime with DB-backed inbox + realtime sync (`/Users/andromeda/casanirvana/Guard/screens/notificationScreen.js`, `/Users/andromeda/casanirvana/Guard/screens/notificationDetailScreen.js`, `/Users/andromeda/casanirvana/Guard/hooks/useNotifications.js`), and aligned unread-state source to `read_at` for home badge consistency.
- [x] Added robust Supabase env fallback resolution in `/Users/andromeda/casanirvana/Guard/utils/supabase.js` (`expoConfig.extra` -> `process.env`) to reduce runtime config drift.
- [x] Build check passed for this slice via `npx expo export --platform android` in `/Users/andromeda/casanirvana/Guard`.
- [x] Completed Guard In/Out module remediation: added lightweight status count hook (`/Users/andromeda/casanirvana/Guard/hooks/useVisitorPassCounts.js`), rewired `/Users/andromeda/casanirvana/Guard/screens/inOutScreen.js`, and standardized checked-in/checked-out list payload mapping via `/Users/andromeda/casanirvana/Guard/services/inOutPassMapper.js`.
- [x] Removed In/Out list inconsistencies (checked-out error rendering bug, static phone fallbacks, unsafe duration math) in `/Users/andromeda/casanirvana/Guard/components/checkedInTab.js` and `/Users/andromeda/casanirvana/Guard/components/checkedOutTab.js`.
- [x] Optimized visitor host attribution by replacing per-pass N+1 queries with batched `profiles` lookup in `/Users/andromeda/casanirvana/Guard/hooks/useVisitorPasses.js`.
- [x] Polished visitor detail UX for In/Out lifecycle: actual exit time now appears only after check-out; scheduled window and actual movement timestamps are separated in `/Users/andromeda/casanirvana/Guard/screens/visitorDetailScreen.js`.
- [x] Build check passed for In/Out slice via `npx expo export --platform android` in `/Users/andromeda/casanirvana/Guard`.
- [x] Hardened Guard auth session persistence in `/Users/andromeda/casanirvana/Guard/utils/supabase.js` using AsyncStorage-backed Supabase auth (`persistSession`, `autoRefreshToken`, app-state refresh handling) so guard users stay signed in across app restarts.
- [x] Added stable Guard dev-start scripts in `/Users/andromeda/casanirvana/Guard/package.json` (`start:dev`, `start:tunnel`) to reduce manual reload friction while iterating in Expo Go.
- [x] Build check passed for session persistence + dev-loop updates via `npx expo export --platform android --output-dir dist-test-session-persist` in `/Users/andromeda/casanirvana/Guard`.
- [x] Fixed In/Out lifecycle split inconsistency by enforcing checked-in query guardrails (`status='checked_in'` + no exit timestamps), expanding checked-out query to include timestamp-backed exits, and aligning counters in `/Users/andromeda/casanirvana/Guard/hooks/useVisitorPasses.js` and `/Users/andromeda/casanirvana/Guard/hooks/useVisitorPassCounts.js`.
- [x] Applied DB datafix for legacy lifecycle drift (rows marked `checked_in` with exit timestamps): backed up affected rows to `public.datafix_phase25_checked_in_exit_repair_backup` (`backup_tag = phase25_checked_in_exit_repair_20260222`) and normalized them to `status='checked_out'` with `checked_out_at` populated.
- [x] Removed manual time pickers from all 4 guard walk-in entry modules (`guestEntryScreen`, `cabEntryScreen`, `deliveryEntryScreen`, `serviceEntryScreen`) and related param plumbing (`flatNoTab`, `entryConfirmationScreen`, `ringingScreen`) so entry timestamps are auto-recorded at approval/create time.
- [x] Build check passed for In/Out + time-input removal pass via `npx expo export --platform android --output-dir dist-test-inout-time-removal` in `/Users/andromeda/casanirvana/Guard`.
- [x] Completed Guard Chats module production alignment pass:
  - Replaced static/random chat data sources in `/Users/andromeda/casanirvana/Guard/components/chatsTab.js` and `/Users/andromeda/casanirvana/Guard/screens/searchScreen.js` with DB-backed conversation + directory sources.
  - Hardened `/Users/andromeda/casanirvana/Guard/hooks/useMessages.js` to canonical message payloads (`message_type`, `attachments`, `read/is_read`, `message_status`) and realtime invalidation for both thread + conversations.
  - Aligned `/Users/andromeda/casanirvana/Guard/screens/messageScreen.js` attachment uploads to `chat-attachments` owner-scoped paths and added automatic read-receipt marking for incoming messages.
  - Removed stale Guard call-cache invalidation dependency on deprecated `chatEnhancements` key in `/Users/andromeda/casanirvana/Guard/hooks/useCalls.js`.
- [x] Completed Guard Alerts list remediation:
  - Replaced mock emergency feed with DB-scoped query/subscription in `/Users/andromeda/casanirvana/Guard/hooks/useEmergencyAlerts.js`.
  - Rebuilt `/Users/andromeda/casanirvana/Guard/screens/emergencyScreen.js` with In/Out-style production card layout (status filters, summary counters, unit/type/reporter/time metadata, and detail payload mapping).
- [x] Completed Guard emergency detail lifecycle actions:
  - Wired `/Users/andromeda/casanirvana/Guard/screens/emergencyDetailScreen.js` action buttons to real DB transitions (`active`, `investigating`, `resolved`) with confirmation/error handling and timeline/status refresh.
  - Extended `/Users/andromeda/casanirvana/Guard/hooks/useEmergencyAlerts.js` with mutation support and `resolved_at/resolved_by` contract propagation.
  - Applied migration `supabase/migrations/20260222234000_phase25_guard_emergency_alert_update_policy.sql` to add guard-scoped `SELECT`/`UPDATE` policies on `public.emergency_alerts`.
- [x] Replaced Guard emergency action native alerts with branded in-app modal UX in `/Users/andromeda/casanirvana/Guard/screens/emergencyDetailScreen.js` (confirm + success/error states for `contact admin`, `acknowledge`, `investigating`, `resolved`).
- [x] Wired Guard `contact admin` emergency escalation flow:
  - Added admin fan-out dispatch from `/Users/andromeda/casanirvana/Guard/screens/emergencyDetailScreen.js` via `/Users/andromeda/casanirvana/Guard/hooks/useEmergencyAlerts.js`.
  - Escalation now writes canonical admin notifications (`notifications`) and recipient audit rows (`emergency_alert_recipients`) for the current incident.
  - Applied migration `supabase/migrations/20260223000500_phase25_guard_emergency_recipient_notify_policy.sql` to allow guard-scoped recipient audit inserts.
- [x] Fixed Guard emergency admin-notify RLS blocker:
  - Hardened recipient resolution in `/Users/andromeda/casanirvana/Guard/hooks/useEmergencyAlerts.js` to include only profiles mapped to valid `users.id` rows before insert.
  - Applied migration `supabase/migrations/20260223003000_phase25_guard_notify_user_profile_fallback.sql` to expand `guard_can_notify_user(uuid)` community resolution with profile fallback when `users.community_id` is null.
- [ ] Continue Guard module-by-module production wiring/remediation (next: Residents/Directory module and end-to-end guard lifecycle QA).

## Phase 26 - Guard Profile + Settings Persistence Hardening
- [x] Added shared profile resolver utility `/Users/andromeda/casanirvana/Guard/utils/profileResolver.js` for `profiles.user_id` -> `profiles.id` fallback-safe resolution.
- [x] Added Guard settings persistence service `/Users/andromeda/casanirvana/Guard/services/settingsPersistenceService.js` (app preferences in `profiles.preferences`, notification/chat payloads in `chat_settings.app_info_preferences`).
- [x] Wired `/Users/andromeda/casanirvana/Guard/screens/settingScreen.js` to authenticated guard identity data, persisted toggle writes (dark/biometric), dialer-based quick contacts, and real auth signout.
- [x] Wired `/Users/andromeda/casanirvana/Guard/screens/languageScreen.js` language updates to persisted profile preference writes.
- [x] Wired `/Users/andromeda/casanirvana/Guard/screens/notificationSettingsScreen.js` to DB-backed load/save (removed UI-only placeholder behavior).
- [x] Wired `/Users/andromeda/casanirvana/Guard/screens/chatSettingsScreen.js` to DB-backed load/save and reset-to-defaults contract (removed mock storage/history side-effects).
- [x] Wired `/Users/andromeda/casanirvana/Guard/screens/editProfileScreen.js` to real `users`/`guards` hydration and update writes, including avatar upload + `refreshGuardProfile` refresh.
- [x] Enforced Guard call policy split by actor type: residents/hosts route in-app with profile-scoped call records (`/Users/andromeda/casanirvana/Guard/hooks/useCallManager.js` + `callScreen` callers), while visitor/guest/cab/delivery/service contacts use direct dial from `/Users/andromeda/casanirvana/Guard/screens/visitorDetailScreen.js`.
- [x] Applied migration `supabase/migrations/20260223103000_phase26_guard_profile_update_policy.sql` to allow guard-owned `public.guards` updates (`USING/WITH CHECK user_id = auth.uid()`).
- [ ] Manual runtime QA pending for Guard settings/profile flows (`settingScreen`, `languageScreen`, `notificationSettingsScreen`, `chatSettingsScreen`, `editProfileScreen`).

## Phase 27 - ExpressPay Gateway Foundation
- [x] Added canonical payment-gateway architecture lock doc: `/Users/andromeda/casanirvana/EXPRESSPAY_INTEGRATION_BLUEPRINT.md` (hosted checkout first, verification contract, security guardrails).
- [x] Updated onboarding/playbook references for gateway standard (`/Users/andromeda/casanirvana/NEW_ENGINEER_QUICKSTART.md`, `/Users/andromeda/casanirvana/PRODUCTION_READINESS_PLAYBOOK.md`).
- [x] Applied migration `supabase/migrations/20260227153000_phase27_expresspay_secure_gateway_config.sql`:
  - Created `public.payment_gateway_configs` (community/global scope, test/live mode, secret refs, RLS + grants).
  - Seeded disabled global `expresspay` rows (`test`, `live`) with hosted-checkout defaults.
  - Removed permissive legacy `app_settings` authenticated-all/read-all policies and added explicit admin/service-role policies.
- [x] Implemented backend ExpressPay orchestration contract:
  - Service: `/Users/andromeda/casanirvana/backend/src/services/expresspay.ts`
  - Controller: `/Users/andromeda/casanirvana/backend/src/controllers/expresspay.ts`
  - Routes: `/Users/andromeda/casanirvana/backend/src/routes/expresspay.ts`
  - Mounted in `/Users/andromeda/casanirvana/backend/src/app.ts`
  - Validation schemas added in `/Users/andromeda/casanirvana/backend/src/validation/schemas.ts`
  - Env template updated in `/Users/andromeda/casanirvana/backend/.env.example`
- [x] Backend lint + build checks passed for this slice (`eslint` on touched files + `npm run build` in `/Users/andromeda/casanirvana/backend`).
- [x] Applied migration `supabase/migrations/20260227162000_phase27_vault_secret_helper_rpcs.sql` to add backend-only Vault helper RPCs (`p27_upsert_vault_secret`, `p27_read_vault_secret`, `p27_read_vault_secret_by_id`).
- [x] Added backend admin ExpressPay secure-config endpoints:
  - `GET /admin/payment-gateways/expresspay/config`
  - `PUT /admin/payment-gateways/expresspay/config`
  - `POST /admin/payment-gateways/expresspay/test`
  - Files: `/Users/andromeda/casanirvana/backend/src/services/adminPaymentGateway.ts`, `/Users/andromeda/casanirvana/backend/src/controllers/adminPaymentGateway.ts`, route wiring in `/Users/andromeda/casanirvana/backend/src/routes/admin.ts`.
- [x] Rewired superadmin payment gateway page ExpressPay block to secure admin backend flow (no plaintext secret writes to `app_settings`):
  - Added `/Users/andromeda/casanirvana/superadmin/src/hooks/useExpressPayGatewayConfig.ts`
  - Updated `/Users/andromeda/casanirvana/superadmin/src/app/(admin)/settings/payment/gateways/page.tsx` to:
    - load/save/test ExpressPay through new admin endpoints,
    - stop persisting `expresspay_*` keys through legacy `app_settings` upsert path,
    - show configured-secret status flags and connection test feedback.
- [x] Targeted lint/build checks passed for this pass:
  - backend: `eslint` on changed files + `npm run build`
  - superadmin: `npm run lint -- --file src/app/(admin)/settings/payment/gateways/page.tsx --file src/hooks/useExpressPayGatewayConfig.ts`
- [x] Wired user app payment-method screens to backend ExpressPay endpoints (no direct client-side `payments` inserts for checkout):
  - Added `/Users/andromeda/casanirvana/user/services/expressPayService.js` with authenticated `initiate`, `verify`, `status`, and reconciliation helpers.
  - Updated `/Users/andromeda/casanirvana/user/screens/mobileMoneyScreen.js` to:
    - initiate in-app mobile-money checkout through backend `POST /payments/expresspay/initiate`,
    - use ExpressPay Merchant Direct flow (no external browser handoff),
    - poll and reconcile status via backend `verify/status`,
    - route completed payments into `successScreen`,
    - keep personal-hub transaction rows linked by `payment_ref_id` and update terminal states (`completed`/`failed`) without client-side success simulation.
  - Updated `/Users/andromeda/casanirvana/backend/src/services/expresspay.ts` to run direct mobile-money orchestration through `direct/submit.php` + `checkout.php`, while card remains on the hosted-checkout path pending PCI-scope review.
  - `/Users/andromeda/casanirvana/user/screens/paypalScreen.js` remains available in code but is now intended to stay disabled via payment-method policy until future rollout.
- [x] Applied hotfix migration `supabase/migrations/20260227174500_phase27_admin_roles_rls_recursion_fix.sql` to remove recursive legacy RLS policies:
  - Dropped old `Allow service role or superadmin ...` policies on `public.admin_roles` and `public.app_settings`.
  - Added function-based `admin_roles` policies (`p27_admin_roles_select_admin`, `p27_admin_roles_manage_superadmin`, `p27_admin_roles_service_role_all`) to eliminate policy recursion and restore superadmin settings reads.
- [x] Manual runtime QA completed for user payment checkout lifecycle with real ExpressPay test credentials:
  - verified mobile-money approval prompt, pending confirmation UX, and callback/poll settlement path,
  - verified hosted `Credit / Debit Card` checkout handoff and in-app return flow,
  - payment phase is now in production-closeout state pending normal release monitoring only.
- [x] Added callback trust hardening for ExpressPay:
  - callback now resolves an existing payment first, rejects mismatched `token` / `order-id` pairs, stores a sanitized callback audit payload in `payments.metadata.expresspay`, and only then performs authoritative provider-side verification via `query.php`.
  - no provider signature/hash contract is documented in the current ExpressPay docs, so the hardening uses strict reference matching + server-side re-verification rather than trusting callback payload state directly.
- [x] Phase 28 payment ledger foundation applied:
  - Migration `supabase/migrations/20260301103000_phase28_payment_domain_rebuild.sql` created `payment_obligations`, extended `payments` with source-aware ledger fields, backfilled legacy pending rows, and normalized currency/provider fields.
  - Added backend ledger feeds for user + admin (`/payments/obligations`, `/payments/history`, `/payments/statements`, `/payments/transactions/initiate`, `/admin/payments/transactions`, `/admin/payments/obligations`, `/admin/payments/statements`).
  - User payment feeds now read backend ledger APIs instead of raw Supabase table assumptions.
- [x] Phase 28 payment UI alignment pass completed:
  - User payment entry/success flows now propagate `sourceType`, `sourceId`, and `obligationId` consistently across `paymentMethodScreen`, `mobileMoneyScreen`, `creditCardScreen`, `reviewPayScreen`, and `successScreen`.
  - Superadmin payment detail sidebar now reads real obligations for “Open Payment Obligations” instead of misclassifying transaction rows as pending dues.
  - Core superadmin payment cards/details now display `GH₵` formatting and recognize `initiated` / `processing` / `cancelled` / `expired` transaction states.
- [x] Phase 30 payment charge management foundation implemented:
  - Added migration `supabase/migrations/20260301153000_phase30_payment_charge_management.sql` to source-control the new billing-control schema already applied in Casa Nirvana (`payment_charge_templates`, `payment_charge_template_targets`, `payment_charge_runs`, and extended `payment_obligations` invoice fields).
  - Backend now exposes admin charge-management APIs for catalog, template CRUD, preview, issue, run history, and manual scheduled-run execution (`/admin/payment-charges/*`).
  - Superadmin now has a new operational page at `/payments/charges` with the full fee/charge catalog, agency/community-scoped template management, preview-and-issue workflow, and run/invoice visibility.
  - New charge runs materialize directly into `payment_obligations`, so issued community charges flow into the user app `Pending` tab without extra client-side wiring.
  - Added API-key protected internal automation endpoint `POST /internal/payment-charges/run-due` so scheduled billing runs can be triggered by production cron infrastructure without an authenticated browser session.
  - Normalized the Payments information architecture in superadmin: sidebar children are now `Overview`, `Payments`, `Invoices`, and `Payouts`; the `/payments/charges` workspace is tabbed (`Templates`, `Issue Payments`, `Issued Charges`, `Runs`), `/payments/invoices` is live, and `/payments/payouts` is ready for live payout data.
- [x] Phase 31 payout foundation implemented:
  - Added migration `supabase/migrations/20260301190000_phase31_payouts_foundation.sql` and applied it to the live Casa Nirvana database: `payments` now stores payout-classification snapshot fields, and the new payout tables exist (`payout_rules`, `payout_destinations`, `payout_requests`, `payout_request_items`, `payout_request_events`, `payout_ledger_entries`).
  - Backend now classifies completed settled payments into Community Hub vs Personal Hub, computes payout eligibility snapshots, and writes `credit_available` payout ledger entries during normal payment settlement side effects.
  - Backend now exposes admin payout APIs for summary, eligible revenue, destinations, rules, payout requests, and payout-request lifecycle actions under `/admin/payouts/*`.
  - Superadmin `/payments/payouts` is now wired to real backend data with tabbed sections for `Overview`, `Requests`, `Destinations`, and `Rules`.
- [x] Phase 32 payout hardening + automation completed:
  - Added migration `supabase/migrations/20260302101500_phase32_payout_rls_hardening.sql` and applied it live: payout tables now have function-based scoped read policies for authenticated agency managers/superadmin and service-role full access only; no direct authenticated writes bypass the backend.
  - Payout module access is now explicitly restricted to `superadmin` and `agency_manager` in the backend service layer; community-scoped admins continue using community finance reporting, not payout pages.
  - Added internal payout automation endpoints for reconciliation and stale reservation cleanup: `POST /internal/payouts/recompute-balances` and `POST /internal/payouts/release-stale-reservations`.
- [x] Payout signoff conditions validated with isolated live code-side fixture against a real agency/community scope:
  - Agency manager scope is restricted to assigned-agency payout data; cross-agency access is denied.
  - Community admins are blocked from payout workflows.
  - Superadmin can read and manage payout states.
  - Personal Hub-classified payments are excluded from payout balances and payout transaction feeds.
  - A fully reserved payment cannot be reserved twice.
  - `mark_paid` moves linked payments to `paid_out` and clears reserved amounts.
  - `cancel` / `reject` / `fail` all release reserved amounts back to `available`.
- [x] Phase 33 settings hardening slice completed (security-first, UI preserved):
  - SMTP settings are now backend-mediated through `/admin/settings/smtp`; browser writes to `app_settings` were removed from the SMTP flow, sensitive values are masked on read, and connection tests are now real server-side socket checks instead of mock delays.
  - Integration settings are now backend-mediated through `/admin/settings/integrations`; browser writes to `app_settings` were removed from the integrations flow, sensitive values are masked on read, and test actions now run deterministic server-side validation instead of simulated success/failure.
  - Added secure backend settings controller/service for SMTP + integrations (`backend/src/controllers/adminSecureSettings.ts`, `backend/src/services/adminSecureSettings.ts`) and the supporting validation schemas/routes.
  - Added shared authenticated superadmin admin-API helpers (`superadmin/src/hooks/useAdminApi.ts`) and replaced duplicated direct-fetch logic in the affected settings hooks.
  - Application settings cleanup started without changing the existing visual design: `/settings/app`, `/settings/app/splash`, `/settings/app/onboarding`, and `/settings/app/urls` now load/save via backend-managed `system_settings` using the new shared `useSettingsCategory` hook, replacing simulated saves while preserving the current tabs/cards/layout.
  - Production defaults in the legacy application settings flow were normalized to the current product direction (`Community`, `Africa/Accra`, `GHS`, `GH₵`) instead of older legacy placeholders.

## Cleanup / Hygiene
- [x] Remove backup artifacts (`*.bak`, `*.backup`, etc.). (Left `backupRestoreScreen.js` files since they appear to be real features.)
- [x] Remove any `node_modules` committed to repo.
- [x] Remove test pages (superadmin test/debug routes and pages).

## Endpoints Added/Updated (Summary)
- [x] `POST /admin/invites` (admin invite flow)
- [x] `GET /admin/system-settings` (read system settings)
- [x] `GET /admin/system-settings/exists` (system settings existence check)
- [x] `PUT /admin/system-settings` (upsert system settings)
- [x] `DELETE /admin/system-settings/:key` (delete system setting)
- [x] `GET /admin/onboarding-requests` (admin review list)
- [x] `PATCH /admin/onboarding-requests/:id` (approve/reject/update notes)
- [x] `POST /onboarding/requests` (public onboarding request, API key required)
- [x] `POST/PUT/DELETE /admin/communities` (admin writes)
- [x] `POST/PUT/DELETE /admin/units` (admin writes)
- [x] `POST/PUT/DELETE /admin/profiles` (admin writes)
- [x] `POST/PATCH/DELETE /admin/messages` (admin writes)
- [x] `POST/PATCH/DELETE /admin/complaints` (admin writes)
- [x] `POST/PUT/DELETE /admin/payments` (admin writes)
- [x] `POST/PUT/DELETE /admin/notification-campaigns` (admin writes)
- [x] `POST /payments/expresspay/initiate` (create gateway payment intent + checkout URL)
- [x] `GET /payments/expresspay/status/:paymentId` (payment status polling)
- [x] `POST /payments/expresspay/verify` (manual/server reconciliation)
- [x] `POST/GET /payments/expresspay/callback` (provider callback ingestion)
- [x] `GET /admin/payment-gateways/expresspay/config` (secure ExpressPay config read)
- [x] `PUT /admin/payment-gateways/expresspay/config` (secure ExpressPay config upsert + Vault secret write)
- [x] `POST /admin/payment-gateways/expresspay/test` (credential/connectivity test with persisted test status)
- [x] `POST /internal/payment-charges/run-due` (API key protected scheduled charge-issuance trigger)
- [x] `GET /admin/payouts/summary` (payout balance + counts summary)
- [x] `GET /admin/payouts/transactions` (eligible distributable revenue feed)
- [x] `GET /admin/payouts/destinations` (list payout destinations)
- [x] `POST /admin/payouts/destinations` (create payout destination)
- [x] `PATCH /admin/payouts/destinations/:id` (update payout destination)
- [x] `GET /admin/payouts/rules` (list payout rules)
- [x] `POST /admin/payouts/rules` (create/update payout rule)
- [x] `GET /admin/payouts/requests` (list payout requests)
- [x] `POST /admin/payouts/requests` (create payout request)
- [x] `POST /admin/payouts/requests/:id/:action` (approve/reject/process/pay/fail/cancel payout request)
- [x] `POST /internal/payouts/recompute-balances` (API key protected payout reclassification / ledger reconciliation)
- [x] `POST /internal/payouts/release-stale-reservations` (API key protected stale payout reservation release)

## Environment Variables (Required)
- `ADMIN_INVITE_REDIRECT_URL`
- `ONBOARDING_REQUEST_API_KEY`
- `PAYMENT_CHARGE_CRON_API_KEY`
- `PAYOUT_AUTOMATION_API_KEY`
- `NEXT_PUBLIC_ADMIN_SIGNUP_DISABLED=true`
- `NEXT_PUBLIC_API_URL`

## Notes
- Invite flow includes “Set Password” modal on the superadmin sign-up page when using invite links.
- Admin writes are moving behind backend endpoints; verify any remaining admin write flows are not direct-to-Supabase.
- Shared DB types are synced from `/supabase/database.types.ts` using `scripts/sync-db-types.sh`.
