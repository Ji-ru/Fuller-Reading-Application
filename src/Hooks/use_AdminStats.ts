import firestore from '@react-native-firebase/firestore';

export const useAdminStats = () => {
  const getTotals = async (academicYear?: string) => {
    try {
      // Fetch all classes for the year
      let classesRef = firestore().collection('classes');
      let querySnapshot;
      
      if (academicYear) {
        querySnapshot = await classesRef.where('acadYear', '==', academicYear).get();
      } else {
        querySnapshot = await classesRef.get();
      }
      
      const activeClasses = querySnapshot.docs.map(doc => doc.data());
      const activeStudentIds = new Set();
      const activeFacultyIds = new Set();
      
      activeClasses.forEach(cls => {
        if (cls.studentIds) {
          cls.studentIds.forEach((id: string) => activeStudentIds.add(id));
        }
        if (cls.facultyId) {
          activeFacultyIds.add(cls.facultyId);
        }
      });

      // Get Activity (Pagsusulit) Count
      const activitiesSnapshot = await firestore().collection('activities').get();
      const activityCount = activitiesSnapshot.size;

      // Special case: if no academic year, we might want to count everyone
      if (!academicYear) {
        const usersSnapshot = await firestore().collection('users').get();
        let studentCount = 0;
        let facultyCount = 0;

        usersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.role === 'student') studentCount++;
          else if (data.role === 'faculty') facultyCount++;
        });

        return {
          studentCount,
          facultyCount,
          activityCount,
          classCount: activeClasses.length,
        };
      }

      return {
        studentCount: activeStudentIds.size,
        facultyCount: activeFacultyIds.size,
        activityCount,
        classCount: activeClasses.length,
      };
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      return {
        studentCount: 0,
        facultyCount: 0,
        activityCount: 0,
        classCount: 0,
      };
    }
  };

  const getAllUsers = async () => {
    try {
      const snapshot = await firestore().collection('users').get();
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  };

  return { getTotals, getAllUsers };
};
