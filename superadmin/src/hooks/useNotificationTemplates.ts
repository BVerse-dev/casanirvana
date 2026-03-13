'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAdminApi } from '@/hooks/useAdminApi'

export interface Template {
  id: number
  template_name?: string | null
  template_content?: string | null
  created_at?: string | null
  updated_at?: string | null
  name?: string | null
  type?: string | null
  category?: string | null
  subject?: string | null
  content?: string | null
  variables?: string[] | null
  status?: string | null
  usage_count?: number | null
  last_used?: string | null
}

export type TemplateInsert = Omit<Template, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'last_used'>
export type TemplateUpdate = Partial<TemplateInsert>

const NOTIFICATION_REFRESH_INTERVAL_MS = 30_000

export const useListNotificationTemplates = () => {
  const { fetchAdmin, hasToken } = useAdminApi()

  return useQuery({
    queryKey: ['notification-templates'],
    enabled: hasToken,
    queryFn: async (): Promise<Template[]> => {
      const data = await fetchAdmin('/admin/notification-templates')
      return Array.isArray(data) ? data : []
    },
    staleTime: 30_000,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  })
}

export const useGetNotificationTemplate = (id: number) => {
  const { fetchAdmin, hasToken } = useAdminApi()

  return useQuery({
    queryKey: ['notification-templates', id],
    enabled: hasToken && Boolean(id),
    queryFn: async (): Promise<Template | null> => {
      const data = await fetchAdmin(`/admin/notification-templates/${id}`)
      return data || null
    },
    staleTime: 30_000,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  })
}

export const useCreateNotificationTemplate = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminApi()

  return useMutation({
    mutationFn: async (template: TemplateInsert): Promise<Template> => {
      return fetchAdmin('/admin/notification-templates', {
        method: 'POST',
        body: JSON.stringify(template),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      queryClient.invalidateQueries({ queryKey: ['admin-notification-dashboard'] })
    },
  })
}

export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminApi()

  return useMutation({
    mutationFn: async ({ id, ...updates }: TemplateUpdate & { id: number }): Promise<Template> => {
      return fetchAdmin(`/admin/notification-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      queryClient.invalidateQueries({ queryKey: ['notification-templates', data.id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export const useDeleteNotificationTemplate = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminApi()

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await fetchAdmin(`/admin/notification-templates/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}
