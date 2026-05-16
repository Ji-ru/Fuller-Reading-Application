import { StyleSheet } from "react-native";

const loading = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  video: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  
  // Progress Container Styles
  progressContainer: {
    position: 'absolute',
    bottom: 40, // Position at bottom of container
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  
  // Progress Bar Background
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  // Progress Bar Fill
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 6,
  },
  
  // Progress Percentage Text
  progressText: {
    fontSize: 18,
    color: '#3498db',
    fontFamily: 'Andika-Bold',
    marginBottom: 8,
  },
  
  // Status Message Text
  statusText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Andika-Regular',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  
  // Loading Spinner
  loadingSpinner: {
    marginTop: 4,
  },
});

export default loading;
