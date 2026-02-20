import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

type EmergencyAlert = Database["public"]["Tables"]["emergency_alerts"]["Row"];
type EmergencyAlertInsert =
  Database["public"]["Tables"]["emergency_alerts"]["Insert"];
type EmergencyAlertUpdate =
  Database["public"]["Tables"]["emergency_alerts"]["Update"];

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
          user_profile:user_id(first_name, last_name),
          resolved_by_profile:resolved_by(first_name, last_name)
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
          user_profile:user_id(first_name, last_name, email),
          resolved_by_profile:resolved_by(first_name, last_name, email)
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
      const { data, error } = await supabase
        .from("emergency_alerts")
        .insert(newAlert)
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
