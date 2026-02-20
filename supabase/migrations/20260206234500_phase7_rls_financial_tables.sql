-- Phase 7: RLS remediation (financial tables)
-- Enables RLS and applies scoped policies for admin + owners.

-- Admin check expression:
-- EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin')))

-- agency_billing (admin only)
alter table public.agency_billing enable row level security;
drop policy if exists "admin_all_agency_billing" on public.agency_billing;
create policy "admin_all_agency_billing"
  on public.agency_billing
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));

-- agency_transactions (admin only)
alter table public.agency_transactions enable row level security;
drop policy if exists "admin_all_agency_transactions" on public.agency_transactions;
create policy "admin_all_agency_transactions"
  on public.agency_transactions
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));

-- airtime_purchases (owner + admin)
alter table public.airtime_purchases enable row level security;
drop policy if exists "admin_all_airtime_purchases" on public.airtime_purchases;
create policy "admin_all_airtime_purchases"
  on public.airtime_purchases
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));
drop policy if exists "owner_airtime_purchases" on public.airtime_purchases;
create policy "owner_airtime_purchases"
  on public.airtime_purchases
  for all to authenticated
  using (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = airtime_purchases.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  )
  with check (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = airtime_purchases.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  );

-- data_purchases (owner + admin)
alter table public.data_purchases enable row level security;
drop policy if exists "admin_all_data_purchases" on public.data_purchases;
create policy "admin_all_data_purchases"
  on public.data_purchases
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));
drop policy if exists "owner_data_purchases" on public.data_purchases;
create policy "owner_data_purchases"
  on public.data_purchases
  for all to authenticated
  using (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = data_purchases.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  )
  with check (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = data_purchases.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  );

-- insurance_payments (owner + admin)
alter table public.insurance_payments enable row level security;
drop policy if exists "admin_all_insurance_payments" on public.insurance_payments;
create policy "admin_all_insurance_payments"
  on public.insurance_payments
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));
drop policy if exists "owner_insurance_payments" on public.insurance_payments;
create policy "owner_insurance_payments"
  on public.insurance_payments
  for all to authenticated
  using (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = insurance_payments.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  )
  with check (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = insurance_payments.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  );

-- money_transfers (owner + admin)
alter table public.money_transfers enable row level security;
drop policy if exists "admin_all_money_transfers" on public.money_transfers;
create policy "admin_all_money_transfers"
  on public.money_transfers
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));
drop policy if exists "owner_money_transfers" on public.money_transfers;
create policy "owner_money_transfers"
  on public.money_transfers
  for all to authenticated
  using (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = money_transfers.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  )
  with check (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = money_transfers.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  );

-- shopping_payments (owner + admin)
alter table public.shopping_payments enable row level security;
drop policy if exists "admin_all_shopping_payments" on public.shopping_payments;
create policy "admin_all_shopping_payments"
  on public.shopping_payments
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));
drop policy if exists "owner_shopping_payments" on public.shopping_payments;
create policy "owner_shopping_payments"
  on public.shopping_payments
  for all to authenticated
  using (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = shopping_payments.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  )
  with check (
    (user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = shopping_payments.profile_id
        AND ((p.id = auth.uid()) OR (p.user_id = auth.uid()))
    )
  );

-- marketplace_cart_items (owner + admin)
alter table public.marketplace_cart_items enable row level security;
drop policy if exists "admin_all_marketplace_cart_items" on public.marketplace_cart_items;
create policy "admin_all_marketplace_cart_items"
  on public.marketplace_cart_items
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));
drop policy if exists "owner_marketplace_cart_items" on public.marketplace_cart_items;
create policy "owner_marketplace_cart_items"
  on public.marketplace_cart_items
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- marketplace_orders (owner + admin)
alter table public.marketplace_orders enable row level security;
drop policy if exists "admin_all_marketplace_orders" on public.marketplace_orders;
create policy "admin_all_marketplace_orders"
  on public.marketplace_orders
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));
drop policy if exists "owner_marketplace_orders" on public.marketplace_orders;
create policy "owner_marketplace_orders"
  on public.marketplace_orders
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- marketplace_order_items (owner via orders + admin)
alter table public.marketplace_order_items enable row level security;
drop policy if exists "admin_all_marketplace_order_items" on public.marketplace_order_items;
create policy "admin_all_marketplace_order_items"
  on public.marketplace_order_items
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));
drop policy if exists "owner_marketplace_order_items" on public.marketplace_order_items;
create policy "owner_marketplace_order_items"
  on public.marketplace_order_items
  for all to authenticated
  using (
    EXISTS (
      SELECT 1 FROM marketplace_orders o
      WHERE o.id = marketplace_order_items.order_id
        AND o.user_id = auth.uid()
    )
  )
  with check (
    EXISTS (
      SELECT 1 FROM marketplace_orders o
      WHERE o.id = marketplace_order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- payment_fees (admin only)
alter table public.payment_fees enable row level security;
drop policy if exists "admin_all_payment_fees" on public.payment_fees;
create policy "admin_all_payment_fees"
  on public.payment_fees
  for all to authenticated
  using (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))))
  with check (EXISTS (SELECT 1 FROM profiles p WHERE ((p.id = auth.uid()) OR (p.user_id = auth.uid())) AND (p.role IN ('admin','superadmin'))));
