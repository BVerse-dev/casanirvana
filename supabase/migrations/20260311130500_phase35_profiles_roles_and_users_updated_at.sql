-- Phase 35: align scoped admin roles and legacy users timestamps with live app expectations.

begin;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (
    role = any (
      array[
        'resident'::text,
        'guard'::text,
        'admin'::text,
        'maintenance'::text,
        'management'::text,
        'user'::text,
        'superadmin'::text,
        'agency_manager'::text,
        'facility_manager'::text
      ]
    )
  );

alter table public.users
  add column if not exists updated_at timestamp with time zone default now();

update public.users
   set updated_at = coalesce(updated_at, created_at, now())
 where updated_at is null;

alter table public.users
  alter column updated_at set default now(),
  alter column updated_at set not null;

drop trigger if exists users_set_updated_at on public.users;

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.update_updated_at_column();

commit;
