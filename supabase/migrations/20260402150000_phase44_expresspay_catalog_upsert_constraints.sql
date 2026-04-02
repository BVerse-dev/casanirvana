-- Phase 44: ExpressPay catalog upsert constraints
-- Supabase/PostgREST upsert(onConflict=...) cannot target partial unique indexes.
-- Replace the Phase 35 partial indexes with full unique indexes on the same columns
-- so Personal Hub catalog sync can use ON CONFLICT safely.

drop index if exists public.service_providers_catalog_external_code_uidx;

create unique index if not exists service_providers_catalog_external_code_uidx
  on public.service_providers (
    catalog_source,
    service_type,
    bill_category,
    external_service_code
  );

drop index if exists public.service_packages_provider_package_code_uidx;

create unique index if not exists service_packages_provider_package_code_uidx
  on public.service_packages (
    provider_id,
    package_code
  );
