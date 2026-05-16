import { MiscuePercentage, OverAllStudentTopMiscue } from '../Interfaces/miscue';
import { MiscueReportDocument } from '../Interfaces/dataInterfaces';

/**
 * Dummy data for MiscueChart.tsx visualization
 * Contains realistic miscue breakdown and top miscued words/passages
 */

export const DUMMY_MISCUE_DATA: MiscuePercentage[] = [
  {
    type: 'Substitution',
    count: 120,
    percentage: 48,
    color: '#FF2726',
  },
  {
    type: 'Omission',
    count: 75,
    percentage: 30,
    color: '#FF941A',
  },
  {
    type: 'Insertion',
    count: 35,
    percentage: 14,
    color: '#FFD000',
  },
  {
    type: 'Repetition',
    count: 20,
    percentage: 8,
    color: '#6366F1',
  },
];

export const DUMMY_TOP_MISCUE: OverAllStudentTopMiscue[] = [
  {
    topMiscueType: 'Substitution',
    commonMiscueWords: [
      {
        word: 'ang',
        errorExample: 'ong',
        errorCount: 24,
        dominantMiscueType: 'Substitution',
        studentCount: 8,
      },
      {
        word: 'ama',
        errorExample: 'amo',
        errorCount: 18,
        dominantMiscueType: 'Substitution',
        studentCount: 6,
      },
      {
        word: 'misa',
        errorExample: 'mesa',
        errorCount: 15,
        dominantMiscueType: 'Substitution',
        studentCount: 5,
      },
      {
        word: 'bibe',
        errorExample: 'bibo',
        errorCount: 12,
        dominantMiscueType: 'Substitution',
        studentCount: 4,
      },
      {
        word: 'tuta',
        errorExample: 'tutu',
        errorCount: 10,
        dominantMiscueType: 'Substitution',
        studentCount: 3,
      },
    ],
    topMiscuedPassage: [
      {
        title: 'Ang Ama',
        averageAccuracy: 82.5,
        attempts: 12,
        totalMiscues: 45,
      },
      {
        title: 'Bibo ang Bibe',
        averageAccuracy: 75.3,
        attempts: 10,
        totalMiscues: 38,
      },
      {
        title: 'Ang Mga Hayop',
        averageAccuracy: 88.2,
        attempts: 8,
        totalMiscues: 22,
      },
      {
        title: 'Sa Bukid',
        averageAccuracy: 79.1,
        attempts: 11,
        totalMiscues: 52,
      },
    ],
  },
];

/**
 * Alternative scenario with different data distribution
 * Useful for testing different UI layouts
 */
export const DUMMY_MISCUE_DATA_ALTERNATIVE: MiscuePercentage[] = [
  {
    type: 'Omission',
    count: 95,
    percentage: 45,
    color: '#FF941A',
  },
  {
    type: 'Substitution',
    count: 85,
    percentage: 40,
    color: '#FF2726',
  },
  {
    type: 'Repetition',
    count: 25,
    percentage: 12,
    color: '#6366F1',
  },
  {
    type: 'Insertion',
    count: 10,
    percentage: 3,
    color: '#FFD000',
  },
];

export const DUMMY_TOP_MISCUE_ALTERNATIVE: OverAllStudentTopMiscue[] = [
  {
    topMiscueType: 'Omission',
    commonMiscueWords: [
      {
        word: 'sa',
        errorExample: '(omitted)',
        errorCount: 32,
        dominantMiscueType: 'Omission',
        studentCount: 10,
      },
      {
        word: 'ng',
        errorExample: '(omitted)',
        errorCount: 28,
        dominantMiscueType: 'Omission',
        studentCount: 9,
      },
      {
        word: 'ang',
        errorExample: '(omitted)',
        errorCount: 22,
        dominantMiscueType: 'Omission',
        studentCount: 7,
      },
      {
        word: 'at',
        errorExample: '(omitted)',
        errorCount: 18,
        dominantMiscueType: 'Omission',
        studentCount: 5,
      },
      {
        word: 'para',
        errorExample: '(omitted)',
        errorCount: 14,
        dominantMiscueType: 'Omission',
        studentCount: 4,
      },
    ],
    topMiscuedPassage: [
      {
        title: 'Ang Kuwento ng Pusa',
        averageAccuracy: 71.8,
        attempts: 15,
        totalMiscues: 68,
      },
      {
        title: 'Ang Pamilya',
        averageAccuracy: 84.5,
        attempts: 9,
        totalMiscues: 28,
      },
      {
        title: 'Pangarap Ko',
        averageAccuracy: 77.2,
        attempts: 11,
        totalMiscues: 42,
      },
      {
        title: 'Mga Kaibigan',
        averageAccuracy: 89.6,
        attempts: 7,
        totalMiscues: 15,
      },
    ],
  },
];

/**
 * Empty scenario for testing "no data" state
 */
export const DUMMY_MISCUE_DATA_EMPTY: MiscuePercentage[] = [];

export const DUMMY_TOP_MISCUE_EMPTY: OverAllStudentTopMiscue[] = [];

// Raw report data for reference (used by other components)
export const DUMMY_REPORTS: MiscueReportDocument[] = [
  {
    reportId: 'dummy-1',
    passageTitle: 'Ang Ama',
    studentId: 'dummy-student',
    accuracyRate: 85.5,
    wordPerMin: 45,
    recordingDuration: '2:00',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    substitutionCount: 2,
    omissionCount: 1,
    substitution: 'ama -> amo',
    omission: 'ang',
    insertion: 'None',
    repetition: 'None',
    miscues: [
      { type: 'substitution', expectedWord: 'ama', spokenWord: 'amo' },
      { type: 'substitution', expectedWord: 'misa', spokenWord: 'mesa' },
      { type: 'omission', expectedWord: 'ang' },
    ],
    totalWords: 20,
    totalMiscues: 3,
  },
  {
    reportId: 'dummy-2',
    passageTitle: 'Ang Ama',
    studentId: 'dummy-student',
    accuracyRate: 95.0,
    wordPerMin: 52,
    recordingDuration: '1:50',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    substitutionCount: 1,
    substitution: 'ama -> amo',
    omission: 'None',
    insertion: 'None',
    repetition: 'None',
    miscues: [
      { type: 'substitution', expectedWord: 'ama', spokenWord: 'amo' },
    ],
    totalWords: 20,
    totalMiscues: 1,
  },
];

export const DUMMY_WORD_MASTERY = {
  masteredLetters: ['M', 'A', 'S'],
  masteredWords: ['Mama', 'Mano', 'Mais', 'Aso', 'Sali']
};
