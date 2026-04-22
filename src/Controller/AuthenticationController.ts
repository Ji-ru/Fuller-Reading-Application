// Note: This file is a pure service/controller—not a React function component or hook.
// React hooks (useState, useEffect, useRef, useCallback, useMemo) are not used or allowed here.
// Only use hooks inside function components or custom hooks (functions starting with 'use').
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  UserDocument,
  MiscueReportDocument,
  ClassDocument,
} from '../Interfaces/dataInterfaces';
import { getCurrentAcademicYear } from '../Utilities/acadYearUtils';

// Helper to format date as "7 December 2025"
const formatDateToReadable = (date: any): string => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
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
    classCode?: string; // Optional enrollment
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
    
    let readableDOB: string = '';
    if (userData.dateOfBirth) {
      const dob = new Date(userData.dateOfBirth); 
      readableDOB = formatDateToReadable(dob);
    }
    
    // 3. Role-specific data
    if (userData.role === 'student') {
      userDocument.studentData = {
        gradeLevel: userData.gradeLevel || 1,
        dateOfBirth: readableDOB,
        classCode: userData.classCode || '',
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
      const initialAssignedGrade = userData.assignedGradeLevels[0];
      await createClass(
        user.uid,
        userData.firstName,
        userData.lastName,
        initialAssignedGrade,
      );
    }

    // 6. Automatic Enrollment for Students
    if (userData.role === 'student' && userData.classCode) {
      try {
        await joinClass(user.uid, userData.classCode);
      } catch (e) {
        console.log("Auto-enrollment failed (invalid code):", e);
      }
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
      acadYear: getCurrentAcademicYear(),
      facultyId,
      studentIds: [],
      isActive: true,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    // Store class
    await firestore().collection('classes').doc(classId).set(classDocument);

    // Update faculty document
    await firestore().collection('users').doc(facultyId).update({
      'facultyData.assignedClassIds': firestore.FieldValue.arrayUnion(classId),
      'facultyData.assignedGradeLevels': firestore.FieldValue.arrayUnion(gradeLevel),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return { classId, classCode, acadYear: classDocument.acadYear };
  } catch (error: any) {
    throw new Error(`Class Registration Failed: ${error.message}`);
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

export const createCustomClass = async (
  facultyId: string,
  className: string,
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
      className: className,
      gradeLevel,
      acadYear: getCurrentAcademicYear(),
      facultyId,
      studentIds: [],
      isActive: true,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    // Store class
    await firestore().collection('classes').doc(classId).set(classDocument);

    // Update faculty document
    await firestore().collection('users').doc(facultyId).update({
      'facultyData.assignedClassIds': firestore.FieldValue.arrayUnion(classId),
      'facultyData.assignedGradeLevels': firestore.FieldValue.arrayUnion(gradeLevel),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    return classCode;
  } catch (error: any) {
    throw new Error(`Custom Class Registration Failed: ${error.message}`);
  }
};

/* -------------------------------------------------------------
   GET CLASS BY CODE
------------------------------------------------------------- */
export const getClassByCode = async (classCode: string) => {
  try {
    const querySnapshot = await firestore()
      .collection('classes')
      .where('classCode', '==', classCode)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return { 
      id: doc.id, 
      ...doc.data() 
    } as ClassDocument & { id: string };
  } catch (error: any) {
    throw new Error('Failed to get class: ' + error.message);
  }
};

/* -------------------------------------------------------------
   GET ALL ACTIVE CLASSES
------------------------------------------------------------- */
export const getAllActiveClasses = async () => {
  try {
    const querySnapshot = await firestore().collection('classes').get();
    
    const allClasses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (ClassDocument & { id: string })[];

    return allClasses.filter(cls => cls.isActive !== false);
  } catch (error: any) {
    throw new Error('Failed to fetch classes: ' + error.message);
  }
};

/* -------------------------------------------------------------
   VERIFY FACULTY ACCESS CODE
------------------------------------------------------------- */
export const verifyFacultyAccessCode = (code: string) => {
  const SECRET_KEY = '12345678';
  return code.trim().toUpperCase() === SECRET_KEY;
};

/* -------------------------------------------------------------
   GET USER PROFILE
------------------------------------------------------------- */
export const getUserProfile = async (
  uid: string,
): Promise<UserDocument | null> => {
  try {
    const docSnap = await firestore().collection('users').doc(uid).get();
    
    if (!docSnap.exists) {
      return null;
    }
    
    return docSnap.data() as UserDocument;
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
    const querySnapshot = await firestore()
      .collection('classes')
      .where('classCode', '==', joinClassCode)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (querySnapshot.empty) throw new Error('Invalid or inactive class code');

    const classDoc = querySnapshot.docs[0];
    const classData = classDoc.data() as ClassDocument;
    const classId = classData.classId;

    if (classData.studentIds.includes(studentId))
      throw new Error('Already enrolled in this class');

    await firestore().collection('classes').doc(classId).update({
      studentIds: firestore.FieldValue.arrayUnion(studentId),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    await firestore().collection('users').doc(studentId).update({
      'studentData.classCode': joinClassCode,
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
  reportData: Omit<MiscueReportDocument, 'reportId' | 'timestamp'>,
) => {
  try {
    const reportRef = firestore().collection('miscueReports').doc();
    const report: MiscueReportDocument = {
      ...reportData,
      reportId: reportRef.id,
      timestamp: firestore.FieldValue.serverTimestamp(),
    };

    await reportRef.set(report);
    return { success: true, reportId: reportRef.id };
  } catch (error: any) {
    throw new Error('Failed to store Miscue Report');
  }
};

/* -------------------------------------------------------------
   GET STUDENT CURRENT CLASS
------------------------------------------------------------- */
export const getStudentClass = async (studentId: string) => {
  try {
    const studentSnap = await firestore().collection('users').doc(studentId).get();
    if (!studentSnap.exists) return null;
    
    const studentData = studentSnap.data() as UserDocument;
    const classCode = studentData?.studentData?.classCode;
    
    if (!classCode) return null;

    const querySnapshot = await firestore()
      .collection('classes')
      .where('classCode', '==', classCode)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (querySnapshot.empty) return null;

    return querySnapshot.docs[0].data() as ClassDocument;
  } catch (error: any) {
    throw new Error('Failed to get student class: ' + error.message);
  }
};

/* -------------------------------------------------------------
   LOGIN USER
------------------------------------------------------------- */
export const loginUser = async (email: string, password: string) => {
  try {
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();
    const ADMIN_EMAIL = 'admin@marungko.com';
    const ADMIN_PASS = '12345678';
    
    if (trimmedEmail.toLowerCase() === ADMIN_EMAIL && trimmedPass === ADMIN_PASS) {
      try {
        const userCredential = await auth().signInWithEmailAndPassword(trimmedEmail, trimmedPass);
        const user = userCredential.user;
        
        // Ensure Firestore profile exists and has admin role
        const adminDoc = await firestore().collection('users').doc(user.uid).get();
        if (!adminDoc.exists) {
          await firestore().collection('users').doc(user.uid).set({
            uid: user.uid,
            email: trimmedEmail,
            role: 'admin',
            firstName: 'System',
            lastName: 'Administrator',
            sex: 'N/A',
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        } else if (adminDoc.data()?.role !== 'admin') {
          await firestore().collection('users').doc(user.uid).update({
            role: 'admin',
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
        }
        
        return { success: true, user, uid: user.uid };
      } catch (e: any) {
        // Handle both old and new Firebase error codes for missing users
        if (e.code === 'auth/user-not-found' || e.code === 'user-not-found' || e.code === 'auth/invalid-credential') {
          const userCredential = await auth().createUserWithEmailAndPassword(trimmedEmail, trimmedPass);
          const user = userCredential.user;
          
          await firestore().collection('users').doc(user.uid).set({
            uid: user.uid,
            email: trimmedEmail,
            role: 'admin',
            firstName: 'Admin',
            lastName: '',
            sex: 'N/A',
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
          
          return { success: true, user, uid: user.uid };
        }
        throw e;
      }
    }

    const userCredential = await auth().signInWithEmailAndPassword(trimmedEmail, trimmedPass);
    return { 
      success: true, 
      user: userCredential.user,
      uid: userCredential.user.uid
    };
  } catch (error: any) {
    let errorMessage = 'Login failed. Please try again.';
    const code = error.code;
    
    if (code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
    else if (code === 'auth/user-not-found' || code === 'user-not-found') errorMessage = 'No account found with this email.';
    else if (code === 'auth/wrong-password' || code === 'wrong-password') errorMessage = 'Incorrect password. Please try again.';
    else if (code === 'auth/invalid-credential') errorMessage = 'Invalid email or password.';
    else if (code === 'auth/too-many-requests') errorMessage = 'Too many failed attempts. Please try again later.';
    else if (code === 'auth/user-disabled') errorMessage = 'This account has been disabled.';
    else errorMessage = error.message || 'Login failed. Please try again.';
    
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

/* -------------------------------------------------------------
   SEND PASSWORD RESET EMAIL
------------------------------------------------------------- */
export const sendPasswordReset = async (email: string) => {
  try {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error('Please enter your email address first.');
    }
    await auth().sendPasswordResetEmail(trimmedEmail);
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Failed to send reset email.';
    const code = error.code;

    if (code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
    else if (code === 'auth/user-not-found' || code === 'user-not-found')
      errorMessage = 'No account found with this email.';
    else errorMessage = error.message || 'Failed to send reset email.';

    throw new Error(errorMessage);
  }
};

/* -------------------------------------------------------------
   DELETE USER DOCUMENT (ADMIN ONLY)
------------------------------------------------------------- */
export const deleteUserDocument = async (uid: string) => {
  try {
    await firestore().collection('users').doc(uid).delete();
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to delete user profile: ' + error.message);
  }
};
