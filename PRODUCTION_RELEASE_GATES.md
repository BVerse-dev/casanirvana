# Casa Nirvana Production Release Gates

Date: 2026-03-20
Owner: Platform Engineering
Purpose: Current release closeout source of truth. Use this file to understand what is already complete, what still blocks launch, what should still be tightened before cutover, and what has been intentionally deferred.

## Current Posture

- Superadmin menu-by-menu launch wiring audit: complete
- Tenant scope + RLS remediation: complete at implementation level
- Live migration history and baseline alignment: complete
- Legacy data alignment cleanup: complete
- Backend contract hardening and mounted integration coverage: materially complete for the main production admin surface
- `superadmin` strict type-check and `build:check` closeout: complete
- Remaining production work: runtime signoff and a small set of explicit release decisions

## Completed Foundations

- `superadmin/ADMIN_LAUNCH_AUDIT_CHECKLIST.md`
  - All visible sidebar routes and required child flows have been audited and marked `complete` or `ok_existing`
- `superadmin/PRODUCTION_TENANT_RLS_REMEDIATION_CHECKLIST.md`
  - Tenant scope, critical-table RLS cleanup, rollback notes, and migration-history repair are complete
- `supabase/migrations`
  - Active production migrations are applied and recorded through Phase 41
- `backend/src/tests/app-mounted-integration.test.ts`
  - Mounted coverage now exercises the real Express app stack across onboarding, admin core, communities, people, operations, communication, Personal Hub, finance, and settings/control-plane routes
- `PROGRESS_CHECKLIST.md`
  - Historical execution log is up to date through the current backend mounted-settings pass

## Gate A - Production Blockers

- [ ] Execute and record the full coordinated runtime signoff pack in `MANUAL_RUNTIME_QA_PACK.md`
  - Section 1: Scoped Admin Access Regression
  - Section 2: Marketplace / Personal Hub Admin RLS
  - Section 3: Visitors / Entry / Exit Lifecycle
  - Section 4: Guard Operations Scope Check
  - Section 5: Chat Lifecycle
  - Section 6: Service Lifecycle
  - Section 7: Maintenance / Complaints / Help Desk
  - Section 8: Profile Lifecycle
  - Section 9: Emergency Lifecycle
  - Section 10: Guard Settings / Profile Lifecycle
- [ ] Explicitly close the remaining Guard runtime-signoff lane during the manual pack
  - `Guard/SCREEN_WIRING_CHECKLIST.md` already marks Residents/Directory wiring as `Wired`
  - remaining Guard work is runtime verification, not unresolved implementation
  - cover Residents/Directory behavior, guard operations scope, and settings/profile lifecycle in the recorded signoff
- [ ] Fix and re-verify any defect found during the runtime pack before launch approval

Exit criteria for Gate A:
- Every pending section in `MANUAL_RUNTIME_QA_PACK.md` has an execution record
- No unresolved blocker remains from runtime QA
- Guard Residents/Directory and end-to-end guard lifecycle are verified in runtime signoff and no longer tracked as open implementation work

## Gate B - Should Fix Before Launch

- [x] Clear the remaining repo-wide `superadmin` TypeScript debt behind `npm run build:check`
  - Completed on `2026-03-20`
  - Verification passed with `npx tsc --noEmit`, `npm run build`, `npm run build:check`, and `git diff --check`
- [ ] Decide whether browser/mobile automated smoke coverage is required before launch or whether manual runtime signoff is the accepted release control
  - Backend integration coverage is already strong
  - Browser automation remains intentionally deferred
- [ ] During runtime signoff, explicitly verify the operations pages that were marked `ok_existing` in the audit:
  - `/payments/charges`
  - `/payments/invoices`
  - `/payments/payouts`

These items are not new wiring audits. They are release-discipline decisions and runtime verification tasks.

## Gate C - Deferred By Direction

- [ ] WordPress public onboarding form wiring
  - `POST /onboarding/requests` integration remains deferred until the WordPress site is live
- [ ] Per-app CI/CD and hosting target setup
- [ ] Production secrets move into CI/CD or a secrets manager
- [ ] Per-app rollback procedure documentation

These remain intentionally deferred and should not be mixed into the current launch-closeout blocker list.

## Not Remaining

The following are no longer open production-discovery items:

- Superadmin sidebar route wiring audit
- Backend normalized error-envelope pass
- Backend request-validation pass
- Critical tenant/RLS cleanup
- Migration-history drift repair
- Baseline schema backports for completed production migrations
- Legacy `visitor_passes` attribution/archive cleanup
- Main admin mounted integration expansion for the active production backend surface
- `superadmin` strict TypeScript / `build:check` debt cleanup

## Execution Order

1. Run the full manual runtime QA pack and record results, including the remaining Guard runtime-signoff lane.
2. Fix any blocker defects uncovered by runtime QA.
3. Re-run only the affected runtime sections.
4. Decide whether manual runtime signoff is sufficient, or whether browser/mobile smoke automation must still be added before release approval.
5. Return later for the explicitly deferred WordPress and release-plumbing work.

## Working Rule

- `PRODUCTION_RELEASE_GATES.md` is the current release-closeout view.
- `PROGRESS_CHECKLIST.md` remains the detailed historical log.
- `MANUAL_RUNTIME_QA_PACK.md` is the runtime signoff execution document.
- Do not start new exploratory audit waves unless a runtime blocker reveals a real new gap.
