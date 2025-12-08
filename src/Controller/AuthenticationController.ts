import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import {
  UserDocument,
  UserRole,
  MiscueReportDocument,
  ClassDocument,
} from '../Types/dataInterfaces';

// Helper to format date as "7 December 2025"
const formatDateToReadable = (date: any): string => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' }); // Full month name
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/* -------------------------------------------------------------
   CREATE USER ACCOUNT (FACULTY OR STUDENT)
------------------------------------------------------------- */
export const SignUpUserCredentials = async (
  email: string,
  password: string,
  userData: {
    role: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    sex: string;
    profileImageUrl?: string;
    gradeLevel?: number;
    dateOfBirth?: string;
    assignedGradeLevels?: number[];
  },
) => {
  try {
    // 1. Create user
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;

    // 2. Base user document
    const userDocument: UserDocument = {
      uid: user.uid,
      email,
      role: userData.role,
      firstName: userData.firstName,
      middleName: userData.middleName,
      lastName: userData.lastName,
      sex: userData.sex,
      profileImageUrl: userData.profileImageUrl,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    let readableDOB: string | undefined = undefined;
    if (userData.dateOfBirth) {
      readableDOB = formatDateToReadable(userData.dateOfBirth);
    }


    // 3. Role-specific data
    if (userData.role === 'student') {
      userDocument.studentData = {
        gradeLevel: userData.gradeLevel || 1,
        dateOfBirth: readableDOB  || ' ',
        classId: '',
        reading_Level: 'beginner',
      };
    } else if (userData.role === 'faculty') {
      userDocument.facultyData = {
        assignedGradeLevels: userData.assignedGradeLevels || [],
        assignedClassIds: [],
      };
    }

    // 4. Write user document
    await firestore().collection('users').doc(user.uid).set(userDocument);

    // 5. Auto-create class for faculty
    if (
      userData.role === 'faculty' &&
      userData.assignedGradeLevels &&
      userData.assignedGradeLevels.length > 0
    ) {
      const initialGrade = userData.assignedGradeLevels[0];
      await createClass(
        user.uid,
        userData.firstName,
        userData.lastName,
        initialGrade,
      );
    }

    return { success: true, user };
  } catch (error: any) {
    throw new Error(`Registration Failed: ${error.message}`);
  }
};

/* -------------------------------------------------------------
   CREATE CLASS
------------------------------------------------------------- */
export const createClass = async (
  facultyId: string,
  firstName: string,
  lastName: string,
  gradeLevel: number,
) => {
  try {
    const classId = `Class_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const classCode = generateClassCode();

    const classDocument: ClassDocument = {
      classId,
      classCode,
      className: `${firstName} ${lastName}'s Class`,
      gradeLevel,
      facultyId,
      studentIds: [],
      isActive: true,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    // Store class
    await firestore().collection('classes').doc(classId).set(classDocument);

    // Update faculty document
    await firestore().collection('users').doc(facultyId).update({
      'facultyData.assignedClassIds':
        firestore.FieldValue.arrayUnion(classId),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return classCode;
  } catch (error: any) {
    throw new Error(`Automatic Class Registration Failed: ${error.message}`);
  }
};

/* -------------------------------------------------------------
   CLASS CODE GENERATOR
------------------------------------------------------------- */
const generateClassCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/* -------------------------------------------------------------
   GET CLASS BY ID
------------------------------------------------------------- */
export const getClassById = async (classId: string) => {
  try {
    const docSnap = await firestore().collection('classes').doc(classId).get();

    if (!docSnap.exists) return null;

    return { id: docSnap.id, ...docSnap.data() } as ClassDocument & {
      id: string;
    };
  } catch (error: any) {
    throw new Error('Failed to get class: ' + error.message);
  }
};

/* -------------------------------------------------------------
   GET USER PROFILE
------------------------------------------------------------- */
export const getUserProfile = async (
  uid: string,
): Promise<UserDocument | null> => {
  try {
    const docSnap = await firestore().collection('users').doc(uid).get();
    return (docSnap.data() as UserDocument);
  } catch (error: any) {
    throw new Error(`Error getting user profile: ${error.message}`);
  }
};

/* -------------------------------------------------------------
   UPDATE USER PROFILE
------------------------------------------------------------- */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserDocument>,
) => {
  try {
    await firestore().collection('users').doc(uid).update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    throw new Error('Profile update failed: ' + error.message);
  }
};

/* -------------------------------------------------------------
   JOIN CLASS
------------------------------------------------------------- */
export const joinClass = async (studentId: string, joinClassCode: string) => {
  try {
    // Search class by code
    const classQuery = await firestore()
      .collection('classes')
      .where('classCode', '==', joinClassCode)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (classQuery.empty) throw new Error('Invalid or inactive class code');

    const classDoc = classQuery.docs[0];
    const classData = classDoc.data() as ClassDocument;
    const classId = classData.classId;

    // Already enrolled?
    if (classData.studentIds.includes(studentId))
      throw new Error('Already enrolled in this class');

    // Add student to class
    await firestore().collection('classes').doc(classId).update({
      studentIds: firestore.FieldValue.arrayUnion(studentId),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Update student's classId
    await firestore().collection('users').doc(studentId).update({
      'studentData.classId': classId,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, classId, className: classData.className };
  } catch (error: any) {
    throw new Error('Failed to join class: ' + error.message);
  }
};

/* -------------------------------------------------------------
   CREATE MISCUE REPORT
------------------------------------------------------------- */
export const createMiscueReport = async (
  reportData: Omit<MiscueReportDocument, 'reportId' | 'createdAt'>,
) => {
  try {
    const reportRef = firestore().collection('miscueReports').doc();
    const report: MiscueReportDocument = {
      ...reportData,
      reportId: reportRef.id,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    await reportRef.set(report);

    return { success: true, reportId: reportRef.id };
  } catch (error: any) {
    throw new Error('Failed to store Miscue Report');
  }
};

/* -------------------------------------------------------------
   GET FACULTY CLASSES
------------------------------------------------------------- */
export const getFacultyClasses = async (facultyId: string) => {
  try {
    const querySnap = await firestore()
      .collection('classes')
      .where('facultyId', '==', facultyId)
      .get();

    return querySnap.docs.map(doc => doc.data()) as ClassDocument[];
  } catch (error: any) {
    throw new Error('Failed to get Faculty classes: ' + error.message);
  }
};

/* -------------------------------------------------------------
   GET STUDENT CURRENT CLASS
------------------------------------------------------------- */
export const getStudentClass = async (studentId: string) => {
  try {
    const studentSnap = await firestore().collection('users').doc(studentId).get();
    const studentData = studentSnap.data() as UserDocument;

    if (!studentData?.studentData?.classId) return null;

    const classSnap = await firestore()
      .collection('classes')
      .doc(studentData.studentData.classId)
      .get();

    if (!classSnap.exists) return null;

    return classSnap.data() as ClassDocument;
  } catch (error: any) {
    throw new Error('Failed to get student class: ' + error.message);
  }
};

/* -------------------------------------------------------------
   LOGIN USER
------------------------------------------------------------- */
export const loginUser = async (email: string, password: string) => {
  try {
    // Sign in with email and password
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    return { 
      success: true, 
      user,
      uid: user.uid
    };
  } catch (error: any) {
    let errorMessage = 'Login failed. Please try again.';
    
    // Handle specific Firebase errors
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      default:
        errorMessage = error.message || 'Login failed. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};

/* -------------------------------------------------------------
   GET CURRENT USER
------------------------------------------------------------- */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/* -------------------------------------------------------------
   LOGOUT USER
------------------------------------------------------------- */
export const logoutUser = async () => {
  try {
    await auth().signOut();
    return { success: true };
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`);
  }
};
