/**
 * useStudentTotalActivityToday
 *
 * Fetches today's Alphabet, Word, and Passage accuracy for a single student.
 *
 * ── How each metric is derived ──
 *
 * Alphabet
 *   Source: `alphabetSessions` collection (one doc per student per day).
 *   Today's session is identified by matching `dateKey === todayKey`.
 *   Accuracy = correctCount / attemptedCount × 100.
 *
 * Word
 *   Source: `wordSessions` collection (one doc per student per day).
 *   Today's session is identified by matching `dateKey === todayKey`.
 *   Accuracy = totals.correct / totals.attempted × 100.
 *
 * Passage
 *   Source: `miscueReports` collection (one doc per passage reading).
 *   Multiple reports may exist for the same day.
 *   Filter: `createdAt` falls between start-of-today and end-of-today.
 *   Accuracy = avg(accuracyRate) across all reports today.
 *
 * Overall
 *   = average of the three individual percentages (0 when no session).
 *
 * ── Important notes ──
 *   • Uses the Modular Firebase API (React Native Firebase v22).
 *   • Alphabet & Word are fetched via direct Firestore `getDoc` because the
 *     doc ID is deterministic (`${studentId}_${todayKey}`).
 *   • Passage uses a `query` + `getDocs` because there is no single-doc
 *     convention for passage readings; multiple docs can exist per day.
 *   • All three listeners are one-shot (no realtime) because the component
 *     is a quick-glance card, not a live dashboard.
 */

import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from '@react-native-firebase/firestore';
import { makeTodayKey } from '../../Utilities/currentDateUtils';

// ============================================================================
// TYPES
// ============================================================================

export interface TotalActivityTodayData {
  /** 0–100 accuracy for each category (null = no activity today) */
  alphabetAccuracy: number | null;
  wordAccuracy: number | null;
  passageAccuracy: number | null;

  /** Average of the three (treating null as 0) */
  overallPercent: number;

  loading: boolean;
  error: string | null;
}

// ============================================================================
// HOOK
// ============================================================================

export function useStudentTotalActivityToday(
  studentId: string,
): TotalActivityTodayData {
  const [alphabetAccuracy, setAlphabetAccuracy] = useState<number | null>(null);
  const [wordAccuracy, setWordAccuracy] = useState<number | null>(null);
  const [passageAccuracy, setPassageAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(!!studentId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchTodayActivity = async () => {
      try {
        setLoading(true);
        setError(null);

        const db = getFirestore();
        const todayKey = makeTodayKey();

        // ── 1. Alphabet ─────────────────────────────────────────────────
        // Doc ID convention: `${studentId}_${YYYYMMDD}`
        const alphabetDocRef = doc(db, 'alphabetSessions', `${studentId}_${todayKey}`);
        const alphabetSnap = await getDoc(alphabetDocRef);

        let alphaAcc: number | null = null;
        if (alphabetSnap.exists()) {
          const data = alphabetSnap.data();
          const attempted = Number(data?.attemptedCount ?? 0);
          const correct = Number(data?.correctCount ?? 0);
          if (attempted > 0) {
            alphaAcc = Math.round((correct / attempted) * 100);
          }
        }

        // ── 2. Word ─────────────────────────────────────────────────────
        // Doc ID convention: `${studentId}_${YYYYMMDD}`
        const wordDocRef = doc(db, 'wordSessions', `${studentId}_${todayKey}`);
        const wordSnap = await getDoc(wordDocRef);

        let wrdAcc: number | null = null;
        if (wordSnap.exists()) {
          const data = wordSnap.data();
          const attempted = Number(data?.totals?.attempted ?? 0);
          const correct = Number(data?.totals?.correct ?? 0);
          if (attempted > 0) {
            wrdAcc = Math.round((correct / attempted) * 100);
          }
        }

        // ── 3. Passage ──────────────────────────────────────────────────
        // miscueReports use a Firestore Timestamp (`createdAt`), not a dateKey.
        // We query for all reports created between start and end of today.
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const passageQuery = query(
          collection(db, 'miscueReports'),
          where('studentId', '==', studentId),
          where('createdAt', '>=', Timestamp.fromDate(todayStart)),
          where('createdAt', '<=', Timestamp.fromDate(todayEnd)),
        );

        const passageSnap = await getDocs(passageQuery);

        let psgAcc: number | null = null;
        if (!passageSnap.empty) {
          let totalAccuracy = 0;
          let reportCount = 0;
          for (const docSnap of passageSnap.docs) {
            const data = docSnap.data();
            const accuracy = Number(data?.accuracyRate ?? 0);
            totalAccuracy += accuracy;
            reportCount += 1;
          }
          if (reportCount > 0) {
            psgAcc = Math.round(totalAccuracy / reportCount);
          }
        }

        // ── Commit state ────────────────────────────────────────────────
        if (!cancelled) {
          setAlphabetAccuracy(alphaAcc);
          setWordAccuracy(wrdAcc);
          setPassageAccuracy(psgAcc);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load today\'s activity.');
          setLoading(false);
        }
      }
    };

    fetchTodayActivity();

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  // ── Overall % ───────────────────────────────────────────────────────────
  // Average of three categories. Categories with no activity count as 0.
  const overallPercent = Math.round(
    ((alphabetAccuracy ?? 0) + (wordAccuracy ?? 0) + (passageAccuracy ?? 0)) / 3,
  );

  return {
    alphabetAccuracy,
    wordAccuracy,
    passageAccuracy,
    overallPercent,
    loading,
    error,
  };
}
