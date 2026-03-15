import { useEffect, useMemo, useState } from 'react';
import {
  TimeRange,
  AlphabetPeriodSlot,
  alphabetSessionsByRange,
  buildAlphabetPeriodSlots,
  computeAlphabetMasterySummary,
  getDefaultSlotIndex,
} from '../../Controller/SessionReportContoller';

import { AlphabetSessionData } from '../../Interfaces/dataInterfaces';

export function useStudentAlphabetMasteryTrends(studentId: string, timeRange: TimeRange) {
  const [sessions, setSessions] = useState<AlphabetSessionData[]>([]);
  const [loading, setLoading] = useState<boolean>(!!studentId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let unsub: null | (() => void) = null;

    setLoading(!!studentId);
    setError(null);

    (async () => {
      try {
        const res = await alphabetSessionsByRange(studentId, {
          timeRange,
          onData: rows => {
            if (!alive) return;
            setSessions(rows);
            setLoading(false);
          },
          onError: e => {
            if (!alive) return;
            setError(e.message ?? 'Failed to load alphabet sessions.');
            setLoading(false);
          },
        });

        if (typeof res === 'function') unsub = res;
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? 'Failed to load alphabet sessions.');
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
      unsub?.();
    };
  }, [studentId, timeRange]);

  const slots: AlphabetPeriodSlot[] = useMemo(
    () => buildAlphabetPeriodSlots(sessions, timeRange),
    [sessions, timeRange],
  );

  const summary = useMemo(
    () => computeAlphabetMasterySummary(slots),
    [slots],
  );

  const defaultIndex = useMemo(
    () => getDefaultSlotIndex(slots),
    [slots],
  );

  return { sessions, slots, summary, defaultIndex, loading, error };
}
