import { useEffect, useState } from 'react';
import { Timestamp, where } from '@react-native-firebase/firestore';
import { FilterOptions } from '../../Interfaces/miscue';
import { getFacultyClasses_Student } from '../use_FacultyClasses_Students';
import { batchGetDocsByStudentIds } from '../../Utils/batchInQuery';

export interface CalendarDay {
  date: Date;
  dateKey: string;
  dayOfMonth: number;
  sessionCount: number;
  studentCount: number;
  intensity: 0 | 1 | 2 | 3;
  isWeekend: boolean;
  isFuture: boolean;
  isInMonth: boolean;
}

export interface CalendarHeatmapData {
  month: Date;
  monthLabel: string;
  weeks: CalendarDay[][];
  totalSessions: number;
  activeDays: number;
  peakDay: CalendarDay | null;
}

const toDateKey = (d: Date): string => {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

const normalizeToDate = (value: any): Date | null => {
  try {
    if (value?.toDate) return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  } catch {
    return null;
  }
  return null;
};

export const useReadingCalendarHeatmap = (
  facultyId: string | null,
  filter: FilterOptions,
  selectedMonth: Date,
) => {
  const [data, setData] = useState<CalendarHeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facultyId) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCalendar = async () => {
      try {
        setLoading(true);
        setError(null);

        const { studentIds } = await getFacultyClasses_Student.getFilteredStudentIds(
          facultyId,
          filter || { type: 'overall' },
        );

        if (!studentIds.length) {
          if (!cancelled) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const firstDay = new Date(year, month, 1, 0, 0, 0, 0);
        const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const docs = await batchGetDocsByStudentIds('miscueReports', studentIds, [
          where('createdAt', '>=', Timestamp.fromDate(firstDay)),
          where('createdAt', '<=', Timestamp.fromDate(lastDay)),
        ]);

        const countMap = new Map<string, number>();
        const studentMap = new Map<string, Set<string>>();

        for (const d of docs) {
          const date = normalizeToDate(d.createdAt);
          if (!date) continue;
          const key = toDateKey(date);
          countMap.set(key, (countMap.get(key) ?? 0) + 1);
          if (!studentMap.has(key)) studentMap.set(key, new Set<string>());
          studentMap.get(key)!.add(String(d.studentId));
        }

        const today = new Date();
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

        const allDays: CalendarDay[] = [];

        for (let i = 0; i < firstDayOfWeek; i++) {
          const padDate = new Date(year, month, 1 - (firstDayOfWeek - i));
          allDays.push({
            date: padDate,
            dateKey: toDateKey(padDate),
            dayOfMonth: padDate.getDate(),
            sessionCount: 0,
            studentCount: 0,
            intensity: 0,
            isWeekend: [0, 6].includes(padDate.getDay()),
            isFuture: padDate > today,
            isInMonth: false,
          });
        }

        for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, month, d);
          const key = toDateKey(date);
          const count = countMap.get(key) ?? 0;
          const students = studentMap.get(key)?.size ?? 0;
          allDays.push({
            date,
            dateKey: key,
            dayOfMonth: d,
            sessionCount: count,
            studentCount: students,
            intensity: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : 3,
            isWeekend: [0, 6].includes(date.getDay()),
            isFuture: date > today,
            isInMonth: true,
          });
        }

        while (allDays.length % 7 !== 0) {
          const padDate = new Date(
            year,
            month + 1,
            allDays.length - daysInMonth - firstDayOfWeek + 1,
          );
          allDays.push({
            date: padDate,
            dateKey: toDateKey(padDate),
            dayOfMonth: padDate.getDate(),
            sessionCount: 0,
            studentCount: 0,
            intensity: 0,
            isWeekend: [0, 6].includes(padDate.getDay()),
            isFuture: padDate > today,
            isInMonth: false,
          });
        }

        const weeks: CalendarDay[][] = [];
        for (let i = 0; i < allDays.length; i += 7) {
          weeks.push(allDays.slice(i, i + 7));
        }

        const activeDays = Array.from(countMap.values()).filter(c => c > 0).length;
        const totalSessions = Array.from(countMap.values()).reduce((s, c) => s + c, 0);
        const peakEntry = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1])[0];
        const peakDay = peakEntry
          ? allDays.find(d => d.dateKey === peakEntry[0]) ?? null
          : null;

        if (!cancelled) {
          setData({
            month: selectedMonth,
            monthLabel: selectedMonth.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            }),
            weeks,
            totalSessions,
            activeDays,
            peakDay,
          });
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message ?? 'Failed');
          setLoading(false);
        }
      }
    };

    fetchCalendar();

    return () => {
      cancelled = true;
    };
  }, [
    facultyId,
    filter?.type,
    filter?.classId,
    filter?.acadYear,
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
  ]);

  return { data, loading, error };
};
