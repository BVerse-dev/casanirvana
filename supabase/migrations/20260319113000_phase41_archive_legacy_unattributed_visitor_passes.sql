-- Archive and remove legacy visitor_pass seed/demo rows that never received
-- valid creator attribution and should not remain launch-facing production data.

create table if not exists public.datafix_phase41_legacy_visitor_passes_archive (
  cleanup_tag text not null,
  visitor_pass_id uuid not null,
  archive_reason text not null,
  source_row jsonb not null,
  archived_at timestamp with time zone not null default now(),
  primary key (cleanup_tag, visitor_pass_id)
);

create table if not exists public.datafix_phase41_legacy_visitor_entry_logs_archive (
  cleanup_tag text not null,
  entry_log_id uuid not null,
  pass_id uuid not null,
  archive_reason text not null,
  source_row jsonb not null,
  archived_at timestamp with time zone not null default now(),
  primary key (cleanup_tag, entry_log_id)
);

with target_ids as (
  select unnest(
    array[
      '64a77c2b-15c7-4135-986b-30b85c95babb'::uuid,
      'd75a69b0-c8fe-402f-afd0-dc3d7b80f051'::uuid,
      '66bff9f8-46a7-473c-aff6-2fad18954f2b'::uuid,
      '11904e58-3870-4e38-9cc8-12cbb03918b8'::uuid,
      'e796c571-edd5-42c6-924f-e2edddac74ce'::uuid,
      'b143799d-9f8b-4a18-bf04-9c76b0ad3e88'::uuid,
      '77acb25e-60ef-4ecc-b4c6-aa8c76d4ae95'::uuid,
      '42eab617-57a2-438e-bbb2-8133ba2b4d62'::uuid,
      '098e8dd0-2ec0-4e42-a0ed-f78a485fad54'::uuid,
      '55aab94c-f5b6-443c-b92e-993d6527609f'::uuid,
      'cfbefc8e-545d-4a71-b945-0f63d3dfa84d'::uuid,
      '534d5b36-934a-433b-9695-a1cd509b009d'::uuid,
      'e6730016-220d-41aa-a267-57bf4cc1ff8b'::uuid,
      '0727d039-5522-4c27-8eb2-4d554e7ef932'::uuid,
      '7419a889-2bca-4bfb-8f67-33648fc8e406'::uuid
    ]
  ) as id
),
target_passes as (
  select
    vp.*,
    case
      when vp.unit_id is null and vp.community_id is null
        then 'missing_creator_and_missing_scope'
      else 'legacy_seed_or_demo_missing_creator'
    end as archive_reason
  from public.visitor_passes vp
  join target_ids t on t.id = vp.id
)
insert into public.datafix_phase41_legacy_visitor_passes_archive (
  cleanup_tag,
  visitor_pass_id,
  archive_reason,
  source_row
)
select
  'phase41_legacy_visitor_pass_archive_20260319',
  tp.id,
  tp.archive_reason,
  to_jsonb(tp) - 'archive_reason'
from target_passes tp
on conflict (cleanup_tag, visitor_pass_id) do nothing;

with target_ids as (
  select unnest(
    array[
      '64a77c2b-15c7-4135-986b-30b85c95babb'::uuid,
      'd75a69b0-c8fe-402f-afd0-dc3d7b80f051'::uuid,
      '66bff9f8-46a7-473c-aff6-2fad18954f2b'::uuid,
      '11904e58-3870-4e38-9cc8-12cbb03918b8'::uuid,
      'e796c571-edd5-42c6-924f-e2edddac74ce'::uuid,
      'b143799d-9f8b-4a18-bf04-9c76b0ad3e88'::uuid,
      '77acb25e-60ef-4ecc-b4c6-aa8c76d4ae95'::uuid,
      '42eab617-57a2-438e-bbb2-8133ba2b4d62'::uuid,
      '098e8dd0-2ec0-4e42-a0ed-f78a485fad54'::uuid,
      '55aab94c-f5b6-443c-b92e-993d6527609f'::uuid,
      'cfbefc8e-545d-4a71-b945-0f63d3dfa84d'::uuid,
      '534d5b36-934a-433b-9695-a1cd509b009d'::uuid,
      'e6730016-220d-41aa-a267-57bf4cc1ff8b'::uuid,
      '0727d039-5522-4c27-8eb2-4d554e7ef932'::uuid,
      '7419a889-2bca-4bfb-8f67-33648fc8e406'::uuid
    ]
  ) as id
),
target_logs as (
  select
    el.*,
    'archived_with_legacy_visitor_pass'::text as archive_reason
  from public.entry_logs el
  join target_ids t on t.id = el.pass_id
)
insert into public.datafix_phase41_legacy_visitor_entry_logs_archive (
  cleanup_tag,
  entry_log_id,
  pass_id,
  archive_reason,
  source_row
)
select
  'phase41_legacy_visitor_pass_archive_20260319',
  tl.id,
  tl.pass_id,
  tl.archive_reason,
  to_jsonb(tl) - 'archive_reason'
from target_logs tl
on conflict (cleanup_tag, entry_log_id) do nothing;

with target_ids as (
  select unnest(
    array[
      '64a77c2b-15c7-4135-986b-30b85c95babb'::uuid,
      'd75a69b0-c8fe-402f-afd0-dc3d7b80f051'::uuid,
      '66bff9f8-46a7-473c-aff6-2fad18954f2b'::uuid,
      '11904e58-3870-4e38-9cc8-12cbb03918b8'::uuid,
      'e796c571-edd5-42c6-924f-e2edddac74ce'::uuid,
      'b143799d-9f8b-4a18-bf04-9c76b0ad3e88'::uuid,
      '77acb25e-60ef-4ecc-b4c6-aa8c76d4ae95'::uuid,
      '42eab617-57a2-438e-bbb2-8133ba2b4d62'::uuid,
      '098e8dd0-2ec0-4e42-a0ed-f78a485fad54'::uuid,
      '55aab94c-f5b6-443c-b92e-993d6527609f'::uuid,
      'cfbefc8e-545d-4a71-b945-0f63d3dfa84d'::uuid,
      '534d5b36-934a-433b-9695-a1cd509b009d'::uuid,
      'e6730016-220d-41aa-a267-57bf4cc1ff8b'::uuid,
      '0727d039-5522-4c27-8eb2-4d554e7ef932'::uuid,
      '7419a889-2bca-4bfb-8f67-33648fc8e406'::uuid
    ]
  ) as id
)
delete from public.entry_logs
where pass_id in (select id from target_ids);

with target_ids as (
  select unnest(
    array[
      '64a77c2b-15c7-4135-986b-30b85c95babb'::uuid,
      'd75a69b0-c8fe-402f-afd0-dc3d7b80f051'::uuid,
      '66bff9f8-46a7-473c-aff6-2fad18954f2b'::uuid,
      '11904e58-3870-4e38-9cc8-12cbb03918b8'::uuid,
      'e796c571-edd5-42c6-924f-e2edddac74ce'::uuid,
      'b143799d-9f8b-4a18-bf04-9c76b0ad3e88'::uuid,
      '77acb25e-60ef-4ecc-b4c6-aa8c76d4ae95'::uuid,
      '42eab617-57a2-438e-bbb2-8133ba2b4d62'::uuid,
      '098e8dd0-2ec0-4e42-a0ed-f78a485fad54'::uuid,
      '55aab94c-f5b6-443c-b92e-993d6527609f'::uuid,
      'cfbefc8e-545d-4a71-b945-0f63d3dfa84d'::uuid,
      '534d5b36-934a-433b-9695-a1cd509b009d'::uuid,
      'e6730016-220d-41aa-a267-57bf4cc1ff8b'::uuid,
      '0727d039-5522-4c27-8eb2-4d554e7ef932'::uuid,
      '7419a889-2bca-4bfb-8f67-33648fc8e406'::uuid
    ]
  ) as id
)
delete from public.visitor_passes
where id in (select id from target_ids);

-- Rollback (manual):
--   insert into public.visitor_passes
--   select restored.*
--   from (
--     select jsonb_populate_record(null::public.visitor_passes, a.source_row) as restored
--     from public.datafix_phase41_legacy_visitor_passes_archive a
--     where a.cleanup_tag = 'phase41_legacy_visitor_pass_archive_20260319'
--   ) as restored
--   on conflict (id) do nothing;
--
--   insert into public.entry_logs
--   select restored.*
--   from (
--     select jsonb_populate_record(null::public.entry_logs, a.source_row) as restored
--     from public.datafix_phase41_legacy_visitor_entry_logs_archive a
--     where a.cleanup_tag = 'phase41_legacy_visitor_pass_archive_20260319'
--   ) as restored
--   on conflict (id) do nothing;
