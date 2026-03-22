# Casa Nirvana User + Guard Launch Signoff Checklist

Date: 2026-03-22
Owner: Platform Engineering
Status: Ready for execution on current `main`

## Purpose
- Convert the remaining user-app and Guard-app launch work into one blocker-first execution document.
- Keep runtime signoff aligned with the already-completed implementation, schema, RLS, and backend hardening work on current `main`.
- Provide a single place to record pass/fail evidence before release approval.

## Source Of Truth
- Use this file together with:
  - `MANUAL_RUNTIME_QA_PACK.md`
  - `PRODUCTION_RELEASE_GATES.md`
  - `user/SCREEN_WIRING_CHECKLIST.md`
  - `Guard/SCREEN_WIRING_CHECKLIST.md`
- This file is the detailed execution aid for the user and Guard portions of runtime signoff.
- `MANUAL_RUNTIME_QA_PACK.md` remains the top-level runtime backlog tracker.

## Scope
- User app runtime signoff
- Guard app runtime signoff
- User <-> Guard cross-app operational flows
- Required superadmin observations only where needed to verify the user/Guard flow end to end

Out of scope for this document:
- WordPress public-site work
- CI/CD and hosting setup
- secrets-manager migration
- broad browser/mobile automation design

## Preconditions
- Current `main` is deployed or installed for:
  - backend
  - superadmin
  - user app
  - Guard app
- Live Casa Nirvana Supabase project has active migrations through:
  - `20260322120000_phase42_chat_attachment_privacy_alignment.sql`
  - `20260322153000_phase43_community_directory_membership_integrity_parity.sql`
- Test accounts are available and working:
  - `superadmin`
  - `facility_manager`
  - `resident`
  - `guard`
- The test `guard` has an active community assignment.
- The test `resident` belongs to the same community used for visitor, chat, and emergency checks.

## Execution Rules
- Run on current `main` only. Do not use stale worktree branches for signoff.
- Record each section with:
  - date
  - tester
  - result: `pass`, `failed`, or `blocked`
  - blocker note when not passed
- For every failed or blocked step, capture:
  - app
  - screen or route
  - actor account used
  - expected result
  - actual result
  - API/backend error payload if available
  - whether the issue is `P0 blocker`, `P1 should-fix`, or `P2 follow-up`
- Do not mark launch signoff complete until every `P0` section below passes.

## Communication Rule
- In-app communication:
  - resident to resident
  - guard to resident host
  - community members/admins/guards where the product flow is designed as in-app chat/call
- Direct-call communication:
  - visitors
  - guests
  - delivery personnel
  - service personnel
  - cab drivers
  - explicit emergency contact buttons
  - explicit admin/secretary quick-call buttons

## Priority Legend
- `P0 blocker`
  - launch must not proceed until passed
- `P1 should-fix`
  - should be fixed before launch if broken, but does not automatically stop the entire pack unless the defect impacts a `P0` flow
- `P2 follow-up`
  - record and triage after signoff if not launch-critical

## Execution Order
1. User auth and identity bootstrap
2. Guard auth and assignment bootstrap
3. Visitor lifecycle across User, Guard, and superadmin
4. Chat and call lifecycle with communication-rule verification
5. Emergency lifecycle
6. User service + maintenance + complaint + help-desk flows
7. User profile-linked directory flows
8. Guard resident directory and search behavior
9. Guard settings and profile persistence
10. Cross-app final consistency sweep

## Section Matrix
| ID | Priority | Flow | Primary Apps | Supporting App | Status |
| --- | --- | --- | --- | --- | --- |
| UG-01 | P0 blocker | User auth and identity bootstrap | User | Backend | Pending |
| UG-02 | P0 blocker | Guard auth and assignment bootstrap | Guard | Backend | Pending |
| UG-03 | P0 blocker | Visitor pre-approval and entry/exit lifecycle | User, Guard | Superadmin | Pending |
| UG-04 | P0 blocker | Chat, attachments, and call-rule split | User, Guard | Superadmin | Pending |
| UG-05 | P0 blocker | Emergency alert propagation and triage | User, Guard | Superadmin | Pending |
| UG-06 | P1 should-fix | User service lifecycle | User | Superadmin | Pending |
| UG-07 | P1 should-fix | User maintenance / complaints / help desk | User | Superadmin | Pending |
| UG-08 | P1 should-fix | User profile-linked records | User | Superadmin | Pending |
| UG-09 | P1 should-fix | Guard resident directory and recent-search hygiene | Guard | User | Pending |
| UG-10 | P1 should-fix | Guard settings and profile lifecycle | Guard | Backend | Pending |
| UG-11 | P1 should-fix | Cross-app consistency sweep | User, Guard | Superadmin | Pending |

## UG-01 User Auth And Identity Bootstrap
Priority: `P0 blocker`

Actors:
- `resident`

Steps:
1. Sign in on the user app.
2. Confirm the app reaches the authenticated shell without auth loop or blank state.
3. Open the home screen and confirm community-scoped content loads.
4. Open the profile screen and confirm the signed-in identity is truthful.
5. Open notifications and confirm the list loads without placeholder/demo entries.

Pass criteria:
- No auth bounce or stuck loading state.
- Home and profile resolve the correct resident identity.
- Notification list is DB-backed and scoped to the signed-in resident.

Evidence to capture:
- screenshot of home
- screenshot of profile
- screenshot of notifications

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-02 Guard Auth And Assignment Bootstrap
Priority: `P0 blocker`

Actors:
- `guard`

Steps:
1. Sign in on the Guard app.
2. Confirm the app reaches the authenticated shell only when the guard has an active profile and community assignment.
3. Verify the home header shows the real guard identity and assigned community.
4. Open notifications and confirm unread state and list load from live data.

Pass criteria:
- Guard cannot enter without valid guard profile + active community scope.
- Header identity and community are truthful.
- Notification inbox is live and scoped.

Evidence to capture:
- screenshot of Guard home header
- screenshot of Guard notifications

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-03 Visitor Pre-Approval And Entry/Exit Lifecycle
Priority: `P0 blocker`

Actors:
- `resident`
- `guard`
- `superadmin`

Steps:
1. In the user app, create one pre-approved visitor.
2. If a walk-in flow is active for the test, create one delivery, service, or cab visitor from the Guard flow.
3. In superadmin, confirm the visitor appears with correct community, unit, creator, and status.
4. In the Guard app, resolve the pass using:
   - entry code
   - QR scan when available
5. Check in the visitor from the Guard flow.
6. Confirm checked-in state:
   - no exit time shown
   - current status is truthful
7. Check out the visitor.
8. Confirm checked-out state:
   - exit time now present
   - visitor moved to terminal state in Guard and superadmin views

Pass criteria:
- User-created and Guard-operated visitor data stays consistent across all three apps.
- No cross-community leakage.
- Exit time is shown only after checkout.
- Code and QR lookup behave deterministically inside the correct community.

Evidence to capture:
- user pre-approval screenshot
- Guard lookup screenshot
- Guard checked-in screenshot
- Guard checked-out screenshot
- superadmin detail screenshot

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-04 Chat, Attachments, And Call-Rule Split
Priority: `P0 blocker`

Actors:
- `resident`
- `guard`
- `superadmin`

Steps:
1. From the user app, open or create a chat with a guard or resident-facing operational thread as appropriate.
2. Send a text message.
3. Send an attachment if supported in the environment.
4. Confirm the thread appears in superadmin `Messages & Chats`.
5. Confirm the Guard app sees the same thread when in scope.
6. Verify read-state propagation after opening the thread on the receiving side.
7. Verify call behavior:
   - resident-host communication uses in-app call where designed
   - visitor/service/cab contact uses direct dial where designed
8. Verify attachment access works from the receiving app without public URL leakage symptoms.

Pass criteria:
- Threads, read state, and attachments propagate correctly across the involved apps.
- Communication-rule split is respected:
  - in-app for resident/community communication
  - direct dial for visitor/personnel communication

Evidence to capture:
- user thread screenshot
- Guard thread screenshot
- superadmin thread screenshot
- note whether attachment opened successfully
- note whether call launched in-app or direct dial, and whether that matched the rule

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-05 Emergency Alert Propagation And Triage
Priority: `P0 blocker`

Actors:
- `resident`
- `guard`
- `superadmin`

Steps:
1. Create an emergency alert from the user app.
2. Confirm the alert appears in superadmin with recipients recorded.
3. Confirm the alert appears in the Guard emergency workflow for the same community.
4. In the Guard app, execute:
   - acknowledge
   - investigate
   - resolve
5. Confirm superadmin detail reflects the state changes truthfully.

Pass criteria:
- Alert appears end to end.
- Guard triage actions persist and remain auditable.
- No out-of-scope emergency visibility.

Evidence to capture:
- user alert creation screenshot
- Guard alert list/detail screenshots
- superadmin alert detail screenshot

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-06 User Service Lifecycle
Priority: `P1 should-fix`

Actors:
- `resident`
- `superadmin`

Steps:
1. Create a service request from the user app.
2. Confirm it appears in the user list/detail view.
3. Confirm it appears in superadmin service requests.
4. Change lifecycle state in superadmin.
5. Confirm the user app reflects the updated state correctly.

Pass criteria:
- Service lifecycle is DB-backed end to end.
- No placeholder status or fake transition remains.

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-07 User Maintenance / Complaints / Help Desk
Priority: `P1 should-fix`

Actors:
- `resident`
- `superadmin`

Steps:
1. Create one maintenance request, with attachment if supported.
2. Create one complaint.
3. Create one help-desk inquiry.
4. In superadmin, confirm each item appears in the correct workspace.
5. Update statuses in superadmin.
6. Confirm user detail screens reflect the new state and truthful timelines.

Pass criteria:
- All three flows are DB-backed end to end.
- Attachments, attribution, and timelines are truthful.

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-08 User Profile-Linked Records
Priority: `P1 should-fix`

Actors:
- `resident`
- `superadmin`

Steps:
1. In the user app, create, edit, and verify one of each:
   - family member
   - daily help
   - vehicle
   - frequent entry
2. Confirm avatar and QR-linked detail states remain truthful after edit.
3. Confirm superadmin resident/community detail surfaces reflect the same underlying records where applicable.

Pass criteria:
- No raw local image URI leakage.
- QR-linked identity data remains consistent after edits.
- Superadmin reflects the same persisted state.

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-09 Guard Resident Directory And Recent-Search Hygiene
Priority: `P1 should-fix`

Actors:
- `guard`

Steps:
1. Open Guard `Residents` tab and confirm the list loads from live data.
2. Verify grouped block/unassigned presentation is truthful.
3. Search for a resident and open the thread from search.
4. Confirm recent searches are stored and displayed.
5. Switch to another community-scoped guard account if available, or reassign community in a controlled test environment, and confirm recent searches do not leak across community scope.
6. If module settings disable `resident_directory`, verify:
   - residents tab/search fails closed
   - chat list remains available

Pass criteria:
- Resident directory is truthful and scoped.
- Recent searches are both guard-scoped and community-scoped.
- Module-disabled state fails closed without breaking chats.

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-10 Guard Settings And Profile Lifecycle
Priority: `P1 should-fix`

Actors:
- `guard`

Steps:
1. Open:
   - `settingScreen`
   - `languageScreen`
   - `notificationSettingsScreen`
   - `chatSettingsScreen`
   - `editProfileScreen`
2. Change one preference in each relevant settings area.
3. Re-open the screens and confirm persistence.
4. Update Guard profile details and avatar if supported.
5. Confirm no forced logout or identity break happens after save.

Pass criteria:
- Settings persist cleanly.
- Guard profile updates persist cleanly.
- No auth/session regression after settings or profile changes.

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## UG-11 Cross-App Final Consistency Sweep
Priority: `P1 should-fix`

Actors:
- `resident`
- `guard`
- `superadmin`

Steps:
1. Re-open the key cross-app records created during testing:
   - one visitor pass
   - one chat thread
   - one emergency alert
   - one service request
   - one maintenance request
   - one complaint
2. Confirm timestamps, actors, statuses, and community scope remain consistent across the involved apps.
3. Confirm no screen still shows placeholder/demo data in those tested flows.

Pass criteria:
- Cross-app state is consistent after the full signoff run.
- No tested launch-critical flow still depends on placeholder UI behavior.

Execution record:
- Date:
- Tester:
- Result:
- Notes:

## Final Decision
- Launch cannot be approved until all `P0 blocker` sections pass.
- Any failed `P1 should-fix` section must be explicitly triaged and waived or fixed before launch approval.
- Record the final decision here:
  - Date:
  - Decision:
  - Approved by:
  - Blocking defects remaining:
