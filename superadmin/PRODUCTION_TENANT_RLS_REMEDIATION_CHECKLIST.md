# Superadmin Production Tenant + RLS Remediation Checklist

Date: 2026-02-20
Owner: Platform Engineering
Status: P0 Complete, Runtime QA Pending

## Objective
- Enforce strict multi-tenant isolation (`agency -> community -> profile/user`) across superadmin authentication, APIs, and database policies.
- Remove permissive legacy policy behavior that can cause cross-tenant exposure.
- Keep implementation auditable, reversible, and testable before release.

## Guardrails
- No direct client-side service-role usage.
- Every admin API request must be evaluated against an explicit tenant scope.
- RLS policies must be deny-by-default and role-scoped.
- All changes must include rollback SQL or rollback procedure.

## Phase P0-A: Tenant Identity Foundation
- [x] Extend NextAuth token/session payload to include `user_id`, `agency_id`, and `community_id` (where applicable).
- [x] Add a shared server auth helper that returns normalized admin context.
- [x] Define role capabilities by scope:
- `superadmin`: platform-wide
- `agency_manager`: agency-scoped
- `facility_manager`/`admin`: community-scoped (or agency-scoped if explicitly configured)
- [x] Add strict UUID validation for tenant IDs consumed by APIs.
- [x] Add server-side invariant checks for invalid role/scope combinations.

Acceptance criteria:
- All protected API handlers use the shared auth helper.
- Session-derived scope is available in handler context and typed.
- Unauthorized role/scope attempts return `403`.

## Phase P0-B: API Scope Enforcement
- [x] Add reusable scope checks for community resources.
- [x] Restrict module-settings community list endpoint to the requester's allowed communities.
- [x] Restrict module-settings get/update/delete operations to allowed communities.
- [x] Block non-superadmin global toggles unless explicitly allowed by role policy.
- [x] Ensure all scope-check failures return deterministic, non-leaky error messages.

Acceptance criteria:
- Cross-community reads/writes are denied for scoped admins.
- Superadmin retains global control.
- API behavior remains backward-compatible for valid superadmin workflows.

## Phase P0-C: RLS Policy Cleanup (Critical Tables)
- [x] Audit and remove legacy permissive policies (`USING (true)` and equivalent broad access).
- [x] Recreate policies with explicit role + scope conditions for:
- `profiles`
- `notifications`
- `messages`
- `service_requests`
- `complaints`
- `maintenance_requests`
- `visitor_passes`
- `emergency_alerts`
- `module_settings` + `community_module_overrides` (admin write path)
- [x] Add helper SQL functions only if `SECURITY DEFINER` usage is reviewed and bounded.
- [x] Add migration comments documenting policy intent and threat model assumptions.

Acceptance criteria:
- No active permissive policy remains on protected operational tables.
- Scoped users can only access rows in permitted tenant boundary.
- Existing approved user and guard app flows continue to function with intended access.

## Verification Pack
- [x] SQL verification script for policy inventory and `USING/WITH CHECK` assertions.
- [x] Positive tests: superadmin/global admin/scope admin expected access.
- [x] Negative tests: cross-agency and cross-community denial cases.
- [x] App-level checks for module toggles and scoped community visibility.

## Rollback Plan
- [x] Keep each migration atomic and reversible.
- [ ] Document per-migration rollback SQL in migration notes.
- [ ] If regression occurs, rollback latest migration, clear API cache/state, and rerun verification queries.

## Execution Log
- 2026-02-20: Checklist created and approved for execution.
- 2026-02-20: Implemented tenant claims in NextAuth and shared admin scope helper.
- 2026-02-20: Enforced scoped module-settings API access and superadmin-only global writes.
- 2026-02-20: Applied migration `phase11_tenant_scope_rls_hardening` and validated policy inventory.
- 2026-02-20: Applied migration `phase11_profile_resolution_prefer_user_id` to fix canonical profile resolution and restore same-community profile visibility for member directory queries.
- 2026-02-20: Applied migration `phase11_profiles_identity_guard` to prevent future profile/auth dual-link collisions at insert/update time.
- 2026-03-03: Added shared backend scope service (`backend/src/services/adminScope.ts`) and capability endpoint (`GET /admin/me/capabilities`) for capability-driven navigation.
- 2026-03-03: Added scoped guard/agency operational admin APIs and module-space operational pages (`/guards/*`, `/agency/*`) to complete Settings IA relocation.
- 2026-03-03: Added migration `supabase/migrations/20260303_phase34_guard_agency_scope_rls_hardening.sql` to harden guard/agency operational RLS with scoped admin policies.
- 2026-03-03: Applied Phase 34 RLS migration to Casa Nirvana remote DB (`pswnlowvmdgeifhxilao`) and validated function/policy presence plus migration metadata record (`version=20260303`).
- 2026-03-06: Rewired active Guard and Agency directory pages off direct Supabase reads/writes and onto backend-scoped admin APIs (`/admin/guards/profiles`, `/admin/agencies/directory`) so People list/grid/details flows now enforce tenant scope at the API layer.
- 2026-03-06: Closed Guard onboarding scope gap by syncing `guard_assignments` into canonical `guards.community_id` / `users.community_id`, adding scoped `GET /admin/communities`, and upgrading `Manage Guards -> Community Assignments` to a real provisioning workflow for self-registered guards awaiting first community assignment.
- 2026-03-06: Normalized backend admin role aliases in auth and capability resolution so capability-filtered Guard and Agency submenu entries do not disappear for aliased admin roles.
- 2026-03-06: Hardened `/settings/module-settings` app-level scope UX so non-superadmin admins are pinned to scoped communities, cannot fall into misleading global-toggle state, and only see community-scoped module management in the UI.
- 2026-03-06: Hardened the superadmin notification operations core (`/notifications/dashboard`, `/notifications/campaigns`, `/notifications/analytics`, `/notifications/templates`) to remove mock analytics/template behavior, centralize live invalidation through `useNotificationRealtime`, and keep campaign/template actions on truthful DB-backed flows.
- 2026-03-07: Started the Notifications IA consolidation pass by simplifying the superadmin Notifications submenu down to `Overview`, `Campaigns`, `Templates`, and `Reports`, then converting the legacy `/notifications/push`, `/notifications/sms`, `/notifications/email`, and `/notifications/in-app` routes into clean relocation pages that direct admins into the unified campaigns workspace and `Settings > Notification Setup`.
- 2026-03-07: Consolidated the superadmin campaign workspace into a single cross-channel queue by rebuilding `/notifications/campaigns` around workflow tabs, channel filters, shared template selection, and explicit draft/scheduled/live creation states, while extending the backend notification-campaign create contract to honor those orchestration states without forcing every new campaign into immediate delivery.
- 2026-03-07: Consolidated the remaining notification operations surfaces by rebuilding `/notifications/templates` into a single cross-channel library workspace and `/notifications/analytics` into a single reports workspace, removing the internal tab-over-tab page structure so templates and reports now behave as focused operational pages instead of separate mini-products per concern.
- 2026-03-07: Closed the remaining notification data-contract gaps by adding scoped backend CRUD for `notification_templates`, moving the superadmin template hook off direct browser Supabase writes onto admin API routes, extending `notification_campaigns` to carry a stable `template_id`, and applying `20260307191500_phase34_notification_template_linkage.sql` against Casa Nirvana so campaign/template linkage now supports truthful usage reporting and permission-enforced write paths.
- 2026-03-07: Rebuilt the superadmin Email Management workspace (`/inbox`) around scoped backend email APIs and real `emails` records, replacing the previous demo contact/mail helper data with truthful summary cards, folder-based list/detail views, scoped compose-to-user flow, and lifecycle-safe update actions; also applied `20260307203000_phase34_email_scope_backfill.sql` so existing resolvable email rows now carry `community_id` for tenant-scoped visibility.
- 2026-03-06: Replaced the legacy `People -> Guards -> Add Guard` flow with a scoped admin provisioning path (`POST /admin/guards/profiles`) so admin-created guards now use the same production onboarding model as self-registered guards: Auth invite, `users`/`profiles`/`guards` sync, and initial community assignment creation in one transaction-safe flow.
- 2026-03-06: Completed a focused QA remediation pass for `People -> Guards -> Add Guard`: replaced the unstable `ChoicesFormInput` select wiring with native `Form.Select` controls in the active form, and relaxed backend UUID scope checks to accept existing seeded community ids so `community_id` now survives end-to-end submission. Remaining local test limitation was only Supabase invite rate limiting after repeated QA attempts.
- 2026-03-06: Added the production `People -> Agency -> Add Agency` create path with `POST /admin/agencies/directory`, schema validation, rollback-safe creation of `agencies` + `agency_profiles` + initial `communities`, and rewired the active Add Agency form onto the backend API with sanitized payload submission and native select controls.
- 2026-03-06: Completed focused local QA for `People -> Agency -> Add Agency`, fixed the `agency_profiles.agency_type` constraint mismatch plus managed-community date persistence in the backend create mapper, and confirmed the real UI submit path creates an agency then redirects to `/agency/list-view`. Temporary QA rows and auth user were removed after verification.
- 2026-03-06: Completed focused remediation for `People -> Agency -> List/Grid/Details/Manage` by adding scoped summary read endpoint `GET /admin/agencies/directory/:id/summary`, replacing dead `/agency/edit` links with scoped `/agency/manage?tab=profiles&agencyId=...` routes, rebuilding agency details tabs against backend data, and preserving `agencyId` across manage workspace tabs while capability state resolves.
- 2026-03-06: Hardened `superadmin/src/hooks/useAdminApi.ts` so authenticated agency pages can recover the admin access token from `/api/auth/session` during client hydration, preventing false empty states on list/manage/details surfaces while the session object is still loading.
- 2026-03-06: Focused runtime QA on `People -> Agency -> List/Grid/Details/Manage` exposed two validated blockers: the detail summary was querying nonexistent `public.agency_finance`, and the scoped `Manage Agencies -> Agency Profile` tab was read-only with no recovery path for legacy agencies missing `agency_profiles` rows.
- 2026-03-06: Fixed those blockers by aligning agency summary finance reads to `agency_transactions`, then adding scoped `POST /admin/agencies/profiles` and `PATCH /admin/agencies/profiles/:id` so admins can create or update missing agency profile records directly from the `Manage Agencies` workspace with prefilled agency directory data.
- 2026-03-06: Completed focused remediation for `People -> Visitors -> List/Grid/Details` by preserving source-aware back navigation between list/grid/details surfaces, correcting visitor detail lifecycle badges so checked-out and terminal passes no longer show `Not Approved`, and removing the false `Pass Approved = updated_at` timeline behavior for statuses where later lifecycle events already have explicit timestamps.
- 2026-03-06: Began focused remediation for `Operations -> Maintenance Requests` by removing mock KPI/timeline content from the active superadmin maintenance surfaces, normalizing maintenance currency display to `GH₵`, and deriving dashboard metrics, status history, and request timelines from live maintenance request fields instead of placeholder values.
- 2026-03-06: Completed the focused superadmin maintenance follow-up for `Operations -> Maintenance Requests -> List/Details`: removed the remaining fake list controls (non-wired checkboxes/pagination), added live action feedback + realtime invalidation on list/detail surfaces, expanded maintenance reads with assigned/resolved profile metadata, and constrained detail quick actions to valid status transitions only. No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/superadmin` passed after the changes.
- 2026-03-06: Completed the focused superadmin complaints follow-up for `Operations -> Complaints -> List/Details`: removed fake list controls (export/import dropdown, row-selection checkboxes, fake pagination), aligned list/detail state actions to the real complaint lifecycle, replaced `updated_at`-based complaint timeline/resolution displays with lifecycle-specific fields (`in_progress_at`, `resolved_at`), and removed dead placeholder actions from the active detail surface. No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/superadmin` passed after the changes.
- 2026-03-06: Completed the focused superadmin help desk follow-up for `Operations -> Help Desk / Inquiries -> List/Details`: added realtime invalidation on the live `inquiries` table, normalized backward-compatible `suggestion`/`suggestions` filtering, enabled truthful queue-level lifecycle actions with visible feedback, and rebuilt the inquiry detail surface around actual response/resolution timestamps instead of passive placeholder editing. No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/superadmin` passed after the changes.
- 2026-03-06: Completed the focused superadmin amenities follow-up for `Operations -> Amenities -> List/Details/Bookings`: removed placeholder KPI/export/pagination behavior from the active list and bookings surfaces, added singleton realtime invalidation for live `amenities` and `amenity_bookings` reads, rebuilt amenity detail/booking detail views around truthful lifecycle and payment data, and normalized all monetary reporting to `GH₵`. No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/superadmin` passed after the changes.
- 2026-03-06: Completed the focused superadmin services follow-up for `Operations -> Services -> List/Details/Requests`: removed placeholder dashboard/grid/detail behavior from the active services and service-request surfaces, added singleton realtime invalidation for live `services` and `service_requests` reads, normalized service/request lifecycle labels and `GH₵` pricing, and rebuilt service/service-request detail views around truthful requester, assignee, payment, and timeline data. No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/superadmin` passed after the changes.
- 2026-03-06: Completed the focused superadmin notice follow-up for `Communication -> Notice -> List/Details/Create`: replaced placeholder notice listing widgets with DB-backed filters, stats, and cards; rebuilt notice details around live notice/comment/engagement data with scoped edit/delete/comment actions; and rewired create/edit surfaces to real scoped notice forms using media URLs instead of fake upload widgets. No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/superadmin` passed after the changes.
- 2026-03-06: Completed the focused superadmin emergency alerts follow-up for `Communication -> Emergency Alerts`: moved realtime invalidation into the shared emergency-alert hook, rebuilt the queue/detail workspace around DB-backed filters and lifecycle-safe status actions, and replaced placeholder response history with truthful alert lifecycle data (`created_at`, `updated_at`, `resolved_at`, reporter/resolver/community/unit attribution). No SQL migration was required, and `npm run build` in `/Users/andromeda/casanirvana/superadmin` passed after the changes.
- 2026-03-06: Completed the focused superadmin messages and chats follow-up for `Communication -> Messages & Chats`: hardened direct-message writes behind backend admin scope checks (`backend/src/controllers/adminMessages.ts`), added singleton realtime invalidation for `messages` and group chat tables, replaced hardcoded chat profile/QR/sidebar placeholders with live session/profile data, removed empty-link placeholder controls from chat/group/call surfaces, and converted risky contact creation into routed People-management entry points. No SQL migration was required, and both `npm run build` in `/Users/andromeda/casanirvana/backend` and `npm run build` in `/Users/andromeda/casanirvana/superadmin` passed after the changes.
