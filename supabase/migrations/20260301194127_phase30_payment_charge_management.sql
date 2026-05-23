-- Phase 30: Payment charge management
-- Adds reusable charge templates, targeting rules, and issuance runs.
-- Extends payment_obligations so issued charges/invoices flow into the resident app.

create table if not exists public.payment_charge_templates (
  id uuid primary key default gen_random_uuid(),
  scope_level text not null,
  agency_id uuid null references public.agencies(id) on delete cascade,
  community_id uuid null references public.communities(id) on delete cascade,
  name text not null,
  charge_code text not null,
  catalog_key text not null,
  category text not null,
  charge_type text not null,
  amount numeric not null default 0,
  currency_code text not null default 'GHS',
  billing_frequency text not null,
  billing_anchor_day integer null,
  billing_anchor_month integer null,
  start_date date null,
  due_offset_days integer not null default 0,
  grace_period_days integer not null default 0,
  late_fee_type text not null default 'none',
  late_fee_value numeric not null default 0,
  auto_issue boolean not null default false,
  requires_approval boolean not null default false,
  is_active boolean not null default true,
  description text null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_charge_template_targets (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.payment_charge_templates(id) on delete cascade,
  target_type text not null,
  target_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_charge_runs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.payment_charge_templates(id) on delete cascade,
  scope_level text not null,
  agency_id uuid null references public.agencies(id) on delete set null,
  community_id uuid not null references public.communities(id) on delete cascade,
  run_mode text not null,
  billing_period_start date null,
  billing_period_end date null,
  due_date timestamptz not null,
  status text not null default 'draft',
  issued_by uuid null,
  issued_at timestamptz null,
  summary_counts jsonb not null default '{}'::jsonb,
  summary_amounts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payment_charge_templates_scope_level_check'
  ) then
    alter table public.payment_charge_templates
      add constraint payment_charge_templates_scope_level_check
      check (scope_level in ('agency', 'community'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_charge_templates_charge_type_check'
  ) then
    alter table public.payment_charge_templates
      add constraint payment_charge_templates_charge_type_check
      check (charge_type in ('fixed', 'variable', 'formula'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_charge_templates_billing_frequency_check'
  ) then
    alter table public.payment_charge_templates
      add constraint payment_charge_templates_billing_frequency_check
      check (billing_frequency in ('monthly', 'quarterly', 'yearly', 'one_time', 'custom_period'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_charge_templates_late_fee_type_check'
  ) then
    alter table public.payment_charge_templates
      add constraint payment_charge_templates_late_fee_type_check
      check (late_fee_type in ('none', 'fixed', 'percentage'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_charge_templates_scope_ref_check'
  ) then
    alter table public.payment_charge_templates
      add constraint payment_charge_templates_scope_ref_check
      check (
        (scope_level = 'agency' and agency_id is not null)
        or (scope_level = 'community' and community_id is not null)
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_charge_template_targets_target_type_check'
  ) then
    alter table public.payment_charge_template_targets
      add constraint payment_charge_template_targets_target_type_check
      check (target_type in ('all_units', 'unit_ids', 'blocks', 'unit_types', 'occupied_only', 'owner_only', 'tenant_only', 'exclude_unit_ids'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_charge_runs_scope_level_check'
  ) then
    alter table public.payment_charge_runs
      add constraint payment_charge_runs_scope_level_check
      check (scope_level in ('agency', 'community'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_charge_runs_run_mode_check'
  ) then
    alter table public.payment_charge_runs
      add constraint payment_charge_runs_run_mode_check
      check (run_mode in ('manual', 'scheduled'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_charge_runs_status_check'
  ) then
    alter table public.payment_charge_runs
      add constraint payment_charge_runs_status_check
      check (status in ('draft', 'previewed', 'issued', 'cancelled'));
  end if;
end
$$;

create unique index if not exists payment_charge_templates_agency_code_uidx
  on public.payment_charge_templates(agency_id, charge_code)
  where scope_level = 'agency';

create unique index if not exists payment_charge_templates_community_code_uidx
  on public.payment_charge_templates(community_id, charge_code)
  where scope_level = 'community';

create index if not exists payment_charge_templates_scope_active_idx
  on public.payment_charge_templates(scope_level, is_active, created_at desc);

create index if not exists payment_charge_template_targets_template_type_idx
  on public.payment_charge_template_targets(template_id, target_type);

create index if not exists payment_charge_runs_template_period_idx
  on public.payment_charge_runs(template_id, billing_period_start, billing_period_end);

create index if not exists payment_charge_runs_community_status_due_idx
  on public.payment_charge_runs(community_id, status, due_date);

alter table public.payment_obligations
  add column if not exists template_id uuid null,
  add column if not exists charge_run_id uuid null,
  add column if not exists invoice_number text null,
  add column if not exists issued_at timestamptz null,
  add column if not exists billing_period_start date null,
  add column if not exists billing_period_end date null,
  add column if not exists source_scope text null,
  add column if not exists is_manual_issue boolean not null default false,
  add column if not exists late_fee_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists line_items jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payment_obligations_template_id_fkey'
  ) then
    alter table public.payment_obligations
      add constraint payment_obligations_template_id_fkey
      foreign key (template_id) references public.payment_charge_templates(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_obligations_charge_run_id_fkey'
  ) then
    alter table public.payment_obligations
      add constraint payment_obligations_charge_run_id_fkey
      foreign key (charge_run_id) references public.payment_charge_runs(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'payment_obligations_source_scope_check'
  ) then
    alter table public.payment_obligations
      add constraint payment_obligations_source_scope_check
      check (source_scope is null or source_scope in ('agency', 'community'));
  end if;
end
$$;

create index if not exists payment_obligations_charge_run_idx
  on public.payment_obligations(charge_run_id);

create index if not exists payment_obligations_template_idx
  on public.payment_obligations(template_id);

update public.payment_obligations
set issued_at = coalesce(issued_at, created_at),
    source_scope = coalesce(source_scope, 'community'),
    line_items = case
      when jsonb_typeof(coalesce(line_items, '[]'::jsonb)) = 'array'
        and jsonb_array_length(coalesce(line_items, '[]'::jsonb)) > 0 then coalesce(line_items, '[]'::jsonb)
      else jsonb_build_array(
        jsonb_build_object(
          'label', coalesce(title, category, 'Charge'),
          'category', coalesce(category, 'General'),
          'amount', amount,
          'currency_code', coalesce(currency_code, 'GHS')
        )
      )
    end,
    late_fee_snapshot = coalesce(late_fee_snapshot, '{}'::jsonb),
    updated_at = now();

alter table public.payment_charge_templates enable row level security;
alter table public.payment_charge_template_targets enable row level security;
alter table public.payment_charge_runs enable row level security;

comment on table public.payment_charge_templates is 'Agency/community scoped reusable charge templates for generating resident obligations.';
comment on table public.payment_charge_template_targets is 'Targeting rules for payment charge templates.';
comment on table public.payment_charge_runs is 'Issuance batches created from payment charge templates.';
