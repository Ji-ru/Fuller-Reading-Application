export type MiscueType = 
  | 'substitution'
  | 'omission'
  | 'insertion'
  | 'repetition';

export interface Miscue {
  expected: string;
  spoken: string;
  position: number;
  timestamp: Date;
  type: MiscueType;
}

export interface RecordingState {
  isRecording: boolean;
  spokenText: string;
  miscues: Miscue[];
  hasPermission: boolean;
  isLoading: boolean;
  recordTime: number;
  audioPath: string;
  isReadingCompleted: boolean;
  currentWordIndex: number;
}

export interface MiscueCounts {
  substitution: number;
  omission: number;
  omissionCount?: number;
  insertion: number;
  repetition: number;
}

export interface MiscuePercentage {
  type: string;
  percentage: number;
  count: number;
  color: string;
}

export interface FacultyMiscueStats {
  miscuePercentages: MiscuePercentage[];
  averageAccuracy: number;
  totalStudents: number;
  totalMiscues: number;
}

export interface StudentMiscueReport {
  accuracyRate: number;
  miscues?: Array<{
    type: MiscueType;
    expectedWord?: string;
    spokenWord?: string;
  }>; 

}