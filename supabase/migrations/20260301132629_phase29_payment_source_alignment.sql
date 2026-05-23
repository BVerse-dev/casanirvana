-- Phase 29: Payment source alignment
-- - fixes legacy payment_obligation source pointers so obligations resolve by their own IDs
-- - adds payment_status to service_requests so service request payments have a first-class lifecycle

alter table public.service_requests
  add column if not exists payment_status text;

alter table public.service_requests
  alter column payment_status set default 'pending';

update public.service_requests
set payment_status = case
  when coalesce(total_amount, 0) <= 0 then 'not_required'
  else coalesce(nullif(payment_status, ''), 'pending')
end
where payment_status is null
   or payment_status = ''
   or (coalesce(total_amount, 0) <= 0 and payment_status <> 'not_required');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'service_requests_payment_status_check'
  ) then
    alter table public.service_requests
      add constraint service_requests_payment_status_check
      check (payment_status in ('pending', 'paid', 'failed', 'not_required'));
  end if;
end
$$;

update public.payment_obligations
set source_id = null,
    updated_at = now()
where source_type = 'payment_obligation'
  and source_id is not null;

update public.payments
set source_id = obligation_id,
    updated_at = now()
where source_type = 'payment_obligation'
  and obligation_id is not null
  and source_id is distinct from obligation_id;
