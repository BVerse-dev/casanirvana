import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface NotificationAnalytics {
  totalCampaigns: number
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
}

export interface ChannelPerformance {
  type: string
  campaignCount: number
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  deliveryRate: number
  openRate: number
}

export interface TopCampaign {
  id: string
  name: string
  type: string
  sent: number
  opened: number
  clicked: number
  openRate: number
  clickRate: number
}

export interface TopCampaignsResponse {
  campaigns: TopCampaign[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface AnalyticsFilters {
  dateRange?: '7days' | '30days' | '90days' | 'custom'
  startDate?: string
  endDate?: string
  channel?: string
}

// Transform database analytics data
const transformAnalytics = (data: any): NotificationAnalytics => {
  const totalSent = data.total_sent || 0
  const totalDelivered = data.total_delivered || 0
  const totalOpened = data.total_opened || 0
  const totalClicked = data.total_clicked || 0
  
  return {
    totalCampaigns: data.total_campaigns || 0,
    totalSent,
    totalDelivered,
    totalOpened,
    totalClicked,
    deliveryRate: parseFloat(data.avg_delivery_rate || '0'),
    openRate: parseFloat(data.avg_open_rate || '0'),
    clickRate: parseFloat(data.avg_click_rate || '0'),
    bounceRate: totalSent > 0 ? ((totalSent - totalDelivered) / totalSent) * 100 : 0
  }
}

// Transform channel performance data
const transformChannelPerformance = (data: any[]): ChannelPerformance[] => {
  return data.map(item => ({
    type: item.type,
    campaignCount: item.campaign_count || 0,
    totalSent: item.total_sent || 0,
    totalDelivered: item.total_delivered || 0,
    totalOpened: item.total_opened || 0,
    totalClicked: item.total_clicked || 0,
    deliveryRate: parseFloat(item.delivery_rate || '0'),
    openRate: parseFloat(item.open_rate || '0')
  }))
}

// Get overall notification analytics
export const useNotificationAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['notification-analytics', filters],
    queryFn: async () => {
      let query = (supabase as any).from('notification_campaigns').select(`
        id,
        recipients_count,
        delivered_count,
        opened_count,
        clicked_count,
        created_at
      `)

      // Apply date filters if provided
      if (filters?.dateRange && filters.dateRange !== 'custom') {
        const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        query = query.gte('created_at', startDate.toISOString())
      } else if (filters?.startDate && filters?.endDate) {
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
      }

      // Apply channel filter
      if (filters?.channel && filters.channel !== 'all') {
        query = query.eq('type', filters.channel)
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate aggregated analytics
      const totalSent = data.reduce((sum: number, item: any) => sum + (item.recipients_count || 0), 0)
      const totalDelivered = data.reduce((sum: number, item: any) => sum + (item.delivered_count || 0), 0)
      const totalOpened = data.reduce((sum: number, item: any) => sum + (item.opened_count || 0), 0)
      const totalClicked = data.reduce((sum: number, item: any) => sum + (item.clicked_count || 0), 0)

      return transformAnalytics({
        total_campaigns: data.length,
        total_sent: totalSent,
        total_delivered: totalDelivered,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        avg_delivery_rate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0',
        avg_open_rate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0',
        avg_click_rate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0'
      })
    }
  })
}

// Get channel performance breakdown
export const useChannelPerformance = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['channel-performance', filters],
    queryFn: async () => {
      let query = (supabase as any).from('notification_campaigns').select(`
        type,
        recipients_count,
        delivered_count,
        opened_count,
        clicked_count,
        created_at
      `).not('type', 'is', null)

      // Apply date filters
      if (filters?.dateRange && filters.dateRange !== 'custom') {
        const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        query = query.gte('created_at', startDate.toISOString())
      } else if (filters?.startDate && filters?.endDate) {
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error

      // Group by channel type
      const channelGroups: Record<string, any[]> = {}
      data.forEach((item: any) => {
        if (!channelGroups[item.type]) {
          channelGroups[item.type] = []
        }
        channelGroups[item.type].push(item)
      })

      // Calculate performance for each channel
      const channelPerformance = Object.entries(channelGroups).map(([type, campaigns]) => {
        const totalSent = campaigns.reduce((sum: number, c: any) => sum + (c.recipients_count || 0), 0)
        const totalDelivered = campaigns.reduce((sum: number, c: any) => sum + (c.delivered_count || 0), 0)
        const totalOpened = campaigns.reduce((sum: number, c: any) => sum + (c.opened_count || 0), 0)
        const totalClicked = campaigns.reduce((sum: number, c: any) => sum + (c.clicked_count || 0), 0)

        return {
          type,
          campaign_count: campaigns.length,
          total_sent: totalSent,
          total_delivered: totalDelivered,
          total_opened: totalOpened,
          total_clicked: totalClicked,
          delivery_rate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0',
          open_rate: totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0'
        }
      })

      return transformChannelPerformance(channelPerformance)
    }
  })
}

// Get top performing campaigns with pagination
export const useTopPerformingCampaigns = (filters?: AnalyticsFilters, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['top-campaigns', filters, page, pageSize],
    queryFn: async () => {
      let countQuery = (supabase as any).from('notification_campaigns').select('*', { count: 'exact', head: true })
      let query = (supabase as any).from('notification_campaigns').select(`
        id,
        name,
        type,
        recipients_count,
        delivered_count,
        opened_count,
        clicked_count,
        created_at
      `)

      // Apply date filters to both queries
      if (filters?.dateRange && filters.dateRange !== 'custom') {
        const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        countQuery = countQuery.gte('created_at', startDate.toISOString())
        query = query.gte('created_at', startDate.toISOString())
      } else if (filters?.startDate && filters?.endDate) {
        countQuery = countQuery.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
      }

      // Apply channel filter to both queries
      if (filters?.channel && filters.channel !== 'all') {
        countQuery = countQuery.eq('type', filters.channel)
        query = query.eq('type', filters.channel)
      }

      // Get total count
      const { count, error: countError } = await countQuery
      if (countError) throw countError

      // Get paginated data
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      
      query = query.order('opened_count', { ascending: false }).range(from, to)

      const { data, error } = await query
      if (error) throw error

      const campaigns = data.map((campaign: any): TopCampaign => {
        const sent = campaign.recipients_count || 0
        const opened = campaign.opened_count || 0
        const clicked = campaign.clicked_count || 0

        return {
          id: campaign.id,
          name: campaign.name || 'Untitled Campaign',
          type: campaign.type || 'unknown',
          sent,
          opened,
          clicked,
          openRate: sent > 0 ? (opened / sent) * 100 : 0,
          clickRate: opened > 0 ? (clicked / opened) * 100 : 0
        }
      })

      return {
        campaigns,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
        pageSize
      }
    }
  })
}

// Get performance trends over time
export const usePerformanceTrends = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ['performance-trends', filters],
    queryFn: async () => {
      let query = (supabase as any).from('notification_campaigns').select(`
        recipients_count,
        delivered_count,
        opened_count,
        clicked_count,
        created_at
      `)

      // Apply date filters
      if (filters?.dateRange && filters.dateRange !== 'custom') {
        const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        query = query.gte('created_at', startDate.toISOString())
      } else if (filters?.startDate && filters?.endDate) {
        query = query.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
      }

      // Apply channel filter
      if (filters?.channel && filters.channel !== 'all') {
        query = query.eq('type', filters.channel)
      }

      query = query.order('created_at', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      return data
    }
  })
}
