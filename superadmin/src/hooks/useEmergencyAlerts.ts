"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type EmergencyAlertRow = Database["public"]["Tables"]["emergency_alerts"]["Row"];
type EmergencyAlertInsert = Database["public"]["Tables"]["emergency_alerts"]["Insert"];
type EmergencyAlertUpdate = Database["public"]["Tables"]["emergency_alerts"]["Update"];
type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "first_name" | "last_name" | "email" | "phone" | "avatar_url" | "user_id"
>;
type Community = Pick<Database["public"]["Tables"]["communities"]["Row"], "id" | "name">;
type Unit = Pick<Database["public"]["Tables"]["units"]["Row"], "id" | "block" | "number" | "unit_number">;

export type EmergencyAlertStatus = "pending" | "active" | "investigating" | "escalated" | "resolved";

export type EmergencyAlertRecord = EmergencyAlertRow & {
  communities?: Community | null;
  units?: Unit | null;
  user_profile?: Profile | null;
  resolved_by_profile?: Profile | null;
};

type EmergencyActorContext = {
  profileId: string;
  communityId: string | null;
};

const EMERGENCY_ALERT_SELECT = `
  *,
  communities:communities!emergency_alerts_society_id_fkey (
    id,
    name
  ),
  units:units!emergency_alerts_unit_id_fkey (
    id,
    block,
    number,
    unit_number
  ),
  user_profile:profiles!emergency_alerts_user_id_fkey (
    id,
    first_name,
    last_name,
    email,
    phone,
    avatar_url,
    user_id
  ),
  resolved_by_profile:profiles!emergency_alerts_resolved_by_fkey (
    id,
    first_name,
    last_name,
    email,
    phone,
    avatar_url,
    user_id
  )
`;

let emergencyAlertsChannel: ReturnType<typeof supabase.channel> | null = null;
let emergencyAlertsSubscriberCount = 0;

const isNotFoundError = (error: PostgrestError | null) => error?.code === "PGRST116";

export const normalizeEmergencyAlertStatus = (value?: string | null): EmergencyAlertStatus => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  switch (normalized) {
    case "pending":
    case "active":
    case "investigating":
    case "escalated":
    case "resolved":
      return normalized;
    default:
      return "active";
  }
};

export const formatEmergencyAlertStatusLabel = (value?: string | null) =>
  normalizeEmergencyAlertStatus(value)
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const resolveProfileByAuthId = async (authUserId: string) => {
  const byUserId = await supabase
    .from("profiles")
    .select("id, user_id, community_id")
    .eq("user_id", authUserId)
    .maybeSingle();

  if (byUserId.error && !isNotFoundError(byUserId.error)) {
    throw byUserId.error;
  }
  if (byUserId.data) {
    return byUserId.data;
  }

  const byId = await supabase
    .from("profiles")
    .select("id, user_id, community_id")
    .eq("id", authUserId)
    .maybeSingle();

  if (byId.error && !isNotFoundError(byId.error)) {
    throw byId.error;
  }
  if (byId.data) {
    return byId.data;
  }

  throw new Error("Authenticated admin profile not found");
};

const resolveEmergencyActorContext = async (): Promise<EmergencyActorContext> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user?.id) {
    throw new Error("Missing authenticated admin session");
  }

  const profile = await resolveProfileByAuthId(user.id);
  return {
    profileId: profile.id,
    communityId: profile.community_id,
  };
};

const useEmergencyAlertsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    emergencyAlertsSubscriberCount += 1;

    if (!emergencyAlertsChannel) {
      emergencyAlertsChannel = supabase
        .channel("superadmin-emergency-alerts")
        .on("postgres_changes", { event: "*", schema: "public", table: "emergency_alerts" }, () => {
          queryClient.invalidateQueries({ queryKey: ["emergency_alerts"] });
          queryClient.invalidateQueries({ queryKey: ["emergency_alert"] });
        })
        .subscribe();
    }

    return () => {
      emergencyAlertsSubscriberCount -= 1;

      if (emergencyAlertsSubscriberCount <= 0 && emergencyAlertsChannel) {
        supabase.removeChannel(emergencyAlertsChannel);
        emergencyAlertsChannel = null;
        emergencyAlertsSubscriberCount = 0;
      }
    };
  }, [queryClient]);
};

export const useListEmergencyAlerts = (communityId?: string, status?: string) => {
  useEmergencyAlertsRealtime();

  return useQuery({
    queryKey: ["emergency_alerts", communityId || "all", status || "all"],
    queryFn: async (): Promise<EmergencyAlertRecord[]> => {
      let query = supabase
        .from("emergency_alerts")
        .select(EMERGENCY_ALERT_SELECT)
        .order("created_at", { ascending: false });

      if (communityId) {
        query = query.eq("community_id", communityId);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as EmergencyAlertRecord[];
    },
  });
};

export const useGetEmergencyAlert = (id: string) => {
  useEmergencyAlertsRealtime();

  return useQuery({
    queryKey: ["emergency_alert", id],
    queryFn: async (): Promise<EmergencyAlertRecord | null> => {
      const { data, error } = await supabase.from("emergency_alerts").select(EMERGENCY_ALERT_SELECT).eq("id", id).single();
      if (error) throw error;
      return data as EmergencyAlertRecord;
    },
    enabled: Boolean(id),
  });
};

export const useCreateEmergencyAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAlert: EmergencyAlertInsert) => {
      const actorContext = await resolveEmergencyActorContext();
      const payload: EmergencyAlertInsert = {
        ...newAlert,
        user_id: newAlert.user_id || actorContext.profileId,
        community_id: newAlert.community_id || actorContext.communityId,
        status: newAlert.status || "active",
        priority: newAlert.priority || "medium",
      };

      if (!payload.community_id) {
        throw new Error("No community scope is available for this admin account");
      }

      const { data, error } = await supabase
        .from("emergency_alerts")
        .insert(payload)
        .select(EMERGENCY_ALERT_SELECT)
        .single();

      if (error) throw error;
      return data as EmergencyAlertRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_alerts"] });
    },
  });
};

export const useUpdateEmergencyAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: EmergencyAlertUpdate & { id: string }) => {
      const actorContext = await resolveEmergencyActorContext();
      const payload: EmergencyAlertUpdate = { ...updates };

      if (normalizeEmergencyAlertStatus(payload.status) === "resolved") {
        payload.resolved_at = payload.resolved_at || new Date().toISOString();
        payload.resolved_by = payload.resolved_by || actorContext.profileId;
      }

      const { data, error } = await supabase
        .from("emergency_alerts")
        .update(payload)
        .eq("id", id)
        .select(EMERGENCY_ALERT_SELECT)
        .single();

      if (error) throw error;
      return data as EmergencyAlertRecord;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["emergency_alerts"] });
      queryClient.invalidateQueries({ queryKey: ["emergency_alert", variables.id] });
    },
  });
};

export const useDeleteEmergencyAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("emergency_alerts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_alerts"] });
      queryClient.invalidateQueries({ queryKey: ["emergency_alert"] });
    },
  });
};
