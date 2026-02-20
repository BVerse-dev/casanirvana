-- Phase 9 / Slice 5: add user delivery addresses for marketplace checkout.

create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  label text,
  full_name text not null,
  phone_number text not null,
  street_address text not null,
  city text not null,
  region text not null,
  postal_code text,
  additional_info text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_addresses_user_id
  on public.user_addresses (user_id);
create index if not exists idx_user_addresses_user_id_default
  on public.user_addresses (user_id, is_default);

drop trigger if exists update_user_addresses_updated_at on public.user_addresses;
create trigger update_user_addresses_updated_at
before update on public.user_addresses
for each row execute function public.update_updated_at_column();

create or replace function public.user_addresses_default_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_default then
    update public.user_addresses
    set is_default = false
    where user_id = new.user_id
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and is_default = true;
  elsif tg_op = 'INSERT' and not exists (
    select 1
    from public.user_addresses ua
    where ua.user_id = new.user_id
      and ua.is_default = true
  ) then
    new.is_default := true;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_addresses_default_guard on public.user_addresses;
create trigger trg_user_addresses_default_guard
before insert or update of is_default, user_id on public.user_addresses
for each row execute function public.user_addresses_default_guard();

alter table public.user_addresses enable row level security;

drop policy if exists user_addresses_owner_select on public.user_addresses;
create policy user_addresses_owner_select
on public.user_addresses
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists user_addresses_owner_insert on public.user_addresses;
create policy user_addresses_owner_insert
on public.user_addresses
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists user_addresses_owner_update on public.user_addresses;
create policy user_addresses_owner_update
on public.user_addresses
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists user_addresses_owner_delete on public.user_addresses;
create policy user_addresses_owner_delete
on public.user_addresses
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists user_addresses_service_role_all on public.user_addresses;
create policy user_addresses_service_role_all
on public.user_addresses
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

revoke all on public.user_addresses from anon;
grant select, insert, update, delete on public.user_addresses to authenticated;
grant select, insert, update, delete on public.user_addresses to service_role;
