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
      const db = firestore();
      
      // 1. Fetch real detailed trials
      const reportSnap = await db.collection('miscueReports')
        .where('studentId', '==', studentId)
        .orderBy('timestamp', 'desc')
        .get();
      
      const realReports = reportSnap.docs.map(doc => ({
        reportId: doc.id,
        ...doc.data(),
      })) as MiscueReportDocument[];

      // 2. Fetch Alphabet Completions (Synthesize legacy if missing from reports)
      const alphaSnap = await db.collection('alphabetCompleted').where('studentId', '==', studentId).get();
      const synthesizedAlpha = alphaSnap.docs
        .filter(doc => !realReports.some(r => r.passageTitle === `Alphabet - ${doc.data().letter}`))
        .map(doc => {
          const data = doc.data();
          return {
            reportId: `syn-a-${doc.id}`,
            studentId,
            passageTitle: `Alphabet - ${data.letter}`,
            timestamp: data.createdAt || new Date(),
            accuracyRate: 100,
            wordPerMin: 0,
            totalWords: 1,
            totalMiscues: 0,
            miscues: [],
          } as unknown as MiscueReportDocument;
        });

      // 3. Fetch Word Completions (Synthesize legacy if missing from reports)
      const wordSnap = await db.collection('wordCompleted').where('studentId', '==', studentId).get();
      const synthesizedWords = wordSnap.docs
        .filter(doc => !realReports.some(r => r.passageTitle === `Words for ${doc.data().letter}`))
        .map(doc => {
          const data = doc.data();
          return {
            reportId: `syn-w-${doc.id}`,
            studentId,
            passageTitle: `Words for ${data.letter}`,
            timestamp: data.createdAt || new Date(),
            accuracyRate: 100,
            wordPerMin: 0,
            totalWords: 1,
            totalMiscues: 0,
            miscues: [],
          } as unknown as MiscueReportDocument;
        });

      return [...realReports, ...synthesizedAlpha, ...synthesizedWords].sort((a, b) => {
        const A = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
        const B = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
        return B.getTime() - A.getTime();
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

  // ================= MASTERY CHECK =================
  async getStudentMasteredLessons(studentId: string): Promise<string[]> {
    try {
      const { completedAlpha, completedWords } = await this.getStudentDetailedCompletion(studentId);

      // A lesson is "mastered" if the user has completed its alphabet step AND at least one of its words
      // (Legacy logic for compatibility, though frontend will now use detailed counts)
      const lettersWithWords = Object.keys(completedWords);
      return Array.from(completedAlpha).filter(letter => lettersWithWords.includes(letter));
    } catch (error) {
      console.error('MASTERY FETCH ERROR:', error);
      return [];
    }
  },

  async getStudentDetailedCompletion(studentId: string): Promise<{ 
    completedAlpha: Set<string>; 
    completedWords: Record<string, Set<string>>; 
    completedPassages: Set<string>;
  }> {
    try {
      const [alphaSnap, wordsSnap, reportSnap] = await Promise.all([
        firestore().collection('alphabetCompleted').where('studentId', '==', studentId).get(),
        firestore().collection('wordCompleted').where('studentId', '==', studentId).get(),
        firestore().collection('miscueReports').where('studentId', '==', studentId).get(),
      ]);

      const completedAlpha = new Set(alphaSnap.docs.map(d => d.data().letter as string));
      
      const completedWords: Record<string, Set<string>> = {};
      wordsSnap.docs.forEach(doc => {
        const data = doc.data();
        const letter = data.letter as string;
        const word = data.word as string;
        if (!completedWords[letter]) completedWords[letter] = new Set();
        completedWords[letter].add(word);
      });

      const completedPassages = new Set<string>();
      reportSnap.docs.forEach(doc => {
        const data = doc.data();
        if ((data.accuracyRate || 0) >= 90) {
          completedPassages.add(data.passageTitle as string);
        }
      });

      return { completedAlpha, completedWords, completedPassages };
    } catch (error) {
      console.error('DETAILED COMPLETION FETCH ERROR:', error);
      return { completedAlpha: new Set(), completedWords: {}, completedPassages: new Set() };
    }
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