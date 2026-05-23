-- Phase 18: enable maintenance request attachments
-- Adds image URL array storage with a conservative max-count guardrail.

alter table public.maintenance_requests
  add column if not exists images text[];

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'maintenance_requests_images_max_5'
  ) then
    alter table public.maintenance_requests
      add constraint maintenance_requests_images_max_5
      check (images is null or coalesce(array_length(images, 1), 0) <= 5);
  end if;
end $$;

comment on column public.maintenance_requests.images is
  'Public storage URLs for up to 5 maintenance request image attachments';
