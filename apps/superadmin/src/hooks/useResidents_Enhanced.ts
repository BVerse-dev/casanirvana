"use client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export type Resident = {
  id: string;
  // Basic Information
  first_name: string;
  last_name: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  mobile?: string | null; // Alternative phone field
  date_of_birth: string | null;
  address?: string | null;
  avatar_url: string | null;
  
  // Location Details
  unit_number?: string | null;
  block_number?: string | null;
  society_id: string | null;
  
  // Emergency Contact
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  
  // System Fields
  role: 'resident';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  
  // Relations
  units?: {
    id: string;
    block: string;
    number: string;
    floor: number;
    owner_phone?: string;
    tenant_phone?: string;
  };
  societies?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    manager_contact?: string;
    secretary_contact?: string;
  };
};

export type CreateResidentData = {
  // Basic Information
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string; // Alternative phone field
  date_of_birth?: string;
  address?: string;
  avatar_url?: string;
  
  // Location Details
  unit_number?: string;
  block_number?: string;
  society_id?: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // System Fields (role will be automatically set to 'resident')
  status?: 'active' | 'inactive' | 'suspended';
};

export type UpdateResidentData = Partial<CreateResidentData>;

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

// List all residents with filtering and search
export const useListResidents = (filters?: {
  society_id?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['residents', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filters?.society_id) queryParams.append('society_id', filters.society_id);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      // Use the users endpoint filtered by role
      const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}&` : '?'}role=resident`;
      const response = await fetchWithAuth(url);
      return response.data as Resident[];
    },
  });
};

// Get single resident
export const useGetResident = (id: string) => {
  return useQuery({
    queryKey: ['residents', id],
    queryFn: async () => {
      const response = await fetchWithAuth(`/admin/users/${id}`);
      return response.data as Resident;
    },
    enabled: !!id,
  });
};

// Create resident
export const useCreateResident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (residentData: CreateResidentData) => {
      const dataWithRole = {
        ...residentData,
        role: 'resident' as const
      };
      
      const response = await fetchWithAuth('/admin/users', {
        method: 'POST',
        body: JSON.stringify(dataWithRole),
      });
      return response.data as Resident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
    },
  });
};

// Update resident
export const useUpdateResident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...residentData }: UpdateResidentData & { id: string }) => {
      const response = await fetchWithAuth(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(residentData),
      });
      return response.data as Resident;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['residents', variables.id] });
    },
  });
};

// Delete resident
export const useDeleteResident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth(`/admin/users/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
    },
  });
};

// Search residents by phone
export const useSearchResidentsByPhone = (phoneNumber: string) => {
  return useQuery({
    queryKey: ['residents', 'search', 'phone', phoneNumber],
    queryFn: async () => {
      const response = await fetchWithAuth(`/admin/users?role=resident&search=${encodeURIComponent(phoneNumber)}`);
      return response.data as Resident[];
    },
    enabled: !!phoneNumber && phoneNumber.length >= 3,
  });
};
