import { useEffect, useMemo, useState } from 'react';
import { getFacultyClasses_Student } from '../use_FacultyClasses_Students';
import {
  TimeRange,
  alphabetSessionsByRange,
  buildAlphabetPeriodSlots,
  computeAlphabetMasterySummary,
  getDefaultSlotIndex,
} from '../../Controller/SessionReportContoller';
import type { ReadingStatusFilter } from '../../Screens/Faculty/Faculty_Dashboard';
import { AlphabetSessionData } from '../../Interfaces/dataInterfaces';
export function useClassAlphabetMastery(
  facultyId: string,
  filter: ReadingStatusFilter,
  timeRange: TimeRange,
) {
  const [sessions, setSessions] = useState<AlphabetSessionData[]>([]);
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
        const miscueFilter: any =
          filter.selectedView === 'overall'
            ? undefined
            : { type: 'class', classId: filter.selectedView };

        const { studentIds } =
          await getFacultyClasses_Student.getFilteredStudentIds(
            facultyId,
            miscueFilter,
          );

        if (studentIds.length === 0) {
          if (alive) {
            setSessions([]);
            setLoading(false);
          }
          return;
        }

        // Fetch all one-shot sessions for all students
        const promises = studentIds.map(
          id =>
            alphabetSessionsByRange(id, { timeRange }) as Promise<
              AlphabetSessionData[]
            >,
        );
        const results = await Promise.all(promises);

        if (alive) {
          // Flatten array of arrays
          const allSessions = results.flat();
          setSessions(allSessions);
          setLoading(false);
        }
      } catch (e: any) {
        if (alive) {
          setError(e?.message ?? 'Failed to load class alphabet sessions.');
          setLoading(false);
        }
      }
    };

    fetchClassSessions();

    return () => {
      alive = false;
    };
  }, [facultyId, filter, timeRange]);

  const slots = useMemo(
    () => buildAlphabetPeriodSlots(sessions, timeRange),
    [sessions, timeRange],
  );

  const summary = useMemo(() => computeAlphabetMasterySummary(slots), [slots]);

  const defaultIndex = useMemo(() => getDefaultSlotIndex(slots), [slots]);

  return { sessions, slots, summary, defaultIndex, loading, error };
}
