'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import { ServicePackage } from '@/types/database'

export const useServicePackages = (providerId?: string, serviceType?: string) => {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  const fetchPackages = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('service_packages')
        .select('*')
        .order('display_order', { ascending: true })
        .order('package_name')

      if (providerId) {
        query = query.eq('provider_id', providerId)
      }

      if (serviceType) {
        query = query.eq('service_type', serviceType)
      }

      const { data, error } = await query

      if (error) throw error
      setPackages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch packages')
    } finally {
      setLoading(false)
    }
  }

  const createPackage = async (packageData: Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .insert([packageData])
        .select()

      if (error) throw error
      
      if (data && data.length > 0) {
        setPackages(prev => [...prev, data[0]])
        return data[0]
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create package')
    }
  }

  const updatePackage = async (id: string, updates: Partial<ServicePackage>) => {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setPackages(prev => prev.map(p => p.id === id ? data[0] : p))
        return data[0]
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update package')
    }
  }

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_packages')
        .delete()
        .eq('id', id)

      if (error) throw error

      setPackages(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete package')
    }
  }

  const togglePackageStatus = async (id: string, isActive: boolean) => {
    return updatePackage(id, { is_active: isActive })
  }

  useEffect(() => {
    fetchPackages()
  }, [providerId, serviceType])

  return {
    packages,
    loading,
    error,
    createPackage,
    updatePackage,
    deletePackage,
    togglePackageStatus,
    refetch: fetchPackages
  }
}
