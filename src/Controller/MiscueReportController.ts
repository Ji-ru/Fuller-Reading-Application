// Note: This is a controller/service object, not a React component or custom hook.
// React hooks (useState, useEffect, useRef, useCallback, useMemo) are not used in this file.
// Use hooks only inside React function components or hooks that start with 'use'.
import { Miscue } from '../Interfaces/miscue';
import { MiscueReportDocument } from '../Interfaces/dataInterfaces';
import { getAuth } from '@react-native-firebase/auth';
import firestore, {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';
import { StudentProgressResult } from '../Interfaces/miscue';
import { getDateRangeForTimeFilter } from '../Utilities/dateRange';
import { ProgressData } from '../Interfaces/miscue';

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

      const reportId = firestore().collection('miscueReports').doc().id;

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
        createdAt: firestore.FieldValue.serverTimestamp(),
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
      const existing = await MiscueReportController.hasWordBeenCompleted(
        user.uid,
        letter,
        word,
      );
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
      const existing = await MiscueReportController.hasAlphabetBeenCompleted(
        user.uid,
        letter,
      );
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
  ): Array<{key: string; displayDate: string}> {
    const periods: Array<{key: string; displayDate: string}> = [];
    
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
