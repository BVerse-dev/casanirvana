-- Phase 14 closeout:
-- Archive orphaned personal-hub transactions that still have null user_id
-- after auth-mapped backfill passes, then remove them from live tables.
-- Reversible by reinserting rows from the archive tables.

do $$
declare
  cleanup_tag constant text := 'phase14_orphan_user_archive_20260221';
begin
  -- airtime_purchases
  create table if not exists public.datafix_phase14_orphan_airtime_purchases_archive
  (like public.airtime_purchases including all);
  alter table public.datafix_phase14_orphan_airtime_purchases_archive
    add column if not exists archived_at timestamptz not null default now(),
    add column if not exists cleanup_tag text not null default 'phase14_orphan_user_archive_20260221',
    add column if not exists archive_reason text not null default 'unresolved user_id (no valid auth mapping)';
  create unique index if not exists datafix_phase14_orphan_airtime_purchases_archive_id_uidx
    on public.datafix_phase14_orphan_airtime_purchases_archive (id);

  insert into public.datafix_phase14_orphan_airtime_purchases_archive
  select ap.*, now(), cleanup_tag, 'unresolved user_id (no valid auth mapping)'
  from public.airtime_purchases ap
  where ap.user_id is null
    and not exists (
      select 1
      from public.datafix_phase14_orphan_airtime_purchases_archive a
      where a.id = ap.id
    );

  delete from public.airtime_purchases
  where user_id is null;

  -- data_purchases
  create table if not exists public.datafix_phase14_orphan_data_purchases_archive
  (like public.data_purchases including all);
  alter table public.datafix_phase14_orphan_data_purchases_archive
    add column if not exists archived_at timestamptz not null default now(),
    add column if not exists cleanup_tag text not null default 'phase14_orphan_user_archive_20260221',
    add column if not exists archive_reason text not null default 'unresolved user_id (no valid auth mapping)';
  create unique index if not exists datafix_phase14_orphan_data_purchases_archive_id_uidx
    on public.datafix_phase14_orphan_data_purchases_archive (id);

  insert into public.datafix_phase14_orphan_data_purchases_archive
  select dp.*, now(), cleanup_tag, 'unresolved user_id (no valid auth mapping)'
  from public.data_purchases dp
  where dp.user_id is null
    and not exists (
      select 1
      from public.datafix_phase14_orphan_data_purchases_archive a
      where a.id = dp.id
    );

  delete from public.data_purchases
  where user_id is null;

  -- money_transfers
  create table if not exists public.datafix_phase14_orphan_money_transfers_archive
  (like public.money_transfers including all);
  alter table public.datafix_phase14_orphan_money_transfers_archive
    add column if not exists archived_at timestamptz not null default now(),
    add column if not exists cleanup_tag text not null default 'phase14_orphan_user_archive_20260221',
    add column if not exists archive_reason text not null default 'unresolved user_id (no valid auth mapping)';
  create unique index if not exists datafix_phase14_orphan_money_transfers_archive_id_uidx
    on public.datafix_phase14_orphan_money_transfers_archive (id);

  insert into public.datafix_phase14_orphan_money_transfers_archive
  select mt.*, now(), cleanup_tag, 'unresolved user_id (no valid auth mapping)'
  from public.money_transfers mt
  where mt.user_id is null
    and not exists (
      select 1
      from public.datafix_phase14_orphan_money_transfers_archive a
      where a.id = mt.id
    );

  delete from public.money_transfers
  where user_id is null;

  -- bill_payments
  create table if not exists public.datafix_phase14_orphan_bill_payments_archive
  (like public.bill_payments including all);
  alter table public.datafix_phase14_orphan_bill_payments_archive
    add column if not exists archived_at timestamptz not null default now(),
    add column if not exists cleanup_tag text not null default 'phase14_orphan_user_archive_20260221',
    add column if not exists archive_reason text not null default 'unresolved user_id (no valid auth mapping)';
  create unique index if not exists datafix_phase14_orphan_bill_payments_archive_id_uidx
    on public.datafix_phase14_orphan_bill_payments_archive (id);

  insert into public.datafix_phase14_orphan_bill_payments_archive
  select bp.*, now(), cleanup_tag, 'unresolved user_id (no valid auth mapping)'
  from public.bill_payments bp
  where bp.user_id is null
    and not exists (
      select 1
      from public.datafix_phase14_orphan_bill_payments_archive a
      where a.id = bp.id
    );

  delete from public.bill_payments
  where user_id is null;
end $$;
