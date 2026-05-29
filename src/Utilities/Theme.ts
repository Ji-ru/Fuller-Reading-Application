// ─── Centralized Theme ────────────────────────────────────────────────────────
// Two palette variants sharing the same blue family:
//   • StudentColors  – vibrant, playful, kids-friendly
//   • FacultyColors  – professional but visually coherent with the student palette

export const StudentColors = {
  green: '#3d71d9', // Brand Royal Blue
  greenDark: '#2a50a1',
  greenDeep: '#154360',
  greenLight: '#d6eaf8',
  greenPale: '#ebf5fb',
  mint: '#aed6f1',
  teal: '#1abc9c',
  yellow: '#f9e04b',
  yellowDark: '#e6c820',
  orange: '#f39c12',
  coral: '#eb5c6c', // Brand Coral/Rose
  red: '#eb5c6c', // Brand Coral/Rose
  sky: '#5dade2',
  purple: '#9b59b6',
  pink: '#e91e63',
  white: '#ffffff',
  ink: '#1c2833',
  inkLight: '#2c3e50',
  slate: '#859dab',
  bg: '#ebf5fb',
} as const;

export const FacultyColors = {
  // Primary – desaturated, professional blue
  primary: '#3d71d9',
  primaryDark: '#1f618d',
  primaryDeep: '#154360',
  primaryLight: '#d4e6f1',
  primaryPale: '#eaf2f8',

  // Green family
  green: '#154360',
  greenDeep: '#0d3048',
  greenLight: '#d6eaf8',
  greenPale: '#e8f5e9',

  // Accent – same family, restrained
  teal: '#1a9985',
  orange: '#d4880e',
  yellow: '#d9c22e',
  red: '#eb5c6c',
  coral: '#eb5c6c',
  sky: '#2980b9',
  purple: '#7d4b9a',
  inkDeep: '#1c2833',
  ink: '#1c2833',

  // Neutrals
  white: '#ffffff',
  inkLight: '#2c3e50',
  slate: '#859dab',
  slatePale: '#f0f4f8',
  bg: '#eaf2f8',
} as const;

// Common design tokens shared across both palettes
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
} as const;

export const Radii = {
  sm: 10,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 100,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 6,
  },
  cardLift: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
} as const;

// Accent rotation for lists/grids
export const ACCENT_COLORS = [
  StudentColors.green,
  StudentColors.teal,
  StudentColors.orange,
  StudentColors.purple,
  StudentColors.sky,
  StudentColors.pink,
] as const;
