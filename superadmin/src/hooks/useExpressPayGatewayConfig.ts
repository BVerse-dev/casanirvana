'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export type ExpressPayGatewayConfig = {
  mode: 'test' | 'live';
  scope: 'global' | 'community';
  community_id: string | null;
  is_enabled: boolean;
  currency: string;
  callback_path: string;
  webhook_url: string | null;
  submit_url: string | null;
  query_url: string | null;
  checkout_url: string | null;
  merchant_id_configured: boolean;
  api_key_configured: boolean;
  last_tested_at: string | null;
  last_test_status: string | null;
  last_test_message: string | null;
};

export type ExpressPayGatewayUpsertInput = {
  mode: 'test' | 'live';
  scope: 'global' | 'community';
  community_id?: string | null;
  is_enabled: boolean;
  currency?: string;
  callback_path?: string;
  webhook_url?: string | null;
  submit_url?: string | null;
  query_url?: string | null;
  checkout_url?: string | null;
  merchant_id?: string | null;
  api_key?: string | null;
};

const expressPayQueryKey = (mode: 'test' | 'live', scope: 'global' | 'community', communityId?: string | null) => [
  'admin-payment-gateway',
  'expresspay',
  mode,
  scope,
  communityId || 'global',
] as const;

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = payload?.error || payload?.message || 'Request failed';
      throw new Error(message);
    }

    return payload;
  };

  return { fetchAdmin, hasToken: !!token };
};

export const useExpressPayGatewayConfig = (
  mode: 'test' | 'live',
  scope: 'global' | 'community' = 'global',
  communityId?: string | null
) => {
  const { fetchAdmin, hasToken } = useAdminFetch();

  return useQuery({
    queryKey: expressPayQueryKey(mode, scope, communityId),
    enabled: hasToken,
    queryFn: async (): Promise<ExpressPayGatewayConfig> => {
      const params = new URLSearchParams();
      params.set('mode', mode);
      params.set('scope', scope);
      if (scope === 'community' && communityId) {
        params.set('community_id', communityId);
      }

      const response = await fetchAdmin(`/admin/payment-gateways/expresspay/config?${params.toString()}`);
      return response.data as ExpressPayGatewayConfig;
    },
  });
};

export const useUpdateExpressPayGatewayConfig = () => {
  const { fetchAdmin } = useAdminFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ExpressPayGatewayUpsertInput): Promise<ExpressPayGatewayConfig> => {
      const response = await fetchAdmin('/admin/payment-gateways/expresspay/config', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      return response.data as ExpressPayGatewayConfig;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: expressPayQueryKey(data.mode, data.scope, data.community_id),
      });
    },
  });
};

export const useTestExpressPayGatewayConnection = () => {
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async ({
      mode,
      scope,
      community_id,
    }: {
      mode: 'test' | 'live';
      scope: 'global' | 'community';
      community_id?: string | null;
    }) => {
      const response = await fetchAdmin('/admin/payment-gateways/expresspay/test', {
        method: 'POST',
        body: JSON.stringify({ mode, scope, community_id: community_id || null }),
      });
      return response.data as { passed: boolean; message: string; details?: Record<string, unknown> };
    },
  });
};
