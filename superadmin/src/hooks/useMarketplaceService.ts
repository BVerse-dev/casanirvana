'use client';

import { useMarketplaceWorkspace } from './useMarketplaceWorkspace';

export const useMarketplaceService = () => {
  const workspace = useMarketplaceWorkspace();

  return {
    metrics: {
      totalTransactions: workspace.metrics.totalOrders,
      revenue: workspace.metrics.grossMerchandiseValue,
      successRate: workspace.metrics.fulfillmentRate,
      activeProviders: workspace.metrics.activeVendors,
      growth: {
        transactions: workspace.metrics.growth.orders,
        revenue: workspace.metrics.growth.revenue,
        successRate: workspace.metrics.growth.fulfillmentRate,
      },
    },
    providers: workspace.vendors,
    recentTransactions: workspace.orders,
    loading: workspace.loading,
    error: workspace.error,
    refetch: workspace.refresh,
  };
};
