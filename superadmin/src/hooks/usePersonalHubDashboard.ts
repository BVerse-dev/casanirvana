'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAdminApi } from '@/hooks/useAdminApi';
import { supabase } from '@/lib/supabase';

export type PersonalHubDashboardPeriod = '7' | '30' | '90' | '365';

export type PersonalHubDashboardAlert = {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: string | null;
  affected_services: string[];
  recommended_actions: string[];
  technical_details: string | null;
  status: 'active' | 'observed';
};

export type PersonalHubDashboardTransaction = {
  id: string;
  transaction_id: string | null;
  payment_id: string | null;
  transaction_type: string | null;
  service: string;
  provider: string | null;
  recipient_name: string | null;
  recipient_identifier: string | null;
  amount: number;
  amount_formatted: string;
  status: 'completed' | 'pending' | 'failed';
  raw_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  user: {
    id: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
  community: {
    id: string;
    name: string | null;
  } | null;
  unit: {
    id: string;
    number: string | null;
    block: string | null;
  } | null;
};

export type PersonalHubTrendPoint = {
  date: string;
  transactions: number;
  successful: number;
  volume: number;
};

export type PersonalHubDashboardMetrics = {
  totalTransactions: number;
  totalTransactionsFormatted: string;
  totalVolume: number;
  totalVolumeFormatted: string;
  totalCommission: number;
  totalCommissionFormatted: string;
  averageSuccessRate: number;
  averageSuccessRateFormatted: string;
  growth: {
    totalTransactions: number | null;
    totalVolume: number | null;
    totalCommission: number | null;
    averageSuccessRate: number | null;
  };
  recentTransactions: PersonalHubDashboardTransaction[];
  dailyTrends: PersonalHubTrendPoint[];
  alerts: PersonalHubDashboardAlert[];
};

export type PersonalHubServiceMetric = {
  service: string;
  label: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalVolume: number;
  totalVolumeFormatted: string;
  totalCommission: number;
  totalCommissionFormatted: string;
  averageResponseTime: number;
  successRate: number;
  growthRate: number | null;
};

type PersonalHubDashboardResponse = {
  success: boolean;
  data: {
    period: PersonalHubDashboardPeriod;
    currency_code: string;
    currency_symbol: string;
    metrics: PersonalHubDashboardMetrics;
    service_metrics: PersonalHubServiceMetric[];
  };
};

export function usePersonalHubDashboard(period: PersonalHubDashboardPeriod = '30') {
  const { fetchAdmin, hasToken } = useAdminApi();
  const queryClient = useQueryClient();
  const channelNameRef = useRef(`admin-personal-hub-dashboard-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-personal-hub-dashboard'] });
    };

    const channel = supabase
      .channel(channelNameRef.current)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personal_hub_analytics' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'airtime_purchases' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'data_purchases' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'money_transfers' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bill_payments' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insurance_payments' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_payments' }, invalidate);

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ['admin-personal-hub-dashboard', period],
    enabled: hasToken,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('period', period);
      params.set('recent_limit', '10');
      return fetchAdmin<PersonalHubDashboardResponse>(`/admin/personal-hub/dashboard?${params.toString()}`);
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

  return {
    metrics: query.data?.data.metrics || null,
    serviceMetrics: query.data?.data.service_metrics || [],
    currencyCode: query.data?.data.currency_code || 'GHS',
    currencySymbol: query.data?.data.currency_symbol || 'GH₵',
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refreshMetrics: query.refetch,
  };
}
