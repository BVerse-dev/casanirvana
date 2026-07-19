# Seed Data Alignment (Phase 5)

This document tracks seed sources and the plan to consolidate them.

## Current Seed Sources

- SQL seed migration:
  - `supabase/migrations/20250203000002_seed_module_settings.sql`

- App-level seed scripts (dev-only):
  - `apps/api/seedUserAndUnit.js`
  - `apps/api/seedMaintenanceRequests.js`
  - `apps/resident-mobile/scripts/seed-test-users.js`
  - `apps/resident-mobile/scripts/seedNotificationData.js`
  - `apps/resident-mobile/scripts/seedMaintenanceData.js`
  - `apps/resident-mobile/scripts/supabaseNotificationSeeder.js`
  - `apps/resident-mobile/scripts/seedMemberData.js`

## Plan (Recommended)

1. Keep *production* seeds in SQL under `supabase/` (preferably a single `seed.sql`).
2. Convert or retire JS seed scripts that are not required for production.
3. Ensure RLS policies allow only the intended seed operations (service role or SQL).

## Status

- Consolidation started (migrations unified).
- Seed scripts still need to be reviewed and either:
  - migrated into SQL seeds, or
  - marked as dev-only and excluded from production flows.
