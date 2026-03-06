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
