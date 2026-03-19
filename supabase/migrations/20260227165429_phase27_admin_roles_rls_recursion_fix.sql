begin;

-- Remove legacy app_settings policies that rely on recursive admin_roles lookup.
drop policy if exists "Allow service role or superadmin to select" on public.app_settings;
drop policy if exists "Allow service role or superadmin to insert" on public.app_settings;
drop policy if exists "Allow service role or superadmin to update" on public.app_settings;
drop policy if exists "Allow service role or superadmin to delete" on public.app_settings;

-- Replace recursive admin_roles policies with function-based checks.
drop policy if exists "Allow service role or superadmin to select" on public.admin_roles;
drop policy if exists "Allow service role or superadmin to insert" on public.admin_roles;
drop policy if exists "Allow service role or superadmin to update" on public.admin_roles;
drop policy if exists "Allow service role or superadmin to delete" on public.admin_roles;

create policy p27_admin_roles_select_admin
on public.admin_roles
for select
to authenticated
using (public.is_admin_role());

create policy p27_admin_roles_manage_superadmin
on public.admin_roles
for all
to authenticated
using (public.is_superadmin_role())
with check (public.is_superadmin_role());

create policy p27_admin_roles_service_role_all
on public.admin_roles
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

commit;
