import { useState, useEffect } from 'react';
import { UserDocument } from '../../Interfaces/dataInterfaces';
import { getUsersByRole } from '../../Controller/AuthenticationController';

interface UserAnalyticsData {
  roleCounts: { students: number; faculty: number };
  monthlyRegistrations: Array<{ yearMonth: string; count: number }>;
  readingLevels: { beginner: number; intermediate: number; advanced: number };
  totalUsers: number;
  isLoading: boolean;
  errorMessage: string | null;
}

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
    const fetchAndAggregateUsers = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Get users filtered by role and academic year
        const { students, faculty } = await getUsersByRole(undefined, acadYear);

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
        console.log("Month Data: " + JSON.stringify(monthlyData))
        // Reading levels (students only)
        let beginnerCount = 0, intermediateCount = 0, advancedCount = 0;
        students.forEach((student: UserDocument) => {
          const level = student.studentData?.reading_Level;
          if (level === 'beginner') beginnerCount++;
          else if (level === 'intermediate') intermediateCount++;
          else if (level === 'advanced') advancedCount++;
        });

        setRoleCounts({ students: studentCount, faculty: facultyCount });
        setMonthlyRegistrations(monthlyData);
        setReadingLevels({ beginner: beginnerCount, intermediate: intermediateCount, advanced: advancedCount });
        setTotalUsers(studentCount + facultyCount);
      } catch (error: any) {
        setErrorMessage(error.message);
        console.error('[useUserAnalytics] Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndAggregateUsers();
  }, [acadYear]);

  return {
    roleCounts,
    monthlyRegistrations,
    readingLevels,
    totalUsers,
    isLoading,
    errorMessage,
  };
};