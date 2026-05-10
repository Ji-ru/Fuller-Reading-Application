// This file defines a custom React hook: you can use React hooks like useState, useEffect, useRef, useCallback, useMemo inside this function component or custom hook.
// For example: useState for local state, useCallback for memoized navigation handlers, useEffect for side effects, useRef to hold persistent values, useMemo for memoized values.
// Only call hooks at the top level of a function component or custom hook (never in regular JS functions or classes).
// Navigation Dependencies
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// React-native Built-in Components
import { Alert } from 'react-native';
import { serverTimestamp, Timestamp } from '@react-native-firebase/firestore';

// Interfaces of the passages to be passed on with RootStackParamList
import { ReadingMaterial } from '../Interfaces/passage';

// Interfaces of Students
import { UserDocument, UserRole } from '../Interfaces/dataInterfaces';
import { logoutUser } from './AuthenticationController';
import { WordContext } from '../Interfaces/dataInterfaces';

// Specifies what parameters (data) each screen in your navigation stack can receive.
export type RootStackParamList = {
  Loading: undefined;
  SignUpCompleted: { role: UserRole };
  SignUpTwo: {
    role: UserRole;
    accountInfo: {
      email: string;
      password?: string;
      parentConfirmed?: boolean;
      googleEmail?: string;
    };
  };
  SignUpOne: { role: UserRole; googleEmail?: string };
  Login: { authError?: string } | undefined;

  // STUDENT NAVIGATION
  UserHome: undefined;
  PassageSelection: undefined;
  ReadingActivity: {
    readingMaterial: ReadingMaterial;
    type: 'alphabet' | 'passage' | 'word';
    wordContext?: WordContext;
  };
  StudentMyClass: undefined;
  ReadingHistory: undefined;
  Profile: undefined;

  ChooseRole: { googleEmail?: string } | undefined;

  // FACULTY NAVIGATION
  FacultyDashboard: undefined;
  FacultyProfile: undefined;
  MyClass: undefined;
  MyArchive: undefined;
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
    gradeLevel?: number;
  };

  // ADMIN NAVIGATION
  AdminDashboard: undefined;
  AdminUserManagement: undefined;
  AdminViewFacultyData: {
    facultyId: string;
    facultyName: string;
  };

  FacultyTabs: undefined;
  About: undefined;
};

// A list of all the screens within RootStackParamList
type ScreenNames = keyof RootStackParamList;

/**
 * User Navigation Handler
 * @returns - a navigation handler containing all reausable functions to navigate users
 */
export const useNavigationHelper = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();

  /**
   * Handles the simple next navigation
   * @param destination  a destination based on the RootStackParamList going to any page based on the roles
   *
   * Updated: added an optional params argument
   */
  const handleNextStep = <RouteName extends ScreenNames>(
    destination: RouteName,
    params?: RootStackParamList[RouteName],
  ) => {
    navigation.navigate(destination as any, params as any);
  };

  /**
   * Handles going back to the login page if the user is not verified
   * A destination based on the RootStackParamList, which only navigate back to login
   * Better handling for Loading back to login
   */
  const handleReplaceStep = <RouteName extends ScreenNames>(
    destination: RouteName,
    params?: RootStackParamList[RouteName],
  ) => {
    navigation.replace(destination as any, params as any);
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
    assignedGradeLevels,
    googleEmail,
    parentConsent,
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
    googleEmail?: string;
    parentConsent?: {
      confirmed: boolean;
    };
  }) => {
    // Basic validation
    if (!firstName || !lastName) {
      Alert.alert(
        'Missing Information',
        'Please fill out all required fields.',
      );
      return;
    }

    if (role === 'student' && (!gradeLevel || !dateOfBirth)) {
      Alert.alert(
        'Missing Information',
        'Please fill out all required fields for student registration.',
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
    const userInfo: Partial<UserDocument> & { googleEmail?: string } = {
      profileImageUrl: profileImageUrl || '',
      firstName,
      middleName,
      lastName,
      email: '',
      role,
      sex,
      googleEmail,
    };
    // Add role-specific data
    if (role === 'student') {
      userInfo.studentData = {
        gradeLevel: gradeLevel!,
        dateOfBirth: dateOfBirth!,
        reading_Level: 'beginner',
        parentConsent: {
          confirmed: false,
        },
      };
    } else if (role === 'faculty') {
      userInfo.facultyData = {
        assignedGradeLevels: assignedGradeLevels!,
        assignedClassIds: [],
      };
    }

    // Navigate to SignUpTwo with the collected info
    navigation.navigate('SignUpTwo', { role, accountInfo: {} as any }); // Placeholder for type compatibility while migrating
  };

  /**
   * Handles navigation from SignUpOne to SignUpTwo in the NEW flow
   * (Step 1: Account Credentials -> Step 2: Personal Information)
   */
  const handleAccountStepNext = (
    role: UserRole,
    accountInfo: {
      email: string;
      password?: string;
      parentConfirmed?: boolean;
      googleEmail?: string;
    },
  ) => {
    navigation.navigate('SignUpTwo', { role, accountInfo });
  };

  // Add a method to navigate from ChooseRole to SignUpOne
  const handleRoleSelection = (role: UserRole) => {
    if (role === 'student') {
      navigation.navigate('SignUpOne', { role });
    } else if (role === 'faculty') {
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
      navigation.replace('UserHome');
    } else if (role === 'faculty') {
      navigation.replace('FacultyTabs');
    } else if (role === 'admin') {
      navigation.replace('AdminDashboard');
    }
  };

  /**
   * Handles naviagtion based on the selected user to view their information and monitor progress of a student or faculty
   * @param param - multiple varibales in array is used to pass information to another page (either Faculty_Student_View_Profile or Admin_ViewFacultyData)
   *
   * PENDING ADMIN INFORMATION (STILL UNDECIDED IF NECESSARY)
   */
  const handleNavigateToUserDetail = ({
    uid,
    firstName,
    middleName,
    lastName,
    email,
    role,
    sex,
    reading_Level,
  }: {
    uid: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    role?: UserRole;
    sex: string;
    reading_Level?: 'beginner' | 'emerging' | 'intermediate' | 'advanced';
  }) => {
    if (role === 'student') {
      handleStudentViewStats({
        studentId: uid,
        studentName: `${firstName} ${middleName ?? ''} ${lastName}`.trim(),
        readingLevel: reading_Level || '',
      });
    } else if (role === 'faculty') {
      handleFacultyViewData({
        facultyId: uid,
        facultyName: `${firstName} ${middleName ?? ''} ${lastName}`.trim(),
        email: email || '',
        role: role,
        sex: sex,
      });
    }
  };

  // Handles only the Reading Activity Page due to having data passed to the next page.
  const handleReadingNext = (
    readingMaterial: ReadingMaterial,
    type: 'alphabet' | 'passage' | 'word',
    wordContext?: WordContext,
  ) => {
    navigation.navigate('ReadingActivity', {
      readingMaterial,
      type,
      wordContext,
    });
  };

  const handleHistoryNext = () => {
    navigation.navigate('ReadingHistory');
  };

  // Handles navigation to view the faculty's class. Must be signed-in faculty credentials
  const handleClassStudents = (classData: {
    classId: string;
    className?: string;
    classCode: string;
    acadYear: string;
  }) => {
    navigation.navigate('MyStudents', classData);
  };

  // Handles navigation to view faculty data to monitor their class' progress
  const handleFacultyViewData = (facultyData: {
    facultyId: string;
    facultyName: string;
    email: string;
    role: UserRole;
    sex: string;
  }) => {
    navigation.navigate('AdminViewFacultyData', facultyData);
  };

  // Handles navigation to view students progress
  const handleStudentViewStats = (studentData: {
    studentId: string;
    studentName: string;
    readingLevel: string;
  }) => {
    navigation.navigate('StudentViewProfile', studentData);
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
  const handleCancelRegistration = (confirm: boolean = true) => {
    if (!confirm) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

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
    routeParams: route.params,
    handleNavigateToUserDetail,
    handleNextStep,
    handleReplaceStep,
    handleSignUpNavigationWithData,
    handleDesignatedUserPage,
    handleFacultyViewData,
    handleCompletedRegistration,
    handleRoleSelection,
    handleReadingNext,
    handleHistoryNext,
    handleClassStudents,
    handleStudentViewStats,
    handleBackStep,
    handleLogout,
    handleCancelRegistration,
    handleAccountStepNext,
  };
};
