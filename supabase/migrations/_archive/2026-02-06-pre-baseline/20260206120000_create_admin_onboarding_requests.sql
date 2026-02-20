create table if not exists public.admin_onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_role text not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  organization_name text,
  community_name text,
  country text,
  city text,
  address text,
  referral_code text,
  source text,
  metadata jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  invited_user_id uuid
);

create index if not exists admin_onboarding_requests_status_idx
  on public.admin_onboarding_requests (status);

create index if not exists admin_onboarding_requests_email_idx
  on public.admin_onboarding_requests (email);

create index if not exists admin_onboarding_requests_created_at_idx
  on public.admin_onboarding_requests (created_at desc);
