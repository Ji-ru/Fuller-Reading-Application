import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MiscueReportController } from '../Controller/MiscueReportController';
import { getDateRange } from '../Utilities/analyticsDateHelpers';
import readingMaterialData from '../../assets/ReadingMaterial/ReadingMaterial.json';
import { SubPeriodFilter } from '../Components/Student/DateFilter';

export interface AlphabetPeriodSlot {
  label: string;
  slotStart: Date;
  slotEnd: Date;
  correctLetters: string[];
  incorrectLetters: string[];
  correctCount: number;
  attemptedCount: number;
  /** 100 if any letters mastered in slot, null if slot is empty. */
  accuracy: number | null;
}

// ── Slot generators ───────────────────────────────────────────────────────────

function buildWeekSlots(start: Date): Array<{ label: string; slotStart: Date; slotEnd: Date }> {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return labels.map((label, i) => {
    const slotStart = new Date(start.getTime() + i * 86_400_000);
    slotStart.setHours(0, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(23, 59, 59, 999);
    return { label, slotStart, slotEnd };
  });
}

function buildMonthSlots(start: Date): Array<{ label: string; slotStart: Date; slotEnd: Date }> {
  const slots: Array<{ label: string; slotStart: Date; slotEnd: Date }> = [];
  const cur = new Date(start);
  let weekNum = 1;
  while (cur.getMonth() === start.getMonth() && weekNum <= 5) {
    const slotStart = new Date(cur);
    slotStart.setHours(0, 0, 0, 0);
    const slotEnd = new Date(cur);
    slotEnd.setDate(slotEnd.getDate() + 6);
    if (slotEnd.getMonth() !== start.getMonth()) {
      slotEnd.setMonth(start.getMonth() + 1, 0);
    }
    slotEnd.setHours(23, 59, 59, 999);
    slots.push({ label: `Wk ${weekNum}`, slotStart, slotEnd });
    cur.setDate(cur.getDate() + 7);
    weekNum++;
  }
  return slots;
}

function buildYearSlots(start: Date): Array<{ label: string; slotStart: Date; slotEnd: Date }> {
  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    return {
      label: MONTH_LABELS[d.getMonth()],
      slotStart: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0),
      slotEnd:   new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  });
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function use_StudentAlphabetMasteryTrends(
  studentId: string,
  timeFilter: 'week' | 'month' | 'year',
  periodOffset: number = 0,
  selectedSubFilter: SubPeriodFilter | null = null,
) {
  const [refreshCount, setRefreshCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allTimeLetters, setAllTimeLetters] = useState<Set<string>>(new Set());
  const allTimeFetched = useRef(false);
  const [periodRaw, setPeriodRaw] = useState<Array<{ letter: string; timestamp: Date }>>([]);

  const totalLetters: number = readingMaterialData.Alphabet.length;

  // Always fetch the FULL period — never narrowed by selectedSubFilter.
  // selectedSubFilter is handled by the component for slot highlighting only.
  const dateRange = useMemo(
    () => getDateRange(timeFilter, periodOffset),
    [timeFilter, periodOffset],
  );

  // Fetch all-time mastered letters once per screen mount
  useEffect(() => {
    if (!studentId || (allTimeFetched.current && refreshCount === 0)) return;
    MiscueReportController.getAlphabetMasteryAllTime(studentId)
      .then(data => {
        setAllTimeLetters(new Set(data.map(d => d.letter)));
        allTimeFetched.current = true;
      })
      .catch(e => console.error('Alphabet all-time fetch error:', e));
  }, [studentId, refreshCount]);

  // Re-fetch period data whenever timeFilter or periodOffset changes
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    setLoading(true);

    MiscueReportController.getAlphabetMasteryByDateRange(
      studentId,
      dateRange.start,
      dateRange.end,
    )
      .then(data => {
        if (cancelled) return;
        setPeriodRaw(data);
        setLoading(false);
      })
      .catch(e => {
        if (!cancelled) {
          console.error('Alphabet period fetch error:', e);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [studentId, dateRange, refreshCount]);

  // Build period slots — each slot knows its own date range for sync comparisons
  const periodSlots = useMemo((): AlphabetPeriodSlot[] => {
    const rawSlots =
      timeFilter === 'week'  ? buildWeekSlots(dateRange.start)  :
      timeFilter === 'month' ? buildMonthSlots(dateRange.start) :
                               buildYearSlots(dateRange.start);

    // For year view, drop months that haven't started yet so the chart doesn't
    // pad with empty future months. Past academic years are unaffected.
    const visibleSlots = timeFilter === 'year'
      ? rawSlots.filter(s => s.slotStart <= new Date())
      : rawSlots;

    return visibleSlots.map(({ label, slotStart, slotEnd }) => {
      const letters = periodRaw
        .filter(d => d.timestamp >= slotStart && d.timestamp <= slotEnd)
        .map(d => d.letter);

      return {
        label,
        slotStart,
        slotEnd,
        correctLetters: letters,
        incorrectLetters: [],
        correctCount: letters.length,
        attemptedCount: letters.length,
        accuracy: letters.length > 0 ? 100 : null,
      };
    });
  }, [periodRaw, timeFilter, dateRange]);

  // Letters mastered in the narrowed period (or full period if no sub-filter)
  const periodLetters = useMemo(() => {
    if (!selectedSubFilter) {
      return new Set(periodRaw.map(d => d.letter));
    }
    return new Set(
      periodRaw
        .filter(d => d.timestamp >= selectedSubFilter.start && d.timestamp <= selectedSubFilter.end)
        .map(d => d.letter),
    );
  }, [periodRaw, selectedSubFilter]);

  const refresh = useCallback(() => {
    allTimeFetched.current = false;
    setRefreshCount(prev => prev + 1);
  }, []);

  return {
    loading,
    periodSlots,
    periodLetters,
    allTimeLetters,
    periodCount: periodLetters.size,
    allTimeCount: allTimeLetters.size,
    totalLetters,
    refresh,
  };
}
