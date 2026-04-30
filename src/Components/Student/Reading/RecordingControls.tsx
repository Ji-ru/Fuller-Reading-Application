import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import readingStyles from '../../../UI_Designs/ReadingActivityStyles';

interface RecordingControlsProps {
  isRecording: boolean;
  isLoading: boolean;
  hasPermission: boolean;
  recordTime: string;
  onRecordToggle: () => void;
  showRecordingStatus?: boolean;
}

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
      <View style={readingStyles.recordingStatusPill}>
        <View style={[
          readingStyles.recordingStatusDot,
          isRecording && readingStyles.recordingStatusDotActive
        ]} />
        <Text style={[
          readingStyles.recordingStatusText,
          isRecording && readingStyles.recordingStatusTextActive
        ]}>
          {isRecording ? 'Tap to stop' : 'Tap to start'}
        </Text>
      </View>

      <TouchableOpacity
        style={
          isRecording
            ? readingStyles.microphoneRecording
            : readingStyles.microphone
        }
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

      {!hasPermission && <Text style={{ marginTop: 8, color: '#FF4D4D', fontFamily: 'Nunito-Bold' }}>Microphone permission required</Text>}
    </View>
  );
};