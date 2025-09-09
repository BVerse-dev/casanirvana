import { supabase, adminSupabase } from '../lib/supabase';
import type { Database } from '../database.types';

// Define Society types from our database schema
export type Society = Database['public']['Tables']['societies']['Row'];
export type SocietyInsert = Database['public']['Tables']['societies']['Insert'];
export type SocietyUpdate = Database['public']['Tables']['societies']['Update'];

/**
 * Get all societies with optional filtering and pagination
 */
export async function getAllSocieties(options: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: string;
} = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
    search = '',
    type
  } = options;

  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;

  // Start building the query
  let query = adminSupabase
    .from('societies')
    .select('*', { count: 'exact' });

  // Apply filters
  if (type) {
    query = query.eq('type', type);
  }

  // Apply search if provided
  if (search) {
    query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`);
  }

  // Apply sorting and pagination
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Error fetching societies: ${error.message}`);
  }

  return {
    data: data || [],
    meta: {
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
  };
}

/**
 * Get a society by ID
 */
export async function getSocietyById(id: string) {
  const { data, error } = await adminSupabase
    .from('societies')
    .select(`
      *,
      units(id, unit_number, block_number, floor_number, user_id),
      amenities(id, name, description, image_url)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching society: ${error.message}`);
  }

  return data;
}

/**
 * Create a new society
 */
export async function createSociety(data: SocietyInsert) {
  const { data: society, error } = await adminSupabase
    .from('societies')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating society: ${error.message}`);
  }

  return society;
}

/**
 * Update an existing society
 */
export async function updateSociety(id: string, data: SocietyUpdate) {
  const { data: society, error } = await adminSupabase
    .from('societies')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating society: ${error.message}`);
  }

  return society;
}

/**
 * Delete a society
 */
export async function deleteSociety(id: string) {
  const { error } = await adminSupabase
    .from('societies')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting society: ${error.message}`);
  }

  return { id, success: true };
}

/**
 * Get society statistics
 */
export async function getSocietyStats() {
  try {
    // Get total societies count
    const { count: totalCount, error: countError } = await adminSupabase
      .from('societies')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get societies by type
    const { data: typeData, error: typeError } = await adminSupabase
      .from('societies')
      .select('type, count')
      .group('type');

    if (typeError) throw typeError;

    // Get recently added societies
    const { data: recentSocieties, error: recentError } = await adminSupabase
      .from('societies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    return {
      total: totalCount || 0,
      byType: typeData || [],
      recent: recentSocieties || [],
    };
  } catch (error: any) {
    throw new Error(`Error fetching society statistics: ${error.message}`);
  }
}
