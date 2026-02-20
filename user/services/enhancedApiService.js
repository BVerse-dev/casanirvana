/**
 * Enhanced Backend API Client for User-App
 * Replaces direct Supabase calls with backend API calls
 * Includes comprehensive phone field support
 */

import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://localhost:8080';

/**
 * Generic API client with error handling
 */
class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return { data: data.data || data, error: null, success: data.success };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return { data: null, error: error.message, success: false };
    }
  }

  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(fullEndpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

/**
 * Enhanced Amenities Service
 */
export const amenitiesService = {
  // Get all amenities with filtering
  async getAmenities(filters = {}) {
    return apiClient.get('/api/amenities', filters);
  },

  // Get amenity by ID
  async getAmenity(id) {
    return apiClient.get(`/api/amenities/${id}`);
  },

  // Create amenity (admin only)
  async createAmenity(amenityData) {
    return apiClient.post('/api/amenities', amenityData);
  },

  // Update amenity (admin only)
  async updateAmenity(id, updates) {
    return apiClient.put(`/api/amenities/${id}`, updates);
  },

  // Delete amenity (admin only)
  async deleteAmenity(id) {
    return apiClient.delete(`/api/amenities/${id}`);
  },

  // Search amenities by name or type
  async searchAmenities(searchTerm) {
    return apiClient.get('/api/amenities', { search: searchTerm });
  },
};

/**
 * Enhanced Guards Service
 */
export const guardsService = {
  // Get all guards with filtering
  async getGuards(filters = {}) {
    return apiClient.get('/api/guards', filters);
  },

  // Get guard by ID
  async getGuard(id) {
    return apiClient.get(`/api/guards/${id}`);
  },

  // Search guards by phone number
  async searchGuardsByPhone(phone) {
    return apiClient.get('/api/guards', { search: phone });
  },

  // Get guards by community
  async getGuardsByCommunity(communityId) {
    return apiClient.get('/api/guards', { community_id: communityId });
  },

  // Get guards by shift type
  async getGuardsByShift(shiftType) {
    return apiClient.get('/api/guards', { shift_type: shiftType });
  },

  // Create guard (admin only)
  async createGuard(guardData) {
    return apiClient.post('/api/guards', guardData);
  },

  // Update guard (admin only)
  async updateGuard(id, updates) {
    return apiClient.put(`/api/guards/${id}`, updates);
  },
};

/**
 * Enhanced Units Service
 */
export const unitsService = {
  // Get all units with filtering
  async getUnits(filters = {}) {
    return apiClient.get('/api/units-enhanced', filters);
  },

  // Get unit by ID
  async getUnit(id) {
    return apiClient.get(`/api/units-enhanced/${id}`);
  },

  // Search units by phone number (owner or tenant)
  async searchUnitsByPhone(phone) {
    return apiClient.get('/api/units-enhanced/search/phone', { phone });
  },

  // Get units by community
  async getUnitsByCommunity(communityId) {
    return apiClient.get('/api/units-enhanced', { community_id: communityId });
  },

  // Get units by owner phone
  async getUnitsByOwnerPhone(phone) {
    return apiClient.get('/api/units-enhanced', { owner_phone: phone });
  },

  // Get units by tenant phone
  async getUnitsByTenantPhone(phone) {
    return apiClient.get('/api/units-enhanced', { tenant_phone: phone });
  },

  // Create unit (admin only)
  async createUnit(unitData) {
    return apiClient.post('/api/units-enhanced', unitData);
  },

  // Update unit (admin only)
  async updateUnit(id, updates) {
    return apiClient.put(`/api/units-enhanced/${id}`, updates);
  },
};

/**
 * User Profiles Service (for backward compatibility with existing code)
 */
export const profilesService = {
  // Get user profile
  async getProfile(userId) {
    // This would connect to a profiles endpoint when implemented
    return { data: null, error: 'Profile service not yet implemented', success: false };
  },

  // Update user profile including phone number
  async updateProfile(userId, profileData) {
    // This would connect to a profiles endpoint when implemented
    return { data: null, error: 'Profile service not yet implemented', success: false };
  },

  // Search profiles by phone
  async searchProfilesByPhone(phone) {
    // This would connect to a profiles endpoint when implemented
    return { data: null, error: 'Profile service not yet implemented', success: false };
  },
};

/**
 * Visitor Passes Service (placeholder for future enhancement)
 */
export const visitorPassesService = {
  async getVisitorPasses(filters = {}) {
    // This would connect to visitor passes endpoint when implemented
    return { data: [], error: null, success: true };
  },

  async createVisitorPass(passData) {
    // Include visitor_phone and owner_phone fields
    return { data: null, error: 'Visitor passes service not yet implemented', success: false };
  },
};

/**
 * Messages Service (placeholder for future enhancement)
 */
export const messagesService = {
  async getMessages(filters = {}) {
    return { data: [], error: null, success: true };
  },

  async sendMessage(messageData) {
    // Include sender_phone and recipient_phone fields
    return { data: null, error: 'Messages service not yet implemented', success: false };
  },
};

/**
 * Complaints Service (placeholder for future enhancement)
 */
export const complaintsService = {
  async getComplaints(filters = {}) {
    return { data: [], error: null, success: true };
  },

  async createComplaint(complaintData) {
    // Include complainant_phone field
    return { data: null, error: 'Complaints service not yet implemented', success: false };
  },
};

/**
 * Notices Service (placeholder for future enhancement)
 */
export const noticesService = {
  async getNotices(filters = {}) {
    return { data: [], error: null, success: true };
  },

  async createNotice(noticeData) {
    return { data: null, error: 'Notices service not yet implemented', success: false };
  },
};

/**
 * Payments Service (placeholder for future enhancement)
 */
export const paymentsService = {
  async getPayments(filters = {}) {
    return { data: [], error: null, success: true };
  },

  async createPayment(paymentData) {
    // Include payer_phone field
    return { data: null, error: 'Payments service not yet implemented', success: false };
  },
};

export default {
  amenitiesService,
  guardsService,
  unitsService,
  profilesService,
  visitorPassesService,
  messagesService,
  complaintsService,
  noticesService,
  paymentsService,
};
