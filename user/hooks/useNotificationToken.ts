import { useState, useEffect, useCallback } from 'react';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { resolveProfileIdByAuthId } from '../utils/profileResolver';
import { isPushNotificationsSupported } from '../utils/notificationRuntime';
import Notifications from '../utils/notificationsAdapter';

export const useNotificationToken = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const saveTokenToDatabase = useCallback(async (token: string) => {
    try {
      if (!user) return;
      const profileId = await resolveProfileIdByAuthId(user.id);
      if (!profileId) return;

      // Update user profile with push token
      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_notification_token: token,
          push_notifications_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.error('Error in saveTokenToDatabase:', error);
    }
  }, [user]);

  const clearTokenFromDatabase = useCallback(async () => {
    try {
      if (!user) return;
      const profileId = await resolveProfileIdByAuthId(user.id);
      if (!profileId) return;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_notification_token: null,
          push_notifications_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) {
        console.error('Error clearing push token:', error);
      }
    } catch (error) {
      console.error('Error in clearTokenFromDatabase:', error);
    }
  }, [user]);

  const registerForPushNotificationsAsync = useCallback(async () => {
    try {
      if (!isPushNotificationsSupported) {
        setExpoPushToken('');
        setError('Push notifications require a development build in SDK 54+ (Expo Go limitation).');
        setIsLoading(false);
        return;
      }

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
  }, [saveTokenToDatabase, user]);

  useEffect(() => {
    if (!isPushNotificationsSupported) {
      setIsLoading(false);
      return;
    }

    registerForPushNotificationsAsync();
  }, [user, registerForPushNotificationsAsync]);

  return {
    expoPushToken,
    isLoading,
    error,
    registerForPushNotificationsAsync,
    saveTokenToDatabase,
    clearTokenFromDatabase,
  };
};
