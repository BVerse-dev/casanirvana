import { supabase } from '../utils/supabase';

/**
 * Push Notification Service
 * Handles sending push notifications for various events
 */
export const pushNotificationService = {
  /**
   * Send push notifications for a new notice
   */
  async sendNoticeNotifications(noticeId, societyId) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notice-push-notifications', {
        body: {
          noticeId,
          societyId
        }
      });

      if (error) {
        console.error('Error sending notice notifications:', error);
        return { success: false, error };
      }

      console.log('Notice notifications sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error in sendNoticeNotifications:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test push notification functionality
   */
  async testPushNotification(userId, token) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: token,
          title: '🎉 Test Notification',
          body: 'Push notifications are working correctly!',
          data: {
            type: 'test',
            userId: userId
          },
          sound: 'default',
          badge: 1
        }),
      });

      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error) {
      console.error('Error sending test notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get notification logs for a user
   */
  async getNotificationLogs(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notification logs:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in getNotificationLogs:', error);
      return { success: false, error: error.message };
    }
  }
};
