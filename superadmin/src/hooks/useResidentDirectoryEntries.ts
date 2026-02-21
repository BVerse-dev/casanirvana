"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

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

const EMPTY_ENTRIES: ResidentDirectoryEntries = {
  familyMembers: [],
  dailyHelp: [],
  vehicles: [],
  frequentEntries: [],
};

const sortByNewest = <T extends { created_at: string | null }>(rows: T[]) =>
  rows.slice().sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

export const useResidentDirectoryEntries = (residentId?: string, residentUserId?: string | null) => {
  return useQuery({
    queryKey: ["resident-directory-entries", residentId, residentUserId],
    enabled: Boolean(residentId),
    queryFn: async (): Promise<ResidentDirectoryEntries> => {
      const actorIds = Array.from(
        new Set([residentUserId, residentId].filter((value): value is string => Boolean(value)))
      );

      if (!actorIds.length) {
        return EMPTY_ENTRIES;
      }

      const [familyResult, dailyHelpResult, vehiclesResult, frequentEntriesResult] = await Promise.all([
        supabase
          .from("family_members")
          .select("id, name, phone, relation, entry_code, created_at, is_active")
          .in("user_id", actorIds),
        supabase
          .from("daily_help")
          .select("id, name, phone, type, entry_code, created_at, is_active")
          .in("user_id", actorIds),
        supabase
          .from("vehicles")
          .select("id, vehicle_number, model, color, entry_code, created_at, is_active")
          .in("user_id", actorIds),
        supabase
          .from("frequent_entries")
          .select("id, name, phone, relation, entry_code, created_at, is_active")
          .in("user_id", actorIds),
      ]);

      const firstError =
        familyResult.error ||
        dailyHelpResult.error ||
        vehiclesResult.error ||
        frequentEntriesResult.error;

      if (firstError) {
        throw firstError;
      }

      const familyMembers = sortByNewest(
        (familyResult.data || []).filter((entry) => entry.is_active !== false)
      ) as FamilyMemberRow[];
      const dailyHelp = sortByNewest(
        (dailyHelpResult.data || []).filter((entry) => entry.is_active !== false)
      ) as DailyHelpRow[];
      const vehicles = sortByNewest(
        (vehiclesResult.data || []).filter((entry) => entry.is_active !== false)
      ) as VehicleRow[];
      const frequentEntries = sortByNewest(
        (frequentEntriesResult.data || []).filter((entry) => entry.is_active !== false)
      ) as FrequentEntryRow[];

      return {
        familyMembers,
        dailyHelp,
        vehicles,
        frequentEntries,
      };
    },
  });
};

