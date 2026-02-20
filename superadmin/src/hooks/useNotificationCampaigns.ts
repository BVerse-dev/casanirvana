'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export interface Campaign {
  id: string
  name: string
  title: string
  type: 'sms' | 'email' | 'push' | 'in-app'
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' | 'processing' | 'delivered' | 'failed'
  template: string
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
  name: string
  title: string
  type: 'sms' | 'email' | 'push' | 'in-app'
  template?: string
  audience?: string
  recipients_count?: number
  scheduled_at?: string
  budget?: number
}

export interface UpdateCampaignData {
  name?: string
  title?: string
  type?: 'sms' | 'email' | 'push' | 'in-app'
  status?: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' | 'processing' | 'delivered' | 'failed'
  template?: string
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const useAdminFetch = () => {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.')
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed')
    }
    return payload
  }

  return { fetchAdmin }
}

// Transform database record to Campaign interface
const transformCampaign = (record: any): Campaign => {
  return {
    id: record.id,
    name: record.name || record.title,
    title: record.title || record.name,
    type: record.type,
    status: record.status,
    template: record.template || 'Standard Template',
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
    updated_at: record.updated_at
  }
}

// List all campaigns with optional filtering
export const useListCampaigns = (params?: {
  status?: string
  type?: string
  limit?: number
  offset?: number
}) => {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async () => {
      let query = (supabase as any)
        .from('notification_campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status)
      }

      if (params?.type && params.type !== 'all') {
        query = query.eq('type', params.type)
      }

      if (params?.limit) {
        query = query.limit(params.limit)
      }

      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map(transformCampaign)
    },
  })
}

// Get single campaign by ID
export const useGetCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('notification_campaigns')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return transformCampaign(data)
    },
    enabled: !!id,
  })
}

// Create new campaign
export const useCreateCampaign = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminFetch()

  return useMutation({
    mutationFn: async (campaignData: CreateCampaignData) => {
      const created = await fetchAdmin('/admin/notification-campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
      })

      return transformCampaign(created)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

// Update campaign
export const useUpdateCampaign = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminFetch()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateCampaignData }) => {
      const updated = await fetchAdmin(`/admin/notification-campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updates }),
      })

      return transformCampaign(updated)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', data.id] })
    },
  })
}

// Delete campaign
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminFetch()

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/notification-campaigns/${id}`, { method: 'DELETE' })
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

// Get campaigns analytics/metrics
export const useCampaignsAnalytics = (dateRange?: { from: string; to: string }) => {
  return useQuery({
    queryKey: ['campaigns-analytics', dateRange],
    queryFn: async () => {
      let query = (supabase as any)
        .from('notification_campaigns')
        .select('*')

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from)
          .lte('created_at', dateRange.to)
      }

      const { data, error } = await query

      if (error) throw error

      const campaigns = (data || []).map(transformCampaign)

      // Calculate metrics
      const totalCampaigns = campaigns.length
      const totalSent = campaigns.reduce((sum: number, c: Campaign) => sum + c.sentCount, 0)
      const totalDelivered = campaigns.reduce((sum: number, c: Campaign) => sum + c.deliveredCount, 0)
      const totalOpened = campaigns.reduce((sum: number, c: Campaign) => sum + c.openedCount, 0)
      const totalClicked = campaigns.reduce((sum: number, c: Campaign) => sum + c.clickedCount, 0)
      const totalSpent = campaigns.reduce((sum: number, c: Campaign) => sum + (c.spent || 0), 0)

      return {
        totalCampaigns,
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalSpent,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
        clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      }
    },
  })
}
