-- Reversible cleanup for legacy visitor_passes attribution gaps.
-- This version only fills created_by when the derived user_id is guaranteed to exist in auth.users.

create table if not exists public.datafix_phase12_visitor_created_by_backup (
  cleanup_tag text not null,
  visitor_pass_id uuid not null,
  old_created_by uuid,
  new_created_by uuid not null,
  unit_id uuid,
  community_id uuid,
  reason text not null,
  backed_up_at timestamp with time zone not null default now(),
  primary key (cleanup_tag, visitor_pass_id)
);

create table if not exists public.datafix_phase12_profiles_inserted_backup (
  cleanup_tag text not null,
  profile_id uuid not null,
  user_id uuid not null,
  email text not null,
  role text not null,
  inserted_at timestamp with time zone not null default now(),
  primary key (cleanup_tag, profile_id)
);

-- Step 1: deterministically backfill created_by only when a unit has exactly one active profile
-- AND that profile.user_id exists in auth.users (FK-safe).
with unit_single_auth_profile as (
  select
    p.unit_id,
    min(p.user_id::text)::uuid as resolved_user_id
  from public.profiles p
  join auth.users au on au.id = p.user_id
  where p.user_id is not null
    and p.unit_id is not null
    and p.is_active is distinct from false
  group by p.unit_id
  having count(*) = 1
),
recoverable as (
  select
    vp.id as visitor_pass_id,
    vp.created_by as old_created_by,
    usp.resolved_user_id as new_created_by,
    vp.unit_id,
    vp.community_id
  from public.visitor_passes vp
  join unit_single_auth_profile usp on usp.unit_id = vp.unit_id
  where vp.created_by is null
)
insert into public.datafix_phase12_visitor_created_by_backup (
  cleanup_tag,
  visitor_pass_id,
  old_created_by,
  new_created_by,
  unit_id,
  community_id,
  reason
)
select
  'phase12_visitor_cleanup_20260220',
  r.visitor_pass_id,
  r.old_created_by,
  r.new_created_by,
  r.unit_id,
  r.community_id,
  'unit_single_active_profile_with_auth_user'
from recoverable r
on conflict (cleanup_tag, visitor_pass_id) do nothing;

update public.visitor_passes vp
set
  created_by = b.new_created_by,
  updated_at = now()
from public.datafix_phase12_visitor_created_by_backup b
where b.cleanup_tag = 'phase12_visitor_cleanup_20260220'
  and b.reason = 'unit_single_active_profile_with_auth_user'
  and vp.id = b.visitor_pass_id
  and vp.created_by is distinct from b.new_created_by;

-- Step 2: create minimal profile stubs for auth users referenced by visitor_passes.created_by
-- that do not map to profiles.user_id or profiles.id.
with missing_actor as (
  select distinct vp.created_by as user_id
  from public.visitor_passes vp
  left join public.profiles p_user on p_user.user_id = vp.created_by
  left join public.profiles p_id on p_id.id = vp.created_by
  where vp.created_by is not null
    and p_user.user_id is null
    and p_id.id is null
),
actor_meta as (
  select
    ma.user_id,
    coalesce(au.email, ma.user_id::text || '@placeholder.local') as email,
    nullif(trim(coalesce(au.raw_user_meta_data->>'first_name', '')), '') as first_name_meta,
    nullif(trim(coalesce(au.raw_user_meta_data->>'last_name', '')), '') as last_name_meta,
    nullif(trim(coalesce(au.raw_user_meta_data->>'full_name', '')), '') as full_name_meta,
    lower(coalesce(nullif(trim(au.raw_user_meta_data->>'role'), ''), 'user')) as role_meta
  from missing_actor ma
  join auth.users au on au.id = ma.user_id
),
actor_scope as (
  select
    vp.created_by as user_id,
    case
      when count(distinct vp.community_id) filter (where vp.community_id is not null) = 1
      then min(vp.community_id::text) filter (where vp.community_id is not null)::uuid
      else null::uuid
    end as community_id,
    case
      when count(distinct vp.unit_id) filter (where vp.unit_id is not null) = 1
      then min(vp.unit_id::text) filter (where vp.unit_id is not null)::uuid
      else null::uuid
    end as unit_id
  from public.visitor_passes vp
  where vp.created_by is not null
  group by vp.created_by
),
to_insert as (
  select
    am.user_id,
    am.email,
    coalesce(
      am.first_name_meta,
      nullif(split_part(am.full_name_meta, ' ', 1), ''),
      'System'
    ) as first_name,
    coalesce(
      am.last_name_meta,
      nullif(split_part(am.full_name_meta, ' ', 2), ''),
      'User'
    ) as last_name,
    case
      when am.role_meta in ('resident', 'guard', 'admin', 'maintenance', 'management', 'user', 'superadmin')
        then am.role_meta
      else 'user'
    end as role,
    s.community_id,
    s.unit_id
  from actor_meta am
  left join actor_scope s on s.user_id = am.user_id
  left join public.profiles p_email on lower(p_email.email) = lower(am.email)
  where p_email.id is null
),
inserted as (
  insert into public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    full_name,
    role,
    community_id,
    unit_id,
    is_active,
    status,
    created_at,
    updated_at
  )
  select
    ti.user_id,
    ti.email,
    ti.first_name,
    ti.last_name,
    trim(ti.first_name || ' ' || ti.last_name),
    ti.role,
    ti.community_id,
    ti.unit_id,
    true,
    'active',
    now(),
    now()
  from to_insert ti
  on conflict do nothing
  returning id, user_id, email, role
)
insert into public.datafix_phase12_profiles_inserted_backup (
  cleanup_tag,
  profile_id,
  user_id,
  email,
  role
)
select
  'phase12_visitor_cleanup_20260220',
  i.id,
  i.user_id,
  i.email,
  i.role
from inserted i
on conflict (cleanup_tag, profile_id) do nothing;

-- Rollback (manual):
--   update public.visitor_passes vp
--   set created_by = b.old_created_by,
--       updated_at = now()
--   from public.datafix_phase12_visitor_created_by_backup b
--   where b.cleanup_tag = 'phase12_visitor_cleanup_20260220'
--     and vp.id = b.visitor_pass_id;
--
--   delete from public.profiles p
--   using public.datafix_phase12_profiles_inserted_backup pb
--   where pb.cleanup_tag = 'phase12_visitor_cleanup_20260220'
--     and p.id = pb.profile_id;
