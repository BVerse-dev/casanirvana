import React from "react";
import { Text, View, ImageBackground, Image } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Fonts, Colors, Default } from "../constants/styles";

const SplashScreen = ({ navigation }) => {
  setTimeout(() => {
    navigation.push("loginScreen");
  }, 2000);
  return (
    <View style={{ flex: 1 }}>
      <MyStatusBar />
      <ImageBackground
        resizeMode="stretch"
        style={{ flex: 1 }}
        source={require("../assets/images/splashBg.png")}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 4,
          }}
        >
          <Text
            style={{
              ...Fonts.Medium16grey,
              borderBottomWidth: 1.5,
              borderBottomColor: Colors.grey,
            }}
          >
            Guard app
          </Text>
          <Image
            source={require("../assets/images/appIcon.png")}
            style={{
              resizeMode: "contain",
              width: 54,
              height: 54,
              marginTop: Default.fixPadding * 8.7,
            }}
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
