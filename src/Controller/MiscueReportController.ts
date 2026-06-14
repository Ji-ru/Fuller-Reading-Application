import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Miscue } from '../Interfaces/miscue';
import { MiscueReportDocument } from '../Interfaces/dataInterfaces';

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
      const user = auth().currentUser;
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

        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      await reportRef.set(reportData);
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
      const reportSnap = await firestore()
        .collection('miscueReports')
        .where('studentId', '==', studentId)
        .orderBy('timestamp', 'desc')
        .get();

      const realReports = reportSnap.docs.map(d => ({
        reportId: d.id,
        ...d.data(),
      })) as MiscueReportDocument[];

      const [alphaSnap, wordSnap] = await Promise.all([
        firestore()
          .collection('alphabetCompleted')
          .where('studentId', '==', studentId)
          .get(),
        firestore()
          .collection('wordCompleted')
          .where('studentId', '==', studentId)
          .get(),
      ]);

      const synthesizedAlpha = alphaSnap.docs
        .filter(d => {
          const letter = (d.data().letter || '').toLowerCase().trim();
          if (!letter) return false;
          // Hide generic letter report if we have a real report for this letter 
          // OR if we have a word report that belongs to this letter (contains the letter)
          return !realReports.some(r => {
            const title = r.passageTitle.toLowerCase();
            return title.includes(`alphabet - ${letter}`) || 
                   (title.includes('words for') && title.includes(letter));
          });
        })
        .map(d => {
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

      const synthesizedWords = wordSnap.docs
        .filter(d => {
          const word = (d.data().word || '').toLowerCase().trim();
          if (!word) return false;
          return !realReports.some(
            r => r.passageTitle.toLowerCase().trim() === `words for ${word}`,
          );
        })
        .map(d => {
          const data = d.data();
          return {
            reportId: `syn-w-${d.id}`,
            studentId,
            passageTitle: `Words for ${data.word}`,
            timestamp: data.createdAt || new Date(),
            accuracyRate: 100,
            wordPerMin: 0,
            totalWords: 1,
            totalMiscues: 0,
            miscues: [],
          } as unknown as MiscueReportDocument;
        });

      return [...realReports, ...synthesizedAlpha, ...synthesizedWords].sort(
        (a, b) => {
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

  // ================= WORD STORAGE =================
  async storeWordCorrectAttempt(letter: string, word: string): Promise<string> {
    const user = auth().currentUser;
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

  async hasWordBeenCompleted(
    studentId: string,
    letter: string,
    word: string,
  ): Promise<string | null> {
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
    const user = auth().currentUser;
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

  async hasAlphabetBeenCompleted(
    studentId: string,
    letter: string,
  ): Promise<string | null> {
    const snapshot = await firestore()
      .collection('alphabetCompleted')
      .where('studentId', '==', studentId)
      .where('letter', '==', letter)
      .limit(1)
      .get();

    return snapshot.empty ? null : snapshot.docs[0].id;
  },

  // ================= MASTERY CHECK =================
  async getStudentDetailedCompletion(studentId: string): Promise<{
    completedAlpha: Set<string>;
    completedWords: Record<string, Set<string>>;
    completedPassages: Set<string>;
  }> {
    try {
      const [alphaSnap, wordsSnap, reportSnap] = await Promise.all([
        firestore()
          .collection('alphabetCompleted')
          .where('studentId', '==', studentId)
          .get(),
        firestore()
          .collection('wordCompleted')
          .where('studentId', '==', studentId)
          .get(),
        firestore()
          .collection('miscueReports')
          .where('studentId', '==', studentId)
          .get(),
      ]);

      const completedAlpha = new Set<string>(
        alphaSnap.docs.map(d => d.data().letter as string),
      );

      const completedWords: Record<string, Set<string>> = {};
      wordsSnap.docs.forEach(d => {
        const { letter, word } = d.data() as { letter: string; word: string };
        if (!completedWords[letter]) completedWords[letter] = new Set();
        completedWords[letter].add(word);
      });

      const completedPassages = new Set<string>();
      reportSnap.docs.forEach(d => {
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

  // ================= ANALYTICS HELPERS =================
  async getAlphabetMasteryAllTime(
    studentId: string,
  ): Promise<Array<{ letter: string; timestamp: Date }>> {
    try {
      const [alphaSnap, reportSnap] = await Promise.all([
        firestore()
          .collection('alphabetCompleted')
          .where('studentId', '==', studentId)
          .get(),
        firestore()
          .collection('miscueReports')
          .where('studentId', '==', studentId)
          .get(),
      ]);

      const seen = new Map<string, { letter: string; timestamp: Date }>();

      // From alphabetCompleted collection
      alphaSnap.docs.forEach(d => {
        const letter = d.data().letter as string;
        const ts = d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0);
        if (letter) {
          const key = letter.toLowerCase();
          const existing = seen.get(key);
          if (!existing || ts > existing.timestamp) {
            seen.set(key, { letter, timestamp: ts });
          }
        }
      });

      // From miscueReports with "Alphabet - X" titles (only correct reads)
      reportSnap.docs.forEach(d => {
        const data = d.data();
        const title = (data.passageTitle || '') as string;
        if (title.startsWith('Alphabet - ') && (data.accuracyRate || 0) >= 100) {
          const letter = title.replace('Alphabet - ', '').trim();
          if (!letter) return;
          const ts = data.timestamp?.toDate?.() || new Date(data.timestamp || 0);
          const key = letter.toLowerCase();
          const existing = seen.get(key);
          if (!existing || ts > existing.timestamp) {
            seen.set(key, { letter, timestamp: ts });
          }
        }
      });

      return Array.from(seen.values());
    } catch (error) {
      console.error('ALPHABET MASTERY ALL TIME ERROR:', error);
      return [];
    }
  },

  async getAlphabetMasteryByDateRange(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ letter: string; timestamp: Date }>> {
    try {
      const [alphaSnap, reportSnap] = await Promise.all([
        firestore()
          .collection('alphabetCompleted')
          .where('studentId', '==', studentId)
          .get(),
        firestore()
          .collection('miscueReports')
          .where('studentId', '==', studentId)
          .get(),
      ]);

      const letterMap = new Map<string, { letter: string; timestamp: Date }>();

      // From alphabetCompleted
      alphaSnap.docs.forEach(d => {
        const letter = d.data().letter as string;
        const ts = d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0);
        if (ts >= startDate && ts <= endDate && letter) {
          const key = letter.toLowerCase();
          const existing = letterMap.get(key);
          if (!existing || ts > existing.timestamp) {
            letterMap.set(key, { letter, timestamp: ts });
          }
        }
      });

      // From miscueReports with "Alphabet - X" titles (only correct reads)
      reportSnap.docs.forEach(d => {
        const data = d.data();
        const title = (data.passageTitle || '') as string;
        if (title.startsWith('Alphabet - ') && (data.accuracyRate || 0) >= 100) {
          const letter = title.replace('Alphabet - ', '').trim();
          if (!letter) return;
          const ts = data.timestamp?.toDate?.() || new Date(data.timestamp || 0);
          if (ts >= startDate && ts <= endDate) {
            const key = letter.toLowerCase();
            const existing = letterMap.get(key);
            if (!existing || ts > existing.timestamp) {
              letterMap.set(key, { letter, timestamp: ts });
            }
          }
        }
      });

      return Array.from(letterMap.values());
    } catch (error) {
      console.error('ALPHABET MASTERY DATE RANGE ERROR:', error);
      return [];
    }
  },

  async getWordMasteryAllTime(
    studentId: string,
  ): Promise<Array<{ word: string; letter: string }>> {
    try {
      const [wordSnap, reportSnap] = await Promise.all([
        firestore()
          .collection('wordCompleted')
          .where('studentId', '==', studentId)
          .get(),
        firestore()
          .collection('miscueReports')
          .where('studentId', '==', studentId)
          .get(),
      ]);

      const seen = new Map<string, string>();

      // From wordCompleted collection
      wordSnap.docs.forEach(d => {
        const word = d.data().word as string;
        const letter = d.data().letter as string;
        if (word && !seen.has(word.toLowerCase())) {
          seen.set(word.toLowerCase(), letter);
        }
      });

      // From miscueReports with "Words for X" titles (only correct reads)
      reportSnap.docs.forEach(d => {
        const data = d.data();
        const title = (data.passageTitle || '') as string;
        if (title.startsWith('Words for ') && (data.accuracyRate || 0) >= 100) {
          const word = title.replace('Words for ', '').trim();
          if (word && !seen.has(word.toLowerCase())) {
            // Try to find the letter from reading material
            const group = require('../../assets/ReadingMaterial/ReadingMaterial.json').Words.find(
              (g: any) => g.contrasts.some((c: any) => 
                c.words.some((w: string) => w.toLowerCase() === word.toLowerCase())
              )
            );
            seen.set(word.toLowerCase(), group?.letter || word.charAt(0).toUpperCase());
          }
        }
      });

      return Array.from(seen.entries()).map(([word, letter]) => ({ word, letter }));
    } catch (error) {
      console.error('WORD MASTERY ALL TIME ERROR:', error);
      return [];
    }
  },

  async getWordMasteryByDateRange(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ word: string; letter: string; timestamp: Date }>> {
    try {
      const [wordSnap, reportSnap] = await Promise.all([
        firestore()
          .collection('wordCompleted')
          .where('studentId', '==', studentId)
          .get(),
        firestore()
          .collection('miscueReports')
          .where('studentId', '==', studentId)
          .get(),
      ]);

      // Map: lowercase word -> { word, letter, timestamp } (keep latest timestamp)
      const wordMap = new Map<string, { word: string; letter: string; timestamp: Date }>();

      // From wordCompleted
      wordSnap.docs.forEach(d => {
        const word = d.data().word as string;
        const letter = d.data().letter as string;
        const ts = d.data().createdAt?.toDate?.() || new Date(d.data().createdAt || 0);
        if (ts >= startDate && ts <= endDate) {
          const key = word.toLowerCase();
          const existing = wordMap.get(key);
          if (!existing || ts > existing.timestamp) {
            wordMap.set(key, { word, letter, timestamp: ts });
          }
        }
      });

      // From miscueReports with "Words for X" titles (only correct reads)
      reportSnap.docs.forEach(d => {
        const data = d.data();
        const title = (data.passageTitle || '') as string;
        if (title.startsWith('Words for ') && (data.accuracyRate || 0) >= 100) {
          const word = title.replace('Words for ', '').trim();
          if (!word) return;
          const ts = data.timestamp?.toDate?.() || new Date(data.timestamp || 0);
          if (ts >= startDate && ts <= endDate) {
            const key = word.toLowerCase();
            const existing = wordMap.get(key);
            if (!existing || ts > existing.timestamp) {
              // Find the letter from reading material
              const group = require('../../assets/ReadingMaterial/ReadingMaterial.json').Words.find(
                (g: any) => g.contrasts.some((c: any) =>
                  c.words.some((w: string) => w.toLowerCase() === key)
                )
              );
              wordMap.set(key, {
                word,
                letter: existing?.letter || group?.letter || word.charAt(0).toUpperCase(),
                timestamp: ts,
              });
            }
          }
        }
      });

      return Array.from(wordMap.values());
    } catch (error) {
      console.error('WORD MASTERY DATE RANGE ERROR:', error);
      return [];
    }
  },

  // ================= STUDENT READING STATS =================
  async getStudentReadingStats(studentId: string) {
    try {
      const snap = await firestore()
        .collection('miscueReports')
        .where('studentId', '==', studentId)
        .get();

      if (snap.empty) {
        return {
          totalAttempts: 0,
          averageAccuracy: 0,
          topMiscueType: 'None',
          mostCommonMiscueWords: [],
          passagePerformance: [],
        };
      }

      const reports = snap.docs.map(d => d.data());
      const totalAttempts = reports.length;
      const totalAccuracy = reports.reduce((sum, r) => sum + (r.accuracyRate || 0), 0);
      const averageAccuracy = Math.round((totalAccuracy / totalAttempts) * 10) / 10;

      // Count miscue types
      const miscueCounts: Record<string, number> = {};
      const wordCounts: Record<string, number> = {};

      reports.forEach(r => {
        (r.miscues || []).forEach((m: any) => {
          const type = m.type || 'unknown';
          miscueCounts[type] = (miscueCounts[type] || 0) + 1;
          const word = m.expectedWord || m.spokenWord || '';
          if (word && word !== '[OMITTED]' && word !== '[EXTRA]') {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          }
        });
      });

      const topMiscueType = Object.entries(miscueCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

      const mostCommonMiscueWords = Object.entries(wordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));

      // Passage performance
      const passageMap: Record<string, { total: number; count: number }> = {};
      reports.forEach(r => {
        const title = r.passageTitle || 'Unknown';
        if (!passageMap[title]) passageMap[title] = { total: 0, count: 0 };
        passageMap[title].total += r.accuracyRate || 0;
        passageMap[title].count += 1;
      });

      const passagePerformance = Object.entries(passageMap)
        .map(([title, { total, count }]) => ({
          title,
          accuracy: Math.round((total / count) * 10) / 10,
          attempts: count,
        }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 10);

      return {
        totalAttempts,
        averageAccuracy,
        topMiscueType,
        mostCommonMiscueWords,
        passagePerformance,
      };
    } catch (error) {
      console.error('GET STUDENT READING STATS ERROR:', error);
      return {
        totalAttempts: 0,
        averageAccuracy: 0,
        topMiscueType: 'None',
        mostCommonMiscueWords: [],
        passagePerformance: [],
      };
    }
  },

  // ================= STUDENT PROGRESS OVER TIME =================
  async getStudentProgressOverTime(studentId: string) {
    try {
      const snap = await firestore()
        .collection('miscueReports')
        .where('studentId', '==', studentId)
        .orderBy('timestamp', 'asc')
        .get();

      return snap.docs.map(d => {
        const data = d.data();
        const ts = data.timestamp?.toDate?.() || new Date(data.timestamp || 0);
        return {
          date: ts.toISOString().split('T')[0],
          accuracy: data.accuracyRate || 0,
          wpm: data.wordPerMin || 0,
          passageTitle: data.passageTitle || 'Unknown',
        };
      });
    } catch (error) {
      console.error('GET STUDENT PROGRESS OVER TIME ERROR:', error);
      return [];
    }
  },

  // ================= STUDENT MASTERED LESSONS =================
  async getStudentMasteredLessons(studentId: string) {
    try {
      const completion = await this.getStudentDetailedCompletion(studentId);
      return {
        completedAlpha: Array.from(completion.completedAlpha),
        completedWords: Object.fromEntries(
          Object.entries(completion.completedWords).map(([k, v]) => [k, Array.from(v)])
        ),
        completedPassages: Array.from(completion.completedPassages),
      };
    } catch (error) {
      console.error('GET STUDENT MASTERED LESSONS ERROR:', error);
      return {
        completedAlpha: [],
        completedWords: {},
        completedPassages: [],
      };
    }
  },

  async getWordMasteryData(
    studentId: string,
  ): Promise<{ masteredWords: Array<{ word: string; letter: string; timestamp: Date }> }> {
    const mastered = await this.getWordMasteryAllTime(studentId);
    return {
      masteredWords: mastered.map(m => ({
        word: m.word,
        letter: m.letter,
        timestamp: new Date(),
      })),
    };
  },
};
