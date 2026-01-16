// hooks/useFacultyActiveHours.ts
import { useState, useEffect } from 'react';
import { getForStudentsMiscueStats } from './useForStudentMiscueStats';

interface ActiveHoursData {
  day: string;
  hours: number;
}

interface UseActiveHoursOptions {
  timeRange?: 'week' | 'quarter' | 'year';
  academicYear?: string;
}

export const useActiveHours = (facultyId: string | null) => {
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
        const data = await getActiveHours(facultyId);
        
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
  }, [facultyId]);

  return { chartData, loading, error };
};
// // hooks/useFacultyActiveHours.ts
// import { useState, useEffect } from 'react';
// import { getForStudentsMiscueStats } from './useForStudentMiscueStats';

// interface ActiveHoursData {
//   day: string;
//   hours: number;
// }

// export const useActiveHours = (
//   facultyId: string | null,
//   options: {
//     timeRange: 'week' | 'month' | 'year';
//     selectedYear: number;
//   } = {
//     timeRange: 'week',
//     selectedYear: new Date().getFullYear()
//   }
// ) => {
//   const { timeRange, selectedYear } = options;
//   const [chartData, setChartData] = useState<ActiveHoursData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [stats, setStats] = useState({
//     totalHours: 0,
//     averagePerPeriod: 0,
//     peakPeriod: '',
//     peakValue: 0
//   });

//   useEffect(() => {
//     if (!facultyId) {
//       setChartData([]);
//       setLoading(false);
//       return;
//     }

//     const fetchActiveHours = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const { getActiveHours } = getForStudentsMiscueStats();
//         const data = await getActiveHours(facultyId, timeRange, selectedYear);
        
//         // Calculate statistics
//         const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
//         const averagePerPeriod = data.length > 0 ? totalHours / data.length : 0;
        
//         let peakValue = 0;
//         let peakPeriod = '';
//         data.forEach(item => {
//           if (item.hours > peakValue) {
//             peakValue = item.hours;
//             peakPeriod = item.day;
//           }
//         });
        
//         setChartData(data);
//         setStats({
//           totalHours: parseFloat(totalHours.toFixed(2)),
//           averagePerPeriod: parseFloat(averagePerPeriod.toFixed(2)),
//           peakPeriod,
//           peakValue: parseFloat(peakValue.toFixed(2))
//         });
//       } catch (err: any) {
//         console.error('Error fetching faculty active hours:', err);
//         setError(err.message || 'Failed to fetch active hours');
//         setChartData([]);
//         setStats({
//           totalHours: 0,
//           averagePerPeriod: 0,
//           peakPeriod: '',
//           peakValue: 0
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchActiveHours();
//   }, [facultyId, timeRange, selectedYear]);

//   return { 
//     chartData, 
//     loading, 
//     error,
//     stats,
//   };
// };