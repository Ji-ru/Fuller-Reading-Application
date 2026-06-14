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

  const navigation = useNavigation() as any;
   
  const { handleDesignatedUserPage }  = useNavigationHelper();

  return (
    <View style={signup.completeSignUpContainer}>
      <Text style={signup.completeTitle}>Welcome to</Text>
      <Video
        style={signup.video}
        source={require('../../../assets/videos/cisc_logo_animated (4).mp4')}
        repeat={false}
        resizeMode="cover"
      />
      <Text style={signup.completeTitle}>Congratulations!</Text>
      <Text style={signup.completeStatement}>
        Pwede mo nang i-log in ang iyong account.
      </Text>

      <TouchableOpacity style={signup.completeNextButton} onPress={() => navigation.replace('Login')}>
        <Text style={buttons.nextPageText}>OKAY</Text>
      </TouchableOpacity>

    </View>
  );
}
