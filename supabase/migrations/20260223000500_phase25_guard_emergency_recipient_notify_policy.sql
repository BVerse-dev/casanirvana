-- Phase 25 follow-up: allow guards to persist emergency recipient dispatch audit rows.

begin;

drop policy if exists p25_emergency_alert_recipients_insert_guard_scoped on public.emergency_alert_recipients;
create policy p25_emergency_alert_recipients_insert_guard_scoped
on public.emergency_alert_recipients
for insert
to authenticated
with check (
  public.is_guard_role()
  and recipient_user_id is not null
  and public.guard_can_notify_user(recipient_user_id)
  and exists (
    select 1
    from public.emergency_alerts ea
    where ea.id = emergency_alert_recipients.alert_id
      and public.guard_can_access_community(ea.community_id)
  )
);

commit;
