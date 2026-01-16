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
  ProgressData,
  AverageWPMandAccuracy,
} from '../Types/miscue';
import { ClassDocument } from '../Types/dataInterfaces';

// Initialize instances
const db = getFirestore();

export const getForStudentsMiscueStats = () => {
  const { getStudentReports, formatMiscueType, getRecordingDuration } =
    MiscueReportController;
  const { getFacultyClasses } = getFacultyClasses_Student;

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
   * Get aggregated active hours by day for all students in a class
   */
  const getActiveHours = async (
    facultyId: string,
  ): Promise<{ day: string; hours: number }[]> => {
    try {
      // 1. Get all students in the class
      const classes = await getFacultyClasses(facultyId);

      // Initialize daily hours (0 for all days)
      const daysOfWeek = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
      const dailyHours = daysOfWeek.reduce((acc, day) => {
        acc[day] = 0;
        return acc;
      }, {} as Record<string, number>);

      // 2. For each student, get their reports and sum recording durations
      for (const classItem of classes) {
        const studentIds = classItem.studentIds || [];

        // 3. For each student, get their reports and sum recording durations
        for (const studentId of studentIds) {
          const reports = await getRecordingDuration(studentId);

          for (const report of reports) {
            // Convert recording duration string to hours
            const hours = convertDurationToHours(
              report.recordingDuration || '0:00',
            );

            // Get day of week from timestamp
            const reportDate = report.timestamp.toDate();
            // 0 = Sunday, 1 = Monday, etc.
            const dayIndex = reportDate.getDay();
            const dayAbbreviation = daysOfWeek[dayIndex];

            // Add to daily total
            dailyHours[dayAbbreviation] += hours;
          }
        }
      }

      // 4. Convert to array format for the chart
      return daysOfWeek.map(day => ({
        day,
        hours: dailyHours[day],
      }));
    } catch (error: any) {
      throw new Error('Failed to get active hours:' + error.message);
    }
  };

// /**
//  * Get aggregated active hours with proper time filtering by calendar year
//  */
// const getActiveHours = async (
//   facultyId: string,
//   timeRange: 'week' | 'month' | 'year' = 'week',
//   selectedYear: number = new Date().getFullYear()
// ): Promise<{ day: string; hours: number }[]> => {
//   try {
//     // 1. Get all classes for the faculty (no academic year filtering needed)
//     const allClasses = await getFacultyClasses(facultyId);

//     // 2. Calculate date range based on timeRange and selectedYear
//     let startDate: Date;
//     let endDate: Date;
//     const now = new Date();
//     const currentYear = now.getFullYear();

//     switch (timeRange) {
//       case 'week':
//         // For current year: last 4 weeks from now
//         // For past years: last 4 weeks of that year
//         if (selectedYear === currentYear) {
//           endDate = now;
//           startDate = new Date(now);
//           startDate.setDate(now.getDate() - 28);
//         } else {
//           // For past years: last 4 weeks of December
//           endDate = new Date(selectedYear, 11, 31); // Dec 31
//           startDate = new Date(endDate);
//           startDate.setDate(endDate.getDate() - 28);
//         }
//         break;
        
//       case 'month':
//         // Show current month for current year, or entire month for past years
//         if (selectedYear === currentYear) {
//           endDate = now;
//           startDate = new Date(selectedYear, now.getMonth(), 1);
//         } else {
//           // For past years: show all 12 months
//           endDate = new Date(selectedYear, 11, 31);
//           startDate = new Date(selectedYear, 0, 1); // Jan 1
//         }
//         break;
        
//       case 'year':
//         // Entire year
//         endDate = new Date(selectedYear, 11, 31);
//         startDate = new Date(selectedYear, 0, 1);
//         break;
        
//       default:
//         endDate = now;
//         startDate = new Date(now);
//         startDate.setDate(now.getDate() - 28);
//         break;
//     }

//     // 3. Initialize data structure based on time range
//     let chartData: { day: string; hours: number }[] = [];

//     if (timeRange === 'week') {
//       // For week view: 4 weeks
//       chartData = Array.from({ length: 4 }, (_, i) => ({
//         day: `Week ${i + 1}`,
//         hours: 0
//       }));
//     } else if (timeRange === 'month') {
//       if (selectedYear === currentYear) {
//         // Current year: days up to today
//         const daysInMonth = now.getDate();
//         chartData = Array.from({ length: daysInMonth }, (_, i) => ({
//           day: (i + 1).toString(),
//           hours: 0
//         }));
//       } else {
//         // Past year: all 12 months
//         const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
//                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//         chartData = months.map(month => ({ day: month, hours: 0 }));
//       }
//     } else if (timeRange === 'year') {
//       // Year view: all 12 months
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
//                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       chartData = months.map(month => ({ day: month, hours: 0 }));
//     }

//     // 4. Collect all student IDs from all classes
//     const allStudentIds: string[] = [];
//     for (const classItem of allClasses) {
//       allStudentIds.push(...(classItem.studentIds || []));
//     }

//     // Remove duplicates
//     const uniqueStudentIds = [...new Set(allStudentIds)];

//     // 5. Process reports for all unique students
//     for (const studentId of uniqueStudentIds) {
//       try {
//         const reports = await getRecordingDuration(studentId);

//         // Filter reports by date range
//         const filteredReports = reports.filter(report => {
//           const reportDate = report.timestamp.toDate();
//           return reportDate >= startDate && reportDate <= endDate;
//         });

//         // Aggregate hours for each report
//         for (const report of filteredReports) {
//           const hours = convertDurationToHours(report.recordingDuration || '0:00');
//           const reportDate = report.timestamp.toDate();
          
//           // Add to appropriate time bucket
//           if (timeRange === 'week') {
//             // Calculate which week (0-3) the report falls into
//             const daysSinceStart = Math.floor(
//               (reportDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
//             );
//             const weekIndex = Math.floor(daysSinceStart / 7);
//             if (weekIndex >= 0 && weekIndex < 4) {
//               chartData[weekIndex].hours += hours;
//             }
//           } else if (timeRange === 'month') {
//             if (selectedYear === currentYear) {
//               // Current year: by day
//               const dayOfMonth = reportDate.getDate() - 1;
//               if (dayOfMonth >= 0 && dayOfMonth < chartData.length) {
//                 chartData[dayOfMonth].hours += hours;
//               }
//             } else {
//               // Past year: by month
//               const monthIndex = reportDate.getMonth();
//               chartData[monthIndex].hours += hours;
//             }
//           } else if (timeRange === 'year') {
//             const monthIndex = reportDate.getMonth();
//             chartData[monthIndex].hours += hours;
//           }
//         }
//       } catch (error) {
//         console.error(`Error processing student ${studentId}:`, error);
//         continue;
//       }
//     }

//     // 6. Round hours to 2 decimal places
//     chartData.forEach(item => {
//       item.hours = parseFloat(item.hours.toFixed(2));
//     });

//     return chartData;
//   } catch (error: any) {
//     throw new Error('Failed to get active hours: ' + error.message);
//   }
// };

// // Helper function to generate year options
// const getAvailableYears = (): number[] => {
//   const currentYear = new Date().getFullYear();
//   const years: number[] = [];
  
//   // Show current year and previous 4 years
//   for (let i = 0; i <= 4; i++) {
//     years.push(currentYear - i);
//   }
  
//   return years;
// };

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
  ): Promise<MiscuePercentage[]> => {
    try {
      // Get all the classes handled by the faculty
      const classes = await getFacultyClasses(facultyId);

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

      // Get all student IDs from each class
      for (const classItem of classes) {
        const studentIds = classItem.studentIds || [];
        totalStudents += studentIds.length;

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
  ): Promise<OverAllStudentTopMiscue[]> => {
    try {
      // Get all the classes handled by the faculty
      const classes = await getFacultyClasses(facultyId);

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

      // For each class, get all the students
      for (const classItem of classes) {
        const studentIds = classItem.studentIds || [];

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
                    ).toFixed(1),
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
  ): Promise<AverageWPMandAccuracy> => {
    try {
      const classes = await getFacultyClasses(facultyId);

      let totalStudentAverageAccuracy = 0;
      let totalStudentAverageWPM = 0;
      let totalStudentsWithReports = 0;
      let totalStudents = 0;
      let totalReports = 0;

      const processedStudents = new Set<string>();

      for (const classItem of classes) {
        const studentIds = classItem.studentIds || [];
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
