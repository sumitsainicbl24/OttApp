// utils/scale.ts
import { Dimensions, Platform } from 'react-native';

export const { width, height } = Dimensions.get('window');

// Mobile baseline (iPhone X)
const MOBILE_GUIDELINE_WIDTH = 375;
const MOBILE_GUIDELINE_HEIGHT = 812;

// TV baseline (Full HD TV)
const TV_GUIDELINE_WIDTH = 1920;
const TV_GUIDELINE_HEIGHT = 1080;

// Detect if the platform is a TV
const isTV = Platform.isTV || Platform.OS === 'android' && Platform.constants?.Release && width >= 1280;

// Choose the base guideline depending on device type
const guidelineBaseWidth = isTV ? TV_GUIDELINE_WIDTH : MOBILE_GUIDELINE_WIDTH;
const guidelineBaseHeight = isTV ? TV_GUIDELINE_HEIGHT : MOBILE_GUIDELINE_HEIGHT;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export { isTV, scale, verticalScale, moderateScale };
