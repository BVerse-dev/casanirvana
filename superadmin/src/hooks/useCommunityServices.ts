"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from 'react';

// Types for community services
export interface CommunityService {
  id: string;
  name: string;
  description: string;
  category: 'maintenance' | 'housekeeping' | 'security' | 'delivery' | 'utilities' | 'emergency' | 'lifestyle' | 'healthcare';
  community_id: string;
  community_name: string;
  service_type: 'internal' | 'external' | 'vendor_managed' | 'self_service';
  availability: 'always' | 'scheduled' | 'on_demand' | 'emergency_only';
  status: 'active' | 'inactive' | 'maintenance' | 'coming_soon';
  operating_hours: {
    open: string;
    close: string;
    days: string[];
    isAlwaysOpen: boolean;
  };
  pricing: {
    type: 'free' | 'fixed' | 'hourly' | 'per_request' | 'subscription';
    amount?: number;
    currency: string;
  };
  contact_info: {
    primaryContact: string;
    phone: string;
    email?: string;
    emergencyPhone?: string;
  };
  vendor?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    rating: number;
    contractStart: string;
    contractEnd: string;
  };
  requirements: string[];
  terms: string[];
  features: string[];
  response_time: number;
  service_areas: string[];
  max_requests: number;
  current_load: number;
  is_booking_required: boolean;
  advance_booking_hours: number;
  cancelation_policy: string;
  total_requests: number;
  completed_requests: number;
  avg_rating: number;
  avg_response_time: number;
  monthly_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityServiceFormData {
  name: string;
  description: string;
  category: string;
  communityId: string;
  serviceType: string;
  availability: string;
  status: string;
  operatingHours: {
    open: string;
    close: string;
    days: string[];
    isAlwaysOpen: boolean;
  };
  pricingType: string;
  pricingAmount?: number;
  primaryContact: string;
  phone: string;
  email?: string;
  emergencyPhone?: string;
  vendorName?: string;
  vendorPhone?: string;
  vendorEmail?: string;
  vendorAddress?: string;
  requirements: string[];
  terms: string[];
  features: string[];
  responseTime: number;
  maxRequests: number;
  isBookingRequired: boolean;
  advanceBookingHours: number;
  cancelationPolicy: string;
}

export interface CommunityServiceStats {
  totalServices: number;
  activeServices: number;
  totalRequests: number;
  totalRevenue: number;
  categoryDistribution: Record<string, number>;
  averageRating: number;
}

// Transform database row to UI format
const transformServiceFromDB = (service: any): CommunityService => {
  return {
    id: service.id,
    name: service.name || 'Unnamed Service',
    description: service.description || '',
    category: service.category || 'maintenance',
    community_id: service.community_id,
    community_name: service.community_name || 'Unknown Community',
    service_type: service.service_type || 'internal',
    availability: service.availability || 'scheduled',
    status: service.status || 'active',
    operating_hours: service.operating_hours || { open: '09:00', close: '18:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], isAlwaysOpen: false },
    pricing: service.pricing || { type: 'free', amount: 0, currency: 'INR' },
    contact_info: service.contact_info || { primaryContact: '', phone: '', email: '', emergencyPhone: '' },
    vendor: service.vendor || null,
    requirements: service.requirements || [],
    terms: service.terms || [],
    features: service.features || [],
    response_time: service.response_time || 30,
    service_areas: service.service_areas || [],
    max_requests: service.max_requests || 10,
    current_load: service.current_load || 0,
    is_booking_required: service.is_booking_required || false,
    advance_booking_hours: service.advance_booking_hours || 2,
    cancelation_policy: service.cancelation_policy || '',
    total_requests: service.total_requests || 0,
    completed_requests: service.completed_requests || 0,
    avg_rating: Number(service.avg_rating) || 0,
    avg_response_time: service.avg_response_time || 0,
    monthly_revenue: Number(service.monthly_revenue) || 0,
    created_at: service.created_at,
    updated_at: service.updated_at,
  };
};

// Transform form data to database format
const transformServiceToDB = (formData: CommunityServiceFormData) => ({
  name: formData.name,
  description: formData.description,
  category: formData.category,
  community_id: formData.communityId,
  service_type: formData.serviceType,
  availability: formData.availability,
  status: formData.status,
  operating_hours: formData.operatingHours,
  pricing: {
    type: formData.pricingType,
    amount: formData.pricingAmount,
    currency: 'INR'
  },
  contact_info: {
    primaryContact: formData.primaryContact,
    phone: formData.phone,
    email: formData.email,
    emergencyPhone: formData.emergencyPhone
  },
  vendor: formData.vendorName ? {
    name: formData.vendorName,
    phone: formData.vendorPhone,
    email: formData.vendorEmail,
    address: formData.vendorAddress,
    rating: 0,
    contractStart: new Date().toISOString().split('T')[0],
    contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  } : null,
  requirements: formData.requirements,
  terms: formData.terms,
  features: formData.features,
  response_time: formData.responseTime,
  max_requests: formData.maxRequests,
  is_booking_required: formData.isBookingRequired,
  advance_booking_hours: formData.advanceBookingHours,
  cancelation_policy: formData.cancelationPolicy,
});

// 1. List all community services
export const useCommunityServices = (searchTerm?: string, filterCommunity?: string, filterCategory?: string, filterStatus?: string) => {
  return useQuery({
    queryKey: ['community-services', searchTerm, filterCommunity, filterCategory, filterStatus],
    queryFn: async (): Promise<CommunityService[]> => {
      let query = supabase
        .from('community_services')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,contact_info->>primaryContact.ilike.%${searchTerm}%`);
      }
      
      if (filterCommunity && filterCommunity !== 'all') {
        query = query.eq('community_id', filterCommunity);
      }
      
      if (filterCategory && filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      
      if (filterStatus && filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching community services:", error);
        throw new Error(`Failed to fetch community services: ${error.message}`);
      }

      return (data || []).map(transformServiceFromDB);
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

// 2. Get single community service
export const useCommunityService = (id: string) => {
  return useQuery({
    queryKey: ['community-service', id],
    queryFn: async (): Promise<CommunityService> => {
      const { data, error } = await supabase
        .from('community_services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching community service:", error);
        throw new Error(`Failed to fetch community service: ${error.message}`);
      }

      return transformServiceFromDB(data);
    },
    enabled: !!id,
    staleTime: 30000,
    gcTime: 300000,
  });
};

// 3. Create community service
export const useCreateCommunityService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceData: CommunityServiceFormData): Promise<CommunityService> => {
      const dbData = transformServiceToDB(serviceData);
      
      // Get community name for caching
      const { data: community } = await supabase
        .from('communities')
        .select('name')
        .eq('id', serviceData.communityId)
        .single();
      
      const { data, error } = await supabase
        .from('community_services')
        .insert({
          ...dbData,
          community_name: community?.name || 'Unknown Community'
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating community service:", error);
        throw new Error(`Failed to create community service: ${error.message}`);
      }

      return transformServiceFromDB(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-services'] });
      queryClient.invalidateQueries({ queryKey: ['community-services-stats'] });
    }
  });
};

// 4. Update community service
export const useUpdateCommunityService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, serviceData }: { id: string; serviceData: CommunityServiceFormData }): Promise<CommunityService> => {
      const dbData = transformServiceToDB(serviceData);
      
      // Get community name for caching
      const { data: community } = await supabase
        .from('communities')
        .select('name')
        .eq('id', serviceData.communityId)
        .single();
      
      const { data, error } = await supabase
        .from('community_services')
        .update({
          ...dbData,
          community_name: community?.name || 'Unknown Community'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating community service:", error);
        throw new Error(`Failed to update community service: ${error.message}`);
      }

      return transformServiceFromDB(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-services'] });
      queryClient.invalidateQueries({ queryKey: ['community-service', data.id] });
      queryClient.invalidateQueries({ queryKey: ['community-services-stats'] });
    }
  });
};

// 5. Delete community service
export const useDeleteCommunityService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('community_services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting community service:", error);
        throw new Error(`Failed to delete community service: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-services'] });
      queryClient.invalidateQueries({ queryKey: ['community-services-stats'] });
    }
  });
};

// 6. Get community services statistics
export const useCommunityServicesStats = () => {
  return useQuery({
    queryKey: ['community-services-stats'],
    queryFn: async (): Promise<CommunityServiceStats> => {
      const { data, error } = await supabase
        .from('community_services')
        .select('*');

      if (error) {
        console.error("Error fetching community services stats:", error);
        throw new Error(`Failed to fetch community services stats: ${error.message}`);
      }

      const services = (data || []).map(transformServiceFromDB);
      
      return {
        totalServices: services.length,
        activeServices: services.filter(s => s.status === 'active').length,
        totalRequests: services.reduce((sum, s) => sum + s.total_requests, 0),
        totalRevenue: services.reduce((sum, s) => sum + s.monthly_revenue, 0),
        averageRating: services.length > 0 
          ? services.reduce((sum, s) => sum + s.avg_rating, 0) / services.length 
          : 0,
        categoryDistribution: services.reduce((acc: any, service) => {
          acc[service.category] = (acc[service.category] || 0) + 1;
          return acc;
        }, {}),
      };
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000,
  });
};

// 7. Real-time subscription hook
export const useCommunityServicesRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:community_services')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_services' }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-services'] });
          queryClient.invalidateQueries({ queryKey: ['community-services-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}; 