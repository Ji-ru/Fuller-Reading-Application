
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ActivityDocument, ActivityResultDocument } from '../Interfaces/dataInterfaces';

export class AssessmentController {
  private static activitiesCollection = firestore().collection('activities');
  private static resultsCollection = firestore().collection('activityResults');

  /**
   * Create a new assessment activity
   */
  static async createActivity(data: Omit<ActivityDocument, 'activityId' | 'facultyId' | 'createdAt' | 'isActive'>) {
    const user = auth().currentUser;
    if (!user) throw new Error('Unauthorized');

    const activityRef = this.activitiesCollection.doc();
    const newActivity: ActivityDocument = {
      ...data,
      activityId: activityRef.id,
      facultyId: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
      isActive: true,
    };

    await activityRef.set(newActivity);
    return newActivity;
  }

  /**
   * Get activities for a specific faculty member
   */
  static async getFacultyActivities(classCode?: string) {
    const user = auth().currentUser;
    if (!user) return [];

    let query = this.activitiesCollection.where('facultyId', '==', user.uid);
    if (classCode) {
      query = query.where('classCode', '==', classCode);
    }

    try {
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => doc.data() as ActivityDocument);
    } catch (e) {
      console.warn("Index not found or query error, falling back to unordered:", e);
      const snapshot = await query.get();
      return snapshot.docs.map(doc => doc.data() as ActivityDocument);
    }
  }

  /**
   * Get activities for a specific class (Student perspective)
   */
  static async getStudentActivities(classCode: string) {
    const query = this.activitiesCollection
      .where('classCode', '==', classCode)
      .where('isActive', '==', true);

    try {
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => doc.data() as ActivityDocument);
    } catch (e) {
      console.warn("Index not found or student query error:", e);
      const snapshot = await query.get();
      return snapshot.docs.map(doc => doc.data() as ActivityDocument);
    }
  }

  /**
   * Delete an activity
   */
  static async deleteActivity(activityId: string) {
    await this.activitiesCollection.doc(activityId).delete();
  }

  /**
   * Get a single activity by ID
   */
  static async getActivity(activityId: string) {
    const doc = await this.activitiesCollection.doc(activityId).get();
    if (!doc.exists) return null;
    return doc.data() as ActivityDocument;
  }

  /**
   * Submit activity result
   */
  static async submitResult(
    activityId: string, 
    score: number, 
    total: number, 
    responses?: { contentId: string, isCorrect: boolean, type: 'alphabet' | 'word' | 'passage' }[]
  ) {
    const user = auth().currentUser;
    if (!user) throw new Error('Unauthorized');

    const resultRef = this.resultsCollection.doc();
    const percentage = Math.round((score / total) * 100);

    const result: ActivityResultDocument = {
      resultId: resultRef.id,
      activityId,
      studentId: user.uid,
      score,
      totalItems: total,
      percentage,
      completedAt: firestore.FieldValue.serverTimestamp(),
      responses
    };

    await resultRef.set(result);
    return result;
  }

  /**
   * Get results for an activity (Faculty perspective)
   */
  static async getActivityResults(activityId: string) {
    const snapshot = await this.resultsCollection
      .where('activityId', '==', activityId)
      .get();
      
    return snapshot.docs.map(doc => doc.data() as ActivityResultDocument);
  }

  /**
   * Check if student has completed an activity (Current User)
   */
  static async getStudentResult(activityId: string) {
    const user = auth().currentUser;
    if (!user) return null;
    return this.getStudentResultForUser(activityId, user.uid);
  }

  /**
   * Check if student has completed an activity (Specified User)
   */
  static async getStudentResultForUser(activityId: string, studentId: string) {
    const snapshot = await this.resultsCollection
      .where('activityId', '==', activityId)
      .where('studentId', '==', studentId)
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as ActivityResultDocument;
  }
}
