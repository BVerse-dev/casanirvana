import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Switch,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import { useGuardAuth } from "../contexts/GuardAuthContext";
import {
  DEFAULT_GUARD_NOTIFICATION_SETTINGS,
  loadGuardNotificationSettings,
  saveGuardNotificationSettings,
} from "../services/settingsPersistenceService";

const CATEGORY_KEYS = [
  "visitorAlerts",
  "emergencyAlerts",
  "shiftUpdates",
  "securityAlerts",
  "adminMessages",
  "systemNotifications",
];

const NotificationSettingsScreen = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { authUser, user } = useGuardAuth();
  const isRtl = i18n.dir() === "rtl";

  const authUserId = authUser?.id || user?.id || null;

  const [preferences, setPreferences] = useState({
    ...DEFAULT_GUARD_NOTIFICATION_SETTINGS,
  });
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => sub?.remove();
  }, [navigation]);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      setIsHydrating(true);
      try {
        const loaded = await loadGuardNotificationSettings(authUserId);
        if (!active) return;
        setPreferences(loaded);
      } catch (error) {
        console.error("Failed to hydrate guard notification settings:", error);
        if (!active) return;
        setPreferences({ ...DEFAULT_GUARD_NOTIFICATION_SETTINGS });
      } finally {
        if (active) {
          setIsHydrating(false);
        }
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, [authUserId]);

  const getActiveNotificationCount = useMemo(() => {
    return CATEGORY_KEYS.filter((key) => preferences[key]).length;
  }, [preferences]);

  const persistPreferences = async (nextState, patch, previousState) => {
    setPreferences(nextState);

    if (!authUserId) {
      return;
    }

    setIsSaving(true);
    try {
      const persisted = await saveGuardNotificationSettings(authUserId, patch);
      setPreferences(persisted);
    } catch (error) {
      console.error("Failed to persist guard notification settings:", error);
      setPreferences(previousState);
      Alert.alert("Update failed", error?.message || "Could not save notification settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key, value) => {
    if (key === "emergencyAlerts" && !value) {
      Alert.alert(
        "Disable emergency alerts?",
        "This can delay critical incident visibility. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: () => {
              const previousState = preferences;
              const nextState = { ...preferences, [key]: false };
              persistPreferences(nextState, { [key]: false }, previousState);
            },
          },
        ]
      );
      return;
    }

    const previousState = preferences;
    const nextState = { ...preferences, [key]: value };
    persistPreferences(nextState, { [key]: value }, previousState);
  };

  const enableAllNotifications = () => {
    const patch = CATEGORY_KEYS.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    const previousState = preferences;
    const nextState = { ...preferences, ...patch };
    persistPreferences(nextState, patch, previousState);
  };

  const disableAllNotifications = () => {
    Alert.alert(
      "Disable all categories?",
      "Critical emergency incidents may be easier to miss if all categories are disabled.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: () => {
            const patch = CATEGORY_KEYS.reduce((acc, key) => {
              acc[key] = false;
              return acc;
            }, {});
            const previousState = preferences;
            const nextState = { ...preferences, ...patch };
            persistPreferences(nextState, patch, previousState);
          },
        },
      ]
    );
  };

  const testNotification = () => {
    Alert.alert(
      "Notification test",
      "Device-level push test is available in development/production builds. Local settings are saved successfully."
    );
  };

  const renderCategoryItem = (key, title, description, icon, iconColor = Colors.primary) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Text style={styles.categoryDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={Boolean(preferences[key])}
        onValueChange={(v) => updatePreference(key, v)}
        disabled={isHydrating || isSaving}
        trackColor={{ false: Colors.lightGrey, true: iconColor }}
        thumbColor={preferences[key] ? Colors.white : Colors.grey}
        style={styles.switch}
      />
    </View>
  );

  const renderSystemItem = (key, title, description, icon) => (
    <View style={styles.systemItem}>
      <View style={styles.systemContent}>
        <MaterialIcons name={icon} size={20} color={Colors.grey} style={styles.systemIcon} />
        <View style={styles.textContainer}>
          <Text style={styles.systemTitle}>{title}</Text>
          <Text style={styles.systemDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={Boolean(preferences[key])}
        onValueChange={(v) => updatePreference(key, v)}
        disabled={isHydrating || isSaving}
        trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
        thumbColor={preferences[key] ? Colors.white : Colors.grey}
        style={styles.switch}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <MyStatusBar />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerActions}>
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <MaterialCommunityIcons name="cog-outline" size={24} color={Colors.grey} />
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <MaterialCommunityIcons
                name={getActiveNotificationCount > 0 ? "shield-check" : "shield-off"}
                size={24}
                color={getActiveNotificationCount > 0 ? Colors.green : Colors.red}
              />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Guard Notifications</Text>
              <Text
                style={[
                  styles.statusSubtitle,
                  { color: getActiveNotificationCount > 0 ? Colors.green : Colors.red },
                ]}
              >
                {getActiveNotificationCount > 0
                  ? `${getActiveNotificationCount} categories active`
                  : "All categories disabled"}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {getActiveNotificationCount > 0 ? "ACTIVE" : "DISABLED"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.enableAllButton]}
              onPress={enableAllNotifications}
              disabled={isHydrating || isSaving}
            >
              <MaterialCommunityIcons name="bell-check" size={18} color={Colors.white} />
              <Text style={styles.enableAllButtonText}>Enable All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.disableAllButton]}
              onPress={disableAllNotifications}
              disabled={isHydrating || isSaving}
            >
              <MaterialCommunityIcons name="bell-off" size={18} color={Colors.white} />
              <Text style={styles.disableAllButtonText}>Disable All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, styles.testButton]}
              onPress={testNotification}
              disabled={isHydrating || isSaving}
            >
              <MaterialCommunityIcons name="bell-ring" size={18} color={Colors.white} />
              <Text style={styles.testButtonText}>Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Operations</Text>
          {renderCategoryItem(
            "emergencyAlerts",
            "Emergency Alerts",
            "Critical security incidents and emergencies",
            "alert-octagon",
            Colors.red
          )}
          {renderCategoryItem(
            "visitorAlerts",
            "Visitor Notifications",
            "Visitor entry requests and approvals",
            "account-check",
            Colors.blue
          )}
          {renderCategoryItem(
            "securityAlerts",
            "Security Alerts",
            "Breach notifications and security updates",
            "security",
            Colors.orange
          )}
          {renderCategoryItem(
            "shiftUpdates",
            "Shift Updates",
            "Schedule changes and duty assignments",
            "calendar-clock",
            Colors.purple
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          {renderCategoryItem(
            "adminMessages",
            "Admin Messages",
            "Messages from management and supervisors",
            "message-text",
            Colors.green
          )}
          {renderCategoryItem(
            "systemNotifications",
            "System Updates",
            "App updates and system maintenance",
            "cog-sync",
            Colors.grey
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Vibration</Text>
          {renderSystemItem(
            "sound",
            "Notification Sound",
            "Play sound for notifications",
            "volume-up"
          )}
          {renderSystemItem(
            "vibration",
            "Vibration",
            "Vibrate device for notifications",
            "phone-android"
          )}
          {renderSystemItem(
            "ledNotification",
            "LED Notification",
            "Flash LED for new notifications",
            "lightbulb-outline"
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
          {renderSystemItem(
            "quietHours",
            "Quiet Hours",
            "Reduce notifications during off-hours",
            "schedule"
          )}
          {renderSystemItem(
            "badgeCount",
            "Badge Count",
            "Show notification count on app icon",
            "notifications"
          )}
          {renderSystemItem(
            "lockScreenDisplay",
            "Lock Screen Display",
            "Show notifications on lock screen",
            "lock"
          )}
        </View>

        <View style={styles.emergencyNotice}>
          <MaterialCommunityIcons name="information" size={20} color={Colors.primary} />
          <Text style={styles.emergencyNoticeText}>
            Emergency alerts should stay enabled for operational awareness.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.extraLightGrey,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    width: 24,
    justifyContent: "flex-end",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Default.fixPadding,
    paddingBottom: Default.fixPadding * 3,
  },
  statusCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 15,
    padding: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGrey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.3,
  },
  statusSubtitle: {
    ...Fonts.Medium14grey,
  },
  statusBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 20,
  },
  statusBadgeText: {
    ...Fonts.SemiBold12white,
    fontSize: 10,
    color: Colors.white,
  },
  quickActionsContainer: {
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Default.fixPadding,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Default.fixPadding,
    marginHorizontal: Default.fixPadding * 0.5,
    borderRadius: 10,
    ...Default.shadow,
    elevation: 2,
  },
  enableAllButton: {
    backgroundColor: Colors.green,
  },
  disableAllButton: {
    backgroundColor: Colors.orange,
  },
  testButton: {
    backgroundColor: Colors.primary,
  },
  enableAllButtonText: {
    ...Fonts.SemiBold12white,
    marginLeft: Default.fixPadding * 0.5,
    color: Colors.white,
  },
  disableAllButtonText: {
    ...Fonts.SemiBold12white,
    marginLeft: Default.fixPadding * 0.5,
    color: Colors.white,
  },
  testButtonText: {
    ...Fonts.SemiBold12white,
    marginLeft: Default.fixPadding * 0.5,
    color: Colors.white,
  },
  section: {
    marginBottom: Default.fixPadding * 2,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
    color: Colors.primary,
    textTransform: "uppercase",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
    padding: Default.fixPadding * 1.5,
    borderRadius: 12,
    ...Default.shadow,
    elevation: 2,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  textContainer: {
    flex: 1,
  },
  categoryTitle: {
    ...Fonts.SemiBold15black,
    marginBottom: Default.fixPadding * 0.2,
  },
  categoryDescription: {
    ...Fonts.Medium12grey,
    lineHeight: 16,
  },
  switch: {
    marginLeft: Default.fixPadding,
  },
  systemItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
    padding: Default.fixPadding * 1.5,
    borderRadius: 12,
    ...Default.shadow,
    elevation: 1,
  },
  systemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  systemIcon: {
    marginRight: Default.fixPadding,
    width: 24,
  },
  systemTitle: {
    ...Fonts.SemiBold14black,
    marginBottom: Default.fixPadding * 0.2,
  },
  systemDescription: {
    ...Fonts.Medium12grey,
    lineHeight: 16,
  },
  emergencyNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: `${Colors.lightBlue}15`,
    marginHorizontal: Default.fixPadding * 2,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  emergencyNoticeText: {
    ...Fonts.Medium12black,
    flex: 1,
    marginLeft: Default.fixPadding,
    lineHeight: 18,
    color: Colors.primary,
  },
});
