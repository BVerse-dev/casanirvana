-- Recovered from live Casa Nirvana Supabase migration metadata on 2026-05-22.
-- Project: pswnlowvmdgeifhxilao

create or replace function public.is_chat_participant(target_chat_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = 'public'
set row_security = 'off'
as $$
  select exists (
    select 1
    from public.chat_participants cp
    where cp.chat_id = target_chat_id
      and cp.user_id = coalesce(target_user_id, auth.uid())
  );
$$;

revoke all on function public.is_chat_participant(uuid, uuid) from public;
grant execute on function public.is_chat_participant(uuid, uuid) to authenticated, service_role;

drop policy if exists participant_read_chat_participants on public.chat_participants;
create policy participant_read_chat_participants
on public.chat_participants
for select
to authenticated
using (
  (user_id = auth.uid())
  or public.is_chat_participant(chat_id)
);

drop policy if exists participant_insert_chat_participants on public.chat_participants;
create policy participant_insert_chat_participants
on public.chat_participants
for insert
to authenticated
with check (
  (user_id = auth.uid())
  or public.is_chat_participant(chat_id)
);

drop policy if exists participant_read_chats on public.chats;
create policy participant_read_chats
on public.chats
for select
to authenticated
using (public.is_chat_participant(id));

drop policy if exists participant_update_chats on public.chats;
create policy participant_update_chats
on public.chats
for update
to authenticated
using (public.is_chat_participant(id))
with check (public.is_chat_participant(id));
