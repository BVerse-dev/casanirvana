import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  SectionList,
  Switch,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MyStatusBar from "../components/myStatusBar";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LogoutModal from "../components/logoutModal";
import { useAuth } from "../contexts/AuthContext";
import {
  loadUserAppSettings,
  updateUserAppSettings,
} from "../services/settingsPersistenceService";

const SettingScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();

  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }
  const backAction = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [backAction]);

  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateSettings = async () => {
      try {
        const appSettings = await loadUserAppSettings(
          user?.id,
          i18n.resolvedLanguage
        );

        if (!isMounted) {
          return;
        }

        setDarkTheme(Boolean(appSettings.darkMode));
        setBiometricEnabled(Boolean(appSettings.biometricEnabled));
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        if (isMounted) {
          setIsSettingsLoading(false);
        }
      }
    };

    hydrateSettings();

    return () => {
      isMounted = false;
    };
  }, [user?.id, i18n.resolvedLanguage]);

  const persistToggleSetting = async (settingKey, value) => {
    if (isSavingSettings) {
      return;
    }

    const previousValue = settingKey === "darkMode" ? darkTheme : biometricEnabled;
    if (settingKey === "darkMode") {
      setDarkTheme(value);
    } else {
      setBiometricEnabled(value);
    }

    setIsSavingSettings(true);
    try {
      await updateUserAppSettings(user?.id, { [settingKey]: value });
    } catch (error) {
      console.error("Failed to persist app setting:", error);
      if (settingKey === "darkMode") {
        setDarkTheme(previousValue);
      } else {
        setBiometricEnabled(previousValue);
      }
      Alert.alert("Error", "Failed to update app settings. Please try again.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const settingSections = [
    {
      title: tr("appPreferences"),
      data: [
        {
          id: "editProfile",
          icon: Ionicons,
          iconName: "person-outline",
          title: tr("editProfile"),
          type: "navigate",
          navigateTo: "editProfileScreen",
        },
        {
          id: "language",
          icon: SimpleLineIcons,
          iconName: "globe",
          title: tr("language"),
          type: "navigate",
          navigateTo: "languageScreen",
        },
        {
          id: "notificationSettings",
          icon: Ionicons,
          iconName: "notifications-outline",
          title: tr("notificationSettings"),
          type: "navigate",
          navigateTo: "notificationSettingsScreen",
        },
        {
          id: "darkTheme",
          icon: MaterialCommunityIcons,
          iconName: "theme-light-dark",
          title: tr("darkTheme"),
          type: "toggle",
          settingKey: "darkMode",
          hasToggle: true,
        },
      ]
    },
    {
      title: tr("communityManagement"),
      data: [
        {
          id: "communityInfo",
          icon: MaterialCommunityIcons,
          iconName: "information-outline",
          title: tr("communityInfo"),
          type: "navigate",
          navigateTo: "communityInfoScreen",
        },
        {
          id: "memberDirectory",
          icon: MaterialCommunityIcons,
          iconName: "account-group",
          title: tr("memberDirectory"),
          type: "navigate",
          navigateTo: "memberDirectoryScreen",
        },
        {
          id: "unitInformation",
          icon: MaterialCommunityIcons,
          iconName: "home-outline",
          title: tr("unitInformation"),
          type: "navigate",
          navigateTo: "unitInformationScreen",
        },
      ]
    },
    {
      title: tr("security"),
      data: [
        {
          id: "biometricLock",
          icon: MaterialCommunityIcons,
          iconName: "fingerprint",
          title: tr("biometricLock"),
          type: "toggle",
          settingKey: "biometricEnabled",
          hasToggle: true,
        },
        {
          id: "pinCode",
          icon: MaterialCommunityIcons,
          iconName: "lock-outline",
          title: tr("pinCode"),
          type: "navigate",
          navigateTo: "pinCodeScreen",
        },
      ]
    },
    {
      title: tr("paymentBilling"),
      data: [
        {
          id: "paymentMethods",
          icon: MaterialCommunityIcons,
          iconName: "credit-card-outline",
          title: tr("paymentMethods"),
          type: "navigate",
          navigateTo: "myPaymentMethodsScreen",
        },
        {
          id: "billingHistory",
          icon: MaterialCommunityIcons,
          iconName: "history",
          title: tr("billingHistory"),
          type: "navigate",
          navigateTo: "billingHistoryScreen",
        },
      ]
    },
    {
      title: tr("communication"),
      data: [
        {
          id: "emergencyContacts",
          icon: MaterialCommunityIcons,
          iconName: "phone-outline",
          title: tr("emergencyContacts"),
          type: "navigate",
          navigateTo: "emergencyContactsScreen",
        },
        {
          id: "chatSettings",
          icon: MaterialCommunityIcons,
          iconName: "chat-outline",
          title: tr("chatSettings"),
          type: "navigate",
          navigateTo: "chatSettingsScreen",
        },
      ]
    },
    {
      title: tr("accountManagement"),
      data: [
        {
          id: "backupRestore",
          icon: MaterialCommunityIcons,
          iconName: "database-outline",
          title: tr("backupRestore"),
          type: "navigate",
          navigateTo: "backupRestoreScreen",
        },
        {
          id: "appUpdates",
          icon: MaterialCommunityIcons,
          iconName: "update",
          title: tr("appUpdates"),
          type: "navigate",
          navigateTo: "appUpdatesScreen",
        },
        {
          id: "deleteAccount",
          icon: MaterialCommunityIcons,
          iconName: "delete-outline",
          title: tr("deleteAccount"),
          type: "navigate",
          navigateTo: "deleteAccountScreen",
          isDestructive: true,
        },
      ]
    },
    {
      title: tr("helpSupport"),
      data: [
        {
          id: "getSupport",
          icon: SimpleLineIcons,
          iconName: "question",
          title: tr("getSupport"),
          type: "navigate",
          navigateTo: "getSupportScreen",
        },
        {
          id: "userGuide",
          icon: MaterialIcons,
          iconName: "book",
          title: tr("userGuide"),
          type: "navigate",
          navigateTo: "userGuideScreen",
        },
        {
          id: "aboutApp",
          icon: MaterialCommunityIcons,
          iconName: "information-outline",
          title: tr("aboutApp"),
          type: "navigate",
          navigateTo: "aboutAppScreen",
        },
      ]
    },
    {
      title: tr("legal"),
      data: [
        {
          id: "termsCondition",
          icon: MaterialIcons,
          iconName: "list-alt",
          title: tr("termsCondition"),
          type: "navigate",
          navigateTo: "termsOfServiceScreen",
        },
        {
          id: "privacyPolicy",
          icon: MaterialCommunityIcons,
          iconName: "shield-alert-outline",
          title: tr("privacyPolicy"),
          type: "navigate",
          navigateTo: "privacyPolicyScreen",
        },
      ]
    },
    {
      title: "",
      data: [
        {
          id: "logout",
          icon: Feather,
          iconName: "log-out",
          title: tr("logout"),
          type: "logout",
          isDestructive: true,
        },
      ]
    }
  ];

  const getToggleValue = (settingKey) => {
    if (settingKey === "darkMode") {
      return darkTheme;
    }

    if (settingKey === "biometricEnabled") {
      return biometricEnabled;
    }

    return false;
  };

  const handleItemPress = (item) => {
    if (item.type === "logout") {
      setOpenLogoutModal(true);
      return;
    }

    if (item.type === "navigate" && item.navigateTo) {
      navigation.navigate(item.navigateTo);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        disabled={item.hasToggle}
        activeOpacity={item.hasToggle ? 1 : 0.7}
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
            value={getToggleValue(item.settingKey)}
            onValueChange={(value) => {
              if (item.settingKey) {
                persistToggleSetting(item.settingKey, value);
              }
            }}
            disabled={isSettingsLoading || isSavingSettings}
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
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Default.fixPadding * 0.8,
          paddingBottom: Default.fixPadding * 2,
        }}
        stickySectionHeadersEnabled={false}
      />

      <LogoutModal
        visible={openLogoutModal}
        modalClose={() => setOpenLogoutModal(false)}
        onLogoutHandle={async () => {
          setOpenLogoutModal(false);
          try {
            await signOut();
          } catch (error) {
            console.error("Failed to sign out:", error);
          } finally {
            navigation.reset({
              index: 0,
              routes: [{ name: "loginScreen" }],
            });
          }
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
