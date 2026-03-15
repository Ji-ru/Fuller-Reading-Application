import { StyleSheet } from 'react-native';

const bubbles = StyleSheet.create({
  // TOP RIGHT BUBBLES
  bubblesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: 'none',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 9999,
  },
  
  // ========== TOP BUBBLES (Blue Gradient Theme) ==========
  
  bubbleTopRight: {
    width: 235,
    height: 235,
    backgroundColor: '#4A90E2', // Deep vibrant blue
    opacity: 0.6,
    top: -90,
    right: -80,
  },
  bubbleMiddleRight1: {
    width: 150,
    height: 150,
    backgroundColor: '#5B7C99', // Muted slate blue
    opacity: 0.4,
    top: -90,
    right: -80,
  },
  bubbleMiddleRight2: {
    width: 150,
    height: 150,
    backgroundColor: '#1E88E5', // Bright sky blue
    opacity: 0.45,
    top: 20,
    right: -80,
  },
  bubbleTopLeft1: {
    width: 50,
    height: 50,
    backgroundColor: '#90CAF9', // Light powder blue
    opacity: 0.5,
    top: 10,
    left: 160,
  },
  bubbleTopLeft2: {
    width: 40,
    height: 40,
    backgroundColor: '#B3D9F2', // Very light blue
    opacity: 0.45,
    top: 130,
    left: 140,
  },
  bubbleTopLeft3: {
    width: 25,
    height: 25,
    backgroundColor: '#78B9E8', // Medium light blue
    opacity: 0.5,
    top: 150,
    left: 250,
  },
  bubbleTopLeft4: {
    width: 25,
    height: 25,
    backgroundColor: '#A3CEE8', // Soft sky blue
    opacity: 0.4,
    top: 250,
    left: 350,
  },
  bubbleTopLeft5: {
    width: 15,
    height: 15,
    backgroundColor: '#C5E1F5', // Pale blue
    opacity: 0.35,
    top: 200,
    left: 350,
  },

  // ========== BOTTOM BUBBLES (Blue Gradient Theme) ==========
  
  bubbleBottomLeft1: {
    width: 270,
    height: 270,
    backgroundColor: '#2E5C8A', // Dark ocean blue
    opacity: 0.5,
    bottom: -310,
    left: -110,
  },
  bubbleBottomLeft2: {
    width: 150,
    height: 150,
    backgroundColor: '#BBDEFB', // Light pastel blue
    opacity: 0.4,
    bottom: -150,
    left: -50,
  },
  bubbleBottomLeft3: {
    width: 200,
    height: 200,
    backgroundColor: '#5D9CCC', // Medium cerulean blue
    opacity: 0.5,
    bottom: -270,
    left: 20,
  },
  bubbleBottomLeft4: {
    width: 210,
    height: 210,
    backgroundColor: '#4682B4', // Steel blue
    opacity: 0.45,
    bottom: -340,
    left: 50,
  },
  bubbleBottomLeft5: {
    width: 25,
    height: 25,
    backgroundColor: '#B8D8EB', // Soft powder blue
    opacity: 0.4,
    bottom: -40,
    left: 150,
  },
  bubbleBottomLeft6: {
    width: 30,
    height: 30,
    backgroundColor: '#87CEEB', // Sky blue
    opacity: 0.45,
    bottom: 30,
    left: 100,
  },
  bubbleBottomLeft7: {
    width: 15,
    height: 15,
    backgroundColor: '#A8D5E2', // Light cyan blue
    opacity: 0.4,
    bottom: -20,
    left: 225,
  },
  bubbleBottomLeft8: {
    width: 30,
    height: 30,
    backgroundColor: '#7EB6D9', // Medium sky blue
    opacity: 0.45,
    bottom: -90,
    left: 200,
  },
});

export default bubbles;