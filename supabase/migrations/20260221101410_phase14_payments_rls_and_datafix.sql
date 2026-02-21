-- Phase 14: Payments domain hardening + reversible user_id cleanup.
-- Scope:
--   1) Harden access to personal-hub provider/status-log data.
--   2) Make personal_hub_transactions view evaluate underlying RLS as the caller.
--   3) Backfill legacy personal-hub user_id nulls where mapping is deterministic and FK-safe.

begin;

-- ---------------------------------------------------------------------------
-- Helper function for transaction status-log access checks.
-- SECURITY DEFINER + row_security off avoids policy recursion and keeps checks deterministic.
-- ---------------------------------------------------------------------------

create or replace function public.can_access_personal_hub_transaction(
  target_transaction_type text,
  target_transaction_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  with normalized as (
    select case
      when lower(coalesce(target_transaction_type, '')) = 'marketplace' then 'shopping'::text
      else lower(coalesce(target_transaction_type, ''))
    end as tx_type
  ),
  tx as (
    select 'airtime'::text as tx_type, a.id as transaction_id, a.user_id, a.profile_id
    from public.airtime_purchases a
    union all
    select 'data'::text, d.id, d.user_id, d.profile_id
    from public.data_purchases d
    union all
    select 'money_transfer'::text, m.id, m.user_id, m.profile_id
    from public.money_transfers m
    union all
    select 'bill_payment'::text, b.id, b.user_id, b.profile_id
    from public.bill_payments b
    union all
    select 'insurance'::text, i.id, i.user_id, i.profile_id
    from public.insurance_payments i
    union all
    select 'shopping'::text, s.id, s.user_id, s.profile_id
    from public.shopping_payments s
  )
  select coalesce(exists (
    select 1
    from tx t
    left join public.profiles p_profile on p_profile.id = t.profile_id
    left join public.profiles p_user on p_user.user_id = t.user_id
    where t.transaction_id = target_transaction_id
      and t.tx_type = (select n.tx_type from normalized n)
      and (
        public.matches_current_actor(t.user_id)
        or public.matches_current_actor(t.profile_id)
        or (
          public.is_admin_role()
          and (
            public.can_access_community(p_profile.community_id)
            or public.can_access_community(p_user.community_id)
          )
        )
      )
  ), false);
$$;

-- ---------------------------------------------------------------------------
-- personal_hub_transactions (view): enforce caller-invoker semantics.
-- ---------------------------------------------------------------------------

alter view public.personal_hub_transactions set (security_invoker = true);

revoke all on table public.personal_hub_transactions from anon, authenticated, service_role;
grant select on table public.personal_hub_transactions to authenticated;
grant select on table public.personal_hub_transactions to service_role;

-- ---------------------------------------------------------------------------
-- service_providers: drop legacy policy set, add scoped policies, tighten grants.
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in
    select p.policyname
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'service_providers'
  loop
    execute format('drop policy if exists %I on public.service_providers', r.policyname);
  end loop;
end;
$$;

alter table public.service_providers enable row level security;

create policy p14_service_providers_select_admin_scoped
on public.service_providers
for select
to authenticated
using (public.is_admin_role());

create policy p14_service_providers_write_superadmin
on public.service_providers
for all
to authenticated
using (public.is_superadmin_role())
with check (public.is_superadmin_role());

create policy p14_service_providers_service_role_all
on public.service_providers
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

revoke all on table public.service_providers from anon, authenticated;
grant select, insert, update, delete on table public.service_providers to authenticated;
grant all on table public.service_providers to service_role;

-- ---------------------------------------------------------------------------
-- transaction_status_logs: scoped policies + grant tightening.
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in
    select p.policyname
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = 'transaction_status_logs'
  loop
    execute format('drop policy if exists %I on public.transaction_status_logs', r.policyname);
  end loop;
end;
$$;

alter table public.transaction_status_logs enable row level security;

create policy p14_transaction_status_logs_select_scoped
on public.transaction_status_logs
for select
to authenticated
using (
  public.can_access_personal_hub_transaction(transaction_type, transaction_id)
);

create policy p14_transaction_status_logs_insert_admin_scoped
on public.transaction_status_logs
for insert
to authenticated
with check (
  public.is_admin_role()
  and public.can_access_personal_hub_transaction(transaction_type, transaction_id)
  and (changed_by is null or changed_by = auth.uid())
);

create policy p14_transaction_status_logs_service_role_all
on public.transaction_status_logs
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

revoke all on table public.transaction_status_logs from anon, authenticated;
grant select, insert on table public.transaction_status_logs to authenticated;
grant all on table public.transaction_status_logs to service_role;

-- ---------------------------------------------------------------------------
-- Reversible data cleanup: backfill user_id on personal-hub payment tables
-- where profile_id -> profiles.user_id -> auth.users is deterministic and FK-safe.
-- ---------------------------------------------------------------------------

create table if not exists public.datafix_phase14_payment_user_id_backfill_backup (
  cleanup_tag text not null,
  table_name text not null,
  row_id uuid not null,
  profile_id uuid,
  old_user_id uuid,
  new_user_id uuid not null,
  reason text not null,
  backed_up_at timestamp with time zone not null default now(),
  primary key (cleanup_tag, table_name, row_id)
);

with candidates as (
  select
    'airtime_purchases'::text as table_name,
    a.id as row_id,
    a.profile_id,
    a.user_id as old_user_id,
    p.user_id as new_user_id,
    'profile_user_id_backfill'::text as reason
  from public.airtime_purchases a
  join public.profiles p on p.id = a.profile_id
  join auth.users au on au.id = p.user_id
  where a.user_id is null

  union all

  select
    'data_purchases'::text,
    d.id,
    d.profile_id,
    d.user_id,
    p.user_id,
    'profile_user_id_backfill'::text
  from public.data_purchases d
  join public.profiles p on p.id = d.profile_id
  join auth.users au on au.id = p.user_id
  where d.user_id is null

  union all

  select
    'money_transfers'::text,
    m.id,
    m.profile_id,
    m.user_id,
    p.user_id,
    'profile_user_id_backfill'::text
  from public.money_transfers m
  join public.profiles p on p.id = m.profile_id
  join auth.users au on au.id = p.user_id
  where m.user_id is null

  union all

  select
    'bill_payments'::text,
    b.id,
    b.profile_id,
    b.user_id,
    p.user_id,
    'profile_user_id_backfill'::text
  from public.bill_payments b
  join public.profiles p on p.id = b.profile_id
  join auth.users au on au.id = p.user_id
  where b.user_id is null

  union all

  select
    'insurance_payments'::text,
    i.id,
    i.profile_id,
    i.user_id,
    p.user_id,
    'profile_user_id_backfill'::text
  from public.insurance_payments i
  join public.profiles p on p.id = i.profile_id
  join auth.users au on au.id = p.user_id
  where i.user_id is null

  union all

  select
    'shopping_payments'::text,
    s.id,
    s.profile_id,
    s.user_id,
    p.user_id,
    'profile_user_id_backfill'::text
  from public.shopping_payments s
  join public.profiles p on p.id = s.profile_id
  join auth.users au on au.id = p.user_id
  where s.user_id is null
)
insert into public.datafix_phase14_payment_user_id_backfill_backup (
  cleanup_tag,
  table_name,
  row_id,
  profile_id,
  old_user_id,
  new_user_id,
  reason
)
select
  'phase14_payments_user_id_cleanup_20260221',
  c.table_name,
  c.row_id,
  c.profile_id,
  c.old_user_id,
  c.new_user_id,
  c.reason
from candidates c
on conflict (cleanup_tag, table_name, row_id) do nothing;

update public.airtime_purchases t
set user_id = b.new_user_id,
    updated_at = now()
from public.datafix_phase14_payment_user_id_backfill_backup b
where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
  and b.table_name = 'airtime_purchases'
  and t.id = b.row_id
  and t.user_id is null;

update public.data_purchases t
set user_id = b.new_user_id,
    updated_at = now()
from public.datafix_phase14_payment_user_id_backfill_backup b
where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
  and b.table_name = 'data_purchases'
  and t.id = b.row_id
  and t.user_id is null;

update public.money_transfers t
set user_id = b.new_user_id,
    updated_at = now()
from public.datafix_phase14_payment_user_id_backfill_backup b
where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
  and b.table_name = 'money_transfers'
  and t.id = b.row_id
  and t.user_id is null;

update public.bill_payments t
set user_id = b.new_user_id,
    updated_at = now()
from public.datafix_phase14_payment_user_id_backfill_backup b
where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
  and b.table_name = 'bill_payments'
  and t.id = b.row_id
  and t.user_id is null;

update public.insurance_payments t
set user_id = b.new_user_id,
    updated_at = now()
from public.datafix_phase14_payment_user_id_backfill_backup b
where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
  and b.table_name = 'insurance_payments'
  and t.id = b.row_id
  and t.user_id is null;

update public.shopping_payments t
set user_id = b.new_user_id,
    updated_at = now()
from public.datafix_phase14_payment_user_id_backfill_backup b
where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
  and b.table_name = 'shopping_payments'
  and t.id = b.row_id
  and t.user_id is null;

commit;

-- Rollback (manual):
-- update public.airtime_purchases t
-- set user_id = b.old_user_id,
--     updated_at = now()
-- from public.datafix_phase14_payment_user_id_backfill_backup b
-- where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
--   and b.table_name = 'airtime_purchases'
--   and t.id = b.row_id;
--
-- update public.data_purchases t
-- set user_id = b.old_user_id,
--     updated_at = now()
-- from public.datafix_phase14_payment_user_id_backfill_backup b
-- where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
--   and b.table_name = 'data_purchases'
--   and t.id = b.row_id;
--
-- update public.money_transfers t
-- set user_id = b.old_user_id,
--     updated_at = now()
-- from public.datafix_phase14_payment_user_id_backfill_backup b
-- where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
--   and b.table_name = 'money_transfers'
--   and t.id = b.row_id;
--
-- update public.bill_payments t
-- set user_id = b.old_user_id,
--     updated_at = now()
-- from public.datafix_phase14_payment_user_id_backfill_backup b
-- where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
--   and b.table_name = 'bill_payments'
--   and t.id = b.row_id;
--
-- update public.insurance_payments t
-- set user_id = b.old_user_id,
--     updated_at = now()
-- from public.datafix_phase14_payment_user_id_backfill_backup b
-- where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
--   and b.table_name = 'insurance_payments'
--   and t.id = b.row_id;
--
-- update public.shopping_payments t
-- set user_id = b.old_user_id,
--     updated_at = now()
-- from public.datafix_phase14_payment_user_id_backfill_backup b
-- where b.cleanup_tag = 'phase14_payments_user_id_cleanup_20260221'
--   and b.table_name = 'shopping_payments'
--   and t.id = b.row_id;
