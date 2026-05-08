import { Miscue } from '../Interfaces/miscue';
import { MiscueReportDocument } from '../Interfaces/dataInterfaces';
import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// ─── v22: Module-level singletons ────────────────────────────────────────────
// getFirestore() and getAuth() must be called ONCE at module level.
// Calling them repeatedly inside methods triggers a deprecation warning in v22
// and wastes resources by re-resolving the Firebase app on every call.
const db = getFirestore();
const auth = getAuth();

type QDS = FirebaseFirestoreTypes.QueryDocumentSnapshot;

export const MiscueReportController = {
  // ================= STORE REPORT =================
  async storeReport(
    passageTitle: string,
    miscues: Miscue[],
    accuracy: number,
    wordPerMin: number,
    totalWords: number,
    recordingDuration: string,
  ): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not logged in');

      const reportRef = doc(collection(db, 'miscueReports'));
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

        // NOTE: fields are stored as `expectedWord` / `spokenWord`.
        // All read paths must use these same names.
        miscues: miscues.map(m => ({
          type: m.type,
          expectedWord: m.expected,
          spokenWord: m.spoken,
        })),

        totalWords,
        accuracyRate: accuracy,
        wordPerMin,
        recordingDuration,

        substitutionCount: miscues.filter(m => m.type === 'substitution')
          .length,
        omissionCount: miscues.filter(m => m.type === 'omission').length,
        insertionCount: miscues.filter(m => m.type === 'insertion').length,
        repetitionCount: miscues.filter(m => m.type === 'repetition').length,

        timestamp: serverTimestamp(),
      };

      await setDoc(reportRef, reportData);
      console.log('✅ REPORT SAVED:', reportId);

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
      substitution: format(
        miscues.filter(m => m.type === 'substitution'),
        'expected',
      ),
      omission: format(
        miscues.filter(m => m.type === 'omission'),
        'expected',
      ),
      insertion: format(
        miscues.filter(m => m.type === 'insertion'),
        'spoken',
      ),
      repetition: format(
        miscues.filter(m => m.type === 'repetition'),
        'spoken',
      ),
    };
  },

  // ================= FETCH STUDENT REPORTS =================
  async getStudentReports(studentId: string): Promise<MiscueReportDocument[]> {
    try {
      // 1. Real detailed trials (must resolve first — used to de-duplicate synthetics below)
      const reportSnap = await getDocs(
        query(
          collection(db, 'miscueReports'),
          where('studentId', '==', studentId),
          orderBy('timestamp', 'desc'),
        ),
      );

      const realReports = reportSnap.docs.map((d: QDS) => ({
        reportId: d.id,
        ...d.data(),
      })) as MiscueReportDocument[];

      // FIX: parallelise alpha + word fetches — neither depends on the other
      const [alphaSnap, wordSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, 'alphabetCompleted'),
            where('studentId', '==', studentId),
          ),
        ),
        getDocs(
          query(
            collection(db, 'wordCompleted'),
            where('studentId', '==', studentId),
          ),
        ),
      ]);

      // 2. Synthesize Alphabet completions not already in reports
      const synthesizedAlpha = alphaSnap.docs
        .filter(
          (d: QDS) =>
            !realReports.some(
              r => r.passageTitle === `Alphabet - ${d.data().letter}`,
            ),
        )
        .map((d: QDS) => {
          const data = d.data();
          return {
            reportId: `syn-a-${d.id}`,
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

      // 3. Synthesize Word completions not already in reports
      const synthesizedWords = wordSnap.docs
        .filter(
          (d: QDS) =>
            !realReports.some(
              r => r.passageTitle === `Words for ${d.data().letter}`,
            ),
        )
        .map((d: QDS) => {
          const data = d.data();
          return {
            reportId: `syn-w-${d.id}`,
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

      return [...realReports, ...synthesizedAlpha, ...synthesizedWords].sort(
        (a: MiscueReportDocument, b: MiscueReportDocument) => {
          const A = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
          const B = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
          return B.getTime() - A.getTime();
        },
      );
    } catch (error) {
      console.error('FETCH ERROR:', error);
      return [];
    }
  },

  // ================= GROUP REPORTS BY PASSAGE =================
  groupReportsByPassage(reports: MiscueReportDocument[]) {
    const groupMap = new Map<string, MiscueReportDocument[]>();

    reports.forEach(report => {
      const title = report.passageTitle || 'Unknown Passage';
      if (!groupMap.has(title)) groupMap.set(title, []);
      groupMap.get(title)?.push(report);
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

    const docRef = doc(collection(db, 'wordCompleted'));
    await setDoc(docRef, {
      wordId: docRef.id,
      studentId: user.uid,
      letter,
      word,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async hasWordBeenCompleted(
    studentId: string,
    letter: string,
    word: string,
  ): Promise<string | null> {
    const snapshot = await getDocs(
      query(
        collection(db, 'wordCompleted'),
        where('studentId', '==', studentId),
        where('letter', '==', letter),
        where('word', '==', word),
        limit(1),
      ),
    );

    return snapshot.empty ? null : snapshot.docs[0].id;
  },

  // ================= ALPHABET STORAGE =================
  async storeAlphabetCorrectAttempt(letter: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const existing = await this.hasAlphabetBeenCompleted(user.uid, letter);
    if (existing) return existing;

    const docRef = doc(collection(db, 'alphabetCompleted'));
    await setDoc(docRef, {
      letterId: docRef.id,
      studentId: user.uid,
      letter,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  },

  async hasAlphabetBeenCompleted(
    studentId: string,
    letter: string,
  ): Promise<string | null> {
    const snapshot = await getDocs(
      query(
        collection(db, 'alphabetCompleted'),
        where('studentId', '==', studentId),
        where('letter', '==', letter),
        limit(1),
      ),
    );

    return snapshot.empty ? null : snapshot.docs[0].id;
  },

  // ================= MASTERY CHECK =================
  async getStudentMasteredLessons(studentId: string): Promise<string[]> {
    try {
      const { completedAlpha, completedWords } =
        await this.getStudentDetailedCompletion(studentId);

      const lettersWithWords = Object.keys(completedWords);
      return Array.from(completedAlpha).filter(letter =>
        lettersWithWords.includes(letter),
      );
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
        getDocs(
          query(
            collection(db, 'alphabetCompleted'),
            where('studentId', '==', studentId),
          ),
        ),
        getDocs(
          query(
            collection(db, 'wordCompleted'),
            where('studentId', '==', studentId),
          ),
        ),
        getDocs(
          query(
            collection(db, 'miscueReports'),
            where('studentId', '==', studentId),
          ),
        ),
      ]);

      const completedAlpha = new Set<string>(
        alphaSnap.docs.map((d: QDS) => d.data().letter as string),
      );

      const completedWords: Record<string, Set<string>> = {};
      wordsSnap.docs.forEach((d: QDS) => {
        const { letter, word } = d.data() as { letter: string; word: string };
        if (!completedWords[letter]) completedWords[letter] = new Set();
        completedWords[letter].add(word);
      });

      const completedPassages = new Set<string>();
      reportSnap.docs.forEach((d: QDS) => {
        const data = d.data();
        if ((data.accuracyRate || 0) >= 90) {
          completedPassages.add(data.passageTitle as string);
        }
      });

      return { completedAlpha, completedWords, completedPassages };
    } catch (error) {
      console.error('DETAILED COMPLETION FETCH ERROR:', error);
      return {
        completedAlpha: new Set(),
        completedWords: {},
        completedPassages: new Set(),
      };
    }
  },

  // ================= DEBUG HELPER =================
  async debugCheckReports(studentId: string): Promise<void> {
    const snapshot = await getDocs(
      query(
        collection(db, 'miscueReports'),
        where('studentId', '==', studentId),
      ),
    );

    console.log(
      'RAW FIRESTORE DATA:',
      snapshot.docs.map((d: QDS) => d.data()),
    );
  },

  // ================= STUDENT READING STATS =================
  async getStudentReadingStats(studentId: string) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'miscueReports'),
          where('studentId', '==', studentId),
        ),
      );

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
      const passageMap: Record<string, { total: number; attempts: number }> =
        {};

      snapshot.docs.forEach((d: QDS) => {
        const data = d.data();
        totalAccuracy += data.accuracyRate || 0;

        miscueTypeCount.substitution += data.substitutionCount || 0;
        miscueTypeCount.omission += data.omissionCount || 0;
        miscueTypeCount.insertion += data.insertionCount || 0;
        miscueTypeCount.repetition += data.repetitionCount || 0;

        if (data.miscues) {
          data.miscues.forEach(
            (m: { expectedWord?: string; spokenWord?: string }) => {
              // FIX: was `m.expected || m.spoken` — data is stored as expectedWord / spokenWord
              const word = m.expectedWord || m.spokenWord;
              if (!word) return;
              wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            },
          );
        }

        const title = data.passageTitle || 'Unknown';
        if (!passageMap[title]) passageMap[title] = { total: 0, attempts: 0 };
        passageMap[title].total += data.accuracyRate || 0;
        passageMap[title].attempts += 1;
      });

      const totalAttempts = snapshot.docs.length;

      const topMiscueType =
        Object.entries(miscueTypeCount).sort(
          (a: [string, number], b: [string, number]) => b[1] - a[1],
        )[0]?.[0] || 'None';

      const mostCommonMiscueWords = Object.entries(wordFrequency)
        .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));

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

  // ================= PROGRESS OVER TIME =================
  async getStudentProgressOverTime(studentId: string) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'miscueReports'),
          where('studentId', '==', studentId),
          orderBy('timestamp', 'asc'),
        ),
      );

      return snapshot.docs.map((d: QDS) => {
        const data = d.data();
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

  // ================= ALPHABET MASTERY ANALYTICS =================
  async getAlphabetMasteryData(studentId: string) {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'alphabetCompleted'),
          where('studentId', '==', studentId),
        ),
      );

      const masteredLetters = snap.docs.map((d: QDS) => ({
        letter: d.data().letter as string,
        timestamp:
          d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0),
      }));

      return { masteredLetters };
    } catch (error) {
      console.error('ALPHABET MASTERY DATA ERROR:', error);
      return { masteredLetters: [] };
    }
  },

  // Requires Firestore composite index: alphabetCompleted [studentId ASC, createdAt ASC]
  async getAlphabetMasteryByDateRange(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ letter: string; timestamp: Date }>> {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'alphabetCompleted'),
          where('studentId', '==', studentId),
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          where('createdAt', '<=', Timestamp.fromDate(endDate)),
        ),
      );

      return snap.docs.map((d: QDS) => ({
        letter: d.data().letter as string,
        timestamp:
          d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0),
      }));
    } catch (error) {
      console.error('ALPHABET MASTERY DATE RANGE ERROR:', error);
      return [];
    }
  },

  async getAlphabetMasteryAllTime(
    studentId: string,
  ): Promise<Array<{ letter: string; timestamp: Date }>> {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'alphabetCompleted'),
          where('studentId', '==', studentId),
        ),
      );

      return snap.docs.map((d: QDS) => ({
        letter: d.data().letter as string,
        timestamp:
          d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0),
      }));
    } catch (error) {
      console.error('ALPHABET MASTERY ALL TIME ERROR:', error);
      return [];
    }
  },

  // ================= WORD MASTERY ANALYTICS =================
  async getWordMasteryData(studentId: string) {
    try {
      const wordSnap = await getDocs(
        query(
          collection(db, 'wordCompleted'),
          where('studentId', '==', studentId),
        ),
      );

      const masteredWords = wordSnap.docs.map((d: QDS) => ({
        word: d.data().word as string,
        letter: d.data().letter as string,
        timestamp:
          d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0),
      }));

      return { masteredWords };
    } catch (error) {
      console.error('WORD MASTERY DATA ERROR:', error);
      return { masteredWords: [] };
    }
  },

  // Requires Firestore composite index: wordCompleted [studentId ASC, createdAt ASC]
  async getWordMasteryByDateRange(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ word: string; letter: string; timestamp: Date }>> {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'wordCompleted'),
          where('studentId', '==', studentId),
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          where('createdAt', '<=', Timestamp.fromDate(endDate)),
        ),
      );

      return snap.docs.map((d: QDS) => ({
        word: d.data().word as string,
        letter: d.data().letter as string,
        timestamp:
          d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0),
      }));
    } catch (error) {
      console.error('WORD MASTERY DATE RANGE ERROR:', error);
      return [];
    }
  },

  async getWordMasteryAllTime(
    studentId: string,
  ): Promise<Array<{ word: string; letter: string }>> {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'wordCompleted'),
          where('studentId', '==', studentId),
        ),
      );

      return snap.docs.map((d: QDS) => ({
        word: d.data().word as string,
        letter: d.data().letter as string,
      }));
    } catch (error) {
      console.error('WORD MASTERY ALL TIME ERROR:', error);
      return [];
    }
  },
};
