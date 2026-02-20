import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import { OtpInput } from "react-native-otp-entry";
import { loadModuleSettings, isScreenEnabled } from "../services/moduleSettingsService";

const HomeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

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
  useEffect(() => {
    const initModules = async () => {
      await loadModuleSettings();
      setModulesLoaded(true);
    };
    initModules();
  }, []);

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
  ].filter(item => isScreenEnabled(item.navigateTo));

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
            source={require("../assets/images/img1.png")}
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
          <Text style={{ ...Fonts.SemiBold16black }}>Kwame Mensah</Text>
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
              {`Gate A |  Casa Nirvana Community`}
            </Text>
          </View>
        </View>
        {(() => {
          // Temporary mock unread count for visual consistency with user app
          // Replace with real hook once guard notifications are wired
          const unreadCount = 1;
          return (
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
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: isRtl ? undefined : -2,
                    left: isRtl ? -2 : undefined,
                    backgroundColor: Colors.primary,
                    borderRadius: 6,
                    width: 12,
                    height: 12,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })()}
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

                  <OtpInput
                    numberOfDigits={6}
                    theme={{
                      containerStyle: {
                        marginTop: Default.fixPadding * 2,
                        marginBottom: Default.fixPadding * 4,
                      },
                      pinCodeContainerStyle: {
                        borderWidth: 0,
                        borderRadius: 0,
                        width: ms(40),
                        borderBottomWidth: 2,
                        borderColor: Colors.extraLightGrey,
                      },
                      pinCodeTextStyle: { ...Fonts.SemiBold18blue },
                      focusedPinCodeContainerStyle: {
                        borderWidth: 0,
                        borderRadius: 0,
                        borderBottomWidth: 2,
                        borderColor: Colors.primary,
                      },
                      focusStickStyle: { backgroundColor: Colors.primary },
                    }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => navigation.push("confirmScreen")}
                    style={{
                      marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
                      marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
                      ...styles.confirmTouchOpacity,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ ...Fonts.SemiBold18primary, overflow: "hidden" }}
                    >
                      {tr("confirm")}
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
