-- Phase 26: Allow guards to update their own guard profile row.
-- This unblocks production profile edits in the Guard app.

drop policy if exists "Guards can update own profile" on public.guards;

create policy "Guards can update own profile"
on public.guards
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);
