"use client";

import { useQuery } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";
import type { GuardDirectoryItem } from "@/hooks/useGuardDirectory";
import type {
  GuardAssignmentRecord,
  GuardEquipmentRecord,
  GuardPerformanceRecord,
  GuardScheduleRecord,
  GuardTrainingRecord,
} from "@/hooks/useGuardOperations";

const buildGuardQuery = (guardId: string) => {
  const params = new URLSearchParams();
  params.set("guard_id", guardId);
  return `?${params.toString()}`;
};

export type GuardDetailSnapshot = {
  guard: GuardDirectoryItem;
  assignments: GuardAssignmentRecord[];
  schedules: GuardScheduleRecord[];
  equipment: GuardEquipmentRecord[];
  performance: GuardPerformanceRecord[];
  training: GuardTrainingRecord[];
};

export const useGuardDetailSnapshot = (guardId: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["guard-detail-snapshot", guardId],
    enabled: hasToken && !!guardId,
    queryFn: async (): Promise<GuardDetailSnapshot> => {
      const query = buildGuardQuery(guardId);
      const [
        guardPayload,
        assignmentsPayload,
        schedulesPayload,
        equipmentPayload,
        performancePayload,
        trainingPayload,
      ] = await Promise.all([
        fetchAdmin<{ data: GuardDirectoryItem[] }>(`/admin/guards/profiles${query}`),
        fetchAdmin<{ data: GuardAssignmentRecord[] }>(`/admin/guards/assignments${query}`),
        fetchAdmin<{ data: GuardScheduleRecord[] }>(`/admin/guards/schedules${query}`),
        fetchAdmin<{ data: GuardEquipmentRecord[] }>(`/admin/guards/equipment${query}`),
        fetchAdmin<{ data: GuardPerformanceRecord[] }>(`/admin/guards/performance${query}`),
        fetchAdmin<{ data: GuardTrainingRecord[] }>(`/admin/guards/training${query}`),
      ]);

      const guard = guardPayload.data?.[0];
      if (!guard) {
        throw new Error("Guard not found");
      }

      return {
        guard,
        assignments: assignmentsPayload.data || [],
        schedules: schedulesPayload.data || [],
        equipment: equipmentPayload.data || [],
        performance: performancePayload.data || [],
        training: trainingPayload.data || [],
      };
    },
  });
};
