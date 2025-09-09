const fs = require('fs');
const path = require('path');

// Path to the problematic file
const scalingUtilsPath = path.resolve(__dirname, '../node_modules/react-native-size-matters/lib/extend/scaling-utils.extend.js');

// Our patched content - simplified version that doesn't use @env
const patchedContent = `import { Dimensions } from 'react-native';

// Define base width and height directly from environment variables or fallback to defaults
const BASE_WIDTH = ${process.env.SIZE_MATTERS_BASE_WIDTH || 414};
const BASE_HEIGHT = ${process.env.SIZE_MATTERS_BASE_HEIGHT || 896};

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
  fs.writeFileSync(scalingUtilsPath, patchedContent);
  console.log('✅ Successfully patched react-native-size-matters');
} catch (err) {
  console.error('❌ Failed to patch react-native-size-matters:', err);
}
