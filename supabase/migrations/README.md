# Supabase Migrations (Source of Truth)

This directory is the single source of truth for all database migrations in Casa Nirvana.

## Baseline

- `20260206_baseline_schema.sql` is the canonical snapshot of the live schema as of 2026-02-06.
- All pre-baseline migrations were archived to `_archive/2026-02-06-pre-baseline` to prevent reapplying them.
- New migrations must be created *after* the baseline and applied in timestamp order.

## How to Apply

Use the Supabase CLI from the repo root:

```bash
supabase db push
```

You can also apply a migration manually in the Supabase Dashboard SQL editor.

## Notes

- Migrations from the superadmin app have been consolidated here.
- Do not add new migrations under app-specific folders.
- Keep filenames timestamped and ordered.

## Personal Hub Migrations

The Personal Hub migrations previously lived in `superadmin/supabase/migrations`.
They now live here alongside all other migrations.
