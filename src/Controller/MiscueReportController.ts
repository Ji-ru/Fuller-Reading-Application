// Note: This is a controller/service object, not a React component or custom hook.
// React hooks (useState, useEffect, useRef, useCallback, useMemo) are not used in this file.
// Use hooks only inside React function components or hooks that start with 'use'.
import { Miscue } from '../Interfaces/miscue';
import { MiscueReportDocument, WordReportDocument, AlphabetReportDocument, AlphabetAttemptUpdate, WordAttemptUpdate } from '../Interfaces/dataInterfaces';
import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  serverTimestamp,
  setDoc,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  updateDoc
} from '@react-native-firebase/firestore';
import { StudentProgressResult } from '../Interfaces/miscue';
import { getDateRangeForTimeFilter } from '../Utilities/dateRange';
import { ProgressData } from '../Interfaces/miscue';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { makeTodayKey } from '../Utilities/currentDateUtils';

// Initialize instances
const auth = getAuth();
const db = getFirestore();
export const MiscueReportController = {
  async storeReport(
    passageTitle: string,
    miscues: Miscue[],
    accuracy: number,
    wordPerMin: number,
    totalWords: number,
    recordingDuration?: string,
  ): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(
          'No authenticated user found. Please sign in to save reports.',
        );
      }

      const { substitution, omission, insertion, repetition } =
        MiscueReportController.generateMiscueSummary(miscues);

      const miscueReportRef = collection(db, 'miscueReports');
      const miscueDocRef = doc(miscueReportRef);
      const reportId = miscueDocRef.id;

      const reportData: Omit<MiscueReportDocument, 'createdAt'> & {
        createdAt: any;
        substitutionCount?: number;
        omissionCount?: number;
        insertionCount?: number;
        repetitionCount?: number;
      } = {
        // Core identifiers
        reportId,
        studentId: user.uid,

        // Passage information
        passageTitle,

        // Summary strings (for quick display)
        substitution,
        omission,
        insertion,
        repetition,

        // Detailed miscue data
        miscues: miscues.map(m => ({
          type: m.type,
          expectedWord: m.expected,
          spokenWord: m.spoken,
        })),

        totalWords: totalWords,
        accuracyRate: accuracy,
        wordPerMin: wordPerMin,
        recordingDuration: recordingDuration,

        substitutionCount: miscues.filter(m => m.type === 'substitution')
          .length,
        omissionCount: miscues.filter(m => m.type === 'omission').length,
        insertionCount: miscues.filter(m => m.type === 'insertion').length,
        repetitionCount: miscues.filter(m => m.type === 'repetition').length,
        // Firestore server timestamp
        createdAt: serverTimestamp(),
      };

      // ======================================================================
      // STEP 6: Store in Firestore
      // ======================================================================
      await setDoc(miscueDocRef, reportData);

      console.log('Storing Complete!: ' + reportData.passageTitle)

      return reportId;
    } catch (error: any) {
      console.error(' Failed to store miscue report:', error);
      throw new Error(`Failed to store miscue report: ${error.message}`);
    }
  },

  /**
   * ==========================================================================
   * GENERATE MISCUE SUMMARY
   * ==========================================================================
   * Creates formatted summary strings for each miscue type.
   * Used for quick display without parsing the full miscues array.
   *
   * @param miscues - Array of miscue objects
   * @returns Object with formatted summary strings
   *
   * @example
   * Input: [
   *   { type: 'substitution', expected: 'cat', spoken: 'car' },
   *   { type: 'omission', expected: 'the', spoken: '[OMITTED]' }
   * ]
   * Output: {
   *   substitution: '"cat"',
   *   omission: '"the"',
   *   insertion: 'None',
   *   repetition: 'None'
   * }
   * ==========================================================================
   */
  generateMiscueSummary(miscues: Miscue[]): {
    substitution: string;
    omission: string;
    insertion: string;
    repetition: string;
  } {
    const substitution =
      miscues
        .filter(m => m.type === 'substitution')
        .map(m => `"${m.expected}"`)
        .join(', ') || 'None';

    const omission =
      miscues
        .filter(m => m.type === 'omission')
        .map(m => `"${m.expected}"`)
        .join(', ') || 'None';

    const insertion =
      miscues
        .filter(m => m.type === 'insertion')
        .map(m => `"${m.spoken}"`)
        .join(', ') || 'None';

    const repetition =
      miscues
        .filter(m => m.type === 'repetition')
        .map(m => `"${m.spoken}"`)
        .join(', ') || 'None';

    return { substitution, omission, insertion, repetition };
  },

  // ==========================================================================
  // WORD DOCUMENT STORING AND RETRIEVING
  // ==========================================================================
  /**
   * STORE CORRECT WORD PRONUNCIATION
   * 
   * Stores a word that has attempted to read by the student
   * @param letter - Alphabet Letter of the word
   * @param word  - Selected word attempted to read
   * @returns stores the data into the firestore and returns the Word ID
   * 
   * @example
   * Input = [
   *  {letter: A ,spokenWord: cap,  targetWord: cap }
   * ]
   * 
   * Output: {
   *  wordId: kjahdka
   *  studentId: asdklk (based on getAuth() - the current logged-in student in app);
   *  word: cap
   *  createdAt: 7 February 2026 at 14:00:03 UTC+8
   * }
   */
  async storeWordCorrectAttempt(chapter: number, chapterTitle: string, lesson: number, lessonTitle: string, word: string): Promise<WordReportDocument> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(
          'No authenticated user found. Please sign in to save reports.',
        );
      }
      // Check if this word has already been completed by this student
      const existing = await MiscueReportController.hasWordBeenCompleted(
        user.uid,
        chapter,
        chapterTitle,
        lesson,
        lessonTitle,
        word,
      );
      if (existing) {
        console.log('The Word already completed, skipping storage');
        return existing;
      }
      // Create document reference with auto-generated ID
      const wordCompleteRef = collection(db, 'wordCompleted');
      const wordDocRef = doc(wordCompleteRef);
      const wordId = wordDocRef.id;
      const wordData = {
        wordId,
        studentId: user.uid,
        chapter,
        chapterTitle,
        lesson,
        lessonTitle,
        word,
        createdAt: serverTimestamp(),
      };

      // Use setDoc with document reference
      await setDoc(wordDocRef, wordData);

      // Read back the document to get the actual Timestamp (and ensure full data)
      const newWordSnap = await getDoc(wordDocRef);
      if (!newWordSnap.exists()) {
        throw new Error('Document was created but could not be retrieved.');
      }

      return newWordSnap.data() as WordReportDocument;
    } catch (error: any) {
      throw Error('Failed to store correct word attempt:' + error.message);
    }
  },

  /**
   * Check if a word has already been completed by the student
   * @param studentId - Student's user ID
   * @param letter - Alphabet letter
   * @param word - Word to check
   * @returns WordReportDocument if found, null otherwise
   */
  async hasWordBeenCompleted(
    studentId: string,
    chapter: number,
    chapterTitle: string,
    lesson: number,
    lessonTitle: string,
    word: string
  ): Promise<WordReportDocument | null> {
    try {
      const wordCompleteRef = collection(db, 'wordCompleted');
      const wordQuery = query(
        wordCompleteRef,
        where('studentId', '==', studentId),
        where('chapter', '==', chapter),
        where('word', '==', word),
      );

      const querySnapshot = await getDocs(wordQuery);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          wordId: doc.id,
          ...doc.data(),
        } as WordReportDocument;
      }

      return null;
    } catch (error: any) {
      console.error('Error checking if word completed:', error);
      throw new Error('Failed to check word completion: ' + error.message);
    }
  },

  /**
 * Starts the session for word every time the student read the selected cahpter, lesson, and then the word
 * 
 * @returns initialization of the current alphabet reading session 
 */
  async startWordSession(): Promise<string> {
    const user = auth.currentUser; // RN Firebase style
    if (!user) throw new Error('No authenticated user.');

    const todayKey = makeTodayKey();
    const sessionId = `${user.uid}_${todayKey}`;

    const sessionRef = doc(db, 'wordSessions', sessionId);

    const snap = await getDoc(sessionRef);
    if (snap.exists()) return sessionId;

    await setDoc(sessionRef, {
      wordSessionId: sessionId,
      studentId: user.uid,
      dateKey: todayKey,
      startedAt: serverTimestamp(),
      totals: { attempted: 0, correct: 0 },
      chapters: {},
    });

    return sessionId;
  },
  async recordWordAttempt(
    sessionId: string,
    chapters: {
      chapterId: number;
      chapterTitle: string;
      lessonId: number;
      lessonTitle: string;
      targetWord: string;
    },
    update: WordAttemptUpdate,
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user.');
  
    const chapterKey = `ch_${chapters.chapterId}`;
    const lessonKey = `ls_${chapters.lessonId}`;
  
    const sessionRef = doc(db, 'wordSessions', sessionId);
    const updates: Record<string, any> = {};
  
    // --- totals
    if (update.incAttempted) updates['totals.attempted'] = increment(1);
    if (update.incCorrect) updates['totals.correct'] = increment(1);
  
    // --- chapter aggregates
    if (update.incAttempted) updates[`chapters.${chapterKey}.attempted`] = increment(1);
    if (update.incCorrect) updates[`chapters.${chapterKey}.correct`] = increment(1);
  
    // --- chapter metadata
    updates[`chapters.${chapterKey}.chapterId`] = chapters.chapterId;
    updates[`chapters.${chapterKey}.chapterTitle`] = chapters.chapterTitle;
  
    // --- lesson aggregates
    if (update.incAttempted)
      updates[`chapters.${chapterKey}.lessons.${lessonKey}.attempted`] = increment(1);
    if (update.incCorrect)
      updates[`chapters.${chapterKey}.lessons.${lessonKey}.correct`] = increment(1);
  
    // --- lesson metadata
    updates[`chapters.${chapterKey}.lessons.${lessonKey}.lessonId`] = chapters.lessonId;
    updates[`chapters.${chapterKey}.lessons.${lessonKey}.lessonTitle`] = chapters.lessonTitle;
  
    // --- word lists
    const basePath = `chapters.${chapterKey}.lessons.${lessonKey}`;
    const word = chapters.targetWord;
  
    if (update.addTargetWord) {
      updates[`${basePath}.targetWords`] = arrayUnion(word);
    }
  
    if (update.addCorrectWord) {
      updates[`${basePath}.correctWords`] = arrayUnion(word);
    }
  
    if (update.addIncorrectWord) {
      updates[`${basePath}.incorrectWords`] = arrayUnion(word);
    }
  
    if (update.removeIncorrectWord) {
      updates[`${basePath}.incorrectWords`] = arrayRemove(word);
    }
  
    if (Object.keys(updates).length === 0) return;
    await updateDoc(sessionRef, updates);
  },

  /**
   * ==========================================================================
   * GET COMPLETED WORDS BY STUDENT
   * ==========================================================================
   * Retrieves all completed words for a specific student
   * @param studentId - Firebase Auth UID of the student
   * @returns Array of completed word objects
   */
  async getCompletedWords(
    studentId: string,
  ): Promise<Array<{ word: string; chapter: string; createdAt: any }>> {
    try {
      // Build query using modular functions
      const wordCompletedRef = collection(db, 'wordCompleted');
      const q = query(
        wordCompletedRef,
        where('studentId', '==', studentId),
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          word: data.word,
          chapter: data.chapter,
          createdAt: data.createdAt?.toDate(),
        };
      });
    } catch (error: any) {
      console.error('Failed to fetch completed words:', error);
      return [];
    }
  },

  // ==========================================================================
  // ALPHABET LETTERS DOCUMENT STORING AND RETRIEVING
  // ==========================================================================

  /**
   * STORE CORRECT ALPHABET PHONEME
   * 
   * Stores a word that has attempted to read by the student
   * @param letter - Selected alphabet that was read
   * @returns stores the data into the firestore and returns the Letter ID
   */
  async storeAlphabetCorrectAttempt(letter: string): Promise<AlphabetReportDocument> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(
          'No authenticated user found. Please sign in to save reports.',
        );
      }
      // Check if this word has already been completed by this student
      const existing = await MiscueReportController.hasAlphabetBeenCompleted(
        user.uid,
        letter,
      );
      if (existing) {
        console.log('The current alphabet already completed, skipping storage');
        return existing;
      }

      const alphabetCompleteRef = collection(db, 'alphabetCompleted');
      const alphabetDocRef = doc(alphabetCompleteRef);
      const alphabetId = alphabetDocRef.id;

      const alphabetData = {
        alphabetId,
        studentId: user.uid,
        letter,
        createdAt: serverTimestamp(),
      };

      // Use setDoc with document reference
      await setDoc(alphabetDocRef, alphabetData);

      // Read back the document to get the actual Timestamp (and ensure full data)
      const newAlphabetSnap = await getDoc(alphabetDocRef);
      if (!newAlphabetSnap.exists()) {
        throw new Error('Document was created but could not be retrieved.');
      }

      return newAlphabetSnap.data() as AlphabetReportDocument;
    } catch (error: any) {
      throw Error('Failed to store correct alphabet attempt:' + error.message);
    }
  },

  /**
   * Checks if the selected and read alphabet has been stored already
   * @param studentId
   * @param letter
   * @returns an empty or an existing data
   */
  async hasAlphabetBeenCompleted(
    studentId: string,
    letter: string,
  ): Promise<AlphabetReportDocument | null> {
    try {
      const alphabetCompleteRef = collection(db, 'alphabetCompleted');
      const alphabetQuery = query(
        alphabetCompleteRef,
        where('studentId', '==', studentId),
        where('letter', '==', letter),
      );

      const querySnapshot = await getDocs(alphabetQuery);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          wordId: doc.id,
          ...doc.data(),
        } as AlphabetReportDocument;
      }

      return null;
    } catch (error: any) {
      throw new Error('Failed to check alphabet completed: ' + error.message);
    }
  },

  /**
   * Starts the session for alphabet every time the student read the selected letter
   * 
   * @returns initialization of the current alphabet reading session 
   */
  async startAlphabetSession(): Promise<string> {
    const user = auth.currentUser; // RN Firebase style
    if (!user) throw new Error('No authenticated user.');

    const todayKey = makeTodayKey();
    const sessionId = `${user.uid}_${todayKey}`;

    const sessionRef = doc(db, 'alphabetSessions', sessionId);

    const snap = await getDoc(sessionRef);
    if (snap.exists()) return sessionId;

    await setDoc(sessionRef, {
      alphabetSessionId: sessionId,
      studentId: user.uid,
      dateKey: todayKey, // <-- IMPORTANT for range queries
      sessionDateAt: serverTimestamp(), // Considered as startAt
      correctCount: 0,
      attemptedCount: 0,
      correctLetters: [],
      incorrectLetters: [],
    });

    return sessionId;
  },

  async recordAlphabetAttempt(
    sessionId: string,
    letter: string,
    update: AlphabetAttemptUpdate,
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user.');

    const cleanLetter = letter.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (!cleanLetter) return;

    const sessionRef = doc(db, 'alphabetSessions', sessionId);

    const updates: any = {};

    if (update.incAttempted) updates.attemptedCount = increment(1);
    if (update.incCorrect) updates.correctCount = increment(1);

    if (update.addCorrect) updates.correctLetters = arrayUnion(cleanLetter);
    if (update.addIncorrect) updates.incorrectLetters = arrayUnion(cleanLetter);
    if (update.removeIncorrect) updates.incorrectLetters = arrayRemove(cleanLetter);

    if (Object.keys(updates).length === 0) return;

    await updateDoc(sessionRef, updates);
  },


  // ==========================================================================
  // STUDENT PASSAGE DOCUMENT RETRIEVING
  // ==========================================================================

  /**
   * UPDATED TO React Native Firebase v22
   * ==========================================================================
   * GET STUDENT REPORTS
   * ==========================================================================
   * Retrieves all reports for a specific student, sorted by most recent first.
   *
   * @param studentId - Firebase Auth UID of the student
   * @returns Array of MiscueReportDocument objects
   *
   * @throws Error - If Firestore query fails
   * ==========================================================================
   */
  async getStudentReports(studentId: string): Promise<MiscueReportDocument[]> {
    try {
      const reportRef = collection(db, 'miscueReports');
      const studentMiscueReport = query(
        reportRef,
        where('studentId', '==', studentId),
      );

      const studentReportSnapshot = await getDocs(studentMiscueReport);

      return studentReportSnapshot.docs.map((doc: any) => ({
        reportId: doc.id,
        ...doc.data(),
      })) as MiscueReportDocument[];
    } catch (error: any) {
      console.error('Failed to fetch student reports:', error);
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }
  },

  /**
   * UPDATED TO React Native Firebase v22
   * Get all recording duration in a class
   *
   * @param studentId
   * @returns - all recording duration
   */
  async getRecordingDuration(
    studentId: string,
  ): Promise<MiscueReportDocument[]> {
    try {
      const recordRef = collection(db, 'miscueReports');
      const studentRecordingQuery = query(
        recordRef,
        where('studentId', '==', studentId),
      );

      const studentRecordingSnapshot = await getDocs(studentRecordingQuery);

      return studentRecordingSnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          reportId: doc.id,
          ...data,
          // Ensure all required fields are included
          miscues: data.miscues || [],
          accuracyRate: data.accuracyRate || 0,
          wordPerMin: data.wordPerMin || 0,
          recordingDuration: data.recordingDuration || '00:00:00',
        } as MiscueReportDocument;
      });
    } catch (error: any) {
      throw new Error('Failed to fetch duration: ' + error.message);
    }
  },

  /**
   * Retrieves all the completed alphabet made by the student
   * The following are what this function will be used for:
   *  - to be used to count how many alphabets are completed
   *  - to identify which alphabets are completed and will be displayed for each alphabet
   * @param studentId 
   */
  getStudentCompletedAlphabet(studentId: string, onUpdate: (alphabets: AlphabetReportDocument[]) => void) {
    try {
      const alphabetQuery = query(collection(db, 'alphabetCompleted'), where('studentId', '==', studentId));
      return onSnapshot(alphabetQuery, snapshot => {
        const alphabets = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          ...doc.data(),
          alphabetId: doc.id
        })) as AlphabetReportDocument[];
        console.log('Alphebet objects retrieved: ' + JSON.stringify(alphabets));
        onUpdate(alphabets);
      });
    } catch (error: any) {
      console.log('Failed to retrieved alphabets data: ' + error.any)
      throw new Error("Failed to retrieved alphabets data: " + error.any);
    }
  },

  /**
 * Retrieves all the completed word made by the student
 * The following are what this function will be used for:
 *  - to be used to count how many words are completed
 *  - to identify which word are completed and will be displayed for each alphabet
 * @param studentId 
 */
  getStudentCompletedWord(studentId: string, onUpdate: (word: WordReportDocument[]) => void) {
    try {
      const wordQuery = query(collection(db, 'wordCompleted'), where('studentId', '==', studentId));
      return onSnapshot(wordQuery, snapshot => {
        const words = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          ...doc.data(),
          alphabetId: doc.id
        })) as WordReportDocument[];
        console.log('Words objects retrieved: ' + words);
        onUpdate(words);
      });
    } catch (error: any) {
      console.log('Failed to retrieved words data: ' + error.any)
      throw new Error("Failed to retrieved words data: " + error.any);
    }
  },

  /**
   * ==========================================================================
   * GET PASSAGE REPORTS
   * ==========================================================================
   * Retrieves reports for a specific passage, optionally filtered by student.
   *
   * @param passageTitle - Title of the passage
   * @param studentId - Optional: filter by specific student
   * @returns Array of MiscueReportDocument objects
   * ==========================================================================
   */
  // async getPassageReports(
  //   passageTitle: string,
  //   studentId?: string,
  // ): Promise<MiscueReportDocument[]> {
  //   try {
  //     let query = firestore()
  //       .collection('miscueReports')
  //       .where('passageTitle', '==', passageTitle);

  //     if (studentId) {
  //       query = query.where('studentId', '==', studentId);
  //     }

  //     const snapshot = await query.orderBy('timestamp', 'desc').get();

  //     return snapshot.docs.map(
  //       doc =>
  //         ({
  //           reportId: doc.id,
  //           ...doc.data(),
  //         } as MiscueReportDocument),
  //     );
  //   } catch (error: any) {
  //     console.error('Failed to fetch passage reports:', error);
  //     throw new Error(`Failed to fetch passage reports: ${error.message}`);
  //   }
  // },

  /**
   * ==========================================================================
   * GET REPORT BY ID
   * ==========================================================================
   * Retrieves a single report by its document ID.
   *
   * @param reportId - Firestore document ID
   * @returns MiscueReportDocument or null if not found
   * ==========================================================================
   */
  // async getReportById(reportId: string): Promise<MiscueReportDocument | null> {
  //   try {
  //     const doc = await firestore()
  //       .collection('miscueReports')
  //       .doc(reportId)
  //       .get();

  //     if (!doc.exists) {
  //       return null;
  //     }

  //     return {
  //       reportId: doc.id,
  //       ...doc.data(),
  //     } as MiscueReportDocument;
  //   } catch (error: any) {
  //     console.error('Failed to fetch report by ID:', error);
  //     throw new Error(`Failed to fetch report: ${error.message}`);
  //   }
  // },

  /**
   * ==========================================================================
   * DELETE REPORT
   * ==========================================================================
   * Permanently deletes a report from Firestore.
   *
   * @param reportId - Document ID to delete
   * @throws Error - If Firestore operation fails
   * ==========================================================================
   */
  // async deleteReport(reportId: string): Promise<void> {
  //   try {
  //     await firestore().collection('miscueReports').doc(reportId).delete();

  //     console.log(`âœ… Report ${reportId} deleted successfully`);
  //   } catch (error: any) {
  //     console.error('Failed to delete report:', error);
  //     throw new Error(`Failed to delete report: ${error.message}`);
  //   }
  // },

  /**
   * ==========================================================================
   * UPDATE REPORT
   * ==========================================================================
   * Updates an existing report with new data.
   *
   * @param reportId - Document ID to update
   * @param updates - Partial data to update
   * @throws Error - If Firestore operation fails
   * ==========================================================================
   */
  // async updateReport(
  //   reportId: string,
  //   updates: Partial<Omit<MiscueReportDocument, 'reportId' | 'timestamp'>>,
  // ): Promise<void> {
  //   try {
  //     await firestore()
  //       .collection('miscueReports')
  //       .doc(reportId)
  //       .update({
  //         ...updates,
  //         updatedAt: firestore.FieldValue.serverTimestamp(),
  //       });

  //     console.log(`âœ… Report ${reportId} updated successfully`);
  //   } catch (error: any) {
  //     console.error('Failed to update report:', error);
  //     throw new Error(`Failed to update report: ${error.message}`);
  //   }
  // },
  // =====================================

  // Add these functions to your DatabaseController

  // ============================================================================
  //FETCHING STUDENT DATA STUDENT
  // ============================================================================


  /**
   * FORMAT MISCUE TYPE
   *
   * Converts miscue type code to readable format
   * @param type - Miscue type code
   * @returns Formatted miscue type string
   */
  formatMiscueType(type: string): string {
    const typeMap: Record<string, string> = {
      substitution: 'Substitution',
      omission: 'Omission',
      insertion: 'Insertion',
      repetition: 'Repetition',
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  },

  /**
   * GET STUDENT PROGRESS OVER TIME
   *
   * Retrieves student's progress data for chart visualization
   *
   * @param studentId - Firebase Auth UID of the student
   * @param timeRange - Time period for analysis ('week' | 'month' | 'year')
   * @returns StudentProgressResult with timeline and metrics
   */
  async getStudentProgressOverTime(
    studentId: string,
    timeRange: 'week' | 'month' | 'year' = 'week',
  ): Promise<StudentProgressResult> {
    try {
      // Step 1: Get all student reports
      const allReports = await MiscueReportController.getStudentReports(studentId);

      // Step 2: Get date range for filtering
      const { start, end } = getDateRangeForTimeFilter(timeRange);
      console.log(
        `Date range for ${timeRange}: ${start.toDateString()} to ${end.toDateString()}`,
      );

      // Step 3: Filter reports by time range
      const filteredReports = allReports.filter(report => {
        if (!report.createdAt) return false;

        const reportDate = report.createdAt.toDate
          ? report.createdAt.toDate()
          : new Date(report.createdAt.toDate());

        return reportDate >= start && reportDate <= end;
      });

      // Step 4: Calculate overall averages
      const totalWPM = filteredReports.reduce((sum, report) => sum + report.wordPerMin, 0);
      const totalAccuracy = filteredReports.reduce((sum, report) => sum + report.accuracyRate, 0);
      const totalWords = filteredReports.reduce((sum, report) => sum + report.totalWords, 0);

      const averageWPM = totalWPM / filteredReports.length;
      const averageAccuracy = totalAccuracy / filteredReports.length;

      // Step 5: Generate timeline - USING THE CONSISTENT APPROACH
      const timeline = MiscueReportController.generateTimeline(filteredReports, timeRange, start, end);

      // Step 6: Return result
      return {
        timeline,
        averageWPM,
        averageAccuracy,
        totalWords,
      };
    } catch (error: any) {
      console.error('Failed to calculate student progress:', error);
      throw new Error(`Progress calculation failed: ${error.message}`);
    }
  },

  /**
   * Generate timeline with all periods (including empty ones)
   */
  generateTimeline(
    reports: MiscueReportDocument[],
    timeRange: 'week' | 'month' | 'year',
    start: Date,
    end: Date
  ): ProgressData[] {
    // Step 1: Generate all periods for this time range
    const allPeriods = MiscueReportController.getAllPeriods(timeRange, start, end);

    // Step 2: Group reports by period
    const periodData = new Map<string, { accuracySum: number; wpmSum: number; count: number }>();

    for (const report of reports) {
      if (!report.createdAt) continue;

      const reportDate = report.createdAt.toDate
        ? report.createdAt.toDate()
        : new Date(report.createdAt.toDate());

      const periodKey = MiscueReportController.getPeriodKey(reportDate, timeRange);

      if (!periodKey) continue;

      const existing = periodData.get(periodKey);
      if (existing) {
        existing.accuracySum += report.accuracyRate;
        existing.wpmSum += report.wordPerMin;
        existing.count += 1;
      } else {
        periodData.set(periodKey, {
          accuracySum: report.accuracyRate,
          wpmSum: report.wordPerMin,
          count: 1
        });
      }
    }

    // Step 3: Combine periods with data
    return allPeriods.map(period => {
      const data = periodData.get(period.key);

      if (data && data.count > 0) {
        return {
          date: period.displayDate,
          accuracy: data.accuracySum / data.count,
          wpm: data.wpmSum / data.count,
        };
      }

      return {
        date: period.displayDate,
        accuracy: 0,
        wpm: 0,
      };
    });
  },

  /**
   * Get all periods for a time range (with keys and display dates)
   */
  getAllPeriods(
    timeRange: 'week' | 'month' | 'year',
    start: Date,
    end: Date
  ): Array<{ key: string; displayDate: string }> {
    const periods: Array<{ key: string; displayDate: string }> = [];

    switch (timeRange) {
      case 'week':
        // Generate 7 days from Sunday to Saturday
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekStart = new Date(start); // Should be Sunday

        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(weekStart);
          currentDate.setDate(weekStart.getDate() + i);

          const dayName = days[currentDate.getDay()];
          const dayNumber = currentDate.getDate();

          // Key format: "Sun 24"
          const key = `${dayName} ${dayNumber}`;
          periods.push({
            key: key,
            displayDate: key
          });
        }
        break;

      case 'month':
        // Always show 4 weeks for consistency
        for (let week = 1; week <= 4; week++) {
          const key = `W${week}`;
          periods.push({
            key: key,
            displayDate: key
          });
        }
        break;

      case 'year':
        // Show all 12 months
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        for (let month = 0; month < 12; month++) {
          const key = monthNames[month];
          periods.push({
            key: key,
            displayDate: key
          });
        }
        break;
    }

    return periods;
  },

  /**
   * Get period key for a date (MUST MATCH getAllPeriods format!)
   */
  getPeriodKey(date: Date, timeRange: 'week' | 'month' | 'year'): string | null {
    switch (timeRange) {
      case 'week':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[date.getDay()];
        const dayNumber = date.getDate();
        return `${dayName} ${dayNumber}`;

      case 'month':
        // Calculate week of month (1-4)
        const dayOfMonth = date.getDate();
        const weekOfMonth = Math.min(Math.ceil(dayOfMonth / 7), 4);
        return `W${weekOfMonth}`;

      case 'year':
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[date.getMonth()];

      default:
        return null;
    }
  },
};
