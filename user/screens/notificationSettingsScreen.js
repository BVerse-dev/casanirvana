import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Switch,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { useAuth } from "../contexts/AuthContext";
import { useNotificationContext } from "../contexts/NotificationContext";
import { supabase } from "../utils/supabase";
import { resolveProfileIdByAuthId } from "../utils/profileResolver";
import { pushNotificationService } from "../services/pushNotificationService";
import { isPushNotificationsSupported } from "../utils/notificationRuntime";

const NotificationSettingsScreen = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { user, profile } = useAuth();
  const { isGranted, setupNotifications, expoPushToken } = useNotificationContext();
  
  const [preferences, setPreferences] = useState({
    // Community notifications
    notices: true,
    announcements: true,
    events: true,
    // Maintenance & Services
    maintenance: true,
    serviceRequests: true,
    workOrders: true,
    // Financial
    payments: true,
    bills: true,
    dueReminders: true,
    // Security & Access
    visitors: true,
    security: true,
    emergencies: true,
    // Communication
    messages: true,
    groupChats: true,
    directMessages: true,
    // System settings
    sound: true,
    vibration: true,
    badge: true,
    // Timing controls
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    weekendNotifications: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // Notification categories with icons and colors
  const notificationCategories = [
    {
      title: "Community Updates",
      icon: "home-group",
      color: Colors.blue,
      items: [
        { key: "notices", title: "Notice Board", description: "Official announcements and notices", icon: "bulletin-board" },
        { key: "announcements", title: "General Announcements", description: "Community-wide updates", icon: "bullhorn" },
        { key: "events", title: "Community Events", description: "Upcoming events and activities", icon: "calendar-star" },
      ]
    },
    {
      title: "Maintenance & Services",
      icon: "tools",
      color: Colors.orange,
      items: [
        { key: "maintenance", title: "Maintenance Updates", description: "Status updates on your requests", icon: "wrench" },
        { key: "serviceRequests", title: "Service Requests", description: "New service provider responses", icon: "account-hard-hat" },
        { key: "workOrders", title: "Work Orders", description: "Scheduled maintenance and repairs", icon: "clipboard-list" },
      ]
    },
    {
      title: "Financial",
      icon: "credit-card",
      color: Colors.green,
      items: [
        { key: "payments", title: "Payment Confirmations", description: "Successful payment notifications", icon: "check-circle" },
        { key: "bills", title: "New Bills", description: "Monthly bills and invoices", icon: "receipt" },
        { key: "dueReminders", title: "Payment Reminders", description: "Upcoming and overdue payments", icon: "clock-alert" },
      ]
    },
    {
      title: "Security & Access",
      icon: "shield-check",
      color: Colors.red,
      items: [
        { key: "visitors", title: "Visitor Requests", description: "Guest approval and notifications", icon: "account-plus" },
        { key: "security", title: "Security Alerts", description: "Security-related notifications", icon: "shield-alert" },
        { key: "emergencies", title: "Emergency Alerts", description: "Critical emergency notifications", icon: "alert-circle" },
      ]
    },
    {
      title: "Communication",
      icon: "chat",
      color: Colors.purple,
      items: [
        { key: "messages", title: "All Messages", description: "Chat and messaging notifications", icon: "message" },
        { key: "groupChats", title: "Group Chats", description: "Community group discussions", icon: "account-group" },
        { key: "directMessages", title: "Direct Messages", description: "Private conversations", icon: "message-reply" },
      ]
    }
  ];

  const systemSettings = [
    { key: "sound", title: "Sound", description: "Play notification sounds", icon: "volume-high" },
    { key: "vibration", title: "Vibration", description: "Vibrate on notifications", icon: "vibrate" },
    { key: "badge", title: "App Badge", description: "Show unread count on app icon", icon: "numeric" },
  ];

  const backAction = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      subscription?.remove(); 
    };
  }, [backAction]);

  // Initialize notifications when this screen loads
  useEffect(() => {
    const initializeNotifications = async () => {
      if (!isPushNotificationsSupported) {
        return;
      }

      try {
        const initialized = await setupNotifications();
        if (initialized) {
          console.log('Push notifications initialized successfully');
        } else {
          console.log('Push notifications unavailable in Expo Go. Use a development build for remote push support.');
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initializeNotifications();
  }, [setupNotifications]);

  const resolveProfileId = async () => {
    if (profile?.id) {
      return profile.id;
    }
    return resolveProfileIdByAuthId(user?.id);
  };

  const loadNotificationPreferences = useCallback(async () => {
    if (!profile) return;
    
    try {
      const savedPreferences = profile.notification_preferences || {};
      setPreferences(prev => ({
        ...prev,
        ...savedPreferences
      }));
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }, [profile]);

  useEffect(() => {
    loadNotificationPreferences();
  }, [loadNotificationPreferences]);

  const persistPreferences = async (newPreferences, previousPreferences) => {
    try {
      setIsLoading(true);
      setPreferences(newPreferences);
      const profileId = await resolveProfileId();

      if (!profileId) {
        throw new Error("Profile not found for current user");
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          notification_preferences: newPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      setPreferences(previousPreferences);
      Alert.alert('Error', 'Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    const previousPreferences = preferences;
    const newPreferences = { ...preferences, [key]: value };
    await persistPreferences(newPreferences, previousPreferences);
  };

  const enableNotifications = async () => {
    if (!isPushNotificationsSupported) {
      Alert.alert('Unavailable in Expo Go', 'Remote push notifications require a development build.');
      return;
    }

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
    if (!isPushNotificationsSupported) {
      Alert.alert('Unavailable in Expo Go', 'Test push notifications require a development build.');
      return;
    }

    if (!expoPushToken) {
      Alert.alert('Error', 'No push token available. Please enable notifications first.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await pushNotificationService.testPushNotification(user.id, expoPushToken);
      
      if (result.success) {
        setShowTestModal(true);
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

  const enableAllNotifications = () => {
    const previousPreferences = preferences;
    const allEnabled = Object.keys(preferences).reduce((acc, key) => {
      if (key !== 'quietHoursStart' && key !== 'quietHoursEnd') {
        acc[key] = true;
      } else {
        acc[key] = preferences[key];
      }
      return acc;
    }, {});
    persistPreferences(allEnabled, previousPreferences);
  };

  const disableAllNotifications = () => {
    const previousPreferences = preferences;
    const allDisabled = Object.keys(preferences).reduce((acc, key) => {
      if (key !== 'quietHoursStart' && key !== 'quietHoursEnd' && key !== 'quietHoursEnabled') {
        acc[key] = false;
      } else {
        acc[key] = preferences[key];
      }
      return acc;
    }, {});
    persistPreferences(allDisabled, previousPreferences);
  };

  const renderNotificationItem = (item, categoryColor) => (
    <View key={item.key} style={styles.notificationItem}>
      <View style={styles.itemLeft}>
        <View style={[styles.itemIcon, { backgroundColor: categoryColor + "15" }]}>
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            color={categoryColor}
          />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
      </View>
      <Switch
        value={preferences[item.key]}
        onValueChange={(value) => updatePreference(item.key, value)}
        disabled={isLoading}
        trackColor={{ false: Colors.lightGrey, true: categoryColor }}
        thumbColor={preferences[item.key] ? Colors.white : Colors.grey}
      />
    </View>
  );

  const renderCategory = (category) => (
    <View key={category.title} style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color + "15" }]}>
            <MaterialCommunityIcons
              name={category.icon}
              size={24}
              color={category.color}
            />
          </View>
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </View>
        <Text style={styles.categoryCount}>{category.items.length} items</Text>
      </View>
      <View style={styles.categoryItems}>
        {category.items.map(item => renderNotificationItem(item, category.color))}
      </View>
    </View>
  );

  const QuietHoursModal = () => (
    <Modal
      visible={showQuietHoursModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowQuietHoursModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name="sleep" size={24} color={Colors.primary} />
            <Text style={styles.modalTitle}>Quiet Hours Settings</Text>
            <TouchableOpacity onPress={() => setShowQuietHoursModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalDescription}>
            During quiet hours, only emergency and high-priority notifications will be delivered.
          </Text>

          <View style={styles.timeSettingsContainer}>
            <View style={styles.timeSetting}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <TouchableOpacity style={styles.timeButton}>
                <MaterialCommunityIcons name="clock" size={18} color={Colors.primary} />
                <Text style={styles.timeText}>{preferences.quietHoursStart}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeSetting}>
              <Text style={styles.timeLabel}>End Time</Text>
              <TouchableOpacity style={styles.timeButton}>
                <MaterialCommunityIcons name="clock" size={18} color={Colors.primary} />
                <Text style={styles.timeText}>{preferences.quietHoursEnd}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowQuietHoursModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalConfirmButton}
              onPress={() => {
                updatePreference('quietHoursEnabled', true);
                setShowQuietHoursModal(false);
              }}
            >
              <Text style={styles.modalConfirmButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const TestNotificationModal = () => (
    <Modal
      visible={showTestModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowTestModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.testModalContainer}>
          <View style={styles.testModalContent}>
            <MaterialCommunityIcons name="check-circle" size={48} color={Colors.green} />
            <Text style={styles.testModalTitle}>Test Notification Sent!</Text>
            <Text style={styles.testModalMessage}>
              Check your notification tray to see the test notification.
            </Text>
            <TouchableOpacity 
              style={styles.testModalButton}
              onPress={() => setShowTestModal(false)}
            >
              <Text style={styles.testModalButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: isGranted ? Colors.green + "10" : Colors.red + "10" }]}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusIcon, { backgroundColor: isGranted ? Colors.green : Colors.red }]}>
              <MaterialCommunityIcons
                name={isGranted ? "bell-check" : "bell-off"}
                size={24}
                color={Colors.white}
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                {isGranted ? "Notifications Enabled" : "Notifications Disabled"}
              </Text>
              <Text style={styles.statusDescription}>
                {isGranted 
                  ? "You'll receive notifications based on your preferences below" 
                  : "Enable notifications to stay updated on community activities"
                }
              </Text>
            </View>
          </View>
          {!isGranted && (
            <TouchableOpacity style={styles.enableButton} onPress={enableNotifications}>
              <Text style={styles.enableButtonText}>Enable</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        {isGranted && (
          <View style={styles.quickActionsCard}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={[styles.quickActionButton, styles.enableAllButton]} onPress={enableAllNotifications}>
                <MaterialCommunityIcons name="bell-check" size={18} color={Colors.white} />
                <Text style={styles.enableAllButtonText}>Enable All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.quickActionButton, styles.disableAllButton]} onPress={disableAllNotifications}>
                <MaterialCommunityIcons name="bell-off" size={18} color={Colors.white} />
                <Text style={styles.disableAllButtonText}>Disable All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickActionButton, styles.testButton, isLoading && styles.testButtonDisabled]} 
                onPress={testNotification}
                disabled={isLoading}
              >
                <MaterialCommunityIcons 
                  name={isLoading ? "loading" : "bell-ring"} 
                  size={18} 
                  color={Colors.white}
                />
                <Text style={styles.testButtonText}>
                  {isLoading ? "Sending..." : "Test"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notification Categories */}
        {isGranted && notificationCategories.map(renderCategory)}

        {/* System Settings */}
        {isGranted && (
          <View style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: Colors.darkGrey + "15" }]}>
                  <MaterialCommunityIcons
                    name="cog"
                    size={24}
                    color={Colors.darkGrey}
                  />
                </View>
                <Text style={styles.categoryTitle}>System Settings</Text>
              </View>
              <Text style={styles.categoryCount}>{systemSettings.length} items</Text>
            </View>
            <View style={styles.categoryItems}>
              {systemSettings.map(item => renderNotificationItem(item, Colors.darkGrey))}
            </View>
          </View>
        )}

        {/* Advanced Settings */}
        {isGranted && (
          <View style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: Colors.purple + "15" }]}>
                  <MaterialCommunityIcons
                    name="tune"
                    size={24}
                    color={Colors.purple}
                  />
                </View>
                <Text style={styles.categoryTitle}>Advanced Settings</Text>
              </View>
            </View>
            <View style={styles.categoryItems}>
              <TouchableOpacity 
                style={styles.advancedItem}
                onPress={() => setShowQuietHoursModal(true)}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.itemIcon, { backgroundColor: Colors.purple + "15" }]}>
                    <MaterialCommunityIcons
                      name="sleep"
                      size={20}
                      color={Colors.purple}
                    />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>Quiet Hours</Text>
                    <Text style={styles.itemDescription}>
                      {preferences.quietHoursEnabled 
                        ? `Active from ${preferences.quietHoursStart} to ${preferences.quietHoursEnd}`
                        : "Set times when notifications are limited"
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.advancedItemRight}>
                  <Switch
                    value={preferences.quietHoursEnabled}
                    onValueChange={(value) => {
                      if (value) {
                        setShowQuietHoursModal(true);
                      } else {
                        updatePreference('quietHoursEnabled', false);
                      }
                    }}
                    disabled={isLoading}
                    trackColor={{ false: Colors.lightGrey, true: Colors.purple }}
                    thumbColor={preferences.quietHoursEnabled ? Colors.white : Colors.grey}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.notificationItem}>
                <View style={styles.itemLeft}>
                  <View style={[styles.itemIcon, { backgroundColor: Colors.purple + "15" }]}>
                    <MaterialCommunityIcons
                      name="calendar-weekend"
                      size={20}
                      color={Colors.purple}
                    />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>Weekend Notifications</Text>
                    <Text style={styles.itemDescription}>Receive notifications on weekends</Text>
                  </View>
                </View>
                <Switch
                  value={preferences.weekendNotifications}
                  onValueChange={(value) => updatePreference('weekendNotifications', value)}
                  disabled={isLoading}
                  trackColor={{ false: Colors.lightGrey, true: Colors.purple }}
                  thumbColor={preferences.weekendNotifications ? Colors.white : Colors.grey}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <QuietHoursModal />
      <TestNotificationModal />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.regularGrey,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  backButton: {
    padding: Default.fixPadding * 0.5,
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    marginHorizontal: Default.fixPadding,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Default.fixPadding * 1.5,
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 3,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Default.fixPadding * 2,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Default.fixPadding * 1.5,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.3,
  },
  statusDescription: {
    ...Fonts.Medium12grey,
    lineHeight: 18,
  },
  enableButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 8,
  },
  enableButtonText: {
    ...Fonts.SemiBold14white,
  },
  quickActionsCard: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  quickActionsTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 1.2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 8,
    marginHorizontal: Default.fixPadding * 0.3,
    ...Default.shadow,
    elevation: 3,
  },
  enableAllButton: {
    backgroundColor: Colors.green,
  },
  enableAllButtonText: {
    ...Fonts.SemiBold12white,
    marginLeft: Default.fixPadding * 0.5,
  },
  disableAllButton: {
    backgroundColor: Colors.orange,
  },
  disableAllButtonText: {
    ...Fonts.SemiBold12white,
    marginLeft: Default.fixPadding * 0.5,
  },
  testButton: {
    backgroundColor: Colors.primary,
  },
  testButtonDisabled: {
    backgroundColor: Colors.lightGrey,
    opacity: 0.7,
  },
  testButtonText: {
    ...Fonts.SemiBold12white,
    marginLeft: Default.fixPadding * 0.5,
  },
  categoryContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Default.fixPadding * 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Default.fixPadding,
  },
  categoryTitle: {
    ...Fonts.SemiBold16black,
  },
  categoryCount: {
    ...Fonts.Medium12grey,
  },
  categoryItems: {
    paddingBottom: Default.fixPadding,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Default.fixPadding,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...Fonts.SemiBold14black,
    marginBottom: Default.fixPadding * 0.2,
  },
  itemDescription: {
    ...Fonts.Medium12grey,
    lineHeight: 16,
  },
  advancedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
  },
  advancedItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Default.fixPadding * 2,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Default.fixPadding * 1.5,
  },
  modalTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  modalDescription: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
    marginBottom: Default.fixPadding * 2,
  },
  timeSettingsContainer: {
    marginBottom: Default.fixPadding * 2,
  },
  timeSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Default.fixPadding,
  },
  timeLabel: {
    ...Fonts.Medium16black,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.extraLightGrey,
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 8,
  },
  timeText: {
    ...Fonts.Medium14black,
    marginLeft: Default.fixPadding * 0.5,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Default.fixPadding,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.lightGrey,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    ...Fonts.SemiBold14black,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    ...Fonts.SemiBold14white,
  },
  testModalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Default.fixPadding * 3,
    alignItems: 'center',
    maxWidth: 300,
  },
  testModalContent: {
    alignItems: 'center',
  },
  testModalTitle: {
    ...Fonts.SemiBold18black,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  testModalMessage: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Default.fixPadding * 2,
  },
  testModalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 3,
    borderRadius: 10,
  },
  testModalButtonText: {
    ...Fonts.SemiBold14white,
  },
};

export default NotificationSettingsScreen;
