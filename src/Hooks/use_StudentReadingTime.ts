import { useState, useEffect, useMemo } from 'react';
import firestore from '@react-native-firebase/firestore';

interface DailySession {
  passagesReadCount?: number;
  [key: string]: any;
}

interface ReadingTimeDataPoint {
  label: string;
  count: number;
}

export function use_StudentReadingTime(studentId: string, timeFilter: 'week' | 'month' | 'year') {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReadingTimeDataPoint[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    const fetchReadingSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        let startDate = new Date();

        // Determine date range based on filter
        if (timeFilter === 'week') {
          startDate.setDate(now.getDate() - 6); // Last 7 days
        } else if (timeFilter === 'month') {
          startDate.setMonth(now.getMonth() - 1); // Last 30 days
        } else {
          // Current Academic Year (June 1 to March 31)
          let currentYear = now.getFullYear();
          if (now.getMonth() < 5) currentYear--; // If currently Jan-May, SY started last year
          startDate = new Date(currentYear, 5, 1); // June 1st
        }

        const snapshot = await firestore()
          .collection('studentAnalytics')
          .doc(studentId)
          .collection('dailySessions')
          .where(firestore.FieldPath.documentId(), '>=', startDate.toISOString().split('T')[0])
          .get();

        const sessionMap: Record<string, number> = {};
        snapshot.docs.forEach(doc => {
          const count = doc.data().passagesReadCount || 0;
          sessionMap[doc.id] = count;
        });

        // Grouping logic
        const result: ReadingTimeDataPoint[] = [];
        let runningTotal = 0;

        if (timeFilter === 'week') {
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-US', { weekday: 'short' });
            const count = sessionMap[key] || 0;
            result.push({ label, count });
            runningTotal += count;
          }
        } else if (timeFilter === 'month') {
          // Group by 4 weeks
          for (let i = 3; i >= 0; i--) {
            const weekEnd = new Date();
            weekEnd.setDate(now.getDate() - (i * 7));
            const weekStart = new Date();
            weekStart.setDate(now.getDate() - ((i + 1) * 7) + 1);

            let weekCount = 0;
            snapshot.docs.forEach(doc => {
              const d = new Date(doc.id);
              if (d >= weekStart && d <= weekEnd) {
                weekCount += (doc.data().passagesReadCount || 0);
              }
            });

            result.push({ label: i === 0 ? 'Ngayon' : `Wk ${4-i}`, count: weekCount });
            runningTotal += weekCount;
          }
        } else {
          // Group by months (Jun - Mar)
          const months = ['Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis', 'Ene', 'Peb', 'Mar'];
          let startYear = startDate.getFullYear();
          
          months.forEach((m, idx) => {
            const monthIdx = (idx + 5) % 12; // June is 5
            const year = monthIdx >= 5 ? startYear : startYear + 1;
            
            let monthCount = 0;
            snapshot.docs.forEach(doc => {
              const d = new Date(doc.id);
              if (d.getMonth() === monthIdx && d.getFullYear() === year) {
                monthCount += (doc.data().passagesReadCount || 0);
              }
            });

            result.push({ label: m, count: monthCount });
            runningTotal += monthCount;
          });
        }

        setData(result);
        setTotalSessions(runningTotal);
      } catch (err: any) {
        console.error('Error fetching reading time:', err);
        setError(err.message || 'Failed to load reading data');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchReadingSessions();
  }, [studentId, timeFilter]);

  return { data, totalSessions, loading, error };
}
