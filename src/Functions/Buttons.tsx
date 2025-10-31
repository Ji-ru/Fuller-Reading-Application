import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Alert } from 'react-native';
import { Passage } from '../Types/passage';
// Specifies what parameters (data) each screen in your navigation stack can receive.
export type RootStackParamList = {
  SignUpCompleted: undefined;
  SignUpTwo: undefined;
  SignUpOne: undefined;
  Login: undefined;
  UserHome: undefined;
  PasageSelection: undefined;
  ReadingActivity: { passage: Passage };
  ReadingTesting: undefined;
};

// A list of all the screens within RootStackParamList
type ScreenNames = keyof RootStackParamList;

export const useNavigationHelper = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleNextStep = (
    destination: ScreenNames
  ) => {
    navigation.navigate(destination as any);
  };

  const handleReadingNext = ( passage: Passage ) => {
    navigation.navigate('ReadingActivity', { passage });
};
  // APPLICABLE TO ALL BACK/CANCEL BUTTONS
  const handleBackStep = () => {
    navigation.goBack();
  };

  //   APPLICABLE FOR LOGOUT
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  //   APPLICABLE ONLY TO REGISTERATION PAGE
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
    handleReadingNext,
    handleBackStep,
    handleLogout,
    handleCancelRegistration,
  };
};
