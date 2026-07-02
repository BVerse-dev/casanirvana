"use client";

import { useQuery } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

export interface ResidentSummary {
  totalResidents: number;
  activeResidents: number;
  inactiveResidents: number;
  newResidentsThisMonth: number;
  occupancyRate: number;
  averageStayDuration: number;
  pendingApprovals: number;
  maintenanceRequests: number;
}

export interface ResidentDashboardStats {
  monthlyRegistrations: number[];
  monthlyLabels: string[];
  residentsPerSociety: Array<{
    societyName: string;
    count: number;
    percentage: number;
  }>;
  allResidentsPerSociety: Array<{
    societyName: string;
    count: number;
    percentage: number;
  }>;
  residentsPerUnit: Array<{
    unitType: string;
    count: number;
    percentage: number;
  }>;
}

export interface ResidentPerformanceTrends {
  labels: string[];
  satisfactionScores: number[];
  maintenanceResponseTime: number[];
  communityEngagement: number[];
}

export interface ResidentDashboardResident {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string | null;
  unit_number: string;
}

export interface ResidentDashboardRoster {
  featuredResident: ResidentDashboardResident | null;
  recentResidents: ResidentDashboardResident[];
  totalResidents: number;
  communityOptions: string[];
}

type ResidentDashboardPayload = {
  summary: ResidentSummary;
  stats: ResidentDashboardStats;
  performance: ResidentPerformanceTrends;
  roster: ResidentDashboardRoster;
};

const useResidentDashboardQuery = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["admin-dashboard", "residents"],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: ResidentDashboardPayload }>("/admin/dashboard/residents");
      return payload.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useResidentDashboardSnapshot = () => useResidentDashboardQuery();

export const useResidentSummary = () => {
  const query = useResidentDashboardQuery();
  return { ...query, data: query.data?.summary };
};

export const useResidentDashboardStats = () => {
  const query = useResidentDashboardQuery();
  return { ...query, data: query.data?.stats };
};

export const useResidentPerformanceTrends = () => {
  const query = useResidentDashboardQuery();
  return { ...query, data: query.data?.performance };
};

export const useResidentDashboardRoster = () => {
  const query = useResidentDashboardQuery();
  return { ...query, data: query.data?.roster };
};
