// Note: This is a controller/service object, not a React component or custom hook.
// React hooks (useState, useEffect, useRef, useCallback, useMemo) are not used in this file.
// Use hooks only inside React function components or hooks that start with 'use'.
import { Miscue } from '../Types/miscue';
import { MiscueReportDocument } from '../Types/dataInterfaces';
import { getAuth } from '@react-native-firebase/auth';
import firestore, {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  arrayRemove,
  arrayUnion,
} from '@react-native-firebase/firestore';

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
    recordingDuration?: string
  ): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(
          'No authenticated user found. Please sign in to save reports.',
        );
      }

      const { substitution, omission, insertion, repetition } =
        this.generateMiscueSummary(miscues);

      const reportId = firestore().collection('miscueReports').doc().id;

      const reportData: Omit<MiscueReportDocument, 'timestamp'> & {
        timestamp: any;
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
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      // ======================================================================
      // STEP 6: Store in Firestore
      // ======================================================================
      await firestore()
        .collection('miscueReports')
        .doc(reportId)
        .set(reportData);

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
  // ==========================================================================================================================
  /**
   * ==========================================================================
   * STORE CORRECT WORD PRONUNCIATION
   * ==========================================================================
   * Stores a word that has attempted to read by the student
   * @param letter - Alphabet Letter of the word
   * @param word  - Selected word attempted to read
   * @returns stores the data into the firestore and returns the Word ID
   */
  async storeWordCorrectAttempt(letter: string, word: string): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(
          'No authenticated user found. Please sign in to save reports.',
        );
      }
      // Check if this word has already been completed by this student
      const existing = await this.hasWordBeenCompleted(user.uid, letter, word);
      if (existing) {
        console.log('The Word already completed, skipping storage');
        return existing;
      }
      const wordId = firestore().collection('wordCompeleted').doc().id;
      const wordData = {
        wordId,
        studentId: user.uid,
        letter,
        word,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('wordCompeleted').doc(wordId).set(wordData);

      return wordId;
    } catch (error: any) {
      throw Error('Failed to store correct word attempt:' + error.message);
    }
  },

  /**
   * Checks if the selected and read word has been stored already
   * @param studentId
   * @param letter
   * @param word
   * @returns an empty or an existing data
   */
  async hasWordBeenCompleted(
    studentId: string,
    letter: string,
    word: string,
  ): Promise<string | null> {
    try {
      const snapshot = await firestore()
        .collection('wordCompleted')
        .where('studentId', '==', studentId)
        .where('letter', '==', letter)
        .where('word', '==', word)
        .limit(1)
        .get();

      return snapshot.empty ? null : snapshot.docs[0].id;
    } catch (error: any) {
      throw new Error('Failed to check word completed: ' + error.message);
    }
  },

  /**
   * ==========================================================================
   * STORE CORRECT ALPHABET PHONEME
   * ==========================================================================
   * Stores a word that has attempted to read by the student
   * @param letter - Selected alphabet that was read
   * @returns stores the data into the firestore and returns the Letter ID
   */
  async storeAlphabetCorrectAttempt(letter: string): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(
          'No authenticated user found. Please sign in to save reports.',
        );
      }
      // Check if this word has already been completed by this student
      const existing = await this.hasAlphabetBeenCompleted(user.uid, letter);
      if (existing) {
        console.log('The current alphabet already completed, skipping storage');
        return existing;
      }
      const letterId = firestore().collection('alphabetCompeleted').doc().id;
      const letterData = {
        letterId,
        studentId: user.uid,
        letter,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore()
        .collection('wordCompeleted')
        .doc(letterId)
        .set(letterData);

      return letterId;
    } catch (error: any) {
      throw Error('Failed to store correct word attempt:' + error.message);
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
  ): Promise<string | null> {
    try {
      const snapshot = await firestore()
        .collection('alphabetCompeleted')
        .where('studentId', '==', studentId)
        .where('letter', '==', letter)
        .limit(1)
        .get();
      return snapshot.empty ? null : snapshot.docs[0].id;
    } catch (error: any) {
      throw new Error('Failed to check alphabet completed: ' + error.message);
    }
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
  ): Promise<Array<{ word: string; letter: string; createdAt: any }>> {
    try {
      const snapshot = await firestore()
        .collection('wordCompleted')
        .where('studentId', '==', studentId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        word: doc.data().word,
        letter: doc.data().letter,
        createdAt: doc.data().createdAt,
      }));
    } catch (error: any) {
      console.error('Failed to fetch completed words:', error);
      return [];
    }
  },

  /**
   * ==========================================================================
   * GET COMPLETED ALPHABETS BY STUDENT
   * ==========================================================================
   * Retrieves all completed alphabets for a specific student
   * @param studentId - Firebase Auth UID of the student
   * @returns Array of completed alphabet letters
   */
  async getCompletedAlphabets(studentId: string): Promise<string[]> {
    try {
      const snapshot = await firestore()
        .collection('alphabetCompleted')
        .where('studentId', '==', studentId)
        .get();

      return snapshot.docs.map(doc => doc.data().letter);
    } catch (error: any) {
      console.error('Failed to fetch completed alphabets:', error);
      return [];
    }
  },

  // ==========================================================================================================================

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
        uid: doc.reportId,
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
  async getRecordingDuration(studentId: string): Promise<MiscueReportDocument[]> {
    try {
      const recordRef = collection(db, 'miscueReports');
      const studentRecordingQuery = query(recordRef, where('studentId', '==', studentId));

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
      throw new Error("Failed to fetch duration: " + error.message);
      
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

  /**
   * ==========================================================================
   * GET STUDENT READING STATISTICS
   * ==========================================================================
   * Calculates various reading statistics for a student
   * @param studentId - Firebase Auth UID of the student
   * @returns Object containing reading statistics
   */
  async getStudentReadingStats(studentId: string): Promise<{
    totalAttempts: number;
    averageAccuracy: number;
    topMiscueType: string;
    mostCommonMiscueWords: { word: string; count: number }[];
    passagePerformance: { title: string; accuracy: number; attempts: number }[];
  }> {
    try {
      // Get all miscue reports for the student
      const miscueReports = await this.getStudentReports(studentId);

      if (miscueReports.length === 0) {
        return {
          totalAttempts: 0,
          averageAccuracy: 0,
          topMiscueType: 'No data',
          mostCommonMiscueWords: [],
          passagePerformance: [],
        };
      }

      // Calculate total attempts and average accuracy
      const totalAttempts = miscueReports.length;
      const totalAccuracy = miscueReports.reduce(
        (sum, report) => sum + report.accuracyRate,
        0,
      );
      const averageAccuracy = totalAccuracy / totalAttempts;

      // Calculate miscue type frequencies
      const miscueTypeCount = {
        substitution: 0,
        omission: 0,
        insertion: 0,
        repetition: 0,
      };

      // Get all miscues from all reports
      const allMiscues: Array<{ type: string; expectedWord: string }> = [];
      miscueReports.forEach(report => {
        if (report.miscues && Array.isArray(report.miscues)) {
          report.miscues.forEach(miscue => {
            miscueTypeCount[miscue.type as keyof typeof miscueTypeCount]++;
            allMiscues.push({
              type: miscue.type,
              expectedWord: miscue.expectedWord,
            });
          });
        }
      });

      // Find top miscue type
      const topMiscueType = Object.entries(miscueTypeCount).sort(
        ([, a], [, b]) => b - a,
      )[0][0];

      // Find most common miscue words
      const wordFrequency: Record<string, number> = {};
      allMiscues.forEach(miscue => {
        if (miscue.expectedWord) {
          wordFrequency[miscue.expectedWord] =
            (wordFrequency[miscue.expectedWord] || 0) + 1;
        }
      });

      const mostCommonMiscueWords = Object.entries(wordFrequency)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 most common miscue words

      // Calculate passage performance
      const passageMap: Record<string, { accuracy: number; attempts: number }> =
        {};
      miscueReports.forEach(report => {
        if (report.passageTitle) {
          if (!passageMap[report.passageTitle]) {
            passageMap[report.passageTitle] = { accuracy: 0, attempts: 0 };
          }
          passageMap[report.passageTitle].accuracy += report.accuracyRate;
          passageMap[report.passageTitle].attempts++;
        }
      });

      const passagePerformance = Object.entries(passageMap)
        .map(([title, data]) => ({
          title,
          accuracy: data.accuracy / data.attempts,
          attempts: data.attempts,
        }))
        .sort((a, b) => b.attempts - a.attempts); // Sort by number of attempts

      return {
        totalAttempts,
        averageAccuracy: parseFloat(averageAccuracy.toFixed(2)),
        topMiscueType: this.formatMiscueType(topMiscueType),
        mostCommonMiscueWords,
        passagePerformance,
      };
    } catch (error: any) {
      console.error('Failed to get student reading stats:', error);
      throw new Error(`Failed to get reading statistics: ${error.message}`);
    }
  },

  /**
   * ==========================================================================
   * FORMAT MISCUE TYPE
   * ==========================================================================
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
   * ==========================================================================
   * GET STUDENT PROGRESS OVER TIME
   * ==========================================================================
   * Retrieves student's progress data for chart visualization
   * @param studentId - Firebase Auth UID of the student
   * @returns Array of progress data points
   */
  async getStudentProgressOverTime(studentId: string): Promise<
    Array<{
      date: string;
      accuracy: number;
      wpm: number;
      passageTitle: string;
    }>
  > {
    try {
      const snapshot = await firestore()
        .collection('miscueReports')
        .where('studentId', '==', studentId)
        .limit(20) // Last 20 attempts
        .get();

      return snapshot.docs
        .map(doc => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate();
          return {
            date: timestamp
              ? timestamp.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Unknown Date',
            accuracy: data.accuracyRate || 0,
            wpm: data.wordPerMin || 0,
            passageTitle: data.passageTitle || 'Unknown Passage',
          };
        })
        .reverse(); // Reverse to show oldest first
    } catch (error: any) {
      console.error('Failed to get student progress:', error);
      return [];
    }
  },
};
