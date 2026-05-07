import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface FadeSlideInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const FadeSlideIn: React.FC<FadeSlideInProps> = ({
  children,
  delay = 0,
  direction = 'up',
}) => {
  const offset = direction === 'up' ? 30 : direction === 'down' ? -30 : direction === 'left' ? 30 : -30;
  const translateVal = useRef(new Animated.Value(offset)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(translateVal, { toValue: 0, useNativeDriver: true, tension: 50, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const isH = direction === 'left' || direction === 'right';
  return (
    <Animated.View
      style={{
        transform: [isH ? { translateX: translateVal } : { translateY: translateVal }],
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default FadeSlideIn;
