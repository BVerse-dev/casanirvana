import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';
import AwesomeButton from 'react-native-really-awesome-button';

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
          <AwesomeButton
            style={styles.actionButton}
            height={50}
            onPress={checkForUpdates}
            backgroundColor={Colors.primary}
            borderRadius={10}
            disabled={isCheckingUpdates || isDownloading}
            stretch
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="refresh" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>{isCheckingUpdates ? 'Checking...' : 'Check for Updates'}</Text>
            </View>
          </AwesomeButton>

          {updateAvailable && (
            <AwesomeButton
              style={styles.actionButton}
              height={50}
              onPress={downloadUpdate}
              backgroundColor={Colors.primary}
              borderRadius={10}
              disabled={isDownloading}
              stretch
            >
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="download" size={20} color={Colors.white} />
                <Text style={styles.buttonText}>{isDownloading ? `Downloading ${downloadProgress}%` : 'Download Update'}</Text>
              </View>
            </AwesomeButton>
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
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="download-circle" size={24} color={Colors.green} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Auto Updates</Text>
              <Text style={styles.settingDescription}>Automatically download and install updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="flask" size={24} color={Colors.orange} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Beta Updates</Text>
              <Text style={styles.settingDescription}>Get early access to new features</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="bell" size={24} color={Colors.blue} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Update Notifications</Text>
              <Text style={styles.settingDescription}>Notify me when updates are available</Text>
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
  width: '100%',
    marginBottom: Default.fixPadding,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});
