-- Phase 13: Notice comments contract hardening
-- Goal:
-- 1) Preserve legacy non-canonical notice comments in backup table (reversible).
-- 2) Normalize comments.notice_id to UUID + FK to notices(id).
-- 3) Rebuild comments RLS policies against canonical UUID join.

begin;

-- ---------------------------------------------------------------------------
-- Backup legacy/non-canonical comment rows before cleanup
-- ---------------------------------------------------------------------------

create table if not exists public.datafix_phase13_legacy_notice_comments_backup (
  comment_id uuid primary key,
  notice_id text not null,
  author_name text,
  author_avatar text,
  content text,
  likes_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  parent_id uuid,
  backup_reason text not null,
  backed_up_at timestamptz not null default now()
);

with recursive seed as (
  select c.id
  from public.comments c
  where c.notice_id is null
     or c.notice_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
     or (
       c.notice_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
       and not exists (
         select 1
         from public.notices n
         where n.id::text = c.notice_id
       )
     )
),
closure as (
  select id
  from seed
  union
  select child.id
  from public.comments child
  join closure parent_closure on child.parent_id = parent_closure.id
)
insert into public.datafix_phase13_legacy_notice_comments_backup (
  comment_id,
  notice_id,
  author_name,
  author_avatar,
  content,
  likes_count,
  created_at,
  updated_at,
  parent_id,
  backup_reason
)
select
  c.id,
  coalesce(c.notice_id, ''),
  c.author_name,
  c.author_avatar,
  c.content,
  c.likes_count,
  c.created_at,
  c.updated_at,
  c.parent_id,
  'legacy_notice_id_or_unlinked_notice'
from public.comments c
join closure target on target.id = c.id
on conflict (comment_id) do nothing;

-- Remove all legacy/non-canonical rows (and descendants) now preserved in backup.
delete from public.comments c
where exists (
  select 1
  from public.datafix_phase13_legacy_notice_comments_backup b
  where b.comment_id = c.id
);

-- ---------------------------------------------------------------------------
-- Normalize column type and relational integrity
-- ---------------------------------------------------------------------------

alter table public.comments enable row level security;

drop policy if exists "community_read_comments" on public.comments;
drop policy if exists "community_insert_comments" on public.comments;
drop policy if exists "community_update_comments" on public.comments;
drop policy if exists "community_delete_comments" on public.comments;

alter table public.comments
  alter column notice_id type uuid
  using notice_id::uuid;

alter table public.comments
  alter column notice_id set not null;

alter table public.comments
  drop constraint if exists comments_notice_id_fkey;

alter table public.comments
  add constraint comments_notice_id_fkey
  foreign key (notice_id) references public.notices(id) on delete cascade;

comment on column public.comments.notice_id is 'References public.notices.id (UUID).';

-- ---------------------------------------------------------------------------
-- RLS policy rebuild for UUID join
-- ---------------------------------------------------------------------------

create policy "community_read_comments"
  on public.comments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      join public.notices n on n.id = comments.notice_id
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.community_id = n.community_id
    )
  );

create policy "community_insert_comments"
  on public.comments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      join public.notices n on n.id = comments.notice_id
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.community_id = n.community_id
    )
  );

create policy "community_update_comments"
  on public.comments
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      join public.notices n on n.id = comments.notice_id
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.community_id = n.community_id
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      join public.notices n on n.id = comments.notice_id
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.community_id = n.community_id
    )
  );

create policy "community_delete_comments"
  on public.comments
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      join public.notices n on n.id = comments.notice_id
      where (p.id = auth.uid() or p.user_id = auth.uid())
        and p.community_id = n.community_id
    )
  );

commit;
