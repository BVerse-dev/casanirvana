-- Phase 20 follow-up: enforce service/community consistency for service_requests
-- This migration is reversible for existing mismatched rows via backup table.

create table if not exists public.datafix_phase20_service_request_scope_mismatch_backup (
  backup_id bigserial primary key,
  cleanup_tag text not null,
  backed_up_at timestamptz not null default now(),
  service_request_id uuid not null,
  service_id bigint,
  original_community_id uuid,
  service_community_id uuid,
  original_title text,
  original_description text,
  original_request_details text
);

create index if not exists idx_datafix_phase20_service_scope_backup_req_id
  on public.datafix_phase20_service_request_scope_mismatch_backup (service_request_id);

insert into public.datafix_phase20_service_request_scope_mismatch_backup (
  cleanup_tag,
  service_request_id,
  service_id,
  original_community_id,
  service_community_id,
  original_title,
  original_description,
  original_request_details
)
select
  'phase20_service_scope_guardrail_20260221' as cleanup_tag,
  sr.id,
  sr.service_id,
  sr.community_id,
  s.community_id,
  sr.title,
  sr.description,
  sr.request_details
from public.service_requests sr
join public.services s on s.id = sr.service_id
where sr.service_id is not null
  and sr.community_id is distinct from s.community_id
  and not exists (
    select 1
    from public.datafix_phase20_service_request_scope_mismatch_backup b
    where b.cleanup_tag = 'phase20_service_scope_guardrail_20260221'
      and b.service_request_id = sr.id
  );

-- Keep request history in the original community and detach invalid cross-community service links.
update public.service_requests sr
set
  title = coalesce(sr.title, s.name),
  service_id = null,
  updated_at = now()
from public.services s
where sr.service_id = s.id
  and sr.community_id is distinct from s.community_id;

create or replace function public.enforce_service_request_service_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  service_community_id uuid;
  service_name text;
begin
  if new.service_id is null then
    return new;
  end if;

  select s.community_id, s.name
  into service_community_id, service_name
  from public.services s
  where s.id = new.service_id;

  if service_community_id is null then
    raise exception 'Invalid service_id % for service request', new.service_id
      using errcode = '23503';
  end if;

  if new.community_id is null then
    new.community_id := service_community_id;
  elsif new.community_id <> service_community_id then
    raise exception
      'service_requests.community_id (%) must match services.community_id (%) for service_id %',
      new.community_id,
      service_community_id,
      new.service_id
      using errcode = '23514';
  end if;

  if new.title is null or btrim(new.title) = '' then
    new.title := service_name;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_service_requests_enforce_service_scope on public.service_requests;
create trigger trg_service_requests_enforce_service_scope
before insert or update of service_id, community_id, title
on public.service_requests
for each row
execute function public.enforce_service_request_service_scope();
