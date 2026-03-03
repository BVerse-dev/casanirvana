-- Phase 34: Guard/Agency operational RLS scope hardening
-- Align operational tables with admin tenant scope helpers used by backend APIs.

begin;

create or replace function public.can_access_agency(target_agency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select
    case
      when target_agency_id is null then false
      when public.is_admin_role() is not true then false
      when public.is_superadmin_role() then true
      when exists (
        select 1
        from public.communities c
        where c.agency_id = target_agency_id
          and public.can_access_community(c.id)
      ) then true
      when exists (
        select 1
        from public.profiles p
        join public.agency_staff s
          on s.email = p.email
        where p.id = public.current_profile_id()
          and s.is_active = true
          and s.agency_id = target_agency_id
      ) then true
      else false
    end;
$$;

grant execute on function public.can_access_agency(uuid) to authenticated, service_role;

-- guard_schedules (community scoped)
alter table if exists public.guard_schedules enable row level security;
drop policy if exists "admin_all_guard_schedules" on public.guard_schedules;
drop policy if exists "guard_schedules_admin_scoped_select" on public.guard_schedules;
drop policy if exists "guard_schedules_admin_scoped_insert" on public.guard_schedules;
drop policy if exists "guard_schedules_admin_scoped_update" on public.guard_schedules;
drop policy if exists "guard_schedules_admin_scoped_delete" on public.guard_schedules;
create policy "guard_schedules_admin_scoped_select"
  on public.guard_schedules
  for select
  to authenticated
  using (
    public.is_admin_role()
    and public.can_access_community(community_id)
  );
create policy "guard_schedules_admin_scoped_insert"
  on public.guard_schedules
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and public.can_access_community(community_id)
  );
create policy "guard_schedules_admin_scoped_update"
  on public.guard_schedules
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
create policy "guard_schedules_admin_scoped_delete"
  on public.guard_schedules
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and public.can_access_community(community_id)
  );

-- guard_assignments (community scoped)
alter table if exists public.guard_assignments enable row level security;
drop policy if exists "guard_assignments_admin_scoped_select" on public.guard_assignments;
drop policy if exists "guard_assignments_admin_scoped_insert" on public.guard_assignments;
drop policy if exists "guard_assignments_admin_scoped_update" on public.guard_assignments;
drop policy if exists "guard_assignments_admin_scoped_delete" on public.guard_assignments;
create policy "guard_assignments_admin_scoped_select"
  on public.guard_assignments
  for select
  to authenticated
  using (
    public.is_admin_role()
    and public.can_access_community(community_id)
  );
create policy "guard_assignments_admin_scoped_insert"
  on public.guard_assignments
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and public.can_access_community(community_id)
  );
create policy "guard_assignments_admin_scoped_update"
  on public.guard_assignments
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
create policy "guard_assignments_admin_scoped_delete"
  on public.guard_assignments
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and public.can_access_community(community_id)
  );

-- guard_equipment (derived through assigned guard -> community)
alter table if exists public.guard_equipment enable row level security;
drop policy if exists "admin_all_guard_equipment" on public.guard_equipment;
drop policy if exists "guard_equipment_admin_scoped_select" on public.guard_equipment;
drop policy if exists "guard_equipment_admin_scoped_insert" on public.guard_equipment;
drop policy if exists "guard_equipment_admin_scoped_update" on public.guard_equipment;
drop policy if exists "guard_equipment_admin_scoped_delete" on public.guard_equipment;
create policy "guard_equipment_admin_scoped_select"
  on public.guard_equipment
  for select
  to authenticated
  using (
    public.is_admin_role()
    and (
      (assigned_to is null and public.is_superadmin_role())
      or exists (
        select 1
        from public.guards g
        where g.id = guard_equipment.assigned_to
          and public.can_access_community(g.community_id)
      )
    )
  );
create policy "guard_equipment_admin_scoped_insert"
  on public.guard_equipment
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and (
      (assigned_to is null and public.is_superadmin_role())
      or exists (
        select 1
        from public.guards g
        where g.id = guard_equipment.assigned_to
          and public.can_access_community(g.community_id)
      )
    )
  );
create policy "guard_equipment_admin_scoped_update"
  on public.guard_equipment
  for update
  to authenticated
  using (
    public.is_admin_role()
    and (
      (assigned_to is null and public.is_superadmin_role())
      or exists (
        select 1
        from public.guards g
        where g.id = guard_equipment.assigned_to
          and public.can_access_community(g.community_id)
      )
    )
  )
  with check (
    public.is_admin_role()
    and (
      (assigned_to is null and public.is_superadmin_role())
      or exists (
        select 1
        from public.guards g
        where g.id = guard_equipment.assigned_to
          and public.can_access_community(g.community_id)
      )
    )
  );
create policy "guard_equipment_admin_scoped_delete"
  on public.guard_equipment
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and (
      (assigned_to is null and public.is_superadmin_role())
      or exists (
        select 1
        from public.guards g
        where g.id = guard_equipment.assigned_to
          and public.can_access_community(g.community_id)
      )
    )
  );

-- guard_performance (derived through guard -> community)
alter table if exists public.guard_performance enable row level security;
drop policy if exists "admin_all_guard_performance" on public.guard_performance;
drop policy if exists "guard_performance_admin_scoped_select" on public.guard_performance;
drop policy if exists "guard_performance_admin_scoped_insert" on public.guard_performance;
drop policy if exists "guard_performance_admin_scoped_update" on public.guard_performance;
create policy "guard_performance_admin_scoped_select"
  on public.guard_performance
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance.guard_id
        and public.can_access_community(g.community_id)
    )
  );
create policy "guard_performance_admin_scoped_insert"
  on public.guard_performance
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance.guard_id
        and public.can_access_community(g.community_id)
    )
  );
create policy "guard_performance_admin_scoped_update"
  on public.guard_performance
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance.guard_id
        and public.can_access_community(g.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance.guard_id
        and public.can_access_community(g.community_id)
    )
  );

-- guard_training (derived through guard -> community)
alter table if exists public.guard_training enable row level security;
drop policy if exists "admin_all_guard_training" on public.guard_training;
drop policy if exists "guard_training_admin_scoped_select" on public.guard_training;
drop policy if exists "guard_training_admin_scoped_insert" on public.guard_training;
drop policy if exists "guard_training_admin_scoped_update" on public.guard_training;
create policy "guard_training_admin_scoped_select"
  on public.guard_training
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_training.guard_id
        and public.can_access_community(g.community_id)
    )
  );
create policy "guard_training_admin_scoped_insert"
  on public.guard_training
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_training.guard_id
        and public.can_access_community(g.community_id)
    )
  );
create policy "guard_training_admin_scoped_update"
  on public.guard_training
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_training.guard_id
        and public.can_access_community(g.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_training.guard_id
        and public.can_access_community(g.community_id)
    )
  );

-- Agency operational tables (agency scoped)
alter table if exists public.agency_staff enable row level security;
drop policy if exists "agency_staff_admin_scoped_select" on public.agency_staff;
drop policy if exists "agency_staff_admin_scoped_insert" on public.agency_staff;
drop policy if exists "agency_staff_admin_scoped_update" on public.agency_staff;
drop policy if exists "agency_staff_admin_scoped_delete" on public.agency_staff;
create policy "agency_staff_admin_scoped_select"
  on public.agency_staff
  for select
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_staff_admin_scoped_insert"
  on public.agency_staff
  for insert
  to authenticated
  with check (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_staff_admin_scoped_update"
  on public.agency_staff
  for update
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id))
  with check (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_staff_admin_scoped_delete"
  on public.agency_staff
  for delete
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id));

alter table if exists public.agency_services enable row level security;
drop policy if exists "admin_all_agency_services" on public.agency_services;
drop policy if exists "agency_services_admin_scoped_select" on public.agency_services;
drop policy if exists "agency_services_admin_scoped_insert" on public.agency_services;
drop policy if exists "agency_services_admin_scoped_update" on public.agency_services;
drop policy if exists "agency_services_admin_scoped_delete" on public.agency_services;
create policy "agency_services_admin_scoped_select"
  on public.agency_services
  for select
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_services_admin_scoped_insert"
  on public.agency_services
  for insert
  to authenticated
  with check (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_services_admin_scoped_update"
  on public.agency_services
  for update
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id))
  with check (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_services_admin_scoped_delete"
  on public.agency_services
  for delete
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id));

alter table if exists public.agency_documents enable row level security;
drop policy if exists "admin_all_agency_documents" on public.agency_documents;
drop policy if exists "agency_documents_admin_scoped_select" on public.agency_documents;
drop policy if exists "agency_documents_admin_scoped_insert" on public.agency_documents;
drop policy if exists "agency_documents_admin_scoped_update" on public.agency_documents;
drop policy if exists "agency_documents_admin_scoped_delete" on public.agency_documents;
create policy "agency_documents_admin_scoped_select"
  on public.agency_documents
  for select
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_documents_admin_scoped_insert"
  on public.agency_documents
  for insert
  to authenticated
  with check (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_documents_admin_scoped_update"
  on public.agency_documents
  for update
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id))
  with check (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_documents_admin_scoped_delete"
  on public.agency_documents
  for delete
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id));

alter table if exists public.agency_transactions enable row level security;
drop policy if exists "agency_transactions_admin_scoped_select" on public.agency_transactions;
drop policy if exists "agency_transactions_admin_scoped_insert" on public.agency_transactions;
drop policy if exists "agency_transactions_admin_scoped_update" on public.agency_transactions;
create policy "agency_transactions_admin_scoped_select"
  on public.agency_transactions
  for select
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_transactions_admin_scoped_insert"
  on public.agency_transactions
  for insert
  to authenticated
  with check (public.is_admin_role() and public.can_access_agency(agency_id));
create policy "agency_transactions_admin_scoped_update"
  on public.agency_transactions
  for update
  to authenticated
  using (public.is_admin_role() and public.can_access_agency(agency_id))
  with check (public.is_admin_role() and public.can_access_agency(agency_id));

commit;

