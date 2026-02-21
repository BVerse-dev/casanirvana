-- Phase 22 follow-up:
-- Allow tenant-scoped admin read access for resident profile directory tables
-- used by superadmin resident details page (family members, daily help, vehicles, frequent entries).

begin;

drop policy if exists family_members_select_admin_scoped on public.family_members;
create policy family_members_select_admin_scoped
on public.family_members
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where (p.user_id = family_members.user_id or p.id = family_members.user_id)
      and p.community_id is not null
      and public.can_access_community(p.community_id)
  )
);

drop policy if exists daily_help_select_admin_scoped on public.daily_help;
create policy daily_help_select_admin_scoped
on public.daily_help
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where (p.user_id = daily_help.user_id or p.id = daily_help.user_id)
      and p.community_id is not null
      and public.can_access_community(p.community_id)
  )
);

drop policy if exists vehicles_select_admin_scoped on public.vehicles;
create policy vehicles_select_admin_scoped
on public.vehicles
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where (p.user_id = vehicles.user_id or p.id = vehicles.user_id)
      and p.community_id is not null
      and public.can_access_community(p.community_id)
  )
);

drop policy if exists frequent_entries_select_admin_scoped on public.frequent_entries;
create policy frequent_entries_select_admin_scoped
on public.frequent_entries
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where (p.user_id = frequent_entries.user_id or p.id = frequent_entries.user_id)
      and p.community_id is not null
      and public.can_access_community(p.community_id)
  )
);

commit;

