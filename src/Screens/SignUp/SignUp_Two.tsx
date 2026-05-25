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
import { EyeIcon, EyeOffIcon, AlertTriangleIcon } from '../../Components/GlobalUse/Icons';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [modalType, setModalType] = useState<'loading' | 'success'>('loading');
  const [modalMessage, setModalMessage] = useState('');
  const [enrollmentMessage, setEnrollmentMessage] = useState('');

  // Ref for Lottie animation
  const congratulationsRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);
  
  // Handles Registration Logic
  const handleRegister = async () => {
    setIsSubmitted(true);

    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    // Password Strength Check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return;
    }

    try {
      setModalType('loading');
      setModalMessage('Creating your account...');
      setModalVisible(true);

      // Call with correct parameters - using non-null assertion since we validated above
      let result: any = null;
      if (personalInfo.role! === 'student') {
        const classCode = personalInfo?.studentData?.classCode ?? '';

        result = await SignUpUserCredentials(email, password, {
          role: personalInfo.role!,
          firstName: personalInfo.firstName!,
          middleName: personalInfo.middleName || '',
          lastName: personalInfo.lastName!,
          sex: personalInfo.sex!,
          profileImageUrl: personalInfo?.profileImageUrl || '',
          gradeLevel: personalInfo?.studentData?.gradeLevel ?? 1,
          dateOfBirth: personalInfo?.studentData?.dateOfBirth || '',
          classCode: classCode || '',
        });                
      } else if (personalInfo.role! === 'faculty') {
        const fCode = (personalInfo as any).facultyCode;
        if (!verifyFacultyAccessCode(fCode)) {
           setModalVisible(false);
           return Alert.alert('Access Denied', 'Invalid Faculty Access Code. Please contact your administrator.');
        }

        result = await SignUpUserCredentials(email, password, {
          role: personalInfo.role!,
          firstName: personalInfo.firstName!,
          middleName: personalInfo.middleName || '',
          lastName: personalInfo.lastName!,
          sex: personalInfo.sex!,
          profileImageUrl: personalInfo?.profileImageUrl || '',
          assignedGradeLevels: (personalInfo.facultyData as any)?.assignedGradeLevels || [],
        });  
      }

      // Set enrollment message if available
      if (result?.enrollment) {
        if (result.enrollment.success) {
          setEnrollmentMessage('✓ Successfully enrolled in class');
        } else {
          setEnrollmentMessage(`⚠ ${result.enrollment.message || 'Could not auto-enroll'}`);
        }
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
      Alert.alert('Registration Error', error.message || 'May naganap na error. Pakisubukan muli.');
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
      <View>
        {/* HEADER WITH BACK BUTTON */}
        <View style={localStyles.headerRow}>
          <TouchableOpacity style={localStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
            <View style={localStyles.backArrow} />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/images/cisckids copy.png')}
            style={localStyles.logo}
            resizeMode="contain"
          />
          <View style={{ width: 44 }} />
        </View>

        {/* CREATE AN ACCOUNT FORM */}
        <View>
          {/* EMAIL ADDRESS */}
          <Text style={signup.textform}>
            Email Address {isSubmitted && !email.trim() && (
              <Text style={{ color: '#e74c3c', fontSize: 13, fontFamily: 'Andika-Bold' }}>* Kinakailangan</Text>
            )}
          </Text>
          <TextInput
            style={[signup.textInputForm, isSubmitted && !email.trim() ? { borderColor: '#e74c3c' } : null]}
            placeholder="cisckids@gmail.com"
            value={email}
            onChangeText={setEmail}
          />
          {email.trim().length > 0 && !/^\S+@\S+\.\S+$/.test(email) && (
            <Text style={[localStyles.requirementInfo, { color: '#e74c3c' }]}>
              * Maling email
            </Text>
          )}
          {/* PASSWORD */}
          <Text style={signup.textform}>
            Password {isSubmitted && !password && <Text style={{ color: '#e74c3c', fontSize: 13, fontFamily: 'Andika-Bold' }}>* Kinakailangan</Text>}
          </Text>
          <View style={[signup.textInputForm, localStyles.passwordContainer, isSubmitted && !password ? { borderColor: '#e74c3c' } : null]}>
            <TextInput
              style={localStyles.nakedInput}
              secureTextEntry={!showPassword}
              placeholder="∗∗∗∗∗∗∗∗∗∗∗"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={localStyles.eyeIconBtn} 
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon size={20} color="#8fafa0" />
              ) : (
                <EyeIcon size={20} color="#8fafa0" />
              )}
            </TouchableOpacity>
          </View>
          {password.length > 0 && (
            <Text style={[
              localStyles.requirementInfo, 
              !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(password) && { color: '#e74c3c' }
            ]}>
              * Dapat may 8+ characters, kabilang ang uppercase, numero, at simbolo.
            </Text>
          )}

          {/* CONFIRM PASSWORD */}
          <Text style={signup.textform}>
            Confirm Password {isSubmitted && !confirmPassword && <Text style={{ color: '#e74c3c', fontSize: 13, fontFamily: 'Andika-Bold' }}>* Kinakailangan</Text>}
          </Text>
          <View style={[signup.textInputForm, localStyles.passwordContainer, isSubmitted && (!confirmPassword || password !== confirmPassword) ? { borderColor: '#e74c3c' } : null]}>
            <TextInput
              style={localStyles.nakedInput}
              secureTextEntry={!showConfirmPassword}
              placeholder="∗∗∗∗∗∗∗∗∗∗∗"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
              style={localStyles.eyeIconBtn} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOffIcon size={20} color="#8fafa0" />
              ) : (
                <EyeIcon size={20} color="#8fafa0" />
              )}
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <Text style={[localStyles.requirementInfo, { color: '#e74c3c' }]}>
              * Hindi tumutugma
            </Text>
          )}
        </View>

        {/* CONFIRM AND CANCEL BUTTONS */}
        {/* NEXT PAGE */}
        <TouchableOpacity
          style={[buttons.nextPageButton, modalVisible && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={modalVisible}
        >
          <Text style={buttons.nextPageText}>Magrehistro</Text>
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
                <ActivityIndicator size="large" color="#3d71d9" />
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
                {enrollmentMessage && (
                  <Text style={[signup.modalText, { fontSize: 13, marginTop: 8, color: '#8fafa0' }]}>
                    {enrollmentMessage}
                  </Text>
                )}
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
    width: 100,
    height: 90,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0, // Reset for internal padding
    paddingRight: 12,
  },
  nakedInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontFamily: 'Andika-Regular',
    fontSize: 15,
    color: '#1b2e23',
  },
  eyeIconBtn: {
    padding: 8,
  },
  requirementInfo: {
    fontSize: 10,
    color: '#8fafa0',
    marginHorizontal: 24,
    marginTop: -4,
    marginBottom: 8,
    fontFamily: 'Andika-Regular',
  },
  // Modal Styles (Cancel Registration)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  modalIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Andika-Bold',
    color: '#1b2e23',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    color: '#8fafa0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: '#8fafa0',
  },
  modalConfirmBtn: {
    flex: 1.5,
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: '#fff',
  },
});
