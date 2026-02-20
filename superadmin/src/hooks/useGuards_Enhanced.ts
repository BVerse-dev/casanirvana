"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export type Guard = {
  id: string;
  // Basic Information
  first_name: string;
  last_name: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  mobile?: string | null; // Alternative phone field (maps to guard_phone in frontend)
  date_of_birth: string | null;
  address?: string | null;
  avatar_url: string | null;
  
  // Employment Details
  society_id: string | null;
  shift_type?: 'morning' | 'evening' | 'night';
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  gate_assignment?: string | null;
  license_number?: string | null;
  employment_date?: string | null;
  salary?: number | null;
  
  // Emergency Contact
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  
  // System Fields
  role: 'guard';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  
  // Relations
  units?: {
    id: string;
    unit_number: string;
    floor: number;
    building: string;
  };
  societies?: {
    id: string;
    name: string;
    address?: string;
  };
};

export type CreateGuardData = {
  // Basic Information
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  guard_phone?: string; // Maps to mobile field in backend
  date_of_birth?: string;
  address?: string;
  avatar_url?: string;
  
  // Employment Details
  society_id?: string;
  shift_type?: 'morning' | 'evening' | 'night';
  shift_start_time?: string;
  shift_end_time?: string;
  gate_assignment?: string;
  license_number?: string;
  employment_date?: string;
  salary?: number;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // System Fields
  role: 'guard';
  status?: 'active' | 'inactive' | 'suspended';
};

export type UpdateGuardData = Partial<CreateGuardData>;

// Helper function for API calls
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken'); // Or however you store your auth token
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// List all guards with filtering and search
export const useListGuards = (filters?: {
  society_id?: string;
  shift_type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['guards', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filters?.society_id) queryParams.append('society_id', filters.society_id);
      if (filters?.shift_type) queryParams.append('shift_type', filters.shift_type);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const url = `/guards${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetchWithAuth(url);
      return response.data as Guard[];
    },
  });
};

// Get single guard
export const useGetGuard = (id: string) => {
  return useQuery({
    queryKey: ['guards', id],
    queryFn: async () => {
      const response = await fetchWithAuth(`/guards/${id}`);
      return response.data as Guard;
    },
    enabled: !!id,
  });
};

// Create guard
export const useCreateGuard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (guardData: CreateGuardData) => {
      const response = await fetchWithAuth('/guards', {
        method: 'POST',
        body: JSON.stringify(guardData),
      });
      return response.data as Guard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guards'] });
    },
  });
};

// Update guard
export const useUpdateGuard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...guardData }: UpdateGuardData & { id: string }) => {
      const response = await fetchWithAuth(`/guards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(guardData),
      });
      return response.data as Guard;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guards'] });
      queryClient.invalidateQueries({ queryKey: ['guards', variables.id] });
    },
  });
};

// Delete guard
export const useDeleteGuard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth(`/guards/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guards'] });
    },
  });
};

// Search guards by phone
export const useSearchGuardsByPhone = (phoneNumber: string) => {
  return useQuery({
    queryKey: ['guards', 'search', 'phone', phoneNumber],
    queryFn: async () => {
      const response = await fetchWithAuth(`/guards/search/phone?phone=${encodeURIComponent(phoneNumber)}`);
      return response.data as Guard[];
    },
    enabled: !!phoneNumber && phoneNumber.length >= 3,
  });
};
