import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

import {
  RootStackParamList,
  useNavigationHelper,
} from '../../Controller/NavigationController';
import readingStyles from '../../UI_Designs/ReadingActivityStyles';
import bubbles from '../../UI_Designs/BubblesDesign';
import selection from '../../UI_Designs/PassageSelectionStyles';

import { useAudioRecording } from '../../Controller/AudioRecordingController';
import { useSpeechToText } from '../../Controller/Speech2TextServiceController';
import { MiscueAnalysisService } from '../../Controller/MiscueAnalysisServiceController';
import { ReadingHeader } from '../../Components/Student/Reading/ReadingHeader';
import { PassageDisplay } from '../../Components/Student/Reading/TextDisplay';
import { RecordingControls } from '../../Components/Student/Reading/RecordingControls';
import { FeedbackResult } from '../../Components/Student/Reading/PassageFeedback';
import { Miscue } from '../../Interfaces/miscue';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { isAlphabet, isPassage, isWords } from '../../Interfaces/passage';
import { FeedbackModal } from '../../Components/Student/Reading/FeedbackModal';
import { getAuth } from '@react-native-firebase/auth';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { ACCENT_COLORS } from '../../Utilities/Theme';

type ReadingActivityScreenRouteProp = RouteProp<
  RootStackParamList,
  'ReadingActivity'
>;

const ChevronIcon = ({ direction, color }: { direction: 'left' | 'right', color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path 
      d={direction === 'left' ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} 
      stroke={color} 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </Svg>
);

const FinishCheckmark = ({ color }: { color: string }) => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M20 6L9 17l-5-5" 
      stroke={color} 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </Svg>
);

function NavArrow({ direction, disabled, isFinish, onPress }: { direction: 'left' | 'right', disabled?: boolean, isFinish?: boolean, onPress: () => void }) {
  if (disabled && !isFinish) return <View style={[readingStyles.navArrow, readingStyles.navArrowHidden]} />;

  return (
    <TouchableOpacity 
      style={readingStyles.navArrow} 
      onPress={onPress}
      activeOpacity={0.7}
    >
       <LinearGradient
        colors={['#ffffff', '#f0faf4']}
        style={{ width: '100%', height: '100%', borderRadius: 28, justifyContent: 'center', alignItems: 'center' }}
      >
        <ChevronIcon direction={direction} color="#1a7a45" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function ReadingActivityScreenPage() {
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const route = useRoute<ReadingActivityScreenRouteProp>();
  const { readingMaterial: initialMaterial, type, items = [], initialIndex = 0 } = route.params;

  // Navigation & Material State
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const readingMaterial = items.length > 0 ? items[currentIndex] : initialMaterial;

  const [spokenText, setSpokenText] = useState('');
  const [miscues, setMiscues] = useState<Miscue[]>([]);
  const [accuracyString, setAccuracyString] = useState('0');
  const [feedback, setFeedback] = useState('');
  const [isReadingCompleted, setIsReadingCompleted] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState<
    'congratulations' | 'tryAgain' | 'passageSuccess' | 'goodJob'
  >('congratulations');
  const [totalWords, setTotalWords] = useState(0);

  const [hasShownModalForCurrentAttempt, setHasShownModalForCurrentAttempt] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasStoredReport, setHasStoredReport] = useState(false);
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

  const { isLoading, getSimulatedResponse, transcribeAudio } = useSpeechToText();
  const { handleLogout, handleBackStep } = useNavigationHelper();

  const getTargetText = useCallback((): string => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      return readingMaterial.letter;
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      return readingMaterial.text;
    } else if (type === 'word' && isWords(readingMaterial)) {
      return readingMaterial.contrasts[0].words[0];
    }
    return '';
  }, [readingMaterial, type]);

  const targetText = getTargetText();

  const getTitle = useCallback((): string => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      return `Alphabet - ${readingMaterial.letter}`;
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      return readingMaterial.title;
    } else if (type === 'word' && isWords(readingMaterial)) {
      return `Words for ${readingMaterial.letter}`;
    }
    return 'Unknown';
  }, [readingMaterial, type]);

  const passageWordCount = useMemo(() => {
    if (type === 'passage' && isPassage(readingMaterial)) {
      return readingMaterial.text.trim().split(/\s+/).length;
    }
    return 0;
  }, [readingMaterial, type]);

  useEffect(() => {
    checkPermission();
    initializeAudio();
    if (type === 'passage' && isPassage(readingMaterial)) {
      setTotalWords(passageWordCount);
    }
  }, [checkPermission, initializeAudio, type, readingMaterial, passageWordCount]);

  const isTextPerfect = useCallback((spoken: string, target: string): boolean => {
    const cleanSpoken = spoken.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const cleanTarget = target.replace(/[^a-zA-Z]/g, '').toLowerCase();
    return cleanSpoken === cleanTarget;
  }, []);

  const displayFeedbackModal = useCallback((
    accuracyNum: number,
    isAlphabetAndWordMode: boolean,
    isCorrect?: boolean,
  ) => {
    setHasShownModalForCurrentAttempt(false);
    let modalType: 'congratulations' | 'tryAgain' | 'passageSuccess' | 'goodJob';
    if (isAlphabetAndWordMode) {
      modalType = isCorrect ? 'congratulations' : 'tryAgain';
    } else {
      if (accuracyNum >= 90) modalType = 'passageSuccess';
      else if (accuracyNum >= 50) modalType = 'goodJob';
      else modalType = 'tryAgain';
    }
    setFeedbackModalType(modalType);
    setShowFeedbackModal(true);
    setHasShownModalForCurrentAttempt(true);
  }, []);

  const handleAudioProcessing = useCallback(async (audioFile: string, duration: number) => {
    try {
      const transcription = await transcribeAudio(audioFile, type, targetText);
      setSpokenText(transcription);
      setRecordingDuration(duration);
      analyzeReading(transcription, duration);
      setIsReadingCompleted(true);
    } catch (error) {
      const simulatedResponse = getSimulatedResponse(targetText);
      setSpokenText(simulatedResponse);
      analyzeReading(simulatedResponse, 0);
      setIsReadingCompleted(true);
    }
  }, [transcribeAudio, getSimulatedResponse, targetText]);

  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      try {
        const audioFile = await stopRecording();
        setRecordingDuration(recordTime);
        await handleAudioProcessing(audioFile, recordTime);
      } catch (error) {
        Alert.alert('Error', 'Failed to process recording');
      }
    } else {
      setHasShownModalForCurrentAttempt(false);
      setShowFeedbackModal(false);
      setHasStoredReport(false);
      setHasStoredCorrectAttempt(false);
      await startRecording(targetText);
    }
  }, [isRecording, recordTime, stopRecording, handleAudioProcessing, startRecording, targetText]);

  const convertAccuracyStringToNumber = useCallback((accuracyStr: string): number => {
    const cleanStr = accuracyStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
  }, []);

  const resetAll = useCallback(() => {
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
    setAlreadyCompleted(false);
    setHasCheckedExisting(false);
  }, []);

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      resetAll();
      setCurrentIndex(prev => prev + 1);
    } else {
      // Last item - Finish
      handleBackStep();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      resetAll();
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const checkIfAlreadyCompleted = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        if (type === 'alphabet' && isAlphabet(readingMaterial)) {
          const existing = await MiscueReportController.hasAlphabetBeenCompleted(user.uid, readingMaterial.letter);
          if (existing) setAlreadyCompleted(true);
        } else if (type === 'word' && isWords(readingMaterial)) {
          const targetWord = getTargetText();
          const existing = await MiscueReportController.hasWordBeenCompleted(user.uid, readingMaterial.letter, targetWord);
          if (existing) setAlreadyCompleted(true);
        }
      } catch (error) {
        console.error('Failed to check existing completion:', error);
      } finally {
        setHasCheckedExisting(true);
      }
    };
    checkIfAlreadyCompleted();
  }, [type, readingMaterial, getTargetText]);

  const analyzeReading = async (transcription: string, duration: number) => {
    let accuracyNum = 0;
    let isWordAlphabetCorrect = false;

    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      const result = MiscueAnalysisService.checkAlphabetPhonemeAccuracy(readingMaterial.letter, transcription);
      accuracyNum = convertAccuracyStringToNumber(result.accuracy);
      isWordAlphabetCorrect = accuracyNum === 100;
      setIsCorrectAttempt(result.isCorrect);
      setAccuracyString(result.accuracy);
      setFeedback(result.feedback);
      setMiscues([]);
      if (result.isCorrect && !hasStoredCorrectAttempt && !alreadyCompleted) {
        try {
          await MiscueReportController.storeAlphabetCorrectAttempt(readingMaterial.letter);
          setHasStoredCorrectAttempt(true);
          setAlreadyCompleted(true);
        } catch (error) {
          console.error('Failed to store alphabet attempt:', error);
        }
      }
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      const detectedMiscues = MiscueAnalysisService.detectMiscues(readingMaterial.text, transcription);
      const calculatedAccuracy = MiscueAnalysisService.calculateAccuracy(readingMaterial.text, transcription);
      const accuracyFeedback = MiscueAnalysisService.getAccuracyFeedback(calculatedAccuracy);
      setMiscues(detectedMiscues);
      setAccuracyString(calculatedAccuracy);
      setFeedback(accuracyFeedback);
      accuracyNum = convertAccuracyStringToNumber(calculatedAccuracy);
      const wpm = Math.round((totalWords / duration) * 60);
      if (!hasStoredReport) storeMiscueReport(accuracyNum, duration, detectedMiscues, wpm);
    } else if (type === 'word' && isWords(readingMaterial)) {
      const targetWord = getTargetText();
      const correct = isTextPerfect(transcription, targetWord);
      accuracyNum = correct ? 100 : 0;
      isWordAlphabetCorrect = correct;
      const result = MiscueAnalysisService.checkWordAccuracy(getTargetText(), transcription);
      setIsCorrectAttempt(result.isCorrect);
      setAccuracyString(result.accuracy);
      setFeedback(correct ? 'Excellent!' : 'Keep practicing.');
      if (result.isCorrect && !hasStoredCorrectAttempt && !alreadyCompleted) {
        try {
          await MiscueReportController.storeWordCorrectAttempt(readingMaterial.letter, targetWord);
          setHasStoredCorrectAttempt(true);
          setAlreadyCompleted(true);
        } catch (error) {
          console.error('Failed to store word attempt:', error);
        }
      }
    }

    if (!hasShownModalForCurrentAttempt) {
      setTimeout(() => {
        displayFeedbackModal(accuracyNum, type === 'alphabet' || type === 'word', isWordAlphabetCorrect);
      }, 500);
    }
  };

  const storeMiscueReport = useCallback(async (accuracyNum: number, duration: number, miscues: Miscue[], wpm: number) => {
    try {
      if (hasStoredReport) return;
      if (!spokenText || spokenText.trim() === '' || duration < 1 || wpm <= 0) return;
      const mins = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${mins}:${seconds.toString().padStart(2, '0')}`;
      await MiscueReportController.storeReport(getTitle(), miscues, accuracyNum, wpm, totalWords, formattedDuration);
      setHasStoredReport(true);
    } catch (error: any) {
      console.error('Failed to store report:', error);
    }
  }, [hasStoredReport, spokenText, getTitle, totalWords]);

  const handleFeedbackModalClose = useCallback(() => setShowFeedbackModal(false), []);

  return (
    <SafeAreaView style={readingStyles.container}>
      <View style={readingStyles.insideContainer}>
        {/* Bubble Decorations */}
        <View style={bubbles.bubblesContainer}>
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>

        <ReadingHeader onBack={handleBackStep} onLogout={handleLogout} />

        <View style={readingStyles.activityContentWrapper}>
          <BounceIn key={currentIndex}>
            <PassageDisplay
              material={readingMaterial}
              type={type}
              spokenText={spokenText}
              isRecording={isRecording}
              miscues={miscues}
              isCompleted={isReadingCompleted && isCorrectAttempt}
            />
          </BounceIn>

          {/* Progress Dots below card */}
          {items.length > 1 && (
            <View style={readingStyles.progressDotsContainer}>
              {items.map((_, index) => {
                const dotColor = type === 'word' ? ACCENT_COLORS[index % ACCENT_COLORS.length] : undefined;
                return (
                  <View 
                    key={index} 
                    style={[
                      readingStyles.progressDot,
                      dotColor ? { backgroundColor: dotColor, opacity: 0.2 } : null,
                      currentIndex === index && readingStyles.progressDotActive,
                      currentIndex === index && dotColor ? { backgroundColor: dotColor, opacity: 1 } : null
                    ]} 
                  />
                );
              })}
            </View>
          )}

          {isLoading && (
            <View style={readingStyles.loadingContainer}>
              <Text style={readingStyles.loadingText}>Inaayos ang iyong record...</Text>
            </View>
          )}

          {!isLoading && isReadingCompleted && (type !== 'alphabet' || !isCorrectAttempt) && (
            <FeedbackResult
              targetText={targetText}
              spokenText={spokenText}
              miscues={miscues}
              onTryAgain={resetAll}
              type={type}
              accuracy={accuracyString}
              feedback={feedback}
              isTextCorrect={isCorrectAttempt}
            />
          )}
        </View>

        {/* Stable Footer Controls - Lifted */}
        <View style={[
          readingStyles.footerControls,
          (type === 'passage' || type === 'alphabet') && { justifyContent: 'center' }
        ]}>
          {(type !== 'passage' && type !== 'alphabet') && (
            <NavArrow 
              direction="left" 
              disabled={currentIndex === 0 || isRecording} 
              onPress={handlePrevious} 
            />
          )}

          {!isReadingCompleted && (
            <RecordingControls
              isRecording={isRecording}
              isLoading={isLoading}
              hasPermission={hasPermission}
              onRecordToggle={handleRecordToggle}
            />
          )}

          {(type !== 'passage' && type !== 'alphabet') && (
            <NavArrow 
              direction="right" 
              isFinish={currentIndex === items.length - 1} 
              disabled={isRecording}
              onPress={handleNext} 
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
