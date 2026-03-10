-- Phase 36: close remaining baseline-era marketplace + guard internal-table RLS gaps.
--
-- Why:
-- - The old checklist reference to `20260206170000_phase5_rls_internal_tables.sql` now points
--   only to the archived pre-baseline migrations.
-- - Several marketplace tables still rely on baseline-era admin policies and did not have active
--   RLS enablement in the current migration chain.
-- - Several guard operational tables still use broad admin policies or profile-id assumptions that
--   do not align with the scoped admin model and canonical profile resolution helpers.
--
-- Rollback notes:
-- 1) DROP the `p36_*` policies created below and `public.is_platform_admin_role()`.
-- 2) If immediate rollback is required before a replacement migration is prepared:
--    - disable RLS on `marketplace_categories`, `marketplace_products`, `marketplace_vendors`,
--      `marketplace_reviews`, `marketplace_favorites`, `marketplace_search_history`,
--      `guard_performance_metrics`, `guard_performance_reviews`, and `training_programs`
--    - recreate the prior broad admin policies by replaying the archived policy template at:
--      `supabase/migrations/_archive/2026-02-06-pre-baseline/20260206170000_phase5_rls_internal_tables.sql`
--      plus the Phase 7 guard/financial policy definitions where applicable.
-- 3) Re-run the policy verification queries before re-enabling traffic.

begin;

create or replace function public.is_platform_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(public.current_user_role() = any (array['admin', 'superadmin']::text[]), false);
$$;

grant execute on function public.is_platform_admin_role() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Marketplace: enable active RLS and replace broad baseline admin policies.
-- Personal Hub marketplace is platform-level only for admin operators.
-- ---------------------------------------------------------------------------

alter table if exists public.marketplace_categories enable row level security;
drop policy if exists marketplace_admin_read on public.marketplace_categories;
drop policy if exists marketplace_admin_write on public.marketplace_categories;
drop policy if exists p36_marketplace_categories_select_active on public.marketplace_categories;
drop policy if exists p36_marketplace_categories_platform_admin_all on public.marketplace_categories;
create policy p36_marketplace_categories_select_active
  on public.marketplace_categories
  for select
  to authenticated
  using (coalesce(is_active, true));
create policy p36_marketplace_categories_platform_admin_all
  on public.marketplace_categories
  for all
  to authenticated
  using (public.is_platform_admin_role())
  with check (public.is_platform_admin_role());

alter table if exists public.marketplace_products enable row level security;
drop policy if exists marketplace_admin_read on public.marketplace_products;
drop policy if exists marketplace_admin_write on public.marketplace_products;
drop policy if exists p36_marketplace_products_select_active on public.marketplace_products;
drop policy if exists p36_marketplace_products_platform_admin_all on public.marketplace_products;
create policy p36_marketplace_products_select_active
  on public.marketplace_products
  for select
  to authenticated
  using (coalesce(is_active, true));
create policy p36_marketplace_products_platform_admin_all
  on public.marketplace_products
  for all
  to authenticated
  using (public.is_platform_admin_role())
  with check (public.is_platform_admin_role());

alter table if exists public.marketplace_vendors enable row level security;
drop policy if exists marketplace_admin_read on public.marketplace_vendors;
drop policy if exists marketplace_admin_write on public.marketplace_vendors;
drop policy if exists p36_marketplace_vendors_select_active on public.marketplace_vendors;
drop policy if exists p36_marketplace_vendors_platform_admin_all on public.marketplace_vendors;
create policy p36_marketplace_vendors_select_active
  on public.marketplace_vendors
  for select
  to authenticated
  using (coalesce(is_active, true));
create policy p36_marketplace_vendors_platform_admin_all
  on public.marketplace_vendors
  for all
  to authenticated
  using (public.is_platform_admin_role())
  with check (public.is_platform_admin_role());

alter table if exists public.marketplace_reviews enable row level security;
drop policy if exists marketplace_admin_read on public.marketplace_reviews;
drop policy if exists marketplace_admin_write on public.marketplace_reviews;
drop policy if exists marketplace_reviews_public_select on public.marketplace_reviews;
drop policy if exists p36_marketplace_reviews_select_visible on public.marketplace_reviews;
drop policy if exists p36_marketplace_reviews_platform_admin_all on public.marketplace_reviews;
create policy p36_marketplace_reviews_select_visible
  on public.marketplace_reviews
  for select
  to authenticated
  using (
    coalesce(is_active, true)
    or public.matches_current_actor(user_id)
  );
create policy p36_marketplace_reviews_platform_admin_all
  on public.marketplace_reviews
  for all
  to authenticated
  using (public.is_platform_admin_role())
  with check (public.is_platform_admin_role());

alter table if exists public.marketplace_favorites enable row level security;
drop policy if exists marketplace_admin_read on public.marketplace_favorites;
drop policy if exists marketplace_admin_write on public.marketplace_favorites;
drop policy if exists p36_marketplace_favorites_platform_admin_select on public.marketplace_favorites;
create policy p36_marketplace_favorites_platform_admin_select
  on public.marketplace_favorites
  for select
  to authenticated
  using (public.is_platform_admin_role());

alter table if exists public.marketplace_search_history enable row level security;
drop policy if exists marketplace_admin_read on public.marketplace_search_history;
drop policy if exists marketplace_admin_write on public.marketplace_search_history;
drop policy if exists p36_marketplace_search_history_platform_admin_select on public.marketplace_search_history;
create policy p36_marketplace_search_history_platform_admin_select
  on public.marketplace_search_history
  for select
  to authenticated
  using (public.is_platform_admin_role());

alter table if exists public.marketplace_cart_items enable row level security;
drop policy if exists marketplace_admin_read on public.marketplace_cart_items;
drop policy if exists marketplace_admin_write on public.marketplace_cart_items;
drop policy if exists admin_all_marketplace_cart_items on public.marketplace_cart_items;
drop policy if exists p36_marketplace_cart_items_platform_admin_all on public.marketplace_cart_items;
create policy p36_marketplace_cart_items_platform_admin_all
  on public.marketplace_cart_items
  for all
  to authenticated
  using (public.is_platform_admin_role())
  with check (public.is_platform_admin_role());

alter table if exists public.marketplace_orders enable row level security;
drop policy if exists marketplace_admin_read on public.marketplace_orders;
drop policy if exists marketplace_admin_write on public.marketplace_orders;
drop policy if exists admin_all_marketplace_orders on public.marketplace_orders;
drop policy if exists p36_marketplace_orders_platform_admin_all on public.marketplace_orders;
create policy p36_marketplace_orders_platform_admin_all
  on public.marketplace_orders
  for all
  to authenticated
  using (public.is_platform_admin_role())
  with check (public.is_platform_admin_role());

alter table if exists public.marketplace_order_items enable row level security;
drop policy if exists marketplace_admin_read on public.marketplace_order_items;
drop policy if exists marketplace_admin_write on public.marketplace_order_items;
drop policy if exists admin_all_marketplace_order_items on public.marketplace_order_items;
drop policy if exists p36_marketplace_order_items_platform_admin_all on public.marketplace_order_items;
create policy p36_marketplace_order_items_platform_admin_all
  on public.marketplace_order_items
  for all
  to authenticated
  using (public.is_platform_admin_role())
  with check (public.is_platform_admin_role());

-- ---------------------------------------------------------------------------
-- Guard operational tables: scope admin access by community and fix profile-id
-- owner paths for profile-linked records.
-- ---------------------------------------------------------------------------

alter table if exists public.guard_shifts enable row level security;
drop policy if exists "admin_all_guard_shifts" on public.guard_shifts;
drop policy if exists p36_guard_shifts_admin_scoped_select on public.guard_shifts;
drop policy if exists p36_guard_shifts_admin_scoped_insert on public.guard_shifts;
drop policy if exists p36_guard_shifts_admin_scoped_update on public.guard_shifts;
drop policy if exists p36_guard_shifts_admin_scoped_delete on public.guard_shifts;
create policy p36_guard_shifts_admin_scoped_select
  on public.guard_shifts
  for select
  to authenticated
  using (
    public.is_admin_role()
    and public.can_access_community(
      coalesce(
        guard_shifts.community_id,
        (
          select g.community_id
          from public.guards g
          where g.id = guard_shifts.guard_id
          limit 1
        )
      )
    )
  );
create policy p36_guard_shifts_admin_scoped_insert
  on public.guard_shifts
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and public.can_access_community(
      coalesce(
        guard_shifts.community_id,
        (
          select g.community_id
          from public.guards g
          where g.id = guard_shifts.guard_id
          limit 1
        )
      )
    )
  );
create policy p36_guard_shifts_admin_scoped_update
  on public.guard_shifts
  for update
  to authenticated
  using (
    public.is_admin_role()
    and public.can_access_community(
      coalesce(
        guard_shifts.community_id,
        (
          select g.community_id
          from public.guards g
          where g.id = guard_shifts.guard_id
          limit 1
        )
      )
    )
  )
  with check (
    public.is_admin_role()
    and public.can_access_community(
      coalesce(
        guard_shifts.community_id,
        (
          select g.community_id
          from public.guards g
          where g.id = guard_shifts.guard_id
          limit 1
        )
      )
    )
  );
create policy p36_guard_shifts_admin_scoped_delete
  on public.guard_shifts
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and public.can_access_community(
      coalesce(
        guard_shifts.community_id,
        (
          select g.community_id
          from public.guards g
          where g.id = guard_shifts.guard_id
          limit 1
        )
      )
    )
  );

alter table if exists public.guard_certifications enable row level security;
drop policy if exists "admin_all_guard_certifications" on public.guard_certifications;
drop policy if exists "guard_own_guard_certifications" on public.guard_certifications;
drop policy if exists p36_guard_certifications_owner_select on public.guard_certifications;
drop policy if exists p36_guard_certifications_admin_scoped_select on public.guard_certifications;
drop policy if exists p36_guard_certifications_admin_scoped_insert on public.guard_certifications;
drop policy if exists p36_guard_certifications_admin_scoped_update on public.guard_certifications;
drop policy if exists p36_guard_certifications_admin_scoped_delete on public.guard_certifications;
create policy p36_guard_certifications_owner_select
  on public.guard_certifications
  for select
  to authenticated
  using (public.matches_current_actor(guard_id));
create policy p36_guard_certifications_admin_scoped_select
  on public.guard_certifications
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_certifications.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_certifications_admin_scoped_insert
  on public.guard_certifications
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_certifications.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_certifications_admin_scoped_update
  on public.guard_certifications
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_certifications.guard_id
        and public.can_access_community(gp.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_certifications.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_certifications_admin_scoped_delete
  on public.guard_certifications
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_certifications.guard_id
        and public.can_access_community(gp.community_id)
    )
  );

alter table if exists public.training_programs enable row level security;
drop policy if exists p36_training_programs_admin_all on public.training_programs;
create policy p36_training_programs_admin_all
  on public.training_programs
  for all
  to authenticated
  using (public.is_admin_role())
  with check (public.is_admin_role());

alter table if exists public.guard_trainings enable row level security;
drop policy if exists "admin_all_guard_trainings" on public.guard_trainings;
drop policy if exists "guard_own_guard_trainings" on public.guard_trainings;
drop policy if exists p36_guard_trainings_owner_select on public.guard_trainings;
drop policy if exists p36_guard_trainings_admin_scoped_select on public.guard_trainings;
drop policy if exists p36_guard_trainings_admin_scoped_insert on public.guard_trainings;
drop policy if exists p36_guard_trainings_admin_scoped_update on public.guard_trainings;
drop policy if exists p36_guard_trainings_admin_scoped_delete on public.guard_trainings;
create policy p36_guard_trainings_owner_select
  on public.guard_trainings
  for select
  to authenticated
  using (public.matches_current_actor(guard_id));
create policy p36_guard_trainings_admin_scoped_select
  on public.guard_trainings
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_trainings.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_trainings_admin_scoped_insert
  on public.guard_trainings
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_trainings.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_trainings_admin_scoped_update
  on public.guard_trainings
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_trainings.guard_id
        and public.can_access_community(gp.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_trainings.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_trainings_admin_scoped_delete
  on public.guard_trainings
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_trainings.guard_id
        and public.can_access_community(gp.community_id)
    )
  );

alter table if exists public.guard_performance_metrics enable row level security;
drop policy if exists "Admins can manage all guard performance metrics" on public.guard_performance_metrics;
drop policy if exists "Guards can view their own performance metrics" on public.guard_performance_metrics;
drop policy if exists p36_guard_performance_metrics_owner_select on public.guard_performance_metrics;
drop policy if exists p36_guard_performance_metrics_admin_scoped_select on public.guard_performance_metrics;
drop policy if exists p36_guard_performance_metrics_admin_scoped_insert on public.guard_performance_metrics;
drop policy if exists p36_guard_performance_metrics_admin_scoped_update on public.guard_performance_metrics;
create policy p36_guard_performance_metrics_owner_select
  on public.guard_performance_metrics
  for select
  to authenticated
  using (public.matches_current_actor(guard_id));
create policy p36_guard_performance_metrics_admin_scoped_select
  on public.guard_performance_metrics
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_performance_metrics.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_performance_metrics_admin_scoped_insert
  on public.guard_performance_metrics
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_performance_metrics.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_performance_metrics_admin_scoped_update
  on public.guard_performance_metrics
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_performance_metrics.guard_id
        and public.can_access_community(gp.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_performance_metrics.guard_id
        and public.can_access_community(gp.community_id)
    )
  );

alter table if exists public.guard_performance_reviews enable row level security;
drop policy if exists "Admins can manage all guard performance reviews" on public.guard_performance_reviews;
drop policy if exists "Guards can view their own performance reviews" on public.guard_performance_reviews;
drop policy if exists p36_guard_performance_reviews_owner_select on public.guard_performance_reviews;
drop policy if exists p36_guard_performance_reviews_admin_scoped_select on public.guard_performance_reviews;
drop policy if exists p36_guard_performance_reviews_admin_scoped_insert on public.guard_performance_reviews;
drop policy if exists p36_guard_performance_reviews_admin_scoped_update on public.guard_performance_reviews;
drop policy if exists p36_guard_performance_reviews_admin_scoped_delete on public.guard_performance_reviews;
create policy p36_guard_performance_reviews_owner_select
  on public.guard_performance_reviews
  for select
  to authenticated
  using (public.matches_current_actor(guard_id));
create policy p36_guard_performance_reviews_admin_scoped_select
  on public.guard_performance_reviews
  for select
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_performance_reviews.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_performance_reviews_admin_scoped_insert
  on public.guard_performance_reviews
  for insert
  to authenticated
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_performance_reviews.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_performance_reviews_admin_scoped_update
  on public.guard_performance_reviews
  for update
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_performance_reviews.guard_id
        and public.can_access_community(gp.community_id)
    )
  )
  with check (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_performance_reviews.guard_id
        and public.can_access_community(gp.community_id)
    )
  );
create policy p36_guard_performance_reviews_admin_scoped_delete
  on public.guard_performance_reviews
  for delete
  to authenticated
  using (
    public.is_admin_role()
    and exists (
      select 1
      from public.profiles gp
      where gp.id = guard_performance_reviews.guard_id
        and public.can_access_community(gp.community_id)
    )
  );

commit;
