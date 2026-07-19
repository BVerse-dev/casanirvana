import { 
  guardsApiService, 
  entryLogsApiService, 
  visitorPassesApiService, 
  unitsApiService 
} from './enhancedApiService';

/**
 * Enhanced Guard-App specific CRUD operations with comprehensive phone field support
 */

// Visitor Pass Operations with Phone Fields
export const createVisitorEntry = async (entryData) => {
  // Enhanced to include person_phone, visitor_phone, host_phone validation
  const enhancedEntryData = {
    ...entryData,
    person_phone: entryData.person_phone, // Phone field for entry person
    entry_time: new Date().toISOString(),
    entry_type: entryData.entry_type || 'guest'
  };

  return entryLogsApiService.createVisitorEntry(enhancedEntryData);
};

export const updateVisitorPassStatus = async (passId, status, guardNotes) => {
  return visitorPassesApiService.updateVisitorPassStatus(passId, status, guardNotes);
};

export const getVisitorPassesForGuard = async (guardId) => {
  return visitorPassesApiService.getVisitorPassesForGuard(guardId);
};

// Guard Profile Operations with Phone Fields
export const updateGuardProfile = async (guardId, profileData) => {
  // Enhanced to include all phone fields from database schema
  const enhancedProfileData = {
    ...profileData,
    phone: profileData.phone, // Primary phone
    guard_phone: profileData.guard_phone, // Alternative/work phone
    emergency_contact_phone: profileData.emergency_contact_phone, // Emergency contact
    updated_at: new Date().toISOString()
  };

  return guardsApiService.updateGuardProfile(guardId, enhancedProfileData);
};

// Get guard profile with all phone information
export const getGuardProfile = async (guardId) => {
  return guardsApiService.getGuardProfile(guardId);
};

// Search guards by phone (for supervisor functions)
export const searchGuardsByPhone = async (phone) => {
  return guardsApiService.searchGuardsByPhone(phone);
};

// Get guards by shift type
export const getGuardsByShift = async (shiftType) => {
  return guardsApiService.getGuardsByShift(shiftType);
};

// Unit Verification with Phone Support
export const verifyResidentByPhone = async (phone, unitNumber) => {
  return unitsApiService.verifyResidentByPhone(phone, unitNumber);
};

export const searchUnitsByPhone = async (phone) => {
  return unitsApiService.searchUnitsByPhone(phone);
};

export const getUnitDetails = async (unitId) => {
  return unitsApiService.getUnitDetails(unitId);
};

// Entry Logs with Phone Search
export const getEntryLogs = async (guardId, filters = {}) => {
  return entryLogsApiService.getEntryLogs(guardId, filters);
};

export const searchEntriesByPhone = async (phone) => {
  return entryLogsApiService.searchEntriesByPhone(phone);
};

// Visitor Pass Phone Search
export const searchVisitorPassesByPhone = async (phone) => {
  return visitorPassesApiService.searchVisitorPassesByPhone(phone);
};

export const getVisitorPassDetails = async (passId) => {
  return visitorPassesApiService.getVisitorPassDetails(passId);
};

// Mark guard attendance
export const markAttendance = async (guardId, attendanceData) => {
  return guardsApiService.markAttendance(guardId, attendanceData);
};

// Emergency Alert Operations
export const createEmergencyAlert = async (alertData) => {
  try {
    const { data, error } = await supabase
      .from('emergency_alerts')
      .insert([{
        ...alertData,
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

export const getActiveEmergencyAlerts = async (societyId) => {
  try {
    const { data, error } = await supabase
      .from('emergency_alerts')
      .select('*')
      .eq('community_id', societyId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Entry Log Operations with Phone Tracking
export const getTodaysEntries = async (societyId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('entry_logs')
      .select(`
        *,
        visitor_passes:visitor_pass_id(visitor_name, visitor_phone, host_phone)
      `)
      .eq('community_id', societyId)
      .gte('entry_time', `${today}T00:00:00.000Z`)
      .lt('entry_time', `${today}T23:59:59.999Z`)
      .order('entry_time', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

// Search Functions with Phone Support
export const searchVisitorByPhone = async (phoneNumber) => {
  try {
    const { data, error } = await supabase
      .from('visitor_passes')
      .select(`
        *,
        units:unit_id(block, number, community_id)
      `)
      .ilike('visitor_phone', `%${phoneNumber}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};

export const searchResidentByPhone = async (phoneNumber, societyId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        units:units!units_owner_id_fkey(block, number)
      `)
      .eq('community_id', societyId)
      .or(`phone.ilike.%${phoneNumber}%,mobile.ilike.%${phoneNumber}%,emergency_contact_phone.ilike.%${phoneNumber}%`)
      .limit(10);

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
};
