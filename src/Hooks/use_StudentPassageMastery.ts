import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MiscueReportController } from '../Controller/MiscueReportController';
import { getDateRange } from '../Utilities/analyticsDateHelpers';
import readingMaterialData from '../../assets/ReadingMaterial/ReadingMaterial.json';
import { SubPeriodFilter } from '../Components/Student/DateFilter';
import firestore from '@react-native-firebase/firestore';

export interface PassageMasteryStats {
  mastered: number;
  tried: number;
  inProgress: number;
  new: number;
  total: number;
}

export interface AralinPassageInfo {
  title: string;
  status: 'mastered' | 'tried' | 'unseen';
}

export interface PassagePeriodSlot {
  label: string;
  slotStart: Date;
  slotEnd: Date;
  passageCount: number;
  passages: string[];
}

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

export function use_StudentPassageMastery(
  studentId: string,
  timeFilter: 'week' | 'month' | 'year',
  periodOffset: number = 0,
  selectedSubFilter: SubPeriodFilter | null = null,
) {
  const [refreshCount, setRefreshCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // All-time mastery map: title -> letter
  const [allTimePassages, setAllTimePassages] = useState<Map<string, string>>(new Map());
  // Tracks passages the student has attempted but not mastered (acc < 85)
  const [allTimeTried, setAllTimeTried] = useState<Set<string>>(new Set());
  const allTimeFetched = useRef(false);

  const [fullPeriodRaw, setFullPeriodRaw] = useState<
    Array<{ title: string; letter: string; timestamp: Date; accuracy: number }>
  >([]);

  const fullPeriodRange = useMemo(
    () => getDateRange(timeFilter, periodOffset),
    [timeFilter, periodOffset],
  );

  useEffect(() => {
    if (!studentId || (allTimeFetched.current && refreshCount === 0)) return;
    
    // Fetch all-time miscue reports for passages
    firestore().collection('miscueReports')
      .where('studentId', '==', studentId)
      .get()
      .then(snap => {
        const mastered = new Map<string, string>();
        const tried = new Set<string>();
        
        snap.docs.forEach(d => {
          const data = d.data();
          const title = data.passageTitle?.trim();
          // Filter out synthetic/alphabet/word reports
          if (title && !title.startsWith('Alphabet -') && !title.startsWith('Words for')) {
            const passageObj = readingMaterialData.Passages.find((p: any) => p.title.trim() === title);
            const letter = passageObj ? passageObj.letter : 'Unknown';
            
            if (data.accuracyRate >= 85) {
              mastered.set(title, letter);
            } else {
              tried.add(title);
            }
          }
        });
        
        setAllTimePassages(mastered);
        setAllTimeTried(tried);
        allTimeFetched.current = true;
      })
      .catch(e => console.error('Passage mastery all-time fetch error:', e));
  }, [studentId, refreshCount]);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    setLoading(true);

    firestore().collection('miscueReports')
      .where('studentId', '==', studentId)
      .get()
      .then(snap => {
        if (cancelled) return;
        
        const rawData = snap.docs.map(d => {
          const data = d.data();
          const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp || 0);
          return {
            title: data.passageTitle?.trim(),
            accuracy: data.accuracyRate,
            timestamp
          };
        }).filter(item => 
          item.title && 
          !item.title.startsWith('Alphabet -') && 
          !item.title.startsWith('Words for') &&
          item.timestamp >= fullPeriodRange.start &&
          item.timestamp <= fullPeriodRange.end
        ).map(item => {
          const passageObj = readingMaterialData.Passages.find((p: any) => p.title.trim() === item.title);
          return {
            title: item.title,
            letter: passageObj ? passageObj.letter : 'Unknown',
            timestamp: item.timestamp,
            accuracy: item.accuracy
          };
        });
        
        setFullPeriodRaw(rawData);
        setLoading(false);
      })
      .catch(e => {
        if (!cancelled) {
          console.error('Passage mastery period fetch error:', e);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [studentId, fullPeriodRange, refreshCount]);

  // Only count passages with accuracy >= 85 as mastered in period
  const periodPassages = useMemo(() => {
    const data = selectedSubFilter
      ? fullPeriodRaw.filter(d =>
          d.timestamp >= selectedSubFilter.start &&
          d.timestamp <= selectedSubFilter.end)
      : fullPeriodRaw;
    return new Set(data.filter(d => d.accuracy >= 85).map(d => d.title));
  }, [fullPeriodRaw, selectedSubFilter]);

  // Passages attempted but not mastered in period (accuracy < 85)
  const periodTriedPassages = useMemo(() => {
    const data = selectedSubFilter
      ? fullPeriodRaw.filter(d =>
          d.timestamp >= selectedSubFilter.start &&
          d.timestamp <= selectedSubFilter.end)
      : fullPeriodRaw;
    return new Set(data.filter(d => d.accuracy < 85).map(d => d.title));
  }, [fullPeriodRaw, selectedSubFilter]);

  const periodLetters = useMemo(() => {
    const set = new Set<string>();
    periodPassages.forEach(title => {
      const letter =
        allTimePassages.get(title) ||
        readingMaterialData.Passages.find((p: any) => p.title === title)?.letter;
      if (letter) set.add(letter);
    });
    return set;
  }, [periodPassages, allTimePassages]);

  const stats = useMemo((): PassageMasteryStats => {
    const total = readingMaterialData.Passages.length;
    const mastered = periodPassages.size;
    const tried = periodTriedPassages.size;

    let inProgress = 0;
    periodLetters.forEach(letter => {
      const passage = readingMaterialData.Passages.find((p: any) => p.letter === letter);
      if (passage && !periodPassages.has(passage.title) && allTimeTried.has(passage.title)) {
        inProgress++;
      }
    });

    return { 
      mastered, 
      tried,
      inProgress, 
      new: Math.max(0, total - mastered - tried - inProgress), 
      total 
    };
  }, [periodPassages, periodTriedPassages, periodLetters, allTimeTried]);

  const cumulativeStats = useMemo((): PassageMasteryStats => {
    const total = readingMaterialData.Passages.length;
    const mastered = allTimePassages.size;
    const tried = allTimeTried.size;
    let inProgress = 0;
    readingMaterialData.Passages.forEach((p: any) => {
        if (!allTimePassages.has(p.title) && allTimeTried.has(p.title)) {
            inProgress++;
        }
    });
    return { 
      mastered, 
      tried,
      inProgress, 
      new: Math.max(0, total - mastered - tried - inProgress), 
      total 
    };
  }, [allTimePassages, allTimeTried]);

  const cumulativeLetters = useMemo(() => {
    const set = new Set<string>();
    allTimePassages.forEach((letter) => set.add(letter));
    return set;
  }, [allTimePassages]);

  const periodSlots = useMemo((): PassagePeriodSlot[] => {
    const rawSlots =
      timeFilter === 'week'  ? buildWeekSlots(fullPeriodRange.start)  :
      timeFilter === 'month' ? buildMonthSlots(fullPeriodRange.start) :
                               buildYearSlots(fullPeriodRange.start);

    const visibleSlots = timeFilter === 'year'
      ? rawSlots.filter(s => s.slotStart <= new Date())
      : rawSlots;

    return visibleSlots.map(({ label, slotStart, slotEnd }) => {
      const slotPassages = fullPeriodRaw
        .filter(d => d.timestamp >= slotStart && d.timestamp <= slotEnd)
        .map(d => d.title);
      // Remove duplicates so we count unique passages per slot
      const uniquePassages = Array.from(new Set(slotPassages));

      return { label, slotStart, slotEnd, passageCount: uniquePassages.length, passages: uniquePassages };
    });
  }, [fullPeriodRaw, timeFilter, fullPeriodRange]);

  const getAralinPassages = (letter: string): AralinPassageInfo[] => {
    const subset = readingMaterialData.Passages.filter((p: any) => p.letter === letter);
    if (subset.length === 0) return [];

    return subset.map(p => {
      let status: 'mastered' | 'tried' | 'unseen' = 'unseen';
      const normalizedTitle = p.title.trim();
      if (periodPassages.has(normalizedTitle)) {
        status = 'mastered';
      } else if (periodTriedPassages.has(normalizedTitle) || allTimeTried.has(normalizedTitle)) {
        status = 'tried';
      }
      return { title: normalizedTitle, status };
    });
  };

  const refresh = useCallback(() => {
    allTimeFetched.current = false;
    setRefreshCount(prev => prev + 1);
  }, []);

  return {
    loading,
    stats,
    cumulativeStats,
    cumulativeLetters,
    periodLetters,
    periodSlots,
    getAralinPassages,
    refresh,
  };
}
