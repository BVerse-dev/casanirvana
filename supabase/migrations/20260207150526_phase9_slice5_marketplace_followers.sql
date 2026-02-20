-- Phase 9 / Slice 5: restore marketplace vendor follow schema and remove generic counter RPC dependency.

alter table if exists public.marketplace_vendors
  add column if not exists follower_count integer not null default 0;

create table if not exists public.marketplace_vendor_followers (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.marketplace_vendors(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint marketplace_vendor_followers_vendor_user_unique
    unique (vendor_id, user_id)
);

create index if not exists idx_marketplace_vendor_followers_vendor_id
  on public.marketplace_vendor_followers (vendor_id);
create index if not exists idx_marketplace_vendor_followers_user_id
  on public.marketplace_vendor_followers (user_id);

create or replace function public.sync_marketplace_vendor_follower_count(target_vendor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_vendor_id is null then
    return;
  end if;

  update public.marketplace_vendors mv
  set follower_count = (
    select count(*)
    from public.marketplace_vendor_followers mvf
    where mvf.vendor_id = target_vendor_id
  )
  where mv.id = target_vendor_id;
end;
$$;

create or replace function public.marketplace_vendor_followers_sync_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_marketplace_vendor_follower_count(coalesce(new.vendor_id, old.vendor_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_marketplace_vendor_followers_sync_count on public.marketplace_vendor_followers;
create trigger trg_marketplace_vendor_followers_sync_count
after insert or delete or update of vendor_id on public.marketplace_vendor_followers
for each row execute function public.marketplace_vendor_followers_sync_trigger();

-- Backfill counts for existing rows.
update public.marketplace_vendors mv
set follower_count = coalesce(stats.follower_count, 0)
from (
  select vendor_id, count(*)::integer as follower_count
  from public.marketplace_vendor_followers
  group by vendor_id
) stats
where mv.id = stats.vendor_id;

update public.marketplace_vendors
set follower_count = 0
where follower_count is null;

alter table public.marketplace_vendor_followers enable row level security;

drop policy if exists marketplace_vendor_followers_owner_select on public.marketplace_vendor_followers;
create policy marketplace_vendor_followers_owner_select
on public.marketplace_vendor_followers
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists marketplace_vendor_followers_owner_insert on public.marketplace_vendor_followers;
create policy marketplace_vendor_followers_owner_insert
on public.marketplace_vendor_followers
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists marketplace_vendor_followers_owner_delete on public.marketplace_vendor_followers;
create policy marketplace_vendor_followers_owner_delete
on public.marketplace_vendor_followers
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists marketplace_vendor_followers_service_role_all on public.marketplace_vendor_followers;
create policy marketplace_vendor_followers_service_role_all
on public.marketplace_vendor_followers
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

revoke all on public.marketplace_vendor_followers from anon;
grant select, insert, delete on public.marketplace_vendor_followers to authenticated;
grant select, insert, update, delete on public.marketplace_vendor_followers to service_role;

