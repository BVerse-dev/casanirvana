const fs = require('fs');
const path = require('path');

// Resolve the path to the problematic file (works with hoisted node_modules)
function resolveScalingUtilsPath() {
  try {
    const pkgMain = require.resolve('react-native-size-matters');
    const pkgRoot = path.dirname(pkgMain);
    // go up to package root and into lib/extend
    const candidate = path.resolve(pkgRoot, 'lib/extend/scaling-utils.extend.js');
    return candidate;
  } catch (e) {
    return null;
  }
}

const scalingUtilsPath = resolveScalingUtilsPath();

// Our patched content - simplified version that doesn't use @env
const patchedContent = `import { Dimensions } from 'react-native';

// Define base width and height with fixed defaults
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

const { width, height } = Dimensions.get('window');
const [shortDimension, longDimension] = width < height ? [width, height] : [height, width];

// Use constants directly rather than importing from @env
const guidelineBaseWidth = BASE_WIDTH;
const guidelineBaseHeight = BASE_HEIGHT;

export const scale = size => shortDimension / guidelineBaseWidth * size;
export const verticalScale = size => longDimension / guidelineBaseHeight * size;
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
export const moderateVerticalScale = (size, factor = 0.5) => size + (verticalScale(size) - size) * factor;

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const mvs = moderateVerticalScale;`;

// Write the patched file
try {
  if (!scalingUtilsPath || !fs.existsSync(scalingUtilsPath)) {
    throw new Error(`Target file not found: ${scalingUtilsPath || 'require.resolve failed'}`);
  }
  fs.writeFileSync(scalingUtilsPath, patchedContent);
  console.log('✅ Successfully patched react-native-size-matters at', scalingUtilsPath);
} catch (err) {
  console.error('❌ Failed to patch react-native-size-matters:', err);
}
