-- Phase 25 follow-up: harden guard notification recipient scope to support profile-derived community attribution.

begin;

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
           ),
           (
             select p.community_id
             from public.profiles p
             where p.user_id = target.id
               and p.community_id is not null
             order by p.updated_at desc nulls last, p.created_at desc nulls last, p.id
             limit 1
           )
         ) = public.current_guard_community_id()
     );
$$;

grant execute on function public.guard_can_notify_user(uuid) to authenticated, service_role;

commit;
