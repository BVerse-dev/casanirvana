import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Modal, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const ChatSettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [settings, setSettings] = useState({
    messageNotifications: true,
    soundNotifications: true,
    vibrationNotifications: true,
    showOnlineStatus: true,
    readReceipts: true,
    typingIndicators: true,
    groupNotifications: true,
    mentionNotifications: true,
    messagePreview: true,
    autoDownloadImages: true,
    autoDownloadVideos: false,
    autoDownloadDocuments: false,
  });

  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showManageStorageModal, setShowManageStorageModal] = useState(false);

  // Mock storage data
  const [storageData] = useState({
    totalUsed: '2.4 GB',
    chatHistory: '1.2 GB',
    images: '800 MB',
    videos: '350 MB',
    documents: '50 MB',
    totalChats: 127,
    oldestMessage: '6 months ago',
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClearHistory = (type) => {
    let message = '';
    switch (type) {
      case 'all':
        message = 'This will permanently delete all your chat history. This action cannot be undone.';
        break;
      case 'older':
        message = 'This will delete messages older than 30 days. This action cannot be undone.';
        break;
      case 'media':
        message = 'This will delete all media files from chats but keep text messages.';
        break;
    }
    
    Alert.alert(
      'Confirm Deletion',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setShowClearHistoryModal(false);
            Alert.alert('Success', 'Chat history has been cleared successfully.');
          }
        }
      ]
    );
  };

  const handleStorageAction = (action) => {
    switch (action) {
      case 'optimize':
        Alert.alert('Storage Optimized', 'Removed duplicate files and compressed media. Freed up 150 MB.');
        break;
      case 'export':
        Alert.alert('Export Started', 'Your chat data is being prepared for export. You will be notified when ready.');
        break;
      case 'clear-cache':
        Alert.alert('Cache Cleared', 'Temporary files and cache have been cleared. Freed up 75 MB.');
        break;
    }
    setShowManageStorageModal(false);
  };

  const SettingItem = ({ title, description, value, onToggle, icon, iconColor = Colors.primary }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: iconColor + '15' }]}>
          <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description ? (
            <Text style={styles.settingDescription}>{description}</Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
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
          flexDirection: isRtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'}
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
          {tr('chatSettings')}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: Default.fixPadding,
        }}
      >
        <View style={styles.headerSection}>
          <MaterialCommunityIcons name="chat-processing" size={50} color={Colors.primary} />
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
            icon="speaker"
          />

          <SettingItem
            title="Vibration"
            description="Vibrate for new messages"
            value={settings.vibrationNotifications}
            onToggle={() => toggleSetting('vibrationNotifications')}
            icon="sine-wave"
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
            icon="account-circle"
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
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowClearHistoryModal(true)}
          >
            <MaterialCommunityIcons name="trash-can" size={24} color={Colors.red} />
            <Text style={styles.actionButtonText}>Clear Chat History</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowManageStorageModal(true)}
          >
            <MaterialCommunityIcons name="database" size={24} color={Colors.blue} />
            <Text style={styles.actionButtonText}>Manage Storage</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Clear Chat History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showClearHistoryModal}
        onRequestClose={() => setShowClearHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="trash-can" size={30} color={Colors.red} />
              <Text style={styles.modalTitle}>Clear Chat History</Text>
              <TouchableOpacity 
                onPress={() => setShowClearHistoryModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Choose what you'd like to clear from your chat history. This action cannot be undone.
              </Text>

              <View style={styles.modalStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{storageData.totalChats}</Text>
                  <Text style={styles.statLabel}>Total Chats</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{storageData.chatHistory}</Text>
                  <Text style={styles.statLabel}>History Size</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{storageData.oldestMessage}</Text>
                  <Text style={styles.statLabel}>Oldest Message</Text>
                </View>
              </View>

              <View style={styles.optionsList}>
                <TouchableOpacity 
                  style={[styles.optionItem, styles.dangerOption]}
                  onPress={() => handleClearHistory('all')}
                >
                  <View style={styles.optionLeft}>
                    <MaterialCommunityIcons name="delete-sweep" size={24} color={Colors.red} />
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>Clear All History</Text>
                      <Text style={styles.optionDescription}>Delete all messages and media</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => handleClearHistory('older')}
                >
                  <View style={styles.optionLeft}>
                    <MaterialCommunityIcons name="calendar-clock" size={24} color={Colors.orange} />
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>Clear Old Messages</Text>
                      <Text style={styles.optionDescription}>Delete messages older than 30 days</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => handleClearHistory('media')}
                >
                  <View style={styles.optionLeft}>
                    <MaterialCommunityIcons name="image-multiple" size={24} color={Colors.blue} />
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>Clear Media Only</Text>
                      <Text style={styles.optionDescription}>Keep text messages, remove media</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowClearHistoryModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manage Storage Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showManageStorageModal}
        onRequestClose={() => setShowManageStorageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="database" size={30} color={Colors.blue} />
              <Text style={styles.modalTitle}>Manage Storage</Text>
              <TouchableOpacity 
                onPress={() => setShowManageStorageModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Monitor and optimize your chat storage usage to free up space on your device.
              </Text>

              <View style={styles.storageOverview}>
                <View style={styles.storageHeader}>
                  <Text style={styles.storageTitle}>Storage Usage</Text>
                  <Text style={styles.storageTotalValue}>{storageData.totalUsed}</Text>
                </View>

                <View style={styles.storageBreakdown}>
                  <View style={styles.storageItem}>
                    <View style={styles.storageItemLeft}>
                      <View style={[styles.storageIndicator, { backgroundColor: Colors.primary }]} />
                      <Text style={styles.storageItemLabel}>Chat History</Text>
                    </View>
                    <Text style={styles.storageItemValue}>{storageData.chatHistory}</Text>
                  </View>

                  <View style={styles.storageItem}>
                    <View style={styles.storageItemLeft}>
                      <View style={[styles.storageIndicator, { backgroundColor: Colors.purple }]} />
                      <Text style={styles.storageItemLabel}>Images</Text>
                    </View>
                    <Text style={styles.storageItemValue}>{storageData.images}</Text>
                  </View>

                  <View style={styles.storageItem}>
                    <View style={styles.storageItemLeft}>
                      <View style={[styles.storageIndicator, { backgroundColor: Colors.red }]} />
                      <Text style={styles.storageItemLabel}>Videos</Text>
                    </View>
                    <Text style={styles.storageItemValue}>{storageData.videos}</Text>
                  </View>

                  <View style={styles.storageItem}>
                    <View style={styles.storageItemLeft}>
                      <View style={[styles.storageIndicator, { backgroundColor: Colors.orange }]} />
                      <Text style={styles.storageItemLabel}>Documents</Text>
                    </View>
                    <Text style={styles.storageItemValue}>{storageData.documents}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.storageActions}>
                <TouchableOpacity 
                  style={styles.storageActionButton}
                  onPress={() => handleStorageAction('optimize')}
                >
                  <MaterialCommunityIcons name="tune" size={24} color={Colors.green} />
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Optimize Storage</Text>
                    <Text style={styles.actionDescription}>Remove duplicates and compress media</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.storageActionButton}
                  onPress={() => handleStorageAction('export')}
                >
                  <MaterialCommunityIcons name="export" size={24} color={Colors.blue} />
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Export Chat Data</Text>
                    <Text style={styles.actionDescription}>Backup your conversations</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.storageActionButton}
                  onPress={() => handleStorageAction('clear-cache')}
                >
                  <MaterialCommunityIcons name="cached" size={24} color={Colors.orange} />
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Clear Cache</Text>
                    <Text style={styles.actionDescription}>Remove temporary files</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowManageStorageModal(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
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
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  sectionTitle: {
    ...Fonts.SemiBold16primary,
    marginLeft: Default.fixPadding * 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  actionButtonText: {
    ...Fonts.Medium15black,
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '50%',
    ...Default.shadow,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding * 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  modalTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  modalCloseButton: {
    padding: Default.fixPadding * 0.5,
  },
  modalContent: {
    flexGrow: 1,
    padding: Default.fixPadding * 2,
  },
  modalDescription: {
    ...Fonts.Medium14grey,
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
    textAlign: 'center',
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.extraLightGrey,
    padding: Default.fixPadding * 1.5,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...Fonts.SemiBold16primary,
    marginBottom: Default.fixPadding * 0.3,
  },
  statLabel: {
    ...Fonts.Medium12grey,
    textAlign: 'center',
  },
  optionsList: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    ...Default.shadow,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  dangerOption: {
    backgroundColor: Colors.red + '05',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionInfo: {
    marginLeft: Default.fixPadding,
    flex: 1,
  },
  optionTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  optionDescription: {
    ...Fonts.Medium12grey,
  },
  modalFooter: {
    padding: Default.fixPadding * 2,
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
  },
  modalCancelButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 8,
    alignItems: 'center',
    ...Default.shadow,
    elevation: 2,
  },
  modalCancelText: {
    ...Fonts.SemiBold14white,
    color: Colors.white,
  },
  // Storage Modal Styles
  storageOverview: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 2,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 1.5,
  },
  storageTitle: {
    ...Fonts.SemiBold16black,
  },
  storageTotalValue: {
    ...Fonts.SemiBold18primary,
  },
  storageBreakdown: {
    marginVertical: Default.fixPadding * 0.5,
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 0.8,
  },
  storageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Default.fixPadding,
  },
  storageItemLabel: {
    ...Fonts.Medium14black,
    flex: 1,
  },
  storageItemValue: {
    ...Fonts.Medium14grey,
  },
  storageActions: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    ...Default.shadow,
    elevation: 2,
  },
  storageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  actionInfo: {
    marginLeft: Default.fixPadding,
    flex: 1,
  },
  actionTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  actionDescription: {
    ...Fonts.Medium12grey,
  },
});
