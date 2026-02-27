# Casa Nirvana New Engineer Quick Start

Last updated: February 21, 2026

## Start Here

1. Read `/Users/andromeda/casanirvana/PRODUCTION_READINESS_PLAYBOOK.md`.
2. Read `/Users/andromeda/casanirvana/PROGRESS_CHECKLIST.md` to see current phase and open items.
3. Read:
- `/Users/andromeda/casanirvana/user/SCREEN_WIRING_CHECKLIST.md`
- `/Users/andromeda/casanirvana/user/SCHEMA_ALIGNMENT_GAPS.md`
- `/Users/andromeda/casanirvana/EXPRESSPAY_INTEGRATION_BLUEPRINT.md` (payment gateway architecture + API contract)

## Repo Areas

- User app: `/Users/andromeda/casanirvana/user`
- Superadmin: `/Users/andromeda/casanirvana/superadmin`
- Guard app: `/Users/andromeda/casanirvana/Guard`
- Supabase migrations: `/Users/andromeda/casanirvana/supabase/migrations`

## Environment + Access

- Ensure local `.env` is configured (never commit secrets).
- Confirm Supabase access for Casa Nirvana project before touching DB work.
- Run migrations only from tracked SQL files in `/Users/andromeda/casanirvana/supabase/migrations`.

## Daily Workflow

1. Pick the next unresolved `P0`/`P1` item from `/Users/andromeda/casanirvana/PROGRESS_CHECKLIST.md`.
2. Perform read-only audit first (code + schema + RLS).
3. Write findings with severity and exact file paths.
4. Propose implementation plan and wait for approval.
5. Execute in small, traceable changes.
6. Run targeted lint/checks.
7. Update checklist/docs before moving to next item.

## Standards (Non-Negotiable)

- Use **community** terminology (not society).
- No placeholder/fake success logic in production flows.
- No permissive RLS on tenant data.
- Data fixes must be reversible (backup table + verification).
- Keep user/superadmin contracts aligned for shared modules.
- Guard communication routing rule: resident/guard chat + call flows are in-app (auditable).
- Visitor/guest/cab/delivery/service phone numbers are direct dial (`tel:`).
- Only approved direct-call shortcuts are emergency contacts + `Call Admin` / `Call Secretary` in Guard settings.

## Validation Commands (Typical)

- Superadmin lint:
  - `npm --prefix /Users/andromeda/casanirvana/superadmin run lint`
- User app lint:
  - `npm --prefix /Users/andromeda/casanirvana/user run lint`

Use targeted file linting when possible during active remediation.

## First Contribution Checklist

- Confirm issue scope and acceptance criteria.
- Confirm no unrelated files are modified.
- Confirm migration safety if DB touched.
- Confirm no secrets added.
- Confirm docs/checklists updated.

## Escalate Early If

- RLS behavior is ambiguous.
- Data cleanup could cause tenant leakage or data loss.
- Contract mismatch spans multiple apps and cannot be safely patched incrementally.
