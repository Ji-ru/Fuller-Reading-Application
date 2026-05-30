import { useState, useEffect } from 'react';
import { UserDocument } from '../../Interfaces/dataInterfaces';
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface UserAnalyticsData {
  roleCounts: { students: number; faculty: number };
  monthlyRegistrations: Array<{ yearMonth: string; count: number }>;
  readingLevels: { beginner: number; intermediate: number; advanced: number };
  totalUsers: number;
  isLoading: boolean;
  errorMessage: string | null;
}

const db = getFirestore();

const chunkArray = <T,>(items: T[], chunkSize: number): T[][] => {
  if (items.length === 0) return [];
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  return chunks;
};

const dedupeByUid = (users: UserDocument[]): UserDocument[] => {
  const byUid = new Map<string, UserDocument>();
  users.forEach(user => {
    if (user.uid) {
      byUid.set(user.uid, user);
    }
  });

  return Array.from(byUid.values());
};

/**
 * Custom hook to fetch and aggregate user data from Firestore.
 * If `acadYear` is provided, only users associated with classes of that academic year are counted.
 */
export const useUserAnalytics = (acadYear?: string, filterByAcadYear: boolean = true): UserAnalyticsData => {
  const [roleCounts, setRoleCounts] = useState({ students: 0, faculty: 0 });
  const [monthlyRegistrations, setMonthlyRegistrations] = useState<Array<{ yearMonth: string; count: number }>>([]);
  const [readingLevels, setReadingLevels] = useState({ beginner: 0, intermediate: 0, advanced: 0 });
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchAndAggregateUsers = async () => {
      try {
        if (isActive) {
          setIsLoading(true);
          setErrorMessage(null);
        }

        let students: UserDocument[] = [];
        let faculty: UserDocument[] = [];

        if (!filterByAcadYear || !acadYear) {
          // Fast path: one users query and split client-side.
          const usersSnapshot = await getDocs(
            query(collection(db, 'users'), where('role', 'in', ['student', 'faculty'])),
          );

          const allUsers = usersSnapshot.docs.map(
            (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
              doc.data() as UserDocument,
          );
          students = allUsers.filter((u: UserDocument) => u.role === 'student');
          faculty = allUsers.filter((u: UserDocument) => u.role === 'faculty');
        } else {
          // Academic-year path: resolve valid classes first, then query only matching users.
          const classesSnapshot = await getDocs(
            query(collection(db, 'classes'), where('acadYear', '==', acadYear)),
          );

          const classCodes = Array.from(
            new Set(
              classesSnapshot.docs
                .map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
                  const data = doc.data() as { classCode?: string };
                  return data.classCode;
                })
                .filter((code: string | undefined): code is string => !!code),
            ),
          );

          const classIds = Array.from(
            new Set(
              classesSnapshot.docs
                .map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
                  const data = doc.data() as { classId?: string };
                  return data.classId || doc.id;
                })
                .filter((id: string | undefined): id is string => !!id),
            ),
          );

          const studentChunks = chunkArray(classCodes, 10);
          const facultyChunks = chunkArray(classIds, 10);

          const studentSnapshots = await Promise.all(
            studentChunks.map(chunk =>
              getDocs(
                query(
                  collection(db, 'users'),
                  where('role', '==', 'student'),
                  where('studentData.classCode', 'in', chunk),
                ),
              ),
            ),
          );

          const facultySnapshots = await Promise.all(
            facultyChunks.map(chunk =>
              getDocs(
                query(
                  collection(db, 'users'),
                  where('role', '==', 'faculty'),
                  where('facultyData.assignedClassIds', 'array-contains-any', chunk),
                ),
              ),
            ),
          );

          students = dedupeByUid(
            studentSnapshots.flatMap(
              (snapshot: FirebaseFirestoreTypes.QuerySnapshot) =>
                snapshot.docs.map(
                  (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
                    doc.data() as UserDocument,
                ),
            ),
          );
          faculty = dedupeByUid(
            facultySnapshots.flatMap(
              (snapshot: FirebaseFirestoreTypes.QuerySnapshot) =>
                snapshot.docs.map(
                  (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
                    doc.data() as UserDocument,
                ),
            ),
          );
        }

        const studentCount = students.length;
        const facultyCount = faculty.length;

        // Monthly registration counts (based on createdAt)
        const monthMap: Record<string, number> = {};
        const allUsers = [...students, ...faculty];
        allUsers.forEach(user => {
          if (user.createdAt) {
            const date = user.createdAt.toDate();
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthMap[yearMonth] = (monthMap[yearMonth] || 0) + 1;
          }
        });

        const sortedMonths = Object.keys(monthMap).sort();
        const monthlyData = sortedMonths.map(month => ({ yearMonth: month, count: monthMap[month] }));

        // Reading levels (students only)
        let beginnerCount = 0, intermediateCount = 0, advancedCount = 0;
        students.forEach((student: UserDocument) => {
          const level = student.studentData?.reading_Level;
          if (level === 'beginner') beginnerCount++;
          else if (level === 'intermediate') intermediateCount++;
          else if (level === 'advanced') advancedCount++;
        });

        if (isActive) {
          setRoleCounts({ students: studentCount, faculty: facultyCount });
          setMonthlyRegistrations(monthlyData);
          setReadingLevels({ beginner: beginnerCount, intermediate: intermediateCount, advanced: advancedCount });
          setTotalUsers(studentCount + facultyCount);
        }
      } catch (error: any) {
        if (isActive) {
          setErrorMessage(error.message);
        }
        console.error('[useUserAnalytics] Failed to fetch users:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchAndAggregateUsers();
    return () => {
      isActive = false;
    };
  }, [acadYear, filterByAcadYear]);

  return {
    roleCounts,
    monthlyRegistrations,
    readingLevels,
    totalUsers,
    isLoading,
    errorMessage,
  };
};