import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  RootStackParamList,
  useNavigationHelper,
} from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import readingStyles from '../../UI_Designs/ReadingActivityStyles';

import auth from '@react-native-firebase/auth';
import { BounceIn } from '../../Components/GlobalUse/Animations';
import { ReadingHeader } from '../../Components/Student/Reading/ReadingHeader';
import { RecordingControls } from '../../Components/Student/Reading/RecordingControls';
import { PassageDisplay } from '../../Components/Student/Reading/TextDisplay';
import { useAudioRecording } from '../../Controller/AudioRecordingController';
import { MiscueAnalysisService } from '../../Controller/MiscueAnalysisServiceController';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { uploadRecording, UploadMetadata } from '../../Controller/DriveUploadController';
import { useSpeechToText } from '../../Controller/Speech2TextServiceController';
import { Miscue } from '../../Interfaces/miscue';
import { isAlphabet, isPassage, isWords } from '../../Interfaces/passage';
import { ACCENT_COLORS } from '../../Utilities/Theme';
import { transcribeAudio as transcribeAudioAPI } from '../../../api';

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
        colors={['#ffffff', '#eaf2f8']}
        style={{ width: '100%', height: '100%', borderRadius: 28, justifyContent: 'center', alignItems: 'center' }}
      >
        <ChevronIcon direction={direction} color="#3d71d9" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Custom animated wave component for loading state
const WaveLoading = () => {
  const [dotText, setDotText] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDotText((prev) => (prev.length < 3 ? prev + '.' : '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
      {/* 
        You can replace this text-based wave with a true animated pulsing set of elements
        but using these textual waves gives a nice lightweight effect that matches 'wave' 
      */}
      <Text style={{ fontSize: 24, letterSpacing: 3, color: '#3d71d9', fontWeight: 'bold' }}>~</Text>
      <Text style={{ fontSize: 24, letterSpacing: 3, color: '#5dade2', fontWeight: 'bold' }}>~</Text>
      <Text style={{ fontSize: 24, letterSpacing: 3, color: '#3d71d9', fontWeight: 'bold' }}>~</Text>
      <Text style={{ fontSize: 24, letterSpacing: 3, color: '#3d71d9', fontWeight: 'bold' }}>~</Text>
      <Text style={{ fontSize: 24, letterSpacing: 3, color: '#5dade2', fontWeight: 'bold' }}>~</Text>
      <Text style={{ fontSize: 24, letterSpacing: 3, color: '#3d71d9', fontWeight: 'bold' }}>~</Text>
    </View>
  );
};

// Retry button using same size/spot as microphone
const RetryButton = ({ onPress }: { onPress: () => void }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: 180 }}>
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#3d71d9', '#2a50a1']}
        style={readingStyles.microphone}
      >
        <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C14.5113 4 16.756 5.1554 18.2361 6.9583"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <Path
            d="M14 7H19V2"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

export default function ReadingActivityScreenPage() {
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const [totalWords, setTotalWords] = useState(0);


  const [isTranscribing, setIsTranscribing] = useState(false);
  const [finalTagalogText, setFinalTagalogText] = useState('');

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
      // Use the actual word being read (e.g. "sa", "ama") not the lesson letter ("A")
      const actualWord = readingMaterial.contrasts[0]?.words[0] || readingMaterial.letter;
      return `Words for ${actualWord}`;
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
    } else {
      setTotalWords(1);
    }

  }, [checkPermission, initializeAudio, type, readingMaterial, passageWordCount]);

  const isTextPerfect = useCallback((spoken: string, target: string): boolean => {
    const cleanSpoken = spoken.toLowerCase().replace(/[^a-zñ0-9]/g, '').trim();
    const cleanTarget = target.toLowerCase().replace(/[^a-zñ0-9]/g, '').trim();
    return cleanSpoken === cleanTarget;
  }, []);







  const convertAccuracyStringToNumber = useCallback((accuracyStr: string): number => {
    const cleanStr = accuracyStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
  }, []);

  const resetAll = useCallback(() => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setSpokenText('');


    setMiscues([]);
    setAccuracyString('0');
    setFeedback('');
    setIsReadingCompleted(false);
    setHasShownModalForCurrentAttempt(false);

    setHasStoredReport(false);
    setHasStoredCorrectAttempt(false);
    setIsCorrectAttempt(false);
    setRecordingDuration(0);
    setAlreadyCompleted(false);
    setHasCheckedExisting(false);
    setFinalTagalogText('');
  }, []);

  const handleNext = () => {
    if (type === 'alphabet' || type === 'word') {
      resetAll();
      setCurrentIndex(prev => (prev + 1) % items.length);
    } else {
      if (currentIndex < items.length - 1) {
        resetAll();
        setCurrentIndex(prev => prev + 1);
      } else {
        handleBackStep();
      }
    }
  };

  const handlePrevious = () => {
    if (type === 'alphabet' || type === 'word') {
      resetAll();
      setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
    } else {
      if (currentIndex > 0) {
        resetAll();
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  useEffect(() => {
    const checkIfAlreadyCompleted = async () => {
      try {
        const user = auth().currentUser;
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
    let computedMiscueCount = 0;

    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      const result = MiscueAnalysisService.checkAlphabetPhonemeAccuracy(readingMaterial.letter, transcription);
      accuracyNum = convertAccuracyStringToNumber(result.accuracy);
      isWordAlphabetCorrect = accuracyNum === 100;
      setIsCorrectAttempt(result.isCorrect);
      setAccuracyString(result.accuracy);
      setFeedback(result.feedback);
      setMiscues([]);
      computedMiscueCount = 0;
      if (result.isCorrect && !hasStoredCorrectAttempt && !alreadyCompleted) {
        try {
          await MiscueReportController.storeAlphabetCorrectAttempt(readingMaterial.letter);
          setHasStoredCorrectAttempt(true);
          setAlreadyCompleted(true);
        } catch (error) {
          console.error('Failed to store alphabet attempt:', error);
        }
      }

      // Store detailed trial report
      if (!hasStoredReport) storeMiscueReport(transcription, accuracyNum, duration, [], 0);
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      const detectedMiscues = MiscueAnalysisService.detectMiscues(readingMaterial.text, transcription);
      const calculatedAccuracy = MiscueAnalysisService.calculateAccuracy(readingMaterial.text, transcription);
      const accuracyFeedback = MiscueAnalysisService.getAccuracyFeedback(calculatedAccuracy);
      setMiscues(detectedMiscues);
      setAccuracyString(calculatedAccuracy);
      setFeedback(accuracyFeedback);
      accuracyNum = convertAccuracyStringToNumber(calculatedAccuracy);
      computedMiscueCount = detectedMiscues.length;
      setIsCorrectAttempt(accuracyNum >= 85);
      const wpm = duration > 0 ? Math.round((totalWords / duration) * 60) : 0;
      if (!hasStoredReport) storeMiscueReport(transcription, accuracyNum, duration, detectedMiscues, wpm);
    } else if (type === 'word' && isWords(readingMaterial)) {
      const targetWord = getTargetText();
      const correct = isTextPerfect(transcription, targetWord);
      accuracyNum = correct ? 100 : 0;
      isWordAlphabetCorrect = correct;
      const result = MiscueAnalysisService.checkWordAccuracy(getTargetText(), transcription);
      setIsCorrectAttempt(result.isCorrect);
      setAccuracyString(result.accuracy);
      setFeedback(correct ? 'Excellent!' : 'Keep practicing.');
      computedMiscueCount = 0;
      if (result.isCorrect && !hasStoredCorrectAttempt && !alreadyCompleted) {
        try {
          await MiscueReportController.storeWordCorrectAttempt(readingMaterial.letter, targetWord);
          setHasStoredCorrectAttempt(true);
          setAlreadyCompleted(true);
        } catch (error) {
          console.error('Failed to store word attempt:', error);
        }
      }

      // Store detailed trial report
      if (!hasStoredReport) storeMiscueReport(transcription, accuracyNum, duration, [], 0);
    }

    return { accuracyNum, computedMiscueCount };
  };

  // Use a ref to always call the latest analyzeReading (avoids stale closure)
  const analyzeReadingRef = useRef(analyzeReading);
  useEffect(() => {
    analyzeReadingRef.current = analyzeReading;
  });

  const handleAudioProcessing = useCallback(async (audioFile: string, duration: number) => {
    setIsTranscribing(true);
    setFinalTagalogText('');
    try {
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );
      
      const transcription = await Promise.race([
        transcribeAudioAPI(audioFile),
        timeoutPromise,
      ]);
      
      setFinalTagalogText(transcription);
      setSpokenText(transcription);
      setRecordingDuration(duration);
      await analyzeReadingRef.current(transcription, duration);
      setIsReadingCompleted(true);
    } catch (error) {
      console.error('Audio processing error:', error);
      const simulatedResponse = getSimulatedResponse(targetText);
      setSpokenText(simulatedResponse);
        try {
          await analyzeReadingRef.current(simulatedResponse, duration);
        } catch (e) {
          console.error('Fallback analysis error:', e);
        }
      setIsReadingCompleted(true);
    }
    }, [targetText, getSimulatedResponse, analyzeReadingRef, transcribeAudioAPI, getSimulatedResponse, setIsTranscribing, setFinalTagalogText, setSpokenText, analyzeReadingRef, setIsReadingCompleted]);

  const handleRetry = () => {
    setIsReadingCompleted(false);
    setIsCorrectAttempt(false);
    setAccuracyString('0%');
    setMiscues([]);
    setFeedback('');
    resetAll();
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      setIsTranscribing(true);
      const audioFile = await stopRecording();
      const startTime = Date.now();
      try {
        const transcription = await transcribeAudioAPI(audioFile);
        const duration = (Date.now() - startTime) / 1000;
        const result = await analyzeReading(transcription, duration);

        // Build metadata and upload recording
        let metadata: UploadMetadata;
        if (type === 'alphabet' && isAlphabet(readingMaterial)) {
          metadata = {
            kind: 'alphabet',
            letter: readingMaterial.letter,
            miscueCount: result.computedMiscueCount,
            accuracyRate: result.accuracyNum,
          };
        } else if (type === 'passage' && isPassage(readingMaterial)) {
          metadata = {
            kind: 'passage',
            passageTitle: readingMaterial.title,
            miscueCount: result.computedMiscueCount,
            accuracyRate: result.accuracyNum,
          };
} else if (type === 'word' && isWords(readingMaterial)) {
           // For words, derive chapterId from letter position in alphabet or use 0
           const letterToChapter: Record<string, number> = {
             'M': 1, 'S': 2, 'A': 3, 'Ang': 4, 'I': 5, 'O': 6, 'Ay': 7, 'E': 8, 'U': 9,
             'B': 10, 'T': 11, 'K': 12, 'L': 13, 'Y': 14, 'Mga': 15, 'N': 16, 'G': 17,
             'R': 18, 'P': 19, 'Ng': 20, 'D': 21, 'H': 22, 'W': 23, '-ng': 24, 'ng-': 25,
           };
           metadata = {
             kind: 'word',
             chapterId: letterToChapter[readingMaterial.letter] ?? 0,
             lessonId: 0,
             targetWord: getTargetText(),
             miscueCount: result.computedMiscueCount,
             accuracyRate: result.accuracyNum,
           };
         } else {
          metadata = {
            kind: 'alphabet',
            letter: '',
            miscueCount: 0,
            accuracyRate: 0,
          };
        }

        try {
          await uploadRecording(audioFile, metadata);
        } catch (uploadError) {
          console.error('Recording upload failed:', uploadError);
        }

        setIsReadingCompleted(true);
      } catch (error) {
        console.error('Transcription failed:', error);
        Alert.alert('Mali', 'Hindi maiproseso ang iyong boses. Pakisubukan muli.');
      } finally {
        setIsTranscribing(false);
      }
    } else {
      setFeedback('');
      setIsReadingCompleted(false);
      startRecording(getTargetText());
    }
  };

  const storeMiscueReport = useCallback(async (transcriptionText: string, accuracyNum: number, duration: number, miscues: Miscue[], wpm: number) => {
    try {
      if (hasStoredReport) return;
      if (!transcriptionText || transcriptionText.trim() === '') return;
      if (type === 'passage' && wpm <= 0) return;

      const mins = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${mins}:${seconds.toString().padStart(2, '0')}`;
      await MiscueReportController.storeReport(getTitle(), miscues, accuracyNum, wpm, totalWords, formattedDuration);
      setHasStoredReport(true);
    } catch (error: any) {
      console.error('Failed to store report:', error);
    }
  }, [hasStoredReport, spokenText, getTitle, totalWords]);

  const handleFeedbackModalClose = useCallback(() => {}, []);


  return (
    <SafeAreaView style={readingStyles.container}>
      <ScrollView style={readingStyles.insideContainer} contentContainerStyle={readingStyles.insideScrollContent} showsVerticalScrollIndicator={false}>
        {/* Bubble Decorations */}
        <View style={bubbles.bubblesContainer}>
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>

        <ReadingHeader onBack={handleBackStep} onLogout={handleLogout} />

        <View style={[readingStyles.activityContentWrapper, type === 'passage' && { marginTop: 30, gap: 12 }]}>
          <BounceIn key={currentIndex}>
            <PassageDisplay
              material={readingMaterial}
              type={type}
              spokenText={spokenText}
              isRecording={isRecording}
              miscues={miscues}
              isCompleted={isReadingCompleted}
              isCorrect={isCorrectAttempt}
            />
          </BounceIn>

          {/* Progress Dots below card */}
          {items.length > 1 && (
            <View style={readingStyles.progressDotsContainer}>
              {items.map((_, index) => (
                <View
                  key={index}
                  style={[
                    readingStyles.progressDot,
                    currentIndex === index && readingStyles.progressDotActive
                  ]}
                />
              ))}
            </View>
          )}



<View style={S.statusReserved}>
            {(isLoading || isTranscribing) && (
              <View style={S.miniStatus}>
                <ActivityIndicator size="small" color="#3d71d9" />
                <Text style={S.miniStatusText}>{isTranscribing ? 'Sinusuri...' : 'Nakikinig...'}</Text>
              </View>
            )}

            {isReadingCompleted && !isLoading && !isTranscribing && (
              <>
                <BounceIn style={S.feedbackBox}>
                  <Text style={[S.feedbackText, isCorrectAttempt ? { color: '#3d71d9' } : { color: '#eb5c6c' }]}>
                    {(() => {
                      const acc = convertAccuracyStringToNumber(accuracyString);
                      if (acc === 100) return 'Napakahusay!';
                      if (acc >= 90) return 'Magaling!';
                      if (acc >= 85) return 'Mahusay!';
                      return 'Subukan muli...';
                    })()}
                  </Text>
                </BounceIn>

                {type === 'passage' && miscues.length > 0 && (
                  <BounceIn delay={200} style={S.miscueReportContainerNew}>
                    <Text style={S.miscueReportTitle}>Mga Uri ng Pagkakamali</Text>
                    <View style={{ width: '100%' }}>
                      {(() => {
                        const typeCounts = {
                          omission: miscues.filter(m => m.type === 'omission').length,
                          substitution: miscues.filter(m => m.type === 'substitution').length,
                          insertion: miscues.filter(m => m.type === 'insertion').length,
                          repetition: miscues.filter(m => m.type === 'repetition').length,
                        };
                        const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);
                        const max = Math.max(...Object.values(typeCounts), 1);
                        const colors = {
                          omission: { bar: '#f39c12', bg: '#FFF3E0', label: 'Pagkakaltas' },
                          substitution: { bar: '#eb5c6c', bg: '#FFEBEE', label: 'Pagpapalit' },
                          insertion: { bar: '#3498db', bg: '#E3F2FD', label: 'Pagdaragdag' },
                          repetition: { bar: '#9b59b6', bg: '#F3E5F5', label: 'Pag-uulit' },
                        };
                        return Object.entries(typeCounts).filter(([_, count]) => count > 0).map(([type, count]) => {
                          const pct = (count / max) * 100;
                          const c = colors[type as keyof typeof colors];
                          const typeMiscues = miscues.filter(m => m.type === type);
                          return (
                            <View key={type} style={S.miscueBarRow}>
                              <View style={S.miscueBarHeader}>
                                <View style={[S.miscueBarDot, { backgroundColor: c.bar }]} />
                                <Text style={S.miscueBarLabel}>{c.label}</Text>
                                <Text style={S.miscueBarPct}>{total > 0 ? Math.round((count / total) * 100) : 0}%</Text>
                              </View>
                              <View style={S.miscueBarTrackContainer}>
                                <View style={[S.miscueBarTrack, { backgroundColor: c.bg }]}>
                                  <View style={[S.miscueBarFill, { width: `${pct}%`, backgroundColor: c.bar }]} />
                                </View>
                                <Text style={[S.miscueBarCount, { color: c.bar }]}>{count}</Text>
                              </View>
                              {/* Show specific words for this miscue type */}
                              <View style={S.miscueWordsContainer}>
                                {typeMiscues.map((m, i) => (
                                  <Text key={i} style={S.miscueWordText}>
                                    {type === 'omission' && `"${m.expected}"`}
                                    {type === 'substitution' && `"${m.expected}" → "${m.spoken}"`}
                                    {type === 'insertion' && `"${m.spoken}"`}
                                    {type === 'repetition' && `"${m.expected}"`}
                                  </Text>
                                ))}
                              </View>
                            </View>
                          );
                        });
                      })()}
                    </View>
                  </BounceIn>
                )}

                <BounceIn delay={400} style={S.actionButtonsContainer}>
                  <TouchableOpacity style={S.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
                    <Text style={S.retryBtnText}>Muling Subukan</Text>
                  </TouchableOpacity>
                  
                  {type === 'passage' && (
                    <TouchableOpacity style={S.backToLessonBtn} onPress={handleBackStep} activeOpacity={0.8}>
                      <Text style={S.backToLessonBtnText}>Bumalik sa Aralin</Text>
                    </TouchableOpacity>
                  )}
                </BounceIn>
              </>
            )}
          </View>
        </View>
        </ScrollView>

        {/* Stable Footer Controls - Lifted */}
        <View style={[
          readingStyles.footerControls,
          (type === 'passage' || items.length <= 1) && { justifyContent: 'center' },
          type === 'passage' && { bottom: 60 }
        ]}>
          {(type !== 'passage' && items.length > 1) && (
            <NavArrow
              direction="left"
              disabled={currentIndex === 0 || isRecording}
              onPress={handlePrevious}
            />
          )}

          {!isReadingCompleted && (
            <RecordingControls
              isRecording={isRecording}
              isLoading={isLoading || isTranscribing}
              hasPermission={hasPermission}
              onRecordToggle={handleRecordToggle}
            />
          )}

          {(type !== 'passage' && items.length > 1) && (
            <NavArrow
              direction="right"
              isFinish={currentIndex === items.length - 1}
              disabled={isRecording}
              onPress={handleNext}
            />
          )}
        </View>
    </SafeAreaView>


  );
}

const S = StyleSheet.create({
  statusReserved: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', width: '100%' },
  feedbackBox: { alignItems: 'center' },
  feedbackIconBox: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  checkCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#3d71d9', justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  maliCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#eb5c6c', justifyContent: 'center', alignItems: 'center' },
  maliX: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  feedbackText: { fontSize: 18, fontWeight: '900', letterSpacing: 0.3, fontFamily: 'Andika-Bold' },
  accuracySub: { fontSize: 14, fontWeight: '700', color: '#859dab', marginTop: 4, fontFamily: 'Andika-Regular' },
  miniStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  miniStatusText: { fontSize: 14, fontWeight: '700', color: '#859dab', fontFamily: 'Andika-Bold' },

  miscueReportContainer: {
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d6eaf8',
    width: '95%',
    shadowColor: '#154360',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  miscueReportTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#859dab',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Andika-Bold',
  },
  miscueReportContainerNew: {
    alignItems: 'flex-start',
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d6eaf8',
    width: '95%',
    shadowColor: '#154360',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  miscueBarRow: {
    width: '100%',
    gap: 4,
    marginBottom: 8,
  },
  miscueBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miscueBarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miscueBarLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1c2833',
    fontFamily: 'Andika-Regular',
  },
  miscueBarPct: {
    fontSize: 12,
    fontWeight: '800',
    color: '#859dab',
    fontFamily: 'Andika-Regular',
  },
  miscueBarTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
  },
  miscueBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  miscueBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  miscueBarCount: {
    minWidth: 28,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
    fontFamily: 'Andika-Bold',
  },
  miscueWordsContainer: {
    paddingLeft: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  miscueWordText: {
    fontSize: 11,
    color: '#859dab',
    fontFamily: 'Andika-Regular',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  miscueTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  miscueTypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  miscueTypeChipText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Andika-Bold',
  },
  actionButtonsContainer: {
    marginTop: 20,
    width: '95%',
    gap: 12,
  },
  retryBtn: {
    backgroundColor: '#3d71d9',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#3d71d9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Andika-Bold',
  },
  backToLessonBtn: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3d71d9',
  },
  backToLessonBtnText: {
    color: '#3d71d9',
    fontSize: 16,
    fontFamily: 'Andika-Bold',
  },
});
