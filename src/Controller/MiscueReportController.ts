import { Miscue } from '../Interfaces/miscue';
import { MiscueReportDocument } from '../Interfaces/dataInterfaces';
import { getAuth } from '@react-native-firebase/auth';
import firestore, {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from '@react-native-firebase/firestore';

const auth = getAuth();
const db = getFirestore();

export const MiscueReportController = {

  // ================= STORE REPORT =================
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
      if (!user) throw new Error('User not logged in');

      const reportRef = firestore().collection('miscueReports').doc();
      const reportId = reportRef.id;

      const { substitution, omission, insertion, repetition } =
        this.generateMiscueSummary(miscues);

      const reportData = {
        reportId,
        studentId: user.uid,
        passageTitle,

        substitution,
        omission,
        insertion,
        repetition,

        miscues: miscues.map(m => ({
          type: m.type,
          expectedWord: m.expected,
          spokenWord: m.spoken,
        })),

        totalWords,
        accuracyRate: accuracy,
        wordPerMin,
        recordingDuration,

        substitutionCount: miscues.filter(m => m.type === 'substitution').length,
        omissionCount: miscues.filter(m => m.type === 'omission').length,
        insertionCount: miscues.filter(m => m.type === 'insertion').length,
        repetitionCount: miscues.filter(m => m.type === 'repetition').length,

        timestamp: new Date(),
      };

      await reportRef.set(reportData);
      console.log("✅ REPORT SAVED:", reportId);

      return reportId;
    } catch (error: any) {
      console.error('STORE ERROR:', error);
      throw error;
    }
  },

  // ================= SUMMARY =================
  generateMiscueSummary(miscues: Miscue[]) {
    const format = (arr: Miscue[], key: 'expected' | 'spoken') =>
      arr.map(m => `"${m[key]}"`).join(', ') || 'None';

    return {
      substitution: format(miscues.filter(m => m.type === 'substitution'), 'expected'),
      omission: format(miscues.filter(m => m.type === 'omission'), 'expected'),
      insertion: format(miscues.filter(m => m.type === 'insertion'), 'spoken'),
      repetition: format(miscues.filter(m => m.type === 'repetition'), 'spoken'),
    };
  },

  // ================= FETCH STUDENT REPORTS =================
  async getStudentReports(studentId: string): Promise<MiscueReportDocument[]> {
    try {
      const reportRef = collection(db, 'miscueReports');
      const q = query(reportRef, where('studentId', '==', studentId), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Return the stored miscueReports if they exist
        return snapshot.docs.map((doc: { id: any; data: () => any; }) => ({
          reportId: doc.id,
          ...doc.data(),
        })) as MiscueReportDocument[];
      }

      // If no miscueReports exist, dynamically generate "report-like" data from completed words
      const wordSnapshot = await getDocs(
        query(
          collection(db, 'wordCompleted'),
          where('studentId', '==', studentId),
          orderBy('createdAt', 'desc')
        )
      );

      return wordSnapshot.docs.map((doc: { data: () => any; }) => {
        const data = doc.data();
        return {
          reportId: data.wordId,
          studentId: studentId,
          passageTitle: data.letter || 'Unknown Passage',
          timestamp: data.createdAt || new Date(),
          accuracyRate: 100, // assume correct if wordCompleted
          wordPerMin: 0,
          recordingDuration: null,
          substitution: 'None',
          omission: 'None',
          insertion: 'None',
          repetition: 'None',
          miscues: [],
          substitutionCount: 0,
          omissionCount: 0,
          insertionCount: 0,
          repetitionCount: 0,
          totalWords: 1,
          totalMiscues: 0,
        } as unknown as MiscueReportDocument;
      });
    } catch (error) {
      console.error('FETCH ERROR:', error);
      return [];
    }
  },

  // ================= GROUP REPORTS BY PASSAGE =================
  groupReportsByPassage(reports: MiscueReportDocument[]) {
    const groupMap = new Map<string, MiscueReportDocument[]>();

    reports.forEach(report => {
      const passageTitle = report.passageTitle || 'Unknown Passage';
      if (!groupMap.has(passageTitle)) groupMap.set(passageTitle, []);
      groupMap.get(passageTitle)?.push(report);
    });

    return Array.from(groupMap.entries()).map(([passageTitle, reports]) => ({
      passageTitle,
      reports,
    }));
  },

  // ================= WORD STORAGE =================
  async storeWordCorrectAttempt(letter: string, word: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const existing = await this.hasWordBeenCompleted(user.uid, letter, word);
    if (existing) return existing;

    const docRef = firestore().collection('wordCompleted').doc();
    await docRef.set({
      wordId: docRef.id,
      studentId: user.uid,
      letter,
      word,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return docRef.id;
  },

  async hasWordBeenCompleted(studentId: string, letter: string, word: string) {
    const snapshot = await firestore()
      .collection('wordCompleted')
      .where('studentId', '==', studentId)
      .where('letter', '==', letter)
      .where('word', '==', word)
      .limit(1)
      .get();

    return snapshot.empty ? null : snapshot.docs[0].id;
  },

  // ================= ALPHABET STORAGE =================
  async storeAlphabetCorrectAttempt(letter: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const existing = await this.hasAlphabetBeenCompleted(user.uid, letter);
    if (existing) return existing;

    const docRef = firestore().collection('alphabetCompleted').doc();
    await docRef.set({
      letterId: docRef.id,
      studentId: user.uid,
      letter,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return docRef.id;
  },

  async hasAlphabetBeenCompleted(studentId: string, letter: string) {
    const snapshot = await firestore()
      .collection('alphabetCompleted')
      .where('studentId', '==', studentId)
      .where('letter', '==', letter)
      .limit(1)
      .get();

    return snapshot.empty ? null : snapshot.docs[0].id;
  },

  // ================= DEBUG HELPER =================
  async debugCheckReports(studentId: string) {
    const snapshot = await firestore()
      .collection('miscueReports')
      .where('studentId', '==', studentId)
      .get();

    console.log('RAW FIRESTORE DATA:', snapshot.docs.map(d => d.data()));
  },

  async getStudentReadingStats(studentId: string) {
    try {
      const snapshot = await firestore()
        .collection('miscueReports')
        .where('studentId', '==', studentId)
        .get();

      if (snapshot.empty) {
        return {
          totalAttempts: 0,
          averageAccuracy: 0,
          topMiscueType: 'None',
          mostCommonMiscueWords: [],
          passagePerformance: [],
        };
      }

      let totalAccuracy = 0;

      const miscueTypeCount: Record<string, number> = {
        substitution: 0,
        omission: 0,
        insertion: 0,
        repetition: 0,
      };

      const wordFrequency: Record<string, number> = {};
      const passageMap: Record<string, { total: number; attempts: number }> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();

        totalAccuracy += data.accuracyRate || 0;

        // Count miscues
        miscueTypeCount.substitution += data.substitutionCount || 0;
        miscueTypeCount.omission += data.omissionCount || 0;
        miscueTypeCount.insertion += data.insertionCount || 0;
        miscueTypeCount.repetition += data.repetitionCount || 0;

        // Count words
        if (data.miscues) {
          data.miscues.forEach((m: any) => {
            const word = m.expected || m.spoken;
            if (!word) return;
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
          });
        }

        // Passage performance
        const title = data.passageTitle || 'Unknown';
        if (!passageMap[title]) {
          passageMap[title] = { total: 0, attempts: 0 };
        }
        passageMap[title].total += data.accuracyRate || 0;
        passageMap[title].attempts += 1;
      });

      const totalAttempts = snapshot.docs.length;

      // Get top miscue type
      const topMiscueType =
        Object.entries(miscueTypeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        'None';

      // Get most common words
      const mostCommonMiscueWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));

      // Passage performance array
      const passagePerformance = Object.entries(passageMap).map(
        ([title, val]) => ({
          title,
          accuracy: val.total / val.attempts,
          attempts: val.attempts,
        }),
      );

      return {
        totalAttempts,
        averageAccuracy: Number((totalAccuracy / totalAttempts).toFixed(2)),
        topMiscueType,
        mostCommonMiscueWords,
        passagePerformance,
      };
    } catch (error) {
      console.error('STATS ERROR:', error);
      throw error;
    }
  },

  async getStudentProgressOverTime(studentId: string) {
    try {
      const snapshot = await firestore()
        .collection('miscueReports')
        .where('studentId', '==', studentId)
        .orderBy('timestamp', 'asc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          date: data.timestamp?.toDate?.().toISOString() || '',
          accuracy: Number((data.accuracyRate || 0).toFixed(2)),
          wpm: Number((data.wordPerMin || 0).toFixed(2)),
          passageTitle: data.passageTitle || 'Unknown',
        };
      });
    } catch (error) {
      console.error('PROGRESS ERROR:', error);
      throw error;
    }
  }, 
};