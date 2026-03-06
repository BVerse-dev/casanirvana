import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MyStatusBar from "./myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";

const ModuleUnavailableState = ({
  title = "Coming Soon",
  message = "This module is currently unavailable for your community.",
  actionLabel = "Go Back",
  onAction,
}) => {
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
            {title}
          </Text>
          <Text
            style={{
              ...Fonts.Medium14grey,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: Default.fixPadding * 2,
            }}
          >
            {message}
          </Text>
          {typeof onAction === "function" ? (
            <TouchableOpacity
              onPress={onAction}
              style={{
                backgroundColor: Colors.primary,
                paddingVertical: Default.fixPadding,
                paddingHorizontal: Default.fixPadding * 2,
                borderRadius: 10,
              }}
            >
              <Text style={{ ...Fonts.SemiBold15white }}>{actionLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default ModuleUnavailableState;
