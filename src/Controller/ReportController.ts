import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { getFacultyClasses_Student } from '../Hooks/use_FacultyClasses_Students';
import { AssessmentController } from './AssessmentController';
import { MiscueReportController } from './MiscueReportController';
import { ClassDocument, UserDocument, ActivityResultDocument } from '../Interfaces/dataInterfaces';
import readingMaterialData from '../../assets/ReadingMaterial/ReadingMaterial.json';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface StudentSummary {
  uid: string;
  name: string;
  averageScore: number;
  totalAssessments: number;
  trend: 'improving' | 'stable' | 'needs_practice';
  readingAccuracy: number;
}

export interface ClassSummary {
  classId: string;
  className: string;
  classCode: string;
  gradeLevel: number;
  studentCount: number;
  classAverage: number;
  commonMistakes: { word: string; count: number }[];
  needsHelp: StudentSummary[];
  allStudents: StudentSummary[];
}

export interface AssessmentHistoryEntry {
  activityId: string;
  title: string;
  score: number;
  totalItems: number;
  percentage: number;
  completedAt: any;
  aralinIndex: number;
}

export interface StudentReport {
  uid: string;
  name: string;
  gradeLevel: number;
  assessmentHistory: AssessmentHistoryEntry[];
  averageScore: number;
  trend: 'improving' | 'stable' | 'needs_practice';
  readingAccuracy: number;
  totalReadingAttempts: number;
  commonMistakes: { word: string; count: number; type: string }[];
  aralinCompleted: number;
  lessonsCompleted: number;
  totalLessons: number;
}

export interface LessonPerformance {
  aralinIndex: number;
  aralinLabel: string;
  averageScore: number;
  totalAttempts: number;
  accuracy: number;
  mistakeCount: number;
}

export interface PerformanceBreakdown {
  classId: string;
  className: string;
  lessons: LessonPerformance[];
  overallAccuracy: number;
  overallMistakes: number;
  totalAssessments: number;
}

// ─── Aralin Labels ────────────────────────────────────────────────────────────

const ARALIN_LABELS: Record<number, string> = {
  1: 'Mm', 2: 'Ss', 3: 'Aa', 4: 'Ang', 5: 'Ii', 6: 'Oo', 7: 'Ay',
  8: 'Ee', 9: 'Uu', 10: 'Bb', 11: 'Tt', 12: 'Kk', 13: 'Ll', 14: 'Yy',
  15: 'Mga', 16: 'Nn', 17: 'Gg', 18: 'Rr', 19: 'Pp', 20: 'Ng',
  21: 'Dd', 22: 'Hh', 23: 'Ww', 24: '-ng', 25: 'ng-',
};

// ─── Controller ───────────────────────────────────────────────────────────────

export const ReportController = {

  /**
   * Fetch all students in a class as UserDocument[]
   */
  async _getStudentsForClass(classCode: string): Promise<UserDocument[]> {
    return getFacultyClasses_Student.getStudentsInClass(classCode);
  },

  /**
   * Fetch all assessment results for a list of student IDs
   */
  async _getAllResultsForStudents(studentIds: string[]): Promise<ActivityResultDocument[]> {
    if (studentIds.length === 0) return [];
    
    const results: ActivityResultDocument[] = [];
    // Firestore 'in' queries limited to 30 items
    const chunks = [];
    for (let i = 0; i < studentIds.length; i += 30) {
      chunks.push(studentIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      try {
        const snap = await firestore()
          .collection('activityResults')
          .where('studentId', 'in', chunk)
          .get();
        snap.docs.forEach(doc => results.push(doc.data() as ActivityResultDocument));
      } catch (e) {
        console.warn('ReportController: result fetch error', e);
      }
    }
    return results;
  },

  /**
   * Fetch all miscue reports for a list of student IDs
   */
  async _getAllMiscueReportsForStudents(studentIds: string[]): Promise<any[]> {
    if (studentIds.length === 0) return [];
    
    const results: any[] = [];
    const chunks = [];
    for (let i = 0; i < studentIds.length; i += 30) {
      chunks.push(studentIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
      try {
        const snap = await firestore()
          .collection('miscueReports')
          .where('studentId', 'in', chunk)
          .get();
        snap.docs.forEach(doc => results.push(doc.data()));
      } catch (e) {
        console.warn('ReportController: miscue fetch error', e);
      }
    }
    return results;
  },

  /**
   * Determine trend from a list of scores (most recent last)
   */
  _calculateTrend(scores: number[]): 'improving' | 'stable' | 'needs_practice' {
    if (scores.length < 2) return 'stable';
    const recent = scores.slice(-3);
    if (recent.length < 2) return 'stable';

    let upCount = 0;
    let downCount = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i] > recent[i - 1]) upCount++;
      else if (recent[i] < recent[i - 1]) downCount++;
    }

    if (upCount > downCount) return 'improving';
    if (downCount > upCount) return 'needs_practice';
    
    // Also check average
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    if (avg < 70) return 'needs_practice';
    return 'stable';
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PER CLASS REPORT
  // ═══════════════════════════════════════════════════════════════════════════

  async getClassSummary(classDoc: ClassDocument): Promise<ClassSummary> {
    const students = await this._getStudentsForClass(classDoc.classCode);
    const studentIds = students.map(s => s.uid);
    
    const activeActivities = await AssessmentController.getStudentActivities(classDoc.classCode);
    const activeActivityIds = new Set(activeActivities.map(a => a.activityId));

    const rawResults = await this._getAllResultsForStudents(studentIds);
    const allResults = rawResults.filter(r => activeActivityIds.has(r.activityId));

    // Group results by student
    const resultsByStudent: Record<string, ActivityResultDocument[]> = {};
    allResults.forEach(r => {
      if (!resultsByStudent[r.studentId]) resultsByStudent[r.studentId] = [];
      resultsByStudent[r.studentId].push(r);
    });

    // Build student summaries
    const summaries: StudentSummary[] = [];
    for (const student of students) {
      const sResults = resultsByStudent[student.uid] || [];
      const scores = sResults
        .sort((a, b) => {
          const ta = a.completedAt?.toDate?.() || new Date(0);
          const tb = b.completedAt?.toDate?.() || new Date(0);
          return ta.getTime() - tb.getTime();
        })
        .map(r => r.percentage);

      const avg = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

      // Get reading accuracy from miscue reports
      let readingAccuracy = 0;
      try {
        const stats = await MiscueReportController.getStudentReadingStats(student.uid);
        readingAccuracy = stats.averageAccuracy;
      } catch { /* no reading data */ }

      summaries.push({
        uid: student.uid,
        name: `${student.firstName} ${student.lastName}`,
        averageScore: Math.round(avg),
        totalAssessments: sResults.length,
        trend: this._calculateTrend(scores),
        readingAccuracy: Math.round(readingAccuracy),
      });
    }

    // Sort by average score
    const sorted = [...summaries].sort((a, b) => b.averageScore - a.averageScore);
    const needsHelp = sorted.filter(s => s.averageScore < 75 || s.totalAssessments === 0);

    const classAverage = summaries.length > 0
      ? Math.round(summaries.reduce((a, s) => a + s.averageScore, 0) / summaries.length)
      : 0;

    // Aggregate class common mistakes
    const miscueReports = await this._getAllMiscueReportsForStudents(studentIds);
    const wordFrequency: Record<string, number> = {};
    miscueReports.forEach(data => {
      if (data.miscues) {
        data.miscues.forEach((m: any) => {
          const word = m.expected || m.spoken;
          if (!word) return;
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
      }
    });
    
    const commonMistakes = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    return {
      classId: classDoc.classId,
      className: classDoc.className || classDoc.classCode,
      classCode: classDoc.classCode,
      gradeLevel: classDoc.gradeLevel,
      studentCount: students.length,
      classAverage,
      commonMistakes,
      needsHelp,
      allStudents: sorted,
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PER STUDENT REPORT
  // ═══════════════════════════════════════════════════════════════════════════

  async getStudentReport(studentId: string, studentName: string, classCode: string): Promise<StudentReport> {
    const activeActivities = await AssessmentController.getStudentActivities(classCode);
    const activeActivityIds = new Set(activeActivities.map(a => a.activityId));

    // Fetch assessment results
    const resultsSnap = await firestore()
      .collection('activityResults')
      .where('studentId', '==', studentId)
      .get();
    const rawResults = resultsSnap.docs.map(d => d.data() as ActivityResultDocument);
    const results = rawResults.filter(r => activeActivityIds.has(r.activityId));

    // Fetch activities to get titles and aralinIndex
    const activityIds = [...new Set(results.map(r => r.activityId))];
    const activityMap: Record<string, { title: string; aralinIndex: number }> = {};
    for (const aid of activityIds) {
      try {
        const activity = await AssessmentController.getActivity(aid);
        if (activity) {
          activityMap[aid] = { title: activity.title, aralinIndex: activity.aralinIndex };
        }
      } catch { /* skip */ }
    }

    // Build history entries sorted by date
    const history: AssessmentHistoryEntry[] = results
      .map(r => ({
        activityId: r.activityId,
        title: activityMap[r.activityId]?.title || 'Pagsusulit',
        score: r.score,
        totalItems: r.totalItems,
        percentage: r.percentage,
        completedAt: r.completedAt,
        aralinIndex: activityMap[r.activityId]?.aralinIndex || 0,
      }))
      .sort((a, b) => {
        const ta = a.completedAt?.toDate?.() || new Date(0);
        const tb = b.completedAt?.toDate?.() || new Date(0);
        return ta.getTime() - tb.getTime();
      });

    const scores = history.map(h => h.percentage);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Get reading stats (miscue analysis)
    let readingAccuracy = 0;
    let totalReadingAttempts = 0;
    let commonMistakes: { word: string; count: number; type: string }[] = [];
    try {
      const stats = await MiscueReportController.getStudentReadingStats(studentId);
      readingAccuracy = stats.averageAccuracy;
      totalReadingAttempts = stats.totalAttempts;
      commonMistakes = stats.mostCommonMiscueWords.map(w => ({
        word: w.word,
        count: w.count,
        type: stats.topMiscueType,
      }));
    } catch { /* no data */ }

    // Get Aralin progress (1-25)
    let aralinCompleted = 0;
    try {
      const mastery = await MiscueReportController.getStudentDetailedCompletion(studentId);
      if (mastery && mastery.completedAlpha && mastery.completedWords && mastery.completedPassages) {
        let completedCount = 0;
        const alphabetData = readingMaterialData?.Alphabet || [];
        
        alphabetData.forEach((aralin, idx) => {
          const letter = aralin.letter;
          const isAlphaDone = mastery.completedAlpha.has(letter) ? 1 : 0;
          const wordCount = mastery.completedWords?.[letter]?.size || 0;
          
          // Compute total words for letter
          const subset = readingMaterialData.Words?.filter((w: any) => w.letter === letter) || [];
          const allWords = subset.flatMap((w: any) => (w.contrasts || []).flatMap((c: any) => c.words || []));
          const letterLower = letter.toLowerCase();
          const uniqueWords = Array.from(new Set(allWords)).filter(
            (word: any) => word?.trim().toLowerCase() !== letterLower
          );
          const totalWords = uniqueWords.length;

          const currentPassages = readingMaterialData?.Passages?.filter((p: any) => p.aralin === idx + 1) || [];
          const passageCount = currentPassages.filter((p: any) => mastery.completedPassages.has(p.title)).length;
          const totalPassages = currentPassages.length;

          const totalPossible = 1 + totalWords + totalPassages;
          const masteredCount = isAlphaDone + Math.min(wordCount, totalWords) + Math.min(passageCount, totalPassages);

          const progressPerc = totalPossible > 0 ? Math.round((masteredCount / totalPossible) * 100) : 0;
          if (progressPerc === 100) completedCount++;
        });
        aralinCompleted = completedCount;
      }
    } catch (e) { console.log('Aralin completion error:', e); }

    // Get lesson progress based on active activities
    const completedActivityIds = new Set(results.map(r => r.activityId));
    const lessonsCompleted = completedActivityIds.size;

    // Get student profile for grade level
    let gradeLevel = 1;
    try {
      const userSnap = await firestore().collection('users').doc(studentId).get();
      if (userSnap.exists) {
        const userData = userSnap.data() as UserDocument;
        gradeLevel = userData.studentData?.gradeLevel || 1;
      }
    } catch { /* default */ }

    return {
      uid: studentId,
      name: studentName,
      gradeLevel,
      assessmentHistory: history,
      averageScore: avgScore,
      trend: this._calculateTrend(scores),
      readingAccuracy: Math.round(readingAccuracy),
      totalReadingAttempts,
      commonMistakes,
      aralinCompleted,
      lessonsCompleted,
      totalLessons: activeActivities.length,
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERFORMANCE BREAKDOWN
  // ═══════════════════════════════════════════════════════════════════════════

  async getPerformanceBreakdown(classDoc: ClassDocument): Promise<PerformanceBreakdown> {
    const students = await this._getStudentsForClass(classDoc.classCode);
    const studentIds = students.map(s => s.uid);

    // Get all activities for this class
    const activities = await AssessmentController.getFacultyActivities(classDoc.classCode);

    // Get all results
    const allResults = await this._getAllResultsForStudents(studentIds);

    // Map activityId -> aralinIndex
    const activityAralinMap: Record<string, number> = {};
    activities.forEach(a => { activityAralinMap[a.activityId] = a.aralinIndex; });

    // Group results by aralin
    const byAralin: Record<number, { scores: number[]; mistakes: number }> = {};
    let totalMistakes = 0;
    let totalCorrect = 0;

    allResults.forEach(r => {
      const aralin = activityAralinMap[r.activityId];
      if (aralin === undefined) return;

      if (!byAralin[aralin]) byAralin[aralin] = { scores: [], mistakes: 0 };
      byAralin[aralin].scores.push(r.percentage);

      const correct = r.score;
      const mistakes = r.totalItems - r.score;
      byAralin[aralin].mistakes += mistakes;
      totalMistakes += mistakes;
      totalCorrect += correct;
    });

    // Build lesson performance list
    const lessons: LessonPerformance[] = Object.entries(byAralin)
      .map(([idx, data]) => {
        const aralinIndex = parseInt(idx, 10);
        const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        return {
          aralinIndex,
          aralinLabel: `Aralin ${aralinIndex}: ${ARALIN_LABELS[aralinIndex] || ''}`,
          averageScore: Math.round(avg),
          totalAttempts: data.scores.length,
          accuracy: Math.round(avg),
          mistakeCount: data.mistakes,
        };
      })
      .sort((a, b) => a.aralinIndex - b.aralinIndex);

    const totalItems = totalCorrect + totalMistakes;
    const overallAccuracy = totalItems > 0 ? Math.round((totalCorrect / totalItems) * 100) : 0;

    return {
      classId: classDoc.classId,
      className: classDoc.className || classDoc.classCode,
      lessons,
      overallAccuracy,
      overallMistakes: totalMistakes,
      totalAssessments: allResults.length,
    };
  },
};
