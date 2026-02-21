# Casa Nirvana Production Readiness Playbook

Last updated: February 21, 2026

## Purpose

This document defines the engineering process we use to prepare the Casa Nirvana platform for production across:
- User app (`/Users/andromeda/casanirvana/user`)
- Superadmin dashboard (`/Users/andromeda/casanirvana/superadmin`)
- Guard app (`/Users/andromeda/casanirvana/Guard`)
- Supabase backend (`/Users/andromeda/casanirvana/supabase`)

The goal is consistent delivery quality, predictable changes, and safe collaboration for current and future developers.

## Operating Principles

- Audit-first, change-second.
- No guessing: validate against real schema and code.
- No silent breaking changes.
- Tenant-safe by default (community/agency scoping).
- Reversible database changes for data cleanup/hardening.
- Small, traceable slices with explicit approval gates.
- Production naming standard: use **community**, not society.

## Delivery Model

We execute in domain slices (module-by-module), for example:
- Auth + Home + Notifications
- Complaints + Maintenance + Help Desk
- Messaging + Visitors + Emergency
- Payments + Personal Hub
- Marketplace
- Profile + Settings
- Book Amenities
- Notice Board

Each slice follows the same lifecycle.

## Slice Lifecycle (Industry Standard Workflow)

1. Read-only discovery
- Map screens, hooks, services, and DB tables.
- Identify UI elements that are data-bound.
- Verify what is real vs placeholder/mock.

2. Wiring contract definition
- Define expected data contract per screen.
- Compare expected contract vs actual DB schema and hooks.
- Record gaps in checklist docs.

3. Supabase audit
- Verify table schema, constraints, triggers, and indexes.
- Verify RLS policies and tenant scope behavior.
- Validate sample data integrity and foreign-key relationships.

4. Findings report (prioritized)
- `P0`: production blockers and data/security risks.
- `P1`: important functional or consistency issues.
- `P2`: polish/performance/cleanup issues.

5. Implementation plan (approval gate)
- Propose exact changes, file paths, and migration steps.
- Wait for approval before edits.

6. Execution
- Apply minimal, targeted code changes.
- Use reversible SQL for cleanup/hardening.
- Keep legacy compatibility only where necessary.

7. Validation
- Run targeted lint/checks on changed files.
- Run DB verification queries after migrations.
- Confirm no unintended data loss.

8. Closure
- Update progress checklist and module status.
- Document residual risks and manual QA items.
- Move to next slice only after closure criteria are met.

## Database Change Policy

- All DDL/data fixes go through versioned migrations in `/Users/andromeda/casanirvana/supabase/migrations`.
- Cleanup migrations must create backup tables for reversibility when modifying existing production rows.
- Never run destructive untracked SQL.
- After migration, run verification queries for:
- row counts
- null/contract gap counts
- policy presence
- trigger presence
- Keep policy naming consistent by phase (example: `p15_*`).

## RLS and Tenant Scope Standard

- Prefer helper functions for scope checks (example: `public.can_access_community`, `public.matches_current_actor`, `public.is_admin_role`).
- User reads/writes must be actor-scoped and community-safe.
- Admin reads/writes must be role-scoped and community-scoped.
- Remove permissive legacy policies once scoped replacements are in place.

## Application Contract Standard

- Define one canonical payload contract per flow.
- Keep user app and superadmin contract field names aligned.
- Normalize legacy/modern field pairs where needed (temporary compatibility layer).
- Avoid duplicate realtime invalidation keys.
- Remove UI placeholders once DB-backed contract exists.

## UI/UX Production Standard

- No fake success flows for real transactions.
- No non-functional action buttons in production surfaces.
- Error states and empty states must be explicit.
- Keep status mapping faithful to DB enum/state values.
- Preserve visual consistency with existing design language.

## Code Quality Standard

- Keep changes small and reviewable.
- Remove debug logs in production paths unless intentionally retained.
- Prefer shared utilities for identity/profile resolution.
- Maintain typed contracts where TypeScript is used.
- Avoid broad refactors during focused slice remediation.

## Git and Repository Hygiene

- Do not commit secrets or `.env` files.
- Keep `.gitignore` strict and clean.
- Avoid committing generated or local-only artifacts.
- Keep migration files explicit and timestamped.
- Document meaningful changes in `PROGRESS_CHECKLIST.md`.

## Required Tracking Artifacts

- `/Users/andromeda/casanirvana/PROGRESS_CHECKLIST.md`
- `/Users/andromeda/casanirvana/user/SCREEN_WIRING_CHECKLIST.md`
- `/Users/andromeda/casanirvana/user/SCHEMA_ALIGNMENT_GAPS.md`
- Slice-specific contract docs when needed (example: visitors lifecycle contract)

## Definition of Done (Per Module)

A module is considered production-ready when:
- Core create/read/update flows are DB-wired end-to-end.
- Superadmin and user surfaces are functionally consistent.
- RLS is scoped and validated.
- No critical placeholder logic remains in core paths.
- Lint/checks pass for changed files.
- Checklist and migration trail are fully updated.

## New Developer Onboarding (Fast Start)

1. Read this playbook.
2. Read `PROGRESS_CHECKLIST.md` to understand current phase state.
3. Read `SCREEN_WIRING_CHECKLIST.md` and `SCHEMA_ALIGNMENT_GAPS.md`.
4. Pull latest migrations and verify Supabase access.
5. Continue from the next unresolved `P0/P1` item.
6. Follow approval-gated execution for any new slice changes.

## Collaboration Protocol

- Share findings first, then plan, then execution.
- Always include exact file paths and SQL scope.
- Surface risks early (data integrity, RLS, tenant leakage, regressions).
- Keep communication concise, factual, and testable.
