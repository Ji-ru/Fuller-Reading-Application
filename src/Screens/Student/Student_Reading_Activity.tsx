// This screen uses React hooks (useState, useEffect) to manage UI state and side effects.
// Firebase usage is up-to-date for React Native Firebase v22 (auth().currentUser for user, all Firestore via controller-services).
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert, TouchableOpacity, ImageBackground, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Modal, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import {
  RootStackParamList,
  useNavigationHelper,
} from '../../Controller/NavigationController';
import readingStyles from '../../UI_Designs/ReadingActivityStyles';

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
import { getAuth } from '@react-native-firebase/auth';
import { makeTodayKey } from '../../Utilities/currentDateUtils';
import { getPassageImage } from '../../Utilities/ReadingAssets';
import { useGlobalMusic } from '../../Components/GlobalUse/Background/GlobalMusicContext';

type ReadingActivityScreenRouteProp = RouteProp<
  RootStackParamList,
  'ReadingActivity'
>;

export default function ReadingActivityScreenPage() {
  // Ref: Store a retry timeout id for feedback modal
  const route = useRoute<ReadingActivityScreenRouteProp>();
  const { readingMaterial, type, wordContext } = route.params;

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

  // State for storing Alphabet Sessions 
  const alphabetSessionIdRef = useRef<string | null>(null);
  const attemptedSetRef = useRef(new Set<string>());
  const correctSetRef = useRef(new Set<string>());
  const incorrectSetRef = useRef(new Set<string>());
  const sessionDateKeyRef = useRef<string | null>(null);

  // State for storing Word Sessions 
  const wordSessionIdRef = useRef<string | null>(null);
  const wordAttemptedSetRef = useRef(new Set<string>()); // prevents retry inflation
  const correctWordSetRef = useRef(new Set<string>());
  const incorrectWordSetRef = useRef(new Set<string>());

  // State for scroll hint
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const resultScrollViewRef = useRef<ScrollView | null>(null);

  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (scrollViewHeight > 0 && contentHeight > scrollViewHeight + 20) {
      setShowScrollHint(true);
    } else {
      setShowScrollHint(false);
    }
  }, [scrollViewHeight, contentHeight]);

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

  const { isLoading, getSimulatedResponse, processAudioWithAssemblyAI, processAudioWithDeepgram, sttErrorVisible, sttErrorMessage, clearSttError } = useSpeechToText();

  // Access Global Music Context
  const { playMusic, pauseMusic } = useGlobalMusic();

  const handleScrollHintPress = useCallback(() => {
    resultScrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  // Navigation
  const { handleLogout, handleBackStep } = useNavigationHelper();

  const ensureAlphabetDailySession = useCallback(async () => {
    if (type !== 'alphabet') return null;

    const todayKey = makeTodayKey();

    // clear if date rollover (your existing logic)
    if (sessionDateKeyRef.current && sessionDateKeyRef.current !== todayKey) {
      attemptedSetRef.current.clear();
      correctSetRef.current.clear();
      incorrectSetRef.current.clear();
    }

    sessionDateKeyRef.current = todayKey;

    const sessionId = await MiscueReportController.startAlphabetSession();

    // NEW: if the doc id changed, reset in-memory sets
    if (alphabetSessionIdRef.current && alphabetSessionIdRef.current !== sessionId) {
      attemptedSetRef.current.clear();
      correctSetRef.current.clear();
      incorrectSetRef.current.clear();
    }

    alphabetSessionIdRef.current = sessionId;
    return sessionId;
  }, [type]);

  /**
   * Returns the reading target text based on the type (alphabet, passage, or word).
   * - Alphabet: returns letter
   * - Passage: returns whole passage text
   * - Word: returns the first word in contrasts
   */
  const getTargetText = useCallback((): string => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      return readingMaterial.letter;
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      return readingMaterial.text;
    } else if (type === 'word' && isWords(readingMaterial)) {
      // return readingMaterial.contrasts.flatMap(contrast => contrast.words).join(' ');
      return readingMaterial.contrasts[0].words[0];
    }
    return '';
  }, [readingMaterial, type]);

  const targetText = getTargetText();

  /**
   * Generates a human-readable title for storage/reporting based on the reading type and material.
   * @returns {string} Report title
   */
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



  // useMemo: Memoize word count calculation for performance
  const passageWordCount = useMemo(() => {
    if (type === 'passage' && isPassage(readingMaterial)) {
      return readingMaterial.text.trim().split(/\s+/).length;
    }
    return 0;
  }, [readingMaterial, type]);

  /**
   * Effects to mount or initialize the permission and audio recording
   */
  useEffect(() => {
    checkPermission();
    initializeAudio();

    // Use memoized word count for passages
    if (type === 'passage' && isPassage(readingMaterial)) {
      setTotalWords(passageWordCount);
    }
  }, [checkPermission, initializeAudio, type, readingMaterial, passageWordCount]);

  /**
   * APPLICABLE TO ONLY FOR ALPHABET AND WORD 
   * 
   * Checks if the spoken text matches the target perfectly (alphabet or word).
   * Ignores non-letter characters and is case insensitive.
   * @param spoken - The spoken/transcribed text
   * @param target - The target letter/word
   * @returns {boolean} Whether the spoken text perfectly matches the target
   */
  const isTextPerfect = useCallback((spoken: string, target: string): boolean => {
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
  }, []);


  /**
   * Opens the feedback modal with the appropriate message and modal type,
   * depending on reading accuracy and mode (alphabet, word, or passage).
   * @param accuracyNum - Numeric accuracy (0-100)
   * @param isAlphabetAndWordMode - True for alphabet or word mode
   * @param isCorrect - (Optional) Whether the attempt was correct
   */
  const displayFeedbackModal = useCallback((
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
  }, []);

  /**
   * Processes recorded audio by transcribing with Google or fallback to a simulated response.
   * Updates states and triggers analysis and UI changes.
   * @param audioFile - Path to the recorded audio file
   * @param duration - Duration of the recording (seconds)
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAudioProcessing = useCallback(async (audioFile: string, duration: number) => {
    try {
      if (!audioFile) {
        throw new Error('No audio file provided');
      }
      // const transcription = await processAudioWithGoogle(audioFile);
      // const transcription = await processAudioWithAssemblyAI(audioFile);
      const transcription = await processAudioWithDeepgram(audioFile);
      setSpokenText(transcription);
      console.log('THIS IS THE SPOKEN: ' + transcription);

      // Also update the state for display if needed
      setRecordingDuration(duration);

      await analyzeReading(transcription, duration);
      setIsReadingCompleted(true);
    } catch (error) {
      // Fallback on error: 0% accuracy instead of 100% simulated response
      console.log('Audio processing failed, falling back to 0%', error);
      setSpokenText('');
      setRecordingDuration(duration);
      // Send an empty string to trigger 0% accuracy analysis
      await analyzeReading('', duration);
      setIsReadingCompleted(true);
    }
    // Note: analyzeReading is defined later in the component but used here
  }, [getSimulatedResponse, targetText, processAudioWithDeepgram]);

  /**
   * Handles the record/play toggle for recording user speech:
   * - Stops recording and processes audio
   * - Starts a new recording otherwise
   */
  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      try {
        const currentRecordTime = recordTime;
        const audioFile = await stopRecording();

        // Set Recording Duration
        setRecordingDuration(currentRecordTime);

        await handleAudioProcessing(audioFile, currentRecordTime);
      } catch (error) {
        console.warn('Failed to stop recording cleanly, applying fallback', error);
        await handleAudioProcessing('', recordTime);
      }
    } else {
      // Reset modal state for new recording
      setHasShownModalForCurrentAttempt(false);
      setShowFeedbackModal(false);
      setHasStoredReport(false); // Reset for new attempts
      setHasStoredCorrectAttempt(false); // Reset storage flag for new attempt

      if (type === 'alphabet') {
        await ensureAlphabetDailySession(); // prevents race
      }
      if (type === 'word') {
        if (!wordSessionIdRef.current) {
          wordSessionIdRef.current = await MiscueReportController.startWordSession();
          wordAttemptedSetRef.current.clear();
        }
      }

      // Pause Global Music while recording and analyzing
      pauseMusic();

      await startRecording(targetText);
    }
  }, [isRecording, recordTime, stopRecording, handleAudioProcessing, startRecording, targetText, type, ensureAlphabetDailySession, pauseMusic]);

  /**
   * Calculates the Words Per Minute (WPM) given transcribed speech and duration in seconds.
   * @param spokenText - User's spoken text
   * @param durationSeconds - Duration in seconds
   * @returns {number} Words per minute
   */
  const calculateWordsPerMin = useCallback((
    totalWords: number,
    durationSeconds: number,
  ): number => {
    if (totalWords <= 0 || durationSeconds <= 0) return 0;

    const minutes = durationSeconds / 60;
    return Math.round(totalWords / minutes);
  }, []);

  /**
   * Helper to convert an accuracy string (e.g. "85.5%") to a clamped number (0-100).
   * @param accuracyStr - String containing accuracy value, possibly with '%'
   * @returns {number} Numeric accuracy value (0-100)
   */
  const convertAccuracyStringToNumber = useCallback((accuracyStr: string): number => {
    // Remove any non-numeric characters except decimal point
    const cleanStr = accuracyStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.min(100, Math.max(0, num)); // Clamp 0-100
  }, []);

  const numericAccuracy = useMemo(() => {
    return convertAccuracyStringToNumber(accuracyString);
  }, [accuracyString, convertAccuracyStringToNumber]);

  const handleParentScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

      const reachedBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

      setIsAtBottom(reachedBottom);
    },
    [],
  );

  const handleParentContentSizeChange = useCallback(
    (_width: number, height: number) => {
      // update content height to trigger scroll hint evaluation
      setContentHeight(height);
    },
    [],
  );

  /**
   * Effect: On mount or material/type change, check if the reading item was already completed by the user.
   * Sets state if completed.
   */
  useEffect(() => {
    setAlreadyCompleted(false);
    setHasStoredCorrectAttempt(false);

    const checkIfAlreadyCompleted = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
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
          const existing = await MiscueReportController.hasWordBeenCompleted(
            user.uid,
            wordContext?.chapterId || 0,
            wordContext?.chapterTitle || '',
            wordContext?.lessonId || 0,
            wordContext?.lessonTitle || '',
            targetText,
          );
          if (existing) {
            console.log('Word already completed:', targetText);
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
  }, [type, readingMaterial, getTargetText]);

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
    console.log("This is transcribed alphabet: " + transcription);
    // ALPHABET READING ANALYZATION
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      const sessionId = await ensureAlphabetDailySession();
      const result = MiscueAnalysisService.checkAlphabetPhonemeAccuracy(
        readingMaterial.letter,
        transcription,
      );

      accuracyNum = convertAccuracyStringToNumber(result.accuracy);
      isWordAlphabetCorrect = result.isCorrect;

      setIsCorrectAttempt(result.isCorrect);
      setAccuracyString(result.accuracy);
      setFeedback(result.feedback);
      setMiscues([]);

      // Store correct alphabet attempt ONLY if correct AND not already stored
      if (result.isCorrect && !hasStoredCorrectAttempt) {
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
      }

      // Checks the session, then record the reading attempt
      if (sessionId) {
        const letter = readingMaterial.letter.toUpperCase();
        const attempted = attemptedSetRef.current;
        const correct = correctSetRef.current;
        const incorrect = incorrectSetRef.current;

        const firstAttempt = !attempted.has(letter);
        if (firstAttempt) attempted.add(letter);

        if (result.isCorrect) {
          const firstCorrect = !correct.has(letter);
          const wasIncorrect = incorrect.has(letter);

          correct.add(letter);
          incorrect.delete(letter);

          await MiscueReportController.recordAlphabetAttempt(sessionId, letter, {
            incAttempted: firstAttempt,
            incCorrect: firstCorrect,
            addCorrect: firstCorrect,
            removeIncorrect: wasIncorrect,
          });
        } else {
          if (!correct.has(letter)) {
            const firstIncorrect = !incorrect.has(letter);
            incorrect.add(letter);

            await MiscueReportController.recordAlphabetAttempt(sessionId, letter, {
              incAttempted: firstAttempt,
              addIncorrect: firstIncorrect,
            });
          } else if (firstAttempt) {
            await MiscueReportController.recordAlphabetAttempt(sessionId, letter, {
              incAttempted: true,
            });
          }
        }
      }
    }

    // PASSAGE READING ANALYZATION AND DATABASE STORING
    else if (type === 'passage' && isPassage(readingMaterial)) {
      // Passage miscue detection
      const detectedMiscues = MiscueAnalysisService.detectMiscues(
        readingMaterial.text,
        transcription,
      );
      console.log('This is detected miscues: ' + detectedMiscues);

      // Calculate accuracy
      const calculatedAccuracy = MiscueAnalysisService.calculateAccuracy(
        readingMaterial.text,
        transcription,
      );
      console.log('This is calculated accuracy: ' + calculatedAccuracy);


      // Accuracy Feedback after calculation
      const accuracyFeedback =
        MiscueAnalysisService.getAccuracyFeedback(calculatedAccuracy);
      console.log('This is accuracy feedback: ' + accuracyFeedback);

      setMiscues(detectedMiscues);
      setAccuracyString(calculatedAccuracy); // String: "85.5"
      setFeedback(accuracyFeedback);

      // Calculate accuracy number for storage
      accuracyNum = convertAccuracyStringToNumber(calculatedAccuracy);
      const wpm = calculateWordsPerMin(totalWords, duration);
      setWordPerMin(wpm);

      console.log('This is WPM: ' + wpm);
      // To avoid duplication it needs to check if it was already stored 
      if (!hasStoredReport) {
        await storeMiscueReport(accuracyNum, duration, detectedMiscues, wpm);
      }
    }

    // WORD READING ANALYZATION AND DATABASE STORING
    else if (type === 'word' && isWords(readingMaterial)) {
      const correct = isTextPerfect(transcription, targetText);

      accuracyNum = correct ? 100 : 0;
      isWordAlphabetCorrect = correct;

      const result = MiscueAnalysisService.checkWordAccuracy(targetText, transcription);

      setIsCorrectAttempt(result.isCorrect);
      setAccuracyString(result.accuracy);
      setFeedback(
        correct
          ? 'Great job! You pronounced the word correctly.'
          : 'Try again. Practice makes perfect.',
      );

      const sessionId =
        wordSessionIdRef.current ?? (await MiscueReportController.startWordSession());
      wordSessionIdRef.current = sessionId;

      const attemptKey = `${wordContext?.chapterId ?? 'ch?'}::${wordContext?.lessonId ?? 'ls?'}::${targetText.toLowerCase()}`;

      const firstAttempt = !wordAttemptedSetRef.current.has(attemptKey);
      if (firstAttempt) wordAttemptedSetRef.current.add(attemptKey);

      const firstCorrect = correct && !correctWordSetRef.current.has(attemptKey);
      if (firstCorrect) correctWordSetRef.current.add(attemptKey);

      const firstIncorrect =
        !correct &&
        !incorrectWordSetRef.current.has(attemptKey) &&
        !correctWordSetRef.current.has(attemptKey); // don’t mark incorrect if already correct
      if (firstIncorrect) incorrectWordSetRef.current.add(attemptKey);

      // --- Attempted (once) + record that this word belongs to the lesson
      if (firstAttempt) {
        await MiscueReportController.recordWordAttempt(
          sessionId,
          {
            chapterId: wordContext?.chapterId || 0,
            chapterTitle: wordContext?.chapterTitle || '',
            lessonId: wordContext?.lessonId || 0,
            lessonTitle: wordContext?.lessonTitle || '',
            targetWord: targetText,
          },
          {
            incAttempted: true,
            addTargetWord: true,
            // if first attempt is incorrect, add incorrect
            addIncorrectWord: firstIncorrect,
          },
        );
      } else if (firstIncorrect) {
        // if you want incorrectWords even when it wasn't the first attempt:
        await MiscueReportController.recordWordAttempt(
          sessionId,
          {
            chapterId: wordContext?.chapterId || 0,
            chapterTitle: wordContext?.chapterTitle || '',
            lessonId: wordContext?.lessonId || 0,
            lessonTitle: wordContext?.lessonTitle || '',
            targetWord: targetText,
          },
          { addIncorrectWord: true },
        );
      }

      // --- Correct (once) + move incorrect -> correct
      if (firstCorrect) {
        await MiscueReportController.recordWordAttempt(
          sessionId,
          {
            chapterId: wordContext?.chapterId || 0,
            chapterTitle: wordContext?.chapterTitle || '',
            lessonId: wordContext?.lessonId || 0,
            lessonTitle: wordContext?.lessonTitle || '',
            targetWord: targetText,
          },
          {
            incCorrect: true,
            addCorrectWord: true,
            removeIncorrectWord: true, // important: “updates everytime it becomes correct”
          },
        );
      }

      // --- Global mastery (wordCompleted)
      if (correct && !hasStoredCorrectAttempt && !alreadyCompleted) {
        await MiscueReportController.storeWordCorrectAttempt(
          wordContext?.chapterId || 0,
          wordContext?.chapterTitle || '',
          wordContext?.lessonId || 0,
          wordContext?.lessonTitle || '',
          targetText,
        );
        setHasStoredCorrectAttempt(true);
        setAlreadyCompleted(true);
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
  const storeMiscueReport = useCallback(async (
    accuracyNum: number,
    duration: number,
    miscues: Miscue[],
    wpm: number,
  ) => {
    try {
      // if this attempt is already stored, stop

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

      setHasStoredReport(true);
    } catch (error: any) {
      throw new Error('Failed to store miscue report: ' + error.message);
    }
  }, [hasStoredReport, spokenText, getTitle, totalWords]);

  /**
   * Handler to reset all reading states (text, miscues, accuracy, modal, etc).
   * Used for retrying the activity cleanly.
   */
  const handleTryAgain = useCallback(() => {
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

    // Play Global Music again when returning to reading screen
    playMusic();
  }, [playMusic]);

  /**
   * Handler to close the feedback modal dialog.
   */
  const handleFeedbackModalClose = useCallback(() => {
    setShowFeedbackModal(false);
  }, []);

  /**
   * Toggles visibility of the screen options/menu.
   */
  const toggleMenu = useCallback(() => {
    setMenuVisible(!menuVisible);
  }, [menuVisible]);

  // Render
  return (
    <SafeAreaView style={readingStyles.container}>
      <ImageBackground
        source={!isReadingCompleted ? isPassage(readingMaterial) ? getPassageImage(readingMaterial.image) : isAlphabet(readingMaterial) ? require('../../../assets/images/RA-Alphabet-Result-bg.png') : isWords(readingMaterial) ? require('../../../assets/images/RA-Word-Result-bg.png') : undefined : require('../../../assets/images/RA-Passage-Result-bg.png')}
        style={readingStyles.bgImage}
        imageStyle={!isReadingCompleted ? readingStyles.backgroundImage : readingStyles.backgroundResultImage}
        resizeMode='cover'
      >
        <ScrollView
          ref={resultScrollViewRef}
          contentContainerStyle={readingStyles.screenScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={handleParentScroll}
          onContentSizeChange={handleParentContentSizeChange}
          onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
          scrollEventThrottle={16}
        >

          <View style={readingStyles.insideContainer}>

            {/* Header */}
            <ReadingHeader
              onBack={handleBackStep}
              onMenuToggle={toggleMenu}
              onLogout={handleLogout}
              menuVisible={menuVisible}
            />

            {/* Screen Title */}
            {/* {!isReadingCompleted ? (<Svg height={60} width={400}>
            <SvgText
              x={190}                 // center X
              y={35}                  // baseline Y
              fontSize={40}
              fontFamily="DynaPuff-Bold"
              textAnchor="middle"     // center align
              fill="none"          // inside color
              stroke="#D7E9FF"        // outline color
              strokeWidth={8}         // outline thickness
              strokeLinejoin='round'
            >
              {type === 'alphabet'
                ? 'Alphabet Reading'
                : type === 'word'
                  ? 'Word Reading'
                  : 'Passage Reading'}
            </SvgText>
            <SvgText
              x={190}
              y={35}
              fontSize={40}
              fontFamily="DynaPuff-Bold"
              textAnchor="middle"
              fill="#3B7FC9"
            >
              {type === 'alphabet'
                ? 'Alphabet Reading'
                : type === 'word'
                  ? 'Word Reading'
                  : 'Passage Reading'}
            </SvgText>
          </Svg>): null} */}

            {/* Display Component */}
            <PassageDisplay
              material={readingMaterial}
              type={type}
              spokenText={spokenText}
              isRecording={isRecording}
              miscues={miscues}
              accuracy={numericAccuracy}
              accuracyString={accuracyString}
              isReadingCompleted={isReadingCompleted}
              isTextCorrect={isCorrectAttempt}
              feedback={feedback}
              onTryAgain={handleTryAgain}
            />

            {/* Transcribing Loading Indicator Modal */}
            <Modal transparent={true} visible={isLoading} animationType="fade">
              <View style={readingStyles.loadingModalOverlay}>
                <View style={readingStyles.loadingModalContent}>
                  <ActivityIndicator size={48} color="#3B7FC9" />
                  <Text style={readingStyles.loadingModalTitle}>Transcribing Audio...</Text>
                  <Text style={readingStyles.loadingModalSubtitle}>This will only take a moment.</Text>
                </View>
              </View>
            </Modal>

            {/* Feedback — Only show for passage (alphabet + word show result inside PassageDisplay) */}
            {!isLoading && !isRecording && isReadingCompleted && type === 'passage' && (
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
            {/* <FeedbackModal
            visible={showFeedbackModal}
            type={feedbackModalType}
            onClose={handleFeedbackModalClose}
            autoClose={true}
          /> */}
          </View>
        </ScrollView>
        {showScrollHint && !isAtBottom && (
          <TouchableOpacity
            style={readingStyles.scrollHintOverlay}
            onPress={handleScrollHintPress}
            activeOpacity={0.85}
          >
            <Text style={readingStyles.scrollHintText}>▼ See more </Text>
          </TouchableOpacity>
        )}

        {/* ── STT Error Modal ──────────────────────────────────────────────── */}
        {/* Shown when AssemblyAI transcription fails, replacing the old Alert. */}
        {sttErrorVisible && (
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center', alignItems: 'center',
            zIndex: 999,
          }}>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              marginHorizontal: 28,
              padding: 28,
              alignItems: 'center',
              elevation: 10,
              shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
            }}>
              {/* Icon */}
              <View style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: '#FFF0F0',
                justifyContent: 'center', alignItems: 'center',
                marginBottom: 14,
              }}>
                <Text style={{ fontSize: 28 }}>⚠️</Text>
              </View>

              {/* Title */}
              <Text style={{
                fontSize: 18, fontFamily: 'DynaPuff-Bold',
                color: '#1E1E1E', textAlign: 'center', marginBottom: 8,
              }}>
                Transcription Failed
              </Text>

              {/* Message */}
              <Text style={{
                fontSize: 13, fontFamily: 'Satoshi-Regular',
                color: '#555', textAlign: 'center', marginBottom: 24, lineHeight: 20,
              }}>
                {sttErrorMessage}
              </Text>

              {/* Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={clearSttError}
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 12,
                    backgroundColor: '#F0F4FF', alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#3B7FC9', fontFamily: 'Satoshi-Bold', fontSize: 14 }}>Dismiss</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { clearSttError(); handleTryAgain(); }}
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 12,
                    backgroundColor: '#3B7FC9', alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Satoshi-Bold', fontSize: 14 }}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}
