-- Phase 17: Complaints comments hardening for production tenant scope.
-- Replaces legacy global-read policy with complaint-scoped access rules.

alter table public.complaint_comments enable row level security;

drop policy if exists "Users can read all complaint comments" on public.complaint_comments;
drop policy if exists "Users can insert their own comments" on public.complaint_comments;
drop policy if exists "Users can update their own comments" on public.complaint_comments;
drop policy if exists "Users can delete their own comments" on public.complaint_comments;

drop policy if exists p17_complaint_comments_select_scoped on public.complaint_comments;
drop policy if exists p17_complaint_comments_insert_scoped on public.complaint_comments;
drop policy if exists p17_complaint_comments_update_own_or_admin on public.complaint_comments;
drop policy if exists p17_complaint_comments_delete_own_or_admin on public.complaint_comments;

create policy p17_complaint_comments_select_scoped
on public.complaint_comments
for select
to authenticated
using (
  exists (
    select 1
    from public.complaints c
    where c.id = complaint_comments.complaint_id
      and (
        matches_current_actor(c.raised_by)
        or matches_current_actor(c.created_by)
        or matches_current_actor(c.created_by_profile_id)
        or is_unit_occupant(c.unit_id)
        or is_admin_role()
      )
  )
);

create policy p17_complaint_comments_insert_scoped
on public.complaint_comments
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.complaints c
    where c.id = complaint_comments.complaint_id
      and (
        matches_current_actor(c.raised_by)
        or matches_current_actor(c.created_by)
        or matches_current_actor(c.created_by_profile_id)
        or is_unit_occupant(c.unit_id)
        or is_admin_role()
      )
  )
);

create policy p17_complaint_comments_update_own_or_admin
on public.complaint_comments
for update
to authenticated
using (
  (
    created_by = auth.uid()
    and exists (
      select 1
      from public.complaints c
      where c.id = complaint_comments.complaint_id
        and (
          matches_current_actor(c.raised_by)
          or matches_current_actor(c.created_by)
          or matches_current_actor(c.created_by_profile_id)
          or is_unit_occupant(c.unit_id)
          or is_admin_role()
        )
    )
  )
  or is_admin_role()
)
with check (
  (
    created_by = auth.uid()
    and exists (
      select 1
      from public.complaints c
      where c.id = complaint_comments.complaint_id
        and (
          matches_current_actor(c.raised_by)
          or matches_current_actor(c.created_by)
          or matches_current_actor(c.created_by_profile_id)
          or is_unit_occupant(c.unit_id)
          or is_admin_role()
        )
    )
  )
  or is_admin_role()
);

create policy p17_complaint_comments_delete_own_or_admin
on public.complaint_comments
for delete
to authenticated
using (
  (
    created_by = auth.uid()
    and exists (
      select 1
      from public.complaints c
      where c.id = complaint_comments.complaint_id
        and (
          matches_current_actor(c.raised_by)
          or matches_current_actor(c.created_by)
          or matches_current_actor(c.created_by_profile_id)
          or is_unit_occupant(c.unit_id)
          or is_admin_role()
        )
    )
  )
  or is_admin_role()
);

create or replace function public.get_complaint_comments_with_profiles(complaint_uuid uuid)
returns table (
  id uuid,
  complaint_id uuid,
  comment text,
  created_by uuid,
  created_at timestamptz,
  created_by_profile jsonb
)
language sql
stable
security invoker
as $$
  select
    cc.id,
    cc.complaint_id,
    cc.comment,
    cc.created_by,
    cc.created_at,
    jsonb_build_object(
      'id', p.id,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'avatar_url', p.avatar_url,
      'email', p.email,
      'role', p.role,
      'unit_id', p.unit_id,
      'units', jsonb_build_object(
        'id', u.id,
        'block', u.block,
        'number', u.number,
        'unit_number', u.unit_number
      )
    ) as created_by_profile
  from public.complaint_comments cc
  left join lateral (
    select p.*
    from public.profiles p
    where p.user_id = cc.created_by
       or p.id = cc.created_by
    order by case when p.user_id = cc.created_by then 0 else 1 end
    limit 1
  ) p on true
  left join public.units u on p.unit_id = u.id
  where cc.complaint_id = complaint_uuid
  order by cc.created_at asc;
$$;

grant execute on function public.get_complaint_comments_with_profiles(uuid) to anon;
grant execute on function public.get_complaint_comments_with_profiles(uuid) to authenticated;
grant execute on function public.get_complaint_comments_with_profiles(uuid) to service_role;
