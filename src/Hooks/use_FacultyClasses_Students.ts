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
import { FilterOptions } from '../Interfaces/miscue';
import { onSnapshot } from '@react-native-firebase/firestore';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

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
  async getFacultyClasses(facultyId: string): Promise<ClassDocument[]> {
    try {
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('facultyId', '==', facultyId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc: any) => ({
        ...doc.data(),
        classId: doc.id,
      })) as ClassDocument[];
    } catch (error: any) {
      throw new Error("Failed to fetch faculty's classes. " + error.message);
    }
  },

  /**
   * For a real time update of edited classes 
   * - If archived, it should reflect to my archive component
   * @param facultyId - gets the their created classes
   * @param onUpdate - reflects any updated class
   * @returns - displays objects (class) that has been modified for real time reflection to and from MyClass and MyArchive
   */
  getToFacultyClassesRealTime(
    facultyId: string,
    onUpdate: (classes: ClassDocument[]) => void,
  ) {
    const q = query(
      collection(db, 'classes'),
      where('facultyId', '==', facultyId),
    );

    return onSnapshot(q, snapshot => {
      const classes = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        ...doc.data(),
        classId: doc.id,
      })) as ClassDocument[];
      onUpdate(classes);
    });
  },

  /**
 * Get student IDs based on filter
 */
  async getFilteredStudentIds(
    facultyId: string,
    filter?: FilterOptions,
  ): Promise<{ studentIds: string[]; className?: string }> {
    try {
      const classes = await getFacultyClasses_Student.getFacultyClasses(facultyId);

      if (filter?.type === 'class' && filter.classId) {
        // Get specific class
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
        // Get all students from all classes
        const allStudentIds = classes.flatMap(cls => cls.studentIds || []);
        // Remove duplicates (students might be in multiple classes?)
        const uniqueStudentIds = Array.from(new Set(allStudentIds));
        return { studentIds: uniqueStudentIds };
      }
    } catch (error: any) {
      throw new Error('Failed to get filtered students: ' + error.message);
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

          await updateDoc(studentRef, {
            'studentData.classCode': '',
            updatedAt: serverTimestamp(),
          });

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
        message: `Class "${classData.className || classId
          }" deleted successfully.`,
      };
    } catch (error: any) {
      throw new Error(`Failed to delete class: ${error.message}`);
    }
  },
};
