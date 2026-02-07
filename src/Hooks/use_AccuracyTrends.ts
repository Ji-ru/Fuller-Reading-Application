import { FilterOptions, ProgressData } from '../Interfaces/miscue';
import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { MiscueReportController } from '../Controller/MiscueReportController';
import { getDateRangeForTimeFilter } from '../Utilities/dateRange';

export const getAccuracyTrends = () => {
  const { getFilteredStudentIds } = getFacultyClasses_Student;
  const { getStudentReports } = MiscueReportController;

  // Helper function to parse recording duration
  const parseRecordingDuration = (duration: any): number => {
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
        console.log('No students found for the selected filter');
        return [];
      }

      // Get date range
      const { start, end } = getDateRangeForTimeFilter(timeRange);
      console.log(`Date range: ${start.toDateString()} to ${end.toDateString()}`);
      
      // Define buckets based on time range
      let buckets: string[] = [];
      
      if (timeRange === 'week') {
        // For week: Sunday to Saturday
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        buckets = days;
      } else if (timeRange === 'month') {
        // For month: 4 or 5 weeks
        const currentDate = new Date(start);
        const monthEnd = new Date(end);
        let weekCount = 1;
        const weekLabels = [];
        
        while (currentDate <= monthEnd) {
          weekLabels.push(`W${weekCount}`);
          currentDate.setDate(currentDate.getDate() + 7);
          weekCount++;
        }
        buckets = weekLabels;
      } else {
        // For year: All 12 months (academic year from June to May)
        buckets = [
          'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          'Jan', 'Feb', 'Mar', 'Apr', 'May'
        ];
      }

      console.log(`Buckets for ${timeRange}:`, buckets);

      // Initialize totals for each bucket
      const totals: Record<string, { 
        accuracySum: number; 
        totalWords: number; 
        totalMinutes: number; 
        reportCount: number;
        studentSet: Set<string> 
      }> = {};

      buckets.forEach(b => {
        totals[b] = { 
          accuracySum: 0, 
          totalWords: 0, 
          totalMinutes: 0, 
          reportCount: 0,
          studentSet: new Set() 
        };
      });

      let totalReportsProcessed = 0;
      let totalReportsSkipped = 0;

      // Process each student
      for (const studentId of studentIds) {
        try {
          const reports = await getStudentReports(studentId);
          
          if (!reports || reports.length === 0) {
            console.log(`No reports for student ${studentId}`);
            continue;
          }

          console.log(`Student ${studentId} has ${reports.length} reports`);
          
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
              console.log(`Failed to parse date for report:`, report.createdAt);
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

            // Determine bucket
            let bucket: string | null = null;

            if (timeRange === 'week') {
              const dayIndex = reportDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
              const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              bucket = days[dayIndex];
            } else if (timeRange === 'month') {
              const weekOfMonth = Math.floor((reportDate.getDate() - 1) / 7) + 1;
              bucket = `W${weekOfMonth}`;
            } else {
              // For year, map calendar month to academic year month
              const calendarMonth = reportDate.getMonth(); // 0 = Jan, 1 = Feb, etc.
              const academicMonths = [
                'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                'Jan', 'Feb', 'Mar', 'Apr', 'May'
              ];
              
              // Convert calendar month to academic month index
              // June (5) -> 0, July (6) -> 1, ..., May (4) -> 11
              let academicMonthIndex = (calendarMonth + 7) % 12;
              bucket = academicMonths[academicMonthIndex];
            }

            if (!bucket || !totals[bucket]) {
              console.log(`Invalid bucket: ${bucket} for date ${reportDate}`);
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
            const bucketData = totals[bucket];
            bucketData.reportCount++;
            bucketData.accuracySum += accuracy * wordsRead; // Weight accuracy by words read
            bucketData.totalWords += wordsRead;
            bucketData.totalMinutes += minutes || 1; // Use 1 minute as default if no duration
            bucketData.studentSet.add(studentId);
            
            console.log(`Added to bucket ${bucket}: accuracy=${accuracy}, wpm=${wpm}, words=${wordsRead.toFixed(0)}`);
          }
        } catch (error) {
          console.error(`Error processing reports for student ${studentId}:`, error);
          continue;
        }
      }

      console.log(`Total reports processed: ${totalReportsProcessed}, skipped: ${totalReportsSkipped}`);

      // Convert to ProgressData array
      const progressData = buckets.map(bucket => {
        const t = totals[bucket];
        
        // Calculate weighted average accuracy
        const accuracy = t.totalWords > 0 
          ? Math.min(100, Math.max(0, t.accuracySum / t.totalWords))
          : 0;
        
        // Calculate average WPM (total words / total minutes)
        const averageWpm = t.totalMinutes > 0 
          ? t.totalWords / t.totalMinutes
          : 0;
        
        return {
          date: bucket,
          accuracy: parseFloat(accuracy.toFixed(2)),
          wpm: parseFloat(averageWpm.toFixed(2)),
        };
      }).filter(item => item.accuracy > 0 || item.wpm > 0); // Remove empty buckets

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