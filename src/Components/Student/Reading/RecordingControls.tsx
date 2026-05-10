import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import readingStyles from '../../../UI_Designs/ReadingActivityStyles';

interface RecordingControlsProps {
  isRecording: boolean;
  isLoading: boolean;
  hasPermission: boolean;
  recordTime?: string;
  onRecordToggle: () => void;
  showRecordingStatus?: boolean;
}

// One ripple ring
const RippleRing = ({ delay, isRecording }: { delay: number; isRecording: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 2.2, duration: 1400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      scale.setValue(1);
      opacity.setValue(0);
    }
  }, [isRecording]);

  return (
    <Animated.View
      style={[
        readingStyles.rippleRing,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
};

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isLoading,
  hasPermission,
  onRecordToggle,
}) => {
  return (
    <View style={readingStyles.microphoneContainer}>
      <View style={readingStyles.recordingStatusPill}>
        <View style={[
          readingStyles.recordingStatusDot,
          isRecording && readingStyles.recordingStatusDotActive,
        ]} />
        <Text style={[
          readingStyles.recordingStatusText,
          isRecording && readingStyles.recordingStatusTextActive,
        ]}>
          {isRecording ? 'Tap to stop' : 'Tap to start'}
        </Text>
      </View>

      {/* Mic button + ripple rings stacked */}
      <View style={readingStyles.micRippleWrapper}>
        {/* 3 staggered rings, only animate when recording */}
        <RippleRing delay={0} isRecording={isRecording} />
        <RippleRing delay={450} isRecording={isRecording} />
        <RippleRing delay={900} isRecording={isRecording} />

        <TouchableOpacity
          style={isRecording ? readingStyles.microphoneRecording : readingStyles.microphone}
          onPress={onRecordToggle}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {!isRecording ? (
            <Svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <Rect x="9" y="2" width="6" height="12" rx="3" />
              <Path d="M5 10v1a7 7 0 0 0 14 0v-1" />
              <Path d="M12 18v4" />
              <Path d="M8 22h8" />
            </Svg>
          ) : (
            <Svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <Rect x="5" y="5" width="14" height="14" rx="3" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>

      {!hasPermission && (
        <Text style={{ marginTop: 8, color: '#FF4D4D', fontFamily: 'Andika-Bold' }}>
          Microphone permission required
        </Text>
      )}
    </View>
  );
};