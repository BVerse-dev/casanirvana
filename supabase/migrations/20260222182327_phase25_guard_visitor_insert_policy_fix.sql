-- Phase 25 follow-up: fix guard visitor-pass insert policy qualification

drop policy if exists p25_visitor_passes_insert_guard_scoped on public.visitor_passes;

create policy p25_visitor_passes_insert_guard_scoped
on public.visitor_passes
for insert
to authenticated
with check (
  public.is_guard_role()
  and public.matches_current_actor(created_by)
  and public.guard_can_access_community(visitor_passes.community_id)
  and exists (
    select 1
    from public.units u
    where u.id = visitor_passes.unit_id
      and u.community_id = visitor_passes.community_id
  )
);
