// useMiscueFilter.ts
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from '@react-native-firebase/firestore';
import { ClassDocument } from '../Interfaces/dataInterfaces';
import { getCurrentAcademicYear } from '../Utilities/acadYearUtils';

const db = getFirestore();

export const useMiscueFilter = (facultyId: string | null) => {
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Array<{
    classId: string;
    className?: string;
    gradeLevel: number;
    acadYear: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available academic years and classes
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!facultyId) {
        setAvailableYears([]);
        setAvailableClasses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Query classes for this faculty
        const classesQuery = query(
          collection(db, 'classes'),
          where('facultyId', '==', facultyId),
          where('isActive', '==', true)
        );

        const querySnapshot = await getDocs(classesQuery);
        const classes: ClassDocument[] = [];
        const yearSet = new Set<string>();

        querySnapshot.forEach((doc:any) => {
          const classData = doc.data() as ClassDocument;
          classes.push(classData);
          yearSet.add(classData.acadYear);
        });

        // Sort classes by academic year and grade level
        const sortedClasses = classes.sort((a, b) => {
          if (a.acadYear !== b.acadYear) {
            return b.acadYear.localeCompare(a.acadYear); // Most recent first
          }
          return a.gradeLevel - b.gradeLevel;
        });

        // Get available years (most recent first)
        const sortedYears = Array.from(yearSet).sort().reverse();

        setAvailableYears(sortedYears);
        setAvailableClasses(sortedClasses.map(cls => ({
          classId: cls.classId,
          className: cls.className,
          gradeLevel: cls.gradeLevel,
          acadYear: cls.acadYear
        })));
      } catch (err: any) {
        console.error('Error fetching filter options:', err);
        setError(err.message);
        setAvailableYears([]);
        setAvailableClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, [facultyId]);

  // Get classes filtered by academic year
  const getClassesByYear = (acadYear: string) => {
    return availableClasses.filter(cls => cls.acadYear === acadYear);
  };

  // Get current academic year
  const currentAcadYear = getCurrentAcademicYear();

  return {
    availableYears,
    availableClasses,
    getClassesByYear,
    currentAcadYear,
    loading,
    error,
  };
};