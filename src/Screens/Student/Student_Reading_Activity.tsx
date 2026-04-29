// React
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Modal, Image } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

// Styles
import readingStyles from '../../UI_Designs/ReadingActivityStyles';

// Controllers
import { RootStackParamList, useNavigationHelper } from '../../Controller/NavigationController';
import { useAudioRecording } from '../../Controller/AudioRecordingController';
import { useSpeechToText } from '../../Controller/Speech2TextServiceController';
import { MiscueAnalysisService } from '../../Controller/MiscueAnalysisServiceController';

// Components
import { ReadingHeader } from '../../Components/Student/Reading/ReadingHeader';
import { PassageDisplay } from '../../Components/Student/Reading/TextDisplay';
import { RecordingControls } from '../../Components/Student/Reading/RecordingControls';
import { FeedbackResult } from '../../Components/Student/Reading/PassageFeedback';
import { Miscue } from '../../Interfaces/miscue';
import { MiscueReportController } from '../../Controller/MiscueReportController';
import { isAlphabet, isPassage, isWords } from '../../Interfaces/passage';
import { makeTodayKey } from '../../Utilities/currentDateUtils';
import { getPassageImage } from '../../Utilities/ReadingAssets';
import { useGlobalMusic } from '../../Components/GlobalUse/Background/GlobalMusicContext';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial_new.json';

// Auth Firebase
import { getAuth } from '@react-native-firebase/auth';

// Types
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

  useEffect(() => {
    // This return function acts as "componentWillUnmount"
    return () => {
      // Finalize Alphabet Session if one was started
      if (type === 'alphabet' && alphabetSessionIdRef.current) {
        MiscueReportController.finalizeAlphabetSession(
          alphabetSessionIdRef.current
        ).catch((err) => console.error('Failed to finalize alphabet session', err));
      }
      // Finalize Word Session if one was started
      if (type === 'word' && wordSessionIdRef.current) {
        MiscueReportController.finalizeWordSession(
          wordSessionIdRef.current
        ).catch((err) => console.error('Failed to finalize word session', err));
      }
    };
  }, [type]); // We only need type since the refs persist automatically
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

  const { isLoading, getSimulatedResponse, processAudioWithAssemblyAI, processAudioWithDeepgram, processAudioWithHubert, processAudioWithWav2Vec2, processAudioWithWhisper, sttErrorVisible, sttErrorMessage, clearSttError } = useSpeechToText();

  // Access Global Music Context
  const { playMusic, pauseMusic } = useGlobalMusic();

  const handleScrollHintPress = useCallback(() => {
    resultScrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  // Navigation
  const { handleLogout, handleBackStep, handleReplaceStep } = useNavigationHelper();

  const getNextReadingItem = useCallback(() => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      const alphaList = readingMaterialData.Alphabet;
      const index = alphaList.findIndex(a => a.letter === readingMaterial.letter);
      if (index >= 0 && index < alphaList.length - 1) {
        return { type: 'alphabet', readingMaterial: alphaList[index + 1], wordContext: undefined };
      }
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      const passList = readingMaterialData.Passages;
      const index = passList.findIndex(p => p.title === readingMaterial.title);
      if (index >= 0 && index < passList.length - 1) {
        return { type: 'passage', readingMaterial: passList[index + 1], wordContext: undefined };
      }
    } else if (type === 'word' && isWords(readingMaterial) && wordContext) {
      const chapters = readingMaterialData.Words[0].chapters;
      const chapterIdx = chapters.findIndex((c: any) => c.chapter_id === wordContext.chapterId);
      if (chapterIdx === -1) return null;

      const chapter = chapters[chapterIdx];
      const lessonIdx = chapter.lessons.findIndex((l: any) => l.lesson_id === wordContext.lessonId);
      if (lessonIdx === -1) return null;

      const lesson = chapter.lessons[lessonIdx];
      const wordIdx = lesson.words.findIndex((w: string) => w === wordContext.targetWord);

      // Found the word
      if (wordIdx >= 0 && wordIdx < lesson.words.length - 1) {
        // Next word in same lesson
        const nextWordText = lesson.words[wordIdx + 1];
        const nextWordData = {
          letter: lesson.letter || '?',
          contrasts: [{ phoneme: lesson.title, ipa: '', words: [nextWordText] }]
        };
        const nextContext = { ...wordContext, targetWord: nextWordText };
        return { type: 'word', readingMaterial: nextWordData, wordContext: nextContext };
      }

      // Not in same lesson, try next lesson in same chapter
      if (lessonIdx < chapter.lessons.length - 1) {
        const nextLesson = chapter.lessons[lessonIdx + 1];
        if (nextLesson.words && nextLesson.words.length > 0) {
          const nextWordText = nextLesson.words[0];
          const nextWordData = {
            letter: nextLesson.letter || '?',
            contrasts: [{ phoneme: nextLesson.title, ipa: '', words: [nextWordText] }]
          };
          const nextContext = {
            chapterId: chapter.chapter_id,
            chapterTitle: chapter.title,
            lessonId: nextLesson.lesson_id,
            lessonTitle: nextLesson.title,
            targetWord: nextWordText
          };
          return { type: 'word', readingMaterial: nextWordData, wordContext: nextContext };
        }
      }

      // Try next chapter
      if (chapterIdx < chapters.length - 1) {
        const nextChapter = chapters[chapterIdx + 1];
        if (nextChapter.lessons && nextChapter.lessons.length > 0) {
          const nextLesson = nextChapter.lessons[0];
          if (nextLesson.words && nextLesson.words.length > 0) {
            const nextWordText = nextLesson.words[0];
            const nextWordData = {
              letter: nextLesson.letter || '?',
              contrasts: [{ phoneme: nextLesson.title, ipa: '', words: [nextWordText] }]
            };
            const nextContext = {
              chapterId: nextChapter.chapter_id,
              chapterTitle: nextChapter.title,
              lessonId: nextLesson.lesson_id,
              lessonTitle: nextLesson.title,
              targetWord: nextWordText
            };
            return { type: 'word', readingMaterial: nextWordData, wordContext: nextContext };
          }
        }
      }
    }
    return null;
  }, [readingMaterial, type, wordContext]);

  const [nextItem, setNextItem] = useState<{ type: any; readingMaterial: any; wordContext: any } | null>(null);
  const [prevItem, setPrevItem] = useState<{ type: any; readingMaterial: any; wordContext: any } | null>(null);

  const getPreviousReadingItem = useCallback(() => {
    if (type === 'alphabet' && isAlphabet(readingMaterial)) {
      const alphaList = readingMaterialData.Alphabet;
      const index = alphaList.findIndex(a => a.letter === readingMaterial.letter);
      if (index > 0) {
        return { type: 'alphabet', readingMaterial: alphaList[index - 1], wordContext: undefined };
      }
    } else if (type === 'passage' && isPassage(readingMaterial)) {
      const passList = readingMaterialData.Passages;
      const index = passList.findIndex(p => p.title === readingMaterial.title);
      if (index > 0) {
        return { type: 'passage', readingMaterial: passList[index - 1], wordContext: undefined };
      }
    } else if (type === 'word' && isWords(readingMaterial) && wordContext) {
      const chapters = readingMaterialData.Words[0].chapters;
      const chapterIdx = chapters.findIndex((c: any) => c.chapter_id === wordContext.chapterId);
      if (chapterIdx === -1) return null;

      const chapter = chapters[chapterIdx];
      const lessonIdx = chapter.lessons.findIndex((l: any) => l.lesson_id === wordContext.lessonId);
      if (lessonIdx === -1) return null;

      const lesson = chapter.lessons[lessonIdx];
      const wordIdx = lesson.words.findIndex((w: string) => w === wordContext.targetWord);

      // Previous word in same lesson
      if (wordIdx > 0) {
        const prevWordText = lesson.words[wordIdx - 1];
        const prevWordData = {
          letter: lesson.letter || '?',
          contrasts: [{ phoneme: lesson.title, ipa: '', words: [prevWordText] }]
        };
        const prevContext = { ...wordContext, targetWord: prevWordText };
        return { type: 'word', readingMaterial: prevWordData, wordContext: prevContext };
      }

      // Previous lesson in same chapter
      if (lessonIdx > 0) {
        const prevLesson = chapter.lessons[lessonIdx - 1];
        if (prevLesson.words && prevLesson.words.length > 0) {
          const prevWordText = prevLesson.words[prevLesson.words.length - 1];
          const prevWordData = {
            letter: prevLesson.letter || '?',
            contrasts: [{ phoneme: prevLesson.title, ipa: '', words: [prevWordText] }]
          };
          const prevContext = {
            chapterId: chapter.chapter_id,
            chapterTitle: chapter.title,
            lessonId: prevLesson.lesson_id,
            lessonTitle: prevLesson.title,
            targetWord: prevWordText
          };
          return { type: 'word', readingMaterial: prevWordData, wordContext: prevContext };
        }
      }

      // Previous chapter
      if (chapterIdx > 0) {
        const prevChapter = chapters[chapterIdx - 1];
        if (prevChapter.lessons && prevChapter.lessons.length > 0) {
          const prevLesson = prevChapter.lessons[prevChapter.lessons.length - 1];
          if (prevLesson.words && prevLesson.words.length > 0) {
            const prevWordText = prevLesson.words[prevLesson.words.length - 1];
            const prevWordData = {
              letter: prevLesson.letter || '?',
              contrasts: [{ phoneme: prevLesson.title, ipa: '', words: [prevWordText] }]
            };
            const prevContext = {
              chapterId: prevChapter.chapter_id,
              chapterTitle: prevChapter.title,
              lessonId: prevLesson.lesson_id,
              lessonTitle: prevLesson.title,
              targetWord: prevWordText
            };
            return { type: 'word', readingMaterial: prevWordData, wordContext: prevContext };
          }
        }
      }
    }
    return null;
  }, [readingMaterial, type, wordContext]);

  useEffect(() => {
    setNextItem(getNextReadingItem());
    setPrevItem(getPreviousReadingItem());
  }, [getNextReadingItem, getPreviousReadingItem]);
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

  const handleNextPress = useCallback(() => {
    if (nextItem) {
      handleTryAgain(); // cleanup current media playing
      handleReplaceStep('ReadingActivity', nextItem);
    } else {
      handleBackStep();
    }
  }, [nextItem, handleReplaceStep, handleTryAgain, handleBackStep]);

  const handlePrevPress = useCallback(() => {
    if (prevItem) {
      handleTryAgain();
      handleReplaceStep('ReadingActivity', prevItem);
    }
  }, [prevItem, handleReplaceStep, handleTryAgain]);

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
      // const transcription = await processAudioWithDeepgram(audioFile);
      // const transcription = await processAudioWithPuter(audioFile);
      // const transcription = await processAudioWithWav2Vec2(audioFile);
      const transcription = await processAudioWithHubert(audioFile);
      // const transcription = await processAudioWithWhisper(audioFile);
      setSpokenText(transcription);
      console.log('THIS IS THE SPOKEN: ' + transcription);
      // console.log('THIS IS THE UTTERANCES: ' + transcription);

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
  }, [processAudioWithHubert, getSimulatedResponse, targetText]);

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
        <View style={{ flex: 1 }}>
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
                onNextItem={handleNextPress}
                hasNextItem={!!nextItem}
              />

              {/* Transcribing Loading Indicator Modal */}
              <Modal transparent={true} visible={isLoading} animationType="fade">
                <View style={readingStyles.loadingModalOverlay}>
                  <View style={readingStyles.loadingModalContent}>
                    <Image
                      source={require('../../../assets/images/Thinking-image.png')}
                      style={readingStyles.loadingModalImage}
                    />
                    <Text style={readingStyles.loadingModalTitle}>Please wait a moment.</Text>
                  </View>
                </View>
              </Modal>

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
                  onNextItem={handleNextPress}
                  hasNextItem={!!nextItem}
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
        </View>

        {/* Recording Controls with Nav Arrows - Only show when not completed */}
        {!isReadingCompleted && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 25, paddingHorizontal: 16 }}>
            {/* Previous Arrow */}
            {prevItem ? (
              <TouchableOpacity
                onPress={handlePrevPress}
                style={[readingStyles.navArrowItem, { marginRight: 22 }]}
              >
                <Text style={readingStyles.navArrowText}>{'<'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={[readingStyles.navArrowEmpty, { marginRight: 22 }]} />
            )}

            {/* Microphone */}
            <RecordingControls
              isRecording={isRecording}
              isLoading={isLoading}
              hasPermission={hasPermission}
              recordTime={formatTime(recordTime)}
              onRecordToggle={handleRecordToggle}
            />

            {/* Next Arrow */}
            {nextItem ? (
              <TouchableOpacity
                onPress={handleNextPress}
                style={[readingStyles.navArrowItem, { marginLeft: 22 }]}
              >
                <Text style={readingStyles.navArrowText}>{'>'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={[readingStyles.navArrowEmpty, { marginLeft: 22 }]} />
            )}
          </View>
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
                fontSize: 18, fontFamily: 'Nunito-ExtraBold',
                color: '#1E1E1E', textAlign: 'center', marginBottom: 8,
              }}>
                Network Error
              </Text>

              {/* Message */}
              <Text style={{
                fontSize: 14, fontFamily: 'Nunito-Medium',
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
                  <Text style={{ color: '#3B7FC9', fontFamily: 'Nunito-Bold', fontSize: 14 }}>Dismiss</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { clearSttError(); handleTryAgain(); }}
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 12,
                    backgroundColor: '#3B7FC9', alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Nunito-Bold', fontSize: 14 }}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}
