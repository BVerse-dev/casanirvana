"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";

export type Service = Database["public"]["Tables"]["services"]["Row"];
type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

// List all services
export const useListServices = (communityId?: string) => {
  return useQuery({
    queryKey: ["services", communityId],
    queryFn: async () => {
      let query = supabase
        .from("services")
        .select(`
          *,
          communities:community_id(name)
        `)
        .order("created_at", { ascending: false });

      if (communityId) {
        query = query.eq("community_id", communityId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },
  });
};

// Get single service
export const useGetService = (id: string) => {
  return useQuery({
    queryKey: ["services", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          communities:community_id(name)
        `)
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create service
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newService: ServiceInsert) => {
      const { data, error } = await supabase
        .from("services")
        .insert(newService)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

// Update service
export const useUpdateService = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: ServiceUpdate) => {
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", id] });
    },
  });
};

// Delete service
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
