import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as marketplaceService from "../services/marketplaceService";
import { useAuth } from "../contexts/AuthContext";

// Categories Hook
export const useCategories = (filters = {}) => {
  return useQuery({
    queryKey: ["marketplace-categories", filters],
    queryFn: async () => {
      const { data, error } = await marketplaceService.getCategories(filters);
      if (error) throw error;
      return data;
    },
  });
};

// Products Hooks
export const useProducts = (filters = {}) => {
  console.log("useProducts hook called with filters:", filters);
  
  return useQuery({
    queryKey: ["marketplace-products", JSON.stringify(filters)], // Serialize filters for better caching
    queryFn: async () => {
      console.log("useProducts queryFn executing with filters:", filters);
      const { data, error } = await marketplaceService.getProducts(filters);
      if (error) {
        console.error("useProducts queryFn error:", error);
        throw error;
      }
      console.log("useProducts queryFn success, data count:", data ? data.length : 0);
      return data;
    },
    staleTime: 0, // Always refetch to ensure fresh data
    cacheTime: 0, // Don't cache to avoid stale data issues
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["marketplace-product", productId],
    queryFn: async () => {
      const { data, error } = await marketplaceService.getProductById(productId);
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
};

// Cart Hooks
export const useCart = () => {
  const { profile } = useAuth();
  const userId = profile?.user_id || profile?.id;

  return useQuery({
    queryKey: ["marketplace-cart", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await marketplaceService.getCartItems(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      variantOptions,
    }: {
      productId: string;
      quantity: number;
      variantOptions?: any;
    }) => {
      const userId = profile?.user_id || profile?.id;
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await marketplaceService.addToCart(
        userId,
        productId,
        quantity
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-cart"] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    }) => {
      const { data, error } = await marketplaceService.updateCartItemQuantity(
        cartItemId,
        quantity
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-cart"] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await marketplaceService.removeFromCart(cartItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-cart"] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const userId = profile?.user_id || profile?.id;
      if (!userId) throw new Error("User not authenticated");

      const { error } = await marketplaceService.clearCart(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-cart"] });
    },
  });
};

// Orders Hooks
export const useOrders = (status?: string) => {
  const { profile } = useAuth();
  const userId = profile?.user_id || profile?.id;

  return useQuery({
    queryKey: ["marketplace-orders", userId, status],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await marketplaceService.getOrders(userId, status);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["marketplace-order", orderId],
    queryFn: async () => {
      const { data, error } = await marketplaceService.getOrderById(orderId);
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await marketplaceService.createOrder(orderData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-orders"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace-cart"] });
    },
  });
};

// Favorites Hooks
export const useFavorites = () => {
  const { profile } = useAuth();
  const userId = profile?.user_id || profile?.id;

  return useQuery({
    queryKey: ["marketplace-favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await marketplaceService.getFavorites(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      isFavorite,
    }: {
      productId: string;
      isFavorite: boolean;
    }) => {
      const userId = profile?.user_id || profile?.id;
      if (!userId) throw new Error("User not authenticated");

      if (isFavorite) {
        const { error } = await marketplaceService.removeFromFavorites(
          userId,
          productId
        );
        if (error) throw error;
      } else {
        const { data, error } = await marketplaceService.addToFavorites(
          userId,
          productId
        );
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-favorites"] });
    },
  });
};

export const useIsFavorite = (productId: string) => {
  const { profile } = useAuth();
  const userId = profile?.user_id || profile?.id;

  return useQuery({
    queryKey: ["marketplace-favorite", userId, productId],
    queryFn: async () => {
      if (!userId) return false;
      const { isFavorite, error } = await marketplaceService.checkIsFavorite(
        userId,
        productId
      );
      if (error) return false;
      return isFavorite;
    },
    enabled: !!userId && !!productId,
  });
};

// Reviews Hooks
export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ["marketplace-reviews", productId],
    queryFn: async () => {
      const { data, error } = await marketplaceService.getProductReviews(productId);
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: any) => {
      const { data, error } = await marketplaceService.createReview(reviewData);
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["marketplace-reviews", variables.product_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["marketplace-product", variables.product_id],
      });
    },
  });
};

// Vendor Hooks
export const useVendor = (vendorId: string) => {
  return useQuery({
    queryKey: ["marketplace-vendor", vendorId],
    queryFn: async () => {
      const { data, error } = await marketplaceService.getVendorById(vendorId);
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });
};

export const useToggleFollowVendor = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      vendorId,
      isFollowing,
    }: {
      vendorId: string;
      isFollowing: boolean;
    }) => {
      const userId = profile?.user_id || profile?.id;
      if (!userId) throw new Error("User not authenticated");

      if (isFollowing) {
        const { error } = await marketplaceService.unfollowVendor(userId, vendorId);
        if (error) throw error;
      } else {
        const { data, error } = await marketplaceService.followVendor(
          userId,
          vendorId
        );
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["marketplace-vendor", variables.vendorId],
      });
    },
  });
};

// Search Hooks
export const useSearchProducts = (query: string, filters = {}) => {
  return useQuery({
    queryKey: ["marketplace-search", query, filters],
    queryFn: async () => {
      const { data, error } = await marketplaceService.searchProducts(query, filters);
      if (error) throw error;
      return data;
    },
    enabled: !!query && query.length > 0,
  });
};

export const useSearchHistory = () => {
  const { profile } = useAuth();
  const userId = profile?.user_id || profile?.id;

  return useQuery({
    queryKey: ["marketplace-search-history", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await marketplaceService.getSearchHistory(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useSaveSearchHistory = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (searchQuery: string) => {
      const userId = profile?.user_id || profile?.id;
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await marketplaceService.saveSearchHistory(
        userId,
        searchQuery
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-search-history"] });
    },
  });
};

const mapAddressRowToUi = (row: any) => ({
  id: row.id,
  userId: row.user_id,
  label: row.label || "Address",
  fullName: row.full_name,
  phoneNumber: row.phone_number,
  streetAddress: row.street_address,
  city: row.city,
  region: row.region,
  postalCode: row.postal_code || "",
  additionalInfo: row.additional_info || "",
  isDefault: Boolean(row.is_default),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Delivery Address Hooks
export const useUserAddresses = () => {
  const { profile } = useAuth();
  const userId = profile?.user_id || profile?.id;

  return useQuery({
    queryKey: ["marketplace-user-addresses", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await marketplaceService.getUserAddresses(userId);
      if (error) throw error;
      return (data || []).map(mapAddressRowToUi);
    },
    enabled: !!userId,
  });
};

export const useCreateUserAddress = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (addressData: any) => {
      const userId = profile?.user_id || profile?.id;
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await marketplaceService.createUserAddress(
        userId,
        addressData
      );
      if (error) throw error;
      return mapAddressRowToUi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-user-addresses"] });
    },
  });
};

export const useSetDefaultUserAddress = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const userId = profile?.user_id || profile?.id;
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await marketplaceService.setUserAddressDefault(
        userId,
        addressId
      );
      if (error) throw error;
      return mapAddressRowToUi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-user-addresses"] });
    },
  });
};
