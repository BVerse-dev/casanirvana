import { useQuery } from '@tanstack/react-query';
import { amenityService } from '../services/amenityService';

export interface Amenity {
  id: string;
  name: string;
  description: string;
  price: number;
  is_paid: boolean;
  type: string;
  category: string;
  image_urls: string[];
  charges_per_hour: number;
  monthly_charges: number;
  status: string;
  operating_hours: {
    days: string[];
    open: string;
    close: string;
  };
  capacity: number;
  location: string;
  rules: string;
  contact_person: string;
  contact_phone: string;
  booking_phone: string;
  community_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface UseListAmenitiesOptions {
  type?: string;
  category?: string;
  search?: string;
  community_id?: string;
  enabled?: boolean;
}

export const useListAmenities = (options: UseListAmenitiesOptions = {}) => {
  const { type, category, search, community_id, enabled = true } = options;

  return useQuery({
    queryKey: ['amenities', { type, category, search, community_id }],
    queryFn: async (): Promise<Amenity[]> => {
      const filters: Record<string, any> = {};
      if (type) filters.type = type;
      if (category) filters.category = category;
      if (search) filters.search = search;
      if (community_id) filters.community_id = community_id;

      const response = await amenityService.getAmenities(filters) as ServiceResponse<Amenity[]>;
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch amenities');
      }

      return response.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (gcTime is the new property name)
  });
};
