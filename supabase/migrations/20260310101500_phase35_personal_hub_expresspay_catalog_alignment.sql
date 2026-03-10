-- Phase 35: Personal Hub ExpressPay service-catalog alignment foundation
-- 1) Extend service provider/package cache for ExpressPay-backed catalog sync.
-- 2) Extend Personal Hub source tables with external-service + fulfillment metadata.
-- 3) Refresh the public provider RPC and personal_hub_transactions view to expose the new contract safely.

alter table public.service_providers
  add column if not exists catalog_source text not null default 'manual',
  add column if not exists external_service_code text,
  add column if not exists bill_category text not null default 'general',
  add column if not exists supports_query boolean not null default false,
  add column if not exists supports_pay boolean not null default false,
  add column if not exists supports_status boolean not null default false,
  add column if not exists provider_metadata jsonb not null default '{}'::jsonb,
  add column if not exists last_synced_at timestamp with time zone,
  add column if not exists is_enabled_for_app boolean not null default true;

update public.service_providers
set
  catalog_source = coalesce(nullif(trim(catalog_source), ''), 'manual'),
  bill_category = coalesce(nullif(trim(bill_category), ''), 'general'),
  provider_metadata = coalesce(provider_metadata, '{}'::jsonb),
  is_enabled_for_app = coalesce(is_enabled_for_app, true),
  supports_query = coalesce(supports_query, false),
  supports_pay = coalesce(supports_pay, false),
  supports_status = coalesce(supports_status, false)
where
  catalog_source is null
  or bill_category is null
  or provider_metadata is null
  or is_enabled_for_app is null
  or supports_query is null
  or supports_pay is null
  or supports_status is null;

create unique index if not exists service_providers_catalog_external_code_uidx
  on public.service_providers (catalog_source, service_type, bill_category, external_service_code)
  where external_service_code is not null;

create index if not exists service_providers_service_type_bill_category_enabled_idx
  on public.service_providers (service_type, bill_category, is_active, is_enabled_for_app);

alter table public.service_packages
  add column if not exists catalog_source text not null default 'manual',
  add column if not exists provider_metadata jsonb not null default '{}'::jsonb,
  add column if not exists last_synced_at timestamp with time zone,
  add column if not exists is_enabled_for_app boolean not null default true;

update public.service_packages
set
  catalog_source = coalesce(nullif(trim(catalog_source), ''), 'manual'),
  provider_metadata = coalesce(provider_metadata, '{}'::jsonb),
  is_enabled_for_app = coalesce(is_enabled_for_app, true)
where
  catalog_source is null
  or provider_metadata is null
  or is_enabled_for_app is null;

create unique index if not exists service_packages_provider_package_code_uidx
  on public.service_packages (provider_id, package_code)
  where package_code is not null;

create index if not exists service_packages_provider_active_enabled_idx
  on public.service_packages (provider_id, is_active, is_enabled_for_app);

alter table public.airtime_purchases
  add column if not exists provider_display_name text,
  add column if not exists external_service_code text,
  add column if not exists query_context jsonb not null default '{}'::jsonb,
  add column if not exists provider_payload jsonb not null default '{}'::jsonb,
  add column if not exists fulfillment_status character varying(50) not null default 'pending',
  add column if not exists fulfillment_reference text,
  add column if not exists provider_status_checked_at timestamp with time zone;

alter table public.data_purchases
  add column if not exists provider_display_name text,
  add column if not exists external_service_code text,
  add column if not exists query_context jsonb not null default '{}'::jsonb,
  add column if not exists provider_payload jsonb not null default '{}'::jsonb,
  add column if not exists fulfillment_status character varying(50) not null default 'pending',
  add column if not exists fulfillment_reference text,
  add column if not exists provider_status_checked_at timestamp with time zone;

alter table public.money_transfers
  add column if not exists provider_code text,
  add column if not exists provider_display_name text,
  add column if not exists external_service_code text,
  add column if not exists query_context jsonb not null default '{}'::jsonb,
  add column if not exists provider_payload jsonb not null default '{}'::jsonb,
  add column if not exists fulfillment_status character varying(50) not null default 'pending',
  add column if not exists fulfillment_reference text,
  add column if not exists provider_status_checked_at timestamp with time zone;

alter table public.bill_payments
  add column if not exists provider_display_name text,
  add column if not exists external_service_code text,
  add column if not exists query_context jsonb not null default '{}'::jsonb,
  add column if not exists provider_payload jsonb not null default '{}'::jsonb,
  add column if not exists fulfillment_status character varying(50) not null default 'pending',
  add column if not exists fulfillment_reference text,
  add column if not exists provider_status_checked_at timestamp with time zone;

alter table public.insurance_payments
  add column if not exists provider_display_name text,
  add column if not exists external_service_code text,
  add column if not exists query_context jsonb not null default '{}'::jsonb,
  add column if not exists provider_payload jsonb not null default '{}'::jsonb,
  add column if not exists fulfillment_status character varying(50) not null default 'pending',
  add column if not exists fulfillment_reference text,
  add column if not exists provider_status_checked_at timestamp with time zone;

drop function if exists public.list_active_service_providers(text);

create or replace function public.list_active_service_providers(
  p_service_type text
)
returns table (
  id uuid,
  provider_name text,
  service_type text,
  logo_url text,
  external_service_code text,
  bill_category text,
  supports_query boolean,
  supports_pay boolean,
  supports_status boolean,
  provider_metadata jsonb
)
language sql
security definer
set search_path = public
set row_security = off
as $$
  select
    sp.id,
    sp.provider_name::text,
    sp.service_type::text,
    sp.logo_url,
    sp.external_service_code,
    sp.bill_category,
    sp.supports_query,
    sp.supports_pay,
    sp.supports_status,
    sp.provider_metadata
  from public.service_providers sp
  where sp.is_active = true
    and sp.is_enabled_for_app = true
    and sp.service_type = p_service_type
  order by sp.provider_name asc;
$$;

revoke all on function public.list_active_service_providers(text) from public;
grant execute on function public.list_active_service_providers(text) to authenticated;
grant execute on function public.list_active_service_providers(text) to service_role;

create or replace view public.personal_hub_transactions as
 select
    'airtime'::text as transaction_type,
    a.id as transaction_id,
    a.user_id,
    a.profile_id,
    coalesce(a.provider_display_name, a.provider)::character varying as provider,
    a.phone_number as recipient_identifier,
    a.description as recipient_name,
    a.amount,
    a.amount as total_amount,
    a.status,
    a.payment_ref_id as payment_id,
    a.created_at,
    a.updated_at,
    a.external_service_code,
    a.fulfillment_status,
    a.fulfillment_reference,
    a.query_context
  from public.airtime_purchases a
union all
 select
    'data'::text as transaction_type,
    d.id as transaction_id,
    d.user_id,
    d.profile_id,
    coalesce(d.provider_display_name, d.provider)::character varying as provider,
    d.phone_number as recipient_identifier,
    d.description as recipient_name,
    d.amount,
    d.amount as total_amount,
    d.status,
    d.payment_ref_id as payment_id,
    d.created_at,
    d.updated_at,
    d.external_service_code,
    d.fulfillment_status,
    d.fulfillment_reference,
    d.query_context
  from public.data_purchases d
union all
 select
    'money_transfer'::text as transaction_type,
    m.id as transaction_id,
    m.user_id,
    m.profile_id,
    coalesce(m.provider_display_name, m.provider_code, 'Transfer')::character varying as provider,
    m.recipient_phone as recipient_identifier,
    m.recipient_name,
    m.amount,
    m.total_amount,
    m.status,
    m.payment_ref_id as payment_id,
    m.created_at,
    m.updated_at,
    m.external_service_code,
    m.fulfillment_status,
    m.fulfillment_reference,
    m.query_context
  from public.money_transfers m
union all
 select
    'bill_payment'::text as transaction_type,
    b.id as transaction_id,
    b.user_id,
    b.profile_id,
    coalesce(b.provider_display_name, b.provider)::character varying as provider,
    b.account_number as recipient_identifier,
    b.customer_name as recipient_name,
    b.amount,
    b.total_amount,
    b.status,
    b.payment_ref_id as payment_id,
    b.created_at,
    b.updated_at,
    b.external_service_code,
    b.fulfillment_status,
    b.fulfillment_reference,
    b.query_context
  from public.bill_payments b
union all
 select
    'insurance'::text as transaction_type,
    i.id as transaction_id,
    i.user_id,
    i.profile_id,
    coalesce(i.provider_display_name, i.provider)::character varying as provider,
    i.policy_number as recipient_identifier,
    i.insured_name as recipient_name,
    i.amount,
    i.total_amount,
    i.status,
    i.payment_ref_id as payment_id,
    i.created_at,
    i.updated_at,
    i.external_service_code,
    i.fulfillment_status,
    i.fulfillment_reference,
    i.query_context
  from public.insurance_payments i
union all
 select
    'shopping'::text as transaction_type,
    s.id as transaction_id,
    s.user_id,
    s.profile_id,
    s.merchant as provider,
    s.order_number as recipient_identifier,
    s.merchant as recipient_name,
    s.amount,
    s.total_amount,
    s.status,
    s.payment_ref_id as payment_id,
    s.created_at,
    s.updated_at,
    null::text as external_service_code,
    null::character varying(50) as fulfillment_status,
    null::text as fulfillment_reference,
    '{}'::jsonb as query_context
  from public.shopping_payments s;

alter view public.personal_hub_transactions set (security_invoker = true);
revoke all on table public.personal_hub_transactions from anon, authenticated, service_role;
grant select on table public.personal_hub_transactions to authenticated;
grant select on table public.personal_hub_transactions to service_role;
