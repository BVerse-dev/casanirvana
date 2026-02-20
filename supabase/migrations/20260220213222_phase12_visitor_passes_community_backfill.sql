-- Backfill visitor_passes.community_id from units and keep it in sync going forward.

create or replace function public.visitor_passes_set_community_id_from_unit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_community_id uuid;
begin
  if new.unit_id is null then
    return new;
  end if;

  select u.community_id
    into derived_community_id
  from public.units u
  where u.id = new.unit_id;

  if derived_community_id is not null then
    new.community_id := derived_community_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_visitor_passes_set_community_id on public.visitor_passes;

create trigger trg_visitor_passes_set_community_id
before insert or update of unit_id
on public.visitor_passes
for each row
execute function public.visitor_passes_set_community_id_from_unit();

update public.visitor_passes vp
set community_id = u.community_id
from public.units u
where vp.unit_id = u.id
  and u.community_id is not null
  and vp.community_id is distinct from u.community_id;
