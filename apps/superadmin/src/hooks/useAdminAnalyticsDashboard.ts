"use client";

import { useQuery } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

export interface AnalyticsDashboardSummary {
  totalUnits: number;
  occupiedRate: number;
  cumulativeUnitSeries: number[];
  activeResidents: number;
  cumulativeResidentSeries: number[];
}

export interface AnalyticsVisitorActivity {
  dailyApprovedSeries: number[];
  todayApprovedCount: number;
  weeklyApprovedCount: number;
  weeklyApprovedPercentage: number;
  dayOverDayChangePercentage: number | null;
}

export interface AnalyticsCommunityDistributionItem {
  id: string;
  name: string;
  count: number;
  occupancyRate: number;
  percentage: number;
}

export interface AnalyticsDashboardPayload {
  summary: AnalyticsDashboardSummary;
  visitorActivity: AnalyticsVisitorActivity;
  communityDistribution: AnalyticsCommunityDistributionItem[];
}

export const useAdminAnalyticsDashboard = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["admin-dashboard", "analytics"],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: AnalyticsDashboardPayload }>("/admin/dashboard/analytics");
      return payload.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};
