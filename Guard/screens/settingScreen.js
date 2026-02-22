import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  SectionList,
  Switch,
  Linking,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LogoutModal from "../components/logoutModal";
import { useGuardAuth } from "../contexts/GuardAuthContext";
import {
  loadGuardAppSettings,
  updateGuardAppSettings,
} from "../services/settingsPersistenceService";

const SettingScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { authUser, user, guard, community, signOut } = useGuardAuth();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);

  const authUserId = authUser?.id || user?.id || null;

  const displayName = useMemo(() => {
    const candidate =
      guard?.display_name ||
      guard?.full_name ||
      `${guard?.first_name || ""} ${guard?.last_name || ""}`.trim() ||
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      authUser?.email ||
      "Guard";
    return candidate;
  }, [authUser?.email, guard, user]);

  const communityLabel = useMemo(() => {
    const gate = guard?.gate_assignment || "Gate not assigned";
    const name = community?.name || "Community not assigned";
    return `${gate} | ${name}`;
  }, [community?.name, guard?.gate_assignment]);

  const avatarSource = useMemo(() => {
    if (typeof guard?.avatar_url === "string" && guard.avatar_url.trim()) {
      return { uri: guard.avatar_url };
    }
    return require("../assets/images/img1.png");
  }, [guard?.avatar_url]);

  const adminPhone = useMemo(
    () => community?.phone || guard?.emergency_contact_phone || user?.phone || null,
    [community?.phone, guard?.emergency_contact_phone, user?.phone]
  );

  const secretaryPhone = useMemo(
    () => guard?.emergency_contact_phone || user?.phone || community?.phone || null,
    [community?.phone, guard?.emergency_contact_phone, user?.phone]
  );

  useEffect(() => {
    let active = true;

    const hydrateSettings = async () => {
      try {
        const persisted = await loadGuardAppSettings(
          authUserId,
          i18n?.resolvedLanguage || "en"
        );
        if (!active) return;
        setDarkTheme(Boolean(persisted.darkMode));
        setBiometricEnabled(Boolean(persisted.biometricEnabled));
      } catch (error) {
        console.error("Failed to hydrate guard settings:", error);
      }
    };

    hydrateSettings();

    return () => {
      active = false;
    };
  }, [authUserId, i18n?.resolvedLanguage]);

  const persistPreferencePatch = async (patch, rollback) => {
    if (!authUserId) return;
    setSavingPreference(true);
    try {
      await updateGuardAppSettings(authUserId, patch);
    } catch (error) {
      rollback?.();
      Alert.alert("Update failed", error?.message || "Could not save settings.");
    } finally {
      setSavingPreference(false);
    }
  };

  const handleQuickCall = async (phoneNumber, contactLabel) => {
    if (!phoneNumber) {
      Alert.alert(
        "No contact configured",
        `${contactLabel} phone is not configured for this community.`
      );
      return;
    }

    const normalized = String(phoneNumber).replace(/[^\d+]/g, "");
    const url = `tel:${normalized}`;
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert("Call unavailable", "Your device cannot open the dialer right now.");
      return;
    }

    await Linking.openURL(url);
  };

  // Build settings sections (excluding community management, payment & billing, service management)
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
      ],
    },
    {
      title: tr("workInformation"),
      data: [
        {
          key: "assignment1",
          icon: Ionicons,
          iconName: "briefcase-outline",
          title: tr("assignmentDetails"),
          navigateTo: "assignmentScreen",
        },
      ],
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
      ],
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
      ],
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
      ],
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
      ],
    },
    {
      title: tr("legal"),
      data: [
        {
          key: "22",
          icon: MaterialIcons,
          iconName: "list-alt",
          title: "Terms of Service",
          navigateTo: "termsOfServiceScreen",
        },
        {
          key: "23",
          icon: MaterialCommunityIcons,
          iconName: "shield-alert-outline",
          title: tr("privacyPolicy"),
          navigateTo: "privacyPolicyScreen",
        },
        {
          key: "25",
          icon: MaterialCommunityIcons,
          iconName: "file-document-outline",
          title: "License Agreement",
          navigateTo: "licenseAgreementScreen",
        },
        {
          key: "26",
          icon: MaterialCommunityIcons,
          iconName: "code-braces",
          title: "Open Source Licenses",
          navigateTo: "openSourceLicensesScreen",
        },
      ],
    },
    {
      title: "",
      data: [
        {
          key: "27",
          icon: Feather,
          iconName: "log-out",
          title: tr("logout"),
          isDestructive: true,
        },
      ],
    },
  ];

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.key === "27") {
            setOpenLogoutModal(true);
          } else if (item.hasToggle) {
            if (item.key === "4") {
              const next = !darkTheme;
              setDarkTheme(next);
              persistPreferencePatch(
                { darkMode: next, darkTheme: next },
                () => setDarkTheme(!next)
              );
            } else if (item.key === "8") {
              const next = !biometricEnabled;
              setBiometricEnabled(next);
              persistPreferencePatch(
                { biometricEnabled: next },
                () => setBiometricEnabled(!next)
              );
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
              backgroundColor: Colors.lightGrey,
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
              marginHorizontal: Default.fixPadding,
              alignItems: isRtl ? "flex-end" : "flex-start",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...(item.isDestructive ? Fonts.SemiBold15red : Fonts.SemiBold15black),
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
                persistPreferencePatch(
                  { darkMode: value, darkTheme: value },
                  () => setDarkTheme(!value)
                );
              } else if (item.key === "8") {
                setBiometricEnabled(value);
                persistPreferencePatch(
                  { biometricEnabled: value },
                  () => setBiometricEnabled(!value)
                );
              }
            }}
            disabled={savingPreference}
            trackColor={{ false: Colors.red, true: Colors.green }}
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
          paddingHorizontal: Default.fixPadding * 2,
          marginVertical: Default.fixPadding * 1.2,
        }}
      >
        <Text
          style={{
            ...Fonts.SemiBold18black,
            textAlign: isRtl ? "right" : "left",
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
        ListHeaderComponent={() => (
          <View>
            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                ...styles.profileView,
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
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    ...Default.shadow,
                  }}
                >
                  <Image
                    source={avatarSource}
                    style={{
                      resizeMode: "cover",
                      width: 68,
                      height: 68,
                      borderRadius: 34,
                      borderWidth: 2,
                      borderColor: Colors.white,
                    }}
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                    alignItems: isRtl ? "flex-end" : "flex-start",
                    marginHorizontal: Default.fixPadding * 1.5,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold16black, overflow: "hidden" }}
                  >
                    {displayName}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{
                      ...Fonts.Medium14grey,
                      marginVertical: Default.fixPadding * 0.3,
                      overflow: "hidden",
                    }}
                  >
                    {communityLabel}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.SemiBold14green, overflow: "hidden" }}
                  >
                    {tr("onDuty")}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => navigation.push("editProfileScreen")}
                style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}
              >
                <Feather name="edit" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                ...Fonts.SemiBold16black,
                textAlign: isRtl ? "right" : "left",
                marginBottom: Default.fixPadding,
                marginHorizontal: Default.fixPadding * 2,
              }}
            >
              {tr("quickContact")}
            </Text>

            <View
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                paddingHorizontal: Default.fixPadding,
                paddingVertical: Default.fixPadding * 1.7,
                marginBottom: Default.fixPadding * 2,
                backgroundColor: Colors.lightGrey,
              }}
            >
              <TouchableOpacity
                onPress={() => handleQuickCall(adminPhone, "Admin")}
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  ...styles.callTouchableOpacityBox,
                }}
              >
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={24}
                  color={Colors.lightBlue}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold15lightBlue,
                    overflow: "hidden",
                    maxWidth: 100,
                    marginLeft: isRtl ? 0 : Default.fixPadding,
                    marginRight: isRtl ? Default.fixPadding : 0,
                  }}
                >
                  {tr("callAdmin")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleQuickCall(secretaryPhone, "Secretary")}
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  ...styles.callTouchableOpacityBox,
                }}
              >
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={24}
                  color={Colors.lightBlue}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold15lightBlue,
                    overflow: "hidden",
                    maxWidth: 115,
                    marginLeft: isRtl ? 0 : Default.fixPadding,
                    marginRight: isRtl ? Default.fixPadding : 0,
                  }}
                >
                  {tr("callSecretory")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <LogoutModal
        visible={openLogoutModal}
        modalClose={() => setOpenLogoutModal(false)}
        onLogoutHandle={async () => {
          setOpenLogoutModal(false);
          try {
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: "loginScreen" }],
            });
          } catch (error) {
            Alert.alert("Logout failed", error?.message || "Please try again.");
          }
        }}
      />
    </View>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  profileView: {
    alignItems: "center",
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding * 0.8,
    marginBottom: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  callTouchableOpacityBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.2,
    marginHorizontal: Default.fixPadding,
    borderRadius: 5,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
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
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
