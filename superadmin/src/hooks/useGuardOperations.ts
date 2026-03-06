"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

type GuardOperationsFilters = {
  communityId?: string;
  guardId?: string;
  search?: string;
};

const buildQuery = (filters?: GuardOperationsFilters) => {
  const params = new URLSearchParams();
  if (filters?.communityId) params.set("community_id", filters.communityId);
  if (filters?.guardId) params.set("guard_id", filters.guardId);
  if (filters?.search) params.set("search", filters.search);
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const useGuardOperationsResource = <TData = any>(
  path: string,
  filters?: GuardOperationsFilters
) => {
  const { fetchAdmin, hasToken } = useAdminApi();
  return useQuery({
    queryKey: ["guard-operations", path, filters || {}],
    enabled: hasToken,
    queryFn: async () => {
      const payload = await fetchAdmin<{ data: TData[] }>(`${path}${buildQuery(filters)}`);
      return payload.data || [];
    },
  });
};

const useCreateMutation = (resourceKey: string, path: string) => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await fetchAdmin<{ data: any }>(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guard-operations", resourceKey] });
    },
  });
};

const useUpdateMutation = (resourceKey: string, path: string) => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => {
      const response = await fetchAdmin<{ data: any }>(`${path}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guard-operations", resourceKey] });
    },
  });
};

const useDeleteMutation = (resourceKey: string, path: string) => {
  const { fetchAdmin } = useAdminApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`${path}/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guard-operations", resourceKey] });
    },
  });
};

export const useGuardProfiles = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource("/admin/guards/profiles", filters);

export const useGuardCommunities = () =>
  useGuardOperationsResource("/admin/communities");

export const useGuardSchedules = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource("/admin/guards/schedules", filters);
export const useCreateGuardSchedule = () =>
  useCreateMutation("/admin/guards/schedules", "/admin/guards/schedules");
export const useUpdateGuardSchedule = () =>
  useUpdateMutation("/admin/guards/schedules", "/admin/guards/schedules");
export const useDeleteGuardSchedule = () =>
  useDeleteMutation("/admin/guards/schedules", "/admin/guards/schedules");

export const useGuardAssignments = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource("/admin/guards/assignments", filters);
export const useCreateGuardAssignment = () =>
  useCreateMutation("/admin/guards/assignments", "/admin/guards/assignments");
export const useUpdateGuardAssignment = () =>
  useUpdateMutation("/admin/guards/assignments", "/admin/guards/assignments");
export const useDeleteGuardAssignment = () =>
  useDeleteMutation("/admin/guards/assignments", "/admin/guards/assignments");

export const useGuardEquipment = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource("/admin/guards/equipment", filters);
export const useCreateGuardEquipment = () =>
  useCreateMutation("/admin/guards/equipment", "/admin/guards/equipment");
export const useUpdateGuardEquipment = () =>
  useUpdateMutation("/admin/guards/equipment", "/admin/guards/equipment");
export const useDeleteGuardEquipment = () =>
  useDeleteMutation("/admin/guards/equipment", "/admin/guards/equipment");

export const useGuardPerformance = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource("/admin/guards/performance", filters);
export const useCreateGuardPerformance = () =>
  useCreateMutation("/admin/guards/performance", "/admin/guards/performance");
export const useUpdateGuardPerformance = () =>
  useUpdateMutation("/admin/guards/performance", "/admin/guards/performance");

export const useGuardTraining = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource("/admin/guards/training", filters);
export const useCreateGuardTraining = () =>
  useCreateMutation("/admin/guards/training", "/admin/guards/training");
export const useUpdateGuardTraining = () =>
  useUpdateMutation("/admin/guards/training", "/admin/guards/training");
