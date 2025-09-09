import React from "react";
import { Text, View, ImageBackground, Image } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";

const SplashScreen = ({ navigation }) => {
  setTimeout(() => {
    navigation.push("onboardingScreen");
  }, 2000);
  return (
    <View style={{ flex: 1 }}>
      <MyStatusBar />
      <ImageBackground
        resizeMode="stretch"
        source={require("../assets/images/splashBg.png")}
        style={{ flex: 1 }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 14.3,
          }}
        >
          <Image
            source={require("../assets/images/appIcon.png")}
            style={{ width: 54, height: 54, resizeMode: "contain" }}
          />
          <Text
            style={{
              ...Fonts.SemiBold28primary,
              marginTop: Default.fixPadding * 1.1,
              marginBottom: Default.fixPadding * 0.5,
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
                width: 30,
                borderTopWidth: 2,
                borderTopColor: Colors.primary,
              }}
            />
            <Text
              style={{
                ...Fonts.Medium18primary,
                paddingHorizontal: Default.fixPadding * 0.5,
              }}
            >
              Society
            </Text>
            <View
              style={{
                width: 30,
                borderTopWidth: 2,
                borderTopColor: Colors.primary,
              }}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;
