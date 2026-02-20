import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { useAuth } from "../contexts/AuthContext";
import {
  DEFAULT_CHAT_SETTINGS,
  loadUserChatSettings,
  updateUserChatSettings,
} from "../services/settingsPersistenceService";

const ChatSettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [settings, setSettings] = useState(DEFAULT_CHAT_SETTINGS);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateSettings = async () => {
      try {
        const persistedSettings = await loadUserChatSettings(user?.id);
        if (isMounted) {
          setSettings(persistedSettings);
        }
      } catch (error) {
        console.error("Failed to load chat settings:", error);
      } finally {
        if (isMounted) {
          setIsSettingsLoading(false);
        }
      }
    };

    hydrateSettings();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const toggleSetting = async (key) => {
    if (isSavingSettings) {
      return;
    }

    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(nextSettings);
    setIsSavingSettings(true);

    try {
      await updateUserChatSettings(user?.id, nextSettings);
    } catch (error) {
      console.error("Failed to update chat setting:", error);
      setSettings(previousSettings);
      Alert.alert("Error", "Failed to update chat settings. Please try again.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const SettingItem = ({ title, description, value, onToggle, icon, iconColor = Colors.primary }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: iconColor + "15" }]}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={iconColor}
          />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={isSettingsLoading || isSavingSettings}
        trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );

  const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
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
          {tr("chatSettings")}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: Default.fixPadding,
        }}
      >
        <View style={styles.headerSection}>
          <MaterialCommunityIcons
            name="chat"
            size={50}
            color={Colors.primary}
          />
          <Text style={styles.title}>Chat Settings</Text>
          <Text style={styles.description}>
            Customize your messaging experience and notification preferences.
          </Text>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <SectionHeader title="Notifications" icon="bell" />
          
          <SettingItem
            title="Message Notifications"
            description="Receive notifications for new messages"
            value={settings.messageNotifications}
            onToggle={() => toggleSetting('messageNotifications')}
            icon="message-text"
          />
          
          <SettingItem
            title="Sound Notifications"
            description="Play sound for new messages"
            value={settings.soundNotifications}
            onToggle={() => toggleSetting('soundNotifications')}
            icon="volume-high"
          />
          
          <SettingItem
            title="Vibration"
            description="Vibrate for new messages"
            value={settings.vibrationNotifications}
            onToggle={() => toggleSetting('vibrationNotifications')}
            icon="vibrate"
          />
          
          <SettingItem
            title="Group Notifications"
            description="Notifications for group messages"
            value={settings.groupNotifications}
            onToggle={() => toggleSetting('groupNotifications')}
            icon="account-group"
          />
          
          <SettingItem
            title="Mention Notifications"
            description="Special notifications when mentioned"
            value={settings.mentionNotifications}
            onToggle={() => toggleSetting('mentionNotifications')}
            icon="at"
            iconColor={Colors.orange}
          />
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <SectionHeader title="Privacy" icon="shield-check" />
          
          <SettingItem
            title="Show Online Status"
            description="Let others see when you're online"
            value={settings.showOnlineStatus}
            onToggle={() => toggleSetting('showOnlineStatus')}
            icon="circle"
            iconColor={Colors.green}
          />
          
          <SettingItem
            title="Read Receipts"
            description="Show when you've read messages"
            value={settings.readReceipts}
            onToggle={() => toggleSetting('readReceipts')}
            icon="check-all"
            iconColor={Colors.blue}
          />
          
          <SettingItem
            title="Typing Indicators"
            description="Show when you're typing"
            value={settings.typingIndicators}
            onToggle={() => toggleSetting('typingIndicators')}
            icon="keyboard"
          />
          
          <SettingItem
            title="Message Preview"
            description="Show message content in notifications"
            value={settings.messagePreview}
            onToggle={() => toggleSetting('messagePreview')}
            icon="eye"
          />
        </View>

        {/* Media Section */}
        <View style={styles.section}>
          <SectionHeader title="Media & Downloads" icon="download" />
          
          <SettingItem
            title="Auto-download Images"
            description="Automatically download images"
            value={settings.autoDownloadImages}
            onToggle={() => toggleSetting('autoDownloadImages')}
            icon="image"
            iconColor={Colors.purple}
          />
          
          <SettingItem
            title="Auto-download Videos"
            description="Automatically download videos"
            value={settings.autoDownloadVideos}
            onToggle={() => toggleSetting('autoDownloadVideos')}
            icon="video"
            iconColor={Colors.red}
          />
          
          <SettingItem
            title="Auto-download Documents"
            description="Automatically download documents"
            value={settings.autoDownloadDocuments}
            onToggle={() => toggleSetting('autoDownloadDocuments')}
            icon="file-document"
            iconColor={Colors.orange}
          />
        </View>

        {/* Storage Management */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="trash-can"
              size={24}
              color={Colors.red}
            />
            <Text style={styles.actionButtonText}>Clear Chat History</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.grey}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons
              name="database"
              size={24}
              color={Colors.blue}
            />
            <Text style={styles.actionButtonText}>Manage Storage</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.grey}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChatSettingsScreen;

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  title: {
    ...Fonts.SemiBold18primary,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  description: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    ...Default.shadow,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  sectionTitle: {
    ...Fonts.SemiBold16primary,
    marginLeft: Default.fixPadding * 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  settingDescription: {
    ...Fonts.Medium12grey,
    lineHeight: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  actionButtonText: {
    ...Fonts.Medium15black,
    flex: 1,
    marginLeft: Default.fixPadding,
  },
});
