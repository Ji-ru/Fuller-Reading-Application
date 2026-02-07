// hooks/useAccuracyTrends.ts
import { useState, useEffect, useMemo } from 'react';
import { ProgressData } from '../Interfaces/miscue';
import { getAccuracyTrends } from './use_AccuracyTrends';

interface UseAccuracyTrendsOptions {
  timeRange: 'week' | 'month' | 'year';
  filterType: 'overall' | 'class';
  classId?: string;
}

export const useAccuracyTrends = (
  facultyId: string | null,
  options: UseAccuracyTrendsOptions = {
    timeRange: 'week',
    filterType: 'overall',
  },
) => {
  const [chartData, setChartData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize normalized options so the effect only runs when actual values change
  const normalizedOptions = useMemo(
    () => ({
      timeRange: options.timeRange,
      filterType: options.filterType,
      classId: options.classId,
    }),
    [options.timeRange, options.filterType, options.classId],
  );

  useEffect(() => {
    if (!facultyId) {
      setChartData([]);
      setLoading(false);
      return;
    }

    const fetchAccuracyTrends = async () => {
      try {
        setLoading(true);
        setError(null);

        const { getStudentsAccuracy } = getAccuracyTrends();

        const filter =
          normalizedOptions.filterType === 'class' && normalizedOptions.classId
            ? { type: 'class' as const, classId: normalizedOptions.classId }
            : { type: 'overall' as const };

        const data = await getStudentsAccuracy(
          facultyId,
          normalizedOptions.timeRange,
          filter,
        );

        setChartData(data);
      } catch (err: any) {
        console.error('Error fetching accuracy trends:', err);
        setError(err.message || 'Failed to fetch accuracy trends');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccuracyTrends();
  }, [
    facultyId,
    normalizedOptions.timeRange,
    normalizedOptions.filterType,
    normalizedOptions.classId,
  ]);

  return { chartData, loading, error };
};
