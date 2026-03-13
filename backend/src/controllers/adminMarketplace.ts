import type { NextFunction, Request, Response } from 'express';

import { createHttpError } from '../lib/httpError';
import { adminSupabase } from '../lib/supabase';
import { resolveAdminScope } from '../services/adminScope';

type MarketplaceCategoryRow = {
  id: string;
  name: string;
  description?: string | null;
  icon_name?: string | null;
  icon_type?: string | null;
  background_colors?: string | null;
  category_type?: string | null;
  display_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type MarketplaceProductRow = {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  vendor_id?: string | null;
  sku?: string | null;
  price: number;
  original_price?: number | null;
  stock_quantity?: number | null;
  country_of_origin?: string | null;
  images?: string[] | null;
  is_imported?: boolean | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  sales_count?: number | null;
  rating?: number | null;
  review_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type MarketplaceVendorRow = {
  id: string;
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
  rating?: number | null;
  review_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type MarketplaceOrderItemRow = {
  id: string;
  quantity: number;
  total_price: number;
  unit_price: number;
  marketplace_products?: {
    name?: string | null;
    images?: string[] | null;
  } | null;
};

type MarketplaceOrderRow = {
  id: string;
  order_number: string;
  vendor_id?: string | null;
  user_id?: string | null;
  status?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  total_amount?: number | null;
  final_amount?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  marketplace_vendors?: {
    store_name?: string | null;
  } | null;
  marketplace_order_items?: MarketplaceOrderItemRow[] | null;
};

type MarketplaceReviewRow = {
  id: string;
  product_id?: string | null;
  user_id?: string | null;
  rating: number;
  review_text?: string | null;
  is_active?: boolean | null;
  is_verified_purchase?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  marketplace_products?: {
    name?: string | null;
    images?: string[] | null;
  } | null;
};

type ProfileRow = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type MarketplaceCategoryView = MarketplaceCategoryRow & {
  product_count: number;
};

type MarketplaceProductView = MarketplaceProductRow & {
  category_name: string | null;
  vendor_name: string | null;
};

type MarketplaceVendorView = MarketplaceVendorRow & {
  product_count: number;
  gross_merchandise_value: number;
};

type MarketplaceOrderLineItemView = {
  id: string;
  quantity: number;
  total_price: number;
  unit_price: number;
  product_name: string | null;
  product_images: string[];
};

type MarketplaceOrderView = MarketplaceOrderRow & {
  vendor_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  item_count: number;
  line_items: MarketplaceOrderLineItemView[];
};

type MarketplaceReviewView = MarketplaceReviewRow & {
  product_name: string | null;
  product_image: string | null;
  customer_name: string | null;
  customer_email: string | null;
};

type MarketplaceMetrics = {
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

const TERMINAL_ORDER_STATUSES = new Set(['delivered', 'cancelled', 'refunded', 'returned']);
const SUCCESS_ORDER_STATUSES = new Set(['delivered']);
const MARKETPLACE_ORDER_STATUSES = new Set([
  'pending',
  'processing',
  'shipped',
  'on_the_way',
  'delivered',
  'cancelled',
  'refunded',
]);

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

const normalizeNullableString = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry): entry is string => entry.length > 0);

  return normalized.length > 0 ? normalized : null;
};

const normalizeOrderStatus = (value: unknown) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!MARKETPLACE_ORDER_STATUSES.has(normalized)) {
    throw createHttpError(400, 'MARKETPLACE_ORDER_STATUS_INVALID', 'Invalid marketplace order status');
  }

  return normalized;
};

const normalizeCategoryPayload = (payload: Record<string, unknown>) => ({
  name: typeof payload.name === 'string' ? payload.name.trim() : '',
  description: normalizeNullableString(payload.description),
  icon_name: normalizeNullableString(payload.icon_name),
  icon_type: normalizeNullableString(payload.icon_name) ? 'Ionicons' : null,
  background_colors: normalizeNullableString(payload.background_colors),
  category_type: normalizeNullableString(payload.category_type) ?? 'local',
  display_order: typeof payload.display_order === 'number' ? payload.display_order : 0,
  is_active: typeof payload.is_active === 'boolean' ? payload.is_active : true,
});

const normalizeCategoryUpdatePayload = (payload: Record<string, unknown>) => {
  const updates: Partial<MarketplaceCategoryRow> = {};

  if (payload.name !== undefined) updates.name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (payload.description !== undefined) updates.description = normalizeNullableString(payload.description);
  if (payload.icon_name !== undefined) {
    updates.icon_name = normalizeNullableString(payload.icon_name);
    updates.icon_type = updates.icon_name ? 'Ionicons' : null;
  }
  if (payload.background_colors !== undefined) updates.background_colors = normalizeNullableString(payload.background_colors);
  if (payload.category_type !== undefined) updates.category_type = normalizeNullableString(payload.category_type);
  if (payload.display_order !== undefined) updates.display_order = typeof payload.display_order === 'number' ? payload.display_order : 0;
  if (payload.is_active !== undefined) updates.is_active = Boolean(payload.is_active);

  return updates;
};

const normalizeProductPayload = (payload: Record<string, unknown>) => ({
  name: typeof payload.name === 'string' ? payload.name.trim() : '',
  description: normalizeNullableString(payload.description),
  category_id: normalizeNullableString(payload.category_id),
  vendor_id: normalizeNullableString(payload.vendor_id),
  sku: normalizeNullableString(payload.sku),
  price: coerceNumber(payload.price),
  original_price:
    payload.original_price === undefined || payload.original_price === null
      ? null
      : coerceNumber(payload.original_price),
  stock_quantity:
    payload.stock_quantity === undefined || payload.stock_quantity === null
      ? null
      : coerceNumber(payload.stock_quantity),
  country_of_origin: normalizeNullableString(payload.country_of_origin),
  images: normalizeStringArray(payload.images),
  is_imported: typeof payload.is_imported === 'boolean' ? payload.is_imported : false,
  is_featured: typeof payload.is_featured === 'boolean' ? payload.is_featured : false,
  is_active: typeof payload.is_active === 'boolean' ? payload.is_active : true,
});

const normalizeProductUpdatePayload = (payload: Record<string, unknown>) => {
  const updates: Partial<MarketplaceProductRow> = {};

  if (payload.name !== undefined) updates.name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (payload.description !== undefined) updates.description = normalizeNullableString(payload.description);
  if (payload.category_id !== undefined) updates.category_id = normalizeNullableString(payload.category_id);
  if (payload.vendor_id !== undefined) updates.vendor_id = normalizeNullableString(payload.vendor_id);
  if (payload.sku !== undefined) updates.sku = normalizeNullableString(payload.sku);
  if (payload.price !== undefined) updates.price = coerceNumber(payload.price);
  if (payload.original_price !== undefined) updates.original_price = payload.original_price === null ? null : coerceNumber(payload.original_price);
  if (payload.stock_quantity !== undefined) updates.stock_quantity = payload.stock_quantity === null ? null : coerceNumber(payload.stock_quantity);
  if (payload.country_of_origin !== undefined) updates.country_of_origin = normalizeNullableString(payload.country_of_origin);
  if (payload.images !== undefined) updates.images = normalizeStringArray(payload.images);
  if (payload.is_imported !== undefined) updates.is_imported = Boolean(payload.is_imported);
  if (payload.is_featured !== undefined) updates.is_featured = Boolean(payload.is_featured);
  if (payload.is_active !== undefined) updates.is_active = Boolean(payload.is_active);

  return updates;
};

const normalizeVendorPayload = (payload: Record<string, unknown>) => ({
  store_name: typeof payload.store_name === 'string' ? payload.store_name.trim() : '',
  owner_name: normalizeNullableString(payload.owner_name),
  email: normalizeNullableString(payload.email),
  phone: normalizeNullableString(payload.phone),
  address: normalizeNullableString(payload.address),
  description: normalizeNullableString(payload.description),
  logo_url: normalizeNullableString(payload.logo_url),
  banner_url: normalizeNullableString(payload.banner_url),
  is_active: typeof payload.is_active === 'boolean' ? payload.is_active : true,
  is_verified: typeof payload.is_verified === 'boolean' ? payload.is_verified : false,
});

const normalizeVendorUpdatePayload = (payload: Record<string, unknown>) => {
  const updates: Partial<MarketplaceVendorRow> = {};

  if (payload.store_name !== undefined) updates.store_name = typeof payload.store_name === 'string' ? payload.store_name.trim() : '';
  if (payload.owner_name !== undefined) updates.owner_name = normalizeNullableString(payload.owner_name);
  if (payload.email !== undefined) updates.email = normalizeNullableString(payload.email);
  if (payload.phone !== undefined) updates.phone = normalizeNullableString(payload.phone);
  if (payload.address !== undefined) updates.address = normalizeNullableString(payload.address);
  if (payload.description !== undefined) updates.description = normalizeNullableString(payload.description);
  if (payload.logo_url !== undefined) updates.logo_url = normalizeNullableString(payload.logo_url);
  if (payload.banner_url !== undefined) updates.banner_url = normalizeNullableString(payload.banner_url);
  if (payload.is_active !== undefined) updates.is_active = Boolean(payload.is_active);
  if (payload.is_verified !== undefined) updates.is_verified = Boolean(payload.is_verified);

  return updates;
};

const ensureGlobalMarketplaceScope = async (req: Request) => {
  const scope = await resolveAdminScope(req);

  if (!scope.isGlobal) {
    throw createHttpError(
      403,
      'MARKETPLACE_WORKSPACE_FORBIDDEN',
      'Marketplace admin workspace is available to platform admins only.'
    );
  }

  return scope;
};

const normaliseLineItems = (items: MarketplaceOrderRow['marketplace_order_items']): MarketplaceOrderLineItemView[] =>
  (items || []).map((item) => ({
    id: item.id,
    quantity: item.quantity,
    total_price: coerceNumber(item.total_price),
    unit_price: coerceNumber(item.unit_price),
    product_name: item.marketplace_products?.name || null,
    product_images: item.marketplace_products?.images || [],
  }));

async function loadMarketplaceProfiles(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const { data, error } = await adminSupabase
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds);

  if (error) {
    throw createHttpError(500, 'MARKETPLACE_PROFILES_LOAD_FAILED', 'Failed to load marketplace customer profiles', error);
  }

  return new Map((data || []).map((profile) => [profile.id, profile as ProfileRow]));
}

async function loadMarketplaceWorkspaceData() {
  const [
    categoriesResponse,
    productsResponse,
    vendorsResponse,
    ordersResponse,
    reviewsResponse,
  ] = await Promise.all([
    adminSupabase
      .from('marketplace_categories')
      .select('*')
      .order('display_order', { ascending: true }),
    adminSupabase
      .from('marketplace_products')
      .select('*, marketplace_categories(name), marketplace_vendors(store_name)')
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('marketplace_vendors')
      .select('*')
      .order('store_name', { ascending: true }),
    adminSupabase
      .from('marketplace_orders')
      .select('*, marketplace_vendors(store_name), marketplace_order_items(id, quantity, total_price, unit_price, marketplace_products(name, images))')
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('marketplace_reviews')
      .select('*, marketplace_products(name, images)')
      .order('created_at', { ascending: false }),
  ]);

  if (categoriesResponse.error) {
    throw createHttpError(500, 'MARKETPLACE_CATEGORIES_LOAD_FAILED', 'Failed to load marketplace categories', categoriesResponse.error);
  }

  if (productsResponse.error) {
    throw createHttpError(500, 'MARKETPLACE_PRODUCTS_LOAD_FAILED', 'Failed to load marketplace products', productsResponse.error);
  }

  if (vendorsResponse.error) {
    throw createHttpError(500, 'MARKETPLACE_VENDORS_LOAD_FAILED', 'Failed to load marketplace vendors', vendorsResponse.error);
  }

  if (ordersResponse.error) {
    throw createHttpError(500, 'MARKETPLACE_ORDERS_LOAD_FAILED', 'Failed to load marketplace orders', ordersResponse.error);
  }

  if (reviewsResponse.error) {
    throw createHttpError(500, 'MARKETPLACE_REVIEWS_LOAD_FAILED', 'Failed to load marketplace reviews', reviewsResponse.error);
  }

  const categories = (categoriesResponse.data || []) as MarketplaceCategoryRow[];
  const products = (productsResponse.data || []) as Array<
    MarketplaceProductRow & {
      marketplace_categories?: { name?: string | null } | null;
      marketplace_vendors?: { store_name?: string | null } | null;
    }
  >;
  const vendors = (vendorsResponse.data || []) as MarketplaceVendorRow[];
  const orders = (ordersResponse.data || []) as MarketplaceOrderRow[];
  const reviews = (reviewsResponse.data || []) as MarketplaceReviewRow[];

  const userIds = Array.from(
    new Set([
      ...orders.map((order) => order.user_id).filter((value): value is string => typeof value === 'string' && value.length > 0),
      ...reviews.map((review) => review.user_id).filter((value): value is string => typeof value === 'string' && value.length > 0),
    ])
  );

  const profilesById = await loadMarketplaceProfiles(userIds);
  const productCountByCategory = new Map<string, number>();
  const productCountByVendor = new Map<string, number>();
  const grossValueByVendor = new Map<string, number>();

  products.forEach((product) => {
    if (product.category_id) {
      productCountByCategory.set(product.category_id, (productCountByCategory.get(product.category_id) || 0) + 1);
    }

    if (product.vendor_id) {
      productCountByVendor.set(product.vendor_id, (productCountByVendor.get(product.vendor_id) || 0) + 1);
    }
  });

  orders.forEach((order) => {
    if (order.vendor_id) {
      grossValueByVendor.set(
        order.vendor_id,
        (grossValueByVendor.get(order.vendor_id) || 0) + coerceNumber(order.final_amount ?? order.total_amount)
      );
    }
  });

  const mappedCategories: MarketplaceCategoryView[] = categories.map((category) => ({
    ...category,
    product_count: productCountByCategory.get(category.id) || 0,
  }));

  const mappedProducts: MarketplaceProductView[] = products.map((product) => ({
    ...product,
    category_name: product.marketplace_categories?.name || null,
    vendor_name: product.marketplace_vendors?.store_name || null,
  }));

  const mappedVendors: MarketplaceVendorView[] = vendors.map((vendor) => ({
    ...vendor,
    product_count: productCountByVendor.get(vendor.id) || 0,
    gross_merchandise_value: grossValueByVendor.get(vendor.id) || 0,
  }));

  const mappedOrders: MarketplaceOrderView[] = orders.map((order) => {
    const profile = order.user_id ? profilesById.get(order.user_id) : undefined;
    const lineItems = normaliseLineItems(order.marketplace_order_items);

    return {
      ...order,
      vendor_name: order.marketplace_vendors?.store_name || null,
      customer_name: profile?.name || null,
      customer_email: profile?.email || null,
      item_count: lineItems.reduce((sum, item) => sum + item.quantity, 0),
      line_items: lineItems,
    };
  });

  const mappedReviews: MarketplaceReviewView[] = reviews.map((review) => {
    const profile = review.user_id ? profilesById.get(review.user_id) : undefined;

    return {
      ...review,
      product_name: review.marketplace_products?.name || null,
      product_image: review.marketplace_products?.images?.[0] || null,
      customer_name: profile?.name || null,
      customer_email: profile?.email || null,
    };
  });

  const totalOrders = mappedOrders.length;
  const grossMerchandiseValue = mappedOrders.reduce(
    (sum, order) => sum + coerceNumber(order.final_amount ?? order.total_amount),
    0
  );
  const terminalOrders = mappedOrders.filter((order) => TERMINAL_ORDER_STATUSES.has(order.status || ''));
  const fulfilledOrders = mappedOrders.filter((order) => SUCCESS_ORDER_STATUSES.has(order.status || ''));
  const fulfillmentRate =
    terminalOrders.length === 0
      ? 0
      : Number(((fulfilledOrders.length / terminalOrders.length) * 100).toFixed(1));
  const activeVendors = mappedVendors.filter((vendor) => vendor.is_active).length;

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const currentWindowStart = now - thirtyDays;
  const previousWindowStart = now - (thirtyDays * 2);

  const currentOrders = mappedOrders.filter((order) => {
    const createdAt = order.created_at ? new Date(order.created_at).getTime() : 0;
    return createdAt >= currentWindowStart;
  });

  const previousOrders = mappedOrders.filter((order) => {
    const createdAt = order.created_at ? new Date(order.created_at).getTime() : 0;
    return createdAt >= previousWindowStart && createdAt < currentWindowStart;
  });

  const currentRevenue = currentOrders.reduce(
    (sum, order) => sum + coerceNumber(order.final_amount ?? order.total_amount),
    0
  );
  const previousRevenue = previousOrders.reduce(
    (sum, order) => sum + coerceNumber(order.final_amount ?? order.total_amount),
    0
  );

  const currentTerminal = currentOrders.filter((order) => TERMINAL_ORDER_STATUSES.has(order.status || ''));
  const previousTerminal = previousOrders.filter((order) => TERMINAL_ORDER_STATUSES.has(order.status || ''));
  const currentSuccessRate =
    currentTerminal.length === 0
      ? 0
      : (currentOrders.filter((order) => SUCCESS_ORDER_STATUSES.has(order.status || '')).length / currentTerminal.length) * 100;
  const previousSuccessRate =
    previousTerminal.length === 0
      ? 0
      : (previousOrders.filter((order) => SUCCESS_ORDER_STATUSES.has(order.status || '')).length / previousTerminal.length) * 100;

  const metrics: MarketplaceMetrics = {
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

  return {
    categories: mappedCategories,
    products: mappedProducts,
    vendors: mappedVendors,
    orders: mappedOrders,
    reviews: mappedReviews,
    metrics,
  };
}

export async function getMarketplaceWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureGlobalMarketplaceScope(req);
    const workspace = await loadMarketplaceWorkspaceData();

    res.json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
}

export async function createMarketplaceCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureGlobalMarketplaceScope(req);

    const payload = normalizeCategoryPayload(req.body || {});
    const { data, error } = await adminSupabase
      .from('marketplace_categories')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(500, 'MARKETPLACE_CATEGORY_CREATE_FAILED', 'Failed to create marketplace category', error);
    }

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMarketplaceCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureGlobalMarketplaceScope(req);

    const { data, error } = await adminSupabase
      .from('marketplace_categories')
      .update(normalizeCategoryUpdatePayload(req.body || {}))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw createHttpError(500, 'MARKETPLACE_CATEGORY_UPDATE_FAILED', 'Failed to update marketplace category', error);
    }

    if (!data) {
      throw createHttpError(404, 'MARKETPLACE_CATEGORY_NOT_FOUND', 'Marketplace category not found');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createMarketplaceProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureGlobalMarketplaceScope(req);

    const payload = normalizeProductPayload(req.body || {});
    const { data, error } = await adminSupabase
      .from('marketplace_products')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(500, 'MARKETPLACE_PRODUCT_CREATE_FAILED', 'Failed to create marketplace product', error);
    }

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMarketplaceProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureGlobalMarketplaceScope(req);

    const { data, error } = await adminSupabase
      .from('marketplace_products')
      .update(normalizeProductUpdatePayload(req.body || {}))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw createHttpError(500, 'MARKETPLACE_PRODUCT_UPDATE_FAILED', 'Failed to update marketplace product', error);
    }

    if (!data) {
      throw createHttpError(404, 'MARKETPLACE_PRODUCT_NOT_FOUND', 'Marketplace product not found');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createMarketplaceVendor(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureGlobalMarketplaceScope(req);

    const payload = normalizeVendorPayload(req.body || {});
    const { data, error } = await adminSupabase
      .from('marketplace_vendors')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw createHttpError(500, 'MARKETPLACE_VENDOR_CREATE_FAILED', 'Failed to create marketplace vendor', error);
    }

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMarketplaceVendor(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureGlobalMarketplaceScope(req);

    const { data, error } = await adminSupabase
      .from('marketplace_vendors')
      .update(normalizeVendorUpdatePayload(req.body || {}))
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw createHttpError(500, 'MARKETPLACE_VENDOR_UPDATE_FAILED', 'Failed to update marketplace vendor', error);
    }

    if (!data) {
      throw createHttpError(404, 'MARKETPLACE_VENDOR_NOT_FOUND', 'Marketplace vendor not found');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMarketplaceOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureGlobalMarketplaceScope(req);

    const { data, error } = await adminSupabase
      .from('marketplace_orders')
      .update({ status: normalizeOrderStatus(req.body?.status) })
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw createHttpError(500, 'MARKETPLACE_ORDER_UPDATE_FAILED', 'Failed to update marketplace order status', error);
    }

    if (!data) {
      throw createHttpError(404, 'MARKETPLACE_ORDER_NOT_FOUND', 'Marketplace order not found');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMarketplaceReviewVisibility(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureGlobalMarketplaceScope(req);

    const { data, error } = await adminSupabase
      .from('marketplace_reviews')
      .update({ is_active: Boolean(req.body?.is_active) })
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw createHttpError(500, 'MARKETPLACE_REVIEW_UPDATE_FAILED', 'Failed to update marketplace review visibility', error);
    }

    if (!data) {
      throw createHttpError(404, 'MARKETPLACE_REVIEW_NOT_FOUND', 'Marketplace review not found');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
