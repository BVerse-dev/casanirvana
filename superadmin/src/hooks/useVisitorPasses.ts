"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { avatars } from "@/assets/images/users";
import { useEffect } from "react";

type VisitorPass = Database["public"]["Tables"]["visitor_passes"]["Row"];
type VisitorPassInsert =
  Database["public"]["Tables"]["visitor_passes"]["Insert"];
type VisitorPassUpdate =
  Database["public"]["Tables"]["visitor_passes"]["Update"];

type ActorProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "user_id" | "first_name" | "last_name" | "full_name" | "email" | "phone" | "avatar_url"
>;

type UserStatsRow = Database["public"]["Views"]["users_with_preference_stats"]["Row"];

const splitName = (value?: string | null) => {
  if (!value) return { firstName: "", lastName: "" };
  const parts = value.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

const buildDisplayName = (
  profile?: Partial<ActorProfileRow> | null,
  stats?: Partial<UserStatsRow> | null,
  fallback = "Unknown"
) => {
  const profileFullName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  return profileFullName || stats?.user_name || fallback;
};

const toProfileShape = (
  actorId: string | null,
  profile?: Partial<ActorProfileRow> | null,
  stats?: Partial<UserStatsRow> | null
) => {
  const displayName = buildDisplayName(profile, stats, actorId ? `User ${actorId.slice(0, 8)}` : "Unknown");
  const split = splitName(displayName);

  return {
    first_name: profile?.first_name || split.firstName,
    last_name: profile?.last_name || split.lastName,
    full_name: displayName,
    email: profile?.email || stats?.email || undefined,
    phone: profile?.phone || undefined,
    avatar_url: profile?.avatar_url || undefined,
  };
};

const buildUnitLabel = (unit: any) => {
  const block = unit?.block;
  const number = unit?.number || unit?.unit_number;
  if (block && number) return `${block}-${number}`;
  return number || "N/A";
};

const enrichVisitorPasses = async (passes: any[]) => {
  if (!passes?.length) return [];

  const actorIds = Array.from(
    new Set(
      passes
        .flatMap((pass) => [pass.created_by, pass.approved_by, pass.checked_in_by, pass.checked_out_by])
        .filter(Boolean)
    )
  ) as string[];

  const agencyIds = Array.from(
    new Set(
      passes
        .map((pass) => pass.units?.community?.agency_id)
        .filter(Boolean)
    )
  ) as string[];

  const [
    profilesByUserIdResult,
    profilesByIdResult,
    userStatsResult,
    agenciesResult,
  ] = await Promise.all([
    actorIds.length
      ? supabase
          .from("profiles")
          .select("id, user_id, first_name, last_name, full_name, email, phone, avatar_url")
          .in("user_id", actorIds)
      : Promise.resolve({ data: [], error: null } as any),
    actorIds.length
      ? supabase
          .from("profiles")
          .select("id, user_id, first_name, last_name, full_name, email, phone, avatar_url")
          .in("id", actorIds)
      : Promise.resolve({ data: [], error: null } as any),
    actorIds.length
      ? supabase
          .from("users_with_preference_stats")
          .select("id, user_name, email, user_role")
          .in("id", actorIds)
      : Promise.resolve({ data: [], error: null } as any),
    agencyIds.length
      ? supabase
          .from("agencies")
          .select("id, name")
          .in("id", agencyIds)
      : Promise.resolve({ data: [], error: null } as any),
  ]);

  if (profilesByUserIdResult.error) {
    console.warn("Unable to enrich visitor actors by profiles.user_id:", profilesByUserIdResult.error.message);
  }
  if (profilesByIdResult.error) {
    console.warn("Unable to enrich visitor actors by profiles.id:", profilesByIdResult.error.message);
  }
  if (userStatsResult.error) {
    console.warn("Unable to enrich visitor actors by users_with_preference_stats:", userStatsResult.error.message);
  }
  if (agenciesResult.error) {
    console.warn("Unable to enrich visitor agencies:", agenciesResult.error.message);
  }

  const profileByActorId = new Map<string, ActorProfileRow>();
  for (const row of (profilesByUserIdResult.data || []) as ActorProfileRow[]) {
    if (row.user_id) profileByActorId.set(row.user_id, row);
  }
  for (const row of (profilesByIdResult.data || []) as ActorProfileRow[]) {
    profileByActorId.set(row.id, row);
  }

  const userStatsById = new Map<string, UserStatsRow>();
  for (const row of (userStatsResult.data || []) as UserStatsRow[]) {
    if (row.id) userStatsById.set(row.id, row);
  }

  const agencyNameById = new Map<string, string>();
  for (const row of agenciesResult.data || []) {
    if (row.id) agencyNameById.set(row.id, row.name);
  }

  const resolveActor = (actorId: string | null) => ({
    profile: actorId ? profileByActorId.get(actorId) : undefined,
    stats: actorId ? userStatsById.get(actorId) : undefined,
  });

  return passes.map((pass) => {
    const createdBy = resolveActor(pass.created_by);
    const approvedBy = resolveActor(pass.approved_by);
    const checkedInBy = resolveActor(pass.checked_in_by);
    const checkedOutBy = resolveActor(pass.checked_out_by);

    const createdByDisplay = buildDisplayName(
      createdBy.profile,
      createdBy.stats,
      pass.created_by ? `User ${pass.created_by.slice(0, 8)}` : "Unknown"
    );

    const communityName = pass.units?.community?.name || undefined;
    const agencyId = pass.units?.community?.agency_id || undefined;
    const agencyName = agencyId ? agencyNameById.get(agencyId) : undefined;

    return {
      ...pass,
      unit_label: buildUnitLabel(pass.units),
      community_name: communityName,
      agency_id: agencyId,
      agency_name: agencyName,
      visitor_profile: {
        avatar_url: avatars.avatar1,
        full_name: pass.visitor_name,
      },
      host_profile: {
        full_name: createdByDisplay,
      },
      created_by_display: createdByDisplay,
      approved_by_display: buildDisplayName(approvedBy.profile, approvedBy.stats),
      checked_in_by_display: buildDisplayName(checkedInBy.profile, checkedInBy.stats),
      checked_out_by_display: buildDisplayName(checkedOutBy.profile, checkedOutBy.stats),
      created_by_profile: toProfileShape(pass.created_by, createdBy.profile, createdBy.stats),
      approved_by_profile: toProfileShape(pass.approved_by, approvedBy.profile, approvedBy.stats),
      checked_in_by_profile: toProfileShape(pass.checked_in_by, checkedInBy.profile, checkedInBy.stats),
      checked_out_by_profile: toProfileShape(pass.checked_out_by, checkedOutBy.profile, checkedOutBy.stats),
    };
  });
};

export const getCurrentAuthUserId = async (): Promise<string> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user?.id) {
    throw new Error("Missing authenticated admin session. Please sign in again.");
  }

  return user.id;
};

// List all visitor passes
export const useListVisitorPasses = (unitId?: string, status?: string) => {
  return useQuery({
    queryKey: ["visitor_passes", unitId, status],
    queryFn: async () => {
      let query = supabase
        .from("visitor_passes")
        .select(`
          *,
          units (
            id,
            block,
            number,
            unit_number,
            community_id,
            community:communities!units_community_id_fkey (
              id,
              name,
              agency_id
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (unitId) {
        query = query.eq("unit_id", unitId);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return enrichVisitorPasses(data || []);
    },
  });
};

// Get single visitor pass
export const useGetVisitorPass = (id: string) => {
  return useQuery({
    queryKey: ["visitor_passes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_passes")
        .select(`
          *,
          units (
            id,
            block,
            number,
            unit_number,
            community_id,
            community:communities!units_community_id_fkey (
              id,
              name,
              agency_id
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Visitor pass not found');

      const [enriched] = await enrichVisitorPasses([data]);
      return enriched;
    },
    enabled: !!id,
  });
};

// Create visitor pass
export const useCreateVisitorPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPass: VisitorPassInsert) => {
      const { data, error } = await supabase
        .from("visitor_passes")
        .insert(newPass)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor_passes"] });
    },
  });
};

// Update visitor pass
export const useUpdateVisitorPass = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: VisitorPassUpdate) => {
      const { data, error } = await supabase
        .from("visitor_passes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor_passes"] });
      queryClient.invalidateQueries({ queryKey: ["visitor_passes", id] });
    },
  });
};

// Delete visitor pass
export const useDeleteVisitorPass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("visitor_passes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitor_passes"] });
    },
  });
};

// Visitor pass lifecycle actions
export const useVisitorPassLifecycleActions = (id: string) => {
  const updateVisitorPass = useUpdateVisitorPass(id);
  const deleteVisitorPass = useDeleteVisitorPass();

  const applyUpdate = async (updates: VisitorPassUpdate) => {
    if (!id) throw new Error("Missing visitor pass ID");
    return updateVisitorPass.mutateAsync({
      ...updates,
      updated_at: new Date().toISOString(),
    });
  };

  const approve = async () => {
    const actorId = await getCurrentAuthUserId();
    return applyUpdate({
      status: "approved",
      approved_by: actorId,
    });
  };

  const deny = async () => {
    const actorId = await getCurrentAuthUserId();
    return applyUpdate({
      status: "denied",
      approved_by: actorId,
    });
  };

  const checkIn = async () => {
    const actorId = await getCurrentAuthUserId();
    const now = new Date().toISOString();
    return applyUpdate({
      status: "checked_in",
      checked_in_at: now,
      checked_in_by: actorId,
      actual_entry_time: now,
    });
  };

  const checkOut = async () => {
    const actorId = await getCurrentAuthUserId();
    const now = new Date().toISOString();
    return applyUpdate({
      status: "checked_out",
      checked_out_at: now,
      checked_out_by: actorId,
      actual_exit_time: now,
    });
  };

  const remove = async () => {
    if (!id) throw new Error("Missing visitor pass ID");
    return deleteVisitorPass.mutateAsync(id);
  };

  return {
    approve,
    deny,
    checkIn,
    checkOut,
    remove,
    isUpdating: updateVisitorPass.isPending,
    isDeleting: deleteVisitorPass.isPending,
    isPending: updateVisitorPass.isPending || deleteVisitorPass.isPending,
  };
};

// Real-time subscription for visitor passes
export const useVisitorPassesSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('visitor_passes_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'visitor_passes' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['visitor_passes'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
