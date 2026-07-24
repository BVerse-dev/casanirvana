# Casa Nirvana Production Readiness - Progress Checklist

Date: 2026-02-06

## Current Release View
- [x] Historical execution log remains in this file.
- [x] Current release-closeout source of truth is `PRODUCTION_RELEASE_GATES.md`.
- [x] Superadmin route audit source remains `apps/superadmin/ADMIN_LAUNCH_AUDIT_CHECKLIST.md`.
- [x] Runtime signoff source remains `MANUAL_RUNTIME_QA_PACK.md`.
- [x] Detailed apps/resident-mobile/Guard runtime execution aid is `USER_GUARD_LAUNCH_SIGNOFF_CHECKLIST.md`.
- [x] User/Guard runtime evidence log is `USER_GUARD_LAUNCH_SIGNOFF_LOG.md`.
- [x] Controlled stale-worktree reintegration source is `WORKTREE_REINTEGRATION_CHECKLIST.md`.

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
- [x] Verify NextAuth secret is only in env (no hardcoded secret) and demo auth paths removed everywhere.

## Phase 2 - Auth & RBAC Consolidation
- [x] Roles & permissions UI updated to include `agency_manager` and `facility_manager`.
- [x] Backend `POST /admin/invites` added for invite flow.
- [x] Admin Users page uses invite flow (no password creation in client).
- [x] Admin Roles/Permissions page uses backend endpoints for updates/deletes.
- [x] System settings (system_settings) now read/write via backend endpoints (no direct Supabase client).
- [x] Confirm RLS policies in Supabase match backend expectations for all roles.

## Phase 3 - Admin Onboarding (Agency/Facility Managers)
- [x] DB migration added: `admin_onboarding_requests`.
- [x] Public request endpoint: `POST /onboarding/requests` (API key protected).
- [x] Admin review endpoints: `GET/PATCH /admin/onboarding-requests`.
- [x] Superadmin UI page: `/settings/admin/onboarding` with filters, approve/reject, approve+invite, and review notes modal.
- Note (2026-03-16): The public WordPress-site wiring work is intentionally deferred until the WordPress site is live. Keep the backend onboarding contract as-is and return to the form integration during the release-plumbing pass.
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
- [x] Apply remaining marketplace/guard internal-table RLS cleanup (active migration `20260310184500_phase36_marketplace_guard_internal_rls_cleanup.sql`; replaces archived pre-baseline `20260206170000_phase5_rls_internal_tables.sql` reference; Casa Nirvana verified 2026-05-22).
- [x] Finish remaining seed/data alignment across apps (applied `20260319113000_phase41_archive_legacy_unattributed_visitor_passes.sql` to archive/remove the 15 known legacy `visitor_passes` seed/demo rows that still lacked valid creator attribution or scope, with reversible backup tables).

## Phase 6 - Quality & Observability
- [x] Add request validation on active backend endpoints (remaining intentionally generic config payloads tracked separately).
- [x] Normalize error responses across backend (global handler returns `{ error: { code, message, details, requestId } }` and active backend surfaces now converge on it).
- [x] Add monitoring/logging baseline across backend + superadmin + user + Guard (structured JSON logger, client error ingest, optional Sentry sink via env, JS runtime error boundaries/listeners).
- [x] Add rate limiting and security headers (Express `helmet` + rate limiting middleware active in backend; runtime tuning remains part of release QA).
- [x] Clear repo-wide `superadmin` strict type-check debt behind `npm run build:check` (completed `2026-03-20`; verification passed with `npx tsc --noEmit`, `npm run build`, `npm run build:check`, and `git diff --check` after removing stale dead files, aligning nullable contracts, and fixing active notification/payment/visitor/settings typing surfaces).
- [ ] Expand test coverage beyond focused backend contract tests into backend integration, admin Playwright smoke tests, and mobile regression tests (backend mounted-app integration added on 2026-03-19 and now includes mounted admin core coverage, scoped `/admin/payments` mutation coverage, legacy scoped `/admin/profiles` CRUD, scoped maintenance stats plus maintenance/complaint/payment/notices bulk operations, scoped `/admin/payments/generate`, scoped payment ledger routes (`/admin/payments/transactions`, `/admin/payments/obligations`, `/admin/payments/statements`), scoped `/admin/payment-charges/*` catalog/template/run/issue enforcement, scoped `/admin/payouts/*` summary/transactions/destinations/rules/requests coverage, platform-only `/admin/personal-hub/*` mounted coverage for dashboard/reporting/catalog management, and mounted settings/admin-control coverage for `/admin/settings/system-overview`, `/admin/settings/user-groups`, `/admin/settings/activity-logs`, `/admin/settings/preference-*`, `/admin/settings/{smtp,integrations,business,regional,security-privacy,general-system,push,sms}`, `/admin/payment-gateways/expresspay/*`, and `/admin/system-settings*`; browser/mobile layers still deferred).

## Phase 7 - Migrations/Types Alignment
- [x] Fix Supabase types generation script for current CLI.
- [x] Generate and sync shared `supabase/database.types.ts` to all apps.
- [x] Schema drift audit exports + drift report stored in `supabase/audit/*`.
- [x] Baseline live DB to `supabase/migrations/20260206_baseline_schema.sql`.
- [x] Archive pre-baseline migrations to `supabase/migrations/_archive/2026-02-06-pre-baseline`.
- [x] Update `supabase/migrations/README.md` to document the baseline.
- [x] Run `supabase migration repair` equivalent (manual baseline insert) on remote.
- [x] Repair post-baseline migration history alignment and confirm the active local migration set is fully represented in the live production history table (management API verification on 2026-03-16; direct CLI password auth remains an operator prerequisite, not a schema blocker).
- [x] Apply financial RLS migration `20260206234500_phase7_rls_financial_tables.sql` and verify flows.
- [x] Apply PII RLS migration `20260206235500_phase7_rls_pii_tables.sql` and verify flows.
- [x] Apply payments policy cleanup migration `20260207001000_phase7_policy_cleanup_payments.sql` and verify flows.
- [x] Apply notifications policy cleanup migration `20260207002000_phase7_policy_cleanup_notifications.sql` and verify flows.
- [x] Apply profiles/users policy cleanup migration `20260207003000_phase7_policy_cleanup_profiles_users.sql` and verify flows.
- [x] Apply messaging policy cleanup migration `20260207004000_phase7_policy_cleanup_messaging.sql` and verify flows.
- [x] Resolve the legacy system-policy cleanup checklist reference by verifying current live system-policy coverage and repairing the missing migration-history metadata row for `20260207005000_phase7_policy_cleanup_system.sql`.

## Phase 8 - Deployment Readiness
- [x] Create per-app deployment checklist in `DEPLOYMENT_CHECKLIST.md`.
- Note (2026-03-16): Release-plumbing items in this phase are intentionally deferred until the WordPress site is up. Current production sequence continues with RLS/migration closeout, data alignment, deeper test coverage, and final runtime signoff before returning here.
- [ ] Configure per-app CI/CD pipelines and hosting targets (backend, superadmin, user, Guard).
- [ ] Store all production secrets in CI/CD or secrets manager.
- [ ] Document rollback procedure per app.

## Phase 9 - User App Fullstack Wiring Audit
- [x] Complete deep screen-level DB wiring audit for user app domains in sequence.
- [x] Document screen/component wiring status in `apps/resident-mobile/SCREEN_WIRING_CHECKLIST.md`.
- [x] Map schema/type mismatches and migration-vs-code decisions in `apps/resident-mobile/SCHEMA_ALIGNMENT_GAPS.md`.
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
- [x] Wave 2: Domain 4 removed legacy `reviewPayScreen` from active navigator map (`apps/resident-mobile/App.js`) to eliminate non-persistent local checkout path and close remaining slice-4 partial flow gap.
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
- [x] Wave 1 (partial): Introduced shared profile resolver utility (`apps/resident-mobile/utils/profileResolver.ts`) and applied it across notification, community/profile, gate-pass, and chat enhancement profile lookups.
- [x] Wave 1: Completed profile ID strategy normalization by routing profile lookups through shared resolver (`apps/resident-mobile/utils/profileResolver.ts`) across support/emergency/settings and notification flows.
- [x] Phase 9: Deferred `events` feature confirmed out-of-scope for current production release; legacy unused `apps/resident-mobile/services/eventService.js` removed (no `events` table migration planned).
- [x] Phase 10: Added canonical community directory table `community_memberships` via migration `supabase/migrations/20260220160000_phase10_community_directory_memberships.sql`.
- [x] Phase 10: Rewired superadmin community management tab role assignment flow to `community_memberships` (member/admin/committee with committee tenure metadata).
- [x] Phase 10: Rewired user app member/admin/committee directories to `community_memberships` with safe legacy fallback (`profiles` + `community_admins`) and realtime invalidation.
- [x] Phase 10: Rewired guard residents/search directories to `community_memberships` with safe legacy fallback; removed hardcoded resident ID mapping source.
- [x] Phase 10: Added `Units` and `Residents` tabs to superadmin community details (positioned before `Analytics`) with searchable, DB-backed visibility for resident-to-unit/community mapping.

## Phase 11 - Tenant Scope + RLS Hardening (Superadmin)
- [x] Created execution checklist: `apps/superadmin/PRODUCTION_TENANT_RLS_REMEDIATION_CHECKLIST.md`.
- [x] Extended NextAuth JWT/session claims with tenant scope (`agencyId`, `communityId`, scoped lists) in `apps/superadmin/src/app/api/auth/[...nextauth]/options.ts`.
- [x] Added shared admin scope helper + UUID guards in `apps/superadmin/src/lib/adminAuth.ts`.
- [x] Enforced scoped API authorization for module settings routes:
- `apps/superadmin/src/app/api/module-settings/route.ts`
- `apps/superadmin/src/app/api/module-settings/communities/route.ts`
- [x] Applied migration `phase11_tenant_scope_rls_hardening` (file: `supabase/migrations/20260220194744_phase11_tenant_scope_rls_hardening.sql`) to remove legacy permissive policies and recreate scoped policies for critical tables.
- [x] Applied follow-up migration `phase11_profile_resolution_prefer_user_id` (file: `supabase/migrations/20260220200318_phase11_profile_resolution_prefer_user_id.sql`) to fix canonical profile resolution for accounts with both `profiles.id = auth.uid()` and `profiles.user_id = auth.uid()` rows.
- [x] Applied follow-up migration `phase11_profiles_identity_guard` (file: `supabase/migrations/20260220201027_phase11_profiles_identity_guard.sql`) to block future dual profile/auth mappings and clean known mis-mapped `profiles.user_id`.
- [x] Added DB verification script: `supabase/audit/phase11_tenant_scope_verification.sql`.
- [ ] Manual QA pass pending (superadmin + scoped admin + resident/guard app flows). Execute `/Users/andromeda/casanirvana/MANUAL_RUNTIME_QA_PACK.md`.

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
- [x] Added lifecycle contract doc: `apps/resident-mobile/VISITORS_LIFECYCLE_CONTRACT.md`.
- [x] Applied migration `20260319113000_phase41_archive_legacy_unattributed_visitor_passes.sql` to archive/remove the remaining 15 legacy visitor seed/demo rows that still had `created_by IS NULL`, including the 3 fully unscoped rows; reversible backups are stored in `datafix_phase41_legacy_visitor_passes_archive` and `datafix_phase41_legacy_visitor_entry_logs_archive`. Verified 2026-05-22: `created_by IS NULL = 0`, `unit_id/community_id both null = 0`.

## Phase 13 - Notice Module Hardening
- [x] Superadmin notice create flow now derives `community_id` from authenticated admin scope (removed hardcoded `default-community`).
- [x] User notice detail now supports both navigation contracts (`{ notice }` and `{ noticeId }`) with safe DB fallback and no runtime crash path.
- [x] Applied migration `supabase/migrations/20260221004421_phase13_notices_rls_scope_hardening.sql` (removed permissive notice read policies and enforced scoped notice access via `can_access_community`).
- [x] Applied migration `supabase/migrations/20260221005336_phase13_comments_notice_contract_hardening.sql` to normalize `comments.notice_id` to UUID + FK, rebuild comments RLS join contract, and preserve legacy static/unlinked rows in backup table `datafix_phase13_legacy_notice_comments_backup` (15 rows).
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
- [x] Completed the focused superadmin notice follow-up for `Communication -> Notice -> List/Details/Create`: replaced placeholder notice list composition with DB-backed filters/stats/cards, rebuilt notice details around live notice/comment/engagement data with lifecycle-safe actions, and rewired create/edit surfaces to scoped authenticated notice forms (media URLs instead of fake upload widgets). No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed after the changes.
- [x] Applied migration `supabase/migrations/20260313153000_phase39_notice_comment_launch_hardening.sql` to add `comments.author_user_id`, remove broad direct comment update/delete paths, and expose scoped comment likes through `public.increment_comment_likes(uuid)`; migration is live on Casa Nirvana Supabase and recorded as version `20260313153000`.
- [x] Completed the focused superadmin emergency alerts follow-up for `Communication -> Emergency Alerts`: removed duplicate screen-level realtime wiring, rebuilt the queue/detail workspace around DB-backed filters and lifecycle-safe status actions, and replaced placeholder response history with truthful alert lifecycle data (`created_at`, `updated_at`, `resolved_at`, reporter/resolver/community/unit attribution). No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed after the changes.
- [x] Completed the focused superadmin messages and chats follow-up for `Communication -> Messages & Chats`: moved direct-message writes onto hardened backend admin endpoints, replaced hardcoded/demo chat user, group, and QR/profile placeholders with session/live-profile data, removed empty-link/alert/console placeholder behavior from chat/group/contact surfaces, and added singleton realtime invalidation for `messages`, `groups`, `group_members`, and `group_messages`. No SQL migration was required, and both `npm run build` in `/Users/andromeda/casanirvana/apps/api` and `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed after the changes.

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
- [x] Fixed user payment insert runtime blockers: moved non-schema card fields to `payments.metadata`, enforced `unit_id` + `payer_id` in card/paypal payment creation flows, and replaced legacy `payments` RLS with actor/unit scoped Phase 21 policies (`supabase/migrations/20260221210105_phase21_payments_rls_actor_scope_fix.sql`).
- [x] Fixed payments FK runtime blocker (`payments_booking_id_fkey`) by removing invalid `booking_id` writes from user checkout screens (amenity/service request IDs are now stored as `metadata.source_booking_id` + `metadata.source_booking_type` instead of writing into `payments.booking_id` which references `service_bookings` only).
- [x] Reworked user `successScreen` into a context-aware receipt view (service booking vs amenity booking vs generic payment), fixed nested navigation target (`bottomTab -> homeScreen`), and added Expo Go-safe receipt fallback when native PDF module is unavailable.
- [x] Fixed remaining direct `homeScreen` navigation calls in non-tab stack screens (`messageScreen`, `guardCallingScreen`, `paymentReceiptScreen`, `mobileMoneyScreen`) by routing through nested navigator target (`bottomTab -> homeScreen`).

## Phase 46-48 - Supabase Advisor Launch Hardening
- [x] Applied `20260523120000_phase46_advisor_security_performance_cleanup.sql` to live Casa Nirvana (`pswnlowvmdgeifhxilao`): replaced `auth.users`-backed public views with profile-backed equivalents, set flagged views to `security_invoker`, locked datafix/archive tables with RLS, added scoped `equipment_assignments` RLS, pinned mutable function search paths, removed duplicate archive indexes, added missing FK indexes, added primary keys to empty backup tables, and removed broad public bucket listing policies.
- [x] Applied `20260523121500_phase47_advisor_safe_followups.sql`: added service-role policies to already RLS-locked/no-policy tables and removed direct anonymous execute grants from security-definer functions.
- [x] Applied `20260523123000_phase48_advisor_function_grant_tightening.sql`: removed inherited `PUBLIC` execute grants from security-definer functions and explicitly preserved `authenticated`/`service_role` execution.
- [x] Supabase Advisor rerun after Phase 48 has zero `ERROR` findings. Remaining warnings are not safe blind fixes before release freeze: authenticated security-definer RPC grants, GraphQL exposure, broad/duplicated RLS policy shape, auth RLS initplan performance rewrites, auth MFA/leaked-password settings, Supabase Postgres version upgrade, and unused-index review after real traffic.
- [x] Applied `20260702120000_phase49_scope_broad_directory_rls.sql` to remove broad authenticated read policies from `communities`, `units`, and `guards`, add membership/guard-aware community access helpers, and verify scoped SQL smoke (`guard` and resident/user-with-membership each see one community and scoped units/guards; superadmin retains full scope).
- [x] Fixed amenity post-payment RLS violation path by updating only `payment_status` (not booking `status`) for user-driven amenity payment completion.
- [x] Fixed Personal Hub checkout launch defects discovered during live runtime verification on 2026-04-02: `paymentMethodScreen` no longer forces catalog-backed Personal Hub flows to Mobile Money only when card is enabled by live policy, and the shared user mobile API base resolver now falls back to the hosted backend in production-like device runtimes when Expo config carries a stale private/local API URL (with explicit opt-in preserved for intentional local-device testing).
- [x] Fixed Personal Hub home-entry availability defects discovered during live runtime verification on 2026-04-02: the user home screen now waits for authenticated session readiness before resolving live bill-payment and insurance provider availability, and it force-refreshes module settings on boot so `Pay Bills` / `Insurance` do not remain falsely greyed out from stale cache or pre-auth provider fetch timing.

## Phase 15 - Book Amenities Hardening
- [x] Applied migration `supabase/migrations/20260221115418_phase15_amenities_rls_contract_cleanup.sql`.
- [x] Added reversible backup table `public.amenity_bookings_cleanup_backup_20260221` before amenity booking cleanup.
- [x] Backfilled and normalized `amenity_bookings` contract fields (`community_id`, `total_amount`, `booking_date`, `start_time`, `end_time`).
- [x] Added trigger `trg_sync_amenity_booking_contract_fields` to keep booking contract fields synced on insert/update.
- [x] Replaced permissive legacy RLS on `amenities` and `amenity_bookings` with tenant-scoped policy set (`p15_*`).
- [x] Wired superadmin amenity bookings actions (approve/reject) to real DB mutation flow in list and details views.
- [x] Fixed user app amenities query invalidation mismatch (`amenityBookings` key) and corrected hardware-back listener cleanup in amenity screens.

## Phase 16 - Controlled Worktree Reintegration
- [x] Audited stale `user` + `Guard` worktrees and recorded keep/drop/rewrite guidance in `WORKTREE_TAKEOVER_AUDIT.md`.
- [x] Created the controlled execution tracker `WORKTREE_REINTEGRATION_CHECKLIST.md` so reintegration work is tracked slice-by-slice on top of current `main`.
- [x] Completed Slice 1 from stale user commit `55f9e92` on current `main`: user and Guard direct-message flows now store owner-scoped chat attachment paths instead of public URLs, apps/resident-mobile/apps/guard-mobile/superadmin readers now hydrate signed attachment URLs, user call signaling now uses the DB-driven call manager path, and message queries exclude soft-deleted rows.
- [x] Applied and recorded live migration `supabase/migrations/20260322120000_phase42_chat_attachment_privacy_alignment.sql` on Casa Nirvana Supabase to make `chat-attachments` private and replace the broad authenticated read policy with scoped attachment access helpers; live verification confirmed `storage.buckets.public = false`, helper functions present, `p42_chat_attachments_select_scoped` present, and `p19_chat_attachments_select_authenticated` removed.
- [x] Completed Slice 2 from stale user commit `883e1c9` on current `main`: active user profile/directory surfaces now use a shared avatar renderer plus storage upload helper, directory create/edit flows store truthful remote `avatar_url` values instead of raw local file URIs, family/daily-help/frequent-entry/vehicle QR payloads are regenerated through a shared helper on create and update, and the stale `plate_number` assumption was removed from active vehicle flows to match the live schema.
- [x] Verified Slice 2 locally with targeted `npx eslint` on all touched user files plus `git diff --check`.
- [ ] Residual user app lint debt remains outside Slice 2 and is unchanged: `apps/resident-mobile/app/_layout.tsx` (`expo-router` resolution), `apps/resident-mobile/components/addCabModal.js` (duplicate key), and `apps/resident-mobile/components/serviceModal_broken.js` (broken JSX) still fail the full `npm run lint`.
- [x] Completed Slice 3 from stale guard commit `bf81330` on current `main`: Guard resident-directory/search now use translation-backed resident labels and truthful empty/error/module-disabled states, recent resident search history is scoped by both auth user and guard community, and apps/guard-mobile/user community directory subscriptions now invalidate on `units` changes so resident/unit changes refresh cleanly.
- [x] Applied and recorded live migration `supabase/migrations/20260322153000_phase43_community_directory_membership_integrity_parity.sql` on Casa Nirvana Supabase to bring the already-live community-membership integrity layer back under source control while preserving the working `p35_*` function/trigger names; live verification confirmed the Phase 43 history row, preserved sync/validation functions and triggers, Phase 43 backup tables, and zero drift/missing/inactive same-community membership counts.
- [x] Verified Slice 3 locally with `npx eslint hooks/useCommunityMembers.ts` in `user` plus `git diff --check`.
- [ ] Guard lint entrypoint remains a tooling boundary outside Slice 3 verification: direct `npx eslint` / `npx eslint@9` in `Guard` attempted ad-hoc ESLint installs and failed because the workspace does not expose a flat-config-compatible local lint config entrypoint.
- [x] Deliberate boundary recorded: Phase 43 was not backported into `supabase/migrations/20260206_baseline_schema.sql` because the current baseline snapshot does not inline the Phase 10 `community_memberships` table/domain that Phase 43 depends on; the migration is represented in the active post-baseline set instead.
- [x] Aligned user booking create payload with DB contract (`user_id` as profile id, plus `community_id`, `total_amount`, `is_paid`).
- [x] Removed remaining Book Amenities UI “Societies” wording in superadmin surfaces (`Community` naming retained).
- [x] Fixed free-amenity booking UX in user app: free bookings now bypass payment-method selection and complete via booking confirmation path.
- [x] Added user-app `amenityBookingReviewScreen` as a dedicated final review/confirm step and wired post-submit modal actions (`Continue to Payment` for paid bookings, `View Bookings`/`Back Home` for free bookings).
- [x] Polished amenity final-review UX card + confirmation modal (paid/free badge, rate display, booking reference pill) for production consistency.
- [x] Fixed paid/free consistency bug on `bookAmenityScreen`: status badge + price label now respect amenity `is_paid`, and price calculation now enforces explicit free amenities as zero-cost.
- [x] Manual end-to-end QA completed (user create/list/details + superadmin approve/reject + cross-app visibility).

## Phase 16 - Help Desk Hardening
- [x] Fixed user-app Help Desk hook contract mismatch (`useSubmitGeneralInquiry`/`useSubmitTechnicalSupport`) by exposing expected submit function aliases.
- [x] Added canonical inquiry payload mappers in `apps/resident-mobile/utils/inquiryPayloadMappers.js` and rewired user forms to send DB-aligned snake_case fields only.
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
- [x] Fixed backend complaint create default status contract (`open` -> `pending`) in `/Users/andromeda/casanirvana/apps/api/src/services/complaint.ts`.
- [x] Expanded backend complaint update validation to include production action fields (`priority`, `resolution_notes`, `resolved_by_profile_id`, `updated_at`, editable `subject/details`).
- [x] Added and applied migration `supabase/migrations/20260221145445_phase17_complaint_comments_rls_hardening.sql` to harden `complaint_comments` RLS to complaint-scoped tenant access and to upgrade comment-profile resolution fallback.
- [x] Removed user-app complaint null-unit fallback path in `/Users/andromeda/casanirvana/apps/resident-mobile/screens/addComplaintScreen.js`; complaint submission now requires assigned unit.
- [x] Added and applied migration `supabase/migrations/20260221150555_phase17_complaints_community_visibility_scope.sql` to explicitly allow `complaint_type='community'` reads within accessible community scope (`can_access_community(units.community_id)`).
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
- [x] Added and applied migration `supabase/migrations/20260221164728_phase18_maintenance_attachments_support.sql` to add `maintenance_requests.images text[]` with max-5 attachment guardrail.
- [x] Re-enabled maintenance image attachments in user create flow (`addMaintenanceRequestScreen`) and wired uploads to Storage bucket `attachments` via `useCreateMaintenanceRequestWithImages`.
- [x] Wired superadmin maintenance details Attachments tab to render real `maintenance_requests.images` gallery with preview modal and external open action.
- [x] Aligned user maintenance status presentation with full DB enum (`pending`, `in_progress`, `completed`, `cancelled`) and strengthened realtime invalidation for maintenance list/detail updates.

## Phase 19 - Chat Module Hardening
- [x] Removed hardcoded superadmin chat sender identity in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/messages/components/ChatArea.tsx`; sender now resolves from authenticated session profile (`session.user.id`).
- [x] Prevented self-chat default in superadmin contact sourcing by excluding current profile from `useListChatUsers` and keeping only auth-backed profiles.
- [x] Aligned superadmin chat attachment upload path to owner-scoped storage key format (`{auth.uid}/chat/{file}`) for policy-safe writes.
- [x] Aligned user chat attachment uploads to bucket `chat-attachments` with owner-scoped key prefix (`{auth.uid}/chat/{file}`).
- [x] Normalized remaining React Query invalidation calls in user messaging hooks to TanStack v5 object-form query keys.
- [x] Applied migration `supabase/migrations/20260221175254_phase19_chat_calls_and_storage_hardening.sql` (legacy calls policy cleanup, scoped calls RLS rebuild, and explicit `chat-attachments` storage policies for authenticated owner + service role).
- [ ] Manual runtime QA pending for end-to-end chat lifecycle (`superadmin -> user`, attachments, read receipts, call state transitions).

## Phase 20 - Service Module Hardening (Bottom Tab)
- [x] Replaced user `serviceScreen` local mock catalog/bookings with DB-backed wiring (`services` + `service_requests`) and removed local-only booking state from runtime flow.
- [x] Rewired user `serviceModal` submit path to real `service_requests` insert mutation with unit/community/auth actor enforcement and retained post-submit booking/payment navigation.
- [x] Added user hooks `useListCommunityServices`, `useListMyServiceRequests`, `useGetServiceRequest`, and `useCreateServiceRequest` in `/Users/andromeda/casanirvana/apps/resident-mobile/hooks/useServiceRequests.js`.
- [x] Fixed `serviceBookingDetailScreen` back-handler cleanup bug and added canonical request fetch by `bookingId` with DB-first fallback.
- [x] Added module-toggle coverage for bottom-tab `serviceScreen` in `/Users/andromeda/casanirvana/apps/resident-mobile/services/moduleSettingsService.js` (`services` slug).
- [x] Removed superadmin service-request mock fallback/debug path by rewriting `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useServiceRequests.ts` to DB-only joined queries with profile resolution.
- [x] Wired superadmin service-request status actions (`pending -> in_progress -> completed`) in list/details screens.
- [x] Applied migration `supabase/migrations/20260221182810_phase20_services_and_service_bookings_rls_hardening.sql` (tightened `services` and `service_bookings` RLS scope; removed permissive legacy policies).
- [x] Resume checkpoint validated after crash (latest service edits preserved through `2026-02-21 18:29` in user + superadmin service files).
- [x] Removed non-functional/placeholder controls from superadmin service-request details and view pages (disabled edit/export, placeholder history/actions, static sidebar statistics, unlinked `New Request` button replaced with `Manage Services`).
- [x] Applied migration `supabase/migrations/20260221201404_phase20_service_requests_scope_guardrail.sql` to resolve `service_requests`↔`services` community mismatch safely (24 mismatched rows backed up and detached with title preservation) and enforce future scope match by trigger (`trg_service_requests_enforce_service_scope`).
- [x] Aligned service module presentation contract across apps (canonical status labels and GHS currency formatting in service requests list/detail surfaces).
- [x] Added service module realtime invalidation in user app for `service_requests` and community `services` changes via `/Users/andromeda/casanirvana/apps/resident-mobile/hooks/useRealtimeSubscriptions.ts`.
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
- [x] Applied migration `supabase/migrations/20260222002101_phase24_emergency_contract_and_recipients_hardening.sql` (legacy alert-type normalization + `emergency_alert_recipients.alert_id` UUID/FK repair + recipient RLS policies).
- [x] Wired user emergency create flow to persist `emergency_alert_recipients` rows (deduplicated recipient fan-out with role attribution).
- [x] Wired remaining superadmin emergency detail actions (`Assign to Team`, `Escalate`, `Update Status`, `Reopen`, `Generate Report`, and response action controls) to functional handlers.
- [x] Replaced superadmin emergency overview placeholder metrics (`averageResponseTime`, `acknowledgedPercentage`) with DB-derived calculations.
- [x] Removed user-app emergency modal debug logging and replaced hardcoded emergency flow strings with `bottomTab` i18n keys + defaults.
- [x] Added emergency i18n keys to `/Users/andromeda/casanirvana/apps/resident-mobile/languages/en.json` and ensured non-English locales use safe fallback defaults.
- [ ] Manual runtime QA pending for emergency lifecycle (`user emergency send -> superadmin list/detail visibility -> recipient tracking row creation`).

## Phase 25 - Guard App Bootstrap
- [x] Resolved Guard Expo startup blocker (`ConfigError: Cannot determine the project's Expo SDK version ... expo is not installed`) by installing dependencies in `/Users/andromeda/casanirvana/apps/guard-mobile` (`npm install`).
- [x] Verified Guard Expo runtime config resolves correctly (`npx expo --version`, `npx expo config --type public --json`).
- [x] Upgraded Guard app to Expo SDK 54 compatibility (Expo Go 54): `expo`/`react`/`react-native` and Expo module versions aligned in `/Users/andromeda/casanirvana/apps/guard-mobile/package.json` and lockfile regenerated.
- [x] Fixed Guard startup blocker introduced by SDK 54 web config validation by changing `/Users/andromeda/casanirvana/apps/guard-mobile/app.json` `web.output` from `static` to `single` (no `expo-router` dependency required).
- [x] Fixed Guard runtime red-screen (`Cannot read property 'pSBCr' of undefined`) by patching `react-native-really-awesome-button` color helper to avoid invalid `this` usage under SDK 54/Hermes (`/Users/andromeda/casanirvana/apps/guard-mobile/scripts/patch-awesome-button.js`, wired into `postinstall`).
- [x] Fixed Guard runtime red-screen (`Worklets mismatch 0.7.4 vs 0.5.1`) by pinning `react-native-worklets` to `0.5.1` in `/Users/andromeda/casanirvana/apps/guard-mobile/package.json` and reinstalling lockfile resolution.
- [x] Created Guard audit tracking files: `/Users/andromeda/casanirvana/apps/guard-mobile/SCREEN_WIRING_CHECKLIST.md`, `/Users/andromeda/casanirvana/apps/guard-mobile/SCHEMA_ALIGNMENT_GAPS.md`.
- [x] Started Guard module-by-module production wiring/remediation with Visitor Entry (gate-pass code + QR scan): real pass lookup service (`/Users/andromeda/casanirvana/apps/guard-mobile/services/visitorEntryService.js`), home/QR/confirm flow rewiring, canonical notification payload fixes, and nested home navigation fixes.
- [x] Applied migration `supabase/migrations/20260222182257_phase25_guard_visitor_entry_rls_alignment.sql` to add guard-scoped visitor-pass and notification RLS helpers/policies.
- [x] Applied follow-up migration `supabase/migrations/20260222182327_phase25_guard_visitor_insert_policy_fix.sql` to correct insert policy unit/community qualification.
- [x] Applied migration `supabase/migrations/20260222184534_phase25_guard_profiles_read_scope.sql` to allow guard-scoped resident profile reads required by unit-host lookups.
- [x] Applied migration `supabase/migrations/20260222193112_phase25_guard_profile_sync_on_users.sql` to auto-sync `users.role='guard'` into `guards` and backfill missing guard profiles (`12` rows recorded in `public.datafix_phase25_guard_profile_backfill_backup` with `cleanup_tag = phase25_guard_profile_backfill_20260222`).
- [x] Completed Guard Guest Entry flow remediation (`guestEntryScreen`, `cabEntryScreen`, `deliveryEntryScreen`, `serviceEntryScreen`, `flatNoScreen`, `flatNoTab`, `entryConfirmationScreen`, `ringingScreen`) with required-field validation, ISO time propagation, and deterministic unit/host pass-through.
- [x] Added canonical walk-in pass artifact generation (`entry_code`, `qr_code_data`) for all guard-created visitor types via `/Users/andromeda/casanirvana/apps/guard-mobile/services/visitorPassArtifacts.js` and hooked into create flows (`useVisitorPasses`, `useCabEntries`, `useDeliveryEntries`, `useServiceEntries`).
- [x] Updated Guard approval screen to display persisted entry code/QR payload from DB instead of local random code generation.
- [x] Applied migration `supabase/migrations/20260222190401_phase25_walkin_entry_artifacts_backfill.sql` to backfill legacy walk-in pass artifacts (`entry_code` + `qr_code_data`) with reversible backup table `public.datafix_phase25_walkin_pass_artifacts_backup` (`cleanup_tag = phase25_walkin_entry_artifacts_backfill_20260222`).
- [x] Completed Guard auth/bootstrap hardening from splash to home: rebuilt `/Users/andromeda/casanirvana/apps/guard-mobile/contexts/GuardAuthContext.js` (guard-only + active + community-scoped session hydration), made `/Users/andromeda/casanirvana/apps/guard-mobile/screens/splashScreen.js` auth-aware, and fixed progress-safe submit behavior in `/Users/andromeda/casanirvana/apps/guard-mobile/screens/auth/emailLoginScreen.js` and `/Users/andromeda/casanirvana/apps/guard-mobile/screens/auth/registerScreen.js`.
- [x] Replaced phone OTP placeholder flow with real Supabase verification/resend in `/Users/andromeda/casanirvana/apps/guard-mobile/screens/auth/verificationScreen.js` and routed success back through splash-auth decision.
- [x] Wired home header identity and unread notification badge to DB-backed guard/apps/resident-mobile/community state (`/Users/andromeda/casanirvana/apps/guard-mobile/screens/homeScreen.js` + realtime count subscription) and removed hardcoded `Kwame Mensah / Gate A / Casa Nirvana` placeholder values.
- [x] Completed Guard Notifications module production wiring: replaced mock notification list/detail runtime with DB-backed inbox + realtime sync (`/Users/andromeda/casanirvana/apps/guard-mobile/screens/notificationScreen.js`, `/Users/andromeda/casanirvana/apps/guard-mobile/screens/notificationDetailScreen.js`, `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useNotifications.js`), and aligned unread-state source to `read_at` for home badge consistency.
- [x] Added robust Supabase env fallback resolution in `/Users/andromeda/casanirvana/apps/guard-mobile/utils/supabase.js` (`expoConfig.extra` -> `process.env`) to reduce runtime config drift.
- [x] Build check passed for this slice via `npx expo export --platform android` in `/Users/andromeda/casanirvana/apps/guard-mobile`.
- [x] Completed Guard In/Out module remediation: added lightweight status count hook (`/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useVisitorPassCounts.js`), rewired `/Users/andromeda/casanirvana/apps/guard-mobile/screens/inOutScreen.js`, and standardized checked-in/checked-out list payload mapping via `/Users/andromeda/casanirvana/apps/guard-mobile/services/inOutPassMapper.js`.
- [x] Removed In/Out list inconsistencies (checked-out error rendering bug, static phone fallbacks, unsafe duration math) in `/Users/andromeda/casanirvana/apps/guard-mobile/components/checkedInTab.js` and `/Users/andromeda/casanirvana/apps/guard-mobile/components/checkedOutTab.js`.
- [x] Optimized visitor host attribution by replacing per-pass N+1 queries with batched `profiles` lookup in `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useVisitorPasses.js`.
- [x] Polished visitor detail UX for In/Out lifecycle: actual exit time now appears only after check-out; scheduled window and actual movement timestamps are separated in `/Users/andromeda/casanirvana/apps/guard-mobile/screens/visitorDetailScreen.js`.
- [x] Build check passed for In/Out slice via `npx expo export --platform android` in `/Users/andromeda/casanirvana/apps/guard-mobile`.
- [x] Hardened Guard auth session persistence in `/Users/andromeda/casanirvana/apps/guard-mobile/utils/supabase.js` using AsyncStorage-backed Supabase auth (`persistSession`, `autoRefreshToken`, app-state refresh handling) so guard users stay signed in across app restarts.
- [x] Added stable Guard dev-start scripts in `/Users/andromeda/casanirvana/apps/guard-mobile/package.json` (`start:dev`, `start:tunnel`) to reduce manual reload friction while iterating in Expo Go.
- [x] Build check passed for session persistence + dev-loop updates via `npx expo export --platform android --output-dir dist-test-session-persist` in `/Users/andromeda/casanirvana/apps/guard-mobile`.
- [x] Fixed In/Out lifecycle split inconsistency by enforcing checked-in query guardrails (`status='checked_in'` + no exit timestamps), expanding checked-out query to include timestamp-backed exits, and aligning counters in `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useVisitorPasses.js` and `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useVisitorPassCounts.js`.
- [x] Applied DB datafix for legacy lifecycle drift (rows marked `checked_in` with exit timestamps): backed up affected rows to `public.datafix_phase25_checked_in_exit_repair_backup` (`backup_tag = phase25_checked_in_exit_repair_20260222`) and normalized them to `status='checked_out'` with `checked_out_at` populated.
- [x] Removed manual time pickers from all 4 guard walk-in entry modules (`guestEntryScreen`, `cabEntryScreen`, `deliveryEntryScreen`, `serviceEntryScreen`) and related param plumbing (`flatNoTab`, `entryConfirmationScreen`, `ringingScreen`) so entry timestamps are auto-recorded at approval/create time.
- [x] Build check passed for In/Out + time-input removal pass via `npx expo export --platform android --output-dir dist-test-inout-time-removal` in `/Users/andromeda/casanirvana/apps/guard-mobile`.
- [x] Completed Guard Chats module production alignment pass:
  - Replaced static/random chat data sources in `/Users/andromeda/casanirvana/apps/guard-mobile/components/chatsTab.js` and `/Users/andromeda/casanirvana/apps/guard-mobile/screens/searchScreen.js` with DB-backed conversation + directory sources.
  - Hardened `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useMessages.js` to canonical message payloads (`message_type`, `attachments`, `read/is_read`, `message_status`) and realtime invalidation for both thread + conversations.
  - Aligned `/Users/andromeda/casanirvana/apps/guard-mobile/screens/messageScreen.js` attachment uploads to `chat-attachments` owner-scoped paths and added automatic read-receipt marking for incoming messages.
  - Removed stale Guard call-cache invalidation dependency on deprecated `chatEnhancements` key in `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useCalls.js`.
- [x] Completed Guard Alerts list remediation:
  - Replaced mock emergency feed with DB-scoped query/subscription in `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useEmergencyAlerts.js`.
  - Rebuilt `/Users/andromeda/casanirvana/apps/guard-mobile/screens/emergencyScreen.js` with In/Out-style production card layout (status filters, summary counters, unit/type/reporter/time metadata, and detail payload mapping).
- [x] Completed Guard emergency detail lifecycle actions:
  - Wired `/Users/andromeda/casanirvana/apps/guard-mobile/screens/emergencyDetailScreen.js` action buttons to real DB transitions (`active`, `investigating`, `resolved`) with confirmation/error handling and timeline/status refresh.
  - Extended `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useEmergencyAlerts.js` with mutation support and `resolved_at/resolved_by` contract propagation.
  - Applied migration `supabase/migrations/20260222214458_phase25_guard_emergency_alert_update_policy.sql` to add guard-scoped `SELECT`/`UPDATE` policies on `public.emergency_alerts`.
- [x] Replaced Guard emergency action native alerts with branded in-app modal UX in `/Users/andromeda/casanirvana/apps/guard-mobile/screens/emergencyDetailScreen.js` (confirm + success/error states for `contact admin`, `acknowledge`, `investigating`, `resolved`).
- [x] Wired Guard `contact admin` emergency escalation flow:
  - Added admin fan-out dispatch from `/Users/andromeda/casanirvana/apps/guard-mobile/screens/emergencyDetailScreen.js` via `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useEmergencyAlerts.js`.
  - Escalation now writes canonical admin notifications (`notifications`) and recipient audit rows (`emergency_alert_recipients`) for the current incident.
  - Applied migration `supabase/migrations/20260222215502_phase25_guard_emergency_recipient_notify_policy.sql` to allow guard-scoped recipient audit inserts.
- [x] Fixed Guard emergency admin-notify RLS blocker:
  - Hardened recipient resolution in `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useEmergencyAlerts.js` to include only profiles mapped to valid `users.id` rows before insert.
  - Applied migration `supabase/migrations/20260222220109_phase25_guard_notify_user_profile_fallback.sql` to expand `guard_can_notify_user(uuid)` community resolution with profile fallback when `users.community_id` is null.
- [ ] Complete end-to-end Guard runtime QA/signoff (Residents/Directory behavior, guard operations scope, settings/profile flows). The implementation wiring itself is complete per `/Users/andromeda/casanirvana/apps/guard-mobile/SCREEN_WIRING_CHECKLIST.md`.

## Phase 26 - Guard Profile + Settings Persistence Hardening
- [x] Added shared profile resolver utility `/Users/andromeda/casanirvana/apps/guard-mobile/utils/profileResolver.js` for `profiles.user_id` -> `profiles.id` fallback-safe resolution.
- [x] Added Guard settings persistence service `/Users/andromeda/casanirvana/apps/guard-mobile/services/settingsPersistenceService.js` (app preferences in `profiles.preferences`, notification/chat payloads in `chat_settings.app_info_preferences`).
- [x] Wired `/Users/andromeda/casanirvana/apps/guard-mobile/screens/settingScreen.js` to authenticated guard identity data, persisted toggle writes (dark/biometric), dialer-based quick contacts, and real auth signout.
- [x] Wired `/Users/andromeda/casanirvana/apps/guard-mobile/screens/languageScreen.js` language updates to persisted profile preference writes.
- [x] Wired `/Users/andromeda/casanirvana/apps/guard-mobile/screens/notificationSettingsScreen.js` to DB-backed load/save (removed UI-only placeholder behavior).
- [x] Wired `/Users/andromeda/casanirvana/apps/guard-mobile/screens/chatSettingsScreen.js` to DB-backed load/save and reset-to-defaults contract (removed mock storage/history side-effects).
- [x] Wired `/Users/andromeda/casanirvana/apps/guard-mobile/screens/editProfileScreen.js` to real `users`/`guards` hydration and update writes, including avatar upload + `refreshGuardProfile` refresh.
- [x] Enforced Guard call policy split by actor type: residents/hosts route in-app with profile-scoped call records (`/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useCallManager.js` + `callScreen` callers), while visitor/guest/cab/delivery/service contacts use direct dial from `/Users/andromeda/casanirvana/apps/guard-mobile/screens/visitorDetailScreen.js`.
- [x] Applied migration `supabase/migrations/20260222224130_phase26_guard_profile_update_policy.sql` to allow guard-owned `public.guards` updates (`USING/WITH CHECK user_id = auth.uid()`).
- [ ] Manual runtime QA pending for Guard settings/profile flows (`settingScreen`, `languageScreen`, `notificationSettingsScreen`, `chatSettingsScreen`, `editProfileScreen`).

## Phase 27 - ExpressPay Gateway Foundation
- [x] Added canonical payment-gateway architecture lock doc: `/Users/andromeda/casanirvana/EXPRESSPAY_INTEGRATION_BLUEPRINT.md` (hosted checkout first, verification contract, security guardrails).
- [x] Updated onboarding/playbook references for gateway standard (`/Users/andromeda/casanirvana/NEW_ENGINEER_QUICKSTART.md`, `/Users/andromeda/casanirvana/PRODUCTION_READINESS_PLAYBOOK.md`).
- [x] Applied migration `supabase/migrations/20260227153916_phase27_expresspay_secure_gateway_config.sql`:
  - Created `public.payment_gateway_configs` (community/global scope, test/live mode, secret refs, RLS + grants).
  - Seeded disabled global `expresspay` rows (`test`, `live`) with hosted-checkout defaults.
  - Removed permissive legacy `app_settings` authenticated-all/read-all policies and added explicit admin/service-role policies.
- [x] Implemented backend ExpressPay orchestration contract:
  - Service: `/Users/andromeda/casanirvana/apps/api/src/services/expresspay.ts`
  - Controller: `/Users/andromeda/casanirvana/apps/api/src/controllers/expresspay.ts`
  - Routes: `/Users/andromeda/casanirvana/apps/api/src/routes/expresspay.ts`
  - Mounted in `/Users/andromeda/casanirvana/apps/api/src/app.ts`
  - Validation schemas added in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`
  - Env template updated in `/Users/andromeda/casanirvana/apps/api/.env.example`
- [x] Backend lint + build checks passed for this slice (`eslint` on touched files + `npm run build` in `/Users/andromeda/casanirvana/apps/api`).
- [x] Applied migration `supabase/migrations/20260227161950_phase27_vault_secret_helper_rpcs.sql` to add backend-only Vault helper RPCs (`p27_upsert_vault_secret`, `p27_read_vault_secret`, `p27_read_vault_secret_by_id`).
- [x] Added backend admin ExpressPay secure-config endpoints:
  - `GET /admin/payment-gateways/expresspay/config`
  - `PUT /admin/payment-gateways/expresspay/config`
  - `POST /admin/payment-gateways/expresspay/test`
  - Files: `/Users/andromeda/casanirvana/apps/api/src/services/adminPaymentGateway.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/adminPaymentGateway.ts`, route wiring in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`.
- [x] Rewired superadmin payment gateway page ExpressPay block to secure admin backend flow (no plaintext secret writes to `app_settings`):
  - Added `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useExpressPayGatewayConfig.ts`
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/payment/gateways/page.tsx` to:
    - load/save/test ExpressPay through new admin endpoints,
    - stop persisting `expresspay_*` keys through legacy `app_settings` upsert path,
    - show configured-secret status flags and connection test feedback.
- [x] Targeted lint/build checks passed for this pass:
  - backend: `eslint` on changed files + `npm run build`
  - superadmin: `npm run lint -- --file src/app/(admin)/settings/payment/gateways/page.tsx --file src/hooks/useExpressPayGatewayConfig.ts`
- [x] Wired user app payment-method screens to backend ExpressPay endpoints (no direct client-side `payments` inserts for checkout):
  - Added `/Users/andromeda/casanirvana/apps/resident-mobile/services/expressPayService.js` with authenticated `initiate`, `verify`, `status`, and reconciliation helpers.
  - Updated `/Users/andromeda/casanirvana/apps/resident-mobile/screens/mobileMoneyScreen.js` to:
    - initiate in-app mobile-money checkout through backend `POST /payments/expresspay/initiate`,
    - use ExpressPay Merchant Direct flow (no external browser handoff),
    - poll and reconcile status via backend `verify/status`,
    - route completed payments into `successScreen`,
    - keep personal-hub transaction rows linked by `payment_ref_id` and update terminal states (`completed`/`failed`) without client-side success simulation.
  - Updated `/Users/andromeda/casanirvana/apps/api/src/services/expresspay.ts` to run direct mobile-money orchestration through `direct/submit.php` + `checkout.php`, while card remains on the hosted-checkout path pending PCI-scope review.
  - `/Users/andromeda/casanirvana/apps/resident-mobile/screens/paypalScreen.js` remains available in code but is now intended to stay disabled via payment-method policy until future rollout.
- [x] Applied hotfix migration `supabase/migrations/20260227165429_phase27_admin_roles_rls_recursion_fix.sql` to remove recursive legacy RLS policies:
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
  - Migration `supabase/migrations/20260301104546_phase28_payment_domain_rebuild.sql` created `payment_obligations`, extended `payments` with source-aware ledger fields, backfilled legacy pending rows, and normalized currency/provider fields.
  - Added backend ledger feeds for user + admin (`/payments/obligations`, `/payments/history`, `/payments/statements`, `/payments/transactions/initiate`, `/admin/payments/transactions`, `/admin/payments/obligations`, `/admin/payments/statements`).
  - User payment feeds now read backend ledger APIs instead of raw Supabase table assumptions.
- [x] Phase 28 payment UI alignment pass completed:
  - User payment entry/success flows now propagate `sourceType`, `sourceId`, and `obligationId` consistently across `paymentMethodScreen`, `mobileMoneyScreen`, `creditCardScreen`, `reviewPayScreen`, and `successScreen`.
  - Superadmin payment detail sidebar now reads real obligations for “Open Payment Obligations” instead of misclassifying transaction rows as pending dues.
  - Core superadmin payment cards/details now display `GH₵` formatting and recognize `initiated` / `processing` / `cancelled` / `expired` transaction states.
- [x] Phase 30 payment charge management foundation implemented:
  - Added migration `supabase/migrations/20260301194127_phase30_payment_charge_management.sql` to source-control the new billing-control schema already applied in Casa Nirvana (`payment_charge_templates`, `payment_charge_template_targets`, `payment_charge_runs`, and extended `payment_obligations` invoice fields).
  - Backend now exposes admin charge-management APIs for catalog, template CRUD, preview, issue, run history, and manual scheduled-run execution (`/admin/payment-charges/*`).
  - Superadmin now has a new operational page at `/payments/charges` with the full fee/charge catalog, agency/community-scoped template management, preview-and-issue workflow, and run/invoice visibility.
  - New charge runs materialize directly into `payment_obligations`, so issued community charges flow into the user app `Pending` tab without extra client-side wiring.
  - Added API-key protected internal automation endpoint `POST /internal/payment-charges/run-due` so scheduled billing runs can be triggered by production cron infrastructure without an authenticated browser session.
  - Normalized the Payments information architecture in superadmin: sidebar children are now `Overview`, `Payments`, `Invoices`, and `Payouts`; the `/payments/charges` workspace is tabbed (`Templates`, `Issue Payments`, `Issued Charges`, `Runs`), `/payments/invoices` is live, and `/payments/payouts` is ready for live payout data.
- [x] Phase 31 payout foundation implemented:
  - Added migration `supabase/migrations/20260301220953_phase31_payouts_foundation.sql` and applied it to the live Casa Nirvana database: `payments` now stores payout-classification snapshot fields, and the new payout tables exist (`payout_rules`, `payout_destinations`, `payout_requests`, `payout_request_items`, `payout_request_events`, `payout_ledger_entries`).
  - Backend now classifies completed settled payments into Community Hub vs Personal Hub, computes payout eligibility snapshots, and writes `credit_available` payout ledger entries during normal payment settlement side effects.
  - Backend now exposes admin payout APIs for summary, eligible revenue, destinations, rules, payout requests, and payout-request lifecycle actions under `/admin/payouts/*`.
  - Superadmin `/payments/payouts` is now wired to real backend data with tabbed sections for `Overview`, `Requests`, `Destinations`, and `Rules`.
- [x] Phase 32 payout hardening + automation completed:
  - Added migration `supabase/migrations/20260302082140_phase32_payout_rls_hardening.sql` and applied it live: payout tables now have function-based scoped read policies for authenticated agency managers/superadmin and service-role full access only; no direct authenticated writes bypass the backend.
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
  - SMTP settings are now backend-mediated through `/admin/settings/smtp`; browser writes to `app_settings` were removed from the SMTP flow, sensitive values are masked on read, and connection tests now run real SMTP authentication (`nodemailer.verify`) with password-required checks when host/username changes.
  - Push/SMS test endpoints now enforce fresh secret re-entry when provider identity fields change (for example host/project/provider/account changes), preventing false-positive “success” checks that reused stale masked credentials.
  - Integration settings are now backend-mediated through `/admin/settings/integrations`; browser writes to `app_settings` were removed from the integrations flow, sensitive values are masked on read, and test actions now run deterministic server-side validation instead of simulated success/failure.
  - Added secure backend settings controller/service for SMTP + integrations (`apps/api/src/controllers/adminSecureSettings.ts`, `apps/api/src/services/adminSecureSettings.ts`) and the supporting validation schemas/routes.
  - Added shared authenticated superadmin admin-API helpers (`apps/superadmin/src/hooks/useAdminApi.ts`) and replaced duplicated direct-fetch logic in the affected settings hooks.
  - Application settings cleanup started without changing the existing visual design: `/settings/app`, `/settings/app/splash`, `/settings/app/onboarding`, and `/settings/app/urls` now load/save via backend-managed `system_settings` using the new shared `useSettingsCategory` hook, replacing simulated saves while preserving the current tabs/cards/layout.
  - Production defaults in the legacy application settings flow were normalized to the current product direction (`Community`, `Africa/Accra`, `GHS`, `GH₵`) instead of older legacy placeholders.
- [x] Phase 33 application-settings continuation completed:
  - `/settings/app/extensions` now preserves the existing visual layout while using backend-managed `system_settings` (`application/extensions`) instead of simulated saves.
  - Extension install/uninstall/enable actions now persist real configuration changes instead of only mutating local UI state.
  - The extension inventory and marketplace defaults were aligned with the current platform direction (`ExpressPay Gateway Connector`, notification routing, backup) and outdated legacy provider examples were removed.
- [x] Phase 33 communications continuation completed:
  - `/settings/email/templates` now uses backend-managed `system_settings` (`email_templates`) through the shared settings pattern instead of direct browser writes to `app_settings`.
  - `/settings/email/notifications` now uses backend-managed `system_settings` (`email_notifications`) through the shared settings pattern instead of direct browser writes to `app_settings`.
  - The existing tabs/cards/layout were preserved while the underlying persistence was normalized, and legacy defaults were aligned to the current product direction (`Africa/Accra`, current communication defaults, non-legacy language options).
- [x] Phase 33 notification-settings continuation completed:
  - `/settings/notifications/push` now uses secure backend admin routes (`/admin/settings/push`) for load/save/test, replacing the previous fake test action while preserving the existing page layout.
  - `/settings/notifications/sms` now uses secure backend admin routes (`/admin/settings/sms`) for load/save/test, removing direct browser writes to `app_settings`, replacing simulated test behavior, and aligning legacy defaults to the Ghana production scope (`+233`).
  - `/settings/notifications/in-app` now uses backend-managed `system_settings` (`notifications/in_app`) through the shared settings pattern instead of writing directly to the legacy `in_app_notification_settings` table.
  - `/settings/notifications/rules` now keeps the current rules/grid/tabs UI but persists rule definitions through backend-managed `system_settings` (`notification_rules/definitions`) instead of local-only mock state.
- [x] Phase 33 payment-settings continuation completed:
  - `/settings/payment/gateways`, `/settings/payment/methods`, and `/settings/payment/fees` now preserve the existing visual layout while loading/saving through backend admin routes instead of direct browser writes to `app_settings`.
  - Added backend-managed payment settings endpoints for the legacy payment settings cluster: `/admin/settings/payment-gateways`, `/admin/settings/payment-methods`, and `/admin/settings/payment-fees`.
  - Server-side saves now mirror these categories to both `system_settings` (canonical admin path) and the legacy `app_settings` categories needed by existing payment runtime services, so settings changes remain production-safe without breaking the current payment flows.
  - `/settings/payment/fees` was cleaned up to remove stale UPI placeholders and align fee labels/icons with the current Ghana production scope (`GH₵`, `ExpressPay`, `PayPal (Deferred)`).
- [x] Phase 33 platform/general/system continuation completed:
  - `/settings/general/business`, `/settings/general/regional`, `/settings/general/security`, and `/settings/general/system` now keep their existing cards/forms/layout while loading and saving through backend admin routes instead of direct browser writes to `app_settings`.
  - Added backend-managed settings endpoints for the remaining general/platform settings cluster: `/admin/settings/business`, `/admin/settings/regional`, `/admin/settings/security-privacy`, and `/admin/settings/general-system`.
  - Server-side saves now write to namespaced `system_settings` keys (to avoid key collisions in the shared settings table) while mirroring the legacy `app_settings` categories required by older runtime code, preserving compatibility without exposing client-side writes.
  - Regional/business defaults were normalized to the current Ghana production scope (`Africa/Accra`, `GHS`, `GH₵`, Ghana-friendly format labels) while preserving the current UI.
  - `/settings/system/settings` kept the same visual layout but no longer simulates fake live metrics with random updates, and shortcut actions now report their real integration status instead of claiming successful backend operations that do not exist.
- [x] Phase 33 admin-settings continuation completed:
  - `/settings/admin/security` now keeps its current tabs/cards UI while loading and saving through backend-managed `system_settings` (`security/admin_security`) instead of the legacy `/admin/settings` catch-all blob.
  - Admin security actions that were previously fake browser alerts now report their real integration status without claiming backend operations that do not exist.
  - `/settings/admin/users` no longer performs an unnecessary legacy settings fetch just to render the page, reducing dependency on the old settings path while keeping the existing UI intact.
- [x] Phase 33 language-settings continuation completed:
  - `/settings/language/default`, `/settings/language/localization`, and `/settings/language/translations` now keep their current tabs/cards/forms UI while loading and saving through backend-managed `system_settings` (`localization/default_language`, `localization/regions`, and `localization/translations`) instead of simulated local-only saves.
  - Default language and localization defaults were aligned to the current Ghana production scope (`Africa/Accra`, `GHS`, `GH₵`, `en-GH`, Ghana-first region and currency options) while preserving the existing visual layout.
  - Translation export remains live, while the unfinished import action now reports its real integration status instead of acting like a finished workflow.
- [x] Phase 33 user-settings continuation completed:
  - `/settings/users` now keeps the current user-management workspace UI while loading and saving its configuration block through backend-managed `system_settings` (`users/configuration`) instead of direct browser writes to `app_settings`.
  - `/settings/users/permissions` no longer falls back to in-page mock permissions; it now uses live permission records only, with real derived statistics and normalized permission fields (`isSystemPermission`, `roleCount`) from the permissions data source.
  - `/settings/users/groups` no longer falls back to hardcoded mock groups; when statistics are unavailable it now derives honest totals from the live groups list and shows a truthful warning instead of claiming cached fallback data.
- [x] Phase 33 guard-settings continuation completed:
  - `/settings/guards` now keeps its existing tabs/cards/dashboard layout while using honest live data instead of hardcoded overview fallbacks for activity, staffing, and alert states.
  - `useGuardSummary` now computes `pendingAssignments` from real `guard_assignments` records, so assignment gaps reflect actual unassigned active guards instead of a placeholder constant.
  - `useGuardPerformanceTrends` now uses real training completion percentages instead of random values, and `useGuardShiftTrends` provides live 30-day duty/overtime trend data for the analytics view.
  - `useRecentGuardActivities` no longer mutates `Date.prototype`, and the activity feed now sorts by real timestamps while showing an honest empty state when no records exist.
  - `useGuardsStats` no longer reports fake average rating/experience placeholders; it now derives those values from live `guard_performance` and `employment_date` data where available.
  - Guard subpage data hooks no longer inject fake fallback identity values: new assignments do not write a dummy emergency number, displayed assignments no longer show a fake phone fallback, and new performance reviews no longer store a hardcoded placeholder reviewer UUID.
- [x] Phase 33 community-settings continuation completed:
  - `/settings/communities/services` now keeps its current cards, tabs, filters, and modal layout while using real create/update/delete mutations instead of simulated timeout-based saves and deletes.
  - Community services now use `GHS` / `GH₵` defaults and labels in the settings workspace, removing the stale INR/rupee drift without changing the existing visual structure.
  - `/settings/communities/configuration` now saves through the live `useUpdateCommunityConfiguration` mutation instead of the broken in-page mock path, and the page no longer references the removed `setConfiguration` placeholder state.
  - Community configuration emergency contacts are now bound to the form and persist correctly, while the page shows honest success/error feedback and preserves the current modal-driven save flow.
  - Community configuration defaults were normalized away from fake India-specific fallback data (`+91`, hardcoded GST placeholder values) toward honest empty or Ghana-aligned defaults while preserving the existing UI.
- [x] Phase 33 community-finance continuation completed:
  - `/settings/communities/finance` now uses the real `community_financial_records` table for transaction creation instead of the broken legacy `society_financial_records` reference.
  - The current finance workspace UI is preserved, but hardcoded community IDs (`com-001` / `com-002`) were replaced with live community options in filters and forms.
  - `Add Income` and `Add Expense` quick actions now open the live transaction modal with preselected types instead of dead mock modals.
  - Finance currency labels and previews were normalized to `GHS` / `GH₵`, `UPI` labels were replaced with `Mobile Money`, and reminder/report previews now reflect live financial totals instead of static rupee placeholders.
  - The finance charts now derive trend and breakdown data from live financial and budget records instead of static demo series.
- [x] Phase 33 community-units continuation completed:
  - `/settings/communities/units` now uses a single real create/edit modal, removing the incomplete duplicate edit modal while preserving the existing visual layout and full form fields.
  - The units workspace now shows maintenance and related financial values in `GHS` / `GH₵`, removing stale rupee/dollar formatting drift without changing the existing cards, tables, or grid UI.
  - Create and edit actions now reset and close cleanly through one shared modal flow, preventing stale form state from leaking between operations.
  - Unit transformation now respects real unit schema fields (`deposit_amount`, `description`, `balconies`) and preserves live unit statuses instead of collapsing everything non-occupied into `vacant`.
- [x] Phase 33 remaining community-settings pages completed:
  - `/settings/communities` now uses live community, unit, amenity, service, staff, and document hooks for overview metrics, activity, analytics, and management shortcuts instead of stale mock dashboard content, while preserving the current tabs, cards, and chart layout.
  - `/settings/communities/staff` now uses live community filter options and staff-derived tenure metrics, removes debug logging, and keeps the current staffing workspace intact while replacing hardcoded community options.
  - `/settings/communities/amenities` now keeps the current amenities UI but removes the last stale rupee formatting drift in revenue cards, lists, and charts, aligning visible financial labels to `GHS` / `GH₵`.
  - `/settings/communities/documents` now resolves community names from live community profiles for filters, tables, and forms, and the search path is null-safe for optional title/category/tag fields while preserving the current document workspace layout.
  - `/settings/communities/profiles` now uses Ghana-aligned postal and region defaults, replaces stale dollar labels with `GHS` / `GH₵`, and removes India-specific state and copy drift while keeping the existing profile cards and create/edit modal structure.
- [x] Phase 33 agency-settings core flows completed:
  - `/settings/agencies` now uses honest live-derived summary metrics and activity content from real agency records instead of stale hardcoded finance placeholders, while preserving the current dashboard cards and charts layout.
  - `/settings/agencies/configuration` now initializes from Ghana-aligned defaults when no saved config exists, and nested configuration forms now persist correctly through the flattened DB transform instead of silently dropping nested values.
  - `/settings/agencies/profiles` removed dead mock agency data, switched region defaults to Ghana regions, and normalized the key analytics cards away from static rupee placeholders to live `GHS` / `GH₵` values.
  - Agency profile create/edit modal flows now reset cleanly through shared helpers, and geography/top-performer sections no longer show static India-specific placeholder content.
- [x] Phase 33 agency-settings operational flows completed:
  - `/settings/agencies/services` now uses real create/update/delete mutations with honest success/error feedback, maps the edit form to the live agency-service schema, and uses `GHS` / `GH₵` formatting without changing the existing cards, tables, filters, or modal layout.
  - `/settings/agencies/finance` now creates agency transactions through the real mutation path, resolves live agency IDs before saving billing or transaction records, and uses `GHS` / `GH₵` formatting across overview cards, tables, reports, and forms while preserving the current workspace UI.
  - `/settings/agencies/staff` no longer injects fake fallback staff records or analytics; it now derives recent hires, department distribution, hiring trends, performance buckets, and salary analytics from live staff data while keeping the current tabs, charts, and cards structure intact.
- [x] Phase 33 agency-documents continuation completed:
  - `/settings/agencies/documents` now keeps its existing tabs, cards, tables, and modal layout while using a corrected live documents hook instead of the broken hardcoded-agency implementation.
  - Agency document create/update flows now require a real agency profile, reuse the live agency ID, and show honest page-level success/error feedback without relying only on toast notifications.
  - Agency document storage and retention cost displays now use `GHS` / `GH₵`, and the document hook no longer references invalid archive/download fields that are not present in the live `agency_documents` schema.
- [x] Phase 33 platform-launcher cleanup completed:
  - `/settings/general` now preserves the current navigation-card UI while removing misleading hardcoded numeric badges; the cards now describe live settings workspaces instead of claiming fake counts.
  - `/settings/system` now keeps the existing route-launcher layout but uses a consistent page title and honest copy aligned to the live system overview and settings workspaces.
  - Removed stale duplicate settings artifacts that were no longer part of the active settings flow: `page.tsx.new`, `page_new.tsx`, and `page-new.tsx` variants under admin/security, app/splash, and general/integrations.
- [x] Phase 33 tenant-settings IA cleanup completed:
  - The Settings menu now exposes a single `Tenant Configuration` group instead of operational `Guard Settings`, `Community Settings`, and `Agency Settings` workspaces.
  - Added `/settings/guards/configuration` as the new config-only tenant page, using backend-managed settings persistence while preserving the current settings UI patterns.
  - Legacy operational guard, community, and agency settings routes were converted into branded relocation shells that point users to the correct operational modules and back to the surviving config-only settings pages.
- [x] Phase 33 identity-access IA cleanup completed:
  - The Settings menu now uses a single `Identity & Access` group instead of split `Admin Settings` and `User Settings` menu clusters.
  - `User Management`, `User Profiles`, `Roles Management`, and `Permissions` routes under `/settings/users/*` are now relocation shells that point to the canonical operational or access-policy workspaces, removing redundant policy paths from Settings.
  - The surviving identity pages now use consistent `Identity & Access` labeling, and `User Preferences` is presented as `User Defaults` to keep the settings layer configuration-only.
- [x] Phase 33 settings-route closeout completed:
  - Legacy aggregate launchers `/settings/app` and `/settings/system` were converted into configuration-safe relocation shells that point to canonical subpages (`/settings/app/splash`, `/settings/app/urls`, `/settings/system/overview`, `/settings/system/settings`).
  - This removes duplicate aggregate configuration surfaces while preserving backward-compatible route access for existing links.
- [x] Phase 33 settings UX hardening continuation completed:
  - `/settings/users/groups` no longer shows a placeholder members modal; it now loads real group members from `group_members` + `profiles` and renders live member details with loading/error/empty states.
  - `/settings/users/activity` removed production-inappropriate debug console output and visible debug toggles/panels while preserving the existing activity monitoring UI and filters.
  - `useUserGroups` removed development logging noise and now keeps the same fallback behavior with cleaner production error handling.
- [x] Phase 33 auth token refresh race hardening completed:
  - NextAuth Supabase refresh flow now de-duplicates in-flight refresh requests per refresh token and applies a short retry backoff for one-time token reuse race conditions (`Invalid Refresh Token: Already Used`) to prevent refresh storms.
  - JWT callback now stores/updates `accessTokenExpires` and refresh retry metadata, reducing repeated unnecessary refresh attempts under concurrent `/api/auth/session` requests.
- [x] Phase 33 notifications/settings cleanup continuation completed:
  - `/settings/notifications/rules` no longer seeds hardcoded sample rules; rule definitions now start from persisted settings only, and newly created rules use stable UUID-based IDs for production-safe management.
  - Settings navigation keys were normalized to be globally unique (`menu-items.ts`) to prevent duplicate key collisions between module menus and settings menus (notably notification setup/email entries).
  - This keeps the current UI/tabs intact while tightening config-only behavior and navigation stability.
- [x] Phase 33 general-settings cleanup continuation completed:
  - `/settings/general` quick-action buttons are now real navigation actions (`System Overview`, `Module Settings`) instead of non-functional controls.
  - `/settings/general/application` removed stale non-Ghana placeholders (`+91`, `Pvt Ltd`) and aligned defaults to current production context.
  - `/settings/general/system` replaced hardcoded fake runtime metrics with live configuration snapshot cards sourced from current form values.
  - `/settings/general/business` replaced static/fake insights (including `$` display drift) with policy snapshot cards derived from active business configuration values.
  - `/settings/general/regional` removed stale India-specific UI drift (`currency-rupee`, `UTC+5:30`, `GST (India)`, static compliance count) and now shows dynamic compliance/currency/timezone state with Ghana-aligned labels.
  - `/settings/general/integrations` normalized payment-gateway copy to avoid region-locked wording and keep integration descriptions production-neutral.
- [x] Phase 33 payment-settings cleanup continuation completed:
  - `/settings/payment/gateways` now uses Ghana-first currency options (`GHS` default) with corrected legacy currency labels (`INR` symbol fix), and removed India-specific bank placeholders (`State Bank of India`, `IFSC`) in favor of region-neutral banking copy.
  - `/settings/payment/gateways` action footer now has a single reset action (duplicate reset button removed) to keep the current UI cleaner without changing the existing card/tab layout.
  - `/settings/payment/methods` and `/settings/payment/fees` renamed `Net Banking` to `Online Banking` for region-neutral terminology and removed remaining rupee-specific icon usage in payment limits/cards.
- [x] Phase 33 communication + localization label normalization completed:
  - `/settings/email/notifications` now defaults notification timezone to `Africa/Accra` (schema + selector), with expanded global timezone options and no India-only default fallback.
  - `/settings/language/default` timezone labels were normalized to neutral UTC-based wording (`Dubai (UTC+04:00)`, `Kolkata (UTC+05:30)`) to remove ambiguous region-locked labels while preserving existing UI structure.
  - `/settings/general/regional` renamed GST UI copy to generic sales-tax wording (`Regional Sales Tax Mode`) while keeping the same persisted config field and existing settings layout.
- [x] Phase 33 notification-provider copy normalization completed:
  - `/settings/notifications/sms` normalized AWS region label from city-specific wording to neutral regional wording (`Asia Pacific (South Asia)`), and aligned provider sender placeholders to app-neutral values (`CASANV`).
  - `/settings/notifications/sms` provider info cards now use neutral coverage descriptions instead of region-locked phrasing, while preserving the existing tabs/cards/forms layout.
- [x] Phase 33 final timezone/currency label sweep completed:
  - `/settings/email/notifications` and `/settings/language/default` now use neutral UTC-based labels for `Asia/Kolkata` (`UTC+05:30 (South Asia)`) while preserving stored timezone values for backward compatibility.
  - `/settings/payment/gateways` and `/settings/language/default` now display `INR (₹)` with neutral currency-label wording to remove region-locked copy drift.
- [x] Phase 33 settings API runtime alignment completed:
  - Marked `/api/module-settings` and `/api/module-settings/communities` route handlers as explicit dynamic routes (`force-dynamic`) to align with `headers()`-based auth scope checks and remove recurring static-generation dynamic-usage warnings during build.
- [x] Phase 33 notification configuration route alignment completed:
  - `/notifications/settings` is now a relocation shell into canonical Settings notification pages (`/settings/notifications/rules`, `/settings/notifications/push`) to eliminate duplicate/fake configuration surfaces and enforce one production save path.
- [x] Phase 33 settings test-flow reliability alignment completed:
  - `/settings/general/integrations` now uses validation-first wording/status (`Validate Config`, `validated`, `invalid`) so the UI no longer implies guaranteed live provider connectivity for schema-only checks.
  - `/settings/payment/gateways` now clearly states that live credential validation is wired for ExpressPay only, and non-wired gateway test buttons are disabled (`Validation Pending`) instead of surfacing misleading pseudo-tests.
  - `/settings/notifications/push` and `/settings/notifications/sms` now explicitly indicate that setup tests validate configuration readiness while actual message delivery depends on provider/runtime conditions.
- [x] Phase 33 settings cleanup continuation completed:
  - Removed the unused duplicate notification-settings implementation (`/notifications/settings/components/NotificationSettingsView` and legacy hooks `useNotificationSettings`, `useChannelSettings`, `useAppSettings`) to prevent accidental fallback to direct browser writes against `app_settings`.
  - `/settings/communities/configuration` no longer hardcodes a single community UUID; it now loads configured communities dynamically and allows selecting the target community before editing configuration.
- [x] Phase 33 system-settings truthfulness cleanup completed:
  - `/settings/system/settings` no longer uses fake runtime metrics, fabricated health states, or non-wired backup/log/maintenance modals; the page now presents configuration health and configured thresholds derived from actual saved settings.
  - `/settings/system/settings` quick actions now navigate to real operational/configuration pages (`System Overview`, `Security Policies`, `Notification Rules`, `Integrations`) instead of pseudo-actions.
  - `/settings/system/settings` advanced tab now uses configuration snapshot content and deployment-secret guidance (no fake variable status timestamps), including explicit backend secret keys currently required for automation.
  - `/settings/system/overview` removed hardcoded trend deltas and dollar formatting in key metric cards; cards now use neutral live-count labels and `GH₵` currency formatting.
- [x] Phase 33 security + system-overview alignment continuation completed:
  - `/settings/admin/security` removed non-wired placeholder action flows and now routes all admin action buttons to canonical live workspaces (`/settings/admin/users`, `/settings/general/integrations`, `/settings/users/activity`, `/settings/system/overview`).
  - `/settings/system/overview` analytics chart now uses persisted performance datasets instead of hardcoded static series.
  - `/settings/system/overview` now sources health score, database size, backup size, uptime percentage, and response-time footer values from live system-overview records instead of fixed placeholders.
  - `/settings/system/overview` now uses `GH₵` in performance summary revenue and guards resource-usage progress bars against divide-by-zero totals.
- [x] Phase 33 translation-workspace wiring continuation completed:
  - `/settings/language/translations` import action is now wired to real JSON ingestion (array payload or settings object with `translations`), validates/normalizes rows, de-duplicates by key, and updates form state as a true dirty/saveable change instead of showing a non-wired alert.
  - Translation edit modal `Save Translation` now persists row edits back into the live field-array state with duplicate-key protection and proper form validation triggers.
  - `missing` language filter now correctly checks for missing values across enabled non-English languages instead of attempting to read a non-existent `translations['missing']` key.
- [x] Phase 33 activity-logs settings hardening continuation completed:
  - `useActivityLogs` no longer runs debug-only RPC probes (`get_my_role`, `test_rpc_function`) or verbose console dump logging in production paths.
  - Activity log loading now follows a clean fallback chain (`get_all_activity_logs` -> `admin_get_all_logs` -> direct `activity_logs` query) with shared filtering/pagination/date-range helpers to keep behavior deterministic.
  - `useActivityStats` removed debug logging noise while preserving the RPC-first and table-query fallback behavior for stats rendering.
- [x] Phase 33 community-settings hook hygiene continuation completed:
  - Removed noisy debug-console instrumentation from `useCommunityConfigurations` while preserving query/mutation behavior and cache invalidation.
  - Removed development logging from community document and finance helper hooks used by settings workspaces (`useCommunityDocuments`, `useCreateCommunityDocument`, `useUpdateCommunityDocument`, `useDeleteCommunityDocument`, `useBudgetItems`, `useCreateFinancialRecord`) to keep production logs clean and signal-focused.
- [x] Phase 33 settings-hook logging cleanup continuation completed:
  - Removed verbose debug logging from `useEmailNotificationSettingsAdvanced` while keeping default fallback behavior and save/invalidate flows unchanged.
  - Removed realtime subscription debug logs from `useAgencyConfigurationsRealtime`; subscription behavior remains unchanged with clean cache invalidation on updates.
- [x] Phase 33 notification-email settings persistence alignment completed:
  - `useEmailNotificationSettingsAdvanced` no longer depends on direct writes to `email_notification_settings`; it now uses the canonical backend-managed `system_settings` path via `useSettingsCategory` under `notifications_email_advanced`.
  - Preserved existing settings UI behavior and field coverage while standardizing load/save semantics with the rest of the settings stack.
- [x] Phase 33 identity/settings production hardening continuation completed:
  - Removed debug/dev console instrumentation from key identity and admin settings hooks (`useUserRoles`, `useUserPermissions`, `useUserProfiles`, `useListStaff`, `useFinancialRecords`, `useUpdateFinancialRecord`, `useDeleteFinancialRecord`) while preserving live query/mutation behavior and cache invalidation.
  - Removed remaining demo mutation simulation in `useResidents` create/update/delete flows; failed DB operations now return real errors instead of fake-success fallback responses.
  - Superadmin production build revalidated after this slice (`npm run build` in `/superadmin` passed).
- [x] Phase 33 notification/config hygiene continuation completed:
  - Removed remaining debug realtime/analytics logging from notification and tenant-support hooks (`useSmsNotifications`, `useCommunityProfiles`, `useGuardAssignments`, `useGuardPerformance`, `useGuardSchedules`).
  - Hardened `useChatSettings` user resolution for production by removing the test-user fallback and requiring a valid authenticated user (or explicit `userId`) before reads/writes.
  - Superadmin production build revalidated after this slice (`npm run build` in `/superadmin` passed).
- [x] Phase 33 residents/settings data-integrity continuation completed:
  - `useResidents` no longer injects sample/mock resident data on query failures or empty results; list/detail/community/unit queries now return live DB-driven results and surface true errors for operational handling.
  - `useResidents` single-resident lookup now returns `null` only for a real not-found (`PGRST116`) case instead of silently substituting sample profiles.
  - Removed remaining debug submit logging from the legacy settings unit form component (`/settings/communities/units/components/UnitAdd_Enhanced.tsx`) and revalidated superadmin build/lint for changed files.
- [x] Phase 33 config-only page wiring continuation completed:
  - Removed direct page-level Supabase subscriptions from `/settings/communities/configuration` and `/settings/system/overview`; both pages now use hook-owned realtime subscriptions (`useCommunityConfigurationsRealtime`, `useSystemOverviewRealtime`) to keep settings pages hook/service-driven.
  - Added reusable realtime invalidation hooks in `useCommunityConfigurations` and `useSystemOverview` so query invalidation remains centralized and consistent.
  - Revalidated lint and superadmin production build after migration of page-level subscriptions into hooks.
- [x] Phase 33 agency-configuration hardening continuation completed:
  - Replaced `useAgencyConfigurationsRealtime` query-based channel initialization with lifecycle-safe `useEffect` subscription cleanup to prevent stale channel accumulation and repeated invalidation churn on the Settings page.
  - Removed hardcoded `updated_by: 'Admin User'` writes from `/settings/agencies/configuration` save flows and stopped injecting fallback `updated_by: 'system'` payloads from the hook transformer unless explicitly provided.
  - Added explicit save failure feedback alert in `/settings/agencies/configuration` so failed persistence is visible to admins instead of failing silently.
  - Fixed the remaining runtime crash on `/settings/agencies/configuration` by removing raw `configuration.*` render bindings, moving all editable fields onto `react-hook-form` registration, and guarding conditional sections/mandatory-field toggles with form-state-backed defaults.
  - Revalidated superadmin production build after the hardening changes.
- [x] Phase 33 tenant-configuration API alignment completed:
  - Added backend-managed tenant settings endpoints for community and agency configuration (`/admin/settings/community-configurations*`, `/admin/settings/agency-configurations*`) with scope-aware access checks and payload allowlisting.
  - Migrated `useCommunityConfigurations` and `useAgencyConfigurations` core read/write paths in superadmin from direct client-table mutations to the backend admin API (`useAdminApi`) while preserving existing settings UI/UX.
  - Revalidated backend and superadmin production builds after the migration.
- [x] Phase 33 settings-hook consolidation continuation completed:
  - Refactored `apps/superadmin/src/hooks/useSettings.ts` to use the shared `useAdminApi` helper instead of a duplicate in-file auth fetch implementation.
  - Removed unused legacy settings hooks from `useSettings.ts` (`useSettings`, `useUpdateSettings`, `useSetting`, `useUpdateSetting`, `useDeleteSetting`) so the file now exposes only the active system-settings category APIs used by current settings pages.
  - Revalidated superadmin production build after the consolidation.

## Phase 34 - Settings IA Completion + Operational Relocation (Guards/Agency)
- [x] Added shared backend admin scope service `apps/api/src/services/adminScope.ts` and refactored tenant-configuration controller scope logic to use the shared helper (`resolveAdminScope`, `canAccessCommunity`, `canAccessAgency`).
- [x] Added backend capability contract endpoint `GET /admin/me/capabilities` in `apps/api/src/controllers/adminCapabilities.ts` + `apps/api/src/routes/admin.ts`.
- [x] Added backend guard operational API set with explicit scope checks:
  - `GET /admin/guards/profiles`
  - `GET/POST/PATCH/DELETE /admin/guards/schedules`
  - `GET/POST/PATCH/DELETE /admin/guards/assignments`
  - `GET/POST/PATCH/DELETE /admin/guards/equipment`
  - `GET/POST/PATCH /admin/guards/performance`
  - `GET/POST/PATCH /admin/guards/training`
- [x] Added backend agency operational API set with explicit scope checks:
  - `GET /admin/agencies/profiles`
  - `GET/POST/PATCH/DELETE /admin/agencies/staff`
  - `GET/POST/PATCH/DELETE /admin/agencies/services`
  - `GET/POST/PATCH /admin/agencies/finance`
  - `GET/POST/PATCH/DELETE /admin/agencies/documents`
- [x] Extended backend validation schemas for all new guard/agency operational endpoints (`apps/api/src/validation/schemas.ts`).
- [x] Implemented frontend capability-driven menu filtering:
  - Added `capabilityKey`, `requiredAnyRole`, `requiredAnyPermission` to `MenuItemType`.
  - Added `filterMenuItemsByCapabilities()` in `apps/superadmin/src/helpers/Manu.ts`.
  - Wired capability fetch hook `apps/superadmin/src/hooks/useAdminCapabilities.ts`.
  - Updated app menu rendering to apply backend-driven capability filtering.
- [x] Added missing operational submenus under `People -> Guards` and `People -> Agency` in `apps/superadmin/src/assets/data/menu-items.ts`.
- [x] Implemented dedicated operational pages in module space (no settings duplication):
  - Guards: `/guards/profiles`, `/guards/schedules`, `/guards/assignments`, `/guards/equipment`, `/guards/performance`, `/guards/training`
  - Agency: `/agency/profiles`, `/agency/staff`, `/agency/services`, `/agency/finance`, `/agency/documents`
  - Pages are DB-backed through backend admin APIs via `useGuardOperations` and `useAgencyOperations` hooks.
- [x] Repointed settings relocation shells to new operational destinations:
  - `apps/superadmin/src/app/(admin)/settings/guards/*`
  - `apps/superadmin/src/app/(admin)/settings/agencies/*`
- [x] Added RLS hardening migration for guard/agency operational tables:
  - `supabase/migrations/20260303_phase34_guard_agency_scope_rls_hardening.sql`
  - Added helper `public.can_access_agency(uuid)` and scoped policies for `guard_schedules`, `guard_assignments`, `guard_equipment`, `guard_performance`, `guard_training`, `agency_staff`, `agency_services`, `agency_documents`, `agency_transactions`.
- [x] Applied Phase 34 guard/agency RLS migration to Casa Nirvana remote project (`pswnlowvmdgeifhxilao`) and verified:
  - `public.can_access_agency` function exists.
  - Scoped admin policies are active on guard/agency operational tables.
  - Migration version `20260303` is recorded in `supabase_migrations.schema_migrations`.
- [x] Rewired active superadmin Guard directory surfaces (`/guards/list-view`, `/guards/grid-view`, `/guards/details`) to backend-scoped admin APIs and backend delete flow (`/admin/guards/profiles`).
- [x] Rewired active superadmin Agency directory surfaces (`/agency/list-view`, `/agency/grid-view`, `/agency/details`) to backend-scoped admin APIs and backend delete flow (`/admin/agencies/directory`) while preserving the existing `agencies` table contract.
- [x] Normalized admin role alias handling in backend auth + capability resolution so relocated apps/guard-mobile/Agency submenu items render for aliased admin roles (`Super Admin`, `Administrator`, `agency_admin`, `facility_admin`, `Management`) instead of being filtered out.
- [x] Hardened apps/guard-mobile/Agency submenu visibility for superadmin sessions:
  - Updated `apps/api/src/services/adminScope.ts` so aliased platform-admin roles (`super_admin`, `Administrator`) resolve as global scope, matching the auth/capability logic.
  - Updated `apps/superadmin/src/components/layout/VerticalNavigationBar/components/AppMenu.tsx` to fall back to platform-admin apps/guard-mobile/Agency capabilities from the signed-in session role when the capability API payload is temporarily empty, preventing those operational submenu items from disappearing for superadmin users.
- [x] Simplified apps/guard-mobile/Agency sidebar IA to single manage entries while keeping tabbed operational workspaces:
  - Replaced the multiple operational submenu items with `Manage Guards` and `Manage Agencies` in `apps/superadmin/src/assets/data/menu-items.ts`.
  - Added canonical tabbed routes `/guards/manage` and `/agency/manage` with `?tab=` section switching and kept the existing operation pages compatible.
  - Updated `useAdminCapabilities` and backend capability output to include workspace-level capability keys (`guards:workspace:view`, `agency:workspace:view`) so the new single-entry navigation remains permission-driven.
  - Repointed Settings relocation notices to the new canonical manage routes so operational flows always land in the tabbed workspace.
- [x] Closed the remaining Phase 34 frontend scope-verification gap for module toggles:
  - Updated `apps/superadmin/src/app/(admin)/settings/module-settings/page.tsx` to consume admin scope/capabilities at the UI layer.
  - Non-superadmin admins are now constrained to scoped communities only, cannot remain in a misleading `Global Settings` state, and get explicit empty-scope messaging instead of relying on backend 403 responses alone.
  - Revalidated the superadmin production build after the scope UX hardening.
- [x] Closed the Guard resident-directory module-toggle enforcement gap:
  - Added `/Users/andromeda/casanirvana/apps/guard-mobile/services/moduleSettingsService.js` as the guard-side scoped module cache/service so Guard module reads use the canonical Supabase client and fail closed for known slugs.
  - Added `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useGuardModuleAccess.js` and applied it to `/Users/andromeda/casanirvana/apps/guard-mobile/screens/chatScreen.js`, `/Users/andromeda/casanirvana/apps/guard-mobile/screens/searchScreen.js`, and `/Users/andromeda/casanirvana/apps/guard-mobile/components/residentsTab.js`.
  - Resident discovery/search surfaces now stop rendering and stop querying when the `resident_directory` module is disabled for a community, while guard chats remain available.
- [x] Removed placeholder resident-search UX in the Guard directory flow:
  - Added `/Users/andromeda/casanirvana/apps/guard-mobile/services/residentSearchHistoryService.js` so resident search history is real, guard-scoped, and capped instead of showing fake “recent searches.”
  - Updated `/Users/andromeda/casanirvana/apps/guard-mobile/screens/searchScreen.js` to persist resident lookups, support name/unit/phone/email search, and replace the non-production voice-search placeholder with a standard clear-search control.
- [x] Fixed Guard resident-directory route payload consistency:
  - Updated `/Users/andromeda/casanirvana/apps/guard-mobile/components/residentsTab.js` so resident avatar URLs are normalized to React Native image-source objects before navigating to `/Users/andromeda/casanirvana/apps/guard-mobile/screens/messageScreen.js` and `/Users/andromeda/casanirvana/apps/guard-mobile/screens/callScreen.js`.
- [x] Closed the remaining Guard Visitors + Entry/Exit partials:
  - Updated `/Users/andromeda/casanirvana/apps/guard-mobile/screens/confirmScreen.js`, `/Users/andromeda/casanirvana/apps/guard-mobile/screens/allowedScreen.js`, and `/Users/andromeda/casanirvana/apps/guard-mobile/screens/cancelledScreen.js` so host attribution resolves from the selected unit instead of persisting generic `Resident` fallbacks in approval/denial flows.
  - Updated `/Users/andromeda/casanirvana/apps/guard-mobile/services/visitorEntryService.js` to carry through stored host fields when present.
  - Simplified `/Users/andromeda/casanirvana/apps/guard-mobile/screens/cabEntryScreen.js` into a single-step pre-selection form by removing the obsolete selected-flat / old route-param fallback branch.
- [x] Hardened Guard Messaging + Calls cache wiring:
  - Updated `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useCalls.js` to resolve the authenticated guard to canonical `profiles.id`, keep call reads/mutations profile-scoped, and subscribe on both caller/callee edges so thread/conversation caches refresh correctly when call rows change.
- [x] Hardened Guard RTC signaling UX contract:
  - Updated `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useCallManager.js` and `/Users/andromeda/casanirvana/apps/guard-mobile/screens/callScreen.js` so call state follows realtime `calls` row updates, removed fake auto-connect timers/alert-driven progression, and aligned the chat handoff back to the active message thread instead of the chat index.
- [x] Finished Guard edit-profile production email flow:
  - Updated `/Users/andromeda/casanirvana/apps/guard-mobile/screens/editProfileScreen.js` to add a password-reauthenticated login email-change modal, keep pending email changes visible from `auth.users.new_email`, and leave `public.users.email` synchronization to the confirmed auth change instead of patching it prematurely.
- [x] Formalized Guard registration handoff UX:
  - Updated `/Users/andromeda/casanirvana/apps/guard-mobile/screens/auth/registerScreen.js`, `/Users/andromeda/casanirvana/apps/guard-mobile/screens/auth/emailLoginScreen.js`, `/Users/andromeda/casanirvana/apps/guard-mobile/hooks/useRegisterGuard.js`, and `/Users/andromeda/casanirvana/apps/guard-mobile/contexts/GuardAuthContext.js` so signup/login communicate pending provisioning clearly, and sign-in failures distinguish missing profile, inactive profile, and awaiting community assignment states.
- [x] Formalized admin-side Guard community assignment so registration is fully wired:
  - Updated `/Users/andromeda/casanirvana/apps/api/src/controllers/adminGuardsOperations.ts` and `/Users/andromeda/casanirvana/apps/api/src/services/adminScope.ts` so guard assignments now sync canonical `guards.community_id` / `users.community_id`, active guard scope falls back to assignments when needed, and guard profile rows expose assignment/provisioning state.
  - Added scoped `GET /admin/communities` in `/Users/andromeda/casanirvana/apps/api/src/controllers/adminCommunities.ts` and `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts` for assignment provisioning UI.
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/components/operations/GuardOperationsWorkspace.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useGuardOperations.ts`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/guards/manage/page.tsx` so `Manage Guards -> Community Assignments` uses real guard/community selects, highlights guards awaiting first assignment, and deep-links from the profiles tab into onboarding completion.
  - Added and applied `/Users/andromeda/casanirvana/supabase/migrations/20260306180000_phase34_guard_assignment_scope_sync.sql` to keep assignment-to-community sync enforced at the database layer and to make `current_guard_community_id()` fall back to active assignments.
- [x] Replaced the legacy superadmin Add Guard admin-create path:
  - Added `POST /admin/guards/profiles` with schema validation in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts` and `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`, and completed provisioning logic in `/Users/andromeda/casanirvana/apps/api/src/controllers/adminGuardsOperations.ts` so admin-created guards are invited through Auth, synced into `users`/`profiles`/`guards`, and given an initial assignment in the selected community.
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/guards/add/components/GuardAdd_Enhanced.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/guards/add/components/GuardAddCard.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/guards/add/page.tsx` around the scoped admin APIs (`useGuardOperations`) so the active Add Guard flow no longer depends on legacy `society_id` fields, localStorage tokens, or the deprecated `/guards` backend route.
- [x] Focused QA remediation for `People -> Guards -> Add Guard`:
  - Replaced the broken `ChoicesFormInput` wiring in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/guards/add/components/GuardAdd_Enhanced.tsx` with native `Form.Select` controls for community, shift, and status so `react-hook-form` submission is deterministic.
  - Relaxed `/Users/andromeda/casanirvana/apps/api/src/services/adminScope.ts` UUID matching to accept legacy seeded ids already persisted in Casa Nirvana, which restored community scope checks for records like `11111111-1111-1111-1111-111111111111`.
  - Re-ran browser QA locally: the `community_id` payload is now submitted correctly; the only remaining runtime blocker during repeated local testing was Supabase Auth `inviteUserByEmail` rate limiting after multiple rapid invite attempts, not form or scope wiring.
- [x] Build verification completed:
  - `backend`: `npm run build` passed.
  - `superadmin`: `npm run build` passed.
- [x] Wired `People -> Agency -> Add Agency` to the production admin path:
  - Added scoped `POST /admin/agencies/directory` with schema validation in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts` and `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`, and completed create logic in `/Users/andromeda/casanirvana/apps/api/src/controllers/adminAgenciesOperations.ts` so a new agency now creates synchronized `agencies` + `agency_profiles` records and initial managed community rows in one rollback-safe flow.
  - Added `useCreateAgencyDirectory` in `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useAgencyDirectory.ts` and rebuilt the active form in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/agency/add/components/AgencyAdd.tsx` to submit through backend APIs, sanitize optional fields before transport, and replace the legacy `ChoicesFormInput` branch with deterministic native `Form.Select` controls.
  - Revalidated the slice with `backend: npm run build` and `superadmin: npm run build`.
- [x] Focused QA remediation for `People -> Agency -> Add Agency`:
  - Ran a real local browser pass against the active form, authenticated with a disposable QA superadmin, and confirmed end-to-end UI submission redirects from `/agency/add` to `/agency/list-view` with the new agency row visible.
  - Fixed two backend persistence mismatches discovered during QA in `/Users/andromeda/casanirvana/apps/api/src/controllers/adminAgenciesOperations.ts`: uppercase agency type values are now mapped to the lowercase `agency_profiles` constraint set, and managed community `established_date` is now persisted in the format expected by the `communities` table instead of being truncated to a year.
- [x] Focused remediation for `People -> Agency -> List/Grid/Details/Manage`:
  - Added a scoped agency summary backend endpoint `GET /admin/agencies/directory/:id/summary` in `/Users/andromeda/casanirvana/apps/api/src/controllers/adminAgenciesOperations.ts` and `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts` so agency details now have one backend truth for agency profile data, communities, finance rows, activity feed, and operational counts.
  - Extended `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useAgencyDirectory.ts` with `useGetAgencyDirectorySummary`, and hardened `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useAdminApi.ts` to resolve the admin access token from `/api/auth/session` when client hydration lags, preventing agency list/manage pages from silently rendering empty states while authenticated.
  - Replaced broken `/agency/edit` actions with real `/agency/manage?tab=profiles&agencyId=...` routes in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/agency/list-view/components/AgencyList.tsx` and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/agency/grid-view/components/AgencyData.tsx`, preserving production navigation and removing dead-end edit links.
  - Rebuilt the agency detail surface in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/agency/details/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/agency/details/components/AgencyDetails.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/agency/details/components/AgencyDetailsBanner.tsx` so the overview, communities, analytics, financials, activities, and management tabs all render DB-backed data or explicit empty states instead of placeholder management-company content.
  - Reworked `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/agency/grid-view/components/AgencyGridCard.tsx` into a data-driven directory summary and updated `/Users/andromeda/casanirvana/apps/superadmin/src/components/operations/AgencyOperationsWorkspace.tsx` + `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/agency/manage/page.tsx` so filtered manage tabs preserve `agencyId`, show a loading state during capability resolution, and keep the selected agency scoped across tabs.
  - Closed the two runtime blockers found during focused QA: `/Users/andromeda/casanirvana/apps/api/src/controllers/adminAgenciesOperations.ts` now reads finance summaries from the real `agency_transactions` table instead of the nonexistent `agency_finance` relation, and `People -> Agency -> Manage Agencies -> Agency Profile` now supports scoped create/update of missing `agency_profiles` through new backend profile mutations plus prefilled create forms in `/Users/andromeda/casanirvana/apps/superadmin/src/components/operations/AgencyOperationsWorkspace.tsx`.
  - Cleaned up the temporary QA agencies, communities, profile, and auth user after verification so no test data remains in Casa Nirvana.
- [x] Focused remediation for `People -> Visitors -> List/Grid/Details`:
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/visitors/list-view/components/VisitorsList.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/visitors/grid-view/components/VisitorGridCard.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/visitors/components/VisitorActionButtons.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/visitors/details/page.tsx` so visitor details preserve the originating surface (`list-view` vs `grid-view`) and the back-navigation/delete-return flow lands users back in the correct workspace instead of always forcing the grid.
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/visitors/details/components/VisitorDetailsBanner.tsx` to make the access-stage badge status-aware (`Awaiting Approval`, `Awaiting Check-in`, `Inside Community`, `Visit Completed`, `Access Closed`) so checked-out and terminal passes no longer show the incorrect `Not Approved` state.
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/visitors/details/components/VisitorDetails.tsx` to stop reusing `updated_at` as a fake approval timestamp after later lifecycle transitions; the timeline now only emits trustworthy status events for states where `updated_at` still represents the terminal status change without conflicting with explicit check-in/out timestamps.
  - Verified via live Supabase query that the remaining visitor agency-attribution gap for Casa Nirvana is currently data-level, not UI-level: `public.communities.agency_id` is `NULL` for `Casa Nirvana`, so visitor rows correctly fall back to `Not assigned` until tenant data is explicitly assigned.
- [x] Started focused remediation for `Operations -> Maintenance Requests`:
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/maintenance-requests/components/MaintenanceRequestGridCard.tsx` to remove mock KPI content, derive request metrics from live maintenance rows, normalize urgent/high priority counting, replace the fake sparkline series with a real six-month request-volume trend, and replace hardcoded percentage/customer-rating placeholders with real operational summaries.
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/maintenance-requests/page.tsx` to remove fake header actions, normalize status/priority labels, and format maintenance costs in `GH₵` instead of hardcoded dollar values.
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/maintenance-requests/[id]/page.tsx` to remove the dead `Edit Request` CTA, replace static timeline/status-history content with lifecycle events derived from real request timestamps, and align estimated-cost / resolution-state sections with live request data instead of placeholders.
- [x] Focused QA remediation for `Operations -> Maintenance Requests -> List/Details`:
  - Added realtime invalidation to the active superadmin maintenance list/detail surfaces via `useMaintenanceRequestsSubscription`, and expanded maintenance relation reads in `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useMaintenanceRequests.ts` to expose assigned/resolved profile metadata alongside requester and unit data.
  - Removed the remaining fake list controls in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/maintenance-requests/page.tsx`: deleted non-wired select-all checkboxes and fake pagination links, added honest empty-state + live action feedback, and kept the footer truthful about rendering the full live request set.
  - Hardened `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/maintenance-requests/[id]/page.tsx` so quick actions now respect a valid request-state progression (`pending -> in_progress -> completed`, with only `completed -> pending` reopen), expose actual cost / assigned-to / resolved-by metadata, and avoid duplicate back-navigation chrome.
  - Revalidated the superadmin production build after the maintenance remediation (`npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed).
- [x] Focused remediation for `Operations -> Complaints -> List/Details`:
  - Removed non-production list controls from `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/complaints/page.tsx`: fake export/import dropdown, fake row-selection checkboxes, and fake pagination links are gone; the page now shows honest empty-state/live-state feedback and a truthful footer for the real complaint dataset.
  - Hardened complaint list actions to follow a clear lifecycle path (`pending -> in_progress -> resolved`, with `resolved -> pending` reopen) and normalized status/category/priority labels so the list no longer exposes misleading play-button behavior for resolved complaints.
  - Hardened `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/complaints/[id]/page.tsx` by removing debug logging and dead header/sidebar placeholder actions, switching the timeline to real lifecycle fields (`created_at`, `in_progress_at`, `resolved_at`), and adding visible success/error feedback for status and priority mutations on the active detail surface.
  - Corrected `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/complaints/components/ComplaintOverviewCard.tsx` so “Resolved Today” is derived from `resolved_at` instead of the generic `updated_at` field.
  - Revalidated the superadmin production build after the complaints remediation (`npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed).
- [x] Focused remediation for `Operations -> Help Desk / Inquiries -> List/Details`:
  - Hardened `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useInquiries.ts` with realtime invalidation for the live inquiries table, normalized `suggestion`/`suggestions` inquiry-type filtering for backward compatibility, and constrained inquiry updates so reopening clears terminal resolution state while resolved/closed transitions stamp `resolved_at`.
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/help-desk/inquiries/page.tsx` to normalize help-desk labels and badges, add live success/error feedback for queue actions, support production-safe quick transitions directly from the list, and remove the stale type mismatch between historical `suggestions` rows and current user-app `suggestion` writes.
  - Hardened `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/help-desk/inquiries/[id]/page.tsx` by replacing passive status editing with lifecycle-aware actions (`open -> in_progress -> resolved -> closed`, plus reopen), surfacing real response/resolution timestamps, rendering a truthful inquiry timeline, and showing operator-friendly attachment labels instead of raw URLs.
  - Revalidated the superadmin production build after the help desk remediation (`npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed).
- [x] Focused remediation for `Operations -> Amenities -> List/Details/Bookings`:
  - Hardened `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useAmenities.ts` with singleton realtime invalidation for both `amenities` and `amenity_bookings`, so list/detail/booking surfaces refresh from live DB changes instead of stale cache snapshots.
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/amenities/list/components/AmenitiesStat.tsx` and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/amenities/list/components/AmenitiesList.tsx` around truthful DB-backed metrics, search/filter/sort/pagination, live delete feedback, and `GH₵` money formatting, while removing fake export/select/pagination controls.
  - Reworked `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/amenities/details/components/AmenityDetailsBanner.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/amenities/details/components/AmenityDetails.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/amenities/details/[id]/page.tsx` so amenity summaries, booking activity, operations, rules, and quick links are derived from live amenity + booking data instead of placeholder imagery, trophy cards, or fake maintenance/revenue content.
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/amenities/bookings/components/BookingsStat.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/amenities/bookings/components/BookingsOverview.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/amenities/bookings/components/BookingsList.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/amenities/bookings/[id]/page.tsx` with real booking lifecycle summaries, amenity-scoped filtering, safe status actions, truthful payment/revenue reporting, and DB-backed booking detail timelines.
  - Revalidated the superadmin production build after the amenities remediation (`npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed).
- [x] Focused remediation for `Operations -> Services -> List/Details/Requests`:
  - Hardened `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useServices.ts` and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useServiceRequests.ts` with singleton realtime invalidation plus normalized service display/status helpers, and expanded service-request profile resolution to expose requester + assignee metadata from live profile records.
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/services/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/services/components/ServicesStats.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/services/components/ServicesTable.tsx` into truthful DB-backed management surfaces with real search/filter/pagination, live service-request demand summaries, safe delete feedback, and `GH₵` pricing.
  - Reworked `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/services/details/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/services/details/components/ServiceDetailsHeader.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/services/details/components/ServiceStatsCards.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/services/details/components/ServiceOverview.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/services/details/components/ServiceRequestsTable.tsx` so service detail screens now render live operational summaries, recent requests, and lifecycle-safe request actions instead of placeholder charts, fake timestamps, and decorative management copy.
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/service-requests/components/ServiceRequestsStats.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/service-requests/components/ServiceRequestsTable.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/service-requests/components/ServiceRequestsView.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/service-requests/[id]/page.tsx` around truthful request lifecycle data, scope-aware filtering, visible action feedback, and request detail timelines.
  - Revalidated the superadmin production build after the services remediation (`npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed).
- [x] Focused remediation for `Communication -> Notifications -> Dashboard/Campaigns/Analytics/Templates`:
  - Added `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useNotificationRealtime.ts` to centralize live invalidation for notification operational surfaces and removed the previous screen-level debug subscription noise from the dashboard.
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/notifications/dashboard/components/NotificationsDashboardView.tsx` around truthful summary/campaign/channel data, replaced the fake template-creation timeout with real template persistence, and removed placeholder fallback metrics so the dashboard now reflects actual notification analytics state.
  - Reworked `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/notifications/campaigns/components/NotificationCampaignsView.tsx` so campaign creation, lifecycle actions, budget display, performance charts, and destructive confirmation flows are DB-backed and no longer depend on mock analytics, hardcoded template/audience options, or dead action buttons.
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/notifications/analytics/components/NotificationAnalyticsView.tsx` to derive overview charts, channel metrics, quick stats, top-campaign tables, and CSV export data from live `notification_campaigns` analytics instead of placeholder trend arrays and fake KPI copy.
  - Reworked `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/notifications/templates/components/NotificationTemplatesView.tsx` so preview/duplicate/archive/delete actions are real, dead footer actions are removed, and template analytics now reflect the stored template inventory without placeholder behavior.
  - Revalidated the superadmin production build after the notifications core remediation (`npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed).
- [x] Notifications IA cleanup slice (menu + legacy route consolidation):
  - Simplified `/Users/andromeda/casanirvana/apps/superadmin/src/assets/data/menu-items.ts` so Notifications now exposes only `Overview`, `Campaigns`, `Templates`, and `Reports`, removing duplicated per-channel workspace links and the old `Settings & Preferences` entry.
  - Added `/Users/andromeda/casanirvana/apps/superadmin/src/components/WorkspaceRelocationNotice.tsx` and replaced the legacy `/notifications/push`, `/notifications/sms`, `/notifications/email`, and `/notifications/in-app` pages with clean relocation notices that route admins into the unified campaigns workspace or `Settings > Notification Setup`.
  - Renamed the dashboard/reporting metadata and titles so the notifications area now reads as a single shared operations workspace instead of four separate mini-products.
- [x] Notifications campaigns consolidation slice completed:
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/notifications/campaigns/components/NotificationCampaignsView.tsx` into a single cross-channel queue workspace with workflow tabs, channel filters, shared template selection, and cleaner operations-first list/detail UX instead of mixing analytics views into campaign management.
  - Extended `/Users/andromeda/casanirvana/apps/api/src/controllers/adminNotifications.ts` and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useNotificationCampaigns.ts` so campaign creation now supports explicit `draft`, `scheduled`, and `processing` orchestration states without forcing every new campaign directly into a live send path.
  - Revalidated both `npm run build` in `/Users/andromeda/casanirvana/apps/api` and `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`; no SQL migration was required for this slice.
- [x] Notifications templates and reports consolidation slice completed:
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/notifications/templates/components/NotificationTemplatesView.tsx` into a single template-library workspace with cross-channel filters, truthful library coverage summaries, and cleaner template create/preview/archive/delete flows instead of splitting the page into a second analytics mini-product.
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/notifications/analytics/components/NotificationAnalyticsView.tsx` into a single reports workspace with shared filters, delivery/engagement trend sections, cross-channel comparison, and top-campaign reporting instead of four separate tabbed report surfaces.
  - Revalidated `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`; no SQL migration was required for this slice.
- [x] Notifications data-contract closure slice completed:
  - Added backend-managed notification template CRUD endpoints in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts` and `/Users/andromeda/casanirvana/apps/api/src/controllers/adminNotifications.ts`, then moved `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useNotificationTemplates.ts` off direct browser Supabase CRUD onto the scoped admin API so template create/update/delete now follows the same production access path as campaigns.
  - Extended the notification campaign contract in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/adminNotifications.ts`, `/Users/andromeda/casanirvana/apps/api/src/middleware/auth.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useNotificationCampaigns.ts`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/notifications/campaigns/components/NotificationCampaignsView.tsx` so campaigns now store a stable `template_id`, keep canonical template naming, and enforce notification read/write permissions consistently for template-linked operations.
  - Added and applied `/Users/andromeda/casanirvana/supabase/migrations/20260307191500_phase34_notification_template_linkage.sql` to Casa Nirvana so `public.notification_campaigns` now has `template_id`, foreign-key linkage to `notification_templates`, and a legacy-name backfill path for truthful template usage reporting.
  - Revalidated `npm run build` in `/Users/andromeda/casanirvana/apps/api` and `/Users/andromeda/casanirvana/apps/superadmin`, and verified the remote Casa Nirvana schema now exposes `notification_campaigns.template_id`.
- [x] Focused remediation for `Communication -> Email Management`:
  - Added scoped backend email operations in `/Users/andromeda/casanirvana/apps/api/src/controllers/adminEmails.ts` and `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts` for list/detail/contact lookup, draft/queue creation, and lifecycle-safe email updates, all enforced through admin auth + tenant scope checks instead of the previous browser-only placeholder client.
  - Rebuilt the active superadmin inbox workspace off demo `userData` helpers and onto `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useAdminEmails.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/inbox/components/EmailOverview.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/inbox/components/EmailNavigationMenu.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/inbox/components/InboxMail.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/inbox/components/EmailArea.tsx` so summary cards, folder counts, list/detail selection, and compose actions now reflect the real `emails` table with scoped contacts and realtime invalidation.
  - Added and applied `/Users/andromeda/casanirvana/supabase/migrations/20260307203000_phase34_email_scope_backfill.sql` to backfill `emails.community_id` where it could be inferred from sender/recipient profiles and to add `idx_emails_community_id`; post-apply verification showed `4` live email rows now scoped to Casa Nirvana instead of all `emails.community_id` values being null.
  - Revalidated `npm run build` in `/Users/andromeda/casanirvana/apps/api` and `/Users/andromeda/casanirvana/apps/superadmin` after the email-management remediation.
- [x] Focused remediation for `Personal Hub -> Reports`:
  - Added scoped backend reporting read model `GET /admin/personal-hub/reports` in `/Users/andromeda/casanirvana/apps/api/src/controllers/payment.ts`, `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, and `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`, enforcing the same global-platform admin boundary as the Personal Hub dashboard while supporting period, service, status, provider, search, and amount filters.
  - Rebuilt the active reports workspace around `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/usePersonalHubReports.ts` and rewired `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/reports/page.tsx` plus all report components so transaction tables, detail modal, filters, export flow, and financial/engagement/performance charts now use truthful Personal Hub transaction data instead of static demo datasets, fake export/email options, or fabricated technical/compliance details.
  - Simplified export behavior to supported CSV/JSON downloads for the currently loaded filtered dataset, normalized the full workspace to `GH₵`, and removed placeholder filters that did not match the real Personal Hub domain.
  - Revalidated `npm run build` in `/Users/andromeda/casanirvana/apps/api` and `/Users/andromeda/casanirvana/apps/superadmin`; no SQL migration was required for this slice.
- [x] Phase 35 foundation for `Personal Hub -> ExpressPay service-catalog alignment`:
  - Added and remotely applied `/Users/andromeda/casanirvana/supabase/migrations/20260310101500_phase35_personal_hub_expresspay_catalog_alignment.sql`, extending `service_providers`, `service_packages`, the Personal Hub source tables, `list_active_service_providers(text)`, and `personal_hub_transactions` so cached ExpressPay catalog metadata, query context, fulfillment state, and external service codes are first-class DB concepts.
  - Added `/Users/andromeda/casanirvana/apps/api/src/services/expresspayBillPay.ts` and `/Users/andromeda/casanirvana/apps/api/src/services/personalHubTransactions.ts`, then exposed `GET /personal-hub/catalog/providers`, `POST /personal-hub/catalog/query`, `POST /personal-hub/transactions/initiate`, `GET /personal-hub/transactions/:id/status`, `GET /admin/personal-hub/catalog/providers`, and `POST /admin/personal-hub/catalog/sync` so Personal Hub service selection and source-row-first transaction creation now have a backend control plane instead of client-only static catalogs.
  - Rewired the active user-app Personal Hub flows (`airtime`, `data`, `bill payments`, `insurance`) so provider selection now carries `externalServiceCode`, provider/account validation is query-first via the backend catalog APIs, and payment method screens forward canonical `queryContext`, `selectedOption`, and category metadata into the existing ExpressPay checkout orchestration instead of relying on hardcoded bundle/biller/policy assumptions.
  - Revalidated `npm run build` in `/Users/andromeda/casanirvana/apps/api` and targeted `npm run lint -- --quiet ...` in `/Users/andromeda/casanirvana/apps/resident-mobile` for the changed Personal Hub screens/services after the refactor.
- [x] Phase 35 follow-up for `Personal Hub -> ExpressPay BillPay completion`:
  - Extended the secure ExpressPay admin control plane in `/Users/andromeda/casanirvana/apps/api/src/services/adminPaymentGateway.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/adminPaymentGateway.ts`, and `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` so BillPay credentials now live beside checkout credentials in `payment_gateway_configs` with Vault-backed secret refs (`billpay_username`, `billpay_auth_token`) plus optional `billpay_url`, readiness flags, and targeted `POST /admin/payment-gateways/expresspay/test` support for both `checkout` and `billpay`.
  - Completed the backend BillPay adapter in `/Users/andromeda/casanirvana/apps/api/src/services/expresspayBillPay.ts` by moving credential resolution onto the secure config path (with env fallback only), switching `SERVICES` / `QUERY` / `PAY` / `STATUS` to the official form-encoded BillPay contract, and normalizing success, pending, duplicate, invalid-credential, invalid-IP, offline-provider, and generic failure responses.
  - Added `/Users/andromeda/casanirvana/apps/api/src/services/personalHubFulfillment.ts` and wired it through `/Users/andromeda/casanirvana/apps/api/src/services/expresspay.ts` plus `/Users/andromeda/casanirvana/apps/api/src/services/personalHubTransactions.ts` so successful ExpressPay checkout settlement now triggers idempotent provider fulfillment for ExpressPay-backed Personal Hub services, persists `provider_payload.fulfillment`, and truthfully distinguishes payment completion from downstream service delivery state.
  - Updated the superadmin ExpressPay settings route in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/payment/gateways/page.tsx` plus `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useExpressPayGatewayConfig.ts` and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/usePaymentGatewaySettings.ts` to expose a dedicated BillPay subsection with readiness indicators, secure inputs, and a BillPay-specific validation path instead of forcing these credentials into generic settings surfaces.
  - Updated the Personal Hub admin/user runtime surfaces so readiness and completion states are truthful: `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/components/ExpressPayCatalogSyncNotice.tsx` now warns when catalog sync exists without BillPay readiness, `/Users/andromeda/casanirvana/apps/resident-mobile/services/serviceProviderCatalogService.js` only permits fallback provider lists in dev or when explicitly enabled by env, and `/Users/andromeda/casanirvana/apps/resident-mobile/services/expressPayService.js` plus the Personal Hub payment/result screens now separate `payment_pending`, `payment_failed`, `fulfillment_pending`, `fulfillment_failed`, and `completed`.
  - Verified the already-live Phase 35 schema contract on Casa Nirvana Supabase (`pswnlowvmdgeifhxilao`), backported the schema snapshot into `/Users/andromeda/casanirvana/supabase/migrations/20260206_baseline_schema.sql`, synced shared DB types to all apps, and passed focused/full backend tests plus `npm run build`, `npm run build`, and `npm run build:check` in `/Users/andromeda/casanirvana/apps/superadmin`.
- [x] Phase 44 production fix for `ExpressPay Personal Hub catalog sync`:
  - Added and remotely applied `/Users/andromeda/casanirvana/supabase/migrations/20260402150000_phase44_expresspay_catalog_upsert_constraints.sql` to replace the Phase 35 partial unique indexes on `public.service_providers` and `public.service_packages` with full unique indexes on the same conflict columns, because Supabase/PostgREST `upsert(... onConflict=...)` cannot infer a partial unique index for catalog sync.
  - Backported the same index contract into `/Users/andromeda/casanirvana/supabase/migrations/20260206_baseline_schema.sql` and updated `/Users/andromeda/casanirvana/supabase/migrations/ROLLBACK_NOTES.md`.
  - Verified the live index definitions on Casa Nirvana Supabase project `pswnlowvmdgeifhxilao`, then ran a real backend-side `syncExpressPayCatalogToCache()` against the active secure config. The sync completed successfully with `imported_count = 17` and `raw_status_text = Success`, confirming the production admin sync error (`there is no unique or exclusion constraint matching the ON CONFLICT specification`) is resolved.
- [x] Phase 35 first superadmin alignment pass for `Personal Hub -> service workspaces`:
  - Added `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useAdminPersonalHubCatalog.ts` and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/components/ExpressPayCatalogSyncNotice.tsx` so the superadmin service workspaces can read the cached ExpressPay catalog through the hardened admin API and trigger `POST /admin/personal-hub/catalog/sync` from one shared control surface.
  - Updated `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/airtime/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/data/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/bills/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/transfers/page.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/insurance/page.tsx` to remove the misleading manual `Add Provider` / `Add Biller` / `Add Service` / `Add Package` entry points, replace them with an explicit ExpressPay catalog sync control, and normalize top-level monetary summaries to `GH₵`.
  - Marked the remaining Personal Hub admin workspaces as synced-catalog driven: data packages are now described as query-derived options, while airtime, bills, transfers, and insurance now tell admins that provider availability is controlled by ExpressPay sync instead of ad-hoc manual provider creation.
  - Revalidated `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` after the admin-catalog alignment pass.
- [x] Phase 35 second superadmin alignment pass for `Personal Hub -> provider and package tables`:
  - Added backend admin catalog-management support in `/Users/andromeda/casanirvana/apps/api/src/services/expresspayBillPay.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/payment.ts`, `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, and `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` so superadmin can list cached ExpressPay packages and toggle `service_providers.is_enabled_for_app` through authenticated admin APIs instead of direct browser-side table mutations.
  - Added shared superadmin catalog tables in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/components/PersonalHubCatalogProvidersTable.tsx` and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/components/PersonalHubCatalogPackagesTable.tsx`, then rewired the active service workspace tables (`airtime`, `data`, `bills`, `transfers`, `insurance`) to use those truthful catalog-backed views instead of sample data, fake top-up/status-change flows, and placeholder bulk actions.
  - Data packages now read from cached `service_packages` through the backend control plane and explicitly communicate that package availability is derived from ExpressPay query responses, not hand-maintained admin catalog rows.
  - Revalidated `npm run build` in `/Users/andromeda/casanirvana/apps/api` and `/Users/andromeda/casanirvana/apps/superadmin` after the provider/package-table remediation.
- [x] Phase 35 third superadmin alignment pass for `Personal Hub -> transaction and operational panels`:
  - Added `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/components/PersonalHubServiceTransactionsTable.tsx` and reused the admin-backed reports hook so the Airtime/Data/Bills/Transfers/Insurance transaction surfaces now render truthful Personal Hub transaction rows instead of sample tables, fake approval modals, or placeholder bulk actions.
  - Reworked `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/insurance/components/ClaimsManagementTable.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/bills/components/PaymentValidationRules.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/transfers/components/ComplianceMonitoring.tsx` into read-only operational workspaces backed by live transaction and cached provider capability data, removing fake claim-processing, AML-rule editing, and local validation-rule management flows that do not exist in the production ExpressPay model.
  - Renamed the affected service tabs and headers to match the truthful model (`Policy Payments`, `Claims Readiness`, `Provider Validation`, `Operational Monitoring`) and updated the shared reports table so service-specific transaction workspaces can hide the redundant service column while preserving the existing details modal.
  - Revalidated `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` after the transaction/operational-panel remediation.
- [x] Phase 35 fourth superadmin alignment pass for `Personal Hub -> overview charts and service metrics`:
  - Added `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/usePersonalHubServiceMetrics.ts` plus `/Users/andromeda/casanirvana/apps/superadmin/src/lib/personalHubCharts.ts`, and replaced the remaining direct-Supabase service metric hooks (`useAirtimeService`, `useDataService`, `useBillPaymentService`, `useMoneyTransferService`, `useInsuranceService`) with shared admin-backed Personal Hub report/catalog aggregation.
  - Rebuilt the remaining overview chart components in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/{airtime,data,bills,transfers,insurance}/components` so provider trends, success-rate views, bill-category mix, transfer rail mix, and insurance settlement/distribution visuals are all driven by live Personal Hub report data plus cached ExpressPay catalog metadata instead of sample providers, fake corridors, hardcoded package popularity, or fabricated claims analytics.
  - Normalized the final chart-level money labels to `GH₵`, added truthful empty/truncation messaging for the live reporting window, and removed the last sample-only narratives that no longer matched the production ExpressPay-backed Personal Hub model. No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed after the changes.
- [x] Phase 35 fifth superadmin alignment pass for `Personal Hub -> Marketplace`:
  - Added `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useMarketplaceWorkspace.ts` and rewired `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useMarketplaceService.ts` so the active marketplace workspace now reads truthful category, product, vendor, order, review, and shopping-payment data from the live marketplace tables instead of placeholder service-provider math, fake growth, or sample order/review/vendor records.
  - Rebuilt `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/marketplace/page.tsx` plus the active table/chart/modal components in `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/marketplace/components` so supported tabs (`Overview`, `Categories`, `Products`, `Orders`, `Vendors`, `Reviews`) are now DB-backed, lifecycle-safe, and normalized to `GH₵`, with simple truthful create/edit flows for the fields the production schema actually supports today.
  - Converted `Promotions` and `Visual Content` into explicit readiness notices because the current deployment does not have live schema-backed promotion or merchandising models; this removes the previous fully mocked controls instead of pretending those actions are operational. No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` passed after the changes.
- [x] Phase 36 cross-cutting audit/remediation prep for remaining baseline-era marketplace + guard RLS:
  - Verified the old Phase 5B checklist reference points only to archived pre-baseline SQL (`/Users/andromeda/casanirvana/supabase/migrations/_archive/2026-02-06-pre-baseline/20260206170000_phase5_rls_internal_tables.sql`) and replaced it with an active cleanup migration path.
  - Added `/Users/andromeda/casanirvana/supabase/migrations/20260310184500_phase36_marketplace_guard_internal_rls_cleanup.sql` to enable active RLS on the remaining marketplace tables, convert Personal Hub marketplace admin access to platform-only policies, enable missing guard performance/training RLS, and scope guard operational admin access by community where tenant metadata exists.
  - Added `/Users/andromeda/casanirvana/MANUAL_RUNTIME_QA_PACK.md` to turn the remaining cross-app runtime QA backlog into one executable release checklist for superadmin, scoped admins, user app, and guard app flows.
- [x] Phase 36 migration applied to Casa Nirvana remote DB (`pswnlowvmdgeifhxilao`) and verified:
  - migration metadata recorded in `supabase_migrations.schema_migrations` with `version=20260310184500`
  - `p36_*` policies present on marketplace and guard internal tables
  - baseline-era broad marketplace admin policies replaced on the targeted active tables

## Cleanup / Hygiene
- [x] Remove backup artifacts (`*.bak`, `*.backup`, etc.). (Left `backupRestoreScreen.js` files since they appear to be real features.)
- [x] Remove any `node_modules` committed to repo.
- [x] Remove test pages (superadmin test/debug routes and pages).

## Endpoints Added/Updated (Summary)
- [x] `POST /admin/invites` (admin invite flow)
- [x] `GET/POST/PUT/DELETE /admin/notification-templates` (scoped admin template management)
- [x] `GET /admin/emails`, `GET /admin/emails/:id`, `GET /admin/emails/contacts`, `POST /admin/emails`, `PATCH /admin/emails/:id` (scoped admin email management)
- [x] `GET /admin/personal-hub/reports` (scoped Personal Hub reports read model for superadmin operations)
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
- [x] `GET /admin/me/capabilities` (backend role/scope/capabilities contract for menu visibility)
- [x] `GET /admin/guards/profiles`
- [x] `GET/POST/PATCH/DELETE /admin/guards/schedules`
- [x] `GET/POST/PATCH/DELETE /admin/guards/assignments`
- [x] `GET/POST/PATCH/DELETE /admin/guards/equipment`
- [x] `GET/POST/PATCH /admin/guards/performance`
- [x] `GET/POST/PATCH /admin/guards/training`
- [x] `GET /admin/agencies/profiles`
- [x] `GET/POST/PATCH/DELETE /admin/agencies/staff`
- [x] `GET/POST/PATCH/DELETE /admin/agencies/services`
- [x] `GET/POST/PATCH /admin/agencies/finance`
- [x] `GET/POST/PATCH/DELETE /admin/agencies/documents`
- [x] `GET /admin/personal-hub/dashboard` (scoped Personal Hub dashboard read model for superadmin operations)
- [x] `GET/POST/PUT/DELETE /admin/residents`, `GET /admin/residents/:id/activity`, `GET /admin/residents/:id/directory` (scoped resident management + detail read models)

## Phase 45 - Release Freeze Data Cleanup
- [x] Confirmed release database target is Supabase org `BVerse` (`smxojcsoczdxmkdneayu`) and project `Casa Nirvana` (`pswnlowvmdgeifhxilao`); unrelated MCP-configured project `qfdoogvyuqbfrncxsdkq` was not touched.
- [x] Applied migration `supabase/migrations/20260522120000_phase45_release_freeze_data_cleanup.sql` to Casa Nirvana and recorded migration metadata (`version=20260522120000`, `name=phase45_release_freeze_data_cleanup`, `created_by=codex`).
- [x] Backfilled missing `entry_code` / `qr_code_data` for 19 attributed, tenant-anchored historical `visitor_passes` rows with reversible backup table `public.datafix_phase45_visitor_artifact_backfill_backup` (`cleanup_tag = phase45_visitor_artifacts_backfill_20260522`).
- [x] Verified visitor release-freeze data quality: `visitor_passes.created_by IS NULL = 0`, `unit_id IS NULL AND community_id IS NULL = 0`, and missing pass artifacts (`entry_code` or `qr_code_data`) = 0.
- [x] Enabled scoped RLS on remaining empty Phase 5B leftover tables (`app_extensions`, `application_settings`, `document_categories`, `equipment_id_mapping`, `equipment_maintenance`, `groups`, `translations`) with Phase 45 admin/service-role policies.
- [x] Synced local active migration history with live Casa Nirvana migration metadata: `79` local active versions match `79` live active versions, with `0` missing local and `0` local-only migration versions. Recovered missing March/April files from `/Users/andromeda/casanirvana`, recovered two stored SQL migrations from Supabase metadata, and added no-op active baseline markers for the three live Feb 6 seed metadata records whose SQL is folded into `20260206_baseline_schema.sql`.

## Environment Variables (Required)

## Phase 50 - WordPress to Next.js Marketing Migration
- [~] Active P0 launch requirement. Detailed status, evidence, blockers, and route parity signoff are tracked in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [x] Approved visual-parity rules are recorded in `docs/MARKETING_SITE_PARITY_CONTRACT.md`; this is a technology migration, not a redesign.
- [x] Isolated Next.js 16 application created at `apps/marketing-web/` with typed repository content, SEO routes, public form proxies, and an independent dependency boundary.
- [x] Repeatable WordPress SQL/Elementor extractor and committed parity manifests added; `wordpress/` remains the immutable local reference and licensed/runtime material remains ignored.
- [~] Route implementation is in progress. No route is parity-complete until six-viewport evidence is recorded in the detailed tracker.
- [ ] Complete visual parity, form runtime verification, SEO checks, Vercel deployment, domain cutover, rollback window, and WordPress archive.

## Phase 51 - Monorepo Orchestration and Safe Transition
- [~] Active transition plan: `docs/MONOREPO_TRANSITION_PLAN.md`.
- [x] Root orchestration commands added while retaining independent application lockfiles and current `apps/api/`, `apps/superadmin/`, `apps/resident-mobile/`, and `apps/guard-mobile/` paths.
- [x] Marketing application added directly at `apps/marketing-web/`; existing application hosting roots remain unchanged before launch.
- [ ] After launch, adopt pnpm workspaces/Turborepo and mechanically move existing applications in a dedicated infrastructure change with preview and split-repository validation.
- [ ] Do not combine path moves with feature work, dependency upgrades, database migrations, or UI refactors.

## Environment Variables (Required)
- `ADMIN_INVITE_REDIRECT_URL`
- `ONBOARDING_REQUEST_API_KEY`
- `PAYMENT_CHARGE_CRON_API_KEY`
- `PAYOUT_AUTOMATION_API_KEY`
- `NEXT_PUBLIC_ADMIN_SIGNUP_DISABLED=true`
- `NEXT_PUBLIC_API_URL`

## Notes
- 2026-07-15: Started Phase 50 and Phase 51 implementation. Added `apps/marketing-web/`, typed launch content, approved WordPress assets, parity extraction/manifests, SEO and public form proxies; added the protected backend contact-delivery path, a fifth CI lane, root independent-lockfile orchestration, and release/deployment tracking updates. Marketing lint/typecheck/tests/build passed on Next.js `16.2.10`; backend focused tests passed `8/8` and build passed. Nodemailer was upgraded to patched `9.0.3`, after which backend tests/build still passed and the production-only backend audit reported zero vulnerabilities. Visual parity, live forms, deployment/cutover, and recorded rollback remain open; a moderate transitive Next/PostCSS advisory also remains without a safe supported update.
- Invite flow includes “Set Password” modal on the superadmin sign-up page when using invite links.
- Admin writes are moving behind backend endpoints; verify any remaining admin write flows are not direct-to-Supabase.
- Shared DB types are synced from `/supabase/database.types.ts` using `scripts/sync-db-types.sh`.
- 2026-03-10: Added backend observability baseline in `/Users/andromeda/casanirvana/apps/api` with structured JSON logging, request/process exception capture, optional Sentry integration (`SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE`), and rollout notes in `/Users/andromeda/casanirvana/apps/api/OBSERVABILITY.md`.
- 2026-03-10: Extended observability coverage to `/Users/andromeda/casanirvana/apps/superadmin`, `/Users/andromeda/casanirvana/apps/resident-mobile`, and `/Users/andromeda/casanirvana/apps/guard-mobile` using the backend `/observability/client-events` ingest path, web/mobile runtime listeners, and app-level React error boundaries. Added env toggles for each app (`NEXT_PUBLIC_MONITORING_ENABLED`, `EXPO_PUBLIC_MONITORING_ENABLED`) plus optional release/environment tagging.
- 2026-03-11: Normalized the legacy public backend auth/community/unit/maintenance surfaces onto the global error path (`/Users/andromeda/casanirvana/apps/api/src/controllers/auth.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/society.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/unit.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/maintenance.ts`) and simplified `/Users/andromeda/casanirvana/apps/api/src/routes/auth.ts` to reuse `requireAuth` directly for `/auth/me`.
- 2026-03-11: Continued route-level backend error normalization for the remaining legacy public collaboration flows (`/Users/andromeda/casanirvana/apps/api/src/controllers/complaint.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/message.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/notice.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/visitor.ts`) so they now defer failures to the shared error handler instead of returning inconsistent inline `error.message` payloads.
- 2026-03-11: Normalized the next backend operations/config slice onto the shared error path (`/Users/andromeda/casanirvana/apps/api/src/controllers/payment.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/upload.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/systemSettings.ts`) while preserving existing success payload contracts for payment policy, payment queries, uploads, and system-settings reads/writes.
- 2026-03-11: Normalized the legacy admin controller surface (`/Users/andromeda/casanirvana/apps/api/src/controllers/admin.ts`) onto the shared `HttpError` + global error-handler path for analytics, user management, community management, maintenance/complaint/payment bulk operations, notices, settings, and role-permission flows while preserving the existing success payload contracts for the superadmin UI.
- 2026-03-11: Normalized `/Users/andromeda/casanirvana/apps/api/src/controllers/expresspay.ts` onto the shared backend error contract for payment initiation, callback processing, status reads, and verification failures while preserving the existing success payloads consumed by the mobile payment flows.
- 2026-03-11: Continued backend request-validation coverage by adding route-level schemas for ExpressPay callback/redirect payloads in `/Users/andromeda/casanirvana/apps/api/src/routes/expresspay.ts` and for the unvalidated admin payment read-model query surfaces (`/admin/payments/transactions`, `/admin/payments/obligations`, `/admin/payments/statements`) via `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`.
- 2026-03-11: Tightened the still-permissive admin community/unit write validation in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` by replacing generic `nonEmptyObject` contracts with passthrough typed schemas for the active superadmin community and unit management flows, preserving payload flexibility while enforcing required identifiers, numeric bounds, valid emails, and ownership-type correctness.
- 2026-03-11: Tightened the remaining broad admin profile/payment write validation in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` by replacing generic profile/payment `nonEmptyObject` contracts with passthrough typed schemas that preserve current superadmin payload flexibility while enforcing required profile identity fields, valid UUID/email/url values, and positive payment amounts on the active `/admin/profiles` and `/admin/payments` write surfaces.
- 2026-03-11: Continued Phase 6 backend hardening for the active superadmin collaboration/notification surfaces by replacing the broad `/admin/messages` request schemas with typed message create/update contracts and moving `/Users/andromeda/casanirvana/apps/api/src/controllers/adminMessages.ts` plus `/Users/andromeda/casanirvana/apps/api/src/controllers/adminNotifications.ts` onto the shared `HttpError` path. Admin message/template/campaign failures now return the normalized backend error envelope without changing the current success payload contracts used by the superadmin UI.
- 2026-03-11: Continued Phase 6 backend hardening for Email Management by moving `/Users/andromeda/casanirvana/apps/api/src/controllers/adminEmails.ts` onto the shared `HttpError` path. Scoped email list/detail/create/update failures now return the normalized backend error envelope while preserving the current `/admin/emails` success payloads used by the superadmin inbox workspace.
- 2026-03-11: Continued Phase 6 backend hardening for onboarding by moving `/Users/andromeda/casanirvana/apps/api/src/controllers/onboarding.ts` onto the shared `HttpError` path. Public onboarding create plus admin list/update failures now return the normalized backend error envelope while preserving the existing onboarding success payload contracts.
- 2026-03-11: Continued Phase 6 backend hardening for superadmin master-data CRUD by moving `/Users/andromeda/casanirvana/apps/api/src/controllers/adminCommunities.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/adminUnits.ts`, and `/Users/andromeda/casanirvana/apps/api/src/controllers/adminProfiles.ts` onto the shared `HttpError` path. Active community/unit/profile create-update-delete failures now return the normalized backend error envelope without changing the success payloads already used by the superadmin management screens.
- 2026-03-11: Continued Phase 6 backend hardening for tenant configuration flows by moving `/Users/andromeda/casanirvana/apps/api/src/controllers/adminTenantConfigurations.ts` onto the shared `HttpError` path. Community/agency configuration list, update, create, delete, and stats failures now return the normalized backend error envelope while preserving the current success payloads used by the settings configuration pages.
- 2026-03-11: Continued Phase 6 backend hardening for agency operations by moving the active directory/profile/staff/service/finance/document segments inside `/Users/andromeda/casanirvana/apps/api/src/controllers/adminAgenciesOperations.ts` onto the shared `HttpError` path. Agency operations now return the normalized backend error envelope for scope denial, invalid identifiers, lookup failures, and write failures while preserving the current success payloads used by the superadmin agency management surfaces.
- 2026-03-11: Continued Phase 6 backend hardening for guard operations by moving the active provisioning/profile/schedule/assignment/equipment/performance/training segments inside `/Users/andromeda/casanirvana/apps/api/src/controllers/adminGuardsOperations.ts` onto the shared `HttpError` path. Guard operations now return the normalized backend error envelope for scope denial, invalid identifiers, lookup failures, invite/provisioning failures, and write failures while preserving the current success payloads used by the superadmin guard management surfaces.
- 2026-03-11: Continued Phase 6 backend hardening for the ExpressPay admin settings surface by moving `/Users/andromeda/casanirvana/apps/api/src/controllers/adminPaymentGateway.ts` onto the shared `HttpError` path. ExpressPay config read/update/test failures now return the normalized backend error envelope while preserving the current success payloads consumed by the superadmin payment gateway settings page.
- 2026-03-11: Continued Phase 6 backend hardening for the notifications counter endpoint by moving `/Users/andromeda/casanirvana/apps/api/src/controllers/notifications.ts` onto the shared `HttpError` path. Notification count failures now return the normalized backend error envelope while preserving the current success payload used by the dashboard header surfaces.
- 2026-03-11: Continued Phase 6 backend hardening for the active enhanced CRUD/search surfaces by moving the remaining inline 400/404 responses in `/Users/andromeda/casanirvana/apps/api/src/controllers/amenities_enhanced.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/guards_enhanced.ts`, and `/Users/andromeda/casanirvana/apps/api/src/controllers/units_enhanced.ts` onto the shared `HttpError` path. The success payloads for those endpoints were preserved while missing-resource and phone-required failures now use the normalized backend error envelope.
- 2026-03-11: Continued Phase 6 backend hardening for the account-management API by moving `/Users/andromeda/casanirvana/apps/api/src/controllers/account.ts` fully onto the shared `HttpError` path. The user-facing `/account/delete`, `/account/deactivate`, `/account/backup/*`, and `/account/app-updates/status` endpoints now return normalized backend error envelopes while preserving their existing success payload contracts already consumed by `/Users/andromeda/casanirvana/apps/resident-mobile/services/accountService.js`.
- 2026-03-11: Continued Phase 6 backend hardening for the payment domain read/write surfaces by moving the remaining inline error branches in `/Users/andromeda/casanirvana/apps/api/src/controllers/payment.ts` onto the shared `HttpError` path across unit payment feeds, Personal Hub catalog/query/checkout/status endpoints, admin Personal Hub reporting/catalog endpoints, payment charges, and payout operations. Existing success payloads were preserved, and the current mobile/admin clients remain compatible because their fetch wrappers already read both string and structured `error` payloads.
- 2026-03-11: Closed the remaining legacy inline controller error responses by moving `/Users/andromeda/casanirvana/apps/api/src/controllers/phone.ts` onto the shared `HttpError` path as well. A repo-wide controller scan now shows no remaining inline `res.status(...).json(...)` error branches in `apps/api/src/controllers`, which means the active backend controller surface is aligned to the normalized global error envelope.
- 2026-03-11: Extended the same normalized error-contract hardening to the remaining backend middleware gates by moving `/Users/andromeda/casanirvana/apps/api/src/middleware/auth.ts` and `/Users/andromeda/casanirvana/apps/api/src/middleware/apiKey.ts` onto `HttpError` as well. After this pass, a backend-wide scan shows no remaining inline `res.status(...).json(...)` error branches anywhere under `/Users/andromeda/casanirvana/apps/api/src`, so auth, API-key, controller, and route-level failures now converge on the same global error envelope.
- 2026-03-11: Continued Phase 6 validation tightening by replacing the still-broad bulk admin schemas with typed contracts in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`. Bulk user updates now use the same allowed fields as single-user updates, bulk maintenance/complaint/payment updates reuse the active typed update schemas, and bulk notice creation now enforces the real notice payload shape (`community_id`, `title`, `body`, publication metadata) instead of accepting arbitrary objects.
- 2026-03-11: Closed the follow-up backend test slice for the normalized error-contract work. `/Users/andromeda/casanirvana/apps/api/src/middleware/validate.ts` now preserves the explicit `VALIDATION_ERROR` code, the bulk payment update contract in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` no longer leaks arbitrary passthrough keys, and new Vitest coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/error-envelope.test.ts`, `/Users/andromeda/casanirvana/apps/api/src/tests/auth-api-key-middleware.test.ts`, and `/Users/andromeda/casanirvana/apps/api/src/tests/bulk-validation-contracts.test.ts` locks in the normalized error envelope plus auth/API-key and bulk-validation failure behavior. `npm run test` and `npm run build` both passed in `/Users/andromeda/casanirvana/apps/api` after updating the legacy admin smoke test to a sandbox-safe direct middleware invocation path.
- 2026-03-11: Refreshed `/Users/andromeda/casanirvana/MANUAL_RUNTIME_QA_PACK.md` into the current coordinated release checklist: kept completed ExpressPay payment sign-off explicitly recorded, added execution-matrix ownership/status tracking, and expanded the pending runtime sections to cover visitors/entry-exit plus maintenance/complaints/help-desk alongside the existing scoped-admin, chat, service, profile, emergency, and guard-settings verification fronts.
- 2026-03-11: Paused the browser-driven runtime QA pass after it exposed two concrete production schema blockers in the live environment: `public.profiles` still enforced the pre-scope role list (rejecting `agency_manager` / `facility_manager`), and the Phase 34 guard assignment scope sync path was writing `public.users.updated_at` even though that column did not exist. Added migration `/Users/andromeda/casanirvana/supabase/migrations/20260311130500_phase35_profiles_roles_and_users_updated_at.sql`, backported the same fixes into `/Users/andromeda/casanirvana/supabase/migrations/20260206_baseline_schema.sql`, synced the checked-in DB type snapshots, and re-verified `npm run build` in `/Users/andromeda/casanirvana/apps/api` plus `/Users/andromeda/casanirvana/apps/superadmin`.
- 2026-03-11: Applied Phase 35 directly to the live Casa Nirvana Supabase project (`pswnlowvmdgeifhxilao`) and recorded migration history version `20260311130500` / `phase35_profiles_roles_and_users_updated_at` with `created_by = codex`. Verified live schema state afterward: `public.users.updated_at` exists, `users_set_updated_at` exists, and `profiles_role_check` now includes `agency_manager` plus `facility_manager`. Added reusable helper `/Users/andromeda/casanirvana/scripts/apply_supabase_migration_via_api.mjs` so future production migrations can be applied and recorded explicitly when the Supabase MCP server is unavailable in-session.
- 2026-03-11: Followed the live Phase 35 apply with direct functional verification against `pswnlowvmdgeifhxilao` instead of resuming browser QA. Temporary scoped-admin profile inserts for `agency_manager` and `facility_manager` both succeeded and cleaned up cleanly (`inserted_count = 2`, `remaining_rows_after_cleanup = 0`). A temporary `guard_assignments` insert for the QA guard (`user_id = 61e2b1e2-768e-4d01-b583-f85fe0037f63`) also succeeded and cleaned up (`inserted_count = 1`, `remaining_rows_after_cleanup = 0`), and the guard scope-sync path updated `public.users.community_id` from `null` to `11111111-1111-1111-1111-111111111111` plus advanced `public.users.updated_at` during the insert path. That confirms the two previously blocked production operations are now working against the live project.
- 2026-03-11: Applied Phase 37 live to the Casa Nirvana Supabase project (`pswnlowvmdgeifhxilao`) and recorded migration history version `20260311235500` / `phase37_guard_identity_normalization`. This normalized the remaining guard-domain identity split onto `public.guards(id)`, deduplicated `public.guards.user_id`, rewired the affected foreign keys/policies/views/functions, and aligned the superadmin guard performance/training hooks to the canonical `guards.id` contract. Postflight verification confirmed `duplicate_user_id_groups = 0`, the surviving `guard_assignments.guard_id` row now matches `guards.id`, and `guard_certifications`, `guard_performance_metrics`, `guard_performance_reviews`, `guard_schedules`, and `guard_trainings` no longer contain unresolved guard references. The migration also backed up the cleaned legacy rows in production (`1` duplicate guard row, `1` orphan guard assignment, `3` orphan guard schedules, `3` orphan guard certifications, `5` orphan guard performance metrics, `2` orphan guard performance reviews, `3` orphan guard trainings).
- 2026-03-12: Backported the Phase 37 guard-identity normalization into `/Users/andromeda/casanirvana/supabase/migrations/20260206_baseline_schema.sql` so the checked-in baseline snapshot now matches the live contract on the guard domain as well. The baseline now uses `public.guards(id)` for guard assignments/schedules/certifications/performance/trainings, includes the `guards_user_id_unique_idx` partial unique index, uses the corrected guard-name sync function plus guards-based performance views, updates the guard owner RLS policies that depend on `guard_id`, and drops the stale orphan/sample guard rows that would violate the normalized foreign keys.
- 2026-03-12: Completed the first superadmin launch wiring audit truthfulness pass for the dashboard/payment wave and added `/Users/andromeda/casanirvana/apps/superadmin/ADMIN_LAUNCH_AUDIT_CHECKLIST.md` as the route-by-route tracker. `/dashboards/analytics`, `/dashboards/agent`, `/dashboards/customer`, `/payments`, and `/payments/details` no longer ship fabricated business metrics, random guard figures, fake transaction counts, or dead launch-facing actions; they now derive from live payment, resident, visitor, guard, shift, training, and assignment data with explicit unavailable states where data cannot be truthfully produced. `npm run build` passed in `/Users/andromeda/casanirvana/apps/superadmin` after the pass. Remaining follow-up from this wave is architectural hardening for the dashboard routes that still read directly from browser-side Supabase hooks.
- 2026-03-12: Closed the remaining dashboard follow-up in the superadmin launch wiring audit by moving the three dashboard routes behind scoped backend read models: `/admin/dashboard/analytics`, `/admin/dashboard/residents`, and `/admin/dashboard/guards` in `/Users/andromeda/casanirvana/apps/api/src/controllers/adminDashboard.ts`. The superadmin dashboard components now consume backend-backed dashboard hooks instead of dashboard-only browser-side Supabase aggregation for resident, visitor, community, guard, assignment, shift, and training reporting. Added focused backend coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-dashboard-read-models.test.ts` for scoped success, scoped exclusion, empty-state behavior, and malformed query validation. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, plus `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`. The next launch-audit frontier is Wave 2 starting with Community Management.
- 2026-03-12: Completed the Wave 2 Community Management slice in the superadmin launch wiring audit. `/Users/andromeda/casanirvana/apps/api/src/controllers/adminCommunities.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/adminUnits.ts`, and `/Users/andromeda/casanirvana/apps/api/src/controllers/adminJoinRequests.ts` now provide the scoped read models needed by `/communities/*` and `/property/*`, including the new community management contract behind `GET /admin/communities/:id/management`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useCommunities.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useUnits.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useJoinRequests.ts`, and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useCommunityDirectoryMembers.ts` now use those backend contracts instead of browser-side admin reads/writes for community summaries, units, join requests, residents, directory roles, and staff. The community/property details and add/list flows were cleaned up to remove fabricated overview/management content, fix legacy route drift, preserve truthful empty states, preselect `communityId` for add-unit flows, and disable the still-unimplemented unit edit action instead of leaving broken links. Added focused backend coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-community-launch-read-models.test.ts` for scoped success, scope denial, empty-state behavior, enrichment correctness, and malformed join-request query validation. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, plus `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`. The next launch-audit frontier is the People wave in menu order: `/residents/*`, `/guards/*`, `/agency/*`, `/visitors/*`.
- 2026-03-12: Completed the People -> Residents slice in the superadmin launch wiring audit. Added `/Users/andromeda/casanirvana/apps/api/src/controllers/adminResidents.ts` plus the `/admin/residents` route family and request validation in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts` and `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`, covering scoped resident list/detail/activity/directory reads and resident create/update/delete writes. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useResidents.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useResidentActivities.ts`, and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useResidentDirectoryEntries.ts` now use those backend contracts instead of browser-side Supabase admin access. The residents list/grid/add/edit/details pages were cleaned up to remove fabricated detail content, fix the broken quick-filter logic, persist previously dropped form fields through profile preferences, sync tenant assignment via `units.tenant_id`, and disable the non-wired resident message shortcuts instead of leaving misleading actions. Added focused backend coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-resident-launch-read-models.test.ts` for scoped success, live-table aggregation, empty-state behavior, scope denial, and malformed input validation. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The stricter `npm run build:check` note from this date was later closed by the repo-wide type-check cleanup completed on 2026-03-20.
- 2026-03-12: Completed the People -> Guards slice in the superadmin launch wiring audit without introducing new backend endpoints. The active `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/guards/*` list/grid/add/manage/details routes now stay on truthful backend-backed data paths: fake summary math, placeholder detail content, broken `/guards/edit` links, dead list actions, and the unwired guard-photo upload path were removed or replaced with real behavior. Added `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useGuardDetailSnapshot.ts` to compose live guard profile, assignment, schedule, equipment, performance, and training data from the existing admin endpoints, updated `/Users/andromeda/casanirvana/apps/superadmin/src/components/operations/GuardOperationsWorkspace.tsx` so active guard operations use real guard/community selects instead of raw UUID entry, and rewired the guard detail view to show only recorded operational data with truthful empty states. Verification passed with `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` and `git diff --check`. The next launch-audit frontier is People in menu order: `/agency/*`, `/visitors/*`.
- 2026-03-12: Completed the People -> Agency slice in the superadmin launch wiring audit without introducing new backend endpoints. The active `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/agency/*` list/grid/add/manage/details routes now stay on truthful backend-backed directory and operations flows: the fake add-page logo upload and placeholder side-card content were removed, dead list/grid top controls were replaced with working workspace/filter/refresh behavior, list/grid export and delete actions are now live, and `/Users/andromeda/casanirvana/apps/superadmin/src/components/operations/AgencyOperationsWorkspace.tsx` now uses real agency selects plus readable agency names instead of raw `agency_id` entry in the active create/update flows. Verification passed with `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` and `git diff --check`. The local build was briefly blocked by disk exhaustion, which was resolved by clearing stale generated artifacts only. The next launch-audit frontier is People in menu order: `/visitors/*`, then the Operations wave.
- 2026-03-12: Completed the People -> Visitors slice in the superadmin launch wiring audit by moving the active visitor flows behind a scoped backend admin contract. Added `/Users/andromeda/casanirvana/apps/api/src/controllers/adminVisitors.ts` plus `GET/POST/PATCH/DELETE /admin/visitor-passes` and `GET /admin/visitor-passes/:id` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useVisitorPasses.ts` now uses `useAdminApi` instead of browser-side Supabase reads, actor enrichment, and direct `visitor_passes` mutations, while `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/visitors/add/components/VisitorAdd_Enhanced.tsx` no longer reads the admin actor from the browser to stamp `created_by`. Added focused backend coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-visitor-launch-read-models.test.ts` for scoped list enrichment, empty-state behavior, scope denial, create/write canonicalization, lifecycle updates, and malformed query validation. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The People wave is now complete in menu order, and the next launch-audit frontier is the Operations wave starting with `/maintenance-requests`, `/complaints`, `/help-desk/inquiries`, `/amenities/*`, and `/services/*`.
- 2026-03-12: Completed the Operations -> Maintenance Requests slice in the superadmin launch wiring audit by moving the active maintenance list/detail/update flows behind a scoped backend admin contract. Added `/Users/andromeda/casanirvana/apps/api/src/controllers/adminMaintenanceRequests.ts` plus `GET/PATCH/DELETE /admin/maintenance-requests` and `GET /admin/maintenance-requests/:id` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` and focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-maintenance-launch-read-models.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useMaintenanceRequests.ts` now uses `useAdminApi` instead of browser-side Supabase reads, direct table writes, and browser realtime subscriptions, while the active maintenance pages now let the backend own lifecycle timestamp stamping instead of sending client-authored timestamps. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`.
- 2026-03-12: Completed the Operations -> Complaints slice in the superadmin launch wiring audit by replacing the remaining browser-side complaint reads, comment writes, and metrics aggregation with a scoped backend admin contract. Added `/Users/andromeda/casanirvana/apps/api/src/controllers/adminComplaints.ts` plus `GET /admin/complaints`, `GET /admin/complaints/:id`, `GET /admin/complaints/stats`, `GET/POST /admin/complaints/:id/comments`, and scoped `POST/PATCH/DELETE /admin/complaints` wiring in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation updates in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` and focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-complaint-launch-read-models.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useComplaints.ts` now uses `useAdminApi` for complaint list/detail/stats/comments mutations instead of browser-side Supabase reads, direct `complaint_comments` inserts, and the old unscoped admin stats path; the active complaints pages were also corrected to use truthful scoped labels and backend-managed status lifecycle updates instead of implying realtime browser subscriptions or sending client-authored timestamps. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The next launch-audit frontier is Operations in menu order: `/help-desk/inquiries`, `/amenities/*`, and `/services/*`.
- 2026-03-12: Completed the Operations -> Help Desk Inquiries slice in the superadmin launch wiring audit by moving the active inquiry queue/detail/assign/respond flows behind a scoped backend admin contract. Added `/Users/andromeda/casanirvana/apps/api/src/controllers/adminInquiries.ts` plus `GET /admin/inquiries`, `GET /admin/inquiries/:id`, `GET /admin/inquiries/assignable-admins`, and `PATCH /admin/inquiries/:id` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation updates in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` and focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-inquiry-launch-read-models.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useInquiries.ts` now uses `useAdminApi` instead of browser-side Supabase reads, direct inquiry updates, browser-side assignee profile lookups, and browser realtime subscriptions; the active inquiry pages were also corrected so assignment normalization and lifecycle timestamps are backend-managed instead of being authored in the client. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The next launch-audit frontier is Operations in menu order: `/amenities/*`, then `/services/*`.
- 2026-03-12: Completed the Operations -> Amenities slice in the superadmin launch wiring audit by moving the active amenities list/add/detail/bookings flows behind a scoped backend admin contract. Added `/Users/andromeda/casanirvana/apps/api/src/controllers/adminAmenities.ts` plus `GET/POST/PUT/DELETE /admin/amenities`, `GET /admin/amenities/:id`, `GET/POST/PATCH/DELETE /admin/amenity-bookings`, and `GET /admin/amenity-bookings/:id` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation updates in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` and focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-amenity-launch-read-models.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useAmenities.ts` now uses `useAdminApi` instead of browser-side Supabase amenity/booking CRUD and realtime subscriptions, while the active amenities routes were corrected to use truthful Operations labels, backend-managed booking lifecycle updates, a launch-safe add flow without fake side-card data, and an explicit warning in place of the unwired photo upload block. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The next launch-audit frontier is Operations in menu order: `/services/*`.
- 2026-03-12: Completed the Operations -> Services slice in the superadmin launch wiring audit by moving the active service catalog and service-request flows behind scoped backend admin contracts. Added `/Users/andromeda/casanirvana/apps/api/src/controllers/adminServices.ts` plus `GET/POST/PUT/DELETE /admin/services`, `GET /admin/services/:id`, `GET /admin/service-requests`, `GET /admin/service-requests/:id`, and `PATCH /admin/service-requests/:id` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation updates in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` and focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-service-launch-read-models.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useServices.ts` and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useServiceRequests.ts` now use `useAdminApi` instead of browser-side Supabase CRUD, direct profile lookups, and browser realtime subscriptions; the active `/services` and `/service-requests` pages were also corrected to remove fake add-page scaffolding, replace the unwired upload block with explicit launch-safe messaging, let the backend own request completion stamping, and show truthful “not tracked” billing states where `service_requests` does not store payment metadata. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The Operations wave is now complete, and the next launch-audit frontier is Wave 3 Communication in menu order: `/messages`, `/inbox`, `/emergency-alerts`, `/notifications/*`, and `/post*`.
- 2026-03-12: Completed the Communication -> Messages slice in the superadmin launch wiring audit by moving the active messaging workspace behind scoped backend admin read models and existing backend write endpoints. Added `/Users/andromeda/casanirvana/apps/api/src/controllers/adminMessagesReadModels.ts` plus `GET /admin/messages/stats`, `GET /admin/messages/contacts`, `GET /admin/messages/contacts/:id`, `GET /admin/messages/conversations/:id`, `GET/POST /admin/messages/groups`, `GET /admin/messages/groups/:id`, and `GET/POST /admin/messages/groups/:id/messages` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation updates in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` and focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-message-launch-read-models.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useMessages.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useProfiles.ts`, and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useGroups.ts` now use `useAdminApi` instead of browser-side Supabase reads/writes and realtime subscriptions for the active route, while the `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/messages/*` workspace was corrected to remove fake call flows, unwired attachment uploads, placeholder profile content, and the embedded browser-side chat settings drawer from the active route. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`.
- 2026-03-12: Completed the Communication -> Email Management (`/inbox`) slice in the superadmin launch wiring audit by hardening the existing backend-backed inbox route and removing its last browser-side sensitive data path. Added focused backend coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-email-launch-read-models.test.ts` for scoped email list/detail/contact/create/update behavior plus malformed input validation around the existing `/admin/emails` contract. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useAdminEmails.ts` and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/inbox/components/EmailView.tsx` no longer open a browser-side realtime subscription to the `emails` table from the active route; the inbox now stays on backend admin contracts for list/detail/compose/update flows and refreshes through the audited admin hook instead of direct browser table access. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The next launch-audit frontier is Wave 3 Communication in menu order: `/emergency-alerts`, `/notifications/*`, and `/post*`.
- 2026-03-13: Completed the Communication -> Emergency Alerts slice in the superadmin launch wiring audit by moving the active emergency workspace behind a scoped backend admin contract. Added `/Users/andromeda/casanirvana/apps/api/src/controllers/adminEmergencyAlerts.ts` plus `GET /admin/emergency-alerts`, `GET /admin/emergency-alerts/:id`, `POST /admin/emergency-alerts`, `PATCH /admin/emergency-alerts/:id`, and `DELETE /admin/emergency-alerts/:id` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation updates in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` and focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-emergency-alert-launch-read-models.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useEmergencyAlerts.ts` now uses `useAdminApi` instead of browser-side Supabase auth, reads, writes, and realtime subscriptions; the active `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/emergency-alerts/*` workspace was also tightened so alert creation and status-resolution fields are backend-owned instead of being authored in the client. Verification passed with `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The next launch-audit frontier is Wave 3 Communication in menu order: `/notifications/*`, then `/post*`.
- 2026-03-13: Completed the Communication -> Notifications slice in the superadmin launch wiring audit by moving the active `/notifications/dashboard`, `/notifications/campaigns`, `/notifications/templates`, and `/notifications/analytics` routes behind audited backend admin contracts. Added backend read models in `/Users/andromeda/casanirvana/apps/api/src/controllers/adminNotifications.ts` plus `GET /admin/notifications/dashboard`, `GET /admin/notifications/analytics`, `GET /admin/notification-campaigns`, and `GET /admin/notification-campaigns/:id` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, tightened the notification request/query schemas in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts`, and added focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-notification-launch-read-models.test.ts` for dashboard/reporting/list/detail behavior, malformed analytics queries, scoped campaign access, scoped template usage metrics, and the campaign `title`/`name` persistence fix. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useNotificationsDashboard.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useNotificationAnalytics.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useNotificationCampaigns.ts`, and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useNotificationTemplates.ts` now use `useAdminApi`-backed polling instead of browser-side Supabase reporting reads or active-route realtime subscriptions, while the active notification route components no longer attach browser-side table listeners and the campaign/broadcast creation flows now respect community scope for scoped admins. Phase 38 is live on the Casa Nirvana Supabase project as migration `20260313103000` (`phase38_notification_campaign_tenant_scope`): `notification_campaigns.community_id` now exists, the template/community FKs are present, the status constraint now matches the active backend contract (`draft`, `scheduled`, `active`, `completed`, `paused`, `processing`, `delivered`, `failed`), and tenant-aware campaign policies are in place while legacy `NULL community_id` rows remain platform-only for global admins. Verification passed with focused and full `npm run test`, `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, `git diff --check`, and direct live-schema verification against project `pswnlowvmdgeifhxilao`. The next launch-audit frontier is Wave 3 Communication in menu order: `/post*`, then Personal Hub.
- 2026-03-13: Completed the Communication -> Notice (`/post*`) slice in the superadmin launch wiring audit by adding scoped backend admin notice contracts in `/Users/andromeda/casanirvana/apps/api/src/controllers/adminNotices.ts` plus `GET /admin/notices`, `GET /admin/notices/:id`, `POST /admin/notices`, `PATCH /admin/notices/:id`, `DELETE /admin/notices/:id`, and `GET/POST /admin/notices/:id/comments` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation updates in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` and focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-notice-launch-read-models.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useNotices.ts` and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useComments.ts` now use `useAdminApi` instead of browser-side Supabase reads, writes, and realtime subscriptions; the active `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/post/*` workspace was also tightened so notice publication requires a real scoped community selection, admin detail pages no longer mutate public view/like counts, and notice comments are truthfully labeled as resident-visible public comments instead of internal notes. Phase 39 is live on the Casa Nirvana Supabase project as migration `20260313153000` (`phase39_notice_comment_launch_hardening`): `public.comments.author_user_id` now exists with `auth.uid()` default, the scoped comment policies are `p39_comments_select_scoped`, `p39_comments_insert_scoped`, and `p39_comments_delete_admin_scoped`, comment update policy count is now `0`, and `public.increment_comment_likes(uuid)` is present for the user app like path. Verification passed with focused and full `npm run test`, `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, `git diff --check`, and direct live-schema verification against project `pswnlowvmdgeifhxilao`. The next launch-audit frontier is Wave 3 Personal Hub in menu order.
- 2026-03-13: Completed the Wave 3 Personal Hub slice in the superadmin launch wiring audit. The remaining browser-side realtime listeners were removed from `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/usePersonalHubDashboard.ts` and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/usePersonalHubReports.ts`, so the active dashboard, service workspaces, and reports pages now refresh only through the audited backend admin contracts instead of attaching direct browser listeners to Personal Hub tables. The active marketplace route was fully hardened by adding `/Users/andromeda/casanirvana/apps/api/src/controllers/adminMarketplace.ts` plus `GET /admin/personal-hub/marketplace/workspace`, `POST/PATCH /admin/personal-hub/marketplace/categories`, `POST/PATCH /admin/personal-hub/marketplace/products`, `POST/PATCH /admin/personal-hub/marketplace/vendors`, `PATCH /admin/personal-hub/marketplace/orders/:id/status`, and `PATCH /admin/personal-hub/marketplace/reviews/:id/visibility` in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, with request validation in `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` and focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-personal-hub-marketplace-launch-read-models.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useMarketplaceWorkspace.ts` now uses `useAdminApi` plus scoped backend mutations instead of browser-side Supabase reads, profile joins, writes, and realtime subscriptions for marketplace categories, products, vendors, orders, and reviews. No SQL migration was required in this slice because the existing Personal Hub and marketplace tables/RLS state already supported the audited backend contract. Verification passed with focused and full `npm run test`, `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The next launch-audit frontier is Wave 3 Settings in menu order.
- 2026-03-13: Completed the Wave 3 Settings -> App Settings slice in the superadmin launch wiring audit and applied live migration `20260313190000` (`phase40_system_settings_scoping_and_app_assets`) to the Casa Nirvana Supabase project (`pswnlowvmdgeifhxilao`). The live `public.system_settings` table now has real `subcategory` and `updated_by` columns, a composite unique key on `(category, subcategory, key)`, and the lookup index the backend settings pages were already assuming; the missing public `splash-images` storage bucket is also live with the expected 5 MB image MIME restrictions. On the backend, `/Users/andromeda/casanirvana/apps/api/src/controllers/systemSettings.ts` plus `/Users/andromeda/casanirvana/apps/api/src/services/adminSecureSettings.ts` now upsert and query settings with real category/subcategory scoping instead of the broken key-only live contract, and `/Users/andromeda/casanirvana/apps/api/src/controllers/adminSettingsAssets.ts` plus new admin routes now own splash/onboarding asset uploads and deletes. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/app/splash/page.tsx` and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/app/onboarding/page.tsx` no longer write directly to browser-side Supabase storage, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/app/extensions/page.tsx` no longer presents a fake launch-facing marketplace catalog, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/app/urls/page.tsx` no longer seeds fabricated redirect/deep-link/app-store entries into the active settings surface. Added focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-system-settings-launch-read-models.test.ts` for scoped settings persistence, asset upload/delete behavior, and route validation. Verification passed with focused and full `npm run test`, `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, `git diff --check`, and direct live-schema verification against project `pswnlowvmdgeifhxilao`. The next Settings frontier in strict menu order is Email Settings.
- 2026-03-16: Continued the Wave 3 Settings launch audit and completed the next active settings slice without UI redesign. On the backend, `/Users/andromeda/casanirvana/apps/api/src/controllers/adminSettingsWorkspaces.ts` now owns the settings workspaces for system overview, user groups, activity logs, and user preferences; `/Users/andromeda/casanirvana/apps/api/src/controllers/adminSecureSettings.ts`, `/Users/andromeda/casanirvana/apps/api/src/services/adminSecureSettings.ts`, `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`, and `/Users/andromeda/casanirvana/apps/api/src/validation/schemas.ts` were extended so integration validation can test the current unsaved form payload, and payment gateways now expose real deterministic validation for Razorpay, Stripe, PayPal, Paytm, ExpressPay, and bank transfer. Added focused coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/admin-settings-workspaces.test.ts` and `/Users/andromeda/casanirvana/apps/api/src/tests/admin-secure-settings.test.ts`. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/general/integrations/page.tsx` was rewritten into a truthful integration control center that only owns AI, direct messaging, storage, and realtime connectors while routing email, SMS, push, and payment credentials to their dedicated settings pages; `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/payment/gateways/page.tsx` now wires all active gateway validation buttons to real backend checks instead of disabled placeholders; `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/admin/users/page.tsx` now uses the shared admin API path instead of a custom token fetcher; and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/users/activity/page.tsx` no longer misreports pagination/export state. Supporting hooks were updated in `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useIntegrationSettings.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/usePaymentGatewaySettings.ts`, and the previously migrated settings hooks. No SQL migration was needed in this slice because the existing settings schema already supported the corrected contracts. Verification passed with full `npm run test` and `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The next Settings frontier in strict menu order remains Email Settings, followed by the remaining settings groups.
- 2026-03-16: Completed the Wave 3 Settings -> Email Settings audit for the active `/settings/email/*` routes. No backend contract changes were required because `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useSmtpSettings.ts`, `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useEmailTemplateSettings.ts`, and `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useEmailNotificationSettings.ts` were already using backend-backed settings flows. The production hardening in this pass was to remove hidden regression paths and tighten truthfulness: `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/email/smtp/page.tsx` no longer leaves the page editable after a settings-load failure and now states clearly that SMTP testing validates transport only; `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/email/templates/page.tsx` and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/email/notifications/page.tsx` now state their real ownership boundaries and surface backend error messages instead of generic failure copy; and the unused legacy browser-side Supabase hooks `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useEmailSettings.ts` plus `/Users/andromeda/casanirvana/apps/superadmin/src/hooks/useEmailTemplates.ts` were removed because the active settings routes no longer use them. No SQL migration was needed in this slice. Verification passed with `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` and `git diff --check`. The next Settings frontier is the remaining settings groups in sidebar order, starting with the rest of Payment Settings and Notification Setup.
- 2026-03-16: Completed the next Wave 3 Settings slice for `/settings/payment/methods`, `/settings/payment/fees`, and `/settings/notifications/*` without changing the existing IA or page shells. On the frontend, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/payment/methods/page.tsx` and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/payment/fees/page.tsx` no longer fall back to editable defaults when backend settings fail to load, now state the live checkout contract explicitly, and block the specific production-breaking case where both live checkout methods would be disabled at once. `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/notifications/push/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/notifications/sms/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/notifications/email/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/notifications/in-app/page.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/notifications/rules/page.tsx` now describe their true ownership boundaries, surface backend errors directly, and stop presenting fake runtime telemetry on the notification-rules workspace. On the backend, `/Users/andromeda/casanirvana/apps/api/src/tests/admin-secure-settings.test.ts` was extended to cover push validation secret-rotation requirements, SMS provider validation, and the default-merge behavior for payment method and payment fee settings. No SQL migration was needed in this slice because the existing settings schema already supported the corrected contracts. Verification passed with focused and full `npm run test` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/api`, `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin`, and `git diff --check`. The next Settings frontier is the remaining groups in sidebar order: Identity & Access remainder, Language Settings, General Settings, Tenant Configuration, and System Settings.
- 2026-03-16: Completed the remaining Wave 3 Settings groups in sidebar order without changing the existing layouts: `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/admin/onboarding/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/admin/roles/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/admin/security/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/language/default/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/language/localization/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/language/translations/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/general/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/general/application/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/general/system/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/general/business/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/general/security/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/general/regional/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/agencies/configuration/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/communities/configuration/page.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/system/overview/page.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/settings/system/settings/page.tsx`. The launch hardening in this pass removed the remaining unsafe fallback-edit flows after failed settings loads, replaced the last settings-specific custom token fetchers with the shared `useAdminApi` contract, converted stale overview/status copy into truthful configuration summaries, and removed active-page browser realtime listeners from the tenant configuration pages. `Module Settings` was re-audited and deliberately kept on its existing scoped server-side Next route because it already enforces admin/community scope without browser-side database access. No SQL migration was needed in this slice because the existing schema and policies already supported the corrected settings behavior. Verification passed with `npm run build` in `/Users/andromeda/casanirvana/apps/superadmin` and `git diff --check`; the stricter `npm run build:check` issue referenced at the time was later closed by the repo-wide type-check cleanup completed on 2026-03-20 and revalidated again on 2026-04-02.
- 2026-03-16: Closed the migration/RLS history-alignment follow-up before the final runtime signoff. Added `/Users/andromeda/casanirvana/supabase/migrations/ROLLBACK_NOTES.md` so every active post-baseline migration now has an explicit rollback playbook, updated `/Users/andromeda/casanirvana/supabase/migrations/README.md` to point at those notes, verified the live Casa Nirvana system-domain policies directly against `pswnlowvmdgeifhxilao`, realigned 30 active local migration filenames to the already-recorded remote versions, and repaired the missing production history rows for the remaining active local versions (`20260206234500`, `20260206235500`, `20260207001000`, `20260207002000`, `20260207003000`, `20260207004000`, `20260207005000`, `20260207006000`, `20260306180000`, `20260307191500`, `20260307203000`) with `created_by = codex-history-repair` after verifying that the live schema already contained their effects. Active local migration versions are now fully represented in the live production history table, which closes the migration-history drift that would otherwise block a clean source-of-truth push.
- 2026-03-19: Completed the remaining Phase 5 data-alignment cleanup for legacy visitors. Added `/Users/andromeda/casanirvana/supabase/migrations/20260319113000_phase41_archive_legacy_unattributed_visitor_passes.sql`, applied it live to Casa Nirvana Supabase project `pswnlowvmdgeifhxilao`, and recorded migration history version `20260319113000` / `phase41_archive_legacy_unattributed_visitor_passes` with `created_by = codex`. The migration archived and removed the 15 known legacy `visitor_passes` seed/demo rows that still lacked valid creator attribution, preserved reversible backups in `public.datafix_phase41_legacy_visitor_passes_archive` and `public.datafix_phase41_legacy_visitor_entry_logs_archive`, and backported the same seed cleanup into `/Users/andromeda/casanirvana/supabase/migrations/20260206_baseline_schema.sql`. Live verification afterward showed `unresolved_visitor_passes = 0`, `archived_visitor_passes = 15`, `archived_entry_logs = 0`, and `migration_history_rows = 1` for Phase 41.
- 2026-03-19: Started the Phase 6 coverage-expansion pass with real mounted-backend integration coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/app-mounted-integration.test.ts`. This suite exercises the live `app.ts` middleware stack without opening a network listener and now locks in `/health`, CORS and security headers, mounted admin auth failure, mounted admin permission denial, mounted authenticated onboarding-review list/update flows, mounted scoped payment stats for tenant admins plus scoped `/admin/payments` create/update/delete enforcement, mounted payment gateway, payment method, and payment fee settings read/write/test/validation coverage through the live settings routes, mounted admin capability reads, mounted admin user list/create/update plus validation coverage, mounted admin role list/update/delete coverage against the current `user_roles` and `role_permissions` schema, mounted legacy `/admin/settings` reads/writes scoped to the authenticated admin, mounted scoped community list, community management scope denial, community create/update, community directory membership upsert, unit list/create/update, and join-request list/update plus validation coverage for tenant admins, mounted scoped visitor-pass list/create flows for tenant admins, mounted scoped resident list/activity/directory/update flows plus resident create scope-denial and validation coverage for tenant admins, mounted scoped guard profile list enrichment, guard profile create scope-denial, guard schedule list, and guard assignment create/update plus validation coverage for tenant admins, mounted scoped agency directory list, scoped agency summary stats/activity, agency summary scope denial, agency staff create/update plus validation coverage, and agency services/finance/documents list-create-update plus finance validation coverage for tenant admins, mounted scoped maintenance-request list/detail/update flows for tenant admins, mounted scoped complaint list/detail/comment flows for tenant admins, mounted messaging stats/contacts read models, mounted direct-message recipient scope enforcement, mounted group creation/group-message flows, mounted help-desk inquiry list/detail/update flows, mounted inquiry assignable-admin lookup, mounted service list/detail/update-adjacent flows including scoped service visibility, service-create scope enforcement, enriched service-request detail, backend-owned service-request completion lifecycle updates, mounted amenity list/create and amenity-booking list/update flows with scoped enrichment and lifecycle checks, mounted notification dashboard/detail/create/update flows plus mounted analytics validation for the scoped campaign stack, mounted emergency-alert list/detail/create/update flows plus mounted list-query validation for scoped alert operations, mounted email list/detail/create/update/contact flows plus mounted list-query validation for scoped email operations, mounted notice list/detail/create/update/comment flows plus mounted notice-list validation for scoped publication operations, mounted account auth failure, onboarding API-key enforcement, onboarding validation failure, successful onboarding request creation, onboarding route rate limiting, and internal payout automation API-key failure through the real Express app wiring. Focused verification passed with `npx vitest run src/tests/app-mounted-integration.test.ts --reporter verbose --maxWorkers=1 --minWorkers=1`. Admin Playwright smoke and mobile regression coverage remain deferred for the later runtime/automation phase.
- 2026-03-19: Continued the Phase 6 mounted-backend pass by hardening the remaining legacy admin scope routes in `/Users/andromeda/casanirvana/apps/api/src/controllers/admin.ts` and `/Users/andromeda/casanirvana/apps/api/src/controllers/adminProfiles.ts`. Scoped admins are now blocked from out-of-scope `POST/PUT/DELETE /admin/profiles`, maintenance stats are tenant-filtered, maintenance/complaint/payment bulk operations now enforce tenant scope, `/admin/payments/generate` now uses the current `community_id` + `tenant_id`/`owner_id` schema instead of the stale `society_id`/`user_id` assumptions, and `/admin/notices/bulk-create` now rejects out-of-scope community writes. Mounted integration coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/app-mounted-integration.test.ts` now locks those legacy routes in, and the legacy router bug where `PUT /admin/payments/bulk-update` was shadowed by `PUT /admin/payments/:id` is fixed by ordering the bulk route ahead of the dynamic payment route in `/Users/andromeda/casanirvana/apps/api/src/routes/admin.ts`.
- 2026-03-19: Continued the Phase 6 mounted-backend pass by hardening the secondary financial admin routes in `/Users/andromeda/casanirvana/apps/api/src/controllers/payment.ts` and `/Users/andromeda/casanirvana/apps/api/src/services/paymentLedger.ts`. Scoped admins now receive tenant-filtered payment transactions, obligations, statements, charge templates, charge runs, and payout destinations through the live mounted app; out-of-scope transaction detail, charge template preview/issue, and payout summary access now fail with normalized scope errors; and `POST /admin/payment-charges/run-due` now requires an explicit in-scope selector unless the scoped admin has exactly one usable target. The ledger enrichment was also corrected so community scope can resolve from payer profiles when unit community linkage is absent, preventing false-positive empty scope filtering on transaction/detail/statement reads. Mounted integration coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/app-mounted-integration.test.ts` now locks in scoped `/admin/payments/transactions`, `/admin/payments/obligations`, `/admin/payments/statements`, `/admin/payment-charges/*`, and `/admin/payouts/*` behavior through the real Express app wiring.
- 2026-03-20: Continued the Phase 6 mounted-backend pass by closing the remaining financial and Personal Hub gaps in `/Users/andromeda/casanirvana/apps/api/src/controllers/payment.ts`, `/Users/andromeda/casanirvana/apps/api/src/services/payouts.ts`, and `/Users/andromeda/casanirvana/apps/api/src/tests/app-mounted-integration.test.ts`. Payment charge run detail now enforces tenant scope against the embedded serialized run instead of the outer wrapper object, scoped payout-rule updates can no longer mutate out-of-scope rule IDs, and missing cached Personal Hub provider updates now return a truthful `404` instead of a generic `400`. Mounted integration coverage now also locks in `/admin/payment-charges/catalog`, successful in-scope charge issuance plus run detail, scoped `/admin/payouts/transactions`, in-scope payout destination updates, scoped payout-rule create/update denial behavior, scoped payout-request create/approve flows, and platform-only `/admin/personal-hub/dashboard`, `/admin/personal-hub/reports`, `/admin/personal-hub/catalog/providers`, `/admin/personal-hub/catalog/packages`, and `/admin/personal-hub/catalog/sync` behavior through the real Express app wiring.
- 2026-04-02: Hardened the final Personal Hub catalog-truthfulness slice after live ExpressPay verification showed that the synced merchant-profile catalog currently exposes airtime, data, TV bill payments, and money-transfer rails, but not utility billers or insurance providers. On the user side, `/Users/andromeda/casanirvana/apps/resident-mobile/services/serviceProviderCatalogService.js` now supports explicit no-fallback catalog checks, `/Users/andromeda/casanirvana/apps/resident-mobile/screens/homeScreen.js` now disables the Insurance card when no live insurers exist and truthfully narrows the Pay Bills card to TV-only availability, and `/Users/andromeda/casanirvana/apps/resident-mobile/screens/payBillsScreen.js`, `/Users/andromeda/casanirvana/apps/resident-mobile/screens/utilitiesScreen.js`, and `/Users/andromeda/casanirvana/apps/resident-mobile/screens/insuranceScreen.js` now explicitly mark unsupported categories unavailable against the live catalog instead of looking launch-ready through fallback data. On the superadmin side, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/components/ExpressPayCatalogSyncNotice.tsx`, `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/bills/page.tsx`, and `/Users/andromeda/casanirvana/apps/superadmin/src/app/(admin)/personal-hub/insurance/page.tsx` now surface the current catalog truth directly: TV-only bill coverage today and no live insurance providers for the active merchant profile. Verification passed with `npm run build:check` in `/Users/andromeda/casanirvana/apps/superadmin`, workspace-local ESLint on the touched user files, and `git diff --check`.
- 2026-04-02: Fixed a live ExpressPay catalog-import bug after runtime verification showed MTN airtime and several send-money rails were present in the raw BillPay `SERVICES` response but missing from the cached Personal Hub provider table. `/Users/andromeda/casanirvana/apps/api/src/services/expresspayBillPay.ts` now classifies providers using the real provider name plus upstream category instead of over-trusting the external service code, which restores `MTN Prepaid` (`MTN_GH`) and the returned send-money rails such as `MTN_MM`, `AIRTELTIGO_MM`, `VODA_MM`, and `MVISA` into the synced catalog. The same pass now preserves `is_enabled_for_app` choices across future sync runs so admin enable/disable decisions do not get reset every time the ExpressPay catalog is refreshed. Added focused regression coverage in `/Users/andromeda/casanirvana/apps/api/src/tests/expresspay-billpay.test.ts`, and re-ran a live catalog sync against Casa Nirvana’s active BillPay config: `imported_count = 25`, `raw_status_text = Success`, with `Port Studio` remaining excluded because it is still classified by ExpressPay as `OTHER` and not a supported Personal Hub service type. Verification passed with `npm run test -- --maxWorkers=1 --minWorkers=1 src/tests/expresspay-billpay.test.ts`, `npm run build` in `/Users/andromeda/casanirvana/apps/api`, and `git diff --check`.
- 2026-03-20: Continued the Phase 6 mounted-backend pass by closing the remaining settings and admin-control plane gaps in `/Users/andromeda/casanirvana/apps/api/src/tests/app-mounted-integration.test.ts`, `/Users/andromeda/casanirvana/apps/api/src/controllers/adminSettingsWorkspaces.ts`, and `/Users/andromeda/casanirvana/apps/api/src/services/adminSecureSettings.ts`. Mounted integration coverage now locks in `/admin/settings/system-overview` plus alert dismissal, `/admin/settings/user-groups` list/stats/members/create/update/delete, `/admin/settings/activity-logs` list/stats/export, `/admin/settings/preference-categories`, `/admin/settings/preference-settings` list/stats/create/update/delete, `/admin/settings/smtp`, `/admin/settings/integrations`, `/admin/settings/business`, `/admin/settings/regional`, `/admin/settings/security-privacy`, `/admin/settings/general-system`, `/admin/settings/push`, `/admin/settings/sms`, `/admin/payment-gateways/expresspay/*`, and `/admin/system-settings*` through the real Express app wiring. This pass also fixed a real mounted-stack defect where settings activity-log export was mutating the live request query object instead of forwarding a cloned query, and hardened the secure-settings update contract so SMTP, integration, push, and SMS update responses no longer echo freshly submitted secrets back to the admin client.

### 2026-07-19 - Phase 50 rendered-site capture checkpoint

- [x] Captured the live Saliver/Elementor rendered site mechanically rather than recreating its design.
- [x] Recorded 107 public HTML routes and 636 runtime assets in `apps/marketing-web/public/wordpress-snapshot/manifest.json`.
- [x] Routed successful captures through Next.js manifest-driven rewrites without replacing native marketing API handlers.
- [x] Passed the marketing production build and restarted the production preview on port 3001.
- [ ] Complete route-by-route parity evidence at all required viewports.
- [ ] Replace WordPress-only form/AJAX behavior and normalize production SEO origins.
- [ ] Resolve or intentionally remove the source-broken `/our-services/` link during final content cleanup.

### 2026-07-19 - Phase 50 launch implementation sequence

- [x] Created `MARKETING_SITE_LAUNCH_IMPLEMENTATION_PLAN.md` with route tiers, seven execution stages, acceptance gates, evidence requirements, and rollback controls.
- [ ] Complete P0 fidelity evidence before redesign, content replacement, or route pruning.
- [ ] Remove WordPress production runtime dependencies while retaining the approved captured interface.
- [ ] Replace public forms and approved dynamic behavior with native Next.js/backend flows.
- [ ] Build the application-backed product claims matrix and typed Casa Nirvana content source.
- [ ] Approve the final 107-route keep/replace/redirect/remove map.
- [ ] Complete SEO, accessibility, performance, Vercel deployment, cutover, and rollback gates.

### 2026-07-19 - Phase 50 P0 parity evidence checkpoint

- [x] Created the P0 route and six-viewport parity matrix.
- [x] Removed all committed `localhost:8882` references through a repeatable repository normalization command.
- [x] Restored direct HTTP 200 behavior for WordPress-style trailing-slash P0 URLs.
- [x] Passed the marketing production build and restarted port 3001.
- [ ] Complete six-viewport visual signoff in a browser with local workspace access.
- [ ] Remove remaining WordPress control-plane runtime and replace Contact Form 7 behavior.

### 2026-07-19 - Phase 50 WordPress runtime detachment checkpoint

- [x] Removed authenticated WordPress admin/editor runtime from all captured documents.
- [x] Removed WordPress REST, AJAX, XML-RPC, oEmbed, and Contact Form 7 JavaScript dependencies.
- [x] Preserved public design and animation runtimes plus Contact Form 7 visual CSS.
- [x] Passed the marketing production build and restarted port 3001.
- [ ] Connect the preserved form markup to native Next.js contact/onboarding endpoints.
- [ ] Record browser network and interaction evidence with WordPress Studio stopped.

### 2026-07-19 - Phase 50 native marketing forms checkpoint

- [x] Bound preserved full contact forms to the native same-origin contact API.
- [x] Added accessible validation, status handling, honeypot forwarding, and duplicate-submit protection.
- [x] Connected Home email CTAs to the native onboarding route with safe email prefill.
- [x] Preserved the approved WordPress form appearance while removing Contact Form 7 runtime behavior.
- [x] Passed syntax, production build, injection, CSS-preservation, and prefill checks; restarted port 3001.
- [ ] Run controlled backend contact and onboarding delivery tests with approved test data.
- [ ] Record browser evidence for all form states and required viewports.

### 2026-07-19 - Phase 50 controlled delivery evidence

- [x] Restored Casa Nirvana Supabase and verified `ACTIVE_HEALTHY` status.
- [x] Added normalized network-failure handling to contact and onboarding proxies.
- [x] Passed end-to-end onboarding delivery and verified the pending Supabase row.
- [x] Confirmed contact failure is safely normalized and caused by missing SMTP password configuration.
- [ ] Configure the encrypted SMTP password through secure administration and pass contact delivery.
- [ ] Decide whether the synthetic onboarding evidence row should be retained or deleted.
- [ ] Complete browser form-state evidence.

### 2026-07-19 - Phase 50 Product Claims Audit

- [x] Created `MARKETING_SITE_PRODUCT_CLAIMS_MATRIX.md` as the launch copy source of truth.
- [x] Mapped safe claims to implemented resident, guard, superadmin, backend, and visitor lifecycle evidence.
- [x] Recorded conditional and prohibited claims for SMTP, push delivery, pricing, Personal Hub provider availability, production guarantees, and app availability.
- [x] Excluded WordPress demos, unrelated commerce content, template-only admin surfaces, fabricated proof points, and MockingBird material.
- [ ] Replace mirrored WordPress/demo copy route by route using the claims matrix while preserving exact visual parity.
- [ ] Return to SMTP configuration and contact delivery acceptance when the owner supplies the missing SMTP details.

### 2026-07-19 - Phase 50 Home Content Pass 1

- [x] Established a repeatable snapshot content-transform workflow that does not require WordPress recapture for editorial changes.
- [x] Replaced 90 Home demo/unsupported text and link values without restructuring the mirrored UI.
- [x] Refreshed snapshot integrity metadata and passed the marketing production build.
- [ ] Owner manual review of Home at desktop and mobile widths.
- [ ] Continue exact-markup content replacement with `/about-us/` and `/our-products/`.

### 2026-07-19 - Phase 50 About and Products Content Pass 1

- [x] Replaced unsupported/demo About copy while preserving the mirrored WordPress layout.
- [x] Replaced unsupported/demo Products copy and portfolio links while preserving the mirrored WordPress layout.
- [x] Removed fabricated certifications, testimonials, metrics, commercial promises, and Saliver identity/contact information from these routes.
- [x] Passed the marketing production build and refreshed the port 3001 preview.
- [ ] Owner manual review of `/about-us/` and `/our-products/` at desktop and mobile widths.
- [ ] Continue with `/residents/` and `/security-guards/`.

### 2026-07-19 - Phase 50 Residents and Guards Content Pass 1

- [x] Replaced resident-route demo copy with implementation-backed and provider-qualified wording.
- [x] Replaced guard-route demo copy with implementation-backed gate, communication, and incident wording.
- [x] Preserved the mirrored WordPress structures and refreshed snapshot metadata.
- [x] Passed the marketing production build and refreshed the port 3001 preview.
- [ ] Owner manual review of `/residents/` and `/security-guards/` at desktop and mobile widths.
- [ ] Continue with `/facility-managers/` and `/marketplace/`.

### 2026-07-19 - Phase 50 Facility Managers and Marketplace Content Pass 1

- [x] Replaced facility-management demo copy with implementation-backed administrative wording.
- [x] Replaced marketplace demo copy with implemented and availability-qualified marketplace wording.
- [x] Preserved the mirrored WordPress structures and refreshed snapshot integrity metadata.
- [x] Passed the marketing production build and refreshed the port 3001 preview.
- [ ] Owner manual review of `/facility-managers/` and `/marketplace/` at desktop and mobile widths.
- [ ] Continue with `/pricing-plans/` and `/core-features/`.

### 2026-07-19 - Phase 50 Pricing and Core Features Content Pass 1

- [x] Converted Pricing to contact-led rollout scopes without unapproved commercial terms.
- [x] Replaced Core Features demo copy with verified and qualified Casa Nirvana capabilities.
- [x] Preserved mirrored WordPress structures and refreshed snapshot integrity metadata.
- [x] Passed the marketing production build and refreshed the port 3001 preview.
- [ ] Owner manual review of `/pricing-plans/` and `/core-features/` at desktop and mobile widths.
- [ ] Continue with `/faqs/` and `/contact-us/`.

### 2026-07-19 - Phase 50 FAQs and Contact Content Pass 1

- [x] Replaced FAQ agency-template content with Casa Nirvana product and rollout answers.
- [x] Replaced Contact Saliver identity, fake contact details, and generic enquiry options.
- [x] Preserved mirrored form styling and truthful SMTP-unavailable behavior.
- [x] Passed the marketing production build and refreshed the port 3001 preview.
- [ ] Owner manual review of `/faqs/` and `/contact-us/` at desktop and mobile widths.
- [ ] Supply SMTP credentials and complete contact delivery acceptance later.
- [ ] Continue legal/navigation/footer route reconciliation and excluded-route containment.

### 2026-07-19 - Phase 50 Route Containment and Legal Draft Gate

- [x] Restricted WordPress snapshot rewrites to the approved public launch routes.
- [x] Redirected excluded legacy/demo route families to appropriate Casa Nirvana destinations.
- [x] Normalized shared navigation/footer wording and route targets across all approved snapshots.
- [x] Marked Privacy and Terms as drafts pending explicit legal approval.
- [x] Passed the production build and refreshed the port 3001 preview.
- [ ] Obtain and record legal approval for Privacy Policy and Terms of Service.
- [ ] Reconcile SEO metadata, sitemap, robots and canonical coverage with the launch allowlist.

### 2026-07-19 - Phase 50 SEO Reconciliation

- [x] Added unique snapshot titles, descriptions, canonicals, social metadata and structured data.
- [x] Reconciled sitemap with approved indexable launch routes.
- [x] Added robots protection for APIs and direct snapshot duplicates.
- [x] Marked draft legal pages noindex and excluded them from sitemap.
- [x] Passed the production build and refreshed the port 3001 preview.
- [ ] Confirm the final production canonical domain and `NEXT_PUBLIC_SITE_URL` value.
- [ ] Verify social previews and canonical output on the deployed preview URL.
- [ ] Continue accessibility and performance hardening.

### 2026-07-19 - Phase 50 Accessibility and Performance Hardening

- [x] Added skip navigation, focus-visible and reduced-motion support to approved snapshot routes.
- [x] Added accessible fallbacks for legacy fields, images, iframes and new-tab links.
- [x] Removed nonessential WordPress/WooCommerce runtime scripts from launch routes.
- [x] Added immutable static-asset caching and safe response headers.
- [x] Added and passed the 11-route static snapshot audit.
- [x] Passed the marketing production build and refreshed the port 3001 preview.
- [ ] Complete manual keyboard and screen-reader acceptance.
- [ ] Record six-viewport route parity evidence.
- [ ] Prepare preview deployment and environment/cutover checklist.

### 2026-07-19 - Phase 50 Manual Acceptance and Deployment Preparation

- [x] Created the six-viewport, 11-route manual acceptance matrix.
- [x] Added keyboard, assistive technology, forms, SEO, performance, legal and rollback evidence gates.
- [x] Added production environment validation and a secret-free production template.
- [x] Added preview noindex response protection.
- [x] Updated Vercel build gates and passed the local production build.
- [ ] Owner completes and records manual Chrome/Safari parity evidence.
- [ ] Confirm `NEXT_PUBLIC_SITE_URL` and canonical production domain.
- [ ] Configure required Vercel preview environment values and deploy preview.
- [ ] Complete SMTP and legal approval gates before production cutover.

### 2026-07-19 - Confirmed Production Domains

- [x] Confirmed marketing origin: `https://casanirvana.app`.
- [x] Confirmed superadmin origin: `https://admin.casanirvana.app`.
- [x] Updated active canonical, SEO, environment, legal and application URL references.
- [x] Regenerated and audited all approved snapshot metadata.
- [x] Passed backend, superadmin and marketing production builds.
- [ ] Confirm matching Vercel production/preview environment values before deployment promotion.

## 2026-07-19 - Phase 51 mechanical monorepo transition completed locally

- [x] Moved the API to `apps/api` using a history-preserving Git move.
- [x] Moved the superadmin application to `apps/superadmin` using a history-preserving Git move.
- [x] Moved the resident mobile application to `apps/resident-mobile` using a history-preserving Git move.
- [x] Moved the guard mobile application to `apps/guard-mobile` using a history-preserving Git move.
- [x] Retained the marketing application at `apps/marketing-web`.
- [x] Updated root orchestration commands, CI working directories, split-repository prefixes, database-type synchronization, and operational documentation.
- [x] Retained independent application lockfiles; no package-manager migration, dependency hoisting, dependency upgrade, database migration, or feature refactor was included.
- [x] Root `npm run build` passed for `apps/api`, `apps/superadmin`, and `apps/marketing-web`.
- [x] Marketing production preview restarted from `apps/marketing-web` on `http://localhost:3001`.
- [x] Committed and published the transition as `66f6aa02`; remote `main` was fast-forwarded to the same commit so Vercel can see `apps/marketing-web` and `apps/superadmin`.
- [ ] Change hosting roots only after publication: marketing Vercel `apps/marketing-web`, superadmin Vercel `apps/superadmin`, Render API `apps/api`, resident EAS `apps/resident-mobile`, and guard EAS `apps/guard-mobile`.
- [ ] Keep the previous production root settings as the rollback boundary until each moved application passes deployment smoke checks.
- Note: the superadmin build reported only non-blocking optional `sharp` and outdated Browserslist data warnings; dependency cleanup remains a post-transition polish item.
## 2026-07-19 - Phase 50 production route acceptance

- [x] Completed a 72-state production route matrix for the 12 approved marketing routes at the six required viewport sizes.
- [x] Confirmed no horizontal overflow, broken images, or browser console errors in the matrix.
- [x] Preserved the WordPress-derived hero layout while removing the empty response bar and remaining encoded Saliver/demo copy.
- [x] Pushed production cleanup commits `f9b94666` and `6a4bbd82` to the launch branch and `main`.
- [ ] Phase 50 remains open for legal approval, SMTP delivery evidence, Preview environment parity, final route-by-route visual signoff, and rollback evidence.
## 2026-07-19 - Phase 50 navigation hardening

- [x] Routed approved footer destinations and removed stale WordPress navigation targets.
- [x] Verified pointer and keyboard mobile-navigation behavior in production with synchronized accessibility state.

## 2026-07-19 - Phase 50 About Us Manual Content Review

- [x] Stopped route-wide scripted content editing for the editorial refinement pass.
- [x] Audited and manually corrected only the duplicated three-panel capability section on `/about-us/`.
- [x] Preserved the mirrored WordPress structure and visual behavior while giving each panel a distinct product purpose.
- [ ] Owner approval of the revised section remains open.
- [ ] Continue through the About page one visible section at a time before moving to another route.

## 2026-07-21 - Phase 50 About Us Role Summary Section

- [x] Audited and manually refined the second reviewed About content section without using the batch transformer.
- [x] Removed unsupported adoption and partnership wording.
- [x] Clarified the separate resident, security-guard and facility-management responsibilities while preserving the mirrored UI.
- [ ] Owner approval of the revised section remains open.
- [ ] Continue the About route one visible section at a time.

## 2026-07-21 - Phase 50 About Us Configured Services Section

- [x] Audited and manually refined the configured-services section without using the batch transformer.
- [x] Qualified service availability against enabled community modules and the live provider catalog.
- [x] Preserved the mirrored section structure and retained the existing contact-route CTA destination.
- [ ] Owner approval of the revised section remains open.
- [ ] Continue the About route one visible section at a time.

## 2026-07-21 - Phase 50 About Us Security Section

- [x] Audited and manually refined the four-card security section.
- [x] Removed unsupported ISO and SOC 2 claims and prevented inherited certification badges from remaining visible.
- [x] Replaced the claims with implementation-backed access, data-boundary, visibility and operational-record language.
- [x] Preserved the card containers, spacing and animations without using the batch transformer.
- [ ] Owner approval of the revised section remains open.
- [ ] Continue the About route one visible section at a time.

## 2026-07-21 - Phase 50 About Us Product Principles Section

- [x] Audited and manually refined all four Product Principles tab states.
- [x] Removed fabricated testimonial presentation, unrelated logo controls and stock customer portraits.
- [x] Added four implementation-backed principles with meaningful tab labels while preserving the mirrored component behavior.
- [x] Avoided the batch transformer and kept the change isolated to this section.
- [ ] Owner approval of the revised content and tab behavior remains open.
- [ ] Continue the About route one visible section at a time.

## 2026-07-21 - Phase 50 About Us Demo CTA Section

- [x] Audited and manually refined the About demo CTA without using the batch transformer.
- [x] Replaced generic promotional promises with a concrete community-rollout discussion.
- [x] Preserved the mirrored CTA structure and existing contact-route destination.
- [ ] Owner approval of the revised section remains open.
- [ ] Continue the About route one visible section at a time.

## 2026-07-21 - Phase 50 About Us Rollout Benefits Section

- [x] Audited and manually refined the final three-column About content block.
- [x] Removed unsupported discount and universal-connectivity claims.
- [x] Added implementation-backed rollout, role-context and operational-progress wording without changing the mirrored layout.
- [ ] Owner approval of the revised section remains open.
- [ ] Audit shared footer content and links before closing the About editorial pass.

## 2026-07-21 - Phase 50 About Us Footer and Link Audit

- [x] Audited the About footer independently and corrected stale positioning, duplicate links and dead destinations.
- [x] Hid unavailable social and language controls without removing their mirrored layout containers.
- [x] Kept the change route-specific and avoided a cross-route batch replacement.
- [ ] Owner visual and link approval remains open.
- [ ] About page-specific editorial work is complete pending owner approval; continue to the next route section by section.

## 2026-07-21 - Phase 50 Our Products Introduction Section

- [x] Started the Products route with a focused audit and manual edit of its introduction only.
- [x] Replaced generic and overstated platform language with implementation-backed role and module positioning.
- [x] Preserved the mirrored introduction layout and avoided the batch transformer.
- [ ] Owner approval of the revised introduction remains open.
- [ ] Continue through Products one visible section at a time.

## 2026-07-21 - Phase 50 Our Products Capability Panels

- [x] Reviewed and corrected the four `/our-products/` capability panels as an isolated editorial scope.
- [x] Removed vague metric framing, corrected the maintenance typo and retained the exact WordPress-derived layout structure.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner visual and editorial approval remains open.
- [ ] Continue with the next Products section independently.

## 2026-07-21 - Phase 50 Our Products Role CTA

- [x] Reviewed and corrected the post-capabilities Products CTA without changing its visual structure or animation.
- [x] Replaced generic language with accurate role-experience positioning and normalized button capitalization.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner visual and editorial approval remains open.
- [ ] Continue with the Products selector as a separate scope.

## 2026-07-21 - Phase 50 Our Products Role Selector

- [x] Audited the Products role selector and removed all four inherited demo destinations.
- [x] Connected each selector item to its matching Casa Nirvana product route and improved hover-image accessibility text.
- [x] Preserved the mirrored list, image and transition structure.
- [ ] Owner interaction and visual approval remains open.
- [ ] Continue with the Products carousel as a separate scope.

## 2026-07-21 - Phase 50 Our Products Capability Carousel

- [x] Audited and differentiated all six Products carousel cards without changing carousel behavior or layout.
- [x] Corrected image accessibility labels, aligned the About card and replaced the dead trailing CTA.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner interaction, copy and visual approval remains open.
- [ ] Continue with the Products marquee as a separate scope.

## 2026-07-21 - Phase 50 Our Products Marquee

- [x] Replaced the generic Products marquee phrase without removing the duplicate node required by its loop animation.
- [x] Preserved the exact WordPress-derived marquee structure and behavior.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner motion, copy and visual approval remains open.
- [ ] Continue with the next Products content section independently.

## 2026-07-21 - Phase 50 Our Products FAQ

- [x] Audited all Products FAQ categories, questions and answers as one bounded accordion scope.
- [x] Removed inherited agency framing, unsupported integration claims and malformed copy.
- [x] Preserved the exact WordPress-derived accordion structure and behavior.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner copy and interaction approval remains open.
- [ ] Continue with the Products contact section independently.

## 2026-07-21 - Phase 50 Our Products Contact Section

- [x] Audited and refined the Products contact section without restructuring its form or visual layout.
- [x] Aligned the visible copy with community rollout and retained the fields expected by the static form bridge.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] SMTP-backed delivery evidence and owner form-state approval remain open.
- [ ] Continue with the Products footer as a separate scope.

## 2026-07-21 - Phase 50 Our Products Footer and Link Audit

- [x] Audited the Products footer independently and corrected stale positioning, duplicate links and dead destinations.
- [x] Hid unavailable social and language controls without removing their mirrored layout containers.
- [x] Reorganized product navigation around valid Casa Nirvana routes and retained legal destinations.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner visual and link approval remains open.
- [x] Removed the inherited placeholder telephone URI from the Products contact identity block.
- [ ] Products page-specific editorial work is complete pending owner approval and SMTP-backed contact delivery evidence.

## 2026-07-21 - Phase 50 Our Products Contact Identity Closeout

- [x] Corrected the final known Products contact identity defect without changing its visual structure.
- [x] Replaced the fake telephone destination with the valid Contact route and recorded the evidence.
- [ ] Owner link approval and SMTP-backed contact delivery evidence remain open.

- [ ] Social profile destinations remain blocked on approved URLs.
- [ ] Preview environment parity remains blocked on the decision to use isolated preview API keys or protected reuse of production keys.
## 2026-07-21 - Phase 50 Residents Opening Capability Grid

- [x] Started the Residents route with a bounded audit of its opening heading and capability grid.
- [x] Removed inherited monetization framing, differentiated repeated content and improved image accessibility labels.
- [x] Preserved the exact WordPress-derived structure and animations.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner visual and editorial approval remains open.
- [ ] Continue with the Residents marquee as a separate scope.

## 2026-07-21 - Phase 50 Residents Opening Marquee

- [x] Corrected only the first Residents marquee and retained the three-node loop structure.
- [x] Removed unsupported AI customer-service language without changing motion or layout.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner motion, copy and visual approval remains open.
- [ ] Continue with the next Residents content section independently.

## 2026-07-21 - Phase 50 Residents Core Features Grid

- [x] Corrected inherited demo data and unsupported integration claims across the Residents Core Features grid.
- [x] Preserved the exact four-card structure, image assets, animation hooks and visual footprint.
- [x] Connected the rollout CTA to the valid Contact route and recorded the implementation evidence.
- [ ] Owner visual, copy and interaction approval remains open.
- [ ] Continue with the next Residents section independently.

## 2026-07-21 - Phase 50 Residents Workflow Panels

- [x] Audited the four resident workflow panels and retained implementation-backed content.
- [x] Made only targeted copy and accessibility corrections while preserving the mirrored two-row layout.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner visual and editorial approval remains open.
- [ ] Continue with the Residents connected-workflows tabs as a separate scope.

## 2026-07-21 - Phase 50 Residents Connected-Workflows Tabs

- [x] Removed inherited SaaS and unsupported automation claims from the Residents tabs section.
- [x] Preserved the exact tab interactions and visual structure while adding image accessibility labels.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner interaction, copy and visual approval remains open.
- [ ] Continue with the next Residents section independently.

## 2026-07-21 - Phase 50 Residents Profile Summary

- [x] Corrected the post-tab resident summary without changing its visual structure.
- [x] Removed a mismatched description, an empty self-link and inherited stock portrait visibility.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner visual and editorial approval remains open.
- [ ] Continue with the Residents benefits section independently.

## 2026-07-21 - Phase 50 Residents Benefits Section

- [x] Corrected the malformed Residents benefits heading and differentiated all six benefit points.
- [x] Preserved the exact three-column structure and animation sequence while improving image labels and link markup.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner visual and editorial approval remains open.
- [ ] Continue with the lower Residents marquee as a separate scope.

## 2026-07-21 - Phase 50 Residents Lower Marquee

- [x] Removed the remaining inherited AI customer-service language from the lower Residents marquee.
- [x] Preserved the exact three-node loop structure and animation behavior.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner motion, copy and visual approval remains open.
- [ ] Continue with the next Residents section independently.

## 2026-07-21 - Phase 50 Residents Product Carousel

- [x] Removed all six inherited portfolio destinations from the Residents image carousel.
- [x] Connected every slide to a valid Casa Nirvana route and improved image accessibility labels.
- [x] Preserved the exact carousel behavior and visual structure.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner carousel interaction and visual approval remains open.
- [ ] Continue with the Residents overview section independently.

## 2026-07-21 - Phase 50 Residents Overview Section

- [x] Removed unsupported automation claims and repeated generic copy from the Residents overview.
- [x] Corrected image labels and the dead demo CTA without changing visual structure.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Residents owner verification pass.
- [ ] Continue with the Residents download section independently.

## 2026-07-21 - Phase 50 Residents Download Panel

- [x] Removed an unverified QR download claim and unrelated revenue-strategy wording from the Residents page.
- [x] Preserved the exact panel geometry while hiding the unsupported QR asset.
- [x] Recorded the implementation evidence and future store-link dependency.
- [ ] Include this section in the consolidated Residents owner verification pass.
- [ ] Continue with the following Residents rollout CTA independently.

## 2026-07-21 - Phase 50 Residents Rollout CTA

- [x] Replaced the dead Residents documentation control with a valid rollout CTA.
- [x] Preserved the original CTA layout, styling and reveal animation.
- [x] Recorded the implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Residents owner verification pass.
- [ ] Continue with the Residents contact section independently.

- [x] Completed the CTA image-label closeout and confirmed no separate Residents contact-form section exists.
- [ ] Continue directly with the Residents footer audit.
## 2026-07-21 - Phase 50 Residents Footer and Route Closeout

- [x] Corrected the Residents footer and route-wide fake language controls without altering layout containers.
- [x] Removed inherited positioning, unsupported links and dead destinations.
- [x] Completed the Residents page-specific editorial implementation pass.
- [x] Recorded route evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner consolidated visual, interaction and copy approval remains open.
- [ ] Store destinations remain pending before resident download controls can be enabled.

## 2026-07-21 - Phase 50 Security Guards Opening Capability Grid

- [x] Started the Security Guards route with a bounded audit of its opening heading and capability grid.
- [x] Removed inherited hub, asset, e-commerce and duplicated-card language without altering the mirrored design.
- [x] Added accurate image labels and recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the first Security Guards marquee independently.

## 2026-07-21 - Phase 50 Security Guards Opening Marquee

- [x] Corrected only the first Security Guards marquee and retained its three-node animation loop.
- [x] Removed unsupported AI customer-service language without changing layout or motion.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Security Guards Core Features grid independently.

## 2026-07-21 - Phase 50 Security Guards Core Features Grid

- [x] Removed inherited multi-cloud, browser, commerce, location and third-party integration claims from the guard feature grid.
- [x] Differentiated all four cards around visitor verification, entry activity, assigned access and guard workflow status.
- [x] Preserved the exact grid, image assets, icon footprints, rollout CTA and animation hooks.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Security Guards workflow panels independently.

## 2026-07-21 - Phase 50 Residents QR and Footer Brand Row Correction

- [x] Restored the Residents QR visual to match the equivalent homepage treatment.
- [x] Shortened footer positioning to prevent the brand row from being crowded.
- [x] Restored visible social glyphs without enabling dead or unapproved destinations.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner visual approval remains open.

## 2026-07-21 - Phase 50 Residents Footer Logo Restoration

- [x] Confirmed through live DOM comparison that the Residents footer lacked the homepage logo widget.
- [x] Restored the approved homepage logo structure and asset in the matching Residents footer column.
- [x] Preserved the compact copy, social-icon geometry and footer navigation layout.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Use this verified treatment for remaining route footers while leaving the homepage unchanged.

## 2026-07-21 - Phase 50 Footer Logo Size Standard

- [x] Matched the Residents footer wordmark to the homepage's live `132 × 32px` dimensions.
- [x] Prevented oversized rendering from clipping the complete Casa Nirvana logo to its icon.
- [x] Recorded this exact size for all remaining route footer passes without changing the homepage.
- [ ] Owner visual approval remains open after deployment.

## 2026-07-21 - Phase 50 Security Guards Workflow Panels

- [x] Differentiated all four guard workflow panels without changing the mirrored two-row layout.
- [x] Corrected the description mapping before release so each heading has its intended operational copy.
- [x] Added distinct image labels and recorded evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the connected-workflows tabs independently.

## 2026-07-21 - Phase 50 Security Guards Connected-Workflows Tabs

- [x] Removed generic SaaS and unsupported automation claims from the guard tabs section.
- [x] Retained the three accurate guard tab labels and added distinct screenshot accessibility labels.
- [x] Preserved tab IDs, interactions, active states, imagery and animation hooks.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the post-tab profile summary independently.

## 2026-07-21 - Phase 50 Security Guards Profile Summary

- [x] Corrected the post-tab guard summary without changing its visual structure.
- [x] Removed a mismatched heading, an empty self-link and inherited stock portrait visibility.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the benefits section independently.

## 2026-07-21 - Phase 50 Security Guards Benefits Section

- [x] Corrected the malformed guard benefits heading while retaining six distinct, supported benefit statements.
- [x] Added image labels and removed a stale WordPress link-error marker without changing the layout.
- [x] Preserved the exact three-column structure and animation sequence.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the lower marquee independently.

## 2026-07-21 - Phase 50 Security Guards Lower Marquee

- [x] Removed the final inherited AI customer-service language from the lower guard marquee.
- [x] Preserved its exact three-node loop, decorative imagery and animation behavior.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the product carousel independently.

## 2026-07-21 - Phase 50 Security Guards Product Carousel

- [x] Removed all six inherited portfolio destinations from the guard carousel.
- [x] Connected each slide and overlay to a valid Casa Nirvana route and improved image labels.
- [x] Preserved carousel autoplay, looping, responsive counts, spacing and visual structure.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the overview section independently.

## 2026-07-21 - Phase 50 Security Guards Overview Section

- [x] Removed unsupported automation claims and duplicated generic copy from the guard overview.
- [x] Corrected image labels and the dead demo CTA without changing visual structure.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this section in the consolidated Security Guards owner verification pass.
- [ ] Continue with the Guard experience QR panel independently.

## 2026-07-21 - Phase 50 Security Guards Experience QR Panel

- [x] Removed inherited download and revenue-strategy wording from the guard experience panel.
- [x] Retained the approved visible QR treatment and added a guard-specific label.
- [x] Preserved the panel layout, decorative highlights and geometry.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this panel in the consolidated Security Guards owner verification pass.
- [ ] Continue with the rollout CTA independently.

## 2026-07-21 - Phase 50 Security Guards Rollout CTA

- [x] Replaced the dead documentation control with a valid guard rollout CTA.
- [x] Added the missing guard-experience image label.
- [x] Preserved the original layout, styling and reveal animation.
- [x] Recorded implementation evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Include this CTA in the consolidated Security Guards owner verification pass.
- [ ] Continue with the footer and route closeout.

## 2026-07-22 - Phase 50 Security Guards Footer and Route Closeout

- [x] Added the homepage-sized Casa Nirvana footer wordmark and compact positioning copy.
- [x] Restored visible social glyphs without enabling unapproved destinations and hid fake language controls.
- [x] Removed inherited, unsupported and dead footer destinations and mapped every navigation label to its intended Casa Nirvana route.
- [x] Completed the Security Guards page-specific editorial implementation pass.
- [x] Recorded route evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- [ ] Owner consolidated visual, interaction and copy approval remains open.
- [ ] Continue with the Facility Managers route after Security Guards verification.

### 2026-07-22 - Phase 50 Facility Managers route

- [x] Completed the Facility Managers route content and navigation pass section by section while preserving the WordPress-derived visual structure.
- [x] Applied the standard non-homepage footer treatment and retained the shared QR panel.
- [x] Replaced inherited demo/portfolio links with valid Casa Nirvana destinations.
- [x] Passed the marketing production build on Next.js 16.2.10 with all 22 static pages generated.
- [ ] Owner visual parity signoff at desktop and mobile viewports.
- [ ] Confirm the final approved QR destination before launch freeze.

### 2026-07-22 - Phase 50 Marketplace route

- [x] Completed the Marketplace route content and navigation pass section by section while preserving the WordPress-derived visual structure.
- [x] Replaced inherited SaaS/integration claims and differentiated resident and administrative marketplace workflows.
- [x] Applied the standard non-homepage footer treatment and retained the shared QR panel.
- [x] Replaced inherited portfolio/demo links with valid Casa Nirvana destinations.
- [x] Passed the marketing production build on Next.js 16.2.10 with all 22 static pages generated.
- [ ] Owner visual parity signoff at desktop and mobile viewports.
- [ ] Confirm the final approved marketplace QR destination before launch freeze.

### 2026-07-22 - Phase 50 Marketplace deployment correction

- [x] Identified the failed Vercel promotion as a missing mirrored footer-logo asset caught by `audit:snapshot`.
- [x] Corrected Facility Managers and Marketplace footer wordmark paths to an existing owned asset.
- [x] Added occurrence-aware Marketplace content transforms for distinct feature and administration cards.
- [x] Replaced remaining inherited vendor/location labels with marketplace workflow terms.
- [x] Passed transform syntax, the 11-route snapshot audit and the 22-page production build.
- [ ] Confirm the new production deployment displays the corrected Marketplace content on `casanirvana.app`.

### 2026-07-22 - Phase 50 Pricing Plans route

- [x] Completed the Pricing Plans route section by section while preserving the WordPress-derived layout.
- [x] Removed malformed and unsupported numeric pricing in favor of contact-led commercial labels.
- [x] Added distinct rollout-scope descriptions and direct contact actions across both pricing templates.
- [x] Repaired corrupted comparison-table rows and removed irrelevant demo terminology.
- [x] Updated the pricing transform to prevent future overlapping price replacements.
- [x] Applied the standard non-homepage footer treatment.
- [x] Passed transform syntax, the 11-route snapshot audit and the 22-page production build.
- [ ] Owner visual parity signoff at desktop and mobile viewports.
- [ ] Approve final commercial scope wording before launch freeze.

### 2026-07-22 - Phase 50 Core Features route

- [x] Completed the Core Features route section by section while preserving the WordPress-derived visual structure.
- [x] Removed inherited AI, SaaS, no-code automation, Slack, deployment and revenue-strategy claims.
- [x] Differentiated repeated product, workflow, lifecycle and rollout components with supported Casa Nirvana content.
- [x] Corrected integration and access-control language and completed the route FAQ content.
- [x] Added occurrence-aware transforms to preserve distinct repeated-component copy after future extraction.
- [x] Applied the standard non-homepage footer treatment.
- [x] Passed transform syntax, the 11-route snapshot audit and the 22-page production build.
- [ ] Owner visual parity signoff at desktop and mobile viewports.

### 2026-07-22 - Phase 50 Core Features content refinement

- [x] Replaced repetitive how-it-works copy with a distinct configuration, invitation and role-focused workflow sequence.
- [x] Kept the WordPress-derived structure unchanged and synchronized the capture transform.

### 2026-07-22 - Phase 50 FAQs route

- [x] Audited and completed all FAQ groups without changing the WordPress-derived accordion layout.
- [x] Replaced inherited agency category labels with Casa Nirvana access, capability and operations groupings.
- [x] Refined integration and operational-status answers to match configured product behavior.
- [x] Corrected the direct email destination and removed the fake telephone link.
- [x] Applied the standard non-homepage footer treatment and synchronized regeneration mappings.
- [x] Passed transform syntax, the 11-route snapshot audit and the 22-page production build.
- [ ] Owner visual parity signoff at desktop and mobile viewports.
- [ ] Verify production contact-form delivery after SMTP configuration is available.

### 2026-07-22 - Phase 50 FAQs capability-carousel correction

- [x] Repointed all six broken remote icon URLs to existing local SVG assets.
- [x] Added distinct content for every capability card and corrected the Facility Management label.
- [x] Synchronized occurrence-aware card copy and asset mappings for future extraction.

### 2026-07-22 - Phase 50 Contact Us route

- [x] Audited and completed the Contact Us route without changing its WordPress-derived layout or form styling.
- [x] Corrected the direct email destination and removed the fake telephone link.
- [x] Replaced the inherited London map with an accessible Accra, Ghana embed.
- [x] Made the message prompt community-specific and retained the approved enquiry categories.
- [x] Applied the standard non-homepage footer treatment and synchronized regeneration mappings.
- [x] Passed transform syntax, the 11-route snapshot audit and the 22-page production build.
- [ ] Owner visual parity signoff at desktop and mobile viewports.
- [ ] Verify production contact-form delivery after SMTP configuration is available.

### 2026-07-22 - Phase 50 Privacy Policy route

- [x] Replaced the short placeholder with an implementation-aligned privacy notice draft.
- [x] Covered website, authentication, community workflows, visitor/access activity, requests, communications, marketplace, payment-status, technical and support data categories.
- [x] Added purpose, sharing, international-processing, retention, security, rights and children's-information sections.
- [x] Corrected privacy and general contact addresses to the `.app` domain.
- [x] Recorded official Ghana Data Protection Commission and Act 843 references.
- [x] Passed the 11-route snapshot audit and 22-page production build.
- [ ] Obtain legal approval for production publication.
- [ ] Confirm Casa Nirvana and community controller/processor roles contractually.
- [ ] Approve the processor list, transfer safeguards and category-specific retention schedule.
- [ ] Record Ghana DPC registration and compliance evidence.
- [ ] Owner visual parity signoff at desktop and mobile viewports.

### 2026-07-22 - Phase 50 Terms of Service route

- [x] Replaced the short placeholder with implementation-aligned terms covering the current product and user roles.
- [x] Added account, community-administration, visitor/security, acceptable-use, marketplace, payment, fee, content, availability and suspension provisions.
- [x] Distinguished provider-returned payment status from seller or provider fulfilment.
- [x] Corrected the legal contact address to the `.app` domain.
- [x] Recorded official Bank of Ghana provider and consumer-recourse references.
- [x] Passed the 11-route snapshot audit and 22-page production build.
- [ ] Obtain legal approval for production publication.
- [ ] Confirm the contracting entity, eligibility, governing law, venue and dispute process.
- [ ] Approve commercial schedules, cancellation, refund, liability and termination provisions.
- [ ] Confirm configured payment-provider terms, approved status and consumer-recourse path.
- [ ] Owner visual parity signoff at desktop and mobile viewports.

### 2026-07-22 - Phase 50 approved-route production release audit

- [x] Audited all 13 approved production routes for titles, H1s, stale references, placeholder links, broken loaded images, form presence and browser errors.
- [x] Confirmed correct route identity, zero broken loaded images and no captured browser warnings or errors.
- [x] Replaced the homepage `404` footer item with Contact and corrected the remaining `.com` email destination.
- [x] Connected the Core Features, FAQs and Contact footer actions to valid routes.
- [x] Changed the non-interactive Core Features `One` marker from an empty anchor to a semantic span while retaining its visual class.
- [x] Synchronized all corrections in the WordPress capture transform.
- [x] Passed transform syntax, the 11-route snapshot audit and the 22-page production build under Node 22.
- [x] Confirmed commit `ce789406` corrections on the production domain through the Codex browser.
- [ ] Owner visual parity signoff at desktop and mobile viewports.

### 2026-07-22 - Phase 50 role-aware onboarding flow

- [x] Replaced the generic Get Started form entry with a resident and community-team gateway.
- [x] Added resident new-user and existing-user onboarding guidance aligned with the implemented mobile join-request workflow.
- [x] Moved and expanded the manager form under `/get-started/community/` without introducing a database migration.
- [x] Added rollout metadata, explicit acknowledgement, request reference handling and Superadmin review visibility.
- [x] Kept Contact and onboarding APIs separate and corrected conversion destinations by CTA intent.
- [x] Added audience-route sitemap entries and form-validation coverage.
- [ ] Confirm the production resident app download/deep-link URL.
- [ ] Configure SMTP and add applicant/internal onboarding notifications.
- [x] Versioned the native WordPress form compatibility asset across all approved routes to invalidate stale immutable browser caches.
- [x] Passed four marketing tests, transform syntax, the 11-route snapshot audit, the 24-route marketing build and the 237-route Superadmin build under Node 22.
- [x] Verified the deployed gateway, both resident tab flows, manager form/email handoff, Contact separation and role-aware production CTA destinations through the Codex browser.
- [x] Aligned the onboarding header navigation and conversion actions with the mirrored site header and added reduced-motion-safe onboarding animations.
- [x] Verified the deployed desktop header geometry, exact menu order, dual actions, zero horizontal overflow and live onboarding animation states through the Codex browser.

### 2026-07-22 - Phase 50 header parity checkpoint

- Replaced the standalone Next.js onboarding navigation approximation with the copied WordPress/Saliver primary, sticky-pill, and mobile header patterns.
- Production verification confirmed reversible sticky behavior, source geometry, and no horizontal overflow.
- Marketing snapshot audit, tests, and production build passed; mobile viewport signoff remains open under the Phase 50 parity gate.

### 2026-07-22 - Phase 50 canonical header correction

- Replaced the reduced React/CSS header transcription with runtime extraction of the approved homepage snapshot header and its exact Elementor/Saliver dependencies.
- Same-viewport production comparison confirmed desktop primary/sticky header parity and zero overflow.
- Mobile visual parity remains open under the existing Phase 50 route signoff gate.

### 2026-07-22 - Phase 50 primary-header visibility correction

- Corrected wrapper clipping so the approved primary header is visible before the sticky transformation.
- Production verified the top and scrolled states independently with zero horizontal overflow.

### 2026-07-22 - Phase 50 onboarding viewport parity checkpoint

- [x] Audited all three onboarding routes at the six required desktop, tablet and mobile viewports.
- [x] Confirmed responsive stacking, zero horizontal overflow, mobile navigation behavior, resident tab states and accessible community-form validation.
- [x] Added and deployed the 1201-1350px compatibility rule needed to keep the approved desktop header on one row.
- [x] Confirmed the `7.0.3` narrow-header correction in a fresh Codex browser document at 1280px: 66px primary header, hidden language control and zero horizontal overflow.
- [ ] Replace the visually incorrect Saliver logo artwork with the approved Casa Nirvana wordmark; previous "Casa Nirvana wordmark" completion labels were inaccurate and must not be treated as launch evidence.
- [ ] Configure the approved resident app destination.
- [ ] Configure and verify onboarding/contact delivery when SMTP details are provided; this remains intentionally deferred.
- [ ] Complete owner parity signoff for the onboarding route group after the open dependencies above are resolved.

### 2026-07-22 - Phase 50 homepage responsive parity checkpoint

- [x] Audited the homepage at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, responsive hero-form sizing, footer presence and correct desktop/mobile header switching.
- [x] Versioned the child-theme stylesheet across only the 11 approved snapshots so the 1201-1350px header correction cannot be hidden by the old browser cache key.
- [x] Removed unsafe broad transform mappings and confirmed the approved-route transform is idempotent on a second run.
- [x] Verified the live homepage at 1280x800 with a 66px one-row header, hidden placeholder language control and no horizontal overflow.
- [ ] Approved Casa Nirvana wordmark installation and owner visual signoff remain open.
- Evidence commit: `083c69e2`.

### 2026-07-22 - Phase 50 About Us responsive parity checkpoint

- [x] Audited About Us at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, no repeated section headings, footer presence and correct header switching.
- [x] Removed unused Three.js/hover-effect loads and guarded optional Saliver animation targets without changing valid route animations.
- [x] Verified the production route reports no browser warnings or errors after deployment.
- [ ] Add the required marketing environment variables to Vercel Preview; production deployment is successful, while branch Preview remains blocked by intentional release-environment validation.
- [ ] Approved Casa Nirvana wordmark installation and owner visual signoff remain open.
- Evidence commit: `94063de5`.

### 2026-07-22 - Phase 50 Our Products responsive parity checkpoint

- [x] Audited Our Products at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, no repeated section headings, footer presence and correct header switching.
- [x] Verified a clean browser console and functional mobile product-FAQ expansion.
- [ ] Approved Casa Nirvana wordmark installation and owner visual signoff remain open.

### 2026-07-22 - Phase 50 Residents responsive parity checkpoint

- [x] Audited Residents at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, no repeated section headings, footer presence, correct header switching and a clean browser console.
- [x] Verified the resident QR at 158x158 and normalized non-home footer logo dimensions to the homepage-approved 132x32 size.
- [ ] Approved Casa Nirvana wordmark installation and owner visual signoff remain open.
- Evidence commit: `6f0ddf24`.

### 2026-07-22 - Phase 50 Security Guards responsive parity checkpoint

- [x] Audited Security Guards at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, no repeated section headings, footer presence and correct header switching.
- [x] Corrected Saliver animation dependency order and cache versions across approved snapshots.
- [x] Verified five heading-animation targets, valid rollout links, a clean browser console and the 132x32 mobile footer logo.
- [ ] Approved Casa Nirvana wordmark installation and owner visual signoff remain open.
- Evidence commit: `51f1b0f4`.

### 2026-07-22 - Phase 50 Facility Managers responsive parity checkpoint

- [x] Audited Facility Managers at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, no repeated headings or Order status labels, footer presence and correct header switching.
- [x] Verified the 158x158 management QR, 132x32 mobile footer logo, hidden language placeholders and a clean browser console.
- [ ] Approved Casa Nirvana wordmark installation and owner visual signoff remain open.

### 2026-07-22 - Phase 50 Marketplace responsive parity checkpoint

- [x] Audited Marketplace at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, no repeated headings or Order status labels, footer presence and correct header switching.
- [x] Verified differentiated Cart contexts, the 158x158 marketplace QR, 132x32 mobile footer logo and a clean browser console.
- [ ] Approved Casa Nirvana wordmark installation and owner visual signoff remain open.

### 2026-07-22 - Phase 50 Pricing Plans responsive parity checkpoint

- [x] Audited Pricing Plans at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, no repeated headings, footer presence and correct header switching.
- [x] Verified the restored Support label, zero numeric currency remnants, three distinct rollout scopes, valid commercial actions, 132x32 footer logo and clean console.
- [ ] Owner visual signoff, final commercial wording approval and approved Casa Nirvana wordmark installation remain open.

### 2026-07-22 - Phase 50 Core Features responsive parity checkpoint

- [x] Audited Core Features at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, footer presence, correct header switching and a clean browser console.
- [x] Verified the distinct configure/invite/role sequence, intentional role-card brand labels, functional mobile accordion and 132x32 footer logo.
- [ ] Approved Casa Nirvana wordmark installation and owner visual signoff remain open.

### 2026-07-22 - Phase 50 FAQs responsive parity checkpoint

- [x] Audited FAQs at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, no repeated headings, footer presence, correct header switching and a clean browser console.
- [x] Verified six distinct local capability icons/descriptions, functional mobile FAQ expansion and the 132x32 footer logo.
- [ ] SMTP delivery verification, approved Casa Nirvana wordmark installation and owner visual signoff remain open.

### 2026-07-22 - Phase 50 Contact Us responsive parity checkpoint

- [x] Audited Contact Us at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, one contact form, one Accra map, footer presence and no fresh production browser warnings or errors.
- [x] Corrected Contact-versus-email-CTA routing, added accessible field-error relationships and verified Support query preselection without changing the approved WordPress-derived layout.
- [x] Rotated the adapter cache key and verified the corrected production asset, full client-side validation and 132x32 mobile footer logo.
- [ ] Successful SMTP delivery, duplicate-submit production behavior, approved Casa Nirvana wordmark installation and owner visual signoff remain open.
- Evidence commits: `a5fe72b6`, `7ce9b01f`.

### 2026-07-22 - Phase 50 Privacy Policy responsive parity checkpoint

- [x] Audited Privacy Policy at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, footer presence and no fresh production browser warnings or errors.
- [x] Verified 12 implementation-aligned sections, visible draft status and `noindex, nofollow` metadata pending legal approval.
- [x] Removed the shared React footer's base and responsive size conflicts and verified the production logo container at 132x32.
- [ ] Final legal approval, approved Casa Nirvana wordmark installation and owner visual signoff remain open.
- Evidence commits: `07f5ac2c`, `44709aa3`.

### 2026-07-22 - Phase 50 Terms of Service responsive parity checkpoint

- [x] Audited Terms of Service at all six required desktop, tablet and mobile viewports.
- [x] Confirmed zero overflow, zero broken loaded images, footer presence and no fresh production browser warnings or errors.
- [x] Verified 15 distinct implementation-aligned sections, no repeated headings, visible draft status, `noindex, nofollow` metadata and the 132x32 shared footer.
- [ ] Final legal approval, approved Casa Nirvana wordmark installation and owner visual signoff remain open.

### 2026-07-22 - Phase 50 required-route responsive sequence complete

- [x] Completed the six-viewport production sequence for every approved marketing route, all role-aware onboarding routes, Contact Us, Privacy Policy and Terms of Service.
- [ ] SMTP delivery, legal/commercial approval, Preview environment configuration, approved brand artwork and owner visual signoff remain release gates.

## Phase 52 - Superadmin Launch Audit and Information Architecture

### 2026-07-24 - Client navigation reliability blocker

- [x] Reproduced the production navigation hang in the Codex browser and identified repeated Choices.js initialization as the browser main-thread blocker.
- [x] Corrected the shared `ChoicesFormInput` lifecycle so rerenders do not create duplicate plugin instances or leak native event listeners.
- [ ] Record production deployment and multi-route browser evidence before closing this launch blocker.

- Detailed tracker: `SUPERADMIN_LAUNCH_AUDIT_CHECKLIST.md`.
- Machine-readable route inventory: `SUPERADMIN_ROUTE_MANIFEST.json`.
- [x] Confirmed the active Superadmin root is `apps/superadmin` and active root scripts, CI paths, split-repository prefixes and database-type synchronization use the monorepo structure.
- [x] Established the 23 July 2026 baseline at 241 filesystem routes; the previous 237-route count is superseded. The active compatibility inventory is temporarily 255 after adding canonical Communities, Units, Residents, Guards and Agencies lifecycle routes alongside legacy redirects.
- [x] Added repeatable route-manifest generation and route-contract tests before changing navigation.
- [x] Passed all three route-contract tests, strict `build:check` and the environment-gated production build for the Phase 52 foundation slice.
- [ ] Track the optional `sharp` recommendation and stale Browserslist data under the later dependency-security slice.
- [ ] Complete Application Shell, Dashboards, Community Management, People, Operations, Communication, Personal Hub, Notifications/Notices, Settings and inherited-route slices in strict order.
- [ ] Consolidate Communities, Units, Residents, Guards, Agencies and Visitors into canonical grid-default directories with URL state and remembered preference.
- [x] Consolidated Residents at `/residents?view=grid|list` with grid default, remembered preference, shared backend pagination/search/status state, one sidebar destination and compatibility redirects for both legacy view routes (2026-07-23).
- [x] Normalized Resident create/details/edit to `/residents/add`, `/residents/{id}` and `/residents/{id}/edit`; removed unwired upload/dead actions and retained legacy query-string redirects (2026-07-23).
- [ ] Record authenticated production browser evidence for the Resident directory and create/details/edit lifecycle.
- [x] Consolidated Guards at `/guards?view=grid|list` with grid default, remembered preference, normalized backend pagination/search/status state, one sidebar directory entry, preserved `/guards/manage`, and compatibility redirects for both legacy view routes (2026-07-23).
- [x] Normalized Guard details to `/guards/{id}`, retained an intentional legacy query-string redirect, and kept assignment changes in the authorized `/guards/manage` workspace (2026-07-23).
- [ ] Add `/guards/{id}/edit` only after a scoped backend Guard profile update contract exists; no cosmetic or client-only edit route is permitted.
- [ ] Record authenticated production browser evidence for the Guard directory, canonical details and management deep links.
- [x] Consolidated Agencies at `/agencies?view=grid|list` with grid default, remembered preference, normalized scoped backend pagination/search/status state, one sidebar directory entry, preserved `/agency/manage`, and compatibility redirects for both legacy view routes (2026-07-23).
- [x] Recorded passing Agency directory evidence: 6 directory/route contracts, scoped mounted backend test, API build, Superadmin `build:check`, and standalone 243-page production build.
- [x] Normalized Agency create/details/edit to `/agencies/add`, `/agencies/{id}` and `/agencies/{id}/edit`, including scoped base/profile synchronization and legacy redirects (2026-07-23).
- [x] Recorded passing Agency lifecycle evidence: 9 lifecycle/directory/route contracts, scoped mounted synchronization test, API build, Superadmin `build:check`, and standalone 244-page production build.
- [ ] Record authenticated production browser evidence for the Agency directory and lifecycle.
- [ ] Retire or redirect inherited/demo routes only after each route receives an explicit disposition and compatibility check.

## Phase 53 - Backend and Database Release Hardening

- [ ] Audit each retained Superadmin page against its backend endpoint, authorization scope and database dependencies during Phase 52.
- [ ] Complete final RLS, orphan, foreign-key, exposed-view, archive-table, index, function, storage-policy and migration-history checks.
- [ ] Rerun Supabase Security and Performance Advisors after deliberate schema or policy changes.

## Phase 54 - Resident Mobile Launch Audit

- [ ] Begin screen-level launch audit after relevant backend contracts are stable.
- [ ] Track navigation, authentication, deep links, offline behavior, permissions, notifications, payments and visitor workflows in the existing mobile signoff checklist.

## Phase 55 - Guard Mobile Launch Audit

- [ ] Begin screen-level launch audit after relevant backend contracts are stable.
- [ ] Track authentication, camera/QR permissions, visitor operations, resident directory scope, emergency workflows, notifications and release configuration.
### 2026-07-23 - Phase 52 Application Shell Reliability Slice

- [x] Stabilized authenticated shell navigation without router mutation during render.
- [x] Replaced template profile actions and static identity with the signed-in administrator session.
- [x] Moved the top-bar notification bell to backend-owned, current-user-scoped read/update contracts.
- [x] Added truthful loading, empty, error, breadcrumb, footer, and global not-found behavior.
- [x] Recorded passing focused API tests, backend build, route-contract tests, Superadmin build check, and production build in `SUPERADMIN_LAUNCH_AUDIT_CHECKLIST.md`.
- [ ] Complete centralized route-policy enforcement, forbidden-state coverage, and production browser evidence before closing the Application Shell group.
### 2026-07-23 - Phase 52 Central Route Policy Slice

- [x] Added the centralized frontend route-policy contract for all currently capability-backed Guard and Agency routes.
- [x] Added direct-navigation blocking with consistent forbidden and authorization-unavailable states.
- [x] Preserved backend authorization and tenant scope as the security authority.
- [ ] Extend the route-policy map as each later menu group receives an explicit backend capability contract.
- [ ] Record production browser evidence before closing the Application Shell group.
### 2026-07-23 - Phase 52 Casa Nirvana Analytics Dashboard Slice

- [x] Traced every rendered metric and chart to backend-owned scoped records.
- [x] Removed unsupported template imagery, map behavior, internal QA actions, and misleading comparison labels.
- [x] Added truthful loading, failure, empty, currency, period, and navigation states.
- [ ] Record authenticated production desktop/mobile evidence before final route signoff.
### 2026-07-23 - Phase 52 Residents Dashboard Slice

- [x] Confirmed `/dashboards/agent` as the current Residents dashboard and traced every section to `/admin/dashboard/residents` or backend payment records.
- [x] Removed stock identity imagery, unsupported ranking/goal language, and misleading collection labels.
- [x] Added truthful roster errors, initials fallbacks, accessible progress, and grid-default links.
- [ ] Normalize the legacy `/dashboards/agent` route during the later canonical route transition.
- [ ] Record authenticated production desktop/mobile evidence before final route signoff.

### 2026-07-23 - Phase 52 Guards dashboard slice

- [x] Audited `/dashboards/customer` against the backend-owned guard dashboard read model.
- [x] Preserved valid staffing, salary, performance, training, shifts and assignment metrics.
- [x] Removed unsupported/template visuals and fake guard identity fallbacks.
- [x] Added truthful loading, empty and backend-failure states to the audited dashboard panels.
- [x] Recorded passing automated evidence: 3 guard contracts, 3 route contracts, 6 backend dashboard tests, backend build, Superadmin `build:check`, and standalone 237-page production build.
- [ ] Record production browser verification after deployment.

### 2026-07-23 - Phase 52 Guard details lifecycle slice

- [x] Added canonical `/guards/{id}` details backed by the existing scoped Guard operations snapshot.
- [x] Converted `/guards/details?id=...` to an intentional permanent redirect and normalized directory/provisioning navigation.
- [x] Preserved `/guards/manage` as the supported assignment and operations workspace.
- [x] Confirmed the backend exposes create, list and delete profile contracts but no authorized Guard profile update contract; `/guards/{id}/edit` remains deliberately unshipped.
- [x] Recorded passing automated evidence: 9 Guard lifecycle/directory/route contracts, scoped mounted backend test, API build, Superadmin `build:check`, and standalone 242-page production build.
- [ ] Record authenticated production browser evidence after deployment.

### 2026-07-23 - Phase 52 Communities unified directory slice

- [x] Added canonical `/communities` grid-default directory with accessible grid/list controls.
- [x] Preserved view, search, status, sort and pagination state in the URL when switching modes.
- [x] Persisted each administrator browser's last Communities view preference.
- [x] Reused one backend query, mutation set and paginated result for both views.
- [x] Added canonical create/detail/edit links and legacy grid/list redirects.
- [x] Reduced the sidebar to one Communities directory entry.
- [x] Recorded passing automated evidence: 4 Communities contracts, 3 route contracts, Superadmin `build:check`, and standalone 238-page production build.
- [ ] Record production browser verification after deployment.

### 2026-07-23 - Phase 52 Communities visual-parity correction

- [x] Restored the pre-consolidation Community statistics, filter sidebar, image-backed cards, spacing and actions.
- [x] Retained canonical `/communities` routing and the persisted `?view=grid|list` toggle without replacing the approved UI.
- [x] Established visual preservation as the default for the remaining directory consolidation slices.
- [x] Aligned legacy Community summary/grid request limits with the backend maximum of 200 after authenticated production requests confirmed validation failures above that limit.
- [x] Restored the full-width Community list table and removed the grid-only filter sidebar from list mode while retaining the shared URL-backed toggle.
- [ ] Record build and authenticated production evidence after deployment.

### 2026-07-23 - Phase 52 Guards visual-parity correction

- [x] Restored the pre-consolidation Guard overview, statistics and detailed grid-card presentation.
- [x] Retained the canonical `/guards?view=grid|list` route, shared toggle, scoped data and canonical actions.
- [ ] Point Render at the monorepo `apps/api` root and record authenticated production evidence against the matching backend revision.

### 2026-07-23 - Phase 52 Units unified directory slice

- [x] Added canonical `/units` grid-default directory using the shared accessible view controls.
- [x] Preserved view, search, community, status, sort and pagination state in the URL.
- [x] Reused one scoped backend query and mutation set for both directory views.
- [x] Added canonical unit creation and backend-owned scoped detail routes.
- [x] Redirected legacy property grid/list/add/detail routes and reduced the sidebar to one Units entry.
- [x] Removed fake property media, bookmarks, unsupported map embedding and incorrect dollar labels.
- [x] Implement canonical `/units/{id}/edit` after validating the complete unit create/update contract, including scoped backend authorization, removal of the unsupported `ownership_type` API requirement, and canonical post-save routing. Automated evidence: `unit-lifecycle-contract.test.mjs`, route-contract tests, backend Community Management tests, Superadmin `build:check` and production build (2026-07-23).
- [ ] Record authenticated production browser evidence for the canonical Unit create/details/edit lifecycle.
- [x] Recorded passing automated evidence: 5 Units contracts, 3 route contracts, Superadmin `build:check`, and standalone 240-page production build.
- [ ] Record production browser verification after deployment.

### 2026-07-23 - Phase 52 Units visual-parity correction

- [x] Restored the pre-consolidation Unit filter panel, image grid, statistics and full-width image list.
- [x] Added the shared URL-backed grid/list toggle to both approved presentations.
- [x] Kept canonical Unit create/details/edit routes, removed unsupported bookmark behavior and corrected currency to GH₵.
- [ ] Record authenticated production evidence after deployment.

### 2026-07-23 - Phase 52 Community Join Requests slice

- [x] Moved Join Request search, status filtering and pagination to the scoped backend contract.
- [x] Preserved filter/page state in canonical URL parameters.
- [x] Restricted approve/reject actions to pending and manual-review records.
- [x] Required rejection notes and exposed reviewer name/time for completed reviews.
- [x] Added truthful loading, empty, failure and mutation-pending states.
- [x] Recorded passing automated evidence: 3 Join Request contracts, 7 backend community tests, 3 route contracts, Superadmin `build:check`, and standalone 240-page production build.
- [ ] Record production browser verification after deployment.

### 2026-07-23 - Phase 52 Community lifecycle slice

- [x] Replaced the canonical detail route's backward redirect with a backend-owned scoped Community details page.
- [x] Converted legacy query-string details to a permanent canonical redirect.
- [x] Added authorized agency selection and preserved validated management fields in create/update payloads.
- [x] Normalized create, update and cancel navigation to canonical Community routes.
- [x] Removed unsupported photo upload, fabricated resident estimate and incorrect dollar labels.
- [x] Added explicit edit loading and scope/error states.
- [x] Recorded passing automated evidence: 3 Community lifecycle contracts, 7 backend community tests, 3 route contracts, Superadmin `build:check`, and standalone 240-page production build.
- [ ] Record production browser verification after deployment.

### 2026-07-23 - Phase 52 visual-parity recovery track

- [x] Established a visual-only recovery rule: restore approved demo-era composition without restoring fabricated records or undoing canonical routes, authorization, grid/list consolidation, and database work.
- [x] Restored the canonical Unit details page composition using the live Unit/Community/Owner response.
- [ ] Complete Unit create/edit visual restoration.
- [ ] Complete Community lifecycle and Join Requests visual restoration.
- [ ] Complete Residents, Guards, and Agencies visual restoration.
- [ ] Complete dashboard visual restoration and production signoff.

### 2026-07-24 - Phase 52 Unit create/edit visual recovery

- [x] Preserved the approved Unit create/edit composition while removing sample Unit, Bangalore, dollar currency and fabricated form defaults.
- [x] Kept canonical routes, live Community selection, scoped mutations and post-save behavior unchanged.

### 2026-07-24 - Phase 52 expired-session recovery

- [x] Diagnosed the production refresh failure as competing NextAuth/browser Supabase refresh-token ownership.
- [x] Made NextAuth the sole refresh owner and added centralized one-retry/clean-sign-out handling for protected API 401 responses.

### 2026-07-24 - Phase 52 Community details and resource-action recovery

- [x] Audited canonical resource grid create actions; added the missing Add Unit action with Community context preservation.
- [x] Replaced Unit tour scheduling with a Casa Nirvana Community/occupancy panel.
- [x] Restored Community details visual composition using live scoped records and canonical links.

### 2026-07-24 - Phase 52 Community create/edit visual recovery

- [x] Restored the approved image-led Community form preview and removed fabricated create defaults.
- [x] Preserved live create/edit behavior, scoped Agency selection and canonical routing.

### 2026-07-24 - Phase 52 Join Requests visual recovery

- [x] Restored status summaries and richer request cards using backend-owned counts and records.
- [x] Preserved scoped review mutations, pagination, filtering and rejection-note enforcement.
### 2026-07-24 - Phase 52 Residents directory visual recovery

- Restored the approved Residents grid overview and retained the original avatar-led cards without changing canonical routes or live data behavior.
- Preserved the clean full-width list view, shared grid/list toggle, filters, pagination, create action, and scoped mutations.
### 2026-07-24 - Phase 52 Resident child-route audit

- Completed the Resident details, create, and edit audit without replacing their approved UI components.
- Retained live profile activity and directory records, validated mutations, and canonical routes; removed fake preview identity copy and corrected Community terminology.
- Deferred the decorative legacy photo dropzone because it has no persistence contract and would misrepresent functionality.
### 2026-07-24 - Phase 52 demo-UI source-of-truth correction

- Added a mandatory rule that every page audit starts from the original pre-audit demo implementation, not a later hardened approximation.
- Corrected the Residents grid by restoring its original illustrated three-card overview with live data and canonical routing.
### 2026-07-24 - Phase 52 Guards directory demo-UI recovery

- Restored the original Guards grid overview and full avatar-led list table from pre-audit source history.
- Kept live data, canonical routes, shared view switching, filters, pagination, assignment workspace, and scoped mutations.
### 2026-07-24 - Phase 52 Guard profile and add-flow recovery

- Restored the original Guard profile and add-flow visual shell from pre-audit source history.
- Kept all operational and provisioning data live; excluded fabricated demo metrics and the nonfunctional photo uploader.
