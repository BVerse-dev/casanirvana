# Casa Nirvana Launch War-Room Checklist

Date opened: 2026-07-02  
Launch posture: implementation is mostly complete; remaining work is freeze safety, manual QA, deployment operations, and explicit product decisions.  
Primary project: Supabase `Casa Nirvana` in org `BVerse`, project ref `pswnlowvmdgeifhxilao`.  
Do not touch: Supabase project ending in `sdk` / ref `qfdoogvyuqbfrncxsdkq`.

## Source of Truth

- [ ] Keep this file as the launch execution board until release freeze is complete.
- [ ] Keep `PROGRESS_CHECKLIST.md` as the long-form historical record.
- [ ] Keep `/supabase/migrations` as the only migration source of truth.
- [ ] Record proof links/screenshots/log snippets beside each completed launch gate.

## P0 Launch Gates

| Gate | Required outcome | Status | Proof / notes |
| --- | --- | --- | --- |
| Secrets | Production secrets are stored only in CI/CD or secret manager; no `.env` or hardcoded secret leakage | PARTIAL | Local source scan found no env-file leakage; converted `apps/resident-mobile/scripts/seedNotificationData.js` to env-only. Production secret-manager/deployed-env check still pending |
| Token hygiene | Rotate any Supabase personal access token shared during cleanup work | TODO | Rotate after final database verification |
| Auth hardening | `NEXTAUTH_SECRET` is env-only and demo auth paths are removed/disabled | PARTIAL | Local source check: `NEXTAUTH_SECRET` is env-only and missing secret throws; normal signup handler refuses when `NEXT_PUBLIC_ADMIN_SIGNUP_DISABLED=true`. Deployed-env smoke still pending |
| Database migration state | Local active migrations match live, and `supabase db push` is clean for staging/prod | PARTIAL | 2026-07-02: added no-op local history markers for 183 live pre-baseline migrations and applied Phase 49. Version alignment now clean: local `266`, remote `266`, missing local `0`, local-only `0`. `supabase db push`/staging proof still pending |
| Supabase Advisor | Security Advisor has zero `ERROR` findings immediately before freeze | PARTIAL | Security Advisor rerun after Phase 49: zero `ERROR`s; remaining warnings are GraphQL exposure, authenticated security-definer functions, 32 broad policy-shape warnings, auth settings, and Postgres version. Performance Advisor API currently fails with Supabase linter SQL error near `storage.buckets`; manual SQL probes are green for unindexed FKs `0`, duplicate indexes `0`, and public tables without primary keys `0`. Dashboard retry still pending |
| RLS contract | RLS policies match apps/api/app role expectations for superadmin, scoped admin, resident, guard, and service role | PARTIAL | Phase 49 scoped broad directory policies for `communities`, `units`, and `guards`. Post-migration SQL smoke: guard sees `1` community/`83` units/`3` guards; resident/user with active membership sees `1` community/`83` units/`3` guards; superadmin still sees full scope. Manual UI role smoke still pending |
| Backend API | Privileged writes route through backend and enforce auth/scope consistently | PARTIAL | Deployed backend health returned `ok` on 2026-07-02 after Render cold start. Auth/scope endpoint flow checks still pending |
| Payments | ExpressPay hosted checkout initiate/verify/status works for test payment paths and failure paths | PARTIAL | ExpressPay admin config endpoint rejects unauthenticated access with `401 AUTH_TOKEN_MISSING`; route surface includes initiate/verify/status/callback. Authenticated sandbox initiate/verify/failure-path smoke still pending |
| Manual QA | Superadmin, user app, Guard app, and cross-app lifecycle smoke tests pass | TODO | Use QA matrix below |
| Deployment | Backend, superadmin, user, and Guard deployment targets are configured and reproducible | PARTIAL | Backend health endpoint returned `ok`; superadmin sign-in page returned HTTP 200 from Vercel. Build artifact/release-channel/env-console verification still pending |
| Marketing website | WordPress-equivalent Next.js site passes parity, forms, SEO, deployment, cutover, and rollback gates | TODO | Track route evidence and blockers in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`; this is now a P0 launch requirement |
| Rollback | Rollback procedure is documented with owners and last-known-good artifacts | TODO | Include DB rollback posture, app rollback, env rollback |
| Monitoring | Minimum launch monitoring exists for API errors, auth/payment failures, and app crash visibility | TODO | Sentry/Logtail/Supabase logs/Vercel/Render/AWS logs accepted |

## Manual QA Matrix

Marketing website acceptance must cover all approved routes at 1440x900, 1280x800, 1024x768, 768x1024, 390x844, and 360x800, plus onboarding/contact delivery, SEO, accessibility, mobile navigation, 404 behavior, domain cutover, and WordPress rollback artifacts. Evidence belongs in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.

| Area | Must prove before launch | Status | Evidence |
| --- | --- | --- | --- |
| Superadmin auth/RBAC | Superadmin and scoped admin can sign in; scoped admin cannot see cross-tenant data | TODO |  |
| Superadmin communities | Community, unit, resident, admin/committee visibility matches scope | TODO |  |
| Superadmin visitors | Create, approve/deny, check-in/check-out/delete visitor pass; user and Guard reflect state | TODO |  |
| User auth/home | Register/login/OTP, module visibility, notifications, profile resolution | TODO |  |
| User maintenance/services | User creates request; superadmin updates status; user sees status update | TODO |  |
| User complaints/help desk | Complaint detail, comments, help-desk chat start, feedback submission | TODO |  |
| User payments | Pending/history/receipt, personal-hub transaction, retry path, saved bill/policy preference | TODO |  |
| User profile/settings | Family, daily help, vehicle, frequent entry create/edit/soft-delete; settings persist | TODO |  |
| Emergency lifecycle | User sends emergency; superadmin sees detail; recipient tracking/audit rows exist | TODO |  |
| Chat lifecycle | Superadmin to user, user to guard/admin, attachments, read receipts, call state transitions | TODO |  |
| Guard auth/home | Guard OTP login, dashboard, module gating, settings/profile persistence | TODO |  |
| Guard visitor ops | Entry code lookup, QR scan, confirm/allow/deny, cab/delivery walk-in flow | TODO |  |
| Guard residents | Resident directory/search respects module settings and tenant scope | TODO |  |
| Guard emergency | Guard acknowledges/investigates/resolves emergency and can contact admin | TODO |  |
| Next.js public onboarding | Get Started posts through same-origin `POST /api/onboarding`; server attaches the API key and backend delivery is verified | TODO | Track evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md` |

## Production Deployment Checklist

| Surface | Required checks | Status | Notes |
| --- | --- | --- | --- |
| Supabase | Backups/PITR confirmed; Auth providers configured; Storage policies reviewed; Advisor rerun | TODO |  |
| Backend | Env matches `apps/api/.env.example`; CORS allowlist set; rate limiting/security headers decided | TODO |  |
| Superadmin | Env matches `apps/superadmin/.env.example`; `NEXTAUTH_URL` and API URL correct; build/deploy target final | TODO |  |
| User app | Env matches `apps/resident-mobile/.env.example`; Expo profile/channel decided; OTA/release process clear | TODO |  |
| Guard app | Env matches `apps/guard-mobile/.env.example`; Expo profile/channel decided; camera permission path verified | TODO |  |
| Domains | Final URLs, redirects, callback URLs, payment callback/webhook URLs configured | TODO |  |
| Logs | Access to Supabase, backend, payment, frontend, and mobile crash logs confirmed | TODO |  |

## P1 Hardening After P0 Is Green

- [ ] Add/complete backend request validation with Zod/Yup or equivalent.
- [ ] Normalize backend error responses.
- [ ] Add automated backend unit/integration coverage for critical endpoints.
- [ ] Add Playwright or browser smoke tests for superadmin critical paths.
- [ ] Add mobile regression smoke scripts for user and Guard core flows.
- [ ] Complete Personal Hub provider management interface.
- [ ] Complete Personal Hub admin notifications/realtime sync/report scheduling/audit logging/docs.
- [ ] Review sensitive-data encryption needs beyond current RLS/secret-storage posture.

## Advisor Warnings Parked Until Deliberate Review

- [ ] Decide whether GraphQL should be disabled or explicitly kept for this product.
- [ ] Review authenticated security-definer RPC grants function-by-function before tightening further.
- [ ] Consolidate overlapping RLS policies only after role-by-role regression tests exist.
- [ ] Rewrite auth RLS initplan policy patterns as a performance pass after launch safety is green.
- [ ] Decide Supabase auth MFA and leaked-password protection settings for production policy.
- [ ] Plan Supabase Postgres version upgrade separately from launch freeze.
- [ ] Review unused-index warnings after real launch traffic; do not blindly drop newly added FK indexes.

## Go / No-Go Rule

- [ ] GO only when every P0 Launch Gate is complete with evidence.
- [ ] GO only when manual QA has no unresolved P0 regressions.
- [ ] GO only when rollback owner, rollback steps, and last-known-good artifacts are documented.
- [ ] NO-GO if any secret, RLS, payment, auth, migration, or rollback gate remains unproven.

## Daily War-Room Rhythm

- [ ] Start with P0 gate review and assign owners.
- [ ] Run only one risky production-facing change at a time.
- [ ] Capture proof immediately after each gate passes.
- [ ] Park P1 items explicitly instead of mixing them into launch blockers.
- [ ] End each session with a short launch status: green, yellow, or red.

- 2026-07-02: Reusable QA credentials provisioned in `.env.casanirvana.qa.local` for superadmin, scoped admin, resident, and guard actors. Passwords are not committed or printed.

- 2026-07-02: Scoped admin QA found UUID validator mismatch: Casa Nirvana seed community id is Postgres-valid but failed the app RFC-variant regex; NextAuth scope resolver loosened to accept Postgres UUID text.

### 2026-07-19 - Marketing Acceptance Evidence Status

- Manual evidence tracker: `MARKETING_SITE_MANUAL_ACCEPTANCE_CHECKLIST.md`.
- Deployment environment validator: `npm --prefix apps/marketing-web run verify:release-env`.
- Current state: implementation/build gates pass; manual 11-route/six-viewport evidence, canonical domain, SMTP, legal approval, deployed preview verification, DNS and rollback signoff remain P0 open items.

### 2026-07-19 - Domain Decision

- Marketing production domain: `https://casanirvana.app` - owner confirmed.
- Superadmin production domain: `https://admin.casanirvana.app` - owner confirmed.
- Canonical-domain decision gate is complete. Vercel environment and deployed-response verification remain open.

## 2026-07-19 - Monorepo hosting-root gate

- [x] Local application layout established under `apps/` without dependency hoisting or feature changes.
- [x] Root production build passed for API, superadmin, and marketing applications.
- [ ] Publish the monorepo transition to the remote repository before changing any hosting root.
- [ ] Create/link the marketing Vercel project with Root Directory `apps/marketing-web` and domain `casanirvana.app`.
- [ ] Change the existing superadmin Vercel Root Directory to `apps/superadmin` and retain `admin.casanirvana.app`.
- [ ] Change the Render API Root Directory to `apps/api` only in the coordinated deployment window.
- [ ] Update resident and guard EAS working roots to `apps/resident-mobile` and `apps/guard-mobile`.
- [ ] Confirm environment variables independently in each hosting project; do not copy server-only secrets into `NEXT_PUBLIC_*` variables.
- [ ] Run deployment smoke checks before removing the previous hosting-root rollback configuration.
