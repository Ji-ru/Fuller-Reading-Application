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
  EnrollmentRequestDocument,
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
      where('acadYear', '==', currentAcadYear)
    );
    const duplicateSnapshot = await getDocs(duplicateQuery);
    if (!duplicateSnapshot.empty) {
      throw new Error(`The class name "${className}" is already taken for the ${currentAcadYear} academic year.`);
    }
    // 2. Proceed with normal creation
    const classId = `Class_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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

  // ─── Added for student acceptance or rejection to a class by faculty ───────
  // Auto-reject any pending requests so students aren't stuck waiting forever.
  const pendingQuery = query(
    collection(db, 'enrollmentRequests'),
    where('classId', '==', classId),
    where('status', '==', 'pending'),
  );
  const pendingSnap = await getDocs(pendingQuery);
  if (!pendingSnap.empty) {
    const batch = writeBatch(db);
    pendingSnap.docs.forEach((d: any) => {
      batch.update(d.ref, {
        status: 'rejected',
        decidedAt: serverTimestamp() as Timestamp,
        decidedBy: facultyId,
      });
    });
    await batch.commit();
  }
  // ─── End ──────────────────────────────────────────────────────────────────
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
    throw new Error('Password reset email failed: ' + (error?.message || 'unknown error'));
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
  // ─── Added for student acceptance or rejection to a class by faculty ───────
  'enrollmentRequests',
  // ─── End ──────────────────────────────────────────────────────────────────
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
  const classCode: string | undefined = (studentSnap.data() as UserDocument | undefined)
    ?.studentData?.classCode;

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

  for (const coll of STUDENT_DATA_COLLECTIONS) {
    await deleteDocsWhereStudentId(coll, uid);
  }

  await deleteDoc(doc(db, 'users', uid));
};

const cascadeDeleteFaculty = async (uid: string) => {
  const facultySnap = await getDoc(doc(db, 'users', uid));
  const assignedClassIds: string[] =
    (facultySnap.data() as UserDocument | undefined)?.facultyData?.assignedClassIds || [];

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

  // ─── Added for student acceptance or rejection to a class by faculty ───────
  // Wipe any enrollment requests addressed to this faculty (denormalized field).
  const reqsSnap = await getDocs(
    query(collection(db, 'enrollmentRequests'), where('facultyId', '==', uid)),
  );
  if (!reqsSnap.empty) {
    const docs = reqsSnap.docs;
    for (let i = 0; i < docs.length; i += 500) {
      const batch = writeBatch(db);
      docs.slice(i, i + 500).forEach((d: any) => batch.delete(d.ref));
      await batch.commit();
    }
  }
  // ─── End ──────────────────────────────────────────────────────────────────

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
    throw new Error('Admin user delete failed: ' + (error?.message || 'unknown error'));
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
    throw new Error('Admin create user failed: ' + (error?.message || 'unknown error'));
  }
};

/* -------------------------------------------------------------
   JOIN CLASS
   ─── Modified for student acceptance or rejection to a class by faculty ───
   IMPORTANT BEHAVIOR CHANGE: this function NO LONGER enrolls the student
   immediately. It creates a *pending* EnrollmentRequest document. The student
   becomes a member of the class only after the faculty calls
   acceptEnrollmentRequest(). The function name is unchanged for caller
   convenience, but the return shape now includes status: 'pending'.

   Constraints enforced here:
     - Class code must resolve to an *active* class (archived classes don't
       accept new requests).
     - Student must not already be enrolled in this class.
     - Student must not already have a pending request to ANY class
       (one pending at a time keeps the UI deterministic). Race window is
       narrow but non-zero; acceptance-time validation can catch the rest.
   ─── End ────────────────────────────────────────────────────────────────────
------------------------------------------------------------- */
export const joinClass = async (studentId: string, joinClassCode: string) => {
  try {
    // 1. Resolve the class by code
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

    // 2. Only active classes accept new requests
    if (classData.status !== 'active') {
      throw new Error('This class is no longer accepting new students.');
    }

    // 3. Block if student is already enrolled
    if (classData.studentIds?.includes(studentId)) {
      throw new Error('You are already enrolled in this class.');
    }

    // 4. Block if student already has a pending request anywhere
    const existingPendingSnap = await getDocs(
      query(
        collection(db, 'enrollmentRequests'),
        where('studentId', '==', studentId),
        where('status', '==', 'pending'),
        limit(1),
      ),
    );
    if (!existingPendingSnap.empty) {
      throw new Error(
        'You already have a pending request to another class. Cancel it before requesting a new one.',
      );
    }

    // 5. Pre-fetch student profile to denormalize the display name on the request
    const studentSnap = await getDoc(doc(db, 'users', studentId));
    if (!studentSnap.exists()) throw new Error('Student profile not found.');
    const student = studentSnap.data() as UserDocument;
    const studentName = `${student.firstName} ${student.middleName ?? ''} ${student.lastName}`
      .replace(/\s+/g, ' ')
      .trim();

    // 6. Create the pending enrollment request
    const requestRef = doc(collection(db, 'enrollmentRequests'));
    const reqDoc: EnrollmentRequestDocument = {
      requestId: requestRef.id,
      studentId,
      studentName,
      classId: classData.classId,
      classCode: classData.classCode,
      facultyId: classData.facultyId,
      status: 'pending',
      requestedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(requestRef, reqDoc);

    return {
      success: true,
      requestId: requestRef.id,
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
   ENROLLMENT REQUEST FUNCTIONS
   - cancelEnrollmentRequest:    student withdraws their own pending request
   - acknowledgeRejection:       student dismisses the "rejected" notice
   - getPendingRequestsForClass: faculty reads pending list for one class
   - getStudentLatestRequest:    helper used by resolveStudentClassState
   - acceptEnrollmentRequest:    faculty approves (atomic batch w/ class roster)
   - rejectEnrollmentRequest:    faculty declines (optional reason)
   - resolveStudentClassState:   Student_MyClass entry point; returns a
                                  discriminated state and self-heals the
                                  student's classCode on first sight of an
                                  accepted request.
   Note: faculty cannot write to user docs under current security rules, so
   the student's classCode is reconciled on the student's own next session.
   ─── End ──────────────────────────────────────────────────────────────────
------------------------------------------------------------- */

// ─── Added for student acceptance or rejection to a class by faculty ─────────
export const cancelEnrollmentRequest = async (requestId: string) => {
  try {
    const requestRef = doc(db, 'enrollmentRequests', requestId);
    const snap = await getDoc(requestRef);
    if (!snap.exists()) throw new Error('Request not found.');
    const data = snap.data() as EnrollmentRequestDocument;
    if (data.status !== 'pending') {
      throw new Error('Only pending requests can be cancelled.');
    }
    await updateDoc(requestRef, {
      status: 'cancelled',
      decidedAt: serverTimestamp() as Timestamp,
    });
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to cancel request: ' + error.message);
  }
};

export const acknowledgeRejection = async (requestId: string) => {
  try {
    const requestRef = doc(db, 'enrollmentRequests', requestId);
    await updateDoc(requestRef, { acknowledgedByStudent: true });
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to acknowledge rejection: ' + error.message);
  }
};

export const getPendingRequestsForClass = async (
  classId: string,
): Promise<EnrollmentRequestDocument[]> => {
  try {
    const q = query(
      collection(db, 'enrollmentRequests'),
      where('classId', '==', classId),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => d.data() as EnrollmentRequestDocument);
  } catch (error: any) {
    throw new Error('Failed to fetch pending requests: ' + error.message);
  }
};

export const acceptEnrollmentRequest = async (
  requestId: string,
  facultyId: string,
) => {
  try {
    const requestRef = doc(db, 'enrollmentRequests', requestId);
    const reqSnap = await getDoc(requestRef);
    if (!reqSnap.exists()) throw new Error('Request not found.');
    const request = reqSnap.data() as EnrollmentRequestDocument;

    if (request.facultyId !== facultyId) {
      throw new Error('Not authorized to act on this request.');
    }
    if (request.status !== 'pending') {
      throw new Error('Request is no longer pending.');
    }

    const batch = writeBatch(db);
    batch.update(requestRef, {
      status: 'accepted',
      decidedAt: serverTimestamp() as Timestamp,
      decidedBy: facultyId,
    });
    batch.update(doc(db, 'classes', request.classId), {
      studentIds: arrayUnion(request.studentId),
      updatedAt: serverTimestamp() as Timestamp,
    });
    await batch.commit();

    return { success: true, classId: request.classId, studentId: request.studentId };
  } catch (error: any) {
    throw new Error('Failed to accept request: ' + error.message);
  }
};

export const rejectEnrollmentRequest = async (
  requestId: string,
  facultyId: string,
) => {
  try {
    const requestRef = doc(db, 'enrollmentRequests', requestId);
    const reqSnap = await getDoc(requestRef);
    if (!reqSnap.exists()) throw new Error('Request not found.');
    const request = reqSnap.data() as EnrollmentRequestDocument;

    if (request.facultyId !== facultyId) {
      throw new Error('Not authorized to act on this request.');
    }
    if (request.status !== 'pending') {
      throw new Error('Request is no longer pending.');
    }

    await updateDoc(requestRef, {
      status: 'rejected',
      decidedAt: serverTimestamp() as Timestamp,
      decidedBy: facultyId,
    });

    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to reject request: ' + error.message);
  }
};

/**
 * Single source of truth for the student-facing "what is my class status?"
 * question. Reads the student's profile + their request history (1 query) and
 * folds the result into a discriminated union. Also self-heals the student's
 * classCode field on first sight of an accepted request.
 */
export const resolveStudentClassState = async (
  studentId: string,
): Promise<StudentClassState> => {
  try {
    // 1. Pull student profile (for currentCode + name fallback)
    const studentSnap = await getDoc(doc(db, 'users', studentId));
    if (!studentSnap.exists()) throw new Error('Student profile not found.');
    const student = studentSnap.data() as UserDocument;
    const currentCode = student.studentData?.classCode || '';

    // 2. Pull ALL of this student's requests (single-field index, no composite needed)
    const reqSnap = await getDocs(
      query(
        collection(db, 'enrollmentRequests'),
        where('studentId', '==', studentId),
      ),
    );
    const allRequests: EnrollmentRequestDocument[] = reqSnap.docs.map(
      (d: any) => d.data() as EnrollmentRequestDocument,
    );

    // 3. Sort newest-first by requestedAt so "latest" semantics are predictable
    allRequests.sort((a: EnrollmentRequestDocument, b: EnrollmentRequestDocument) => {
      const aMs = (a.requestedAt as any)?.toMillis?.() ?? 0;
      const bMs = (b.requestedAt as any)?.toMillis?.() ?? 0;
      return bMs - aMs;
    });

    const pending = allRequests.find(
      (r: EnrollmentRequestDocument) => r.status === 'pending',
    );
    if (pending) return { kind: 'pending', request: pending };

    // 4. Look for an accepted request whose classCode isn't yet on the student
    //    doc — that means the faculty accepted while the student was offline
    //    or the previous session ended before reconciliation. Apply it now.
    const acceptedUnapplied = allRequests.find(
      (r: EnrollmentRequestDocument) =>
        r.status === 'accepted' && r.classCode !== currentCode,
    );
    if (acceptedUnapplied) {
      await updateDoc(doc(db, 'users', studentId), {
        'studentData.classCode': acceptedUnapplied.classCode,
        updatedAt: serverTimestamp() as Timestamp,
      });
      // Fetch the class for immediate rendering
      const classSnap = await getDocs(
        query(
          collection(db, 'classes'),
          where('classCode', '==', acceptedUnapplied.classCode),
          where('status', '==', 'active'),
          limit(1),
        ),
      );
      const classData = classSnap.empty
        ? null
        : (classSnap.docs[0].data() as ClassDocument);
      return { kind: 'just_accepted', request: acceptedUnapplied, class: classData };
    }

    // 5. Unacknowledged rejection → show the notice once
    const rejected = allRequests.find(
      (r: EnrollmentRequestDocument) =>
        r.status === 'rejected' && !r.acknowledgedByStudent,
    );
    if (rejected) return { kind: 'rejected', request: rejected };

    // 6. Student has a classCode set → return the active class
    if (currentCode) {
      const classData = await getStudentClass(studentId);
      if (classData) return { kind: 'active', class: classData };
    }

    // 7. No class, no pending/rejected business
    return { kind: 'none' };
  } catch (error: any) {
    throw new Error('Failed to resolve student class state: ' + error.message);
  }
};
// ─── End — student acceptance or rejection to a class by faculty ─────────────

/* -------------------------------------------------------------
   LEAVE CLASS
------------------------------------------------------------- */
export const leaveClass = async (studentId: string, classId: string) => {
  try {

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
   VERIFY CURRENT USER PASSWORD
------------------------------------------------------------- */
export const verifyCurrentUserPassword = async (password: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user found.');
    if (!currentUser.email) throw new Error('User has no email.');

    // Check if user has a password provider
    const hasPasswordProvider = currentUser.providerData.some(
      (provider) => provider.providerId === 'password'
    );

    // If user only signed in with Google (no password provider), bypass password check
    if (!hasPasswordProvider) {
      return { success: true, bypassed: true };
    }

    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
    return { success: true, bypassed: false };
  } catch (error: any) {
    let errorMessage = 'Password verification failed.';
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
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
