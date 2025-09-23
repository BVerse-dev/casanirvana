import "react-native-gesture-handler";
import 'react-native-reanimated';
import { useFonts } from "expo-font";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { withTranslation } from "react-i18next";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppQueryClientProvider } from "./components/QueryClientProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AppLockProvider } from "./contexts/AppLockContext";
import { NotificationNavigationHandler } from "./components/NotificationNavigationHandler";
import SplashScreen from "./screens/splashScreen";
import OnboardingScreen from "./screens/auth/onboardingScreen";
import LoginScreen from "./screens/auth/loginScreen";
import EmailLoginScreen from "./screens/auth/emailLoginScreen";
import RegisterScreen from "./screens/auth/registerScreen";
import VerificationScreen from "./screens/auth/verificationScreen";
import BottomTab from "./components/bottomTab";
import NotificationScreen from "./screens/notificationScreen";
import NotificationDetailScreen from "./screens/notificationDetailScreen";
import NotificationSettingsScreen from "./screens/notificationSettingsScreen";
import CommunityMemberScreen from "./screens/communityMemberScreen";
import VisitorsScreen from "./screens/visitorsScreen";
import PreApproveVisitorsScreen from "./screens/preApproveVisitorsScreen";
import NoticeBoardScreen from "./screens/noticeBoardScreen";
import NoticeDetailScreen from "./screens/noticeDetailScreen";
import PaymentScreen from "./screens/paymentScreen";
import PaymentHistoryScreen from './screens/paymentHistoryScreen';
import BillingHistoryScreen from './screens/billingHistoryScreen';
import PaymentMethodScreen from "./screens/paymentMethodScreen";
import MyPaymentMethodsScreen from "./screens/myPaymentMethodsScreen";
import CreditCardScreen from "./screens/creditCardScreen";
import MobileMoneyScreen from "./screens/mobileMoneyScreen";
import PayPalScreen from "./screens/paypalScreen";
import SuccessScreen from "./screens/successScreen";
import BookedAmenitiesScreen from "./screens/bookedAmenitiesScreen";
import AmenityScreen from "./screens/amenityScreen";
import BookAmenityScreen from "./screens/bookAmenityScreen";
import HelpDeskScreen from "./screens/helpDeskScreen";
import UserGuideScreen from "./screens/userGuideScreen";
import GeneralInquiryScreen from "./screens/generalInquiryScreen";
import TechnicalSupportScreen from "./screens/technicalSupportScreen";
import FeedbackScreen from "./screens/feedbackScreen";
import SuggestionsScreen from "./screens/suggestionsScreen";
import AddComplaintScreen from "./screens/addComplaintScreen";
import ComplaintDetailScreen from "./screens/complaintDetailScreen";
import CallScreen from "./screens/callScreen";
import GuardCallingScreen from "./screens/guardCallingScreen";
import MessageScreen from "./screens/messageScreen";
import SearchScreen from "./screens/searchScreen";
import SettingScreen from "./screens/settingScreen";
import EditProfileScreen from "./screens/editProfileScreen";
import LanguageScreen from "./screens/languageScreen";
import TermsOfServiceScreen from "./screens/termsOfServiceScreen";
import PrivacyPolicyScreen from "./screens/privacyPolicyScreen";
import GetSupportScreen from "./screens/getSupportScreen";
import i18n from "./languages/index"; //don't remove this line
import MaintenanceRequestsScreen from "./screens/maintenanceRequestsScreen";
import MaintenanceRequestDetailScreen from "./screens/maintenanceRequestDetailScreen";
import AddMaintenanceRequestScreen from "./screens/addMaintenanceRequestScreen";
import MaintenanceDetailScreen from "./screens/maintenanceDetailScreen";
import ServiceBookingDetailScreen from "./screens/serviceBookingDetailScreen";
import AmenityBookingDetailScreen from "./screens/amenityBookingDetailScreen";
import JoinCommunityScreen from "./screens/joinCommunityScreen";
import CommunityInfoScreen from "./screens/communityInfoScreen";
import MemberDirectoryScreen from "./screens/memberDirectoryScreen";
import UnitInformationScreen from "./screens/unitInformationScreen";
import PinCodeScreen from "./screens/pinCodeScreen";
import EmergencyContactsScreen from "./screens/emergencyContactsScreen";
import ChatSettingsScreen from "./screens/chatSettingsScreen";
import ServiceProvidersScreen from "./screens/serviceProvidersScreen";
import BookingHistoryScreen from "./screens/bookingHistoryScreen";
import BackupRestoreScreen from "./screens/backupRestoreScreen";
import AppUpdatesScreen from "./screens/appUpdatesScreen";
import DeleteAccountScreen from "./screens/deleteAccountScreen";
import AboutAppScreen from "./screens/aboutAppScreen";
import LicenseAgreementScreen from "./screens/licenseAgreementScreen";
import OpenSourceLicensesScreen from "./screens/openSourceLicensesScreen";
import PinSetupScreen from "./screens/pinSetupScreen";
import LockScreen from "./screens/lockScreen";
import { LogBox } from "react-native";

const Stack = createStackNavigator();
LogBox.ignoreAllLogs();

const MainNavigation = () => {
  return (
    <NavigationContainer>
      <AppLockProvider>
        <NotificationProvider>
          <NotificationNavigationHandler>
          <Stack.Navigator
          initialRouteName="splashScreen"
          screenOptions={{
            ...TransitionPresets.SlideFromRightIOS,
            headerShown: false,
          }}
        >
        <Stack.Screen
          name="complaintsScreen"
          component={require("./screens/complaintsScreen").default}
        />
        <Stack.Screen name="splashScreen" component={SplashScreen} />
        <Stack.Screen name="onboardingScreen" component={OnboardingScreen} />
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
        <Stack.Screen
          name="notificationScreen"
          component={NotificationScreen}
        />
        <Stack.Screen
          name="notificationDetailScreen"
          component={NotificationDetailScreen}
        />
        <Stack.Screen
          name="notificationSettingsScreen"
          component={NotificationSettingsScreen}
        />
        <Stack.Screen
          name="communityMemberScreen"
          component={CommunityMemberScreen}
        />
        <Stack.Screen name="visitorsScreen" component={VisitorsScreen} />
        <Stack.Screen
          name="preApproveVisitorsScreen"
          component={PreApproveVisitorsScreen}
        />
        <Stack.Screen name="noticeBoardScreen" component={NoticeBoardScreen} />
        <Stack.Screen name="noticeDetailScreen" component={NoticeDetailScreen} />
        <Stack.Screen name="paymentScreen" component={PaymentScreen} />
        <Stack.Screen name="paymentHistoryScreen" component={PaymentHistoryScreen} />
        <Stack.Screen name="paymentReceiptScreen" component={require("./screens/paymentReceiptScreen").default} />
        <Stack.Screen name="billingHistoryScreen" component={BillingHistoryScreen} />
        <Stack.Screen
          name="paymentMethodScreen"
          component={PaymentMethodScreen}
        />
        <Stack.Screen
          name="myPaymentMethodsScreen"
          component={MyPaymentMethodsScreen}
        />
        
        {/* Airtime Purchase Flow */}
        <Stack.Screen
          name="airtimeScreen"
          component={require("./screens/airtimeScreen").default}
        />
        <Stack.Screen
          name="selectPackageScreen"
          component={require("./screens/selectPackageScreen").default}
        />
        <Stack.Screen
          name="amountScreen"
          component={require("./screens/amountScreen").default}
        />
        <Stack.Screen
          name="otherAmountScreen"
          component={require("./screens/otherAmountScreen").default}
        />
        <Stack.Screen
          name="accountDetailsScreen"
          component={require("./screens/accountDetailsScreen").default}
        />
        <Stack.Screen
          name="reviewPayScreen"
          component={require("./screens/reviewPayScreen").default}
        />
        
        {/* Data Purchase Flow */}
        <Stack.Screen
          name="dataScreen"
          component={require("./screens/dataScreen").default}
        />
        <Stack.Screen
          name="selectDataPackageScreen"
          component={require("./screens/selectDataPackageScreen").default}
        />
        <Stack.Screen
          name="dataAmountScreen"
          component={require("./screens/dataAmountScreen").default}
        />
        <Stack.Screen
          name="dataAccountDetailsScreen"
          component={require("./screens/dataAccountDetailsScreen").default}
        />
        
        {/* Money Transfer Flow */}
        <Stack.Screen
          name="transferScreen"
          component={require("./screens/transferScreen").default}
        />
        <Stack.Screen
          name="transferRecipientScreen"
          component={require("./screens/transferRecipientScreen").default}
        />
        <Stack.Screen
          name="transferAmountScreen"
          component={require("./screens/transferAmountScreen").default}
        />
        <Stack.Screen
          name="transferReviewScreen"
          component={require("./screens/transferReviewScreen").default}
        />
        <Stack.Screen name="creditCardScreen" component={CreditCardScreen} />
        <Stack.Screen name="mobileMoneyScreen" component={MobileMoneyScreen} />
        <Stack.Screen name="paypalScreen" component={PayPalScreen} />
        <Stack.Screen name="successScreen" component={SuccessScreen} />
        <Stack.Screen
          name="bookedAmenitiesScreen"
          component={BookedAmenitiesScreen}
        />
        <Stack.Screen name="amenityScreen" component={AmenityScreen} />
        <Stack.Screen name="bookAmenityScreen" component={BookAmenityScreen} />
        <Stack.Screen name="helpDeskScreen" component={HelpDeskScreen} />
        <Stack.Screen name="userGuideScreen" component={UserGuideScreen} />
        <Stack.Screen
          name="generalInquiryScreen"
          component={GeneralInquiryScreen}
        />
        <Stack.Screen
          name="technicalSupportScreen"
          component={TechnicalSupportScreen}
        />
        <Stack.Screen
          name="feedbackScreen"
          component={FeedbackScreen}
        />
        <Stack.Screen
          name="suggestionsScreen"
          component={SuggestionsScreen}
        />
        <Stack.Screen
          name="addComplaintScreen"
          component={AddComplaintScreen}
        />
        <Stack.Screen
          name="complaintDetailScreen"
          component={ComplaintDetailScreen}
        />
        <Stack.Screen name="callScreen" component={CallScreen} />
        <Stack.Screen
          name="guardCallingScreen"
          component={GuardCallingScreen}
        />
        <Stack.Screen name="messageScreen" component={MessageScreen} />
        <Stack.Screen name="searchScreen" component={SearchScreen} />
        <Stack.Screen name="settingScreen" component={SettingScreen} />
        <Stack.Screen name="editProfileScreen" component={EditProfileScreen} />
        <Stack.Screen name="languageScreen" component={LanguageScreen} />
        <Stack.Screen
          name="termsOfServiceScreen"
          component={TermsOfServiceScreen}
        />
        <Stack.Screen
          name="privacyPolicyScreen"
          component={PrivacyPolicyScreen}
        />
        <Stack.Screen name="getSupportScreen" component={GetSupportScreen} />
        <Stack.Screen
          name="MaintenanceRequestsScreen"
          component={MaintenanceRequestsScreen}
          options={{ title: 'Maintenance Requests' }}
        />
        {/* Old maintenance detail screen - replaced with maintenanceDetailScreen
        <Stack.Screen
          name="maintenanceRequestDetailScreen"
          component={MaintenanceRequestDetailScreen}
          options={{ title: 'Request Details' }}
        />
        */}
        <Stack.Screen
          name="addMaintenanceRequestScreen"
          component={AddMaintenanceRequestScreen}
          options={{ title: 'Request Maintenance' }}
        />
        <Stack.Screen
          name="maintenanceDetailScreen"
          component={MaintenanceDetailScreen}
          options={{ title: 'Maintenance Details' }}
        />
        <Stack.Screen
          name="serviceBookingDetailScreen"
          component={ServiceBookingDetailScreen}
          options={{ title: 'Service Booking Details' }}
        />
        <Stack.Screen
          name="amenityBookingDetailScreen"
          component={AmenityBookingDetailScreen}
          options={{ title: 'Amenity Booking Details' }}
        />
        <Stack.Screen
          name="joinCommunityScreen"
          component={JoinCommunityScreen}
        />
        <Stack.Screen
          name="communityInfoScreen"
          component={CommunityInfoScreen}
        />
        <Stack.Screen
          name="memberDirectoryScreen"
          component={MemberDirectoryScreen}
        />
        <Stack.Screen
          name="unitInformationScreen"
          component={UnitInformationScreen}
        />
        <Stack.Screen
          name="pinCodeScreen"
          component={PinCodeScreen}
        />
        <Stack.Screen
          name="emergencyContactsScreen"
          component={EmergencyContactsScreen}
        />
        <Stack.Screen
          name="chatSettingsScreen"
          component={ChatSettingsScreen}
        />
        <Stack.Screen
          name="serviceProvidersScreen"
          component={ServiceProvidersScreen}
        />
        <Stack.Screen
          name="bookingHistoryScreen"
          component={BookingHistoryScreen}
        />
        <Stack.Screen
          name="backupRestoreScreen"
          component={BackupRestoreScreen}
        />
        <Stack.Screen
          name="appUpdatesScreen"
          component={AppUpdatesScreen}
        />
        <Stack.Screen
          name="deleteAccountScreen"
          component={DeleteAccountScreen}
        />
        <Stack.Screen
          name="aboutAppScreen"
          component={AboutAppScreen}
        />
        <Stack.Screen
          name="licenseAgreementScreen"
          component={LicenseAgreementScreen}
        />
        <Stack.Screen
          name="openSourceLicensesScreen"
          component={OpenSourceLicensesScreen}
        />
        <Stack.Screen
          name="pinSetupScreen"
          component={PinSetupScreen}
        />
        <Stack.Screen
          name="lockScreen"
          component={LockScreen}
        />
        
        {/* Pay Bills Flow */}
        <Stack.Screen
          name="payBillsScreen"
          component={require("./screens/payBillsScreen").default}
        />
        <Stack.Screen
          name="utilitiesScreen"
          component={require("./screens/utilitiesScreen").default}
        />
        <Stack.Screen
          name="tvScreen"
          component={require("./screens/tvScreen").default}
        />
        <Stack.Screen
          name="billAccountDetailsScreen"
          component={require("./screens/billAccountDetailsScreen").default}
        />
        <Stack.Screen
          name="billAmountScreen"
          component={require("./screens/billAmountScreen").default}
        />
        
        {/* Insurance Flow */}
        <Stack.Screen
          name="insuranceScreen"
          component={require("./screens/insuranceScreen").default}
        />
        <Stack.Screen
          name="policyDetailsScreen"
          component={require("./screens/policyDetailsScreen").default}
        />
        <Stack.Screen
          name="insuranceAmountScreen"
          component={require("./screens/insuranceAmountScreen").default}
        />

        {/* Marketplace Screens */}
        <Stack.Screen
          name="marketplaceHomeScreen"
          component={require("./screens/marketplaceHomeScreen").default}
        />
        <Stack.Screen
          name="categoryListingScreen"
          component={require("./screens/categoryListingScreen").default}
        />
        <Stack.Screen
          name="productDetailScreen"
          component={require("./screens/productDetailScreen").default}
        />
        <Stack.Screen
          name="marketplaceSearchScreen"
          component={require("./screens/marketplaceSearchScreen").default}
        />
        <Stack.Screen
          name="ordersScreen"
          component={require("./screens/ordersScreen").default}
        />
        <Stack.Screen
          name="orderDetailScreen"
          component={require("./screens/orderDetailScreen").default}
        />
          </Stack.Navigator>
          </NotificationNavigationHandler>
        </NotificationProvider>
      </AppLockProvider>
    </NavigationContainer>
  );
};

const ReloadAppOnLanguageChange = withTranslation("translation", {
  bindI18n: "languageChanged",
  bindStore: false,
})(MainNavigation);

export default function App() {
  const [loaded] = useFonts({
    "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("./assets/fonts/Inter-Medium.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppQueryClientProvider>
        <AuthProvider>
          <ReloadAppOnLanguageChange />
        </AuthProvider>
      </AppQueryClientProvider>
    </SafeAreaProvider>
  );
}
