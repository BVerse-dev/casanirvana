"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";
import type { GuardCommunity } from "@/hooks/useGuardDirectory";

export type GuardProfileRecord = {
  id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  avatar_url?: string | null;
  is_active?: boolean | null;
  status?: string | null;
  shift_type?: string | null;
  employment_date?: string | null;
  community_id?: string | null;
  resolved_community_id?: string | null;
  resolved_community_name?: string | null;
  active_assignment_id?: string | null;
  active_assignment_name?: string | null;
  active_assignment_gate?: string | null;
  active_assignment_shift_type?: string | null;
  assignment_status?: string | null;
  assignment_status_label?: string | null;
  communities?: GuardCommunity | GuardCommunity[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type GuardCommunityRecord = {
  id: string;
  name: string;
  address?: string | null;
  [key: string]: unknown;
};

export type GuardScheduleRecord = {
  id: string;
  guard_id?: string | null;
  community_id?: string | null;
  assigned_date?: string | null;
  end_date?: string | null;
  shift_type?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  post_location?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type GuardAssignmentRecord = {
  id: string;
  guard_id?: string | null;
  community_id?: string | null;
  assignment_name?: string | null;
  shift_type?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  assigned_location?: string | null;
  assigned_gate?: string | null;
  days_of_week?: number[] | null;
  status?: string | null;
  responsibilities?: string[] | null;
  emergency_contact?: string | null;
  special_instructions?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type GuardEquipmentRecord = {
  id: string;
  name?: string | null;
  equipment_type?: string | null;
  serial_number?: string | null;
  assigned_to?: string | null;
  status?: string | null;
  location?: string | null;
  assignment_date?: string | null;
  notes?: string | null;
  cost?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type GuardPerformanceRecord = {
  id: string;
  guard_id?: string | null;
  evaluation_date?: string | null;
  overall_score?: number | string | null;
  attendance_score?: number | string | null;
  punctuality_score?: number | string | null;
  professionalism_score?: number | string | null;
  status?: string | null;
  reviewed_by?: string | null;
  feedback?: string | null;
  improvement_plan?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

export type GuardTrainingRecord = {
  id: string;
  guard_id?: string | null;
  training_name?: string | null;
  training_type?: string | null;
  status?: string | null;
  start_date?: string | null;
  completion_date?: string | null;
  expiry_date?: string | null;
  certification?: string | null;
  score?: number | string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
};

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
  useGuardOperationsResource<GuardProfileRecord>("/admin/guards/profiles", filters);

export const useCreateGuardProfile = () =>
  useCreateMutation("/admin/guards/profiles", "/admin/guards/profiles");

export const useGuardCommunities = () =>
  useGuardOperationsResource<GuardCommunityRecord>("/admin/communities");

export const useGuardSchedules = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource<GuardScheduleRecord>("/admin/guards/schedules", filters);
export const useCreateGuardSchedule = () =>
  useCreateMutation("/admin/guards/schedules", "/admin/guards/schedules");
export const useUpdateGuardSchedule = () =>
  useUpdateMutation("/admin/guards/schedules", "/admin/guards/schedules");
export const useDeleteGuardSchedule = () =>
  useDeleteMutation("/admin/guards/schedules", "/admin/guards/schedules");

export const useGuardAssignments = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource<GuardAssignmentRecord>("/admin/guards/assignments", filters);
export const useCreateGuardAssignment = () =>
  useCreateMutation("/admin/guards/assignments", "/admin/guards/assignments");
export const useUpdateGuardAssignment = () =>
  useUpdateMutation("/admin/guards/assignments", "/admin/guards/assignments");
export const useDeleteGuardAssignment = () =>
  useDeleteMutation("/admin/guards/assignments", "/admin/guards/assignments");

export const useGuardEquipment = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource<GuardEquipmentRecord>("/admin/guards/equipment", filters);
export const useCreateGuardEquipment = () =>
  useCreateMutation("/admin/guards/equipment", "/admin/guards/equipment");
export const useUpdateGuardEquipment = () =>
  useUpdateMutation("/admin/guards/equipment", "/admin/guards/equipment");
export const useDeleteGuardEquipment = () =>
  useDeleteMutation("/admin/guards/equipment", "/admin/guards/equipment");

export const useGuardPerformance = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource<GuardPerformanceRecord>("/admin/guards/performance", filters);
export const useCreateGuardPerformance = () =>
  useCreateMutation("/admin/guards/performance", "/admin/guards/performance");
export const useUpdateGuardPerformance = () =>
  useUpdateMutation("/admin/guards/performance", "/admin/guards/performance");

export const useGuardTraining = (filters?: GuardOperationsFilters) =>
  useGuardOperationsResource<GuardTrainingRecord>("/admin/guards/training", filters);
export const useCreateGuardTraining = () =>
  useCreateMutation("/admin/guards/training", "/admin/guards/training");
export const useUpdateGuardTraining = () =>
  useUpdateMutation("/admin/guards/training", "/admin/guards/training");
