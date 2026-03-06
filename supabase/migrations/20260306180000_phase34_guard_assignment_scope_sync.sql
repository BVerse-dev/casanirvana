-- Phase 34: Sync guard assignment scope into canonical guard/user community fields.
-- Purpose: make admin-side community assignment the source of truth for Guard onboarding and RLS fallback.

begin;

create or replace function public.refresh_guard_assignment_scope(target_guard_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_community_id uuid;
  selected_assignment_name text;
  target_user_id uuid;
begin
  if target_guard_id is null then
    return;
  end if;

  select g.user_id
    into target_user_id
  from public.guards g
  where g.id = target_guard_id;

  if target_user_id is null then
    return;
  end if;

  select ga.community_id, ga.assignment_name
    into selected_community_id, selected_assignment_name
  from public.guard_assignments ga
  where ga.guard_id = target_guard_id
    and coalesce(ga.status, 'active') = 'active'
  order by ga.start_date desc nulls last,
           ga.updated_at desc nulls last,
           ga.created_at desc nulls last,
           ga.id desc
  limit 1;

  update public.guards
     set community_id = selected_community_id,
         community_assignment = selected_assignment_name,
         updated_at = now()
   where id = target_guard_id;

  update public.users
     set community_id = selected_community_id,
         updated_at = now()
   where id = target_user_id;
end;
$$;

create or replace function public.handle_guard_assignment_scope_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.guard_id is distinct from new.guard_id then
    perform public.refresh_guard_assignment_scope(old.guard_id);
  end if;

  perform public.refresh_guard_assignment_scope(coalesce(new.guard_id, old.guard_id));
  return null;
end;
$$;

drop trigger if exists trg_guard_assignment_scope_sync on public.guard_assignments;

create trigger trg_guard_assignment_scope_sync
after insert or update or delete on public.guard_assignments
for each row
execute function public.handle_guard_assignment_scope_sync();

create or replace function public.current_guard_community_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(
    g.community_id,
    (
      select ga.community_id
      from public.guard_assignments ga
      where ga.guard_id = g.id
        and coalesce(ga.status, 'active') = 'active'
      order by ga.start_date desc nulls last,
               ga.updated_at desc nulls last,
               ga.created_at desc nulls last,
               ga.id desc
      limit 1
    )
  )
  from public.guards g
  join public.users u on u.id = g.user_id
  where g.user_id = auth.uid()
    and u.role = 'guard'
    and coalesce(g.is_active, true)
    and coalesce(g.status, 'active') = 'active'
  order by g.updated_at desc nulls last, g.created_at desc nulls last, g.id
  limit 1;
$$;

grant execute on function public.current_guard_community_id() to authenticated, service_role;

do $$
declare
  assignment_row record;
begin
  for assignment_row in
    select distinct guard_id
    from public.guard_assignments
    where guard_id is not null
  loop
    perform public.refresh_guard_assignment_scope(assignment_row.guard_id);
  end loop;
end;
$$;

commit;
