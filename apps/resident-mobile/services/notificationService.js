import { supabase } from '../utils/supabase';
import { getProfileByAuthId } from '../utils/profileResolver';

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
    const profile = await getProfileByAuthId(user.id, 'id');
    if (!profile) {
      console.error('Error getting user profile for auth user:', user.id);
      return { success: false, error: 'Profile not found' };
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
    const isPending = payment?.status === 'pending' || payment?.payment_status === 'pending';
    const formattedAmount = payment.amount_formatted || `GHS ${payment.amount?.toFixed(2)}`;

    // Determine notification content based on transaction type
    if (payment.transaction_type === 'airtime') {
      title = isPending ? 'Airtime Purchase Initiated' : 'Airtime Purchase Successful';
      body = isPending
        ? `Your airtime purchase of ${formattedAmount} is pending confirmation.`
        : `Your airtime purchase of ${formattedAmount} was successful.`;
      notificationType = isPending ? 'payment_pending' : 'payment_success';
      priority = 'normal';
    } else if (payment.transaction_type === 'data') {
      title = isPending ? 'Data Purchase Initiated' : 'Data Purchase Successful';
      body = isPending
        ? `Your data purchase of ${payment.data_amount || ''} (${formattedAmount}) is pending confirmation.`
        : `Your data purchase of ${payment.data_amount || ''} (${formattedAmount}) was successful. Valid for ${payment.validity || '30 days'}.`;
      notificationType = isPending ? 'payment_pending' : 'payment_success';
      priority = 'normal';
    } else if (payment.transaction_type === 'money_transfer') {
      title = isPending ? 'Money Transfer Initiated' : 'Money Transfer Successful';
      body = isPending
        ? `Your money transfer of ${formattedAmount} is pending confirmation.`
        : `Your money transfer of ${formattedAmount} was successful.`;
      notificationType = isPending ? 'payment_pending' : 'payment_success';
      priority = 'normal';
    } else if (payment.transaction_type === 'bill_payment') {
      title = isPending ? 'Bill Payment Initiated' : 'Bill Payment Successful';
      body = isPending
        ? `Your bill payment of ${formattedAmount} is pending confirmation.`
        : `Your bill payment of ${formattedAmount} was successful.`;
      notificationType = isPending ? 'payment_pending' : 'payment_success';
      priority = 'normal';
    } else {
      title = isPending ? 'Payment Initiated' : 'Payment Successful';
      body = isPending
        ? `Your payment of ${formattedAmount} is pending confirmation.`
        : `Your payment of ${formattedAmount} was successful.`;
      notificationType = isPending ? 'payment_pending' : 'payment_success';
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
