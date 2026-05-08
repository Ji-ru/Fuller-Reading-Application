import { useState, useEffect, useMemo } from 'react';
import { MiscueReportDocument } from '../Interfaces/dataInterfaces';
import firestore from '@react-native-firebase/firestore';

interface TrendDataPoint {
  label: string;
  accuracy: number; // 0-100
  wpm: number; // words per minute
}

interface AccuracySpeedResult {
  chartData: TrendDataPoint[];
  avgAccuracy: number;
  avgWpm: number;
  maxWpm: number;
  accDelta: number;
  accPct: number;
  accDir: 'up' | 'down' | 'same';
  peakAccIdx: number;
  loading: boolean;
  error: string | null;
}

import { getDateRange } from '../Utilities/analyticsDateHelpers';

/**
 * Aggregates accuracy & WPM trends from miscueReports.
 * Groups reports by day (week), week (month), or month (year).
 */
export function use_StudentAccuracySpeedTrends(
  studentId: string,
  timeFilter: 'week' | 'month' | 'year',
  periodOffset: number = 0,
  injectedReports?: MiscueReportDocument[],
): AccuracySpeedResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawReports, setRawReports] = useState<MiscueReportDocument[]>([]);

  // Fetch reports from Firebase
  useEffect(() => {
    const fetch = async () => {
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
      } catch (e: any) {
        console.error('AccuracySpeedTrends fetch error:', e);
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetch();
  }, [studentId, timeFilter, periodOffset, injectedReports]);

  // Merge injected (dummy) reports
  const allReports = useMemo(() => {
    // If injectedReports are provided (like from AnalyticsTab), just use them directly + dummy
    if (injectedReports && injectedReports.length > 0) {
      return injectedReports;
    }
    return rawReports;
  }, [rawReports, injectedReports]);

  // Group and calculate
  const result = useMemo((): Omit<AccuracySpeedResult, 'loading' | 'error'> => {
    const chartData: TrendDataPoint[] = [];
    const { start: globalStart, end: globalEnd } = getDateRange(
      timeFilter,
      periodOffset,
    );

    const getDate = (r: MiscueReportDocument): Date => {
      return r.timestamp?.toDate?.() || new Date(r.timestamp);
    };

    // Filter allReports to only include reports within the global range
    const periodReports = allReports.filter(r => {
      const d = getDate(r);
      return d >= globalStart && d <= globalEnd;
    });

    if (timeFilter === 'week') {
      // Group by day (7 days)
      for (let i = 0; i < 7; i++) {
        const targetStart = new Date(globalStart);
        targetStart.setDate(targetStart.getDate() + i);
        targetStart.setHours(0, 0, 0, 0);

        const targetEnd = new Date(targetStart);
        targetEnd.setHours(23, 59, 59, 999);

        const label = targetStart.toLocaleDateString('en-US', {
          weekday: 'short',
        });
        const dayReports = periodReports.filter(r => {
          const d = getDate(r);
          return d >= targetStart && d <= targetEnd;
        });

        if (dayReports.length > 0) {
          const accAvg =
            dayReports.reduce((s, r) => s + (r.accuracyRate || 0), 0) /
            dayReports.length;
          const wpmAvg =
            dayReports.reduce((s, r) => s + (r.wordPerMin || 0), 0) /
            dayReports.length;
          chartData.push({ label, accuracy: accAvg, wpm: wpmAvg });
        } else {
          chartData.push({ label, accuracy: 0, wpm: 0 });
        }
      }
    } else if (timeFilter === 'month') {
      // Group by week (up to 5 weeks)
      let cur = new Date(globalStart);
      let weekNum = 1;
      while (cur.getMonth() === globalStart.getMonth() && weekNum <= 5) {
        const weekStart = new Date(cur);
        const weekEnd = new Date(cur);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        if (weekEnd.getMonth() !== globalStart.getMonth()) {
          weekEnd.setMonth(globalStart.getMonth() + 1, 0);
        }

        const label = `Week ${weekNum}`;
        const weekReports = periodReports.filter(r => {
          const d = getDate(r);
          return d >= weekStart && d <= weekEnd;
        });

        if (weekReports.length > 0) {
          const accAvg =
            weekReports.reduce((s, r) => s + (r.accuracyRate || 0), 0) /
            weekReports.length;
          const wpmAvg =
            weekReports.reduce((s, r) => s + (r.wordPerMin || 0), 0) /
            weekReports.length;
          chartData.push({ label, accuracy: accAvg, wpm: wpmAvg });
        } else {
          chartData.push({ label, accuracy: 0, wpm: 0 });
        }

        cur.setDate(cur.getDate() + 7);
        weekNum++;
      }
    } else {
      // Group by month (academic year: Jun-May, 12 months)
      const months = [
        'Hun',
        'Hul',
        'Ago',
        'Set',
        'Okt',
        'Nob',
        'Dis',
        'Ene',
        'Peb',
        'Mar',
        'Abr',
        'May',
      ];
      let startYear = globalStart.getFullYear();

      months.forEach((m, idx) => {
        const monthIdx = (idx + 5) % 12;
        const year = monthIdx >= 5 ? startYear : startYear + 1;

        const monthReports = periodReports.filter(r => {
          const d = getDate(r);
          return d.getMonth() === monthIdx && d.getFullYear() === year;
        });

        if (monthReports.length > 0) {
          const accAvg =
            monthReports.reduce((s, r) => s + (r.accuracyRate || 0), 0) /
            monthReports.length;
          const wpmAvg =
            monthReports.reduce((s, r) => s + (r.wordPerMin || 0), 0) /
            monthReports.length;
          chartData.push({ label: m, accuracy: accAvg, wpm: wpmAvg });
        } else {
          chartData.push({ label: m, accuracy: 0, wpm: 0 });
        }
      });
    }

    // Calculate summary stats
    const withData = chartData.filter(d => d.accuracy > 0);
    const wpmWithData = chartData.filter(d => d.wpm > 0);

    const avgAccuracy =
      withData.length > 0
        ? withData.reduce((s, d) => s + d.accuracy, 0) / withData.length
        : 0;
    const avgWpm =
      wpmWithData.length > 0
        ? wpmWithData.reduce((s, d) => s + d.wpm, 0) / wpmWithData.length
        : 0;
    const maxWpm =
      wpmWithData.length > 0 ? Math.max(...wpmWithData.map(d => d.wpm)) : 1;

    // Trend calculation
    const accDelta =
      withData.length >= 2
        ? withData[withData.length - 1].accuracy - withData[0].accuracy
        : 0;
    const accPct =
      withData.length >= 2 && withData[0].accuracy > 0
        ? (accDelta / withData[0].accuracy) * 100
        : 0;
    const accDir: 'up' | 'down' | 'same' =
      accDelta >= 1 ? 'up' : accDelta <= -1 ? 'down' : 'same';

    // Peak accuracy index
    const peakAccIdx = chartData.reduce(
      (maxI, item, i, arr) => (item.accuracy > arr[maxI].accuracy ? i : maxI),
      0,
    );

    return {
      chartData,
      avgAccuracy,
      avgWpm,
      maxWpm,
      accDelta,
      accPct,
      accDir,
      peakAccIdx,
    };
  }, [allReports, timeFilter, periodOffset]);

  return { ...result, loading, error };
}
