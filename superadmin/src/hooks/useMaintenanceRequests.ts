"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";
import type { Database } from "@/lib/database.types";

type MaintenanceRequestUpdatePayload = {
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  assigned_to?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  estimated_cost?: number | null;
  actual_cost?: number | null;
};

export type MaintenanceRequestRecord =
  Database["public"]["Tables"]["maintenance_requests"]["Row"] & {
    requester_profile?: Database["public"]["Tables"]["profiles"]["Row"] | null;
    assigned_profile?: Database["public"]["Tables"]["profiles"]["Row"] | null;
    resolved_by_profile?: Database["public"]["Tables"]["profiles"]["Row"] | null;
    unit?: Database["public"]["Tables"]["units"]["Row"] | null;
  };

const toMaintenanceId = (id: string | number) => {
  const parsedId = Number(id);
  if (!Number.isFinite(parsedId)) {
    throw new Error("Invalid maintenance request id");
  }
  return parsedId;
};

const buildListQuery = (unitId?: string, status?: string) => {
  const params = new URLSearchParams();
  if (unitId) params.set("unit_id", unitId);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `?${query}` : "";
};

const listQueryKey = (unitId?: string, status?: string) =>
  ["admin-maintenance-requests", unitId || "", status || ""] as const;
const detailQueryKey = (id: string | number) =>
  ["admin-maintenance-requests", "detail", String(id)] as const;

export const useListMaintenanceRequests = (unitId?: string, status?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: listQueryKey(unitId, status),
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: MaintenanceRequestRecord[] }>(
        `/admin/maintenance-requests${buildListQuery(unitId, status)}`
      );
      return payload.data || [];
    },
  });
};

export const useGetMaintenanceRequest = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: detailQueryKey(id),
    enabled: hasToken && !!id,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: MaintenanceRequestRecord }>(
        `/admin/maintenance-requests/${toMaintenanceId(id)}`
      );
      return payload.data;
    },
  });
};

export const useUpdateMaintenanceRequest = (id: string) => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: MaintenanceRequestUpdatePayload) => {
      const payload = await fetchAdmin<{ data: MaintenanceRequestRecord }>(
        `/admin/maintenance-requests/${toMaintenanceId(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        }
      );
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-maintenance-requests"] });
      queryClient.invalidateQueries({ queryKey: detailQueryKey(id) });
    },
  });
};

export const useUpdateMaintenanceRequestById = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string | number;
      updates: MaintenanceRequestUpdatePayload;
    }) => {
      const payload = await fetchAdmin<{ data: MaintenanceRequestRecord }>(
        `/admin/maintenance-requests/${toMaintenanceId(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(updates),
        }
      );
      return payload.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-maintenance-requests"] });
      queryClient.invalidateQueries({ queryKey: detailQueryKey(data.id) });
    },
  });
};

export const useDeleteMaintenanceRequest = () => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      await fetchAdmin(`/admin/maintenance-requests/${toMaintenanceId(id)}`, {
        method: "DELETE",
      });
      return String(id);
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-maintenance-requests"] });
      queryClient.removeQueries({ queryKey: detailQueryKey(deletedId) });
    },
  });
};

// Realtime table subscriptions were removed from the browser admin surface.
export const useMaintenanceRequestsSubscription = () => {};
