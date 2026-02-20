import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import SwipeButton from "../components/swipeButton";

const GuardCallingScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`guardCallingScreen:${key}`);
  }
  const backAction = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction); return () => subscription?.remove(); }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.lightBlue }}>
      <MyStatusBar />
      <View style={{ flex: 1 }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 3,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <Text
            style={{
              ...Fonts.SemiBold15extraLightPrimary,
              marginBottom: Default.fixPadding * 0.2,
            }}
          >
            CASA NIRVANA
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 10,
                borderTopWidth: 2,
                borderTopColor: Colors.extraLightPrimary,
              }}
            />
            <Text
              style={{
                ...Fonts.Medium12extraLightPrimary,
                paddingHorizontal: Default.fixPadding * 0.5,
              }}
            >
              Community
            </Text>
            <View
              style={{
                width: 10,
                borderTopWidth: 2,
                borderTopColor: Colors.extraLightPrimary,
              }}
            />
          </View>

          <Image
            source={require("../assets/images/visitor2.png")}
            style={{
              resizeMode: "contain",
              width: ms(148),
              height: ms(148),
              borderRadius: 74,
              marginTop: Default.fixPadding * 3,
            }}
          />
          <Text
            style={{
              ...Fonts.SemiBold20primary,
              marginTop: Default.fixPadding * 2,
            }}
          >
            Cameron Williamson
          </Text>
          <Text
            style={{
              ...Fonts.Medium16grey,
              marginVertical: Default.fixPadding * 0.5,
            }}
          >
            {tr("guestGate")}
          </Text>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          marginVertical: Default.fixPadding * 2,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <View
            style={{
              flex: 0.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.pop()}
              style={{ ...styles.bottomBtn, backgroundColor: Colors.primary }}
            >
              <MaterialCommunityIcons
                name="phone-outline"
                size={24}
                color={Colors.white}
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium16primary,
                overflow: "hidden",
                marginTop: Default.fixPadding,
              }}
            >
              {tr("callGate")}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SwipeButton
              onSwipeUpToAllowHandle={() => navigation.navigate("homeScreen")}
            />

            <Text
              numberOfLines={2}
              style={{
                ...Fonts.Medium16black,
                marginTop: Default.fixPadding,
                textAlign: "center",
                overflow: "hidden",
                maxWidth: "70%",
              }}
            >
              {tr("swipeUp")}
            </Text>
          </View>

          <View
            style={{
              flex: 0.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.pop()}
              style={{ ...styles.bottomBtn, backgroundColor: Colors.red }}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={Colors.white}
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium16primary,
                overflow: "hidden",
                marginTop: Default.fixPadding,
              }}
            >
              {tr("deny")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default GuardCallingScreen;

const styles = StyleSheet.create({
  bottomBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 45,
    height: 45,
    borderRadius: 23,
  },
});
