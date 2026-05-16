// Note: This file is a pure service/controller — not a React function component or hook.
// React hooks (useState, useEffect, useRef, useCallback, useMemo) are not used or allowed here.
// Only use hooks inside function components or custom hooks (functions starting with 'use').
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp,
  arrayUnion,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import {
  UserDocument,
  MiscueReportDocument,
  ClassDocument,
} from '../Interfaces/dataInterfaces';
import { getCurrentAcademicYear } from '../Utilities/acadYearUtils';

// ─── v22: Module-level singletons ─────────────────────────────────────────────
// getFirestore() and getAuth() must be called ONCE at module level.
// This file previously called getFirestore() 12 times and getAuth() 7 times
// across different functions — each call triggers a deprecation warning in v22.
const db = getFirestore();
const auth = getAuth();

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatDateToReadable = (date: Date): string => {
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
    classCode?: string;
  },
) => {
  try {
    // 1. Create user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
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
      createdAt: serverTimestamp(),
    };

    let readableDOB = '';
    if (userData.dateOfBirth) {
      readableDOB = formatDateToReadable(new Date(userData.dateOfBirth));
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

    // FIX: was doc(collection(db, 'users'), user.uid) — deprecated in v22
    // Correct pattern for a known ID: doc(db, 'collectionName', 'docId')
    await setDoc(doc(db, 'users', user.uid), userDocument);

    // 5. Auto-create class for faculty
    if (
      userData.role === 'faculty' &&
      userData.assignedGradeLevels &&
      userData.assignedGradeLevels.length > 0
    ) {
      await createClass(
        user.uid,
        userData.firstName,
        userData.lastName,
        userData.assignedGradeLevels[0],
      );
    }

    // 6. Auto-enroll student
    if (userData.role === 'student' && userData.classCode) {
      try {
        await joinClass(user.uid, userData.classCode);
      } catch (e) {
        console.log('Auto-enrollment failed (invalid code):', e);
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
      createdAt: serverTimestamp(),
    };

    // FIX: was doc(collection(db, 'classes'), classId) — deprecated in v22
    await setDoc(doc(db, 'classes', classId), classDocument);

    // FIX: was doc(collection(db, 'users'), facultyId) — deprecated in v22
    await updateDoc(doc(db, 'users', facultyId), {
      'facultyData.assignedClassIds': arrayUnion(classId),
      'facultyData.assignedGradeLevels': arrayUnion(gradeLevel),
      updatedAt: serverTimestamp(),
    });

    return { classId, classCode, acadYear: classDocument.acadYear };
  } catch (error: any) {
    throw new Error(`Class Registration Failed: ${error.message}`);
  }
};

/* -------------------------------------------------------------
   CLASS CODE GENERATOR
------------------------------------------------------------- */
const generateClassCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/* -------------------------------------------------------------
   CREATE CUSTOM CLASS
------------------------------------------------------------- */
export const createCustomClass = async (
  facultyId: string,
  className: string,
  gradeLevel: number,
): Promise<string> => {
  try {
    const classId = `Class_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const classCode = generateClassCode();

    const classDocument: ClassDocument = {
      classId,
      classCode,
      className,
      gradeLevel,
      acadYear: getCurrentAcademicYear(),
      facultyId,
      studentIds: [],
      isActive: true,
      createdAt: serverTimestamp(),
    };

    // FIX: was doc(collection(db, 'classes'), classId) — deprecated in v22
    await setDoc(doc(db, 'classes', classId), classDocument);

    // FIX: was doc(collection(db, 'users'), facultyId) — deprecated in v22
    await updateDoc(doc(db, 'users', facultyId), {
      'facultyData.assignedClassIds': arrayUnion(classId),
      'facultyData.assignedGradeLevels': arrayUnion(gradeLevel),
      updatedAt: serverTimestamp(),
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
    const querySnapshot = await getDocs(
      query(
        collection(db, 'classes'),
        where('classCode', '==', classCode),
        where('isActive', '==', true),
        limit(1),
      ),
    );

    if (querySnapshot.empty) return null;

    const snap = querySnapshot.docs[0];
    return { id: snap.id, ...snap.data() } as ClassDocument & { id: string };
  } catch (error: any) {
    throw new Error('Failed to get class: ' + error.message);
  }
};

/* -------------------------------------------------------------
   GET ALL ACTIVE CLASSES
------------------------------------------------------------- */
export const getAllActiveClasses = async () => {
  try {
    // FIX: was fetching ALL classes and filtering in JS — push the filter to Firestore
    const querySnapshot = await getDocs(
      query(collection(db, 'classes'), where('isActive', '==', true)),
    );

    return querySnapshot.docs.map(
      (snap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: snap.id,
        ...snap.data(),
      }),
    ) as (ClassDocument & { id: string })[];
  } catch (error: any) {
    throw new Error('Failed to fetch classes: ' + error.message);
  }
};

/* -------------------------------------------------------------
   VERIFY FACULTY ACCESS CODE
------------------------------------------------------------- */
export const verifyFacultyAccessCode = (code: string): boolean => {
  // TODO: ⚠️ SECURITY — move SECRET_KEY to a secure environment config
  //       (e.g. react-native-config or Firebase Remote Config).
  //       Hardcoding secrets in source exposes them in version control.
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
    // FIX: was doc(collection(db, 'users'), uid) — deprecated in v22
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (!docSnap.exists()) return null;
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
    // FIX: was doc(collection(db, 'users'), uid) — deprecated in v22
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
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
    const querySnapshot = await getDocs(
      query(
        collection(db, 'classes'),
        where('classCode', '==', joinClassCode),
        where('isActive', '==', true),
        limit(1),
      ),
    );

    if (querySnapshot.empty) throw new Error('Invalid or inactive class code');

    const classDoc = querySnapshot.docs[0];
    const classData = classDoc.data() as ClassDocument;
    const classId = classData.classId;

    if (classData.studentIds.includes(studentId))
      throw new Error('Already enrolled in this class');

    // FIX: was doc(collection(db, 'classes'), classId) — deprecated in v22
    await updateDoc(doc(db, 'classes', classId), {
      studentIds: arrayUnion(studentId),
      updatedAt: serverTimestamp(),
    });

    // FIX: was doc(collection(db, 'users'), studentId) — deprecated in v22
    await updateDoc(doc(db, 'users', studentId), {
      'studentData.classCode': joinClassCode,
      updatedAt: serverTimestamp(),
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
    // auto-ID doc — doc(collection(...)) with no ID is the correct v22 pattern here
    const reportRef = doc(collection(db, 'miscueReports'));
    const report: MiscueReportDocument = {
      ...reportData,
      reportId: reportRef.id,
      timestamp: serverTimestamp(),
    };

    await setDoc(reportRef, report);
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
    // FIX: was doc(collection(db, 'users'), studentId) — deprecated in v22
    const studentSnap = await getDoc(doc(db, 'users', studentId));
    if (!studentSnap.exists()) return null;

    const studentData = studentSnap.data() as UserDocument;
    const classCode = studentData?.studentData?.classCode;
    if (!classCode) return null;

    const querySnapshot = await getDocs(
      query(
        collection(db, 'classes'),
        where('classCode', '==', classCode),
        where('isActive', '==', true),
        limit(1),
      ),
    );

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

    // TODO: ⚠️ SECURITY — move ADMIN_EMAIL and ADMIN_PASS to a secure
    //       environment config (e.g. react-native-config or Firebase Remote Config).
    //       Hardcoding credentials in source exposes them in version control.
    const ADMIN_EMAIL = 'admin@marungko.com';
    const ADMIN_PASS = '12345678';

    // ── Admin login path ──────────────────────────────────────
    if (
      trimmedEmail.toLowerCase() === ADMIN_EMAIL &&
      trimmedPass === ADMIN_PASS
    ) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          trimmedEmail,
          trimmedPass,
        );
        const user = userCredential.user;

        // FIX: was doc(collection(db, 'users'), user.uid) — deprecated in v22
        const adminDoc = await getDoc(doc(db, 'users', user.uid));
        if (!adminDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: trimmedEmail,
            role: 'admin',
            firstName: 'System',
            lastName: 'Administrator',
            sex: 'N/A',
            createdAt: serverTimestamp(),
          });
        } else if (
          (adminDoc.data() as UserDocument | undefined)?.role !== 'admin'
        ) {
          await updateDoc(doc(db, 'users', user.uid), {
            role: 'admin',
            updatedAt: serverTimestamp(),
          });
        }

        return { success: true, user, uid: user.uid };
      } catch (e: any) {
        // Admin account doesn't exist yet — create it
        if (
          e.code === 'auth/user-not-found' ||
          e.code === 'user-not-found' ||
          e.code === 'auth/invalid-credential'
        ) {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            trimmedEmail,
            trimmedPass,
          );
          const user = userCredential.user;

          // FIX: was doc(collection(db, 'users'), user.uid) — deprecated in v22
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: trimmedEmail,
            role: 'admin',
            firstName: 'Admin',
            lastName: '',
            sex: 'N/A',
            createdAt: serverTimestamp(),
          });

          return { success: true, user, uid: user.uid };
        }
        throw e;
      }
    }

    // ── Regular login path ────────────────────────────────────
    const userCredential = await signInWithEmailAndPassword(
      auth,
      trimmedEmail,
      trimmedPass,
    );
    return {
      success: true,
      user: userCredential.user,
      uid: userCredential.user.uid,
    };
  } catch (error: any) {
    const code = error.code;
    let errorMessage = 'Login failed. Please try again.';

    if (code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
    else if (code === 'auth/user-not-found' || code === 'user-not-found')
      errorMessage = 'No account found with this email.';
    else if (code === 'auth/wrong-password' || code === 'wrong-password')
      errorMessage = 'Incorrect password. Please try again.';
    else if (code === 'auth/invalid-credential')
      errorMessage = 'Invalid email or password.';
    else if (code === 'auth/too-many-requests')
      errorMessage = 'Too many failed attempts. Please try again later.';
    else if (code === 'auth/user-disabled')
      errorMessage = 'This account has been disabled.';
    else errorMessage = error.message || 'Login failed. Please try again.';

    throw new Error(errorMessage);
  }
};

/* -------------------------------------------------------------
   GET CURRENT USER
------------------------------------------------------------- */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/* -------------------------------------------------------------
   LOGOUT USER
------------------------------------------------------------- */
export const logoutUser = async () => {
  try {
    await signOut(auth);
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
    if (!trimmedEmail)
      throw new Error('Please enter your email address first.');

    await sendPasswordResetEmail(auth, trimmedEmail);
    return { success: true };
  } catch (error: any) {
    const code = error.code;
    let errorMessage = 'Failed to send reset email.';

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
    // FIX: was doc(collection(db, 'users'), uid) — deprecated in v22
    await deleteDoc(doc(db, 'users', uid));
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to delete user profile: ' + error.message);
  }
};
