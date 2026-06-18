import { useEffect, useMemo, useState } from 'react';
import readingMaterialData from '../../../assets/ReadingMaterial/ReadingMaterial_new.json';
import { getFacultyClasses_Student } from '../use_FacultyClasses_Students';
import {
  TimeRange,
  wordSessionsByRange,
  buildWordChapterProgress,
  WordChapterProgress,
} from '../../Controller/SessionReportContoller';
import { WordSessionData } from '../../Interfaces/dataInterfaces';
import type { ReadingStatusFilter } from '../../Screens/Faculty/Faculty_Dashboard';

export function useClassWordMastery(facultyId: string, filter: ReadingStatusFilter, timeRange: TimeRange) {
  const [sessions, setSessions] = useState<WordSessionData[]>([]);
  const [chapters, setChapters] = useState<WordChapterProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    const fetchClassSessions = async () => {
      if (!facultyId) {
        setLoading(false);
        return;
      }

      try {
        const miscueFilter: any = filter.selectedView === 'overall' 
          ? undefined 
          : { type: 'class', classId: filter.selectedView };

        const { studentIds } = await getFacultyClasses_Student.getFilteredStudentIds(facultyId, miscueFilter);

        if (studentIds.length === 0) {
          if (alive) {
            setSessions([]);
            setLoading(false);
          }
          return;
        }

        // Fetch all one-shot sessions for all students
        const promises = studentIds.map(id => wordSessionsByRange(id, { timeRange }) as Promise<WordSessionData[]>);
        const results = await Promise.all(promises);

        if (alive) {
          const allSessions = results.flat();
          setSessions(allSessions);
          setLoading(false);
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message ?? 'Failed to load class word sessions.');
          setLoading(false);
        }
      }
    };

    fetchClassSessions();

    return () => {
      alive = false;
    };
  }, [facultyId, filter, timeRange]);

  const computedChapters = useMemo(
    () => buildWordChapterProgress(readingMaterialData as any, sessions),
    [sessions],
  );

  useEffect(() => {
    setChapters(computedChapters);
  }, [computedChapters]);

  return { chapters, loading, error };
}
