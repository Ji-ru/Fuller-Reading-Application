export interface StudentInformation {
    profileImage: string;
    firstName: string;
    middleName?: string; 
    lastName: string;
    gradeLevel: number;
    email: string;
    dateOfBirth: Date,
  }
  
  export interface MiscueReport {
    id?: string; 
    studentId: string; 
    timestamp: Date;
    substitution: string;
    omission: string;
    repetition: string;
    insertion: string;

  }

  export interface Student extends StudentInformation {
    id?: string; // Firestore document ID
    createdAt: Date;
    updatedAt: Date;
  }