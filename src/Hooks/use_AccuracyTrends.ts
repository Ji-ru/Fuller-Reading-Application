// use_HooksAccuracyTrends.ts
import { useState, useEffect, useCallback } from 'react';
import { FilterOptions, ProgressData } from '../Interfaces/miscue';
import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { MiscueReportController } from '../Controller/MiscueReportController';
import { 
  getDateRangeForTimeFilter, 
} from '../Utilities/dateRange';

import { getPeriodLabels, getLabelForDate } from '../Utilities/activityGroupingDate';



interface UseAccuracyTrendsParams {
  timeRange: 'week' | 'month' | 'year';
  filterType: 'overall' | 'class';
  classId?: string;
  academicYear?: string;
}

interface BucketData {
  accuracySum: number;
  totalWords: number;
  totalMinutes: number;
  reportCount: number;
  studentSet: Set<string>;
}

export const useAccuracyTrends = (
  facultyId: string | null | undefined,
  params: UseAccuracyTrendsParams
) => {
  const [chartData, setChartData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { getFilteredStudentIds } = getFacultyClasses_Student;
  const { getStudentReports } = MiscueReportController;

  // Helper function to parse recording duration
  const parseRecordingDuration = useCallback((duration: any): number => {
    if (!duration) return 0;
    
    if (typeof duration === 'number') {
      return duration / 60; // Convert seconds to minutes
    }
    
    if (typeof duration === 'string') {
      // Handle "HH:MM:SS" format or seconds string
      if (duration.includes(':')) {
        const parts = duration.split(':');
        if (parts.length === 3) {
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          const seconds = parseInt(parts[2]) || 0;
          return hours * 60 + minutes + seconds / 60;
        }
      } else {
        // Try parsing as seconds
        const seconds = parseFloat(duration);
        if (!isNaN(seconds)) {
          return seconds / 60;
        }
      }
    }
    
    return 0;
  }, []);

  const fetchAccuracyData = useCallback(async () => {
    if (!facultyId) {
      setChartData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching accuracy trends for faculty: ${facultyId}, params:`, params);
      
      // Build filter options for student filtering
      const filterOptions: FilterOptions = {
        type: params.filterType,
        ...(params.filterType === 'class' && params.classId && {
          classId: params.classId
        }),
        ...(params.academicYear && {
          academicYear: params.academicYear
        })
      };

      // Get filtered student IDs based on filter options
      const { studentIds } = await getFilteredStudentIds(
        facultyId,
        filterOptions
      );

      console.log(`Found ${studentIds?.length || 0} students`);
      
      if (!studentIds || studentIds.length === 0) {
        // Return empty data with proper period labels
        const emptyLabels = getPeriodLabels(params.timeRange);
        const emptyData: ProgressData[] = emptyLabels.map((label: string) => ({
          date: label,
          accuracy: 0,
          wpm: 0,
        }));
        setChartData(emptyData);
        setLoading(false);
        return;
      }

      // Get date range
      const { start, end } = getDateRangeForTimeFilter(params.timeRange);
      console.log(`Date range: ${start.toDateString()} to ${end.toDateString()}`);
      
      // Get all period labels for the time range
      const periodLabels = getPeriodLabels(params.timeRange);
      
      // Initialize totals for each period
      const totals: Record<string, BucketData> = {};

      periodLabels.forEach((label: string) => {
        totals[label] = { 
          accuracySum: 0, 
          totalWords: 0, 
          totalMinutes: 0, 
          reportCount: 0,
          studentSet: new Set<string>() 
        };
      });

      let totalReportsProcessed = 0;
      let totalReportsSkipped = 0;

      // Process each student
      for (const studentId of studentIds) {
        try {
          const reports = await getStudentReports(studentId);
          
          if (!reports || reports.length === 0) {
            continue;
          }

          for (const report of reports) {
            totalReportsProcessed++;
            
            // Parse report date
            let reportDate: Date | null = null;
            
            try {
              if (report.createdAt) {
                if (report.createdAt.toDate && typeof report.createdAt.toDate === 'function') {
                  reportDate = report.createdAt.toDate();
                } else if (typeof report.createdAt === 'object' && report.createdAt.seconds) {
                  // Firestore timestamp object
                  reportDate = new Date(report.createdAt.seconds * 1000);
                } else if (typeof report.createdAt === 'string') {
                  reportDate = new Date(report.createdAt);
                } else if (report.createdAt instanceof Date) {
                  reportDate = report.createdAt;
                }
              }
            } catch (dateError) {
              totalReportsSkipped++;
              continue;
            }

            if (!reportDate) {
              totalReportsSkipped++;
              continue;
            }

            // Check if report is within date range
            if (reportDate < start || reportDate > end) {
              continue;
            }

            // Get accuracy and WPM values
            const accuracy = report.accuracyRate || 0;
            const wpm = report.wordPerMin || 0;
            
            if (accuracy <= 0 || wpm <= 0) {
              continue;
            }

            // Get the period label for this date
            const periodLabel = getLabelForDate(reportDate, params.timeRange);
            
            if (!periodLabel || !totals[periodLabel]) {
              continue;
            }

            // Calculate reading minutes from recording duration
            const minutes = parseRecordingDuration(report.recordingDuration);
            
            let wordsRead = 0;
            
            if (minutes > 0) {
              // Calculate words read based on WPM and minutes
              wordsRead = wpm * minutes;
            } else {
              // Fallback: Use totalWords if available
              wordsRead = report.totalWords || 0;
              
              // If no totalWords, estimate from WPM (assuming 1 minute)
              if (wordsRead === 0) {
                wordsRead = wpm; // 1 minute equivalent
              }
            }

            // Skip if no valid words read
            if (wordsRead <= 0) {
              continue;
            }

            // Add to bucket aggregates
            const bucketData = totals[periodLabel];
            bucketData.reportCount++;
            bucketData.accuracySum += accuracy * wordsRead; // Weight accuracy by words read
            bucketData.totalWords += wordsRead;
            bucketData.totalMinutes += minutes || 1; // Use 1 minute as default if no duration
            bucketData.studentSet.add(studentId);
          }
        } catch (error) {
          console.error(`Error processing reports for student ${studentId}:`, error);
          continue;
        }
      }

      console.log(`Total reports processed: ${totalReportsProcessed}, skipped: ${totalReportsSkipped}`);

      // Convert to ProgressData array, maintaining the order of periodLabels
      const progressData: ProgressData[] = periodLabels.map((label: string) => {
        const t = totals[label] || {
          accuracySum: 0,
          totalWords: 0,
          totalMinutes: 0,
          reportCount: 0,
          studentSet: new Set<string>()
        };
        
        // Calculate weighted average accuracy
        const accuracy = t.totalWords > 0 
          ? Math.min(100, Math.max(0, t.accuracySum / t.totalWords))
          : 0;
        
        // Calculate average WPM (total words / total minutes)
        const averageWpm = t.totalMinutes > 0 
          ? t.totalWords / t.totalMinutes
          : 0;
        
        return {
          date: label,
          accuracy: parseFloat(accuracy.toFixed(2)),
          wpm: parseFloat(averageWpm.toFixed(2)),
        };
      });

      console.log('Final accuracy trends data:', progressData);
      setChartData(progressData);
    } catch (error: any) {
      console.error('Error in useAccuracyTrends:', error);
      setError(error.message || 'Failed to fetch accuracy trends');
      
      // On error, set empty data with proper labels
      const emptyLabels = getPeriodLabels(params.timeRange);
      const emptyData: ProgressData[] = emptyLabels.map((label: string) => ({
        date: label,
        accuracy: 0,
        wpm: 0,
      }));
      setChartData(emptyData);
    } finally {
      setLoading(false);
    }
  }, [facultyId, params, getFilteredStudentIds, getStudentReports, parseRecordingDuration]);

  useEffect(() => {
    fetchAccuracyData();
  }, [fetchAccuracyData]);

  const refetch = useCallback(() => {
    fetchAccuracyData();
  }, [fetchAccuracyData]);

  return {
    chartData,
    loading,
    error,
    refetch,
  };
};

// Export the standalone function for use in other contexts if needed
export const getAccuracyTrends = () => {
  const { getFilteredStudentIds } = getFacultyClasses_Student;
  const { getStudentReports } = MiscueReportController;

  const parseRecordingDuration = (duration: any): number => {
    if (!duration) return 0;
    
    if (typeof duration === 'number') {
      return duration / 60;
    }
    
    if (typeof duration === 'string') {
      if (duration.includes(':')) {
        const parts = duration.split(':');
        if (parts.length === 3) {
          const hours = parseInt(parts[0]) || 0;
          const minutes = parseInt(parts[1]) || 0;
          const seconds = parseInt(parts[2]) || 0;
          return hours * 60 + minutes + seconds / 60;
        }
      } else {
        const seconds = parseFloat(duration);
        if (!isNaN(seconds)) {
          return seconds / 60;
        }
      }
    }
    
    return 0;
  };

  const getStudentsAccuracy = async (
    facultyId: string,
    timeRange: 'week' | 'month' | 'year' = 'week',
    filter?: FilterOptions,
  ): Promise<ProgressData[]> => {
    try {
      console.log(`Fetching accuracy trends for faculty: ${facultyId}, timeRange: ${timeRange}`);
      
      const { studentIds } = await getFilteredStudentIds(
        facultyId,
        filter || { type: 'overall' },
      );

      console.log(`Found ${studentIds?.length || 0} students`);
      
      if (!studentIds || studentIds.length === 0) {
        // Return empty data with proper period labels
        const emptyLabels = getPeriodLabels(timeRange);
        return emptyLabels.map((label: string): ProgressData => ({
          date: label,
          accuracy: 0,
          wpm: 0,
        }));
      }

      // Get date range
      const { start, end } = getDateRangeForTimeFilter(timeRange);
      
      // Get all period labels for the time range
      const periodLabels = getPeriodLabels(timeRange);
      
      // Initialize totals for each period
      const totals: Record<string, BucketData> = {};

      periodLabels.forEach((label: string) => {
        totals[label] = { 
          accuracySum: 0, 
          totalWords: 0, 
          totalMinutes: 0, 
          reportCount: 0,
          studentSet: new Set<string>() 
        };
      });

      // Process each student
      for (const studentId of studentIds) {
        try {
          const reports = await getStudentReports(studentId);
          
          if (!reports || reports.length === 0) {
            continue;
          }
          
          for (const report of reports) {
            // Parse report date
            let reportDate: Date | null = null;
            
            try {
              if (report.createdAt) {
                if (report.createdAt.toDate && typeof report.createdAt.toDate === 'function') {
                  reportDate = report.createdAt.toDate();
                } else if (typeof report.createdAt === 'object' && report.createdAt.seconds) {
                  reportDate = new Date(report.createdAt.seconds * 1000);
                } else if (typeof report.createdAt === 'string') {
                  reportDate = new Date(report.createdAt);
                } else if (report.createdAt instanceof Date) {
                  reportDate = report.createdAt;
                }
              }
            } catch (dateError) {
              continue;
            }

            if (!reportDate) {
              continue;
            }

            // Check if report is within date range
            if (reportDate < start || reportDate > end) {
              continue;
            }

            // Get accuracy and WPM values
            const accuracy = report.accuracyRate || 0;
            const wpm = report.wordPerMin || 0;
            
            if (accuracy <= 0 || wpm <= 0) {
              continue;
            }

            // Get the period label for this date
            const periodLabel = getLabelForDate(reportDate, timeRange);
            
            if (!periodLabel || !totals[periodLabel]) {
              continue;
            }

            // Calculate reading minutes from recording duration
            const minutes = parseRecordingDuration(report.recordingDuration);
            
            let wordsRead = 0;
            
            if (minutes > 0) {
              wordsRead = wpm * minutes;
            } else {
              wordsRead = report.totalWords || 0;
              if (wordsRead === 0) {
                wordsRead = wpm;
              }
            }

            if (wordsRead <= 0) {
              continue;
            }

            // Add to bucket aggregates
            const bucketData = totals[periodLabel];
            bucketData.reportCount++;
            bucketData.accuracySum += accuracy * wordsRead;
            bucketData.totalWords += wordsRead;
            bucketData.totalMinutes += minutes || 1;
            bucketData.studentSet.add(studentId);
          }
        } catch (error) {
          console.error(`Error processing reports for student ${studentId}:`, error);
          continue;
        }
      }

      // Convert to ProgressData array, maintaining the order of periodLabels
      const progressData: ProgressData[] = periodLabels.map((label: string) => {
        const t = totals[label] || {
          accuracySum: 0,
          totalWords: 0,
          totalMinutes: 0,
          reportCount: 0,
          studentSet: new Set<string>()
        };
        
        const accuracy = t.totalWords > 0 
          ? Math.min(100, Math.max(0, t.accuracySum / t.totalWords))
          : 0;
        
        const averageWpm = t.totalMinutes > 0 
          ? t.totalWords / t.totalMinutes
          : 0;
        
        return {
          date: label,
          accuracy: parseFloat(accuracy.toFixed(2)),
          wpm: parseFloat(averageWpm.toFixed(2)),
        };
      });

      console.log('Final accuracy trends data:', progressData);
      return progressData;
    } catch (error: any) {
      console.error('Error in getStudentsAccuracy:', error);
      throw new Error(
        'Failed to get students accuracy trends: ' + error.message,
      );
    }
  };
  
  return {
    getStudentsAccuracy,
  };
};