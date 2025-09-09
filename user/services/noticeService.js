import { supabase } from '../utils/supabase';

/**
 * Create a new notice (admin only).
 * Table: notices
 * @param {Object} notice - Notice object (title, content, etc)
 * @returns {Promise}
 */
export const createNotice = async (notice) =>
  await supabase.from('notices').insert([notice]);

/**
 * Update a notice (admin only).
 * Table: notices
 * @param {number} id - Notice ID
 * @param {Object} updates - Fields to update
 * @returns {Promise}
 */
export const updateNotice = async (id, updates) =>
  await supabase.from('notices').update(updates).eq('id', id);

/**
 * Delete a notice (admin only).
 * Table: notices
 * @param {number} id - Notice ID
 * @returns {Promise}
 */
export const deleteNotice = async (id) =>
  await supabase.from('notices').delete().eq('id', id);

/**
 * Get notices for a society with optional filters, pagination, and sorting.
 * Table: notices
 * @param {Object} params - { society_id, search, limit, page, orderBy, ascending }
 * @returns {Promise}
 */
export const getNoticesForSociety = async ({
  society_id,
  search = '',
  limit = 10,
  page = 1,
  orderBy = 'posted_at',
  ascending = false
} = {}) => {
  let query = supabase.from('notices').select('*', { count: 'exact' });
  if (society_id) query = query.eq('society_id', society_id);
  if (search) query = query.ilike('title', `%${search}%`);
  query = query.order(orderBy, { ascending });
  if (limit) query = query.range((page - 1) * limit, page * limit - 1);
  return await query;
};
