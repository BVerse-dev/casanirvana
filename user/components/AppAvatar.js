import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Fonts } from "../constants/styles";

const REMOTE_URI_PATTERN = /^(https?:\/\/|file:\/\/|content:\/\/|data:image\/|blob:)/i;
const FALLBACK_COLORS = [
  "#1F6FEB",
  "#12715B",
  "#8F3DFF",
  "#E76F51",
  "#D62839",
  "#3A86FF",
];

const normalizeAvatarSource = (value) => {
  if (!value) return null;

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "object" && value?.uri) {
    return normalizeAvatarSource(value.uri);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (REMOTE_URI_PATTERN.test(trimmed)) {
      return trimmed;
    }
  }

  return null;
};

const buildSeed = ({ seed, name }) => {
  if (typeof seed === "string" && seed.trim()) {
    return seed.trim().toLowerCase();
  }

  if (typeof name === "string" && name.trim()) {
    return name.trim().toLowerCase();
  }

  return "casa-nirvana";
};

const buildInitials = (name) => {
  if (typeof name !== "string" || !name.trim()) {
    return "CN";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  const initials = words
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return initials || "CN";
};

const hashSeed = (seed) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const pickFallbackColor = (seed) => {
  const colorIndex = hashSeed(seed) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[colorIndex];
};

const AppAvatar = ({
  avatarUrl,
  name,
  seed,
  size = 48,
  borderRadius,
  style,
  imageStyle,
}) => {
  const resolvedAvatarSource = normalizeAvatarSource(avatarUrl);
  const resolvedSeed = buildSeed({ seed, name });
  const resolvedBorderRadius =
    typeof borderRadius === "number" ? borderRadius : size / 2;
  const initials = buildInitials(name);
  const fallbackColor = pickFallbackColor(resolvedSeed);
  const baseStyle = {
    width: size,
    height: size,
    borderRadius: resolvedBorderRadius,
    overflow: "hidden",
  };

  if (typeof resolvedAvatarSource === "number") {
    return <Image source={resolvedAvatarSource} style={[baseStyle, style, imageStyle]} />;
  }

  if (typeof resolvedAvatarSource === "string") {
    return (
      <Image
        source={{ uri: resolvedAvatarSource }}
        style={[baseStyle, style, imageStyle]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallbackContainer,
        baseStyle,
        style,
        { backgroundColor: fallbackColor },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: Math.max(Math.round(size * 0.32), 14),
            lineHeight: Math.max(Math.round(size * 0.38), 16),
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    ...Fonts.Bold14white,
    letterSpacing: 0.6,
  },
});

export default AppAvatar;
