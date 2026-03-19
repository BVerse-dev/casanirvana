-- Phase 20: Harden Services and Service Bookings access model

alter table public.services enable row level security;
alter table public.service_bookings enable row level security;

-- services: remove legacy broad-read policies
drop policy if exists "public_read_services" on public.services;
drop policy if exists "authenticated_read_services" on public.services;
drop policy if exists "Superadmins can access all services" on public.services;

-- Keep resident reads scoped to active services in accessible community
create policy p20_services_select_user_active_scoped
on public.services
for select
to authenticated
using (
  is_active = true
  and can_access_community(community_id)
);

-- Allow admins to read full service catalog (including inactive) in scoped communities
create policy p20_services_select_admin_scoped
on public.services
for select
to authenticated
using (
  is_admin_role()
  and can_access_community(community_id)
);

-- Allow admin writes only in scoped communities
create policy p20_services_write_admin_scoped
on public.services
for all
to authenticated
using (
  is_admin_role()
  and can_access_community(community_id)
)
with check (
  is_admin_role()
  and can_access_community(community_id)
);

-- Service role keeps full operational access
create policy p20_services_service_role_all
on public.services
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- service_bookings: remove legacy permissive policy
drop policy if exists "Enable insert for authenticated users only" on public.service_bookings;

-- Actor can read own bookings
create policy p20_service_bookings_select_actor
on public.service_bookings
for select
to authenticated
using (matches_current_actor(user_id));

-- Admin can read bookings for services in communities they can access
create policy p20_service_bookings_select_admin_scoped
on public.service_bookings
for select
to authenticated
using (
  is_admin_role()
  and exists (
    select 1
    from public.services s
    where s.id = service_bookings.service_id
      and can_access_community(s.community_id)
  )
);

-- Actor can insert own bookings (service scope enforced when provided)
create policy p20_service_bookings_insert_actor
on public.service_bookings
for insert
to authenticated
with check (
  matches_current_actor(user_id)
  and (
    service_id is null
    or exists (
      select 1
      from public.services s
      where s.id = service_bookings.service_id
        and can_access_community(s.community_id)
    )
  )
);

-- Actor can update own bookings
create policy p20_service_bookings_update_actor
on public.service_bookings
for update
to authenticated
using (matches_current_actor(user_id))
with check (matches_current_actor(user_id));

-- Admin can update scoped bookings
create policy p20_service_bookings_update_admin_scoped
on public.service_bookings
for update
to authenticated
using (
  is_admin_role()
  and exists (
    select 1
    from public.services s
    where s.id = service_bookings.service_id
      and can_access_community(s.community_id)
  )
)
with check (
  is_admin_role()
  and exists (
    select 1
    from public.services s
    where s.id = service_bookings.service_id
      and can_access_community(s.community_id)
  )
);

-- Actor can delete own bookings
create policy p20_service_bookings_delete_actor
on public.service_bookings
for delete
to authenticated
using (matches_current_actor(user_id));

-- Admin can delete scoped bookings
create policy p20_service_bookings_delete_admin_scoped
on public.service_bookings
for delete
to authenticated
using (
  is_admin_role()
  and exists (
    select 1
    from public.services s
    where s.id = service_bookings.service_id
      and can_access_community(s.community_id)
  )
);

-- Service role keeps full operational access for automation/integration
create policy p20_service_bookings_service_role_all
on public.service_bookings
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
