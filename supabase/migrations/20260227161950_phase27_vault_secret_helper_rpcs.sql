-- Phase 27: Vault helper RPCs for backend-only secure gateway secret management

create or replace function public.p27_read_vault_secret(secret_name text)
returns text
language plpgsql
security definer
set search_path = public, vault
set row_security = off
as $$
declare
  resolved_secret text;
begin
  if secret_name is null or btrim(secret_name) = '' then
    return null;
  end if;

  select ds.decrypted_secret
    into resolved_secret
  from vault.decrypted_secrets ds
  where ds.name = secret_name
  order by ds.updated_at desc
  limit 1;

  return resolved_secret;
end;
$$;

create or replace function public.p27_read_vault_secret_by_id(secret_id uuid)
returns text
language plpgsql
security definer
set search_path = public, vault
set row_security = off
as $$
declare
  resolved_secret text;
begin
  if secret_id is null then
    return null;
  end if;

  select ds.decrypted_secret
    into resolved_secret
  from vault.decrypted_secrets ds
  where ds.id = secret_id
  limit 1;

  return resolved_secret;
end;
$$;

create or replace function public.p27_upsert_vault_secret(
  secret_name text,
  secret_value text,
  secret_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, vault
set row_security = off
as $$
declare
  existing_secret_id uuid;
begin
  if secret_name is null or btrim(secret_name) = '' then
    raise exception 'secret_name is required';
  end if;

  if secret_value is null or btrim(secret_value) = '' then
    raise exception 'secret_value is required';
  end if;

  select ds.id
    into existing_secret_id
  from vault.decrypted_secrets ds
  where ds.name = secret_name
  order by ds.updated_at desc
  limit 1;

  if existing_secret_id is null then
    return vault.create_secret(secret_value, secret_name, secret_description, null::uuid);
  end if;

  perform vault.update_secret(existing_secret_id, secret_value, secret_name, secret_description, null::uuid);
  return existing_secret_id;
end;
$$;

revoke all on function public.p27_read_vault_secret(text) from public;
revoke all on function public.p27_read_vault_secret_by_id(uuid) from public;
revoke all on function public.p27_upsert_vault_secret(text, text, text) from public;

grant execute on function public.p27_read_vault_secret(text) to service_role;
grant execute on function public.p27_read_vault_secret_by_id(uuid) to service_role;
grant execute on function public.p27_upsert_vault_secret(text, text, text) to service_role;
