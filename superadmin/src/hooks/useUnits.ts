"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { getSampleUnitsData } from "../assets/data/units";

type Unit = Database["public"]["Tables"]["units"]["Row"];
type UnitInsert = Database["public"]["Tables"]["units"]["Insert"];
type UnitUpdate = Database["public"]["Tables"]["units"]["Update"];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const useAdminFetch = () => {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  const fetchAdmin = async (path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Missing admin session. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.message || 'Request failed');
    }
    return payload;
  };

  return { fetchAdmin };
};

// List all units with pagination
export const useListUnits = (
  options: {
    page?: number;
    pageSize?: number;
    communityId?: string;
  } = {}
) => {
  const { page = 1, pageSize = 9, communityId } = options;
  return useQuery({
    queryKey: ["units", { page, pageSize, communityId }],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Use the specific foreign key constraint name to avoid ambiguity
      let query = supabase
        .from("units")
        .select(
          `*,
          communities!units_community_id_fkey(name)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);
        
      if (communityId) {
        query = query.eq("community_id", communityId);
      }
      
      const { data, error, count } = await query;
      if (error) {
        console.error("Database query failed:", error.message);
        throw error;
      }
      
      // Manual join with profiles since owner_id references auth.users
      const dataWithProfiles = await Promise.all(
        (data || []).map(async (unit) => {
          let profile = null;
          
          if (unit.owner_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("first_name, last_name, email")
              .eq("id", unit.owner_id)
              .single();
            
            if (profileData) {
              profile = profileData;
            }
          }
          
          return {
            ...unit,
            profiles: profile
          };
        })
      );
      
      return {
        data: dataWithProfiles || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 1
      };
    },
  });
};

// Get single unit
export const useGetUnit = (id: string) => {
  return useQuery({
    queryKey: ["units", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select(
          `
          *,
          communities!units_community_id_fkey(name, address)
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Database query failed:", error.message);
        throw error;
      }

      // Manual join with profiles
      let profile = null;
      if (data?.owner_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name, email, phone")
          .eq("id", data.owner_id)
          .single();
        
        if (profileData) {
          profile = profileData;
        }
      }

      return {
        ...data,
        profiles: profile
      };
    },
    enabled: !!id,
  });
};

// Create unit
export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newUnit: UnitInsert) => {
      return fetchAdmin('/admin/units', {
        method: 'POST',
        body: JSON.stringify(newUnit),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
};

// Update unit
export const useUpdateUnit = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (updates: UnitUpdate) => {
      return fetchAdmin(`/admin/units/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["units", id] });
    },
  });
};

// Delete unit
export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/units/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });
};
