import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import {
  ActivityDocument,
  ActivityResultDocument,
} from '../Interfaces/dataInterfaces';

export class AssessmentController {

  // ─── v22: Static singletons ──────────────────────────────────────────────
  // Because all methods are static, the correct pattern for a class is
  // private static readonly properties — not repeated calls inside each method.
  // getFirestore() was called 8x and getAuth() 4x previously (once per method).
  private static readonly db   = getFirestore();
  private static readonly auth = getAuth();

  /**
   * Create a new assessment activity
   */
  static async createActivity(
    data: Omit<
      ActivityDocument,
      'activityId' | 'facultyId' | 'createdAt' | 'isActive'
    >,
  ): Promise<ActivityDocument> {
    const user = AssessmentController.auth.currentUser;
    if (!user) throw new Error('Unauthorized');

    const activityRef = doc(
      collection(AssessmentController.db, 'activities'),
    );
    const newActivity: ActivityDocument = {
      ...data,
      activityId: activityRef.id,
      facultyId:  user.uid,
      createdAt:  serverTimestamp(),
      isActive:   true,
    };

    await setDoc(activityRef, newActivity);
    return newActivity;
  }

  /**
   * Get activities for the current faculty member
   */
  static async getFacultyActivities(
    classCode?: string,
  ): Promise<ActivityDocument[]> {
    const user = AssessmentController.auth.currentUser;
    if (!user) return [];

    const constraints: any[] = [where('facultyId', '==', user.uid)];
    if (classCode) constraints.push(where('classCode', '==', classCode));

    try {
      const snapshot = await getDocs(
        query(
          collection(AssessmentController.db, 'activities'),
          ...constraints,
          orderBy('createdAt', 'desc') as any,
        ),
      );
      return snapshot.docs.map((d: any) => d.data() as ActivityDocument);
    } catch {
      // Fallback: composite index may not exist yet — return unordered
      const snapshot = await getDocs(
        query(
          collection(AssessmentController.db, 'activities'),
          ...constraints,
        ),
      );
      return snapshot.docs.map((d: any) => d.data() as ActivityDocument);
    }
  }

  /**
   * Get active activities for a specific class (student perspective)
   */
  static async getStudentActivities(
    classCode: string,
  ): Promise<ActivityDocument[]> {
    const constraints: any[] = [
      where('classCode', '==', classCode),
      where('isActive',  '==', true),
    ];

    try {
      const snapshot = await getDocs(
        query(
          collection(AssessmentController.db, 'activities'),
          ...constraints,
          orderBy('createdAt', 'desc') as any,
        ),
      );
      return snapshot.docs.map((d: any) => d.data() as ActivityDocument);
    } catch {
      // Fallback: composite index may not exist yet — return unordered
      const snapshot = await getDocs(
        query(
          collection(AssessmentController.db, 'activities'),
          ...constraints,
        ),
      );
      return snapshot.docs.map((d: any) => d.data() as ActivityDocument);
    }
  }

  /**
   * Delete an activity by ID
   */
  static async deleteActivity(activityId: string): Promise<void> {
    await deleteDoc(
      doc(collection(AssessmentController.db, 'activities'), activityId),
    );
  }

  /**
   * Get a single activity by ID
   */
  static async getActivity(
    activityId: string,
  ): Promise<ActivityDocument | null> {
    const docSnap = await getDoc(
      doc(collection(AssessmentController.db, 'activities'), activityId),
    );
    if (!docSnap.exists()) return null;
    return docSnap.data() as ActivityDocument;
  }

  /**
   * Submit a result for the current student
   */
  static async submitResult(
    activityId: string,
    score: number,
    total: number,
    responses?: {
      contentId: string;
      isCorrect: boolean;
      type: 'alphabet' | 'word' | 'passage';
    }[],
  ): Promise<ActivityResultDocument> {
    const user = AssessmentController.auth.currentUser;
    if (!user) throw new Error('Unauthorized');

    const resultRef  = doc(collection(AssessmentController.db, 'activityResults'));
    const percentage = Math.round((score / total) * 100);

    const result: ActivityResultDocument = {
      resultId:    resultRef.id,
      activityId,
      studentId:   user.uid,
      score,
      totalItems:  total,
      percentage,
      completedAt: serverTimestamp(),
      responses,
    };

    await setDoc(resultRef, result);
    return result;
  }

  /**
   * Get all results for an activity (faculty perspective)
   */
  static async getActivityResults(
    activityId: string,
  ): Promise<ActivityResultDocument[]> {
    const snapshot = await getDocs(
      query(
        collection(AssessmentController.db, 'activityResults'),
        where('activityId', '==', activityId),
      ),
    );
    return snapshot.docs.map((d: any) => d.data() as ActivityResultDocument);
  }

  /**
   * Check if the current student has completed an activity
   */
  static async getStudentResult(
    activityId: string,
  ): Promise<ActivityResultDocument | null> {
    const user = AssessmentController.auth.currentUser;
    if (!user) return null;
    return AssessmentController.getStudentResultForUser(activityId, user.uid);
  }

  /**
   * Check if a specified student has completed an activity
   */
  static async getStudentResultForUser(
    activityId: string,
    studentId: string,
  ): Promise<ActivityResultDocument | null> {
    const snapshot = await getDocs(
      query(
        collection(AssessmentController.db, 'activityResults'),
        where('activityId', '==', activityId),
        where('studentId',  '==', studentId),
        limit(1),
      ),
    );
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as ActivityResultDocument;
  }
}