// hooks/useFacultyMiscueStats.ts
import { useState, useEffect } from 'react';
import { MiscueReportController } from '../Controller/DatabaseController';
import { MiscueType, MiscueCounts, MiscuePercentage, FacultyMiscueStats, StudentMiscueReport } from '../Types/miscue';


/**
 * Custom hook to calculate average reading accuracy and miscue percentages
 * for a faculty's class.
 * 
 * @returns {Object} - Contains loading state, error, and calculated statistics
 */
export const useFacultyMiscueStats = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FacultyMiscueStats>({
    miscuePercentages: [],
    averageAccuracy: 0,
    totalStudents: 0,
    totalMiscues: 0
  });

  useEffect(() => {
    const fetchMiscueStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get faculty's student IDs
        const facultyStudentIds = await getFacultyStudentIds();
        
        if (facultyStudentIds.length === 0) {
          setStats({
            miscuePercentages: [
              { type: 'No Data', percentage: 100, count: 0, color: '#CCCCCC' }
            ],
            averageAccuracy: 0,
            totalStudents: 0,
            totalMiscues: 0
          });
          setLoading(false);
          return;
        }

        // Initialize counters with proper type annotation
        let totalAccuracy: number = 0;
        let totalReports: number = 0;
        const miscueCounts: MiscueCounts = {
          substitution: 0,
          omission: 0,
          insertion: 0,
          repetition: 0
        };

        // Fetch and process data for each student
        for (const studentId of facultyStudentIds) {
          try {
            // Cast the reports to the correct type
            const reports = await MiscueReportController.getStudentReports(studentId) as unknown as StudentMiscueReport[];
            
            reports.forEach((report: StudentMiscueReport) => {
              totalAccuracy += report.accuracyRate || 0;
              totalReports++;
              
              // Count miscues from each report
              if (report.miscues && Array.isArray(report.miscues)) {
                report.miscues.forEach(miscue => {
                  const miscueType = miscue.type as MiscueType;
                  // Type-safe increment using switch or if-else
                  switch (miscueType) {
                    case 'substitution':
                      miscueCounts.substitution++;
                      break;
                    case 'omission':
                      miscueCounts.omission++;
                      break;
                    case 'insertion':
                      miscueCounts.insertion++;
                      break;
                    case 'repetition':
                      miscueCounts.repetition++;
                      break;
                    default:
                      // Handle unexpected miscue types
                      console.warn(`Unexpected miscue type: ${miscueType}`);
                      break;
                  }
                });
              }
            });
          } catch (studentError: any) {
            console.warn(`Error fetching reports for student ${studentId}:`, studentError);
          }
        }

        // Calculate average accuracy
        const averageAccuracy = totalReports > 0 ? totalAccuracy / totalReports : 0;

        // Calculate total miscues
        const totalMiscues = Object.values(miscueCounts).reduce((sum: number, count: number) => sum + count, 0);

        // Calculate percentages with proper typing
        const miscuePercentages: MiscuePercentage[] = totalMiscues > 0 ? [
          {
            type: 'Substitution',
            percentage: (miscueCounts.substitution / totalMiscues) * 100,
            count: miscueCounts.substitution,
            color: '#FF6B6B' // Red
          },
          {
            type: 'Omission',
            percentage: (miscueCounts.omission / totalMiscues) * 100,
            count: miscueCounts.omission,
            color: '#4ECDC4' // Teal
          },
          {
            type: 'Insertion',
            percentage: (miscueCounts.insertion / totalMiscues) * 100,
            count: miscueCounts.insertion,
            color: '#FFD166' // Yellow
          },
          {
            type: 'Repetition',
            percentage: (miscueCounts.repetition / totalMiscues) * 100,
            count: miscueCounts.repetition,
            color: '#06D6A0' // Green
          }
        ].filter((item: MiscuePercentage) => item.percentage > 0) : [];

        setStats({
          miscuePercentages,
          averageAccuracy: parseFloat(averageAccuracy.toFixed(2)),
          totalStudents: facultyStudentIds.length,
          totalMiscues
        });

      } catch (err: any) {
        console.error('Error fetching miscue stats:', err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMiscueStats();
  }, []);

  return { loading, error, stats };
};

// Alternative type-safe increment function using type guard
function incrementMiscueCount(counts: MiscueCounts, type: string): void {
  const miscueType = type as MiscueType;
  if (miscueType in counts) {
    counts[miscueType]++;
  }
}

// Helper function to get faculty's student IDs
const getFacultyStudentIds = async (): Promise<string[]> => {
  try {
    // Example implementation - replace with your actual logic
    // You might get faculty ID from auth context or props
    // const facultyId = auth().currentUser?.uid;
    
    // For now, let's create a dummy function that you can replace
    // This would typically query Firestore for students assigned to this faculty
    
    // Example Firestore query (uncomment and adjust as needed):
    /*
    const facultyId = 'current-faculty-id'; // Get this from your auth context
    const snapshot = await firestore()
      .collection('facultyStudents')
      .where('facultyId', '==', facultyId)
      .get();
    
    return snapshot.docs.map(doc => doc.data().studentId);
    */
    
    // For development/testing, return dummy data
    console.log('⚠️  getFacultyStudentIds needs to be implemented!');
    return [
      'student1-id',
      'student2-id',
      'student3-id',
      'student4-id'
    ];
  } catch (error: any) {
    console.error('Error getting faculty student IDs:', error);
    return [];
  }
};