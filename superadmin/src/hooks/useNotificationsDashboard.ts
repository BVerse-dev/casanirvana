import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAdminApi } from '@/hooks/useAdminApi'

type NotificationCampaign = {
  community_id?: string | null
  id: string
  title: string
  name?: string | null
  type: string
  status: string
  recipients_count?: number | null
  delivered_count?: number | null
  opened_count?: number | null
  clicked_count?: number | null
  failed_count?: number | null
  audience?: string | null
  budget?: number | null
  spent?: number | null
  scheduled_at?: string | null
  sent_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  template_id?: number | null
}

type CreateNotificationCampaignInput = {
  community_id?: string | null
  title?: string
  name?: string
  type: string
  recipients_count?: number
  message?: string
  template?: string
  template_id?: number | null
  audience?: unknown
  budget?: number | null
  spent?: number | null
  scheduled_at?: string | null
  sent_at?: string | null
  status?: string
}

type DashboardChannelPerformance = {
  type: string
  campaignCount: number
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  deliveryRate: number
  openRate: number
  clickRate: number
  performance_score: number
}

type DashboardPayload = {
  data: {
    recent_campaigns: NotificationCampaign[]
    today_summary: {
      total_sent: number
      total_delivered: number
      total_opened: number
      total_clicked: number
      total_failed: number
      total_scheduled: number
      delivery_rate: number
      open_rate: number
      click_rate: number
      change_vs_yesterday: Record<string, number>
    }
    channel_performance: Record<string, DashboardChannelPerformance>
  }
}

const NOTIFICATION_REFRESH_INTERVAL_MS = 30_000

const dashboardQueryKey = (limit: number) => ['admin-notification-dashboard', limit] as const

const invalidateNotificationQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['admin-notification-dashboard'] })
  queryClient.invalidateQueries({ queryKey: ['campaigns'] })
  queryClient.invalidateQueries({ queryKey: ['admin-notification-analytics'] })
}

const useNotificationDashboardQuery = (limit = 5) => {
  const { fetchAdmin, hasToken } = useAdminApi()

  return useQuery({
    queryKey: dashboardQueryKey(limit),
    enabled: hasToken,
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      return fetchAdmin<DashboardPayload>(`/admin/notifications/dashboard?${params.toString()}`)
    },
    staleTime: 30_000,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  })
}

export const useListNotificationCampaigns = (status?: string, limit = 10) => {
  const query = useNotificationDashboardQuery(limit)
  const campaigns = (query.data?.data.recent_campaigns || []).filter((campaign) =>
    status ? campaign.status === status : true
  )

  return {
    ...query,
    data: campaigns,
  }
}

export const useTodayActivitySummary = () => {
  const query = useNotificationDashboardQuery()

  return {
    ...query,
    data: query.data ? { data: query.data.data.today_summary } : null,
  }
}

export const useChannelPerformance = () => {
  const query = useNotificationDashboardQuery()

  return {
    ...query,
    data: query.data ? { data: query.data.data.channel_performance } : null,
  }
}

export const useCreateNotificationCampaign = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminApi()

  return useMutation({
    mutationFn: async (newCampaign: CreateNotificationCampaignInput) => {
      return fetchAdmin<NotificationCampaign>('/admin/notification-campaigns', {
        method: 'POST',
        body: JSON.stringify(newCampaign),
      })
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient)
    },
  })
}
