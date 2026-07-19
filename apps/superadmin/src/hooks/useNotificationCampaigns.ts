'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAdminApi } from '@/hooks/useAdminApi'

export interface Campaign {
  community_id?: string | null
  id: string
  name: string
  title: string
  type: 'sms' | 'email' | 'push' | 'in-app'
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' | 'processing' | 'delivered' | 'failed'
  template: string
  templateId?: number | null
  audience: string
  audienceCount: number
  scheduledDate?: string
  createdAt: string
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  budget?: number
  spent?: number
  recipients_count: number
  failed_count: number
  scheduled_at?: string
  sent_at?: string
  created_at: string
  updated_at: string
}

export interface CreateCampaignData {
  community_id?: string | null
  name: string
  title: string
  type: 'sms' | 'email' | 'push' | 'in-app'
  status?: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' | 'processing' | 'delivered' | 'failed'
  template?: string
  template_id?: number | null
  audience?: string
  recipients_count?: number
  scheduled_at?: string
  sent_at?: string
  budget?: number
}

export interface UpdateCampaignData {
  community_id?: string | null
  name?: string
  title?: string
  type?: 'sms' | 'email' | 'push' | 'in-app'
  status?: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' | 'processing' | 'delivered' | 'failed'
  template?: string
  template_id?: number | null
  audience?: string
  recipients_count?: number
  delivered_count?: number
  opened_count?: number
  clicked_count?: number
  failed_count?: number
  scheduled_at?: string
  sent_at?: string
  budget?: number
  spent?: number
}

type CampaignListPayload = {
  data: {
    items: Record<string, any>[]
    total: number
    limit: number
    offset: number
  }
}

type CampaignDetailPayload = {
  data: Record<string, any>
}

type NotificationAnalyticsOverviewPayload = {
  data: {
    overview: {
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
  }
}

const NOTIFICATION_REFRESH_INTERVAL_MS = 30_000

const transformCampaign = (record: any): Campaign => ({
  community_id: record.community_id ?? null,
  id: record.id,
  name: record.name || record.title,
  title: record.title || record.name,
  type: record.type,
  status: record.status,
  template: record.template || '',
  templateId: record.template_id ?? null,
  audience: record.audience || 'all-residents',
  audienceCount: record.recipients_count || 0,
  scheduledDate: record.scheduled_at,
  createdAt: record.created_at,
  sentCount: record.recipients_count || 0,
  deliveredCount: record.delivered_count || 0,
  openedCount: record.opened_count || 0,
  clickedCount: record.clicked_count || 0,
  budget: record.budget || 0,
  spent: record.spent || 0,
  recipients_count: record.recipients_count || 0,
  failed_count: record.failed_count || 0,
  scheduled_at: record.scheduled_at,
  sent_at: record.sent_at,
  created_at: record.created_at,
  updated_at: record.updated_at,
})

const listQueryKey = (params?: {
  status?: string
  type?: string
  limit?: number
  offset?: number
}) => ['campaigns', params || {}] as const

const detailQueryKey = (id: string) => ['campaign', id] as const

const invalidateNotificationQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['campaigns'] })
  queryClient.invalidateQueries({ queryKey: ['campaign'] })
  queryClient.invalidateQueries({ queryKey: ['admin-notification-dashboard'] })
  queryClient.invalidateQueries({ queryKey: ['admin-notification-analytics'] })
}

export const useListCampaigns = (params?: {
  status?: string
  type?: string
  limit?: number
  offset?: number
}) => {
  const { fetchAdmin, hasToken } = useAdminApi()

  return useQuery({
    queryKey: listQueryKey(params),
    enabled: hasToken,
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.status && params.status !== 'all') searchParams.set('status', params.status)
      if (params?.type && params.type !== 'all') searchParams.set('type', params.type)
      if (typeof params?.limit === 'number') searchParams.set('limit', String(params.limit))
      if (typeof params?.offset === 'number') searchParams.set('offset', String(params.offset))

      const payload = await fetchAdmin<CampaignListPayload>(
        `/admin/notification-campaigns${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      )

      return (payload.data.items || []).map(transformCampaign)
    },
    staleTime: 30_000,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  })
}

export const useGetCampaign = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi()

  return useQuery({
    queryKey: detailQueryKey(id),
    enabled: hasToken && Boolean(id),
    queryFn: async () => {
      const payload = await fetchAdmin<CampaignDetailPayload>(`/admin/notification-campaigns/${id}`)
      return transformCampaign(payload.data)
    },
    staleTime: 30_000,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  })
}

export const useCreateCampaign = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminApi()

  return useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      const created = await fetchAdmin<Record<string, any>>('/admin/notification-campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
      })

      return transformCampaign(created)
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient)
    },
  })
}

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminApi()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateCampaignData }) => {
      const updated = await fetchAdmin<Record<string, any>>(`/admin/notification-campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updates }),
      })

      return transformCampaign(updated)
    },
    onSuccess: (data) => {
      invalidateNotificationQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: detailQueryKey(data.id) })
    },
  })
}

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminApi()

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/notification-campaigns/${id}`, { method: 'DELETE' })
      return id
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient)
    },
  })
}

export const useCampaignsAnalytics = (dateRange?: { from: string; to: string }) => {
  const { fetchAdmin, hasToken } = useAdminApi()

  return useQuery({
    queryKey: ['campaigns-analytics', dateRange || null],
    enabled: hasToken,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateRange?.from && dateRange?.to) {
        params.set('dateRange', 'custom')
        params.set('startDate', dateRange.from)
        params.set('endDate', dateRange.to)
      }

      const payload = await fetchAdmin<NotificationAnalyticsOverviewPayload>(
        `/admin/notifications/analytics${params.toString() ? `?${params.toString()}` : ''}`
      )

      return payload.data.overview
    },
    staleTime: 30_000,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  })
}
