import { useState } from 'react';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  arrayRemove,
  arrayUnion,
} from '@react-native-firebase/firestore';
import { getFacultyClasses_Student } from './useFacultyClasses_Students';
import { MiscueReportController } from '../Controller/MiscueReportController';
import {
  MiscuePercentage,
  OverAllStudentTopMiscue,
  AverageWPMandAccuracy,
} from '../Types/miscue';
import { getDateRangeForTimeFilter } from '../Utils/dateRange';
import { FilterOptions } from '../Types/miscue';

// Initialize instances
const db = getFirestore();

export const getForStudentsMiscueStats = () => {
  const { getStudentReports, formatMiscueType, getRecordingDuration } =
    MiscueReportController;
  const { getFacultyClasses } = getFacultyClasses_Student;

  const getActiveHours = async (
    facultyId: string,
    timeRange: 'week' | 'month' | 'year',
  ): Promise<{ day: string; hours: number }[]> => {
    try {
      const classes = await getFacultyClasses(facultyId);
      const { start, end } = getDateRangeForTimeFilter(timeRange);

      let buckets: string[] = [];
      let totals: Record<string, number> = {};

      if (timeRange === 'week') {
        buckets = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
      } else if (timeRange === 'month') {
        buckets = ['W1', 'W2', 'W3', 'W4', 'W5'];
      } else {
        // Based on starting academic year of DepEd
        buckets = [
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
        ];
      }

      buckets.forEach(b => (totals[b] = 0));

      for (const classItem of classes) {
        const studentIds = classItem.studentIds || [];

        for (const studentId of studentIds) {
          const reports = await getRecordingDuration(studentId);

          for (const report of reports) {
            const reportDate = report.timestamp.toDate();
            if (reportDate < start || reportDate > end) continue;

            const hours = convertDurationToHours(
              report.recordingDuration || '0:00',
            );

            let bucket: string | null = null;

            if (timeRange === 'week') {
              bucket = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'][
                reportDate.getDay()
              ];
            } else if (timeRange === 'month') {
              const weekOfMonth = Math.ceil(reportDate.getDate() / 7);
              bucket = `W${weekOfMonth}`;
            } else {
              bucket = reportDate.toLocaleString('en-US', { month: 'short' });
            }

            if (bucket && totals[bucket] !== undefined) {
              totals[bucket] += hours;
            }
          }
        }
      }

      console.log('This is the output of the active hours: ' + totals);
      return buckets.map(b => ({
        day: b,
        hours: totals[b],
      }));
    } catch (error: any) {
      throw new Error('Failed to get active hours: ' + error.message);
    }
  };

  /**
   * Convert duration string to hours (decimal)
   * Supports both formats:
   * - M:SS (0:15 = 15 seconds)
   * - HH:MM:SS (0:15:30 = 15 minutes 30 seconds)
   */
  const convertDurationToHours = (duration: string): number => {
    if (!duration) return 0;

    try {
      const parts = duration.split(':').map(part => parseInt(part) || 0);

      if (parts.length === 2) {
        // Format: M:SS (minutes:seconds)
        const minutes = parts[0];
        const seconds = parts[1];

        // Convert to hours: (minutes * 60 + seconds) / 3600
        const totalSeconds = minutes * 60 + seconds;
        return totalSeconds / 3600;
      } else if (parts.length === 3) {
        // Format: HH:MM:SS (hours:minutes:seconds)
        const hours = parts[0];
        const minutes = parts[1];
        const seconds = parts[2];

        return hours + minutes / 60 + seconds / 3600;
      } else {
        console.warn('Invalid duration format:', duration);
        return 0;
      }
    } catch (error) {
      console.error('Error converting duration:', duration, error);
      return 0;
    }
  };

  /**
   * Get student IDs based on filter
   */
  const getFilteredStudentIds = async (
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<{ studentIds: string[]; className?: string }> => {
    try {
      const classes = await getFacultyClasses(facultyId);

      if (filter?.type === 'class' && filter.classId) {
        // Get specific class
        const selectedClass = classes.find(
          cls => cls.classId === filter.classId,
        );
        if (!selectedClass) {
          throw new Error('Class not found');
        }
        return {
          studentIds: selectedClass.studentIds || [],
          className: selectedClass.className,
        };
      } else {
        // Get all students from all classes
        const allStudentIds = classes.flatMap(cls => cls.studentIds || []);
        // Remove duplicates (students might be in multiple classes?)
        const uniqueStudentIds = Array.from(new Set(allStudentIds));
        return { studentIds: uniqueStudentIds };
      }
    } catch (error: any) {
      throw new Error('Failed to get filtered students: ' + error.message);
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
      const { studentIds } = await getFilteredStudentIds(facultyId, filter || { type: 'overall' });

      // Initialize miscue type counters
      const miscueCounts = {
        substitution: 0,
        omission: 0,
        insertion: 0,
        repetition: 0,
      };

      let totalStudents = 0;
      let totalReports = 0;
      let totalMiscues = 0;

      // For each students, get all their reports using getStudentReports function
      for (const studentId of studentIds) {
        const reports = await getStudentReports(studentId);
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
  const getOverallTopMiscueType = async (
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<OverAllStudentTopMiscue[]> => {
    try {
      // Get filtered student IDs
      const { studentIds } = await getFilteredStudentIds(facultyId, filter || { type: 'overall' });

      // Initialize data structure for aggregation
      const allMiscues: Array<{
        type: string;
        expectedWord: string;
        spokenWord: string;
        passageTitle: string;
        accuracyRate: number;
      }> = [];

      // Track passage data for top miscued passage
      const passageMap: Record<
        string,
        {
          miscueCount: number;
          accuracySum: number;
          attemptCount: number;
        }
      > = {};

      // For each student, get their miscue reports
      for (const studentId of studentIds) {
        const reports = await getStudentReports(studentId);

        // Collect all miscues from all reports
        for (const report of reports) {
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
          }

          if (report.miscues && Array.isArray(report.miscues)) {
            report.miscues.forEach(miscue => {
              if (report.passageTitle) {
                passageMap[report.passageTitle].miscueCount++;
              }

              allMiscues.push({
                type: miscue.type,
                expectedWord: miscue.expectedWord,
                spokenWord: miscue.spokenWord || '',
                passageTitle: report.passageTitle || 'Unknown Passage',
                accuracyRate: report.accuracyRate || 0,
              });
            });
          }
        }
      }

      if (allMiscues.length === 0) {
        console.log('No miscues found');
        return [
          {
            topMiscueType: 'No data',
            commonMiscueWords: [],
            topMiscuedPassage: [],
          },
        ];
      }

      // Calculate top miscue type
      const miscueTypeCount = {
        substitution: 0,
        omission: 0,
        insertion: 0,
        repetition: 0,
      };

      allMiscues.forEach(miscue => {
        if (miscue.type === 'substitution') miscueTypeCount.substitution++;
        else if (miscue.type === 'omission') miscueTypeCount.omission++;
        else if (miscue.type === 'insertion') miscueTypeCount.insertion++;
        else if (miscue.type === 'repetition') miscueTypeCount.repetition++;
      });

      const topMiscueEntry = Object.entries(miscueTypeCount).sort(
        ([, a], [, b]) => b - a,
      )[0];

      const topMiscueType = formatMiscueType(topMiscueEntry[0]);

      // Calculate common words
      const wordMap: Record<
        string,
        {
          errorExamples: Set<string>;
          count: number;
          miscueTypes: Record<string, number>; // Track miscue types for each word
        }
      > = {};

      allMiscues.forEach(miscue => {
        const expectedWord = miscue.expectedWord.toLowerCase().trim();
        // Initialize wordMap entry if it doesn't exist
        if (!wordMap[expectedWord]) {
          wordMap[expectedWord] = {
            errorExamples: new Set<string>(),
            count: 0,
            miscueTypes: {
              substitution: 0,
              omission: 0,
              insertion: 0,
              repetition: 0,
            },
          };
        }

        wordMap[expectedWord].count++;

        // Track miscue type for this word
        wordMap[expectedWord].miscueTypes[miscue.type] =
          (wordMap[expectedWord].miscueTypes[miscue.type] || 0) + 1;

        if (miscue.spokenWord) {
          wordMap[expectedWord].errorExamples.add(
            miscue.spokenWord.toLowerCase().trim(),
          );
        }
      });

      // Find dominant miscue type for each word
      const commonMiscueWords = Object.entries(wordMap)
        .map(([word, data]) => {
          // Find the most common miscue type for this word
          const dominantMiscueTypeEntry = Object.entries(data.miscueTypes).sort(
            ([, a], [, b]) => b - a,
          )[0];

          const dominantMiscueType = dominantMiscueTypeEntry
            ? formatMiscueType(dominantMiscueTypeEntry[0])
            : 'N/A';

          return {
            word: word.charAt(0).toUpperCase() + word.slice(1),
            errorExample: Array.from(data.errorExamples)[0] || 'N/A',
            errorCount: data.count,
            dominantMiscueType: dominantMiscueType,
            miscueTypes: data.miscueTypes, // Include full breakdown if needed
          };
        })
        .sort((a, b) => b.errorCount - a.errorCount)
        .slice(0, 5);

      // Find top miscued passage
      let topMiscuedPassage: Array<{
        title: string;
        averageAccuracy: number;
        attempts: number;
        totalMiscues: number;
      }> = [];

      if (Object.keys(passageMap).length > 0) {
        const passageEntries = Object.entries(passageMap);

        // Sort by miscue count (most miscues first)
        const sortedPassages = passageEntries.sort(
          ([, a], [, b]) => b.miscueCount - a.miscueCount,
        );

        const [topPassageTitle, topPassageData] = sortedPassages[0];

        // Wrap in array to match interface
        topMiscuedPassage = [
          {
            title: topPassageTitle,
            averageAccuracy:
              topPassageData.attemptCount > 0
                ? parseFloat(
                    (
                      topPassageData.accuracySum / topPassageData.attemptCount
                    ).toFixed(2),
                  )
                : 0,
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
      throw new Error('Failed to get top miscue type: ' + error.message);
    }
  };

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

      for (const studentId of studentIds) {
        if (processedStudents.has(studentId)) continue;

        processedStudents.add(studentId);
        totalStudents++;

        const reports = await getStudentReports(studentId);
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
