import React, { useState, useRef } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import signup from '../../UI_Designs/SignUpStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import buttons from '../../UI_Designs/ButtonStyles';
import bubbles from '../../UI_Designs/BubblesDesign';
import { RootStackParamList } from '../../Controller/NavigationController';
import { SignUpUserCredentials } from '../../Controller/AuthenticationController';
import LottieView from 'lottie-react-native';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
export default function SignUpTwoScreen() {
  // Access the studentInfo passed from SignUpOne
  const route = useRoute<RouteProp<RootStackParamList, 'SignUpTwo'>>();
  const personalInfo = route.params.userInfo;

  // Updates Current Step Process from SignUpOne - UNDER CONSTRUCTION!!!
  const [currentStep, setCurrentStep] = useState(2);

  // Handles Navigation After Registration
  const { handleDesignatedUserPage, handleCancelRegistration } = useNavigationHelper();

  // User Account Credential States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'loading' | 'success'>('loading');
  const [modalMessage, setModalMessage] = useState('');

  // Ref for Lottie animation
  const congratulationsRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);
  
  // Handles Registration Logic
  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      return Alert.alert('Error', 'Please fill out all fields.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match.');
    }

    try {
      setModalType('loading');
      setModalMessage('Creating your account...');
      setModalVisible(true);

      // Call with correct parameters - using non-null assertion since we validated above
      if (personalInfo.role! === 'student') {
        await SignUpUserCredentials(email, password, {
          role: personalInfo.role!,
          firstName: personalInfo.firstName!,
          middleName: personalInfo.middleName,
          lastName: personalInfo.lastName!,
          sex: personalInfo.sex!,
          profileImageUrl: personalInfo?.profileImageUrl,
          gradeLevel: personalInfo.studentData?.gradeLevel,
          dateOfBirth: personalInfo.studentData?.dateOfBirth,
        });        
      } else if (personalInfo.role! === 'faculty') {
        await SignUpUserCredentials(email, password, {
          role: personalInfo.role!,
          firstName: personalInfo.firstName!,
          middleName: personalInfo.middleName,
          lastName: personalInfo.lastName!,
          sex: personalInfo.sex!,
          profileImageUrl: personalInfo?.profileImageUrl,
          assignedGradeLevels: personalInfo.facultyData?.assignedGradeLevels,
        });  
      } else if (personalInfo.role! === 'admin') {
        await SignUpUserCredentials(email, password, {
          role: personalInfo.role!,
          firstName: personalInfo.firstName!,
          middleName: personalInfo.middleName,
          lastName: personalInfo.lastName!,
          sex: personalInfo.sex!,
          profileImageUrl: personalInfo?.profileImageUrl,
        });  
      }

      // Switch to success modal
      setModalType('success');
      setModalMessage('Account created successfully!');

      // Play the success animation
      setTimeout(() => {
        if (confettiRef.current) {
          confettiRef.current.play();
        }
        if (congratulationsRef.current) {
          congratulationsRef.current.play();
        }
      }, 500);

      // Wait 2 seconds to show success animation, then navigate
      setTimeout(() => {
        setModalVisible(false);
        handleDesignatedUserPage(personalInfo.role!);
      }, 2000);
    } catch (error: any) {
      setModalVisible(false);
      Alert.alert('Registration Error', error.message);
    }
  };

  // Reset animations when modal closes
  const handleModalClose = () => {
    if (confettiRef.current) {
      confettiRef.current.reset();
    }
    if (congratulationsRef.current) {
      congratulationsRef.current.reset();
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
        <BubbleBackground />

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
          <TextInput
            style={signup.textInputForm}
            placeholder="example@gmail.com"
            placeholderTextColor="#A9A9A9"
            value={email}
            onChangeText={setEmail}
          />
          {/* PASSWORD */}
          <Text style={signup.textform}>Password</Text>
          <TextInput
            style={signup.textInputForm}
            secureTextEntry
            placeholder="*********"
            placeholderTextColor="#A9A9A9"
            value={password}
            onChangeText={setPassword}
          />
          {/* CONFIRM PASSWORD */}
          <Text style={signup.textform}>Confirm Password</Text>
          <TextInput
            style={signup.textInputForm}
            secureTextEntry
            placeholder="*********"
            placeholderTextColor="#A9A9A9"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* CONFIRM AND CANCEL BUTTONS */}
        {/* REGISTER */}
        <TouchableOpacity
          style={[buttons.nextPageButton, modalVisible && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={modalVisible}
        >
          <Text style={buttons.nextPageText}>Register</Text>
        </TouchableOpacity>
        {/* CANCEL */}
        <TouchableOpacity
          style={[buttons.cancelButton, modalVisible && { opacity: 0.7 }]}
          onPress={handleCancelRegistration}
          disabled={modalVisible}
        >
          <Text style={buttons.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* LOADING MODAL */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => {}} // Empty function for Android back button
        onDismiss={handleModalClose}
      >
        <View style={signup.modalOverlay}>
          <View style={signup.modalContainer}>
            {modalType === 'loading' ? (
              // Loading content
              <>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={signup.modalText}>{modalMessage}</Text>
              </>
            ) : (
              // Success content with layered Lottie animations
              <>
                {/* Confetti animation (background) */}
                <LottieView
                  ref={confettiRef}
                  source={require('../../../assets/gifs&animations/Confetti.json')}
                  autoPlay={false}
                  loop={false}
                  style={signup.confettiAnimation}
                  resizeMode="cover"
                />

                {/* Congratulations animation (foreground) */}
                <LottieView
                  ref={congratulationsRef}
                  source={require('../../../assets/gifs&animations/Congratulations.json')}
                  autoPlay={false}
                  loop={false}
                  style={signup.congratulationsAnimation}
                  resizeMode="contain"
                />

                <Text style={[signup.modalText, signup.successText]}>
                  {modalMessage}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
