begin;

create table if not exists public.datafix_phase14_personal_hub_user_id_backfill_pass2_backup (
  cleanup_tag text not null,
  backed_up_at timestamptz not null default now(),
  transaction_type text not null,
  transaction_id uuid not null,
  old_user_id uuid,
  derived_user_id uuid not null,
  profile_id uuid,
  payment_ref_id uuid,
  primary key (transaction_type, transaction_id)
);

with candidates as (
  select 'airtime'::text as transaction_type, a.id as transaction_id, a.user_id as old_user_id, a.profile_id, a.payment_ref_id,
         case
           when au_profile_user.id is not null then p.user_id
           when au_profile.id is not null then a.profile_id
           else null
         end as derived_user_id
  from public.airtime_purchases a
  left join public.profiles p on p.id = a.profile_id
  left join auth.users au_profile_user on au_profile_user.id = p.user_id
  left join auth.users au_profile on au_profile.id = a.profile_id
  where a.user_id is null

  union all

  select 'data'::text as transaction_type, d.id as transaction_id, d.user_id as old_user_id, d.profile_id, d.payment_ref_id,
         case
           when au_profile_user.id is not null then p.user_id
           when au_profile.id is not null then d.profile_id
           else null
         end as derived_user_id
  from public.data_purchases d
  left join public.profiles p on p.id = d.profile_id
  left join auth.users au_profile_user on au_profile_user.id = p.user_id
  left join auth.users au_profile on au_profile.id = d.profile_id
  where d.user_id is null

  union all

  select 'money_transfer'::text as transaction_type, m.id as transaction_id, m.user_id as old_user_id, m.profile_id, m.payment_ref_id,
         case
           when au_profile_user.id is not null then p.user_id
           when au_profile.id is not null then m.profile_id
           else null
         end as derived_user_id
  from public.money_transfers m
  left join public.profiles p on p.id = m.profile_id
  left join auth.users au_profile_user on au_profile_user.id = p.user_id
  left join auth.users au_profile on au_profile.id = m.profile_id
  where m.user_id is null

  union all

  select 'bill_payment'::text as transaction_type, b.id as transaction_id, b.user_id as old_user_id, b.profile_id, b.payment_ref_id,
         case
           when au_profile_user.id is not null then p.user_id
           when au_profile.id is not null then b.profile_id
           else null
         end as derived_user_id
  from public.bill_payments b
  left join public.profiles p on p.id = b.profile_id
  left join auth.users au_profile_user on au_profile_user.id = p.user_id
  left join auth.users au_profile on au_profile.id = b.profile_id
  where b.user_id is null

  union all

  select 'insurance'::text as transaction_type, i.id as transaction_id, i.user_id as old_user_id, i.profile_id, i.payment_ref_id,
         case
           when au_profile_user.id is not null then p.user_id
           when au_profile.id is not null then i.profile_id
           else null
         end as derived_user_id
  from public.insurance_payments i
  left join public.profiles p on p.id = i.profile_id
  left join auth.users au_profile_user on au_profile_user.id = p.user_id
  left join auth.users au_profile on au_profile.id = i.profile_id
  where i.user_id is null

  union all

  select 'shopping'::text as transaction_type, s.id as transaction_id, s.user_id as old_user_id, s.profile_id, s.payment_ref_id,
         case
           when au_profile_user.id is not null then p.user_id
           when au_profile.id is not null then s.profile_id
           else null
         end as derived_user_id
  from public.shopping_payments s
  left join public.profiles p on p.id = s.profile_id
  left join auth.users au_profile_user on au_profile_user.id = p.user_id
  left join auth.users au_profile on au_profile.id = s.profile_id
  where s.user_id is null
),
backups as (
  insert into public.datafix_phase14_personal_hub_user_id_backfill_pass2_backup (
    cleanup_tag,
    transaction_type,
    transaction_id,
    old_user_id,
    derived_user_id,
    profile_id,
    payment_ref_id
  )
  select
    'phase14_payments_user_id_cleanup_pass2_20260221',
    c.transaction_type,
    c.transaction_id,
    c.old_user_id,
    c.derived_user_id,
    c.profile_id,
    c.payment_ref_id
  from candidates c
  where c.derived_user_id is not null
  on conflict (transaction_type, transaction_id) do update
    set old_user_id = excluded.old_user_id,
        derived_user_id = excluded.derived_user_id,
        profile_id = excluded.profile_id,
        payment_ref_id = excluded.payment_ref_id,
        cleanup_tag = excluded.cleanup_tag,
        backed_up_at = now()
  returning transaction_type, transaction_id, derived_user_id
),
updated_airtime as (
  update public.airtime_purchases a
  set user_id = b.derived_user_id,
      updated_at = now()
  from backups b
  where b.transaction_type = 'airtime'
    and a.id = b.transaction_id
    and a.user_id is null
  returning a.id
),
updated_data as (
  update public.data_purchases d
  set user_id = b.derived_user_id,
      updated_at = now()
  from backups b
  where b.transaction_type = 'data'
    and d.id = b.transaction_id
    and d.user_id is null
  returning d.id
),
updated_transfer as (
  update public.money_transfers m
  set user_id = b.derived_user_id,
      updated_at = now()
  from backups b
  where b.transaction_type = 'money_transfer'
    and m.id = b.transaction_id
    and m.user_id is null
  returning m.id
),
updated_bill as (
  update public.bill_payments bp
  set user_id = b.derived_user_id,
      updated_at = now()
  from backups b
  where b.transaction_type = 'bill_payment'
    and bp.id = b.transaction_id
    and bp.user_id is null
  returning bp.id
),
updated_insurance as (
  update public.insurance_payments i
  set user_id = b.derived_user_id,
      updated_at = now()
  from backups b
  where b.transaction_type = 'insurance'
    and i.id = b.transaction_id
    and i.user_id is null
  returning i.id
),
updated_shopping as (
  update public.shopping_payments s
  set user_id = b.derived_user_id,
      updated_at = now()
  from backups b
  where b.transaction_type = 'shopping'
    and s.id = b.transaction_id
    and s.user_id is null
  returning s.id
)
select 1;

commit;
