import React from 'react';
import { View } from 'react-native';
import bubbles from '../../UI_Designs/BubblesDesign';

export default function BubbleBackground() {
  return (
    <View style={bubbles.bubblesContainer} pointerEvents="none">
      <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
      <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
    </View>
  );
}
