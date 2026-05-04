import { useState, useEffect, useMemo } from 'react';
import { MiscueReportDocument } from '../Interfaces/dataInterfaces';
import firestore from '@react-native-firebase/firestore';

interface TrendDataPoint {
  label: string;
  accuracy: number;   // 0-100
  wpm: number;        // words per minute
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

/**
 * Aggregates accuracy & WPM trends from miscueReports.
 * Groups reports by day (week), week (month), or month (year).
 */
export function use_StudentAccuracySpeedTrends(
  studentId: string,
  timeFilter: 'week' | 'month' | 'year',
  injectedReports?: MiscueReportDocument[]
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
        const now = new Date();
        let startDate = new Date();

        if (timeFilter === 'week') {
          startDate.setDate(now.getDate() - 6);
        } else if (timeFilter === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else {
          let yr = now.getFullYear();
          if (now.getMonth() < 5) yr--;
          startDate = new Date(yr, 5, 1); // June 1
        }

        const snap = await firestore()
          .collection('miscueReports')
          .where('studentId', '==', studentId)
          .where('timestamp', '>=', startDate)
          .get();

        const docs = snap.docs.map(d => d.data() as MiscueReportDocument);
        setRawReports(docs);
      } catch (e: any) {
        console.error('AccuracySpeedTrends fetch error:', e);
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetch();
  }, [studentId, timeFilter]);

  // Merge injected (dummy) reports
  const allReports = useMemo(() => {
    const injected = (injectedReports || []).filter(r => r.reportId?.startsWith('dummy'));
    return [...rawReports, ...injected];
  }, [rawReports, injectedReports]);

  // Group and calculate
  const result = useMemo((): Omit<AccuracySpeedResult, 'loading' | 'error'> => {
    const now = new Date();
    const chartData: TrendDataPoint[] = [];

    const getDate = (r: MiscueReportDocument): Date => {
      return r.timestamp?.toDate?.() || new Date(r.timestamp);
    };

    if (timeFilter === 'week') {
      // Group by day (last 7 days)
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() - i);
        const dateStr = targetDate.toDateString();
        const label = targetDate.toLocaleDateString('en-US', { weekday: 'short' });

        const dayReports = allReports.filter(r => getDate(r).toDateString() === dateStr);

        if (dayReports.length > 0) {
          const accAvg = dayReports.reduce((s, r) => s + (r.accuracyRate || 0), 0) / dayReports.length;
          const wpmAvg = dayReports.reduce((s, r) => s + (r.wordPerMin || 0), 0) / dayReports.length;
          chartData.push({ label, accuracy: accAvg, wpm: wpmAvg });
        } else {
          chartData.push({ label, accuracy: 0, wpm: 0 });
        }
      }
    } else if (timeFilter === 'month') {
      // Group by week (4 weeks)
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date();
        weekEnd.setDate(now.getDate() - (i * 7));
        const weekStart = new Date();
        weekStart.setDate(now.getDate() - ((i + 1) * 7) + 1);

        const label = i === 0 ? 'Ngayon' : `Wk ${4 - i}`;
        const weekReports = allReports.filter(r => {
          const d = getDate(r);
          return d >= weekStart && d <= weekEnd;
        });

        if (weekReports.length > 0) {
          const accAvg = weekReports.reduce((s, r) => s + (r.accuracyRate || 0), 0) / weekReports.length;
          const wpmAvg = weekReports.reduce((s, r) => s + (r.wordPerMin || 0), 0) / weekReports.length;
          chartData.push({ label, accuracy: accAvg, wpm: wpmAvg });
        } else {
          chartData.push({ label, accuracy: 0, wpm: 0 });
        }
      }
    } else {
      // Group by month (academic year: Jun-Mar)
      const months = ['Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis', 'Ene', 'Peb', 'Mar'];
      let startYear = now.getFullYear();
      if (now.getMonth() < 5) startYear--;

      months.forEach((m, idx) => {
        const monthIdx = (idx + 5) % 12;
        const year = monthIdx >= 5 ? startYear : startYear + 1;

        const monthReports = allReports.filter(r => {
          const d = getDate(r);
          return d.getMonth() === monthIdx && d.getFullYear() === year;
        });

        if (monthReports.length > 0) {
          const accAvg = monthReports.reduce((s, r) => s + (r.accuracyRate || 0), 0) / monthReports.length;
          const wpmAvg = monthReports.reduce((s, r) => s + (r.wordPerMin || 0), 0) / monthReports.length;
          chartData.push({ label: m, accuracy: accAvg, wpm: wpmAvg });
        } else {
          chartData.push({ label: m, accuracy: 0, wpm: 0 });
        }
      });
    }

    // Calculate summary stats
    const withData = chartData.filter(d => d.accuracy > 0);
    const wpmWithData = chartData.filter(d => d.wpm > 0);

    const avgAccuracy = withData.length > 0
      ? withData.reduce((s, d) => s + d.accuracy, 0) / withData.length : 0;
    const avgWpm = wpmWithData.length > 0
      ? wpmWithData.reduce((s, d) => s + d.wpm, 0) / wpmWithData.length : 0;
    const maxWpm = wpmWithData.length > 0
      ? Math.max(...wpmWithData.map(d => d.wpm)) : 1;

    // Trend calculation
    const accDelta = withData.length >= 2
      ? (withData[withData.length - 1].accuracy - withData[0].accuracy) : 0;
    const accPct = withData.length >= 2 && withData[0].accuracy > 0
      ? (accDelta / withData[0].accuracy) * 100 : 0;
    const accDir: 'up' | 'down' | 'same' = accDelta >= 1 ? 'up' : accDelta <= -1 ? 'down' : 'same';

    // Peak accuracy index
    const peakAccIdx = chartData.reduce(
      (maxI, item, i, arr) => (item.accuracy > arr[maxI].accuracy ? i : maxI), 0
    );

    return { chartData, avgAccuracy, avgWpm, maxWpm, accDelta, accPct, accDir, peakAccIdx };
  }, [allReports, timeFilter]);

  return { ...result, loading, error };
}
