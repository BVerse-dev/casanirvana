import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ProgressBarAndroid,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import AwesomeButton from "react-native-really-awesome-button";

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
          <AwesomeButton
            style={styles.actionButton}
            height={50}
            onPress={simulateBackup}
            backgroundColor={Colors.primary}
            borderRadius={10}
            disabled={isBackingUp || isRestoring}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="backup-restore" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>
                {isBackingUp ? "Creating Backup..." : "Backup Now"}
              </Text>
            </View>
          </AwesomeButton>

          <AwesomeButton
            style={styles.actionButton}
            height={50}
            onPress={simulateRestore}
            backgroundColor={Colors.orange}
            borderRadius={10}
            disabled={isBackingUp || isRestoring}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="restore" size={20} color={Colors.white} />
              <Text style={styles.buttonText}>
                {isRestoring ? "Restoring..." : "Restore from Backup"}
              </Text>
            </View>
          </AwesomeButton>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Backup Settings</Text>
          </View>
          
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="cloud-sync" size={24} color={Colors.blue} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Auto Backup</Text>
              <Text style={styles.settingDescription}>Automatically backup your data weekly</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="cloud" size={24} color={Colors.green} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Backup Location</Text>
              <Text style={styles.settingDescription}>Choose where to store your backups</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="delete" size={24} color={Colors.red} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Delete Old Backups</Text>
              <Text style={styles.settingDescription}>Remove backups older than 30 days</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  actionButton: {
    width: "100%",
    marginBottom: Default.fixPadding,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
});
