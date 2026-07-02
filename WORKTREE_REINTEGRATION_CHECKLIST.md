# Controlled Worktree Reintegration Checklist

Date opened: 2026-03-22
Owner: Platform Engineering
Purpose: Port still-useful user/guard worktree changes onto current `main` without merging stale branches directly.

## Rules

- Port behavior onto current `main`; do not merge stale worktree branches directly.
- Reissue SQL only when the current code and current live schema still require it.
- Apply any required migration live after local verification and record it immediately.
- Update `PRODUCTION_RELEASE_GATES.md` only when a reintegration slice materially changes the remaining release blockers.
- Update `PROGRESS_CHECKLIST.md` after each completed reintegration slice so the historical log stays current.

## Source Audit

- Audit record: `WORKTREE_TAKEOVER_AUDIT.md`
- User worktree branch: `agent-user-app`
- Guard worktree branch: `agent-guard-app`
- Merge base with current history: `f0ad1df`
- Current action: Reintegration complete on current `main`; prepare runtime signoff

## Reintegration Slices

### Slice 1 - User Messaging, Cross-App Attachment Privacy, and Call Signaling

- Status: `complete`
- Source commits:
  - `55f9e92` from `agent-user-app`
- Scope:
  - user chat attachment storage shape and signed-url hydration
  - guard chat attachment storage shape and signed-url hydration
  - superadmin message attachment hydration for admin readers
  - user call signaling and call-screen state alignment
  - fresh replacement for the stale chat-attachment privacy migration if still required
- Acceptance:
  - message queries filter soft-deleted rows
  - new chat attachments store owner-scoped paths, not public URLs
  - user, guard, and superadmin readers can open private chat attachments through signed URLs
  - user call screen no longer depends on the older local-only call state path
  - any required migration is applied live and recorded
- Completion record:
  - app port completed on current `main`
  - live migration applied: `20260322120000_phase42_chat_attachment_privacy_alignment.sql`
  - live verification: `chat-attachments.public = false`, helper functions present, `p42_chat_attachments_select_scoped` present, `p19_chat_attachments_select_authenticated` removed
  - local verification: `superadmin npm run build:check` passed, `git diff --check` passed

### Slice 2 - User Directory Avatar and QR Hardening

- Status: `complete`
- Source commits:
  - `883e1c9` from `agent-user-app`
- Scope:
  - directory avatar upload/storage helper review
  - QR payload regeneration utilities
  - profile/detail wiring that should not depend on local device URIs
- Acceptance:
  - stored avatar paths and URLs are truthful
  - QR data uses the current persisted profile shape
  - no stale local-only avatar/QR assumptions remain on the active user directory surface
- Completion record:
  - added current-main helpers: `user/components/AppAvatar.js`, `user/utils/directoryAvatarStorage.js`, `user/utils/directoryEntryQr.js`
  - user profile and directory create/edit/detail surfaces now upload truthful avatar URLs instead of persisting raw local image URIs
  - directory QR payload generation/regeneration is centralized across family members, daily help, vehicles, and frequent entries
  - removed stale vehicle `plate_number` assumptions from active user edit/detail/profile flows to match the live `vehicles` table contract
  - no SQL migration was required; current schema already supports the ported behavior
  - local verification: targeted `npx eslint` passed on all touched user files, `git diff --check` passed
  - residual app-wide lint boundary unchanged: `npm run lint` still fails on pre-existing unrelated files `user/app/_layout.tsx`, `user/components/addCabModal.js`, and `user/components/serviceModal_broken.js`

### Slice 3 - Guard Resident Directory Integrity and Recent Search Hygiene

- Status: `complete`
- Source commits:
  - `bf81330` from `agent-guard-app`
- Scope:
  - resident directory freshness and invalidation
  - community-scoped recent resident search history
  - fail-closed resident-directory behavior when the module is disabled
  - fresh replacement for the stale directory integrity migration if still required
- Acceptance:
  - guard resident directory reflects current membership truthfully
  - recent-search state stays scoped and non-leaky
  - disabled resident-directory access fails closed
  - any required migration is applied live and recorded
- Completion record:
  - ported current-main app changes from stale guard commit `bf81330`: Guard resident directory/search now use translation-backed resident labels and empty/error states, recent resident search history is scoped by both auth user and guard community, and Guard/user directory subscriptions now invalidate on `units` changes
  - fresh parity migration applied and recorded: `supabase/migrations/20260322153000_phase43_community_directory_membership_integrity_parity.sql`
  - live verification after Phase 43: migration history row present, preserved `p35_validate_community_membership_profile_scope` and `p35_sync_profile_directory_membership` functions/triggers present, new `datafix_phase43_*` backup tables present, and live drift counts remain `0` for drifted active memberships, missing same-community memberships, and inactive same-community memberships
  - local verification: `npx eslint hooks/useCommunityMembers.ts` passed in `user`, `git diff --check` passed
  - local Guard lint boundary remains tooling-only: `npx eslint` / `npx eslint@9` in `Guard` attempted ad-hoc ESLint installs and failed because the workspace does not expose a flat-config-compatible local lint entrypoint; no slice-specific code error was surfaced from that path
  - deliberate boundary: Phase 43 was not backported into `supabase/migrations/20260206_baseline_schema.sql` because the current baseline snapshot does not inline the Phase 10 `community_memberships` domain that this migration depends on; Phase 43 remains represented in the active post-baseline migration set

## Next Action

- Controlled worktree reintegration is complete.
- Move to the recorded runtime signoff pack in `MANUAL_RUNTIME_QA_PACK.md`.
- Fix and re-verify only the defects discovered during runtime signoff.
