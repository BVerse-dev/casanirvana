import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const AppUpdatesScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Modal states
  const [showAutoUpdatesModal, setShowAutoUpdatesModal] = useState(false);
  const [showBetaUpdatesModal, setShowBetaUpdatesModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Update settings
  const [updateSettings, setUpdateSettings] = useState({
    autoUpdates: true,
    autoDownload: true,
    wifiOnly: true,
    installImmediately: false,
    updateSchedule: 'night', // night, immediate, scheduled
    scheduledTime: '02:00',
  });

  const [betaSettings, setBetaSettings] = useState({
    enabled: false,
    earlyAccess: false,
    feedbackOptIn: true,
    crashReporting: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    updateAvailable: true,
    downloadComplete: true,
    installReady: true,
    betaReleases: false,
    securityUpdates: true,
    pushNotifications: true,
    emailNotifications: false,
  });

  const [appInfo] = useState({
    currentVersion: '2.1.4',
    buildNumber: '214',
    releaseDate: 'July 28, 2024',
    updateSize: '12.5 MB',
    autoUpdates: true,
    betaUpdates: false,
  });

  const [updateHistory] = useState([
    {
      id: '1',
      version: '2.1.4',
      date: 'July 28, 2024',
      size: '12.5 MB',
      type: 'stable',
      features: [
        'Enhanced security for payment processing',
        'Improved chat performance and reliability',
        'New emergency contact management',
        'Bug fixes and performance improvements',
      ],
      bugFixes: [
        'Fixed notification delivery issues',
        'Resolved payment method selection bug',
        'Fixed profile image upload problem',
      ],
    },
    {
      id: '2',
      version: '2.1.3',
      date: 'July 15, 2024',
      size: '8.2 MB',
      type: 'stable',
      features: [
        'New service provider rating system',
        'Enhanced booking history filters',
        'Improved maintenance request tracking',
      ],
      bugFixes: [
        'Fixed crash on startup for some devices',
        'Resolved language switching issues',
      ],
    },
    {
      id: '3',
      version: '2.1.2',
      date: 'June 30, 2024',
      size: '15.1 MB',
      type: 'stable',
      features: [
        'Added dark theme support',
        'New visitor management features',
        'Enhanced security settings',
      ],
      bugFixes: [
        'Fixed memory leak in chat module',
        'Resolved notification sound issues',
      ],
    },
  ]);

  const checkForUpdates = () => {
    setIsCheckingUpdates(true);
    setTimeout(() => {
      setIsCheckingUpdates(false);
      const hasUpdate = Math.random() > 0.5;
      setUpdateAvailable(hasUpdate);
      if (hasUpdate) {
        Alert.alert(
          'Update Available',
          'A new version (2.1.5) is available with bug fixes and improvements.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Update Now', onPress: downloadUpdate },
          ]
        );
      } else {
        Alert.alert('No Updates', "You're running the latest version of the app.");
      }
    }, 2000);
  };

  const downloadUpdate = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setUpdateAvailable(false);
          Alert.alert('Update Complete', 'The app has been updated successfully!');
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const openAppStore = () => {
    Alert.alert(
      'Open App Store',
      'This will take you to the app store to check for updates.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => console.log('Opening app store...') },
      ]
    );
  };

  // Modal handlers
  const handleAutoUpdatesSave = () => {
    setShowAutoUpdatesModal(false);
    Alert.alert('Settings Saved', 'Auto update preferences have been updated successfully.');
  };

  const handleBetaSettingsSave = () => {
    setShowBetaUpdatesModal(false);
    const message = betaSettings.enabled 
      ? 'You are now enrolled in the beta program. You\'ll receive early access to new features.'
      : 'You have been removed from the beta program. You\'ll only receive stable releases.';
    Alert.alert('Beta Settings Updated', message);
  };

  const handleNotificationSave = () => {
    setShowNotificationModal(false);
    Alert.alert('Notification Settings Saved', 'Update notification preferences have been updated.');
  };

  const handleScheduleSelect = (schedule) => {
    const scheduleOptions = [
      { id: 'immediate', label: 'Install Immediately', description: 'Install as soon as download completes' },
      { id: 'night', label: 'Install at Night', description: 'Install during nighttime hours (2:00 AM)' },
      { id: 'scheduled', label: 'Custom Schedule', description: 'Choose a specific time to install' },
    ];

    Alert.alert(
      'Install Schedule',
      'When should updates be installed?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...scheduleOptions.map(option => ({
          text: `${option.label} - ${option.description}`,
          onPress: () => {
            setUpdateSettings(prev => ({ ...prev, updateSchedule: option.id }));
            Alert.alert('Schedule Updated', `Updates will ${option.label.toLowerCase()}`);
          }
        }))
      ]
    );
  };

  const VersionCard = ({ version, isLatest = false }) => (
    <View style={[styles.versionCard, isLatest && styles.latestVersionCard]}>
      <View style={styles.versionHeader}>
        <View style={styles.versionLeft}>
          <Text style={styles.versionNumber}>Version {version.version}</Text>
          <Text style={styles.versionDate}>{version.date}</Text>
        </View>
        <View style={styles.versionRight}>
          {isLatest && (
            <View style={styles.latestBadge}>
              <Text style={styles.latestBadgeText}>Current</Text>
            </View>
          )}
          <Text style={styles.versionSize}>{version.size}</Text>
        </View>
      </View>

      {version.features.length > 0 && (
        <View style={styles.changesSection}>
          <Text style={styles.changesSectionTitle}>✨ New Features</Text>
          {version.features.map((feature, index) => (
            <View key={index} style={styles.changeItem}>
              <MaterialCommunityIcons name="circle-small" size={16} color={Colors.green} />
              <Text style={styles.changeText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}

      {version.bugFixes.length > 0 && (
        <View style={styles.changesSection}>
          <Text style={styles.changesSectionTitle}>🐛 Bug Fixes</Text>
          {version.bugFixes.map((fix, index) => (
            <View key={index} style={styles.changeItem}>
              <MaterialCommunityIcons name="circle-small" size={16} color={Colors.blue} />
              <Text style={styles.changeText}>{fix}</Text>
            </View>
          ))}
        </View>
      )}
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
          <Ionicons name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'} size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding }}>
          {tr('appUpdates')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: Default.fixPadding }}>
        <View style={styles.headerSection}>
          <MaterialCommunityIcons name="update" size={50} color={Colors.primary} />
          <Text style={styles.title}>App Updates</Text>
          <Text style={styles.description}>
            Keep your app updated with the latest features and security improvements.
          </Text>
        </View>

        {/* Current Version Status */}
        <View style={styles.currentVersionSection}>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons name="information" size={24} color={Colors.primary} />
            <Text style={styles.statusTitle}>Current Version</Text>
          </View>
          <View style={styles.versionInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version:</Text>
              <Text style={styles.infoValue}>{appInfo.currentVersion}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build:</Text>
              <Text style={styles.infoValue}>{appInfo.buildNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Released:</Text>
              <Text style={styles.infoValue}>{appInfo.releaseDate}</Text>
            </View>
          </View>

          {updateAvailable && (
            <View style={styles.updateBanner}>
              <MaterialCommunityIcons name="new-box" size={24} color={Colors.orange} />
              <Text style={styles.updateBannerText}>New update available! Version 2.1.5 is ready to download.</Text>
            </View>
          )}
        </View>

        {/* Download Progress */}
        {isDownloading && (
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>Downloading update... {downloadProgress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
            </View>
          </View>
        )}

        {/* Update Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { opacity: (isCheckingUpdates || isDownloading) ? 0.6 : 1 }]}
            onPress={checkForUpdates}
            disabled={isCheckingUpdates || isDownloading}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={Colors.white} />
            <Text style={styles.buttonText}>{isCheckingUpdates ? 'Checking...' : 'Check for Updates'}</Text>
          </TouchableOpacity>

          {updateAvailable && (
            <TouchableOpacity
              style={[styles.actionButton, { opacity: isDownloading ? 0.6 : 1 }]}
              onPress={downloadUpdate}
              disabled={isDownloading}
            >
              <MaterialCommunityIcons name="download" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>{isDownloading ? `Downloading ${downloadProgress}%` : 'Download Update'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.storeButton} onPress={openAppStore}>
            <MaterialCommunityIcons name="store" size={20} color={Colors.primary} />
            <Text style={styles.storeButtonText}>View in App Store</Text>
          </TouchableOpacity>
        </View>

        {/* Update Settings */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Update Settings</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setShowAutoUpdatesModal(true)}
          >
            <MaterialCommunityIcons name="download-circle" size={24} color={Colors.green} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Auto Updates</Text>
              <Text style={styles.settingDescription}>
                {updateSettings.autoUpdates 
                  ? `Enabled - ${updateSettings.wifiOnly ? 'WiFi only' : 'Any connection'}`
                  : 'Disabled - Manual updates only'
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setShowBetaUpdatesModal(true)}
          >
            <MaterialCommunityIcons name="flask" size={24} color={Colors.orange} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Beta Updates</Text>
              <Text style={styles.settingDescription}>
                {betaSettings.enabled 
                  ? `Enrolled - ${betaSettings.earlyAccess ? 'Early access enabled' : 'Standard beta'}`
                  : 'Not enrolled - Stable releases only'
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setShowNotificationModal(true)}
          >
            <MaterialCommunityIcons name="bell" size={24} color={Colors.blue} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Update Notifications</Text>
              <Text style={styles.settingDescription}>
                {notificationSettings.enabled 
                  ? `Enabled - ${notificationSettings.pushNotifications ? 'Push & in-app' : 'In-app only'}`
                  : 'Disabled - No notifications'
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
        </View>

        {/* Release History */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="history" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Release History</Text>
          </View>
          {updateHistory.map((version, index) => (
            <VersionCard key={version.id} version={version} isLatest={index === 0} />
          ))}
        </View>
      </ScrollView>

      {/* Auto Updates Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAutoUpdatesModal}
        onRequestClose={() => setShowAutoUpdatesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="download-circle" size={30} color={Colors.green} />
              <Text style={styles.modalTitle}>Auto Update Settings</Text>
              <TouchableOpacity 
                onPress={() => setShowAutoUpdatesModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Configure how the app handles automatic updates to keep your Guard app current with the latest features and security fixes.
              </Text>

              <View style={styles.settingSection}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="download-circle" size={24} color={Colors.green} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Enable Auto Updates</Text>
                      <Text style={styles.settingSubtitle}>Automatically download and install updates</Text>
                    </View>
                  </View>
                  <Switch
                    value={updateSettings.autoUpdates}
                    onValueChange={(value) => setUpdateSettings(prev => ({ ...prev, autoUpdates: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="cloud-download" size={24} color={Colors.blue} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Auto Download</Text>
                      <Text style={styles.settingSubtitle}>Download updates automatically when available</Text>
                    </View>
                  </View>
                  <Switch
                    value={updateSettings.autoDownload}
                    onValueChange={(value) => setUpdateSettings(prev => ({ ...prev, autoDownload: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="wifi" size={24} color={Colors.purple} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>WiFi Only</Text>
                      <Text style={styles.settingSubtitle}>Only download updates when connected to WiFi</Text>
                    </View>
                  </View>
                  <Switch
                    value={updateSettings.wifiOnly}
                    onValueChange={(value) => setUpdateSettings(prev => ({ ...prev, wifiOnly: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={() => handleScheduleSelect()}
                >
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.orange} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Install Schedule</Text>
                      <Text style={styles.settingSubtitle}>
                        {updateSettings.updateSchedule === 'immediate' ? 'Install immediately' :
                         updateSettings.updateSchedule === 'night' ? 'Install at night (2:00 AM)' :
                         'Custom schedule'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="lightning-bolt" size={24} color={Colors.red} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Install Immediately</Text>
                      <Text style={styles.settingSubtitle}>Install updates as soon as they're downloaded</Text>
                    </View>
                  </View>
                  <Switch
                    value={updateSettings.installImmediately}
                    onValueChange={(value) => setUpdateSettings(prev => ({ ...prev, installImmediately: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleAutoUpdatesSave}
              >
                <MaterialCommunityIcons name="check" size={18} color={Colors.white} />
                <Text style={styles.modalSaveText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Beta Updates Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBetaUpdatesModal}
        onRequestClose={() => setShowBetaUpdatesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="flask" size={30} color={Colors.orange} />
              <Text style={styles.modalTitle}>Beta Program</Text>
              <TouchableOpacity 
                onPress={() => setShowBetaUpdatesModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Join our beta program to get early access to new features and help us improve the Guard app with your feedback.
              </Text>

              <View style={styles.betaWarningCard}>
                <MaterialCommunityIcons name="alert" size={20} color={Colors.orange} />
                <Text style={styles.warningText}>
                  Beta versions may contain bugs and are not recommended for production use. Your feedback helps us improve the app.
                </Text>
              </View>

              <View style={styles.settingSection}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="flask" size={24} color={Colors.orange} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Join Beta Program</Text>
                      <Text style={styles.settingSubtitle}>Receive beta versions with new features</Text>
                    </View>
                  </View>
                  <Switch
                    value={betaSettings.enabled}
                    onValueChange={(value) => setBetaSettings(prev => ({ ...prev, enabled: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="rocket-launch" size={24} color={Colors.red} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Early Access</Text>
                      <Text style={styles.settingSubtitle}>Get the very latest features first</Text>
                    </View>
                  </View>
                  <Switch
                    value={betaSettings.earlyAccess}
                    onValueChange={(value) => setBetaSettings(prev => ({ ...prev, earlyAccess: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!betaSettings.enabled}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="message-text" size={24} color={Colors.blue} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Feedback Opt-in</Text>
                      <Text style={styles.settingSubtitle}>Allow us to collect feedback and usage data</Text>
                    </View>
                  </View>
                  <Switch
                    value={betaSettings.feedbackOptIn}
                    onValueChange={(value) => setBetaSettings(prev => ({ ...prev, feedbackOptIn: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!betaSettings.enabled}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="bug" size={24} color={Colors.purple} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Crash Reporting</Text>
                      <Text style={styles.settingSubtitle}>Automatically send crash reports to help fix bugs</Text>
                    </View>
                  </View>
                  <Switch
                    value={betaSettings.crashReporting}
                    onValueChange={(value) => setBetaSettings(prev => ({ ...prev, crashReporting: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!betaSettings.enabled}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleBetaSettingsSave}
              >
                <MaterialCommunityIcons name="flask" size={18} color={Colors.white} />
                <Text style={styles.modalSaveText}>
                  {betaSettings.enabled ? 'Join Beta Program' : 'Save Settings'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Update Notifications Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNotificationModal}
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="bell" size={30} color={Colors.blue} />
              <Text style={styles.modalTitle}>Update Notifications</Text>
              <TouchableOpacity 
                onPress={() => setShowNotificationModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Choose how you want to be notified about app updates, new features, and security patches.
              </Text>

              <View style={styles.settingSection}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="bell" size={24} color={Colors.blue} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Enable Notifications</Text>
                      <Text style={styles.settingSubtitle}>Receive update notifications</Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationSettings.enabled}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, enabled: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="download" size={24} color={Colors.green} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Update Available</Text>
                      <Text style={styles.settingSubtitle}>When a new update is available to download</Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationSettings.updateAvailable}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, updateAvailable: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!notificationSettings.enabled}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="check-circle" size={24} color={Colors.purple} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Download Complete</Text>
                      <Text style={styles.settingSubtitle}>When update download finishes</Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationSettings.downloadComplete}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, downloadComplete: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!notificationSettings.enabled}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="rocket-launch" size={24} color={Colors.red} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Install Ready</Text>
                      <Text style={styles.settingSubtitle}>When update is ready to install</Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationSettings.installReady}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, installReady: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!notificationSettings.enabled}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="flask" size={24} color={Colors.orange} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Beta Releases</Text>
                      <Text style={styles.settingSubtitle}>Notifications for beta version updates</Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationSettings.betaReleases}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, betaReleases: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!notificationSettings.enabled}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="shield-check" size={24} color={Colors.green} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Security Updates</Text>
                      <Text style={styles.settingSubtitle}>Critical security patches (always enabled)</Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationSettings.securityUpdates}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, securityUpdates: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={true} // Always enabled for security
                  />
                </View>
              </View>

              <View style={styles.notificationTypes}>
                <Text style={styles.notificationTypesTitle}>Notification Methods</Text>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="cellphone" size={24} color={Colors.blue} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Push Notifications</Text>
                      <Text style={styles.settingSubtitle}>Receive notifications on your device</Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationSettings.pushNotifications}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, pushNotifications: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!notificationSettings.enabled}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="email" size={24} color={Colors.purple} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Email Notifications</Text>
                      <Text style={styles.settingSubtitle}>Receive update notifications via email</Text>
                    </View>
                  </View>
                  <Switch
                    value={notificationSettings.emailNotifications}
                    onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, emailNotifications: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!notificationSettings.enabled}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleNotificationSave}
              >
                <MaterialCommunityIcons name="bell-check" size={18} color={Colors.white} />
                <Text style={styles.modalSaveText}>Save Notification Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AppUpdatesScreen;

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
  currentVersionSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    padding: Default.fixPadding * 1.5,
    ...Default.shadow,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding,
  },
  statusTitle: {
    ...Fonts.SemiBold16primary,
    marginLeft: Default.fixPadding * 0.5,
  },
  versionInfo: {
    marginBottom: Default.fixPadding,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 0.5,
  },
  infoLabel: {
    ...Fonts.Medium14grey,
  },
  infoValue: {
    ...Fonts.Medium14black,
  },
  updateBanner: {
    backgroundColor: Colors.orange + '15',
    padding: Default.fixPadding,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Colors.orange,
  },
  updateBannerText: {
    ...Fonts.Medium14grey,
    color: Colors.orange,
    marginLeft: Default.fixPadding * 0.5,
    flex: 1,
  },
  progressSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    ...Default.shadow,
  },
  progressText: {
    ...Fonts.Medium14primary,
    textAlign: 'center',
    marginBottom: Default.fixPadding,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  actionsSection: {
    paddingHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    width: '100%',
    marginBottom: Default.fixPadding,
    ...Default.shadow,
    elevation: 3,
  },
  buttonText: {
    ...Fonts.SemiBold14white,
    marginLeft: Default.fixPadding * 0.5,
  },
  storeButton: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Default.fixPadding,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    ...Default.shadow,
  },
  storeButtonText: {
    ...Fonts.SemiBold14primary,
    marginLeft: Default.fixPadding * 0.5,
  },
  settingsSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    ...Default.shadow,
  },
  historySection: {
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  settingInfo: {
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  settingName: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  settingDescription: {
    ...Fonts.Medium12grey,
  },
  versionCard: {
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  latestVersionCard: {
    backgroundColor: Colors.primary + '05',
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding,
  },
  versionLeft: {
    flex: 1,
  },
  versionNumber: {
    ...Fonts.SemiBold16black,
    marginBottom: 2,
  },
  versionDate: {
    ...Fonts.Medium12grey,
  },
  versionRight: {
    alignItems: 'flex-end',
  },
  latestBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 0.5,
  },
  latestBadgeText: {
    ...Fonts.Medium14white,
  },
  versionSize: {
    ...Fonts.Medium12grey,
  },
  changesSection: {
    marginBottom: Default.fixPadding,
  },
  changesSectionTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.5,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 0.3,
  },
  changeText: {
    ...Fonts.Medium12grey,
    marginLeft: Default.fixPadding * 0.3,
    flex: 1,
    lineHeight: 18,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    width: '90%',
    maxHeight: '85%',
    ...Default.shadow,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Default.fixPadding * 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  modalTitle: {
    ...Fonts.SemiBold18primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Default.fixPadding,
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
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
  },
  modalFooter: {
    padding: Default.fixPadding * 2,
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
  },
  modalSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    ...Default.shadow,
    elevation: 2,
  },
  modalSaveText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding * 0.5,
  },
  settingSection: {
    backgroundColor: Colors.extraLightGrey + '50',
    borderRadius: 10,
    marginBottom: Default.fixPadding * 1.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingVertical: Default.fixPadding * 1.2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextInfo: {
    marginLeft: Default.fixPadding,
    flex: 1,
  },
  settingTitle: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...Fonts.Medium12grey,
    lineHeight: 18,
  },
  betaWarningCard: {
    backgroundColor: Colors.orange + '15',
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.orange,
  },
  warningText: {
    ...Fonts.Medium13grey,
    color: Colors.orange,
    marginLeft: Default.fixPadding,
    flex: 1,
    lineHeight: 20,
  },
  notificationTypes: {
    marginTop: Default.fixPadding * 1.5,
  },
  notificationTypesTitle: {
    ...Fonts.SemiBold16primary,
    marginBottom: Default.fixPadding,
    textAlign: 'center',
  },
});
