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
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from '@react-native-firebase/auth';
import { initializeApp, getApps } from '@react-native-firebase/app';
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
  arrayRemove,
  startAfter,
  Timestamp,
  orderBy,
  deleteDoc,
  writeBatch,
} from '@react-native-firebase/firestore';
import {
  UserDocument,
  MiscueReportDocument,
  ClassDocument,
  UserRole,
  PassageDocument,
  // ─── Added for student acceptance or rejection to a class by faculty ───────
  // Migrated to a pendingStudentIds array on ClassDocument; the
  // EnrollmentRequestDocument type is no longer used.
  StudentClassState,
  // ─── End ──────────────────────────────────────────────────────────────────
} from '../Interfaces/dataInterfaces';
import { getCurrentAcademicYear } from '../Utilities/acadYearUtils';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { signOutFromGoogle } from '../Utilities/googleAuthUtils';

// Initialize Firebase instances once
const auth = getAuth();
const db = getFirestore();

/* -------------------------------------------------------------
   SECONDARY APP — used only for admin "Add User" so the primary
   admin session is never displaced by createUserWithEmailAndPassword.
   Config mirrors values from google-services.json / GoogleService-Info.plist.
------------------------------------------------------------- */
const SECONDARY_APP_NAME = 'AdminCreateUser';

const getOrInitSecondaryApp = async () => {
  const existing = getApps().find(a => a.name === SECONDARY_APP_NAME);
  if (existing) return existing;
  return await initializeApp(
    {
      apiKey: 'AIzaSyAMG5RvwLzp437kq73K3NlHGHhDQjvopIM',
      appId: '1:274037817546:android:37cc2a2e7d0f478b04f433',
      projectId: 'cisckids-25',
      storageBucket: 'cisckids-25.firebasestorage.app',
      messagingSenderId: '274037817546',
      databaseURL: '',
    },
    SECONDARY_APP_NAME,
  );
};

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
    const currentAcadYear = getCurrentAcademicYear();
    // 1. Check for duplicate class names in the current academic year
    const classesRef = collection(db, 'classes');
    const duplicateQuery = query(
      classesRef,
      where('className', '==', className),
      where('acadYear', '==', currentAcadYear),
    );
    const duplicateSnapshot = await getDocs(duplicateQuery);
    if (!duplicateSnapshot.empty) {
      throw new Error(
        `The class name "${className}" is already taken for the ${currentAcadYear} academic year.`,
      );
    }
    // 2. Proceed with normal creation
    const classId = `Class_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const classCode = generateClassCode();
    const classDocument: ClassDocument = {
      classId,
      classCode,
      className: className,
      gradeLevel,
      acadYear: currentAcadYear,
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
    // If it's our custom duplicate error, we throw it cleanly
    if (error.message.includes('already taken')) {
      throw error;
    }
    throw new Error(`Class Creation Failed: ${error.message}`);
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

/**
 * Updates an existing passage by its pid.
 *
 * @param pid - the passage ID to update
 * @param updates - the fields to update (title, author, gradeLevel, passageText)
 * @returns - success flag
 */
export const UpdatePassage = async (
  pid: string,
  updates: Partial<Omit<PassageDocument, 'pid' | 'createdAt'>>,
) => {
  try {
    const passageRef = doc(db, 'passages', pid);
    await updateDoc(passageRef, { ...updates });
    return { success: true };
  } catch (error: any) {
    console.error('Updating Passage Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Deletes a passage by its pid.
 *
 * @param pid - the passage ID to delete
 * @returns - success flag
 */
export const DeletePassage = async (pid: string) => {
  try {
    const passageRef = doc(db, 'passages', pid);
    await deleteDoc(passageRef);
    return { success: true };
  } catch (error: any) {
    console.error('Deleting Passage Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Fetches all passages, ordered by creation date (newest first).
 *
 * @returns - array of PassageDocument
 */
export const GetAllPassages = async (): Promise<PassageDocument[]> => {
  try {
    const passagesRef = collection(db, 'passages');
    const q = query(passagesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d: QueryDocumentSnapshot) => d.data() as PassageDocument,
    );
  } catch (error: any) {
    console.error('Fetching Passages Error:', error.message);
    return [];
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
    // ─── Added for student acceptance or rejection to a class by faculty ───
    // Clear pending join requests so students don't sit in limbo on an
    // archived class. They can re-request after unarchive if needed.
    pendingStudentIds: [],
    // ─── End ──────────────────────────────────────────────────────────────
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
      // where('status', '==', 'active'),
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
   ADMIN: UPDATE USER (Firestore only)
   - Updates Firestore fields directly.
   - Auth email can only be changed for the currently-signed-in user
     (Firebase client SDK limitation); other users' Firestore email
     field is updated for display, but their Auth email is unchanged.
   - Password changes are NOT handled here — use
     sendAdminPasswordResetEmail() instead (Pattern A).
------------------------------------------------------------- */
export const updateUserByAdmin = async (
  uid: string,
  updates: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dateOfBirth?: string;
    email?: string;
    sex?: string;
    role?: UserRole;
    gradeLevel?: number;
    assignedGradeLevels?: number[];
  },
) => {
  try {
    const userRef = doc(db, 'users', uid);

    // Use dotted field paths for nested updates so Firestore preserves
    // sibling fields (e.g. studentData.classCode, studentData.reading_Level,
    // facultyData.assignedClassIds) instead of replacing the parent map.
    const payload: Record<string, unknown> = {
      ...(updates.firstName ? { firstName: updates.firstName } : {}),
      ...(updates.middleName ? { middleName: updates.middleName } : {}),
      ...(updates.lastName ? { lastName: updates.lastName } : {}),
      ...(updates.email ? { email: updates.email } : {}),
      ...(updates.sex ? { sex: updates.sex } : {}),
      ...(updates.role ? { role: updates.role } : {}),
      updatedAt: serverTimestamp() as Timestamp,
    };

    if (typeof updates.dateOfBirth === 'string') {
      payload['studentData.dateOfBirth'] = updates.dateOfBirth;
    }

    if (typeof updates.gradeLevel === 'number') {
      payload['studentData.gradeLevel'] = updates.gradeLevel;
    }

    if (updates.assignedGradeLevels) {
      payload['facultyData.assignedGradeLevels'] = updates.assignedGradeLevels;
    }

    await updateDoc(userRef, payload);

    // Auth email can only be changed for the currently signed-in user.
    const currentUser = auth.currentUser;
    if (
      currentUser &&
      currentUser.uid === uid &&
      updates.email &&
      currentUser.email !== updates.email
    ) {
      await updateEmail(currentUser, updates.email);
    }

    return { success: true };
  } catch (error: any) {
    throw new Error('Admin user update failed: ' + error.message);
  }
};

/* -------------------------------------------------------------
   ADMIN: SEND PASSWORD RESET EMAIL (Pattern A)
   The target user receives a Firebase password-reset email and
   sets their own new password. Works for any user without admin
   privilege.
------------------------------------------------------------- */
export const sendAdminPasswordResetEmail = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    throw new Error(
      'Password reset email failed: ' + (error?.message || 'unknown error'),
    );
  }
};

/* -------------------------------------------------------------
   ADMIN: DELETE USER (client-side Firestore cascade)
   - Student: remove from any class, delete reports across
     miscueReports, alphabetSessionReports, alphabetReports,
     wordSessionReports, wordReports, then delete the user doc.
   - Faculty: for each owned class, unenroll every student
     (clear their classCode), delete the class doc, then delete
     the faculty user doc.
   - Admin: blocked.
   NOTE: The Firebase Auth account is NOT removed (client SDK
   limitation). The orphan Auth row can be cleaned up manually
   from the Firebase console.
------------------------------------------------------------- */
const STUDENT_DATA_COLLECTIONS = [
  'miscueReports',
  'alphabetSessions',
  'alphabetCompleted',
  'wordSessions',
  'wordCompleted',
] as const;

const deleteDocsWhereStudentId = async (
  collectionName: string,
  studentId: string,
) => {
  const snap = await getDocs(
    query(collection(db, collectionName), where('studentId', '==', studentId)),
  );
  if (snap.empty) return;
  // Firestore batch limit is 500 ops.
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 500) {
    const batch = writeBatch(db);
    docs.slice(i, i + 500).forEach((d: any) => batch.delete(d.ref));
    await batch.commit();
  }
};

const cascadeDeleteStudent = async (uid: string) => {
  const studentSnap = await getDoc(doc(db, 'users', uid));
  const classCode: string | undefined = (
    studentSnap.data() as UserDocument | undefined
  )?.studentData?.classCode;

  if (classCode) {
    const classQuerySnap = await getDocs(
      query(collection(db, 'classes'), where('classCode', '==', classCode)),
    );
    for (const cls of classQuerySnap.docs) {
      await updateDoc(cls.ref, {
        studentIds: arrayRemove(uid),
        updatedAt: serverTimestamp() as Timestamp,
      });
    }
  }

  // ─── Added for student acceptance or rejection to a class by faculty ───────
  // Strip this UID from any class's pendingStudentIds so it doesn't dangle
  // after the user account is gone.
  const pendingMatchesSnap = await getDocs(
    query(
      collection(db, 'classes'),
      where('pendingStudentIds', 'array-contains', uid),
    ),
  );
  for (const cls of pendingMatchesSnap.docs) {
    await updateDoc(cls.ref, {
      pendingStudentIds: arrayRemove(uid),
      updatedAt: serverTimestamp() as Timestamp,
    });
  }
  // ─── End ──────────────────────────────────────────────────────────────────

  for (const coll of STUDENT_DATA_COLLECTIONS) {
    await deleteDocsWhereStudentId(coll, uid);
  }

  await deleteDoc(doc(db, 'users', uid));
};

const cascadeDeleteFaculty = async (uid: string) => {
  const facultySnap = await getDoc(doc(db, 'users', uid));
  const assignedClassIds: string[] =
    (facultySnap.data() as UserDocument | undefined)?.facultyData
      ?.assignedClassIds || [];

  for (const classId of assignedClassIds) {
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    if (!classSnap.exists) continue;

    const studentIds: string[] =
      (classSnap.data() as ClassDocument | undefined)?.studentIds || [];

    for (const studentId of studentIds) {
      await updateDoc(doc(db, 'users', studentId), {
        'studentData.classCode': '',
        updatedAt: serverTimestamp() as Timestamp,
      });
    }

    await deleteDoc(classRef);
  }

  await deleteDoc(doc(db, 'users', uid));
};

export const deleteUserByAdmin = async (uid: string) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists) throw new Error('User not found');

    const role: UserRole = (userSnap.data() as UserDocument).role;
    if (role === 'admin') throw new Error('Admin accounts cannot be deleted');

    if (role === 'student') {
      await cascadeDeleteStudent(uid);
    } else if (role === 'faculty') {
      await cascadeDeleteFaculty(uid);
    } else {
      throw new Error(`Unknown role: ${role}`);
    }

    return { success: true };
  } catch (error: any) {
    throw new Error(
      'Admin user delete failed: ' + (error?.message || 'unknown error'),
    );
  }
};

/* -------------------------------------------------------------
   ADMIN: CREATE USER (Pattern B — secondary Firebase app)
   Uses an isolated secondary app instance so that
   createUserWithEmailAndPassword does NOT displace the admin's
   primary session. After creation we sign the secondary app out.
------------------------------------------------------------- */
export const createUserByAdmin = async (
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
  },
) => {
  const secondaryApp = await getOrInitSecondaryApp();
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );
    const newUid = credential.user.uid;

    await createUserDocument(newUid, email, userData);

    // Sign out the secondary instance so it holds no session.
    await signOut(secondaryAuth);

    return { success: true, uid: newUid };
  } catch (error: any) {
    try {
      await signOut(secondaryAuth);
    } catch {
      /* ignore */
    }
    throw new Error(
      'Admin create user failed: ' + (error?.message || 'unknown error'),
    );
  }
};

/* -------------------------------------------------------------
   JOIN CLASS
   ─── Modified for instant-rejoin enrollment flow ──────────────────────────
   Two branches:
     A) FIRST-TIME: student has never been in this class's studentIds.
        Adds to pendingStudentIds AND preemptively writes student.classCode
        so the resolver has an anchor for showing pending/active state.
     B) REJOIN: student is already in this class's studentIds (historical
        member returning after a leave). Skips pending entirely — just sets
        student.classCode = target.code. Faculty already approved this
        student previously, so re-approval would be redundant.

   Preconditions:
     - student.classCode must be empty (must leave current class first)
     - no pending request anywhere
     - target class must be active
   ─── End ──────────────────────────────────────────────────────────────────
------------------------------------------------------------- */
export const joinClass = async (studentId: string, joinClassCode: string) => {
  try {
    // 1. Verify student has no active enrollment
    const studentSnap = await getDoc(doc(db, 'users', studentId));
    if (!studentSnap.exists()) throw new Error('Student profile not found.');
    const studentDocData = studentSnap.data() as UserDocument;
    if (studentDocData.studentData?.classCode) {
      throw new Error('You are already enrolled in a class. Leave it first.');
    }

    // 2. Resolve the class by code
    const classesRef = collection(db, 'classes');
    const classQuery = query(
      classesRef,
      where('classCode', '==', joinClassCode),
      limit(1),
    );
    const classQuerySnap = await getDocs(classQuery);
    if (classQuerySnap.empty) throw new Error('Invalid class code.');

    const classDoc = classQuerySnap.docs[0];
    const classData = classDoc.data() as ClassDocument;

    // 3. Only active classes accept new requests / rejoins
    if (classData.status !== 'active') {
      throw new Error('This class is no longer accepting new students.');
    }

    // 4. Block if student already has a pending request anywhere
    const existingPendingSnap = await getDocs(
      query(
        collection(db, 'classes'),
        where('pendingStudentIds', 'array-contains', studentId),
        limit(1),
      ),
    );
    if (!existingPendingSnap.empty) {
      throw new Error(
        'You already have a pending request to another class. Cancel it before requesting a new one.',
      );
    }

    // 5. Branch on whether this is a REJOIN or a FIRST-TIME join.
    //    studentIds preserves historical members across the academic year,
    //    so presence here means the student was previously approved by faculty.
    const isReturningMember =
      classData.studentIds?.includes(studentId) === true;

    if (isReturningMember) {
      // ─── REJOIN PATH ─────────────────────────────────────────────────────
      // Instant rejoin — single user-doc write. No pending, no faculty action.
      await updateDoc(doc(db, 'users', studentId), {
        'studentData.classCode': classData.classCode,
        updatedAt: serverTimestamp() as Timestamp,
      });
      return {
        success: true,
        classId: classData.classId,
        className: classData.className,
        status: 'active' as const,
      };
    }

    // ─── FIRST-TIME PATH ─────────────────────────────────────────────────────
    // Atomic batch: pendingStudentIds gets the student, and the student's
    // own classCode is set preemptively so the resolver can show 'pending'
    // and later detect accept/reject without ambiguity.
    const batch = writeBatch(db);
    batch.update(doc(db, 'classes', classData.classId), {
      pendingStudentIds: arrayUnion(studentId),
      updatedAt: serverTimestamp() as Timestamp,
    });
    batch.update(doc(db, 'users', studentId), {
      'studentData.classCode': classData.classCode,
      updatedAt: serverTimestamp() as Timestamp,
    });
    await batch.commit();

    return {
      success: true,
      classId: classData.classId,
      className: classData.className,
      status: 'pending' as const,
    };
  } catch (error: any) {
    throw new Error('Failed to join class: ' + error.message);
  }
};

/* -------------------------------------------------------------
   ─── Added for student acceptance or rejection to a class by faculty ───
   ENROLLMENT FUNCTIONS (array-on-class implementation)
   - cancelJoinRequest:        student withdraws their own pending request
   - getPendingStudents:       faculty reads the pending UIDs and resolves them
                                to UserDocument profiles for rendering
   - acceptStudent:            faculty approves — single atomic batched update
                                (arrayRemove from pendingStudentIds + arrayUnion
                                 into studentIds in one operation)
   - rejectStudent:            faculty declines — arrayRemove only; no trace
                                remains by design (no audit history)
   - resolveStudentClassState: Student_MyClass entry point; returns the
                                discriminated state pending/active/none and
                                self-heals the student's classCode after a
                                faculty accept (since faculty cannot write to
                                the student's user doc under existing rules).
   ─── End ──────────────────────────────────────────────────────────────────
------------------------------------------------------------- */

// ─── Added for student acceptance or rejection to a class by faculty ─────────
// ─── Modified for instant-rejoin enrollment flow ─────────────────────────────
// Batched: arrayRemove from pendingStudentIds AND clear the student's classCode
// (which was preemptively set by joinClass). Both writes commit atomically.
export const cancelJoinRequest = async (studentId: string, classId: string) => {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'classes', classId), {
      pendingStudentIds: arrayRemove(studentId),
      updatedAt: serverTimestamp() as Timestamp,
    });
    batch.update(doc(db, 'users', studentId), {
      'studentData.classCode': '',
      updatedAt: serverTimestamp() as Timestamp,
    });
    await batch.commit();
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to cancel request: ' + error.message);
  }
};
// ─── End ──────────────────────────────────────────────────────────────────────

/**
 * Faculty-side: read the pending UIDs from a class doc, then batch-fetch each
 * student profile so the UI can render names/grade levels.
 * Firestore `in` queries are limited to 30 elements per query, so we chunk.
 */
export const getPendingStudents = async (
  classId: string,
): Promise<UserDocument[]> => {
  try {
    const classSnap = await getDoc(doc(db, 'classes', classId));
    if (!classSnap.exists()) return [];
    const classData = classSnap.data() as ClassDocument;
    const uids = classData.pendingStudentIds || [];
    if (uids.length === 0) return [];

    const results: UserDocument[] = [];
    for (let i = 0; i < uids.length; i += 30) {
      const chunk = uids.slice(i, i + 30);
      const chunkSnap = await getDocs(
        query(collection(db, 'users'), where('uid', 'in', chunk)),
      );
      chunkSnap.forEach((d: any) => {
        results.push(d.data() as UserDocument);
      });
    }
    return results;
  } catch (error: any) {
    throw new Error('Failed to fetch pending students: ' + error.message);
  }
};

/**
 * Faculty accepts: atomically move the student from pendingStudentIds to
 * studentIds on the class doc. The student's own client reconciles their
 * `studentData.classCode` field on next visit via resolveStudentClassState
 * (since faculty cannot write to user docs under existing security rules).
 */
export const acceptStudent = async (classId: string, studentId: string) => {
  try {
    await updateDoc(doc(db, 'classes', classId), {
      pendingStudentIds: arrayRemove(studentId),
      studentIds: arrayUnion(studentId),
      updatedAt: serverTimestamp() as Timestamp,
    });
    return { success: true, classId, studentId };
  } catch (error: any) {
    throw new Error('Failed to accept student: ' + error.message);
  }
};

/**
 * Faculty rejects: drop the UID from pendingStudentIds. No history is kept.
 * The student's UI returns to the "No Class Yet" state on next read.
 */
export const rejectStudent = async (classId: string, studentId: string) => {
  try {
    await updateDoc(doc(db, 'classes', classId), {
      pendingStudentIds: arrayRemove(studentId),
      updatedAt: serverTimestamp() as Timestamp,
    });
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to reject student: ' + error.message);
  }
};

// ─── Added for instant-rejoin enrollment flow ─────────────────────────────────
/**
 * Faculty manually removes a student from the class roster. This drops the UID
 * from studentIds — the only path that touches that array now. The student's
 * own classCode (if still pointing here) self-heals to empty on their next
 * visit via resolveStudentClassState. After removal, the student's rejoin
 * via joinClass goes through the FIRST-TIME path (pending → re-approval).
 */
export const removeStudentFromClass = async (
  classId: string,
  studentId: string,
) => {
  try {
    await updateDoc(doc(db, 'classes', classId), {
      studentIds: arrayRemove(studentId),
      updatedAt: serverTimestamp() as Timestamp,
    });
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to remove student: ' + error.message);
  }
};
// ─── End ──────────────────────────────────────────────────────────────────────

/* -------------------------------------------------------------
   GET ENROLLED STUDENTS BY CLASS ROSTER
   ─── Added for studentIds/assignedClassIds source-of-truth refactor ─────
   Replaces the previous classCode-based query for Faculty_MyStudents.tsx.
   Source of truth is now the class doc's studentIds array, which:
     - excludes pending students (they live in pendingStudentIds)
     - excludes removed students (arrayRemove drops them)
   Pattern mirrors getPendingStudents: read class doc → chunked `in` queries
   on users (Firestore caps `in` at 30 elements per query).
   ─── End ────────────────────────────────────────────────────────────────
------------------------------------------------------------- */
export const getEnrolledStudents = async (
  classId: string,
): Promise<UserDocument[]> => {
  try {
    const classSnap = await getDoc(doc(db, 'classes', classId));
    if (!classSnap.exists()) return [];
    const classData = classSnap.data() as ClassDocument;
    const uids = classData.studentIds || [];
    if (uids.length === 0) return [];

    const results: UserDocument[] = [];
    for (let i = 0; i < uids.length; i += 30) {
      const chunk = uids.slice(i, i + 30);
      const chunkSnap = await getDocs(
        query(collection(db, 'users'), where('uid', 'in', chunk)),
      );
      chunkSnap.forEach((d: any) => {
        results.push(d.data() as UserDocument);
      });
    }
    return results;
  } catch (error: any) {
    throw new Error('Failed to fetch enrolled students: ' + error.message);
  }
};

/* -------------------------------------------------------------
   GET FACULTY ASSIGNED CLASSES
   ─── Added for studentIds/assignedClassIds source-of-truth refactor ─────
   Replaces the previous facultyId-based query for Faculty_MyClass.tsx and
   Faculty_MyArchive.tsx. Reads the faculty user doc's assignedClassIds and
   resolves each ID to its ClassDocument via chunked `in` queries.
   Callers filter by status='active' / 'archived' as needed.
   ─── End ────────────────────────────────────────────────────────────────
------------------------------------------------------------- */
export const getAssignedClasses = async (
  facultyId: string,
): Promise<ClassDocument[]> => {
  try {
    const facultySnap = await getDoc(doc(db, 'users', facultyId));
    if (!facultySnap.exists()) return [];
    const facultyData = facultySnap.data() as UserDocument;
    const classIds = facultyData.facultyData?.assignedClassIds || [];
    if (classIds.length === 0) return [];

    const results: ClassDocument[] = [];
    for (let i = 0; i < classIds.length; i += 30) {
      const chunk = classIds.slice(i, i + 30);
      const chunkSnap = await getDocs(
        query(collection(db, 'classes'), where('classId', 'in', chunk)),
      );
      chunkSnap.forEach((d: any) => {
        results.push(d.data() as ClassDocument);
      });
    }
    return results;
  } catch (error: any) {
    throw new Error('Failed to fetch assigned classes: ' + error.message);
  }
};

/* -------------------------------------------------------------
   DELETE CLASS BY FACULTY
   ─── Added for studentIds/assignedClassIds source-of-truth refactor ─────
   Atomic deletion of a class owned by the calling faculty:
     1. Remove classId from faculty's assignedClassIds
     2. Delete the class document
   Both writes are batched, so either both succeed or both roll back.

   The previous hook-based deleteClass silently failed at step 2 because
   the security rule blocked faculty deletion. This function relies on the
   updated rule that allows faculty to delete classes where they are the
   owning facultyId.

   Student cleanup: any student whose classCode points to this deleted
   class self-heals on their next visit via resolveStudentClassState
   (classCode → non-existent class → cleared).
   ─── End ────────────────────────────────────────────────────────────────
------------------------------------------------------------- */
export const deleteClassByFaculty = async (
  classId: string,
  facultyId: string,
) => {
  try {
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    if (!classSnap.exists()) {
      throw new Error('Class not found.');
    }
    const classData = classSnap.data() as ClassDocument;
    if (classData.facultyId !== facultyId) {
      throw new Error('Not authorized to delete this class.');
    }

    const batch = writeBatch(db);
    batch.update(doc(db, 'users', facultyId), {
      'facultyData.assignedClassIds': arrayRemove(classId),
      updatedAt: serverTimestamp() as Timestamp,
    });
    batch.delete(classRef);
    await batch.commit();

    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to delete class: ' + error.message);
  }
};

/* -------------------------------------------------------------
   DELETE CLASS BY ADMIN
   Admin-authority deletion of any class (no owner-match guard).
   Reads the class doc to find its owning facultyId, then atomically:
     1. Remove classId from that faculty's assignedClassIds
     2. Delete the class document
   Students whose classCode points here self-heal on their next
   visit via resolveStudentClassState (same as deleteClassByFaculty).
------------------------------------------------------------- */
export const deleteClassByAdmin = async (classId: string) => {
  try {
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    if (!classSnap.exists()) {
      throw new Error('Class not found.');
    }
    const classData = classSnap.data() as ClassDocument;

    const batch = writeBatch(db);
    if (classData.facultyId) {
      batch.update(doc(db, 'users', classData.facultyId), {
        'facultyData.assignedClassIds': arrayRemove(classId),
        updatedAt: serverTimestamp() as Timestamp,
      });
    }
    batch.delete(classRef);
    await batch.commit();

    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to delete class: ' + error.message);
  }
};

/**
 * ─── Modified for instant-rejoin enrollment flow ───────────────────────────
 * Anchored on the student's own classCode. joinClass and cancelJoinRequest
 * keep it in sync; resolver reads the referenced class doc to decide whether
 * the student is pending, active, or got rejected (in which case it self-heals
 * classCode back to empty).
 *
 * - classCode empty            → 'none'
 * - classCode set, in pending  → 'pending'
 * - classCode set, in studentIds AND active → 'active'
 * - classCode set, neither     → faculty rejected / archived / kicked
 *                                → clear classCode, return 'none'
 * ─── End ───────────────────────────────────────────────────────────────────
 */
export const resolveStudentClassState = async (
  studentId: string,
): Promise<StudentClassState> => {
  try {
    // 1. Pull the student's profile to read classCode anchor
    const studentSnap = await getDoc(doc(db, 'users', studentId));
    if (!studentSnap.exists()) throw new Error('Student profile not found.');
    const student = studentSnap.data() as UserDocument;
    const currentCode = student.studentData?.classCode || '';

    if (!currentCode) {
      return { kind: 'none' };
    }

    // 2. Fetch the referenced class. We deliberately do NOT filter by
    //    status='active' here so we can detect 'archived' and self-heal.
    const classSnap = await getDocs(
      query(
        collection(db, 'classes'),
        where('classCode', '==', currentCode),
        limit(1),
      ),
    );

    // 2a. classCode points to a class that no longer exists → clear it
    if (classSnap.empty) {
      await updateDoc(doc(db, 'users', studentId), {
        'studentData.classCode': '',
        updatedAt: serverTimestamp() as Timestamp,
      });
      return { kind: 'none' };
    }

    const cls = classSnap.docs[0].data() as ClassDocument;

    // 3. Pending? Faculty hasn't decided yet.
    if (cls.pendingStudentIds?.includes(studentId)) {
      return { kind: 'pending', class: cls };
    }

    // 4. Active enrollment? In studentIds AND class is active.
    if (cls.status === 'active' && cls.studentIds?.includes(studentId)) {
      return { kind: 'active', class: cls };
    }

    // 5. Otherwise: rejected, archived, or faculty kicked them — clear the
    //    stale classCode so the student can join a new class cleanly.
    await updateDoc(doc(db, 'users', studentId), {
      'studentData.classCode': '',
      updatedAt: serverTimestamp() as Timestamp,
    });
    return { kind: 'none' };
  } catch (error: any) {
    throw new Error('Failed to resolve student class state: ' + error.message);
  }
};
// ─── End — student acceptance or rejection to a class by faculty ─────────────

/* -------------------------------------------------------------
   LEAVE CLASS
------------------------------------------------------------- */
export const leaveClass = async (studentId: string, _classId: string) => {
  try {
    // ─── Modified for instant-rejoin enrollment flow ─────────────────────────
    // Lightweight leave: only clear the student's classCode. studentIds on the
    // class doc is left intact so the year's roster is preserved, and so a
    // returning student can rejoin instantly via the REJOIN path in joinClass.
    // Faculty's removeStudentFromClass() is the only way to truly drop a UID
    // from studentIds (and that's their explicit, manual action).
    // _classId is kept in the signature for caller compatibility.
    // ─── End ─────────────────────────────────────────────────────────────────
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
   VERIFY CURRENT USER PASSWORD
------------------------------------------------------------- */
export const verifyCurrentUserPassword = async (password: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found.');
    if (!currentUser.email) throw new Error('User has no email.');

    // Check if user has a password provider
    const hasPasswordProvider = currentUser.providerData.some(
      provider => provider.providerId === 'password',
    );

    // If user only signed in with Google (no password provider), bypass password check
    if (!hasPasswordProvider) {
      return { success: true, bypassed: true };
    }

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      password,
    );
    await reauthenticateWithCredential(currentUser, credential);
    return { success: true, bypassed: false };
  } catch (error: any) {
    let errorMessage = 'Password verification failed.';
    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    throw new Error(errorMessage);
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

    switch (error.code) {
      case 'auth/invalid-email':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      case 'auth/too-many-requests':
        errorMessage =
          'Too many failed attempts. Please try again in a few minutes.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      default:
        errorMessage = 'Login failed. Please try again.';
    }

    const err = new Error(errorMessage);
    (err as any).code = error.code;
    throw err;
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
        profile => profile.providerId === 'google.com',
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
// GET STUDENT GENDER DISTRIBUTION
// ==============================================================================================================

export interface GenderDistribution {
  male: number;
  female: number;
  other: number;
  total: number;
}

/**
 * Counts enrolled students by sex (male / female / other).
 *
 * Scope is driven by the options:
 *  - classId  → only students on that class's roster (studentIds)
 *  - acadYear → only students whose classCode belongs to a class in that
 *               academic year
 *  - neither  → all students system-wide
 *
 * Used by the gender pie chart on the Admin dashboard (acadYear scope),
 * the Faculty dashboard, and the Admin per-class dashboard (classId scope).
 */
export const getStudentGenderDistribution = async (
  options: { classId?: string; acadYear?: string } = {},
): Promise<GenderDistribution> => {
  try {
    const tally = (students: UserDocument[]): GenderDistribution => {
      let male = 0;
      let female = 0;
      let other = 0;
      students.forEach(student => {
        const sex = (student.sex || '').toLowerCase();
        if (sex === 'male') male++;
        else if (sex === 'female') female++;
        else other++;
      });
      return { male, female, other, total: students.length };
    };

    // Class-scoped: reuse the roster resolver (reads studentIds → profiles).
    if (options.classId) {
      const students = await getEnrolledStudents(options.classId);
      return tally(students);
    }

    let students: UserDocument[] = [];

    if (options.acadYear) {
      // Limit to students whose classCode belongs to a class in this acad year.
      const { classCodes } = await getClassesByAcadYear(options.acadYear);
      const codes = Array.from(classCodes);
      if (codes.length === 0) return { male: 0, female: 0, other: 0, total: 0 };

      // Firestore caps `in` queries at 30 elements, so chunk the codes.
      const byUid = new Map<string, UserDocument>();
      for (let i = 0; i < codes.length; i += 30) {
        const chunk = codes.slice(i, i + 30);
        const snap = await getDocs(
          query(
            collection(db, 'users'),
            where('role', '==', 'student'),
            where('studentData.classCode', 'in', chunk),
          ),
        );
        snap.forEach((d: any) => {
          const data = d.data() as UserDocument;
          if (data.uid) byUid.set(data.uid, data);
        });
      }
      students = Array.from(byUid.values());
    } else {
      // System-wide: every student.
      const snap = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'student')),
      );
      snap.forEach((d: any) => students.push(d.data() as UserDocument));
    }

    return tally(students);
  } catch (error: any) {
    throw new Error('Failed to get gender distribution: ' + error.message);
  }
};

// ==============================================================================================================
// GET STUDENT GRADE-LEVEL DISTRIBUTION
// ==============================================================================================================

export interface GradeLevelDistribution {
  byGrade: Record<number, number>;
  total: number;
}

/**
 * Counts enrolled students grouped by the grade level of the class they are
 * enrolled in (NOT the student's own studentData.gradeLevel).
 *
 *  - acadYear provided → only classes in that academic year
 *  - acadYear omitted  → all classes (every academic year)
 *
 * Only students whose studentData.classCode currently points to one of those
 * classes are counted, so the result reflects active enrollment (students who
 * left, clearing their classCode, are excluded).
 *
 * Used by the "Students per Grade Level" chart on the Admin dashboard.
 */
export const getStudentGradeLevelDistribution = async (
  acadYear?: string,
): Promise<GradeLevelDistribution> => {
  try {
    // 1. Resolve the relevant classes and map each classCode to its grade.
    const classesQuery = acadYear
      ? query(collection(db, 'classes'), where('acadYear', '==', acadYear))
      : query(collection(db, 'classes'));
    const classesSnap = await getDocs(classesQuery);

    const codeToGrade = new Map<string, number>();
    classesSnap.forEach((d: any) => {
      const data = d.data() as ClassDocument;
      if (data.classCode && typeof data.gradeLevel === 'number') {
        codeToGrade.set(data.classCode, data.gradeLevel);
      }
    });
    if (codeToGrade.size === 0) return { byGrade: {}, total: 0 };

    // 2. Group enrolled students by their class's grade level.
    const studentsSnap = await getDocs(
      query(collection(db, 'users'), where('role', '==', 'student')),
    );

    const byGrade: Record<number, number> = {};
    let total = 0;
    studentsSnap.forEach((d: any) => {
      const student = d.data() as UserDocument;
      const code = student.studentData?.classCode;
      if (!code) return;
      const grade = codeToGrade.get(code);
      if (grade === undefined) return;
      byGrade[grade] = (byGrade[grade] || 0) + 1;
      total++;
    });

    return { byGrade, total };
  } catch (error: any) {
    throw new Error('Failed to get grade-level distribution: ' + error.message);
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


