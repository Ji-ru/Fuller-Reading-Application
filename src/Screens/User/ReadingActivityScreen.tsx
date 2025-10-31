import React, { useState, useRef, useEffect, use } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  RootStackParamList,
  useNavigationHelper,
} from '../../Functions/Buttons';
import { Passage } from '../../Types/passage';
import readingStyles from '../../ui/ReadingActivityStyles';
import bubbles from '../../ui/BubblesDesign';
import user from '../../ui/UserStyle';
import selection from '../../ui/PassageSelectionStyles';
import { API_KEY } from '@env';
import { readFile } from 'react-native-fs';
import { AudioPermissionService } from '../../Functions/Permissions';
import AudioRecord from 'react-native-audio-record';

type ReadingActivityScreenRouteProp = RouteProp<
  RootStackParamList,
  'ReadingActivity'
>;

interface Miscue {
  expected: string;
  spoken: string;
  position: number;
  timestamp: Date;
  type:
    | 'substitution'
    | 'omission'
    | 'insertion'
    | 'repetition'
    | 'mispronunciation';
}

export default function ReadingActivityScreenPage() {
  const route = useRoute<ReadingActivityScreenRouteProp>();
  const { passage } = route.params;

  // VOICE RECOGNITION STATES
  const [isRecording, setRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [miscues, setMiscues] = useState<Miscue[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [audioPath, setAudioPath] = useState('');
  const [isReadingCompleted, setIsReadingCompleted] = useState(false);

  // HANDLE NAVIGATION
  const { handleLogout, handleBackStep, handleReadingNext } =
    useNavigationHelper();

  // HANDLE MENU
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // LOGOUT
  const handleLogoutPress = () => {
    setMenuVisible(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => handleLogout(),
        },
      ],
      { cancelable: true },
    );
  };
  // Handle newlines in the text
  const formattedText = passage.text.split('\n').map((line, index) => (
    <Text key={index} style={readingStyles.textLine}>
      {line}
    </Text>
  ));

  // Add this function to get the correct image
  const getPassageImage = (imageName: string) => {
    const images: { [key: string]: any } = {
      Hickory: require('../../../assets/ReadingMaterial/PassageImages/Hickory.png'),
    };
    return images[imageName] || require('../../../assets/icons/Empty-icon.png');
  };

  const checkPermission = async () => {
    try {
      const hasAudioPermission = await AudioPermissionService.checkPermission();
      setHasPermission(hasAudioPermission);
    } catch (error) {
      Alert.alert('Error', 'Failed permission');
      setHasPermission(false);
    }
  };

  const requestPermission = async () => {
    try {
      const granted = await AudioPermissionService.ensurePermission();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      Alert.alert('Error', 'Failed to request permission');
      setHasPermission(false);
      return false;
    }
  };

  /**
   * Start initializing
   */
  const initializeAudio = async () => {
    try {
      await requestPermission();

      const options = {
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        wavFile: 'reading_test.wav',
      };

      AudioRecord.init(options);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize audio recording: ' + error);
    }
  };

  // Add this function to calculate expected reading time
  // Add a maximum recording time based on passage length
  const calculateExpectedDuration = () => {
    const wordCount = passage.text.split(/\s+/).length;
    const wordsPerMinute = 150; // Average reading speed for children
    const minutes = wordCount / wordsPerMinute;
    return Math.ceil(minutes * 60) - 2; // Convert to seconds
  };

  // START RECORDING
  const startRecording = async () => {
    if (!hasPermission) {
      const grantedPermission = await requestPermission();
      if (!grantedPermission) {
        Alert.alert(
          'Permission Denied',
          'Cannot record without microphone permission',
        );
        return;
      }
    }
    try {
      setRecording(true);
      setSpokenText('');
      setMiscues([]);
      setCurrentWordIndex(0);
      setRecordTime(0);

      AudioRecord.start();

      setAudioPath('recording_in_progress');
      const expectedDuration = calculateExpectedDuration();

      // Start timer
      const interval = setInterval(() => {
        setRecordTime(prev => {
          const newTime = prev + 1;

          // Auto-stop if recording exceeds expected duration + buffer
          if (newTime > expectedDuration + 10) {
            // 10 second buffer
            clearInterval(interval);
            stopRecording();
            return newTime;
          }

          return newTime;
        });
      }, 1000);
      setRecordingInterval(interval);
    } catch (error) {
      Alert.alert('Recording Error', 'Failed to start recording: ' + error);
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const audioFile = await AudioRecord.stop();
      setAudioPath(audioFile);
      setRecording(false);

      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(0);
      }

      setLoading(true);

      // Process the recorded audio with Google Speech-to-Text
      await processAudioWithGoogle(audioFile);
    } catch (error) {
      Alert.alert('Recording Error', 'Failed to stop recording: ' + error);
      setLoading(false);
    }
  };

  // ACTUAL GOOGLE SPEECH-TO-TEXT IMPLEMENTATION
  const processAudioWithGoogle = async (audioFile: string) => {
    try {
      // Read the audio file as base64
      const audioData = await readFile(audioFile, 'base64');

      // Prepare the request for Google Speech-to-Text API
      const requestBody = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'command_and_search',
        },
        audio: {
          content: audioData,
        },
      };

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Google API response:', data);

      // Process the response
      if (data.results && data.results.length > 0) {
        const transcription = data.results[0].alternatives[0].transcript;
        setSpokenText(transcription);
        setIsReadingCompleted(true);
      } else {
        setSpokenText('No speech detected');
        setIsReadingCompleted(true);
      }

      setLoading(false);
      setRecordTime(0);
    } catch (error) {
      // Fallback to simulated response if API fails
      const simulatedResponses = [
        passage.text, // Perfect match
        passage.text.replace(/\.$/, ''), // Missing punctuation
        passage.text.toLowerCase(), // All lowercase
        passage.text.split(' ').slice(0, -1).join(' '), // Missing last word
      ];

      const randomResponse =
        simulatedResponses[
          Math.floor(Math.random() * simulatedResponses.length)
        ];
      setSpokenText(randomResponse);
      setLoading(false);
      setRecordTime(0);
      setIsReadingCompleted(true);
      Alert.alert(
        'API Error',
        'Using simulated response. Check your API key and internet connection.',
      );
    }
  };
  const handleTryAgain = () => {
    setSpokenText('');
    setMiscues([]);
    setIsReadingCompleted(false);
    setCurrentWordIndex(0);
    setRecordTime(0);
  };

  const renderTextContent = () => {
    if (spokenText) {
      return spokenText;
    }
    return formattedText;
  };

  // Calculate accuracy between spoken text and passage
  const calculateAccuracy = () => {
    if (!spokenText || spokenText === 'No speech detected') return 0;

    const targetWords = passage.text.toLowerCase().split(/\s+/);
    const userWords = spokenText.toLowerCase().split(/\s+/);

    let matches = 0;
    const minLength = Math.min(targetWords.length, userWords.length);

    for (let i = 0; i < minLength; i++) {
      if (userWords[i] === targetWords[i]) {
        matches++;
      }
    }

    return ((matches / targetWords.length) * 100).toFixed(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getAccuracyFeedback = (accuracy: any) => {
    const accuracyNum = parseFloat(accuracy);
    if (accuracyNum >= 95) {
      return 'Excellent Reading! 🎉';
    } else if (accuracyNum >= 90) {
      return 'Great Job!';
    } else if (accuracyNum >= 80) {
      return 'Good Effort!';
    } else if (accuracyNum >= 70) {
      return 'Keep Practicing!';
    } else {
      return "Let's Try Again!";
    }
  };

  // Add method to check the miscues omitted by the reader
  // This method will be used in miscureReport() method to display all the miscues
  const detectMiscues = () => {
    if (!spokenText || spokenText === 'No Speech Detected!') {
      setMiscues([]);
      return;
    }

    const targetWords = passage.text.toLowerCase().split(/\s+/);
    const userWords = spokenText.toLowerCase().split(/\s+/);
    const detectedMiscues: Miscue[] = [];

    let targetIndex = 0;
    let userIndex = 0;

    // ADD WHILE HERE
    while (targetIndex < targetWords.length && userIndex < userWords.length) {
      const expectedWord = targetWords[targetIndex];
      const spokenWord = userWords[userIndex];

      // check for exact match (comment this line of code to check if needed)
      if (spokenWord === expectedWord) {
        targetIndex++;
        userIndex++;
        continue;
      }

      const substitutionMiscue = substitution(
        expectedWord,
        spokenWord,
        targetIndex,
      );
      if (substitutionMiscue) {
        detectedMiscues.push(substitutionMiscue);
        targetIndex++;
        userIndex++;
        continue;
      }

      // Check for omission
      const omissionMiscue = omission(
        expectedWord,
        spokenWord,
        targetIndex,
        userWords,
        userIndex,
      );
      if (omissionMiscue) {
        detectedMiscues.push(omissionMiscue);
        targetIndex++;
        continue;
      }

      // Check for insertion
      const insertionMiscue = insertion(
        expectedWord,
        spokenWord,
        targetIndex,
        userIndex,
      );
      if (insertionMiscue) {
        detectedMiscues.push(insertionMiscue);
        userIndex++;
        continue;
      }

      // Check for repetition
      const repetitionMiscue = repetition(
        targetWords,
        userWords,
        targetIndex,
        userIndex,
      );
      if (repetitionMiscue) {
        detectedMiscues.push(repetitionMiscue);
        userIndex++;
        continue;
      }

      // Default: treat as substitution if no other miscue detected
      detectedMiscues.push({
        expected: expectedWord,
        spoken: spokenWord,
        position: targetIndex,
        timestamp: new Date(),
        type: 'substitution',
      });
      targetIndex++;
      userIndex++;
    }

    // Check for remaining omissions at the end
    while (targetIndex < targetWords.length) {
      detectedMiscues.push({
        expected: targetWords[targetIndex],
        spoken: '[OMITTED]',
        position: targetIndex,
        timestamp: new Date(),
        type: 'omission',
      });
      targetIndex++;
    }

    // Check for remaining insertions at the end
    while (userIndex < userWords.length) {
      detectedMiscues.push({
        expected: '[EXTRA]',
        spoken: userWords[userIndex],
        position: userIndex,
        timestamp: new Date(),
        type: 'insertion',
      });
      userIndex++;
    }

    setMiscues(detectedMiscues);
  };

  const substitution = (
    expected: string,
    spoken: string,
    position: number,
  ): Miscue | null => {
    if (spoken && spoken !== expected) {
      return {
        expected,
        spoken,
        position,
        timestamp: new Date(),
        type: 'substitution',
      };
    }
    return null;
  };

  const omission = (
    expected: string,
    spoken: string,
    position: number,
    userWords: string[],
    userIndex: number,
  ): Miscue | null => {
    if (
      userIndex < userWords.length - 1 &&
      userWords[userIndex + 1] === expected
    ) {
      return {
        expected,
        spoken: '[OMITTED]',
        position,
        timestamp: new Date(),
        type: 'omission',
      };
    }
    return null;
  };

  const insertion = (
    expected: string,
    spoken: string,
    position: number,
    userIndex: number,
  ): Miscue | null => {
    if (spoken && spoken !== expected) {
      return {
        expected: '[EXTRA]',
        spoken,
        position,
        timestamp: new Date(),
        type: 'insertion',
      };
    }
    return null;
  };

  const repetition = (
    targeWords: string[],
    userWords: string[],
    targetIndex: number,
    userIndex: number,
  ): Miscue | null => {
    if (userIndex > 0 && userWords[userIndex] === userWords[userIndex - 1]) {
      return {
        expected: targeWords[targetIndex],
        spoken: userWords[userIndex],
        position: targetIndex,
        timestamp: new Date(),
        type: 'repetition',
      };
    }
    return null;
  };

  // const checkMiscues = () => {
  //   detectMiscues();
  //   // Categorize miscues by type
  //   const categorizedMiscues = {
  //     substitution: miscues.filter(m => m.type === 'substitution'),
  //     omission: miscues.filter(m => m.type === 'omission'),
  //     insertion: miscues.filter(m => m.type === 'insertion'),
  //     repetition: miscues.filter(m => m.type === 'repetition'),
  //     mispronunciation: miscues.filter(m => m.type === 'mispronunciation'),
  //   };

  //   return categorizedMiscues;
  // };

  // Helper function to format miscue words for display
  const formatMiscueWords = (miscues: Miscue[]) => {
    if (miscues.length === 0) return 'None';

    return (
      miscues
        .slice(0, 5)
        .map(miscue => {
          if (miscue.type === 'omission') {
            return `"${miscue.expected}"`;
          } else if (miscue.type === 'insertion') {
            return `"${miscue.spoken}"`;
          } else {
            return `"${miscue.expected}"→"${miscue.spoken}"`;
          }
        })
        .join(', ') +
      (miscues.length > 5 ? `... (+${miscues.length - 5} more)` : '')
    );
  };

  useEffect(() => {
    checkPermission();
    initializeAudio();
  }, []);

  useEffect(() => {
    if (spokenText && spokenText !== 'No speech detected') {
      detectMiscues();
    }
  }, [spokenText]);

  return (
    <SafeAreaView style={readingStyles.container}>
      <View style={readingStyles.insideContainer}>
        {/* BUBBLE DECORATIONS */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          {/* Top Bubbles */}
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />

          {/* Bottom Bubbles */}
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>

        {/* HEADER (BACK BUTTON + LOGO + MENU ICON) */}
        <View style={user.header}>
          <TouchableOpacity style={user.touchable} onPress={handleBackStep}>
            <Image
              source={require('../../../assets/icons/BackButton-icon.png')}
            />
          </TouchableOpacity>
          <Image
            style={user.ciscLogo}
            source={require('../../../assets/images/cisckids.png')}
          />
          <TouchableOpacity style={user.touchable} onPress={toggleMenu}>
            <Image
              style={user.menuIcon}
              source={require('../../../assets/icons/Menu-icon.png')}
            />
          </TouchableOpacity>
        </View>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <View style={user.dropdownMenu}>
            <TouchableOpacity
              onPress={handleLogoutPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderRadius: 12,
              }}
            >
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={user.logoutIcon}
              />
              <Text style={user.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OVERLAY TO CLOSE MENU */}
        {menuVisible && (
          <TouchableOpacity
            style={user.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}

        {/* SCREEN TITLE */}
        <Text style={selection.label}>Reading Activity</Text>
        {/* <Text style={selection.label}>{passage.title}</Text> */}

        {/* Content */}
        <View style={readingStyles.insideContainer}>
          <Image
            style={readingStyles.readingImage}
            source={getPassageImage(passage.image)}
          />
          <View style={readingStyles.passageContainer}>
            {/* Title */}
            <Text style={readingStyles.passageTitle}>{passage.title}</Text>

            {/* Author */}
            <Text style={readingStyles.passageAuthor}>By {passage.author}</Text>

            {/* Text Content */}
            <View style={readingStyles.textContainer}>
              <Text>{renderTextContent()}</Text>
            </View>
          </View>

          {/* Recording Status */}
          {isRecording && (
            <View>
              <Text>Recording...</Text>
            </View>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <View>
              <Text>Transcribing Audio...</Text>
            </View>
          )}

          {/* Result */}
          {!isLoading && !isRecording && isReadingCompleted && (
            <View>
              <View style={readingStyles.calculationContainer}>
                <Text style={readingStyles.calculationText}>
                  {getAccuracyFeedback(calculateAccuracy())} -{' '}
                  {calculateAccuracy()}%
                </Text>
              </View>

              <Text style={readingStyles.feedbackLabel}>Feedback Report</Text>
              <View style={readingStyles.feedbackContainer}>
                <Text style={readingStyles.feedbackText}>
                  Substitution:
                  {formatMiscueWords(
                    miscues.filter(m => m.type === 'substitution'),
                  )}
                </Text>
                {/* REDO THE OMISSION */}
                <Text style={readingStyles.feedbackText}>
                  Omission:
                  {formatMiscueWords(
                    miscues.filter(m => m.type === 'omission'),
                  )}
                </Text>
                <Text style={readingStyles.feedbackText}>
                  Insertion:
                  {formatMiscueWords(
                    miscues.filter(m => m.type === 'insertion'),
                  )}
                </Text>
                <Text style={readingStyles.feedbackText}>
                  Repetition:
                  {formatMiscueWords(
                    miscues.filter(m => m.type === 'repetition'),
                  )}
                </Text>
              </View>

              {/* Try Again Button */}
              <TouchableOpacity
                style={readingStyles.tryAgainButton}
                onPress={handleTryAgain}
              >
                <Text style={readingStyles.tryAgainText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Microphone Container - Only show when not completed */}
          {!isReadingCompleted && (
            <View style={readingStyles.microphoneContainer}>
              <TouchableOpacity
                style={
                  isRecording
                    ? readingStyles.microphoneRecording
                    : readingStyles.microphone
                }
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
              >
                <Image
                  source={
                    isRecording
                      ? require('../../../assets/icons/MicrophoneSlash-icon.png')
                      : require('../../../assets/icons/Microphone-icon.png')
                  }
                  style={isLoading ? { opacity: 1 } : {}}
                />
              </TouchableOpacity>

              {!hasPermission && <Text>Microphone permission required</Text>}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
