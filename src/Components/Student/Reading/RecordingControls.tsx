import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, Text, Animated } from 'react-native';
import readingStyles from '../../../UI_Designs/ReadingActivityStyles';

interface RecordingControlsProps {
  isRecording: boolean;
  isLoading: boolean;
  hasPermission: boolean;
  recordTime: string;
  onRecordToggle: () => void;
  showRecordingStatus?: boolean;
}

interface RecordingTimerBadgeProps {
  recordTime: string;
}

const RecordingTimerBadge: React.FC<RecordingTimerBadgeProps> = ({ recordTime }) => {
  // Pulse animation for the red dot indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={readingStyles.timerBadge}>
      {/* Pulsing dot */}
      <Animated.View style={[readingStyles.timerDot, { opacity: pulseAnim }]} />
      <Text style={readingStyles.timerText}>{recordTime}</Text>
    </View>
  );
};

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isLoading,
  hasPermission,
  recordTime,
  onRecordToggle,
  showRecordingStatus = true,
}) => {

  return (
    <View style={readingStyles.microphoneContainer}>
      {showRecordingStatus && isRecording && (
        <RecordingTimerBadge recordTime={recordTime} />
      )}

      <TouchableOpacity
        style={
          isRecording
            ? readingStyles.microphoneRecording
            : readingStyles.microphone
        }
        onPress={onRecordToggle}
        disabled={isLoading}
      >
        <Image
          source={
            isRecording
              ? require('../../../../assets/icons/MicrophoneSlash-icon.png')
              : require('../../../../assets/icons/Microphone-icon.png')
          }
          style={readingStyles.microphoneIcon}
        />
      </TouchableOpacity>

      {!hasPermission && <Text>Microphone permission required</Text>}
    </View>
  );
};