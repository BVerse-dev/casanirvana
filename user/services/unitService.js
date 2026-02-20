import { unitsService } from './enhancedApiService';

/**
 * Create a new unit (admin only).
 * Enhanced with backend API support including phone fields
 * @param {Object} unit - Unit object (number, community_id, owner_phone, tenant_phone, etc)
 * @returns {Promise}
 */
export const createUnit = async (unit) => {
  return unitsService.createUnit(unit);
};

/**
 * Get units for a community with optional filters, pagination, and sorting.
 * Enhanced with backend API support and comprehensive phone search
 * @param {Object} params - { community_id, search, limit, page, owner_phone, tenant_phone, etc }
 * @returns {Promise}
 */
export const getUnitsForCommunity = async ({
  community_id,
  search = '',
  limit = 10,
  page = 1,
  owner_phone,
  tenant_phone,
  status,
  bedrooms,
  floor
} = {}) => {
  const filters = {
    community_id,
    search,
    owner_phone,
    tenant_phone,
    status,
    bedrooms,
    floor
  };

  // Remove undefined/null values
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
      delete filters[key];
    }
  });

  return unitsService.getUnits({ ...filters, page, limit });
};

/**
 * Search units by phone number (owner or tenant)
 * New enhanced feature with phone search capability
 * @param {string} phone - Phone number to search for
 * @returns {Promise}
 */
export const searchUnitsByPhone = async (phone) => {
  return unitsService.searchUnitsByPhone(phone);
};

/**
 * Get units by owner phone
 * New enhanced feature
 * @param {string} phone - Owner phone number
 * @returns {Promise}
 */
export const getUnitsByOwnerPhone = async (phone) => {
  return unitsService.getUnitsByOwnerPhone(phone);
};

/**
 * Get units by tenant phone
 * New enhanced feature
 * @param {string} phone - Tenant phone number
 * @returns {Promise}
 */
export const getUnitsByTenantPhone = async (phone) => {
  return unitsService.getUnitsByTenantPhone(phone);
};

/**
 * Get unit by ID
 * Enhanced with backend API support
 * @param {string} id - Unit ID
 * @returns {Promise}
 */
export const getUnit = async (id) => {
  return unitsService.getUnit(id);
};

/**
 * Update unit
 * Enhanced with backend API support including phone fields
 * @param {string} id - Unit ID
 * @param {Object} updates - Fields to update (owner_phone, tenant_phone, etc)
 * @returns {Promise}
 */
export const updateUnit = async (id, updates) => {
  return unitsService.updateUnit(id, updates);
};
