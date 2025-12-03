/**
 * BASIC INFORMATION USED BY ALL USERS
 */
export interface BaseUserInformation {
  profileImage?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: UserRole;
}

/**
 * TYPES OF USER ROLES
 *  - used in base user information
 */
export type UserRole = 'student' | 'faculty' | 'admin';

// Firestore document interfaces
/**
 * STUDENT INFORMATION extending BASIC INFORMATION 
 *  Additional infos:
 *  - role
 *  - grade level
 *  - date of birth 
 *  - class code
 */
export interface Student extends BaseUserInformation {
  id: string; // Firestore document ID
  gradeLevel: number;
  createdAt: Date;
  updatedAt: Date;
  dateOfBirth: Date; // Assigned faculty members
  classCode?: string; // May have class code, may also have otherwise
}

/**
 * FACULTY INFORMATION extending BASIC INFORMATION 
 * Additional infos: 
 *  - grade level => the grade level this teacher they handled 
 *  - class code => a code where they can monitor students based on the class code. They dont have to search from all the list of students
 */
export interface Faculty extends BaseUserInformation {
  id: string;
  gradeLevel: number;
  status?: UserStatus; // pending / approved / rejected
  createdAt: Date;
  updatedAt: Date;
  classCode?: string; // Assigned class code (created by default after registration) 
}

/**
 * TYPES OF USER ROLES
 *  - used in base user information
 */
export type UserStatus = 'pending' | 'approved' | 'rejected';

/**
 * ADMIN INFORMATION extending BASIC INFORMATION
 */
export interface Admin extends BaseUserInformation {
  id: string; // Firestore document ID
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MISCUE REPORT INSTERFACE USED BY STUDENTS
 * - Storing miscue data made by the students through reading
 */
export interface MiscueReport {
  id?: string;
  studentId: string;
  timestamp: Date;
  substitution: string;
  omission: string;
  repetition: string;
  insertion: string;
  passageTitle?: string;
  passageText?: string;
  accuracyRate?: number;
}
