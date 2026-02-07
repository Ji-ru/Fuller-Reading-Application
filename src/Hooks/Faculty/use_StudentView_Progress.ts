import { useEffect, useState, useMemo } from "react";
import { CommonWord, MiscueType, ProgressData, TopMiscuedPassage } from "../../Interfaces/miscue";
import { MiscueReportController } from "../../Controller/MiscueReportController";
import { MiscueReportDocument } from "../../Interfaces/dataInterfaces";
import { convertDurationToHours } from "../../Utilities/convertDurationToHours";
import { getDateRangeForTimeFilter } from "../../Utilities/dateRange";
import { getLabelForDate, getPeriodLabels, getPeriods } from "../../Utilities/activityGroupingDate";
/**
 * For fetching the specific students accuracy trends
 * 
 * @param studentId - used to get the miscue report data using the studentId 
 * @param timeRange - used to filter the accuracy trends based on week, month, and year.
 * @returns - the accuracy trends of the the specific student
 */
export const useStudentAccuracyTrends = (
  studentId: string,
  timeRange: 'week' | 'month' | 'year',
) => {
  const [chartData, setChartData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    setLoading(true);
    setError(null);

    MiscueReportController
      .getStudentProgressOverTime(studentId, timeRange)
      .then(data => setChartData(data.timeline))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId, timeRange]);

  return { chartData, loading, error };
};


interface MiscueData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Used for Common Miscue Type Pie Chart Display
 * It calculates the Miscue Type Percentages for all the Misuce Type
 * 
 * Aim:
 *  - Aims to which miscue that student has been struggling more
 * 
 * @param studentId - used to get the percentage of each miscue type from the miscue report using the studentId
 * @returns - the percentages of the students each misuce type
 */
export const useStudentMiscueStats = (studentId: string) => {
  const [reports, setReports] = useState<MiscueReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchReports = async () => {
      try {
        setLoading(true);
        const data =
          await MiscueReportController.getStudentReports(studentId);
        setReports(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [studentId]);

  // ==================== AGGREGATION ====================

  const aggregatedCounts = useMemo(() => {
    return reports.reduce(
      (acc, report) => {
        acc.substitution += report.substitutionCount ?? 0;
        acc.omission += report.omissionCount ?? 0;
        acc.insertion += report.insertionCount ?? 0;
        acc.repetition += report.repetitionCount ?? 0;
        return acc;
      },
      {
        substitution: 0,
        omission: 0,
        insertion: 0,
        repetition: 0,
      },
    );
  }, [reports]);

  const total =
    aggregatedCounts.substitution +
    aggregatedCounts.omission +
    aggregatedCounts.insertion +
    aggregatedCounts.repetition;

  // ==================== PIE CHART DATA ====================

  const miscueData: MiscueData[] = useMemo(() => {
    if (total === 0) return [];

    return [
      {
        type: 'Substitution',
        count: aggregatedCounts.substitution,
        percentage: (aggregatedCounts.substitution / total) * 100,
        color: '#FF2726',
      },
      {
        type: 'Omission',
        count: aggregatedCounts.omission,
        percentage: (aggregatedCounts.omission / total) * 100,
        color: '#FF941A',
      },
      {
        type: 'Insertion',
        count: aggregatedCounts.insertion,
        percentage: (aggregatedCounts.insertion / total) * 100,
        color: '#1A81FF',
      },
      {
        type: 'Repetition',
        count: aggregatedCounts.repetition,
        percentage: (aggregatedCounts.repetition / total) * 100,
        color: '#BF00DD',
      },
    ];
  }, [aggregatedCounts, total]);

  return {
    miscueData,
    total,
    loading,
    error,
  };
};


/**
 * Used to get the students top miscued passage and top 5 miscued words for all the passage
 * @param studentId - used to get the students miscue report 
 * @returns - top miscued passage and top 5 miscued words
 */
export const useStudentTopMiscuePassageAndWords = (studentId: string) => {
  const [reports, setReports] = useState<MiscueReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchReports = async () => {
      try {
        setLoading(true);
        const data =
          await MiscueReportController.getStudentReports(studentId);
        setReports(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [studentId]);

  // ==================== TOP MISCUED PASSAGE ====================

  const topPassage: TopMiscuedPassage | null = useMemo(() => {
    if (!reports.length) return null;

    const passageMap: Record<
      string,
      {
        totalMiscues: number;
        totalAccuracy: number;
        attempts: number;
      }
    > = {};

    reports.forEach(report => {
      const totalMiscues =
        (report.substitutionCount ?? 0) +
        (report.omissionCount ?? 0) +
        (report.insertionCount ?? 0) +
        (report.repetitionCount ?? 0);

      if (!passageMap[report.passageTitle]) {
        passageMap[report.passageTitle] = {
          totalMiscues: 0,
          totalAccuracy: 0,
          attempts: 0,
        };
      }

      passageMap[report.passageTitle].totalMiscues += totalMiscues;
      passageMap[report.passageTitle].totalAccuracy +=
        report.accuracyRate;
      passageMap[report.passageTitle].attempts += 1;
    });

    return Object.entries(passageMap)
      .map(([title, data]) => ({
        title,
        totalMiscues: data.totalMiscues,
        attempts: data.attempts,
        averageAccuracy: data.totalAccuracy / data.attempts,
      }))
      .sort((a, b) => {
        if (b.totalMiscues !== a.totalMiscues) {
          return b.totalMiscues - a.totalMiscues;
        }
        return a.averageAccuracy - b.averageAccuracy;
      })[0];
  }, [reports]);

  // ==================== TOP 5 MISCUE WORDS ====================

  const topWords: CommonWord[] = useMemo(() => {
    if (!reports.length) return [];

    const wordMap: Record<
      string,
      {
        count: number;
        typeCount: Record<MiscueType, number>;
      }
    > = {};

    reports.forEach(report => {
      report.miscues.forEach(miscue => {
        const word = miscue.expectedWord;

        if (!wordMap[word]) {
          wordMap[word] = {
            count: 0,
            typeCount: {
              substitution: 0,
              omission: 0,
              insertion: 0,
              repetition: 0,
            },
          };
        }

        wordMap[word].count += 1;
        wordMap[word].typeCount[miscue.type] += 1;
      });
    });

    return Object.entries(wordMap)
      .map(([word, data]) => {
        const dominantType = Object.entries(data.typeCount).sort(
          (a, b) => b[1] - a[1],
        )[0][0] as MiscueType;

        return {
          word,
          errorExample: '—',
          errorCount: data.count,
          dominantMiscueType:
            MiscueReportController.formatMiscueType(dominantType),
        };
      })
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 5);
  }, [reports]);

  return {
    topPassage,
    topWords,
    loading,
    error,
  };
};

interface UseStudentActiveHoursOptions {
  timeRange: 'week' | 'month' | 'year';
}

/**
 * Used to fetch all the recording duration of a student to track and monitor how much they have spent their time reading
 * @param studentId - to get the recording duration of a student using their id
 * @param options - configuration options including timeRange
 * @returns hartData, loading, error, totalHours, averageHoursPerPeriod, trendComparison
 */


export function useStudentActiveHours(
  studentId: string,
  { timeRange }: UseStudentActiveHoursOptions,
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchReports() {
      try {
        setLoading(true);
        const data =
          await MiscueReportController.getStudentReports(studentId);
        if (mounted) setReports(data);
      } catch (e: any) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchReports();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  const chartData = useMemo(() => {
    const { start, end } = getDateRangeForTimeFilter(timeRange);
    const buckets: Record<string, number> = {};

    reports.forEach(r => {
      if (!r.createdAt || !r.recordingDuration) return;

      const date = r.createdAt.toDate();

      if (date < start || date > end) return;

      const hours = convertDurationToHours(r.recordingDuration);
      if (hours <= 0) return;

      const label = getLabelForDate(date, timeRange);
      buckets[label] = (buckets[label] || 0) + hours;
    });

    // Fill all periods (week/month/year) with 0 for empty data
    const allLabels = getPeriodLabels(timeRange);
    return allLabels.map(label => ({
      day: label,
      hours: buckets[label] ?? 0,
    }));
  }, [reports, timeRange]);

  const totalHours = useMemo(
    () => chartData.reduce((sum, d) => sum + d.hours, 0),
    [chartData],
  );

  const averageHoursPerPeriod = useMemo(() => {
    const periods = getPeriods(timeRange);
    return periods === 0 ? 0 : totalHours / periods;
  }, [totalHours, timeRange]);

  const trendComparison = useMemo(() => {
    if (chartData.length < 2) return null;

    const last = chartData[chartData.length - 1].hours;
    const prev = chartData[chartData.length - 2].hours;

    const difference = last - prev;
    const percentChange =
      prev === 0 ? 0 : (difference / prev) * 100;

    return { difference, percentChange };
  }, [chartData]);

  return {
    loading,
    error,
    chartData,
    totalHours,
    averageHoursPerPeriod,
    trendComparison,
  };
}