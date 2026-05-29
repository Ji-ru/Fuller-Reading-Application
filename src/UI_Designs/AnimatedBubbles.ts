import { useRef } from "react";
import { Animated } from "react-native";

// Animated values for each bubble
export const useBubbleAnimations = () => {
  const bubble1Anim = useRef(new Animated.Value(0)).current;
  const bubble2Anim = useRef(new Animated.Value(0)).current;
  const bubble3Anim = useRef(new Animated.Value(0)).current;
  const bubble4Anim = useRef(new Animated.Value(0)).current;

  return { bubble1Anim, bubble2Anim, bubble3Anim, bubble4Anim };
};
