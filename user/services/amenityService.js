import { supabase } from '../utils/supabase';
import { normalizeOptionalUuid } from '../utils/id';

/**
 * Amenity Service
 * Handles all amenity-related API calls using Supabase
 */
export const amenityService = {
  /**
   * Get all amenities with optional filtering
   * @param {Object} filters - Optional filters for the request
   * @returns {Promise<Object>} - The amenities data
   */
  async getAmenities(filters = {}) {
    try {
      let query = supabase
        .from('amenities')
        .select('*')
        .eq('is_active', true);

      // Apply community filter to prevent duplicates
      if (filters.community_id) {
        query = query.eq('community_id', filters.community_id);
      }

      // Apply other filters if provided
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Deduplicate by name within the community to prevent duplicate amenities
      const uniqueAmenities = [];
      const seenNames = new Set();
      
      if (data && data.length > 0) {
        data.forEach(amenity => {
          const amenityName = amenity.name?.toLowerCase().trim();
          if (!seenNames.has(amenityName)) {
            seenNames.add(amenityName);
            uniqueAmenities.push(amenity);
          }
        });
      }

      return { data: uniqueAmenities, error: null, success: true };
    } catch (error) {
      console.error('Error fetching amenities:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  /**
   * Get a specific amenity by ID
   * @param {string} id - The amenity ID
   * @returns {Promise<Object>} - The amenity data
   */
  async getAmenity(id) {
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error fetching amenity:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  /**
   * Get amenity bookings for a user
   * @param {string} userId - The user ID
   * @param {Object} filters - Optional filters (status, date range)
   * @returns {Promise<Object>} - The bookings data
   */
  async getAmenityBookings(userId, filters = {}) {
    try {
      let query = supabase
        .from('amenity_bookings')
        .select(`
          *,
          amenity:amenities (
            id,
            name,
            description,
            price,
            image_urls,
            type,
            category,
            charges_per_hour,
            monthly_charges,
            location,
            contact_person,
            contact_phone,
            operating_hours,
            capacity
          )
        `)
        .eq('user_id', userId);

      // Apply filters if provided
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.from_date) {
        query = query.gte('booking_date', filters.from_date);
      }
      if (filters.to_date) {
        query = query.lte('booking_date', filters.to_date);
      }

      const { data, error } = await query.order('booking_date', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error fetching amenity bookings:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  /**
   * Create a new amenity booking
   * @param {Object} bookingData - The booking data
   * @returns {Promise<Object>} - The created booking data
   */
  async createAmenityBooking(bookingData) {
    try {
      const { data, error } = await supabase
        .from('amenity_bookings')
        .insert([bookingData])
        .select(`
          *,
          amenity:amenities (
            id,
            name,
            description,
            price,
            image_urls,
            type,
            category,
            charges_per_hour,
            monthly_charges,
            location,
            contact_person,
            contact_phone,
            operating_hours,
            capacity
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error creating amenity booking:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  /**
   * Update an existing amenity booking
   * @param {string} id - The booking ID to update
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object>} - The updated booking data
   */
  async updateAmenityBooking(id, updates) {
    try {
      const normalizedId = normalizeOptionalUuid(id);

      if (!normalizedId) {
        throw new Error('Amenity booking id is required');
      }

      const { data, error } = await supabase
        .from('amenity_bookings')
        .update(updates)
        .eq('id', normalizedId)
        .select(`
          *,
          amenity:amenities (
            id,
            name,
            description,
            price,
            image_urls,
            type,
            category,
            charges_per_hour,
            monthly_charges,
            location,
            contact_person,
            contact_phone,
            operating_hours,
            capacity
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error updating amenity booking:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  /**
   * Delete an amenity booking
   * @param {string} id - The booking ID to delete
   * @returns {Promise<Object>} - The deletion response
   */
  async deleteAmenityBooking(id) {
    try {
      const { data, error } = await supabase
        .from('amenity_bookings')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error deleting amenity booking:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  /**
   * Search amenities by name or type
   * @param {string} searchTerm - The search term
   * @returns {Promise<Object>} - The search results
   */
  async searchAmenities(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error searching amenities:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  /**
   * Create a new amenity (admin only) - backward compatibility
   * @param {Object} amenity - Amenity object (name, description, contact_phone, etc)
   * @returns {Promise}
   */
  async createAmenity(amenity) {
    try {
      const { data, error } = await supabase
        .from('amenities')
        .insert([amenity])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error creating amenity:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  /**
   * Update an amenity (admin only) - backward compatibility
   * @param {string} id - Amenity ID
   * @param {Object} updates - Fields to update (includes contact_phone, booking_phone)
   * @returns {Promise}
   */
  async updateAmenity(id, updates) {
    try {
      const { data, error } = await supabase
        .from('amenities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error updating amenity:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  /**
   * Delete an amenity (admin only) - backward compatibility
   * @param {string} id - Amenity ID
   * @returns {Promise}
   */
  async deleteAmenity(id) {
    try {
      const { data, error } = await supabase
        .from('amenities')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null, success: true };
    } catch (error) {
      console.error('Error deleting amenity:', error);
      return { data: null, error: error.message, success: false };
    }
  },
};

// Export individual functions for backward compatibility
export const createAmenity = (amenity) => amenityService.createAmenity(amenity);
export const getAmenities = (filters = {}) => amenityService.getAmenities(filters);
export const updateAmenity = (id, updates) => amenityService.updateAmenity(id, updates);
export const deleteAmenity = (id) => amenityService.deleteAmenity(id);
export const searchAmenities = (searchTerm) => amenityService.searchAmenities(searchTerm);
export const getAmenity = (id) => amenityService.getAmenity(id);
