-- Phase 11 follow-up: resolve canonical profile by preferring profiles.user_id = auth.uid().
-- Why: seeded datasets may contain legacy rows where profiles.id = auth.uid() but the active
-- account profile is linked via profiles.user_id. Preferring user_id keeps runtime behavior
-- consistent with app-level profile resolution and prevents false null-community lookups.

begin;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select p.id
  from public.profiles p
  where p.user_id = auth.uid() or p.id = auth.uid()
  order by
    case
      when p.user_id = auth.uid() then 0
      when p.id = auth.uid() then 1
      else 2
    end,
    case when p.community_id is not null then 0 else 1 end,
    p.created_at desc nulls last,
    p.id
  limit 1;
$$;

create or replace function public.get_current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.current_profile_id();
$$;

commit;
