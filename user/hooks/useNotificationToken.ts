import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useNotificationToken = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, [user]);

  const registerForPushNotificationsAsync = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!Device.isDevice) {
        setError('Must use physical device for notifications');
        setIsLoading(false);
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        setError('Failed to get push token for push notification!');
        setIsLoading(false);
        return;
      }

      // Get the project ID for EAS
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        setError('Project ID not found in configuration');
        setIsLoading(false);
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const token = pushTokenData.data;
      setExpoPushToken(token);

      // Save token to Supabase if user is logged in
      if (user && token) {
        await saveTokenToDatabase(token);
      }

    } catch (error) {
      console.error('Error registering for push notifications:', error);
      setError('Failed to register for push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTokenToDatabase = async (token: string) => {
    try {
      if (!user) return;

      // Update user profile with push token
      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_notification_token: token,
          push_notifications_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.error('Error in saveTokenToDatabase:', error);
    }
  };

  const clearTokenFromDatabase = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_notification_token: null,
          push_notifications_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error clearing push token:', error);
      }
    } catch (error) {
      console.error('Error in clearTokenFromDatabase:', error);
    }
  };

  return {
    expoPushToken,
    isLoading,
    error,
    registerForPushNotificationsAsync,
    saveTokenToDatabase,
    clearTokenFromDatabase,
  };
};
