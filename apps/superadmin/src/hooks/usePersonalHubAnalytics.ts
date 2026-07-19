'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import { PersonalHubAnalytics, ServiceType } from '@/types/database'

interface AnalyticsFilters {
  serviceType?: ServiceType
  providerId?: string
  dateFrom?: string
  dateTo?: string
}

interface AnalyticsSummary {
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  totalVolume: number
  totalCommission: number
  averageResponseTime: number
  successRate: number
}

export const usePersonalHubAnalytics = (filters?: AnalyticsFilters) => {
  const [analytics, setAnalytics] = useState<PersonalHubAnalytics[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('personal_hub_analytics')
        .select(`
          *,
          service_providers (
            provider_name,
            service_type
          )
        `)
        .order('date', { ascending: false })

      // Apply filters
      if (filters?.serviceType) {
        query = query.eq('service_type', filters.serviceType)
      }

      if (filters?.providerId) {
        query = query.eq('provider_id', filters.providerId)
      }

      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo)
      }

      const { data, error } = await query

      if (error) throw error
      setAnalytics(data || [])

      // Calculate summary
      if (data && data.length > 0) {
        const summaryData = data.reduce(
          (acc, item) => ({
            totalTransactions: acc.totalTransactions + (item.total_transactions || 0),
            successfulTransactions: acc.successfulTransactions + (item.successful_transactions || 0),
            failedTransactions: acc.failedTransactions + (item.failed_transactions || 0),
            totalVolume: acc.totalVolume + (item.total_volume || 0),
            totalCommission: acc.totalCommission + (item.total_commission || 0),
            averageResponseTime: acc.averageResponseTime + (item.average_response_time || 0),
            successRate: 0
          }),
          {
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            totalVolume: 0,
            totalCommission: 0,
            averageResponseTime: 0,
            successRate: 0
          }
        )

        // Calculate averages
        summaryData.averageResponseTime = summaryData.averageResponseTime / data.length
        summaryData.successRate = summaryData.totalTransactions > 0 
          ? (summaryData.successfulTransactions / summaryData.totalTransactions) * 100 
          : 0

        setSummary(summaryData)
      } else {
        setSummary(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const getServiceTypeAnalytics = async (serviceType: ServiceType, days = 30) => {
    try {
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - days)

      const { data, error } = await supabase
        .from('personal_hub_analytics')
        .select('*')
        .eq('service_type', serviceType)
        .gte('date', fromDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch service analytics')
    }
  }

  const getProviderComparison = async (serviceType: ServiceType) => {
    try {
      const { data, error } = await supabase
        .from('personal_hub_analytics')
        .select(`
          provider_id,
          service_providers (provider_name),
          total_transactions,
          successful_transactions,
          total_volume,
          total_commission,
          average_response_time
        `)
        .eq('service_type', serviceType)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      if (error) throw error

      // Group by provider and sum up metrics
      const providerMap = new Map()
      
      data?.forEach(item => {
        const providerId = item.provider_id
        if (!providerId) return

        if (!providerMap.has(providerId)) {
          providerMap.set(providerId, {
            providerId,
            providerName: (item as any).service_providers?.provider_name || 'Unknown',
            totalTransactions: 0,
            successfulTransactions: 0,
            totalVolume: 0,
            totalCommission: 0,
            averageResponseTime: 0,
            count: 0
          })
        }

        const provider = providerMap.get(providerId)
        provider.totalTransactions += item.total_transactions || 0
        provider.successfulTransactions += item.successful_transactions || 0
        provider.totalVolume += item.total_volume || 0
        provider.totalCommission += item.total_commission || 0
        provider.averageResponseTime += item.average_response_time || 0
        provider.count += 1
      })

      // Calculate averages
      const result = Array.from(providerMap.values()).map(provider => ({
        ...provider,
        averageResponseTime: provider.averageResponseTime / provider.count,
        successRate: provider.totalTransactions > 0 
          ? (provider.successfulTransactions / provider.totalTransactions) * 100 
          : 0
      }))

      return result
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch provider comparison')
    }
  }

  const generateAnalyticsReport = async (
    serviceType?: ServiceType,
    dateFrom?: string,
    dateTo?: string
  ) => {
    try {
      let query = supabase
        .from('personal_hub_analytics')
        .select(`
          *,
          service_providers (
            provider_name,
            service_type
          )
        `)
        .order('date', { ascending: false })

      if (serviceType) {
        query = query.eq('service_type', serviceType)
      }

      if (dateFrom) {
        query = query.gte('date', dateFrom)
      }

      if (dateTo) {
        query = query.lte('date', dateTo)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate analytics report')
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  return {
    analytics,
    summary,
    loading,
    error,
    getServiceTypeAnalytics,
    getProviderComparison,
    generateAnalyticsReport,
    refetch: fetchAnalytics
  }
}
