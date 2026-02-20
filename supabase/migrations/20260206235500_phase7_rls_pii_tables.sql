-- Phase 7: RLS remediation (PII tables)
-- Enables RLS and applies scoped policies for admin + owners/members.

-- Admin check expression (admin roles):
-- EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager')))

-- agency_configurations (admin roles only)
alter table public.agency_configurations enable row level security;
drop policy if exists "admin_all_agency_configurations" on public.agency_configurations;
create policy "admin_all_agency_configurations"
  on public.agency_configurations
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));

-- agency_documents (admin roles only)
alter table public.agency_documents enable row level security;
drop policy if exists "admin_all_agency_documents" on public.agency_documents;
create policy "admin_all_agency_documents"
  on public.agency_documents
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));

-- agency_services (admin roles only)
alter table public.agency_services enable row level security;
drop policy if exists "admin_all_agency_services" on public.agency_services;
create policy "admin_all_agency_services"
  on public.agency_services
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));

-- community_amenities (community member read, community admin manage)
alter table public.community_amenities enable row level security;
drop policy if exists "community_amenities_read" on public.community_amenities;
create policy "community_amenities_read"
  on public.community_amenities
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.community_id = community_amenities.community_id
    )
    OR EXISTS (
      SELECT 1 FROM community_admins ca
      WHERE ca.community_id = community_amenities.community_id
        AND ca.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))
    )
  );
drop policy if exists "community_amenities_manage" on public.community_amenities;
create policy "community_amenities_manage"
  on public.community_amenities
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM community_admins ca
      WHERE ca.community_id = community_amenities.community_id
        AND ca.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM community_admins ca
      WHERE ca.community_id = community_amenities.community_id
        AND ca.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))
    )
  );

-- email_notifications (admin roles only)
alter table public.email_notifications enable row level security;
drop policy if exists "admin_all_email_notifications" on public.email_notifications;
create policy "admin_all_email_notifications"
  on public.email_notifications
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));

-- group_messages (group members read/insert, sender update/delete; admin roles all)
alter table public.group_messages enable row level security;
drop policy if exists "admin_all_group_messages" on public.group_messages;
create policy "admin_all_group_messages"
  on public.group_messages
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));

drop policy if exists "group_messages_read" on public.group_messages;
create policy "group_messages_read"
  on public.group_messages
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_messages.group_id
        AND gm.user_id = auth.uid()
        AND gm.is_active = true
    )
  );

drop policy if exists "group_messages_insert" on public.group_messages;
create policy "group_messages_insert"
  on public.group_messages
  for insert to authenticated
  with check (
    group_messages.from_user = auth.uid()
    AND EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_messages.group_id
        AND gm.user_id = auth.uid()
        AND gm.is_active = true
    )
  );

drop policy if exists "group_messages_update" on public.group_messages;
create policy "group_messages_update"
  on public.group_messages
  for update to authenticated
  using (group_messages.from_user = auth.uid())
  with check (group_messages.from_user = auth.uid());

drop policy if exists "group_messages_delete" on public.group_messages;
create policy "group_messages_delete"
  on public.group_messages
  for delete to authenticated
  using (group_messages.from_user = auth.uid());

-- guard_certifications (guard own + admin roles)
alter table public.guard_certifications enable row level security;
drop policy if exists "admin_all_guard_certifications" on public.guard_certifications;
create policy "admin_all_guard_certifications"
  on public.guard_certifications
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));
drop policy if exists "guard_own_guard_certifications" on public.guard_certifications;
create policy "guard_own_guard_certifications"
  on public.guard_certifications
  for select to authenticated
  using (
    (guard_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM guards g
      WHERE g.id = guard_certifications.guard_id
        AND g.user_id = auth.uid()
    )
  );

-- guard_equipment (assigned guard + admin roles)
alter table public.guard_equipment enable row level security;
drop policy if exists "admin_all_guard_equipment" on public.guard_equipment;
create policy "admin_all_guard_equipment"
  on public.guard_equipment
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));
drop policy if exists "guard_assigned_guard_equipment" on public.guard_equipment;
create policy "guard_assigned_guard_equipment"
  on public.guard_equipment
  for select to authenticated
  using (
    (assigned_to = auth.uid())
    OR EXISTS (
      SELECT 1 FROM guards g
      WHERE g.id = guard_equipment.assigned_to
        AND g.user_id = auth.uid()
    )
  );

-- guard_id_mapping (admin roles only)
alter table public.guard_id_mapping enable row level security;
drop policy if exists "admin_all_guard_id_mapping" on public.guard_id_mapping;
create policy "admin_all_guard_id_mapping"
  on public.guard_id_mapping
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));

-- guard_performance (guard own + admin roles)
alter table public.guard_performance enable row level security;
drop policy if exists "admin_all_guard_performance" on public.guard_performance;
create policy "admin_all_guard_performance"
  on public.guard_performance
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));
drop policy if exists "guard_own_guard_performance" on public.guard_performance;
create policy "guard_own_guard_performance"
  on public.guard_performance
  for select to authenticated
  using (
    (guard_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM guards g
      WHERE g.id = guard_performance.guard_id
        AND g.user_id = auth.uid()
    )
  );

-- guard_schedules (guard own + admin roles)
alter table public.guard_schedules enable row level security;
drop policy if exists "admin_all_guard_schedules" on public.guard_schedules;
create policy "admin_all_guard_schedules"
  on public.guard_schedules
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));
drop policy if exists "guard_own_guard_schedules" on public.guard_schedules;
create policy "guard_own_guard_schedules"
  on public.guard_schedules
  for select to authenticated
  using (
    (guard_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM guards g
      WHERE g.id = guard_schedules.guard_id
        AND g.user_id = auth.uid()
    )
  );

-- guard_shifts (guard own + admin roles)
alter table public.guard_shifts enable row level security;
drop policy if exists "admin_all_guard_shifts" on public.guard_shifts;
create policy "admin_all_guard_shifts"
  on public.guard_shifts
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));
drop policy if exists "guard_own_guard_shifts" on public.guard_shifts;
create policy "guard_own_guard_shifts"
  on public.guard_shifts
  for select to authenticated
  using (
    (guard_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM guards g
      WHERE g.id = guard_shifts.guard_id
        AND g.user_id = auth.uid()
    )
  );

-- guard_training (guard own + admin roles)
alter table public.guard_training enable row level security;
drop policy if exists "admin_all_guard_training" on public.guard_training;
create policy "admin_all_guard_training"
  on public.guard_training
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));
drop policy if exists "guard_own_guard_training" on public.guard_training;
create policy "guard_own_guard_training"
  on public.guard_training
  for select to authenticated
  using (
    (guard_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM guards g
      WHERE g.id = guard_training.guard_id
        AND g.user_id = auth.uid()
    )
  );

-- guard_trainings (guard own + admin roles)
alter table public.guard_trainings enable row level security;
drop policy if exists "admin_all_guard_trainings" on public.guard_trainings;
create policy "admin_all_guard_trainings"
  on public.guard_trainings
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin','agency_manager','facility_manager'))));
drop policy if exists "guard_own_guard_trainings" on public.guard_trainings;
create policy "guard_own_guard_trainings"
  on public.guard_trainings
  for select to authenticated
  using (
    (guard_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM guards g
      WHERE g.id = guard_trainings.guard_id
        AND g.user_id = auth.uid()
    )
  );
