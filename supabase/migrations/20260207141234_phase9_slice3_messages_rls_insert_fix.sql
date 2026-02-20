-- Phase 9 / Slice 3: restore safe message creation policy and remove permissive update policy.

drop policy if exists users_insert_messages on public.messages;
create policy users_insert_messages
on public.messages
for insert
to authenticated
with check (
  from_user = get_current_profile_id()
  and to_user is not null
);

drop policy if exists "Allow message updates" on public.messages;

drop policy if exists service_role_insert_messages on public.messages;
create policy service_role_insert_messages
on public.messages
for insert
to service_role
with check (auth.role() = 'service_role');
