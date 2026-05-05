import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

// ─── Palette (mirrors Student_Home) ──────────────────────────────────────────
const C = {
  green:     '#2ca96a',
  greenDark: '#008443',
  greenPale: '#E8F5E9',
  bg:        '#F1FBF4',
  white:     '#ffffff',
  ink:       '#1B2B22',
  inkLight:  '#6B8E6B',
};

const loading = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sw(20),
  },
  video: {
    width: sw(300),
    height: sw(300),
    marginBottom: sh(20),
    borderRadius: sw(20),
    overflow: 'hidden',
  },

  // Progress container — pinned to bottom
  progressContainer: {
    position: 'absolute',
    bottom: sh(40),
    left: sw(20),
    right: sw(20),
    alignItems: 'center',
  },

  // Progress bar track
  progressBarBackground: {
    width: '100%',
    height: sh(10),
    backgroundColor: C.greenPale,
    borderRadius: sw(6),
    overflow: 'hidden',
    marginBottom: sh(10),
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },

  // Progress bar fill
  progressBarFill: {
    height: '100%',
    backgroundColor: C.green,
    borderRadius: sw(6),
  },

  // Percentage label
  progressText: {
    fontSize: sf(18),
    color: C.greenDark,
    fontFamily: 'Nunito-ExtraBold',
    marginBottom: sh(8),
  },

  // Status pill
  statusText: {
    fontSize: sf(14),
    color: C.ink,
    textAlign: 'center',
    fontFamily: 'Nunito-Medium',
    marginBottom: sh(12),
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: sw(18),
    paddingVertical: sh(7),
    borderRadius: sw(20),
    // borderWidth: 1,
    // borderColor: '#C8E6C9',
    overflow: 'hidden',
  },

  // Spinner
  loadingSpinner: {
    marginTop: sh(4),
  },
});

export default loading;