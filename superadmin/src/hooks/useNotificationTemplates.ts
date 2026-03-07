'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

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

export const useListNotificationTemplates = () => {
  const { fetchAdmin } = useAdminFetch()

  return useQuery({
    queryKey: ['notification-templates'],
    queryFn: async (): Promise<Template[]> => {
      const data = await fetchAdmin('/admin/notification-templates')
      return Array.isArray(data) ? data : []
    },
  })
}

export const useGetNotificationTemplate = (id: number) => {
  const { fetchAdmin } = useAdminFetch()

  return useQuery({
    queryKey: ['notification-templates', id],
    queryFn: async (): Promise<Template | null> => {
      const data = await fetchAdmin(`/admin/notification-templates/${id}`)
      return data || null
    },
    enabled: !!id,
  })
}

export const useCreateNotificationTemplate = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminFetch()

  return useMutation({
    mutationFn: async (template: TemplateInsert): Promise<Template> => {
      return fetchAdmin('/admin/notification-templates', {
        method: 'POST',
        body: JSON.stringify(template),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
    },
  })
}

export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminFetch()

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
    },
  })
}

export const useDeleteNotificationTemplate = () => {
  const queryClient = useQueryClient()
  const { fetchAdmin } = useAdminFetch()

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await fetchAdmin(`/admin/notification-templates/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
    },
  })
}
