import React, { useEffect } from 'react';
import Video from 'react-native-video';
import { TouchableOpacity, View, Text } from 'react-native';
import signup from '../../ui/SignUpStyles';
import { useNavigationHelper } from '../../Functions/Buttons';
import { useNavigation } from '@react-navigation/native';
import buttons from '../../ui/ButtonStyles';

export default function SignUpCompletedScreen() {
  // Add navigation code here for where it logs in automatically to user screen after signing up

  const navigation = useNavigation() as any;
  
  // Loads for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('UserHome');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const { handleNextStep }  = useNavigationHelper();

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

      <TouchableOpacity style={signup.completeNextButton} onPress={() => handleNextStep('UserHome')}>
        <Text style={buttons.nextPageText}>Start Learning</Text>
      </TouchableOpacity>

    </View>
  );
}
