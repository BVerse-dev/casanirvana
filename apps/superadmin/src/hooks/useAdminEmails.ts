'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useAdminApi } from '@/hooks/useAdminApi';

export type EmailFolderKey = 'all' | 'inbox' | 'sent' | 'drafts' | 'archive' | 'deleted' | 'starred' | 'important';
export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';
export type EmailStatus = 'draft' | 'queued' | 'processing' | 'sent' | 'delivered' | 'failed';

export type AdminEmailParty = {
  user_id: string | null;
  profile_id: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  community_id: string | null;
  community_name: string | null;
  profile_pic_url: string | null;
};

export type AdminEmailRecord = {
  id: string;
  subject: string;
  body: string;
  body_preview: string;
  folder: string | null;
  status: string | null;
  priority: string | null;
  sent_at: string | null;
  created_at: string | null;
  read_at: string | null;
  is_read: boolean | null;
  is_starred: boolean | null;
  is_important: boolean | null;
  is_draft: boolean | null;
  is_deleted: boolean | null;
  has_attachment: boolean | null;
  attachments: unknown;
  email_type: string | null;
  sender_id: string | null;
  recipient_id: string | null;
  resolved_community_id: string | null;
  resolved_community_name: string | null;
  sender: AdminEmailParty | null;
  recipient: AdminEmailParty | null;
};

export type AdminEmailSummary = {
  total: number;
  inbox: number;
  sent: number;
  drafts: number;
  archived: number;
  deleted: number;
  unread: number;
  starred: number;
  important: number;
  high_priority: number;
  queued: number;
  delivered: number;
  failed: number;
};

export type AdminEmailContact = {
  profile_id: string;
  user_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  community_id: string | null;
  community_name: string | null;
  profile_pic_url: string | null;
};

type EmailListResponse = {
  data: AdminEmailRecord[];
  summary: AdminEmailSummary;
};

type EmailDetailResponse = {
  data: AdminEmailRecord;
};

type ContactsResponse = {
  data: AdminEmailContact[];
};

export type AdminEmailListFilters = {
  folder?: EmailFolderKey;
  search?: string;
  priority?: EmailPriority | '';
  status?: EmailStatus | '';
  limit?: number;
};

export type CreateAdminEmailInput = {
  recipient_id: string;
  subject: string;
  body: string;
  priority?: EmailPriority;
  action?: 'draft' | 'queue';
};

export type UpdateAdminEmailInput = {
  id: string;
  updates: Partial<{
    is_read: boolean;
    is_starred: boolean;
    is_important: boolean;
    folder: Exclude<EmailFolderKey, 'all' | 'starred' | 'important'>;
    status: EmailStatus;
    subject: string;
    body: string;
    priority: EmailPriority;
  }>;
};

const emptySummary: AdminEmailSummary = {
  total: 0,
  inbox: 0,
  sent: 0,
  drafts: 0,
  archived: 0,
  deleted: 0,
  unread: 0,
  starred: 0,
  important: 0,
  high_priority: 0,
  queued: 0,
  delivered: 0,
  failed: 0,
};

const EMAIL_REFRESH_INTERVAL_MS = 30_000;

const cleanFilters = (filters: AdminEmailListFilters = {}): Required<AdminEmailListFilters> => ({
  folder: filters.folder || 'inbox',
  search: filters.search?.trim() || '',
  priority: filters.priority || '',
  status: filters.status || '',
  limit: filters.limit || 100,
});

const listQueryKey = (filters: AdminEmailListFilters = {}) => ['admin-emails', cleanFilters(filters)] as const;

export function useAdminEmails(filters: AdminEmailListFilters = {}) {
  const { fetchAdmin, hasToken } = useAdminApi();
  const normalized = cleanFilters(filters);

  return useQuery({
    queryKey: listQueryKey(normalized),
    enabled: hasToken,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (normalized.folder) params.set('folder', normalized.folder);
      if (normalized.search) params.set('search', normalized.search);
      if (normalized.priority) params.set('priority', normalized.priority);
      if (normalized.status) params.set('status', normalized.status);
      if (normalized.limit) params.set('limit', String(normalized.limit));

      return fetchAdmin<EmailListResponse>(`/admin/emails?${params.toString()}`);
    },
    staleTime: 30_000,
    refetchInterval: EMAIL_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    placeholderData: (previous) => previous,
  });
}

export function useAdminEmail(id?: string | null) {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ['admin-email', id || 'none'],
    enabled: hasToken && Boolean(id),
    queryFn: async () => fetchAdmin<EmailDetailResponse>(`/admin/emails/${id}`),
    staleTime: 30_000,
    refetchInterval: EMAIL_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useAdminEmailContacts(search?: string) {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ['admin-email-contacts', search?.trim() || ''],
    enabled: hasToken,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search?.trim()) params.set('search', search.trim());
      return fetchAdmin<ContactsResponse>(`/admin/emails/contacts${params.toString() ? `?${params.toString()}` : ''}`);
    },
    staleTime: 60_000,
  });
}

export function useCreateAdminEmail() {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (payload: CreateAdminEmailInput) => fetchAdmin<EmailDetailResponse>('/admin/emails', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-emails'] });
      toast.success(variables.action === 'draft' ? 'Draft saved' : 'Email queued successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create email');
    },
  });
}

export function useUpdateAdminEmail() {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({ id, updates }: UpdateAdminEmailInput) => fetchAdmin<EmailDetailResponse>(`/admin/emails/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
    onSuccess: (payload) => {
      queryClient.invalidateQueries({ queryKey: ['admin-emails'] });
      queryClient.setQueryData(['admin-email', payload.data.id], payload);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update email');
    },
  });
}

export function getEmailSummaryOrEmpty(summary?: AdminEmailSummary | null) {
  return summary || emptySummary;
}
