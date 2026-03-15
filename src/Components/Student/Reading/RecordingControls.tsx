import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
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
      {showRecordingStatus && isRecording && (
        <View>
          <Text>Recording... {recordTime}</Text>
        </View>
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
          style={readingStyles.microphoneIcon }
        />
      </TouchableOpacity>

      {!hasPermission && <Text>Microphone permission required</Text>}
    </View>
  );
};