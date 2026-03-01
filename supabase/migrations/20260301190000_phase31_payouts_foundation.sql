begin;

create table if not exists public.payout_rules (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid null references public.agencies(id) on delete cascade,
  community_id uuid null references public.communities(id) on delete cascade,
  effective_from timestamptz not null default now(),
  community_share_mode text not null default 'fixed' check (community_share_mode in ('fixed', 'percentage')),
  community_share_value numeric not null default 0,
  agency_share_mode text not null default 'remainder' check (agency_share_mode in ('remainder', 'fixed', 'percentage')),
  agency_share_value numeric not null default 0,
  platform_fee_mode text not null default 'fixed' check (platform_fee_mode in ('fixed', 'percentage')),
  platform_fee_value numeric not null default 0,
  is_active boolean not null default true,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payout_destinations (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  community_id uuid null references public.communities(id) on delete set null,
  destination_type text not null check (destination_type in ('bank_account', 'mobile_money')),
  label text not null,
  account_name text null,
  account_number_masked text null,
  bank_name text null,
  bank_code text null,
  mobile_network text null,
  mobile_number_masked text null,
  currency_code text not null default 'GHS',
  is_default boolean not null default false,
  is_verified boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'disabled')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  community_id uuid null references public.communities(id) on delete set null,
  destination_id uuid not null references public.payout_destinations(id) on delete restrict,
  requested_amount numeric not null,
  currency_code text not null default 'GHS',
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'processing', 'paid', 'rejected', 'cancelled', 'failed')),
  requested_by uuid null,
  reviewed_by uuid null,
  reviewed_at timestamptz null,
  processed_at timestamptz null,
  reference_number text null,
  notes text null,
  failure_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payout_request_items (
  id uuid primary key default gen_random_uuid(),
  payout_request_id uuid not null references public.payout_requests(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  amount_allocated numeric not null,
  currency_code text not null default 'GHS',
  created_at timestamptz not null default now()
);

create table if not exists public.payout_request_events (
  id uuid primary key default gen_random_uuid(),
  payout_request_id uuid not null references public.payout_requests(id) on delete cascade,
  event_type text not null,
  event_message text not null,
  metadata jsonb not null default '{}'::jsonb,
  actor_user_id uuid null,
  created_at timestamptz not null default now()
);

create table if not exists public.payout_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  community_id uuid null references public.communities(id) on delete set null,
  payment_id uuid null references public.payments(id) on delete set null,
  payout_request_id uuid null references public.payout_requests(id) on delete set null,
  entry_type text not null check (entry_type in ('credit_available', 'reserve_for_request', 'release_reserve', 'payout_completed', 'payout_reversed', 'manual_adjustment')),
  amount numeric not null,
  currency_code text not null default 'GHS',
  running_balance_after numeric not null default 0,
  description text null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid null,
  created_at timestamptz not null default now()
);

alter table public.payments
  add column if not exists revenue_hub text null,
  add column if not exists distribution_class text null,
  add column if not exists gross_amount numeric null,
  add column if not exists platform_fee_amount numeric null,
  add column if not exists agency_share_amount numeric null,
  add column if not exists community_share_amount numeric null,
  add column if not exists payout_eligible_amount numeric null,
  add column if not exists payout_eligible_at timestamptz null,
  add column if not exists payout_status text null,
  add column if not exists payout_batch_id uuid null references public.payout_requests(id) on delete set null,
  add column if not exists payout_reserved_amount numeric not null default 0,
  add column if not exists payout_paid_out_amount numeric not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'payments_revenue_hub_check'
  ) then
    alter table public.payments
      add constraint payments_revenue_hub_check
      check (revenue_hub is null or revenue_hub in ('community', 'personal'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'payments_distribution_class_check'
  ) then
    alter table public.payments
      add constraint payments_distribution_class_check
      check (distribution_class is null or distribution_class in ('distributable', 'non_distributable'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'payments_payout_status_check'
  ) then
    alter table public.payments
      add constraint payments_payout_status_check
      check (payout_status is null or payout_status in ('unallocated', 'available', 'reserved', 'paid_out', 'released', 'reversed'));
  end if;
end
$$;

create index if not exists payout_rules_scope_idx
  on public.payout_rules (agency_id, community_id, is_active, effective_from desc);
create index if not exists payout_destinations_agency_idx
  on public.payout_destinations (agency_id, community_id, status, is_default);
create index if not exists payout_requests_scope_idx
  on public.payout_requests (agency_id, community_id, status, created_at desc);
create index if not exists payout_request_items_request_idx
  on public.payout_request_items (payout_request_id, payment_id);
create unique index if not exists payout_request_items_request_payment_uniq
  on public.payout_request_items (payout_request_id, payment_id);
create index if not exists payout_request_events_request_idx
  on public.payout_request_events (payout_request_id, created_at desc);
create index if not exists payout_ledger_entries_scope_idx
  on public.payout_ledger_entries (agency_id, community_id, created_at desc);
create unique index if not exists payout_ledger_credit_payment_uniq
  on public.payout_ledger_entries (payment_id, entry_type)
  where payment_id is not null and entry_type = 'credit_available';
create index if not exists payments_payout_scope_idx
  on public.payments (revenue_hub, distribution_class, payout_status, status);

alter table public.payout_rules enable row level security;
alter table public.payout_destinations enable row level security;
alter table public.payout_requests enable row level security;
alter table public.payout_request_items enable row level security;
alter table public.payout_request_events enable row level security;
alter table public.payout_ledger_entries enable row level security;

drop trigger if exists payout_rules_set_updated_at on public.payout_rules;
create trigger payout_rules_set_updated_at
before update on public.payout_rules
for each row execute function public.update_updated_at_column();

drop trigger if exists payout_destinations_set_updated_at on public.payout_destinations;
create trigger payout_destinations_set_updated_at
before update on public.payout_destinations
for each row execute function public.update_updated_at_column();

drop trigger if exists payout_requests_set_updated_at on public.payout_requests;
create trigger payout_requests_set_updated_at
before update on public.payout_requests
for each row execute function public.update_updated_at_column();

with payment_scope as (
  select
    p.id,
    p.status,
    p.amount,
    p.source_type,
    p.obligation_id,
    p.provider_checked_at,
    p.completed_at,
    p.paid_at,
    p.updated_at,
    p.created_at,
    u.community_id,
    c.agency_id
  from public.payments p
  left join public.units u on u.id = p.unit_id
  left join public.communities c on c.id = u.community_id
)
update public.payments p
set
  revenue_hub = case
    when coalesce(ps.source_type, '') in ('airtime_purchase', 'data_purchase', 'money_transfer', 'bill_payment', 'insurance_payment', 'shopping_order') then 'personal'
    else 'community'
  end,
  distribution_class = case
    when coalesce(ps.source_type, '') = 'payment_obligation' or ps.obligation_id is not null then 'distributable'
    when coalesce(ps.source_type, '') in ('airtime_purchase', 'data_purchase', 'money_transfer', 'bill_payment', 'insurance_payment', 'shopping_order') then 'non_distributable'
    else 'non_distributable'
  end,
  gross_amount = coalesce(p.gross_amount, p.amount, 0),
  platform_fee_amount = coalesce(p.platform_fee_amount, 0),
  community_share_amount = coalesce(p.community_share_amount, 0),
  agency_share_amount = coalesce(
    p.agency_share_amount,
    case
      when (coalesce(ps.source_type, '') = 'payment_obligation' or ps.obligation_id is not null) and ps.status = 'completed' then coalesce(p.amount, 0)
      else 0
    end
  ),
  payout_eligible_amount = coalesce(
    p.payout_eligible_amount,
    case
      when (coalesce(ps.source_type, '') = 'payment_obligation' or ps.obligation_id is not null) and ps.status = 'completed' then coalesce(p.amount, 0)
      else 0
    end
  ),
  payout_eligible_at = coalesce(
    p.payout_eligible_at,
    p.provider_checked_at,
    p.completed_at,
    p.paid_at,
    p.updated_at,
    p.created_at
  ),
  payout_status = case
    when coalesce(p.payout_paid_out_amount, 0) >= coalesce(p.payout_eligible_amount, case when (coalesce(ps.source_type, '') = 'payment_obligation' or ps.obligation_id is not null) and ps.status = 'completed' then coalesce(p.amount, 0) else 0 end) and coalesce(p.payout_eligible_amount, case when (coalesce(ps.source_type, '') = 'payment_obligation' or ps.obligation_id is not null) and ps.status = 'completed' then coalesce(p.amount, 0) else 0 end) > 0 then 'paid_out'
    when coalesce(p.payout_reserved_amount, 0) > 0 then 'reserved'
    when ((coalesce(ps.source_type, '') = 'payment_obligation' or ps.obligation_id is not null) and ps.status = 'completed') then 'available'
    when ps.status = 'completed' then 'released'
    else coalesce(p.payout_status, 'unallocated')
  end,
  payout_reserved_amount = coalesce(p.payout_reserved_amount, 0),
  payout_paid_out_amount = coalesce(p.payout_paid_out_amount, 0)
from payment_scope ps
where p.id = ps.id
  and (
    p.revenue_hub is null
    or p.distribution_class is null
    or p.gross_amount is null
    or p.payout_eligible_amount is null
    or p.payout_status is null
  );

commit;
