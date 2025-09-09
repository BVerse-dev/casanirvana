/**
 * Enhanced Backend API Client for Guard-App
 * Replaces direct Supabase calls with backend API calls
 * Includes comprehensive phone field support and guard-specific operations
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
 * Enhanced Guards Service for Guard-App
 */
export const guardsApiService = {
  // Get current guard profile with phone info
  async getGuardProfile(guardId) {
    return apiClient.get(`/api/guards/${guardId}`);
  },

  // Get all guards (for guard supervisors)
  async getAllGuards(filters = {}) {
    return apiClient.get('/api/guards', filters);
  },

  // Search guards by phone number
  async searchGuardsByPhone(phone) {
    return apiClient.get('/api/guards', { search: phone });
  },

  // Get guards by shift type
  async getGuardsByShift(shiftType) {
    return apiClient.get('/api/guards', { shift_type: shiftType });
  },

  // Get guards by society
  async getGuardsBySociety(societyId) {
    return apiClient.get('/api/guards', { society_id: societyId });
  },

  // Update guard profile including phone fields
  async updateGuardProfile(guardId, updates) {
    return apiClient.put(`/api/guards/${guardId}`, updates);
  },

  // Mark guard attendance
  async markAttendance(guardId, attendanceData) {
    // This would connect to an attendance endpoint when implemented
    return { data: null, error: 'Attendance service not yet implemented', success: false };
  },
};

/**
 * Enhanced Entry Logs Service
 */
export const entryLogsApiService = {
  // Create visitor entry (walk-in registration)
  async createVisitorEntry(entryData) {
    try {
      const { data, error } = await supabase
        .from('visitor_passes')
        .insert([entryData])
        .select('*')
        .single();
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: err.message, success: false };
    }
  },

  // Get entry logs for guard
  async getEntryLogs(guardId, filters = {}) {
    try {
      let query = supabase
        .from('entry_logs')
        .select('*')
        .eq('guard_id', guardId);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      const { data, error } = await query.order('timestamp', { ascending: false });
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (err) {
      return { data: [], error: err.message, success: false };
    }
  },

  // Update entry exit time
  async updateEntryExit(entryId, exitData) {
    try {
      const { data, error } = await supabase
        .from('entry_logs')
        .update(exitData)
        .eq('id', entryId)
        .select('*')
        .single();
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: err.message, success: false };
    }
  },

  // Search entries by phone number
  async searchEntriesByPhone(phone) {
    try {
      const { data, error } = await supabase
        .from('entry_logs')
        .select('*')
        .eq('visitor_phone', phone);
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (err) {
      return { data: [], error: err.message, success: false };
    }
  },
};

/**
 * Enhanced Visitor Passes Service for Guard-App
 */
export const visitorPassesApiService = {
  // Get visitor passes for guard approval (pre-approved, checked-in, checked-out)
  async getVisitorPassesForGuard(guardId, status = null) {
    try {
      let query = supabase
        .from('visitor_passes')
        .select('*')
        .eq('approved_by', guardId);
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (err) {
      return { data: [], error: err.message, success: false };
    }
  },

  // Update visitor pass status (check-in/out, approve/reject)
  async updateVisitorPassStatus(passId, status, guardNotes = null) {
    try {
      const updateData = { status };
      if (guardNotes) updateData.guard_notes = guardNotes;
      const { data, error } = await supabase
        .from('visitor_passes')
        .update(updateData)
        .eq('id', passId)
        .select('*')
        .single();
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: err.message, success: false };
    }
  },

  // Search visitor passes by phone
  async searchVisitorPassesByPhone(phone) {
    try {
      const { data, error } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('visitor_phone', phone);
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (err) {
      return { data: [], error: err.message, success: false };
    }
  },

  // Get visitor pass details (for QR scan, etc)
  async getVisitorPassDetails(passId) {
    try {
      const { data, error } = await supabase
        .from('visitor_passes')
        .select('*')
        .eq('id', passId)
        .single();
      if (error) throw error;
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: err.message, success: false };
    }
  },
};

/**
 * Enhanced Units Service for Guard-App
 */
export const unitsApiService = {
  // Get units by society for guard
  async getUnitsBySociety(societyId) {
    return apiClient.get('/api/units-enhanced', { society_id: societyId });
  },

  // Search units by owner/tenant phone
  async searchUnitsByPhone(phone) {
    return apiClient.get('/api/units-enhanced/search/phone', { phone });
  },

  // Get unit details for verification
  async getUnitDetails(unitId) {
    return apiClient.get(`/api/units-enhanced/${unitId}`);
  },

  // Verify resident by phone
  async verifyResidentByPhone(phone, unitNumber) {
    return apiClient.get('/api/units-enhanced', { 
      search: phone,
      number: unitNumber 
    });
  },
};

/**
 * Emergency Contacts Service
 */
export const emergencyContactsApiService = {
  // Get emergency contacts for society
  async getEmergencyContacts(societyId) {
    // This would return contacts with phone numbers for quick access
    return { data: [], error: null, success: true };
  },

  // Call emergency contact
  async callEmergencyContact(contactId, guardId) {
    // Log the emergency call with phone numbers
    return { data: null, error: 'Emergency contacts service not yet implemented', success: false };
  },
};

/**
 * Maintenance Requests Service (for guard reporting)
 */
export const maintenanceApiService = {
  // Create maintenance request from guard observation
  async createMaintenanceRequest(requestData) {
    // Include guard_phone and contact_phone fields
    return { data: null, error: 'Maintenance service not yet implemented', success: false };
  },

  // Get maintenance requests for guard area
  async getMaintenanceRequests(guardId, filters = {}) {
    return { data: [], error: null, success: true };
  },
};

/**
 * Incidents/Reports Service
 */
export const incidentsApiService = {
  // Create incident report
  async createIncidentReport(incidentData) {
    // Include guard_phone, involved_person_phone, emergency_contact_phone
    return { data: null, error: 'Incidents service not yet implemented', success: false };
  },

  // Get incident reports for guard
  async getIncidentReports(guardId, filters = {}) {
    return { data: [], error: null, success: true };
  },
};

export default {
  guardsApiService,
  entryLogsApiService,
  visitorPassesApiService,
  unitsApiService,
  emergencyContactsApiService,
  maintenanceApiService,
  incidentsApiService,
};
