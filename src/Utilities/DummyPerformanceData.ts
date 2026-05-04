import { MiscueReportDocument } from '../Interfaces/dataInterfaces';

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
      { type: 'Substitution', expectedWord: 'ama', spokenWord: 'amo' },
      { type: 'Substitution', expectedWord: 'misa', spokenWord: 'mesa' },
      { type: 'Omission', expectedWord: 'ang' },
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
      { type: 'Substitution', expectedWord: 'ama', spokenWord: 'amo' },
    ],
    totalWords: 20,
    totalMiscues: 1,
  },
  {
    reportId: 'dummy-3',
    passageTitle: 'Bibo ang Bibe',
    studentId: 'dummy-student',
    accuracyRate: 70.2,
    wordPerMin: 30,
    recordingDuration: '3:20',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    substitutionCount: 5,
    omissionCount: 3,
    insertionCount: 2,
    substitution: 'bibo -> bibe',
    omission: 'ang',
    insertion: 'nga',
    repetition: 'None',
    miscues: [
      { type: 'Substitution', expectedWord: 'bibo', spokenWord: 'bibe' },
      { type: 'Substitution', expectedWord: 'bibe', spokenWord: 'bibo' },
      { type: 'Substitution', expectedWord: 'tuta', spokenWord: 'tutu' },
      { type: 'Substitution', expectedWord: 'ama', spokenWord: 'amo' },
      { type: 'Substitution', expectedWord: 'misa', spokenWord: 'mesa' },
      { type: 'Omission', expectedWord: 'ang' },
      { type: 'Omission', expectedWord: 'sa' },
      { type: 'Omission', expectedWord: 'ang' },
      { type: 'Insertion', expectedWord: 'nga', spokenWord: 'nang' },
      { type: 'Insertion', expectedWord: 'at', spokenWord: 'pati' },
    ],
    totalWords: 40,
    totalMiscues: 10,
  },
  {
    reportId: 'dummy-4',
    passageTitle: 'Bibo ang Bibe',
    studentId: 'dummy-student',
    accuracyRate: 100,
    wordPerMin: 58,
    recordingDuration: '2:30',
    timestamp: new Date(), // Today
    substitution: 'None',
    omission: 'None',
    insertion: 'None',
    repetition: 'None',
    miscues: [],
    totalWords: 40,
    totalMiscues: 0,
  }
];

export const DUMMY_WORD_MASTERY = {
  masteredLetters: ['M', 'A', 'S'],
  masteredWords: ['Mama', 'Mano', 'Mais', 'Aso', 'Sali']
};
