-- Phase 25: Guard visitor-entry RLS alignment
-- Purpose: allow authenticated guards to resolve, update, and notify visitor entries scoped to their assigned community.

set check_function_bodies = off;

create or replace function public.is_guard_role()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.users u
    join public.guards g on g.user_id = u.id
    where u.id = auth.uid()
      and u.role = 'guard'
      and coalesce(g.is_active, true)
      and coalesce(g.status, 'active') = 'active'
  );
$$;

create or replace function public.current_guard_community_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select g.community_id
  from public.guards g
  join public.users u on u.id = g.user_id
  where g.user_id = auth.uid()
    and u.role = 'guard'
    and coalesce(g.is_active, true)
    and coalesce(g.status, 'active') = 'active'
  order by g.updated_at desc nulls last, g.created_at desc nulls last, g.id
  limit 1;
$$;

create or replace function public.guard_can_access_community(target_community_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select target_community_id is not null
     and public.current_guard_community_id() is not null
     and public.current_guard_community_id() = target_community_id;
$$;

create or replace function public.guard_can_access_unit(target_unit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select target_unit_id is not null
     and exists (
       select 1
       from public.units u
       where u.id = target_unit_id
         and u.community_id = public.current_guard_community_id()
     );
$$;

create or replace function public.guard_can_notify_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select target_user_id is not null
     and public.current_guard_community_id() is not null
     and exists (
       select 1
       from public.users target
       where target.id = target_user_id
         and coalesce(
           target.community_id,
           (
             select u.community_id
             from public.units u
             where u.id = target.unit_id
             limit 1
           )
         ) = public.current_guard_community_id()
     );
$$;

grant execute on function public.is_guard_role() to authenticated, service_role;
grant execute on function public.current_guard_community_id() to authenticated, service_role;
grant execute on function public.guard_can_access_community(uuid) to authenticated, service_role;
grant execute on function public.guard_can_access_unit(uuid) to authenticated, service_role;
grant execute on function public.guard_can_notify_user(uuid) to authenticated, service_role;

drop policy if exists p25_visitor_passes_select_guard_scoped on public.visitor_passes;
create policy p25_visitor_passes_select_guard_scoped
on public.visitor_passes
for select
to authenticated
using (
  public.is_guard_role()
  and (
    public.guard_can_access_community(community_id)
    or public.guard_can_access_unit(unit_id)
  )
);

drop policy if exists p25_visitor_passes_insert_guard_scoped on public.visitor_passes;
create policy p25_visitor_passes_insert_guard_scoped
on public.visitor_passes
for insert
to authenticated
with check (
  public.is_guard_role()
  and public.matches_current_actor(created_by)
  and public.guard_can_access_community(community_id)
  and exists (
    select 1
    from public.units u
    where u.id = unit_id
      and u.community_id = community_id
  )
);

drop policy if exists p25_visitor_passes_update_guard_scoped on public.visitor_passes;
create policy p25_visitor_passes_update_guard_scoped
on public.visitor_passes
for update
to authenticated
using (
  public.is_guard_role()
  and (
    public.guard_can_access_community(community_id)
    or public.guard_can_access_unit(unit_id)
  )
)
with check (
  public.is_guard_role()
  and (
    public.guard_can_access_community(community_id)
    or public.guard_can_access_unit(unit_id)
  )
);

drop policy if exists p25_notifications_insert_guard_scoped on public.notifications;
create policy p25_notifications_insert_guard_scoped
on public.notifications
for insert
to authenticated
with check (
  public.is_guard_role()
  and public.guard_can_notify_user(user_id)
);
