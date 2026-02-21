"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from 'react';

const DEFAULT_OPERATING_HOURS = {
  open: '06:00',
  close: '22:00',
  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
};

const toTimeHHMM = (value?: string | null) => {
  if (!value) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  if (/^\d{2}:\d{2}:\d{2}$/.test(text)) return text.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(text)) return text;
  return undefined;
};

const pickDefined = <T>(...values: (T | undefined | null)[]): T | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
};

const normalizeCategoryFromAmenityType = (amenityType?: string) => {
  const normalized = (amenityType || '').toLowerCase();
  switch (normalized) {
    case 'fitness':
      return 'fitness';
    case 'utility':
      return 'utility';
    case 'security':
      return 'security';
    case 'convenience':
      return 'convenience';
    case 'outdoor':
      return 'outdoor';
    case 'community':
      return 'community';
    default:
      return 'recreation';
  }
};

const toLegacyAmenityType = (category?: string) => {
  if (!category) return 'Common';
  return category.charAt(0).toUpperCase() + category.slice(1);
};

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
  availability_start?: string;
  availability_end?: string;
  booking_limit_per_day?: number;
  cancellation_policy?: string;
  rules_and_regulations?: string;
  contact_number?: string;
  societies?: { name: string };
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
  lastMaintenance?: string;
  rules: string[];
  images?: string[];
}

type FlexibleAmenityFormData = AmenityFormData & Partial<{
  community_id: string;
  amenity_type: string;
  is_paid: boolean;
  is_active: boolean;
  price_per_hour: number;
  availability_start: string;
  availability_end: string;
  booking_limit_per_day: number;
  cancellation_policy: string;
  rules_and_regulations: string;
  contact_number: string;
  max_advance_booking_days: number;
  maintenance_schedule: string | Record<string, unknown>;
}>;

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
  const operatingHours = amenity.operating_hours || {
    open: toTimeHHMM(amenity.availability_start) || DEFAULT_OPERATING_HOURS.open,
    close: toTimeHHMM(amenity.availability_end) || DEFAULT_OPERATING_HOURS.close,
    days: DEFAULT_OPERATING_HOURS.days,
  };
  const category = amenity.category || normalizeCategoryFromAmenityType(amenity.amenity_type);
  const type = amenity.type || (amenity.is_paid ? 'paid' : 'free');
  const status = amenity.status || (amenity.is_active === false ? 'inactive' : 'active');
  const communityName = amenity.communities?.name || amenity.communityName || 'Unknown Community';
  const normalizedRules = pickDefined(amenity.rules, amenity.rules_and_regulations, '') as string;
  const isPaid = pickDefined<boolean>(amenity.is_paid, type === 'paid' || type === 'subscription') || false;

  return {
    id: amenity.id,
    name: amenity.name || 'Unnamed Amenity',
    description: amenity.description || '',
    category,
    community_id: amenity.community_id,
    communityName,
    type,
    location: amenity.location || '',
    capacity: amenity.capacity,
    status,
    operating_hours: operatingHours,
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
    rules: normalizedRules,
    created_at: amenity.created_at,
    updated_at: amenity.updated_at,
    
    // Legacy compatibility
    is_paid: isPaid,
    is_active: pickDefined<boolean>(amenity.is_active, status === 'active'),
    price_per_hour: Number(pickDefined(amenity.price_per_hour, amenity.charges_per_hour)) || 0,
    amenity_type: amenity.amenity_type || toLegacyAmenityType(category),
    availability_start: toTimeHHMM(pickDefined(amenity.availability_start, operatingHours.open)) || DEFAULT_OPERATING_HOURS.open,
    availability_end: toTimeHHMM(pickDefined(amenity.availability_end, operatingHours.close)) || DEFAULT_OPERATING_HOURS.close,
    booking_limit_per_day: Number(amenity.booking_limit_per_day) || 1,
    cancellation_policy: amenity.cancellation_policy,
    rules_and_regulations: amenity.rules_and_regulations || normalizedRules,
    contact_number: amenity.contact_number || amenity.contact_phone,
    societies: { name: communityName },
  };
};

// Transform UI form data to database format
const transformAmenityToDB = (formData: FlexibleAmenityFormData) => {
  const category = pickDefined(formData.category, normalizeCategoryFromAmenityType(formData.amenity_type), 'recreation') as string;
  const type = pickDefined(formData.type, formData.is_paid ? 'paid' : 'free', 'free') as string;
  const status = pickDefined(formData.status, formData.is_active === false ? 'inactive' : 'active', 'active') as string;
  const operatingOpen = toTimeHHMM(pickDefined(formData.operatingHours?.open, formData.availability_start)) || DEFAULT_OPERATING_HOURS.open;
  const operatingClose = toTimeHHMM(pickDefined(formData.operatingHours?.close, formData.availability_end)) || DEFAULT_OPERATING_HOURS.close;
  const operatingHours = {
    open: operatingOpen,
    close: operatingClose,
    days: formData.operatingHours?.days?.length ? formData.operatingHours.days : DEFAULT_OPERATING_HOURS.days,
  };
  const rulesText = Array.isArray(formData.rules)
    ? formData.rules.filter(Boolean).join('\n')
    : (pickDefined(formData.rules_and_regulations, '') as string);
  const chargesPerHour = Number(pickDefined(formData.chargesPerHour, formData.price_per_hour, 0));

  return {
    name: formData.name,
    description: formData.description,
    category,
    community_id: pickDefined(formData.communityId, formData.community_id),
    type,
    location: formData.location,
    capacity: formData.capacity,
    status,
    operating_hours: operatingHours,
    booking_required: pickDefined(formData.bookingRequired, true),
    advance_booking_days: Number(pickDefined(formData.advanceBookingDays, formData.max_advance_booking_days, 0)),
    max_booking_duration: Number(pickDefined(formData.maxBookingDuration, 2)),
    charges_per_hour: chargesPerHour,
    monthly_charges: Number(pickDefined(formData.monthlyCharges, 0)),
    security_deposit: Number(pickDefined(formData.securityDeposit, 0)),
    amenity_features: formData.amenityFeatures,
    contact_person: pickDefined(formData.contactPerson, formData.contact_person),
    contact_phone: pickDefined(formData.contactPhone, formData.contact_phone, formData.contact_number),
    maintenance_frequency: pickDefined(formData.maintenanceFrequency, 'weekly'),
    last_maintenance: formData.lastMaintenance,
    rules: rulesText,
    images: formData.images,

    // Keep legacy columns in sync for compatibility pages.
    amenity_type: pickDefined(formData.amenity_type, toLegacyAmenityType(category)),
    is_paid: pickDefined(formData.is_paid, type === 'paid' || type === 'subscription'),
    is_active: pickDefined(formData.is_active, status === 'active'),
    price_per_hour: chargesPerHour,
    availability_start: operatingOpen,
    availability_end: operatingClose,
    booking_limit_per_day: Number(pickDefined(formData.booking_limit_per_day, 1)),
    cancellation_policy: formData.cancellation_policy,
    rules_and_regulations: pickDefined(formData.rules_and_regulations, rulesText),
    contact_number: pickDefined(formData.contact_number, formData.contact_phone, formData.contactPhone),
    maintenance_schedule: formData.maintenance_schedule,
  };
};

// 1. List all amenities
export const useListAmenities = () => {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: async (): Promise<Amenity[]> => {
      const { data, error } = await supabase
        .from('amenities' as any)
        .select(`
          *,
          communities (
            id,
            name
          )
        `)
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
        .insert([transformAmenityToDB(amenityData as FlexibleAmenityFormData)])
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
    mutationFn: async ({ id, ...amenityData }: Partial<AmenityFormData> & { id: string } & Record<string, any>): Promise<Amenity> => {
      const { data, error } = await supabase
        .from('amenities' as any)
        .update(transformAmenityToDB(amenityData as FlexibleAmenityFormData))
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
  amount?: number;
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
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  start_datetime?: string;
  end_datetime?: string;
  total_days?: number;
  amount?: number;
  total_amount?: number;
  community_id?: string;
  is_paid?: boolean;
  status?: AmenityBooking['status'];
  payment_status?: AmenityBooking['payment_status'];
  notes?: string;
  special_requests?: string;
}

// Transform booking from DB
const transformBookingFromDB = (booking: any): AmenityBooking => ({
  id: booking.id,
  amenity_id: booking.amenity_id,
  user_id: booking.user_id,
  booking_date: booking.booking_date || (booking.start_datetime ? booking.start_datetime.slice(0, 10) : ''),
  start_time: booking.start_time || (booking.start_datetime ? new Date(booking.start_datetime).toISOString().slice(11, 19) : ''),
  end_time: booking.end_time || (booking.end_datetime ? new Date(booking.end_datetime).toISOString().slice(11, 19) : ''),
  status: booking.status || 'pending',
  payment_status: booking.payment_status || 'pending',
  total_amount: Number(pickDefined(booking.total_amount, booking.amount, 0)) || 0,
  amount: Number(booking.amount) || 0,
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateAmenityBookingData> }): Promise<AmenityBooking> => {
      const { data, error } = await supabase
        .from('amenity_bookings' as any)
        .update(updates)
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
