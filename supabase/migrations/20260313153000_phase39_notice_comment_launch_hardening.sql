-- Phase 39: Notice comment launch hardening
-- Goal:
-- 1) Attach comment writes to the authenticated actor.
-- 2) Remove broad direct comment updates/deletes from browser clients.
-- 3) Expose scoped comment-like mutation through an RPC instead of raw table updates.

begin;

alter table public.comments
  add column if not exists author_user_id uuid;

alter table public.comments
  alter column author_user_id set default auth.uid();

comment on column public.comments.author_user_id is 'Authenticated user id that created the comment.';

create index if not exists idx_comments_author_user_id
  on public.comments using btree (author_user_id);

drop policy if exists "community_read_comments" on public.comments;
drop policy if exists "community_insert_comments" on public.comments;
drop policy if exists "community_update_comments" on public.comments;
drop policy if exists "community_delete_comments" on public.comments;

drop policy if exists p39_comments_select_scoped on public.comments;
drop policy if exists p39_comments_insert_scoped on public.comments;
drop policy if exists p39_comments_delete_admin_scoped on public.comments;

create policy p39_comments_select_scoped
on public.comments
for select
to authenticated
using (
  exists (
    select 1
    from public.notices n
    where n.id = comments.notice_id
      and public.can_access_community(n.community_id)
  )
);

create policy p39_comments_insert_scoped
on public.comments
for insert
to authenticated
with check (
  author_user_id = auth.uid()
  and exists (
    select 1
    from public.notices n
    where n.id = comments.notice_id
      and public.can_access_community(n.community_id)
  )
);

create policy p39_comments_delete_admin_scoped
on public.comments
for delete
to authenticated
using (
  public.is_admin_role()
  and exists (
    select 1
    from public.notices n
    where n.id = comments.notice_id
      and public.can_access_community(n.community_id)
  )
);

create or replace function public.increment_comment_likes(comment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if not exists (
    select 1
    from public.comments c
    where c.id = comment_id
  ) then
    raise exception 'COMMENT_NOT_FOUND' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.comments c
    join public.notices n on n.id = c.notice_id
    where c.id = comment_id
      and public.can_access_community(n.community_id)
  ) then
    raise exception 'COMMENT_SCOPE_VIOLATION' using errcode = '42501';
  end if;

  update public.comments
  set likes_count = coalesce(likes_count, 0) + 1,
      updated_at = now()
  where id = comment_id;
end;
$$;

grant execute on function public.increment_comment_likes(uuid) to authenticated, service_role;

commit;
