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

// ==========================================
//        USED FOR MISCUE STATISTICS (ADMIN / FACULTY)
// ==========================================

// export interface MiscueCounts {
//   substitution: number;
//   omission: number;
//   omissionCount?: number;
//   insertion: number;
//   repetition: number;
// }


// export interface StudentsStats {
  //   totalStudents: number;
  //   totalClasses: number;
  // }
  export interface StudentMiscueReport {
    accuracyRate: number;
    miscues?: Array<{
      type: MiscueType;
      expectedWord?: string;
      spokenWord?: string;
    }>;
  }
  
  
  export interface StudentStats {
    totalAttempts: number;
    averageAccuracy: number;
    topMiscueType: string;
    mostCommonMiscueWords: { word: string; count: number }[];
    passagePerformance: { title: string; accuracy: number; attempts: number }[];
  }

  export interface MiscuePercentage {
    type: string;
    percentage: number;
    count: number;
    color: string;
  }
  
export interface OverAllStudentTopMiscue {
  topMiscueType: string;
  commonMiscueWords: Array<{
    word: string;
    errorExample: string;
    errorCount: number;
    studentCount?: number;
    dominantMiscueType?: string; // Add this
    miscueTypes?: Record<string, number>; // Add this if needed
  }>;
  topMiscuedPassage: Array<{
    title: string;
    averageAccuracy: number;
    attempts: number;
    totalMiscues: number;
  }>;
}
export interface AverageWPMandAccuracy {
  averageAccuracy: number;
  averageWPM: number;
  totalReports: number;
  totalStudents: number;
}


export interface ClassMiscueStats {
  classId: string;
  className: string;
  gradeLevel: number;
  acadYear: string;
  studentCount: number;
  miscuePercentages: MiscuePercentage[];
  topMiscue: OverAllStudentTopMiscue;
  averages: AverageWPMandAccuracy;
}

// For the students only
export interface ProgressData {
  date: string;
  accuracy: number;
  wpm: number;
  passageTitle: string;
}
// Reading Health Classification Criteria
export interface ReadingHealthThresholds {
  // Accuracy Rate thresholds
  fluentAccuracy: number;      // e.g., 95%+
  developingAccuracy: number;  // e.g., 85-94%
  emergingAccuracy: number;    // e.g., 70-84%
  // Below 70% = At Risk
  
  // WPM thresholds (grade-level adjusted)
  fluentWPM: (gradeLevel: number) => number;
  developingWPM: (gradeLevel: number) => number;
  emergingWPM: (gradeLevel: number) => number;
  
  // Miscue Density thresholds (miscues per 100 words)
  fluentMiscueDensity: number;     // e.g., < 5%
  developingMiscueDensity: number; // e.g., 5-10%
  emergingMiscueDensity: number;   // e.g., 11-20%
  // Above 20% = At Risk
  
  // Trend analysis (last 3 reports)
  improvingTrend: number;  // e.g., > 5% improvement
  decliningTrend: number;  // e.g., > 5% decline
}

export interface ClassReadingHealth {
  classId: string;
  className: string;
  acadYear: string;
  readingHealth: {
    fluent: {
      percentage: number;
      count: number;
      students: string[];
    };
    developing: {
      percentage: number;
      count: number;
      students: string[];
    };
    emerging: {
      percentage: number;
      count: number;
      students: string[];
    };
    atRisk: {
      percentage: number;
      count: number;
      students: string[];
    };
  };
  totalStudents: number;
  lastUpdated: Date;
}

export interface StudentReadingStatus {
  studentId: string;
  name: string;
  gradeLevel: number;
  status: 'fluent' | 'developing' | 'emerging' | 'atRisk';
  averageAccuracy: number;
  averageWPM: number;
  miscueDensity: number; // miscues per 100 words
  trend: 'improving' | 'stable' | 'declining';
  lastReportDate: Date;
}

// FOR COMMON MISCUE TYPE / WORDS / PASSAGE
export interface FilterOptions {
  type?: 'overall' | 'class';
  acadYear?: string;
  classId?: string;
  className?: string;
  gradeLevel?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ClassFilterData {
  classId: string;
  className: string;
  gradeLevel: number;
}