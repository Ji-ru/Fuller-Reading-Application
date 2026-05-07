import { useCallback, useMemo } from 'react';
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
import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { MiscueReportController } from '../Controller/MiscueReportController';
import {
  MiscuePercentage,
  OverAllStudentTopMiscue,
  AverageWPMandAccuracy,
} from '../Interfaces/miscue';
import { getDateRangeForTimeFilter } from '../Utilities/dateRange';
import { FilterOptions } from '../Interfaces/miscue';

// Initialize instances
const db = getFirestore();

export const useStudentMiscueStats = () => {
  const { getStudentReports } = MiscueReportController;
  const { getFacultyClasses } = getFacultyClasses_Student;

  const formatMiscueType = useCallback((type: string): string =>
    type.charAt(0).toUpperCase() + type.slice(1), []);

  /**
   * Convert duration string to hours (decimal)
   */
  const convertDurationToHours = useCallback((duration: string): number => {
    if (!duration) return 0;

    try {
      const parts = duration.split(':').map(part => parseInt(part) || 0);

      if (parts.length === 2) {
        const minutes = parts[0];
        const seconds = parts[1];
        const totalSeconds = minutes * 60 + seconds;
        return totalSeconds / 3600;
      } else if (parts.length === 3) {
        const hours = parts[0];
        const minutes = parts[1];
        const seconds = parts[2];
        return hours + minutes / 60 + seconds / 3600;
      } else {
        return 0;
      }
    } catch (error) {
      return 0;
    }
  }, []);

  /**
   * Get student IDs based on filter
   */
  const getFilteredStudentIds = useCallback(async (
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<{ studentIds: string[]; className?: string }> => {
    try {
      const classes = await getFacultyClasses(facultyId);

      if (filter?.type === 'class' && filter.classId) {
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
        const allStudentIds = classes.flatMap(cls => cls.studentIds || []);
        const uniqueStudentIds = Array.from(new Set(allStudentIds));
        return { studentIds: uniqueStudentIds };
      }
    } catch (error: any) {
      throw new Error('Failed to get filtered students: ' + error.message);
    }
  }, [getFacultyClasses]);

  const getActiveHours = useCallback(async (
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
        buckets = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
      }

      buckets.forEach(b => (totals[b] = 0));

      for (const classItem of classes) {
        const studentIds = classItem.studentIds || [];
        for (const studentId of studentIds) {
          const reports = await getStudentReports(studentId);
          for (const report of reports) {
            const reportDate = report.timestamp.toDate();
            if (reportDate < start || reportDate > end) continue;

            const hours = convertDurationToHours(report.recordingDuration || '0:00');
            let bucket: string | null = null;

            if (timeRange === 'week') {
              bucket = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'][reportDate.getDay()];
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

      return buckets.map(b => ({
        day: b,
        hours: totals[b],
      }));
    } catch (error: any) {
      throw new Error('Failed to get active hours: ' + error.message);
    }
  }, [getFacultyClasses, getStudentReports, convertDurationToHours]);

  const getNumberOfClasses = useCallback(async (facultyId: string): Promise<number> => {
    try {
      const getClass = await getFacultyClasses(facultyId);
      return getClass.length;
    } catch (error: any) {
      throw new Error('Failed to get the Total Number of Classes: ' + error.message);
    }
  }, [getFacultyClasses]);

  const getNumbersOfAllStudents = useCallback(async (facultyId: string): Promise<number> => {
    try {
      const classes = await getFacultyClasses(facultyId);
      const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0);
      return totalStudents;
    } catch (error: any) {
      throw new Error('Failed to to get the Total Number of Students');
    }
  }, [getFacultyClasses]);

  const getOverallCommonMiscueType = useCallback(async (
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<MiscuePercentage[]> => {
    try {
      const { studentIds } = await getFilteredStudentIds(facultyId, filter || { type: 'overall' });
      const miscueCounts = { substitution: 0, omission: 0, insertion: 0, repetition: 0 };
      let totalMiscues = 0;

      for (const studentId of studentIds) {
        const reports = await getStudentReports(studentId);
        for (const report of reports) {
          if (report.miscues && Array.isArray(report.miscues)) {
            totalMiscues += report.miscues.length;
            for (const miscue of report.miscues) {
              switch (miscue.type) {
                case 'substitution': miscueCounts.substitution++; break;
                case 'omission': miscueCounts.omission++; break;
                case 'insertion': miscueCounts.insertion++; break;
                case 'repetition': miscueCounts.repetition++; break;
              }
            }
          }
        }
      }

      const total = Object.values(miscueCounts).reduce((sum, count) => sum + count, 0);
      if (total === 0) return getDefaultMiscueData();

      return [
        { type: 'Substitution', count: miscueCounts.substitution, percentage: Math.round((miscueCounts.substitution / total) * 1000) / 10, color: '#FF2726' },
        { type: 'Omission', count: miscueCounts.omission, percentage: Math.round((miscueCounts.omission / total) * 1000) / 10, color: '#FF941A' },
        { type: 'Insertion', count: miscueCounts.insertion, percentage: Math.round((miscueCounts.insertion / total) * 1000) / 10, color: '#1A81FF' },
        { type: 'Repetition', count: miscueCounts.repetition, percentage: Math.round((miscueCounts.repetition / total) * 1000) / 10, color: '#BF00DD' },
      ];
    } catch (error: any) {
      throw new Error('Failed to get common miscue type: ' + error.message);
    }
  }, [getFilteredStudentIds, getStudentReports]);

  const getDefaultMiscueData = useCallback((): MiscuePercentage[] => [
    { type: 'Substitution', count: 0, percentage: 0, color: '#FF2726' },
    { type: 'Omission', count: 0, percentage: 0, color: '#FF941A' },
    { type: 'Insertion', count: 0, percentage: 0, color: '#1A81FF' },
    { type: 'Repetition', count: 0, percentage: 0, color: '#BF00DD' },
  ], []);

  const getOverallTopMiscueType = useCallback(async (
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<OverAllStudentTopMiscue[]> => {
    try {
      const { studentIds } = await getFilteredStudentIds(facultyId, filter || { type: 'overall' });
      
      interface MiscueItem {
        type: string;
        expectedWord: string;
        spokenWord?: string;
        passageTitle: string;
        studentId: string;
        accuracyRate: number;
      }

      interface PassageMapEntry {
        miscueCount: number;
        accuracySum: number;
        attemptCount: number;
      }

      const allMiscues: MiscueItem[] = [];
      const passageMap: Record<string, PassageMapEntry> = {};

      for (const studentId of studentIds) {
        const reports = await getStudentReports(studentId);
        for (const report of reports) {
          if (report.passageTitle) {
            const title = report.passageTitle;
            if (!passageMap[title]) passageMap[title] = { miscueCount: 0, accuracySum: 0, attemptCount: 0 };
            passageMap[title].attemptCount++;
            passageMap[title].accuracySum += report.accuracyRate || 0;
          }

          if (report.miscues && Array.isArray(report.miscues)) {
            report.miscues.forEach(m => {
              if (report.passageTitle) passageMap[report.passageTitle].miscueCount++;
              allMiscues.push({ 
                type: m.type,
                expectedWord: m.expectedWord || '',
                spokenWord: m.spokenWord || '',
                passageTitle: report.passageTitle || 'Unknown Passage', 
                studentId: report.studentId, 
                accuracyRate: report.accuracyRate || 0 
              });
            });
          }
        }
      }

      if (allMiscues.length === 0) return [{ topMiscueType: 'No data', commonMiscueWords: [], topMiscuedPassage: [] }];

      const miscueTypeCount = { substitution: 0, omission: 0, insertion: 0, repetition: 0 };
      allMiscues.forEach(m => {
        if (m.type === 'substitution') miscueTypeCount.substitution++;
        else if (m.type === 'omission') miscueTypeCount.omission++;
        else if (m.type === 'insertion') miscueTypeCount.insertion++;
        else if (m.type === 'repetition') miscueTypeCount.repetition++;
      });

      const topMiscueEntry = Object.entries(miscueTypeCount).sort(([, a], [, b]) => b - a)[0];
      const topMiscueType = formatMiscueType(topMiscueEntry[0]);

      // Calculate common words
      interface WordMapEntry {
        errorExamples: Set<string>;
        count: number;
        miscueTypes: Record<string, number>;
        studentIds: Set<string>;
      }

      const wordMap: Record<string, WordMapEntry> = {};
      allMiscues.forEach(m => {
        const word = m.expectedWord.toLowerCase().trim();
        if (!wordMap[word]) {
          wordMap[word] = {
            errorExamples: new Set<string>(),
            count: 0,
            miscueTypes: { substitution: 0, omission: 0, insertion: 0, repetition: 0 },
            studentIds: new Set<string>(),
          };
        }
        wordMap[word].count++;
        if (m.studentId) wordMap[word].studentIds.add(m.studentId);
        wordMap[word].miscueTypes[m.type]++;
        if (m.spokenWord) wordMap[word].errorExamples.add(m.spokenWord.toLowerCase().trim());
      });

      const commonMiscueWords = Object.entries(wordMap).map(([word, data]) => {
        const dominant = Object.entries(data.miscueTypes).sort(([, a], [, b]) => b - a)[0];
        const errorExampleValue = Array.from(data.errorExamples)[0];
        
        return {
          word: word.charAt(0).toUpperCase() + word.slice(1),
          errorExample: typeof errorExampleValue === 'string' ? errorExampleValue : 'N/A',
          errorCount: data.count,
          studentCount: data.studentIds.size,
          dominantMiscueType: dominant ? formatMiscueType(dominant[0]) : 'N/A',
          miscueTypes: data.miscueTypes,
        };
      }).sort((a, b) => b.errorCount - a.errorCount).slice(0, 5);

      let topMiscuedPassage: Array<{
        title: string;
        averageAccuracy: number;
        attempts: number;
        totalMiscues: number;
      }> = [];

      if (Object.keys(passageMap).length > 0) {
        const sorted = Object.entries(passageMap).sort(([, a], [, b]) => b.miscueCount - a.miscueCount);
        const [title, data] = sorted[0];
        topMiscuedPassage = [{ 
          title, 
          averageAccuracy: data.attemptCount > 0 ? parseFloat((data.accuracySum / data.attemptCount).toFixed(2)) : 0, 
          attempts: data.attemptCount, 
          totalMiscues: data.miscueCount 
        }];
      }

      const result: OverAllStudentTopMiscue[] = [{ topMiscueType, commonMiscueWords, topMiscuedPassage }];
      return result;
    } catch (error: any) {
      throw new Error('Failed to get top miscue type: ' + error.message);
    }
  }, [getFilteredStudentIds, getStudentReports, formatMiscueType]);

  const getOverallAverageWPMandAccuracy = useCallback(async (
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<AverageWPMandAccuracy> => {
    try {
      const { studentIds } = await getFilteredStudentIds(facultyId, filter || { type: 'overall' });
      let totalAcc = 0, totalWPM = 0, studentsWithReports = 0, totalReports = 0;
      const processed = new Set<string>();

      for (const studentId of studentIds) {
        if (processed.has(studentId)) continue;
        processed.add(studentId);
        const allReports = await getStudentReports(studentId);
        const realReports = allReports.filter(r => !r.reportId?.startsWith('syn-'));
        if (realReports.length > 0) {
          totalAcc += realReports.reduce((s, r) => s + (r.accuracyRate || 0), 0) / realReports.length;
          totalWPM += realReports.reduce((s, r) => s + (r.wordPerMin || 0), 0) / realReports.length;
          studentsWithReports++;
        }
        totalReports += realReports.length;
      }

      return {
        averageAccuracy: studentsWithReports > 0 ? Math.round(totalAcc / studentsWithReports) : 0,
        averageWPM: studentsWithReports > 0 ? parseFloat((totalWPM / studentsWithReports).toFixed(2)) : 0,
        totalReports,
        totalStudents: processed.size,
      };
    } catch (error: any) {
      throw new Error('Failed to compute averages: ' + error.message);
    }
  }, [getFilteredStudentIds, getStudentReports]);

  const getClassParticipationRate = useCallback(async (
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<{ currentRate: number; lastRate: number; delta: number; activeThisWeek: number; totalStudents: number }> => {
    try {
      const { studentIds } = await getFilteredStudentIds(facultyId, filter || { type: 'overall' });
      const totalStudents = studentIds.length;
      if (totalStudents === 0) return { currentRate: 0, lastRate: 0, delta: 0, activeThisWeek: 0, totalStudents: 0 };

      const { start: curS, end: curE } = getDateRangeForTimeFilter('week');
      const lastE = new Date(curS); lastE.setMilliseconds(-1);
      const lastS = new Date(curS); lastS.setDate(curS.getDate() - 7); lastS.setHours(0, 0, 0, 0);

      const countActive = async (s: Date, e: Date) => {
        let activeCount = 0;
        for (const id of studentIds) {
          const reports = await getStudentReports(id);
          if (reports.some(r => {
            const d = r.timestamp?.toDate?.() || new Date(r.timestamp);
            return d >= s && d <= e;
          })) activeCount++;
        }
        return activeCount;
      };

      const [activeCur, activeLast] = await Promise.all([countActive(curS, curE), countActive(lastS, lastE)]);
      const currentRate = (activeCur / totalStudents) * 100;
      const lastRate = (activeLast / totalStudents) * 100;

      return { currentRate, lastRate, delta: currentRate - lastRate, activeThisWeek: activeCur, totalStudents };
    } catch (error: any) {
      throw new Error('Failed to get participation rate: ' + error.message);
    }
  }, [getFilteredStudentIds, getStudentReports]);

  const getMonthlyActivityHeatmap = useCallback(async (
    facultyId: string,
    filter?: FilterOptions,
    monthOffset: number = 0,
  ): Promise<{ daysInMonth: number; firstWeekday: number; counts: number[]; maxCount: number; monthLabel: string }> => {
    try {
      const { studentIds } = await getFilteredStudentIds(facultyId, filter || { type: 'overall' });
      const now = new Date();
      const ref = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
      const daysInMonth = end.getDate();
      const counts = Array.from({ length: daysInMonth }, () => 0);

      for (const id of studentIds) {
        const reports = await getStudentReports(id);
        reports.forEach(r => {
          const d = r.timestamp?.toDate?.() || new Date(r.timestamp);
          if (d >= start && d <= end) counts[d.getDate() - 1]++;
        });
      }

      return {
        daysInMonth,
        firstWeekday: start.getDay(),
        counts,
        maxCount: counts.length > 0 ? Math.max(...counts) : 0,
        monthLabel: ref.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };
    } catch (error: any) {
      throw new Error('Failed to get monthly heatmap: ' + error.message);
    }
  }, [getFilteredStudentIds, getStudentReports]);

  return useMemo(() => ({
    getNumberOfClasses,
    getNumbersOfAllStudents,
    getActiveHours,
    getOverallCommonMiscueType,
    getOverallTopMiscueType,
    getOverallAverageWPMandAccuracy,
    getClassParticipationRate,
    getMonthlyActivityHeatmap,
  }), [
    getNumberOfClasses,
    getNumbersOfAllStudents,
    getActiveHours,
    getOverallCommonMiscueType,
    getOverallTopMiscueType,
    getOverallAverageWPMandAccuracy,
    getClassParticipationRate,
    getMonthlyActivityHeatmap,
  ]);
};
