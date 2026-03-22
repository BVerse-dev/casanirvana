-- Phase 43: Community directory membership integrity parity
-- Purpose:
--   - Reconcile repo migration history with the already-live directory membership
--     integrity layer that was never recorded on current `main`.
--   - Preserve the existing live `p35_*` function/trigger names to avoid unnecessary
--     churn in production while bringing the behavior back under source control.
--   - Repair any missing/inactive/drifted same-community membership rows if a target
--     environment did not receive the original untracked SQL.

create or replace function public.p35_directory_role_for_profile(profile_role text)
returns text
language sql
immutable
as $$
  select case lower(coalesce(profile_role, ''))
    when 'admin' then 'admin'
    when 'management' then 'committee'
    else 'member'
  end;
$$;

create or replace function public.p35_is_directory_profile_role(profile_role text)
returns boolean
language sql
immutable
as $$
  select lower(coalesce(profile_role, '')) in ('user', 'resident', 'tenant', 'admin', 'management');
$$;

create table if not exists public.datafix_phase43_community_membership_repair_backup (
  backup_tag text not null,
  backup_reason text not null,
  backed_up_at timestamptz not null default now(),
  id uuid not null,
  community_id uuid not null,
  profile_id uuid not null,
  membership_role text not null,
  committee_position text,
  tenure_start date,
  tenure_end date,
  is_active boolean not null,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  updated_by uuid
);

create table if not exists public.datafix_phase43_community_membership_insert_backup (
  backup_tag text not null,
  insert_reason text not null,
  backed_up_at timestamptz not null default now(),
  id uuid not null,
  community_id uuid not null,
  profile_id uuid not null,
  membership_role text not null,
  committee_position text,
  tenure_start date,
  tenure_end date,
  is_active boolean not null,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  updated_by uuid
);

with tracked_profiles as (
  select
    p.id as profile_id,
    p.community_id,
    p.role
  from public.profiles p
  where p.community_id is not null
    and public.p35_is_directory_profile_role(p.role)
),
reactivation_candidates as (
  select cm.*
  from public.community_memberships cm
  join tracked_profiles tp
    on tp.profile_id = cm.profile_id
   and tp.community_id = cm.community_id
  where cm.is_active = false
),
backup_reactivations as (
  insert into public.datafix_phase43_community_membership_repair_backup (
    backup_tag,
    backup_reason,
    id,
    community_id,
    profile_id,
    membership_role,
    committee_position,
    tenure_start,
    tenure_end,
    is_active,
    created_at,
    updated_at,
    created_by,
    updated_by
  )
  select
    'phase43_community_directory_membership_integrity_parity_20260322',
    'reactivate_same_community_membership',
    rc.id,
    rc.community_id,
    rc.profile_id,
    rc.membership_role,
    rc.committee_position,
    rc.tenure_start,
    rc.tenure_end,
    rc.is_active,
    rc.created_at,
    rc.updated_at,
    rc.created_by,
    rc.updated_by
  from reactivation_candidates rc
),
reactivated_rows as (
  update public.community_memberships cm
     set is_active = true,
         updated_at = now()
    from reactivation_candidates rc
   where cm.id = rc.id
  returning cm.id
)
select count(*) from reactivated_rows;

with tracked_profiles as (
  select
    p.id as profile_id,
    p.community_id,
    public.p35_directory_role_for_profile(p.role) as membership_role
  from public.profiles p
  where p.community_id is not null
    and public.p35_is_directory_profile_role(p.role)
),
missing_memberships as (
  select tp.*
  from tracked_profiles tp
  left join public.community_memberships cm
    on cm.profile_id = tp.profile_id
   and cm.community_id = tp.community_id
  where cm.id is null
),
inserted_rows as (
  insert into public.community_memberships (
    community_id,
    profile_id,
    membership_role,
    is_active,
    created_at,
    updated_at
  )
  select
    mm.community_id,
    mm.profile_id,
    mm.membership_role,
    true,
    now(),
    now()
  from missing_memberships mm
  returning *
)
insert into public.datafix_phase43_community_membership_insert_backup (
  backup_tag,
  insert_reason,
  id,
  community_id,
  profile_id,
  membership_role,
  committee_position,
  tenure_start,
  tenure_end,
  is_active,
  created_at,
  updated_at,
  created_by,
  updated_by
)
select
  'phase43_community_directory_membership_integrity_parity_20260322',
  'backfill_missing_same_community_membership',
  ir.id,
  ir.community_id,
  ir.profile_id,
  ir.membership_role,
  ir.committee_position,
  ir.tenure_start,
  ir.tenure_end,
  ir.is_active,
  ir.created_at,
  ir.updated_at,
  ir.created_by,
  ir.updated_by
from inserted_rows ir;

with drifted_memberships as (
  select cm.*
  from public.community_memberships cm
  join public.profiles p
    on p.id = cm.profile_id
  where cm.is_active = true
    and p.community_id is distinct from cm.community_id
),
backup_drifted as (
  insert into public.datafix_phase43_community_membership_repair_backup (
    backup_tag,
    backup_reason,
    id,
    community_id,
    profile_id,
    membership_role,
    committee_position,
    tenure_start,
    tenure_end,
    is_active,
    created_at,
    updated_at,
    created_by,
    updated_by
  )
  select
    'phase43_community_directory_membership_integrity_parity_20260322',
    'deactivate_cross_community_membership',
    dm.id,
    dm.community_id,
    dm.profile_id,
    dm.membership_role,
    dm.committee_position,
    dm.tenure_start,
    dm.tenure_end,
    dm.is_active,
    dm.created_at,
    dm.updated_at,
    dm.created_by,
    dm.updated_by
  from drifted_memberships dm
),
deactivated_rows as (
  update public.community_memberships cm
     set is_active = false,
         updated_at = now()
    from drifted_memberships dm
   where cm.id = dm.id
  returning cm.id
)
select count(*) from deactivated_rows;

create or replace function public.p35_validate_community_membership_profile_scope()
returns trigger
language plpgsql
as $$
declare
  profile_community_id uuid;
begin
  select p.community_id
    into profile_community_id
    from public.profiles p
   where p.id = new.profile_id;

  if profile_community_id is null then
    raise exception
      'Cannot assign community membership for profile % without a community_id',
      new.profile_id
      using errcode = '23514';
  end if;

  if profile_community_id is distinct from new.community_id then
    raise exception
      'community_memberships.community_id (%) must match profiles.community_id (%) for profile %',
      new.community_id,
      profile_community_id,
      new.profile_id
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists p35_validate_community_membership_profile_scope
  on public.community_memberships;
create trigger p35_validate_community_membership_profile_scope
before insert or update of community_id, profile_id
on public.community_memberships
for each row execute function public.p35_validate_community_membership_profile_scope();

create or replace function public.p35_sync_profile_directory_membership()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE'
     and new.community_id is not distinct from old.community_id
     and new.role is not distinct from old.role then
    return new;
  end if;

  if not public.p35_is_directory_profile_role(new.role) or new.community_id is null then
    update public.community_memberships
       set is_active = false,
           updated_at = now()
     where profile_id = new.id
       and is_active = true;

    return new;
  end if;

  update public.community_memberships
     set is_active = false,
         updated_at = now()
   where profile_id = new.id
     and is_active = true
     and community_id is distinct from new.community_id;

  insert into public.community_memberships (
    community_id,
    profile_id,
    membership_role,
    is_active,
    created_at,
    updated_at
  )
  values (
    new.community_id,
    new.id,
    public.p35_directory_role_for_profile(new.role),
    true,
    now(),
    now()
  )
  on conflict (community_id, profile_id)
  do update
     set is_active = true,
         updated_at = excluded.updated_at;

  return new;
end;
$$;

drop trigger if exists p35_sync_profile_directory_membership
  on public.profiles;
create trigger p35_sync_profile_directory_membership
after insert or update of community_id, role
on public.profiles
for each row execute function public.p35_sync_profile_directory_membership();
