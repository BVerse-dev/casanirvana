-- Align primary superadmin profile scope to Casa Nirvana so default UI-scoped views
-- open on the production community with active operational data.

create table if not exists public.datafix_phase12_superadmin_scope_backup (
  cleanup_tag text not null,
  profile_id uuid not null,
  user_id uuid,
  old_community_id uuid,
  old_unit_id uuid,
  new_community_id uuid not null,
  new_unit_id uuid,
  changed_at timestamptz not null default now(),
  primary key (cleanup_tag, profile_id)
);

insert into public.datafix_phase12_superadmin_scope_backup (
  cleanup_tag,
  profile_id,
  user_id,
  old_community_id,
  old_unit_id,
  new_community_id,
  new_unit_id
)
select
  'phase12_superadmin_scope_20260220',
  p.id,
  p.user_id,
  p.community_id,
  p.unit_id,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'db20ece9-ceb0-4f53-a895-8348b67d8591'::uuid
from public.profiles p
where p.user_id = '75af3e6b-8bfe-4cf4-b70b-adad3d4edaad'::uuid
on conflict (cleanup_tag, profile_id) do nothing;

update public.profiles p
set
  community_id = '11111111-1111-1111-1111-111111111111'::uuid,
  unit_id = 'db20ece9-ceb0-4f53-a895-8348b67d8591'::uuid,
  updated_at = now()
where p.user_id = '75af3e6b-8bfe-4cf4-b70b-adad3d4edaad'::uuid
  and (
    p.community_id is distinct from '11111111-1111-1111-1111-111111111111'::uuid
    or p.unit_id is distinct from 'db20ece9-ceb0-4f53-a895-8348b67d8591'::uuid
  );

-- Rollback (manual):
-- update public.profiles p
-- set community_id = b.old_community_id,
--     unit_id = b.old_unit_id,
--     updated_at = now()
-- from public.datafix_phase12_superadmin_scope_backup b
-- where b.cleanup_tag = 'phase12_superadmin_scope_20260220'
--   and p.id = b.profile_id;
