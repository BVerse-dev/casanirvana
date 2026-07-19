import { supabase } from '../utils/supabase';

/**
 * Enhanced User-App services with comprehensive phone field support
 */

// Profile Management with Phone Fields
export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...profileData,
        phone: profileData.phone, // Primary phone
        mobile: profileData.mobile, // Mobile number
        emergency_contact_phone: profileData.emergency_contact_phone, // Emergency contact
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Enhanced Visitor Pass Management
export const createVisitorPassWithPhones = async (passData) => {
  try {
    const { data, error } = await supabase
      .from('visitor_passes')
      .insert([{
        ...passData,
        visitor_phone: passData.visitor_phone, // Visitor's phone
        host_phone: passData.host_phone, // Host's phone  
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const getMyVisitorPasses = async (unitId) => {
  try {
    const { data, error } = await supabase
      .from('visitor_passes')
      .select(`
        *,
        units:unit_id(block, number)
      `)
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Unit and Family Management with Phone Support
export const addFamilyMember = async (familyData) => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .insert([{
        ...familyData,
        phone_number: familyData.phone_number, // Family member phone
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const getFamilyMembers = async (unitId) => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('unit_id', unitId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Maintenance Request with Contractor Phone
export const createMaintenanceRequest = async (requestData) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([{
        ...requestData,
        contractor_phone: requestData.contractor_phone, // Contractor contact
        created_at: new Date().toISOString(),
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Amenity Booking with Contact Phone
export const createAmenityBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('amenity_bookings')
      .insert([{
        ...bookingData,
        contact_phone: bookingData.contact_phone, // Booking contact phone
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Emergency Services
export const reportEmergency = async (emergencyData) => {
  try {
    const { data, error } = await supabase
      .from('emergency_alerts')
      .insert([{
        ...emergencyData,
        created_at: new Date().toISOString(),
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Search and Directory Functions
export const searchByPhone = async (phoneNumber, communityId) => {
  try {
    // Search across multiple entities
    const [users, visitors, family] = await Promise.all([
      // Search users
      supabase
        .from('users')
        .select('*')
        .eq('community_id', communityId)
        .or(`phone.ilike.%${phoneNumber}%,mobile.ilike.%${phoneNumber}%`)
        .limit(5),
      
      // Search visitor passes
      supabase
        .from('visitor_passes')
        .select('*')
        .or(`visitor_phone.ilike.%${phoneNumber}%,host_phone.ilike.%${phoneNumber}%`)
        .limit(5),
      
      // Search family members
      supabase
        .from('family_members')
        .select('*')
        .ilike('phone_number', `%${phoneNumber}%`)
        .limit(5)
    ]);

    return {
      data: {
        users: users.data || [],
        visitors: visitors.data || [],
        family: family.data || []
      },
      error: null
    };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Utility function to format phone numbers
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length (assuming Indian numbers)
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  } else if (digits.length === 13 && digits.startsWith('91')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  
  return phone; // Return original if format unknown
};

// Validate phone number
export const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  
  const digits = phone.replace(/\D/g, '');
  
  // Check for valid Indian mobile number patterns
  return digits.length === 10 || 
         (digits.length === 12 && digits.startsWith('91')) ||
         (digits.length === 13 && digits.startsWith('91'));
};
