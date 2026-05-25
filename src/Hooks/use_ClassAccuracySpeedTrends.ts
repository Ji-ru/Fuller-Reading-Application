import { useState, useEffect, useMemo } from 'react';
import { MiscueReportDocument } from '../Interfaces/dataInterfaces';
import { getDateRange } from '../Utilities/analyticsDateHelpers';
import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { MiscueReportController } from '../Controller/MiscueReportController';

interface TrendDataPoint {
  label: string;
  accuracy: number;
  wpm: number;
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

const getFacultyClasses = getFacultyClasses_Student.getFacultyClasses;

/**
 * Aggregates accuracy & WPM trends for all students in a class.
 * Groups reports by day (week), week (month), or month (year).
 */
export function use_ClassAccuracySpeedTrends(
  facultyId: string,
  classId: string,
  timeFilter: 'week' | 'month' | 'year',
  periodOffset: number = 0,
): AccuracySpeedResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassReports = async (): Promise<MiscueReportDocument[]> => {
    // Guard: skip when no classId has been selected yet
    if (!classId || !facultyId) {
      return [];
    }

    try {
      const classes = await getFacultyClasses(facultyId);
      const selectedClass = classes.find(c => c.classId === classId);

      if (!selectedClass) {
        // No class matched — return empty rather than throwing so the UI shows the empty state
        return [];
      }

      const studentIds = selectedClass.studentIds || [];
      if (studentIds.length === 0) {
        return [];
      }

      const { start, end } = getDateRange(timeFilter, periodOffset);
      const allReports: MiscueReportDocument[] = [];

      for (const studentId of studentIds) {
        const reports = await MiscueReportController.getStudentReports(studentId);
        const filteredReports = reports.filter(r => {
          const d = (r as any).timestamp?.toDate?.() || new Date((r as any).timestamp || 0);
          return d >= start && d <= end;
        });
        allReports.push(...filteredReports);
      }

      return allReports;
    } catch (e: any) {
      console.error('Class AccuracySpeedTrends fetch error:', e);
      setError(e.message || 'Failed to load data');
      return [];
    }
  };

  const [reports, setReports] = useState<MiscueReportDocument[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const classReports = await fetchClassReports();
        if (!cancelled) setReports(classReports);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [facultyId, classId, timeFilter, periodOffset]);

  const result = useMemo((): Omit<AccuracySpeedResult, 'loading' | 'error'> => {
    const chartData: TrendDataPoint[] = [];
    const { start: globalStart, end: globalEnd } = getDateRange(
      timeFilter,
      periodOffset,
    );

    const getDate = (r: MiscueReportDocument): Date => {
      return (r as any).timestamp?.toDate?.() || new Date((r as any).timestamp || 0);
    };

    // If reports is empty (no data or loading not yet done) return early
    if (!reports || reports.length === 0) {
      return { chartData, avgAccuracy: 0, avgWpm: 0, maxWpm: 1, accDelta: 0, accPct: 0, accDir: 'same', peakAccIdx: 0 };
    }

    const periodReports = reports.filter(r => {
      const d = getDate(r);
      return d >= globalStart && d <= globalEnd;
    });

    if (timeFilter === 'week') {
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
            dayReports.reduce((s, r) => s + (isFinite(r.wordPerMin) ? (r.wordPerMin || 0) : 0), 0) /
            dayReports.length;
          chartData.push({ label, accuracy: accAvg, wpm: wpmAvg });
        } else {
          chartData.push({ label, accuracy: 0, wpm: 0 });
        }
      }
    } else if (timeFilter === 'month') {
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
            weekReports.reduce((s, r) => s + (isFinite(r.wordPerMin) ? (r.wordPerMin || 0) : 0), 0) /
            weekReports.length;
          chartData.push({ label, accuracy: accAvg, wpm: wpmAvg });
        } else {
          chartData.push({ label, accuracy: 0, wpm: 0 });
        }

        cur.setDate(cur.getDate() + 7);
        weekNum++;
      }
    } else {
      const months = [
        'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob',
        'Dis', 'Ene', 'Peb', 'Mar', 'Abr', 'May',
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
            monthReports.reduce((s, r) => s + (isFinite(r.wordPerMin) ? (r.wordPerMin || 0) : 0), 0) /
            monthReports.length;
          chartData.push({ label: m, accuracy: accAvg, wpm: wpmAvg });
        } else {
          chartData.push({ label: m, accuracy: 0, wpm: 0 });
        }
      });
    }

    const withData = chartData.filter(d => d.accuracy > 0 || d.wpm > 0);
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

    // periods where there is no data
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
  }, [reports, timeFilter, periodOffset]);

  return { ...result, loading, error };
}