"use client";

import { useQuery } from "@tanstack/react-query";

import { useAdminApi } from "./useAdminApi";

export interface ResidentActivity {
  id: string;
  type: "payment" | "service" | "maintenance" | "activity";
  title: string;
  status: string;
  created_at: string | null;
  amount?: number;
  description?: string | null;
}

export interface ResidentActivityStats {
  totalRequests: number;
  paymentsMade: number;
  activeServices: number;
  completedPayments: number;
  pendingPayments: number;
}

type ResidentActivityPayload = {
  data: {
    summary: ResidentActivityStats;
    recent: ResidentActivity[];
  };
};

const EMPTY_STATS: ResidentActivityStats = {
  totalRequests: 0,
  paymentsMade: 0,
  activeServices: 0,
  completedPayments: 0,
  pendingPayments: 0,
};

export const useResidentActivitySnapshot = (residentId: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["resident-activity-snapshot", residentId],
    queryFn: async () => {
      if (!residentId) {
        return {
          summary: EMPTY_STATS,
          recent: [] as ResidentActivity[],
        };
      }

      const response = await fetchAdmin<ResidentActivityPayload>(`/admin/residents/${residentId}/activity`);
      return response.data;
    },
    enabled: hasToken && !!residentId,
  });
};

export const useResidentActivities = (residentId: string) => {
  const snapshotQuery = useResidentActivitySnapshot(residentId);

  return {
    ...snapshotQuery,
    data: snapshotQuery.data?.recent || [],
  };
};

export const useResidentActivityStats = (residentId: string) => {
  const snapshotQuery = useResidentActivitySnapshot(residentId);

  return {
    ...snapshotQuery,
    data: snapshotQuery.data?.summary || EMPTY_STATS,
  };
};
