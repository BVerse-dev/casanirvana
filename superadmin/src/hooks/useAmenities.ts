"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from 'react';

// Types for amenities (simplified to avoid DB type conflicts)
export interface Amenity {
  id: string;
  name: string;
  description: string;
  category: 'recreation' | 'fitness' | 'utility' | 'security' | 'convenience' | 'outdoor' | 'community';
  community_id: string;
  communityName?: string;
  type: 'free' | 'paid' | 'subscription' | 'booking_required';
  location: string;
  capacity?: number;
  status: 'active' | 'inactive' | 'maintenance' | 'coming_soon';
  operating_hours: {
    open: string;
    close: string;
    days: string[];
  };
  booking_required: boolean;
  advance_booking_days: number;
  max_booking_duration: number;
  charges_per_hour?: number;
  monthly_charges?: number;
  security_deposit?: number;
  amenity_features?: string[];
  contact_person?: string;
  contact_phone?: string;
  maintenance_frequency: string;
  last_maintenance?: string;
  total_bookings: number;
  active_bookings: number;
  monthly_revenue: number;
  average_rating: number;
  images?: string[];
  rules?: string;
  created_at: string;
  updated_at: string;
  
  // Legacy fields for compatibility
  is_paid?: boolean;
  is_active?: boolean;
  price_per_hour?: number;
  amenity_type?: string;
}

export interface AmenityFormData {
  name: string;
  description: string;
  category: string;
  communityId: string;
  type: string;
  location: string;
  capacity?: number;
  status: string;
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  bookingRequired: boolean;
  advanceBookingDays: number;
  maxBookingDuration: number;
  chargesPerHour?: number;
  monthlyCharges?: number;
  securityDeposit?: number;
  amenityFeatures?: string[];
  contactPerson?: string;
  contactPhone?: string;
  maintenanceFrequency: string;
  lastMaintenance: string;
  rules: string[];
  images?: string[];
}

export interface AmenityStats {
  totalAmenities: number;
  activeAmenities: number;
  totalBookings: number;
  totalRevenue: number;
  categoryDistribution: Record<string, number>;
  averageRating: number;
}

// Transform database amenity to UI format
const transformAmenityFromDB = (amenity: any): Amenity => {
  return {
    id: amenity.id,
    name: amenity.name || 'Unnamed Amenity',
    description: amenity.description || '',
    category: amenity.category || 'recreation',
    community_id: amenity.community_id,
    communityName: 'Unknown Community', // Will be populated separately
    type: amenity.type || 'free',
    location: amenity.location || '',
    capacity: amenity.capacity,
    status: amenity.status || 'active',
    operating_hours: amenity.operating_hours || { open: '06:00', close: '22:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    booking_required: amenity.booking_required || false,
    advance_booking_days: amenity.advance_booking_days || 0,
    max_booking_duration: amenity.max_booking_duration || 2,
    charges_per_hour: Number(amenity.charges_per_hour) || 0,
    monthly_charges: Number(amenity.monthly_charges) || 0,
    security_deposit: Number(amenity.security_deposit) || 0,
    amenity_features: amenity.amenity_features || [],
    contact_person: amenity.contact_person,
    contact_phone: amenity.contact_phone,
    maintenance_frequency: amenity.maintenance_frequency || 'weekly',
    last_maintenance: amenity.last_maintenance,
    total_bookings: amenity.total_bookings || 0,
    active_bookings: amenity.active_bookings || 0,
    monthly_revenue: Number(amenity.monthly_revenue) || 0,
    average_rating: Number(amenity.average_rating) || 0,
    images: amenity.images || [],
    rules: amenity.rules,
    created_at: amenity.created_at,
    updated_at: amenity.updated_at,
    
    // Legacy compatibility
    is_paid: amenity.is_paid,
    is_active: amenity.is_active,
    price_per_hour: amenity.price_per_hour,
    amenity_type: amenity.amenity_type
  };
};

// Transform UI form data to database format
const transformAmenityToDB = (formData: AmenityFormData) => ({
  name: formData.name,
  description: formData.description,
  category: formData.category,
  community_id: formData.communityId,
  type: formData.type,
  location: formData.location,
  capacity: formData.capacity,
  status: formData.status,
  operating_hours: formData.operatingHours,
  booking_required: formData.bookingRequired,
  advance_booking_days: formData.advanceBookingDays,
  max_booking_duration: formData.maxBookingDuration,
  charges_per_hour: formData.chargesPerHour,
  monthly_charges: formData.monthlyCharges,
  security_deposit: formData.securityDeposit,
  amenity_features: formData.amenityFeatures,
  contact_person: formData.contactPerson,
  contact_phone: formData.contactPhone,
  maintenance_frequency: formData.maintenanceFrequency,
  rules: formData.rules,
  images: formData.images
});

// 1. List all amenities
export const useListAmenities = () => {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: async (): Promise<Amenity[]> => {
      const { data, error } = await supabase
        .from('amenities' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(transformAmenityFromDB) || [];
    }
  });
};

// 2. Get single amenity
export const useGetAmenity = (id: string) => {
  return useQuery({
    queryKey: ['amenities', id],
    queryFn: async (): Promise<Amenity> => {
      const { data, error } = await supabase
        .from('amenities' as any)
        .select(`
          *,
          communities (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return transformAmenityFromDB(data);
    },
    enabled: !!id
  });
};

// 3. Create amenity
export const useCreateAmenity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (amenityData: AmenityFormData): Promise<Amenity> => {
      const { data, error } = await supabase
        .from('amenities' as any)
        .insert([transformAmenityToDB(amenityData)])
        .select(`
          *,
          communities (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      return transformAmenityFromDB(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
    }
  });
};

// 4. Update amenity
export const useUpdateAmenity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...amenityData }: AmenityFormData & { id: string }): Promise<Amenity> => {
      const { data, error } = await supabase
        .from('amenities' as any)
        .update(transformAmenityToDB(amenityData))
        .eq('id', id)
        .select(`
          *,
          communities (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      return transformAmenityFromDB(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      queryClient.invalidateQueries({ queryKey: ['amenities', data.id] });
    }
  });
};

// 5. Delete amenity
export const useDeleteAmenity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('amenities' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
    }
  });
};

// 6. Get amenities statistics
export const useAmenitiesStats = () => {
  return useQuery({
    queryKey: ['amenities', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amenities' as any)
        .select('*');

      if (error) throw error;

      const amenities = data?.map(transformAmenityFromDB) || [];
      
      return {
        totalAmenities: amenities.length,
        activeAmenities: amenities.filter(a => a.status === 'active').length,
        paidAmenities: amenities.filter(a => a.type === 'paid').length,
        totalBookings: amenities.reduce((sum, a) => sum + a.total_bookings, 0),
        totalRevenue: amenities.reduce((sum, a) => sum + a.monthly_revenue, 0),
        averageRating: amenities.length > 0 
          ? amenities.reduce((sum, a) => sum + a.average_rating, 0) / amenities.length 
          : 0,
        categoryDistribution: amenities.reduce((acc: any, amenity) => {
          acc[amenity.category] = (acc[amenity.category] || 0) + 1;
          return acc;
        }, {}),
        typeDistribution: amenities.reduce((acc: any, amenity) => {
          acc[amenity.type] = (acc[amenity.type] || 0) + 1;
          return acc;
        }, {})
      };
    }
  });
};

// 7. Real-time subscription hook
export const useAmenitiesRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:amenities')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'amenities' }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['amenities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

// AMENITY BOOKINGS SECTION
// ========================

export interface AmenityBooking {
  id: string;
  amenity_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  notes?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  amenities?: {
    id: string;
    name: string;
    description?: string;
    amenity_type?: string;
  };
  user_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

export interface CreateAmenityBookingData {
  amenity_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  special_requests?: string;
}

// Transform booking from DB
const transformBookingFromDB = (booking: any): AmenityBooking => ({
  id: booking.id,
  amenity_id: booking.amenity_id,
  user_id: booking.user_id,
  booking_date: booking.booking_date,
  start_time: booking.start_time,
  end_time: booking.end_time,
  status: booking.status || 'pending',
  payment_status: booking.payment_status || 'pending',
  total_amount: Number(booking.total_amount) || 0,
  notes: booking.notes,
  special_requests: booking.special_requests,
  created_at: booking.created_at,
  updated_at: booking.updated_at,
  amenities: booking.amenities,
  user_profile: booking.user_profile || booking.profiles
});

// 8. List amenity bookings
export const useListAmenityBookings = () => {
  return useQuery({
    queryKey: ['amenity_bookings'],
    queryFn: async (): Promise<AmenityBooking[]> => {
      const { data, error } = await supabase
        .from('amenity_bookings' as any)
        .select(`
          *,
          amenities (
            id,
            name,
            description,
            amenity_type
          ),
          profiles!amenity_bookings_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching amenity bookings:', error);
        return [];
      }
      
      return data?.map((booking: any) => ({
        ...transformBookingFromDB(booking),
        user_profile: booking.profiles
      })) || [];
    }
  });
};

// 9. Get single amenity booking
export const useGetAmenityBooking = (id: string) => {
  return useQuery({
    queryKey: ['amenity_bookings', id],
    queryFn: async (): Promise<AmenityBooking | null> => {
      const { data, error } = await supabase
        .from('amenity_bookings' as any)
        .select(`
          *,
          amenities (
            id,
            name,
            description,
            amenity_type
          ),
          user_profile:profiles!amenity_bookings_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.warn('Amenity booking not found:', error);
        return null;
      }
      
      return data ? transformBookingFromDB(data) : null;
    },
    enabled: !!id
  });
};

// 10. Create amenity booking
export const useCreateAmenityBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookingData: CreateAmenityBookingData): Promise<AmenityBooking> => {
      const { data, error } = await supabase
        .from('amenity_bookings' as any)
        .insert([bookingData])
        .select(`
          *,
          amenities (
            id,
            name,
            description,
            amenity_type
          ),
          user_profile:profiles!amenity_bookings_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .single();

      if (error) throw error;
      return transformBookingFromDB(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenity_bookings'] });
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
    }
  });
};

// 11. Update amenity booking
export const useUpdateAmenityBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...bookingData }: CreateAmenityBookingData & { id: string }): Promise<AmenityBooking> => {
      const { data, error } = await supabase
        .from('amenity_bookings' as any)
        .update(bookingData)
        .eq('id', id)
        .select(`
          *,
          amenities (
            id,
            name,
            description,
            amenity_type
          ),
          user_profile:profiles!amenity_bookings_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .single();

      if (error) throw error;
      return transformBookingFromDB(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['amenity_bookings'] });
      queryClient.invalidateQueries({ queryKey: ['amenity_bookings', data.id] });
    }
  });
};

// 12. Delete amenity booking
export const useDeleteAmenityBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('amenity_bookings' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenity_bookings'] });
    }
  });
};

// 13. Amenity bookings real-time subscription
export const useAmenityBookingsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:amenity_bookings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'amenity_bookings' }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['amenity_bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};


