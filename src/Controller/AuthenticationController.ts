// Note: This file is a pure service/controller—not a React function component or hook.
// React hooks (useState, useEffect, useRef, useCallback, useMemo) are not used or allowed here.
// Only use hooks inside function components or custom hooks (functions starting with 'use').
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from '@react-native-firebase/firestore';
import { UserDocument, ClassDocument, UserRole } from '../Interfaces/dataInterfaces';
import { getCurrentAcademicYear } from '../Utilities/acadYearUtils';

// Initialize Firebase instances once
const auth = getAuth();
const db = getFirestore();

/* -------------------------------------------------------------
   CREATE USER ACCOUNT USING REGULAR
------------------------------------------------------------- */
export const SignUpUserCredentials = async (
  email: string,
  password: string,
  userData: {
    role: UserRole;
    firstName: string;
    middleName?: string;
    lastName: string;
    sex: string;
    profileImageUrl?: string;
    gradeLevel?: number;
    dateOfBirth?: string;
    assignedGradeLevels?: number[];
    classCode?: string;
    parentConsent?: {
      confirmed: boolean;
    };
  },
) => {
  try {
    // 1. Create user - MODULAR API
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    await createUserDocument(user.uid, email, userData);

    return { success: true, user };
  } catch (error: any) {
    throw new Error(`Registration Failed: ${error.message}`);
  }
};

// Shared: creates the Firestore user document and handles faculty class creation
const createUserDocument = async (
  uid: string,
  email: string,
  userData: {
    role: UserRole;
    firstName: string;
    middleName?: string;
    lastName: string;
    sex: string;
    profileImageUrl?: string;
    gradeLevel?: number;
    dateOfBirth?: string;
    assignedGradeLevels?: number[];
    classCode?: string;
    parentConsent?: {
      confirmed: boolean;
    };
  },
) => {
  const userDocument: UserDocument = {
    uid,
    email,
    role: userData.role,
    firstName: userData.firstName,
    middleName: userData.middleName || '',
    lastName: userData.lastName,
    sex: userData.sex,
    profileImageUrl: userData.profileImageUrl || '',
    createdAt: serverTimestamp(),
  };

  if (userData.role === 'student') {
    userDocument.studentData = {
      gradeLevel: userData.gradeLevel ?? 1,
      dateOfBirth: userData.dateOfBirth || '',
      classCode: userData.classCode || '',
      reading_Level: 'beginner',
    };

    // Auto-enroll student in class if classCode provided
    if (userData.classCode) {
      try {
        const classData = await getClassByCode(userData.classCode.toUpperCase());
        if (classData && classData.isActive) {
          await updateDoc(doc(db, 'users', uid), {
            'studentData.classCode': userData.classCode,
            updatedAt: serverTimestamp(),
          });

          await updateDoc(doc(db, 'classes', classData.classId), {
            studentIds: arrayUnion(uid),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.error('Auto-enroll error:', e);
      }
    }
  } else if (userData.role === 'faculty') {
    userDocument.facultyData = {
      assignedGradeLevels: userData.assignedGradeLevels || [],
      assignedClassIds: [],
    };

    // Auto-create class for faculty
    if (userData.assignedGradeLevels && userData.assignedGradeLevels.length > 0) {
      const initialAssignedGrade = userData.assignedGradeLevels[0];
      await createClass(
        uid,
        userData.firstName,
        userData.lastName,
        initialAssignedGrade,
      );
    }
  }

  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, userDocument);
};

/* -------------------------------------------------------------
   UPDATE USER PROFILE
------------------------------------------------------------- */
export const updateUserProfile = async (
  uid: string,
  data: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    sex?: string;
    email?: string;
    studentData?: {
      gradeLevel?: number;
      dateOfBirth?: string;
      classCode?: string;
      reading_Level?: 'beginner' | 'intermediate' | 'advanced';
    };
<<<<<<< HEAD
facultyData?: {
       assignedGradeLevels?: number[];
       assignedClassIds?: string[];
     };
=======
  facultyData?: {
     assignedGradeLevels?: number[];
     assignedClassIds?: string[];
     dateOfBirth?: string;
   };
>>>>>>> lugh/Marungko-Homefix-v4
  },
) => {
  const userRef = doc(db, 'users', uid);
  const update: Record<string, any> = { updatedAt: serverTimestamp() };

  // Top-level base fields
  if (data.firstName   !== undefined) update.firstName   = data.firstName;
  if (data.middleName  !== undefined) update.middleName  = data.middleName;
  if (data.lastName    !== undefined) update.lastName    = data.lastName;
  if (data.sex         !== undefined) update.sex         = data.sex;
  if (data.email       !== undefined) update.email       = data.email;

  // Student-specific nested fields
  if (data.studentData) {
    const sd = data.studentData;
    if (sd.gradeLevel !== undefined)     update['studentData.gradeLevel']     = sd.gradeLevel;
    if (sd.dateOfBirth !== undefined)    update['studentData.dateOfBirth']    = sd.dateOfBirth;
    if (sd.classCode !== undefined)      update['studentData.classCode']      = sd.classCode;
    if (sd.reading_Level !== undefined)  update['studentData.reading_Level']  = sd.reading_Level;
  }

<<<<<<< HEAD
// Faculty-specific nested fields
    if (data.facultyData) {
      const fd = data.facultyData;
      const assignedGradeLevels = fd.assignedGradeLevels;
      const assignedClassIds = fd.assignedClassIds;
      if (assignedGradeLevels !== undefined) {
        update['facultyData.assignedGradeLevels'] = assignedGradeLevels;
      }
      if (assignedClassIds !== undefined) {
        update['facultyData.assignedClassIds'] = assignedClassIds;
      }
    }
=======
  // Faculty-specific nested fields
  if (data.facultyData) {
    const fd = data.facultyData;
    if (fd.assignedGradeLevels !== undefined) update['facultyData.assignedGradeLevels'] = fd.assignedGradeLevels;
    if (fd.assignedClassIds !== undefined)    update['facultyData.assignedClassIds']    = fd.assignedClassIds;
    if (fd.dateOfBirth !== undefined)         update['facultyData.dateOfBirth']         = fd.dateOfBirth;
  }
>>>>>>> lugh/Marungko-Homefix-v4

   await updateDoc(userRef, update);
};

/* -------------------------------------------------------------
   DELETE USER DOCUMENT
------------------------------------------------------------- */
export const deleteUserDocument = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
};

/* -------------------------------------------------------------
   UPDATE USER PASSWORD  (admin-initiated – no re-auth required
   because the admin is updating THEIR OWN doc; use with caution)
------------------------------------------------------------- */
export const updateUserPassword = async (
  uid: string,
  newPassword: string,
) => {
  try {
    const { sendPasswordResetEmail } = await import('@react-native-firebase/auth');
    // Fetch user email from Firestore to send a reset link
    const { getFirestore, doc, getDoc } = await import('@react-native-firebase/firestore');
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) throw new Error('User not found.');
    const snapData = snap.data();
    if (!snapData) throw new Error('User data not found.');
    const data = snapData;
    const email = data.email as string;
     if (!email) throw new Error('User has no email on record.');
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset link sent to user email.' };
  } catch (error: any) {
    throw new Error('Password reset failed: ' + error.message);
  }
};


/* -------------------------------------------------------------
<<<<<<< HEAD
   CREATE CLASS
=======
    CREATE CLASS
>>>>>>> lugh/Marungko-Homefix-v4
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

    // Store class - MODULAR API
    const classRef = doc(db, 'classes', classId);
    await setDoc(classRef, classDocument);

    // Update faculty document - MODULAR API
    const facultyRef = doc(db, 'users', facultyId);
    await updateDoc(facultyRef, {
      'facultyData.assignedClassIds': arrayUnion(classId),
      'facultyData.assignedGradeLevels': arrayUnion(gradeLevel),
      updatedAt: serverTimestamp(),
    });

    return { classId, classCode, acadYear: classDocument.acadYear };
  } catch (error: any) {
    throw new Error(`Automatic Class Registration Failed: ${error.message}`);
  }
};

/* -------------------------------------------------------------
    CREATE CUSTOM CLASS (with validation for duplicate names)
------------------------------------------------------------- */
export const createCustomClass = async (
  facultyId: string,
  className: string,
  gradeLevel: number,
): Promise<string> => {
  try {
    const acadYear = getCurrentAcademicYear();
    
    // Check for duplicate class name within the same academic year
    const classesRef = collection(db, 'classes');
    const duplicateQuery = query(
      classesRef,
      where('facultyId', '==', facultyId),
      where('acadYear', '==', acadYear),
      where('className', '==', className.trim()),
      limit(1),
    );
    
    const duplicateSnapshot = await getDocs(duplicateQuery);
    if (!duplicateSnapshot.empty) {
      throw new Error('Pangalan ng Klase ay naggamit na sa parehong Academic Year.');
    }

    const classId = `Class_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const classCode = generateClassCode();

    const classDocument: ClassDocument = {
      classId,
      classCode,
      className: className.trim(),
      gradeLevel,
      acadYear,
      facultyId,
      studentIds: [],
      isActive: true,
      createdAt: serverTimestamp(),
    };

    // Store class - MODULAR API
    const classRef = doc(db, 'classes', classId);
    await setDoc(classRef, classDocument);

    // Update faculty document - MODULAR API
    const facultyRef = doc(db, 'users', facultyId);
    await updateDoc(facultyRef, {
      'facultyData.assignedClassIds': arrayUnion(classId),
      'facultyData.assignedGradeLevels': arrayUnion(gradeLevel),
      updatedAt: serverTimestamp(),
    });

    return classCode;
  } catch (error: any) {
    throw new Error(error.message || `Failed to create class: ${error.message}`);
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
   GET CLASS BY CODE
------------------------------------------------------------- */
export const getClassByCode = async (classCode: string) => {
  try {
    const classesRef = collection(db, 'classes');
    const q = query(
      classesRef,
      where('classCode', '==', classCode.toUpperCase()),
      limit(1),
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    } as ClassDocument & { id: string };
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
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as UserDocument;
  } catch (error: any) {
    throw new Error(`Error getting user profile: ${error.message}`);
  }
};

/* -------------------------------------------------------------
    REQUEST TO JOIN CLASS (Pending Approval Workflow)
------------------------------------------------------------- */
export const requestToJoinClass = async (studentId: string, joinClassCode: string) => {
  try {
    // Search class by code - MODULAR API
    const classesRef = collection(db, 'classes');
    const classQuery = query(
      classesRef,
      where('classCode', '==', joinClassCode.toUpperCase()),
      limit(1),
    );

    const querySnapshot = await getDocs(classQuery);

    if (querySnapshot.empty) throw new Error('Invalid or inactive class code');

    const classDoc = querySnapshot.docs[0];
    const classData = classDoc.data() as ClassDocument;
    const classId = classData.classId;

    // Already enrolled?
    if (classData.studentIds.includes(studentId))
      throw new Error('Already enrolled in this class');

    // Already requested?
    if (classData.pendingJoinRequests?.includes(studentId))
      throw new Error('Join request already pending approval');

    // Add student to pending join requests - MODULAR API
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      pendingJoinRequests: arrayUnion(studentId),
      updatedAt: serverTimestamp(),
    });

    // Update student's pending classCode - MODULAR API
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, {
      'studentData.classCode': joinClassCode.toUpperCase(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, classId, className: classData.className, status: 'pending' };
  } catch (error: any) {
    throw new Error('Failed to request join class: ' + error.message);
  }
};

/* -------------------------------------------------------------
    APPROVE STUDENT JOIN REQUEST
------------------------------------------------------------- */
export const approveStudentJoin = async (studentId: string, classId: string) => {
  try {
    const classRef = doc(db, 'classes', classId);
    
    // Move student from pending to enrolled
    await updateDoc(classRef, {
      studentIds: arrayUnion(studentId),
      pendingJoinRequests: arrayRemove(studentId),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to approve student join: ' + error.message);
  }
};

/* -------------------------------------------------------------
    REJECT STUDENT JOIN REQUEST
------------------------------------------------------------- */
export const rejectStudentJoin = async (studentId: string, classId: string) => {
  try {
    const classRef = doc(db, 'classes', classId);
    
    // Remove student from pending requests
    await updateDoc(classRef, {
      pendingJoinRequests: arrayRemove(studentId),
      updatedAt: serverTimestamp(),
    });

    // Clear student's classCode
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, {
      'studentData.classCode': '',
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to reject student join: ' + error.message);
  }
};

/* -------------------------------------------------------------
    JOIN CLASS (Direct enrollment - for backward compatibility)
------------------------------------------------------------- */
export const joinClass = async (studentId: string, joinClassCode: string) => {
  try {
    // Search class by code - MODULAR API
    const classesRef = collection(db, 'classes');
    const classQuery = query(
      classesRef,
      where('classCode', '==', joinClassCode.toUpperCase()),
      limit(1),
    );

    const querySnapshot = await getDocs(classQuery);

    if (querySnapshot.empty) throw new Error('Invalid or inactive class code');

    const classDoc = querySnapshot.docs[0];
    const classData = classDoc.data() as ClassDocument;
    const classId = classData.classId;

    // Already enrolled?
    if (classData.studentIds.includes(studentId))
      throw new Error('Already enrolled in this class');

    // Add student to class - MODULAR API
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      studentIds: arrayUnion(studentId),
      updatedAt: serverTimestamp(),
    });

    // Update student's classCode - MODULAR API
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, {
      'studentData.classCode': joinClassCode.toUpperCase(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, classId, className: classData.className };
  } catch (error: any) {
    throw new Error('Failed to join class: ' + error.message);
  }
};

/* -------------------------------------------------------------
   LEAVE CLASS
------------------------------------------------------------- */
export const leaveClass = async (studentId: string, classId: string) => {
   try {
     // Get current class data to find classCode
     const classRef = doc(db, 'classes', classId);
     const classSnap = await getDoc(classRef);
     let classCode = '';
     if (classSnap.exists()) {
       const snapData = classSnap.data();
       if (snapData) {
         classCode = snapData.classCode || '';
       }
     }

     // Remove student from class - MODULAR API
     await updateDoc(classRef, {
       studentIds: arrayRemove(studentId),
       updatedAt: serverTimestamp(),
     });

     // Update student's classCode to empty - MODULAR API
     const studentRef = doc(db, 'users', studentId);
     await updateDoc(studentRef, {
       'studentData.classCode': '',
       updatedAt: serverTimestamp(),
     });

     return { success: true };
   } catch (error: any) {
     throw new Error('Failed to leave class: ' + error.message);
   }
 };

/* -------------------------------------------------------------
    GET STUDENT REQUEST STATUS
------------------------------------------------------------- */
export const getStudentRequestStatus = async (studentId: string, classId: string): Promise<{ status: 'none' | 'pending' | 'approved'; classId?: string }> => {
   try {
     const classRef = doc(db, 'classes', classId);
     const classSnap = await getDoc(classRef);

     if (!classSnap.exists()) {
       return { status: 'none' };
     }

     const classData = classSnap.data() as ClassDocument;

     // Check if student is already enrolled
     if (classData.studentIds?.includes(studentId)) {
       return { status: 'approved', classId };
     }

     // Check if student has pending request
     if (classData.pendingJoinRequests?.includes(studentId)) {
       return { status: 'pending', classId };
     }

     // No request found
     return { status: 'none' };
   } catch (error: any) {
     throw new Error('Failed to get student request status: ' + error.message);
   }
};

/* -------------------------------------------------------------
   LOGIN USER
------------------------------------------------------------- */
export const loginUser = async (email: string, password: string) => {
  try {
    // Sign in with email and password - MODULAR API
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    return {
      success: true,
      user,
      uid: user.uid,
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
   SEND PASSWORD RESET
------------------------------------------------------------- */
export const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await auth.sendPasswordResetEmail(email);
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Failed to send password reset email.';

    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email.';
        break;
      default:
        errorMessage = error.message || 'Failed to send password reset email.';
    }

    return { success: false, error: errorMessage };
  }
};

/* -------------------------------------------------------------
   VERIFY FACULTY ACCESS CODE
------------------------------------------------------------- */
export const verifyFacultyAccessCode = (code: string): boolean => {
  const validCodes = ['FACULTY2024', 'TEACHER2024', 'EDUCATOR2024'];
  return validCodes.includes(code.trim().toUpperCase());
};

/* -------------------------------------------------------------
   VALIDATE CLASS CODE
------------------------------------------------------------- */
export const validateClassCode = async (classCode: string): Promise<{ valid: boolean; message: string }> => {
  if (!classCode.trim()) {
    return { valid: false, message: 'Class code is required' };
  }

  try {
    const classData = await getClassByCode(classCode.trim().toUpperCase());
    if (!classData) {
      return { valid: false, message: 'Invalid or inactive class code' };
    }

    if (!classData.isActive) {
      return { valid: false, message: 'This class is no longer active' };
    }

    return { valid: true, message: `Found class: ${classData.className || classData.classCode}` };
  } catch (error: any) {
    return { valid: false, message: 'Failed to validate class code' };
  }
};