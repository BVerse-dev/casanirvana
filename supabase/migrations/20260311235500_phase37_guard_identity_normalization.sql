-- Phase 37: normalize guard identity to public.guards(id) and prevent duplicate guard rows.

begin;

create table if not exists public.datafix_phase37_guard_duplicates_backup (
  like public.guards including defaults
);

alter table public.datafix_phase37_guard_duplicates_backup
  add column if not exists backup_tag text,
  add column if not exists backup_reason text,
  add column if not exists canonical_guard_id uuid,
  add column if not exists backed_up_at timestamptz default now();

create table if not exists public.datafix_phase37_guard_assignment_orphans_backup (
  like public.guard_assignments including defaults
);

alter table public.datafix_phase37_guard_assignment_orphans_backup
  add column if not exists backup_tag text,
  add column if not exists backup_reason text,
  add column if not exists backed_up_at timestamptz default now();

create table if not exists public.datafix_phase37_guard_schedule_orphans_backup (
  like public.guard_schedules including defaults
);

alter table public.datafix_phase37_guard_schedule_orphans_backup
  add column if not exists backup_tag text,
  add column if not exists backup_reason text,
  add column if not exists backed_up_at timestamptz default now();

create table if not exists public.datafix_phase37_guard_certification_orphans_backup (
  like public.guard_certifications including defaults
);

alter table public.datafix_phase37_guard_certification_orphans_backup
  add column if not exists backup_tag text,
  add column if not exists backup_reason text,
  add column if not exists backed_up_at timestamptz default now();

create table if not exists public.datafix_phase37_guard_performance_metric_orphans_backup (
  like public.guard_performance_metrics including defaults
);

alter table public.datafix_phase37_guard_performance_metric_orphans_backup
  add column if not exists backup_tag text,
  add column if not exists backup_reason text,
  add column if not exists backed_up_at timestamptz default now();

create table if not exists public.datafix_phase37_guard_performance_metric_duplicates_backup (
  like public.guard_performance_metrics including defaults
);

alter table public.datafix_phase37_guard_performance_metric_duplicates_backup
  add column if not exists backup_tag text,
  add column if not exists backup_reason text,
  add column if not exists canonical_guard_id uuid,
  add column if not exists backed_up_at timestamptz default now();

create table if not exists public.datafix_phase37_guard_performance_review_orphans_backup (
  like public.guard_performance_reviews including defaults
);

alter table public.datafix_phase37_guard_performance_review_orphans_backup
  add column if not exists backup_tag text,
  add column if not exists backup_reason text,
  add column if not exists backed_up_at timestamptz default now();

create table if not exists public.datafix_phase37_guard_training_enrollment_orphans_backup (
  like public.guard_trainings including defaults
);

alter table public.datafix_phase37_guard_training_enrollment_orphans_backup
  add column if not exists backup_tag text,
  add column if not exists backup_reason text,
  add column if not exists backed_up_at timestamptz default now();

create table if not exists public.datafix_phase37_guard_reference_audit (
  source_table text not null,
  source_row_id uuid not null,
  source_column text not null,
  original_guard_ref uuid not null,
  backup_tag text not null,
  backup_reason text not null,
  backed_up_at timestamptz not null default now(),
  primary key (source_table, source_row_id, source_column, original_guard_ref)
);

drop table if exists tmp_phase37_guard_canonical_map;
create temp table tmp_phase37_guard_canonical_map on commit drop as
select user_id, id as canonical_guard_id
from (
  select
    g.user_id,
    g.id,
    row_number() over (
      partition by g.user_id
      order by
        case when g.id = g.user_id then 0 else 1 end,
        g.created_at asc nulls last,
        g.id asc
    ) as row_rank
  from public.guards g
  where g.user_id is not null
) ranked
where row_rank = 1;

drop table if exists tmp_phase37_guard_duplicate_map;
create temp table tmp_phase37_guard_duplicate_map on commit drop as
select
  g.user_id,
  cm.canonical_guard_id,
  g.id as duplicate_guard_id
from public.guards g
join tmp_phase37_guard_canonical_map cm
  on cm.user_id = g.user_id
where g.id <> cm.canonical_guard_id;

drop table if exists tmp_phase37_guard_merged_values;
create temp table tmp_phase37_guard_merged_values on commit drop as
select
  cm.canonical_guard_id,
  (array_agg(g.full_name order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.full_name, '') is not null))[1] as full_name,
  (array_agg(g.employee_id order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.employee_id, '') is not null))[1] as employee_id,
  (array_agg(g.first_name order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.first_name, '') is not null))[1] as first_name,
  (array_agg(g.last_name order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.last_name, '') is not null))[1] as last_name,
  (array_agg(g.display_name order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.display_name, '') is not null))[1] as display_name,
  (array_agg(g.email order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.email, '') is not null))[1] as email,
  (array_agg(g.phone order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.phone, '') is not null))[1] as phone,
  (array_agg(g.mobile order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.mobile, '') is not null))[1] as mobile,
  (array_agg(g.community_id order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.community_id is not null))[1] as community_id,
  (array_agg(g.unit_id order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.unit_id is not null))[1] as unit_id,
  (array_agg(g.shift_type order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.shift_type, '') is not null))[1] as shift_type,
  (array_agg(g.shift_start_time order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.shift_start_time is not null))[1] as shift_start_time,
  (array_agg(g.shift_end_time order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.shift_end_time is not null))[1] as shift_end_time,
  (array_agg(g.gate_assignment order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.gate_assignment, '') is not null))[1] as gate_assignment,
  (array_agg(g.emergency_contact_name order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.emergency_contact_name, '') is not null))[1] as emergency_contact_name,
  (array_agg(g.emergency_contact_phone order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.emergency_contact_phone, '') is not null))[1] as emergency_contact_phone,
  (array_agg(g.emergency_contact order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.emergency_contact, '') is not null))[1] as emergency_contact,
  (array_agg(g.status order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.status, '') is not null))[1] as status,
  (array_agg(g.role order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.role, '') is not null))[1] as role,
  (array_agg(g.address order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.address, '') is not null))[1] as address,
  (array_agg(g.date_of_birth order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.date_of_birth is not null))[1] as date_of_birth,
  (array_agg(g.employment_date order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.employment_date is not null))[1] as employment_date,
  (array_agg(g.license_number order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.license_number, '') is not null))[1] as license_number,
  (array_agg(g.salary order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.salary is not null))[1] as salary,
  (array_agg(g.avatar_url order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.avatar_url, '') is not null))[1] as avatar_url,
  (array_agg(g.blood_group order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.blood_group, '') is not null))[1] as blood_group,
  (array_agg(g.medical_conditions order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.medical_conditions, '') is not null))[1] as medical_conditions,
  (array_agg(g.certifications order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.certifications is not null))[1] as certifications,
  (array_agg(g.skills order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.skills is not null))[1] as skills,
  (array_agg(g.experience order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.experience is not null))[1] as experience,
  (array_agg(g.experience_years order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.experience_years is not null))[1] as experience_years,
  (array_agg(g.rating order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.rating is not null))[1] as rating,
  (array_agg(g.total_shifts order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.total_shifts is not null))[1] as total_shifts,
  (array_agg(g.completed_shifts order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.completed_shifts is not null))[1] as completed_shifts,
  (array_agg(g.community_assignment order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where nullif(g.community_assignment, '') is not null))[1] as community_assignment,
  (array_agg(g.last_login order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.last_login is not null))[1] as last_login,
  (array_agg(g.is_active order by case when g.id = cm.canonical_guard_id then 0 else 1 end, g.created_at asc nulls last, g.id asc)
    filter (where g.is_active is not null))[1] as is_active,
  max(g.updated_at) as max_updated_at
from public.guards g
join tmp_phase37_guard_canonical_map cm
  on cm.user_id = g.user_id
group by cm.canonical_guard_id;

update public.guards canonical
set
  full_name = coalesce(nullif(canonical.full_name, ''), merged.full_name),
  employee_id = coalesce(nullif(canonical.employee_id, ''), merged.employee_id),
  first_name = coalesce(nullif(canonical.first_name, ''), merged.first_name),
  last_name = coalesce(nullif(canonical.last_name, ''), merged.last_name),
  display_name = coalesce(nullif(canonical.display_name, ''), merged.display_name),
  email = coalesce(nullif(canonical.email, ''), merged.email),
  phone = coalesce(nullif(canonical.phone, ''), merged.phone),
  mobile = coalesce(nullif(canonical.mobile, ''), merged.mobile),
  community_id = coalesce(canonical.community_id, merged.community_id),
  unit_id = coalesce(canonical.unit_id, merged.unit_id),
  shift_type = coalesce(nullif(canonical.shift_type, ''), merged.shift_type),
  shift_start_time = coalesce(canonical.shift_start_time, merged.shift_start_time),
  shift_end_time = coalesce(canonical.shift_end_time, merged.shift_end_time),
  gate_assignment = coalesce(nullif(canonical.gate_assignment, ''), merged.gate_assignment),
  emergency_contact_name = coalesce(nullif(canonical.emergency_contact_name, ''), merged.emergency_contact_name),
  emergency_contact_phone = coalesce(nullif(canonical.emergency_contact_phone, ''), merged.emergency_contact_phone),
  emergency_contact = coalesce(nullif(canonical.emergency_contact, ''), merged.emergency_contact),
  status = coalesce(nullif(canonical.status, ''), merged.status),
  role = coalesce(nullif(canonical.role, ''), merged.role),
  address = coalesce(nullif(canonical.address, ''), merged.address),
  date_of_birth = coalesce(canonical.date_of_birth, merged.date_of_birth),
  employment_date = coalesce(canonical.employment_date, merged.employment_date),
  license_number = coalesce(nullif(canonical.license_number, ''), merged.license_number),
  salary = coalesce(canonical.salary, merged.salary),
  avatar_url = coalesce(nullif(canonical.avatar_url, ''), merged.avatar_url),
  blood_group = coalesce(nullif(canonical.blood_group, ''), merged.blood_group),
  medical_conditions = coalesce(nullif(canonical.medical_conditions, ''), merged.medical_conditions),
  certifications = coalesce(canonical.certifications, merged.certifications),
  skills = coalesce(canonical.skills, merged.skills),
  experience = coalesce(canonical.experience, merged.experience),
  experience_years = coalesce(canonical.experience_years, merged.experience_years),
  rating = coalesce(canonical.rating, merged.rating),
  total_shifts = coalesce(canonical.total_shifts, merged.total_shifts),
  completed_shifts = coalesce(canonical.completed_shifts, merged.completed_shifts),
  community_assignment = coalesce(nullif(canonical.community_assignment, ''), merged.community_assignment),
  last_login = coalesce(canonical.last_login, merged.last_login),
  is_active = coalesce(canonical.is_active, merged.is_active),
  updated_at = greatest(
    coalesce(canonical.updated_at, '-infinity'::timestamptz),
    coalesce(merged.max_updated_at, canonical.updated_at)
  )
from tmp_phase37_guard_merged_values merged
where canonical.id = merged.canonical_guard_id;

drop table if exists tmp_phase37_guard_identity_resolution;
create temp table tmp_phase37_guard_identity_resolution on commit drop as
select distinct source_id, canonical_guard_id
from (
  select
    g.id as source_id,
    cm.canonical_guard_id
  from public.guards g
  join tmp_phase37_guard_canonical_map cm
    on cm.user_id = g.user_id
  where g.user_id is not null

  union all

  select
    cm.user_id as source_id,
    cm.canonical_guard_id
  from tmp_phase37_guard_canonical_map cm

  union all

  select
    p.id as source_id,
    cm.canonical_guard_id
  from public.profiles p
  join tmp_phase37_guard_canonical_map cm
    on p.user_id = cm.user_id
) resolved
where source_id is not null;

create index tmp_phase37_guard_identity_resolution_source_idx
  on tmp_phase37_guard_identity_resolution (source_id);

update public.equipment_assignments ea
set guard_id = duplicate_map.canonical_guard_id
from tmp_phase37_guard_duplicate_map duplicate_map
where ea.guard_id = duplicate_map.duplicate_guard_id;

update public.guard_equipment ge
set assigned_to = duplicate_map.canonical_guard_id
from tmp_phase37_guard_duplicate_map duplicate_map
where ge.assigned_to = duplicate_map.duplicate_guard_id;

update public.guard_id_mapping gim
set uuid_id = duplicate_map.canonical_guard_id
from tmp_phase37_guard_duplicate_map duplicate_map
where gim.uuid_id = duplicate_map.duplicate_guard_id;

update public.guard_performance gp
set guard_id = duplicate_map.canonical_guard_id
from tmp_phase37_guard_duplicate_map duplicate_map
where gp.guard_id = duplicate_map.duplicate_guard_id;

update public.guard_shifts gs
set guard_id = duplicate_map.canonical_guard_id
from tmp_phase37_guard_duplicate_map duplicate_map
where gs.guard_id = duplicate_map.duplicate_guard_id;

update public.guard_training gt
set guard_id = duplicate_map.canonical_guard_id
from tmp_phase37_guard_duplicate_map duplicate_map
where gt.guard_id = duplicate_map.duplicate_guard_id;

alter table public.guard_assignments
  drop constraint if exists guard_assignments_backup_guard_id_fkey,
  drop constraint if exists guard_assignments_guard_id_fkey,
  drop constraint if exists guard_assignments_supervisor_id_fkey;

alter table public.guard_schedules
  drop constraint if exists guard_schedules_guard_id_fkey,
  drop constraint if exists guard_schedules_replacement_id_fkey;

alter table public.guard_certifications
  drop constraint if exists guard_certifications_guard_id_fkey;

alter table public.guard_performance_metrics
  drop constraint if exists guard_performance_metrics_guard_id_fkey,
  drop constraint if exists guard_performance_metrics_guard_id_key;

alter table public.guard_performance_reviews
  drop constraint if exists guard_performance_reviews_guard_id_fkey;

alter table public.guard_trainings
  drop constraint if exists guard_trainings_guard_id_fkey;

update public.guard_assignments ga
set guard_id = resolution.canonical_guard_id
from tmp_phase37_guard_identity_resolution resolution
where ga.guard_id = resolution.source_id
  and ga.guard_id is distinct from resolution.canonical_guard_id;

update public.guard_assignments ga
set backup_guard_id = resolution.canonical_guard_id
from tmp_phase37_guard_identity_resolution resolution
where ga.backup_guard_id = resolution.source_id
  and ga.backup_guard_id is distinct from resolution.canonical_guard_id;

update public.guard_assignments ga
set supervisor_id = resolution.canonical_guard_id
from tmp_phase37_guard_identity_resolution resolution
where ga.supervisor_id = resolution.source_id
  and ga.supervisor_id is distinct from resolution.canonical_guard_id;

update public.guard_schedules gs
set guard_id = resolution.canonical_guard_id
from tmp_phase37_guard_identity_resolution resolution
where gs.guard_id = resolution.source_id
  and gs.guard_id is distinct from resolution.canonical_guard_id;

update public.guard_schedules gs
set replacement_id = resolution.canonical_guard_id
from tmp_phase37_guard_identity_resolution resolution
where gs.replacement_id = resolution.source_id
  and gs.replacement_id is distinct from resolution.canonical_guard_id;

update public.guard_certifications gc
set guard_id = resolution.canonical_guard_id
from tmp_phase37_guard_identity_resolution resolution
where gc.guard_id = resolution.source_id
  and gc.guard_id is distinct from resolution.canonical_guard_id;

update public.guard_performance_metrics gpm
set guard_id = resolution.canonical_guard_id
from tmp_phase37_guard_identity_resolution resolution
where gpm.guard_id = resolution.source_id
  and gpm.guard_id is distinct from resolution.canonical_guard_id;

update public.guard_performance_reviews gpr
set guard_id = resolution.canonical_guard_id
from tmp_phase37_guard_identity_resolution resolution
where gpr.guard_id = resolution.source_id
  and gpr.guard_id is distinct from resolution.canonical_guard_id;

update public.guard_trainings gt
set guard_id = resolution.canonical_guard_id
from tmp_phase37_guard_identity_resolution resolution
where gt.guard_id = resolution.source_id
  and gt.guard_id is distinct from resolution.canonical_guard_id;

insert into public.datafix_phase37_guard_reference_audit (
  source_table,
  source_row_id,
  source_column,
  original_guard_ref,
  backup_tag,
  backup_reason
)
select
  'guard_assignments',
  ga.id,
  'backup_guard_id',
  ga.backup_guard_id,
  'phase37_guard_identity_normalization_20260311',
  'unresolved_secondary_guard_reference'
from public.guard_assignments ga
where ga.backup_guard_id is not null
  and not exists (
    select 1
    from public.guards g
    where g.id = ga.backup_guard_id
  )
on conflict do nothing;

update public.guard_assignments
set backup_guard_id = null
where backup_guard_id is not null
  and not exists (
    select 1
    from public.guards g
    where g.id = backup_guard_id
  );

insert into public.datafix_phase37_guard_reference_audit (
  source_table,
  source_row_id,
  source_column,
  original_guard_ref,
  backup_tag,
  backup_reason
)
select
  'guard_assignments',
  ga.id,
  'supervisor_id',
  ga.supervisor_id,
  'phase37_guard_identity_normalization_20260311',
  'unresolved_secondary_guard_reference'
from public.guard_assignments ga
where ga.supervisor_id is not null
  and not exists (
    select 1
    from public.guards g
    where g.id = ga.supervisor_id
  )
on conflict do nothing;

update public.guard_assignments
set supervisor_id = null
where supervisor_id is not null
  and not exists (
    select 1
    from public.guards g
    where g.id = supervisor_id
  );

insert into public.datafix_phase37_guard_reference_audit (
  source_table,
  source_row_id,
  source_column,
  original_guard_ref,
  backup_tag,
  backup_reason
)
select
  'guard_schedules',
  gs.id,
  'replacement_id',
  gs.replacement_id,
  'phase37_guard_identity_normalization_20260311',
  'unresolved_secondary_guard_reference'
from public.guard_schedules gs
where gs.replacement_id is not null
  and not exists (
    select 1
    from public.guards g
    where g.id = gs.replacement_id
  )
on conflict do nothing;

update public.guard_schedules
set replacement_id = null
where replacement_id is not null
  and not exists (
    select 1
    from public.guards g
    where g.id = replacement_id
  );

insert into public.datafix_phase37_guard_assignment_orphans_backup
select
  ga.*,
  'phase37_guard_identity_normalization_20260311' as backup_tag,
  'unresolved_guard_reference_after_identity_normalization' as backup_reason,
  now() as backed_up_at
from public.guard_assignments ga
where not exists (
  select 1
  from public.guards g
  where g.id = ga.guard_id
);

delete from public.guard_assignments ga
where not exists (
  select 1
  from public.guards g
  where g.id = ga.guard_id
);

insert into public.datafix_phase37_guard_schedule_orphans_backup
select
  gs.*,
  'phase37_guard_identity_normalization_20260311' as backup_tag,
  'unresolved_guard_reference_after_identity_normalization' as backup_reason,
  now() as backed_up_at
from public.guard_schedules gs
where not exists (
  select 1
  from public.guards g
  where g.id = gs.guard_id
);

delete from public.guard_schedules gs
where not exists (
  select 1
  from public.guards g
  where g.id = gs.guard_id
);

insert into public.datafix_phase37_guard_certification_orphans_backup
select
  gc.*,
  'phase37_guard_identity_normalization_20260311' as backup_tag,
  'unresolved_guard_reference_after_identity_normalization' as backup_reason,
  now() as backed_up_at
from public.guard_certifications gc
where not exists (
  select 1
  from public.guards g
  where g.id = gc.guard_id
);

delete from public.guard_certifications gc
where not exists (
  select 1
  from public.guards g
  where g.id = gc.guard_id
);

insert into public.datafix_phase37_guard_performance_metric_orphans_backup
select
  gpm.*,
  'phase37_guard_identity_normalization_20260311' as backup_tag,
  'unresolved_guard_reference_after_identity_normalization' as backup_reason,
  now() as backed_up_at
from public.guard_performance_metrics gpm
where not exists (
  select 1
  from public.guards g
  where g.id = gpm.guard_id
);

delete from public.guard_performance_metrics gpm
where not exists (
  select 1
  from public.guards g
  where g.id = gpm.guard_id
);

drop table if exists tmp_phase37_guard_metric_duplicate_rank;
create temp table tmp_phase37_guard_metric_duplicate_rank on commit drop as
select
  gpm.id,
  gpm.guard_id,
  row_number() over (
    partition by gpm.guard_id
    order by gpm.updated_at desc nulls last, gpm.created_at desc nulls last, gpm.id desc
  ) as row_rank
from public.guard_performance_metrics gpm;

insert into public.datafix_phase37_guard_performance_metric_duplicates_backup
select
  gpm.*,
  'phase37_guard_identity_normalization_20260311' as backup_tag,
  'duplicate_guard_performance_metric_after_identity_normalization' as backup_reason,
  gpm.guard_id as canonical_guard_id,
  now() as backed_up_at
from public.guard_performance_metrics gpm
join tmp_phase37_guard_metric_duplicate_rank ranked
  on ranked.id = gpm.id
where ranked.row_rank > 1;

delete from public.guard_performance_metrics gpm
using tmp_phase37_guard_metric_duplicate_rank ranked
where gpm.id = ranked.id
  and ranked.row_rank > 1;

insert into public.datafix_phase37_guard_performance_review_orphans_backup
select
  gpr.*,
  'phase37_guard_identity_normalization_20260311' as backup_tag,
  'unresolved_guard_reference_after_identity_normalization' as backup_reason,
  now() as backed_up_at
from public.guard_performance_reviews gpr
where not exists (
  select 1
  from public.guards g
  where g.id = gpr.guard_id
);

delete from public.guard_performance_reviews gpr
where not exists (
  select 1
  from public.guards g
  where g.id = gpr.guard_id
);

insert into public.datafix_phase37_guard_training_enrollment_orphans_backup
select
  gt.*,
  'phase37_guard_identity_normalization_20260311' as backup_tag,
  'unresolved_guard_reference_after_identity_normalization' as backup_reason,
  now() as backed_up_at
from public.guard_trainings gt
where not exists (
  select 1
  from public.guards g
  where g.id = gt.guard_id
);

delete from public.guard_trainings gt
where not exists (
  select 1
  from public.guards g
  where g.id = gt.guard_id
);

insert into public.datafix_phase37_guard_duplicates_backup
select
  g.*,
  'phase37_guard_identity_normalization_20260311' as backup_tag,
  'duplicate_guard_row_for_same_user' as backup_reason,
  duplicate_map.canonical_guard_id,
  now() as backed_up_at
from public.guards g
join tmp_phase37_guard_duplicate_map duplicate_map
  on duplicate_map.duplicate_guard_id = g.id;

delete from public.guards g
using tmp_phase37_guard_duplicate_map duplicate_map
where g.id = duplicate_map.duplicate_guard_id;

create unique index if not exists guards_user_id_unique_idx
  on public.guards using btree (user_id)
  where user_id is not null;

alter table public.guard_assignments
  add constraint guard_assignments_backup_guard_id_fkey foreign key (backup_guard_id) references public.guards(id),
  add constraint guard_assignments_guard_id_fkey foreign key (guard_id) references public.guards(id) on delete cascade,
  add constraint guard_assignments_supervisor_id_fkey foreign key (supervisor_id) references public.guards(id);

alter table public.guard_schedules
  add constraint guard_schedules_guard_id_fkey foreign key (guard_id) references public.guards(id) on delete cascade,
  add constraint guard_schedules_replacement_id_fkey foreign key (replacement_id) references public.guards(id) on delete set null;

alter table public.guard_certifications
  add constraint guard_certifications_guard_id_fkey foreign key (guard_id) references public.guards(id) on delete cascade;

alter table public.guard_performance_metrics
  add constraint guard_performance_metrics_guard_id_key unique (guard_id),
  add constraint guard_performance_metrics_guard_id_fkey foreign key (guard_id) references public.guards(id) on delete cascade;

alter table public.guard_performance_reviews
  add constraint guard_performance_reviews_guard_id_fkey foreign key (guard_id) references public.guards(id) on delete cascade;

alter table public.guard_trainings
  add constraint guard_trainings_guard_id_fkey foreign key (guard_id) references public.guards(id) on delete cascade;

create or replace function public.update_guard_training_names()
returns trigger
language plpgsql
as $$
declare
  target_user_id uuid := coalesce(new.user_id, new.id);
  target_guard_name text := trim(concat_ws(' ', new.first_name, new.last_name));
begin
  update public.guard_trainings gt
  set guard_name = target_guard_name
  where exists (
    select 1
    from public.guards g
    where g.id = gt.guard_id
      and g.user_id = target_user_id
  );

  update public.guard_certifications gc
  set guard_name = target_guard_name
  where exists (
    select 1
    from public.guards g
    where g.id = gc.guard_id
      and g.user_id = target_user_id
  );

  return new;
end;
$$;

create or replace view public.guard_performance_detailed as
select
  gpm.id,
  gpm.guard_id,
  gpm.overall_rating,
  gpm.punctuality_rating,
  gpm.professionalism_rating,
  gpm.reliability_rating,
  gpm.communication_rating,
  gpm.attendance_percentage,
  gpm.total_shifts,
  gpm.completed_shifts,
  gpm.late_arrivals,
  gpm.incident_reports,
  gpm.compliments,
  gpm.complaints,
  gpm.last_review_date,
  gpm.next_review_date,
  gpm.status,
  gpm.monthly_progress,
  gpm.created_at,
  gpm.updated_at,
  coalesce(
    nullif(g.full_name, ''),
    nullif(trim(concat_ws(' ', g.first_name, g.last_name)), ''),
    nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')
  ) as guard_name,
  coalesce(g.avatar_url, p.avatar_url) as avatar_url,
  g.employee_id,
  g.shift_type,
  g.employment_date
from public.guard_performance_metrics gpm
left join public.guards g
  on g.id = gpm.guard_id
left join lateral (
  select
    p.first_name,
    p.last_name,
    p.avatar_url
  from public.profiles p
  where g.user_id is not null
    and (p.user_id = g.user_id or p.id = g.user_id)
  order by
    case when p.user_id = g.user_id then 0 else 1 end,
    p.id
  limit 1
) p on true;

create or replace view public.guard_performance_reviews_detailed as
select
  gpr.id,
  gpr.guard_id,
  gpr.reviewer_id,
  gpr.review_date,
  gpr.overall_rating,
  gpr.punctuality_rating,
  gpr.professionalism_rating,
  gpr.reliability_rating,
  gpr.communication_rating,
  gpr.strengths,
  gpr.areas_for_improvement,
  gpr.goals,
  gpr.comments,
  gpr.action_plan,
  gpr.follow_up_date,
  gpr.status,
  gpr.created_at,
  gpr.updated_at,
  coalesce(
    nullif(g.full_name, ''),
    nullif(trim(concat_ws(' ', g.first_name, g.last_name)), ''),
    nullif(trim(concat_ws(' ', gp.first_name, gp.last_name)), '')
  ) as guard_name,
  nullif(trim(concat_ws(' ', rp.first_name, rp.last_name)), '') as reviewer_name
from public.guard_performance_reviews gpr
left join public.guards g
  on g.id = gpr.guard_id
left join lateral (
  select
    p.first_name,
    p.last_name
  from public.profiles p
  where g.user_id is not null
    and (p.user_id = g.user_id or p.id = g.user_id)
  order by
    case when p.user_id = g.user_id then 0 else 1 end,
    p.id
  limit 1
) gp on true
left join public.profiles rp
  on rp.id = gpr.reviewer_id;

drop policy if exists select_own_guard_assignments on public.guard_assignments;
create policy select_own_guard_assignments
  on public.guard_assignments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.guards g
      where g.id = guard_assignments.guard_id
        and public.matches_current_actor(g.user_id)
    )
  );

drop policy if exists p36_guard_certifications_owner_select on public.guard_certifications;
drop policy if exists p36_guard_certifications_admin_scoped_select on public.guard_certifications;
drop policy if exists p36_guard_certifications_admin_scoped_insert on public.guard_certifications;
drop policy if exists p36_guard_certifications_admin_scoped_update on public.guard_certifications;
drop policy if exists p36_guard_certifications_admin_scoped_delete on public.guard_certifications;

create policy p36_guard_certifications_owner_select
  on public.guard_certifications
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.guards g
      where g.id = guard_certifications.guard_id
        and public.matches_current_actor(g.user_id)
    )
  );

create policy p36_guard_certifications_admin_scoped_select
  on public.guard_certifications
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_certifications.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_certifications_admin_scoped_insert
  on public.guard_certifications
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_certifications.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_certifications_admin_scoped_update
  on public.guard_certifications
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_certifications.guard_id
        and public.can_access_community(g.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_certifications.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_certifications_admin_scoped_delete
  on public.guard_certifications
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_certifications.guard_id
        and public.can_access_community(g.community_id)
    )
  );

drop policy if exists p36_guard_trainings_owner_select on public.guard_trainings;
drop policy if exists p36_guard_trainings_admin_scoped_select on public.guard_trainings;
drop policy if exists p36_guard_trainings_admin_scoped_insert on public.guard_trainings;
drop policy if exists p36_guard_trainings_admin_scoped_update on public.guard_trainings;
drop policy if exists p36_guard_trainings_admin_scoped_delete on public.guard_trainings;

create policy p36_guard_trainings_owner_select
  on public.guard_trainings
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.guards g
      where g.id = guard_trainings.guard_id
        and public.matches_current_actor(g.user_id)
    )
  );

create policy p36_guard_trainings_admin_scoped_select
  on public.guard_trainings
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_trainings.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_trainings_admin_scoped_insert
  on public.guard_trainings
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_trainings.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_trainings_admin_scoped_update
  on public.guard_trainings
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_trainings.guard_id
        and public.can_access_community(g.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_trainings.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_trainings_admin_scoped_delete
  on public.guard_trainings
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_trainings.guard_id
        and public.can_access_community(g.community_id)
    )
  );

drop policy if exists p36_guard_performance_metrics_owner_select on public.guard_performance_metrics;
drop policy if exists p36_guard_performance_metrics_admin_scoped_select on public.guard_performance_metrics;
drop policy if exists p36_guard_performance_metrics_admin_scoped_insert on public.guard_performance_metrics;
drop policy if exists p36_guard_performance_metrics_admin_scoped_update on public.guard_performance_metrics;

create policy p36_guard_performance_metrics_owner_select
  on public.guard_performance_metrics
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.guards g
      where g.id = guard_performance_metrics.guard_id
        and public.matches_current_actor(g.user_id)
    )
  );

create policy p36_guard_performance_metrics_admin_scoped_select
  on public.guard_performance_metrics
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance_metrics.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_performance_metrics_admin_scoped_insert
  on public.guard_performance_metrics
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance_metrics.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_performance_metrics_admin_scoped_update
  on public.guard_performance_metrics
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance_metrics.guard_id
        and public.can_access_community(g.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance_metrics.guard_id
        and public.can_access_community(g.community_id)
    )
  );

drop policy if exists p36_guard_performance_reviews_owner_select on public.guard_performance_reviews;
drop policy if exists p36_guard_performance_reviews_admin_scoped_select on public.guard_performance_reviews;
drop policy if exists p36_guard_performance_reviews_admin_scoped_insert on public.guard_performance_reviews;
drop policy if exists p36_guard_performance_reviews_admin_scoped_update on public.guard_performance_reviews;
drop policy if exists p36_guard_performance_reviews_admin_scoped_delete on public.guard_performance_reviews;

create policy p36_guard_performance_reviews_owner_select
  on public.guard_performance_reviews
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.guards g
      where g.id = guard_performance_reviews.guard_id
        and public.matches_current_actor(g.user_id)
    )
  );

create policy p36_guard_performance_reviews_admin_scoped_select
  on public.guard_performance_reviews
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance_reviews.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_performance_reviews_admin_scoped_insert
  on public.guard_performance_reviews
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance_reviews.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_performance_reviews_admin_scoped_update
  on public.guard_performance_reviews
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance_reviews.guard_id
        and public.can_access_community(g.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance_reviews.guard_id
        and public.can_access_community(g.community_id)
    )
  );

create policy p36_guard_performance_reviews_admin_scoped_delete
  on public.guard_performance_reviews
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.guards g
      where g.id = guard_performance_reviews.guard_id
        and public.can_access_community(g.community_id)
    )
  );

commit;
