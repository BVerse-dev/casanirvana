import { useEffect } from 'react';
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';
import { isPushNotificationsSupported } from '../utils/notificationRuntime';
import Notifications from '../utils/notificationsAdapter';

export const NotificationNavigationHandler = ({ children }) => {
  const { handleNotificationResponse } = useNotificationNavigation();

  useEffect(() => {
    if (!isPushNotificationsSupported) {
      return;
    }

    // Listen for notification responses (when user taps on notification)
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [handleNotificationResponse]);

  return children;
};
