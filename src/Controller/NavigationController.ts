// This file defines a custom React hook: you can use React hooks like useState, useEffect, useRef, useCallback, useMemo inside this function component or custom hook.
// For example: useState for local state, useCallback for memoized navigation handlers, useEffect for side effects, useRef to hold persistent values, useMemo for memoized values.
// Only call hooks at the top level of a function component or custom hook (never in regular JS functions or classes).
// Navigation Dependencies
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// React-native Built-in Components
import { Alert } from 'react-native';

// Interfaces of the passages to be passed on with RootStackParamList
import { ReadingMaterial } from '../Interfaces/passage';

// Interfaces of Students
import { UserDocument, UserRole, ActivityResultDocument } from '../Interfaces/dataInterfaces';

import { ScreenReplaceTypes } from 'react-native-screens';
import { logoutUser } from './AuthenticationController';

// Specifies what parameters (data) each screen in your navigation stack can receive.
export type RootStackParamList = {
  Loading: undefined;
  SignUpCompleted: { role: UserRole };
  SignUpTwo: { userInfo: Partial<UserDocument> };
  SignUpOne: { role: UserRole };
  Login: undefined;

  // STUDENT NAVIGATION
  UserHome: undefined;
  PassageSelection: undefined;
  ReadingActivity: {
    readingMaterial: ReadingMaterial;
    type: 'alphabet' | 'passage' | 'word';
    items?: ReadingMaterial[];
    initialIndex?: number;
  };

  ReadingHistory: undefined;
  ChooseRole: undefined;
  Profile: undefined;

  // FACULTY NAVIGATION
  FacultyDashboard: undefined;
  FacultyProfile: undefined;
  MyClass: undefined;
  Archive: undefined;
  MyStudents: {
    classId: string;
    className?: string;
    classCode: string;
    acadYear: string;
  };
  StudentViewProfile: {
    studentId: string;
    studentName: string;
    readingLevel: string;
  };


  // ADMIN NAVIGATION
  AdminDashboard: undefined;
  UserManagement: undefined;

  // ASSESSMENT NAVIGATION
  FacultyAssessments: undefined;
  FacultyCreateAssessment: { activity?: any }; // Optional activity for editing
  StudentAssessments: undefined;
  StudentAssessmentActivity: { activityId: string };
  StudentAssessmentReview: { result: ActivityResultDocument };
};


// A list of all the screens within RootStackParamList
type ScreenNames = keyof RootStackParamList;

/**
 * User Navigation Handler
 * @returns - a navigation handler containing all reausable functions to navigate users
 */
export const useNavigationHelper = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  /**
   * Handles the simple next navigation
   * @param destination  a destination based on the RootStackParamList going to any page based on the roles
   */
  const handleNextStep = (destination: ScreenNames) => {
    navigation.navigate(destination as any);
  };

  /**
   * For bottom navigation - always uses replace
   */
  const handleTabNavigation = (destination: ScreenNames) => {
    navigation.replace(destination as any);
  };

  const handleNavigateStep = (destination: ScreenNames) => {
    navigation.navigate(destination as any);
  };

  /**
   * Handles going back to the login page if the user is not verified
   * A destination based on the RootStackParamList, which only navigate back to login
   * Better handling for Loading back to login
   */
  const handleReplaceStep = (destination: ScreenNames) => {
    navigation.replace(destination as any);
  };

  // Handle navigation for SignUpOne to SignUpTwo conatining the necessary data for registration
  const handleSignUpNavigationWithData = ({
    profileImageUrl,
    firstName,
    middleName,
    lastName,
    email,
    role,
    sex,
    gradeLevel,
    dateOfBirth,
    classCode,
    facultyCode,
    assignedGradeLevels,
  }: {
    profileImageUrl?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    role: UserRole;
    sex: string;
    gradeLevel?: number;
    dateOfBirth?: string;
    assignedGradeLevels?: number[];
    classCode?: string;
    facultyCode?: string;
  }) => {
    // Basic validation
    if (!firstName || !lastName) {
      Alert.alert(
        'Missing Information',
        'Pakisagutan ang lahat ng kinakailangang field.',
      );
      return;
    }

    if (role === 'student' && (!gradeLevel || !dateOfBirth)) {
      Alert.alert(
        'Missing Information',
        'Pakisagutan ang lahat ng kinakailangang impormasyon para sa pagrerehistro.',
      );
      return;
    }

    if (role === 'faculty' && !assignedGradeLevels) {
      Alert.alert(
        'Missing Information',
        'Please select an assigned grade level for faculty.',
      );
      return;
    }

    // Build StudentInformation object
    const userInfo: any = { // Use any briefly to allow dynamic fields passed to step 2
      profileImageUrl: profileImageUrl || '',
      firstName,
      middleName,
      lastName,
      email,
      role,
      sex,
      classCode,
      facultyCode,
    };
    // Add role-specific data
    if (role === 'student') {
      userInfo.studentData = {
        gradeLevel: gradeLevel!,
        dateOfBirth: dateOfBirth!,
        reading_Level: 'beginner',
      };
    } else if (role === 'faculty') {
      userInfo.facultyData = {
        assignedGradeLevels: assignedGradeLevels!,
        assignedClassIds: [],
      };
    }

    // Navigate to SignUpTwo with the collected info
    navigation.navigate('SignUpTwo', { userInfo });
  };

  // Add a method to navigate from ChooseRole to SignUpOne
  const handleRoleSelection = (role: UserRole) => {
    if (role === 'student') {
      navigation.navigate('SignUpOne', { role });
    } else if (role === 'admin') {
      navigation.navigate('SignUpOne', { role });
    } else {
      navigation.navigate('SignUpOne', { role });
    }
  };

  const handleCompletedRegistration = (role: UserRole) => {
    navigation.navigate('SignUpCompleted', { role });
  };

  const handleDesignatedUserPage = (role: string) => {
    if (role === 'student') {
      navigation.navigate('UserHome');
    } else if (role === 'faculty') {
      navigation.navigate('FacultyDashboard');
    } else if (role === 'admin') {
      navigation.navigate('AdminDashboard');
    }
  };

  // Handles only the Reading Activity Page due to having data passed to the next page.
  const handleReadingNext = (
    readingMaterial: ReadingMaterial,
    type: 'alphabet' | 'passage' | 'word',
    items?: ReadingMaterial[],
    initialIndex?: number,
  ) => {
    navigation.navigate('ReadingActivity', { readingMaterial, type, items, initialIndex });
  };

  const handleHistoryNext = () => {
    navigation.navigate('ReadingHistory');
  };

  const handleClassStudents = (classData: {
    classId: string;
    className?: string;
    classCode: string;
    acadYear: string
  }) => {
    navigation.navigate('MyStudents', classData);
  };

  const handleStudentViewStats = (studentData: {
    studentId: string;
    studentName: string;
    readingLevel: string;
  }) => {
    navigation.navigate('StudentViewProfile', studentData);
  };

  const handleAssessmentNext = (activityId: string) => {
    navigation.navigate('StudentAssessmentActivity', { activityId });
  };

  const handleAssessmentReview = (result: ActivityResultDocument) => {
    navigation.navigate('StudentAssessmentReview', { result });
  };

  // Handles Back Button in any page the current user is in
  const handleBackStep = () => {
    navigation.goBack();
  };

  // Handles Logout Event (Needed modification when Firebase Auth is integrated)
  const handleLogout = async () => {
    try {
      // Call the firebase logout function
      await logoutUser();

      // Reset Navigation Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Logout Failed', 'Unable to logout. Please try again.');
    }
  };

  // Handles canceling of registration (Needed modification when Firebase Auth is integrated)
  const handleCancelRegistration = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel? Your progress will be lost.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Discard Progress',
          style: 'destructive',
          onPress: () =>
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ],
    );
  };
  return {
    handleNextStep,
    handleTabNavigation,
    handleNavigateStep,
    handleReplaceStep,
    handleSignUpNavigationWithData,
    handleDesignatedUserPage,
    handleCompletedRegistration,
    handleRoleSelection,
    handleReadingNext,
    handleHistoryNext,
    handleClassStudents,
    handleStudentViewStats,
    handleAssessmentNext,
    handleAssessmentReview,
    handleBackStep,
    handleLogout,
    handleCancelRegistration,
  };
};
