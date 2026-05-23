-- Phase 25: allow guards to read profile rows for their assigned community

drop policy if exists p25_profiles_select_guard_scoped on public.profiles;

create policy p25_profiles_select_guard_scoped
on public.profiles
for select
to authenticated
using (
  public.is_guard_role()
  and public.guard_can_access_community(community_id)
);
