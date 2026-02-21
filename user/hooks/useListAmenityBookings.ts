import { useQuery } from '@tanstack/react-query';
import { amenityService } from '../services/amenityService';

export interface AmenityBooking {
  id: string;
  amenity_id: string;
  user_id: string;
  community_id?: string;
  start_datetime: string;
  end_datetime: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  amount: number;
  total_amount?: number;
  is_paid?: boolean;
  total_days: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  cancellation_reason: string;
  confirmed_by: string;
  cancelled_by: string;
  created_at: string;
  updated_at: string;
  amenity: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_urls: string[];
    type: string;
    category: string;
    charges_per_hour: number;
    monthly_charges: number;
    location?: string;
    contact_person?: string;
    contact_phone?: string;
    operating_hours?: {
      days: string[];
      open: string;
      close: string;
    };
    capacity?: number;
  };
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface UseListAmenityBookingsOptions {
  userId: string;
  status?: string;
  from_date?: string;
  to_date?: string;
  enabled?: boolean;
}

export const useListAmenityBookings = (options: UseListAmenityBookingsOptions) => {
  const { userId, status, from_date, to_date, enabled = true } = options;

  return useQuery({
    queryKey: ['amenityBookings', { userId, status, from_date, to_date }],
    queryFn: async (): Promise<AmenityBooking[]> => {
      const filters: Record<string, any> = {};
      if (status) filters.status = status;
      if (from_date) filters.from_date = from_date;
      if (to_date) filters.to_date = to_date;

      const response = await amenityService.getAmenityBookings(userId, filters) as ServiceResponse<AmenityBooking[]>;
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch amenity bookings');
      }

      return response.data || [];
    },
    enabled: enabled && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute (bookings change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
