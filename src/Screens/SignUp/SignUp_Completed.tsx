import React, { useEffect } from 'react';
import Video from 'react-native-video';
import { TouchableOpacity, View, Text } from 'react-native';
import signup from '../../UI_Designs/SignUpStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { useNavigation } from '@react-navigation/native';
import buttons from '../../UI_Designs/ButtonStyles';
import { RootStackParamList } from '../../Controller/NavigationController';
import { RouteProp, useRoute } from '@react-navigation/native';

type SignUpCompleteRouteProp = RouteProp<RootStackParamList, 'SignUpCompleted'>;

export default function SignUpCompletedScreen() {
  // Add navigation code here for where it logs in automatically to user screen after signing up
  const route = useRoute<SignUpCompleteRouteProp>();
  const { role } = route.params;

  const { handleDesignatedUserPage }  = useNavigationHelper();

  // Redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDesignatedUserPage(role);
    }, 5000);

    return () => clearTimeout(timer);
  }, [handleDesignatedUserPage, role]);

  return (
    <View style={signup.completeSignUpContainer}>
      <Text style={signup.completeTitle}>Welcome to</Text>
      <Video
        style={signup.video}
        source={require('../../../assets/videos/cisc_logo_animated.mp4')}
        repeat={false}
        resizeMode="cover"
      />
      <Text style={signup.completeTitle}>Register Completed!</Text>
      <Text style={signup.completeStatement}>
        Learn and enjoy your journey even if you make mistakes, it what keeps
        you better in reading.
      </Text>

      <TouchableOpacity style={signup.completeNextButton} onPress={() => handleDesignatedUserPage(role)}>
        <Text style={buttons.nextPageText}>Start Learning</Text>
      </TouchableOpacity>

    </View>
  );
}
