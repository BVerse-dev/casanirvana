-- Phase 17: Align community-complaint visibility model
-- Goal: residents can read community complaints in their accessible community,
-- while keeping personal complaints actor/unit-scoped.

begin;

drop policy if exists p17_complaints_select_community_scope on public.complaints;

create policy p17_complaints_select_community_scope
on public.complaints
for select
to authenticated
using (
  complaint_type = 'community'
  and exists (
    select 1
    from public.units u
    where u.id = complaints.unit_id
      and public.can_access_community(u.community_id)
  )
);

commit;
