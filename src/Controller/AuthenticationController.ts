import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../../firebaseConfig';
import { Admin, Faculty, Student } from "../Types/dataInterfaces";
import { Alert } from "react-native";

// REGISTER NEW STUDENT (Auth + Firebase)

export const registerStudent = async (student: Student, password: string) => {
    try {
        // Create user account in Firebase Auth
        const studentCredential = await createUserWithEmailAndPassword(auth, student.email, password);
        const user = studentCredential.user;

        // Store student data in Firestore
        const studentDocuments = {
            profileImage: student.profileImage ?? "",
            firstName: student.firstName,
            middleName: student.middleName ?? "",
            lastName: student.lastName,
            gradeLevel: student.gradeLevel,
            email: student.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Creates the main document (create if not exists) named 'student'
        await setDoc(doc(db, "students", user.uid), studentDocuments);

        return user;
    } catch (error: any) {
        throw new Error("Registration Failed: " + error.message)
    }
};


// REGISTER NEW FACULTY (Auth + Firebase)
export const registerFaculty = async (faculty: Faculty, password: string) => {
    try {
        // Create user account in Firebase Auth
        const facultyCredential = await createUserWithEmailAndPassword(auth, faculty.email, password);
        const user = facultyCredential.user;

        // Store student data in Firestore
        const facultyDocuments = {
            profileImage: faculty.profileImage ?? "",
            firstName: faculty.firstName,
            middleName: faculty.middleName ?? "",
            lastName: faculty.lastName,
            email: faculty.email,
            role: faculty.role,
            status: faculty.status ?? "deny",
            classCode: faculty.classCode,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Creates the main document (create if not exists) named 'student'
        await setDoc(doc(db, "faculty", user.uid), facultyDocuments);

        return user;

    } catch (error: any) {
        throw new Error("Registration Failed: " + error.message);
    }
};

// REGISTER NEW ADMIN (Auth + Firebase)
export const registerAdmin = async (admin: Admin, password: string) => {
    try {
        // Create user account in Firebase Auth
        const adminCredential = await createUserWithEmailAndPassword(auth, admin.email, password);
        const user = adminCredential.user;

        // Store student data in Firestore
        const facultyDocuments = {
            profileImage: admin.profileImage ?? "",
            firstName: admin.firstName,
            middleName: admin.middleName ?? "",
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        // Creates the main document (create if not exists) named 'student'
        await setDoc(doc(db, "faculty", user.uid), facultyDocuments);

        return user;
    } catch (error: any) {
        throw new Error("Registration Failed: " + error.message)
    }
};

// LOGIN EXISTING USER CREDENTIALS
export const loginStudent = async (email: string, password: string): Promise<User> => {
    try {
        const userCredentialVerfication = await signInWithEmailAndPassword(auth, email, password);
        return userCredentialVerfication.user;

    } catch (error: any) {
        throw new Error("Login Failed: " + error.message);
    }
}

// LOGOUT CURRENT LOGGED-IN STUDENT
export const logoutStudent = async () => {
    try {
        await signOut(auth);
    } catch (error: any) {
        throw new Error("Failed Logout: " + error.message);
    }
}

