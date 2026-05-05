// =============================================================================
// useFullerProgressionFunnel.ts
// =============================================================================
// Purpose: Aggregates student reading level data to produce a per-grade
//          "curriculum funnel" that shows where students are getting stuck
//          in the Fuller Reading progression: Alphabet → Words → Passages.
//
// Firebase Cost Notes:
//   - ZERO reads from alphabetSessions / wordSessions / miscueReports.
//   - `reading_Level` is already computed + stored on each user document by
//     ReadingLevelService after every activity endpoint. This hook simply
//     reads those pre-computed values and groups them client-side.
//   - Total reads: ~20 (classes) + ~N students = O(N) on user docs only.
//
// Architecture Notes:
//   - Pure custom hook — safe to use in any React function component.
//   - All grouping/aggregation is done client-side to avoid extra Firestore reads.
//   - `isMounted` guard prevents state updates after unmount.
//   - Refetch is exposed for pull-to-refresh patterns.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { getUsersByRole } from '../../Controller/AuthenticationController';
import { UserDocument } from '../../Interfaces/dataInterfaces';

// =============================================================================
// TYPES
// =============================================================================

/** The three progressive stages in the Fuller Reading curriculum. */
export type FunnelStage = 'alphabet' | 'wordBlending' | 'passage';

/** Human-readable labels for each stage — used in chart legends and tooltips. */
export const STAGE_LABELS: Record<FunnelStage, string> = {
  alphabet: 'Alphabet',
  wordBlending: 'Word Blending',
  passage: 'Passage Reading',
};

/** Subtitle descriptions for each stage — shown below labels for context. */
export const STAGE_DESCRIPTIONS: Record<FunnelStage, string> = {
  alphabet: 'Building letter-sound foundations',
  wordBlending: 'Decoding words in isolation',
  passage: 'Reading connected text fluently',
};

/**
 * Colors consistent with the Admin Dashboard palette.
 * Red for the earliest/blocked stage, yellow for transitional, teal for passage.
 */
export const STAGE_COLORS: Record<FunnelStage, string> = {
  alphabet: '#FF6B6B', // Red  — foundational gap
  wordBlending: '#FFE66D', // Yellow — blending transition
  passage: '#4ECDC4', // Teal  — connected text fluency
};

/** Count + percentage breakdown for a single funnel stage within a grade. */
export interface StageBreakdown {
  count: number;
  percentage: number; // 0–100, rounded to 1 decimal
}

/** Funnel data for a single grade level (or 'overall' across all grades). */
export interface GradeFunnelData {
  /** 1, 2, or 3 for grade-specific rows; 0 means 'overall'. */
  gradeLevel: number;
  totalStudents: number;
  stages: Record<FunnelStage, StageBreakdown>;
  /**
   * The stage where the most students are "stuck" (highest concentration in
   * an early stage). null if there is insufficient data or all students are
   * already at the passage stage.
   */
  bottleneck: FunnelStage | null;
}

/** The full dataset returned by the hook. */
export interface FullerProgressionData {
  /** Per-grade breakdown (Grades 1, 2, 3). Grades with 0 students are included. */
  byGrade: GradeFunnelData[];
  /** Cross-grade aggregate. */
  overall: GradeFunnelData;
  totalStudents: number;
}

export interface UseFullerProgressionFunnelResult {
  data: FullerProgressionData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Maps a student's stored `reading_Level` to the corresponding funnel stage.
 *
 * Mapping rationale:
 *   - 'beginner'     → alphabet   (letter-sound foundations not yet met)
 *   - 'emerging'     → wordBlending (alphabet passed, word decoding in progress)
 *   - 'intermediate' → passage    (instructional band: 90–94% passage accuracy)
 *   - 'advanced'     → passage    (independent: ≥95% accuracy + WPM target met)
 *   - undefined      → alphabet   (new student, no data yet — safe default)
 */
const classifyStage = (reading_Level?: string): FunnelStage => {
  switch (reading_Level) {
    case 'intermediate':
    case 'advanced':
      return 'passage';
    case 'emerging':
      return 'wordBlending';
    case 'beginner':
    default:
      return 'alphabet';
  }
};

/**
 * Identifies the curriculum bottleneck for a set of students.
 *
 * Bottleneck logic:
 * - If ≥ 40% of students are still at 'alphabet', the alphabet-to-word transition
 *   is the bottleneck — teachers need phonics/blending support.
 * - If ≥ 30% are stuck at 'wordBlending', the word-to-passage transition is the
 *   bottleneck — teachers need guided oral reading strategies.
 * - If the majority are already at 'passage', no critical bottleneck exists.
 * - Returns null when totalStudents is 0.
 */
const detectBottleneck = (
  stages: Record<FunnelStage, StageBreakdown>,
  totalStudents: number,
): FunnelStage | null => {
  if (totalStudents === 0) return null;
  if (stages.alphabet.percentage >= 40) return 'alphabet';
  if (stages.wordBlending.percentage >= 30) return 'wordBlending';
  return null;
};

/**
 * Builds a GradeFunnelData object from a pre-filtered list of students.
 * All math is done in JS — zero extra Firestore reads.
 */
const buildFunnelData = (
  students: UserDocument[],
  gradeLevel: number,
): GradeFunnelData => {
  const totalStudents = students.length;

  // Count students at each stage
  const counts: Record<FunnelStage, number> = {
    alphabet: 0,
    wordBlending: 0,
    passage: 0,
  };

  for (const student of students) {
    const stage = classifyStage(student.studentData?.reading_Level);
    counts[stage]++;
  }

  // Build breakdown with safe percentage calculation
  const toBreakdown = (count: number): StageBreakdown => ({
    count,
    percentage:
      totalStudents > 0
        ? Math.round((count / totalStudents) * 1000) / 10 // 1 decimal
        : 0,
  });

  const stages: Record<FunnelStage, StageBreakdown> = {
    alphabet: toBreakdown(counts.alphabet),
    wordBlending: toBreakdown(counts.wordBlending),
    passage: toBreakdown(counts.passage),
  };

  return {
    gradeLevel,
    totalStudents,
    stages,
    bottleneck: detectBottleneck(stages, totalStudents),
  };
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Fetches all students for the given academic year and computes the
 * Fuller Reading curriculum funnel data, broken down by grade level.
 *
 * @param acadYear - Optional filter (e.g., "2024-2025"). When omitted, all
 *                   students across all years are included.
 *
 * @example
 * const { data, isLoading, error } = useFullerProgressionFunnel('2024-2025');
 * // data.byGrade[0] → Grade 1 funnel
 * // data.byGrade[0].bottleneck → 'wordBlending' means blending is the bottleneck
 * // data.byGrade[0].stages.alphabet.percentage → e.g. 15.3 (%)
 */
export const useFullerProgressionFunnel = (
  acadYear?: string,
): UseFullerProgressionFunnelResult => {
  const [data, setData] = useState<FullerProgressionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setFetchTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchAndAggregate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Single Firestore call — getUsersByRole internally:
        //   1. Fetches classes where acadYear == X  (~10-20 reads)
        //   2. Fetches users where role == 'student' (~N reads)
        //   3. Filters students by their classCode (client-side)
        // No reads to alphabetSessions / wordSessions / miscueReports.
        const { students } = await getUsersByRole('student', acadYear);

        if (!isMounted) return;

        // Grade-level breakdown: compute funnel for each grade (1, 2, 3)
        const byGrade: GradeFunnelData[] = [1, 2, 3].map(grade => {
          const gradeStudents = students.filter(
            (s: UserDocument) => s.studentData?.gradeLevel === grade,
          );
          return buildFunnelData(gradeStudents, grade);
        });

        // Overall aggregate across all fetched students
        const overall = buildFunnelData(students, 0);

        if (isMounted) {
          setData({
            byGrade,
            overall,
            totalStudents: students.length,
          });
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[useFullerProgressionFunnel] Fetch failed:', err);
          setError(err.message ?? 'Failed to load progression data.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAndAggregate();

    return () => {
      isMounted = false;
    };
  }, [acadYear, fetchTrigger]);

  return { data, isLoading, error, refetch };
};
