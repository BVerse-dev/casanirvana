# Casa Nirvana Manual Runtime QA Pack

Date: 2026-03-10
Owner: Platform Orchestration
Status: Pending execution

## Purpose
- Convert the remaining production-readiness manual QA backlog into one executable pack.
- Validate cross-app behavior after tenant-scope and RLS hardening.
- Confirm platform-only Personal Hub visibility and scoped admin behavior before release.

## Preconditions
- Latest migrations applied to Casa Nirvana.
- Backend and superadmin deployed from current `main`.
- User and Guard app builds running from current approved branches or merged `main`.
- Test accounts available:
  - `superadmin`
  - `agency_manager`
  - `facility_manager`
  - `resident`
  - `guard`

## Scope and Role Expectations
- `superadmin`
  - can access platform-wide admin workspaces, including Personal Hub and marketplace admin surfaces
- `agency_manager`
  - cannot access Personal Hub operational revenue/workspaces
  - can access only assigned agency/community operational areas
- `facility_manager`
  - cannot access Personal Hub operational revenue/workspaces
  - can access only assigned community operational areas
- `resident`
  - sees only own user-app data and community-scoped resident flows
- `guard`
  - sees only guard-app operational flows and own identity/settings data

## 1. Scoped Admin Access Regression
- Sign in as `superadmin`
  - verify `People -> Guards`, `People -> Agency`, `Operations`, `Communication`, and `Personal Hub` load with live data
- Sign in as `agency_manager`
  - verify out-of-scope communities are hidden or denied
  - verify Personal Hub pages are hidden or API-denied
- Sign in as `facility_manager`
  - verify out-of-scope communities are hidden or denied
  - verify Personal Hub pages are hidden or API-denied

Expected result:
- No scoped admin can read or mutate data outside the assigned tenant boundary.
- Personal Hub remains platform-only for admin operations.

## 2. Marketplace / Personal Hub Admin RLS Check
- As `superadmin`, open:
  - `/personal-hub/marketplace`
  - verify `Overview`, `Categories`, `Products`, `Orders`, `Vendors`, `Reviews`
- Create/edit one category, product, and vendor
- Update one order status
- Verify review list loads without sample rows
- As `agency_manager` and `facility_manager`, verify the same workspace is blocked or empty by policy/capability

Expected result:
- `superadmin` can operate the marketplace workspace.
- Scoped admins cannot access platform marketplace operations.

## 3. Guard Operations Scope Check
- As `superadmin`, verify:
  - `People -> Guards -> Manage Guards -> Schedules & Shifts`
  - `Community Assignments`
  - `Equipment`
  - `Performance`
  - `Training & Certification`
- As `facility_manager`, verify only assigned-community guards are visible
- Create/update/delete one record in each of:
  - guard schedule/shift
  - assignment
  - equipment
  - performance review
  - training enrollment
  - certification

Expected result:
- Writes succeed only for in-scope communities.
- Out-of-scope guards are not visible or are denied.

## 4. Chat Lifecycle
- User app:
  - create or continue a chat thread
  - send message
  - verify read state and attachment handling if supported
- Superadmin:
  - thread appears in `Messages & Chats`
  - scoped admin cannot see out-of-scope threads
- Guard app:
  - verify in-app calling/chat state follows the agreed direct-call split rules

Expected result:
- Messages propagate correctly across apps and respect scope.

## 5. Service Lifecycle
- User app:
  - create a service request
  - verify list/detail state
- Superadmin:
  - request appears in service requests
  - update lifecycle state
- User app:
  - updated lifecycle state reflects correctly

Expected result:
- No placeholder state transitions remain.

## 6. Profile Lifecycle
- User app:
  - create/edit/delete:
    - family member
    - daily help
    - vehicle
    - frequent entry
- Verify related gate-pass or resident-directory views stay accurate
- Superadmin:
  - resident/community detail surfaces reflect the same underlying data

Expected result:
- Profile-linked data remains consistent across user, guard, and admin surfaces.

## 7. Emergency Lifecycle
- User app:
  - create emergency alert
- Superadmin:
  - alert appears in list/detail
  - recipients are recorded
- Guard app:
  - alert appears in guard alert workflow
  - acknowledge/investigate/resolve path behaves correctly

Expected result:
- Alert propagation is end-to-end and auditable.

## 8. Guard Settings / Profile Lifecycle
- Guard app:
  - `settingScreen`
  - `languageScreen`
  - `notificationSettingsScreen`
  - `chatSettingsScreen`
  - `editProfileScreen`
- Verify persistence, re-open behavior, and no forced logout regressions

Expected result:
- Guard identity/settings changes persist cleanly and remain scoped to the signed-in guard.

## Sign-off Rule
- Do not mark the runtime QA backlog complete until every section above has:
  - execution date
  - tester
  - result
  - blocker note if failed
