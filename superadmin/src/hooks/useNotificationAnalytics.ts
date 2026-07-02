import { useQuery } from '@tanstack/react-query'

import { useAdminApi } from '@/hooks/useAdminApi'

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

type NotificationTrendRow = {
  recipients_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  created_at: string
}

type NotificationAnalyticsPayload = {
  data: {
    overview: NotificationAnalytics
    channels: ChannelPerformance[]
    top_campaigns: TopCampaignsResponse
    trends: NotificationTrendRow[]
  }
}

const NOTIFICATION_REFRESH_INTERVAL_MS = 30_000

const cleanFilters = (filters?: AnalyticsFilters) => ({
  dateRange: filters?.dateRange || '7days',
  startDate: filters?.startDate?.trim() || '',
  endDate: filters?.endDate?.trim() || '',
  channel: filters?.channel || 'all',
})

const analyticsQueryKey = (filters?: AnalyticsFilters, page = 1, pageSize = 10) =>
  ['admin-notification-analytics', cleanFilters(filters), page, pageSize] as const

const buildAnalyticsPath = (filters?: AnalyticsFilters, page = 1, pageSize = 10) => {
  const normalized = cleanFilters(filters)
  const params = new URLSearchParams()
  params.set('dateRange', normalized.dateRange)
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))
  params.set('channel', normalized.channel)
  if (normalized.startDate) params.set('startDate', normalized.startDate)
  if (normalized.endDate) params.set('endDate', normalized.endDate)
  return `/admin/notifications/analytics?${params.toString()}`
}

const useNotificationAnalyticsReport = (filters?: AnalyticsFilters, page = 1, pageSize = 10) => {
  const { fetchAdmin, hasToken } = useAdminApi()

  return useQuery({
    queryKey: analyticsQueryKey(filters, page, pageSize),
    enabled: hasToken,
    queryFn: async () => fetchAdmin<NotificationAnalyticsPayload>(buildAnalyticsPath(filters, page, pageSize)),
    staleTime: 30_000,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  })
}

export const useNotificationAnalytics = (filters?: AnalyticsFilters) => {
  const query = useNotificationAnalyticsReport(filters)

  return {
    ...query,
    data: query.data?.data.overview,
  }
}

export const useChannelPerformance = (filters?: AnalyticsFilters) => {
  const query = useNotificationAnalyticsReport(filters)

  return {
    ...query,
    data: query.data?.data.channels || [],
  }
}

export const useTopPerformingCampaigns = (filters?: AnalyticsFilters, page = 1, pageSize = 10) => {
  const query = useNotificationAnalyticsReport(filters, page, pageSize)

  return {
    ...query,
    data: query.data?.data.top_campaigns,
  }
}

export const usePerformanceTrends = (filters?: AnalyticsFilters) => {
  const query = useNotificationAnalyticsReport(filters)

  return {
    ...query,
    data: query.data?.data.trends || [],
  }
}
