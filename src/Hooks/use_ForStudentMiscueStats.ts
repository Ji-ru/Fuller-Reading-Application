import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { MiscueReportController } from '../Controller/MiscueReportController';
import {
  MiscuePercentage,
  OverAllStudentTopMiscue,
  AverageWPMandAccuracy,
} from '../Interfaces/miscue';
import { getDateRangeForTimeFilter } from '../Utilities/dateRange';
import { FilterOptions } from '../Interfaces/miscue';
import { convertDurationToHours } from '../Utilities/convertDurationToHours';
import { getLabelForDate, getPeriodLabels, resolveDateRange, filterReportsByDateRange, getDateRangeForAcadYear } from '../Utilities/activityGroupingDate';

export const getForStudentsMiscueStats = () => {
  const { getStudentReports, formatMiscueType, getRecordingDuration } =
    MiscueReportController;
  const { getFacultyClasses, getFilteredStudentIds } = getFacultyClasses_Student;

const getActiveHours = async (
  facultyId: string,
  timeRange: 'week' | 'month' | 'year',
  filter?: FilterOptions,
): Promise<{ day: string; hours: number }[]> => {
  try {
    // Get filtered student IDs based on filter (class, academic year)
    const { studentIds } = await getFilteredStudentIds(
      facultyId,
      filter || { type: 'overall' },
    );

    // Get date range and period labels from utilities
    const { start, end } = getDateRangeForTimeFilter(timeRange);
    const periodLabels = getPeriodLabels(timeRange);

    // Initialize totals for each period
    const totals: Record<string, number> = {};
    periodLabels.forEach(label => { totals[label] = 0; });

    // Process each student
    for (const studentId of studentIds) {
      const reports = await getRecordingDuration(studentId); // or getStudentReports? Use appropriate method
      for (const report of reports) {
        let reportDate: Date | null = null;

        try {
          if (report.createdAt?.toDate) {
            reportDate = report.createdAt.toDate();
          } else if (report.createdAt?.seconds) {
            reportDate = new Date(report.createdAt.seconds * 1000);
          } else if (typeof report.createdAt === 'string') {
            reportDate = new Date(report.createdAt);
          } else if (report.createdAt instanceof Date) {
            reportDate = report.createdAt;
          }
        } catch (e) {
          continue;
        }

        if (!reportDate) continue;
        if (reportDate < start || reportDate > end) continue;

        const hours = convertDurationToHours(report.recordingDuration || '0:00');
        const bucket = getLabelForDate(reportDate, timeRange);
        if (bucket && totals[bucket] !== undefined) {
          totals[bucket] += hours;
        }
      }
    }

    // Return array in the order of periodLabels
    return periodLabels.map(day => ({
      day,
      hours: totals[day],
    }));
  } catch (error: any) {
    throw new Error('Failed to get active hours: ' + error.message);
  }
};
  /**
   * Get class count
   *
   * @param facultyId - faculty's id used to fetch the number of classes he/she assigned to
   * @returns total number of classes
   */
  const getNumberOfClasses = async (facultyId: string): Promise<number> => {
    try {
      const getClass = await getFacultyClasses(facultyId);
      return getClass.length;
    } catch (error: any) {
      throw new Error(
        'Failed to get the Total Number of Classes: ' + error.message,
      );
    }
  };

  /**
   * Get student counts directly from studentIds array
   *
   * @param facultyId - faculty's id to be used to fetch all the students registred in a class he/she assigned to.
   * @returns - total number of students
   */
  const getNumbersOfAllStudents = async (
    facultyId: string,
  ): Promise<number> => {
    try {
      const classes = await getFacultyClasses(facultyId);

      //  Calculate student counts from studentIds arrays
      const classStudentCounts = classes.map(classItem => {
        // studentIds is guaranteed to be an array (string[]) from your interface
        const studentCount = classItem.studentIds?.length || 0;
        return {
          studentCount: studentCount,
        };
      });

      // Calculate total students
      const totalStudents = classStudentCounts.reduce(
        (sum, classInfo) => sum + classInfo.studentCount,
        0,
      );
      return totalStudents;
    } catch (error: any) {
      throw new Error('Failed to to get the Total Number of Students');
    }
  };

  /**
   * Process:
   * - Get class from the class of the faculty using facultyId
   * - Get the students from that class
   * - Get report data from msicueReports using studentId registered in the class
   *    - Get the number of miscues for each type
   * - Pass the data to the
   * Return:
   * - Precentage of each miscue types to be used to display in a donut chart.
   */
  const getOverallCommonMiscueType = async (
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<MiscuePercentage[]> => {
    try {
      // Get all the classes handled by the faculty
      const { studentIds } = await getFilteredStudentIds(
        facultyId,
        filter || { type: 'overall' },
      );

      // Initialize miscue type counters
      const miscueCounts = {
        substitution: 0,
        omission: 0,
        insertion: 0,
        repetition: 0,
      };

      let totalReports = 0;
      let totalMiscues = 0;

      const dateRange = resolveDateRange(filter);

      // For each students, get all their reports using getStudentReports function
      for (const studentId of studentIds) {
        const allReports = await getStudentReports(studentId)
        const reports    = filterReportsByDateRange(allReports, dateRange); 

        totalReports += reports.length;

        // Aggregate miscue counts from each report
        for (const report of reports) {
          if (report.miscues && Array.isArray(report.miscues)) {
            totalMiscues += report.miscues.length;

            // Count each miscue type
            for (const miscue of report.miscues) {
              switch (miscue.type) {
                case 'substitution':
                  miscueCounts.substitution++;
                  break;
                case 'omission':
                  miscueCounts.omission++;
                  break;
                case 'insertion':
                  miscueCounts.insertion++;
                  break;
                case 'repetition':
                  miscueCounts.repetition++;
                  break;
                default:
                  console.log('Unknown miscue type:', miscue.type);
              }
            }
          }
        }
      }

      // Calculate Percentage
      const total = Object.values(miscueCounts).reduce(
        (sum, count) => sum + count,
        0,
      );

      if (total === 0) {
        return getDefaultMiscueData();
      }

      // Format data for chart
      const result: MiscuePercentage[] = [
        {
          type: 'Substitution',
          count: miscueCounts.substitution,
          percentage:
            Math.round((miscueCounts.substitution / total) * 1000) / 10, // 1 decimal place
          color: '#FF2726',
        },
        {
          type: 'Omission',
          count: miscueCounts.omission,
          percentage: Math.round((miscueCounts.omission / total) * 1000) / 10,
          color: '#FF941A',
        },
        {
          type: 'Insertion',
          count: miscueCounts.insertion,
          percentage: Math.round((miscueCounts.insertion / total) * 1000) / 10,
          color: '#1A81FF',
        },
        {
          type: 'Repetition',
          count: miscueCounts.repetition,
          percentage: Math.round((miscueCounts.repetition / total) * 1000) / 10,
          color: '#BF00DD',
        },
      ];

      return result;
    } catch (error: any) {
      throw new Error('Failed to get common miscue type: ' + error.message);
    }
  };
  /**
   * Helper function to return default miscue data when no data is found
   */
  const getDefaultMiscueData = (): MiscuePercentage[] => {
    return [
      { type: 'Substitution', count: 0, percentage: 0, color: '#FF2726' },
      { type: 'Omission', count: 0, percentage: 0, color: '#FF941A' },
      { type: 'Insertion', count: 0, percentage: 0, color: '#1A81FF' },
      { type: 'Repetition', count: 0, percentage: 0, color: '#BF00DD' },
    ];
  };

  /**
   * Process:
   * - Find all the class of the faculty using facultyId
   * - Find all the students of each of the class
   * - Get students reading stats (Top Miscue Type, Most Common Miscued Words with Example error and its total attempts (or error count))
   * Return:
   * - Top Miscue Type, Most Common Miscued Words with Example error and its total attempts (or error count)
   */
/**
 * Process:
 * - Find all the class of the faculty using facultyId
 * - Find all the students of each of the class
 * - Get students reading stats (Top Miscue Type, Most Common Miscued Words with Example error and its total attempts (or error count))
 * Return:
 * - Top Miscue Type, Most Common Miscued Words with Example error and its total attempts (or error count)
 */
const getOverallTopMiscueType = async (
  facultyId: string,
  filter?: FilterOptions,
): Promise<OverAllStudentTopMiscue[]> => {
  try {
    // Get filtered student IDs
    const { studentIds } = await getFilteredStudentIds(
      facultyId,
      filter || { type: 'overall' },
    );

    if (!studentIds?.length) {
      return [getEmptyOverallResponse()];
    }

    // Initialize aggregation structures
    const miscueTypeTotals = {
      substitution: 0,
      omission: 0,
      insertion: 0,
      repetition: 0,
    };

    // Track word-level miscue data
    const wordMap: Record<
      string,
      {
        errorExamples: Set<string>;
        count: number;
        studentIds: Set<string>;
        miscueTypes: Record<string, number>;
      }
    > = {};

    // Track passage data
    const passageMap: Record<
      string,
      {
        miscueCount: number;
        accuracySum: number;
        attemptCount: number;
      }
    > = {};
    const dateRange = resolveDateRange(filter);

    // For each student, get their miscue reports
    for (const studentId of studentIds) {
      const allReports = await getStudentReports(studentId);
      const reports    = filterReportsByDateRange(allReports, dateRange);

      for (const report of reports) {
        // ============ FIXED: Count miscue types from report totals ============
        miscueTypeTotals.substitution += report.substitutionCount ?? 0;
        miscueTypeTotals.omission += report.omissionCount ?? 0;
        miscueTypeTotals.insertion += report.insertionCount ?? 0;
        miscueTypeTotals.repetition += report.repetitionCount ?? 0;

        // Track passage data
        if (report.passageTitle) {
          const passageTitle = report.passageTitle;
          if (!passageMap[passageTitle]) {
            passageMap[passageTitle] = {
              miscueCount: 0,
              accuracySum: 0,
              attemptCount: 0,
            };
          }
          
          passageMap[passageTitle].attemptCount++;
          passageMap[passageTitle].accuracySum += report.accuracyRate || 0;
          
          // Add total miscues from this report to passage count
          const totalReportMiscues = calculateTotalMiscues(report);
          passageMap[passageTitle].miscueCount += totalReportMiscues;
        }

        // ============ Process individual miscues for word-level analysis ============
        if (report.miscues?.length) {
          report.miscues.forEach(miscue => {
            const expectedWord = miscue.expectedWord?.toLowerCase().trim();
            if (!expectedWord) return;

            // Initialize word entry if needed
            if (!wordMap[expectedWord]) {
              wordMap[expectedWord] = {
                errorExamples: new Set<string>(),
                count: 0,
                studentIds: new Set<string>(),
                miscueTypes: {
                  substitution: 0,
                  omission: 0,
                  insertion: 0,
                  repetition: 0,
                },
              };
            }

            // Increment word count (each miscue instance counts as 1)
            wordMap[expectedWord].count++;
            wordMap[expectedWord].studentIds.add(studentId);

            // Track miscue type for this word
            if (isValidMiscueType(miscue.type)) {
              wordMap[expectedWord].miscueTypes[miscue.type] =
                (wordMap[expectedWord].miscueTypes[miscue.type] || 0) + 1;
            }

            // Track error example
            if (miscue.spokenWord) {
              wordMap[expectedWord].errorExamples.add(
                miscue.spokenWord.toLowerCase().trim(),
              );
            }
          });
        }
      }
    }

    // Check if we have any data
    const totalAllMiscues = Object.values(miscueTypeTotals).reduce((a, b) => a + b, 0);
    
    if (totalAllMiscues === 0) {
      return [getEmptyOverallResponse()];
    }

    // ============ Calculate top miscue type ============
    const topMiscueEntry = Object.entries(miscueTypeTotals).sort(
      ([, a], [, b]) => b - a,
    )[0];

    const topMiscueType = formatMiscueType(topMiscueEntry[0]);

    // ============ Calculate common miscue words ============
    const commonMiscueWords = Object.entries(wordMap)
      .map(([word, data]) => {
        const dominantMiscueTypeEntry = Object.entries(data.miscueTypes).sort(
          ([, a], [, b]) => b - a,
        )[0];

        const dominantMiscueType = dominantMiscueTypeEntry
          ? formatMiscueType(dominantMiscueTypeEntry[0])
          : 'N/A';

        return {
          word: capitalizeFirstLetter(word),
          errorExample: Array.from(data.errorExamples)[0] || '—',
          errorCount: data.count,
          studentCount: data.studentIds.size,
          dominantMiscueType,
          miscueTypes: data.miscueTypes,
        };
      })
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 5);

    // ============ Calculate top miscued passage ============
    let topMiscuedPassage: Array<{
      title: string;
      averageAccuracy: number;
      attempts: number;
      totalMiscues: number;
    }> = [];

    if (Object.keys(passageMap).length > 0) {
      const sortedPassages = Object.entries(passageMap).sort(
        ([, a], [, b]) => b.miscueCount - a.miscueCount,
      );

      const [topPassageTitle, topPassageData] = sortedPassages[0];

      topMiscuedPassage = [
        {
          title: topPassageTitle,
          averageAccuracy: calculateAverageAccuracy(
            topPassageData.accuracySum,
            topPassageData.attemptCount,
          ),
          attempts: topPassageData.attemptCount,
          totalMiscues: topPassageData.miscueCount,
        },
      ];
    }

    return [
      {
        topMiscueType,
        commonMiscueWords,
        topMiscuedPassage,
      },
    ];
  } catch (error: any) {
    console.error('Failed to get top miscue type:', error);
    throw new Error(`Failed to get top miscue type: ${error.message}`);
  }
};

// ==================== UTILITY FUNCTIONS ====================

const calculateTotalMiscues = (report: any): number => {
  return (
    (report.substitutionCount ?? 0) +
    (report.omissionCount ?? 0) +
    (report.insertionCount ?? 0) +
    (report.repetitionCount ?? 0)
  );
};

const calculateAverageAccuracy = (sum: number, count: number): number => {
  return count > 0 ? Number((sum / count).toFixed(2)) : 0;
};

const capitalizeFirstLetter = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const isValidMiscueType = (type: string): boolean => {
  return ['substitution', 'omission', 'insertion', 'repetition'].includes(type);
};

const getEmptyOverallResponse = (): OverAllStudentTopMiscue => ({
  topMiscueType: 'No data',
  commonMiscueWords: [],
  topMiscuedPassage: [],
});
  const getOverallAverageWPMandAccuracy = async (
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<AverageWPMandAccuracy> => {
    try {
      // Get filtered student IDs
      const { studentIds } = await getFilteredStudentIds(
        facultyId,
        filter || { type: 'overall' },
      );
      let totalStudentAverageAccuracy = 0;
      let totalStudentAverageWPM = 0;
      let totalStudentsWithReports = 0;
      let totalStudents = 0;
      let totalReports = 0;

      const processedStudents = new Set<string>();
      const dateRange  = resolveDateRange(filter);   // ← ADD (compute once outside the loop)

      for (const studentId of studentIds) {
        if (processedStudents.has(studentId)) continue;

        processedStudents.add(studentId);
        totalStudents++;

        const allReports = await getStudentReports(studentId);
        const reports    = filterReportsByDateRange(allReports, dateRange); 
        const studentReportsCount = reports.length;

        if (studentReportsCount > 0) {
          // Calculate THIS STUDENT'S averages
          const studentTotalAccuracy = reports.reduce(
            (sum, report) => sum + (report.accuracyRate || 0),
            0,
          );
          const studentTotalWPM = reports.reduce(
            (sum, report) => sum + (report.wordPerMin || 0),
            0,
          );

          const studentAverageAccuracy =
            studentTotalAccuracy / studentReportsCount;
          const studentAverageWPM = studentTotalWPM / studentReportsCount;

          // Add this student's averages to the overall totals
          totalStudentAverageAccuracy += studentAverageAccuracy;
          totalStudentAverageWPM += studentAverageWPM;
          totalStudentsWithReports++;
        }

        totalReports += studentReportsCount;
      }

      // Calculate overall averages (average of student averages)
      const averageAccuracy =
        totalStudentsWithReports > 0
          ? parseFloat(
              (totalStudentAverageAccuracy / totalStudentsWithReports).toFixed(
                2,
              ),
            )
          : 0;

      const averageWPM =
        totalStudentsWithReports > 0
          ? parseFloat(
              (totalStudentAverageWPM / totalStudentsWithReports).toFixed(2),
            )
          : 0;

      return {
        averageAccuracy,
        averageWPM,
        totalReports,
        totalStudents: processedStudents.size,
      };
    } catch (error: any) {
      throw new Error(
        'Failed to compute the average WPM and Accurate rate: ' + error.message,
      );
    }
  };

  return {
    getNumberOfClasses,
    getNumbersOfAllStudents,
    getActiveHours,
    getOverallCommonMiscueType,
    getOverallTopMiscueType,
    getOverallAverageWPMandAccuracy,
  };
};
