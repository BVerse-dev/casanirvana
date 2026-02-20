"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { useEffect } from "react";

type MaintenanceRequest =
  Database["public"]["Tables"]["maintenance_requests"]["Row"];
type MaintenanceRequestInsert =
  Database["public"]["Tables"]["maintenance_requests"]["Insert"];
type MaintenanceRequestUpdate =
  Database["public"]["Tables"]["maintenance_requests"]["Update"];

// Mock data has been replaced with real database integration

// List all maintenance requests
export const useListMaintenanceRequests = (
  unitId?: string,
  status?: string,
) => {
  return useQuery({
    queryKey: ["maintenance_requests", unitId, status],
    queryFn: async () => {
      let query = supabase
        .from("maintenance_requests")
        .select(`
          *,
          requester_profile:profiles!maintenance_requests_requested_by_fkey(
            id,
            first_name,
            last_name,
            full_name,
            email,
            avatar_url,
            phone,
            role
          ),
          unit:units!maintenance_requests_unit_id_fkey(
            id,
            block,
            unit_number,
            community_id,
            owner_id,
            floor_area,
            bedrooms,
            bathrooms
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
      return data || [];
    },
  });
};

// Get single maintenance request
export const useGetMaintenanceRequest = (id: string) => {
  return useQuery({
    queryKey: ["maintenance_requests", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          requester_profile:profiles!maintenance_requests_requested_by_fkey(
            id,
            first_name,
            last_name,
            full_name,
            email,
            avatar_url,
            phone,
            role
          ),
          unit:units!maintenance_requests_unit_id_fkey(
            id,
            block,
            unit_number,
            community_id,
            owner_id,
            floor_area,
            bedrooms,
            bathrooms
          )
        `)
        .eq("id", parseInt(id))
        .single();

      if (error) throw error;
      if (!data) throw new Error("Maintenance request not found");
      
      return data;
    },
    enabled: !!id,
  });
};

// Create maintenance request
export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRequest: MaintenanceRequestInsert) => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .insert(newRequest)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
    },
  });
};

// Update maintenance request
export const useUpdateMaintenanceRequest = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: MaintenanceRequestUpdate) => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .update(updates)
        .eq("id", parseInt(id))
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance_requests", id] });
    },
  });
};

// Delete maintenance request
export const useDeleteMaintenanceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("maintenance_requests")
        .delete()
        .eq("id", parseInt(id));

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
    },
  });
};

// Real-time subscription for maintenance requests
export const useMaintenanceRequestsSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('maintenance_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
