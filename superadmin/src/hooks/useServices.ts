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
      console.log('🔍 useListServices - Starting query, communityId:', communityId);
      
      // First try a simple query to test table access
      console.log('🔍 useListServices - Testing simple table access...');
      const simpleTest = await supabase
        .from("services")
        .select("id, name")
        .limit(1);
      
      console.log('🔍 useListServices - Simple test result:', simpleTest);
      
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

      console.log('🔍 useListServices - About to execute query');
      const { data, error } = await query;

      console.log('🔍 useListServices - Query result:');
      console.log('  - Data:', data);
      console.log('  - Error:', error);
      console.log('  - Count:', data?.length);

      if (error) {
        console.error('❌ useListServices - Error details:', error);
        console.error('❌ useListServices - Error message:', error.message);
        console.error('❌ useListServices - Error code:', error.code);
        throw error;
      }
      
      console.log('✅ useListServices - Success:', data?.length || 0, 'services found');
      console.log('✅ useListServices - Services data:', data);
      return data;
    },
  });
};

// Get single service
export const useGetService = (id: string) => {
  return useQuery({
    queryKey: ["services", id],
    queryFn: async () => {
      console.log('🔍 Fetching service with ID:', id, 'Type:', typeof id);
      
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          communities:community_id(name)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error('❌ Error fetching service:', error);
        throw error;
      }
      
      console.log('✅ Fetched service:', data);
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
