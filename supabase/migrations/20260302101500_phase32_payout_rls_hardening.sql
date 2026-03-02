begin;

create or replace function public.can_access_payout_agency(target_agency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select
    target_agency_id is not null
    and (
      public.is_superadmin_role()
      or (
        coalesce(public.current_user_role() = 'agency_manager', false)
        and exists (
          select 1
          from public.profiles p
          join public.agency_staff s
            on (
              (p.email is not null and s.email is not null and lower(s.email) = lower(p.email))
              or (p.phone is not null and s.phone is not null and s.phone = p.phone)
            )
          where p.id = public.current_profile_id()
            and s.agency_id = target_agency_id
        )
      )
    );
$$;

create or replace function public.can_access_payout_request(target_payout_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.payout_requests pr
    where pr.id = target_payout_request_id
      and public.can_access_payout_agency(pr.agency_id)
  );
$$;

grant execute on function public.can_access_payout_agency(uuid) to authenticated, service_role;
grant execute on function public.can_access_payout_request(uuid) to authenticated, service_role;

drop policy if exists p32_payout_rules_select_scoped on public.payout_rules;
create policy p32_payout_rules_select_scoped
on public.payout_rules
for select
to authenticated
using (public.can_access_payout_agency(agency_id));

drop policy if exists p32_payout_rules_service_role_all on public.payout_rules;
create policy p32_payout_rules_service_role_all
on public.payout_rules
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists p32_payout_destinations_select_scoped on public.payout_destinations;
create policy p32_payout_destinations_select_scoped
on public.payout_destinations
for select
to authenticated
using (public.can_access_payout_agency(agency_id));

drop policy if exists p32_payout_destinations_service_role_all on public.payout_destinations;
create policy p32_payout_destinations_service_role_all
on public.payout_destinations
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists p32_payout_requests_select_scoped on public.payout_requests;
create policy p32_payout_requests_select_scoped
on public.payout_requests
for select
to authenticated
using (public.can_access_payout_agency(agency_id));

drop policy if exists p32_payout_requests_service_role_all on public.payout_requests;
create policy p32_payout_requests_service_role_all
on public.payout_requests
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists p32_payout_request_items_select_scoped on public.payout_request_items;
create policy p32_payout_request_items_select_scoped
on public.payout_request_items
for select
to authenticated
using (public.can_access_payout_request(payout_request_id));

drop policy if exists p32_payout_request_items_service_role_all on public.payout_request_items;
create policy p32_payout_request_items_service_role_all
on public.payout_request_items
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists p32_payout_request_events_select_scoped on public.payout_request_events;
create policy p32_payout_request_events_select_scoped
on public.payout_request_events
for select
to authenticated
using (public.can_access_payout_request(payout_request_id));

drop policy if exists p32_payout_request_events_service_role_all on public.payout_request_events;
create policy p32_payout_request_events_service_role_all
on public.payout_request_events
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists p32_payout_ledger_entries_select_scoped on public.payout_ledger_entries;
create policy p32_payout_ledger_entries_select_scoped
on public.payout_ledger_entries
for select
to authenticated
using (public.can_access_payout_agency(agency_id));

drop policy if exists p32_payout_ledger_entries_service_role_all on public.payout_ledger_entries;
create policy p32_payout_ledger_entries_service_role_all
on public.payout_ledger_entries
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

commit;
