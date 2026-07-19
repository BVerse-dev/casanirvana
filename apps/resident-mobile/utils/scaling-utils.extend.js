import { Dimensions } from 'react-native';

// Define base width and height directly
const BASE_WIDTH = 414;  // From your .env file
const BASE_HEIGHT = 896; // From your .env file

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
export const mvs = moderateVerticalScale;
