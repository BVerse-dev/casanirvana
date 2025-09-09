import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, BackHandler, Switch, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const NotificationSettingsScreen = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // Local push permission state (UI only for now)
  const [isGranted, setIsGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    notices: true,
    maintenance: true,
    payments: true,
    visitors: true,
    emergencies: true,
    sound: true,
    vibration: true,
  });

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => sub?.remove();
  }, [navigation]);

  const enableNotifications = async () => {
    try {
      setIsLoading(true);
      // Stub: flip state and inform user
      setIsGranted(true);
      Alert.alert('Success', 'Push notifications enabled successfully!');
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      setIsLoading(true);
      // Stub: simulate sending
      setTimeout(() => {
        Alert.alert('Success', 'Test notification sent! Check your notification tray.');
        setIsLoading(false);
      }, 600);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const renderPreferenceItem = (key, title, description) => (
    <View
      style={{
        flexDirection: isRtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Default.fixPadding * 1.5,
        paddingHorizontal: Default.fixPadding * 2,
        backgroundColor: Colors.white,
        marginBottom: Default.fixPadding,
        borderRadius: 10,
        ...Default.shadow,
      }}
    >
      <View
        style={{
          flex: 1,
          marginRight: isRtl ? 0 : Default.fixPadding,
          marginLeft: isRtl ? Default.fixPadding : 0,
        }}
      >
        <Text style={{ ...Fonts.SemiBold16black }}>{title}</Text>
        <Text style={{ ...Fonts.Medium14grey, marginTop: 4 }}>{description}</Text>
      </View>
      <Switch
        value={preferences[key]}
        onValueChange={(v) => updatePreference(key, v)}
        disabled={isLoading}
        trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
        thumbColor={preferences[key] ? Colors.white : Colors.grey}
      />
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
          backgroundColor: Colors.white,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding }}>
          Notification Settings
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: Default.fixPadding, paddingBottom: Default.fixPadding * 2 }} showsVerticalScrollIndicator={false}>
        {/* Push Notification Status */}
        <View
          style={{
            paddingHorizontal: Default.fixPadding * 2,
            paddingVertical: Default.fixPadding,
            backgroundColor: isGranted ? Colors.green : Colors.primary,
            marginBottom: Default.fixPadding * 2,
          }}
        >
          <View
            style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center' }}
          >
            <Ionicons
              name={isGranted ? 'notifications-outline' : 'notifications-off-outline'}
              size={20}
              color={Colors.white}
            />
            <Text
              style={{
                ...Fonts.Medium14white,
                marginHorizontal: Default.fixPadding,
                flex: 1,
              }}
            >
              {isGranted
                ? 'Push notifications are enabled'
                : 'Push notifications are disabled'}
            </Text>
            {!isGranted && (
              <TouchableOpacity
                onPress={enableNotifications}
                disabled={isLoading}
                style={{
                  backgroundColor: Colors.white,
                  paddingHorizontal: Default.fixPadding,
                  paddingVertical: Default.fixPadding * 0.5,
                  borderRadius: 5,
                }}
              >
                <Text style={{ ...Fonts.Medium12black, color: Colors.primary }}>
                  {isLoading ? 'Please wait' : 'Enable'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Test Notification */}
  {isGranted && (
          <View
            style={{
              paddingHorizontal: Default.fixPadding * 2,
              paddingVertical: Default.fixPadding,
              backgroundColor: Colors.white,
              marginBottom: Default.fixPadding * 2,
              borderRadius: 10,
              ...Default.shadow,
            }}
          >
            <Text style={{ ...Fonts.SemiBold16black, marginBottom: Default.fixPadding }}>
              Test Notifications
            </Text>
            <TouchableOpacity
              onPress={testNotification}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? Colors.lightGrey : Colors.primary,
                paddingVertical: Default.fixPadding,
                paddingHorizontal: Default.fixPadding * 2,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ ...Fonts.Medium14white }}>
                {isLoading ? 'Sending...' : 'Send Test Notification'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notification Categories */}
        <Text
          style={{
            ...Fonts.SemiBold16black,
            paddingHorizontal: Default.fixPadding * 2,
            marginBottom: Default.fixPadding,
          }}
        >
          Notification Categories
        </Text>

  {/* Guards don't have notice board, maintenance, or payments */}
        {renderPreferenceItem('visitors', 'Visitors', 'Visitor approval requests')}
        {renderPreferenceItem('emergencies', 'Emergencies', 'Emergency alerts and announcements')}

        {/* Sound & Vibration */}
        <Text
          style={{
            ...Fonts.SemiBold16black,
            paddingHorizontal: Default.fixPadding * 2,
            marginTop: Default.fixPadding,
            marginBottom: Default.fixPadding,
          }}
        >
          Sound & Vibration
        </Text>

        {renderPreferenceItem('sound', 'Sound', 'Play notification sounds')}
        {renderPreferenceItem('vibration', 'Vibration', 'Vibrate on notification')}
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;
