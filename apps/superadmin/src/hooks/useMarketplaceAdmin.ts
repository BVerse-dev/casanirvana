'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import { MarketplaceCategory, MarketplaceProduct, MarketplaceVendor, MarketplaceOrder } from '@/types/database'

export const useMarketplaceAdmin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  // Categories Management
  const useCategories = () => {
    const [categories, setCategories] = useState<MarketplaceCategory[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const { data, error } = await supabase
          .from('marketplace_categories')
          .select('*')
          .order('display_order', { ascending: true })

        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      } finally {
        setCategoriesLoading(false)
      }
    }

    const createCategory = async (category: Omit<MarketplaceCategory, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('marketplace_categories')
          .insert([category])
          .select()

        if (error) throw error
        
        if (data && data.length > 0) {
          setCategories(prev => [...prev, data[0]])
          return data[0]
        }
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to create category')
      }
    }

    const updateCategory = async (id: string, updates: Partial<MarketplaceCategory>) => {
      try {
        const { data, error } = await supabase
          .from('marketplace_categories')
          .update(updates)
          .eq('id', id)
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          setCategories(prev => prev.map(c => c.id === id ? data[0] : c))
          return data[0]
        }
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to update category')
      }
    }

    const deleteCategory = async (id: string) => {
      try {
        const { error } = await supabase
          .from('marketplace_categories')
          .delete()
          .eq('id', id)

        if (error) throw error
        setCategories(prev => prev.filter(c => c.id !== id))
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to delete category')
      }
    }

    useEffect(() => {
      fetchCategories()
    }, [])

    return {
      categories,
      loading: categoriesLoading,
      createCategory,
      updateCategory,
      deleteCategory,
      refetch: fetchCategories
    }
  }

  // Products Management
  const useProducts = (filters?: { categoryId?: string; vendorId?: string; isActive?: boolean }) => {
    const [products, setProducts] = useState<MarketplaceProduct[]>([])
    const [productsLoading, setProductsLoading] = useState(true)

    const fetchProducts = async () => {
      try {
        setProductsLoading(true)
        let query = supabase
          .from('marketplace_products')
          .select(`
            *,
            marketplace_categories (name),
            marketplace_vendors (store_name)
          `)
          .order('created_at', { ascending: false })

        if (filters?.categoryId) {
          query = query.eq('category_id', filters.categoryId)
        }

        if (filters?.vendorId) {
          query = query.eq('vendor_id', filters.vendorId)
        }

        if (filters?.isActive !== undefined) {
          query = query.eq('is_active', filters.isActive)
        }

        const { data, error } = await query

        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setProductsLoading(false)
      }
    }

    const createProduct = async (product: Omit<MarketplaceProduct, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('marketplace_products')
          .insert([product])
          .select()

        if (error) throw error
        
        if (data && data.length > 0) {
          setProducts(prev => [data[0], ...prev])
          return data[0]
        }
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to create product')
      }
    }

    const updateProduct = async (id: string, updates: Partial<MarketplaceProduct>) => {
      try {
        const { data, error } = await supabase
          .from('marketplace_products')
          .update(updates)
          .eq('id', id)
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          setProducts(prev => prev.map(p => p.id === id ? data[0] : p))
          return data[0]
        }
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to update product')
      }
    }

    const deleteProduct = async (id: string) => {
      try {
        const { error } = await supabase
          .from('marketplace_products')
          .delete()
          .eq('id', id)

        if (error) throw error
        setProducts(prev => prev.filter(p => p.id !== id))
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to delete product')
      }
    }

    useEffect(() => {
      fetchProducts()
    }, [filters])

    return {
      products,
      loading: productsLoading,
      createProduct,
      updateProduct,
      deleteProduct,
      refetch: fetchProducts
    }
  }

  // Vendors Management
  const useVendors = (isActive?: boolean) => {
    const [vendors, setVendors] = useState<MarketplaceVendor[]>([])
    const [vendorsLoading, setVendorsLoading] = useState(true)

    const fetchVendors = async () => {
      try {
        setVendorsLoading(true)
        let query = supabase
          .from('marketplace_vendors')
          .select('*')
          .order('store_name')

        if (isActive !== undefined) {
          query = query.eq('is_active', isActive)
        }

        const { data, error } = await query

        if (error) throw error
        setVendors(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendors')
      } finally {
        setVendorsLoading(false)
      }
    }

    const createVendor = async (vendor: Omit<MarketplaceVendor, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error } = await supabase
          .from('marketplace_vendors')
          .insert([vendor])
          .select()

        if (error) throw error
        
        if (data && data.length > 0) {
          setVendors(prev => [...prev, data[0]])
          return data[0]
        }
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to create vendor')
      }
    }

    const updateVendor = async (id: string, updates: Partial<MarketplaceVendor>) => {
      try {
        const { data, error } = await supabase
          .from('marketplace_vendors')
          .update(updates)
          .eq('id', id)
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          setVendors(prev => prev.map(v => v.id === id ? data[0] : v))
          return data[0]
        }
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to update vendor')
      }
    }

    const deleteVendor = async (id: string) => {
      try {
        const { error } = await supabase
          .from('marketplace_vendors')
          .delete()
          .eq('id', id)

        if (error) throw error
        setVendors(prev => prev.filter(v => v.id !== id))
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to delete vendor')
      }
    }

    useEffect(() => {
      fetchVendors()
    }, [isActive])

    return {
      vendors,
      loading: vendorsLoading,
      createVendor,
      updateVendor,
      deleteVendor,
      refetch: fetchVendors
    }
  }

  // Orders Management
  const useOrders = (status?: string) => {
    const [orders, setOrders] = useState<MarketplaceOrder[]>([])
    const [ordersLoading, setOrdersLoading] = useState(true)

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true)
        let query = supabase
          .from('marketplace_orders')
          .select(`
            *,
            marketplace_vendors (store_name),
            marketplace_order_items (
              *,
              marketplace_products (name, images)
            )
          `)
          .order('created_at', { ascending: false })

        if (status) {
          query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) throw error
        setOrders(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      } finally {
        setOrdersLoading(false)
      }
    }

    const updateOrderStatus = async (id: string, status: string) => {
      try {
        const { data, error } = await supabase
          .from('marketplace_orders')
          .update({ status })
          .eq('id', id)
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          setOrders(prev => prev.map(o => o.id === id ? data[0] : o))
          return data[0]
        }
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to update order status')
      }
    }

    useEffect(() => {
      fetchOrders()
    }, [status])

    return {
      orders,
      loading: ordersLoading,
      updateOrderStatus,
      refetch: fetchOrders
    }
  }

  return {
    loading,
    error,
    useCategories,
    useProducts,
    useVendors,
    useOrders
  }
}
