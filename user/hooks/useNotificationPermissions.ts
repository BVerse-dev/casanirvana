import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const useNotificationPermissions = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
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
