import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const loading = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfbff',
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

  // Progress Container Styles
  progressContainer: {
    position: 'absolute',
    bottom: sh(40), // Position at bottom of container
    left: sw(20),
    right: sw(20),
    alignItems: 'center',
  },

  // Progress Bar Background
  progressBarBackground: {
    width: '100%',
    height: sh(12),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: sw(6),
    overflow: 'hidden',
    marginBottom: sh(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Progress Bar Fill
  progressBarFill: {
    height: '100%',
    backgroundColor: '#008443',
    borderRadius: sw(6),
  },

  // Progress Percentage Text
  progressText: {
    fontSize: sf(18),
    color: '#008443',
    fontFamily: 'Satoshi-Bold',
    marginBottom: sh(8),
  },

  // Status Message Text
  statusText: {
    fontSize: sf(14),
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Satoshi-Medium',
    marginBottom: sh(12),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: sw(16),
    paddingVertical: sh(6),
    borderRadius: sw(15),
  },

  // Loading Spinner
  loadingSpinner: {
    marginTop: sh(4),
  },
});

export default loading;
