import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Design baseline (current styles target ~390px wide phone)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/** Scale a value proportionally to screen width */
export const sw = (size: number): number => (width / BASE_WIDTH) * size;

/** Scale a value proportionally to screen height */
export const sh = (size: number): number => (height / BASE_HEIGHT) * size;

/** Scale font sizes (uses width for consistency across orientations) */
export const sf = (size: number): number => (width / BASE_WIDTH) * size;

/** Moderate scale — less aggressive scaling for fonts/padding */
export const ms = (size: number, factor: number = 0.5): number =>
  size + (sw(size) - size) * factor;
