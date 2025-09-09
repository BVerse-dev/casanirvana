import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  SectionList,
  Switch,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MyStatusBar from "../components/myStatusBar";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LogoutModal from "../components/logoutModal";

const SettingScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }
  const backAction = () => {
    navigation.goBack();
    return true;
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  });

  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const settingSections = [
    {
      title: tr("appPreferences"),
      data: [
        {
          key: "1",
          icon: Ionicons,
          iconName: "person-outline",
          title: tr("editProfile"),
          navigateTo: "editProfileScreen",
        },
        {
          key: "2",
          icon: SimpleLineIcons,
          iconName: "globe",
          title: tr("language"),
          navigateTo: "languageScreen",
        },
        {
          key: "3",
          icon: Ionicons,
          iconName: "notifications-outline",
          title: tr("notificationSettings"),
          navigateTo: "notificationSettingsScreen",
        },
        {
          key: "4",
          icon: MaterialCommunityIcons,
          iconName: "theme-light-dark",
          title: tr("darkTheme"),
          hasToggle: true,
        },
      ]
    },
    {
      title: tr("communityManagement"),
      data: [
        {
          key: "5",
          icon: MaterialCommunityIcons,
          iconName: "information-outline",
          title: tr("societyInfo"),
          navigateTo: "societyInfoScreen",
        },
        {
          key: "6",
          icon: MaterialCommunityIcons,
          iconName: "account-group",
          title: tr("memberDirectory"),
          navigateTo: "memberDirectoryScreen",
        },
        {
          key: "7",
          icon: MaterialCommunityIcons,
          iconName: "home-outline",
          title: tr("unitInformation"),
          navigateTo: "unitInformationScreen",
        },
      ]
    },
    {
      title: tr("security"),
      data: [
        {
          key: "8",
          icon: MaterialCommunityIcons,
          iconName: "fingerprint",
          title: tr("biometricLock"),
          hasToggle: true,
        },
        {
          key: "9",
          icon: MaterialCommunityIcons,
          iconName: "lock-outline",
          title: tr("pinCode"),
          navigateTo: "pinCodeScreen",
        },
      ]
    },
    {
      title: tr("paymentBilling"),
      data: [
        {
          key: "10",
          icon: MaterialCommunityIcons,
          iconName: "credit-card-outline",
          title: tr("paymentMethods"),
          navigateTo: "paymentMethodScreen",
        },
        {
          key: "11",
          icon: MaterialCommunityIcons,
          iconName: "history",
          title: tr("billingHistory"),
          navigateTo: "paymentHistoryScreen",
        },
      ]
    },
    {
      title: tr("communication"),
      data: [
        {
          key: "12",
          icon: MaterialCommunityIcons,
          iconName: "phone-outline",
          title: tr("emergencyContacts"),
          navigateTo: "emergencyContactsScreen",
        },
        {
          key: "13",
          icon: MaterialCommunityIcons,
          iconName: "chat-outline",
          title: tr("chatSettings"),
          navigateTo: "chatSettingsScreen",
        },
      ]
    },
    {
      title: tr("serviceManagement"),
      data: [
        {
          key: "14",
          icon: MaterialCommunityIcons,
          iconName: "account-hard-hat",
          title: tr("serviceProviders"),
          navigateTo: "serviceProvidersScreen",
        },
        {
          key: "15",
          icon: MaterialCommunityIcons,
          iconName: "history",
          title: tr("bookingHistory"),
          navigateTo: "bookingHistoryScreen",
        },
      ]
    },
    {
      title: tr("accountManagement"),
      data: [
        {
          key: "16",
          icon: MaterialCommunityIcons,
          iconName: "database-outline",
          title: tr("backupRestore"),
          navigateTo: "backupRestoreScreen",
        },
        {
          key: "17",
          icon: MaterialCommunityIcons,
          iconName: "update",
          title: tr("appUpdates"),
          navigateTo: "appUpdatesScreen",
        },
        {
          key: "18",
          icon: MaterialCommunityIcons,
          iconName: "delete-outline",
          title: tr("deleteAccount"),
          navigateTo: "deleteAccountScreen",
          isDestructive: true,
        },
      ]
    },
    {
      title: tr("helpSupport"),
      data: [
        {
          key: "19",
          icon: SimpleLineIcons,
          iconName: "question",
          title: tr("getSupport"),
          navigateTo: "getSupportScreen",
        },
        {
          key: "20",
          icon: MaterialIcons,
          iconName: "book",
          title: tr("userGuide"),
          navigateTo: "userGuideScreen",
        },
        {
          key: "21",
          icon: MaterialCommunityIcons,
          iconName: "information-outline",
          title: tr("aboutApp"),
          navigateTo: "aboutAppScreen",
        },
      ]
    },
    {
      title: tr("legal"),
      data: [
        {
          key: "22",
          icon: MaterialIcons,
          iconName: "list-alt",
          title: tr("termsCondition"),
          navigateTo: "termsConditionScreen",
        },
        {
          key: "23",
          icon: MaterialCommunityIcons,
          iconName: "shield-alert-outline",
          title: tr("privacyPolicy"),
          navigateTo: "privacyPolicyScreen",
        },
      ]
    },
    {
      title: "",
      data: [
        {
          key: "24",
          icon: Feather,
          iconName: "log-out",
          title: tr("logout"),
          isDestructive: true,
        },
      ]
    }
  ];

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.key === "24") {
            setOpenLogoutModal(true);
          } else if (item.hasToggle) {
            // Handle toggle items
            if (item.key === "4") {
              setDarkTheme(!darkTheme);
            } else if (item.key === "8") {
              setBiometricEnabled(!biometricEnabled);
            }
          } else if (item.navigateTo) {
            navigation.push(item.navigateTo);
          }
        }}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          ...styles.mainTouchOpacity,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 35,
              height: 35,
              borderRadius: 5,
              backgroundColor: Colors.regularGrey,
            }}
          >
            <item.icon
              name={item.iconName}
              size={22}
              color={item.isDestructive ? Colors.red : Colors.primary}
            />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginHorizontal: Default.fixPadding,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...(item.isDestructive ? Fonts.Medium15red : Fonts.Medium15black),
                overflow: "hidden",
              }}
            >
              {item.title}
            </Text>
          </View>
        </View>
        
        {item.hasToggle ? (
          <Switch
            value={item.key === "4" ? darkTheme : biometricEnabled}
            onValueChange={(value) => {
              if (item.key === "4") {
                setDarkTheme(value);
              } else if (item.key === "8") {
                setBiometricEnabled(value);
              }
            }}
            trackColor={{ false: Colors.lightGrey, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        ) : (
          <Ionicons
            name={isRtl ? "chevron-back" : "chevron-forward"}
            size={20}
            color={Colors.black}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => {
    if (!title) return null;
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
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
          {tr("settings")}
        </Text>
      </View>

      <SectionList
        sections={settingSections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
        stickySectionHeadersEnabled={false}
      />

      <LogoutModal
        visible={openLogoutModal}
        modalClose={() => setOpenLogoutModal(false)}
        onLogoutHandle={() => {
          setOpenLogoutModal(false);
          navigation.push("loginScreen");
        }}
      />
    </View>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  mainTouchOpacity: {
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 0.8,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 5,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  sectionHeader: {
    paddingTop: Default.fixPadding * 1.5,
    paddingBottom: Default.fixPadding * 0.5,
    paddingHorizontal: Default.fixPadding * 2,
  },
  sectionHeaderText: {
    ...Fonts.SemiBold14primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
