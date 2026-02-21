-- Phase 22: Profile module hardening
-- Ensure family_members follows owner-scoped RLS like other profile-entry tables.

alter table if exists public.family_members enable row level security;

drop policy if exists "family_members_select_own" on public.family_members;
drop policy if exists "family_members_insert_own" on public.family_members;
drop policy if exists "family_members_update_own" on public.family_members;
drop policy if exists "family_members_delete_own" on public.family_members;
drop policy if exists "family_members_service_role_all" on public.family_members;

create policy "family_members_select_own"
on public.family_members
for select
to authenticated
using (user_id = auth.uid());

create policy "family_members_insert_own"
on public.family_members
for insert
to authenticated
with check (user_id = auth.uid());

create policy "family_members_update_own"
on public.family_members
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "family_members_delete_own"
on public.family_members
for delete
to authenticated
using (user_id = auth.uid());

create policy "family_members_service_role_all"
on public.family_members
for all
to service_role
using (true)
with check (true);
