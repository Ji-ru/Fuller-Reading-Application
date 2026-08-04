import { useState, useRef, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { AudioPermissionService } from './PermissionsController';
import AudioRecord from 'react-native-audio-record';

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioPath, setAudioPath] = useState('');
  const currentWavFileRef = useRef<string>('');

  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  useEffect(() => {
    initializeAudio();

    // Cleanup on unmount
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  // useCallback: Memoize functions so they don't get recreated unless dependencies change. Optimizes performance, prevents unnecessary renders.
  const checkPermission = useCallback(async () => {
    try {
      const hasAudioPermission = await AudioPermissionService.checkPermission();
      setHasPermission(hasAudioPermission);
      return hasAudioPermission;
    } catch (error) {
      Alert.alert('Error', 'Failed to check microphone permission');
      return false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const granted = await AudioPermissionService.ensurePermission();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      Alert.alert('Error', 'Failed to request microphone permission');
      return false;
    }
  }, []);

  const initializeAudio = useCallback(async () => {
    try {
      await requestPermission();
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize audio recording');
    }
  }, [requestPermission]);

  /**
   * Caclulate the expected duration of reading the passage
   *  - this is a general expected duration regardless of what alphabet, word, or passage the user selected.
   */
  const calculateExpectedDuration = useCallback((passageText: string) => {
    const wordCount = passageText.split(/\s+/).length;
    const wordsPerMinute = 150;
    const minutes = wordCount / wordsPerMinute;
    const rawDuration = Math.ceil(minutes * 60);

    // Set minimum duration for short texts
    const MIN_DURATION = 1; // Minimum 1 second for any recording
    const MAX_DURATION = 120; // Maximum 2 minutes

    let duration = Math.max(rawDuration, MIN_DURATION);
    duration = Math.min(duration, MAX_DURATION);

    return duration;
  }, []);

  /**
   * NEED UPDATE
   * Start recording the selected passage
   * 
   */
  const startRecording = useCallback(
    async (passageText: string) => {
      // Check if granted permission
      if (!hasPermission) {
        const grantedPermission = await requestPermission();
        if (!grantedPermission) {
          Alert.alert(
            'Permission Denied',
            'Cannot record without microphone permission',
          );
          return false;
        }
      }

      try {
        setIsRecording(true);
        setRecordTime(0);
        setAudioPath('');

        const wavFile = `rec_${Date.now()}.wav`;
        currentWavFileRef.current = wavFile;
        AudioRecord.init({
          sampleRate: 16000,
          channels: 1,
          bitsPerSample: 16,
          audioSource: 6,
          wavFile,
        });

        AudioRecord.start();

        const expectedDuration = calculateExpectedDuration(passageText);

        const interval = setInterval(() => {
          setRecordTime(prev => {
            const newTime = prev + 1;
            if (newTime > expectedDuration + 10) {
              clearInterval(interval);
              return newTime;
            }
            return newTime;
          });
        }, 1000);

        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        return true;
      } catch (error) {
        Alert.alert('Recording Error', 'Failed to start recording');
        setIsRecording(false);
        return false;
      }
    },
    [hasPermission, requestPermission, calculateExpectedDuration],
  );

  /**
   * Stops the recording
   */
  const stopRecording = useCallback(async (): Promise<string> => {
    try {
      const audioFile = await AudioRecord.stop();
      setAudioPath(audioFile);
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      return audioFile;
    } catch (error) {
      Alert.alert('Recording Error', 'Failed to stop recording');
      throw error;
    }
  }, []);

  /**
   * Formats the time into 0:00 for counting the duration during the start of recording
   */
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    hasPermission,
    recordTime,
    audioPath,
    checkPermission,
    initializeAudio,
    startRecording,
    stopRecording,
    formatTime,
  };
};
