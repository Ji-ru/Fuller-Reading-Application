import { useEffect, useState } from 'react';
import { Timestamp, where } from '@react-native-firebase/firestore';
import { FilterOptions } from '../../Interfaces/miscue';
import { getFacultyClasses_Student } from '../use_FacultyClasses_Students';
import { batchGetDocsByStudentIds } from '../../Utils/batchInQuery';

export interface ParticipationRateData {
  thisWeek: {
    participatingStudents: number;
    totalStudents: number;
    rate: number;
    weekLabel: string;
  };
  lastWeek: {
    participatingStudents: number;
    totalStudents: number;
    rate: number;
    weekLabel: string;
  };
  change: number;
  trend: 'up' | 'down' | 'same';
}

const getMondayOfWeek = (offset: number = 0): Date => {
  const now = new Date();
  const day = now.getDay();
  const daysSinceMon = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMon + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getSundayOfWeek = (offset: number = 0): Date => {
  const monday = getMondayOfWeek(offset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

const formatWeekLabel = (start: Date, end: Date): string => {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} - ${fmt(end)}`;
};

export const useClassParticipationRate = (
  facultyId: string | null,
  filter?: FilterOptions,
) => {
  const [data, setData] = useState<ParticipationRateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facultyId) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchParticipation = async () => {
      try {
        setLoading(true);
        setError(null);

        const { studentIds } = await getFacultyClasses_Student.getFilteredStudentIds(
          facultyId,
          filter || { type: 'overall' },
        );

        const totalStudents = studentIds.length;
        if (totalStudents === 0) {
          if (!cancelled) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        const thisStart = getMondayOfWeek(0);
        const thisEnd = getSundayOfWeek(0);
        const lastStart = getMondayOfWeek(-1);
        const lastEnd = getSundayOfWeek(-1);

        const [thisWeekDocs, lastWeekDocs] = await Promise.all([
          batchGetDocsByStudentIds('miscueReports', studentIds, [
            where('createdAt', '>=', Timestamp.fromDate(thisStart)),
            where('createdAt', '<=', Timestamp.fromDate(thisEnd)),
          ]),
          batchGetDocsByStudentIds('miscueReports', studentIds, [
            where('createdAt', '>=', Timestamp.fromDate(lastStart)),
            where('createdAt', '<=', Timestamp.fromDate(lastEnd)),
          ]),
        ]);

        const thisParticipants = new Set(thisWeekDocs.map(d => d.studentId)).size;
        const lastParticipants = new Set(lastWeekDocs.map(d => d.studentId)).size;

        const thisRate = Math.round((thisParticipants / totalStudents) * 100);
        const lastRate = Math.round((lastParticipants / totalStudents) * 100);
        const change = thisRate - lastRate;

        if (!cancelled) {
          setData({
            thisWeek: {
              participatingStudents: thisParticipants,
              totalStudents,
              rate: thisRate,
              weekLabel: formatWeekLabel(thisStart, thisEnd),
            },
            lastWeek: {
              participatingStudents: lastParticipants,
              totalStudents,
              rate: lastRate,
              weekLabel: formatWeekLabel(lastStart, lastEnd),
            },
            change,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
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

    fetchParticipation();

    return () => {
      cancelled = true;
    };
  }, [facultyId, filter?.type, filter?.classId, filter?.acadYear]);

  return { data, loading, error };
};
