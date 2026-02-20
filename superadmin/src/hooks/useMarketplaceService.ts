'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'

interface ServiceMetrics {
  totalTransactions: number
  revenue: number
  successRate: number
  activeProviders: number
  growth: { transactions: number; revenue: number; successRate: number }
}

interface Provider {
  id: string
  provider_name: string
  is_active: boolean
  success_rate: number
  total_transactions: number
  total_volume: number
}

export const useMarketplaceService = () => {
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  const fetchMetrics = async () => {
    try {
      setLoading(true)

      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('service_type', 'marketplace')

      if (providerError) throw providerError

      const activeProviders = providerData?.filter(p => p.is_active) || []
      setProviders(activeProviders)

      const totalTransactions = activeProviders.reduce((sum, p) => sum + (p.total_transactions || 0), 0)
      const totalVolume = activeProviders.reduce((sum, p) => sum + parseFloat(p.total_volume || '0'), 0)
      const avgSuccessRate = activeProviders.length > 0
        ? activeProviders.reduce((sum, p) => sum + parseFloat(p.success_rate || '0'), 0) / activeProviders.length
        : 0

      const { data: transactionData, error: transactionError } = await supabase
        .from('shopping_payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionError) throw transactionError
      setRecentTransactions(transactionData || [])

      setMetrics({
        totalTransactions,
        revenue: totalVolume,
        successRate: avgSuccessRate,
        activeProviders: activeProviders.length,
        growth: { transactions: 25.8, revenue: 18.4, successRate: 0.2 }
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch marketplace metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMetrics() }, [])

  return { metrics, providers, recentTransactions, loading, error, refetch: fetchMetrics }
}
