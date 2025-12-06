import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection, where, limit, getDocs, arrayUnion, query } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Alert } from 'react-native';
import { UserDocument, UserRole, MiscueReportDocument, ClassDocument } from '../Types/dataInterfaces';

/**
 * Create User Account Credentials (Faculty or Student)
 * @param email 
 * @param password  
 * @param userData 
 */
export const SignUpUserCredentials = async (
  email: string,
  password: string,
  userData: {
    role: UserRole,
    firstName: string,
    middleName?: string,
    lastName: string,
    profileImageUrl?: string,
    gradeLevel?: number, // For student
    dateOfBirth?: Date, 
    assignedGradeLevel?: number[], // For faculty 
  }

) => {
  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Prepare base user document
    const userDocument: UserDocument = {
      uid: user.uid,
      email: email,
      role: userData.role,
      firstName: userData.firstName,
      middleName: userData.middleName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 3. Add user role-specific data
    if (userData.role === 'student') {
      userDocument.studentData = {
        gradeLevel: userData.gradeLevel || 1,
        dateOfBirth: userData.dateOfBirth || new Date(),
        classId: '', // Student can join after registration
        reading_Level: 'beginner'
      }
    } else if (userData.role === 'faculty') {
      userDocument.facultyData = {
        assignedGradeLevels: userData.assignedGradeLevel || [],
        assignedClassIds: []  // Will be populated when faculty creates classes
      };
    }

    // 4. Store User Credentials to Firestore in 'users' collection
    await setDoc(doc(db, 'users', user.uid), userDocument);

    // 5. For Faculty, create class automatically
    if (userData.role === 'faculty' && userData.assignedGradeLevel && userData.assignedGradeLevel.length > 0) {
      const initialGrade = userData.assignedGradeLevel[0];
      await createClass(user.uid, userData.firstName, userData.lastName, initialGrade);
    }

     return {success: true, user};
  } catch (error: any) {
    throw new Error(`Registration Failed: ${error.message}`);
  }
};

/**
 * CREATE CLASS FOR FACULTY
 * - Can create initial class during registration
 * - Can create additional classes later
 * @param facultyId 
 * @param firstName 
 * @param lastName 
 * @param assignedGradeLevel 
 * @returns created class
 */
export const createClass = async (
  facultyId: string,
  firstName: string,
  lastName: string,
  gradeLevel: number
) => {
  try {
    // Generate class id and class code
    const classId = `Class_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;
    const classCode = generateClassCode();

    const classDocument: ClassDocument = {
      classId: classId,
      classCode: classCode,
      className: `${firstName + ' ' + lastName}'s Class`,
      gradeLevel: gradeLevel,
      facultyId: facultyId,
      studentIds: [],
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: '' // This will be used when there's an update to this class by either the staff or admin
    };

    // Store class document
    await setDoc(doc(db, "classes", classId), classDocument);


    // Update faculty's assignedClassIds array with the new class code
    const facultyRef = doc(db, "users", facultyId);
    await updateDoc(facultyRef, {
      "facultyData.assignedClassIds": arrayUnion(classId),  // Add class code to array
      updatedAt: serverTimestamp()
    });
    return classCode;

  } catch (error: any) {
    throw new Error(`Automatic Class Registration Failed: ${error.message}`); 
  }
};

/**
 * Generates Class Code for the Faculty
 * @returns generated 6 characters of class code
 */
const generateClassCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i=0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random()*chars.length));
  }
  return code;
}


// ================================================== 
// GET USER PROFILE 
// ==================================================
export const getUserProfile = async (uid: string): Promise<UserDocument | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserDocument;
    }
    return null;
  } catch (error:any) {
    throw new Error(`Error getting user profile: ${error.message}`);      
  }
};


// ================================================== 
// UPDATE USER PROFILE 
// ==================================================
export const updateUserProfile = async (uid: string, updates: Partial<UserDocument>) => {
  try {
   const userRef = doc(db, "users", uid);
   await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
   }); 
   return {success: true};
  } catch (error: any) {
    throw new Error("Profle update failed: " + error.message);
  }
};

// ================================================== 
// STUDENT JOIN CLASS CODE 
// ==================================================
export const joinClass = async (studentId: string, joinClassCode: string ) => {
  try {
    // 1. Find class by class code
    const classesRef = collection(db, 'classes');
    const q = query(
      classesRef,
      where('classCode', '==', joinClassCode),
      where('isActive', '==', true),
      limit(1)
    );
    const classesQuery = await getDocs(q);
    
    if (classesQuery.empty) {
      throw new Error("Invalid or Inactive class code");
    };

    const classDoc = classesQuery.docs[0];
    const classData = classDoc.data();
    const classId = classData.classId;

    // 2. Check if the student is already in class
    if (classData.studentIds.includes(studentId)) {
      throw new Error("Already enrolled in this class");
    }

    // 3. Update class document where student is added to the class
    await updateDoc(doc(db, 'classes', classId), {
      studentIds: arrayUnion(studentId), // Use arrayUnion to add safely
      updatedAt: serverTimestamp() 
    }); 

    // 4. Update student document 
    await updateDoc(doc(db, 'users', studentId), {
      "studentData.classId": classId,
      updatedAt: serverTimestamp()
    })

    return { success: true, classId, className: classData.className };
  } catch (error: any) {
      throw new Error("Failed to join class: " + error.message);
  }
};

// ================================================== 
// CREATE MISCUE REPORT
// ==================================================
export const createMiscueReport = async (reportData: Omit<MiscueReportDocument, 'reporId' | 'createdAt'>) => {
  try {
    const reportRef = doc(collection(db, 'miscueReports'));
    const report: MiscueReportDocument = {
      ...reportData,
      reportId: reportRef.id,
      createdAt: serverTimestamp()
    };

    // Store Miscue Report to the 'miscueReports' document
    await setDoc(reportRef, report);

    return {success: true, reportId: reportRef.id};
  } catch (error:any) {
    throw new Error("Failed to store Miscue Report");
  }
};

// ================================================== 
// GET ALL FACULTY'S CLASS/CLASSES 
// ==================================================

export const getFacultyClasses = async(facultyId: string) => {
  try {
    const classRef = collection(db, 'classes');
    const classquery = query(classRef, where('facultyId', '==', facultyId));
    const querySnapshot = await getDocs(classquery);

    return querySnapshot.docs.map(doc => ({
      ...doc.data()
    })) as ClassDocument[];
  } catch (error:any) {
    throw new Error("Failed to get Faculty classes: " + error.message);
    
  }
};

// ================================================== 
// GET STUDENT'S CURRENT CLASS
// ==================================================
export const getStudentClass = async (studentId: string) => {
  try {
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    const studentData = studentDoc.data() as UserDocument;
    
    if (!studentData.studentData?.classId) {
      return null; // Student hasn't joined a class yet
    }
    
    const classDoc = await getDoc(doc(db, 'classes', studentData.studentData.classId));
    
    if (!classDoc.exists()) {
      return null;
    }
    
    return {
      ...classDoc.data()
    } as ClassDocument;
  } catch (error: any) {
    throw new Error("Failed to get student class: " + error.message);
  }
};