import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Switch,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { useAuth } from "../contexts/AuthContext";
import { useNotificationContext } from "../contexts/NotificationContext";
import { supabase } from "../utils/supabase";
import { pushNotificationService } from "../services/pushNotificationService";

const NotificationSettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  const { user, profile } = useAuth();
  const { isGranted, setupNotifications, expoPushToken } = useNotificationContext();
  
  const [preferences, setPreferences] = useState({
    notices: true,
    maintenance: true,
    payments: true,
    visitors: true,
    emergencies: true,
    sound: true,
    vibration: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  function tr(key) {
    return t(`notificationSettingsScreen:${key}`);
  }

  const backAction = () => {
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      subscription?.remove(); 
    };
  }, []);

  // Initialize notifications when this screen loads
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await setupNotifications();
        console.log('Push notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initializeNotifications();
  }, [setupNotifications]);

  useEffect(() => {
    loadNotificationPreferences();
  }, [profile]);

  const loadNotificationPreferences = async () => {
    if (!profile) return;
    
    try {
      const savedPreferences = profile.notification_preferences || {};
      setPreferences({
        notices: savedPreferences.notices !== false,
        maintenance: savedPreferences.maintenance !== false,
        payments: savedPreferences.payments !== false,
        visitors: savedPreferences.visitors !== false,
        emergencies: savedPreferences.emergencies !== false,
        sound: savedPreferences.sound !== false,
        vibration: savedPreferences.vibration !== false,
      });
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const updatePreference = async (key, value) => {
    try {
      setIsLoading(true);
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          notification_preferences: newPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating preferences:', error);
        // Revert on error
        setPreferences(preferences);
        Alert.alert('Error', 'Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      setPreferences(preferences);
      Alert.alert('Error', 'Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const enableNotifications = async () => {
    try {
      const granted = await setupNotifications();
      if (granted) {
        Alert.alert('Success', 'Push notifications enabled successfully!');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings to receive alerts.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      Alert.alert('Error', 'Failed to enable push notifications');
    }
  };

  const testNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available. Please enable notifications first.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await pushNotificationService.testPushNotification(user.id, expoPushToken);
      
      if (result.success) {
        Alert.alert('Success', 'Test notification sent! Check your notification tray.');
      } else {
        Alert.alert('Error', 'Failed to send test notification: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreferenceItem = (key, title, description) => (
    <View style={{
      flexDirection: isRtl ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: Default.fixPadding * 1.5,
      paddingHorizontal: Default.fixPadding * 2,
      backgroundColor: Colors.white,
      marginBottom: Default.fixPadding,
      borderRadius: 10,
      ...Default.shadow,
    }}>
      <View style={{ flex: 1, marginRight: isRtl ? 0 : Default.fixPadding, marginLeft: isRtl ? Default.fixPadding : 0 }}>
        <Text style={{ ...Fonts.SemiBold16black }}>{title}</Text>
        <Text style={{ ...Fonts.Medium14grey, marginTop: 4 }}>{description}</Text>
      </View>
      <Switch
        value={preferences[key]}
        onValueChange={(value) => updatePreference(key, value)}
        disabled={isLoading}
        trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
        thumbColor={preferences[key] ? Colors.white : Colors.grey}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
          backgroundColor: Colors.white,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text
          style={{
            ...Fonts.SemiBold18black,
            marginHorizontal: Default.fixPadding,
          }}
        >
          Notification Settings
        </Text>
      </View>

      <View style={{ flex: 1, paddingTop: Default.fixPadding }}>
        {/* Push Notification Status */}
        <View style={{
          paddingHorizontal: Default.fixPadding * 2,
          paddingVertical: Default.fixPadding,
          backgroundColor: isGranted ? Colors.lightGreen : Colors.lightRed,
          marginBottom: Default.fixPadding * 2,
        }}>
          <View style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
          }}>
            <Ionicons
              name={isGranted ? "checkmark-circle" : "close-circle"}
              size={20}
              color={isGranted ? Colors.green : Colors.red}
            />
            <Text style={{
              ...Fonts.Medium14black,
              marginHorizontal: Default.fixPadding,
              flex: 1,
            }}>
              {isGranted ? "Push notifications are enabled" : "Push notifications are disabled"}
            </Text>
            {!isGranted && (
              <TouchableOpacity
                onPress={enableNotifications}
                style={{
                  backgroundColor: Colors.primary,
                  paddingHorizontal: Default.fixPadding,
                  paddingVertical: Default.fixPadding * 0.5,
                  borderRadius: 5,
                }}
              >
                <Text style={{ ...Fonts.Medium12white }}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Test Notification */}
        {isGranted && expoPushToken && (
          <View style={{
            paddingHorizontal: Default.fixPadding * 2,
            paddingVertical: Default.fixPadding,
            backgroundColor: Colors.white,
            marginBottom: Default.fixPadding * 2,
            borderRadius: 10,
            ...Default.shadow,
          }}>
            <Text style={{
              ...Fonts.SemiBold16black,
              marginBottom: Default.fixPadding,
            }}>
              Test Notifications
            </Text>
            <TouchableOpacity
              onPress={testNotification}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? Colors.lightGrey : Colors.primary,
                paddingVertical: Default.fixPadding,
                paddingHorizontal: Default.fixPadding * 2,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ ...Fonts.Medium14white }}>
                {isLoading ? 'Sending...' : 'Send Test Notification'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notification Categories */}
        <Text style={{
          ...Fonts.SemiBold16black,
          paddingHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding,
        }}>
          Notification Categories
        </Text>

        {renderPreferenceItem("notices", "Notice Board", "Updates from society management")}
        {renderPreferenceItem("maintenance", "Maintenance", "Maintenance request updates")}
        {renderPreferenceItem("payments", "Payments", "Payment reminders and confirmations")}
        {renderPreferenceItem("visitors", "Visitors", "Visitor approval requests")}
        {renderPreferenceItem("emergencies", "Emergencies", "Emergency alerts and announcements")}

        {/* Sound & Vibration */}
        <Text style={{
          ...Fonts.SemiBold16black,
          paddingHorizontal: Default.fixPadding * 2,
          marginTop: Default.fixPadding,
          marginBottom: Default.fixPadding,
        }}>
          Sound & Vibration
        </Text>

        {renderPreferenceItem("sound", "Sound", "Play notification sounds")}
        {renderPreferenceItem("vibration", "Vibration", "Vibrate on notification")}
      </View>
    </View>
  );
};

export default NotificationSettingsScreen;
