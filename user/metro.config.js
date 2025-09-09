// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable new architecture features for Expo Go compatibility
config.resolver.unstable_enableSymlinks = false;

// Force disable new architecture
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: false,
};

module.exports = config;
