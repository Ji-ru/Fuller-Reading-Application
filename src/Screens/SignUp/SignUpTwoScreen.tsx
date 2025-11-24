import React, { useState} from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import signup from '../../ui/SignUpStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import buttons from '../../ui/ButtonStyles';
import bubbles from '../../ui/BubblesDesign';
import { RootStackParamList } from '../../Controller/NavigationController';
import { registerStudent } from '../../Controller/AuthenticationController';
export default function SignUpTwoScreen() {

  // Access the studentInfo passed from SignUpOne
  const route = useRoute<RouteProp<RootStackParamList, 'SignUpTwo'>>();
  const personalInfo = route.params.userInfo;

  // Updates Current Step Process from SignUpOne - UNDER CONSTRUCTION!!!
  const [currentStep, setCurrentStep] = useState(2);

  // Handles Navigation After Registration
  const { handleNextStep, handleCancelRegistration } = useNavigationHelper();

  // User Account Credential States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading for Registration
  const [loading, setLoading] = useState(false);

  // Handles Registration Logic
  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      return Alert.alert('Error', 'Please fill out all fields.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }

    try {
      setLoading(true);

      // Combine data from SignUpOne + SignUpTwo
      const student = {
        ...personalInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await registerStudent(student, password);
      setLoading(false);

      Alert.alert('Success', 'Account created successfully!');
      handleNextStep('SignUpCompleted');
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Registration Error', error.message);
    }
  };
  return (
    <SafeAreaView style={signup.container}>
      <View>
        {/* CISC KIDS TITLE */}
        <Image
          source={require('../../../assets/images/cisckids.png')}
          style={signup.ciscLogo}
        />
                {/* BUBBLE DECORATIONS */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
          {/* Top Bubbles */}
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />

          {/* Bottom Bubbles */}
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>
        {/* SCREEN TITLE */}
        <Text style={signup.label}>Register</Text>
        {/* STEPS INIDCATOR */}
        <View style={signup.stepsContainer}>
          <View
            style={[
              signup.stepCircle,
              currentStep == 1 ? signup.inactivateStep : signup.activateStep,
            ]}
          >
            <Text style={signup.number}>1</Text>
          </View>

          <View style={signup.stepLine} />

          <View
            style={[
              signup.stepCircle,
              currentStep == 2 ? signup.activateStep : signup.inactivateStep,
            ]}
          >
            <Text style={signup.number}>2</Text>
          </View>
        </View>
        {/* CREATE AN ACCOUNT FORM */}
        <Text style={signup.subLabel}>Create an Account</Text>
        <View>
          {/* EMAIL ADDRESS */}
          <Text style={signup.textform}>Email Address</Text>
          <TextInput style={signup.textInputForm} placeholder='example@gmail.com' value={email} onChangeText={setEmail}/>
          {/* PASSWORD */}
          <Text style={signup.textform}>Password</Text>
          <TextInput style={signup.textInputForm} secureTextEntry placeholder='*********' value={password} onChangeText={setPassword}/>
          {/* CONFIRM PASSWORD */}
          <Text style={signup.textform}>Confirm Password</Text>
          <TextInput style={signup.textInputForm} secureTextEntry placeholder='*********' value={confirmPassword} onChangeText={setConfirmPassword}/>
        </View>
        
        {/* CONFIRM AND CANCEL BUTTONS */}
        {/* NEXT PAGE */}
        <TouchableOpacity
          style={buttons.nextPageButton}
          onPress={handleRegister}
        >
          <Text style={buttons.nextPageText}>Register</Text>
        </TouchableOpacity>
        {/* CANCEL */}
        <TouchableOpacity
          style={buttons.cancelButton}
          onPress={handleCancelRegistration}
        >
          <Text style={buttons.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
