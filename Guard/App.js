import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { Text, View, BackHandler } from "react-native";
import * as Font from 'expo-font';
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { withTranslation } from "react-i18next";
import { NavigationContainer } from "@react-navigation/native";
import { AppQueryClientProvider } from "./components/QueryClientProvider";
import SplashScreen from "./screens/splashScreen";
import LoginScreen from "./screens/auth/loginScreen";
import EmailLoginScreen from "./screens/auth/emailLoginScreen";
import RegisterScreen from "./screens/auth/registerScreen";
import VerificationScreen from "./screens/auth/verificationScreen";
import BottomTab from "./components/bottomTab";
import GuestEntryScreen from "./screens/guestEntryScreen";
import EntryConfirmationScreen from "./screens/entryConfirmationScreen";
import FlatNoScreen from "./screens/flatNoScreen";
import RingingScreen from "./screens/ringingScreen";
import AllowedScreen from "./screens/allowedScreen";
import CancelledScreen from "./screens/cancelledScreen";
import DeliveryEntryScreen from "./screens/deliveryEntryScreen";
import CabEntryScreen from "./screens/cabEntryScreen";
import ServiceEntryScreen from "./screens/serviceEntryScreen";
import ConfirmScreen from "./screens/confirmScreen";
import ChatScreen from "./screens/chatScreen";
import MessageScreen from "./screens/messageScreen";
import SearchScreen from "./screens/searchScreen";
import EditProfileScreen from "./screens/editProfileScreen";
import LanguageScreen from "./screens/languageScreen";
import GetSupportScreen from "./screens/getSupportScreen";
import TermsOfServiceScreen from "./screens/termsOfServiceScreen";
import PrivacyPolicyScreen from "./screens/privacyPolicyScreen";
import CallScreen from "./screens/callScreen";
import NotificationScreen from "./screens/notificationScreen";
import NotificationDetailScreen from "./screens/notificationDetailScreen";
import VisitorDetailScreen from "./screens/visitorDetailScreen";
import EmergencyDetailScreen from "./screens/emergencyDetailScreen";
import NotificationSettingsScreen from "./screens/notificationSettingsScreen";
import ChatSettingsScreen from "./screens/chatSettingsScreen";
import EmergencyContactsScreen from "./screens/emergencyContactsScreen";
import PinCodeScreen from "./screens/pinCodeScreen";
import BackupRestoreScreen from "./screens/backupRestoreScreen";
import AppUpdatesScreen from "./screens/appUpdatesScreen";
import DeleteAccountScreen from "./screens/deleteAccountScreen";
import UserGuideScreen from "./screens/userGuideScreen";
import AboutAppScreen from "./screens/aboutAppScreen";
import LicenseAgreementScreen from "./screens/licenseAgreementScreen";
import OpenSourceLicensesScreen from "./screens/openSourceLicensesScreen";
import QRScanner from "./screens/qrScanner";
import AssignmentScreen from "./screens/assignmentScreen";
import i18n from "./languages/index"; //don't remove this line
import { LogBox } from "react-native";

const Stack = createStackNavigator();
LogBox.ignoreAllLogs();

// Polyfill for deprecated BackHandler.removeEventListener used by some libs
if (typeof BackHandler.removeEventListener !== 'function') {
  // eslint-disable-next-line no-console
  console.warn('Polyfilling BackHandler.removeEventListener as a no-op');
  // No-op to prevent crashes; listeners should use the subscription.remove() API
  BackHandler.removeEventListener = () => {};
}

const MainNavigation = () => {
  return (
    <AppQueryClientProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            ...TransitionPresets.SlideFromRightIOS,
            headerShown: false,
          }}
        >
          <Stack.Screen name="splashScreen" component={SplashScreen} />
          <Stack.Screen name="loginScreen" component={LoginScreen} />
          <Stack.Screen name="emailLoginScreen" component={EmailLoginScreen} />
          <Stack.Screen name="registerScreen" component={RegisterScreen} />
          <Stack.Screen
            name="verificationScreen"
            component={VerificationScreen}
          />
          <Stack.Screen
            name="bottomTab"
            component={BottomTab}
            options={{
              ...TransitionPresets.DefaultTransition,
            }}
          />
          <Stack.Screen name="guestEntryScreen" component={GuestEntryScreen} />
          <Stack.Screen name="entryConfirmationScreen" component={EntryConfirmationScreen} />
          <Stack.Screen name="flatNoScreen" component={FlatNoScreen} />
          <Stack.Screen name="ringingScreen" component={RingingScreen} />
          <Stack.Screen name="allowedScreen" component={AllowedScreen} />
          <Stack.Screen name="cancelledScreen" component={CancelledScreen} />
          <Stack.Screen
            name="deliveryEntryScreen"
            component={DeliveryEntryScreen}
          />
          <Stack.Screen name="cabEntryScreen" component={CabEntryScreen} />
          <Stack.Screen
            name="serviceEntryScreen"
            component={ServiceEntryScreen}
          />
          <Stack.Screen name="confirmScreen" component={ConfirmScreen} />
          <Stack.Screen name="chatScreen" component={ChatScreen} />
          <Stack.Screen name="messageScreen" component={MessageScreen} />
          <Stack.Screen name="searchScreen" component={SearchScreen} />
          <Stack.Screen name="editProfileScreen" component={EditProfileScreen} />
          <Stack.Screen name="languageScreen" component={LanguageScreen} />
          <Stack.Screen name="getSupportScreen" component={GetSupportScreen} />
          <Stack.Screen
            name="termsOfServiceScreen"
            component={TermsOfServiceScreen}
          />
          <Stack.Screen
            name="privacyPolicyScreen"
            component={PrivacyPolicyScreen}
          />
          <Stack.Screen name="callScreen" component={CallScreen} />
    <Stack.Screen name="notificationScreen" component={NotificationScreen} />
    <Stack.Screen name="notificationDetailScreen" component={NotificationDetailScreen} />
    <Stack.Screen name="visitorDetailScreen" component={VisitorDetailScreen} />
    <Stack.Screen name="emergencyDetailScreen" component={EmergencyDetailScreen} />
    <Stack.Screen name="notificationSettingsScreen" component={NotificationSettingsScreen} />
    <Stack.Screen name="chatSettingsScreen" component={ChatSettingsScreen} />
    <Stack.Screen name="emergencyContactsScreen" component={EmergencyContactsScreen} />
    <Stack.Screen name="pinCodeScreen" component={PinCodeScreen} />
    <Stack.Screen name="backupRestoreScreen" component={BackupRestoreScreen} />
    <Stack.Screen name="appUpdatesScreen" component={AppUpdatesScreen} />
    <Stack.Screen name="deleteAccountScreen" component={DeleteAccountScreen} />
    <Stack.Screen name="userGuideScreen" component={UserGuideScreen} />
    <Stack.Screen name="aboutAppScreen" component={AboutAppScreen} />
    <Stack.Screen name="licenseAgreementScreen" component={LicenseAgreementScreen} />
    <Stack.Screen name="openSourceLicensesScreen" component={OpenSourceLicensesScreen} />
    <Stack.Screen name="qrScanner" component={QRScanner} />
    <Stack.Screen name="assignmentScreen" component={AssignmentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppQueryClientProvider>
  );
};

const ReloadAppOnLanguageChange = withTranslation("translation", {
  bindI18n: "languageChanged",
  bindStore: false,
})(MainNavigation);

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.log('Error loading fonts:', error);
        // If there's an error loading fonts, we'll proceed anyway
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <ReloadAppOnLanguageChange />;
}
