-- Phase 11 follow-up: guard profile/auth identity mapping to prevent future dual-link regressions.
-- Non-destructive: existing legacy rows are preserved; guard applies to new identity mappings.

begin;

-- Targeted cleanup for known mismap:
-- profile id matches an auth user but points user_id to a non-existent auth id.
update public.profiles
set user_id = null,
    updated_at = now()
where id = '8fcb1ff1-a385-4c26-8bb4-80c5f23477de'::uuid
  and user_id = '82c83729-a9ec-441a-8471-d0f01bfc0c09'::uuid;

create or replace function public.guard_profiles_identity_consistency()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  -- Allow normal updates that do not change identity mapping.
  if tg_op = 'UPDATE'
     and new.id = old.id
     and new.user_id is not distinct from old.user_id then
    return new;
  end if;

  -- If user_id is provided, it must exist in auth.users.
  if new.user_id is not null
     and not exists (select 1 from auth.users u where u.id = new.user_id) then
    raise exception using
      errcode = '23514',
      message = format(
        'profiles.user_id %s does not exist in auth.users',
        new.user_id
      );
  end if;

  -- If profile.id equals an auth user id, user_id must be null or the same id.
  if exists (select 1 from auth.users u where u.id = new.id)
     and new.user_id is not null
     and new.user_id <> new.id then
    raise exception using
      errcode = '23514',
      message = format(
        'Invalid profile identity mapping: id %s belongs to auth.users and user_id must be null or equal to id',
        new.id
      );
  end if;

  -- Prevent creating a second profile mapping for an auth id that already exists as profiles.id.
  if new.user_id is not null
     and new.user_id <> new.id
     and exists (
       select 1
       from public.profiles p
       where p.id = new.user_id
         and p.id <> new.id
     ) then
    raise exception using
      errcode = '23514',
      message = format(
        'Invalid dual profile mapping: auth id %s already exists as profiles.id',
        new.user_id
      );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_profiles_identity_consistency on public.profiles;

create trigger trg_guard_profiles_identity_consistency
before insert or update on public.profiles
for each row
execute function public.guard_profiles_identity_consistency();

commit;
