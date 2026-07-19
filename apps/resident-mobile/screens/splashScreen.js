import React, { useEffect } from "react";
import { Text, View, ImageBackground, Image } from "react-native";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";
import { supabase } from "../utils/supabase";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    let mounted = true;

    const routeFromSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          navigation.replace("onboardingScreen");
          return;
        }

        if (data?.session?.user) {
          navigation.replace("bottomTab");
        } else {
          navigation.replace("onboardingScreen");
        }
      } catch (_) {
        if (mounted) {
          navigation.replace("onboardingScreen");
        }
      }
    };

    const timeoutId = setTimeout(routeFromSession, 1200);
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigation]);

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
              Community
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
