import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import readingStyles from '../../../UI_Designs/ReadingActivityStyles';

interface RecordingControlsProps {
  isRecording: boolean;
  isLoading: boolean;
  hasPermission: boolean;
  onRecordToggle: () => void;
  showRecordingStatus?: boolean;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isLoading,
  hasPermission,
  onRecordToggle,
  showRecordingStatus = true,
}) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.parallel([
        Animated.loop(
          Animated.timing(pulse1, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        ),
        Animated.loop(
          Animated.sequence([
            Animated.delay(1000),
            Animated.timing(pulse2, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            })
          ])
        )
      ]).start();
    } else {
      pulse1.setValue(0);
      pulse2.setValue(0);
    }
  }, [isRecording, pulse1, pulse2]);

  const getScaleOpacity = (anim: Animated.Value) => ({
    scale: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.4],
    }),
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0],
    })
  });

  const p1 = getScaleOpacity(pulse1);
  const p2 = getScaleOpacity(pulse2);

  return (
    <View style={styles.proMicWrapper}>
       {/* Instruction text always takes space to prevent jumping */}
       <View style={styles.labelContainer}>
          {isRecording && (
            <Animated.Text style={[styles.listeningText, { opacity: pulse1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.4, 1] }) }]}>
              Nakikinig...
            </Animated.Text>
          )}
       </View>

      <View style={readingStyles.pulseContainer}>
        {isRecording && (
          <>
            <Animated.View
              style={[
                readingStyles.pulseRing,
                { transform: [{ scale: p1.scale }], opacity: p1.opacity }
              ]}
            />
            <Animated.View
              style={[
                readingStyles.pulseRing,
                { transform: [{ scale: p2.scale }], opacity: p2.opacity }
              ]}
            />
          </>
        )}
        
        <TouchableOpacity
          onPress={onRecordToggle}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isRecording ? ['#e74c3c', '#c0392b'] : ['#1a7a45', '#2ecc71']}
            style={isRecording ? readingStyles.microphoneRecording : readingStyles.microphone}
          >
            <View style={styles.micInnerGlow}>
              <Image
                source={
                  isRecording
                    ? require('../../../../assets/icons/MicrophoneSlash-icon.png')
                    : require('../../../../assets/icons/Microphone-icon.png')
                }
                style={[
                  styles.micIcon,
                  isLoading && { opacity: 0.5 }
                ]}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {!hasPermission && <Text style={styles.errorText}>Microphone permission required</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  proMicWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180, // Fixed width for stability
  },
  labelContainer: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 8,
  },
  listeningText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: '#e74c3c',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  hintText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: '#8fafa0',
    opacity: 0.8,
  },
  micInnerGlow: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 99,
  },
  micIcon: {
    width: 38,
    height: 38,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  errorText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 8,
  }
});