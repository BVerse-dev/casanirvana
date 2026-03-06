import { supabase } from '../utils/supabase';

/**
 * Secure unit validation service - Industry standard security
 * Only validates units that exist in the guard's assigned society
 * Prevents unauthorized access to units in other societies
 */

export const validateAndGetUnitId = async (flatNumber, guardSocietyId) => {
  try {
    if (!flatNumber || !guardSocietyId) {
      throw new Error('Flat number and society ID are required');
    }

    // Parse flatNumber (e.g., "A-101" -> block: "A", number: "101")
    const parts = flatNumber.split('-');
    if (parts.length !== 2) {
      throw new Error(`Invalid flat number format: ${flatNumber}. Expected format: Block-Number (e.g., A-101)`);
    }

    const [block, number] = parts;

    // Query ONLY units in guard's assigned society (security-first approach)
    const { data, error } = await supabase
      .from('units')
      .select('id, block, number, unit_type, floor')
      .eq('community_id', guardSocietyId)
      .eq('block', block)
      .eq('number', number);

    if (error || !data || data.length === 0) {
      throw new Error(`Invalid unit: ${flatNumber} not found in your assigned society`);
    }

    // If multiple units with same block-number, return the first one
    const unit = data[0];

    return {
      unitId: unit.id,
      block: unit.block,
      number: unit.number,
      unitType: unit.unit_type,
      floor: unit.floor,
      flatNumber: `${unit.block}-${unit.number}`
    };
  } catch (err) {
    console.error('Unit validation error:', err);
    throw err;
  }
};

/**
 * Get all valid units for the guard's assigned society
 * Used for populating dropdowns and validation lists
 */
export const getValidUnitsForGuard = async (guardSocietyId) => {
  try {
    if (!guardSocietyId) {
      throw new Error('Society ID is required');
    }

    const { data, error } = await supabase
      .from('units')
      .select('id, block, number, unit_type, floor')
      .eq('community_id', guardSocietyId)
      .order('block')
      .order('number');

    if (error) {
      throw new Error('Failed to fetch valid units');
    }

    // Transform to flat number format for UI
    return (data || []).map(unit => ({
      unitId: unit.id,
      flatNumber: `${unit.block}-${unit.number}`,
      block: unit.block,
      number: unit.number,
      unitType: unit.unit_type,
      floor: unit.floor
    }));
  } catch (err) {
    console.error('Error fetching valid units:', err);
    throw err;
  }
};

/**
 * Get resident information for a specific unit (if available)
 * Used for host name lookup in guest entry
 */
export const getUnitResident = async (unitId) => {
  try {
    if (!unitId) {
      throw new Error('Unit ID is required');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, first_name, last_name, email, phone, role')
      .eq('unit_id', unitId)
      .neq('role', 'guard')
      .limit(1);

    if (error || !data || data.length === 0) {
      return null; // No resident found (not an error)
    }

    const resident = data[0];
    const resolvedName =
      resident.full_name ||
      [resident.first_name, resident.last_name].filter(Boolean).join(' ').trim() ||
      resident.email ||
      'Resident';

    return {
      residentId: resident.user_id || resident.id,
      name: resolvedName,
      email: resident.email,
      phone: resident.phone
    };
  } catch (err) {
    console.error('Error fetching unit resident:', err);
    return null; // Return null instead of throwing for resident lookup
  }
};

export const resolveUnitResidentInfo = async (unitId, fallback = {}) => {
  const resident = await getUnitResident(unitId);

  return {
    residentId: resident?.residentId || fallback.residentId || null,
    name: resident?.name || fallback.name || 'Resident',
    email: resident?.email || fallback.email || null,
    phone: resident?.phone || fallback.phone || null,
  };
};

/**
 * Batch resident lookup for multiple units.
 * Returns map: { [unitId]: { residentId, name, email, phone } | null }
 */
export const getUnitResidentsMap = async (unitIds = []) => {
  try {
    const normalizedIds = Array.from(
      new Set((unitIds || []).filter(Boolean))
    );

    if (normalizedIds.length === 0) {
      return {};
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, unit_id, full_name, first_name, last_name, email, phone, role, created_at')
      .in('unit_id', normalizedIds)
      .neq('role', 'guard')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const map = {};
    for (const unitId of normalizedIds) {
      map[unitId] = null;
    }

    for (const row of data || []) {
      if (!row.unit_id || map[row.unit_id]) continue;

      const resolvedName =
        row.full_name ||
        [row.first_name, row.last_name].filter(Boolean).join(' ').trim() ||
        row.email ||
        'Resident';

      map[row.unit_id] = {
        residentId: row.user_id || row.id,
        name: resolvedName,
        email: row.email,
        phone: row.phone,
      };
    }

    return map;
  } catch (err) {
    console.error('Error fetching unit residents map:', err);
    return {};
  }
};
