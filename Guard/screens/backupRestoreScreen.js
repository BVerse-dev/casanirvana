import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const BackupRestoreScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);

  // Modal states
  const [showAutoBackupModal, setShowAutoBackupModal] = useState(false);
  const [showBackupLocationModal, setShowBackupLocationModal] = useState(false);
  const [showDeleteBackupsModal, setShowDeleteBackupsModal] = useState(false);

  // Auto backup settings
  const [autoBackupSettings, setAutoBackupSettings] = useState({
    enabled: true,
    frequency: 'Weekly',
    timeOfDay: '14:30',
    wifiOnly: true,
    includeMedia: true,
    maxBackups: 5,
  });

  // Frequency and time options
  const [frequencyOptions] = useState([
    { id: 'daily', label: 'Daily', description: 'Backup every day' },
    { id: 'weekly', label: 'Weekly', description: 'Backup once a week' },
    { id: 'monthly', label: 'Monthly', description: 'Backup once a month' },
  ]);

  const [timeOptions] = useState([
    { id: '02:00', label: '2:00 AM', description: 'Early morning' },
    { id: '06:00', label: '6:00 AM', description: 'Morning' },
    { id: '14:30', label: '2:30 PM', description: 'Afternoon' },
    { id: '22:00', label: '10:00 PM', description: 'Evening' },
  ]);

  // Backup location options
  const [backupLocations] = useState([
    { id: 'google', name: 'Google Drive', icon: 'google-drive', color: Colors.blue, available: true },
    { id: 'icloud', name: 'iCloud', icon: 'cloud', color: Colors.grey, available: true },
    { id: 'dropbox', name: 'Dropbox', icon: 'dropbox', color: Colors.blue, available: true },
    { id: 'local', name: 'Local Device', icon: 'cellphone', color: Colors.orange, available: true },
  ]);

  const [selectedLocation, setSelectedLocation] = useState('google');

  // Delete backup settings
  const [deleteSettings, setDeleteSettings] = useState({
    autoDelete: true,
    retentionDays: 30,
    keepMinimum: 3,
  });

  const [backupInfo] = useState({
    lastBackup: '2024-07-30 14:30',
    backupSize: '2.3 MB',
    backupLocation: 'Google Drive',
    autoBackup: true,
    backupFrequency: 'Weekly',
    nextBackup: '2024-08-06 14:30',
  });

  const [dataTypes] = useState([
    { id: 'profile', name: 'Profile Information', description: 'Name, email, phone number, avatar', size: '0.1 MB', enabled: true, icon: 'account', color: Colors.blue },
    { id: 'messages', name: 'Chat Messages', description: 'All chat conversations and media', size: '1.2 MB', enabled: true, icon: 'message-text', color: Colors.green },
    { id: 'logs', name: 'Gate Logs', description: 'Visitor and entry activity logs', size: '0.7 MB', enabled: true, icon: 'clipboard-text', color: Colors.orange },
    { id: 'settings', name: 'App Settings', description: 'Preferences and configuration', size: '0.4 MB', enabled: true, icon: 'cog', color: Colors.primary },
  ]);

  const simulateBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          Alert.alert('Success', 'Backup completed successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const simulateRestore = () => {
    Alert.alert(
      'Restore Data',
      "This will replace your current data with the backup. Are you sure?",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            setIsRestoring(true);
            setRestoreProgress(0);
            const interval = setInterval(() => {
              setRestoreProgress((prev) => {
                if (prev >= 100) {
                  clearInterval(interval);
                  setIsRestoring(false);
                  Alert.alert('Success', 'Data restored successfully!');
                  return 100;
                }
                return prev + 8;
              });
            }, 400);
          },
        },
      ]
    );
  };

  const handleAutoBackupSave = () => {
    setShowAutoBackupModal(false);
    Alert.alert('Success', 'Auto backup settings have been updated successfully.');
  };

  const handleLocationSelect = (locationId) => {
    setSelectedLocation(locationId);
    setShowBackupLocationModal(false);
    const location = backupLocations.find(loc => loc.id === locationId);
    Alert.alert('Success', `Backup location changed to ${location.name}`);
  };

  const handleDeleteBackups = () => {
    Alert.alert(
      'Delete Old Backups',
      `This will delete all backups older than ${deleteSettings.retentionDays} days. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setShowDeleteBackupsModal(false);
            Alert.alert('Success', 'Old backups have been deleted successfully.');
          },
        },
      ]
    );
  };

  const handleFrequencySelect = (frequency) => {
    setAutoBackupSettings(prev => ({ ...prev, frequency: frequency.label }));
    Alert.alert('Frequency Updated', `Backup frequency changed to ${frequency.label.toLowerCase()}`);
  };

  const handleTimeSelect = (time) => {
    setAutoBackupSettings(prev => ({ ...prev, timeOfDay: time.id }));
    Alert.alert('Time Updated', `Backup time changed to ${time.label}`);
  };

  const handleRetentionSelect = () => {
    const retentionOptions = [
      { days: 7, label: '7 days' },
      { days: 14, label: '14 days' },
      { days: 30, label: '30 days' },
      { days: 60, label: '60 days' },
      { days: 90, label: '90 days' },
    ];

    Alert.alert(
      'Select Retention Period',
      'How long should we keep your backups?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...retentionOptions.map(option => ({
          text: option.label,
          onPress: () => {
            setDeleteSettings(prev => ({ ...prev, retentionDays: option.days }));
            Alert.alert('Retention Updated', `Backups will be kept for ${option.label}`);
          }
        }))
      ]
    );
  };

  const handleMinimumSelect = () => {
    const minimumOptions = [
      { count: 1, label: '1 backup' },
      { count: 3, label: '3 backups' },
      { count: 5, label: '5 backups' },
      { count: 10, label: '10 backups' },
    ];

    Alert.alert(
      'Minimum Backups to Keep',
      'How many recent backups should always be kept?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...minimumOptions.map(option => ({
          text: option.label,
          onPress: () => {
            setDeleteSettings(prev => ({ ...prev, keepMinimum: option.count }));
            Alert.alert('Minimum Updated', `Will always keep at least ${option.label}`);
          }
        }))
      ]
    );
  };

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
          {tr('backupRestore')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: Default.fixPadding }}>
        <View style={styles.headerSection}>
          <MaterialCommunityIcons name="database-outline" size={50} color={Colors.primary} />
          <Text style={styles.title}>Backup & Restore</Text>
          <Text style={styles.description}>
            Keep your data safe with automatic backups and easy restore options.
          </Text>
        </View>

        {/* Backup Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cloud-upload" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Backup Status</Text>
          </View>
          <View style={styles.backupStatusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Last Backup:</Text>
              <Text style={styles.statusValue}>{backupInfo.lastBackup}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Backup Size:</Text>
              <Text style={styles.statusValue}>{backupInfo.backupSize}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Location:</Text>
              <Text style={styles.statusValue}>{backupInfo.backupLocation}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Next Auto Backup:</Text>
              <Text style={styles.statusValue}>{backupInfo.nextBackup}</Text>
            </View>
          </View>
        </View>

        {/* Backup Progress */}
        {isBackingUp && (
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>Creating backup... {backupProgress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${backupProgress}%` }]} />
            </View>
          </View>
        )}

        {/* Restore Progress */}
        {isRestoring && (
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>Restoring data... {restoreProgress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${restoreProgress}%` }]} />
            </View>
          </View>
        )}

        {/* Data Types */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="database" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Data Types</Text>
          </View>
          {dataTypes.map((item) => (
            <View key={item.id} style={styles.dataTypeCard}>
              <View style={styles.dataTypeLeft}>
                <View style={[styles.dataTypeIcon, { backgroundColor: item.color + '15' }]}>
                  <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.dataTypeInfo}>
                  <Text style={styles.dataTypeName}>{item.name}</Text>
                  <Text style={styles.dataTypeDescription}>{item.description}</Text>
                  <Text style={styles.dataTypeSize}>{item.size}</Text>
                </View>
              </View>
              <View style={styles.dataTypeRight}>
                <MaterialCommunityIcons name={item.enabled ? 'check-circle' : 'close-circle'} size={24} color={item.enabled ? Colors.green : Colors.red} />
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { opacity: (isBackingUp || isRestoring) ? 0.6 : 1 }]}
            onPress={simulateBackup}
            disabled={isBackingUp || isRestoring}
          >
            <MaterialCommunityIcons name="backup-restore" size={20} color={Colors.white} />
            <Text style={styles.buttonText}>{isBackingUp ? 'Creating Backup...' : 'Backup Now'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondActionButton, { opacity: (isBackingUp || isRestoring) ? 0.6 : 1 }]}
            onPress={simulateRestore}
            disabled={isBackingUp || isRestoring}
          >
            <MaterialCommunityIcons name="restore" size={20} color={Colors.white} />
            <Text style={styles.buttonText}>{isRestoring ? 'Restoring...' : 'Restore from Backup'}</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Backup Settings</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setShowAutoBackupModal(true)}
          >
            <MaterialCommunityIcons name="cloud-sync" size={24} color={Colors.blue} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Auto Backup</Text>
              <Text style={styles.settingDescription}>
                {autoBackupSettings.enabled ? `${autoBackupSettings.frequency} at ${autoBackupSettings.timeOfDay}` : 'Disabled'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setShowBackupLocationModal(true)}
          >
            <MaterialCommunityIcons name="cloud" size={24} color={Colors.green} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Backup Location</Text>
              <Text style={styles.settingDescription}>
                {backupLocations.find(loc => loc.id === selectedLocation)?.name || 'Not selected'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setShowDeleteBackupsModal(true)}
          >
            <MaterialCommunityIcons name="delete" size={24} color={Colors.red} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Delete Old Backups</Text>
              <Text style={styles.settingDescription}>
                {deleteSettings.autoDelete ? `Auto-delete after ${deleteSettings.retentionDays} days` : 'Manual only'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Auto Backup Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAutoBackupModal}
        onRequestClose={() => setShowAutoBackupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="cloud-sync" size={30} color={Colors.blue} />
              <Text style={styles.modalTitle}>Auto Backup Settings</Text>
              <TouchableOpacity 
                onPress={() => setShowAutoBackupModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Configure automatic backup preferences to keep your data safe without manual intervention.
              </Text>

              <View style={styles.settingSection}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="toggle-switch" size={24} color={Colors.primary} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Enable Auto Backup</Text>
                      <Text style={styles.settingSubtitle}>Automatically backup your data</Text>
                    </View>
                  </View>
                  <Switch
                    value={autoBackupSettings.enabled}
                    onValueChange={(value) => setAutoBackupSettings(prev => ({ ...prev, enabled: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={() => {
                    Alert.alert(
                      'Select Backup Frequency',
                      'Choose how often you want to backup your data',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        ...frequencyOptions.map(freq => ({
                          text: `${freq.label} - ${freq.description}`,
                          onPress: () => handleFrequencySelect(freq)
                        }))
                      ]
                    );
                  }}
                >
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="calendar-clock" size={24} color={Colors.orange} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Backup Frequency</Text>
                      <Text style={styles.settingSubtitle}>{autoBackupSettings.frequency}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={() => {
                    Alert.alert(
                      'Select Backup Time',
                      'Choose what time of day to perform backups',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        ...timeOptions.map(time => ({
                          text: `${time.label} - ${time.description}`,
                          onPress: () => handleTimeSelect(time)
                        }))
                      ]
                    );
                  }}
                >
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.green} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Time of Day</Text>
                      <Text style={styles.settingSubtitle}>
                        {timeOptions.find(t => t.id === autoBackupSettings.timeOfDay)?.label || autoBackupSettings.timeOfDay}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="wifi" size={24} color={Colors.blue} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>WiFi Only</Text>
                      <Text style={styles.settingSubtitle}>Only backup when connected to WiFi</Text>
                    </View>
                  </View>
                  <Switch
                    value={autoBackupSettings.wifiOnly}
                    onValueChange={(value) => setAutoBackupSettings(prev => ({ ...prev, wifiOnly: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="image-multiple" size={24} color={Colors.purple} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Include Media</Text>
                      <Text style={styles.settingSubtitle}>Backup images and videos</Text>
                    </View>
                  </View>
                  <Switch
                    value={autoBackupSettings.includeMedia}
                    onValueChange={(value) => setAutoBackupSettings(prev => ({ ...prev, includeMedia: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleAutoBackupSave}
              >
                <MaterialCommunityIcons name="check" size={18} color={Colors.white} />
                <Text style={styles.modalSaveText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Backup Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBackupLocationModal}
        onRequestClose={() => setShowBackupLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="cloud" size={30} color={Colors.green} />
              <Text style={styles.modalTitle}>Backup Location</Text>
              <TouchableOpacity 
                onPress={() => setShowBackupLocationModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Choose where you want to store your backup files. Each location has different features and storage limits.
              </Text>

              <View style={styles.locationList}>
                {backupLocations.map((location) => (
                  <TouchableOpacity 
                    key={location.id}
                    style={[
                      styles.locationItem,
                      selectedLocation === location.id && styles.selectedLocationItem
                    ]}
                    onPress={() => handleLocationSelect(location.id)}
                  >
                    <View style={styles.locationLeft}>
                      <View style={[styles.locationIcon, { backgroundColor: location.color + '15' }]}>
                        <MaterialCommunityIcons name={location.icon} size={24} color={location.color} />
                      </View>
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationName}>{location.name}</Text>
                        <Text style={styles.locationStatus}>
                          {location.available ? 'Available' : 'Not available'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.locationRight}>
                      {selectedLocation === location.id && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={Colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.locationNote}>
                <MaterialCommunityIcons name="information" size={20} color={Colors.blue} />
                <Text style={styles.noteText}>
                  Your data will be encrypted before being uploaded to the selected location. You can change this at any time.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Old Backups Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDeleteBackupsModal}
        onRequestClose={() => setShowDeleteBackupsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="delete" size={30} color={Colors.red} />
              <Text style={styles.modalTitle}>Delete Old Backups</Text>
              <TouchableOpacity 
                onPress={() => setShowDeleteBackupsModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Configure automatic cleanup of old backups to free up storage space while keeping your recent data safe.
              </Text>

              <View style={styles.deleteStatsCard}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Current Backups:</Text>
                  <Text style={styles.statValue}>12 files</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Size:</Text>
                  <Text style={styles.statValue}>28.4 MB</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Oldest Backup:</Text>
                  <Text style={styles.statValue}>45 days ago</Text>
                </View>
              </View>

              <View style={styles.settingSection}>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="delete-clock" size={24} color={Colors.red} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Auto Delete</Text>
                      <Text style={styles.settingSubtitle}>Automatically remove old backups</Text>
                    </View>
                  </View>
                  <Switch
                    value={deleteSettings.autoDelete}
                    onValueChange={(value) => setDeleteSettings(prev => ({ ...prev, autoDelete: value }))}
                    trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={handleRetentionSelect}
                >
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="calendar-remove" size={24} color={Colors.orange} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Retention Period</Text>
                      <Text style={styles.settingSubtitle}>{deleteSettings.retentionDays} days</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.settingItem}
                  onPress={handleMinimumSelect}
                >
                  <View style={styles.settingLeft}>
                    <MaterialCommunityIcons name="shield-check" size={24} color={Colors.green} />
                    <View style={styles.settingTextInfo}>
                      <Text style={styles.settingTitle}>Keep Minimum</Text>
                      <Text style={styles.settingSubtitle}>Always keep at least {deleteSettings.keepMinimum} backups</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalDeleteButton}
                onPress={handleDeleteBackups}
              >
                <MaterialCommunityIcons name="delete-sweep" size={18} color={Colors.white} />
                <Text style={styles.modalDeleteText}>Delete Old Backups Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BackupRestoreScreen;

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
  backupStatusCard: {
    padding: Default.fixPadding * 1.5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 0.5,
  },
  statusLabel: {
    ...Fonts.Medium14grey,
  },
  statusValue: {
    ...Fonts.Medium14black,
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
  dataTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  dataTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding,
  },
  dataTypeInfo: {
    flex: 1,
  },
  dataTypeName: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  dataTypeDescription: {
    ...Fonts.Medium12grey,
    marginBottom: 2,
  },
  dataTypeSize: {
    ...Fonts.Medium10grey,
  },
  dataTypeRight: {
    alignItems: 'center',
  },
  actionsSection: {
    paddingHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    alignSelf: 'stretch',
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
    marginBottom: Default.fixPadding * 0.7,
    ...Default.shadow,
    elevation: 3,
  },
  secondActionButton: {
    marginBottom: 0,
  },
  buttonText: {
    ...Fonts.SemiBold16white,
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
    borderRadius: 8,
    ...Default.shadow,
    elevation: 2,
  },
  modalSaveText: {
    ...Fonts.SemiBold14white,
    marginLeft: Default.fixPadding * 0.5,
    color: Colors.white,
  },
  modalDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.red,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 8,
    ...Default.shadow,
    elevation: 2,
  },
  modalDeleteText: {
    ...Fonts.SemiBold14white,
    marginLeft: Default.fixPadding * 0.5,
    color: Colors.white,
  },
  // Settings Section Styles
  settingSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 2,
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
  },
  // Location Modal Styles
  locationList: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 2,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  selectedLocationItem: {
    backgroundColor: Colors.primary + '05',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    ...Fonts.Medium15black,
    marginBottom: 2,
  },
  locationStatus: {
    ...Fonts.Medium12grey,
  },
  locationRight: {
    alignItems: 'center',
  },
  locationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.blue + '10',
    padding: Default.fixPadding * 1.5,
    borderRadius: 8,
  },
  noteText: {
    ...Fonts.Medium12grey,
    marginLeft: Default.fixPadding * 0.5,
    flex: 1,
    lineHeight: 18,
  },
  // Delete Modal Styles
  deleteStatsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 0.8,
  },
  statLabel: {
    ...Fonts.Medium14grey,
  },
  statValue: {
    ...Fonts.Medium14black,
  },
});
