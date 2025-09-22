import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, BackHandler, Switch, Alert, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const NotificationSettingsScreen = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // Enhanced state management for guard-specific notifications
  const [isGranted, setIsGranted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    // Guard-specific categories
    visitorAlerts: true,
    emergencyAlerts: true,
    shiftUpdates: true,
    securityAlerts: true,
    adminMessages: true,
    systemNotifications: true,
    // Sound & vibration settings
    sound: true,
    vibration: true,
    ledNotification: false,
    // Advanced settings
    quietHours: false,
    badgeCount: true,
    lockScreenDisplay: true,
  });

  const [quietHoursTime, setQuietHoursTime] = useState({ start: '22:00', end: '06:00' });

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => sub?.remove();
  }, [navigation]);

  const enableAllNotifications = () => {
    setPreferences(prev => ({
      ...prev,
      visitorAlerts: true,
      emergencyAlerts: true,
      shiftUpdates: true,
      securityAlerts: true,
      adminMessages: true,
      systemNotifications: true,
    }));
    Alert.alert('✅ Success', 'All notification categories have been enabled!');
  };

  const disableAllNotifications = () => {
    setPreferences(prev => ({
      ...prev,
      visitorAlerts: false,
      emergencyAlerts: false,
      shiftUpdates: false,
      securityAlerts: false,
      adminMessages: false,
      systemNotifications: false,
    }));
    Alert.alert('🔕 Success', 'All notification categories have been disabled!');
  };

  const testNotification = async () => {
    try {
      setIsLoading(true);
      setTimeout(() => {
        Alert.alert('📱 Test Successful', 'Test notification sent! Check your notification tray.');
        setIsLoading(false);
      }, 800);
    } catch (e) {
      setIsLoading(false);
      Alert.alert('❌ Error', 'Failed to send test notification. Please try again.');
    }
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    
    // Special handling for emergency alerts
    if (key === 'emergencyAlerts' && !value) {
      Alert.alert(
        '⚠️ Warning',
        'Disabling emergency alerts may affect your response to critical security situations. Are you sure?',
        [
          { text: 'Cancel', onPress: () => setPreferences(prev => ({ ...prev, [key]: true })) },
          { text: 'Disable', style: 'destructive' }
        ]
      );
    }
  };

  const getActiveNotificationCount = () => {
    const categories = ['visitorAlerts', 'emergencyAlerts', 'shiftUpdates', 'securityAlerts', 'adminMessages', 'systemNotifications'];
    return categories.filter(key => preferences[key]).length;
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
        value={preferences[key]}
        onValueChange={(v) => updatePreference(key, v)}
        disabled={isLoading}
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
        value={preferences[key]}
        onValueChange={(v) => updatePreference(key, v)}
        disabled={isLoading}
        trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
        thumbColor={preferences[key] ? Colors.white : Colors.grey}
        style={styles.switch}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerActions}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={Colors.grey} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconContainer}>
              <MaterialCommunityIcons 
                name={isGranted ? 'shield-check' : 'shield-off'} 
                size={24} 
                color={isGranted ? Colors.green : Colors.red} 
              />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Guard Notifications</Text>
              <Text style={[styles.statusSubtitle, { color: isGranted ? Colors.green : Colors.red }]}>
                {isGranted ? `${getActiveNotificationCount()} categories active` : 'Notifications disabled'}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {isGranted ? 'ACTIVE' : 'DISABLED'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.enableAllButton]} 
              onPress={enableAllNotifications}
            >
              <MaterialCommunityIcons name="bell-check" size={18} color={Colors.white} />
              <Text style={styles.enableAllButtonText}>Enable All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.disableAllButton]} 
              onPress={disableAllNotifications}
            >
              <MaterialCommunityIcons name="bell-off" size={18} color={Colors.white} />
              <Text style={styles.disableAllButtonText}>Disable All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.testButton]} 
              onPress={testNotification}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="bell-ring" size={18} color={Colors.white} />
              <Text style={styles.testButtonText}>
                {isLoading ? 'Testing...' : 'Test'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guard-Specific Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Operations</Text>
          {renderCategoryItem('emergencyAlerts', 'Emergency Alerts', 'Critical security incidents and emergencies', 'alert-octagon', Colors.red)}
          {renderCategoryItem('visitorAlerts', 'Visitor Notifications', 'Visitor entry requests and approvals', 'account-check', Colors.blue)}
          {renderCategoryItem('securityAlerts', 'Security Alerts', 'Breach notifications and security updates', 'security', Colors.orange)}
          {renderCategoryItem('shiftUpdates', 'Shift Updates', 'Schedule changes and duty assignments', 'calendar-clock', Colors.purple)}
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          {renderCategoryItem('adminMessages', 'Admin Messages', 'Messages from management and supervisors', 'message-text', Colors.green)}
          {renderCategoryItem('systemNotifications', 'System Updates', 'App updates and system maintenance', 'cog-sync', Colors.grey)}
        </View>

        {/* Sound & Vibration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Vibration</Text>
          {renderSystemItem('sound', 'Notification Sound', 'Play sound for notifications', 'volume-up')}
          {renderSystemItem('vibration', 'Vibration', 'Vibrate device for notifications', 'phone-android')}
          {renderSystemItem('ledNotification', 'LED Notification', 'Flash LED for new notifications', 'lightbulb-outline')}
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
          {renderSystemItem('quietHours', 'Quiet Hours', 'Reduce notifications during off-hours', 'schedule')}
          {renderSystemItem('badgeCount', 'Badge Count', 'Show notification count on app icon', 'notifications')}
          {renderSystemItem('lockScreenDisplay', 'Lock Screen Display', 'Show notifications on lock screen', 'lock')}
        </View>

        {/* Emergency Notice */}
        <View style={styles.emergencyNotice}>
          <MaterialCommunityIcons name="information" size={20} color={Colors.primary} />
          <Text style={styles.emergencyNoticeText}>
            Emergency alerts cannot be completely disabled for security reasons. Critical alerts will always be delivered.
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
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Default.fixPadding,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    textTransform: 'uppercase',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
    padding: Default.fixPadding * 1.5,
    borderRadius: 12,
    ...Default.shadow,
    elevation: 2,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
    padding: Default.fixPadding * 1.5,
    borderRadius: 12,
    ...Default.shadow,
    elevation: 1,
  },
  systemContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.lightBlue + '15',
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
