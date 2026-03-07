begin;

alter table public.notification_campaigns
  add column if not exists template_id integer null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notification_campaigns_template_id_fkey'
  ) then
    alter table public.notification_campaigns
      add constraint notification_campaigns_template_id_fkey
      foreign key (template_id) references public.notification_templates(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_notification_campaigns_template_id
  on public.notification_campaigns(template_id);

with template_matches as (
  select
    c.id as campaign_id,
    min(t.id) as matched_template_id
  from public.notification_campaigns c
  join public.notification_templates t
    on lower(trim(coalesce(c.template, ''))) = lower(trim(coalesce(t.template_name, t.name, '')))
  where c.template_id is null
    and coalesce(trim(c.template), '') <> ''
  group by c.id
)
update public.notification_campaigns c
set template_id = m.matched_template_id
from template_matches m
where c.id = m.campaign_id;

update public.notification_campaigns c
set template = coalesce(t.template_name, t.name, c.template)
from public.notification_templates t
where c.template_id = t.id
  and coalesce(c.template, '') is distinct from coalesce(t.template_name, t.name, c.template);

commit;
