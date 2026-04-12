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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import signup from '../../UI_Designs/SignUpStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import buttons from '../../UI_Designs/ButtonStyles';
import bubbles from '../../UI_Designs/BubblesDesign';
import { RootStackParamList } from '../../Controller/NavigationController';
import { SignUpUserCredentials, verifyFacultyAccessCode, getClassByCode } from '../../Controller/AuthenticationController';
import LottieView from 'lottie-react-native';
export default function SignUpTwoScreen() {
  // Access the studentInfo passed from SignUpOne
  const route = useRoute<RouteProp<RootStackParamList, 'SignUpTwo'>>();
  const personalInfo = route.params.userInfo;

  // Updates Current Step Process from SignUpOne - UNDER CONSTRUCTION!!!
  const [currentStep, setCurrentStep] = useState(2);

  // Handles Navigation After Registration
  const { handleDesignatedUserPage, handleCancelRegistration, handleBackStep } = useNavigationHelper();

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
        const classCode = (personalInfo as any).classCode;
        if (classCode) {
           const classExists = await getClassByCode(classCode);
           if (!classExists) {
             setModalVisible(false);
             return Alert.alert('Error', 'Ang ibinigay na Class Code ay hindi wasto.');
           }
        }

        await SignUpUserCredentials(email, password, {
          role: personalInfo.role!,
          firstName: personalInfo.firstName!,
          middleName: personalInfo.middleName,
          lastName: personalInfo.lastName!,
          sex: personalInfo.sex!,
          profileImageUrl: personalInfo?.profileImageUrl,
          gradeLevel: (personalInfo as any).gradeLevel,
          dateOfBirth: (personalInfo as any).dateOfBirth,
          classCode: classCode || '',
        });        
      } else if (personalInfo.role! === 'faculty') {
        const fCode = (personalInfo as any).facultyCode;
        if (!verifyFacultyAccessCode(fCode)) {
           setModalVisible(false);
           return Alert.alert('Access Denied', 'Invalid Faculty Access Code. Please contact your administrator.');
        }

        await SignUpUserCredentials(email, password, {
          role: personalInfo.role!,
          firstName: personalInfo.firstName!,
          middleName: personalInfo.middleName,
          lastName: personalInfo.lastName!,
          sex: personalInfo.sex!,
          profileImageUrl: personalInfo?.profileImageUrl,
          assignedGradeLevels: (personalInfo as any).assignedGradeLevels || [],
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
      <View>
        {/* HEADER WITH BACK BUTTON */}
        <View style={localStyles.headerRow}>
          <TouchableOpacity style={localStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
            <View style={localStyles.backArrow} />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/images/cisckids.png')}
            style={localStyles.logo}
            resizeMode="contain"
          />
          <View style={{ width: 44 }} />
        </View>
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
          <TextInput
            style={signup.textInputForm}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
          />
          {/* PASSWORD */}
          <Text style={signup.textform}>Password</Text>
          <TextInput
            style={signup.textInputForm}
            secureTextEntry
            placeholder="*********"
            value={password}
            onChangeText={setPassword}
          />
          {/* CONFIRM PASSWORD */}
          <Text style={signup.textform}>Confirm Password</Text>
          <TextInput
            style={signup.textInputForm}
            secureTextEntry
            placeholder="*********"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* CONFIRM AND CANCEL BUTTONS */}
        {/* NEXT PAGE */}
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
      </ScrollView>
      </KeyboardAvoidingView>

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

const localStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  backArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2.5,
    borderTopWidth: 2.5,
    borderColor: '#1b2e23',
    transform: [{ rotate: '-45deg' }],
  },
  logo: {
    width: 140,
    height: 48,
  },
});
