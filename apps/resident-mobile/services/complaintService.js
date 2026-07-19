import { supabase } from '../utils/supabase';

/**
 * Submit a new complaint.
 * Table: complaints
 * @param {Object} complaint - Complaint object (unit_id, description, etc)
 * @returns {Promise}
 */
export const submitComplaint = async (complaint) =>
  await supabase.from('complaints').insert([complaint]);

/**
 * Get complaints for a unit with optional filters, pagination, and sorting.
 * Table: complaints
 * @param {Object} params - { unit_id, status, limit, page, orderBy, ascending, search }
 * @returns {Promise}
 */
export const getComplaintsForUnit = async ({
  unit_id,
  status,
  limit = 10,
  page = 1,
  orderBy = 'filed_at',
  ascending = false,
  search = ''
} = {}) => {
  let query = supabase.from('complaints').select('*', { count: 'exact' });
  if (unit_id) query = query.eq('unit_id', unit_id);
  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('description', `%${search}%`);
  query = query.order(orderBy, { ascending });
  if (limit) query = query.range((page - 1) * limit, page * limit - 1);
  return await query;
};
