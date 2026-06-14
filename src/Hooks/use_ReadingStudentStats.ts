import { useCallback, useEffect, useState } from 'react';
import { MiscueReportController } from '../Controller/MiscueReportController';
import {
  MiscuePercentage,
  StudentStats,
  ProgressData,
  OverAllStudentTopMiscue,
  AverageWPMandAccuracy,
  ClassReadingHealth,
} from '../Interfaces/miscue';
import { useStudentMiscueStats } from './use_ForStudentMiscueStats';
import { useClassReadingHealth } from './use_ClassReadingHealth';
import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { FilterOptions } from '../Interfaces/miscue';

/**
 * Gets the top miscued passages and words of each student
 *
 * @param studentId - student's ID to get their progress
 * @returns - top reading miscued, attempts, and accuracy
 */
export function useStudentReadingStats(studentId: string) {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getStudentReadingStats, getStudentProgressOverTime } =
    MiscueReportController;

  const fetchStats = async () => {
    try {
      setLoading(true);
      const statsResult = await getStudentReadingStats(studentId);
      const progressResult = await getStudentProgressOverTime(studentId);

      setStats(statsResult);
      setProgress(progressResult);
    } catch (err: any) {
      setError(err.message || 'Failed to load reading statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [studentId]);

  return {
    stats,
    progress,
    loading,
    error,
    refresh: fetchStats,
  };
}


/**
 * Hook to get classes for filter dropdown
 */
export const useFacultyClassesFilter = (facultyId: string | null) => {
  const [classes, setClasses] = useState<Array<{
    classId: string;
    className: string;
    gradeLevel: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getFacultyClasses } = getFacultyClasses_Student;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!facultyId) {
          setClasses([]);
          setLoading(false);
          return;
        }

        const data = await getFacultyClasses(facultyId);
        
        // Transform to the format needed for the filter
        const formattedClasses = data.map(cls => ({
          classId: cls.classId,
           className: cls.className || (cls.gradeLevel === 0 ? '' : `Baitang ${cls.gradeLevel}`),
          gradeLevel: cls.gradeLevel,
        }));
        
        setClasses(formattedClasses);
      } catch (error: any) {
        setError('Error fetching classes: ' + error.message);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [facultyId]);
  
  return { classes, loading, error };
};

/**
 * Gets the Overall Common Miscue Type for all the students in a class
 *
 * @param facultyId - an identifier of the faculty to get the its class and students
 * @returns - percentage of each miscued type
 */
export const useMiscueAnalystics = (
  facultyId: string | null,
  filter?: FilterOptions
) => {
  const [miscueData, setMiscueData] = useState<MiscuePercentage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getOverallCommonMiscueType } = useStudentMiscueStats();

  useEffect(() => {
    const fetchMiscueData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!facultyId) {
          console.log('No facultyId provided for miscue analytics');
          setMiscueData([]);
          setLoading(false);
          return;
        }

        const data = await getOverallCommonMiscueType(facultyId, filter);
        setMiscueData(data);
      } catch (error: any) {
        setError('Error fetching miscue analytics: ' + error.message);
        setMiscueData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMiscueData();
  }, [facultyId, filter]);
  return { miscueData, loading, error };
};

/**
 * Gets the top miscued passages and words combining all student
 *
 * @param facultyId - an identifier of the faculty to get its class and students
 * @returns - top miscue type and common miscue words with error examples
 */
export const useTopMiscueIdentifier = (
  facultyId: string | null,
  filter?: FilterOptions
) => {
  const [topMiscue, setTopMiscue] = useState<OverAllStudentTopMiscue[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getOverallTopMiscueType } = useStudentMiscueStats();

  useEffect(() => {
    const fetchTopMiscue = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!facultyId) {
          console.log('No facultyId provided for top miscue identifier');
          setTopMiscue(null);
          setLoading(false);
          return;
        }

        const data = await getOverallTopMiscueType(facultyId, filter);
        setTopMiscue(data);
      } catch (error: any) {
        setTopMiscue([]);
        setError('Failed to fetch top miscue data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMiscue();
  }, [facultyId, filter]);
  return { topMiscue, loading, error };
};

/**
 * Gets the overall average WPM and Accuracy for all students in a faculty
 *
 * @param facultyId - an identifier of the faculty to get its class and students
 * @returns - average accuracy, average WPM, total reports, and total students
 */
export const useOverallAverageWPMandAccuracy = (
  facultyId: string | null,
  filter?: FilterOptions
) => {
  const [averages, setAverages] = useState<AverageWPMandAccuracy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getOverallAverageWPMandAccuracy } = useStudentMiscueStats();

  useEffect(() => {
    const fetchAverages = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!facultyId) {
          console.log('No facultyId provided for overall averages');
          setAverages(null);
          setLoading(false);
          return;
        }

        const data = await getOverallAverageWPMandAccuracy(facultyId, filter);
        setAverages(data);
      } catch (error: any) {
        setError('Failed to fetch overall averages: ' + error.message);
        setAverages(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAverages();
  }, [facultyId, filter]);

  return { averages, loading, error };
};

export const useFetchClassReadingHealth = (facultyId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [classHealthData, setClassHealthData] = useState<ClassReadingHealth[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const { getClassReadingHealth } = useClassReadingHealth();

  useEffect(() => {
    const fetchClassReadingHealth = async () => {
      if (!facultyId) {
        setError('No faculty ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getClassReadingHealth(facultyId);
        setClassHealthData(data);
      } catch (err: any) {
        console.error('Error fetching class reading health:', err);
        setError(err.message || 'Failed to fetch reading health data');
        setClassHealthData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassReadingHealth();
  }, [facultyId]);

  return {
    loading,
    classHealthData,
    error,
  };
};
