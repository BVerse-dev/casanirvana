'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import { ServiceType } from '@/types/database'

interface DashboardMetrics {
  totalTransactions: number
  totalVolume: number
  totalCommission: number
  averageSuccessRate: number
  serviceBreakdown: {
    airtime: { transactions: number; volume: number; successRate: number }
    data: { transactions: number; volume: number; successRate: number }
    money_transfer: { transactions: number; volume: number; successRate: number }
    bill_payment: { transactions: number; volume: number; successRate: number }
    insurance: { transactions: number; volume: number; successRate: number }
    marketplace: { transactions: number; volume: number; successRate: number }
  }
  recentTransactions: any[]
  topProviders: any[]
  dailyTrends: any[]
}

interface ServiceMetrics {
  service: ServiceType
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  totalVolume: number
  totalCommission: number
  averageResponseTime: number
  successRate: number
  growthRate: number
}

export const usePersonalHubDashboard = (period = '30') => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabase()

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(period))

      // Fetch overview metrics from personal_hub_transactions view
      const { data: transactionData, error: transactionError } = await supabase
        .from('personal_hub_transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (transactionError) throw transactionError

      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('personal_hub_analytics')
        .select(`
          *,
          service_providers (provider_name, service_type)
        `)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      if (analyticsError) throw analyticsError

      // Process metrics
      const transactions = transactionData || []
      const analytics = analyticsData || []

      // Calculate totals
      const totalTransactions = transactions.length
      const totalVolume = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0)
      const totalCommission = analytics.reduce((sum, a) => sum + (a.total_commission || 0), 0)

      // Calculate success rate
      const successfulTransactions = transactions.filter(t => t.status === 'completed').length
      const averageSuccessRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0

      // Service breakdown
      const serviceBreakdown = {
        airtime: calculateServiceMetrics(transactions, 'airtime'),
        data: calculateServiceMetrics(transactions, 'data'),
        money_transfer: calculateServiceMetrics(transactions, 'money_transfer'),
        bill_payment: calculateServiceMetrics(transactions, 'bill_payment'),
        insurance: calculateServiceMetrics(transactions, 'insurance'),
        marketplace: calculateServiceMetrics(transactions, 'marketplace')
      }

      // Recent transactions (last 10)
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, 10)

      // Top providers
      const providerMap = new Map()
      analytics.forEach(a => {
        if (a.provider_id && (a as any).service_providers) {
          const key = a.provider_id
          if (!providerMap.has(key)) {
            providerMap.set(key, {
              id: a.provider_id,
              name: (a as any).service_providers.provider_name,
              serviceType: (a as any).service_providers.service_type,
              transactions: 0,
              volume: 0,
              commission: 0
            })
          }
          const provider = providerMap.get(key)
          provider.transactions += a.total_transactions || 0
          provider.volume += a.total_volume || 0
          provider.commission += a.total_commission || 0
        }
      })

      const topProviders = Array.from(providerMap.values())
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5)

      // Daily trends (last 7 days)
      const dailyTrends = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayTransactions = transactions.filter(t => 
          t.created_at?.startsWith(dateStr)
        )
        
        dailyTrends.push({
          date: dateStr,
          transactions: dayTransactions.length,
          volume: dayTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0),
          successful: dayTransactions.filter(t => t.status === 'completed').length
        })
      }

      setMetrics({
        totalTransactions,
        totalVolume,
        totalCommission,
        averageSuccessRate,
        serviceBreakdown,
        recentTransactions,
        topProviders,
        dailyTrends
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  const calculateServiceMetrics = (transactions: any[], serviceType: string) => {
    const serviceTransactions = transactions.filter(t => t.transaction_type === serviceType)
    const successful = serviceTransactions.filter(t => t.status === 'completed')
    
    return {
      transactions: serviceTransactions.length,
      volume: serviceTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0),
      successRate: serviceTransactions.length > 0 ? (successful.length / serviceTransactions.length) * 100 : 0
    }
  }

  const fetchServiceMetrics = async () => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(period))

      const { data, error } = await supabase
        .from('personal_hub_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      if (error) throw error

      // Group by service type
      const serviceMap = new Map()
      const services: ServiceType[] = ['airtime', 'data', 'money_transfer', 'bill_payment', 'insurance', 'marketplace']

      services.forEach(service => {
        serviceMap.set(service, {
          service,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          totalVolume: 0,
          totalCommission: 0,
          averageResponseTime: 0,
          successRate: 0,
          growthRate: 0,
          count: 0
        })
      })

      data?.forEach(item => {
        if (serviceMap.has(item.service_type)) {
          const service = serviceMap.get(item.service_type)
          service.totalTransactions += item.total_transactions || 0
          service.successfulTransactions += item.successful_transactions || 0
          service.failedTransactions += item.failed_transactions || 0
          service.totalVolume += item.total_volume || 0
          service.totalCommission += item.total_commission || 0
          service.averageResponseTime += item.average_response_time || 0
          service.count += 1
        }
      })

      // Calculate averages and rates
      const result = Array.from(serviceMap.values()).map(service => {
        service.averageResponseTime = service.count > 0 ? service.averageResponseTime / service.count : 0
        service.successRate = service.totalTransactions > 0 
          ? (service.successfulTransactions / service.totalTransactions) * 100 
          : 0
        return service
      })

      setServiceMetrics(result)
    } catch (err) {
      console.error('Failed to fetch service metrics:', err)
    }
  }

  const refreshMetrics = async () => {
    await Promise.all([
      fetchDashboardMetrics(),
      fetchServiceMetrics()
    ])
  }

  useEffect(() => {
    refreshMetrics()
  }, [period])

  return {
    metrics,
    serviceMetrics,
    loading,
    error,
    refreshMetrics
  }
}
