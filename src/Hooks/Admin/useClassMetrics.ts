import { useState, useCallback, useEffect } from 'react';
import { getFirestore, collection, query, where, getCountFromServer } from '@react-native-firebase/firestore';

/** Return type for useClassMetrics hook */
interface ClassMetrics {
  totalClasses: number;
  activeClassCount: number;
  archivedClassCount: number;
  totalEnrolledStudents: number;
  gradeDistribution: Record<number, number>;
  isLoading: boolean;
  errorMessage: string | null;
  fetchMetrics: () => Promise<void>;
  resetMetrics: () => void;
}

const db = getFirestore();

/**
 * Custom hook to fetch and aggregate class data from Firestore.
 * Retrieves aggregate counts from the server using getCountFromServer
 * for performance and reduced billing costs.
 *
 * @param acadYear - Optional academic year to filter classes (e.g., "2025-2026")
 */
export const useClassMetrics = (acadYear?: string): ClassMetrics => {
  const [totalClasses, setTotalClasses] = useState(0);
  const [activeClassCount, setActiveClassCount] = useState(0);
  const [archivedClassCount, setArchivedClassCount] = useState(0);
  const [totalEnrolledStudents, setTotalEnrolledStudents] = useState(0);
  const [gradeDistribution, setGradeDistribution] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const classesRef = collection(db, 'classes');
      const activeQuery = acadYear
        ? query(classesRef, where('acadYear', '==', acadYear), where('status', '==', 'active'))
        : query(classesRef, where('status', '==', 'active'));

      const archivedQuery = acadYear
        ? query(classesRef, where('acadYear', '==', acadYear), where('status', '==', 'archived'))
        : query(classesRef, where('status', '==', 'archived'));

      const grades = [1, 2, 3];
      const gradeQueries = grades.map(g => 
        acadYear
          ? query(classesRef, where('acadYear', '==', acadYear), where('gradeLevel', '==', g))
          : query(classesRef, where('gradeLevel', '==', g))
      );

      // Execute all count queries in parallel
      const [activeSnap, archivedSnap, ...gradeSnaps] = await Promise.all([
        getCountFromServer(activeQuery),
        getCountFromServer(archivedQuery),
        ...gradeQueries.map(q => getCountFromServer(q))
      ]);

      const activeCount = activeSnap.data().count;
      const archivedCount = archivedSnap.data().count;
      const totalCount = activeCount + archivedCount;

      const gradeMap: Record<number, number> = {};
      grades.forEach((g, index) => {
        gradeMap[g] = gradeSnaps[index].data().count;
      });

      setTotalClasses(totalCount);
      setActiveClassCount(activeCount);
      setArchivedClassCount(archivedCount);
      setGradeDistribution(gradeMap);

      // Total enrolled students requires array length aggregation which is expensive in NoSQL.
      // Since it's currently unused in the UI charts, we set it to 0 to save massive document read costs.
      setTotalEnrolledStudents(0);
    } catch (err: any) {
      setErrorMessage(err.message);
      console.error('[useClassMetrics] Failed to fetch classes metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [acadYear]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const resetMetrics = useCallback(() => {
    setTotalClasses(0);
    setActiveClassCount(0);
    setArchivedClassCount(0);
    setTotalEnrolledStudents(0);
    setGradeDistribution({});
    setErrorMessage(null);
  }, []);

  return {
    totalClasses,
    activeClassCount,
    archivedClassCount,
    totalEnrolledStudents,
    gradeDistribution,
    isLoading,
    errorMessage,
    fetchMetrics,
    resetMetrics,
  };
};