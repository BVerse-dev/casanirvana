import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import { loadModuleSettings, isScreenEnabled } from "../services/moduleSettingsService";
import { useGuardAuth } from "../contexts/GuardAuthContext";
import {
  getVisitorPassByEntryCode,
  isPassEntryActionable,
} from "../services/visitorEntryService";
import { supabase } from "../utils/supabase";

const HomeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { guard, user, community, isAuthenticated, loading: authLoading } = useGuardAuth();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`homeScreen:${key}`);
  }

  // Capitalize the first letter of each word for display-only
  const titleCase = (str) =>
    typeof str === "string"
      ? str
        .split(" ")
        .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
        .join(" ")
      : str;

  // Load module settings on mount
  const [modulesLoaded, setModulesLoaded] = useState(false);
  const [entryCode, setEntryCode] = useState("");
  const [resolvingEntry, setResolvingEntry] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const initModules = async () => {
      setModulesLoaded(false);
      await loadModuleSettings(guard?.community_id || user?.community_id || null);
      setModulesLoaded(true);
    };
    initModules();
  }, [guard?.community_id, user?.community_id]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: "loginScreen" }],
      });
    }
  }, [authLoading, isAuthenticated, navigation]);

  useEffect(() => {
    const currentUserId = user?.id;
    if (!currentUserId) {
      setUnreadCount(0);
      return undefined;
    }

    let mounted = true;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", currentUserId)
        .eq("is_read", false);

      if (!error && mounted) {
        setUnreadCount(count || 0);
      }
    };

    fetchUnreadCount();

    const channel = supabase
      .channel(`guard_home_notifications_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const guardDisplayName = useMemo(() => {
    if (guard?.full_name) return guard.full_name;
    if (guard?.display_name) return guard.display_name;
    const composedName = [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return composedName || "Guard";
  }, [guard?.display_name, guard?.full_name, user?.first_name, user?.last_name]);

  const gateLabel = useMemo(() => {
    if (!guard?.gate_assignment) return "Gate -";
    return titleCase(String(guard.gate_assignment));
  }, [guard?.gate_assignment]);

  const communityLabel = useMemo(() => {
    if (community?.name) return community.name;
    return "Community";
  }, [community?.name]);

  const handleConfirmVisitorEntry = async () => {
    const normalizedCode = entryCode.trim();

    if (!normalizedCode || normalizedCode.length < 6) {
      Alert.alert("Invalid Code", "Please enter a valid gate pass code.");
      return;
    }

    if (!isAuthenticated || !guard?.community_id) {
      Alert.alert("Authentication Required", "Guard session is not ready.");
      return;
    }

    try {
      setResolvingEntry(true);
      const pass = await getVisitorPassByEntryCode({
        entryCode: normalizedCode,
        communityId: guard.community_id,
      });

      if (!pass) {
        Alert.alert(
          "Pass Not Found",
          "No active visitor pass was found for this code in your community."
        );
        return;
      }

      if (!isPassEntryActionable(pass.status)) {
        Alert.alert(
          "Pass Not Eligible",
          `This visitor pass is currently '${pass.status}'.`
        );
        return;
      }

      navigation.push("confirmScreen", {
        entrySource: "entry_code",
        visitorPassId: pass.id,
        visitorPass: pass,
        enteredEntryCode: normalizedCode,
      });
    } catch (error) {
      console.error("Error validating gate pass code:", error);
      Alert.alert("Lookup Failed", error.message || "Unable to validate gate pass code.");
    } finally {
      setResolvingEntry(false);
    }
  };

  const visitorList = [
    {
      key: "1",
      image: require("../assets/images/visitor1.png"),
      title: tr("guestEntry"),
      navigateTo: "guestEntryScreen",
    },
    {
      key: "2",
      image: require("../assets/images/visitor2.png"),
      title: tr("cabEntry"),
      navigateTo: "cabEntryScreen",
    },
    {
      key: "3",
      image: require("../assets/images/visitor3.png"),
      title: tr("deliveryEntry"),
      navigateTo: "deliveryEntryScreen",
    },
    {
      key: "4",
      image: require("../assets/images/visitor4.png"),
      title: tr("serviceEntry"),
      navigateTo: "serviceEntryScreen",
    },
  ].filter((item) => !modulesLoaded || isScreenEnabled(item.navigateTo));

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.key === "1") {
            navigation.push(item.navigateTo, { key: "1" });
          } else {
            navigation.push(item.navigateTo);
          }
        }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 2.8,
          paddingHorizontal: Default.fixPadding * 1.5,
          marginBottom: Default.fixPadding * 2,
          marginRight: Default.fixPadding * 2,
          marginLeft: index % 2 === 0 ? Default.fixPadding * 2 : 0,
          borderRadius: 20,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <Image
          source={item.image}
          style={{ width: ms(54), height: ms(54), resizeMode: "contain" }}
        />
        <Text
          numberOfLines={1}
          style={{
            ...Fonts.SemiBold16black,
            overflow: "hidden",
            marginTop: Default.fixPadding * 1.5,
          }}
        >
          {titleCase(item.title)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.lightGrey }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: Default.fixPadding * 2,
          paddingVertical: Default.fixPadding * 1.2,
          backgroundColor: Colors.white,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            ...Default.shadow,
          }}
        >
          <Image
            source={
              guard?.avatar_url
                ? { uri: guard.avatar_url }
                : require("../assets/images/img1.png")
            }
            style={{
              resizeMode: "cover",
              width: 48,
              height: 48,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: Colors.white,
            }}
          />
        </View>
        <View
          style={{
            flex: 1,
            alignItems: isRtl ? "flex-end" : "flex-start",
            marginHorizontal: Default.fixPadding,
          }}
        >
          <Text style={{ ...Fonts.SemiBold16black }}>{guardDisplayName}</Text>
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              marginTop: Default.fixPadding * 0.3,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                paddingRight: isRtl ? 0 : Default.fixPadding * 0.5,
                paddingLeft: isRtl ? Default.fixPadding * 0.5 : 0,
              }}
            >
              {`${gateLabel} | ${communityLabel}`}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.push("notificationScreen")}
          style={{
            alignItems: isRtl ? "flex-start" : "flex-end",
            position: "relative",
          }}
        >
          <Image
            source={require("../assets/images/notification.png")}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        numColumns={2}
        data={visitorList}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <View
              style={{
                paddingTop: Default.fixPadding * 0.8,
                paddingBottom: Default.fixPadding * 1.6,
                paddingHorizontal: Default.fixPadding * 2,
                backgroundColor: Colors.white,
              }}
            >
              <View
                style={{
                  paddingVertical: Default.fixPadding * 3,
                  paddingHorizontal: Default.fixPadding * 2.5,
                  borderWidth: 1,
                  borderColor: Colors.lightSky,
                  borderRadius: 10,
                  backgroundColor: Colors.extraLightSky,
                }}
              >
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Text
                    style={{
                      ...Fonts.SemiBold18primary,
                      marginBottom: Default.fixPadding,
                    }}
                  >
                    {titleCase(tr("visitorEntry"))}
                  </Text>
                  <Text style={{ ...Fonts.Medium14grey }}>
                    {tr("enterVisitor")}
                  </Text>

                  <TextInput
                    value={entryCode}
                    onChangeText={(text) =>
                      setEntryCode(String(text || "").replace(/\s+/g, "").toUpperCase())
                    }
                    autoCapitalize="characters"
                    autoCorrect={false}
                    placeholder="Enter gate pass code"
                    placeholderTextColor={Colors.grey}
                    style={styles.entryCodeInput}
                    maxLength={12}
                  />

                  <Text style={styles.entryCodeHint}>
                    Code is usually 8 characters (letters + numbers).
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={handleConfirmVisitorEntry}
                    disabled={resolvingEntry}
                    style={{
                      marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                      marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                      ...styles.confirmTouchOpacity,
                      opacity: resolvingEntry ? 0.6 : 1,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ ...Fonts.SemiBold18primary, overflow: "hidden" }}
                    >
                      {resolvingEntry ? "Checking..." : tr("confirm")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.push("qrScanner")}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      padding: Default.fixPadding * 1.2,
                      borderRadius: 5,
                      backgroundColor: Colors.primary,
                      ...Default.shadow,
                    }}
                  >
                    <Image
                      source={require("../assets/images/qrCode.png")}
                      style={{ width: 29, height: 29, resizeMode: "contain" }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text
              numberOfLines={1}
              style={{
                ...Fonts.SemiBold18black,
                textAlign: isRtl ? "right" : "left",
                overflow: "hidden",
                marginTop: Default.fixPadding * 2,
                marginBottom: Default.fixPadding * 1.5,
                marginHorizontal: Default.fixPadding * 2,
              }}
            >
              {titleCase(tr("addNewVisitor"))}
            </Text>

          </View>
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    ...Fonts.SemiBold12grey,
    color: Colors.white,
    fontSize: 10,
    lineHeight: 12,
  },
  entryCodeInput: {
    width: "100%",
    marginTop: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 1.4,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    backgroundColor: Colors.white,
    ...Fonts.SemiBold18blue,
    textAlign: "center",
    letterSpacing: 2,
  },
  entryCodeHint: {
    ...Fonts.Medium12grey,
    marginBottom: Default.fixPadding * 3.2,
    textAlign: "center",
  },
  confirmTouchOpacity: {
    flex: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 1.4,
    borderRadius: 5,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
