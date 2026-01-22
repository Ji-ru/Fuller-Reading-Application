import { useState, useEffect } from 'react';
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
import { UserDocument, MiscueReportDocument } from '../Interfaces/dataInterfaces';
import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { MiscueReportController } from '../Controller/MiscueReportController';
import { ClassReadingHealth, StudentReadingStatus } from '../Interfaces/miscue';
const db = getFirestore(); // Get firestore instance

// Default thresholds for Grades 1-3 only
const defaultThresholds = {
  fluentAccuracy: 95,
  developingAccuracy: 85,
  emergingAccuracy: 70,

  // WPM norms for grades 1-3 (based on research for younger readers)
  fluentWPM: (gradeLevel: number) => {
    const norms: Record<number, number> = {
      1: 60, // Grade 1: 60+ WPM = Fluent
      2: 90, // Grade 2: 90+ WPM = Fluent
      3: 110, // Grade 3: 110+ WPM = Fluent
    };
    return norms[gradeLevel] || 60; // Default to grade 1 if grade level is unexpected
  },
  developingWPM: (gradeLevel: number) => {
    const norms: Record<number, number> = {
      1: 40, // Grade 1: 40-59 WPM = Developing
      2: 65, // Grade 2: 65-89 WPM = Developing
      3: 85, // Grade 3: 85-109 WPM = Developing
    };
    return norms[gradeLevel] || 40;
  },
  emergingWPM: (gradeLevel: number) => {
    const norms: Record<number, number> = {
      1: 20, // Grade 1: 20-39 WPM = Emerging
      2: 40, // Grade 2: 40-64 WPM = Emerging
      3: 60, // Grade 3: 60-84 WPM = Emerging
    };
    return norms[gradeLevel] || 20;
  },

  // Miscue density thresholds (younger readers may have more miscues)
  fluentMiscueDensity: 8, // <8 miscues per 100 words for younger readers
  developingMiscueDensity: 15, // 8-15 miscues per 100 words
  emergingMiscueDensity: 25, // 16-25 miscues per 100 words
  // >25 miscues per 100 words = At Risk

  improvingTrend: 5,
  decliningTrend: 5,
};

// Calculate miscue density from report
const calculateMiscueDensity = (report: MiscueReportDocument): number => {
  // Count total miscues from the miscues array
  const totalMiscues = report.miscues.length;

  // Now we have totalWords field, use it for accurate calculation
  if (report.totalWords && report.totalWords > 0) {
    // Calculate miscues per 100 words
    return (totalMiscues / report.totalWords) * 100;
  } else {
    // Fallback to estimation if totalWords is missing (for backward compatibility)
    console.warn(`Report ${report.reportId} is missing totalWords field`);
    const estimatedTotalWords =
      (report.substitution?.split(',').length || 0) +
      (report.omission?.split(',').length || 0) +
      (report.insertion?.split(',').length || 0) +
      (report.repetition?.split(',').length || 0) +
      totalMiscues;

    return estimatedTotalWords > 0
      ? (totalMiscues / estimatedTotalWords) * 100
      : 0;
  }
};
// Analyze trend from recent reports
const analyzeTrend = (
  reports: MiscueReportDocument[],
): 'improving' | 'stable' | 'declining' => {
  if (reports.length < 2) return 'stable';

  // Sort reports by timestamp (oldest to newest)
  const sortedReports = [...reports].sort(
    (a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime(),
  );

  // Get last 3 reports for trend analysis (or all if less than 3)
  const recentReports = sortedReports.slice(-3);
  const accuracies = recentReports.map(r => r.accuracyRate);

  // Use linear regression for better trend analysis
  if (recentReports.length >= 2) {
    const xValues = Array.from(
      { length: recentReports.length },
      (_, i) => i + 1,
    );
    const yValues = accuracies;

    // Calculate slope (trend)
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Classify based on slope
    if (slope > defaultThresholds.improvingTrend / 10) {
      // Adjusted for linear regression
      return 'improving';
    } else if (slope < -defaultThresholds.decliningTrend / 10) {
      return 'declining';
    }
  }
  return 'stable';
};

// Classify a student based on their performance
const classifyStudent = (
  studentReports: MiscueReportDocument[],
  gradeLevel: number,
): StudentReadingStatus | null => {
  if (studentReports.length === 0) return null;

  // Calculate averages
  const totalAccuracy = studentReports.reduce(
    (sum, report) => sum + report.accuracyRate,
    0,
  );
  const totalWPM = studentReports.reduce(
    (sum, report) => sum + report.wordPerMin,
    0,
  );
  const averageAccuracy = totalAccuracy / studentReports.length;
  const averageWPM = totalWPM / studentReports.length;

  // Calculate average miscue density
  const totalMiscueDensity = studentReports.reduce(
    (sum, report) => sum + calculateMiscueDensity(report),
    0,
  );
  const averageMiscueDensity = totalMiscueDensity / studentReports.length;

  // Analyze trend
  const trend = analyzeTrend(studentReports);

  // Classification algorithm
  let status: 'fluent' | 'developing' | 'emerging' | 'atRisk';

  // Priority 1: Check accuracy
  if (averageAccuracy >= defaultThresholds.fluentAccuracy) {
    // Check other metrics for fluent
    if (
      averageWPM >= defaultThresholds.fluentWPM(gradeLevel) &&
      averageMiscueDensity <= defaultThresholds.fluentMiscueDensity &&
      trend !== 'declining'
    ) {
      status = 'fluent';
    } else {
      status = 'developing';
    }
  } else if (averageAccuracy >= defaultThresholds.developingAccuracy) {
    // Check for developing
    if (
      averageWPM >= defaultThresholds.developingWPM(gradeLevel) &&
      averageMiscueDensity <= defaultThresholds.developingMiscueDensity
    ) {
      status = 'developing';
    } else {
      status = 'emerging';
    }
  } else if (averageAccuracy >= defaultThresholds.emergingAccuracy) {
    // Check for emerging
    if (
      averageWPM >= defaultThresholds.emergingWPM(gradeLevel) &&
      averageMiscueDensity <= defaultThresholds.emergingMiscueDensity
    ) {
      status = 'emerging';
    } else {
      status = 'atRisk';
    }
  } else {
    // At Risk
    status = 'atRisk';
  }

  // Override based on trend if declining significantly
  if (status !== 'atRisk' && trend === 'declining' && averageAccuracy < 80) {
    status = 'emerging';
  }

  // Override based on miscue density if very high
  if (averageMiscueDensity > 25) {
    status = 'atRisk';
  }

  return {
    studentId: studentReports[0].studentId,
    name: '', // Will be filled in later
    gradeLevel,
    status,
    averageAccuracy: parseFloat(averageAccuracy.toFixed(2)),
    averageWPM: parseFloat(averageWPM.toFixed(2)),
    miscueDensity: parseFloat(averageMiscueDensity.toFixed(2)),
    trend,
    lastReportDate: new Date(
      studentReports[studentReports.length - 1].timestamp.toDate(),
    ),
  };
};

export const useClassReadingHealth = () => {
  const getClassReadingHealth = async (
    facultyId: string,
  ): Promise<ClassReadingHealth[]> => {
    try {
      // Get all classes for the faculty
      const classes = await getFacultyClasses_Student.getFacultyClasses(
        facultyId,
      );

      const classHealthData: ClassReadingHealth[] = [];

      for (const classItem of classes) {
        const studentIds = classItem.studentIds || [];
        const studentStatuses: StudentReadingStatus[] = [];

        const academicYear = classItem.acadYear;

        // Process each student in the class
        for (const studentId of studentIds) {
          try {
            // Get student data from users collection
            const studentDoc = await getDoc(doc(db, 'users', studentId));

            if (!studentDoc.exists()) {
              console.warn(`Student document not found: ${studentId}`);
              continue;
            }

            const studentData = studentDoc.data() as UserDocument;

            // Check if student has studentData
            if (!studentData.studentData) {
              console.warn(`Student ${studentId} has no studentData`);
              continue;
            }

            const gradeLevel = studentData.studentData.gradeLevel || 1;

            // Get student reports
            const reports = await MiscueReportController.getStudentReports(
              studentId,
            );

            if (reports.length === 0) {
              // Student has no reports - you might want to handle this differently
              console.log(`Student ${studentId} has no miscue reports`);
              continue;
            }

            // Filter for recent reports (last 30 days) - optional
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentReports = reports.filter(report => {
              const reportDate = new Date(report.timestamp.toDate());
              return reportDate >= thirtyDaysAgo;
            });

            // Use recent reports if available, otherwise use all reports
            const reportsToUse =
              recentReports.length > 0 ? recentReports : reports;

            // Classify the student
            const studentStatus = classifyStudent(reportsToUse, gradeLevel);

            if (studentStatus) {
              // Add student name
              studentStatus.name = `${studentData.firstName} ${studentData.lastName}`;
              studentStatuses.push(studentStatus);
            }
          } catch (studentError) {
            console.error(
              `Error processing student ${studentId}:`,
              studentError,
            );
            // Continue with next student instead of failing entire process
            continue;
          }
        }

        // Count students in each category
        const fluentStudents = studentStatuses.filter(
          s => s.status === 'fluent',
        );
        const developingStudents = studentStatuses.filter(
          s => s.status === 'developing',
        );
        const emergingStudents = studentStatuses.filter(
          s => s.status === 'emerging',
        );
        const atRiskStudents = studentStatuses.filter(
          s => s.status === 'atRisk',
        );

        const totalStudentsWithReports = studentStatuses.length;
        const totalStudentsInClass = studentIds.length;

        // Calculate percentages based on students with reports
        const calculatePercentage = (count: number) =>
          totalStudentsWithReports > 0
            ? parseFloat(((count / totalStudentsWithReports) * 100).toFixed(1))
            : 0;

        classHealthData.push({
          classId: classItem.classId,
          className: classItem.className || classItem.classCode,
          acadYear: academicYear,
          readingHealth: {
            fluent: {
              percentage: calculatePercentage(fluentStudents.length),
              count: fluentStudents.length,
              students: fluentStudents.map(s => s.name),
            },
            developing: {
              percentage: calculatePercentage(developingStudents.length),
              count: developingStudents.length,
              students: developingStudents.map(s => s.name),
            },
            emerging: {
              percentage: calculatePercentage(emergingStudents.length),
              count: emergingStudents.length,
              students: emergingStudents.map(s => s.name),
            },
            atRisk: {
              percentage: calculatePercentage(atRiskStudents.length),
              count: atRiskStudents.length,
              students: atRiskStudents.map(s => s.name),
            },
          },
          totalStudents: totalStudentsInClass,
          lastUpdated: new Date(),
        });
      }

      return classHealthData;
    } catch (error: any) {
      console.error('Error in getClassReadingHealth:', error);
      throw new Error(`Failed to get class reading health: ${error.message}`);
    }
  };

  return { getClassReadingHealth };
};
