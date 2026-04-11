// ─── Centralized Theme ────────────────────────────────────────────────────────
// Two palette variants sharing the same green family:
//   • StudentColors  – vibrant, playful, kids-friendly
//   • FacultyColors  – professional but visually coherent with the student palette

export const StudentColors = {
  green:      '#2ecc71',
  greenDark:  '#27ae60',
  greenDeep:  '#1a7a45',
  greenLight: '#d4f5e2',
  greenPale:  '#f0faf4',
  mint:       '#a8edce',
  teal:       '#1abc9c',
  yellow:     '#f9e04b',
  yellowDark: '#e6c820',
  orange:     '#f39c12',
  coral:      '#e74c3c',
  red:        '#e74c3c',
  sky:        '#3498db',
  purple:     '#9b59b6',
  pink:       '#e91e63',
  white:      '#ffffff',
  ink:        '#1b2e23',
  inkLight:   '#4a6358',
  slate:      '#8fafa0',
  bg:         '#f0faf4',
} as const;

export const FacultyColors = {
  // Primary – desaturated, professional greens
  primary:       '#2d8a5e',
  primaryDark:   '#1e6e47',
  primaryDeep:   '#155237',
  primaryLight:  '#ddf0e6',
  primaryPale:   '#f2f9f5',

  // Accent – same family, restrained
  teal:       '#1a9985',
  orange:     '#d4880e',
  yellow:     '#d9c22e',
  red:        '#c0392b',
  sky:        '#2980b9',
  purple:     '#7d4b9a',

  // Neutrals
  white:      '#ffffff',
  ink:        '#1c2b24',
  inkLight:   '#4f6259',
  slate:      '#8ca69a',
  bg:         '#f2f9f5',
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
