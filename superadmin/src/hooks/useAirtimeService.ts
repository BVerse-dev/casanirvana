'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'

interface ServiceMetrics {
  totalTransactions: number
  revenue: number
  successRate: number
  activeProviders: number
  growth: {
    transactions: number
    revenue: number
    successRate: number
  }
}

interface Provider {
  id: string
  provider_name: string
  is_active: boolean
  success_rate: number
  total_transactions: number
  total_volume: number
  logo_url?: string
}

interface RecentTransaction {
  id: string
  user_id: string
  provider: string
  phone_number: string
  amount: number
  status: string
  created_at: string
}

export const useAirtimeService = () => {
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  const fetchMetrics = async () => {
    try {
      setLoading(true)

      // Fetch providers for this service type (match both 'airtime' and 'mobile_topup' variations)
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .or('service_type.ilike.%airtime%,service_type.ilike.%mobile%,service_type.eq.airtime')

      if (providerError) throw providerError

      const activeProviders = providerData?.filter(p => p.is_active) || []
      setProviders(activeProviders)

      // Calculate aggregated metrics from providers
      const totalTransactions = activeProviders.reduce((sum, p) => sum + (p.total_transactions || 0), 0)
      const totalVolume = activeProviders.reduce((sum, p) => sum + parseFloat(p.total_volume || '0'), 0)
      const avgSuccessRate = activeProviders.length > 0
        ? activeProviders.reduce((sum, p) => sum + parseFloat(p.success_rate || '0'), 0) / activeProviders.length
        : 0

      // Fetch recent transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('airtime_purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionError) throw transactionError
      setRecentTransactions(transactionData || [])

      // Set metrics
      setMetrics({
        totalTransactions,
        revenue: totalVolume,
        successRate: avgSuccessRate,
        activeProviders: activeProviders.length,
        growth: {
          transactions: 9.2, // Placeholder - would calculate from historical data
          revenue: 7.8,
          successRate: 0.3
        }
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch airtime metrics')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => fetchMetrics()

  useEffect(() => {
    fetchMetrics()
  }, [])

  return {
    metrics,
    providers,
    recentTransactions,
    loading,
    error,
    refetch
  }
}
