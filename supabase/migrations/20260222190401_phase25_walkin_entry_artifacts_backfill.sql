-- Phase 25 follow-up: backfill entry artifacts for legacy guard walk-in visitor passes.
-- Reversible via backup table: public.datafix_phase25_walkin_pass_artifacts_backup

do $$
begin
  if to_regclass('public.datafix_phase25_walkin_pass_artifacts_backup') is null then
    create table public.datafix_phase25_walkin_pass_artifacts_backup (
      backup_id bigserial primary key,
      visitor_pass_id uuid not null,
      entry_code text,
      qr_code_data text,
      cleanup_tag text not null,
      backed_up_at timestamptz not null default now(),
      row_data jsonb not null
    );
  end if;
end $$;

create unique index if not exists uq_datafix_phase25_walkin_pass_artifacts_backup_pass_tag
  on public.datafix_phase25_walkin_pass_artifacts_backup (visitor_pass_id, cleanup_tag);

create index if not exists idx_datafix_phase25_walkin_pass_artifacts_backup_tag
  on public.datafix_phase25_walkin_pass_artifacts_backup (cleanup_tag);

do $$
declare
  v_cleanup_tag constant text := 'phase25_walkin_entry_artifacts_backfill_20260222';
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_entry_code text;
  v_idx int;
  v_row record;
begin
  insert into public.datafix_phase25_walkin_pass_artifacts_backup (
    visitor_pass_id,
    entry_code,
    qr_code_data,
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
  where vp.entry_method = 'walk_in'
    and (vp.entry_code is null or vp.qr_code_data is null)
    and not exists (
      select 1
      from public.datafix_phase25_walkin_pass_artifacts_backup b
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
    where vp.entry_method = 'walk_in'
      and (vp.entry_code is null or vp.qr_code_data is null)
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
      qr_code_data = coalesce(
        v_row.qr_code_data,
        jsonb_build_object(
          'id', concat('VP-WALKIN-', replace(v_row.id::text, '-', '')),
          'visitor_name', coalesce(v_row.visitor_name, 'Visitor'),
          'visitor_phone', coalesce(v_row.visitor_phone, ''),
          'unit_id', v_row.unit_id,
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
        )::text
      ),
      updated_at = now()
    where vp.id = v_row.id;
  end loop;
end $$;
