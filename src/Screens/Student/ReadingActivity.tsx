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
import { PassageDisplay } from '../../Components/Reading/TextDisplay';
import { RecordingControls } from '../../Components/Reading/RecordingControls';
import { FeedbackResult } from '../../Components/Reading/PassageFeedback';
import { Miscue } from '../../Types/miscue';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { isAlphabet, isPassage, isWords } from '../../Types/passage';
import { FeedbackModal } from '../../Services/FeedbackModal';
import auth from '@react-native-firebase/auth';

type ReadingActivityScreenRouteProp = RouteProp<
  RootStackParamList,
  'ReadingActivity'
>;

export default function ReadingActivityScreenPage() {
  const route = useRoute<ReadingActivityScreenRouteProp>();
  const { readingMaterial, type } = route.params;

  // State
  const [spokenText, setSpokenText] = useState('');
  const [miscues, setMiscues] = useState<Miscue[]>([]);
  const [accuracyString, setAccuracyString] = useState('0');
  const [feedback, setFeedback] = useState('');
  const [isReadingCompleted, setIsReadingCompleted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState<
    'congratulations' | 'tryAgain' | 'passageSuccess' | 'goodJob'
  >('congratulations');
  const [totalWords, setTotalWords] = useState(0);

  // Track if we've already shown the modal for this reading attempt
  const [hasShownModalForCurrentAttempt, setHasShownModalForCurrentAttempt] =
    useState(false);

  // Calculate words per minute (simplified - you'll need to implement this properly)
  const [wordPerMin, setWordPerMin] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0); // In seconds
  const [hasStoredReport, setHasStoredReport] = useState(false);

  // State to show feedback for an Alphabet or Word
  const [isCorrectAttempt, setIsCorrectAttempt] = useState(false);
  const [hasStoredCorrectAttempt, setHasStoredCorrectAttempt] = useState(false);
  const [hasCheckedExisting, setHasCheckedExisting] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
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

  const { isLoading, getSimulatedResponse, processAudioWithHuggingFace } =
    useSpeechToText();

  // Navigation
  const { handleLogout, handleBackStep } = useNavigationHelper();

  /**
   * Returns the reading target text based on the type (alphabet, passage, or word).
   * - Alphabet: returns letter
   * - Passage: returns whole passage text
   * - Word: returns the first word in contrasts
   */
  const getTargetText = (): string => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      return readingMaterial.letter;
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      return readingMaterial.text;
    } else if (type === 'word' && isWords(readingMaterial)) {
      // return readingMaterial.contrasts.flatMap(contrast => contrast.words).join(' ');
      return readingMaterial.contrasts[0].words[0];
    }
    return '';
  };

  const targetText = getTargetText();

  /**
   * Generates a human-readable title for storage/reporting based on the reading type and material.
   * @returns {string} Report title
   */
  const getTitle = (): string => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      return `Alphabet - ${readingMaterial.letter}`;
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      return readingMaterial.title;
    } else if (type === 'word' && isWords(readingMaterial)) {
      return `Words for ${readingMaterial.letter}`;
    }
    return 'Unknown';
  };

  // Effects
  useEffect(() => {
    checkPermission();
    initializeAudio();
    
    // Calculate total words for passages
    if (type === 'passage' && isPassage(readingMaterial)) {
      const count = calculateTotalWords();
      setTotalWords(count);
    }
  }, [checkPermission, initializeAudio, type, readingMaterial]);
  
  /**
   * Checks if the spoken text matches the target perfectly (alphabet or word).
   * Ignores non-letter characters and is case insensitive.
   * @param spoken - The spoken/transcribed text
   * @param target - The target letter/word
   * @returns {boolean} Whether the spoken text perfectly matches the target
   */
  const isTextPerfect = (spoken: string, target: string): boolean => {
    const cleanSpoken = spoken.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const cleanTarget = target.replace(/[^a-zA-Z]/g, '').toLowerCase();
    console.log('isTextPerfect comparison:', {
      spoken,
      target,
      cleanSpoken,
      cleanTarget,
      match: cleanSpoken === cleanTarget,
    });
    return cleanSpoken === cleanTarget;
  };

  /**
   * Opens the feedback modal with the appropriate message and modal type,
   * depending on reading accuracy and mode (alphabet, word, or passage).
   * @param accuracyNum - Numeric accuracy (0-100)
   * @param isAlphabetAndWordMode - True for alphabet or word mode
   * @param isCorrect - (Optional) Whether the attempt was correct
   */
  const displayFeedbackModal = (
    accuracyNum: number,
    isAlphabetAndWordMode: boolean,
    isCorrect?: boolean,
  ) => {
    setHasShownModalForCurrentAttempt(false);

    let modalType:
      | 'congratulations'
      | 'tryAgain'
      | 'passageSuccess'
      | 'goodJob';
    let message = '';

    if (isAlphabetAndWordMode) {
      if (isCorrect) {
        modalType = 'congratulations';
      } else {
        modalType = 'tryAgain';
        message = `Try saying it again! Keep practicing.`;
      }
      // setShowWordAlphabetFeedback(true);
    } else {
      if (accuracyNum >= 90) {
        modalType = 'passageSuccess';
      } else if (accuracyNum >= 50) {
        modalType = 'goodJob';
      } else {
        modalType = 'tryAgain';
      }
    }

    setFeedbackModalType(modalType);
    setShowFeedbackModal(true);
    setHasShownModalForCurrentAttempt(true);
  };

  /**
   * Calculates the total number of words in a passage
   * @returns {number} Total word count
   */
  const calculateTotalWords = (): number => {
    if (type === 'passage' && isPassage(readingMaterial)) {
      // Split by whitespace and filter out empty strings
      const words = readingMaterial.text.trim().split(/\s+/);
      return words.length;
    }
    return 0;
  };
  /**
   * Handles the record/play toggle for recording user speech:
   * - Stops recording and processes audio if already recording
   * - Starts a new recording otherwise
   */
  const handleRecordToggle = async () => {
    if (isRecording) {
      try {
        const currentRecordTime = recordTime;
        const audioFile = await stopRecording();

        // Set Recording Duration
        setRecordingDuration(currentRecordTime);

        await handleAudioProcessing(audioFile, currentRecordTime);
      } catch (error) {
        Alert.alert('Error', 'Failed to process recording');
      }
    } else {
      // Reset modal state for new recording
      setHasShownModalForCurrentAttempt(false);
      setShowFeedbackModal(false);
      setHasStoredReport(false); // Reset for new attempts
      setHasStoredCorrectAttempt(false); // Reset storage flag for new attempt
      await startRecording(targetText);
    }
  };

  /**
   * Processes recorded audio by transcribing with Google or fallback to a simulated response.
   * Updates states and triggers analysis and UI changes.
   * @param audioFile - Path to the recorded audio file
   * @param duration - Duration of the recording (seconds)
   */
  const handleAudioProcessing = async (audioFile: string, duration: number) => {
    try {
      // const transcription = await processAudioWithGoogle(audioFile);
      const transcription = await processAudioWithHuggingFace(audioFile);
      setSpokenText(transcription);

      // Also update the state for display if needed
      setRecordingDuration(duration);

      analyzeReading(transcription, duration);
      setIsReadingCompleted(true);
    } catch (error) {
      // Use simulated response as fallback
      const simulatedResponse = getSimulatedResponse(targetText);
      setSpokenText(simulatedResponse);
      // Use 0 or a default duration for simulated response
      analyzeReading(simulatedResponse, 0);
      setIsReadingCompleted(true);
    }
  };

  /**
   * Calculates the Words Per Minute (WPM) given transcribed speech and duration in seconds.
   * @param spokenText - User's spoken text
   * @param durationSeconds - Duration in seconds
   * @returns {number} Words per minute
   */
  const calculateWordsPerMin = (
    totalWords: number,
    durationSeconds: number,
  ): number => {
    if (totalWords <= 0 || durationSeconds <= 0) return 0;
  
    const minutes = durationSeconds / 60;
    return Math.round(totalWords / minutes);
  };

  /**
   * Helper to convert an accuracy string (e.g. "85.5%") to a clamped number (0-100).
   * @param accuracyStr - String containing accuracy value, possibly with '%'
   * @returns {number} Numeric accuracy value (0-100)
   */
  const convertAccuracyStringToNumber = (accuracyStr: string): number => {
    // Remove any non-numeric characters except decimal point
    const cleanStr = accuracyStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.min(100, Math.max(0, num)); // Clamp 0-100
  };

  /**
   * Effect: On mount or material/type change, check if the reading item was already completed by the user.
   * Sets state if completed.
   */
  useEffect(() => {
    const checkIfAlreadyCompleted = async () => {
      try {
        const user = auth().currentUser;
        if (!user) return;

        if (type === 'alphabet' && isAlphabet(readingMaterial)) {
          const existing =
            await MiscueReportController.hasAlphabetBeenCompleted(
              user.uid,
              readingMaterial.letter,
            );
          if (existing) {
            console.log('Alphabet already completed:', readingMaterial.letter);
            setAlreadyCompleted(true);
          }
        } else if (type === 'word' && isWords(readingMaterial)) {
          const targetWord = getTargetText();
          const existing = await MiscueReportController.hasWordBeenCompleted(
            user.uid,
            readingMaterial.letter,
            targetWord,
          );
          if (existing) {
            console.log('Word already completed:', targetWord);
            setAlreadyCompleted(true);
          }
        }
      } catch (error) {
        console.error('Failed to check existing completion:', error);
      } finally {
        setHasCheckedExisting(true);
      }
    };

    checkIfAlreadyCompleted();
  }, [type, readingMaterial]);

  /**
   * Analyzes user transcription depending on reading type (alphabet, word, passage).
   * Calculates and sets miscues, accuracy, feedback, and stores report if eligible.
   * Shows feedback modal if not already shown for a given attempt.
   *
   * @param transcription - The transcription of spoken audio
   * @param duration - Recording duration (in seconds)
   */
  const analyzeReading = async (transcription: string, duration: number) => {
    let accuracyNum = 0;
    let isWordAlphabetCorrect = false; // Track correct status locally

    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      // Alphabet check
      const result = MiscueAnalysisService.checkAlphabetPhonemeAccuracy(
        readingMaterial.letter,
        transcription,
      );

      accuracyNum = convertAccuracyStringToNumber(result.accuracy);
      isWordAlphabetCorrect = accuracyNum === 100;

      setIsCorrectAttempt(result.isCorrect);
      setAccuracyString(result.accuracy);
      setFeedback(result.feedback);
      setMiscues([]);

      // Store correct alphabet attempt ONLY if correct AND not already stored
      if (result.isCorrect && !hasStoredCorrectAttempt && !alreadyCompleted) {
        try {
          await MiscueReportController.storeAlphabetCorrectAttempt(
            readingMaterial.letter,
          );
          setHasStoredCorrectAttempt(true);
          setAlreadyCompleted(true); // Update local state
          console.log('Alphabet stored in database');
        } catch (error) {
          console.error('Failed to store alphabet attempt:', error);
        }
      } else if (result.isCorrect && alreadyCompleted) {
        console.log('Alphabet already completed earlier');
      }
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      // Passage miscue detection
      const detectedMiscues = MiscueAnalysisService.detectMiscues(
        readingMaterial.text,
        transcription,
      );

      // Calculate accuracy
      const calculatedAccuracy = MiscueAnalysisService.calculateAccuracy(
        readingMaterial.text,
        transcription,
      );

      // Accuracy Feedback after calculation
      const accuracyFeedback =
        MiscueAnalysisService.getAccuracyFeedback(calculatedAccuracy);

      setMiscues(detectedMiscues);
      setAccuracyString(calculatedAccuracy); // String: "85.5"
      setFeedback(accuracyFeedback);

      // Calculate accuracy number for storage
      accuracyNum = convertAccuracyStringToNumber(calculatedAccuracy);
      const wpm = calculateWordsPerMin(totalWords, duration);
      setWordPerMin(wpm);

      // add the function of storeMiscueReport
      if (type === 'passage' && !hasStoredReport) {
        storeMiscueReport(accuracyNum, duration, detectedMiscues, wpm);
      }
    } else if (type === 'word' && isWords(readingMaterial)) {
      const targetWord = getTargetText();
      const correct = isTextPerfect(transcription, targetWord);

      accuracyNum = correct ? 100 : 0;
      isWordAlphabetCorrect = correct;
      const result = MiscueAnalysisService.checkWordAccuracy(
        getTargetText(),
        transcription,
      );
      setIsCorrectAttempt(result.isCorrect);
      setAccuracyString(result.accuracy);
      setFeedback(result.feedback);
      setFeedback(
        correct
          ? 'Great job! You pronounced the word correctly.'
          : 'Try again. Practice makes perfect.',
      );

      // Store correct word attempt ONLY if correct AND not already stored
      if (result.isCorrect && !hasStoredCorrectAttempt && !alreadyCompleted) {
        try {
          await MiscueReportController.storeWordCorrectAttempt(
            readingMaterial.letter,
            targetWord,
          );
          setHasStoredCorrectAttempt(true);
          setAlreadyCompleted(true); // Update local state
          console.log('Word stored in database');
        } catch (error) {
          console.error('Failed to store word attempt:', error);
        }
      } else if (result.isCorrect && alreadyCompleted) {
        console.log('Word already completed earlier');
      }
    }

    // Show feedback modal
    if (!hasShownModalForCurrentAttempt) {
      setTimeout(() => {
        displayFeedbackModal(
          accuracyNum,
          type === 'alphabet' || type === 'word',
          isWordAlphabetCorrect,
        );
      }, 500);
    }
  };

  /**
   * Stores a miscue report (Firebase) if user attempt is valid (not already stored, not empty, etc).
   * Uses miscues, accuracy, reading speed, and time spent for tracking.
   * @param accuracyNum - Numeric accuracy rate (0-100)
   * @param duration - Time spent reading (seconds)
   * @param miscues - Array of detected Miscue objects
   * @param wpm - Words per minute metric
   */
  const storeMiscueReport = async (
    accuracyNum: number,
    duration: number,
    miscues: Miscue[],
    wpm: number,
  ) => {
    try {
      // if this attempt is already stored, stop
      if (hasStoredReport) return;

      /**
       * Check if spoken text is empty or just error messages
       * Check if duration is too short (less than 1 second)
       * Check if WPM is 0 or negative (no words spoken)
       */

      if (
        !spokenText ||
        spokenText.trim() === '' ||
        spokenText === 'No Speech Detected!' ||
        spokenText.toLowerCase().includes('no speech') ||
        duration < 1 ||
        wpm <= 0
      ) {
        return;
      }

      const mins = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${mins}:${seconds
        .toString()
        .padStart(2, '0')}`;

      console.log('Storing report with data:', {
        title: getTitle(),
        miscueCount: miscues.length,
        accuracy: accuracyNum,
        wpm: wpm,
        duration: formattedDuration,
      });

      // Store the data from the MiscueReportController
      await MiscueReportController.storeReport(
        getTitle(),
        miscues,
        accuracyNum,
        wpm,
        totalWords,
        formattedDuration
      );

      Alert.alert('Success', 'Successfully stored the miscues data');
      setHasStoredReport(true);
    } catch (error: any) {
      throw new Error('Failed to store miscue report: ' + error.message);
    }
  };

  /**
   * Handler to reset all reading states (text, miscues, accuracy, modal, etc).
   * Used for retrying the activity cleanly.
   */
  const handleTryAgain = () => {
    setSpokenText('');
    setMiscues([]);
    setAccuracyString('0');
    setFeedback('');
    setIsReadingCompleted(false);
    setShowFeedbackModal(false);
    setHasShownModalForCurrentAttempt(false);
    setHasStoredReport(false);
    setHasStoredCorrectAttempt(false);
    setIsCorrectAttempt(false);
    setRecordingDuration(0);
    setWordPerMin(0);
  };

  /**
   * Handler to close the feedback modal dialog.
   */
  const handleFeedbackModalClose = () => {
    setShowFeedbackModal(false);
  };

  /**
   * Toggles visibility of the screen options/menu.
   */
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
          {type === 'alphabet'
            ? 'Alphabet Reading'
            : type === 'word'
            ? 'Word Reading'
            : 'Passage Reading'}
        </Text>

        {/* Display Component */}
        <PassageDisplay
          material={readingMaterial}
          type={type}
          spokenText={spokenText}
          isRecording={isRecording}
          miscues={miscues}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={readingStyles.loadingContainer}>
            <Text style={readingStyles.loadingText}>Transcribing Audio...</Text>
          </View>
        )}

        {/* Feedback - Only show when reading is completed and modal is closed */}
        {!isLoading && !isRecording && isReadingCompleted && (
          <FeedbackResult
            targetText={targetText}
            spokenText={spokenText}
            miscues={miscues}
            onTryAgain={handleTryAgain}
            type={type}
            accuracy={accuracyString}
            feedback={feedback}
            isTextCorrect={isCorrectAttempt}
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
          autoClose={true}
        />
      </View>
    </SafeAreaView>
  );
}
