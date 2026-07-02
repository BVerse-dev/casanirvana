-- Phase 49: Scope broad directory/catalog RLS before launch freeze.
--
-- Background:
-- - Launch RLS smoke found authenticated users could read all communities, units, and guards.
-- - Those broad reads exposed sensitive columns on units/guards.
-- - This migration removes the explicit `USING true` read paths and replaces them with
--   helper-based tenant scope while preserving existing admin-management policies.

begin;

create or replace function public.current_user_community_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $function$
  with actor_profile as (
    select p.id, p.community_id
    from public.profiles p
    where p.id = public.current_profile_id()
    limit 1
  )
  select coalesce(
    (select ap.community_id from actor_profile ap where ap.community_id is not null),
    (
      select cm.community_id
      from public.community_memberships cm
      join actor_profile ap on ap.id = cm.profile_id
      where coalesce(cm.is_active, true)
      order by cm.updated_at desc nulls last, cm.created_at desc nulls last, cm.id
      limit 1
    )
  );
$function$;

create or replace function public.can_access_community(target_community_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $function$
  select
    case
      when target_community_id is null then false
      when public.is_superadmin_role() then true
      when public.current_user_community_id() = target_community_id then true
      when public.current_guard_community_id() = target_community_id then true
      when exists (
        select 1
        from public.community_memberships cm
        where cm.community_id = target_community_id
          and cm.profile_id = public.current_profile_id()
          and coalesce(cm.is_active, true)
      ) then true
      when exists (
        select 1
        from public.community_admins ca
        where ca.community_id = target_community_id
          and ca.user_id = public.current_profile_id()
      ) then true
      when exists (
        select 1
        from public.communities c
        where c.id = target_community_id
          and c.admins @> array[public.current_profile_id()]
      ) then true
      else false
    end;
$function$;

-- Communities: remove explicit authenticated read-all policies.
drop policy if exists "Societies are viewable by everyone" on public.communities;
drop policy if exists authenticated_read_societies on public.communities;
drop policy if exists p49_communities_select_scoped on public.communities;
create policy p49_communities_select_scoped
on public.communities
for select
to authenticated
using (public.can_access_community(id));

-- Units: remove explicit authenticated read-all and insert-all policies.
drop policy if exists "Allow read access for all authenticated users" on public.units;
drop policy if exists "Units are viewable by everyone" on public.units;
drop policy if exists authenticated_read_units on public.units;
drop policy if exists "Allow insert for all authenticated users" on public.units;
drop policy if exists p49_units_select_scoped on public.units;
create policy p49_units_select_scoped
on public.units
for select
to authenticated
using (
  public.can_access_community(community_id)
  or owner_id = public.current_profile_id()
  or tenant_id = public.current_profile_id()
);

drop policy if exists p49_units_insert_scoped on public.units;
create policy p49_units_insert_scoped
on public.units
for insert
to authenticated
with check (
  public.is_superadmin_role()
  or public.can_access_community(community_id)
);

-- Guards: remove explicit authenticated read-all and insert-all policies.
drop policy if exists "Guards are viewable by society members" on public.guards;
drop policy if exists "Allow guard profile creation during registration" on public.guards;
drop policy if exists p49_guards_select_scoped on public.guards;
create policy p49_guards_select_scoped
on public.guards
for select
to authenticated
using (
  user_id = auth.uid()
  or public.can_access_community(community_id)
);

drop policy if exists p49_guards_insert_self on public.guards;
create policy p49_guards_insert_self
on public.guards
for insert
to authenticated
with check (user_id = auth.uid());

commit;
