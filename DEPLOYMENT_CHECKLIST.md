# Casa Nirvana Deployment Checklists

Date: 2026-02-06

## Global (All Apps)
- Maintain separate Supabase projects per environment: `dev`, `staging`, `prod`.
- Use a single shared Supabase project per environment for all apps that share the same data model.
- Lock down RLS and remove any permissive `true` policies before production cutover.
- Store secrets in a secrets manager or CI/CD secrets, never in repo or build logs.
- Rotate all keys before production launch and set a recurring rotation schedule.
- Use the Supabase session pooler for IPv4-only networks.
- Centralize migrations in `/supabase/migrations` and apply them once per environment.
- Run migrations in CI/CD before any app deploy for that environment.
- Enable automated daily backups and verify PITR settings in Supabase.
- Ensure monitoring and alerting are enabled for API errors, DB errors, and uptime.

## Database / Migrations
- Baseline migration applied: `20260206_baseline_schema.sql`.
- Migrations are applied via `supabase db push` from repo root.
- Migration history is aligned via `supabase migration repair` when baselining.
- Drift audits are run after each production change window.

## Backend (Express API)
- Build: `npm ci && npm run build` in `apps/api/`.
- Test: `npm run test` in `apps/api/`.
- Env vars must match `apps/api/.env.example`.
- Service role key is only present in backend runtime, never in clients.
- CORS origins restricted to deployed frontend domains.
- Rate limiting enabled and tuned for production traffic.
- Health check endpoint verified in production.
- Log output shipped to centralized logging.

## Superadmin (Next.js)
- Build: `npm ci && npm run build` in `apps/superadmin/`.
- Test: `npm run build:check` or `npm run lint` before deployment.
- Env vars must match `apps/superadmin/.env.example`.
- `NEXTAUTH_SECRET` set and stored in secrets manager.
- `NEXTAUTH_URL` set to the production domain.
- `NEXT_PUBLIC_ADMIN_SIGNUP_DISABLED=true` enforced in prod.
- API base URL points to the production backend.
- Verify no service role key is exposed to client code.

## User App (Expo)

## Marketing Web (Next.js 16)
- Build and acceptance checks: `npm ci && npm run check && npm run build` in `apps/marketing-web/`.
- Deploy from a dedicated Vercel project rooted at `apps/marketing-web` using Node.js 20.9 or newer.
- Configure preview and production values for `NEXT_PUBLIC_SITE_URL`, `BACKEND_API_URL`, `ONBOARDING_REQUEST_API_KEY`, and `MARKETING_CONTACT_API_KEY`.
- Keep onboarding and contact keys server-only; never configure them with a `NEXT_PUBLIC_` prefix.
- Record parity, forms, SEO, deployment, cutover, and rollback evidence in `MARKETING_SITE_IMPLEMENTATION_CHECKLIST.md`.
- Preserve the last-known-good WordPress URL/export until production stability is approved.
- Verify all approved routes, navigation, forms, metadata, 404 behavior, mobile layout, backend delivery, analytics, and domain redirects before cutover.

## User App (Expo)
- Env vars must match `apps/resident-mobile/.env.example`.
- `API_BASE_URL` points to the production backend.
- `EXPO_PUBLIC_SUPABASE_*` uses production anon keys only.
- Build in CI with `eas build` or equivalent and signed credentials.
- OTA updates configured and gated for production.
- Crash reporting enabled for release builds.

## Guard App (Expo)
- Env vars must match `apps/guard-mobile/.env.example`.
- `API_BASE_URL` points to the production backend.
- `EXPO_PUBLIC_SUPABASE_*` uses production anon keys only.
- Build in CI with `eas build` or equivalent and signed credentials.
- OTA updates configured and gated for production.
- Crash reporting enabled for release builds.

## Release Process
- Tag releases and produce a short changelog per deploy.
- Run smoke tests after deploy: login, core flows, and admin actions.
- Rollback plan documented with last known good artifact versions.
- Post-deploy monitoring window with on-call owner.

## Temporary Test Deploy (Vercel)
- Create separate Vercel projects for `superadmin` and `apps/marketing-web`.
- Use Vercel Preview for dev/staging and Production for the temporary test release.
- Store env vars in Vercel Project Settings (never in repo) for `superadmin` using `apps/superadmin/.env.example`.
- Store env vars in Vercel Project Settings (never in repo) for `backend` using `apps/api/.env.example` if you host it on Vercel.
- Set `NEXTAUTH_URL` to the Vercel production domain for the test run.
- Use the Supabase session pooler if your CI runner is IPv4-only.
- If deploying the Express backend on Vercel, confirm it runs as serverless/edge.
- Prefer a Vercel Node Serverless setup or adapt routes to `/api` handlers.
- Validate cold start + request timeout limits for admin flows.
- If this becomes painful, use a short-lived container host (Render/Fly) for backend instead.
- Run smoke tests against the Vercel domain and the deployed backend URL.

## Production Deploy (AWS)
- Infrastructure as code (Terraform/CDK) for repeatability.
- Secrets in AWS Secrets Manager or SSM Parameter Store.
- Logging/metrics to CloudWatch + alarms for API error rates and latency.
- Use AWS WAF + security groups to restrict backend access.

### Backend (Express API)
- Recommended: ECS Fargate + ALB, autoscaling, health checks.
- One task definition per environment (`dev/staging/prod`).
- Attach IAM role with least-privileged access.
- Set `CORS_ORIGINS` to the production domains only.

### Superadmin (Next.js)
- Recommended: AWS Amplify Hosting or ECS + CloudFront.
- Ensure SSR/ISR behavior is supported if you use Amplify.
- Configure `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `NEXT_PUBLIC_API_URL` for prod.

### Mobile Apps (Expo)
- Build with EAS and signed credentials.
- Separate release channels for staging and production.
- OTA updates gated with explicit approvals for production channel.
