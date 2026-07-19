# Casa Nirvana Monorepo Transition Plan

## Objective

Move Casa Nirvana to a conventional, maintainable monorepo without losing Git
history, breaking imports, changing application behavior, or interrupting the
existing deployment pipelines.

The transition is intentionally separate from the WordPress-to-Next.js visual
migration. Folder moves must remain mechanical and must not include feature
rewrites.

## Current application paths

- `apps/api/`: shared Express API
- `apps/superadmin/`: Next.js administration application
- `apps/resident-mobile/`: Expo resident application
- `apps/guard-mobile/`: Expo guard application
- `supabase/`: canonical database migrations and generated database types
- `wordpress/`: local WordPress reference and versioned child theme

Existing CI and split-repository automation depend on these paths. They remain
unchanged during the marketing-site parity phase.

## Target structure

```text
apps/
  api/
  apps/superadmin/
  resident-mobile/
  guard-mobile/
  marketing-web/

packages/
  api-contracts/
  database-types/
  brand-tokens/
  shared-config/

supabase/
docs/
scripts/
wordpress/
```

UI code will not be forced into one shared package across web and React Native.
Only stable contracts, generated database types, configuration, and brand
tokens should be shared initially.

## Safe transition phases

### Phase 1: inventory and ownership

- Record every application entrypoint, local path dependency, alias, route, and environment file.
- Record Vercel, Render, Expo/EAS, GitHub Actions, and split-repository root paths.
- Confirm `supabase/` as the single migration source of truth.
- Identify generated files and duplicated database types.

### Phase 2: root orchestration without path moves

- Add root commands that invoke each application's existing lockfile and scripts.
- Keep each application independently installable and deployable.
- Add a dependency-aware CI matrix without changing runtime code.
- Add ownership and documentation conventions.

### Phase 3: shared packages

- Extract generated database types without changing their public imports abruptly.
- Extract API request/response contracts.
- Add compatibility re-exports at old import paths.
- Move brand constants only after visual parity is approved.

### Phase 4: mechanical directory move

- Create a dedicated migration branch and release checkpoint.
- Use history-preserving Git moves.
- Update path aliases, scripts, CI, split-repository prefixes, and deployment roots in one coordinated change.
- Do not change application behavior or dependencies in this phase.
- Keep rollback instructions and the previous deployment configuration available.

### Phase 5: deployment cutover

- Update preview deployments first.
- Confirm backend health and every application build from its new root.
- Confirm Supabase project references and environment mappings.
- Switch production root directories only after preview approval.
- Confirm split repositories receive the same source tree as before the move.

### Phase 6: cleanup

- Remove temporary compatibility exports only after all consumers use the new paths.
- Consolidate package management only after deployment stability is proven.
- Remove obsolete duplicated configuration and generated artifacts.

## Guardrails

- No feature work in a mechanical move change set.
- No package-manager conversion in the same change set as directory moves.
- No database migration is coupled to repository restructuring.
- No deletion until the replacement path is present and consumers are updated.
- No production deployment-root change before its preview equivalent succeeds.
- Each application must remain independently buildable during the transition.
- Secrets and local environment files remain untracked.

## Rollback boundary

The production folder structure is not changed until the new paths have passed
preview deployment checks. If cutover fails, hosting roots return to the previous
paths without reverting application feature work or database state.

## Execution record - 2026-07-19

The mechanical directory transition is complete locally:

- `backend` -> `apps/api`
- `superadmin` -> `apps/superadmin`
- `user` -> `apps/resident-mobile`
- `Guard` -> `apps/guard-mobile`
- `apps/marketing-web` retained in place

Root orchestration, CI working directories, split-repository prefixes, database-type synchronization, and documentation paths were updated together. Independent lockfiles were retained and no package-manager migration, dependency upgrade, database migration, or feature refactor was included. The root production build passed for the API, superadmin, and marketing applications.

Remote publication completed on 2026-07-19: commit `66f6aa02` was published to the transition branch and remote `main` was fast-forwarded to the same commit. Use `apps/marketing-web` for the marketing Vercel project, `apps/superadmin` for the existing superadmin Vercel project, `apps/api` for Render, `apps/resident-mobile` for resident EAS operations, and `apps/guard-mobile` for guard EAS operations. Preserve the previous production roots until smoke checks pass.
