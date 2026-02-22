-- Phase 25 follow-up: allow guards to triage emergency alerts in their assigned community.

begin;

drop policy if exists p25_emergency_alerts_select_guard_scoped on public.emergency_alerts;
create policy p25_emergency_alerts_select_guard_scoped
on public.emergency_alerts
for select
to authenticated
using (
  public.is_guard_role()
  and public.guard_can_access_community(community_id)
);

drop policy if exists p25_emergency_alerts_update_guard_scoped on public.emergency_alerts;
create policy p25_emergency_alerts_update_guard_scoped
on public.emergency_alerts
for update
to authenticated
using (
  public.is_guard_role()
  and public.guard_can_access_community(community_id)
)
with check (
  public.is_guard_role()
  and public.guard_can_access_community(community_id)
);

commit;
