-- Phase 7: Policy smell cleanup (Profiles/Users domain)
-- Replaces permissive policies with scoped admin/user access.

-- Helper admin role check:
-- EXISTS (
--   SELECT 1 FROM profiles p
--   WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
--     AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
-- )

-- profiles: remove permissive policies
drop policy if exists "Authenticated users can view all profiles for messaging" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Enable insert for authenticated users only" on public.profiles;
drop policy if exists "Service role full access" on public.profiles;
drop policy if exists "Allow service role" on public.profiles;

-- profiles: admin full access
create policy "admin_all_profiles"
  on public.profiles
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- profiles: service role full access
create policy "service_role_all_profiles"
  on public.profiles
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- profiles: self read
create policy "users_read_own_profile"
  on public.profiles
  for select to authenticated
  using (
    (id = auth.uid())
    OR (user_id = auth.uid())
  );

-- profiles: same-community read (for messaging/lookup)
create policy "users_read_profiles_same_community"
  on public.profiles
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles me
      WHERE (me.id = auth.uid() OR me.user_id = auth.uid())
        AND me.community_id IS NOT NULL
        AND me.community_id = profiles.community_id
    )
  );

-- profiles: allow self insert
create policy "users_insert_own_profile"
  on public.profiles
  for insert to authenticated
  with check (
    (id = auth.uid())
    OR (user_id = auth.uid())
  );

-- users: remove permissive policies
drop policy if exists "Allow profile access for auth users" on public.users;
drop policy if exists "Allow viewing user roles for complaints" on public.users;
drop policy if exists "Service role can manage users" on public.users;
drop policy if exists "Admin can manage users" on public.users;

-- users: service role manage (explicit)
create policy "service_role_all_users"
  on public.users
  for all to service_role
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- users: supabase_admin manage (explicit)
create policy "supabase_admin_all_users"
  on public.users
  for all to supabase_admin
  using (auth.role() = 'supabase_admin')
  with check (auth.role() = 'supabase_admin');

-- users: admin read (for superadmin UI)
create policy "admin_read_users"
  on public.users
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- user_groups: remove permissive select
drop policy if exists "user_groups_select_policy" on public.user_groups;

-- user_groups: scoped select
create policy "user_groups_select_policy"
  on public.user_groups
  for select to authenticated
  using (
    leader_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- user_groups: tighten update policy with check
drop policy if exists "user_groups_update_policy" on public.user_groups;
create policy "user_groups_update_policy"
  on public.user_groups
  for update to authenticated
  using (
    ((auth.jwt() ->> 'role'::text) = ANY (ARRAY['admin'::text, 'superadmin'::text]))
    OR (leader_id = auth.uid())
  )
  with check (
    ((auth.jwt() ->> 'role'::text) = ANY (ARRAY['admin'::text, 'superadmin'::text]))
    OR (leader_id = auth.uid())
  );

-- user_roles: restrict read to admin roles
drop policy if exists "user_roles_read_policy" on public.user_roles;
create policy "user_roles_read_policy"
  on public.user_roles
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- role_permissions: restrict read to admin roles
drop policy if exists "Allow authenticated users to read role permissions" on public.role_permissions;
create policy "admin_read_role_permissions"
  on public.role_permissions
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- permissions: restrict read to admin roles
drop policy if exists "Allow authenticated users to read permissions" on public.permissions;
create policy "admin_read_permissions"
  on public.permissions
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- preference_categories: remove permissive read policy
drop policy if exists "preference_categories_read_policy" on public.preference_categories;

-- preference_categories: tighten superadmin policy
drop policy if exists "preference_categories_superadmin_policy" on public.preference_categories;
create policy "preference_categories_superadmin_policy"
  on public.preference_categories
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  );

-- preference_settings: remove permissive read policy
drop policy if exists "preference_settings_read_policy" on public.preference_settings;
drop policy if exists "user_read_preference_settings" on public.preference_settings;

-- preference_settings: tighten superadmin policy
drop policy if exists "preference_settings_superadmin_policy" on public.preference_settings;
create policy "preference_settings_superadmin_policy"
  on public.preference_settings
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  );

-- preference_settings: user-read only editable settings
create policy "user_read_preference_settings"
  on public.preference_settings
  for select to authenticated
  using (is_user_editable = true);

-- user_preference_values: tighten superadmin policy
drop policy if exists "user_preference_values_superadmin_policy" on public.user_preference_values;
create policy "user_preference_values_superadmin_policy"
  on public.user_preference_values
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  );
