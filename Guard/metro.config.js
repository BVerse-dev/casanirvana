// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable new architecture features for Expo Go compatibility
config.resolver.unstable_enableSymlinks = false;

// Force disable new architecture
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: false,
};

// Resolve deps from both local and monorepo root node_modules so hoisted packages work
config.resolver = {
  ...config.resolver,
  // allow hierarchical lookup so Metro can find hoisted deps
  disableHierarchicalLookup: false,
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, '../../..', 'node_modules'),
  ],
};

module.exports = config;
