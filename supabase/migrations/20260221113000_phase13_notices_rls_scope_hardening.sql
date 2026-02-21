-- Phase 13: Notice board RLS scope hardening
-- Removes permissive read policies and enforces tenant-scoped access.

begin;

alter table public.notices enable row level security;

drop policy if exists "Admins can manage notices" on public.notices;
drop policy if exists "Notices are viewable by society members" on public.notices;
drop policy if exists "anon_read_notices" on public.notices;
drop policy if exists "authenticated_read_notices" on public.notices;
drop policy if exists "superadmin_all_notices" on public.notices;

drop policy if exists p13_notices_select_scoped on public.notices;
drop policy if exists p13_notices_insert_admin_scoped on public.notices;
drop policy if exists p13_notices_update_admin_scoped on public.notices;
drop policy if exists p13_notices_delete_admin_scoped on public.notices;

create policy p13_notices_select_scoped
on public.notices
for select
to authenticated
using (
  public.can_access_community(community_id)
);

create policy p13_notices_insert_admin_scoped
on public.notices
for insert
to authenticated
with check (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

create policy p13_notices_update_admin_scoped
on public.notices
for update
to authenticated
using (
  public.is_admin_role()
  and public.can_access_community(community_id)
)
with check (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

create policy p13_notices_delete_admin_scoped
on public.notices
for delete
to authenticated
using (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

commit;
