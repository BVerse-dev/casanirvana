import { supabase } from '../utils/supabase';

/**
 * Add a new notification for a user
 * @param {Object} notification - The notification object
 * @returns {Promise<Object>} - The result of the operation
 */
export const addNotification = async (notification) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return { success: false, error: userError || 'User not authenticated' };
    }

    // Get the profile to get the correct user_id reference
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (profileError || !profile) {
      console.error('Error getting user profile:', profileError);
      return { success: false, error: profileError || 'Profile not found' };
    }

    // Set default values if not provided
    const notificationData = {
      user_id: profile.id,
      created_at: new Date().toISOString(),
      is_read: false,
      ...notification
    };

    // Insert notification
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error in addNotification:', error);
    return { success: false, error };
  }
};

/**
 * Create a payment notification
 * @param {Object} payment - The payment object
 * @returns {Promise<Object>} - The result of the operation
 */
export const createPaymentNotification = async (payment) => {
  try {
    let title, body, notificationType, priority;

    // Determine notification content based on transaction type
    if (payment.transaction_type === 'airtime') {
      title = 'Airtime Purchase Successful';
      body = `Your airtime purchase of ${payment.amount_formatted || `GHS ${payment.amount?.toFixed(2)}`} was successful.`;
      notificationType = 'payment_success';
      priority = 'normal';
    } else if (payment.transaction_type === 'data') {
      title = 'Data Purchase Successful';
      body = `Your data purchase of ${payment.data_amount || ''} (${payment.amount_formatted || `GHS ${payment.amount?.toFixed(2)}`}) was successful. Valid for ${payment.validity || '30 days'}.`;
      notificationType = 'payment_success';
      priority = 'normal';
    } else if (payment.transaction_type === 'money_transfer') {
      title = 'Money Transfer Successful';
      body = `Your money transfer of ${payment.amount_formatted || `GHS ${payment.amount?.toFixed(2)}`} was successful.`;
      notificationType = 'payment_success';
      priority = 'normal';
    } else if (payment.transaction_type === 'bill_payment') {
      title = 'Bill Payment Successful';
      body = `Your bill payment of ${payment.amount_formatted || `GHS ${payment.amount?.toFixed(2)}`} was successful.`;
      notificationType = 'payment_success';
      priority = 'normal';
    } else {
      title = 'Payment Successful';
      body = `Your payment of ${payment.amount_formatted || `GHS ${payment.amount?.toFixed(2)}`} was successful.`;
      notificationType = 'payment_success';
      priority = 'normal';
    }

    // Create notification
    const notification = {
      title,
      body,
      notification_type: notificationType,
      priority,
      reference_id: payment.transaction_id,
      action_url: null,
    };

    return await addNotification(notification);
  } catch (error) {
    console.error('Error creating payment notification:', error);
    return { success: false, error };
  }
};

export default {
  addNotification,
  createPaymentNotification,
};
