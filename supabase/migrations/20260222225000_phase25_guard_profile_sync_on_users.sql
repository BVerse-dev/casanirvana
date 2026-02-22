-- Phase 25: Guard auth/profile sync hardening
-- Ensures every users.role='guard' has a corresponding guards row.
-- Includes trigger-based ongoing sync + one-time backfill with reversible backup metadata.

create table if not exists public.datafix_phase25_guard_profile_backfill_backup (
  guard_id uuid primary key,
  user_id uuid not null,
  cleanup_tag text not null,
  created_at timestamptz not null default now()
);

create or replace function public.sync_guard_profile_from_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_first_name text;
  v_last_name text;
  v_full_name text;
begin
  v_role := lower(coalesce(new.role, ''));
  if v_role <> 'guard' then
    return new;
  end if;

  v_first_name := nullif(trim(coalesce(new.first_name, '')), '');
  v_last_name := nullif(trim(coalesce(new.last_name, '')), '');
  v_full_name := btrim(concat_ws(' ', v_first_name, v_last_name));

  if v_full_name = '' then
    v_full_name := coalesce(new.email, 'Guard User');
  end if;

  if not exists (select 1 from public.guards g where g.user_id = new.id) then
    insert into public.guards (
      user_id,
      full_name,
      first_name,
      last_name,
      display_name,
      email,
      phone,
      mobile,
      role,
      status,
      is_active,
      community_id,
      shift_type,
      experience_years,
      total_shifts,
      completed_shifts,
      rating,
      certifications,
      skills,
      created_at,
      updated_at
    ) values (
      new.id,
      v_full_name,
      v_first_name,
      v_last_name,
      v_full_name,
      new.email,
      nullif(trim(coalesce(new.phone, '')), ''),
      nullif(trim(coalesce(new.phone, '')), ''),
      'GUARD',
      'active',
      true,
      new.community_id,
      'day',
      0,
      0,
      0,
      0,
      '[]'::jsonb,
      '[]'::jsonb,
      now(),
      now()
    );
  else
    update public.guards g
    set
      first_name = coalesce(nullif(g.first_name, ''), v_first_name),
      last_name = coalesce(nullif(g.last_name, ''), v_last_name),
      full_name = case
        when nullif(g.full_name, '') is null then v_full_name
        else g.full_name
      end,
      display_name = case
        when nullif(g.display_name, '') is null then v_full_name
        else g.display_name
      end,
      email = coalesce(g.email, new.email),
      phone = coalesce(g.phone, nullif(trim(coalesce(new.phone, '')), '')),
      mobile = coalesce(g.mobile, nullif(trim(coalesce(new.phone, '')), '')),
      community_id = coalesce(g.community_id, new.community_id),
      updated_at = now()
    where g.user_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_guard_profile_from_user on public.users;
create trigger trg_sync_guard_profile_from_user
after insert or update of role, first_name, last_name, email, phone, community_id
on public.users
for each row
execute function public.sync_guard_profile_from_user();

with missing_guard_profiles as (
  select
    u.id as user_id,
    nullif(trim(coalesce(u.first_name, '')), '') as first_name,
    nullif(trim(coalesce(u.last_name, '')), '') as last_name,
    btrim(
      concat_ws(
        ' ',
        nullif(trim(coalesce(u.first_name, '')), ''),
        nullif(trim(coalesce(u.last_name, '')), '')
      )
    ) as full_name,
    u.email,
    nullif(trim(coalesce(u.phone, '')), '') as phone,
    u.community_id
  from public.users u
  left join public.guards g on g.user_id = u.id
  where lower(coalesce(u.role, '')) = 'guard'
    and g.id is null
),
inserted as (
  insert into public.guards (
    user_id,
    full_name,
    first_name,
    last_name,
    display_name,
    email,
    phone,
    mobile,
    role,
    status,
    is_active,
    community_id,
    shift_type,
    experience_years,
    total_shifts,
    completed_shifts,
    rating,
    certifications,
    skills,
    created_at,
    updated_at
  )
  select
    m.user_id,
    case
      when m.full_name = '' then coalesce(m.email, 'Guard User')
      else m.full_name
    end as full_name,
    m.first_name,
    m.last_name,
    case
      when m.full_name = '' then coalesce(m.email, 'Guard User')
      else m.full_name
    end as display_name,
    m.email,
    m.phone,
    m.phone,
    'GUARD',
    'active',
    true,
    m.community_id,
    'day',
    0,
    0,
    0,
    0,
    '[]'::jsonb,
    '[]'::jsonb,
    now(),
    now()
  from missing_guard_profiles m
  returning id as guard_id, user_id
)
insert into public.datafix_phase25_guard_profile_backfill_backup (guard_id, user_id, cleanup_tag)
select
  i.guard_id,
  i.user_id,
  'phase25_guard_profile_backfill_20260222'
from inserted i
on conflict (guard_id) do nothing;
