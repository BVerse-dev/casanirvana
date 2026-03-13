"use client";

import { useQuery } from "@tanstack/react-query";

import type { Database } from "@/lib/database.types";

import { useAdminApi } from "./useAdminApi";

type FamilyMemberRow = Pick<
  Database["public"]["Tables"]["family_members"]["Row"],
  "id" | "name" | "phone" | "relation" | "entry_code" | "created_at" | "is_active"
>;

type DailyHelpRow = Pick<
  Database["public"]["Tables"]["daily_help"]["Row"],
  "id" | "name" | "phone" | "type" | "entry_code" | "created_at" | "is_active"
>;

type VehicleRow = Pick<
  Database["public"]["Tables"]["vehicles"]["Row"],
  "id" | "vehicle_number" | "model" | "color" | "entry_code" | "created_at" | "is_active"
>;

type FrequentEntryRow = Pick<
  Database["public"]["Tables"]["frequent_entries"]["Row"],
  "id" | "name" | "phone" | "relation" | "entry_code" | "created_at" | "is_active"
>;

export type ResidentDirectoryEntries = {
  familyMembers: FamilyMemberRow[];
  dailyHelp: DailyHelpRow[];
  vehicles: VehicleRow[];
  frequentEntries: FrequentEntryRow[];
};

type ResidentDirectoryPayload = {
  data: ResidentDirectoryEntries;
};

const EMPTY_ENTRIES: ResidentDirectoryEntries = {
  familyMembers: [],
  dailyHelp: [],
  vehicles: [],
  frequentEntries: [],
};

export const useResidentDirectoryEntries = (residentId?: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["resident-directory-entries", residentId],
    enabled: hasToken && Boolean(residentId),
    queryFn: async (): Promise<ResidentDirectoryEntries> => {
      if (!residentId) {
        return EMPTY_ENTRIES;
      }

      const response = await fetchAdmin<ResidentDirectoryPayload>(`/admin/residents/${residentId}/directory`);
      return response.data;
    },
  });
};
