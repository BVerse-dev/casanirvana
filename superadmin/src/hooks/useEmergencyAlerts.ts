import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import type { PostgrestError } from "@supabase/supabase-js";

type EmergencyAlert = Database["public"]["Tables"]["emergency_alerts"]["Row"];
type EmergencyAlertInsert =
  Database["public"]["Tables"]["emergency_alerts"]["Insert"];
type EmergencyAlertUpdate =
  Database["public"]["Tables"]["emergency_alerts"]["Update"];

type EmergencyActorContext = {
  profileId: string;
  communityId: string | null;
};

const isNotFoundError = (error: PostgrestError | null) => error?.code === "PGRST116";

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

// List all emergency alerts
export const useListEmergencyAlerts = (communityId?: string, status?: string) => {
  return useQuery({
    queryKey: ["emergency_alerts", communityId, status],
    queryFn: async () => {
      let query = supabase
        .from("emergency_alerts")
        .select(
          `
          *,
          communities:community_id(name),
          units:unit_id(block, number),
          user_profile:user_id(first_name, last_name, email, phone),
          resolved_by_profile:resolved_by(first_name, last_name, email, phone)
        `,
        )
        .order("created_at", { ascending: false });

      if (communityId) {
        query = query.eq("community_id", communityId);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

// Get single emergency alert
export const useGetEmergencyAlert = (id: string) => {
  return useQuery({
    queryKey: ["emergency_alerts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_alerts")
        .select(
          `
          *,
          communities:community_id(name),
          units:unit_id(block, number),
          user_profile:user_id(first_name, last_name, email, phone),
          resolved_by_profile:resolved_by(first_name, last_name, email, phone)
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

// Create emergency alert
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
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_alerts"] });
    },
  });
};

// Update emergency alert
export const useUpdateEmergencyAlert = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: EmergencyAlertUpdate) => {
      const { data, error } = await supabase
        .from("emergency_alerts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_alerts"] });
      queryClient.invalidateQueries({ queryKey: ["emergency_alerts", id] });
    },
  });
};

// Delete emergency alert
export const useDeleteEmergencyAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("emergency_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_alerts"] });
    },
  });
};
