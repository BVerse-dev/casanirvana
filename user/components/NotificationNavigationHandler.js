import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';

export const NotificationNavigationHandler = ({ children }) => {
  const { handleNotificationResponse } = useNotificationNavigation();

  useEffect(() => {
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
