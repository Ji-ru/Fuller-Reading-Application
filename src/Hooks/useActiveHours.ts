// hooks/useFacultyActiveHours.ts
import { useState, useEffect } from 'react';
import { getForStudentsMiscueStats } from './useForStudentMiscueStats';

interface ActiveHoursData {
  day: string;
  hours: number;
}

interface UseActiveHoursOptions {
  timeRange: 'week' | 'month' | 'year';
}

export const useActiveHours = (
  facultyId: string | null,
  options: UseActiveHoursOptions = { timeRange: 'week' },
) => {
  const [chartData, setChartData] = useState<ActiveHoursData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facultyId) {
      setChartData([]);
      setLoading(false);
      return;
    }

    const fetchActiveHours = async () => {
      try {
        setLoading(true);
        setError(null);

        const { getActiveHours } = getForStudentsMiscueStats();
        const data = await getActiveHours(
          facultyId,
          options.timeRange,
        );

        setChartData(data);
      } catch (err: any) {
        console.error('Error fetching faculty active hours:', err);
        setError(err.message || 'Failed to fetch active hours');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveHours();
  }, [facultyId, options.timeRange]);

  return { chartData, loading, error };
};
