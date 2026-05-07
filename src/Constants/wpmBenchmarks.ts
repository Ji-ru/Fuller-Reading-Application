// Words-per-minute oral reading fluency benchmarks
// Source: Hasbrouck & Tindal (2017) ORF norms

export interface WpmBenchmark {
  grade: number;
  label: string;
  expectedMin: number;
  expectedMax: number;
  targetWPM: number;
}

export const WPM_BENCHMARKS: WpmBenchmark[] = [
  {
    grade: 1,
    label: 'Grade 1',
    expectedMin: 30,
    expectedMax: 82,
    targetWPM: 53,
  },
  {
    grade: 2,
    label: 'Grade 2',
    expectedMin: 72,
    expectedMax: 124,
    targetWPM: 89,
  },
  {
    grade: 3,
    label: 'Grade 3',
    expectedMin: 89,
    expectedMax: 142,
    targetWPM: 107,
  },
];

export function getBenchmarkForGrade(gradeLevel: number): WpmBenchmark | null {
  return WPM_BENCHMARKS.find(b => b.grade === gradeLevel) ?? null;
}

export function classifyWPM(
  wpm: number,
  grade: number,
): 'above' | 'on-track' | 'below' | 'unknown' {
  const benchmark = getBenchmarkForGrade(grade);
  if (!benchmark) return 'unknown';
  if (wpm >= benchmark.expectedMax) return 'above';
  if (wpm >= benchmark.expectedMin) return 'on-track';
  return 'below';
}
