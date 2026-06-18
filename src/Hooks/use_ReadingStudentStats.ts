import { useEffect, useState } from 'react';
import {
  MiscuePercentage,
  OverAllStudentTopMiscue,
  AverageWPMandAccuracy,
  ClassReadingHealth,
} from '../Interfaces/miscue';
import { getForStudentsMiscueStats } from './use_ForStudentMiscueStats';
import { getFacultyClasses_Student } from './use_FacultyClasses_Students';
import { FilterOptions } from '../Interfaces/miscue';

/**
 * Hook to get classes for filter dropdown
 */
export const useFacultyClassesFilter = (facultyId: string | null) => {
  const [classes, setClasses] = useState<Array<{
    classId: string;
    className: string;
    gradeLevel: number;
    acadYear: string;
    totalStudents: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getFacultyClasses } = getFacultyClasses_Student;

  useEffect(() => {
    let alive = true;
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!facultyId) {
          if (alive) {
            setClasses([]);
            setLoading(false);
          }
          return;
        }

        const data = await getFacultyClasses(facultyId);

        // Transform to the format needed for the filter
        const formattedClasses = data.map(cls => ({
          classId: cls.classId,
          className: cls.className || `Grade ${cls.gradeLevel}`,
          gradeLevel: cls.gradeLevel,
          acadYear: cls.acadYear,
          totalStudents: cls.studentIds?.length || 0,
        }));

        if (alive) {
          setClasses(formattedClasses);
        }
      } catch (error: any) {
        if (alive) {
          setError('Error fetching classes: ' + error.message);
          setClasses([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchClasses();

    return () => {
      alive = false;
    };
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
  const { getOverallCommonMiscueType } = getForStudentsMiscueStats();

  useEffect(() => {
    const fetchMiscueData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!facultyId) {

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
  const { getOverallTopMiscueType } = getForStudentsMiscueStats();

  useEffect(() => {
    const fetchTopMiscue = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!facultyId) {

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
  const { getOverallAverageWPMandAccuracy } = getForStudentsMiscueStats();

  useEffect(() => {
    const fetchAverages = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!facultyId) {

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

