import { useState, useEffect, useMemo } from 'react';
import { MiscueReportDocument } from '../Interfaces/dataInterfaces';
import firestore from '@react-native-firebase/firestore';

// ── Return Types ─────────────────────────────────────────────────────────────

interface MiscueTypeData {
  type: string;
  count: number;
  percentage: number;
}

interface TopPassage {
  title: string;
  averageAccuracy: number;
  attempts: number;
  totalMiscues: number;
}

interface TopWord {
  word: string;
  errorCount: number;
  dominantMiscueType: string;
  studentCount: number;
}

interface MiscueInsightsResult {
  // Layer 2: Breakdown
  miscueData: MiscueTypeData[];
  total: number;
  // Layer 3: Top Passage
  topPassage: TopPassage | null;
  // Layer 4: Top Words
  topWords: TopWord[];
  loading: boolean;
  error: string | null;
}

import { getDateRange } from '../Utilities/analyticsDateHelpers';
import { SubPeriodFilter } from '../Components/Student/DateFilter';

/**
 * Hook that computes miscue insights from miscueReports:
 * - Miscue type breakdown (Substitution, Omission, Insertion, Repetition)
 * - Top miscued passage (highest total miscues)
 * - Most miscued words (ranked by frequency, with dominant type)
 */
export function use_StudentMiscueInsights(
  studentId: string,
  timeFilter: 'week' | 'month' | 'year',
  periodOffset: number = 0,
  selectedSubFilter: SubPeriodFilter | null = null,
  injectedReports?: MiscueReportDocument[]
): MiscueInsightsResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawReports, setRawReports] = useState<MiscueReportDocument[]>([]);

  // ── Fetch from Firebase ──
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!injectedReports || injectedReports.length === 0) {
          const { start } = getDateRange(timeFilter, periodOffset);
          const snap = await firestore()
            .collection('miscueReports')
            .where('studentId', '==', studentId)
            .where('timestamp', '>=', start)
            .get();
          
          const docs = snap.docs.map(d => d.data() as MiscueReportDocument);
          setRawReports(docs);
        }
      } catch (err: any) {
        console.error('use_StudentMiscueInsights error:', err);
        setError(err.message || 'Failed to fetch miscue data');
      } finally {
        setLoading(false);
      }
    };
    if (studentId) fetchData();
  }, [studentId, timeFilter, periodOffset, injectedReports]);

  // ── Merge injected (dummy) reports ──
  const allReports = useMemo(() => {
    if (injectedReports && injectedReports.length > 0) {
      return injectedReports;
    }
    return rawReports;
  }, [rawReports, injectedReports]);

  // ── Compute all insights ──
  const result = useMemo(() => {
    // 1) Filter reports based on offset/subfilter
    const getDate = (r: MiscueReportDocument): Date => {
      return r.timestamp?.toDate?.() || new Date(r.timestamp);
    };

    const targetStart = selectedSubFilter ? selectedSubFilter.start : getDateRange(timeFilter, periodOffset).start;
    const targetEnd = selectedSubFilter ? selectedSubFilter.end : getDateRange(timeFilter, periodOffset).end;

    const filteredReports = allReports.filter(r => {
      const d = getDate(r);
      return d >= targetStart && d <= targetEnd;
    });

    // ─── LAYER 2: Miscue Type Breakdown ──────────────────────────────────
    const typeCounts: Record<string, number> = {
      Substitution: 0,
      Omission: 0,
      Insertion: 0,
      Repetition: 0,
    };

    // Count from individual miscues[] array AND from summary counts
    filteredReports.forEach(r => {
      if (r.miscues && r.miscues.length > 0) {
        // Use detailed miscues array
        r.miscues.forEach(m => {
          if (!m.type) return;
          const type = m.type.charAt(0).toUpperCase() + m.type.slice(1).toLowerCase();
          if (typeCounts[type] !== undefined) {
            typeCounts[type]++;
          }
        });
      } else {
        // Fallback to summary counts
        typeCounts.Substitution += r.substitutionCount || 0;
        typeCounts.Omission += r.omissionCount || 0;
        typeCounts.Insertion += r.insertionCount || 0;
        typeCounts.Repetition += r.repetitionCount || 0;
      }
    });

    const total = Object.values(typeCounts).reduce((s, v) => s + v, 0);

    const miscueData: MiscueTypeData[] = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count); // Highest first

    // ─── LAYER 3: Top Miscued Passage ────────────────────────────────────
    const passageMap = new Map<string, { accSum: number; attempts: number; miscues: number }>();

    filteredReports.forEach(r => {
      const title = r.passageTitle?.trim();
      if (!title) return;
      
      const existing = passageMap.get(title) || { accSum: 0, attempts: 0, miscues: 0 };
      existing.accSum += r.accuracyRate || 0;
      existing.attempts += 1;
      
      const reportTotalMiscues = r.totalMiscues !== undefined 
        ? r.totalMiscues 
        : (r.miscues ? r.miscues.length : ((r.substitutionCount || 0) + (r.omissionCount || 0) + (r.insertionCount || 0) + (r.repetitionCount || 0)));
      
      existing.miscues += reportTotalMiscues;
      passageMap.set(title, existing);
    });

    let topPassage: TopPassage | null = null;
    let maxMiscues = -1;

    passageMap.forEach((data, title) => {
      if (data.miscues > maxMiscues) {
        maxMiscues = data.miscues;
        topPassage = {
          title,
          averageAccuracy: data.attempts > 0 ? data.accSum / data.attempts : 0,
          attempts: data.attempts,
          totalMiscues: data.miscues,
        };
      }
    });

    // ─── LAYER 4: Most Miscued Words ─────────────────────────────────────
    const wordMap = new Map<
      string,
      { count: number; typeCounts: Record<string, number>; studentIds: Set<string> }
    >();

    filteredReports.forEach(r => {
      if (!r.miscues) return;
      r.miscues.forEach(m => {
        const word = m.expectedWord?.trim().toLowerCase();
        if (!word || !m.type) return;

        const existing = wordMap.get(word) || {
          count: 0,
          typeCounts: {},
          studentIds: new Set<string>(),
        };
        existing.count += 1;
        if (r.studentId) {
          existing.studentIds.add(r.studentId);
        }

        const type = m.type.charAt(0).toUpperCase() + m.type.slice(1).toLowerCase();
        existing.typeCounts[type] = (existing.typeCounts[type] || 0) + 1;

        wordMap.set(word, existing);
      });
    });

    const topWords: TopWord[] = Array.from(wordMap.entries())
      .map(([word, data]) => {
        // Find dominant miscue type for this word
        let dominantType = 'Substitution';
        let maxCount = 0;
        Object.entries(data.typeCounts).forEach(([type, count]) => {
          if (count > maxCount) {
            maxCount = count;
            dominantType = type;
          }
        });

        return {
          word,
          errorCount: data.count,
          dominantMiscueType: dominantType,
          studentCount: data.studentIds.size,
        };
      })
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 5); // Top 5

    return { miscueData, total, topPassage, topWords };
  }, [allReports, timeFilter, periodOffset, selectedSubFilter]);

  return { ...result, loading, error };
}
