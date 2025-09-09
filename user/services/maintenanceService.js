import { supabase } from '../utils/supabase';

/**
 * Submit a new maintenance request.
 * Table: maintenance_requests
 * Required fields: unit_id, title, description, requested_by
 * RLS: Only unit owners can create requests for their own units
 */
export const submitMaintenanceRequest = async (request) =>
  await supabase.from('maintenance').insert([request]);

/**
 * Get maintenance requests for a unit with optional filters, pagination, and sorting.
 * Table: maintenance_requests
 * Filters: unit_id, status, search (description)
 * Pagination: limit, page
 * Sorting: orderBy (default 'created_at'), ascending
 * RLS: Only unit owners and requesters can view their requests
 */
export const getMaintenanceRequestsForUnit = async ({
  unit_id,
  status,
  limit = 10,
  page = 1,
  orderBy = 'created_at',
  ascending = false,
  search = ''
} = {}) => {
  let query = supabase.from('maintenance').select('*', { count: 'exact' });
  if (unit_id) query = query.eq('unit_id', unit_id);
  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('description', `%${search}%`);
  query = query.order(orderBy, { ascending });
  if (limit) query = query.range((page - 1) * limit, page * limit - 1);
  return await query;
};
