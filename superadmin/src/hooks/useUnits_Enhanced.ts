"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Enhanced Units Hook using Backend API with comprehensive field support
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Types matching the actual database schema
export interface Unit {
  id: string;
  society_id: string;
  number: string; // unit_number in schema
  floor: number; // floor_number in schema
  block?: string; // building_name equivalent
  floor_area: number; // area_sqft equivalent
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  parking_slots?: number; // parking_spaces equivalent
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  is_occupied: boolean;
  
  // Owner Information
  owner_id?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  ownership_type?: string;
  
  // Tenant Information
  tenant_id?: string;
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  occupancy_start_date?: string;
  occupancy_end_date?: string;
  
  // Administrative
  created_at: string;
  updated_at: string;
  
  // Relations
  societies?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface CreateUnitRequest {
  society_id: string;
  number: string; // unit_number
  floor: number; // floor_number
  block?: string; // building_name
  floor_area: number; // area_sqft
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  parking_slots?: number; // parking_spaces
  status: Unit['status'];
  is_occupied?: boolean;
  
  // Owner Information
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  ownership_type?: string;
  
  // Tenant Information
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  occupancy_start_date?: string;
  occupancy_end_date?: string;
}

export interface UnitFilters {
  society_id?: string;
  status?: Unit['status'];
  bedrooms?: number;
  min_area?: number;
  max_area?: number;
  floor?: number;
  has_parking?: boolean;
  search?: string; // Search by unit number, owner/tenant name, or phone
}

export interface UnitsResponse {
  success: boolean;
  data: Unit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Fetch all units with filtering and search
export const useUnitsEnhanced = (filters: UnitFilters = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["units-enhanced", filters, page, limit],
    queryFn: async (): Promise<UnitsResponse> => {
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/units-enhanced?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch units: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Search units by phone number (owner or tenant)
export const useSearchUnitsByPhone = (phone: string) => {
  return useQuery({
    queryKey: ["units-phone-search", phone],
    queryFn: async (): Promise<UnitsResponse> => {
      if (!phone) {
        return { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
      }

      const response = await fetch(`${API_BASE_URL}/api/units-enhanced/search/phone?phone=${encodeURIComponent(phone)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search units by phone: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!phone && phone.length >= 3,
    staleTime: 5 * 60 * 1000,
  });
};

// Get single unit by ID
export const useUnitEnhanced = (id: string) => {
  return useQuery({
    queryKey: ["unit-enhanced", id],
    queryFn: async (): Promise<{ success: boolean; data: Unit }> => {
      const response = await fetch(`${API_BASE_URL}/api/units-enhanced/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch unit: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create new unit
export const useCreateUnitEnhanced = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (unitData: CreateUnitRequest): Promise<{ success: boolean; data: Unit; message: string }> => {
      const response = await fetch(`${API_BASE_URL}/api/units-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create unit: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate units queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["units-enhanced"] });
    },
  });
};

// Update unit
export const useUpdateUnitEnhanced = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, unitData }: { id: string; unitData: Partial<CreateUnitRequest> }): Promise<{ success: boolean; data: Unit; message: string }> => {
      const response = await fetch(`${API_BASE_URL}/api/units-enhanced/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update unit: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      // Invalidate specific unit and list queries
      queryClient.invalidateQueries({ queryKey: ["unit-enhanced", id] });
      queryClient.invalidateQueries({ queryKey: ["units-enhanced"] });
    },
  });
};

// Delete unit (if needed)
export const useDeleteUnitEnhanced = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(`${API_BASE_URL}/api/units-enhanced/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete unit: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate units queries
      queryClient.invalidateQueries({ queryKey: ["units-enhanced"] });
    },
  });
};
