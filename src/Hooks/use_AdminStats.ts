import { getFirestore, collection, getDocs, query, where } from '@react-native-firebase/firestore';
import { ClassDocument } from '../Interfaces/dataInterfaces';

const db = getFirestore();

export const useAdminStats = () => {
  const getTotals = async (academicYear?: string) => {
    try {
      let classesRef = collection(db, 'classes');
      let querySnapshot;
      
      if (academicYear) {
        querySnapshot = await getDocs(query(classesRef, where('acadYear', '==', academicYear)));
      } else {
        querySnapshot = await getDocs(classesRef);
      }
      
      const activeClasses = querySnapshot.docs.map((doc: any) => doc.data()) as ClassDocument[];
      const activeStudentIds = new Set<string>();
      const activeFacultyIds = new Set<string>();
      
      activeClasses.forEach(cls => {
        if (cls.studentIds) {
          cls.studentIds.forEach((id: string) => activeStudentIds.add(id));
        }
        if (cls.facultyId) {
          activeFacultyIds.add(cls.facultyId);
        }
      });

      // Get Activity (Pagsusulit) Count
      const activitiesSnapshot = await getDocs(collection(db, 'activities'));
      const activityCount = activitiesSnapshot.size;

      // Special case: if no academic year, count all users directly
      if (!academicYear) {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        let studentCount = 0;
        let facultyCount = 0;

        usersSnapshot.forEach((doc: any) => {
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
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map((doc: any) => ({
        uid: doc.id,
        ...doc.data(),
      }));
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      return [];
    }
  };

  const getAllClasses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'classes'));
      return snapshot.docs.map((doc: any) => ({
        classId: doc.id,
        ...doc.data(),
      })) as ClassDocument[];
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      return [];
    }
  };

  return { getTotals, getAllUsers, getAllClasses };
};
