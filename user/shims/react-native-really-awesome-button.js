import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

const clamp = (value, fallback) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const AwesomeButton = ({
  children,
  onPress,
  disabled = false,
  isBusy = false,
  height = 50,
  stretch = false,
  borderRadius = 10,
  backgroundColor = "#c92c24",
  backgroundShadow,
  backgroundDarker,
  raiseLevel = 0,
  style,
  contentContainerStyle,
  ...rest
}) => {
  const resolvedHeight = clamp(height, 50);
  const elevation = clamp(raiseLevel, 0);
  const buttonStyle = [
    styles.button,
    {
      height: resolvedHeight,
      borderRadius,
      backgroundColor: disabled ? "#cfcfcf" : backgroundColor,
      opacity: disabled ? 0.7 : 1,
      width: stretch ? "100%" : undefined,
      shadowColor: backgroundShadow || backgroundDarker || backgroundColor,
      shadowOffset: { width: 0, height: elevation > 0 ? elevation : 0 },
      shadowOpacity: elevation > 0 ? 0.18 : 0,
      shadowRadius: elevation > 0 ? elevation * 1.5 : 0,
      elevation,
    },
    style,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || isBusy}
      onPress={onPress}
      style={({ pressed }) => [
        buttonStyle,
        pressed && !disabled && !isBusy ? styles.pressed : null,
      ]}
      {...rest}
    >
      <View style={[styles.content, contentContainerStyle]}>
        {isBusy ? <ActivityIndicator color="#ffffff" /> : children}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    overflow: "hidden",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.92,
  },
});

export default AwesomeButton;
