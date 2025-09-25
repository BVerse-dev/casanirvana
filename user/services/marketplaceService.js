import { supabase } from "../lib/supabase";

// Categories
export const getCategories = async (filters = {}) => {
  let query = supabase
    .from("marketplace_categories")
    .select("*")
    .eq("is_active", true);

  if (filters.categoryType) {
    query = query.eq("category_type", filters.categoryType);
  }

  query = query.order("display_order");

  const { data, error } = await query;
  return { data, error };
};

// Products
export const getProducts = async (filters = {}) => {
  console.log("MarketplaceService - getProducts called with filters:", filters);
  
  let query = supabase
    .from("marketplace_products")
    .select(`
      *,
      vendor:marketplace_vendors(id, store_name, rating)
    `)
    .eq("is_active", true);

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.vendorId) {
    query = query.eq("vendor_id", filters.vendorId);
  }

  if (filters.minPrice) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  // Country/origin filtering
  if (filters.countryOfOrigin) {
    query = query.eq("country_of_origin", filters.countryOfOrigin);
  }

  if (filters.isImported !== undefined) {
    query = query.eq("is_imported", filters.isImported);
  }

  // Sorting
  switch (filters.sort) {
    case "price_low":
      query = query.order("price", { ascending: true });
      break;
    case "price_high":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "country":
      query = query.order("country_of_origin", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Pagination
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  
  console.log("MarketplaceService - getProducts result:", {
    dataCount: data ? data.length : 0,
    error: error,
    firstProduct: data && data.length > 0 ? data[0].name : null
  });
  
  return { data, error };
};

export const getProductById = async (productId) => {
  const { data, error } = await supabase
    .from("marketplace_products")
    .select(`
      *,
      vendor:marketplace_vendors(*),
      reviews:marketplace_reviews(
        *,
        user:users(id, name)
      )
    `)
    .eq("id", productId)
    .single();

  return { data, error };
};

// Cart
export const getCartItems = async (userId) => {
  const { data, error } = await supabase
    .from("marketplace_cart_items")
    .select(`
      *,
      product:marketplace_products(
        *,
        vendor:marketplace_vendors(id, store_name)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

export const addToCart = async (userId, productId, quantity = 1) => {
  const { data, error } = await supabase
    .from("marketplace_cart_items")
    .upsert({
      user_id: userId,
      product_id: productId,
      quantity,
    }, {
      onConflict: "user_id,product_id",
    })
    .select()
    .single();

  return { data, error };
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const { data, error } = await supabase
    .from("marketplace_cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .select()
    .single();

  return { data, error };
};

export const removeFromCart = async (cartItemId) => {
  const { error } = await supabase
    .from("marketplace_cart_items")
    .delete()
    .eq("id", cartItemId);

  return { error };
};

export const clearCart = async (userId) => {
  const { error } = await supabase
    .from("marketplace_cart_items")
    .delete()
    .eq("user_id", userId);

  return { error };
};

// Orders
export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from("marketplace_orders")
    .insert(orderData)
    .select()
    .single();

  return { data, error };
};

export const getOrders = async (userId, status = null) => {
  let query = supabase
    .from("marketplace_orders")
    .select(`
      *,
      vendor:marketplace_vendors(id, store_name)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status) {
    if (status === "active") {
      query = query.in("status", ["pending", "processing", "shipped", "on_the_way"]);
    } else if (status === "past") {
      query = query.in("status", ["delivered", "cancelled", "refunded"]);
    } else {
      query = query.eq("status", status);
    }
  }

  const { data, error } = await query;
  return { data, error };
};

export const getOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from("marketplace_orders")
    .select(`
      *,
      vendor:marketplace_vendors(*)
    `)
    .eq("id", orderId)
    .single();

  return { data, error };
};

export const updateOrderStatus = async (orderId, status) => {
  const updateData = { status };
  
  if (status === "delivered") {
    updateData.delivered_at = new Date().toISOString();
  } else if (status === "cancelled") {
    updateData.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("marketplace_orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single();

  return { data, error };
};

// Favorites
export const getFavorites = async (userId) => {
  const { data, error } = await supabase
    .from("marketplace_favorites")
    .select(`
      *,
      product:marketplace_products(
        *,
        vendor:marketplace_vendors(id, store_name)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

export const addToFavorites = async (userId, productId) => {
  const { data, error } = await supabase
    .from("marketplace_favorites")
    .insert({
      user_id: userId,
      product_id: productId,
    })
    .select()
    .single();

  return { data, error };
};

export const removeFromFavorites = async (userId, productId) => {
  const { error } = await supabase
    .from("marketplace_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  return { error };
};

export const checkIsFavorite = async (userId, productId) => {
  const { data, error } = await supabase
    .from("marketplace_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  return { isFavorite: !!data, error };
};

// Reviews
export const getProductReviews = async (productId) => {
  const { data, error } = await supabase
    .from("marketplace_reviews")
    .select(`
      *,
      user:users(id, name)
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  return { data, error };
};

export const createReview = async (reviewData) => {
  const { data, error } = await supabase
    .from("marketplace_reviews")
    .insert(reviewData)
    .select()
    .single();

  return { data, error };
};

// Vendors
export const getVendorById = async (vendorId) => {
  const { data, error } = await supabase
    .from("marketplace_vendors")
    .select(`
      *,
      products:marketplace_products(
        *
      )
    `)
    .eq("id", vendorId)
    .single();

  return { data, error };
};

export const followVendor = async (userId, vendorId) => {
  const { data, error } = await supabase
    .from("marketplace_vendor_followers")
    .insert({
      user_id: userId,
      vendor_id: vendorId,
    })
    .select()
    .single();

  if (!error) {
    // Update follower count
    await supabase.rpc("increment", {
      table_name: "marketplace_vendors",
      column_name: "follower_count",
      row_id: vendorId,
    });
  }

  return { data, error };
};

export const unfollowVendor = async (userId, vendorId) => {
  const { error } = await supabase
    .from("marketplace_vendor_followers")
    .delete()
    .eq("user_id", userId)
    .eq("vendor_id", vendorId);

  if (!error) {
    // Update follower count
    await supabase.rpc("decrement", {
      table_name: "marketplace_vendors",
      column_name: "follower_count",
      row_id: vendorId,
    });
  }

  return { error };
};

// Search
export const searchProducts = async (query, filters = {}) => {
  let searchQuery = supabase
    .from("marketplace_products")
    .select(`
      *,
      vendor:marketplace_vendors(id, store_name, rating)
    `)
    .eq("is_active", true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

  // Apply country filters to search
  if (filters.countryOfOrigin) {
    searchQuery = searchQuery.eq("country_of_origin", filters.countryOfOrigin);
  }

  if (filters.isImported !== undefined) {
    searchQuery = searchQuery.eq("is_imported", filters.isImported);
  }

  if (filters.categoryType) {
    // Join with categories to filter by type
    searchQuery = supabase
      .from("marketplace_products")
      .select(`
        *,
        vendor:marketplace_vendors(id, store_name, rating),
        category:marketplace_categories!inner(*)
      `)
      .eq("is_active", true)
      .eq("category.category_type", filters.categoryType)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  }

  searchQuery = searchQuery
    .order("rating", { ascending: false })
    .limit(20);

  const { data, error } = await searchQuery;
  return { data, error };
};

export const saveSearchHistory = async (userId, searchQuery) => {
  const { data, error } = await supabase
    .from("marketplace_search_history")
    .upsert({
      user_id: userId,
      search_query: searchQuery,
      last_searched_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,search_query",
    })
    .select()
    .single();

  return { data, error };
};

export const getSearchHistory = async (userId, limit = 5) => {
  const { data, error } = await supabase
    .from("marketplace_search_history")
    .select("search_query")
    .eq("user_id", userId)
    .order("last_searched_at", { ascending: false })
    .limit(limit);

  return { data: data?.map(item => item.search_query) || [], error };
};
