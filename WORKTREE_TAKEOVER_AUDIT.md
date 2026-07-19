# Worktree Takeover Audit

Date: 2026-03-22
Owner: Platform Engineering
Purpose: Capture the state of the stale `user` and `Guard` worktree branches, identify what is still useful relative to current `main`, and define the safe continuation path for production integration.

## Current Repo State

- Current main branch: `e724119` (`Clear superadmin strict type-check debt`)
- Production migration track in repo: through Phase 41
- Active stale worktrees discovered:
  - `/Users/andromeda/casanirvana-wt/user-app`
  - `/Users/andromeda/casanirvana-wt/guard-app`

## Worktree Status

### User Worktree

- Branch: `agent-user-app`
- HEAD: `883e1c9`
- Merge base vs current `main`: `f0ad1df`
- Divergence from `main`: `main` is `61` commits ahead, `agent-user-app` is `2` commits ahead
- Worktree status: clean
- Remote status: pushed (`origin/agent-user-app`)

Branch-only commits:
- `55f9e92` `fix(chat): harden attachments and user call signaling`
- `883e1c9` `fix(profile): harden directory avatars and QR data`

### Guard Worktree

- Branch: `agent-guard-app`
- HEAD: `bf81330`
- Merge base vs current `main`: `f0ad1df`
- Divergence from `main`: `main` is `61` commits ahead, `agent-guard-app` is `1` commit ahead
- Worktree status: clean
- Remote status: pushed (`origin/agent-guard-app`)

Branch-only commit:
- `bf81330` `fix(guard): harden resident directory integrity`

## Audit Rules

- Do not merge either worktree branch directly into `main`.
- Treat old-timestamp SQL migrations as historical proposals, not safe-to-apply production migrations.
- Port only the useful behavior onto a fresh branch based on current `main`.
- Reissue any still-needed SQL changes with a new migration timestamp after validating current schema and live production state.

## Classification

## 1. User Commit `55f9e92` - Chat Attachments + User Call Signaling

Summary:
- This commit adds private/signed chat attachment handling across user, Guard, and superadmin message surfaces.
- It also replaces the older fake/local user call behavior with DB-driven call-state handling in the user app.

Primary touched surfaces:
- `apps/resident-mobile/hooks/useMessages.js`
- `apps/resident-mobile/hooks/useCalls.ts`
- `apps/resident-mobile/screens/callScreen.js`
- `apps/resident-mobile/screens/messageScreen.js`
- `apps/guard-mobile/hooks/useMessages.js`
- `apps/guard-mobile/screens/messageScreen.js`
- `apps/superadmin/src/hooks/useMessages.ts`
- `apps/superadmin/src/hooks/useGroups.ts`
- `apps/superadmin/src/app/(admin)/messages/components/ChatArea.tsx`
- `apps/superadmin/src/app/(admin)/messages/components/GroupChatArea.tsx`
- `supabase/migrations/20260307221500_phase19_chat_attachment_privacy_alignment.sql`

Classification:
- `Keep and port`:
  - private attachment payload normalization and signed-url hydration logic
  - filtering soft-deleted message rows
  - DB-driven user call lifecycle behavior and incoming/outgoing call-state cleanup
  - attachment handling alignment across user, Guard, and superadmin messaging surfaces
- `Rewrite on current main`:
  - the SQL migration `20260307221500_phase19_chat_attachment_privacy_alignment.sql`
  - any helper extraction paths that conflict with current file layout after the strict type-cleanup pass
- `Do not cherry-pick directly`:
  - the full commit as-is, because it touches three app surfaces plus a stale migration timestamp

Reasoning:
- The app behavior changes are still absent on current `main` and remain valuable.
- The migration timestamp is from `2026-03-07`, while current production migration history already runs through `2026-03-19`; replaying this file as-is would be poor migration hygiene and risks history confusion.

Takeover verdict:
- Resumable
- Safe path is selective porting onto current `main`, followed by a new migration only if the policy gap still exists after verification

## 2. User Commit `883e1c9` - Directory Avatars + QR Hardening

Summary:
- This commit introduces deterministic avatar rendering, storage-backed directory avatar uploads, and QR payload regeneration/normalization for profile directory entities.

Primary touched surfaces:
- `apps/resident-mobile/components/AppAvatar.js`
- `apps/resident-mobile/components/IncomingCallNavigationHandler.js`
- `apps/resident-mobile/components/addFamilyMemberModal.js`
- `apps/resident-mobile/components/editDailyHelpModal.js`
- `apps/resident-mobile/components/editFamilyMemberModal.js`
- `apps/resident-mobile/components/editFrequentEntryModal.js`
- `apps/resident-mobile/components/editVehicleModal.js`
- `apps/resident-mobile/components/entryDetailModal.js`
- `apps/resident-mobile/components/myVehiclesModal.js`
- `apps/resident-mobile/screens/editProfileScreen.js`
- `apps/resident-mobile/screens/profileScreen.js`
- `apps/resident-mobile/utils/directoryAvatarStorage.js`
- `apps/resident-mobile/utils/directoryEntryQr.js`

Classification:
- `Keep and port`:
  - storage-backed directory avatar upload helper
  - QR payload regeneration utilities for family/daily-help/vehicle/frequent-entry records
  - profile/detail wiring that stops relying on stale local image URIs
- `Rewrite on current main`:
  - `AppAvatar.js`, because it introduces new DiceBear dependencies and should be reviewed for production footprint before adoption
  - `IncomingCallNavigationHandler.js`, because it needs to be integrated against the final chosen user-call lifecycle implementation rather than blindly lifted
- `Docs only`:
  - `apps/resident-mobile/SCREEN_WIRING_CHECKLIST.md`
  - `apps/resident-mobile/SCHEMA_ALIGNMENT_GAPS.md`

Reasoning:
- The underlying direction is good and still missing on `main`.
- The dependency choice (`@dicebear/core`, `@dicebear/collection`) should be consciously accepted or replaced with a lighter local fallback before production.

Takeover verdict:
- Resumable
- Safe path is behavior-first rewrite on top of current `main`, not raw cherry-pick

## 3. Guard Commit `bf81330` - Resident Directory Integrity

Summary:
- This commit hardens Guard resident-directory freshness and search-history scoping and proposes a community-membership integrity migration.

Primary touched surfaces:
- `apps/guard-mobile/components/residentsTab.js`
- `apps/guard-mobile/hooks/useCommunityDirectoryMembers.js`
- `apps/guard-mobile/screens/searchScreen.js`
- `apps/guard-mobile/services/residentSearchHistoryService.js`
- `apps/resident-mobile/hooks/useCommunityMembers.ts`
- `supabase/migrations/20260307220000_phase35_community_directory_membership_integrity.sql`

Classification:
- `Keep and port`:
  - community-scoped recent resident lookup storage
  - improved resident directory invalidation behavior
  - fail-closed module-disabled resident directory UX
  - i18n cleanups for resident directory/search copy
- `Rewrite on current main`:
  - the SQL migration `20260307220000_phase35_community_directory_membership_integrity.sql`
  - any shared `apps/resident-mobile/hooks/useCommunityMembers.ts` invalidation adjustments after checking current subscription behavior on `main`
- `Docs only`:
  - `apps/guard-mobile/SCREEN_WIRING_CHECKLIST.md`
  - `apps/guard-mobile/SCHEMA_ALIGNMENT_GAPS.md`

Reasoning:
- The app-level Guard changes are production-relevant and still absent on `main`.
- The migration proposes valid integrity protections, but it must be revalidated against the current Phase 37+ schema before any live apply.

Takeover verdict:
- Resumable
- Safe path is selective porting plus a new migration only if the integrity gap still exists today

## Production-Safe Recommendation

Recommended continuation path:
1. Start from current `main`, not from either stale worktree branch.
2. Port the useful user chat/call attachment changes first.
3. Port the user directory avatar/QR hardening second.
4. Port the Guard resident-directory/search-integrity changes third.
5. Only after code integration, validate whether the two proposed SQL fixes are still required.
6. If required, create fresh migration files with new timestamps and verify them against current baseline/live history before apply.

## Immediate Risks To Avoid

- Do not merge `agent-user-app` or `agent-guard-app` directly.
- Do not apply `20260307221500_phase19_chat_attachment_privacy_alignment.sql` as-is.
- Do not apply `20260307220000_phase35_community_directory_membership_integrity.sql` as-is.
- Do not assume the worktree tracker updates are still authoritative until the code is re-integrated on current `main`.

## Takeover Decision

- Platform can take over both worktrees safely.
- The correct approach is controlled reintegration on top of current `main`.
- There is no need to keep working inside the stale worktrees unless unpublished human context exists outside the commits.
