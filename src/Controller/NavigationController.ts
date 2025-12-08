// Navigation Dependencies
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// React-native Built-in Components
import { Alert } from 'react-native';

// Interfaces of the passages to be passed on with RootStackParamList
import { ReadingMaterial } from '../Types/passage';

// Interfaces of Students
import { UserDocument, UserRole } from '../Types/dataInterfaces';
import { ScreenReplaceTypes } from 'react-native-screens';
import { logoutUser } from './AuthenticationController';

// Specifies what parameters (data) each screen in your navigation stack can receive.
export type RootStackParamList = {
  Loading: undefined;
  SignUpCompleted: undefined;
  SignUpTwo: { userInfo: Partial<UserDocument> };
  SignUpOne: { role: UserRole };
  Login: undefined;
  UserHome: undefined;
  PassageSelection: undefined;
  // ReadingActivity: { passage: Passage };
  ReadingTesting: { readingMaterial: ReadingMaterial; type: 'alphabet' | 'passage' };
  ChooseRole: undefined;
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
    profileImageUrl,
    firstName,
    middleName,
    lastName,
    email,
    role,
    sex,
    gradeLevel,
    dateOfBirth,
  }: {
    profileImageUrl?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    role: UserRole;
    sex: string;
    gradeLevel: number;
    dateOfBirth: string;
  }) => {
    // Basic validation
    if (!firstName || !lastName || !dateOfBirth) {
      Alert.alert(
        'Missing Information',
        'Please fill out all required fields.',
      );
      return;
    }

    // Build StudentInformation object
    const userInfo: Partial<UserDocument> = {
      profileImageUrl: profileImageUrl || '',
      firstName,
      middleName,
      lastName,
      email: '',
      role,
      sex,
      studentData: {
        gradeLevel,
        dateOfBirth,
        reading_Level: 'beginner',
      },
    };

    // Navigate to SignUpTwo with the collected info
    navigation.navigate('SignUpTwo', { userInfo });
  };

  // Add a method to navigate from ChooseRole to SignUpOne
  const handleRoleSelection = (role: UserRole) => {
    navigation.navigate('SignUpOne', { role });
  };

  // Handles only the Reading Activity Page due to having data passed to the next page.
  const handleReadingNext = (readingMaterial: ReadingMaterial, type: 'alphabet' | 'passage') => {
    // navigation.navigate('ReadingActivity', { passage });
    navigation.navigate('ReadingTesting', { readingMaterial, type });
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
    handleReplaceStep,
    handleSignUpNavigationWithData,
    handleRoleSelection,
    handleReadingNext,
    handleBackStep,
    handleLogout,
    handleCancelRegistration,
  };
};
