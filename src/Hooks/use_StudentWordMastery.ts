import { useState, useEffect, useMemo, useRef } from 'react';
import { MiscueReportController } from '../Controller/MiscueReportController';
import { getDateRange } from '../Utilities/analyticsDateHelpers';
import readingMaterialData from '../../assets/ReadingMaterial/ReadingMaterial.json';
import { SubPeriodFilter } from '../Components/Student/DateFilter';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WordMasteryStats {
  mastered: number;
  inProgress: number;
  new: number;
  total: number;
}

export interface AralinWordInfo {
  word: string;
  status: 'mastered' | 'tried' | 'unseen';
}

export interface WordPeriodSlot {
  label: string;
  slotStart: Date;
  slotEnd: Date;
  wordCount: number;
  words: string[];
}

// ── Slot generators (mirror alphabet mastery) ─────────────────────────────────

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
  return Array.from({ length: 10 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    return {
      label: MONTH_LABELS[d.getMonth()],
      slotStart: new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0),
      slotEnd:   new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAllWordsFromMaterial(): Set<string> {
  const all = new Set<string>();
  readingMaterialData.Words.forEach(g =>
    g.contrasts.forEach(c => c.words.forEach(w => all.add(w))),
  );
  return all;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function use_StudentWordMastery(
  studentId: string,
  timeFilter: 'week' | 'month' | 'year',
  periodOffset: number = 0,
  selectedSubFilter: SubPeriodFilter | null = null,
) {
  const [loading, setLoading] = useState(true);

  // All-time mastery map: word → letter (fetched once per screen mount)
  const [allTimeWords, setAllTimeWords] = useState<Map<string, string>>(new Map());
  const allTimeFetched = useRef(false);

  // Full period raw data WITH timestamps (always the complete period, never sub-filtered)
  const [fullPeriodRaw, setFullPeriodRaw] = useState<
    Array<{ word: string; letter: string; timestamp: Date }>
  >([]);

  // The full period range — never narrowed by selectedSubFilter
  const fullPeriodRange = useMemo(
    () => getDateRange(timeFilter, periodOffset),
    [timeFilter, periodOffset],
  );

  // ── 1. Fetch all-time mastery once ──
  useEffect(() => {
    if (!studentId || allTimeFetched.current) return;
    MiscueReportController.getWordMasteryAllTime(studentId)
      .then(data => {
        setAllTimeWords(new Map(data.map(d => [d.word, d.letter])));
        allTimeFetched.current = true;
      })
      .catch(e => console.error('Word mastery all-time fetch error:', e));
  }, [studentId]);

  // ── 2. Fetch full period once per timeFilter / periodOffset change ──
  //    selectedSubFilter does NOT trigger a re-fetch; narrowing is done client-side.
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    setLoading(true);

    MiscueReportController.getWordMasteryByDateRange(
      studentId,
      fullPeriodRange.start,
      fullPeriodRange.end,
    )
      .then(data => {
        if (cancelled) return;
        setFullPeriodRaw(data);
        setLoading(false);
      })
      .catch(e => {
        if (!cancelled) {
          console.error('Word mastery period fetch error:', e);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [studentId, fullPeriodRange]);

  // ── Derive periodWords — narrowed to selectedSubFilter if active ──
  const periodWords = useMemo(() => {
    if (!selectedSubFilter) {
      return new Set(fullPeriodRaw.map(d => d.word));
    }
    return new Set(
      fullPeriodRaw
        .filter(d =>
          d.timestamp >= selectedSubFilter.start &&
          d.timestamp <= selectedSubFilter.end,
        )
        .map(d => d.word),
    );
  }, [fullPeriodRaw, selectedSubFilter]);

  // Letters that have at least one word mastered in periodWords
  const periodLetters = useMemo(() => {
    const set = new Set<string>();
    periodWords.forEach(word => {
      const letter =
        allTimeWords.get(word) ||
        readingMaterialData.Words.find(g =>
          g.contrasts.some(c => c.words.includes(word)),
        )?.letter;
      if (letter) set.add(letter);
    });
    return set;
  }, [periodWords, allTimeWords]);

  // ── Period stats (chips) — driven by narrowed periodWords ──
  const stats = useMemo((): WordMasteryStats => {
    const total = getAllWordsFromMaterial().size;
    const mastered = periodWords.size;

    let inProgress = 0;
    periodLetters.forEach(letter => {
      const group = readingMaterialData.Words.find(g => g.letter === letter);
      if (group) {
        group.contrasts.forEach(c => {
          c.words.forEach(w => {
            if (!periodWords.has(w)) inProgress++;
          });
        });
      }
    });

    return { mastered, inProgress, new: Math.max(0, total - mastered - inProgress), total };
  }, [periodWords, periodLetters]);

  // ── Cumulative (all-time) stats — for progress bar ──
  const cumulativeStats = useMemo((): WordMasteryStats => {
    const total = getAllWordsFromMaterial().size;
    const mastered = allTimeWords.size;
    return { mastered, inProgress: 0, new: Math.max(0, total - mastered), total };
  }, [allTimeWords]);

  // Letters mastered all-time (for the green dot on letter pills)
  const cumulativeLetters = useMemo(() => {
    const set = new Set<string>();
    allTimeWords.forEach((letter) => set.add(letter));
    return set;
  }, [allTimeWords]);

  // ── Period slots — for the bar chart (always full period, no sub-filter) ──
  const periodSlots = useMemo((): WordPeriodSlot[] => {
    const rawSlots =
      timeFilter === 'week'  ? buildWeekSlots(fullPeriodRange.start)  :
      timeFilter === 'month' ? buildMonthSlots(fullPeriodRange.start) :
                               buildYearSlots(fullPeriodRange.start);

    return rawSlots.map(({ label, slotStart, slotEnd }) => {
      const slotWords = fullPeriodRaw
        .filter(d => d.timestamp >= slotStart && d.timestamp <= slotEnd)
        .map(d => d.word);

      return { label, slotStart, slotEnd, wordCount: slotWords.length, words: slotWords };
    });
  }, [fullPeriodRaw, timeFilter, fullPeriodRange]);

  // ── Word grid data for selected letter ──
  const getAralinWords = (letter: string): AralinWordInfo[] => {
    const group = readingMaterialData.Words.find(g => g.letter === letter);
    if (!group) return [];

    const isLetterActiveInPeriod = periodLetters.has(letter);
    const result: AralinWordInfo[] = [];

    group.contrasts.forEach(c => {
      c.words.forEach(w => {
        let status: 'mastered' | 'tried' | 'unseen' = 'unseen';
        if (periodWords.has(w)) {
          status = 'mastered';
        } else if (isLetterActiveInPeriod) {
          status = 'tried';
        }
        result.push({ word: w, status });
      });
    });

    return result;
  };

  const refresh = () => {
    allTimeFetched.current = false;
    setAllTimeWords(new Map());
  };

  return {
    loading,
    stats,
    cumulativeStats,
    cumulativeLetters,
    periodLetters,
    periodSlots,
    getAralinWords,
    refresh,
  };
}
