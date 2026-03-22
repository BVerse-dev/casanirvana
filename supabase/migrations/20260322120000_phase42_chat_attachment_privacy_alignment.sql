-- Phase 42: chat attachment privacy alignment
-- Goal:
-- 1) Make the chat-attachments bucket private.
-- 2) Restrict attachment reads to direct message participants plus scoped admins.
-- 3) Preserve legacy rows that still store full public URLs by normalizing paths on read.

create or replace function public.normalize_chat_attachment_storage_path(input text)
returns text
language sql
immutable
set search_path = public
as $$
  select nullif(
    split_part(
      regexp_replace(coalesce(input, ''), '^.*?/chat-attachments/', ''),
      '?',
      1
    ),
    ''
  );
$$;

create or replace function public.can_access_chat_attachment(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.messages message_row
    where message_row.deleted_at is null
      and message_row.message_type = 'file'
      and public.normalize_chat_attachment_storage_path(
        coalesce(message_row.attachments ->> 'path', message_row.attachments ->> 'url')
      ) = object_name
      and (
        public.matches_current_actor(message_row.from_user)
        or public.matches_current_actor(message_row.to_user)
        or (
          public.is_admin_role()
          and (
            public.actor_profile_in_accessible_community(message_row.from_user)
            or public.actor_profile_in_accessible_community(message_row.to_user)
          )
        )
      )
  )
  or exists (
    select 1
    from public.group_messages group_message_row
    where coalesce(group_message_row.is_active, true)
      and group_message_row.message_type = 'file'
      and public.normalize_chat_attachment_storage_path(
        coalesce(group_message_row.attachments ->> 'path', group_message_row.attachments ->> 'url')
      ) = object_name
      and public.is_admin_role()
  );
$$;

grant execute on function public.normalize_chat_attachment_storage_path(text) to authenticated, service_role;
grant execute on function public.can_access_chat_attachment(text) to authenticated, service_role;

update storage.buckets
set public = false
where id = 'chat-attachments';

drop policy if exists p19_chat_attachments_select_authenticated on storage.objects;
drop policy if exists p42_chat_attachments_select_scoped on storage.objects;

create policy p42_chat_attachments_select_scoped
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-attachments'
  and public.can_access_chat_attachment(name)
);
