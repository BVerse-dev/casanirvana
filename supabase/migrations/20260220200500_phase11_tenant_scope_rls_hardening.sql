-- Phase 11: Tenant scope + RLS hardening for superadmin/user operational tables.
-- Goal: remove permissive legacy policies and enforce deterministic tenant-aware access.

begin;

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER + row_security off to avoid policy recursion)
-- ---------------------------------------------------------------------------

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select p.id
  from public.profiles p
  where p.id = auth.uid() or p.user_id = auth.uid()
  order by case when p.id = auth.uid() then 0 else 1 end
  limit 1;
$$;

create or replace function public.get_current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.current_profile_id();
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select p.role
  from public.profiles p
  where p.id = public.current_profile_id()
  limit 1;
$$;

create or replace function public.current_user_community_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select p.community_id
  from public.profiles p
  where p.id = public.current_profile_id()
  limit 1;
$$;

create or replace function public.is_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(
    public.current_user_role() = any (array['admin', 'superadmin', 'agency_manager', 'facility_manager']::text[]),
    false
  );
$$;

create or replace function public.is_superadmin_role()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(public.current_user_role() = 'superadmin', false);
$$;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.is_admin_role();
$$;

create or replace function public.matches_current_actor(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select target_id is not null
     and (target_id = auth.uid() or target_id = public.current_profile_id());
$$;

create or replace function public.can_access_community(target_community_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select
    case
      when target_community_id is null then false
      when public.is_superadmin_role() then true
      when public.current_user_community_id() = target_community_id then true
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
$$;

create or replace function public.can_access_unit(target_unit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.units u
    where u.id = target_unit_id
      and public.can_access_community(u.community_id)
  );
$$;

create or replace function public.is_unit_occupant(target_unit_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
      select 1
      from public.units u
      where u.id = target_unit_id
        and (
          u.owner_id = auth.uid()
          or u.tenant_id = auth.uid()
          or u.owner_id = public.current_profile_id()
          or u.tenant_id = public.current_profile_id()
        )
    )
    or exists (
      select 1
      from public.profiles p
      where p.id = public.current_profile_id()
        and p.unit_id = target_unit_id
    );
$$;

create or replace function public.actor_profile_in_accessible_community(target_actor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.profiles p
    where (p.id = target_actor_id or p.user_id = target_actor_id)
      and public.can_access_community(p.community_id)
  );
$$;

-- ---------------------------------------------------------------------------
-- Reset policies for target tables
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles',
        'notifications',
        'messages',
        'service_requests',
        'complaints',
        'maintenance_requests',
        'visitor_passes',
        'emergency_alerts',
        'module_settings',
        'community_module_overrides'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end;
$$;

alter table public.profiles enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.service_requests enable row level security;
alter table public.complaints enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.visitor_passes enable row level security;
alter table public.emergency_alerts enable row level security;
alter table public.module_settings enable row level security;
alter table public.community_module_overrides enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create policy p11_profiles_select_self_or_same_community
on public.profiles
for select
to authenticated
using (
  public.matches_current_actor(id)
  or public.matches_current_actor(user_id)
  or (
    public.current_user_community_id() is not null
    and community_id = public.current_user_community_id()
  )
);

create policy p11_profiles_select_admin_scoped
on public.profiles
for select
to authenticated
using (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

create policy p11_profiles_insert_self
on public.profiles
for insert
to authenticated
with check (
  public.matches_current_actor(id)
  or public.matches_current_actor(user_id)
);

create policy p11_profiles_update_self
on public.profiles
for update
to authenticated
using (
  public.matches_current_actor(id)
  or public.matches_current_actor(user_id)
)
with check (
  public.matches_current_actor(id)
  or public.matches_current_actor(user_id)
);

create policy p11_profiles_update_admin_scoped
on public.profiles
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

create policy p11_profiles_delete_superadmin
on public.profiles
for delete
to authenticated
using (public.is_superadmin_role());

create policy p11_profiles_service_role_all
on public.profiles
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- module settings
-- ---------------------------------------------------------------------------

create policy p11_module_settings_select_authenticated
on public.module_settings
for select
to authenticated
using (true);

create policy p11_module_settings_write_superadmin
on public.module_settings
for all
to authenticated
using (public.is_superadmin_role())
with check (public.is_superadmin_role());

create policy p11_module_settings_service_role_all
on public.module_settings
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy p11_community_module_overrides_select_scoped
on public.community_module_overrides
for select
to authenticated
using (public.can_access_community(community_id));

create policy p11_community_module_overrides_write_admin_scoped
on public.community_module_overrides
for all
to authenticated
using (
  public.is_admin_role()
  and public.can_access_community(community_id)
)
with check (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

create policy p11_community_module_overrides_service_role_all
on public.community_module_overrides
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

create policy p11_notifications_select_own
on public.notifications
for select
to authenticated
using (
  public.matches_current_actor(user_id)
);

create policy p11_notifications_select_admin_scoped
on public.notifications
for select
to authenticated
using (
  public.is_admin_role()
  and public.actor_profile_in_accessible_community(user_id)
);

create policy p11_notifications_update_own
on public.notifications
for update
to authenticated
using (public.matches_current_actor(user_id))
with check (public.matches_current_actor(user_id));

create policy p11_notifications_manage_admin_scoped
on public.notifications
for all
to authenticated
using (
  public.is_admin_role()
  and public.actor_profile_in_accessible_community(user_id)
)
with check (
  public.is_admin_role()
  and public.actor_profile_in_accessible_community(user_id)
);

create policy p11_notifications_service_role_insert
on public.notifications
for insert
to service_role
with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------

create policy p11_messages_select_actor
on public.messages
for select
to authenticated
using (
  public.matches_current_actor(from_user)
  or public.matches_current_actor(to_user)
  or message_type = 'system'
);

create policy p11_messages_select_admin_scoped
on public.messages
for select
to authenticated
using (
  public.is_admin_role()
  and (
    public.actor_profile_in_accessible_community(from_user)
    or public.actor_profile_in_accessible_community(to_user)
  )
);

create policy p11_messages_insert_actor
on public.messages
for insert
to authenticated
with check (
  (
    public.matches_current_actor(from_user)
    and to_user is not null
  )
  or (
    public.is_admin_role()
    and (
      public.actor_profile_in_accessible_community(from_user)
      or public.actor_profile_in_accessible_community(to_user)
    )
  )
);

create policy p11_messages_insert_service_role
on public.messages
for insert
to service_role
with check (auth.role() = 'service_role');

create policy p11_messages_update_actor
on public.messages
for update
to authenticated
using (
  public.matches_current_actor(from_user)
  or public.matches_current_actor(to_user)
)
with check (
  public.matches_current_actor(from_user)
  or public.matches_current_actor(to_user)
);

create policy p11_messages_update_admin_scoped
on public.messages
for update
to authenticated
using (
  public.is_admin_role()
  and (
    public.actor_profile_in_accessible_community(from_user)
    or public.actor_profile_in_accessible_community(to_user)
  )
)
with check (
  public.is_admin_role()
  and (
    public.actor_profile_in_accessible_community(from_user)
    or public.actor_profile_in_accessible_community(to_user)
  )
);

create policy p11_messages_delete_sender_or_admin
on public.messages
for delete
to authenticated
using (
  public.matches_current_actor(from_user)
  or (
    public.is_admin_role()
    and (
      public.actor_profile_in_accessible_community(from_user)
      or public.actor_profile_in_accessible_community(to_user)
    )
  )
);

-- ---------------------------------------------------------------------------
-- service requests
-- ---------------------------------------------------------------------------

create policy p11_service_requests_select_actor
on public.service_requests
for select
to authenticated
using (
  public.matches_current_actor(created_by)
  or public.matches_current_actor(user_id)
  or public.is_unit_occupant(unit_id)
);

create policy p11_service_requests_select_admin_scoped
on public.service_requests
for select
to authenticated
using (
  public.is_admin_role()
  and (
    public.can_access_community(community_id)
    or public.can_access_unit(unit_id)
  )
);

create policy p11_service_requests_insert_actor
on public.service_requests
for insert
to authenticated
with check (
  (
    public.matches_current_actor(created_by)
    or public.matches_current_actor(user_id)
  )
  and (
    (community_id is not null and community_id = public.current_user_community_id())
    or public.is_unit_occupant(unit_id)
  )
);

create policy p11_service_requests_insert_admin_scoped
on public.service_requests
for insert
to authenticated
with check (
  public.is_admin_role()
  and (
    public.can_access_community(community_id)
    or public.can_access_unit(unit_id)
  )
);

create policy p11_service_requests_update_actor
on public.service_requests
for update
to authenticated
using (
  public.matches_current_actor(created_by)
  or public.matches_current_actor(user_id)
)
with check (
  public.matches_current_actor(created_by)
  or public.matches_current_actor(user_id)
);

create policy p11_service_requests_update_admin_scoped
on public.service_requests
for update
to authenticated
using (
  public.is_admin_role()
  and (
    public.can_access_community(community_id)
    or public.can_access_unit(unit_id)
  )
)
with check (
  public.is_admin_role()
  and (
    public.can_access_community(community_id)
    or public.can_access_unit(unit_id)
  )
);

create policy p11_service_requests_delete_actor_or_admin
on public.service_requests
for delete
to authenticated
using (
  public.matches_current_actor(created_by)
  or public.matches_current_actor(user_id)
  or (
    public.is_admin_role()
    and (
      public.can_access_community(community_id)
      or public.can_access_unit(unit_id)
    )
  )
);

-- ---------------------------------------------------------------------------
-- complaints
-- ---------------------------------------------------------------------------

create policy p11_complaints_select_actor_or_unit_occupant
on public.complaints
for select
to authenticated
using (
  public.matches_current_actor(raised_by)
  or public.matches_current_actor(created_by)
  or public.matches_current_actor(created_by_profile_id)
  or public.is_unit_occupant(unit_id)
);

create policy p11_complaints_select_admin_scoped
on public.complaints
for select
to authenticated
using (
  public.is_admin_role()
  and public.can_access_unit(unit_id)
);

create policy p11_complaints_insert_actor_unit_scoped
on public.complaints
for insert
to authenticated
with check (
  (
    public.matches_current_actor(raised_by)
    or public.matches_current_actor(created_by)
    or public.matches_current_actor(created_by_profile_id)
  )
  and public.is_unit_occupant(unit_id)
);

create policy p11_complaints_insert_admin_unit_scoped
on public.complaints
for insert
to authenticated
with check (
  public.is_admin_role()
  and public.can_access_unit(unit_id)
);

create policy p11_complaints_update_actor
on public.complaints
for update
to authenticated
using (
  public.matches_current_actor(raised_by)
  or public.matches_current_actor(created_by)
  or public.matches_current_actor(created_by_profile_id)
)
with check (
  public.matches_current_actor(raised_by)
  or public.matches_current_actor(created_by)
  or public.matches_current_actor(created_by_profile_id)
);

create policy p11_complaints_update_admin_scoped
on public.complaints
for update
to authenticated
using (
  public.is_admin_role()
  and public.can_access_unit(unit_id)
)
with check (
  public.is_admin_role()
  and public.can_access_unit(unit_id)
);

create policy p11_complaints_delete_actor_or_superadmin
on public.complaints
for delete
to authenticated
using (
  public.matches_current_actor(raised_by)
  or public.matches_current_actor(created_by)
  or public.is_superadmin_role()
);

-- ---------------------------------------------------------------------------
-- maintenance requests
-- ---------------------------------------------------------------------------

create policy p11_maintenance_requests_select_actor_or_occupant
on public.maintenance_requests
for select
to authenticated
using (
  public.matches_current_actor(requested_by)
  or public.is_unit_occupant(unit_id)
);

create policy p11_maintenance_requests_select_admin_scoped
on public.maintenance_requests
for select
to authenticated
using (
  public.is_admin_role()
  and public.can_access_unit(unit_id)
);

create policy p11_maintenance_requests_insert_actor
on public.maintenance_requests
for insert
to authenticated
with check (
  public.matches_current_actor(requested_by)
  and public.is_unit_occupant(unit_id)
);

create policy p11_maintenance_requests_insert_admin_scoped
on public.maintenance_requests
for insert
to authenticated
with check (
  public.is_admin_role()
  and public.can_access_unit(unit_id)
);

create policy p11_maintenance_requests_update_actor
on public.maintenance_requests
for update
to authenticated
using (public.matches_current_actor(requested_by))
with check (public.matches_current_actor(requested_by));

create policy p11_maintenance_requests_update_admin_scoped
on public.maintenance_requests
for update
to authenticated
using (
  public.is_admin_role()
  and public.can_access_unit(unit_id)
)
with check (
  public.is_admin_role()
  and public.can_access_unit(unit_id)
);

create policy p11_maintenance_requests_delete_actor_or_superadmin
on public.maintenance_requests
for delete
to authenticated
using (
  public.matches_current_actor(requested_by)
  or public.is_superadmin_role()
);

-- ---------------------------------------------------------------------------
-- visitor passes
-- ---------------------------------------------------------------------------

create policy p11_visitor_passes_select_actor_or_occupant
on public.visitor_passes
for select
to authenticated
using (
  public.matches_current_actor(created_by)
  or public.is_unit_occupant(unit_id)
);

create policy p11_visitor_passes_select_staff_scoped
on public.visitor_passes
for select
to authenticated
using (
  public.is_admin_role()
  and (
    public.can_access_community(community_id)
    or public.can_access_unit(unit_id)
  )
);

create policy p11_visitor_passes_insert_actor
on public.visitor_passes
for insert
to authenticated
with check (
  public.matches_current_actor(created_by)
  and (
    public.is_unit_occupant(unit_id)
    or community_id = public.current_user_community_id()
  )
);

create policy p11_visitor_passes_insert_staff_scoped
on public.visitor_passes
for insert
to authenticated
with check (
  public.is_admin_role()
  and (
    public.can_access_community(community_id)
    or public.can_access_unit(unit_id)
  )
);

create policy p11_visitor_passes_update_actor
on public.visitor_passes
for update
to authenticated
using (public.matches_current_actor(created_by))
with check (public.matches_current_actor(created_by));

create policy p11_visitor_passes_update_staff_scoped
on public.visitor_passes
for update
to authenticated
using (
  public.is_admin_role()
  and (
    public.can_access_community(community_id)
    or public.can_access_unit(unit_id)
  )
)
with check (
  public.is_admin_role()
  and (
    public.can_access_community(community_id)
    or public.can_access_unit(unit_id)
  )
);

create policy p11_visitor_passes_delete_actor_or_superadmin
on public.visitor_passes
for delete
to authenticated
using (
  public.matches_current_actor(created_by)
  or public.is_superadmin_role()
);

-- ---------------------------------------------------------------------------
-- emergency alerts
-- ---------------------------------------------------------------------------

create policy p11_emergency_alerts_select_actor_or_same_community
on public.emergency_alerts
for select
to authenticated
using (
  public.matches_current_actor(user_id)
  or (
    public.current_user_community_id() is not null
    and community_id = public.current_user_community_id()
  )
);

create policy p11_emergency_alerts_select_admin_scoped
on public.emergency_alerts
for select
to authenticated
using (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

create policy p11_emergency_alerts_insert_actor
on public.emergency_alerts
for insert
to authenticated
with check (
  public.matches_current_actor(user_id)
  and community_id = public.current_user_community_id()
);

create policy p11_emergency_alerts_insert_admin_scoped
on public.emergency_alerts
for insert
to authenticated
with check (
  public.is_admin_role()
  and public.can_access_community(community_id)
);

create policy p11_emergency_alerts_update_actor
on public.emergency_alerts
for update
to authenticated
using (public.matches_current_actor(user_id))
with check (public.matches_current_actor(user_id));

create policy p11_emergency_alerts_update_admin_scoped
on public.emergency_alerts
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

create policy p11_emergency_alerts_delete_actor_or_superadmin
on public.emergency_alerts
for delete
to authenticated
using (
  public.matches_current_actor(user_id)
  or public.is_superadmin_role()
);

commit;
