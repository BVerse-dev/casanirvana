begin;

alter table public.system_settings
  add column if not exists subcategory text not null default '',
  add column if not exists updated_by uuid null;

update public.system_settings
set category = coalesce(category, ''),
    subcategory = coalesce(subcategory, '')
where category is null
   or subcategory is null;

alter table public.system_settings
  alter column category set default '',
  alter column category set not null,
  alter column subcategory set default '',
  alter column subcategory set not null;

alter table public.system_settings
  drop constraint if exists system_settings_key_key;

drop index if exists public.system_settings_key_key;
drop index if exists public.idx_system_settings_lookup;

create unique index if not exists system_settings_category_subcategory_key_key
  on public.system_settings (category, subcategory, key);

create index if not exists idx_system_settings_lookup
  on public.system_settings (category, subcategory, key);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'splash-images',
  'splash-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

commit;
