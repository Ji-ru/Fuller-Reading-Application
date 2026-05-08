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
  /**
   * Create a new assessment activity
   */
  static async createActivity(
    data: Omit<
      ActivityDocument,
      'activityId' | 'facultyId' | 'createdAt' | 'isActive'
    >,
  ) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');

    const db = getFirestore();
    const activityRef = doc(collection(db, 'activities'));
    const newActivity: ActivityDocument = {
      ...data,
      activityId: activityRef.id,
      facultyId: user.uid,
      createdAt: serverTimestamp(),
      isActive: true,
    };

    await setDoc(activityRef, newActivity);
    return newActivity;
  }

  /**
   * Get activities for a specific faculty member
   */
  static async getFacultyActivities(classCode?: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return [];

    const db = getFirestore();
    const constraints: any[] = [where('facultyId', '==', user.uid)];
    if (classCode) {
      constraints.push(where('classCode', '==', classCode));
    }

    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'activities'),
          ...constraints,
          orderBy('createdAt', 'desc') as any,
        ),
      );
      return snapshot.docs.map(
        (doc: any) => doc.data() as ActivityDocument,
      );
    } catch (e) {
      console.warn(
        'Index not found or query error, falling back to unordered:',
        e,
      );
      const snapshot = await getDocs(
        query(collection(db, 'activities'), ...constraints),
      );
      return snapshot.docs.map(
        (doc: any) => doc.data() as ActivityDocument,
      );
    }
  }

  /**
   * Get activities for a specific class (Student perspective)
   */
  static async getStudentActivities(classCode: string) {
    const db = getFirestore();
    const constraints: any[] = [
      where('classCode', '==', classCode),
      where('isActive', '==', true),
    ];

    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'activities'),
          ...constraints,
          orderBy('createdAt', 'desc') as any,
        ),
      );
      return snapshot.docs.map(
        (doc: any) => doc.data() as ActivityDocument,
      );
    } catch (e) {
      console.warn('Index not found or student query error:', e);
      const snapshot = await getDocs(
        query(collection(db, 'activities'), ...constraints),
      );
      return snapshot.docs.map(
        (doc: any) => doc.data() as ActivityDocument,
      );
    }
  }

  /**
   * Delete an activity
   */
  static async deleteActivity(activityId: string) {
    const db = getFirestore();
    await deleteDoc(doc(collection(db, 'activities'), activityId));
  }

  /**
   * Get a single activity by ID
   */
  static async getActivity(activityId: string) {
    const db = getFirestore();
    const docSnap = await getDoc(doc(collection(db, 'activities'), activityId));
    if (!docSnap.exists()) return null;
    return docSnap.data() as ActivityDocument;
  }

  /**
   * Submit activity result
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
  ) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');

    const db = getFirestore();
    const resultRef = doc(collection(db, 'activityResults'));
    const percentage = Math.round((score / total) * 100);

    const result: ActivityResultDocument = {
      resultId: resultRef.id,
      activityId,
      studentId: user.uid,
      score,
      totalItems: total,
      percentage,
      completedAt: serverTimestamp(),
      responses,
    };

    await setDoc(resultRef, result);
    return result;
  }

  /**
   * Get results for an activity (Faculty perspective)
   */
  static async getActivityResults(activityId: string) {
    const db = getFirestore();
    const snapshot = await getDocs(
      query(
        collection(db, 'activityResults'),
        where('activityId', '==', activityId),
      ),
    );

    return snapshot.docs.map(
      (doc: any) => doc.data() as ActivityResultDocument,
    );
  }

  /**
   * Check if student has completed an activity (Current User)
   */
  static async getStudentResult(activityId: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return this.getStudentResultForUser(activityId, user.uid);
  }

  /**
   * Check if student has completed an activity (Specified User)
   */
  static async getStudentResultForUser(activityId: string, studentId: string) {
    const db = getFirestore();
    const snapshot = await getDocs(
      query(
        collection(db, 'activityResults'),
        where('activityId', '==', activityId),
        where('studentId', '==', studentId),
        limit(1),
      ),
    );

    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as ActivityResultDocument;
  }
}
