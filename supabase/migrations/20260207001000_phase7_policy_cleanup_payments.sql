-- Phase 7: Policy smell cleanup (Payments domain)
-- Removes permissive policies and replaces with scoped access.

-- payments: remove overly permissive policies
drop policy if exists "Public read access to payments" on public.payments;
drop policy if exists "authenticated_read_payments" on public.payments;
drop policy if exists "Users can update payments for their unit" on public.payments;
drop policy if exists "user can create payments" on public.payments;

-- payments: add safer user-scoped read (keep existing unit/owner/admin policies)
-- NOTE: Existing policies kept:
--   - Admins can manage payments (community_admins + units join)
--   - Admins can view all payments for their society
--   - Users can view payments for their unit
--   - Users can view their own payments
--   - superadmin_all_payments

-- payment_statements: remove public read
drop policy if exists "Public read access to payment_statements" on public.payment_statements;

-- payment_statements: admin access
drop policy if exists "admin_all_payment_statements" on public.payment_statements;
create policy "admin_all_payment_statements"
  on public.payment_statements
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role IN ('admin','superadmin','agency_manager','facility_manager')
    )
  );

-- payment_statements: unit owner access (complements existing unit-member policy)
drop policy if exists "payment_statements_owner_read" on public.payment_statements;
create policy "payment_statements_owner_read"
  on public.payment_statements
  for select to authenticated
  using (
    EXISTS (
      SELECT 1 FROM units u
      WHERE u.id = payment_statements.unit_id
        AND u.owner_id = auth.uid()
    )
  );

-- payment_settings: replace permissive with explicit superadmin check
drop policy if exists "Super admin access" on public.payment_settings;
create policy "superadmin_all_payment_settings"
  on public.payment_settings
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
        AND p.role = 'superadmin'
    )
  );

-- user_payment_methods: tighten update policy check
drop policy if exists "Users can update their own payment methods" on public.user_payment_methods;
create policy "Users can update their own payment methods"
  on public.user_payment_methods
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
