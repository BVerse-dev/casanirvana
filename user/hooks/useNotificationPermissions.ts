import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { isPushNotificationsSupported } from '../utils/notificationRuntime';
import Notifications from '../utils/notificationsAdapter';

export const useNotificationPermissions = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isPushNotificationsSupported) {
      setPermissionStatus('unavailable');
      setCanAskAgain(false);
      setIsLoading(false);
      return;
    }

    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      if (!isPushNotificationsSupported) {
        setPermissionStatus('unavailable');
        setCanAskAgain(false);
        return;
      }

      setIsLoading(true);
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      setCanAskAgain(canAskAgain);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      setPermissionStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      if (!isPushNotificationsSupported) {
        return false;
      }

      if (!Device.isDevice) {
        console.warn('Must use physical device for notifications');
        return false;
      }

      if (permissionStatus === 'granted') {
        return true;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      setPermissionStatus(status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  return {
    permissionStatus,
    canAskAgain,
    isLoading,
    isGranted: permissionStatus === 'granted',
    requestPermissions,
    checkPermissions,
  };
};
