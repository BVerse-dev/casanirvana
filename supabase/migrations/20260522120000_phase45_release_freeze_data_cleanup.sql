-- Phase 45: Release-freeze data cleanup.
-- Scope:
-- 1) Close historical visitor_pass artifact gaps for tenant-anchored, attributed rows.
-- 2) Enable scoped RLS on remaining empty Phase 5B internal tables.
--
-- Manual rollback for visitor artifacts:
--   update public.visitor_passes vp
--   set entry_code = b.old_entry_code,
--       qr_code_data = b.old_qr_code_data,
--       updated_at = now()
--   from public.datafix_phase45_visitor_artifact_backfill_backup b
--   where b.cleanup_tag = 'phase45_visitor_artifacts_backfill_20260522'
--     and vp.id = b.visitor_pass_id;
--
-- Manual rollback for RLS policies:
--   drop the p45_* policies created below. Do not disable RLS unless explicitly approved.

begin;

create table if not exists public.datafix_phase45_visitor_artifact_backfill_backup (
  backup_id bigserial primary key,
  visitor_pass_id uuid not null,
  old_entry_code text,
  old_qr_code_data text,
  cleanup_tag text not null,
  backed_up_at timestamptz not null default now(),
  row_data jsonb not null
);

create unique index if not exists uq_datafix_phase45_visitor_artifact_backfill_backup_pass_tag
  on public.datafix_phase45_visitor_artifact_backfill_backup (visitor_pass_id, cleanup_tag);

create index if not exists idx_datafix_phase45_visitor_artifact_backfill_backup_tag
  on public.datafix_phase45_visitor_artifact_backfill_backup (cleanup_tag);

do $$
declare
  v_cleanup_tag constant text := 'phase45_visitor_artifacts_backfill_20260522';
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_entry_code text;
  v_idx int;
  v_row record;
begin
  insert into public.datafix_phase45_visitor_artifact_backfill_backup (
    visitor_pass_id,
    old_entry_code,
    old_qr_code_data,
    cleanup_tag,
    row_data
  )
  select
    vp.id,
    vp.entry_code,
    vp.qr_code_data,
    v_cleanup_tag,
    to_jsonb(vp)
  from public.visitor_passes vp
  where (vp.entry_code is null or vp.qr_code_data is null)
    and vp.created_by is not null
    and (vp.unit_id is not null or vp.community_id is not null)
    and not exists (
      select 1
      from public.datafix_phase45_visitor_artifact_backfill_backup b
      where b.visitor_pass_id = vp.id
        and b.cleanup_tag = v_cleanup_tag
    );

  for v_row in
    select
      vp.id,
      vp.entry_code,
      vp.qr_code_data,
      vp.visitor_name,
      vp.visitor_phone,
      vp.unit_id,
      vp.community_id,
      vp.from_date,
      vp.to_date,
      vp.created_by,
      vp.created_at,
      vp.purpose,
      vp.visitor_type,
      vp.company_name,
      vp.service_type,
      vp.vehicle_type,
      vp.vehicle_number,
      vp.driver_name,
      vp.delivery_details
    from public.visitor_passes vp
    where (vp.entry_code is null or vp.qr_code_data is null)
      and vp.created_by is not null
      and (vp.unit_id is not null or vp.community_id is not null)
    order by vp.created_at nulls first, vp.id
  loop
    if v_row.entry_code is not null then
      v_entry_code := v_row.entry_code;
    else
      loop
        v_entry_code := '';
        for v_idx in 1..8 loop
          v_entry_code := v_entry_code
            || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
        end loop;

        exit when not exists (
          select 1
          from public.visitor_passes existing
          where existing.entry_code = v_entry_code
        );
      end loop;
    end if;

    update public.visitor_passes vp
    set
      entry_code = v_entry_code,
      qr_code_data = jsonb_build_object(
        'id', concat('VP-HIST-', replace(v_row.id::text, '-', '')),
        'visitor_name', coalesce(v_row.visitor_name, 'Visitor'),
        'visitor_phone', coalesce(v_row.visitor_phone, ''),
        'unit_id', v_row.unit_id,
        'community_id', v_row.community_id,
        'visit_date', case
          when v_row.from_date is null then null
          else (v_row.from_date at time zone 'utc')::date
        end,
        'from_date', v_row.from_date,
        'to_date', v_row.to_date,
        'created_by', v_row.created_by,
        'created_at', v_row.created_at,
        'purpose', coalesce(v_row.purpose, 'Guest visit'),
        'type', 'visitor_pass',
        'entry_code', v_entry_code,
        'visitor_type', coalesce(v_row.visitor_type, 'guest'),
        'company_name', v_row.company_name,
        'service_type', v_row.service_type,
        'vehicle_type', v_row.vehicle_type,
        'vehicle_number', v_row.vehicle_number,
        'driver_name', v_row.driver_name,
        'delivery_details', v_row.delivery_details
      )::text,
      updated_at = now()
    where vp.id = v_row.id;
  end loop;
end $$;

do $$
declare
  v_table text;
  v_policy_suffix text;
begin
  foreach v_table in array array[
    'app_extensions',
    'application_settings',
    'document_categories',
    'equipment_id_mapping',
    'equipment_maintenance',
    'groups',
    'translations'
  ] loop
    if to_regclass('public.' || v_table) is null then
      continue;
    end if;

    v_policy_suffix := replace(v_table, '-', '_');

    execute format('alter table public.%I enable row level security', v_table);

    execute format('drop policy if exists %I on public.%I', 'p45_admin_all_' || v_policy_suffix, v_table);
    execute format('drop policy if exists %I on public.%I', 'p45_service_role_all_' || v_policy_suffix, v_table);

    execute format($policy$
      create policy %I
      on public.%I
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and lower(coalesce(p.role, '')) in (
              'superadmin',
              'super_admin',
              'super admin',
              'admin',
              'administrator',
              'agency_manager',
              'agency_admin',
              'facility_manager',
              'facility_admin',
              'management'
            )
        )
      )
      with check (
        exists (
          select 1
          from public.profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and lower(coalesce(p.role, '')) in (
              'superadmin',
              'super_admin',
              'super admin',
              'admin',
              'administrator',
              'agency_manager',
              'agency_admin',
              'facility_manager',
              'facility_admin',
              'management'
            )
        )
      )
    $policy$, 'p45_admin_all_' || v_policy_suffix, v_table);

    execute format($policy$
      create policy %I
      on public.%I
      for all
      to service_role
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role')
    $policy$, 'p45_service_role_all_' || v_policy_suffix, v_table);
  end loop;
end $$;

commit;
