import { supabase } from "../utils/supabase";

/**
 * Creates a new airtime purchase record
 * @param {Object} purchaseData - The airtime purchase data
 * @returns {Promise<Object>} - The result of the operation
 */
export const createAirtimePurchase = async (purchaseData) => {
  try {
    const { data, error } = await supabase
      .from('airtime_purchases')
      .insert([purchaseData])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error creating airtime purchase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates a new data purchase record
 * @param {Object} purchaseData - The data purchase data
 * @returns {Promise<Object>} - The result of the operation
 */
export const createDataPurchase = async (purchaseData) => {
  try {
    const { data, error } = await supabase
      .from('data_purchases')
      .insert([purchaseData])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error creating data purchase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates a new money transfer record
 * @param {Object} transferData - The money transfer data
 * @returns {Promise<Object>} - The result of the operation
 */
export const createMoneyTransfer = async (transferData) => {
  try {
    const { data, error } = await supabase
      .from('money_transfers')
      .insert([transferData])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error creating money transfer:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates a new bill payment record
 * @param {Object} paymentData - The bill payment data
 * @returns {Promise<Object>} - The result of the operation
 */
export const createBillPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('bill_payments')
      .insert([paymentData])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error creating bill payment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates a new insurance payment record
 * @param {Object} paymentData - The insurance payment data
 * @returns {Promise<Object>} - The result of the operation
 */
export const createInsurancePayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('insurance_payments')
      .insert([paymentData])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error creating insurance payment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Creates a new shopping payment record
 * @param {Object} paymentData - The shopping payment data
 * @returns {Promise<Object>} - The result of the operation
 */
export const createShoppingPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('shopping_payments')
      .insert([paymentData])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error creating shopping payment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetches personal hub transactions for a user
 * @param {string} userId - The user ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - The result of the operation
 */
export const getPersonalHubTransactions = async (userId, options = {}) => {
  try {
    const { 
      limit = 20, 
      page = 1, 
      transaction_type = null,
      status = null,
      orderBy = 'created_at',
      ascending = false
    } = options;
    
    let query = supabase
      .from('personal_hub_transactions')
      .select('*')
      .eq('user_id', userId);
    
    if (transaction_type) {
      query = query.eq('transaction_type', transaction_type);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    query = query.order(orderBy, { ascending });
    
    if (limit) {
      query = query.range((page - 1) * limit, page * limit - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    return { success: true, data, count };
  } catch (error) {
    console.error('Error fetching personal hub transactions:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates the status of a personal hub transaction
 * @param {string} transactionType - The transaction type
 * @param {string} transactionId - The transaction ID
 * @param {string} status - The new status
 * @returns {Promise<Object>} - The result of the operation
 */
export const updateTransactionStatus = async (transactionType, transactionId, status) => {
  try {
    let table;
    switch (transactionType) {
      case 'airtime':
        table = 'airtime_purchases';
        break;
      case 'data':
        table = 'data_purchases';
        break;
      case 'money_transfer':
        table = 'money_transfers';
        break;
      case 'bill_payment':
        table = 'bill_payments';
        break;
      case 'insurance':
        table = 'insurance_payments';
        break;
      case 'shopping':
        table = 'shopping_payments';
        break;
      default:
        throw new Error('Invalid transaction type');
    }
    
    const { data, error } = await supabase
      .from(table)
      .update({ status })
      .eq('id', transactionId)
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error(`Error updating ${transactionType} status:`, error);
    return { success: false, error: error.message };
  }
};
