'use client';

import { useMemo } from 'react';

import { useAdminPersonalHubCatalog } from './useAdminPersonalHubCatalog';
import { PersonalHubReportsPeriod, usePersonalHubReports } from './usePersonalHubReports';

export interface PersonalHubServiceMetrics {
  totalTransactions: number;
  revenue: number;
  successRate: number;
  activeProviders: number;
  growth: {
    transactions: number;
    revenue: number;
    successRate: number;
  };
}

export const usePersonalHubServiceMetrics = (
  serviceType: string,
  period: PersonalHubReportsPeriod = '30'
) => {
  const reports = usePersonalHubReports({
    period,
    serviceTypes: [serviceType],
    limit: 25,
  });
  const catalog = useAdminPersonalHubCatalog({ serviceType });

  const activeProviders = useMemo(
    () => catalog.providers.filter((provider) => provider.is_active && provider.is_enabled_for_app),
    [catalog.providers]
  );

  const metrics = useMemo<PersonalHubServiceMetrics>(() => ({
    totalTransactions: reports.summary?.total_transactions || 0,
    revenue: reports.summary?.total_volume || 0,
    successRate: reports.summary?.average_success_rate || 0,
    activeProviders: activeProviders.length,
    growth: {
      transactions: reports.summary?.growth.total_transactions || 0,
      revenue: reports.summary?.growth.total_volume || 0,
      successRate: reports.summary?.growth.average_success_rate || 0,
    },
  }), [activeProviders.length, reports.summary]);

  return {
    metrics,
    providers: activeProviders,
    allProviders: catalog.providers,
    recentTransactions: reports.transactions.slice(0, 10),
    loading: reports.loading || catalog.loading,
    error: reports.error || catalog.error,
    refetch: async () => {
      await Promise.all([reports.refreshReports()]);
    },
  };
};
