# Casa Nirvana Manual Runtime QA Pack

Date: 2026-03-11
Owner: Platform Orchestration
Status: Ready for coordinated execution

## Purpose
- Convert the remaining production-readiness runtime QA backlog into one executable release pack.
- Validate cross-app behavior after tenant-scope, RLS, observability, payment, and backend-contract hardening.
- Keep sign-off evidence in one place before release closure.
- Use `USER_GUARD_LAUNCH_SIGNOFF_CHECKLIST.md` as the detailed execution aid for user-app and Guard-app runtime sections.
- Record the executed results for those sections in `USER_GUARD_LAUNCH_SIGNOFF_LOG.md`.

## Preconditions
- Latest migrations are applied to Casa Nirvana.
- Backend and superadmin are deployed from current `main`.
- User and Guard app builds are running from current approved branches or merged `main`.
- Test accounts are available and verified:
  - `superadmin`
  - `agency_manager`
  - `facility_manager`
  - `resident`
  - `guard`
- ExpressPay sandbox credentials are configured for the environment being tested.

## Execution Rules
- Use this pack as the single runtime sign-off source.
- Record each section with:
  - execution date
  - tester
  - result (`pass`, `blocked`, `failed`)
  - blocker note if not passed
- If a section fails, capture:
  - app
  - route/screen
  - exact actor/account used
  - expected vs actual
  - apps/api/API error payload if available
- Do not mark the global runtime QA backlog complete until every pending section below is signed off.

## Execution Matrix
| Section | Area | Primary Apps | Suggested Owner | Status |
| --- | --- | --- | --- | --- |
| 0 | Payments / ExpressPay | User, Superadmin, Backend | Platform | Completed |
| 1 | Scoped Admin Access Regression | Superadmin | Platform | Pending |
| 2 | Marketplace / Personal Hub Admin RLS | Superadmin | Platform | Pending |
| 3 | Visitors / Entry / Exit Lifecycle | User, Guard, Superadmin | Guard + Platform | Pending |
| 4 | Guard Operations Scope Check | Superadmin | Platform | Pending |
| 5 | Chat Lifecycle | User, Guard, Superadmin | User + Guard | Pending |
| 6 | Service Lifecycle | User, Superadmin | User | Pending |
| 7 | Maintenance / Complaints / Help Desk | User, Superadmin | User + Platform | Pending |
| 8 | Profile Lifecycle | User, Guard, Superadmin | User + Guard | Pending |
| 9 | Emergency Lifecycle | User, Guard, Superadmin | Guard + Platform | Pending |
| 10 | Guard Settings / Profile Lifecycle | Guard | Guard | Pending |

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

## 0. Payments / ExpressPay
Status: Completed separately

Completed sign-off already recorded in `/Users/andromeda/casanirvana/PROGRESS_CHECKLIST.md`.

Validated:
- mobile-money approval prompt flow
- pending-confirmation UX
- callback/poll settlement path
- hosted `Credit / Debit Card` checkout handoff and return-to-app flow

Result:
- payment checkout lifecycle is in production-closeout state pending normal release monitoring only

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

Execution record:
- Date:
- Tester:
- Result:
- Notes:

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

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## 3. Visitors / Entry / Exit Lifecycle
- User app:
  - create one pre-approved visitor
  - create one delivery/service/cab walk-in if that flow is active
- Superadmin:
  - verify visitor appears in list/grid/details with correct community, unit, creator, and lifecycle state
- Guard app:
  - verify code/QR lookup succeeds inside the correct community
  - check in visitor
  - confirm checked-in details do not show exit time
  - check out visitor
  - confirm checked-out visitor moves to terminal state and exit time is populated only after checkout

Expected result:
- Visitor lifecycle is truthful across User, Guard, and Superadmin.
- No fake state labels, pass-not-found regressions, or stale checked-in/checked-out displays remain.

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## 4. Guard Operations Scope Check
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

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## 5. Chat Lifecycle
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

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## 6. Service Lifecycle
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

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## 7. Maintenance / Complaints / Help Desk
- User app:
  - create one maintenance request with attachment if available
  - create one complaint
  - create one help desk inquiry
- Superadmin:
  - verify each appears in the correct list/detail workspace
  - update lifecycle/status from superadmin
  - confirm detail pages show truthful timeline, attribution, and attachments
- User app:
  - verify updated status reflects correctly

Expected result:
- These operations remain DB-backed end to end with no placeholder actions, fake KPIs, or incorrect status timelines.

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## 8. Profile Lifecycle
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

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## 9. Emergency Lifecycle
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

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## 10. Guard Settings / Profile Lifecycle
- Guard app:
  - `settingScreen`
  - `languageScreen`
  - `notificationSettingsScreen`
  - `chatSettingsScreen`
  - `editProfileScreen`
- Verify persistence, re-open behavior, and no forced logout regressions

Expected result:
- Guard identity/settings changes persist cleanly and remain scoped to the signed-in guard.

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## Sign-off Rule
- Do not mark the runtime QA backlog complete until every pending section above has an execution record.
