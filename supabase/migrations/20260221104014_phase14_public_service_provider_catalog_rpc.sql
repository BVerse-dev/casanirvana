-- Phase 14 follow-up: expose a safe, read-only provider catalog for user apps.
-- This avoids granting direct access to sensitive service_providers columns.

begin;

create or replace function public.list_active_service_providers(
  p_service_type text default null
)
returns table (
  id uuid,
  provider_name text,
  service_type text,
  logo_url text
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  with normalized_request as (
    select case
      when p_service_type is null or btrim(p_service_type) = '' then null
      when lower(p_service_type) in ('transfer', 'money-transfer', 'money_transfer') then 'money_transfer'
      when lower(p_service_type) in ('bill', 'bill-payment', 'bill_payment') then 'bill_payment'
      when lower(p_service_type) in ('mobile_topup', 'topup', 'airtime') then 'airtime'
      else lower(p_service_type)
    end as service_type
  )
  select
    sp.id,
    sp.provider_name,
    lower(sp.service_type)::text as service_type,
    sp.logo_url
  from public.service_providers sp
  cross join normalized_request nr
  where coalesce(sp.is_active, true) = true
    and (nr.service_type is null or lower(sp.service_type) = nr.service_type)
  order by sp.provider_name;
$$;

revoke all
  on function public.list_active_service_providers(text)
  from public, anon, authenticated, service_role;
grant execute
  on function public.list_active_service_providers(text)
  to authenticated;
grant execute
  on function public.list_active_service_providers(text)
  to service_role;

commit;
