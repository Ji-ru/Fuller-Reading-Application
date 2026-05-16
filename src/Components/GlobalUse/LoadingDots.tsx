import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { FacultyColors as F } from '../../Utilities/Theme';

interface LoadingDotsProps {
  color?: string;
  size?: number;
  gap?: number;
}

export function LoadingDots({ 
  color = F.primary, 
  size = 10, 
  gap = 6 
}: LoadingDotsProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -8, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,   duration: 400, useNativeDriver: true }),
          Animated.delay(800 - delay),
        ])
      );
    };

    const animation = Animated.parallel([
      animate(dot1, 0),
      animate(dot2, 200),
      animate(dot3, 400),
    ]);

    animation.start();

    return () => animation.stop();
  }, [dot1, dot2, dot3]);

  return (
    <View style={[styles.container, { gap }]}>
      <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.6, transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.3, transform: [{ translateY: dot3 }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    // base styles
  }
});
