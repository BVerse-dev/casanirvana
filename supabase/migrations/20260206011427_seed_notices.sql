-- Baseline marker for live migration 20260206011427_seed_notices.
-- The original seed SQL is archived at:
-- supabase/migrations/_archive/2026-02-06-pre-baseline/recovered-live-history/20260206011427_seed_notices.sql
--
-- Reason: the seed rows are already folded into 20260206_baseline_schema.sql.
-- This no-op keeps local migration history aligned with live Casa Nirvana without replaying seed inserts.

do $$
begin
  raise notice 'Migration 20260206011427_seed_notices is represented by the baseline snapshot.';
end $$;
