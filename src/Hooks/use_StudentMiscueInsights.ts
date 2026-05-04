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

/**
 * Hook that computes miscue insights from miscueReports:
 * - Miscue type breakdown (Substitution, Omission, Insertion, Repetition)
 * - Top miscued passage (highest total miscues)
 * - Most miscued words (ranked by frequency, with dominant type)
 */
export function use_StudentMiscueInsights(
  studentId: string,
  timeFilter: 'week' | 'month' | 'year',
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
        const now = new Date();
        let startDate = new Date();

        if (timeFilter === 'week') {
          startDate.setDate(now.getDate() - 6);
        } else if (timeFilter === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else {
          let yr = now.getFullYear();
          if (now.getMonth() < 5) yr--;
          startDate = new Date(yr, 5, 1); // June 1 (academic year)
        }

        const snap = await firestore()
          .collection('miscueReports')
          .where('studentId', '==', studentId)
          .where('timestamp', '>=', startDate)
          .get();

        const docs = snap.docs.map(d => d.data() as MiscueReportDocument);
        setRawReports(docs);
      } catch (e: any) {
        console.error('MiscueInsights fetch error:', e);
        setError(e.message || 'Failed to load miscue data');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchData();
  }, [studentId, timeFilter]);

  // ── Merge injected (dummy) reports ──
  const allReports = useMemo(() => {
    const injected = (injectedReports || []).filter(r => r.reportId?.startsWith('dummy'));
    return [...rawReports, ...injected];
  }, [rawReports, injectedReports]);

  // ── Compute all insights ──
  const result = useMemo(() => {
    // ─── LAYER 2: Miscue Type Breakdown ──────────────────────────────────
    const typeCounts: Record<string, number> = {
      Substitution: 0,
      Omission: 0,
      Insertion: 0,
      Repetition: 0,
    };

    // Count from individual miscues[] array AND from summary counts
    allReports.forEach(r => {
      if (r.miscues && r.miscues.length > 0) {
        // Use detailed miscues array
        r.miscues.forEach(m => {
          const type = m.type?.charAt(0).toUpperCase() + m.type?.slice(1).toLowerCase();
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

    allReports.forEach(r => {
      if (!r.passageTitle) return;
      const existing = passageMap.get(r.passageTitle) || { accSum: 0, attempts: 0, miscues: 0 };
      existing.accSum += r.accuracyRate || 0;
      existing.attempts += 1;
      existing.miscues += r.totalMiscues || 0;
      passageMap.set(r.passageTitle, existing);
    });

    let topPassage: TopPassage | null = null;
    let maxMiscues = 0;

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
    const wordMap = new Map<string, { count: number; types: Record<string, number> }>();

    allReports.forEach(r => {
      if (!r.miscues) return;
      r.miscues.forEach(m => {
        const word = m.expectedWord?.toLowerCase();
        if (!word) return;

        const existing = wordMap.get(word) || { count: 0, types: {} };
        existing.count += 1;

        const type = m.type?.charAt(0).toUpperCase() + m.type?.slice(1).toLowerCase();
        existing.types[type] = (existing.types[type] || 0) + 1;

        wordMap.set(word, existing);
      });
    });

    const topWords: TopWord[] = Array.from(wordMap.entries())
      .map(([word, data]) => {
        // Find dominant miscue type for this word
        let dominantType = 'Substitution';
        let maxCount = 0;
        Object.entries(data.types).forEach(([type, count]) => {
          if (count > maxCount) {
            maxCount = count;
            dominantType = type;
          }
        });

        return {
          word,
          errorCount: data.count,
          dominantMiscueType: dominantType,
        };
      })
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 5); // Top 5

    return { miscueData, total, topPassage, topWords };
  }, [allReports]);

  return { ...result, loading, error };
}
