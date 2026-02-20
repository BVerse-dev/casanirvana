-- Helper to avoid inline profile subqueries in RLS policies
create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where (p.id = auth.uid() or p.user_id = auth.uid())
      and p.role = any (array['admin','superadmin','agency_manager','facility_manager']::text[])
  );
$$;

grant execute on function public.is_current_user_admin() to anon, authenticated, service_role;

-- Notifications: remove profile-subquery policies that can recurse via profiles RLS
drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Admins can manage all notifications" on public.notifications;
create policy "Admins can manage all notifications"
on public.notifications
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Chats: remove direct profile subquery in admin and insert policies
drop policy if exists admin_all_chats on public.chats;
create policy admin_all_chats
on public.chats
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

drop policy if exists users_insert_chats on public.chats;
create policy users_insert_chats
on public.chats
for insert
to authenticated
with check (auth.uid() is not null);

-- Chat participants: remove direct profile subquery in admin policy
drop policy if exists admin_all_chat_participants on public.chat_participants;
create policy admin_all_chat_participants
on public.chat_participants
for all
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());
