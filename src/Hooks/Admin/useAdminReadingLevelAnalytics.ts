import { useState, useEffect, useMemo } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';
import { UserDocument, ClassDocument } from '../../Interfaces/dataInterfaces';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export interface StudentReadingData {
  uid: string;
  gradeLevel: number | null;
  classCode: string | null;
  readingLevel: 'beginner' | 'intermediate' | 'advanced' | null;
}

export interface AdminClassOption {
  classId: string;
  classCode: string;
  className: string;
  gradeLevel: number;
}

const firestore = getFirestore();

/**
 * Fetches student reading data and class metadata.
 * If `acadYear` is provided, only students belonging to classes of that academic year are included,
 * and only those classes are shown in the dropdown.
 */
export const useAdminReadingLevelAnalytics = (acadYear?: string) => {
  const [studentData, setStudentData] = useState<StudentReadingData[]>([]);
  const [classes, setClasses] = useState<AdminClassOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // 1. Fetch classes (optionally filtered by academic year)
        const classesCollection = collection(firestore, 'classes');
        let classesQuery = query(classesCollection);
        if (acadYear) {
          classesQuery = query(classesQuery, where('acadYear', '==', acadYear));
        }
        const classesSnapshot = await getDocs(classesQuery);
        const fetchedClasses: AdminClassOption[] = classesSnapshot.docs.map((doc: QueryDocumentSnapshot) => {
          const data = doc.data() as ClassDocument;
          return {
            classId: doc.id,
            classCode: String(data.classCode ?? ''),
            className: data.className || String(data.classCode ?? ''),
            gradeLevel: Number(data.gradeLevel),
          };
        }).filter((c:AdminClassOption) => c.classCode && c.gradeLevel !== undefined);

        setClasses(fetchedClasses);

        // 2. Build set of valid class codes (for filtering students)
        const validClassCodes = new Set(fetchedClasses.map(c => c.classCode));

        // 3. Fetch all students
        const usersCollection = collection(firestore, 'users');
        const usersQuery = query(usersCollection);
        const usersSnapshot = await getDocs(usersQuery);

        const students: StudentReadingData[] = [];

        usersSnapshot.forEach((doc: QueryDocumentSnapshot) => {
          const user = doc.data() as UserDocument;
          if (user.role !== 'student') return;
          if (!user.studentData) return;

          // If academic year is provided, only include students whose class code is in the valid set
          if (acadYear) {
            const classCode = user.studentData.classCode;
            if (!classCode || !validClassCodes.has(classCode)) return;
          }

          students.push({
            uid: user.uid,
            gradeLevel: user.studentData.gradeLevel ?? null,
            classCode: user.studentData.classCode || null,
            readingLevel: user.studentData.reading_Level || null,
          });
        });

        setStudentData(students);
      } catch (error: any) {
        setErrorMessage(error.message);
        console.error('[useAdminReadingLevelAnalytics] Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [acadYear]); // Re-run when academic year changes

  // Compute unique grades from classes (which are already filtered by year, if applicable)
  const uniqueGrades = useMemo(() => {
    const grades = new Set<number>();
    classes.forEach(c => grades.add(c.gradeLevel));
    // Also include any grade levels present in student docs (defensive)
    studentData.forEach(s => {
      if (s.gradeLevel !== null) grades.add(s.gradeLevel);
    });
    return Array.from(grades).sort((a, b) => a - b);
  }, [classes, studentData]);

  return {
    studentData,
    uniqueGrades,
    classes,
    isLoading,
    errorMessage,
  };
};