import { supabase } from "../utils/supabase";

/**
 * Create a bill payment record
 * @param {Object} billPayment - The bill payment object
 * @returns {Promise<Object>} - The created bill payment or error
 */
export const createBillPayment = async (billPayment) => {
  try {
    const { data, error } = await supabase
      .from("bill_payments")
      .insert([billPayment])
      .select()
      .single();

    if (error) {
      console.error("Error creating bill payment:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception creating bill payment:", error);
    return { error };
  }
};

/**
 * Get bill payments for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The bill payments or error
 */
export const getBillPayments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("bill_payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bill payments:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception fetching bill payments:", error);
    return { error };
  }
};

/**
 * Update bill payment status
 * @param {string} id - The bill payment ID
 * @param {string} status - The new status
 * @returns {Promise<Object>} - The updated bill payment or error
 */
export const updateBillPaymentStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from("bill_payments")
      .update({ status, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating bill payment status:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception updating bill payment status:", error);
    return { error };
  }
};

/**
 * Save a bill account for future use
 * @param {Object} account - The account object
 * @returns {Promise<Object>} - The saved account or error
 */
export const saveBillAccount = async (account) => {
  try {
    const { data, error } = await supabase
      .from("saved_bill_accounts")
      .insert([account])
      .select()
      .single();

    if (error) {
      console.error("Error saving bill account:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception saving bill account:", error);
    return { error };
  }
};

/**
 * Get saved bill accounts for a user
 * @param {string} userId - The user ID
 * @param {string} provider - Optional provider filter
 * @returns {Promise<Object>} - The saved accounts or error
 */
export const getSavedBillAccounts = async (userId, provider = null) => {
  try {
    let query = supabase
      .from("saved_bill_accounts")
      .select("*")
      .eq("user_id", userId);
    
    if (provider) {
      query = query.eq("provider", provider);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved bill accounts:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception fetching saved bill accounts:", error);
    return { error };
  }
};

/**
 * Delete a saved bill account
 * @param {string} id - The saved account ID
 * @returns {Promise<Object>} - Success or error
 */
export const deleteSavedBillAccount = async (id) => {
  try {
    const { error } = await supabase
      .from("saved_bill_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting saved bill account:", error);
      return { error };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception deleting saved bill account:", error);
    return { error };
  }
};
