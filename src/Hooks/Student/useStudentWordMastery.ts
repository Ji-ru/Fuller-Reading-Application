import { useEffect, useMemo, useState } from 'react';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial_new.json';
import {
  TimeRange,
  wordSessionsByRange,
  buildWordChapterProgress,
  buildWordPeriodSlots,
  computeWordAccuracySummary,
  getDefaultSlotIndex,
  WordChapterProgress,
} from '../../Controller/SessionReportContoller';
import { WordSessionData, WordPeriodSlot, WordAccuracySummary } from '../../Interfaces/dataInterfaces';

export function useStudentWordMastery(studentId: string, timeRange: TimeRange) {
  const [sessions, setSessions] = useState<WordSessionData[]>([]);
  const [chapters, setChapters] = useState<WordChapterProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(!!studentId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let unsub: null | (() => void) = null;

    setLoading(!!studentId);
    setError(null);

    (async () => {
      try {
        const res = await wordSessionsByRange(studentId, {
          timeRange,
          onData: rows => {
            if (!alive) return;
            setSessions(rows);
            setLoading(false);
          },
          onError: e => {
            if (!alive) return;
            setError(e.message ?? 'Failed to load word sessions.');
            setLoading(false);
          },
        });  

        if (typeof res === 'function') unsub = res;
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? 'Failed to load word sessions.');
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
      unsub?.();
    };
  }, [studentId, timeRange]);

  const computedChapters = useMemo(
    () => buildWordChapterProgress(readingMaterialData as any, sessions),
    [sessions],
  );

  useEffect(() => {
    setChapters(computedChapters);
  }, [computedChapters]);

  // Period slots for bar chart (accuracy per day/week/month)
  const slots: WordPeriodSlot[] = useMemo(
    () => buildWordPeriodSlots(sessions, timeRange),
    [sessions, timeRange],
  );

  const summary: WordAccuracySummary = useMemo(
    () => computeWordAccuracySummary(slots),
    [slots],
  );

  const defaultIndex: number = useMemo(
    () => getDefaultSlotIndex(slots as any),
    [slots],
  );

  return { chapters, slots, summary, defaultIndex, loading, error };
}

