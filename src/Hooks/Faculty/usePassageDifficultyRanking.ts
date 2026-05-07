import { useEffect, useState } from 'react';
import { Timestamp, where } from '@react-native-firebase/firestore';
import { FilterOptions } from '../../Interfaces/miscue';
import { getFacultyClasses_Student } from '../use_FacultyClasses_Students';
import { batchGetDocsByStudentIds } from '../../Utils/batchInQuery';
import { resolveDateRange } from '../../Utilities/activityGroupingDate';

export interface PassageDifficultyRow {
  title: string;
  attempts: number;
  uniqueStudents: number;
  avgAccuracy: number;
  avgTotalMiscues: number;
  difficultyLevel: 'hard' | 'moderate' | 'easy';
}

export function usePassageDifficultyRanking(
  facultyId: string | null | undefined,
  filter?: FilterOptions,
) {
  const [rows, setRows] = useState<PassageDifficultyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facultyId) {
      setRows([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { studentIds } = await getFacultyClasses_Student.getFilteredStudentIds(
          facultyId,
          filter || { type: 'overall' },
        );

        if (studentIds.length === 0) {
          if (!cancelled) { setRows([]); setLoading(false); }
          return;
        }

        const range = resolveDateRange(filter);
        const constraints: any[] = [];
        if (range) {
          constraints.push(where('createdAt', '>=', Timestamp.fromDate(range.start)));
          constraints.push(where('createdAt', '<=', Timestamp.fromDate(range.end)));
        }

        const docs = await batchGetDocsByStudentIds('miscueReports', studentIds, constraints);

        const map = new Map<string, {
          accuracySum: number;
          miscueSum: number;
          count: number;
          studentSet: Set<string>;
        }>();

        for (const d of docs) {
          const title = String(d.passageTitle ?? '').trim();
          if (!title) continue;

          const entry = map.get(title) ?? {
            accuracySum: 0,
            miscueSum: 0,
            count: 0,
            studentSet: new Set<string>(),
          };

          entry.accuracySum += Number(d.accuracyRate ?? 0);
          entry.miscueSum += (
            Number(d.substitutionCount ?? 0) +
            Number(d.omissionCount ?? 0) +
            Number(d.insertionCount ?? 0) +
            Number(d.repetitionCount ?? 0)
          );
          entry.count += 1;
          entry.studentSet.add(String(d.studentId));
          map.set(title, entry);
        }

        const result: PassageDifficultyRow[] = Array.from(map.entries()).map(
          ([title, v]) => {
            const avgAccuracy = Math.round(v.accuracySum / v.count);
            return {
              title,
              attempts: v.count,
              uniqueStudents: v.studentSet.size,
              avgAccuracy,
              avgTotalMiscues: Math.round(v.miscueSum / v.count),
              difficultyLevel:
                avgAccuracy < 70 ? 'hard'
                : avgAccuracy < 85 ? 'moderate'
                : 'easy',
            };
          },
        );

        result.sort((a, b) => a.avgAccuracy - b.avgAccuracy);

        if (!cancelled) { setRows(result); setLoading(false); }
      } catch (e: any) {
        if (!cancelled) { setError(e.message ?? 'Failed to load passage data'); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [facultyId, filter?.type, filter?.classId, filter?.acadYear]);

  return { rows, loading, error };
}
