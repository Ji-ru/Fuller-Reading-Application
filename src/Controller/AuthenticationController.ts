// Note: This file is a pure service/controller—not a React function component or hook.
// React hooks (useState, useEffect, useRef, useCallback, useMemo) are not used or allowed here.
// Only use hooks inside function components or custom hooks (functions starting with 'use').
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  updateEmail,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  arrayUnion,
  startAfter,
  Timestamp,
  orderBy,
} from '@react-native-firebase/firestore';
import {
  UserDocument,
  MiscueReportDocument,
  ClassDocument,
  UserRole,
  PassageDocument,
} from '../Interfaces/dataInterfaces';
import { getCurrentAcademicYear } from '../Utilities/acadYearUtils';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { signOutFromGoogle } from '../Utilities/googleAuthUtils';

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
    middleName: userData.middleName,
    lastName: userData.lastName,
    sex: userData.sex,
    profileImageUrl: userData.profileImageUrl,
    createdAt: serverTimestamp() as Timestamp,
  };

  if (userData.role === 'student') {
    userDocument.studentData = {
      gradeLevel: userData.gradeLevel || 1,
      dateOfBirth: userData.dateOfBirth,
      classCode: '',
      reading_Level: 'beginner',
      readingLevelUpdatedAt: serverTimestamp() as Timestamp,
      parentConsent: {
        confirmed: userData.parentConsent?.confirmed || false,
      },
    };
  } else if (userData.role === 'faculty') {
    userDocument.facultyData = {
      assignedGradeLevels: userData.assignedGradeLevels || [],
      assignedClassIds: [],
    };
  }

  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, userDocument);

  // Auto-create class for faculty
  if (
    userData.role === 'faculty' &&
    userData.assignedGradeLevels &&
    userData.assignedGradeLevels.length > 0
  ) {
    const initialAssignedGrade = userData.assignedGradeLevels[0];
    await createClass(
      uid,
      userData.firstName,
      userData.lastName,
      initialAssignedGrade,
    );
  }
};

/* -------------------------------------------------------------
   CREATE USER ACCOUNT USING GOOGLE
------------------------------------------------------------- */
export const GoogleSignUpUserCredentials = async (
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
    parentConsent?: {
      confirmed: boolean;
    };
  },
) => {
  try {
    // 1. Create user - MODULAR API
    const currentUser = getAuth().currentUser;

    if (!currentUser) {
      throw new Error(
        'No authenticated user found. Please sign in with Google first.',
      );
    }

    await createUserDocument(currentUser.uid, email, userData);

    return { success: true, user: currentUser };
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
      status: 'active',
      createdAt: serverTimestamp() as Timestamp,
    };

    // Store class - MODULAR API
    const classRef = doc(db, 'classes', classId);
    await setDoc(classRef, classDocument);

    // Update faculty document - MODULAR API
    const facultyRef = doc(db, 'users', facultyId);
    await updateDoc(facultyRef, {
      'facultyData.assignedClassIds': arrayUnion(classId),
      'facultyData.assignedGradeLevels': arrayUnion(gradeLevel),
      updatedAt: serverTimestamp() as Timestamp,
    });

    return { classId, classCode, acadYear: classDocument.acadYear };
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
      status: 'active',
      createdAt: serverTimestamp() as Timestamp,
    };

    // Store class - MODULAR API
    const classRef = doc(db, 'classes', classId);
    await setDoc(classRef, classDocument);

    // Update faculty document - MODULAR API
    const facultyRef = doc(db, 'users', facultyId);
    await updateDoc(facultyRef, {
      'facultyData.assignedClassIds': arrayUnion(classId),
      'facultyData.assignedGradeLevels': arrayUnion(gradeLevel),
      updatedAt: serverTimestamp() as Timestamp,
    });

    return classCode;
  } catch (error: any) {
    throw new Error(`Automatic Class Registration Failed: ${error.message}`);
  }
};

/**
 * Adds a new passage with a pre-generated passage ID
 *
 * Process:
 *  1. Create a new reference to new document in the 'passages' collection (leaving ID blank)
 *  2. Extract generated ID
 *  3. Prepare final data (including ID in the document body)
 *  4. Save final data to Firestore
 *
 * @param passageData - all the data needed for adding the passage
 * @returns - true if storing is a success, else false
 */
export const AddPassage = async (
  passageData: Omit<PassageDocument, 'pid' | 'createdAt'>,
) => {
  try {
    const passageRef = doc(collection(db, 'passages'));
    const pid = passageRef.id;
    const finalData: PassageDocument = {
      ...passageData,
      pid: pid,
      createdAt: serverTimestamp() as Timestamp,
    };

    await setDoc(passageRef, finalData);

    return { success: true, id: pid };
  } catch (error: any) {
    console.error('Adding Passage Error:', error.message);
    return { success: false, error: error.message };
  }
};

/* -------------------------------------------------------------
   CLASS ARCHIVING AND UNARCHIVING
------------------------------------------------------------- */
/**
 * Used to archive a class
 *
 * @param classId - gets the classId to be archived
 * @param facultyId - gets also the facultyId to check which teacher is assigned to the class
 */
export const archiveClass = async (classId: string, facultyId: string) => {
  const classRef = doc(db, 'classes', classId);

  await updateDoc(classRef, {
    status: 'archived',
    archivedAt: serverTimestamp() as Timestamp,
    archivedBy: facultyId,
    updatedAt: serverTimestamp() as Timestamp,
  });
};

/**
 * Used to unarchive a class
 *
 * @param classId - gets the class that was archived to be unarchived
 */
export const unarchiveClass = async (classId: string) => {
  const classRef = doc(db, 'classes', classId);

  await updateDoc(classRef, {
    status: 'active',
    archivedAt: null,
    archivedBy: null,
    updatedAt: serverTimestamp() as Timestamp,
  });
};

/* -------------------------------------------------------------
   GET CLASS BY ID (ADMIN USE)
------------------------------------------------------------- */
export const getClassByCode = async (classCode: string) => {
  try {
    const classesRef = collection(db, 'classes');
    const q = query(
      classesRef,
      where('classCode', '==', classCode),
      where('status', '==', 'active'),
      limit(1),
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    // Get the first (and should be only) document
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
   UPDATE USER PROFILE
------------------------------------------------------------- */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserDocument>,
) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp() as Timestamp,
    });
    return { success: true };
  } catch (error: any) {
    throw new Error('Profile update failed: ' + error.message);
  }
};

/* -------------------------------------------------------------
   UPDATE FACULTY PROFILE
------------------------------------------------------------- */
export const updateFacultyProfile = async (
  uid: string,
  updates: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    sex?: string;
  },
) => {
  try {
    const userRef = doc(db, 'users', uid);

    // Attempt to update Authentication email if it has changed
    const currentUser = auth.currentUser;
    if (
      currentUser &&
      currentUser.uid === uid &&
      currentUser.email !== updates.email
    ) {
      try {
        await updateEmail(currentUser, updates.email);
      } catch (authError: any) {
        throw new Error(
          'Could not update login email. Please re-authenticate if modifying email. ' +
            authError.message,
        );
      }
    }

    await updateDoc(userRef, {
      firstName: updates.firstName,
      middleName: updates.middleName,
      lastName: updates.lastName,
      email: updates.email,
      ...(updates.sex ? { sex: updates.sex } : {}),
      updatedAt: serverTimestamp() as Timestamp,
    });
    return { success: true };
  } catch (error: any) {
    throw new Error('Faculty profile update failed: ' + error.message);
  }
};

/* -------------------------------------------------------------
   UPDATE STUDENT BASIC INFO
------------------------------------------------------------- */
export const updateStudentBasicInfo = async (
  uid: string,
  updates: {
    firstName: string;
    middleName?: string;
    lastName: string;
    sex: string;
    dateOfBirth?: string;
  },
) => {
  try {
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
      firstName: updates.firstName,
      middleName: updates.middleName,
      lastName: updates.lastName,
      sex: updates.sex,
      'studentData.dateOfBirth': updates.dateOfBirth,
      updatedAt: serverTimestamp() as Timestamp,
    });
    return { success: true };
  } catch (error: any) {
    throw new Error('Student profile update failed: ' + error.message);
  }
};

/* -------------------------------------------------------------
   JOIN CLASS
------------------------------------------------------------- */
export const joinClass = async (studentId: string, joinClassCode: string) => {
  try {
    // Search class by code - MODULAR API
    const classesRef = collection(db, 'classes');
    const classQuery = query(
      classesRef,
      where('classCode', '==', joinClassCode),
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

    // Update student's classId - MODULAR API
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, {
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
    const miscueReportsRef = collection(db, 'miscueReports');
    const reportRef = doc(miscueReportsRef); // Auto-generate ID
    const report: MiscueReportDocument = {
      ...reportData,
      reportId: reportRef.id,
      createdAt: serverTimestamp() as Timestamp,
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
    console.log('This is studentId: ' + studentId);

    // 1. Get student’s document to retrieve the stored classCode
    const studentRef = doc(db, 'users', studentId);
    const studentSnap = await getDoc(studentRef);
    const studentData = studentSnap.data() as UserDocument;
    const classCode = studentData?.studentData?.classCode;
    console.log('This is class code: ' + classCode);

    // No class enrolled
    if (!classCode) return null;

    // 2. Query the classes collection for a document with this classCode
    const classesRef = collection(db, 'classes');
    const q = query(
      classesRef,
      where('classCode', '==', classCode),
      where('status', '==', 'active'),
      limit(1),
    );
    const querySnapshot = await getDocs(q);

    // No active class with that code
    if (querySnapshot.empty) return null;

    // 3. Return the class data
    const classDoc = querySnapshot.docs[0];
    return { id: classDoc.id, ...classDoc.data() } as ClassDocument & {
      id: string;
    };
  } catch (error: any) {
    throw new Error('Failed to get student class: ' + error.message);
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
  return auth.currentUser; // Direct property access, not function call
};

/* -------------------------------------------------------------
   LOGOUT USER
------------------------------------------------------------- */
export const logoutUser = async () => {
  try {
    const currentUser = auth.currentUser;

    if (currentUser) {
      // Check if the user is signed in via Google
      const isGoogleUser = currentUser.providerData.some(
        (profile) => profile.providerId === 'google.com',
      );

      if (isGoogleUser) {
        await signOutFromGoogle(); // Clear native Google session
      }
    }

    await signOut(auth); // MODULAR API for Firebase
    return { success: true };
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`);
  }
};

/* -------------------------------------------------------------
   ADMIN FUNCTIONS
------------------------------------------------------------- */

export interface GetUsersResult {
  users: UserDocument[];
  lastDoc?: QueryDocumentSnapshot<UserDocument>;
}

export interface GetClassesResult {
  classes: ClassDocument[];
  lastDoc?: QueryDocumentSnapshot<ClassDocument>;
}

export const getUsers = async ({
  role,
  searchTerm,
  lastDoc,
}: {
  role?: UserRole;
  searchTerm?: string;
  lastDoc?: QueryDocumentSnapshot<UserDocument>;
}): Promise<GetUsersResult> => {
  try {
    // SEARCH MODE: Different strategy when searching
    if (searchTerm) {
      return await searchUsers({ searchTerm, role });
    }
    // BROWSE MODE: Original pagination logic
    let baseUserQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(60),
    );

    // Role filter
    if (role) {
      baseUserQuery = query(baseUserQuery, where('role', '==', role));
    }

    // Pagination
    if (lastDoc) {
      baseUserQuery = query(baseUserQuery, startAfter(lastDoc));
    }

    const userQuerySnapshot = await getDocs(baseUserQuery);

    const users: UserDocument[] = userQuerySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<UserDocument>) => {
        return {
          ...doc.data(),
          uid: doc.id,
        };
      },
    );

    return {
      users,
      lastDoc: userQuerySnapshot.docs[userQuerySnapshot.docs.length - 1],
    };
  } catch (error: any) {
    throw new Error('Failed to fetch the users: ' + error.message);
  }
};

/**
 * Admin Function: Gets a paginated list of classes, optionally filtered by status and searched by className.
 */
export const getAllClasses = async ({
  status,
  searchTerm,
  lastDoc,
  limitOverride,
  acadYear,
}: {
  status?: 'active' | 'archived';
  searchTerm?: string;
  lastDoc?: QueryDocumentSnapshot<ClassDocument>;
  limitOverride?: number;
  acadYear?: string;
}): Promise<GetClassesResult> => {
  try {
    let classesQuery = query(
      collection(db, 'classes'),
      orderBy('createdAt', 'desc'),
      limit(limitOverride || 20),
    );

    if (status) {
      classesQuery = query(classesQuery, where('status', '==', status));
    }
    if (acadYear) {
      classesQuery = query(classesQuery, where('acadYear', '==', acadYear));
    }
    if (lastDoc) {
      classesQuery = query(classesQuery, startAfter(lastDoc));
    }

    const snapshot = await getDocs(classesQuery);
    let classes: ClassDocument[] = snapshot.docs.map(
      (doc: QueryDocumentSnapshot) => {
        // Ensuring the correct typing and structure mapping
        const data = doc.data() as ClassDocument;
        // Overwrite classId with the document's actual id in case they somehow differ,
        // but usually the ClassDocument interface holds the id properly inside `classId`.
        return {
          ...data,
        };
      },
    );

    // Handle Client-side text search if a searchTerm is provided
    if (searchTerm) {
      classes = classes.filter(
        (cls: ClassDocument) =>
          (cls.className || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (cls.classCode || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    return {
      classes,
      lastDoc:
        snapshot.docs.length > 0
          ? (snapshot.docs[
              snapshot.docs.length - 1
            ] as unknown as QueryDocumentSnapshot<ClassDocument>)
          : undefined,
    };
  } catch (error: any) {
    throw new Error('Failed to fetch classes: ' + error.message);
  }
};

/**
 * Fetch all classes for a given academic year and return:
 * - a Set of class codes (for filtering students)
 * - a Set of class IDs (for filtering faculty)
 */
export const getClassesByAcadYear = async (acadYear: string) => {
  const classesRef = collection(db, 'classes');
  const q = query(classesRef, where('acadYear', '==', acadYear));
  const snapshot = await getDocs(q);

  const classCodes = new Set<string>();
  const classIds = new Set<string>();

  snapshot.forEach((doc: QueryDocumentSnapshot) => {
    const data = doc.data() as ClassDocument;
    classCodes.add(data.classCode);
    classIds.add(data.classId);
  });

  return { classCodes, classIds };
};

// Separate search function
const searchUsers = async ({
  searchTerm,
  role,
}: {
  searchTerm: string;
  role?: UserRole;
}): Promise<GetUsersResult> => {
  // Option 1: Fetch ALL users (if dataset is small <1000 users)
  let searchQuery = query(collection(db, 'users'));

  // Apply role filter BEFORE fetching (reduces data transfer)
  if (role) {
    searchQuery = query(searchQuery, where('role', '==', role));
  }

  const snapshot = await getDocs(searchQuery);
  const users = snapshot.docs.map(
    (doc: QueryDocumentSnapshot<UserDocument>) => ({
      ...doc.data(),
      uid: doc.id,
    }),
  );

  const filtered = users.filter((user: any) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return {
    users: filtered,
    lastDoc: undefined, // No pagination in search mode
  };
};

/**
 * Fetch users by role, optionally filtered by academic year.
 *
 * For students: only those whose `studentData.classCode` is in the given list of class codes.
 * For faculty: only those whose `facultyData.assignedClassIds` intersects with the given list of class IDs.
 *
 * @param role - 'student' | 'faculty' | undefined (if undefined, fetch both)
 * @param acadYear - optional academic year string (e.g., "2025-2026")
 * @returns Object with arrays of students and faculty
 */
export const getUsersByRole = async (role?: UserRole, acadYear?: string) => {
  try {
    let classCodes: Set<string> = new Set();
    let classIds: Set<string> = new Set();

    // If academic year is given, fetch relevant class codes and IDs
    if (acadYear) {
      const { classCodes: codes, classIds: ids } = await getClassesByAcadYear(
        acadYear,
      );
      classCodes = codes;
      classIds = ids;
    }

    // Base query: users collection
    let usersQuery = query(collection(db, 'users'));

    // Apply role filter if provided
    if (role) {
      usersQuery = query(usersQuery, where('role', '==', role));
    }

    // Fetch users (consider pagination if needed – see note below)
    const snapshot = await getDocs(usersQuery);
    const allUsers = snapshot.docs.map(
      (doc: QueryDocumentSnapshot) => doc.data() as UserDocument,
    );

    // Filter by academic year if required
    let filteredUsers = allUsers;
    if (acadYear) {
      filteredUsers = allUsers.filter((user: UserDocument) => {
        if (user.role === 'student') {
          const classCode = user.studentData?.classCode;
          return !!classCode && classCodes.has(classCode);
        }
        if (user.role === 'faculty') {
          const assignedIds = user.facultyData?.assignedClassIds || [];
          return assignedIds.some(id => classIds.has(id));
        }
        return true; // shouldn't happen, but for safety
      });
    }

    // Separate by role
    const students = filteredUsers.filter(
      (u: UserDocument) => u.role === 'student',
    );
    const faculty = filteredUsers.filter(
      (u: UserDocument) => u.role === 'faculty',
    );

    return { students, faculty };
  } catch (error: any) {
    console.error('Error fetching users by role:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

// ==============================================================================================================
// GET CURRENT USER RETRIEVAL
// ==============================================================================================================

/**
 * Retrieves the current user's sex from Firestore.
 * @returns {Promise<string | null>} - The user's sex ('male' | 'female' | other) or null if not found/error.
 */
export const getCurrentUserSex = async (): Promise<string | null> => {
  try {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return null;

    const userSnap = await getDoc(doc(getFirestore(), 'users', uid));
    if (!userSnap.exists()) return null;

    const userData = userSnap.data() as UserDocument;
    return userData.sex || null;
  } catch (error) {
    console.error('[getCurrentUserSex] Error fetching user sex:', error);
    return null; // fallback
  }
};
