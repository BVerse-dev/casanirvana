import { supabase } from "../utils/supabase";

/**
 * Create an insurance payment record
 * @param {Object} insurancePayment - The insurance payment object
 * @returns {Promise<Object>} - The created insurance payment or error
 */
export const createInsurancePayment = async (insurancePayment) => {
  try {
    const { data, error } = await supabase
      .from("insurance_payments")
      .insert([insurancePayment])
      .select()
      .single();

    if (error) {
      console.error("Error creating insurance payment:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception creating insurance payment:", error);
    return { error };
  }
};

/**
 * Get insurance payments for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The insurance payments or error
 */
export const getInsurancePayments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("insurance_payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching insurance payments:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception fetching insurance payments:", error);
    return { error };
  }
};

/**
 * Update insurance payment status
 * @param {string} id - The insurance payment ID
 * @param {string} status - The new status
 * @returns {Promise<Object>} - The updated insurance payment or error
 */
export const updateInsurancePaymentStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from("insurance_payments")
      .update({ status, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating insurance payment status:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception updating insurance payment status:", error);
    return { error };
  }
};

/**
 * Save a policy for future use
 * @param {Object} policy - The policy object
 * @returns {Promise<Object>} - The saved policy or error
 */
export const savePolicy = async (policy) => {
  try {
    const { data, error } = await supabase
      .from("saved_policies")
      .insert([policy])
      .select()
      .single();

    if (error) {
      console.error("Error saving policy:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception saving policy:", error);
    return { error };
  }
};

/**
 * Get saved policies for a user
 * @param {string} userId - The user ID
 * @param {string} provider - Optional provider filter
 * @returns {Promise<Object>} - The saved policies or error
 */
export const getSavedPolicies = async (userId, provider = null) => {
  try {
    let query = supabase
      .from("saved_policies")
      .select("*")
      .eq("user_id", userId);
    
    if (provider) {
      query = query.eq("provider", provider);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved policies:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Exception fetching saved policies:", error);
    return { error };
  }
};

/**
 * Delete a saved policy
 * @param {string} id - The saved policy ID
 * @returns {Promise<Object>} - Success or error
 */
export const deleteSavedPolicy = async (id) => {
  try {
    const { error } = await supabase
      .from("saved_policies")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting saved policy:", error);
      return { error };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception deleting saved policy:", error);
    return { error };
  }
};
