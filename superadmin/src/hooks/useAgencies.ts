"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { toast } from "react-toastify";

// Agency type from database
type AgencyRow = Database["public"]["Tables"]["agencies"]["Row"];
type AgencyInsert = Database["public"]["Tables"]["agencies"]["Insert"];
type AgencyUpdate = Database["public"]["Tables"]["agencies"]["Update"];

// Extended Agency type with computed fields for UI compatibility
export type Agency = AgencyRow & {
  // Computed/derived fields for UI
  logo_url?: string;
  total_units?: number;
  average_occupancy_rate?: number;
  active_maintenance_tickets?: number;
  monthly_management_revenue?: number;
  rating?: number;
  pin_code?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  social_media?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  management_fee_percentage?: number;
  staff_count?: number;
  properties_count?: number;
};

// Transform DB row to UI format
const transformAgency = (agency: AgencyRow): Agency => ({
  ...agency,
  contact_person: agency.contact_person_name || undefined,
  contact_email: agency.contact_person_email || undefined,
  contact_phone: agency.contact_person_phone || undefined,
  pin_code: agency.postal_code || undefined,
  staff_count: agency.employee_count || undefined,
  social_media: {
    facebook: agency.facebook_url || undefined,
    twitter: agency.twitter_url || undefined,
    instagram: agency.instagram_url || undefined,
    linkedin: agency.linkedin_url || undefined,
  },
});

// List all agencies
export const useListAgencies = () => {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching agencies:", error);
        throw error;
      }

      return (data || []).map(transformAgency);
    },
  });
};

// Get single agency
export const useGetAgency = (id: string) => {
  return useQuery({
    queryKey: ["agencies", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching agency:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Agency not found");
      }

      return transformAgency(data);
    },
    enabled: !!id,
  });
};

// Alias for compatibility with existing code
export const useAgencyDetails = useGetAgency;

// Create agency
export const useCreateAgency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agencyData: AgencyInsert) => {
      const { data, error } = await supabase
        .from("agencies")
        .insert(agencyData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      toast.success("Agency created successfully!");
    },
    onError: (error) => {
      console.error("Error creating agency:", error);
      toast.error("Failed to create agency");
    },
  });
};

// Update agency
export const useUpdateAgency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AgencyUpdate }) => {
      const { data: updatedData, error } = await supabase
        .from("agencies")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedData;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      queryClient.invalidateQueries({ queryKey: ["agencies", id] });
      toast.success("Agency updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating agency:", error);
      toast.error("Failed to update agency");
    },
  });
};

// Delete agency
export const useDeleteAgency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("agencies")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      toast.success("Agency deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting agency:", error);
      toast.error("Failed to delete agency");
    },
  });
};
