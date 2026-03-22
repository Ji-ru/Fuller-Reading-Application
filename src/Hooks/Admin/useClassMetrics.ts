import { useState, useCallback, useEffect } from 'react';
import { GetClassesResult, getAllClasses } from '../../Controller/AuthenticationController';

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

/**
 * Custom hook to fetch and aggregate class data from Firestore.
 * Retrieves a large batch of classes (up to 1000) and computes:
 * - total / active / archived counts
 * - total students enrolled
 * - distribution of classes per grade level
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

      // Request up to 1000 classes for accurate metrics, passing acadYear filter
      const result: GetClassesResult = await getAllClasses({ limitOverride: 1000, acadYear });
      
      const fetchedClasses = result.classes;

      let activeCount = 0;
      let archivedCount = 0;
      let studentTotal = 0;
      const gradeMap: Record<number, number> = {};
      

      fetchedClasses.forEach(cls => {
        // Status counts
        if (cls.status === 'active') activeCount++;
        else if (cls.status === 'archived') archivedCount++;

        // Sum student IDs
        if (cls.studentIds) studentTotal += cls.studentIds.length;

        // Grade level distribution
        const grade = cls.gradeLevel || 0;
        gradeMap[grade] = (gradeMap[grade] || 0) + 1;
      });

      console.log("Archive Count: " + archivedCount)
      setTotalClasses(fetchedClasses.length);
      setActiveClassCount(activeCount);
      setArchivedClassCount(archivedCount);
      setTotalEnrolledStudents(studentTotal);
      setGradeDistribution(gradeMap);
    } catch (err: any) {
      setErrorMessage(err.message);
      console.error('[useClassMetrics] Failed to fetch classes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [acadYear]); // Re‑create function when acadYear changes

  // Auto‑fetch when acadYear changes
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