import { supabase, adminSupabase } from '../lib/supabase';
import type { Database } from '../database.types';

// Define Payment types from our database schema
export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

/**
 * Get payments by unit ID with optional filtering and pagination
 */
export async function getPaymentsByUnit(unitId: string, options: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'payment_date',
    sortOrder = 'desc',
    status,
    startDate,
    endDate
  } = options;

  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;

  // Start building the query
  let query = adminSupabase
    .from('payments')
    .select(`
      *,
      profiles:user_id(first_name, last_name, profile_pic_url, email),
      units:unit_id(unit_number, block_number, floor_number),
      societies:society_id(name, address)
    `, { count: 'exact' })
    .eq('unit_id', unitId);

  // Apply additional filters
  if (status) {
    query = query.eq('status', status);
  }

  if (startDate) {
    query = query.gte('payment_date', startDate);
  }

  if (endDate) {
    query = query.lte('payment_date', endDate);
  }

  // Apply sorting and pagination
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Error fetching payments for unit: ${error.message}`);
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
 * Get payments by society ID with optional filtering and pagination
 */
export async function getPaymentsBySociety(societyId: string, options: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  paymentType?: string;
  startDate?: string;
  endDate?: string;
  unitId?: string;
} = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'payment_date',
    sortOrder = 'desc',
    status,
    paymentType,
    startDate,
    endDate,
    unitId
  } = options;

  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;

  // Start building the query
  let query = adminSupabase
    .from('payments')
    .select(`
      *,
      profiles:user_id(first_name, last_name, profile_pic_url, email),
      units:unit_id(unit_number, block_number, floor_number),
      societies:society_id(name, address)
    `, { count: 'exact' })
    .eq('society_id', societyId);

  // Apply additional filters
  if (status) {
    query = query.eq('status', status);
  }

  if (paymentType) {
    query = query.eq('payment_type', paymentType);
  }

  if (unitId) {
    query = query.eq('unit_id', unitId);
  }

  if (startDate) {
    query = query.gte('payment_date', startDate);
  }

  if (endDate) {
    query = query.lte('payment_date', endDate);
  }

  // Apply sorting and pagination
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Error fetching payments for society: ${error.message}`);
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
 * Get payment by ID
 */
export async function getPaymentById(id: string) {
  const { data, error } = await adminSupabase
    .from('payments')
    .select(`
      *,
      profiles:user_id(id, first_name, last_name, email, phone, profile_pic_url),
      units:unit_id(id, unit_number, block_number, floor_number),
      societies:society_id(id, name, address, city, state, pincode)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching payment: ${error.message}`);
  }

  return data;
}

/**
 * Create a new payment
 */
export async function createPayment(data: PaymentInsert) {
  // Generate a payment ID if not provided
  if (!data.payment_id) {
    data.payment_id = `PAY-${Date.now().toString().substring(6)}-${Math.floor(Math.random() * 1000)}`;
  }

  // Set default payment date to now if not provided
  if (!data.payment_date) {
    data.payment_date = new Date().toISOString();
  }

  // Set default status to pending if not provided
  if (!data.status) {
    data.status = 'pending';
  }

  const { data: payment, error } = await adminSupabase
    .from('payments')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating payment: ${error.message}`);
  }

  return payment;
}

/**
 * Update a payment
 */
export async function updatePayment(id: string, updates: PaymentUpdate) {
  const { data, error } = await adminSupabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating payment: ${error.message}`);
  }

  return data;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(id: string, status: string, updatedBy?: string, notes?: string) {
  const updates: PaymentUpdate = {
    status,
    updated_at: new Date().toISOString()
  };

  if (notes) {
    updates.notes = notes;
  }

  if (updatedBy) {
    updates.updated_by = updatedBy;
  }

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  } else if (status === 'failed') {
    updates.failed_at = new Date().toISOString();
  }

  return await updatePayment(id, updates);
}

/**
 * Delete a payment
 */
export async function deletePayment(id: string) {
  const { error } = await adminSupabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting payment: ${error.message}`);
  }

  return { id, success: true };
}

/**
 * Get payment statistics for a society
 */
export async function getPaymentStats(societyId?: string, timeFrame: 'week' | 'month' | 'year' = 'month') {
  try {
    // Set time frame
    const startDate = new Date();
    if (timeFrame === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeFrame === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeFrame === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const timeFilter = startDate.toISOString();

    // Base query
    let query = adminSupabase.from("payments");

    if (societyId) {
      query = query.eq('society_id', societyId);
    }

    // Get total payments in the time frame
    const { data: totalPayments, error: totalError } = await query
      .select('id, amount, status')
      .gte('created_at', timeFilter);

    if (totalError) throw totalError;

    // Get payments by status
    const { data: statusData, error: statusError } = await query
      .select('status, count')
      .gte('created_at', timeFilter)
      .group('status');

    if (statusError) throw statusError;

    // Get payments by type
    const { data: typeData, error: typeError } = await query
      .select('payment_type, count, sum(amount) as total_amount')
      .gte('created_at', timeFilter)
      .group('payment_type');

    if (typeError) throw typeError;

    // Calculate total amounts by status
    const completedAmount = totalPayments?.filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    const pendingAmount = totalPayments?.filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    const failedAmount = totalPayments?.filter(p => p.status === 'failed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    return {
      totalAmount: completedAmount + pendingAmount + failedAmount,
      completedAmount,
      pendingAmount,
      failedAmount,
      byStatus: statusData || [],
      byType: typeData || [],
      transactionCount: totalPayments?.length || 0,
    };
  } catch (err: any) {
    throw new Error(`Error fetching payment statistics: ${err.message}`);
  }
}
