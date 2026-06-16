import { useState, useEffect } from 'react';
import { UserDocument } from '../../Interfaces/dataInterfaces';
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  getCountFromServer,
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

/**
 * Custom hook to fetch and aggregate user data from Firestore.
 * If `acadYear` is provided, only users associated with classes of that academic year are counted.
 * Optimized using getCountFromServer.
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

        let studentCount = 0;
        let facultyCount = 0;

        if (!filterByAcadYear || !acadYear) {
          // Fast path: two simple count queries
          const [studentSnap, facultySnap] = await Promise.all([
            getCountFromServer(query(collection(db, 'users'), where('role', '==', 'student'))),
            getCountFromServer(query(collection(db, 'users'), where('role', '==', 'faculty')))
          ]);
          studentCount = studentSnap.data().count;
          facultyCount = facultySnap.data().count;
        } else {
          // Academic-year path: resolve valid classes first
          const classesSnapshot = await getDocs(
            query(collection(db, 'classes'), where('acadYear', '==', acadYear)),
          );

          const classCodes = Array.from(
            new Set(
              classesSnapshot.docs
                .map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => (doc.data() as { classCode?: string }).classCode)
                .filter((code: string | undefined): code is string => !!code),
            ),
          );

          const classIds = Array.from(
            new Set(
              classesSnapshot.docs
                .map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => (doc.data() as { classId?: string }).classId || doc.id)
                .filter((id: string | undefined): id is string => !!id),
            ),
          );

          const studentChunks = chunkArray(classCodes, 10);
          const facultyChunks = chunkArray(classIds, 10);

          // Get counts for each chunk
          const studentPromises = studentChunks.map(chunk =>
            getCountFromServer(
              query(collection(db, 'users'), where('role', '==', 'student'), where('studentData.classCode', 'in', chunk))
            )
          );
          
          const facultyPromises = facultyChunks.map(chunk =>
            getCountFromServer(
              query(collection(db, 'users'), where('role', '==', 'faculty'), where('facultyData.assignedClassIds', 'array-contains-any', chunk))
            )
          );

          const studentSnaps = await Promise.all(studentPromises);
          const facultySnaps = await Promise.all(facultyPromises);

          studentCount = studentSnaps.reduce((acc, snap) => acc + snap.data().count, 0);
          facultyCount = facultySnaps.reduce((acc, snap) => acc + snap.data().count, 0);
        }

        // Monthly registrations: we query the last 6 months using getCountFromServer
        const monthsToCheck: { label: string, start: Date, end: Date }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const label = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
            monthsToCheck.push({ label, start, end });
        }

        const monthlyPromises = monthsToCheck.map(m => 
            getCountFromServer(query(
                collection(db, 'users'),
                where('createdAt', '>=', m.start),
                where('createdAt', '<', m.end)
            ))
        );

        const monthlySnaps = await Promise.all(monthlyPromises);
        const monthlyData = monthsToCheck.map((m, index) => ({
            yearMonth: m.label,
            count: monthlySnaps[index].data().count
        }));

        if (isActive) {
          setRoleCounts({ students: studentCount, faculty: facultyCount });
          setMonthlyRegistrations(monthlyData);
          // Reading levels are currently unused in the UI, defaulting to 0 to save reads
          setReadingLevels({ beginner: 0, intermediate: 0, advanced: 0 });
          setTotalUsers(studentCount + facultyCount);
        }
      } catch (error: any) {
        if (isActive) {
          setErrorMessage(error.message);
        }
        console.error('[useUserAnalytics] Failed to fetch users metrics:', error);
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