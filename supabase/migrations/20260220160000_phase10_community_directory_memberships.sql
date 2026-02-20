-- Phase 10: Community directory memberships (community-scoped roles)
-- Purpose:
--   - Introduce a canonical source for member/admin/committee assignments per community.
--   - Keep platform/global roles in profiles.role unchanged.
--   - Support production-safe wiring across superadmin, user app, and guard app.

create table if not exists public.community_memberships (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  membership_role text not null default 'member',
  committee_position text,
  tenure_start date,
  tenure_end date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null
);

-- Ensure one active membership record per profile per community.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'community_memberships_community_profile_key'
  ) then
    alter table public.community_memberships
      add constraint community_memberships_community_profile_key
      unique (community_id, profile_id);
  end if;
end $$;

-- Controlled role values for community directory.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'community_memberships_membership_role_check'
  ) then
    alter table public.community_memberships
      add constraint community_memberships_membership_role_check
      check (membership_role in ('member', 'admin', 'committee'));
  end if;
end $$;

-- Tenure range integrity.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'community_memberships_tenure_range_check'
  ) then
    alter table public.community_memberships
      add constraint community_memberships_tenure_range_check
      check (tenure_end is null or tenure_start is null or tenure_end >= tenure_start);
  end if;
end $$;

create index if not exists idx_community_memberships_community_role_active
  on public.community_memberships (community_id, membership_role, is_active);

create index if not exists idx_community_memberships_profile_active
  on public.community_memberships (profile_id, is_active);

-- Keep updated_at current.
drop trigger if exists update_community_memberships_updated_at on public.community_memberships;
create trigger update_community_memberships_updated_at
before update on public.community_memberships
for each row execute function public.update_updated_at_column();

-- Backfill from existing profile assignments.
insert into public.community_memberships (
  community_id,
  profile_id,
  membership_role,
  is_active,
  created_at,
  updated_at
)
select
  p.community_id,
  p.id,
  case
    when p.role = 'admin' then 'admin'
    when p.role = 'management' then 'committee'
    else 'member'
  end as membership_role,
  true,
  now(),
  now()
from public.profiles p
where p.community_id is not null
  and p.role in ('user', 'resident', 'admin', 'management')
on conflict (community_id, profile_id) do nothing;

-- Preserve prior community_admins assignments as admin memberships.
insert into public.community_memberships (
  community_id,
  profile_id,
  membership_role,
  is_active,
  created_at,
  updated_at
)
select
  ca.community_id,
  ca.user_id,
  'admin',
  true,
  coalesce(ca.created_at, now()),
  now()
from public.community_admins ca
on conflict (community_id, profile_id)
do update set
  membership_role = 'admin',
  is_active = true,
  updated_at = excluded.updated_at;

-- Keep legacy admin mapping synced for existing policies/flows.
insert into public.community_admins (community_id, user_id, created_at)
select
  cm.community_id,
  cm.profile_id,
  now()
from public.community_memberships cm
where cm.membership_role = 'admin'
  and cm.is_active = true
on conflict (community_id, user_id) do nothing;

-- Tighten legacy community_admins management policy for admin roles.
drop policy if exists "Only admins can manage society admins" on public.community_admins;
create policy "community_admins_manage_admin_roles"
  on public.community_admins
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.role in ('admin', 'superadmin', 'agency_manager', 'facility_manager')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.role in ('admin', 'superadmin', 'agency_manager', 'facility_manager')
    )
  );

-- RLS for new canonical table.
alter table public.community_memberships enable row level security;

drop policy if exists community_memberships_select_scoped on public.community_memberships;
create policy community_memberships_select_scoped
  on public.community_memberships
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.role in ('admin', 'superadmin', 'agency_manager', 'facility_manager')
    )
    or exists (
      select 1
      from public.profiles me
      where (me.id = auth.uid() or me.user_id = auth.uid())
        and me.community_id = community_memberships.community_id
    )
  );

drop policy if exists community_memberships_manage_admin_roles on public.community_memberships;
create policy community_memberships_manage_admin_roles
  on public.community_memberships
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.role in ('admin', 'superadmin', 'agency_manager', 'facility_manager')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.role in ('admin', 'superadmin', 'agency_manager', 'facility_manager')
    )
  );

drop policy if exists community_memberships_service_role_all on public.community_memberships;
create policy community_memberships_service_role_all
  on public.community_memberships
  for all
  to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

grant select on table public.community_memberships to authenticated;
grant all on table public.community_memberships to service_role;
