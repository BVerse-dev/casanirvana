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

function patchSizeMatters() {
  try {
    fs.writeFileSync(scalingUtilsPath, patchedContent);
    console.log('✅ Successfully patched react-native-size-matters');
  } catch (err) {
    console.error('❌ Failed to patch react-native-size-matters:', err);
  }
}

function patchAwesomeButtonColorHelper(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  if (original.includes('pSBCrCache')) {
    return true;
  }

  let updated = original;

  if (filePath.includes('/lib/commonjs/')) {
    updated = updated.replace(
      '/* eslint-disable no-bitwise */\n',
      '/* eslint-disable no-bitwise */\nlet pSBCrCache;\n',
    );
    updated = updated.replaceAll('(void 0).pSBCr', 'pSBCrCache');
  } else {
    updated = updated.replace(
      '/* eslint-disable no-bitwise */\n',
      '/* eslint-disable no-bitwise */\nlet pSBCrCache;\n',
    );
    updated = updated.replaceAll('this.pSBCr', 'pSBCrCache');
  }

  if (updated === original) {
    return false;
  }

  fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

function patchAwesomeButton() {
  const buttonRoot = path.resolve(__dirname, '../node_modules/react-native-really-awesome-button');
  const files = [
    path.join(buttonRoot, 'src/themed/colors.js'),
    path.join(buttonRoot, 'lib/module/themed/colors.js'),
    path.join(buttonRoot, 'lib/commonjs/themed/colors.js'),
  ];

  const patchedCount = files.reduce((count, filePath) => {
    try {
      return count + (patchAwesomeButtonColorHelper(filePath) ? 1 : 0);
    } catch (err) {
      console.error(`❌ Failed to patch ${filePath}:`, err);
      return count;
    }
  }, 0);

  if (patchedCount > 0) {
    console.log(`✅ Patched react-native-really-awesome-button color helper (${patchedCount} files)`);
  } else {
    console.warn('⚠️ react-native-really-awesome-button patch not applied (files missing or unchanged)');
  }
}

patchSizeMatters();
patchAwesomeButton();
