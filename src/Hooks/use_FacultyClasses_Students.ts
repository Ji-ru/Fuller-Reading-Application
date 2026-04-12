import { getAuth } from '@react-native-firebase/auth';
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
import { ClassDocument, UserDocument } from '../Interfaces/dataInterfaces';

// Initialize instances
const db = getFirestore();

export const getFacultyClasses_Student = {
  // ====================================================================
  // CLASS RELATED FUNCTIONS
  // ====================================================================

  /**
   * Get Faculty Classes
   *
   * @param facultyId - registered facultyId of the Faculty
   * @returns all the classes existed of the faculty
   */
  async getFacultyClasses(facultyId: string, isActive: boolean = true): Promise<ClassDocument[]> {
    try {
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('facultyId', '==', facultyId));
      const querySnapshot = await getDocs(q);

      const all = querySnapshot.docs.map((doc: any) => ({
        ...doc.data(),
        classId: doc.id,
      })) as ClassDocument[];

      // In-memory filtering allows us to handle legacy documents where isActive is missing (defaults to true)
      return all.filter(c => {
        const isClassActive = (c.isActive === undefined || c.isActive === true);
        return isClassActive === isActive;
      });
    } catch (error: any) {
      throw new Error("Failed to fetch faculty's classes. " + error.message);
    }
  },
  

  // ====================================================================
  // STUDENT RELATED FUNCTIONS
  // ====================================================================
  /**
   * Get Students in Class
   *
   * @param classCode - the class code to get the students from the class
   * @returns all the students in the class
   */
  async getStudentsInClass(classCode: string): Promise<UserDocument[]> {
    try {
      // 1. Query all students with this class code
      const usersRef = collection(db, 'users');
      const studentsQuery = query(
        usersRef,
        where('studentData.classCode', '==', classCode),
        where('role', '==', 'student'),
      );

      const studentsSnapshot = await getDocs(studentsQuery);

      return studentsSnapshot.docs.map((doc: any) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserDocument[];
    } catch (error: any) {
      throw new Error(`Failed to fetch students: ${error.message}`);
    }
  },

  // WILL BE ADDED LATER !!!!!!!!
  async addStudentToClass(classId: string, studentId: string): Promise<void> {
    try {
      const classRef = doc(db, 'classes', classId);
      const studentRef = doc(db, 'users', studentId);

      // Get current data for validation
      const [classDoc, studentDoc] = await Promise.all([
        getDoc(classRef),
        getDoc(studentRef),
      ]);

      if (!classDoc.exists()) throw new Error('Class not found');
      if (!studentDoc.exists()) throw new Error('Student not found');

      const studentData = studentDoc.data() as UserDocument;
      if (studentData.role !== 'student') {
        throw new Error('User is not a student');
      }

      // Use arrayUnion instead of spreading
      await Promise.all([
        updateDoc(classRef, {
          studentIds: arrayUnion(studentId), // ← Better than [...array, newId]
          updatedAt: serverTimestamp(),
        }),
        updateDoc(studentRef, {
          'studentData.classId': classId,
          updatedAt: serverTimestamp(),
        }),
      ]);
    } catch (error: any) {
      throw new Error(`Failed to add student to class: ${error.message}`);
    }
  },

  // ====================================================================
  // UPDATE & DELETE DATABASE FUNCTIONS
  // ====================================================================

  /**
   * Update Class
   *
   * @param classId - the id of the class to be updated
   * @param className - the name of the class to be updated
   * @param updates - the class date that should remain and not tampered
   * @returns - a success message when the class name is successfully upda
   */
  async editClass(
    classId: string,
    className: string,
    updates: Partial<
      Omit<
        ClassDocument,
        'classId' | 'createdAt' | 'studentIds' | 'facultyId' | 'classCode'
      >
    >,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Get the class data first
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);

      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data() as ClassDocument;
      await updateDoc(classRef, {
        ...updates,
        className: className,
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        message: `Class "${className}" updated successfully.`,
      };
    } catch (error: any) {
      throw new Error(`Failed to edit class: ${error.message}`);
    }
  },

  /**
   * Delete Class
   *
   * @param classId - the id of the class to delete
   * @returns a success message if the class is deleted successfully
   */
  async deleteClass(
    classId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. First get the class data first to find the studentIds
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);

      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data() as ClassDocument;
      const classCode = classData.classCode;
      const studentIds = classData.studentIds || [];

      // 2. Find ALL students within class and update all of them to remove the classCode
      // Prevents data from being orphaned
      const updatePromises = studentIds.map(async (studentId: string) => {
        try {
          const studentRef = doc(db, 'users', studentId);
          const studentDoc = await getDoc(studentRef);
          if (!studentDoc.exists()) {
            throw new Error('Student not found');
          }
          console.log('This is the studentId: ' + studentId);
          await updateDoc(studentRef, {
            'studentData.classCode': '',
            updatedAt: serverTimestamp(),
          });
          console.log("Deleted the code from the student's Class Code!");
        } catch (error: any) {
          throw new Error(`Failed to update student: ${error.message}`);
        }
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // 3. Delete the class
      await deleteDoc(classRef);

      // 4. Update the faculty's assignedClassIds
      try {
        const facultyRef = doc(db, 'users', classData.facultyId);
        await updateDoc(facultyRef, {
          'facultyData.assignedClassIds': arrayRemove(classId),
          'facultyData.assignedGradeLevels': arrayRemove(classCode),
          updatedAt: serverTimestamp(),
        });
      } catch (error: any) {
        throw new Error(
          `Failed to update faculty's assignedClassIds: ${error.message}`,
        );
      }

      return {
        success: true,
        message: `Class "${
          classData.className || classId
        }" deleted successfully.`,
      };
    } catch (error: any) {
      throw new Error(`Failed to delete class: ${error.message}`);
    }
  },

  /**
   * Archive/Restore Class
   */
  async archiveClass(classId: string, archive: boolean = true): Promise<{ success: boolean; message: string }> {
    try {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, {
        isActive: !archive,
        updatedAt: serverTimestamp(),
      });
      return {
        success: true,
        message: `Class successfully ${archive ? 'archived' : 'restored'}.`,
      };
    } catch (error: any) {
      throw new Error(`Failed to archive class: ${error.message}`);
    }
  },
};
