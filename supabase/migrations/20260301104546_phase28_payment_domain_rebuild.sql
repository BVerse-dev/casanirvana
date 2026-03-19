-- Phase 28: Payment domain rebuild foundations
-- - adds payment_obligations as the source-of-truth for payable items
-- - extends payments into a source-aware transaction ledger
-- - backfills legacy seed dues into payment_obligations

create table if not exists public.payment_obligations (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  community_id uuid not null references public.communities(id) on delete cascade,
  source_type text not null,
  source_id uuid null,
  title text not null,
  description text null,
  category text not null,
  amount numeric not null,
  currency_code text not null default 'GHS',
  due_date timestamptz null,
  status text not null default 'unpaid',
  statement_month date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_obligations_status_check
    check (status in ('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled'))
);

create unique index if not exists payment_obligations_source_ref_key
  on public.payment_obligations (source_type, source_id);

create index if not exists payment_obligations_unit_status_idx
  on public.payment_obligations (unit_id, status, due_date desc nulls last);

create index if not exists payment_obligations_community_status_idx
  on public.payment_obligations (community_id, status, due_date desc nulls last);

alter table public.payment_obligations enable row level security;

drop policy if exists "p28_payment_obligations_select_unit_occupant" on public.payment_obligations;
drop policy if exists "p28_payment_obligations_manage_admin_scoped" on public.payment_obligations;
drop policy if exists "p28_payment_obligations_all_superadmin" on public.payment_obligations;

create policy "p28_payment_obligations_select_unit_occupant"
on public.payment_obligations
for select
to authenticated
using (
  is_unit_occupant(unit_id)
);

create policy "p28_payment_obligations_manage_admin_scoped"
on public.payment_obligations
for all
to authenticated
using (
  is_admin_role()
  and can_access_community(community_id)
)
with check (
  is_admin_role()
  and can_access_community(community_id)
);

create policy "p28_payment_obligations_all_superadmin"
on public.payment_obligations
for all
to authenticated
using (is_superadmin_role())
with check (is_superadmin_role());

alter table public.payments
  add column if not exists source_type text null,
  add column if not exists source_id uuid null,
  add column if not exists obligation_id uuid null references public.payment_obligations(id) on delete set null,
  add column if not exists currency_code text not null default 'GHS',
  add column if not exists currency_symbol text not null default 'GH₵',
  add column if not exists provider_status_code text null,
  add column if not exists provider_status_message text null,
  add column if not exists provider_checked_at timestamptz null;

create index if not exists payments_status_created_idx
  on public.payments (status, created_at desc);

create index if not exists payments_unit_status_created_idx
  on public.payments (unit_id, status, created_at desc);

create index if not exists payments_source_ref_idx
  on public.payments (source_type, source_id);

create index if not exists payments_obligation_idx
  on public.payments (obligation_id);

update public.payments
set
  status = 'processing',
  updated_at = now()
where payment_gateway is not null
  and coalesce(status, '') = 'pending';

update public.payments
set
  currency_code = coalesce(nullif(currency_code, ''), 'GHS'),
  currency_symbol = coalesce(nullif(currency_symbol, ''), 'GH₵'),
  source_type = coalesce(source_type, 'manual'),
  updated_at = now()
where payment_gateway is not null
  and (
    currency_code is null
    or currency_code = ''
    or currency_symbol is null
    or currency_symbol = ''
    or source_type is null
  );

insert into public.payment_obligations (
  unit_id,
  community_id,
  source_type,
  source_id,
  title,
  description,
  category,
  amount,
  currency_code,
  due_date,
  status,
  statement_month,
  created_at,
  updated_at
)
select
  p.unit_id,
  u.community_id,
  'payment_obligation',
  p.id,
  coalesce(nullif(p.title, ''), nullif(p.payment_type, ''), 'Payment Due'),
  p.description,
  coalesce(nullif(p.payment_type, ''), 'manual'),
  coalesce(p.amount, 0),
  'GHS',
  p.due_date,
  case
    when p.due_date is not null and p.due_date < now() then 'overdue'
    else 'unpaid'
  end,
  date_trunc('month', coalesce(p.due_date, p.created_at, now()))::date,
  coalesce(p.created_at, now()),
  now()
from public.payments p
join public.units u
  on u.id = p.unit_id
where p.payment_gateway is null
  and coalesce(p.status, '') = 'pending'
  and p.obligation_id is null
on conflict (source_type, source_id) do nothing;

update public.payments p
set
  source_type = 'payment_obligation',
  source_id = p.id,
  obligation_id = po.id,
  currency_code = coalesce(nullif(p.currency_code, ''), 'GHS'),
  currency_symbol = coalesce(nullif(p.currency_symbol, ''), 'GH₵'),
  provider_status_message = coalesce(p.provider_status_message, 'Migrated to payment_obligations'),
  status = 'expired',
  updated_at = now()
from public.payment_obligations po
where po.source_type = 'payment_obligation'
  and po.source_id = p.id
  and p.payment_gateway is null
  and coalesce(p.status, '') = 'pending';
