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
          <Text style={styles.title}>{tr("chatScreenTitle")}</Text>
          <Text style={styles.description}>
            {tr("chatScreenDescription")}
          </Text>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <SectionHeader title={tr("chatSectionNotifications")} icon="bell" />
          
          <SettingItem
            title={tr("chatMessageNotificationsTitle")}
            description={tr("chatMessageNotificationsDescription")}
            value={settings.messageNotifications}
            onToggle={() => toggleSetting('messageNotifications')}
            icon="message-text"
          />
          
          <SettingItem
            title={tr("chatSoundNotificationsTitle")}
            description={tr("chatSoundNotificationsDescription")}
            value={settings.soundNotifications}
            onToggle={() => toggleSetting('soundNotifications')}
            icon="volume-high"
          />
          
          <SettingItem
            title={tr("chatVibrationTitle")}
            description={tr("chatVibrationDescription")}
            value={settings.vibrationNotifications}
            onToggle={() => toggleSetting('vibrationNotifications')}
            icon="vibrate"
          />
          
          <SettingItem
            title={tr("chatGroupNotificationsTitle")}
            description={tr("chatGroupNotificationsDescription")}
            value={settings.groupNotifications}
            onToggle={() => toggleSetting('groupNotifications')}
            icon="account-group"
          />
          
          <SettingItem
            title={tr("chatMentionNotificationsTitle")}
            description={tr("chatMentionNotificationsDescription")}
            value={settings.mentionNotifications}
            onToggle={() => toggleSetting('mentionNotifications')}
            icon="at"
            iconColor={Colors.orange}
          />
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <SectionHeader title={tr("chatSectionPrivacy")} icon="shield-check" />
          
          <SettingItem
            title={tr("chatShowOnlineStatusTitle")}
            description={tr("chatShowOnlineStatusDescription")}
            value={settings.showOnlineStatus}
            onToggle={() => toggleSetting('showOnlineStatus')}
            icon="circle"
            iconColor={Colors.green}
          />
          
          <SettingItem
            title={tr("chatReadReceiptsTitle")}
            description={tr("chatReadReceiptsDescription")}
            value={settings.readReceipts}
            onToggle={() => toggleSetting('readReceipts')}
            icon="check-all"
            iconColor={Colors.blue}
          />
          
          <SettingItem
            title={tr("chatTypingIndicatorsTitle")}
            description={tr("chatTypingIndicatorsDescription")}
            value={settings.typingIndicators}
            onToggle={() => toggleSetting('typingIndicators')}
            icon="keyboard"
          />
          
          <SettingItem
            title={tr("chatMessagePreviewTitle")}
            description={tr("chatMessagePreviewDescription")}
            value={settings.messagePreview}
            onToggle={() => toggleSetting('messagePreview')}
            icon="eye"
          />
        </View>

        {/* Media Section */}
        <View style={styles.section}>
          <SectionHeader title={tr("chatSectionMediaDownloads")} icon="download" />
          
          <SettingItem
            title={tr("chatAutoDownloadImagesTitle")}
            description={tr("chatAutoDownloadImagesDescription")}
            value={settings.autoDownloadImages}
            onToggle={() => toggleSetting('autoDownloadImages')}
            icon="image"
            iconColor={Colors.purple}
          />
          
          <SettingItem
            title={tr("chatAutoDownloadVideosTitle")}
            description={tr("chatAutoDownloadVideosDescription")}
            value={settings.autoDownloadVideos}
            onToggle={() => toggleSetting('autoDownloadVideos')}
            icon="video"
            iconColor={Colors.red}
          />
          
          <SettingItem
            title={tr("chatAutoDownloadDocumentsTitle")}
            description={tr("chatAutoDownloadDocumentsDescription")}
            value={settings.autoDownloadDocuments}
            onToggle={() => toggleSetting('autoDownloadDocuments')}
            icon="file-document"
            iconColor={Colors.orange}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color={Colors.blue}
            />
            <Text style={styles.infoText}>
              {tr("chatRetentionInfo")}
            </Text>
          </View>
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Default.fixPadding * 1.5,
  },
  infoText: {
    ...Fonts.Medium14grey,
    flex: 1,
    marginLeft: Default.fixPadding * 0.8,
    lineHeight: 20,
  },
});
