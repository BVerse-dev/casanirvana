'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAdminApi } from '@/hooks/useAdminApi';
import { supabase } from '@/lib/supabase';

export type PersonalHubReportsPeriod = '7' | '30' | '90' | '365';

export type PersonalHubReportOption = {
  value: string;
  label: string;
  count: number;
};

export type PersonalHubReportTransaction = {
  id: string;
  transaction_id: string | null;
  payment_id: string | null;
  transaction_type: string;
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

export type PersonalHubReportSummary = {
  total_transactions: number;
  total_transactions_formatted: string;
  total_volume: number;
  total_volume_formatted: string;
  successful_transactions: number;
  successful_transactions_formatted: string;
  failed_transactions: number;
  failed_transactions_formatted: string;
  active_users: number;
  active_users_formatted: string;
  average_success_rate: number;
  average_success_rate_formatted: string;
  growth: {
    total_transactions: number | null;
    total_volume: number | null;
    active_users: number | null;
    average_success_rate: number | null;
  };
};

export type PersonalHubRevenueByServicePoint = {
  service: string;
  label: string;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_volume: number;
  total_volume_formatted: string;
  success_rate: number;
  error_rate: number;
  active_users: number;
  adoption_rate: number;
};

export type PersonalHubUserEngagementPoint = {
  date: string;
  transactions: number;
  successful_transactions: number;
  active_users: number;
  success_rate: number;
};

export type PersonalHubServicePerformancePoint = {
  service: string;
  label: string;
  success_rate: number;
  error_rate: number;
  pending_rate: number;
  total_transactions: number;
};

export type PersonalHubServiceAdoptionPoint = {
  service: string;
  label: string;
  active_users: number;
  adoption_rate: number;
  total_transactions: number;
};

export type PersonalHubReportsFilters = {
  period: PersonalHubReportsPeriod;
  serviceTypes: string[];
  statuses: string[];
  providers: string[];
  search: string;
  minAmount: string;
  maxAmount: string;
  limit?: number;
};

type PersonalHubReportsResponse = {
  success: boolean;
  data: {
    period: PersonalHubReportsPeriod;
    currency_code: string;
    currency_symbol: string;
    summary: PersonalHubReportSummary;
    filters: {
      applied: {
        service_types: string[];
        statuses: string[];
        providers: string[];
        search: string;
        min_amount: number | null;
        max_amount: number | null;
      };
      options: {
        services: PersonalHubReportOption[];
        statuses: PersonalHubReportOption[];
        providers: PersonalHubReportOption[];
      };
    };
    transactions_total: number;
    transactions_returned: number;
    transactions_truncated: boolean;
    transactions: PersonalHubReportTransaction[];
    charts: {
      revenue_by_service: PersonalHubRevenueByServicePoint[];
      user_engagement: PersonalHubUserEngagementPoint[];
      service_performance: PersonalHubServicePerformancePoint[];
      service_adoption: PersonalHubServiceAdoptionPoint[];
    };
  };
};

const DEFAULT_PERIOD: PersonalHubReportsPeriod = '30';
const DEFAULT_LIMIT = 500;

export function usePersonalHubReports(filters: Partial<PersonalHubReportsFilters> = {}) {
  const { fetchAdmin, hasToken } = useAdminApi();
  const queryClient = useQueryClient();

  const period = filters.period || DEFAULT_PERIOD;
  const serviceTypes = filters.serviceTypes || [];
  const statuses = filters.statuses || [];
  const providers = filters.providers || [];
  const search = filters.search || '';
  const minAmount = filters.minAmount || '';
  const maxAmount = filters.maxAmount || '';
  const limit = filters.limit || DEFAULT_LIMIT;

  useEffect(() => {
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-personal-hub-reports'] });
    };

    const channel = supabase
      .channel('admin-personal-hub-reports')
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
    queryKey: [
      'admin-personal-hub-reports',
      period,
      serviceTypes.join(','),
      statuses.join(','),
      providers.join(','),
      search,
      minAmount,
      maxAmount,
      limit,
    ],
    enabled: hasToken,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('period', period);
      params.set('limit', String(limit));
      if (serviceTypes.length > 0) params.set('service_types', serviceTypes.join(','));
      if (statuses.length > 0) params.set('statuses', statuses.join(','));
      if (providers.length > 0) params.set('providers', providers.join(','));
      if (search.trim()) params.set('search', search.trim());
      if (minAmount.trim()) params.set('min_amount', minAmount.trim());
      if (maxAmount.trim()) params.set('max_amount', maxAmount.trim());
      return fetchAdmin<PersonalHubReportsResponse>(`/admin/personal-hub/reports?${params.toString()}`);
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

  return {
    summary: query.data?.data.summary || null,
    filters: query.data?.data.filters || null,
    transactions: query.data?.data.transactions || [],
    transactionsTotal: query.data?.data.transactions_total || 0,
    transactionsReturned: query.data?.data.transactions_returned || 0,
    transactionsTruncated: query.data?.data.transactions_truncated || false,
    charts: query.data?.data.charts || null,
    currencyCode: query.data?.data.currency_code || 'GHS',
    currencySymbol: query.data?.data.currency_symbol || 'GH₵',
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refreshReports: query.refetch,
  };
}
