'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAdminApi } from './useAdminApi';

export type MarketplaceCategoryView = {
  id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  icon_type: string | null;
  background_colors: string | null;
  category_type: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  product_count: number;
};

export type MarketplaceProductView = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  vendor_id: string | null;
  sku: string | null;
  price: number;
  original_price: number | null;
  stock_quantity: number | null;
  country_of_origin: string | null;
  images: string[] | null;
  is_imported: boolean | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  sales_count: number | null;
  rating: number | null;
  review_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  category_name: string | null;
  vendor_name: string | null;
};

export type MarketplaceVendorView = {
  id: string;
  store_name: string;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  rating: number | null;
  review_count: number | null;
  created_at: string | null;
  updated_at: string | null;
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

export type MarketplaceOrderView = {
  id: string;
  order_number: string;
  user_id: string | null;
  vendor_id: string | null;
  status: string | null;
  payment_method: string | null;
  payment_status: string | null;
  total_amount: number;
  final_amount: number;
  created_at: string | null;
  updated_at: string | null;
  vendor_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  item_count: number;
  line_items: MarketplaceOrderLineItemView[];
};

export type MarketplaceReviewView = {
  id: string;
  product_id: string | null;
  user_id: string | null;
  rating: number;
  review_text: string | null;
  is_active: boolean | null;
  is_verified_purchase: boolean | null;
  created_at: string | null;
  updated_at: string | null;
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

type MarketplaceWorkspaceResponse = {
  success: boolean;
  data: {
    categories: MarketplaceCategoryView[];
    products: MarketplaceProductView[];
    vendors: MarketplaceVendorView[];
    orders: MarketplaceOrderView[];
    reviews: MarketplaceReviewView[];
    metrics: MarketplaceMetrics;
  };
};

type MarketplaceMutationResponse<T> = {
  success: boolean;
  data: T;
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

const MARKETPLACE_TABLES = [
  'marketplace_categories',
  'marketplace_products',
  'marketplace_vendors',
  'marketplace_orders',
  'marketplace_order_items',
  'marketplace_reviews',
  'shopping_payments',
] as const;

const MARKETPLACE_WORKSPACE_QUERY_KEY = ['admin-personal-hub-marketplace-workspace'] as const;

export const useMarketplaceWorkspace = () => {
  const { fetchAdmin, hasToken } = useAdminApi();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MARKETPLACE_WORKSPACE_QUERY_KEY,
    enabled: hasToken,
    queryFn: async () =>
      fetchAdmin<MarketplaceWorkspaceResponse>('/admin/personal-hub/marketplace/workspace'),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
    refetchInterval: 60_000,
  });

  const invalidateWorkspace = async () => {
    await queryClient.invalidateQueries({ queryKey: MARKETPLACE_WORKSPACE_QUERY_KEY });
  };

  const createCategoryMutation = useMutation({
    mutationFn: async (payload: CategoryForm) =>
      fetchAdmin<MarketplaceMutationResponse<MarketplaceCategoryView>>(
        '/admin/personal-hub/marketplace/categories',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: invalidateWorkspace,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CategoryForm> }) =>
      fetchAdmin<MarketplaceMutationResponse<MarketplaceCategoryView>>(
        `/admin/personal-hub/marketplace/categories/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: invalidateWorkspace,
  });

  const createProductMutation = useMutation({
    mutationFn: async (payload: ProductForm) =>
      fetchAdmin<MarketplaceMutationResponse<MarketplaceProductView>>(
        '/admin/personal-hub/marketplace/products',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: invalidateWorkspace,
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<ProductForm> }) =>
      fetchAdmin<MarketplaceMutationResponse<MarketplaceProductView>>(
        `/admin/personal-hub/marketplace/products/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: invalidateWorkspace,
  });

  const createVendorMutation = useMutation({
    mutationFn: async (payload: VendorForm) =>
      fetchAdmin<MarketplaceMutationResponse<MarketplaceVendorView>>(
        '/admin/personal-hub/marketplace/vendors',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: invalidateWorkspace,
  });

  const updateVendorMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<VendorForm> }) =>
      fetchAdmin<MarketplaceMutationResponse<MarketplaceVendorView>>(
        `/admin/personal-hub/marketplace/vendors/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      ),
    onSuccess: invalidateWorkspace,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      fetchAdmin<MarketplaceMutationResponse<MarketplaceOrderView>>(
        `/admin/personal-hub/marketplace/orders/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }
      ),
    onSuccess: invalidateWorkspace,
  });

  const updateReviewVisibilityMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetchAdmin<MarketplaceMutationResponse<MarketplaceReviewView>>(
        `/admin/personal-hub/marketplace/reviews/${id}/visibility`,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_active: isActive }),
        }
      ),
    onSuccess: invalidateWorkspace,
  });

  const saving = useMemo(
    () =>
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending ||
      createProductMutation.isPending ||
      updateProductMutation.isPending ||
      createVendorMutation.isPending ||
      updateVendorMutation.isPending ||
      updateOrderStatusMutation.isPending ||
      updateReviewVisibilityMutation.isPending,
    [
      createCategoryMutation.isPending,
      updateCategoryMutation.isPending,
      createProductMutation.isPending,
      updateProductMutation.isPending,
      createVendorMutation.isPending,
      updateVendorMutation.isPending,
      updateOrderStatusMutation.isPending,
      updateReviewVisibilityMutation.isPending,
    ]
  );

  return {
    categories: query.data?.data.categories || [],
    products: query.data?.data.products || [],
    vendors: query.data?.data.vendors || [],
    orders: query.data?.data.orders || [],
    reviews: query.data?.data.reviews || [],
    shoppingPayments: [],
    metrics: query.data?.data.metrics || {
      totalOrders: 0,
      grossMerchandiseValue: 0,
      fulfillmentRate: 0,
      activeVendors: 0,
      growth: {
        orders: 0,
        revenue: 0,
        fulfillmentRate: 0,
      },
    },
    loading: query.isLoading,
    saving,
    error: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
    createCategory: async (payload: CategoryForm) => createCategoryMutation.mutateAsync(payload),
    updateCategory: async (id: string, payload: Partial<CategoryForm>) =>
      updateCategoryMutation.mutateAsync({ id, payload }),
    createProduct: async (payload: ProductForm) => createProductMutation.mutateAsync(payload),
    updateProduct: async (id: string, payload: Partial<ProductForm>) =>
      updateProductMutation.mutateAsync({ id, payload }),
    createVendor: async (payload: VendorForm) => createVendorMutation.mutateAsync(payload),
    updateVendor: async (id: string, payload: Partial<VendorForm>) =>
      updateVendorMutation.mutateAsync({ id, payload }),
    updateOrderStatus: async (id: string, status: string) =>
      updateOrderStatusMutation.mutateAsync({ id, status }),
    updateReviewVisibility: async (id: string, isActive: boolean) =>
      updateReviewVisibilityMutation.mutateAsync({ id, isActive }),
    supportedTables: MARKETPLACE_TABLES,
  };
};
