-- Phase 5B: RLS hardening for internal/admin tables + guard self-read + marketplace
-- Admin roles helper (inline):
-- exists (
--   select 1 from profiles p
--   where (p.id = auth.uid() or p.user_id = auth.uid())
--     and p.role in ('superadmin','admin','agency_manager','facility_manager')
-- )

-- 1) Admin-only internal tables
DO $$
DECLARE t text;
DECLARE p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'agency_billing',
    'agency_transactions',
    'agency_configurations',
    'agency_services',
    'agency_documents',
    'application_settings',
    'app_extensions',
    'document_categories',
    'email_notifications',
    'payment_fees',
    'training_programs',
    'translations',
    'equipment_id_mapping',
    'equipment_maintenance',
    'guard_id_mapping',
    'groups',
    'group_messages',
    'airtime_purchases',
    'data_purchases',
    'insurance_payments',
    'shopping_payments',
    'money_transfers'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('alter table public.%I enable row level security;', t);

    FOR p IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('drop policy if exists %I on public.%I;', p.policyname, t);
    END LOOP;

    EXECUTE format($sql$
      create policy "admin_read"
      on public.%I
      for select
      to authenticated
      using (
        exists (
          select 1 from profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and p.role in ('superadmin','admin','agency_manager','facility_manager')
        )
      );
    $sql$, t);

    EXECUTE format($sql$
      create policy "admin_write"
      on public.%I
      for all
      to authenticated
      using (
        exists (
          select 1 from profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and p.role in ('superadmin','admin','agency_manager','facility_manager')
        )
      )
      with check (
        exists (
          select 1 from profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and p.role in ('superadmin','admin','agency_manager','facility_manager')
        )
      );
    $sql$, t);

    EXECUTE format($sql$
      create policy "service_role_all"
      on public.%I
      for all
      to service_role
      using (true)
      with check (true);
    $sql$, t);
  END LOOP;
END $$;

-- 2) Guard self-read tables (admins manage all)
DO $$
DECLARE t text;
DECLARE p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'equipment_assignments',
    'guard_certifications',
    'guard_performance',
    'guard_schedules',
    'guard_shifts',
    'guard_training',
    'guard_trainings'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('alter table public.%I enable row level security;', t);

    FOR p IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('drop policy if exists %I on public.%I;', p.policyname, t);
    END LOOP;

    EXECUTE format($sql$
      create policy "guard_self_read"
      on public.%I
      for select
      to authenticated
      using (guard_id = auth.uid());
    $sql$, t);

    EXECUTE format($sql$
      create policy "admin_read"
      on public.%I
      for select
      to authenticated
      using (
        exists (
          select 1 from profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and p.role in ('superadmin','admin','agency_manager','facility_manager')
        )
      );
    $sql$, t);

    EXECUTE format($sql$
      create policy "admin_write"
      on public.%I
      for all
      to authenticated
      using (
        exists (
          select 1 from profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and p.role in ('superadmin','admin','agency_manager','facility_manager')
        )
      )
      with check (
        exists (
          select 1 from profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and p.role in ('superadmin','admin','agency_manager','facility_manager')
        )
      );
    $sql$, t);

    EXECUTE format($sql$
      create policy "service_role_all"
      on public.%I
      for all
      to service_role
      using (true)
      with check (true);
    $sql$, t);
  END LOOP;
END $$;

-- guard_equipment uses assigned_to
DO $$
DECLARE p record;
BEGIN
  IF to_regclass('public.guard_equipment') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE 'alter table public.guard_equipment enable row level security;';

  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'guard_equipment'
  LOOP
    EXECUTE format('drop policy if exists %I on public.guard_equipment;', p.policyname);
  END LOOP;

  EXECUTE $sql$
    create policy "guard_self_read"
    on public.guard_equipment
    for select
    to authenticated
    using (assigned_to = auth.uid());
  $sql$;

  EXECUTE $sql$
    create policy "admin_read"
    on public.guard_equipment
    for select
    to authenticated
    using (
      exists (
        select 1 from profiles p
        where (p.id = auth.uid() or p.user_id = auth.uid())
          and p.role in ('superadmin','admin','agency_manager','facility_manager')
      )
    );
  $sql$;

  EXECUTE $sql$
    create policy "admin_write"
    on public.guard_equipment
    for all
    to authenticated
    using (
      exists (
        select 1 from profiles p
        where (p.id = auth.uid() or p.user_id = auth.uid())
          and p.role in ('superadmin','admin','agency_manager','facility_manager')
      )
    )
    with check (
      exists (
        select 1 from profiles p
        where (p.id = auth.uid() or p.user_id = auth.uid())
          and p.role in ('superadmin','admin','agency_manager','facility_manager')
      )
    );
  $sql$;

  EXECUTE $sql$
    create policy "service_role_all"
    on public.guard_equipment
    for all
    to service_role
    using (true)
    with check (true);
  $sql$;
END $$;

-- 3) Marketplace tables (public read where appropriate; user-owned; admin manage all)
DO $$
DECLARE t text;
DECLARE p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'marketplace_categories',
    'marketplace_products',
    'marketplace_vendors',
    'marketplace_orders',
    'marketplace_order_items',
    'marketplace_cart_items',
    'marketplace_reviews',
    'marketplace_favorites',
    'marketplace_vendor_followers',
    'marketplace_search_history',
    'marketplace_promotions'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('alter table public.%I enable row level security;', t);

    FOR p IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('drop policy if exists %I on public.%I;', p.policyname, t);
    END LOOP;
  END LOOP;
END $$;

-- Marketplace: public read + user-owned (guard for missing tables)
DO $$
BEGIN
  IF to_regclass('public.marketplace_categories') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_categories_public_read" on public.marketplace_categories;';
    EXECUTE 'create policy "marketplace_categories_public_read" on public.marketplace_categories for select using (true);';
  END IF;

  IF to_regclass('public.marketplace_products') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_products_public_read" on public.marketplace_products;';
    EXECUTE 'create policy "marketplace_products_public_read" on public.marketplace_products for select using (is_active = true);';
  END IF;

  IF to_regclass('public.marketplace_vendors') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_vendors_public_read" on public.marketplace_vendors;';
    EXECUTE 'create policy "marketplace_vendors_public_read" on public.marketplace_vendors for select using (is_active = true);';
  END IF;

  IF to_regclass('public.marketplace_cart_items') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_cart_items_owner_select" on public.marketplace_cart_items;';
    EXECUTE 'drop policy if exists "marketplace_cart_items_owner_insert" on public.marketplace_cart_items;';
    EXECUTE 'drop policy if exists "marketplace_cart_items_owner_update" on public.marketplace_cart_items;';
    EXECUTE 'drop policy if exists "marketplace_cart_items_owner_delete" on public.marketplace_cart_items;';
    EXECUTE 'create policy "marketplace_cart_items_owner_select" on public.marketplace_cart_items for select using (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_cart_items_owner_insert" on public.marketplace_cart_items for insert with check (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_cart_items_owner_update" on public.marketplace_cart_items for update using (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_cart_items_owner_delete" on public.marketplace_cart_items for delete using (auth.uid() = user_id);';
  END IF;

  IF to_regclass('public.marketplace_orders') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_orders_owner_select" on public.marketplace_orders;';
    EXECUTE 'drop policy if exists "marketplace_orders_owner_insert" on public.marketplace_orders;';
    EXECUTE 'create policy "marketplace_orders_owner_select" on public.marketplace_orders for select using (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_orders_owner_insert" on public.marketplace_orders for insert with check (auth.uid() = user_id);';
  END IF;

  IF to_regclass('public.marketplace_order_items') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_order_items_owner_select" on public.marketplace_order_items;';
    EXECUTE 'drop policy if exists "marketplace_order_items_owner_insert" on public.marketplace_order_items;';
    EXECUTE $sql$
      create policy "marketplace_order_items_owner_select"
      on public.marketplace_order_items for select
      using (
        exists (
          select 1
          from public.marketplace_orders o
          where o.id = public.marketplace_order_items.order_id
            and o.user_id = auth.uid()
        )
      );
    $sql$;
    EXECUTE $sql$
      create policy "marketplace_order_items_owner_insert"
      on public.marketplace_order_items for insert
      with check (
        exists (
          select 1
          from public.marketplace_orders o
          where o.id = public.marketplace_order_items.order_id
            and o.user_id = auth.uid()
        )
      );
    $sql$;
  END IF;
END $$;

-- Marketplace: reviews, favorites, vendor follows, search history
DO $$
BEGIN
  IF to_regclass('public.marketplace_reviews') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_reviews_public_select" on public.marketplace_reviews;';
    EXECUTE 'drop policy if exists "marketplace_reviews_owner_insert" on public.marketplace_reviews;';
    EXECUTE 'drop policy if exists "marketplace_reviews_owner_update" on public.marketplace_reviews;';

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'marketplace_reviews'
        AND column_name = 'status'
    ) THEN
      EXECUTE $sql$
        create policy "marketplace_reviews_public_select"
        on public.marketplace_reviews for select
        using (
          (status = 'approved')
          OR (auth.uid() = user_id)
          OR exists (
            select 1 from profiles p
            where (p.id = auth.uid() or p.user_id = auth.uid())
              and p.role in ('superadmin','admin','agency_manager','facility_manager')
          )
        );
      $sql$;
    ELSE
      EXECUTE $sql$
        create policy "marketplace_reviews_public_select"
        on public.marketplace_reviews for select
        using (
          (auth.uid() = user_id)
          OR exists (
            select 1 from profiles p
            where (p.id = auth.uid() or p.user_id = auth.uid())
              and p.role in ('superadmin','admin','agency_manager','facility_manager')
          )
        );
      $sql$;
    END IF;

    EXECUTE 'create policy "marketplace_reviews_owner_insert" on public.marketplace_reviews for insert with check (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_reviews_owner_update" on public.marketplace_reviews for update using (auth.uid() = user_id);';
  END IF;

  IF to_regclass('public.marketplace_favorites') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_favorites_owner_select" on public.marketplace_favorites;';
    EXECUTE 'drop policy if exists "marketplace_favorites_owner_insert" on public.marketplace_favorites;';
    EXECUTE 'drop policy if exists "marketplace_favorites_owner_delete" on public.marketplace_favorites;';
    EXECUTE 'create policy "marketplace_favorites_owner_select" on public.marketplace_favorites for select using (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_favorites_owner_insert" on public.marketplace_favorites for insert with check (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_favorites_owner_delete" on public.marketplace_favorites for delete using (auth.uid() = user_id);';
  END IF;

  IF to_regclass('public.marketplace_vendor_followers') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_vendor_followers_owner_select" on public.marketplace_vendor_followers;';
    EXECUTE 'drop policy if exists "marketplace_vendor_followers_owner_insert" on public.marketplace_vendor_followers;';
    EXECUTE 'drop policy if exists "marketplace_vendor_followers_owner_delete" on public.marketplace_vendor_followers;';
    EXECUTE 'create policy "marketplace_vendor_followers_owner_select" on public.marketplace_vendor_followers for select using (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_vendor_followers_owner_insert" on public.marketplace_vendor_followers for insert with check (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_vendor_followers_owner_delete" on public.marketplace_vendor_followers for delete using (auth.uid() = user_id);';
  END IF;

  IF to_regclass('public.marketplace_search_history') IS NOT NULL THEN
    EXECUTE 'drop policy if exists "marketplace_search_history_owner_select" on public.marketplace_search_history;';
    EXECUTE 'drop policy if exists "marketplace_search_history_owner_insert" on public.marketplace_search_history;';
    EXECUTE 'drop policy if exists "marketplace_search_history_owner_delete" on public.marketplace_search_history;';
    EXECUTE 'create policy "marketplace_search_history_owner_select" on public.marketplace_search_history for select using (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_search_history_owner_insert" on public.marketplace_search_history for insert with check (auth.uid() = user_id);';
    EXECUTE 'create policy "marketplace_search_history_owner_delete" on public.marketplace_search_history for delete using (auth.uid() = user_id);';
  END IF;
END $$;

-- Marketplace: admin manage all
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'marketplace_categories',
    'marketplace_products',
    'marketplace_vendors',
    'marketplace_orders',
    'marketplace_order_items',
    'marketplace_cart_items',
    'marketplace_reviews',
    'marketplace_favorites',
    'marketplace_vendor_followers',
    'marketplace_search_history',
    'marketplace_promotions'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format($sql$
      create policy "marketplace_admin_read"
      on public.%I
      for select
      to authenticated
      using (
        exists (
          select 1 from profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and p.role in ('superadmin','admin','agency_manager','facility_manager')
        )
      );
    $sql$, t);

    EXECUTE format($sql$
      create policy "marketplace_admin_write"
      on public.%I
      for all
      to authenticated
      using (
        exists (
          select 1 from profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and p.role in ('superadmin','admin','agency_manager','facility_manager')
        )
      )
      with check (
        exists (
          select 1 from profiles p
          where (p.id = auth.uid() or p.user_id = auth.uid())
            and p.role in ('superadmin','admin','agency_manager','facility_manager')
        )
      );
    $sql$, t);
  END LOOP;
END $$;

-- Marketplace: service role bypass
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'marketplace_categories',
    'marketplace_products',
    'marketplace_vendors',
    'marketplace_orders',
    'marketplace_order_items',
    'marketplace_cart_items',
    'marketplace_reviews',
    'marketplace_favorites',
    'marketplace_vendor_followers',
    'marketplace_search_history',
    'marketplace_promotions'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format($sql$
      create policy "service_role_all"
      on public.%I
      for all
      to service_role
      using (true)
      with check (true);
    $sql$, t);
  END LOOP;
END $$;
