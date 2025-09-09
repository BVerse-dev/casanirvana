import { useMutation, useQueryClient } from '@tanstack/react-query';
import { amenityService } from '../services/amenityService';

export interface CreateAmenityBookingData {
  amenity_id: string;
  user_id: string;
  start_datetime: string;
  end_datetime: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  amount: number;
  total_days: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export const useCreateAmenityBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData: CreateAmenityBookingData) => {
      const response = await amenityService.createAmenityBooking(bookingData) as ServiceResponse<any>;
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create amenity booking');
      }

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch amenity bookings for this user
      queryClient.invalidateQueries({ queryKey: ['amenityBookings', { userId: variables.user_id }] });
      
      // Optionally invalidate all amenity bookings
      queryClient.invalidateQueries({ queryKey: ['amenityBookings'] });
    },
    onError: (error) => {
      console.error('Error creating amenity booking:', error);
    },
  });
};

export const useUpdateAmenityBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateAmenityBookingData> }) => {
      const response = await amenityService.updateAmenityBooking(id, updates) as ServiceResponse<any>;
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update amenity booking');
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch amenity bookings
      queryClient.invalidateQueries({ queryKey: ['amenityBookings'] });
      
      // Update the specific booking in cache if possible
      if (data?.user_id) {
        queryClient.invalidateQueries({ queryKey: ['amenityBookings', { userId: data.user_id }] });
      }
    },
    onError: (error) => {
      console.error('Error updating amenity booking:', error);
    },
  });
};

export const useDeleteAmenityBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await amenityService.deleteAmenityBooking(id) as ServiceResponse<any>;
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete amenity booking');
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch amenity bookings
      queryClient.invalidateQueries({ queryKey: ['amenityBookings'] });
      
      // Update the specific user's bookings in cache if possible
      if (data?.user_id) {
        queryClient.invalidateQueries({ queryKey: ['amenityBookings', { userId: data.user_id }] });
      }
    },
    onError: (error) => {
      console.error('Error deleting amenity booking:', error);
    },
  });
};
