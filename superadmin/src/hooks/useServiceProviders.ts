'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import { ServiceProvider } from '@/types/database'

export const useServiceProviders = (serviceType?: string) => {
  const [providers, setProviders] = useState<ServiceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  const fetchProviders = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('service_providers')
        .select('*')
        .order('provider_name')

      if (serviceType) {
        query = query.eq('service_type', serviceType)
      }

      const { data, error } = await query

      if (error) throw error
      setProviders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers')
    } finally {
      setLoading(false)
    }
  }

  const createProvider = async (provider: Omit<ServiceProvider, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .insert([provider])
        .select()

      if (error) throw error
      
      if (data && data.length > 0) {
        setProviders(prev => [...prev, data[0]])
        return data[0]
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create provider')
    }
  }

  const updateProvider = async (id: string, updates: Partial<ServiceProvider>) => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setProviders(prev => prev.map(p => p.id === id ? data[0] : p))
        return data[0]
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update provider')
    }
  }

  const deleteProvider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProviders(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete provider')
    }
  }

  const toggleProviderStatus = async (id: string, isActive: boolean) => {
    return updateProvider(id, { is_active: isActive })
  }

  useEffect(() => {
    fetchProviders()
  }, [serviceType])

  return {
    providers,
    loading,
    error,
    createProvider,
    updateProvider,
    deleteProvider,
    toggleProviderStatus,
    refetch: fetchProviders
  }
}
