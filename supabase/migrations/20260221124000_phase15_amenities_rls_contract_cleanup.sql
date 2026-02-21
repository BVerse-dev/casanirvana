-- Phase 15: Amenities + amenity_bookings production hardening.
-- - Backfill/normalize amenity booking contract fields with reversible backup.
-- - Keep booking community/amount/date fields synced via trigger.
-- - Replace permissive legacy RLS with community-scoped policies.

begin;

-- ---------------------------------------------------------------------------
-- Reversible backup for rows affected by cleanup.
-- ---------------------------------------------------------------------------

create table if not exists public.amenity_bookings_cleanup_backup_20260221 as
select
  ab.*,
  null::text as backup_reason,
  now()::timestamptz as backup_at
from public.amenity_bookings ab
where false;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'amenity_bookings_cleanup_backup_20260221'
      and column_name = 'backup_reason'
  ) then
    alter table public.amenity_bookings_cleanup_backup_20260221
      add column backup_reason text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'amenity_bookings_cleanup_backup_20260221'
      and column_name = 'backup_at'
  ) then
    alter table public.amenity_bookings_cleanup_backup_20260221
      add column backup_at timestamptz;
  end if;
end;
$$;

insert into public.amenity_bookings_cleanup_backup_20260221
select
  ab.*,
  'phase15_contract_cleanup'::text as backup_reason,
  now()::timestamptz as backup_at
from public.amenity_bookings ab
where (
  ab.community_id is null
  or (coalesce(ab.total_amount, 0) = 0 and coalesce(ab.amount, 0) > 0)
  or ab.booking_date is null
  or ab.start_time is null
  or ab.end_time is null
)
and not exists (
  select 1
  from public.amenity_bookings_cleanup_backup_20260221 b
  where b.id = ab.id
);

-- ---------------------------------------------------------------------------
-- Data cleanup + normalization.
-- ---------------------------------------------------------------------------

update public.amenity_bookings ab
set community_id = a.community_id
from public.amenities a
where ab.amenity_id = a.id
  and ab.community_id is null
  and a.community_id is not null;

update public.amenity_bookings
set total_amount = amount
where coalesce(total_amount, 0) = 0
  and coalesce(amount, 0) > 0;

update public.amenity_bookings
set
  booking_date = coalesce(booking_date, start_datetime::date),
  start_time = coalesce(start_time, start_datetime::time),
  end_time = coalesce(end_time, end_datetime::time)
where booking_date is null
   or start_time is null
   or end_time is null;

-- ---------------------------------------------------------------------------
-- Contract trigger for future inserts/updates.
-- ---------------------------------------------------------------------------

create or replace function public.sync_amenity_booking_contract_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_community_id uuid;
begin
  if new.amenity_id is not null then
    select a.community_id
      into v_community_id
    from public.amenities a
    where a.id = new.amenity_id;

    if v_community_id is not null and new.community_id is distinct from v_community_id then
      new.community_id := v_community_id;
    end if;
  end if;

  if new.total_amount is null then
    new.total_amount := coalesce(new.amount, 0);
  end if;

  if new.amount is null then
    new.amount := coalesce(new.total_amount, 0);
  end if;

  if new.booking_date is null and new.start_datetime is not null then
    new.booking_date := new.start_datetime::date;
  end if;

  if new.start_time is null and new.start_datetime is not null then
    new.start_time := new.start_datetime::time;
  end if;

  if new.end_time is null and new.end_datetime is not null then
    new.end_time := new.end_datetime::time;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_sync_amenity_booking_contract_fields on public.amenity_bookings;

create trigger trg_sync_amenity_booking_contract_fields
before insert or update on public.amenity_bookings
for each row
execute function public.sync_amenity_booking_contract_fields();

-- ---------------------------------------------------------------------------
-- RLS hardening.
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('amenities', 'amenity_bookings')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end;
$$;

alter table public.amenities enable row level security;
alter table public.amenity_bookings enable row level security;

-- Amenities: community-scoped reads + admin-scoped writes.
create policy p15_amenities_select_scoped
on public.amenities
for select
to authenticated
using (
  public.can_access_community(community_id)
);

create policy p15_amenities_insert_admin_scoped
on public.amenities
for insert
to authenticated
with check (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

create policy p15_amenities_update_admin_scoped
on public.amenities
for update
to authenticated
using (
  public.is_admin_role()
  and public.can_access_community(community_id)
)
with check (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

create policy p15_amenities_delete_admin_scoped
on public.amenities
for delete
to authenticated
using (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

-- Amenity bookings: user-own access + admin community-scoped operations.
create policy p15_amenity_bookings_select_own
on public.amenity_bookings
for select
to authenticated
using (
  public.matches_current_actor(user_id)
);

create policy p15_amenity_bookings_select_admin_scoped
on public.amenity_bookings
for select
to authenticated
using (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

create policy p15_amenity_bookings_insert_own
on public.amenity_bookings
for insert
to authenticated
with check (
  public.matches_current_actor(user_id)
  and (community_id is null or public.can_access_community(community_id))
);

create policy p15_amenity_bookings_update_own_pending
on public.amenity_bookings
for update
to authenticated
using (
  public.matches_current_actor(user_id)
  and status = 'pending'
)
with check (
  public.matches_current_actor(user_id)
  and status = 'pending'
  and (community_id is null or public.can_access_community(community_id))
);

create policy p15_amenity_bookings_delete_own_pending
on public.amenity_bookings
for delete
to authenticated
using (
  public.matches_current_actor(user_id)
  and status = 'pending'
);

create policy p15_amenity_bookings_admin_manage
on public.amenity_bookings
for all
to authenticated
using (
  public.is_admin_role()
  and public.can_access_community(community_id)
)
with check (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

commit;
