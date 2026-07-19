# Casa Nirvana Platform

Casa Nirvana is maintained as a deployment-oriented monorepo. Each application keeps an independent package manifest and lockfile so it can be installed, built and deployed without dependency hoisting or a package-manager migration during the launch window.

## Repository Layout

| Path | Application | Deployment target |
| --- | --- | --- |
| `apps/marketing-web` | Next.js marketing website | Vercel project rooted at `apps/marketing-web`; `casanirvana.app` |
| `apps/superadmin` | Next.js administration workspace | Vercel project rooted at `apps/superadmin`; `admin.casanirvana.app` |
| `apps/api` | Express/TypeScript API | Render service rooted at `apps/api` |
| `apps/resident-mobile` | Expo resident application | EAS commands run from `apps/resident-mobile` |
| `apps/guard-mobile` | Expo guard application | EAS commands run from `apps/guard-mobile` |
| `supabase` | Canonical database migrations and generated types | Casa Nirvana Supabase project only |
| `wordpress` | Local visual reference and rollback source | Never deployed as part of the Next.js application |
| `scripts` | Repository orchestration and maintenance scripts | Local/CI tooling |
| `docs` | Architecture and transition records | Documentation |

## Root Commands

```bash
npm run build
npm run check
npm run dev:backend
npm run dev:superadmin
npm run dev:marketing
npm run dev:user
npm run dev:guard
```

Root commands delegate into each independent application. Install application dependencies inside the relevant directory with `npm ci`.

## Deployment Boundaries

- Marketing and superadmin are separate Vercel projects connected to this same repository.
- Set each Vercel project Root Directory exactly as shown in the layout table.
- The API remains a separate Render service with Root Directory `apps/api`.
- Mobile builds and submissions must run from their respective Expo application directories.
- Split-repository automation preserves the existing downstream repository names while using the new `apps/*` prefixes.
- Do not introduce dependency upgrades, shared UI extraction, pnpm workspaces or Turborepo changes during the mechanical launch transition.

## Shared Contracts

- `supabase/database.types.ts` is the generated database type source.
- Run `bash scripts/sync-db-types.sh` after regenerating database types.
- Public marketing claims are governed by `MARKETING_SITE_PRODUCT_CLAIMS_MATRIX.md`.
- Marketing launch evidence is governed by `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md` and `MARKETING_SITE_MANUAL_ACCEPTANCE_CHECKLIST.md`.
- Production release status is governed by `LAUNCH_WAR_ROOM_CHECKLIST.md` and `PROGRESS_CHECKLIST.md`.

## Secrets

Never commit `.env`, `.env.local`, API keys, service-role keys, database passwords or deployment tokens. Use each hosting provider's environment-variable controls and the committed `.env.example` files as key-name contracts.
