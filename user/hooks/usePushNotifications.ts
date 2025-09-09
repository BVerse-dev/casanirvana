import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useNotificationPermissions } from './useNotificationPermissions';
import { useNotificationToken } from './useNotificationToken';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  
  const { isGranted, requestPermissions } = useNotificationPermissions();
  const { expoPushToken, registerForPushNotificationsAsync } = useNotificationToken();

  const handleNotificationReceived = useCallback((notification: Notifications.Notification) => {
    // Handle notification received while app is open
    const { data } = notification.request.content;
    
    // Update badge count
    Notifications.setBadgeCountAsync(1);
    
    // Could trigger UI updates here
    console.log('Notification data:', data);
  }, []);

  useEffect(() => {
    // Cleanup any existing listener first (for hot reload safety)
    if (notificationListener.current) {
      notificationListener.current.remove();
      notificationListener.current = null;
    }

    // Setup notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(handleNotificationReceived);

    // Note: Response listener is handled in NotificationNavigationHandler component

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
        notificationListener.current = null;
      }
    };
  }, [handleNotificationReceived]);

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    // Handle notification tap/interaction - navigation will be handled separately
    const { data } = response.notification.request.content;
    
    console.log('Notification tapped:', data);
    
    // Clear badge count
    Notifications.setBadgeCountAsync(0);
  };

  const setupNotifications = async () => {
    const hasPermission = await requestPermissions();
    if (hasPermission) {
      await registerForPushNotificationsAsync();
    }
    return hasPermission;
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Send immediately
    });
  };

  const clearAllNotifications = async () => {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  };

  return {
    isGranted,
    expoPushToken,
    setupNotifications,
    sendLocalNotification,
    clearAllNotifications,
    handleNotificationReceived,
    handleNotificationResponse,
  };
};
