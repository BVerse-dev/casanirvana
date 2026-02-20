-- Phase 9 / Slice 4: add saved bill accounts + saved insurance policies schema.
-- Restores Domain 4 persistence expected by user app services/hooks.

create table if not exists public.saved_bill_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  profile_id uuid null references public.profiles(id) on delete set null,
  provider varchar(50) not null,
  provider_name varchar(100),
  account_number varchar(100) not null,
  description varchar(255),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_bill_accounts_user_provider_account_unique
    unique (user_id, provider, account_number)
);

create table if not exists public.saved_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  profile_id uuid null references public.profiles(id) on delete set null,
  provider varchar(50) not null,
  provider_name varchar(100),
  policy_number varchar(100) not null,
  description varchar(255),
  insurance_type varchar(50),
  insured_name varchar(255),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_policies_user_provider_policy_unique
    unique (user_id, provider, policy_number)
);

create index if not exists idx_saved_bill_accounts_user_provider
  on public.saved_bill_accounts (user_id, provider);
create index if not exists idx_saved_bill_accounts_created_at
  on public.saved_bill_accounts (created_at desc);

create index if not exists idx_saved_policies_user_provider
  on public.saved_policies (user_id, provider);
create index if not exists idx_saved_policies_created_at
  on public.saved_policies (created_at desc);

drop trigger if exists update_saved_bill_accounts_updated_at on public.saved_bill_accounts;
create trigger update_saved_bill_accounts_updated_at
before update on public.saved_bill_accounts
for each row execute function public.update_updated_at_column();

drop trigger if exists update_saved_policies_updated_at on public.saved_policies;
create trigger update_saved_policies_updated_at
before update on public.saved_policies
for each row execute function public.update_updated_at_column();

alter table public.saved_bill_accounts enable row level security;
alter table public.saved_policies enable row level security;

drop policy if exists saved_bill_accounts_select_own on public.saved_bill_accounts;
create policy saved_bill_accounts_select_own
on public.saved_bill_accounts
for select
to authenticated
using (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
);

drop policy if exists saved_bill_accounts_insert_own on public.saved_bill_accounts;
create policy saved_bill_accounts_insert_own
on public.saved_bill_accounts
for insert
to authenticated
with check (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
);

drop policy if exists saved_bill_accounts_update_own on public.saved_bill_accounts;
create policy saved_bill_accounts_update_own
on public.saved_bill_accounts
for update
to authenticated
using (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
)
with check (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
);

drop policy if exists saved_bill_accounts_delete_own on public.saved_bill_accounts;
create policy saved_bill_accounts_delete_own
on public.saved_bill_accounts
for delete
to authenticated
using (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
);

drop policy if exists saved_policies_select_own on public.saved_policies;
create policy saved_policies_select_own
on public.saved_policies
for select
to authenticated
using (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
);

drop policy if exists saved_policies_insert_own on public.saved_policies;
create policy saved_policies_insert_own
on public.saved_policies
for insert
to authenticated
with check (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
);

drop policy if exists saved_policies_update_own on public.saved_policies;
create policy saved_policies_update_own
on public.saved_policies
for update
to authenticated
using (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
)
with check (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
);

drop policy if exists saved_policies_delete_own on public.saved_policies;
create policy saved_policies_delete_own
on public.saved_policies
for delete
to authenticated
using (
  user_id = auth.uid()
  or profile_id = public.get_current_profile_id()
);

revoke all on public.saved_bill_accounts from anon;
revoke all on public.saved_policies from anon;

grant select, insert, update, delete on public.saved_bill_accounts to authenticated;
grant select, insert, update, delete on public.saved_policies to authenticated;
grant select, insert, update, delete on public.saved_bill_accounts to service_role;
grant select, insert, update, delete on public.saved_policies to service_role;
