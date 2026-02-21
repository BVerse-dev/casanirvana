-- Phase 19: Chat calls + chat attachment storage hardening
-- Goal:
-- 1) Remove permissive/legacy calls RLS policies and align with actor/admin scoped contract.
-- 2) Add explicit chat-attachments storage policies for upload/read/delete.

-- ---------------------------------------------------------------------------
-- Calls RLS hardening
-- ---------------------------------------------------------------------------
alter table public.calls enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'calls'
  loop
    execute format('drop policy if exists %I on public.calls', policy_row.policyname);
  end loop;
end
$$;

create policy p19_calls_select_actor
on public.calls
for select
to authenticated
using (
  public.matches_current_actor(caller_id)
  or public.matches_current_actor(callee_id)
);

create policy p19_calls_select_admin_scoped
on public.calls
for select
to authenticated
using (
  public.is_admin_role()
  and (
    public.actor_profile_in_accessible_community(caller_id)
    or public.actor_profile_in_accessible_community(callee_id)
  )
);

create policy p19_calls_insert_actor
on public.calls
for insert
to authenticated
with check (
  public.matches_current_actor(caller_id)
  and callee_id is not null
  and public.actor_profile_in_accessible_community(caller_id)
  and public.actor_profile_in_accessible_community(callee_id)
);

create policy p19_calls_insert_service_role
on public.calls
for insert
to service_role
with check (auth.role() = 'service_role');

create policy p19_calls_update_actor
on public.calls
for update
to authenticated
using (
  public.matches_current_actor(caller_id)
  or public.matches_current_actor(callee_id)
)
with check (
  public.matches_current_actor(caller_id)
  or public.matches_current_actor(callee_id)
);

create policy p19_calls_update_admin_scoped
on public.calls
for update
to authenticated
using (
  public.is_admin_role()
  and (
    public.actor_profile_in_accessible_community(caller_id)
    or public.actor_profile_in_accessible_community(callee_id)
  )
)
with check (
  public.is_admin_role()
  and (
    public.actor_profile_in_accessible_community(caller_id)
    or public.actor_profile_in_accessible_community(callee_id)
  )
);

create policy p19_calls_update_service_role
on public.calls
for update
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy p19_calls_delete_admin_scoped
on public.calls
for delete
to authenticated
using (
  public.is_admin_role()
  and (
    public.actor_profile_in_accessible_community(caller_id)
    or public.actor_profile_in_accessible_community(callee_id)
  )
);

create policy p19_calls_delete_service_role
on public.calls
for delete
to service_role
using (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Chat attachments storage policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-attachments',
  'chat-attachments',
  true,
  10485760,
  array[
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]::text[]
)
on conflict (id) do nothing;

drop policy if exists p19_chat_attachments_select_authenticated on storage.objects;
drop policy if exists p19_chat_attachments_insert_owner on storage.objects;
drop policy if exists p19_chat_attachments_delete_owner on storage.objects;
drop policy if exists p19_chat_attachments_service_select on storage.objects;
drop policy if exists p19_chat_attachments_service_insert on storage.objects;
drop policy if exists p19_chat_attachments_service_update on storage.objects;
drop policy if exists p19_chat_attachments_service_delete on storage.objects;

create policy p19_chat_attachments_select_authenticated
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-attachments'
);

create policy p19_chat_attachments_insert_owner
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-attachments'
  and (storage.foldername(name))[1] = (auth.uid())::text
);

create policy p19_chat_attachments_delete_owner
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'chat-attachments'
  and (storage.foldername(name))[1] = (auth.uid())::text
);

create policy p19_chat_attachments_service_select
on storage.objects
for select
to service_role
using (
  auth.role() = 'service_role'
  and bucket_id = 'chat-attachments'
);

create policy p19_chat_attachments_service_insert
on storage.objects
for insert
to service_role
with check (
  auth.role() = 'service_role'
  and bucket_id = 'chat-attachments'
);

create policy p19_chat_attachments_service_update
on storage.objects
for update
to service_role
using (
  auth.role() = 'service_role'
  and bucket_id = 'chat-attachments'
)
with check (
  auth.role() = 'service_role'
  and bucket_id = 'chat-attachments'
);

create policy p19_chat_attachments_service_delete
on storage.objects
for delete
to service_role
using (
  auth.role() = 'service_role'
  and bucket_id = 'chat-attachments'
);
