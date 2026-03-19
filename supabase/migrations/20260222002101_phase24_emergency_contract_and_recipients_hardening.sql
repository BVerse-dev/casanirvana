-- Phase 24: Emergency contract normalization + recipient tracking hardening
-- 1) Normalize legacy emergency type aliases to canonical values.
-- 2) Repair emergency_alert_recipients.alert_id contract to uuid -> emergency_alerts(id).
-- 3) Add recipient insert/read policies for actor + scoped admin access.

begin;

-- Normalize user-app legacy alert aliases to superadmin canonical taxonomy.
update public.emergency_alerts
set alert_type = 'fire'
where alert_type = 'fire_alert';

update public.emergency_alerts
set alert_type = 'maintenance'
where alert_type = 'stuck_lift';

update public.emergency_alerts
set alert_type = 'security'
where alert_type in ('animal_threat', 'visitor_threat');

-- Keep a reversible backup of pre-migration recipient rows.
do $$
begin
  if to_regclass('public.datafix_phase24_emergency_recipients_backup') is null then
    create table public.datafix_phase24_emergency_recipients_backup as
    table public.emergency_alert_recipients;
  end if;
end $$;

-- Convert alert_id to uuid to match emergency_alerts.id.
do $$
declare
  alert_id_data_type text;
begin
  select c.data_type
  into alert_id_data_type
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'emergency_alert_recipients'
    and c.column_name = 'alert_id';

  if alert_id_data_type is null then
    alter table public.emergency_alert_recipients
      add column alert_id uuid;
  elsif alert_id_data_type <> 'uuid' then
    alter table public.emergency_alert_recipients
      drop column alert_id;

    alter table public.emergency_alert_recipients
      add column alert_id uuid;
  end if;
end $$;

-- Remove unusable rows before enforcing non-null/fk contract.
delete from public.emergency_alert_recipients
where alert_id is null;

alter table public.emergency_alert_recipients
  alter column alert_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'emergency_alert_recipients_alert_id_fkey'
      and conrelid = 'public.emergency_alert_recipients'::regclass
  ) then
    alter table public.emergency_alert_recipients
      add constraint emergency_alert_recipients_alert_id_fkey
      foreign key (alert_id)
      references public.emergency_alerts(id)
      on delete cascade;
  end if;
end $$;

create index if not exists idx_emergency_alert_recipients_alert_id
  on public.emergency_alert_recipients(alert_id);

create index if not exists idx_emergency_alert_recipients_recipient_user_id
  on public.emergency_alert_recipients(recipient_user_id);

create unique index if not exists idx_emergency_alert_recipients_alert_recipient_unique
  on public.emergency_alert_recipients(alert_id, recipient_user_id);

-- Rebuild policies for predictable recipient tracking behavior.
drop policy if exists "Users can see alerts sent to them" on public.emergency_alert_recipients;
drop policy if exists p24_emergency_alert_recipients_select_recipient on public.emergency_alert_recipients;
drop policy if exists p24_emergency_alert_recipients_select_scoped_admin_or_actor on public.emergency_alert_recipients;
drop policy if exists p24_emergency_alert_recipients_insert_actor on public.emergency_alert_recipients;
drop policy if exists p24_emergency_alert_recipients_insert_admin_scoped on public.emergency_alert_recipients;

create policy p24_emergency_alert_recipients_select_recipient
  on public.emergency_alert_recipients
  for select
  to authenticated
  using (recipient_user_id = auth.uid());

create policy p24_emergency_alert_recipients_select_scoped_admin_or_actor
  on public.emergency_alert_recipients
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.emergency_alerts ea
      where ea.id = emergency_alert_recipients.alert_id
        and (
          matches_current_actor(ea.user_id)
          or (is_admin_role() and can_access_community(ea.community_id))
        )
    )
  );

create policy p24_emergency_alert_recipients_insert_actor
  on public.emergency_alert_recipients
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.emergency_alerts ea
      where ea.id = emergency_alert_recipients.alert_id
        and matches_current_actor(ea.user_id)
    )
  );

create policy p24_emergency_alert_recipients_insert_admin_scoped
  on public.emergency_alert_recipients
  for insert
  to authenticated
  with check (
    is_admin_role()
    and exists (
      select 1
      from public.emergency_alerts ea
      where ea.id = emergency_alert_recipients.alert_id
        and can_access_community(ea.community_id)
    )
  );

grant select, insert on public.emergency_alert_recipients to authenticated;

commit;
