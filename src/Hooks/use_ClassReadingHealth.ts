import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { UserDocument, MiscueReportDocument } from '../Interfaces/dataInterfaces';
import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { MiscueReportController } from '../Controller/MiscueReportController';
import { ClassReadingHealth, StudentReadingStatus } from '../Interfaces/miscue';

const db = getFirestore();

// --- THRESHOLDS & CONSTANTS ---
const defaultThresholds = {
  fluentAccuracy: 95,
  developingAccuracy: 85,
  emergingAccuracy: 70,
  fluentWPM: (grade: number) => ({ 1: 60, 2: 90, 3: 110 }[grade] || 60),
  developingWPM: (grade: number) => ({ 1: 40, 2: 65, 3: 85 }[grade] || 40),
  emergingWPM: (grade: number) => ({ 1: 20, 2: 40, 3: 60 }[grade] || 20),
  fluentMiscueDensity: 8,
  developingMiscueDensity: 15,
  emergingMiscueDensity: 25,
};

// --- HELPER: RECENCY WEIGHTING ---
// Weights recent reports more heavily than older ones
const calculateWeightedMetric = (reports: MiscueReportDocument[], key: 'accuracyRate' | 'wordPerMin' | 'miscueDensity'): number => {
  if (reports.length === 0) return 0;

  // Sort by date (descending - newest first)
  const sorted = [...reports].sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

  let totalWeight = 0;
  let weightedSum = 0;

  sorted.forEach((report, index) => {
    // Linear decay: Weight = 1.0 for newest, 0.8, 0.6, 0.4, 0.2, then 0.1 for the rest
    const weight = Math.max(0.1, 1 - (index * 0.2));

    let val: number;
    if (key === 'miscueDensity') {
      const density = calculateMiscueDensity(report);
      if (density === null) return; // skip reports missing totalWords; don't fake a perfect 0
      val = density;
    } else {
      val = report[key] as number;
    }

    weightedSum += val * weight;
    totalWeight += weight;
  });

  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
};

// --- HELPER: ANALYZE TREND ---
const analyzeTrend = (reports: MiscueReportDocument[]): 'improving' | 'stable' | 'declining' => {
  if (reports.length < 3) return 'stable';

  // Sort by date (oldest to newest) to see progress
  const sorted = [...reports].sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());

  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  const avgFirst = firstHalf.reduce((sum, r) => sum + r.accuracyRate, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, r) => sum + r.accuracyRate, 0) / secondHalf.length;

  const diff = avgSecond - avgFirst;
  if (diff > 3) return 'improving';
  if (diff < -3) return 'declining';
  return 'stable';
};

// --- HELPER: MISCUE DENSITY ---
// Returns null when totalWords is missing/zero so the caller can skip the report
// instead of treating it as a perfect 0% density (which would inflate the score).
const calculateMiscueDensity = (report: MiscueReportDocument): number | null => {
  if (!report.totalWords || report.totalWords <= 0) return null;
  const totalMiscues = report.miscues?.length || 0;
  return (totalMiscues / report.totalWords) * 100;
};

const getAdjustedMiscueThresholds = (avgWords: number) => {
  const scale = avgWords >= 100 ? 1 : avgWords / 100;
  return {
    fluent: Math.ceil(8 * scale),
    developing: Math.ceil(15 * scale),
    emerging: Math.ceil(25 * scale),
  };
};

const calculateMiscueScore = (density: number, avgPassageLength: number): number => {
  const t = getAdjustedMiscueThresholds(avgPassageLength);
  if (density <= t.fluent) return 100;
  if (density <= t.developing) return 80;
  if (density <= t.emerging) return 60;
  return Math.max(0, 40 - (density - t.emerging));
};

// --- MAIN CLASSIFICATION LOGIC ---
const determineStatus = (finalScore: number, avgAccuracy: number, sufficientData: boolean): any => {
  if (!sufficientData) return 'insufficientData';
  if (avgAccuracy < 70) return 'atRisk'; // Strict Guardrail

  if (finalScore >= 88) return 'fluent';
  if (finalScore >= 75) return 'developing';
  if (finalScore >= 55) return 'emerging';
  return 'atRisk';
};

const classifyStudent = (reports: MiscueReportDocument[], gradeLevel: number): StudentReadingStatus => {
  const sufficientData = reports.length >= 2;

  // Averages (Using the recency weighting from previous step)
  const avgAccuracy = calculateWeightedMetric(reports, 'accuracyRate');
  const avgWPM = calculateWeightedMetric(reports, 'wordPerMin');
  const avgMiscueDensity = calculateWeightedMetric(reports, 'miscueDensity');

  // Trend
  const trend = analyzeTrend(reports);

  // Stats for passage length
  const passageLengths = reports.map(r => r.totalWords || 0);
  const avgLength = passageLengths.reduce((a, b) => a + b, 0) / (passageLengths.length || 1);

  // Scoring logic
  const accuracyScore = avgAccuracy;
  const wpmScore = Math.min(100, (avgWPM / defaultThresholds.fluentWPM(gradeLevel)) * 100);
  const miscueScore = calculateMiscueScore(avgMiscueDensity, avgLength);

  let finalScore = (accuracyScore * 0.5) + (wpmScore * 0.3) + (miscueScore * 0.2);

  // Apply Trend Bonus/Penalty
  if (trend === 'improving') finalScore += 3;
  if (trend === 'declining') finalScore -= 3;

  const status = determineStatus(finalScore, avgAccuracy, sufficientData);

  return {
    studentId: reports[0]?.studentId || '',
    name: '',
    gradeLevel,
    status,
    averageAccuracy: Number(avgAccuracy.toFixed(1)),
    averageWPM: Number(avgWPM.toFixed(1)),
    miscueDensity: Number(avgMiscueDensity.toFixed(1)),
    trend,
    classificationScore: Number(Math.max(0, Math.min(100, finalScore)).toFixed(1)),
    confidence: reports.length > 3 ? 'high' : reports.length > 1 ? 'medium' : 'low',
    hasSufficientData: sufficientData,
    passageLengthInfo: {
      averageWords: Math.round(avgLength),
      minWords: passageLengths.length > 0 ? Math.min(...passageLengths) : 0,
      maxWords: passageLengths.length > 0 ? Math.max(...passageLengths) : 0,
      adjustedThresholds: getAdjustedMiscueThresholds(avgLength)
    },
    lastReportDate: reports.length > 0
      ? reports[reports.length - 1].createdAt.toDate()
      : new Date(),
  };
};

// --- HOOK ---
export const useClassReadingHealth = () => {
  const getClassReadingHealth = async (facultyId: string): Promise<ClassReadingHealth[]> => {
    const classes = await getFacultyClasses_Student.getFacultyClasses(facultyId);
    const healthData: ClassReadingHealth[] = [];

    for (const classItem of classes) {
      const studentIds = classItem.studentIds || [];

      // PARALLEL FETCHING: Much faster for large classes
      const studentDataPromises = studentIds.map(async (id) => {
        const [sDoc, reports] = await Promise.all([
          getDoc(doc(db, 'users', id)),
          MiscueReportController.getStudentReports(id)
        ]);

        if (!sDoc.exists()) return null;
        const sData = sDoc.data() as UserDocument;
        const status = classifyStudent(reports, sData.studentData?.gradeLevel || 1);
        status.name = `${sData.firstName} ${sData.lastName}`;
        status.studentId = id;
        // hasParticipated = took at least one assessment (not just "user doc exists")
        return { status, hasParticipated: reports.length > 0 };
      });

      const allResults = (await Promise.all(studentDataPromises)).filter(r => r !== null) as { status: StudentReadingStatus; hasParticipated: boolean }[];
      const allStatuses = allResults.map(r => r.status);

      // Grouping
      const categories = {
        fluent: allStatuses.filter(s => s.status === 'fluent'),
        developing: allStatuses.filter(s => s.status === 'developing'),
        emerging: allStatuses.filter(s => s.status === 'emerging'),
        atRisk: allStatuses.filter(s => s.status === 'atRisk'),
        insufficientData: allStatuses.filter(s => s.status === 'insufficientData'),
      };

      const total = studentIds.length;
      const participatedCount = allResults.filter(r => r.hasParticipated).length;
      const participationRate = total > 0 ? (participatedCount / total) * 100 : 0;

      // Generate Required Actions based on class state
      let action = "Continue regular assessments.";
      if (participationRate < 60) action = "Urgent: Increase student participation in assessments.";
      else if (categories.atRisk.length > total * 0.2) action = "High alert: Consider small-group remedial reading intervention.";
      else if (categories.emerging.length > total * 0.3) action = "Focus on phonemic awareness and accuracy drills.";

      healthData.push({
        classId: classItem.classId,
        className: classItem.className || classItem.classCode,
        acadYear: classItem.acadYear,
        readingHealth: {
          fluent: {
            percentage: (categories.fluent.length / total) * 100,
            count: categories.fluent.length,
            students: categories.fluent
          },
          developing: { 
            percentage: (categories.developing.length / total) * 100, 
            count: categories.developing.length, 
            students: categories.developing },
          emerging: { 
            percentage: (categories.emerging.length / total) * 100, 
            count: categories.emerging.length, 
            students: categories.emerging },
          atRisk: { 
            percentage: (categories.atRisk.length / total) * 100, 
            count: categories.atRisk.length, 
            students: categories.atRisk },
          insufficientData: { 
            percentage: (categories.insufficientData.length / total) * 100, 
            count: categories.insufficientData.length, 
            students: categories.insufficientData },
        },
        totalStudents: total,
        participationRate,
        dataQuality: {
          confidence: participationRate > 80 ? 'high' : participationRate > 50 ? 'medium' : 'low',
          recommendation: participationRate > 80 ? "Reliable data." : "Need more data for accuracy."
        },
        requiredActions: action,
        lastUpdated: new Date(),
      });
    }
    return healthData;
  };

  return { getClassReadingHealth };
};



// TO BE ADDED IF MAKAYA
/**
 * Consistency Score - to be added 
 * - This measures volatility. It asks: "Is the student's performance predictable, 
 *   or do they have high scores one day and very low scores the next?" 
 *   High volatility usually suggests the student is guessing or that the passage difficulty 
 *   is inconsistent.
 */

// --- HELPER: CALCULATE CONSISTENCY (New) ---
const calculateConsistency = (reports: MiscueReportDocument[]): 'high' | 'medium' | 'low' => {
  if (reports.length < 3) return 'high'; // Not enough data to show variance

  const accuracies = reports.map(r => r.accuracyRate);
  const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

  // Calculate Standard Deviation
  const variance = accuracies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / accuracies.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 4) return 'high';    // Very stable scores
  if (stdDev < 8) return 'medium';  // Some fluctuation
  return 'low';                     // Erratic performance
};
