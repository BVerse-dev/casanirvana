# Casa Nirvana User + Guard Launch Signoff Log

Date opened: 2026-03-26
Owner: Platform Engineering
Status: Ready for runtime execution

## Purpose
- Record actual execution results for `USER_GUARD_LAUNCH_SIGNOFF_CHECKLIST.md`.
- Keep runtime signoff evidence in one place.
- Separate planned checks from executed outcomes so launch decisions stay auditable.

## Source Documents
- `USER_GUARD_LAUNCH_SIGNOFF_CHECKLIST.md`
- `MANUAL_RUNTIME_QA_PACK.md`
- `PRODUCTION_RELEASE_GATES.md`

## Test Session Header
- Environment: Current `main` runtime signoff preparation
- Backend commit: `f87c026`
- Superadmin commit: `f87c026`
- User app commit/build: `f87c026` (`apps/resident-mobile/package.json` runtime entry: `expo start --clear`)
- Guard app commit/build: `f87c026` (`apps/guard-mobile/package.json` runtime entry: `expo start`)
- Supabase project ref: `pswnlowvmdgeifhxilao`
- Tester: Pending runtime executor
- Date: 2026-03-26
- Devices used: Pending runtime devices
- Accounts used: Pending runtime account assignment (`superadmin`, `facility_manager`, `resident`, `guard`)
- Notes:
  - This header was prefilled from the current repo state before manual runtime execution began.
  - No runtime section below has been executed yet in this log.

## Result Legend
- `pass`
- `failed`
- `blocked`
- `not_run`

## Section Results
| ID | Priority | Flow | Date | Tester | Result | Evidence | Blocker / Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UG-01 | P0 blocker | User auth and identity bootstrap |  |  | not_run |  |  |
| UG-02 | P0 blocker | Guard auth and assignment bootstrap |  |  | not_run |  |  |
| UG-03 | P0 blocker | Visitor pre-approval and entry/exit lifecycle |  |  | not_run |  |  |
| UG-04 | P0 blocker | Chat, attachments, and call-rule split |  |  | not_run |  |  |
| UG-05 | P0 blocker | Emergency alert propagation and triage |  |  | not_run |  |  |
| UG-06 | P1 should-fix | User service lifecycle |  |  | not_run |  |  |
| UG-07 | P1 should-fix | User maintenance / complaints / help desk |  |  | not_run |  |  |
| UG-08 | P1 should-fix | User profile-linked records |  |  | not_run |  |  |
| UG-09 | P1 should-fix | Guard resident directory and recent-search hygiene |  |  | not_run |  |  |
| UG-10 | P1 should-fix | Guard settings and profile lifecycle |  |  | not_run |  |  |
| UG-11 | P1 should-fix | Cross-app final consistency sweep |  |  | not_run |  |  |

## Defect Log
| Defect ID | Priority | Section | App | Screen / Route | Actor | Expected | Actual | Evidence | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-001 |  |  |  |  |  |  |  |  |  | open |
| DEF-002 | P0 | UG-06 / ExpressPay runtime verification | User | `paymentMethodScreen` -> `mobileMoneyScreen` | Resident | Personal Hub checkout should honor the live payment method policy and use the hosted backend when a production-like device build inherits a stale private/local API URL | Personal Hub forced Mobile Money only and the device runtime could keep a stale private/local API base, producing `Network request failed` for `/payments/policy` and checkout initiation even while the live backend was healthy | Runtime test on 2026-04-02; live backend `/health` verified reachable; user flow logs showed payment-policy fetch and mobile-money initiation network failures | Platform Engineering | fixed_pending_retest |
| DEF-003 | P0 | UG-06 / ExpressPay runtime verification | User | `homeScreen` Personal Hub cards | Resident | `Pay Bills` and `Insurance` should reflect live module settings and live provider availability after auth bootstrap completes | Home entry cards could stay greyed out because provider-availability checks ran before authenticated session readiness, leaving `Pay Bills` and `Insurance` in a false unavailable state even though live module settings and live providers were enabled | Runtime test on 2026-04-02; live module settings verified `pay_bills=1`, `insurance=1`, `marketplace=0`; live provider check confirmed enabled bill-payment and insurance providers | Platform Engineering | fixed_pending_retest |

## Re-Verification Log
| Defect ID | Date | Tester | Fix Commit | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| DEF-001 |  |  |  |  |  |

## Final Gate Summary
- P0 sections passed:
- P0 sections failed or blocked:
- P1 sections failed or blocked:
- Launch recommendation:
- Approved by:
- Final note:
