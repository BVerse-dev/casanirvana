-- Phase 27: ExpressPay secure gateway configuration foundation
-- 1) Introduces secure, scope-aware gateway config table (community + global).
-- 2) Tightens app_settings RLS by removing permissive authenticated policies.

create table if not exists public.payment_gateway_configs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  mode text not null default 'test',
  scope text not null default 'global',
  community_id uuid null references public.communities(id) on delete cascade,
  is_enabled boolean not null default false,
  public_config jsonb not null default '{}'::jsonb,
  secret_refs jsonb not null default '{}'::jsonb,
  description text null,
  created_by uuid null references public.profiles(id) on delete set null,
  updated_by uuid null references public.profiles(id) on delete set null,
  last_tested_at timestamptz null,
  last_test_status text null,
  last_test_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_gateway_configs_mode_chk check (mode in ('test', 'live')),
  constraint payment_gateway_configs_scope_chk check (scope in ('global', 'community')),
  constraint payment_gateway_configs_scope_community_chk check (
    (scope = 'global' and community_id is null)
    or (scope = 'community' and community_id is not null)
  ),
  constraint payment_gateway_configs_last_test_status_chk check (
    last_test_status is null or last_test_status in ('passed', 'failed')
  )
);

comment on table public.payment_gateway_configs is 'Secure payment gateway configuration (secrets referenced from Vault, never plaintext).';
comment on column public.payment_gateway_configs.public_config is 'Non-sensitive gateway settings (callbacks, display labels, channel flags).';
comment on column public.payment_gateway_configs.secret_refs is 'Vault reference payload (secret IDs/paths), not raw credentials.';

create unique index if not exists p27_payment_gateway_configs_global_unq
  on public.payment_gateway_configs (provider, mode)
  where scope = 'global';

create unique index if not exists p27_payment_gateway_configs_community_unq
  on public.payment_gateway_configs (provider, mode, community_id)
  where scope = 'community';

create index if not exists p27_payment_gateway_configs_lookup_idx
  on public.payment_gateway_configs (provider, mode, scope, community_id);

create index if not exists p27_payment_gateway_configs_enabled_idx
  on public.payment_gateway_configs (is_enabled, provider, mode);

drop trigger if exists trg_payment_gateway_configs_updated_at on public.payment_gateway_configs;
create trigger trg_payment_gateway_configs_updated_at
before update on public.payment_gateway_configs
for each row
execute function public.update_updated_at_column();

alter table public.payment_gateway_configs enable row level security;

drop policy if exists "p27_payment_gateway_configs_admin_select" on public.payment_gateway_configs;
drop policy if exists "p27_payment_gateway_configs_admin_manage" on public.payment_gateway_configs;
drop policy if exists "p27_payment_gateway_configs_superadmin_all" on public.payment_gateway_configs;
drop policy if exists "p27_payment_gateway_configs_service_role_all" on public.payment_gateway_configs;

create policy "p27_payment_gateway_configs_admin_select"
on public.payment_gateway_configs
for select
to authenticated
using (
  public.is_admin_role()
  and scope = 'community'
  and public.can_access_community(community_id)
);

create policy "p27_payment_gateway_configs_admin_manage"
on public.payment_gateway_configs
for all
to authenticated
using (
  public.is_admin_role()
  and scope = 'community'
  and public.can_access_community(community_id)
)
with check (
  public.is_admin_role()
  and scope = 'community'
  and public.can_access_community(community_id)
);

create policy "p27_payment_gateway_configs_superadmin_all"
on public.payment_gateway_configs
for all
to authenticated
using (public.is_superadmin_role())
with check (public.is_superadmin_role());

create policy "p27_payment_gateway_configs_service_role_all"
on public.payment_gateway_configs
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

grant select, insert, update, delete on table public.payment_gateway_configs to authenticated;
grant all on table public.payment_gateway_configs to service_role;

-- Seed explicit global expresspay rows for both environments (disabled by default).
insert into public.payment_gateway_configs (
  provider,
  mode,
  scope,
  is_enabled,
  public_config,
  secret_refs,
  description
)
select
  'expresspay',
  'test',
  'global',
  false,
  jsonb_build_object(
    'currency', 'GHS',
    'callback_path', '/payments/expresspay/callback',
    'integration_mode', 'hosted_checkout'
  ),
  '{}'::jsonb,
  'ExpressPay test configuration (global default)'
where not exists (
  select 1
  from public.payment_gateway_configs pgc
  where pgc.provider = 'expresspay'
    and pgc.mode = 'test'
    and pgc.scope = 'global'
);

insert into public.payment_gateway_configs (
  provider,
  mode,
  scope,
  is_enabled,
  public_config,
  secret_refs,
  description
)
select
  'expresspay',
  'live',
  'global',
  false,
  jsonb_build_object(
    'currency', 'GHS',
    'callback_path', '/payments/expresspay/callback',
    'integration_mode', 'hosted_checkout'
  ),
  '{}'::jsonb,
  'ExpressPay live configuration (global default)'
where not exists (
  select 1
  from public.payment_gateway_configs pgc
  where pgc.provider = 'expresspay'
    and pgc.mode = 'live'
    and pgc.scope = 'global'
);

-- Remove permissive legacy app_settings policies that exposed sensitive payment keys.
drop policy if exists "Allow all operations on app_settings" on public.app_settings;
drop policy if exists "Allow read access to app settings" on public.app_settings;

drop policy if exists "p27_app_settings_admin_all" on public.app_settings;
drop policy if exists "p27_app_settings_service_role_all" on public.app_settings;

create policy "p27_app_settings_admin_all"
on public.app_settings
for all
to authenticated
using (public.is_admin_role())
with check (public.is_admin_role());

create policy "p27_app_settings_service_role_all"
on public.app_settings
for all
to service_role
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
