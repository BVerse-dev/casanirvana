begin;

create index if not exists idx_emails_community_id
  on public.emails(community_id);

with resolved_scope as (
  select
    e.id,
    coalesce(
      e.community_id,
      sender_profile.community_id,
      recipient_profile.community_id
    ) as resolved_community_id
  from public.emails e
  left join public.profiles sender_profile
    on sender_profile.user_id = e.sender_id
    or sender_profile.id = e.sender_id
  left join public.profiles recipient_profile
    on recipient_profile.user_id = e.recipient_id
    or recipient_profile.id = e.recipient_id
  where e.community_id is null
)
update public.emails e
set community_id = resolved_scope.resolved_community_id
from resolved_scope
where e.id = resolved_scope.id
  and resolved_scope.resolved_community_id is not null;

commit;
