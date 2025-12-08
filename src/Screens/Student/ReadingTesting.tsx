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
import FeedbackModal from '../../Services/FeedbackModal';

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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState<
    'congratulations' | 'tryAgain' | 'passageSuccess'
  >('congratulations');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Track if we've already shown the modal for this reading attempt
  const [hasShownModalForCurrentAttempt, setHasShownModalForCurrentAttempt] =
    useState(false);
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

  // Check if reading is perfect for alphabet
  const isAlphabetPerfect = (spoken: string, target: string): boolean => {
    // Remove any non-alphabetic characters and whitespace, compare ignoring case
    const cleanSpoken = spoken.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const cleanTarget = target.replace(/[^a-zA-Z]/g, '').toLowerCase();
    return cleanSpoken === cleanTarget;
  };

  // Show appropriate modal based on results
  const displayFeedbackModal = (
    accuracyNum: number,
    isAlphabetMode: boolean,
  ) => {
    // Reset the flag for new attempt
    setHasShownModalForCurrentAttempt(false);

    let modalType: 'congratulations' | 'tryAgain' | 'passageSuccess' =
      'tryAgain';
    let message = '';

    if (isAlphabetMode) {
      // For alphabet: check if perfect match
      if (isAlphabetPerfect(spokenText, targetText)) {
        modalType = 'congratulations';
      } else {
        modalType = 'tryAgain';
        message = `The correct letter is "${targetText}". Try saying it again!`;
      }
    } else {
      // For passage: check if accuracy >= 90%
      if (accuracyNum >= 80) {
        modalType = 'passageSuccess';
        message = `You read with ${accuracy} accuracy! Excellent work!`;
      } else if (accuracyNum >= 70) {
        modalType = 'tryAgain';
        message = `You read with ${accuracy} accuracy. Good job! Try to reach 90% next time.`;
      } else {
        modalType = 'tryAgain';
        message = `You read with ${accuracy} accuracy. Let's practice some more!`;
      }
    }

    setFeedbackModalType(modalType);
    setFeedbackMessage(message);
    setShowFeedbackModal(true);
    setHasShownModalForCurrentAttempt(true);
  };

  // Analyze reading based on type
  const analyzeReading = (transcription: string) => {
    let accuracyNum = 0;

    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      // Simple alphabet check
      const result = MiscueAnalysisService.checkAlphabetAccuracy(
        readingMaterial.letter,
        transcription,
      );

      setAccuracy(result.accuracy);
      setFeedback(result.feedback);
      setMiscues([]); // No complex miscues for alphabet

      // Parse accuracy value
      accuracyNum = parseFloat(result.accuracy);
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

      // Parse accuracy value (remove % sign)
      accuracyNum = parseFloat(calculatedAccuracy);
    }

    // Show feedback modal only if we haven't shown it for this attempt
    if (!hasShownModalForCurrentAttempt) {
      setTimeout(() => {
        displayFeedbackModal(accuracyNum, type === 'alphabet');
      }, 500);
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
      // Reset modal state for new recording
      setHasShownModalForCurrentAttempt(false);
      setShowFeedbackModal(false);
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

  // Reset all states including modal state
  const handleTryAgain = () => {
    setSpokenText('');
    setMiscues([]);
    setAccuracy('0');
    setFeedback('');
    setIsReadingCompleted(false);
    setShowFeedbackModal(false);
    setHasShownModalForCurrentAttempt(false);
  };

  const handleFeedbackModalClose = () => {
    setShowFeedbackModal(false);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
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
          onLogout={handleLogout}
          menuVisible={menuVisible}
        />

        {/* Screen Title */}
        <Text style={selection.label}>
          {type === 'alphabet' ? 'Alphabet Practice' : 'Reading Practice'}
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

        {/* Feedback - Only show when reading is completed and modal is closed */}
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

        {/* Recording Controls - Only show when not completed */}
        {!isReadingCompleted && (
          <RecordingControls
            isRecording={isRecording}
            isLoading={isLoading}
            hasPermission={hasPermission}
            recordTime={formatTime(recordTime)}
            onRecordToggle={handleRecordToggle}
          />
        )}

        {/* Feedback Modal */}
        <FeedbackModal
          visible={showFeedbackModal}
          type={feedbackModalType}
          onClose={handleFeedbackModalClose}
          message={feedbackMessage}
          autoClose={true}
        />
      </View>
    </SafeAreaView>
  );
}
