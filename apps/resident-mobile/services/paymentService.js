import { supabase } from '../utils/supabase';

const PAYMENTS_TABLE_COLUMNS = new Set([
  'id',
  'unit_id',
  'amount',
  'due_date',
  'paid_at',
  'status',
  'transaction_id',
  'notes',
  'completed_at',
  'failed_at',
  'payment_type',
  'payment_date',
  'description',
  'payment_method',
  'title',
  'payer_id',
  'reference_number',
  'payment_gateway',
  'invoice_generated_at',
  'reminder_sent_at',
  'initiated_at',
  'created_at',
  'updated_at',
  'receipt_url',
  'metadata',
  'booking_id',
]);

const normalizePaymentPayload = (payment = {}) => {
  const normalized = { ...payment };

  if (!normalized.transaction_id) {
    normalized.transaction_id = `PAY-${Date.now().toString().substring(6)}-${Math.floor(Math.random() * 1000)}`;
  }

  if (!normalized.payment_date) {
    normalized.payment_date = new Date().toISOString();
  }

  if (!normalized.status) {
    normalized.status = 'pending';
  }

  const knownPayload = {};
  const metadataInput =
    normalized.metadata && typeof normalized.metadata === 'object' && !Array.isArray(normalized.metadata)
      ? { ...normalized.metadata }
      : {};

  const extraFields = {};

  Object.entries(normalized).forEach(([key, value]) => {
    if (key === 'metadata') return;
    if (PAYMENTS_TABLE_COLUMNS.has(key)) {
      knownPayload[key] = value;
    } else if (value !== undefined) {
      extraFields[key] = value;
    }
  });

  const mergedMetadata = {
    ...metadataInput,
    ...extraFields,
  };

  if (Object.keys(mergedMetadata).length > 0) {
    knownPayload.metadata = mergedMetadata;
  }

  return knownPayload;
};

/**
 * Add a new payment record.
 * Table: payments
 * @param {Object} payment - Payment object (unit_id, amount, type, etc)
 * @returns {Promise}
 */
export const addPayment = async (payment) => {
  const insertPayload = normalizePaymentPayload(payment);

  try {
    const { data, error } = await supabase.from('payments').insert([insertPayload]).select();

    if (error) throw error;
    return { data: data?.[0], error: null, success: true };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { data: null, error, success: false };
  }
};

/**
 * Get payments for a unit with optional filters, pagination, and sorting.
 * Table: payments
 * @param {Object} params - { unit_id, type, status, limit, page, orderBy, ascending }
 * @returns {Promise}
 */
export const getPaymentsForUnit = async ({
  unit_id,
  type,
  status,
  startDate,
  endDate,
  limit = 10,
  page = 1,
  orderBy = 'created_at',
  ascending = false
} = {}) => {
  try {
    let query = supabase
      .from('payments')
      .select(`
        *,
        profiles:user_id(first_name, last_name, profile_pic_url),
        units:unit_id(unit_number, block_number)
      `, { count: 'exact' });

    if (unit_id) query = query.eq('unit_id', unit_id);
    if (type) query = query.eq('payment_type', type);
    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('payment_date', startDate);
    if (endDate) query = query.lte('payment_date', endDate);

    query = query.order(orderBy, { ascending });

    if (limit) query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data,
      count,
      error: null,
      pageInfo: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { data: [], count: 0, error };
  }
};

/**
 * Get a single payment by ID.
 * Table: payments
 * @param {string} id - Payment ID
 * @returns {Promise}
 */
export const getPaymentById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        profiles:user_id(id, first_name, last_name, email, profile_pic_url),
        units:unit_id(id, unit_number, block_number, floor_number),
        communities:community_id(id, name, address)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching payment with id ${id}:`, error);
    return { data: null, error };
  }
};

/**
 * Update payment.
 * Table: payments
 * @param {string} id - Payment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise}
 */
export const updatePayment = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (error) {
    console.error(`Error updating payment with id ${id}:`, error);
    return { data: null, error };
  }
};

/**
 * Delete payment.
 * Table: payments
 * @param {string} id - Payment ID
 * @returns {Promise}
 */
export const deletePayment = async (id) => {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting payment with id ${id}:`, error);
    return { success: false, error };
  }
};

/**
 * Get payment statistics for a user
 * @param {string} userId - User ID
 * @param {string} timeFrame - 'week', 'month', or 'year'
 * @returns {Promise}
 */
export const getPaymentStats = async (userId, timeFrame = 'month') => {
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

    // Get all payments for this user within the time frame
    const { data: payments, error } = await supabase
      .from('payments')
      .select('amount, status, payment_type')
      .eq('user_id', userId)
      .gte('created_at', timeFilter);

    if (error) throw error;

    // Calculate totals by status
    const completedAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingAmount = payments
      .filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Count by type
    const byType = {};
    payments.forEach(p => {
      const type = p.payment_type || 'other';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      data: {
        totalCount: payments.length,
        completedAmount,
        pendingAmount,
        byType,
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    return { data: null, error };
  }
};
