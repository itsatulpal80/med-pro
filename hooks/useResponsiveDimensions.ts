import { Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Safe Area Hook
 */
export const useSafeAreas = () => {
  const insets = useSafeAreaInsets();

  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
};

/**
 * Responsive Dimensions Hook
 */
export const useResponsiveDimensions = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return {
    width,
    height,
    insets,

    safeWidth: width - insets.left - insets.right,
    safeHeight: height - insets.top - insets.bottom,

    isPortrait: height > width,
    isLandscape: width > height,

    isSmallPhone: width < 375,
    isMediumPhone: width >= 375 && width < 415,
    isLargePhone: width >= 415 && width < 500,
    isXLPhone: width >= 500,
  };
};

/**
 * Spacing
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

/**
 * Typography
 */

/**
 * Touch Targets
 */
export const TOUCH_TARGET = {
  MIN: 48,
  COMFORTABLE: 56,
  LARGE: 64,
} as const;

/**
 * Platform
 */
export const IS_IOS = Platform.OS === "ios";
export const IS_ANDROID = Platform.OS === "android";

/**
 * Container Width
 */
export const getContainerWidth = (screenWidth: number): number => {
  return Math.min(screenWidth - SPACING.lg * 2, 600);
};

/**
 * Status Bar Height
 */
export const getStatusBarHeight = (): number => {
  return IS_IOS ? 20 : 25;
};

interface SafeInsets {
  top: number;
  bottom: number;
  left?: number;
  right?: number;
}

/**
 * Screen Padding
 */
export const getScreenPadding = (safeAreaInsets: SafeInsets) => ({
  top: Math.max(safeAreaInsets.top, SPACING.lg),
  bottom: Math.max(safeAreaInsets.bottom, SPACING.lg),
  horizontal: SPACING.lg,
});

/**
 * Image Width
 */
export const getImageWidth = (screenWidth: number): number => {
  return screenWidth - SPACING.lg * 2;
};

/**
 * Font Scaling
 */
export const scaledFontSize = (
  baseSize: number,
  screenWidth: number,
): number => {
  const scale = screenWidth / 375;

  return Math.round(baseSize * Math.min(scale, 1.5));
};

/**
 * Keyboard Relative Height
 */
export const getKeyboardRelativeHeight = (
  screenHeight: number,
  safeAreaInsets: SafeInsets,
  keyboardHeight: number,
): number => {
  return (
    screenHeight - safeAreaInsets.top - safeAreaInsets.bottom - keyboardHeight
  );
};

/**
 * Button Height
 */
export const getButtonHeight = (isSmall: boolean): number => {
  return isSmall ? 44 : TOUCH_TARGET.MIN;
};

/**
 * Safe Area Style
 */
export const getSafeAreaStyle = (insets: SafeInsets) => ({
  paddingTop: insets.top,
  paddingBottom: insets.bottom,
  paddingLeft: insets.left || 0,
  paddingRight: insets.right || 0,
});
