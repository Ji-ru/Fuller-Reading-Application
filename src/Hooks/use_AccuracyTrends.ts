// use_AccuracyTrends.ts
import { useState, useEffect, useCallback } from 'react';
import { FilterOptions, ProgressData } from '../Interfaces/miscue';
import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { MiscueReportController } from '../Controller/MiscueReportController';
import { getDateRangeForTimeFilter } from '../Utilities/dateRange';
import { getPeriodLabels, getLabelForDate } from '../Utilities/activityGroupingDate';

interface UseAccuracyTrendsParams {
  timeRange: 'week' | 'month' | 'year';
  filterType: 'overall' | 'class';
  classId?: string;
  academicYear?: string;
}

export interface BucketData {
  accuracySum: number;
  totalWords: number;
  totalMinutes: number;
  reportCount: number;
  studentSet: Set<string>;
}

export interface AccuracyTrendsGrandTotals {
  grandTotalWords: number;
  grandAccuracySum: number;
  grandTotalMinutes: number;
}

// ─── Shared helpers (used by both the hook and the standalone factory) ─────────

/**
 * Parses recordingDuration into decimal minutes.
 * Handles: number (seconds), "HH:MM:SS", "MM:SS", plain seconds string.
 */
export const parseDuration = (duration: any): number => {
  if (!duration) return 0;

  if (typeof duration === 'number') {
    return duration / 60;
  }

  if (typeof duration === 'string') {
    if (duration.includes(':')) {
      const parts = duration.split(':');
      if (parts.length === 2) {
        // MM:SS
        const mins = parseInt(parts[0], 10) || 0;
        const secs = parseInt(parts[1], 10) || 0;
        return mins + secs / 60;
      }
      if (parts.length === 3) {
        // HH:MM:SS
        const hours = parseInt(parts[0], 10) || 0;
        const mins  = parseInt(parts[1], 10) || 0;
        const secs  = parseInt(parts[2], 10) || 0;
        return hours * 60 + mins + secs / 60;
      }
    } else {
      const seconds = parseFloat(duration);
      if (!isNaN(seconds)) return seconds / 60;
    }
  }

  return 0;
};

export const parseReportDate = (createdAt: any): Date | null => {
  try {
    if (!createdAt) return null;
    if (createdAt.toDate && typeof createdAt.toDate === 'function') return createdAt.toDate();
    if (typeof createdAt === 'object' && createdAt.seconds) return new Date(createdAt.seconds * 1000);
    if (typeof createdAt === 'string') return new Date(createdAt);
    if (createdAt instanceof Date) return createdAt;
  } catch {
    // fall through
  }
  return null;
};

export const buildTotals = (periodLabels: string[]): Record<string, BucketData> => {
  const totals: Record<string, BucketData> = {};
  periodLabels.forEach(label => {
    totals[label] = { accuracySum: 0, totalWords: 0, totalMinutes: 0, reportCount: 0, studentSet: new Set() };
  });
  return totals;
};

/**
 * Bins a single report into the appropriate period bucket.
 * Phase 2: uses inferred elapsed minutes instead of a fake "1 minute" fallback.
 * Phase 3: wpm=0 (aborted session) is skipped; accuracy=0 is valid and counted.
 */
export const processReportIntoBucket = (
  report: any,
  timeRange: 'week' | 'month' | 'year',
  dateRange: { start: Date; end: Date },
  totals: Record<string, BucketData>,
  studentId: string,
) => {
  const reportDate = parseReportDate(report.createdAt);
  if (!reportDate) return;
  if (reportDate < dateRange.start || reportDate > dateRange.end) return;

  const wpm = report.wordPerMin || 0;
  if (wpm <= 0) return; // aborted / no timing data

  // accuracy=0 is a valid result (student read but scored 0%)
  const accuracy = report.accuracyRate ?? 0;

  const periodLabel = getLabelForDate(reportDate, timeRange);
  if (!periodLabel || !totals[periodLabel]) return;

  const minutes = parseDuration(report.recordingDuration);
  // Primary: reconstruct words from real duration. Fallback: use stored totalWords.
  const wordsRead = minutes > 0 ? wpm * minutes : report.totalWords || 0;
  if (wordsRead <= 0) return;

  // Infer elapsed minutes from stored values rather than assuming 1 minute.
  // WPM = words / min  →  min = words / WPM
  const elapsedMinutes = minutes > 0 ? minutes : wordsRead / wpm;
  if (elapsedMinutes <= 0) return;

  const bucket = totals[periodLabel];
  bucket.reportCount++;
  bucket.accuracySum  += accuracy * wordsRead; // words-weighted accuracy sum
  bucket.totalWords   += wordsRead;
  bucket.totalMinutes += elapsedMinutes;
  bucket.studentSet.add(studentId);
};

/**
 * Converts bucket totals into ProgressData[] and computes grand totals
 * needed for a correctly weighted summary average in the component.
 */
export const bucketsToResult = (
  periodLabels: string[],
  totals: Record<string, BucketData>,
): { progressData: ProgressData[] } & AccuracyTrendsGrandTotals => {
  let grandTotalWords = 0;
  let grandAccuracySum = 0;
  let grandTotalMinutes = 0;

  const progressData: ProgressData[] = periodLabels.map(label => {
    const t = totals[label] ?? { accuracySum: 0, totalWords: 0, totalMinutes: 0, reportCount: 0, studentSet: new Set() };
    grandTotalWords   += t.totalWords;
    grandAccuracySum  += t.accuracySum;
    grandTotalMinutes += t.totalMinutes;

    const accuracy = t.totalWords > 0
      ? Math.min(100, Math.max(0, t.accuracySum / t.totalWords))
      : 0;
    const avgWpm = t.totalMinutes > 0
      ? t.totalWords / t.totalMinutes
      : 0;

    return {
      date: label,
      accuracy: parseFloat(accuracy.toFixed(2)),
      wpm: parseFloat(avgWpm.toFixed(2)),
      wcpm: 0,
    };
  });

  return { progressData, grandTotalWords, grandAccuracySum, grandTotalMinutes };
};

export const emptyPeriods = (timeRange: 'week' | 'month' | 'year'): ProgressData[] =>
  getPeriodLabels(timeRange).map(label => ({ date: label, accuracy: 0, wpm: 0, wcpm: 0 }));

// ─── Hook export ──────────────────────────────────────────────────────────────

export const useAccuracyTrends = (
  facultyId: string | null | undefined,
  params: UseAccuracyTrendsParams
) => {
  const [chartData, setChartData]             = useState<ProgressData[]>([]);
  const [grandTotalWords, setGrandTotalWords]     = useState(0);
  const [grandAccuracySum, setGrandAccuracySum]   = useState(0);
  const [grandTotalMinutes, setGrandTotalMinutes] = useState(0);
  const [loading, setLoading]   = useState<boolean>(false);
  const [error, setError]       = useState<string | null>(null);

  const { getFilteredStudentIds } = getFacultyClasses_Student;
  const { getStudentReports }     = MiscueReportController;

  const fetchAccuracyData = useCallback(async () => {
    if (!facultyId) {
      setChartData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching accuracy trends for faculty: ${facultyId}, params:`, params);

      const filterOptions: FilterOptions = {
        type: params.filterType,
        ...(params.filterType === 'class' && params.classId && { classId: params.classId }),
        ...(params.academicYear && { academicYear: params.academicYear }),
      };

      const { studentIds } = await getFilteredStudentIds(facultyId, filterOptions);
      console.log(`Found ${studentIds?.length || 0} students`);

      if (!studentIds || studentIds.length === 0) {
        setChartData(emptyPeriods(params.timeRange));
        setGrandTotalWords(0); setGrandAccuracySum(0); setGrandTotalMinutes(0);
        setLoading(false);
        return;
      }

      const dateRange    = getDateRangeForTimeFilter(params.timeRange);
      const periodLabels = getPeriodLabels(params.timeRange);
      const totals       = buildTotals(periodLabels);

      // Phase 7: fetch all students' reports in parallel
      const allReports = await Promise.all(
        studentIds.map(id => getStudentReports(id).catch(() => []))
      );

      allReports.forEach((reports, si) => {
        if (!reports || reports.length === 0) return;
        reports.forEach(report =>
          processReportIntoBucket(report, params.timeRange, dateRange, totals, studentIds[si])
        );
      });

      const { progressData, grandTotalWords: gtw, grandAccuracySum: gas, grandTotalMinutes: gtm } =
        bucketsToResult(periodLabels, totals);

      console.log('Final accuracy trends data:', progressData);
      setChartData(progressData);
      setGrandTotalWords(gtw);
      setGrandAccuracySum(gas);
      setGrandTotalMinutes(gtm);
    } catch (err: any) {
      console.error('Error in useAccuracyTrends:', err);
      setError(err.message || 'Failed to fetch accuracy trends');
      setChartData(emptyPeriods(params.timeRange));
      setGrandTotalWords(0); setGrandAccuracySum(0); setGrandTotalMinutes(0);
    } finally {
      setLoading(false);
    }
  }, [facultyId, params, getFilteredStudentIds, getStudentReports]);

  useEffect(() => {
    fetchAccuracyData();
  }, [fetchAccuracyData]);

  const refetch = useCallback(() => {
    fetchAccuracyData();
  }, [fetchAccuracyData]);

  return {
    chartData,
    loading,
    error,
    refetch,
    grandTotalWords,
    grandAccuracySum,
    grandTotalMinutes,
  };
};

// ─── Standalone factory (used by use_HooksAccuracyTrends.ts) ──────────────────

export const getAccuracyTrends = () => {
  const { getFilteredStudentIds } = getFacultyClasses_Student;
  const { getStudentReports }     = MiscueReportController;

  const getStudentsAccuracy = async (
    facultyId: string,
    timeRange: 'week' | 'month' | 'year' = 'week',
    filter?: FilterOptions,
  ): Promise<{ progressData: ProgressData[] } & AccuracyTrendsGrandTotals> => {
    try {
      console.log(`Fetching accuracy trends for faculty: ${facultyId}, timeRange: ${timeRange}`);

      const { studentIds } = await getFilteredStudentIds(
        facultyId,
        filter || { type: 'overall' },
      );
      console.log(`Found ${studentIds?.length || 0} students`);

      if (!studentIds || studentIds.length === 0) {
        return {
          progressData: emptyPeriods(timeRange),
          grandTotalWords: 0,
          grandAccuracySum: 0,
          grandTotalMinutes: 0,
        };
      }

      const dateRange    = getDateRangeForTimeFilter(timeRange);
      const periodLabels = getPeriodLabels(timeRange);
      const totals       = buildTotals(periodLabels);

      // Phase 7: fetch all students' reports in parallel
      const allReports = await Promise.all(
        studentIds.map(id => getStudentReports(id).catch(() => []))
      );

      allReports.forEach((reports, si) => {
        if (!reports || reports.length === 0) return;
        reports.forEach(report =>
          processReportIntoBucket(report, timeRange, dateRange, totals, studentIds[si])
        );
      });

      const result = bucketsToResult(periodLabels, totals);
      console.log('Final accuracy trends data:', result.progressData);
      return result;
    } catch (error: any) {
      console.error('Error in getStudentsAccuracy:', error);
      throw new Error('Failed to get students accuracy trends: ' + error.message);
    }
  };

  return { getStudentsAccuracy };
};
