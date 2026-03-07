import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';
import { Colors, Fonts } from '../constants/styles';

const REMOTE_URI_PATTERN = /^(https?:\/\/|file:\/\/|content:\/\/|data:image\/)/i;

const normalizeAvatarUrl = (value) => {
  if (!value) return null;

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'object' && value?.uri) {
    return normalizeAvatarUrl(value.uri);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (REMOTE_URI_PATTERN.test(trimmed)) {
      return trimmed;
    }
  }

  return null;
};

const buildSeed = ({ seed, name }) => {
  if (typeof seed === 'string' && seed.trim()) {
    return seed.trim();
  }

  if (typeof name === 'string' && name.trim()) {
    return name.trim().toLowerCase();
  }

  return 'casa-nirvana';
};

const buildFallbackLabel = (name) => {
  if (typeof name !== 'string' || !name.trim()) {
    return 'CN';
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return words.map((word) => word.charAt(0).toUpperCase()).join('') || 'CN';
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
  const resolvedAvatarUrl = normalizeAvatarUrl(avatarUrl);
  const resolvedBorderRadius = typeof borderRadius === 'number' ? borderRadius : size / 2;
  const resolvedSeed = buildSeed({ seed, name });
  const fallbackLabel = buildFallbackLabel(name);

  const generatedAvatar = useMemo(() => {
    try {
      return createAvatar(initials, {
        seed: resolvedSeed,
        size: Math.max(size * 2, 128),
        chars: 2,
        fontWeight: 700,
        backgroundType: ['gradientLinear'],
        radius: 50,
      }).toString();
    } catch (error) {
      console.warn('Failed to generate default avatar:', error);
      return null;
    }
  }, [resolvedSeed, size]);

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: resolvedBorderRadius,
    overflow: 'hidden',
  };

  if (typeof resolvedAvatarUrl === 'number') {
    return <Image source={resolvedAvatarUrl} style={[baseStyle, style, imageStyle]} />;
  }

  if (typeof resolvedAvatarUrl === 'string') {
    return <Image source={{ uri: resolvedAvatarUrl }} style={[baseStyle, style, imageStyle]} />;
  }

  return (
    <View style={[styles.fallbackContainer, baseStyle, style]}>
      {generatedAvatar ? (
        <SvgXml xml={generatedAvatar} width={size} height={size} />
      ) : (
        <View style={styles.textFallback}>
          <Text style={styles.textFallbackLabel}>{fallbackLabel}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: Colors.lightGrey,
  },
  textFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  textFallbackLabel: {
    ...Fonts.Bold14white,
    letterSpacing: 0.6,
  },
});

export default AppAvatar;
