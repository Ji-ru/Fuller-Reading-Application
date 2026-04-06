import { StyleSheet } from 'react-native';
import { sw, sh } from '../Utils/responsive';

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
    width: sw(235),
    height: sw(235),
    backgroundColor: '#4A90E2', // Deep vibrant blue
    opacity: 0.6,
    top: sh(-90),
    right: sw(-80),
  },
  bubbleMiddleRight1: {
    width: sw(150),
    height: sw(150),
    backgroundColor: '#5B7C99', // Muted slate blue
    opacity: 0.4,
    top: sh(-90),
    right: sw(-80),
  },
  bubbleMiddleRight2: {
    width: sw(150),
    height: sw(150),
    backgroundColor: '#1E88E5', // Bright sky blue
    opacity: 0.45,
    top: sh(20),
    right: sw(-80),
  },
  bubbleTopLeft1: {
    width: sw(50),
    height: sw(50),
    backgroundColor: '#90CAF9', // Light powder blue
    opacity: 0.5,
    top: sh(10),
    left: sw(160),
  },
  bubbleTopLeft2: {
    width: sw(40),
    height: sw(40),
    backgroundColor: '#B3D9F2', // Very light blue
    opacity: 0.45,
    top: sh(130),
    left: sw(140),
  },
  bubbleTopLeft3: {
    width: sw(25),
    height: sw(25),
    backgroundColor: '#78B9E8', // Medium light blue
    opacity: 0.5,
    top: sh(150),
    left: sw(250),
  },
  bubbleTopLeft4: {
    width: sw(25),
    height: sw(25),
    backgroundColor: '#A3CEE8', // Soft sky blue
    opacity: 0.4,
    top: sh(250),
    left: sw(350),
  },
  bubbleTopLeft5: {
    width: sw(15),
    height: sw(15),
    backgroundColor: '#C5E1F5', // Pale blue
    opacity: 0.35,
    top: sh(200),
    left: sw(350),
  },

  // ========== BOTTOM BUBBLES (Blue Gradient Theme) ==========
  
  bubbleBottomLeft1: {
    width: sw(270),
    height: sw(270),
    backgroundColor: '#2E5C8A', // Dark ocean blue
    opacity: 0.5,
    bottom: sh(-310),
    left: sw(-110),
  },
  bubbleBottomLeft2: {
    width: sw(150),
    height: sw(150),
    backgroundColor: '#BBDEFB', // Light pastel blue
    opacity: 0.4,
    bottom: sh(-150),
    left: sw(-50),
  },
  bubbleBottomLeft3: {
    width: sw(200),
    height: sw(200),
    backgroundColor: '#5D9CCC', // Medium cerulean blue
    opacity: 0.5,
    bottom: sh(-270),
    left: sw(20),
  },
  bubbleBottomLeft4: {
    width: sw(210),
    height: sw(210),
    backgroundColor: '#4682B4', // Steel blue
    opacity: 0.45,
    bottom: sh(-340),
    left: sw(50),
  },
  bubbleBottomLeft5: {
    width: sw(25),
    height: sw(25),
    backgroundColor: '#B8D8EB', // Soft powder blue
    opacity: 0.4,
    bottom: sh(-40),
    left: sw(150),
  },
  bubbleBottomLeft6: {
    width: sw(30),
    height: sw(30),
    backgroundColor: '#87CEEB', // Sky blue
    opacity: 0.45,
    bottom: sh(30),
    left: sw(100),
  },
  bubbleBottomLeft7: {
    width: sw(15),
    height: sw(15),
    backgroundColor: '#A8D5E2', // Light cyan blue
    opacity: 0.4,
    bottom: sh(-20),
    left: sw(225),
  },
  bubbleBottomLeft8: {
    width: sw(30),
    height: sw(30),
    backgroundColor: '#7EB6D9', // Medium sky blue
    opacity: 0.45,
    bottom: sh(-90),
    left: sw(200),
  },
});

export default bubbles;