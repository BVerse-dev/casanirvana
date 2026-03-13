begin;

alter table public.notification_campaigns
  add column if not exists community_id uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notification_campaigns_community_id_fkey'
  ) then
    alter table public.notification_campaigns
      add constraint notification_campaigns_community_id_fkey
      foreign key (community_id) references public.communities(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_notification_campaigns_community_id
  on public.notification_campaigns(community_id);

alter table public.notification_campaigns
  drop constraint if exists notification_campaigns_status_check;

alter table public.notification_campaigns
  add constraint notification_campaigns_status_check
  check (
    status = any (
      array[
        'draft'::text,
        'scheduled'::text,
        'active'::text,
        'completed'::text,
        'paused'::text,
        'processing'::text,
        'delivered'::text,
        'failed'::text
      ]
    )
  );

drop policy if exists notification_campaigns_admin_read on public.notification_campaigns;
create policy notification_campaigns_admin_read
  on public.notification_campaigns
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where ((p.id = auth.uid()) or (p.user_id = auth.uid()))
        and p.role = any (array['superadmin'::text, 'admin'::text])
    )
    or (
      community_id is not null
      and exists (
        select 1
        from public.profiles p
        where ((p.id = auth.uid()) or (p.user_id = auth.uid()))
          and p.role = any (array['agency_manager'::text, 'facility_manager'::text])
          and (
            p.community_id = notification_campaigns.community_id
            or exists (
              select 1
              from public.community_admins ca
              where ca.community_id = notification_campaigns.community_id
                and ca.user_id = p.id
            )
            or exists (
              select 1
              from public.communities c
              where c.id = notification_campaigns.community_id
                and c.admins @> array[p.id]
            )
          )
      )
    )
  );

drop policy if exists notification_campaigns_admin_write on public.notification_campaigns;
create policy notification_campaigns_admin_write
  on public.notification_campaigns
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where ((p.id = auth.uid()) or (p.user_id = auth.uid()))
        and p.role = any (array['superadmin'::text, 'admin'::text])
    )
    or (
      community_id is not null
      and exists (
        select 1
        from public.profiles p
        where ((p.id = auth.uid()) or (p.user_id = auth.uid()))
          and p.role = any (array['agency_manager'::text, 'facility_manager'::text])
          and (
            p.community_id = notification_campaigns.community_id
            or exists (
              select 1
              from public.community_admins ca
              where ca.community_id = notification_campaigns.community_id
                and ca.user_id = p.id
            )
            or exists (
              select 1
              from public.communities c
              where c.id = notification_campaigns.community_id
                and c.admins @> array[p.id]
            )
          )
      )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where ((p.id = auth.uid()) or (p.user_id = auth.uid()))
        and p.role = any (array['superadmin'::text, 'admin'::text])
    )
    or (
      community_id is not null
      and exists (
        select 1
        from public.profiles p
        where ((p.id = auth.uid()) or (p.user_id = auth.uid()))
          and p.role = any (array['agency_manager'::text, 'facility_manager'::text])
          and (
            p.community_id = notification_campaigns.community_id
            or exists (
              select 1
              from public.community_admins ca
              where ca.community_id = notification_campaigns.community_id
                and ca.user_id = p.id
            )
            or exists (
              select 1
              from public.communities c
              where c.id = notification_campaigns.community_id
                and c.admins @> array[p.id]
            )
          )
      )
    )
  );

commit;
