-- Phase 7: Policy smell cleanup (Messaging domain)
-- Chats, chat messages/participants/settings, comments.

-- Helper admin role check:
-- EXISTS (
--   SELECT 1 FROM profiles p
--   WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
--     AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
-- )

-- chats: remove permissive policies
drop policy if exists "Allow all chat operations" on public.chats;
drop policy if exists "Users can create chats" on public.chats;
drop policy if exists "Users can update chats they participate in" on public.chats;

-- chats: admin full access
create policy "admin_all_chats"
  on public.chats
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- chats: participant read
create policy "participant_read_chats"
  on public.chats
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = chats.id
        AND cp.user_id = auth.uid()
    )
  );

-- chats: participant update
create policy "participant_update_chats"
  on public.chats
  for update to authenticated
  using (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = chats.id
        AND cp.user_id = auth.uid()
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = chats.id
        AND cp.user_id = auth.uid()
    )
  );

-- chats: allow insert for authenticated users with a profile
create policy "users_insert_chats"
  on public.chats
  for insert to authenticated
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE (p.id = auth.uid()) OR (p.user_id = auth.uid())
    )
  );

-- chat_participants: remove permissive policies
drop policy if exists "Allow all chat participants operations" on public.chat_participants;
drop policy if exists "Users can insert chat participants" on public.chat_participants;
drop policy if exists "Users can update their own participation" on public.chat_participants;
drop policy if exists "Users can delete their own participation" on public.chat_participants;

-- chat_participants: admin full access
create policy "admin_all_chat_participants"
  on public.chat_participants
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- chat_participants: participant read
create policy "participant_read_chat_participants"
  on public.chat_participants
  for select to authenticated
  using (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = chat_participants.chat_id
        AND cp.user_id = auth.uid()
    )
  );

-- chat_participants: participant insert (self or by existing participant)
create policy "participant_insert_chat_participants"
  on public.chat_participants
  for insert to authenticated
  with check (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = chat_participants.chat_id
        AND cp.user_id = auth.uid()
    )
  );

-- chat_participants: participant update/delete (self)
create policy "participant_update_chat_participants"
  on public.chat_participants
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "participant_delete_chat_participants"
  on public.chat_participants
  for delete to authenticated
  using (user_id = auth.uid());

-- chat_messages: remove permissive policy
drop policy if exists "Allow all chat message operations" on public.chat_messages;

-- chat_messages: admin full access
create policy "admin_all_chat_messages"
  on public.chat_messages
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- chat_messages: participant read
create policy "participant_read_chat_messages"
  on public.chat_messages
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = chat_messages.chat_id
        AND cp.user_id = auth.uid()
    )
  );

-- chat_messages: sender insert/update/delete
create policy "sender_insert_chat_messages"
  on public.chat_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.chat_id = chat_messages.chat_id
        AND cp.user_id = auth.uid()
    )
  );

create policy "sender_update_chat_messages"
  on public.chat_messages
  for update to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

create policy "sender_delete_chat_messages"
  on public.chat_messages
  for delete to authenticated
  using (sender_id = auth.uid());

-- chat_settings: replace update policy to avoid with_check true
drop policy if exists "Users can insert their own settings" on public.chat_settings;
drop policy if exists "Users can update their own settings" on public.chat_settings;
drop policy if exists "Users can delete their own settings" on public.chat_settings;
drop policy if exists "Users can view their own settings" on public.chat_settings;

create policy "users_select_chat_settings"
  on public.chat_settings
  for select to authenticated
  using (auth.uid() = user_id);

create policy "users_insert_chat_settings"
  on public.chat_settings
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users_update_chat_settings"
  on public.chat_settings
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_delete_chat_settings"
  on public.chat_settings
  for delete to authenticated
  using (auth.uid() = user_id);

-- comments: replace permissive policies with community-scoped access
drop policy if exists "Authenticated users can insert comments" on public.comments;
drop policy if exists "Comments are viewable by everyone" on public.comments;
drop policy if exists "Users can delete their own comments" on public.comments;
drop policy if exists "Users can update their own comments" on public.comments;

create policy "community_read_comments"
  on public.comments
  for select to authenticated
  using (
    EXISTS (
      SELECT 1
      FROM profiles p
      JOIN notices n ON n.id::text = comments.notice_id
      WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
        AND p.community_id = n.community_id
    )
  );

create policy "community_insert_comments"
  on public.comments
  for insert to authenticated
  with check (
    EXISTS (
      SELECT 1
      FROM profiles p
      JOIN notices n ON n.id::text = comments.notice_id
      WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
        AND p.community_id = n.community_id
    )
  );

create policy "community_update_comments"
  on public.comments
  for update to authenticated
  using (
    EXISTS (
      SELECT 1
      FROM profiles p
      JOIN notices n ON n.id::text = comments.notice_id
      WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
        AND p.community_id = n.community_id
    )
  )
  with check (
    EXISTS (
      SELECT 1
      FROM profiles p
      JOIN notices n ON n.id::text = comments.notice_id
      WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
        AND p.community_id = n.community_id
    )
  );

create policy "community_delete_comments"
  on public.comments
  for delete to authenticated
  using (
    EXISTS (
      SELECT 1
      FROM profiles p
      JOIN notices n ON n.id::text = comments.notice_id
      WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
        AND p.community_id = n.community_id
    )
  );
