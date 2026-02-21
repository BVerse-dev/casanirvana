-- Phase 16: Help Desk inquiries RLS hardening
-- Goal: replace legacy users-table admin checks with tenant-scoped profile/community access rules.

begin;

-- Drop legacy and ad-hoc policies for inquiries.
do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inquiries'
  loop
    execute format('drop policy if exists %I on public.inquiries', r.policyname);
  end loop;
end;
$$;

alter table public.inquiries enable row level security;

-- Superadmin can inspect all inquiries (including legacy rows with null community_id).
create policy p16_inquiries_select_superadmin
on public.inquiries
for select
to authenticated
using (public.is_superadmin_role());

-- Request owner visibility.
create policy p16_inquiries_select_actor
on public.inquiries
for select
to authenticated
using (public.matches_current_actor(user_id));

-- Assigned support/admin visibility.
create policy p16_inquiries_select_assignee
on public.inquiries
for select
to authenticated
using (public.matches_current_actor(assigned_to));

-- Tenant-scoped admin visibility.
create policy p16_inquiries_select_admin_scoped
on public.inquiries
for select
to authenticated
using (
  public.is_admin_role()
  and community_id is not null
  and public.can_access_community(community_id)
);

-- Residents can create only for themselves and within accessible community scope.
create policy p16_inquiries_insert_actor
on public.inquiries
for insert
to authenticated
with check (
  public.matches_current_actor(user_id)
  and community_id is not null
  and public.can_access_community(community_id)
);

-- Admins can create inquiries within their community scope.
create policy p16_inquiries_insert_admin_scoped
on public.inquiries
for insert
to authenticated
with check (
  public.is_admin_role()
  and community_id is not null
  and public.can_access_community(community_id)
);

-- Superadmin update fallback for global corrections.
create policy p16_inquiries_update_superadmin
on public.inquiries
for update
to authenticated
using (public.is_superadmin_role())
with check (public.is_superadmin_role());

-- Request owner updates (e.g., add more details before resolution).
create policy p16_inquiries_update_actor
on public.inquiries
for update
to authenticated
using (public.matches_current_actor(user_id))
with check (
  public.matches_current_actor(user_id)
  and (
    community_id is null
    or public.can_access_community(community_id)
  )
);

-- Assigned responder updates.
create policy p16_inquiries_update_assignee
on public.inquiries
for update
to authenticated
using (public.matches_current_actor(assigned_to))
with check (public.matches_current_actor(assigned_to));

-- Tenant-scoped admin updates.
create policy p16_inquiries_update_admin_scoped
on public.inquiries
for update
to authenticated
using (
  public.is_admin_role()
  and community_id is not null
  and public.can_access_community(community_id)
)
with check (
  public.is_admin_role()
  and community_id is not null
  and public.can_access_community(community_id)
);

-- Deletes restricted to superadmin only.
create policy p16_inquiries_delete_superadmin
on public.inquiries
for delete
to authenticated
using (public.is_superadmin_role());

commit;
