import React, { useRef, useEffect } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { StudentColors as C } from '../../Utilities/Theme';

// ─── BounceIn ─────────────────────────────────────────────────────────────────
// Spring-scales children from 0.75 → 1 after an optional delay.
export function BounceIn({
  children,
  delay = 0,
  flex = false,
}: {
  children: React.ReactNode;
  delay?: number;
  flex?: boolean;
}) {
  const scale   = useRef(new Animated.Value(0.75)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[{ transform: [{ scale }], opacity }, flex && { flex: 1 }]}
    >
      {children}
    </Animated.View>
  );
}

// ─── FloatingImage ────────────────────────────────────────────────────────────
// Continuously bobs an image up and down by 10px.
export function FloatingImage({
  source,
  style,
}: {
  source: any;
  style: StyleProp<any>;
}) {
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -10,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.Image
      source={source}
      style={[style, { transform: [{ translateY: floatY }] }]}
      resizeMode="contain"
    />
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
// Pulsing placeholder bar for loading states.
export function Skeleton({
  w = '100%',
  h = 16,
  r = 8,
}: {
  w?: any;
  h?: number;
  r?: number;
}) {
  const anim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: w,
        height: h,
        borderRadius: r,
        backgroundColor: C.mint,
        opacity: anim,
        marginBottom: 8,
      }}
    />
  );
}
