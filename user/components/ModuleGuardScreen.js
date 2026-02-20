import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import MyStatusBar from "./myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { loadModuleSettings, isScreenEnabled } from "../services/moduleSettingsService";

const ModuleGuardScreen = ({ screenName, component: ScreenComponent, ...screenProps }) => {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;

    const validateModuleAccess = async () => {
      setLoading(true);
      try {
        await loadModuleSettings();
        if (mounted) {
          setEnabled(isScreenEnabled(screenName));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    validateModuleAccess();

    return () => {
      mounted = false;
    };
  }, [screenName]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.white,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding }}>
          Loading module...
        </Text>
      </View>
    );
  }

  if (!enabled) {
    const handleBack = () => {
      const navigation = screenProps?.navigation;
      if (!navigation) return;

      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      navigation.navigate("bottomTab");
    };

    return (
      <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
        <MyStatusBar />
        <View
          style={{
            flex: 1,
            paddingHorizontal: Default.fixPadding * 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              backgroundColor: Colors.white,
              borderRadius: 16,
              padding: Default.fixPadding * 2,
              alignItems: "center",
              ...Default.shadow,
            }}
          >
            <Text style={{ ...Fonts.SemiBold18black, marginBottom: Default.fixPadding * 0.8 }}>
              Coming Soon
            </Text>
            <Text
              style={{
                ...Fonts.Medium14grey,
                textAlign: "center",
                lineHeight: 22,
                marginBottom: Default.fixPadding * 2,
              }}
            >
              This module is currently disabled for your community.
            </Text>
            <TouchableOpacity
              onPress={handleBack}
              style={{
                backgroundColor: Colors.primary,
                paddingVertical: Default.fixPadding,
                paddingHorizontal: Default.fixPadding * 2,
                borderRadius: 10,
              }}
            >
              <Text style={{ ...Fonts.SemiBold15white }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return <ScreenComponent {...screenProps} />;
};

export default ModuleGuardScreen;
