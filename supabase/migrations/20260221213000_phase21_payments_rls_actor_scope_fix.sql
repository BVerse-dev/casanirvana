-- Phase 21: Payments RLS actor/unit scope hardening
-- Replaces legacy payments policies with explicit actor/admin/superadmin scopes.

drop policy if exists "Admins can manage payments" on public.payments;
drop policy if exists "Admins can view all payments for their society" on public.payments;
drop policy if exists "Users can view payments for their unit" on public.payments;
drop policy if exists "Users can view their own payments" on public.payments;
drop policy if exists "superadmin_all_payments" on public.payments;

drop policy if exists "p21_payments_select_actor_or_unit_occupant" on public.payments;
drop policy if exists "p21_payments_insert_actor_unit_scoped" on public.payments;
drop policy if exists "p21_payments_update_actor_pending" on public.payments;
drop policy if exists "p21_payments_select_admin_scoped" on public.payments;
drop policy if exists "p21_payments_manage_admin_scoped" on public.payments;
drop policy if exists "p21_payments_all_superadmin" on public.payments;

create policy "p21_payments_select_actor_or_unit_occupant"
on public.payments
for select
to authenticated
using (
  matches_current_actor(payer_id)
  or is_unit_occupant(unit_id)
);

create policy "p21_payments_insert_actor_unit_scoped"
on public.payments
for insert
to authenticated
with check (
  matches_current_actor(payer_id)
  and is_unit_occupant(unit_id)
);

create policy "p21_payments_update_actor_pending"
on public.payments
for update
to authenticated
using (
  matches_current_actor(payer_id)
  and coalesce(status, '') = 'pending'
)
with check (
  matches_current_actor(payer_id)
);

create policy "p21_payments_select_admin_scoped"
on public.payments
for select
to authenticated
using (
  is_admin_role()
  and can_access_unit(unit_id)
);

create policy "p21_payments_manage_admin_scoped"
on public.payments
for all
to authenticated
using (
  is_admin_role()
  and can_access_unit(unit_id)
)
with check (
  is_admin_role()
  and can_access_unit(unit_id)
);

create policy "p21_payments_all_superadmin"
on public.payments
for all
to authenticated
using (
  is_superadmin_role()
)
with check (
  is_superadmin_role()
);
