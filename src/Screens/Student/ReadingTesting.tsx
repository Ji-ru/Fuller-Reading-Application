// import React, { useState, useEffect } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { View, Text, Alert } from 'react-native';
// import { RouteProp, useRoute } from '@react-navigation/native';

// import { RootStackParamList, useNavigationHelper } from '../../Controller/NavigationController';
// import readingStyles from '../../ui/ReadingActivityStyles';
// import bubbles from '../../ui/BubblesDesign';
// import selection from '../../ui/PassageSelectionStyles';

// import { useAudioRecording } from '../../Controller/AudioRecordingController';
// import { useSpeechToText } from '../../Controller/Speech2TextServiceController';
// import { MiscueAnalysisService } from '../../Controller/MiscueAnalysisServiceController';
// import { ReadingHeader } from '../../Components/Reading/ReadingHeader';
// import { PassageDisplay } from '../../Components/Reading/PassageDisplay';
// import { RecordingControls } from '../../Components/Reading/RecordingControls';
// import { ReadingFeedback } from '../../Components/Reading/ReadingFeedback';
// import { Miscue } from '../../Types/miscue';
// import { MiscueReportController } from '../../Controller/MiscueReportController';
// import {
//   AlphabetItem,
//   Passage,
//   isAlphabet,
//   isPassage,
// } from '../../Types/passage';
// type ReadingActivityScreenRouteProp = RouteProp<RootStackParamList, 'ReadingTesting'>;

// export default function ReadingActivityScreenPage() {
//   const route = useRoute<ReadingActivityScreenRouteProp>();
//   const { readingMaterial, type } = route.params;

//   // State
//   const [spokenText, setSpokenText] = useState('');
//   const [miscues, setMiscues] = useState<Miscue[]>([]);
//   const [isReadingCompleted, setIsReadingCompleted] = useState(false);
//   const [menuVisible, setMenuVisible] = useState(false);

//   // Hooks
//   const {
//     isRecording,
//     hasPermission,
//     recordTime,
//     checkPermission,
//     initializeAudio,
//     startRecording,
//     stopRecording,
//     formatTime,
//   } = useAudioRecording();

//   const {
//     isLoading,
//     processAudioWithGoogle,
//     getSimulatedResponse,
//   } = useSpeechToText();

//   // Navigation
//   const { handleLogout, handleBackStep } = useNavigationHelper();

//   // Effects
//   useEffect(() => {
//     checkPermission();
//     initializeAudio();
//   }, [checkPermission, initializeAudio]);

//   useEffect(() => {
//     if (spokenText && spokenText !== 'No speech detected') {
//       const detectedMiscues = MiscueAnalysisService.detectMiscues(passage.text, spokenText);
//       setMiscues(detectedMiscues);
//     }
//   }, [spokenText, passage.text]);

//   // Handlers
//   const handleRecordToggle = async () => {
//     if (isRecording) {
//       try {
//         const audioFile = await stopRecording();
//         await handleAudioProcessing(audioFile);
//       } catch (error) {
//         Alert.alert('Error', 'Failed to process recording');
//       }
//     } else {
//       await startRecording(passage.text);
//     }
//   };

//   const handleAudioProcessing = async (audioFile: string) => {
//     try {
//       const transcription = await processAudioWithGoogle(audioFile);
//       setSpokenText(transcription);

//       const detectedMiscues = MiscueAnalysisService.detectMiscues(passage.text, transcription);
//       setMiscues(detectedMiscues);

//       await MiscueReportController.storeReport(passage.title, detectedMiscues);

//       setIsReadingCompleted(true);
//     } catch (error) {
//       // Use simulated response as fallback
//       const simulatedResponse = getSimulatedResponse(passage.text);
//       setSpokenText(simulatedResponse);
//       setIsReadingCompleted(true);
//     }
//   };

//   const handleTryAgain = () => {
//     setSpokenText('');
//     setMiscues([]);
//     setIsReadingCompleted(false);
//   };

//   const toggleMenu = () => {
//     setMenuVisible(!menuVisible);
//   };

//   // Render
//   return (
//     <SafeAreaView style={readingStyles.container}>
//       <View style={readingStyles.insideContainer}>
//         {/* Bubble Decorations */}
//         <View style={bubbles.bubblesContainer} pointerEvents="none">
//           <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
//           <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
//           <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
//           <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
//           <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
//           <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
//           <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
//           <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />
//           <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
//           <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
//           <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
//           <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
//           <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
//           <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
//           <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
//           <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
//         </View>

//         {/* Header */}
//         <ReadingHeader
//           onBack={handleBackStep}
//           onMenuToggle={toggleMenu}
//           onLogout={handleLogout}
//           menuVisible={menuVisible}
//         />

//         {/* Screen Title */}
//         <Text style={selection.label}>
//           {type === 'alphabet' ? 'Alphabet Practice' : 'Reading Activity'}
//         </Text>

//         {/* Use the updated PassageDisplay component */}
//         <PassageDisplay
//           material={readingMaterial}
//           type={type}
//           spokenText={spokenText}
//           isRecording={isRecording}
//         />
//         {/* Loading Indicator */}
//         {isLoading && (
//           <View>
//             <Text>Transcribing Audio...</Text>
//           </View>
//         )}

//         {/* Results */}
//         {!isLoading && !isRecording && isReadingCompleted && (
//           <ReadingFeedback
//             passageText={passage.text}
//             spokenText={spokenText}
//             miscues={miscues}
//             onTryAgain={handleTryAgain}
//           />
//         )}

//         {/* Recording Controls - Only show when not completed */}
//         {!isReadingCompleted && (
//           <RecordingControls
//             isRecording={isRecording}
//             isLoading={isLoading}
//             hasPermission={hasPermission}
//             recordTime={formatTime(recordTime)}
//             onRecordToggle={handleRecordToggle}
//           />
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }

// ReadingActivityScreenPage.tsx - Simplified version
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import {
  RootStackParamList,
  useNavigationHelper,
} from '../../Controller/NavigationController';
import readingStyles from '../../ui/ReadingActivityStyles';
import bubbles from '../../ui/BubblesDesign';
import selection from '../../ui/PassageSelectionStyles';

import { useAudioRecording } from '../../Controller/AudioRecordingController';
import { useSpeechToText } from '../../Controller/Speech2TextServiceController';
import { MiscueAnalysisService } from '../../Controller/MiscueAnalysisServiceController';
import { ReadingHeader } from '../../Components/Reading/ReadingHeader';
import { PassageDisplay } from '../../Components/Reading/PassageDisplay';
import { RecordingControls } from '../../Components/Reading/RecordingControls';
import { ReadingFeedback } from '../../Components/Reading/ReadingFeedback';
import { Miscue } from '../../Types/miscue';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { isAlphabet, isPassage } from '../../Types/passage';

type ReadingActivityScreenRouteProp = RouteProp<
  RootStackParamList,
  'ReadingTesting'
>;

export default function ReadingActivityScreenPage() {
  const route = useRoute<ReadingActivityScreenRouteProp>();
  const { readingMaterial, type } = route.params;

  // State
  const [spokenText, setSpokenText] = useState('');
  const [miscues, setMiscues] = useState<Miscue[]>([]);
  const [accuracy, setAccuracy] = useState('0');
  const [feedback, setFeedback] = useState('');
  const [isReadingCompleted, setIsReadingCompleted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Hooks
  const {
    isRecording,
    hasPermission,
    recordTime,
    checkPermission,
    initializeAudio,
    startRecording,
    stopRecording,
    formatTime,
  } = useAudioRecording();

  const { isLoading, processAudioWithGoogle, getSimulatedResponse } =
    useSpeechToText();

  // Navigation
  const { handleLogout, handleBackStep } = useNavigationHelper();

  // Get the target text based on type
  const getTargetText = (): string => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      return readingMaterial.letter;
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      return readingMaterial.text;
    }
    return '';
  };

  const targetText = getTargetText();

  // Get title for report storage
  const getTitle = (): string => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      return `Alphabet - ${readingMaterial.letter}`;
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      return readingMaterial.title;
    }
    return 'Unknown';
  };

  // Effects
  useEffect(() => {
    checkPermission();
    initializeAudio();
  }, [checkPermission, initializeAudio]);

  useEffect(() => {
    if (spokenText && spokenText !== 'No Speech Detected!') {
      analyzeReading(spokenText);
    }
  }, [spokenText]);

  // Analyze reading based on type
  const analyzeReading = (transcription: string) => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      // Simple alphabet check
      const result = MiscueAnalysisService.checkAlphabetAccuracy(
        readingMaterial.letter,
        transcription,
      );

      setAccuracy(result.accuracy);
      setFeedback(result.feedback);
      setMiscues([]); // No complex miscues for alphabet
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      // Full passage miscue detection
      const detectedMiscues = MiscueAnalysisService.detectMiscues(
        readingMaterial.text,
        transcription,
      );
      const calculatedAccuracy = MiscueAnalysisService.calculateAccuracy(
        readingMaterial.text,
        transcription,
      );
      const accuracyFeedback =
        MiscueAnalysisService.getAccuracyFeedback(calculatedAccuracy);

      setMiscues(detectedMiscues);
      setAccuracy(calculatedAccuracy);
      setFeedback(accuracyFeedback);
    }
  };

  // Handlers
  const handleRecordToggle = async () => {
    if (isRecording) {
      try {
        const audioFile = await stopRecording();
        await handleAudioProcessing(audioFile);
      } catch (error) {
        Alert.alert('Error', 'Failed to process recording');
      }
    } else {
      await startRecording(targetText);
    }
  };

  const handleAudioProcessing = async (audioFile: string) => {
    try {
      const transcription = await processAudioWithGoogle(audioFile);
      setSpokenText(transcription);
      analyzeReading(transcription);

      // Store report (only for passages with miscues)
      if (type === 'passage' && miscues.length > 0) {
        await MiscueReportController.storeReport(getTitle(), miscues);
      }

      setIsReadingCompleted(true);
    } catch (error) {
      // Use simulated response as fallback
      const simulatedResponse = getSimulatedResponse(targetText);
      setSpokenText(simulatedResponse);
      analyzeReading(simulatedResponse);
      setIsReadingCompleted(true);
    }
  };

  const handleTryAgain = () => {
    setSpokenText('');
    setMiscues([]);
    setAccuracy('0');
    setFeedback('');
    setIsReadingCompleted(false);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  // Render
  return (
    <SafeAreaView style={readingStyles.container}>
      <View style={readingStyles.insideContainer}>
        {/* Bubble Decorations */}
        <View style={bubbles.bubblesContainer}>
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>
        {/* Header */}
        <ReadingHeader
          onBack={handleBackStep}
          onMenuToggle={toggleMenu}
          onLogout={handleLogoutPress}
          menuVisible={menuVisible}
        />

        {/* Screen Title */}
        <Text style={selection.label}>
          {type === 'alphabet' ? 'Alphabet Practice' : 'Reading Activity'}
        </Text>

        {/* Display Component */}
        <PassageDisplay
          material={readingMaterial}
          type={type}
          spokenText={spokenText}
          isRecording={isRecording}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={readingStyles.loadingContainer}>
            <Text style={readingStyles.loadingText}>Transcribing Audio...</Text>
          </View>
        )}

        {/* Feedback */}
        {!isLoading && !isRecording && isReadingCompleted && (
          <ReadingFeedback
            targetText={targetText}
            spokenText={spokenText}
            miscues={miscues}
            onTryAgain={handleTryAgain}
            type={type}
            accuracy={accuracy}
            feedback={feedback}
          />
        )}

        {/* Recording Controls */}
        {!isReadingCompleted && (
          <RecordingControls
            isRecording={isRecording}
            isLoading={isLoading}
            hasPermission={hasPermission}
            recordTime={formatTime(recordTime)}
            onRecordToggle={handleRecordToggle}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
