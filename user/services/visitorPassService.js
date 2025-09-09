import { supabase } from '../utils/supabase';

/**
 * Create a new visitor pass.
 * Table: visitor_passes
 * @param {Object} pass - Visitor pass object (unit_id, visitor_name, etc)
 * @returns {Promise}
 */
export const createVisitorPass = async (pass) =>
  await supabase.from('visitor_passes').insert([pass]);

/**
 * Get visitor passes for a unit with optional filters, pagination, and sorting.
 * Table: visitor_passes
 * @param {Object} params - { unit_id, valid, limit, page, orderBy, ascending, search }
 * @returns {Promise}
 */
export const getVisitorPassesForUnit = async ({
  unit_id,
  valid,
  limit = 10,
  page = 1,
  orderBy = 'from_date',
  ascending = false,
  search = ''
} = {}) => {
  let query = supabase.from('visitor_passes').select('*', { count: 'exact' });
  if (unit_id) query = query.eq('unit_id', unit_id);
  if (valid !== undefined) query = query.eq('valid', valid);
  if (search) query = query.ilike('visitor_name', `%${search}%`);
  query = query.order(orderBy, { ascending });
  if (limit) query = query.range((page - 1) * limit, page * limit - 1);
  return await query;
};
