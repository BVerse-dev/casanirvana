import { useEffect, useRef, useCallback } from 'react';
import { useNotificationPermissions } from './useNotificationPermissions';
import { useNotificationToken } from './useNotificationToken';
import { isPushNotificationsSupported } from '../utils/notificationRuntime';
import Notifications from '../utils/notificationsAdapter';

export const usePushNotifications = () => {
  const notificationListener = useRef<any>(null);
  
  const { isGranted, requestPermissions } = useNotificationPermissions();
  const { expoPushToken, registerForPushNotificationsAsync } = useNotificationToken();

  const handleNotificationReceived = useCallback((notification: any) => {
    // Handle notification received while app is open
    const { data } = notification.request.content;
    
    // Update badge count
    if (isPushNotificationsSupported) {
      Notifications.setBadgeCountAsync(1);
    }
    
    // Could trigger UI updates here
    console.log('Notification data:', data);
  }, []);

  useEffect(() => {
    if (!isPushNotificationsSupported) {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

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

  const handleNotificationResponse = (response: any) => {
    // Handle notification tap/interaction - navigation will be handled separately
    const { data } = response.notification.request.content;
    
    console.log('Notification tapped:', data);
    
    // Clear badge count
    if (isPushNotificationsSupported) {
      Notifications.setBadgeCountAsync(0);
    }
  };

  const setupNotifications = async () => {
    if (!isPushNotificationsSupported) {
      return false;
    }

    const hasPermission = await requestPermissions();
    if (hasPermission) {
      await registerForPushNotificationsAsync();
    }
    return hasPermission;
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    if (!isPushNotificationsSupported) {
      return;
    }

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
    if (!isPushNotificationsSupported) {
      return;
    }

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
