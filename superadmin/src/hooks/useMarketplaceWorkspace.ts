'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSupabase } from './useSupabase';
import type { Database } from '@/lib/database.types';

type MarketplaceCategory = Database['public']['Tables']['marketplace_categories']['Row'];
type MarketplaceProduct = Database['public']['Tables']['marketplace_products']['Row'];
type MarketplaceVendor = Database['public']['Tables']['marketplace_vendors']['Row'];
type MarketplaceOrder = Database['public']['Tables']['marketplace_orders']['Row'];
type MarketplaceReview = Database['public']['Tables']['marketplace_reviews']['Row'];
type ShoppingPayment = Database['public']['Tables']['shopping_payments']['Row'];
type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'name' | 'email'>;

export type MarketplaceCategoryView = MarketplaceCategory & {
  product_count: number;
};

export type MarketplaceProductView = MarketplaceProduct & {
  category_name: string | null;
  vendor_name: string | null;
};

export type MarketplaceVendorView = MarketplaceVendor & {
  product_count: number;
  gross_merchandise_value: number;
};

export type MarketplaceOrderLineItemView = {
  id: string;
  quantity: number;
  total_price: number;
  unit_price: number;
  product_name: string | null;
  product_images: string[];
};

export type MarketplaceOrderView = MarketplaceOrder & {
  vendor_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  item_count: number;
  line_items: MarketplaceOrderLineItemView[];
};

export type MarketplaceReviewView = MarketplaceReview & {
  product_name: string | null;
  product_image: string | null;
  customer_name: string | null;
  customer_email: string | null;
};

export type MarketplaceMetrics = {
  totalOrders: number;
  grossMerchandiseValue: number;
  fulfillmentRate: number;
  activeVendors: number;
  growth: {
    orders: number;
    revenue: number;
    fulfillmentRate: number;
  };
};

type CategoryForm = {
  name: string;
  description?: string | null;
  icon_name?: string | null;
  background_colors?: string | null;
  category_type?: string | null;
  display_order?: number | null;
  is_active?: boolean | null;
};

type ProductForm = {
  name: string;
  description?: string | null;
  category_id?: string | null;
  vendor_id?: string | null;
  sku?: string | null;
  price: number;
  original_price?: number | null;
  stock_quantity?: number | null;
  country_of_origin?: string | null;
  is_imported?: boolean | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  images?: string[] | null;
};

type VendorForm = {
  store_name: string;
  owner_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  is_active?: boolean | null;
  is_verified?: boolean | null;
};

type ProductsQueryRow = MarketplaceProduct & {
  marketplace_categories: { name: string | null } | null;
  marketplace_vendors: { store_name: string | null } | null;
};

type OrdersQueryRow = MarketplaceOrder & {
  marketplace_vendors: { store_name: string | null } | null;
  marketplace_order_items: Array<{
    id: string;
    quantity: number;
    total_price: number;
    unit_price: number;
    marketplace_products: {
      name: string | null;
      images: string[] | null;
    } | null;
  }> | null;
};

type ReviewsQueryRow = MarketplaceReview & {
  marketplace_products: {
    name: string | null;
    images: string[] | null;
  } | null;
};

const TERMINAL_ORDER_STATUSES = new Set(['delivered', 'cancelled', 'refunded', 'returned']);
const SUCCESS_ORDER_STATUSES = new Set(['delivered']);
const MARKETPLACE_TABLES = [
  'marketplace_categories',
  'marketplace_products',
  'marketplace_vendors',
  'marketplace_orders',
  'marketplace_order_items',
  'marketplace_reviews',
  'shopping_payments',
];

const coerceNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const calculateGrowth = (currentValue: number, previousValue: number) => {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }
  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
};

const normaliseLineItems = (items: OrdersQueryRow['marketplace_order_items']): MarketplaceOrderLineItemView[] => (
  (items || []).map((item) => ({
    id: item.id,
    quantity: item.quantity,
    total_price: coerceNumber(item.total_price),
    unit_price: coerceNumber(item.unit_price),
    product_name: item.marketplace_products?.name || null,
    product_images: item.marketplace_products?.images || [],
  }))
);

export const useMarketplaceWorkspace = () => {
  const supabase = useSupabase();
  const [categories, setCategories] = useState<MarketplaceCategoryView[]>([]);
  const [products, setProducts] = useState<MarketplaceProductView[]>([]);
  const [vendors, setVendors] = useState<MarketplaceVendorView[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrderView[]>([]);
  const [reviews, setReviews] = useState<MarketplaceReviewView[]>([]);
  const [shoppingPayments, setShoppingPayments] = useState<ShoppingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        categoriesResponse,
        productsResponse,
        vendorsResponse,
        ordersResponse,
        reviewsResponse,
        paymentsResponse,
      ] = await Promise.all([
        supabase
          .from('marketplace_categories')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('marketplace_products')
          .select('*, marketplace_categories(name), marketplace_vendors(store_name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('marketplace_vendors')
          .select('*')
          .order('store_name', { ascending: true }),
        supabase
          .from('marketplace_orders')
          .select('*, marketplace_vendors(store_name), marketplace_order_items(id, quantity, total_price, unit_price, marketplace_products(name, images))')
          .order('created_at', { ascending: false }),
        supabase
          .from('marketplace_reviews')
          .select('*, marketplace_products(name, images)')
          .order('created_at', { ascending: false }),
        supabase
          .from('shopping_payments')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      const firstError = [
        categoriesResponse.error,
        productsResponse.error,
        vendorsResponse.error,
        ordersResponse.error,
        reviewsResponse.error,
        paymentsResponse.error,
      ].find(Boolean);

      if (firstError) {
        throw firstError;
      }

      const categoryRows = (categoriesResponse.data || []) as MarketplaceCategory[];
      const productRows = (productsResponse.data || []) as ProductsQueryRow[];
      const vendorRows = (vendorsResponse.data || []) as MarketplaceVendor[];
      const orderRows = (ordersResponse.data || []) as OrdersQueryRow[];
      const reviewRows = (reviewsResponse.data || []) as ReviewsQueryRow[];
      const paymentRows = (paymentsResponse.data || []) as ShoppingPayment[];

      const userIds = Array.from(new Set([
        ...orderRows.map((order) => order.user_id).filter(Boolean),
        ...reviewRows.map((review) => review.user_id).filter(Boolean),
      ])) as string[];

      let profilesById = new Map<string, Profile>();
      if (userIds.length > 0) {
        const profilesResponse = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);

        if (!profilesResponse.error) {
          profilesById = new Map((profilesResponse.data || []).map((profile) => [profile.id, profile as Profile]));
        }
      }

      const productCountByCategory = new Map<string, number>();
      const productCountByVendor = new Map<string, number>();
      const grossValueByVendor = new Map<string, number>();

      productRows.forEach((product) => {
        if (product.category_id) {
          productCountByCategory.set(product.category_id, (productCountByCategory.get(product.category_id) || 0) + 1);
        }
        if (product.vendor_id) {
          productCountByVendor.set(product.vendor_id, (productCountByVendor.get(product.vendor_id) || 0) + 1);
        }
      });

      orderRows.forEach((order) => {
        if (order.vendor_id) {
          grossValueByVendor.set(order.vendor_id, (grossValueByVendor.get(order.vendor_id) || 0) + coerceNumber(order.final_amount || order.total_amount));
        }
      });

      const mappedCategories = categoryRows.map((category) => ({
        ...category,
        product_count: productCountByCategory.get(category.id) || 0,
      }));

      const mappedProducts = productRows.map((product) => ({
        ...product,
        category_name: product.marketplace_categories?.name || null,
        vendor_name: product.marketplace_vendors?.store_name || null,
      }));

      const mappedVendors = vendorRows.map((vendor) => ({
        ...vendor,
        product_count: productCountByVendor.get(vendor.id) || 0,
        gross_merchandise_value: grossValueByVendor.get(vendor.id) || 0,
      }));

      const mappedOrders = orderRows.map((order) => {
        const profile = order.user_id ? profilesById.get(order.user_id) : undefined;
        const lineItems = normaliseLineItems(order.marketplace_order_items);
        return {
          ...order,
          vendor_name: order.marketplace_vendors?.store_name || null,
          customer_name: profile?.name || null,
          customer_email: profile?.email || null,
          item_count: lineItems.reduce((sum, item) => sum + item.quantity, 0),
          line_items: lineItems,
        } satisfies MarketplaceOrderView;
      });

      const mappedReviews = reviewRows.map((review) => {
        const profile = review.user_id ? profilesById.get(review.user_id) : undefined;
        return {
          ...review,
          product_name: review.marketplace_products?.name || null,
          product_image: review.marketplace_products?.images?.[0] || null,
          customer_name: profile?.name || null,
          customer_email: profile?.email || null,
        } satisfies MarketplaceReviewView;
      });

      setCategories(mappedCategories);
      setProducts(mappedProducts);
      setVendors(mappedVendors);
      setOrders(mappedOrders);
      setReviews(mappedReviews);
      setShoppingPayments(paymentRows);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Failed to load marketplace workspace';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchWorkspace();

    const channel = supabase
      .channel('admin-marketplace-workspace')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_categories' }, () => {
        void fetchWorkspace();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_products' }, () => {
        void fetchWorkspace();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_vendors' }, () => {
        void fetchWorkspace();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_orders' }, () => {
        void fetchWorkspace();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_order_items' }, () => {
        void fetchWorkspace();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_reviews' }, () => {
        void fetchWorkspace();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_payments' }, () => {
        void fetchWorkspace();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchWorkspace, supabase]);

  const metrics = useMemo<MarketplaceMetrics>(() => {
    const totalOrders = orders.length;
    const grossMerchandiseValue = orders.reduce((sum, order) => sum + coerceNumber(order.final_amount || order.total_amount), 0);
    const terminalOrders = orders.filter((order) => TERMINAL_ORDER_STATUSES.has(order.status || ''));
    const fulfilledOrders = orders.filter((order) => SUCCESS_ORDER_STATUSES.has(order.status || ''));
    const fulfillmentRate = terminalOrders.length === 0 ? 0 : Number(((fulfilledOrders.length / terminalOrders.length) * 100).toFixed(1));
    const activeVendors = vendors.filter((vendor) => vendor.is_active).length;

    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const currentWindowStart = now - thirtyDays;
    const previousWindowStart = now - (thirtyDays * 2);

    const currentOrders = orders.filter((order) => {
      const createdAt = order.created_at ? new Date(order.created_at).getTime() : 0;
      return createdAt >= currentWindowStart;
    });
    const previousOrders = orders.filter((order) => {
      const createdAt = order.created_at ? new Date(order.created_at).getTime() : 0;
      return createdAt >= previousWindowStart && createdAt < currentWindowStart;
    });

    const currentRevenue = currentOrders.reduce((sum, order) => sum + coerceNumber(order.final_amount || order.total_amount), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + coerceNumber(order.final_amount || order.total_amount), 0);

    const currentTerminal = currentOrders.filter((order) => TERMINAL_ORDER_STATUSES.has(order.status || ''));
    const previousTerminal = previousOrders.filter((order) => TERMINAL_ORDER_STATUSES.has(order.status || ''));
    const currentSuccessRate = currentTerminal.length === 0
      ? 0
      : (currentOrders.filter((order) => SUCCESS_ORDER_STATUSES.has(order.status || '')).length / currentTerminal.length) * 100;
    const previousSuccessRate = previousTerminal.length === 0
      ? 0
      : (previousOrders.filter((order) => SUCCESS_ORDER_STATUSES.has(order.status || '')).length / previousTerminal.length) * 100;

    return {
      totalOrders,
      grossMerchandiseValue,
      fulfillmentRate,
      activeVendors,
      growth: {
        orders: calculateGrowth(currentOrders.length, previousOrders.length),
        revenue: calculateGrowth(currentRevenue, previousRevenue),
        fulfillmentRate: calculateGrowth(currentSuccessRate, previousSuccessRate),
      },
    };
  }, [orders, vendors]);

  const runMutation = useCallback(async (mutator: () => Promise<void>) => {
    setSaving(true);
    try {
      await mutator();
      await fetchWorkspace();
    } finally {
      setSaving(false);
    }
  }, [fetchWorkspace]);

  const createCategory = useCallback(async (payload: CategoryForm) => {
    await runMutation(async () => {
      const { error: mutationError } = await supabase.from('marketplace_categories').insert({
        name: payload.name,
        description: payload.description || null,
        icon_name: payload.icon_name || null,
        icon_type: payload.icon_name ? 'Ionicons' : null,
        background_colors: payload.background_colors || null,
        category_type: payload.category_type || 'local',
        display_order: payload.display_order ?? 0,
        is_active: payload.is_active ?? true,
      });
      if (mutationError) {
        throw mutationError;
      }
    });
  }, [runMutation, supabase]);

  const updateCategory = useCallback(async (id: string, payload: Partial<CategoryForm>) => {
    await runMutation(async () => {
      const updates: Partial<MarketplaceCategory> = {};
      if (payload.name !== undefined) updates.name = payload.name;
      if (payload.description !== undefined) updates.description = payload.description;
      if (payload.icon_name !== undefined) {
        updates.icon_name = payload.icon_name;
        updates.icon_type = payload.icon_name ? 'Ionicons' : null;
      }
      if (payload.background_colors !== undefined) updates.background_colors = payload.background_colors;
      if (payload.category_type !== undefined) updates.category_type = payload.category_type;
      if (payload.display_order !== undefined) updates.display_order = payload.display_order;
      if (payload.is_active !== undefined) updates.is_active = payload.is_active;

      const { error: mutationError } = await supabase
        .from('marketplace_categories')
        .update(updates)
        .eq('id', id);
      if (mutationError) {
        throw mutationError;
      }
    });
  }, [runMutation, supabase]);

  const createProduct = useCallback(async (payload: ProductForm) => {
    await runMutation(async () => {
      const { error: mutationError } = await supabase.from('marketplace_products').insert({
        name: payload.name,
        description: payload.description || null,
        category_id: payload.category_id || null,
        vendor_id: payload.vendor_id || null,
        sku: payload.sku || null,
        price: payload.price,
        original_price: payload.original_price || null,
        stock_quantity: payload.stock_quantity ?? 0,
        country_of_origin: payload.country_of_origin || null,
        is_imported: payload.is_imported ?? false,
        is_featured: payload.is_featured ?? false,
        is_active: payload.is_active ?? true,
        images: payload.images || null,
      });
      if (mutationError) {
        throw mutationError;
      }
    });
  }, [runMutation, supabase]);

  const updateProduct = useCallback(async (id: string, payload: Partial<ProductForm>) => {
    await runMutation(async () => {
      const updates: Partial<MarketplaceProduct> = {};
      if (payload.name !== undefined) updates.name = payload.name;
      if (payload.description !== undefined) updates.description = payload.description;
      if (payload.category_id !== undefined) updates.category_id = payload.category_id;
      if (payload.vendor_id !== undefined) updates.vendor_id = payload.vendor_id;
      if (payload.sku !== undefined) updates.sku = payload.sku;
      if (payload.price !== undefined) updates.price = payload.price;
      if (payload.original_price !== undefined) updates.original_price = payload.original_price;
      if (payload.stock_quantity !== undefined) updates.stock_quantity = payload.stock_quantity;
      if (payload.country_of_origin !== undefined) updates.country_of_origin = payload.country_of_origin;
      if (payload.is_imported !== undefined) updates.is_imported = payload.is_imported;
      if (payload.is_featured !== undefined) updates.is_featured = payload.is_featured;
      if (payload.is_active !== undefined) updates.is_active = payload.is_active;
      if (payload.images !== undefined) updates.images = payload.images;

      const { error: mutationError } = await supabase
        .from('marketplace_products')
        .update(updates)
        .eq('id', id);
      if (mutationError) {
        throw mutationError;
      }
    });
  }, [runMutation, supabase]);

  const createVendor = useCallback(async (payload: VendorForm) => {
    await runMutation(async () => {
      const { error: mutationError } = await supabase.from('marketplace_vendors').insert({
        store_name: payload.store_name,
        owner_name: payload.owner_name || null,
        email: payload.email || null,
        phone: payload.phone || null,
        address: payload.address || null,
        description: payload.description || null,
        logo_url: payload.logo_url || null,
        banner_url: payload.banner_url || null,
        is_active: payload.is_active ?? true,
        is_verified: payload.is_verified ?? false,
      });
      if (mutationError) {
        throw mutationError;
      }
    });
  }, [runMutation, supabase]);

  const updateVendor = useCallback(async (id: string, payload: Partial<VendorForm>) => {
    await runMutation(async () => {
      const updates: Partial<MarketplaceVendor> = {};
      if (payload.store_name !== undefined) updates.store_name = payload.store_name;
      if (payload.owner_name !== undefined) updates.owner_name = payload.owner_name;
      if (payload.email !== undefined) updates.email = payload.email;
      if (payload.phone !== undefined) updates.phone = payload.phone;
      if (payload.address !== undefined) updates.address = payload.address;
      if (payload.description !== undefined) updates.description = payload.description;
      if (payload.logo_url !== undefined) updates.logo_url = payload.logo_url;
      if (payload.banner_url !== undefined) updates.banner_url = payload.banner_url;
      if (payload.is_active !== undefined) updates.is_active = payload.is_active;
      if (payload.is_verified !== undefined) updates.is_verified = payload.is_verified;

      const { error: mutationError } = await supabase
        .from('marketplace_vendors')
        .update(updates)
        .eq('id', id);
      if (mutationError) {
        throw mutationError;
      }
    });
  }, [runMutation, supabase]);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    await runMutation(async () => {
      const { error: mutationError } = await supabase
        .from('marketplace_orders')
        .update({ status })
        .eq('id', id);
      if (mutationError) {
        throw mutationError;
      }
    });
  }, [runMutation, supabase]);

  const updateReviewVisibility = useCallback(async (id: string, isActive: boolean) => {
    await runMutation(async () => {
      const { error: mutationError } = await supabase
        .from('marketplace_reviews')
        .update({ is_active: isActive })
        .eq('id', id);
      if (mutationError) {
        throw mutationError;
      }
    });
  }, [runMutation, supabase]);

  return {
    categories,
    products,
    vendors,
    orders,
    reviews,
    shoppingPayments,
    metrics,
    loading,
    saving,
    error,
    refresh: fetchWorkspace,
    createCategory,
    updateCategory,
    createProduct,
    updateProduct,
    createVendor,
    updateVendor,
    updateOrderStatus,
    updateReviewVisibility,
    supportedTables: MARKETPLACE_TABLES,
  };
};
