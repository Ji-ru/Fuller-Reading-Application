// Navigation Dependencies
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// React-native Built-in Components
import { Alert } from 'react-native';

// Interfaces of the passages to be passed on with RootStackParamList 
import { Passage } from '../Types/passage';

// Interfaces of Students
import { BaseUserInformation, UserRole } from '../Types/dataInterfaces';
import { ScreenReplaceTypes } from 'react-native-screens';

// Specifies what parameters (data) each screen in your navigation stack can receive.
export type RootStackParamList = {
  Loading: undefined;
  SignUpCompleted: undefined;
  SignUpTwo: { userInfo: BaseUserInformation 
    additionalData?: {
      gradeLevel?: number;
      email?: string; 
    }
  };
  SignUpOne: undefined;
  Login: undefined;
  UserHome: undefined;
  PasageSelection: undefined;
  ReadingActivity: { passage: Passage };
  ReadingTesting: { passage: Passage };
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
   * Handles going back to the login page if the user is not verified
   * A destination based on the RootStackParamList, which only navigate back to login
   * Better handling for Loading back to login
   */
  const handleReplaceStep = (destination: ScreenNames) => {
    navigation.replace(destination as any);
  };

  // Handle navigation for SignUpOne to SignUpTwo conatining the necessary data for registration
  const handleSignUpNavigationWithData = ({
    profileImage,
    firstName,
    middleName,
    lastName,
    email,
    role,
    gradeLevel,
    dateOfBirth,
  }: {
    profileImage?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    role: UserRole;
    gradeLevel?: number;
    dateOfBirth?: Date; 
  }) => {
    // Basic validation
    if (!firstName || !lastName || !email) {
      Alert.alert('Missing Information', 'Please fill out all required fields.');
      return;
    }

    // Build StudentInformation object
    const userInfo: BaseUserInformation = {
      profileImage: profileImage || '',
      firstName,
      middleName,
      lastName,
      email: '',
      role // To be filled in SignUpTwo
    };

    // Navigate to SignUpTwo with the collected info
    navigation.navigate('SignUpTwo', { userInfo });
  };

  // Handles only the Reading Activity Page due to having data passed to the next page.
  const handleReadingNext = (passage: Passage) => {
    // navigation.navigate('ReadingActivity', { passage });
    navigation.navigate('ReadingTesting', { passage });
  };
  // Handles Back Button in any page the current user is in
  const handleBackStep = () => {
    navigation.goBack();
  };

  // Handles Logout Event (Needed modification when Firebase Auth is integrated)
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
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
    handleReplaceStep,
    handleSignUpNavigationWithData,
    handleReadingNext,
    handleBackStep,
    handleLogout,
    handleCancelRegistration,
  };
};
