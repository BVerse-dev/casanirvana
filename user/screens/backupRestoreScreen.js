import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ProgressBarAndroid,
  Platform,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";

const BackupRestoreScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [selectedBackupLocation, setSelectedBackupLocation] = useState("Google Drive");
  
  // Modal states
  const [showAutoBackupModal, setShowAutoBackupModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [backupInfo] = useState({
    lastBackup: "2024-07-30 14:30",
    backupSize: "2.3 MB",
    backupLocation: "Google Drive",
    autoBackup: true,
    backupFrequency: "Weekly",
    nextBackup: "2024-08-06 14:30",
  });

  const [dataTypes] = useState([
    {
      id: "profile",
      name: "Profile Information",
      description: "Name, email, phone number, avatar",
      size: "0.1 MB",
      enabled: true,
      icon: "account",
      color: Colors.blue,
    },
    {
      id: "messages",
      name: "Chat Messages",
      description: "All chat conversations and media",
      size: "1.2 MB",
      enabled: true,
      icon: "message-text",
      color: Colors.green,
    },
    {
      id: "bookings",
      name: "Service Bookings",
      description: "Booking history and preferences",
      size: "0.5 MB",
      enabled: true,
      icon: "calendar-check",
      color: Colors.orange,
    },
    {
      id: "payments",
      name: "Payment Methods",
      description: "Saved payment information (encrypted)",
      size: "0.1 MB",
      enabled: false,
      icon: "credit-card",
      color: Colors.purple,
    },
    {
      id: "settings",
      name: "App Settings",
      description: "Preferences and configuration",
      size: "0.4 MB",
      enabled: true,
      icon: "cog",
      color: Colors.primary,
    },
  ]);

  const simulateBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          Alert.alert("Success", "Backup completed successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const simulateRestore = () => {
    Alert.alert(
      "Restore Data",
      "This will replace your current data with the backup. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: () => {
            setIsRestoring(true);
            setRestoreProgress(0);
            
            const interval = setInterval(() => {
              setRestoreProgress(prev => {
                if (prev >= 100) {
                  clearInterval(interval);
                  setIsRestoring(false);
                  Alert.alert("Success", "Data restored successfully!");
                  return 100;
                }
                return prev + 8;
              });
            }, 400);
          }
        }
      ]
    );
  };

  const handleAutoBackupToggle = () => {
    setShowAutoBackupModal(true);
  };

  const handleBackupLocationSelect = () => {
    setShowLocationModal(true);
  };

  const handleDeleteOldBackups = () => {
    setShowDeleteModal(true);
  };

  const DataTypeCard = ({ item }) => (
    <View style={styles.dataTypeCard}>
      <View style={styles.dataTypeLeft}>
        <View style={[styles.dataTypeIcon, { backgroundColor: item.color + "15" }]}>
          <MaterialCommunityIcons
            name={item.icon}
            size={24}
            color={item.color}
          />
        </View>
        <View style={styles.dataTypeInfo}>
          <Text style={styles.dataTypeName}>{item.name}</Text>
          <Text style={styles.dataTypeDescription}>{item.description}</Text>
          <Text style={styles.dataTypeSize}>{item.size}</Text>
        </View>
      </View>
      <View style={styles.dataTypeRight}>
        <MaterialCommunityIcons
          name={item.enabled ? "check-circle" : "close-circle"}
          size={24}
          color={item.enabled ? Colors.green : Colors.red}
        />
      </View>
    </View>
  );

  // Auto Backup Toggle Modal
  const AutoBackupModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showAutoBackupModal}
      onRequestClose={() => setShowAutoBackupModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name="cloud-sync" size={48} color={Colors.blue} />
            <Text style={styles.modalTitle}>Auto Backup</Text>
          </View>
          
          <Text style={styles.modalMessage}>
            {autoBackupEnabled 
              ? 'Disable automatic weekly backups? Your data won\'t be backed up automatically.' 
              : 'Enable automatic weekly backups? Your data will be backed up every week.'}
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAutoBackupModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => {
                setAutoBackupEnabled(!autoBackupEnabled);
                setShowAutoBackupModal(false);
                Alert.alert("Success", `Auto backup ${!autoBackupEnabled ? 'enabled' : 'disabled'} successfully!`);
              }}
            >
              <Text style={styles.confirmButtonText}>
                {autoBackupEnabled ? 'Disable' : 'Enable'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Backup Location Selection Modal
  const BackupLocationModal = () => {
    const locations = [
      { name: "Google Drive", icon: "google-drive", color: Colors.blue },
      { name: "iCloud", icon: "cloud", color: Colors.green },
      { name: "Local Storage", icon: "cellphone", color: Colors.orange },
      { name: "Dropbox", icon: "dropbox", color: Colors.primary }
    ];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showLocationModal}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="cloud" size={48} color={Colors.green} />
              <Text style={styles.modalTitle}>Backup Location</Text>
            </View>
            
            <Text style={styles.modalMessage}>Choose where to store your backups:</Text>
            
            <View style={styles.locationOptions}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.name}
                  style={[
                    styles.locationOption,
                    selectedBackupLocation === location.name && styles.selectedLocationOption
                  ]}
                  onPress={() => {
                    setSelectedBackupLocation(location.name);
                    setShowLocationModal(false);
                    Alert.alert("Success", `Backup location set to ${location.name}!`);
                  }}
                >
                  <MaterialCommunityIcons 
                    name={location.icon} 
                    size={24} 
                    color={location.color} 
                  />
                  <Text style={styles.locationOptionText}>{location.name}</Text>
                  {selectedBackupLocation === location.name && (
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={20} 
                      color={Colors.green} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.locationModalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.locationCancelButton]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.locationCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Delete Old Backups Confirmation Modal
  const DeleteBackupsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDeleteModal}
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name="delete-alert" size={48} color={Colors.red} />
            <Text style={styles.modalTitle}>Delete Old Backups</Text>
          </View>
          
          <Text style={styles.modalMessage}>
            This will permanently delete all backups older than 30 days. This action cannot be undone.
          </Text>
          
          <View style={styles.warningBox}>
            <MaterialCommunityIcons name="alert" size={20} color={Colors.orange} />
            <Text style={styles.warningText}>This action is irreversible!</Text>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.deleteButton]}
              onPress={() => {
                setShowDeleteModal(false);
                Alert.alert("Success", "Old backups deleted successfully!");
              }}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
          {tr("backupRestore")}
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
            name="database-outline"
            size={50}
            color={Colors.primary}
          />
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
          
          {dataTypes.map((item, index) => (
            <DataTypeCard key={item.id} item={item} />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.backupButton]}
            onPress={simulateBackup}
            disabled={isBackingUp || isRestoring}
          >
            <MaterialCommunityIcons name="backup-restore" size={20} color={Colors.white} />
            <Text style={styles.buttonText}>
              {isBackingUp ? "Creating Backup..." : "Backup Now"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.restoreButton]}
            onPress={simulateRestore}
            disabled={isBackingUp || isRestoring}
          >
            <MaterialCommunityIcons name="restore" size={20} color={Colors.white} />
            <Text style={styles.buttonText}>
              {isRestoring ? "Restoring..." : "Restore from Backup"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Backup Settings</Text>
          </View>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleAutoBackupToggle}>
            <MaterialCommunityIcons name="cloud-sync" size={24} color={Colors.blue} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Auto Backup</Text>
              <Text style={styles.settingDescription}>
                {autoBackupEnabled ? 'Enabled - Weekly backups' : 'Disabled - Tap to enable'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleBackupLocationSelect}>
            <MaterialCommunityIcons name="cloud" size={24} color={Colors.green} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Backup Location</Text>
              <Text style={styles.settingDescription}>Current: {selectedBackupLocation}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleDeleteOldBackups}>
            <MaterialCommunityIcons name="delete" size={24} color={Colors.red} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Delete Old Backups</Text>
              <Text style={styles.settingDescription}>Remove backups older than 30 days</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Custom Modals */}
      <AutoBackupModal />
      <BackupLocationModal />
      <DeleteBackupsModal />
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
  backupStatusCard: {
    padding: Default.fixPadding * 1.5,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    textAlign: "center",
    marginBottom: Default.fixPadding,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  dataTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Default.fixPadding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.extraLightGrey,
  },
  dataTypeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dataTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
    alignItems: "center",
  },
  actionsSection: {
    paddingHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    gap: Default.fixPadding,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    ...Default.shadow,
    elevation: 3,
  },
  backupButton: {
    backgroundColor: Colors.primary,
  },
  restoreButton: {
    backgroundColor: Colors.orange,
  },
  buttonText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding * 0.5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 3,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingTop: Default.fixPadding * 2,
    paddingHorizontal: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 3.5,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...Default.shadow,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Default.fixPadding * 1.5,
  },
  modalTitle: {
    ...Fonts.SemiBold20black,
    marginTop: Default.fixPadding,
    textAlign: 'center',
  },
  modalMessage: {
    ...Fonts.Medium16grey,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Default.fixPadding * 1.2,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Default.fixPadding,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: Colors.lightGrey,
    borderWidth: 1,
    borderColor: Colors.grey,
  },
  cancelButtonText: {
    ...Fonts.SemiBold16black,
    color: Colors.darkGrey,
  },
  confirmButton: {
    backgroundColor: Colors.blue,
  },
  confirmButtonText: {
    ...Fonts.SemiBold16white,
  },
  deleteButton: {
    backgroundColor: Colors.primary,
  },
  deleteButtonText: {
    ...Fonts.SemiBold16white,
  },
  
  // Location Selection Styles
  locationOptions: {
    marginBottom: Default.fixPadding * 0.8,
    maxHeight: 300,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Default.fixPadding,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 0.5,
    backgroundColor: Colors.extraLightGrey,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLocationOption: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  locationOptionText: {
    ...Fonts.Medium16black,
    flex: 1,
    marginLeft: Default.fixPadding,
  },
  locationModalButtons: {
    paddingTop: Default.fixPadding * 0.8,
    paddingBottom: Default.fixPadding * 1.2,
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
    marginTop: Default.fixPadding * 0.4,
  },
  locationCancelButton: {
    backgroundColor: Colors.primary,
    width: '100%',
  },
  locationCancelButtonText: {
    ...Fonts.SemiBold16white,
    color: Colors.white,
  },
  
  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orange + '15',
    padding: Default.fixPadding,
    borderRadius: 8,
    marginBottom: Default.fixPadding * 1.5,
  },
  warningText: {
    ...Fonts.Medium14black,
    marginLeft: Default.fixPadding * 0.5,
    color: Colors.orange,
    fontWeight: '600',
  },
});
