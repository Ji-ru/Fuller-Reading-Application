// =============================================================================
// ReadingLevelService.ts
// =============================================================================
// Purpose: Centralized service that computes and persists a student's reading
//          level using a Tiered Threshold Model across three assessment pillars:
//          Alphabets (Phonemic Awareness), Words (Decoding), and Passages (Fluency).
//
// Architecture Notes:
//   - Pure service file — NO React hooks are used here.
//   - All Firebase reads are parallelized via Promise.all() for performance.
//   - Firestore is only written to when the level actually changes (cost-efficient).
//   - WPM targets follow Hasbrouck & Tindal (2017) Oral Reading Fluency Norms.
//   - Re-evaluation is designed to be triggered at ACTIVITY ENDPOINTS (passage
//     completion, session finalization), NOT on every micro-attempt (per word/
//     per letter press), to avoid excessive Firestore reads and noisy level changes.
//
// Trigger Points (call recalculateStudentReadingLevel from these):
//   1. End of MiscueReportController.storeReport()         ← after every passage
//   2. End of MiscueReportController.finalizeWordSession()  ← when word exercise exits
//   3. End of MiscueReportController.finalizeAlphabetSession() ← when alphabet exercise exits
// =============================================================================

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { UserDocument } from '../Interfaces/dataInterfaces';
import { QueryDocumentSnapshot } from 'firebase/firestore';

const db = getFirestore();

// =============================================================================
// TYPES
// =============================================================================

/** The four possible reading levels a student can be assigned. */
export type ReadingLevel =
  | 'beginner'
  | 'emerging'
  | 'intermediate'
  | 'advanced';

/**
 * All computed metrics aggregated from the student's full activity history.
 * Each value is a percentage (0–100) unless noted otherwise.
 */
interface AggregatedMetrics {
  /** Percentage of correct phoneme attempts across ALL alphabet sessions. */
  alphabetAccuracy: number;
  /** Percentage of the 26 letters the student has fully mastered (0–100). */
  alphabetMasteryCompletion: number;
  /** Percentage of correct word pronunciation attempts across ALL word sessions. */
  wordAccuracy: number;
  /** Total count of unique words the student has completed (raw volume). */
  wordVolumeCompleted: number;
  /** Average passage accuracy rate (%) across ALL miscue reports. */
  avgPassageAccuracy: number;
  /** Average Words Per Minute across ALL miscue reports. */
  avgWPM: number;
  /** Total number of passage reports. Used to guard against level-ups with no passage data. */
  passageCount: number;
}

// =============================================================================
// WPM NORMS: Hasbrouck & Tindal (2017) — Spring / End-of-Year, 50th Percentile
// =============================================================================
// A student AT or ABOVE this benchmark is reading at an independent, grade-level
// fluency rate. Used only for the 'advanced' tier determination.
// Source: https://www.readnaturally.com/research/5-components-of-reading/fluency
//
// IMPORTANT: These are universal norms. If your institution (e.g., DepEd) adopts
// its own regional benchmarks in the future, simply update these values.
// =============================================================================
const WPM_TARGETS_BY_GRADE: Record<number, number> = {
  1: 53, // Grade 1: Spring 50th percentile
  2: 89, // Grade 2: Spring 50th percentile
  3: 107, // Grade 3: Spring 50th percentile
};

/** Fallback WPM target if a student's grade level is not in the table. */
const DEFAULT_WPM_TARGET = WPM_TARGETS_BY_GRADE[1];

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Recalculates and persists the reading level for a given student.
 *
 * This is the primary entry point. Call this at the end of a completed
 * learning activity (passage done, word/alphabet session finalized).
 *
 * The function is safe to call fire-and-forget:
 *   recalculateStudentReadingLevel(uid).catch(err => console.warn(err));
 *
 * @param studentId - Firebase Auth UID of the student.
 * @returns The newly computed ReadingLevel.
 */
export const recalculateStudentReadingLevel = async (
  studentId: string,
): Promise<ReadingLevel> => {
  // Step 1: Gather all metrics from Firestore (parallelized)
  const [metrics, gradeLevel] = await Promise.all([
    aggregateStudentMetrics(studentId),
    getStudentGradeLevel(studentId),
  ]);

  // Step 2: Run through the Tiered Threshold Model
  const newLevel = computeReadingLevel(metrics, gradeLevel);

  // Step 3: Write to Firestore ONLY if the level has actually changed
  await updateReadingLevelIfChanged(studentId, newLevel);

  return newLevel;
};

// =============================================================================
// STEP 1 — AGGREGATE METRICS
// All three pillars are fetched in parallel to minimize total latency.
// =============================================================================

const aggregateStudentMetrics = async (
  studentId: string,
): Promise<AggregatedMetrics> => {
  const [alphabetMetrics, wordMetrics, passageMetrics] = await Promise.all([
    aggregateAlphabetMetrics(studentId),
    aggregateWordMetrics(studentId),
    aggregatePassageMetrics(studentId),
  ]);

  return {
    ...alphabetMetrics,
    ...wordMetrics,
    ...passageMetrics,
  };
};

// --- PILLAR 1: Alphabets ---
// Reads from: 'alphabetSessions' (accuracy) + 'alphabetCompleted' (mastery breadth)

const aggregateAlphabetMetrics = async (
  studentId: string,
): Promise<
  Pick<AggregatedMetrics, 'alphabetAccuracy' | 'alphabetMasteryCompletion'>
> => {
  // Fetch ALL alphabet sessions for this student across all time
  const sessionsSnap = await getDocs(
    query(
      collection(db, 'alphabetSessions'),
      where('studentId', '==', studentId),
    ),
  );

  let totalCorrect = 0;
  let totalAttempted = 0;

  sessionsSnap.forEach((document: QueryDocumentSnapshot) => {
    const data = document.data();
    // correctCount and attemptedCount are maintained by recordAlphabetAttempt()
    totalCorrect += data.correctCount ?? 0;
    totalAttempted += data.attemptedCount ?? 0;
  });

  // Avoid division by zero — student has never attempted a letter
  const alphabetAccuracy =
    totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

  // Count unique letters mastered (each doc in alphabetCompleted = one unique letter)
  const completedSnap = await getDocs(
    query(
      collection(db, 'alphabetCompleted'),
      where('studentId', '==', studentId),
    ),
  );

  // Use a Set to deduplicate in case of any data anomalies
  const uniqueLetters = new Set<string>(
    completedSnap.docs.map((d: QueryDocumentSnapshot) =>
      (d.data().letter as string)?.toUpperCase(),
    ),
  );
  const alphabetMasteryCompletion = (uniqueLetters.size / 26) * 100;

  return { alphabetAccuracy, alphabetMasteryCompletion };
};

// --- PILLAR 2: Words ---
// Reads from: 'wordSessions' (accuracy) + 'wordCompleted' (volume)

const aggregateWordMetrics = async (
  studentId: string,
): Promise<Pick<AggregatedMetrics, 'wordAccuracy' | 'wordVolumeCompleted'>> => {
  const sessionsSnap = await getDocs(
    query(collection(db, 'wordSessions'), where('studentId', '==', studentId)),
  );

  let totalCorrect = 0;
  let totalAttempted = 0;

  sessionsSnap.forEach((document: QueryDocumentSnapshot) => {
    const data = document.data();
    // totals is the nested object: { correct: number, attempted: number }
    // maintained by recordWordAttempt()
    totalCorrect += data.totals?.correct ?? 0;
    totalAttempted += data.totals?.attempted ?? 0;
  });

  const wordAccuracy =
    totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

  // Each document in wordCompleted represents one uniquely mastered word
  const wordCompletedSnap = await getDocs(
    query(collection(db, 'wordCompleted'), where('studentId', '==', studentId)),
  );
  const wordVolumeCompleted = wordCompletedSnap.size;

  return { wordAccuracy, wordVolumeCompleted };
};

// --- PILLAR 3: Passages ---
// Reads from: 'miscueReports' (accuracy + WPM)

const aggregatePassageMetrics = async (
  studentId: string,
): Promise<
  Pick<AggregatedMetrics, 'avgPassageAccuracy' | 'avgWPM' | 'passageCount'>
> => {
  const reportsSnap = await getDocs(
    query(collection(db, 'miscueReports'), where('studentId', '==', studentId)),
  );

  const passageCount = reportsSnap.size;

  // No passages attempted yet — student is definitely still at a foundational stage
  if (passageCount === 0) {
    return { avgPassageAccuracy: 0, avgWPM: 0, passageCount: 0 };
  }

  let totalAccuracy = 0;
  let totalWPM = 0;

  reportsSnap.forEach((document: QueryDocumentSnapshot) => {
    const data = document.data();
    // accuracyRate is pre-computed by storeReport() as: ((totalWords - totalMiscues) / totalWords) * 100
    totalAccuracy += data.accuracyRate ?? 0;
    totalWPM += data.wordPerMin ?? 0;
  });

  const avgPassageAccuracy = totalAccuracy / passageCount;
  const avgWPM = totalWPM / passageCount;

  return { avgPassageAccuracy, avgWPM, passageCount };
};

// =============================================================================
// STEP 2 — FETCH STUDENT GRADE LEVEL
// Needed to look up the correct WPM benchmark for 'advanced' classification.
// =============================================================================

const getStudentGradeLevel = async (studentId: string): Promise<number> => {
  const userSnap = await getDoc(doc(db, 'users', studentId));
  if (!userSnap.exists()) return 1; // Safe default

  const userData = userSnap.data() as UserDocument;
  return userData.studentData?.gradeLevel ?? 1;
};

// =============================================================================
// STEP 3 — TIERED THRESHOLD MODEL
//
// Tiers must be checked in strict sequential order. A student cannot skip a
// tier — they must satisfy all the requirements of the lower tier before the
// next can be evaluated. This reflects how reading skills build sequentially:
//   Letters → Words → Connected Text (Passages)
// =============================================================================

const computeReadingLevel = (
  metrics: AggregatedMetrics,
  gradeLevel: number,
): ReadingLevel => {
  const {
    alphabetAccuracy,
    wordAccuracy,
    avgPassageAccuracy,
    avgWPM,
    passageCount,
  } = metrics;

  // WPM target for this grade level (falls back to Grade 1 if unrecognized)
  const wpmTarget = WPM_TARGETS_BY_GRADE[gradeLevel] ?? DEFAULT_WPM_TARGET;

  // -----------------------------------------------------------------
  // TIER 1: BEGINNER (Default)
  // -----------------------------------------------------------------
  // Condition: Fails foundational phonemic awareness OR basic word decoding,
  //            OR has not yet attempted any passage reading.
  //
  // Meaning: Student is still building the letter-sound foundation. They
  //          cannot reliably decode words in isolation, so connected text
  //          is not yet a meaningful challenge.
  // -----------------------------------------------------------------
  const failsAlphabet = alphabetAccuracy < 80;
  const failsWordFoundation = wordAccuracy < 70;
  const hasNoPassageData = passageCount === 0;

  if (failsAlphabet || failsWordFoundation || hasNoPassageData) {
    return 'beginner';
  }

  // -----------------------------------------------------------------
  // TIER 2: EMERGING / NOVICE
  // -----------------------------------------------------------------
  // Condition: Meets the foundational letter and word minimums, but passage
  //            accuracy is still in the Frustration Level (< 90%).
  //
  // Meaning: Can decode words in isolation but struggles when words appear
  //          in context. Often reads haltingly with frequent miscues.
  //          Teacher support is essential at this stage.
  // -----------------------------------------------------------------
  const atFrustrationLevel = avgPassageAccuracy < 90;

  if (alphabetAccuracy >= 80 && wordAccuracy >= 70 && atFrustrationLevel) {
    return 'emerging';
  }

  // -----------------------------------------------------------------
  // TIER 3: INTERMEDIATE / INSTRUCTIONAL
  // -----------------------------------------------------------------
  // Condition: Word accuracy shows solid decoding (≥ 85%) and passage
  //            accuracy is in the Instructional Band (90% – 94%).
  //
  // Meaning: Student reads connected text reasonably well but benefits
  //          from guided reading support. This is the "sweet spot" for
  //          teacher-led instruction (Vygotsky's zone of proximal development).
  // -----------------------------------------------------------------
  const atInstructionalLevel =
    avgPassageAccuracy >= 90 && avgPassageAccuracy < 95;

  if (wordAccuracy >= 85 && atInstructionalLevel) {
    return 'intermediate';
  }

  // -----------------------------------------------------------------
  // TIER 4: ADVANCED / INDEPENDENT
  // -----------------------------------------------------------------
  // Condition: High word accuracy (≥ 95%), Independent Level passage accuracy
  //            (≥ 95%), AND meets or exceeds the grade-level WPM benchmark.
  //
  // Meaning: Student reads fluently without teacher assistance. They can
  //          self-select and read materials at or above grade level independently.
  //
  // WHY WPM is required here: A student could have 98% accuracy but read at
  // 20 WPM (very slow, labored decoding). That is NOT independent fluency.
  // True independence requires both accuracy AND automaticity (speed).
  // -----------------------------------------------------------------
  const atIndependentLevel = avgPassageAccuracy >= 95;
  const meetsFluencyTarget = avgWPM >= wpmTarget;

  if (wordAccuracy >= 95 && atIndependentLevel && meetsFluencyTarget) {
    return 'advanced';
  }

  // -----------------------------------------------------------------
  // EDGE CASE: High accuracy but lagging WPM
  // -----------------------------------------------------------------
  // The student has excellent accuracy (≥ 95%) but hasn't reached the
  // fluency speed benchmark. They are solidly performing in the upper
  // range of Intermediate — good accuracy, still developing automaticity.
  // Keep them at 'intermediate' rather than sending them back to 'emerging'.
  // -----------------------------------------------------------------
  if (wordAccuracy >= 85 && avgPassageAccuracy >= 95) {
    return 'intermediate';
  }

  // -----------------------------------------------------------------
  // FINAL FALLBACK
  // -----------------------------------------------------------------
  // This catches any remaining edge case that doesn't fit a clean tier
  // (e.g., word accuracy between 70–85% with instructional passage accuracy).
  // 'Emerging' is the safe default because it doesn't over-promote.
  // -----------------------------------------------------------------
  return 'emerging';
};

// =============================================================================
// STEP 4 — WRITE TO FIRESTORE (CONDITIONALLY)
// Only writes if the computed level differs from the current stored level.
// This avoids unnecessary Firestore write operations on every activity.
// =============================================================================

const updateReadingLevelIfChanged = async (
  studentId: string,
  newLevel: ReadingLevel,
): Promise<void> => {
  const userRef = doc(db, 'users', studentId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.warn(
      `[ReadingLevelService] User document not found for: ${studentId}`,
    );
    return;
  }

  const userData = userSnap.data() as UserDocument;
  const currentLevel = userData.studentData?.reading_Level;

  // No-op: level hasn't changed, skip the write
  if (currentLevel === newLevel) {
    console.log(
      `[ReadingLevelService] Level unchanged (${currentLevel}) for student ${studentId}. No write needed.`,
    );
    return;
  }

  // Level has changed — write the update
  await updateDoc(userRef, {
    'studentData.reading_Level': newLevel,
    // Track when the level last changed for audit/analytics purposes
    'studentData.readingLevelUpdatedAt': serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log(
    `[ReadingLevelService] ✅ Level updated: "${currentLevel}" → "${newLevel}" for student ${studentId}`,
  );
};
