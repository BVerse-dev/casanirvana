import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { supabase } from '../lib/supabase';
import type { Database } from "../lib/database.types";
import { getSampleCommunitiesData } from "../assets/data/communities";

type Community = Database["public"]["Tables"]["communities"]["Row"];
type CommunityInsert = Database["public"]["Tables"]["communities"]["Insert"];
type CommunityUpdate = Database["public"]["Tables"]["communities"]["Update"];

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

// Filter interface
export interface CommunityFilters {
  location?: string;
  status?: string;
  communityType?: string;
  unitsRange?: [number, number];
  minOccupancy?: number | null;
  maxOccupancy?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  amenities?: string[];
}

// List all communities with pagination and filtering
export const useListCommunities = (
  options: {
    page?: number;
    pageSize?: number;
    filters?: CommunityFilters;
  } = {}
) => {
  const { page = 1, pageSize = 9, filters } = options;
  
  return useQuery({
    queryKey: ["communities", { page, pageSize, filters }],
    queryFn: async () => {
      // Calculate start and end range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Start building the query - include agency information
      let query = supabase
        .from("communities")
        .select(`
          *,
          agencies (
            id,
            name,
            email,
            phone
          )
        `, { count: "exact" });

      // Apply filters if provided
      if (filters) {
        // Location filter - search in address, city, or state
        if (filters.location) {
          query = query.or(`address.ilike.%${filters.location}%,city.ilike.%${filters.location}%,state.ilike.%${filters.location}%`);
        }

        // Status filter
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
      }

      // Apply ordering and pagination
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Database query failed:", error.message);
        throw error;
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 1
      };
    },
  });
};

// Get single community
export const useGetCommunity = (id: string) => {
  return useQuery({
    queryKey: ["communities", id],
    queryFn: async () => {
      // Try to fetch from Supabase - include agency information
      const { data, error } = await supabase
        .from("communities")
        .select(`
          *,
          agencies (
            id,
            name,
            email,
            phone
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to fetch community from database:", error.message);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create community
export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (newCommunity: CommunityInsert) => {
      return fetchAdmin('/admin/communities', {
        method: 'POST',
        body: JSON.stringify(newCommunity),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};

// Update community
export const useUpdateCommunity = (id: string) => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (updates: CommunityUpdate) => {
      return fetchAdmin(`/admin/communities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["communities", id] });
    },
  });
};

// Delete community
export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminFetch();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchAdmin(`/admin/communities/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};
