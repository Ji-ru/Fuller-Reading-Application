// screens/SignUp/SignUp_Two.tsx
//
// WHAT CHANGED FROM v1:
//   • Calls GoogleSignUpUserCredentials() (your existing function) instead of
//     the now-removed SignUpWithGoogleCredentials().
//   • No longer reads or uses googleIdToken — auth.currentUser is already set
//     by initiateGoogleSignUp() before navigation begins.
//   • googleEmail is still read from userInfo to render the pre-filled badge.
//   • Everything else (email path, modal, animations) is unchanged.

import React, { useState, useRef, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  Modal, ActivityIndicator,
} from 'react-native';
import signup from '../../UI_Designs/SignUpStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import buttons from '../../UI_Designs/ButtonStyles';
import { RootStackParamList } from '../../Controller/NavigationController';
import {
  SignUpUserCredentials,
  GoogleSignUpUserCredentials,
} from '../../Controller/AuthenticationController';
import LottieView from 'lottie-react-native';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import AlertModal from '../../Components/GlobalUse/Modal/AlertModal';
import { sw, sh, sf } from '../../Utils/responsive';

export default function SignUpTwoScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'SignUpTwo'>>();
  const { accountInfo, role } = route.params;
  const isGoogleSignUp = Boolean(accountInfo.googleEmail);

  const [currentStep] = useState(2);
  const { handleDesignatedUserPage, handleCancelRegistration, handleCompletedRegistration } = useNavigationHelper();

  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  // Custom Alert Modal State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setAlertData({ title, message });
    setAlertVisible(true);
  };

  // Modal states (Loading / Success)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'loading' | 'success'>('loading');
  const [modalMessage, setModalMessage] = useState('');

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isValidEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> => {
    const timeoutPromise = new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout-error:${operationName}`)), timeoutMs)
    );
    return Promise.race([promise, timeoutPromise]);
  };

  const congratulationsRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> => {
    const timeoutPromise = new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout-error:${operationName}`)), timeoutMs)
    );
    return Promise.race([promise, timeoutPromise]);
  };

  const handleProfilePicChange = () => {
    setActionSheetVisible(true);
  };

  const openCamera = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8, saveToPhotos: true },
      handleImageResponse,
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      handleImageResponse,
    );
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      showAlert('Notice', 'User cancelled opening picker');
    } else if (response.errorCode) {
      showAlert('Error', 'Failed to pick image. Please try again.');
    } else if (response.assets?.[0]?.uri) {
      setProfileImage(response.assets[0].uri);
    }
  };

  const formatDateToReadable = (dateObj: Date): string => {
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // ── Registration ──────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!isMounted.current) return;

    // Password validation only applies to the email/password path
    if (!isGoogleSignUp) {
      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        showAlert('Error', 'Please fill out all fields.');
        return;
      }
      if (!isValidEmail(email.trim())) {
        showAlert('Error', 'Please enter a valid email address.');
        return;
      }
      if (password.length > 128) {
        showAlert('Error', 'Password is too long.');
        return;
      }
      if (password !== confirmPassword) {
        showAlert('Error', 'Passwords do not match.');
        return;
      }
    }
    if (role === 'student' && !isParentConfirmed) {
      showAlert(
        'Consent Required',
        'A parent or guardian must confirm consent before registration.'
      );
      return;
    }

    try {
      setModalType('loading');
      setModalMessage('Creating your account...');
      setModalVisible(true);

      const email = accountInfo.email;
      const password = accountInfo.password || '';

      if (isGoogleSignUp) {
        // ── Google path ────────────────────────────────────────────────────
        // auth.currentUser is already set; GoogleSignUpUserCredentials reads it.
        // email and password are passed for signature compatibility but are
        // ignored by the function — it uses currentUser.email internally.
        if (personalInfo.role === 'student') {
          await withTimeout(
            GoogleSignUpUserCredentials(email, {
              role: personalInfo.role!,
              firstName: personalInfo.firstName!,
              middleName: personalInfo.middleName,
              lastName: personalInfo.lastName!,
              sex: personalInfo.sex!,
              profileImageUrl: personalInfo?.profileImageUrl,
              gradeLevel: personalInfo.studentData?.gradeLevel,
              dateOfBirth: personalInfo.studentData?.dateOfBirth,
              assignedGradeLevels: personalInfo.facultyData?.assignedGradeLevels,
              parentConsent: {
                confirmed: isParentConfirmed,
              },
            }), 60000, 'Google Sign Up'
          );
        } else if (personalInfo.role === 'faculty') {
          await withTimeout(
            GoogleSignUpUserCredentials(email, {
              role: personalInfo.role!,
              firstName: personalInfo.firstName!,
              middleName: personalInfo.middleName,
              lastName: personalInfo.lastName!,
              sex: personalInfo.sex!,
              profileImageUrl: personalInfo?.profileImageUrl,
              assignedGradeLevels: personalInfo.facultyData?.assignedGradeLevels,
            }), 60000, 'Google Sign Up'
          );
        }
      } else {
        // ── Email / password path (unchanged from original) ─────────────
        if (personalInfo.role === 'student') {
          await withTimeout(
            SignUpUserCredentials(email, password, {
              role: personalInfo.role!,
              firstName: personalInfo.firstName!,
              middleName: personalInfo.middleName,
              lastName: personalInfo.lastName!,
              sex: personalInfo.sex!,
              profileImageUrl: personalInfo?.profileImageUrl,
              gradeLevel: personalInfo.studentData?.gradeLevel,
              dateOfBirth: personalInfo.studentData?.dateOfBirth,
              parentConsent: {
                confirmed: isParentConfirmed,
              },
            }), 60000, 'Email Sign Up'
          );
        } else if (personalInfo.role === 'faculty') {
          await withTimeout(
            SignUpUserCredentials(email, password, {
              role: personalInfo.role!,
              firstName: personalInfo.firstName!,
              middleName: personalInfo.middleName,
              lastName: personalInfo.lastName!,
              sex: personalInfo.sex!,
              profileImageUrl: personalInfo?.profileImageUrl,
              assignedGradeLevels: personalInfo.facultyData?.assignedGradeLevels,
            }), 60000, 'Email Sign Up'
          );
        } else if (personalInfo.role === 'admin') {
          await withTimeout(
            SignUpUserCredentials(email, password, {
              role: personalInfo.role!,
              firstName: personalInfo.firstName!,
              middleName: personalInfo.middleName,
              lastName: personalInfo.lastName!,
              sex: personalInfo.sex!,
              profileImageUrl: personalInfo?.profileImageUrl,
            }), 60000, 'Email Sign Up'
          );
        }
      }

      // ── Success ──────────────────────────────────────────────────────────
      if (!isMounted.current) return;
      setModalType('success');
      setModalMessage('Account created successfully!');

      setTimeout(() => {
        if (isMounted.current) {
          confettiRef.current?.play();
          congratulationsRef.current?.play();
        }
      }, 500);

      setTimeout(() => {
        if (isMounted.current) {
          setModalVisible(false);
          handleCompletedRegistration(personalInfo.role!);
        }
      }, 2000);

    } catch (error: any) {
      if (!isMounted.current) return;
      setModalVisible(false);
      if (error.message && error.message.includes('timeout-error')) {
        showAlert('Registration Error', 'Connection timed out. Please check your internet connection.');
      } else {
        showAlert('Registration Error', error.message);
      }
    }
  };

  const handleModalClose = () => {
    confettiRef.current?.reset();
    congratulationsRef.current?.reset();
  };

  return (
    <SafeAreaView style={signup.container}>
      <BubbleBackground />

      <View style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <TouchableOpacity
          style={upperNav.touchable}
          onPress={() => handleBackStep()}
        >
          <Image
            style={upperNav.backButtonIcon}
            source={require('../../../assets/icons/BackButton-icon.png')}
          />
        </TouchableOpacity>
      </View>

      <View>
        <Text style={signup.label}>Register</Text>

        {/* Step indicator */}
        <View style={signup.stepsContainer}>
          <View
            style={[
              signup.stepCircle,
              currentStep === 1 ? signup.activateStep : signup.activateStep, // Circle 1 still active/colored but completed
            ]}
          >
            <Text style={signup.activenumber}>✓</Text>
          </View>
          <View style={signup.stepLine} />
          <View
            style={[
              signup.stepCircle,
              currentStep === 2 ? signup.activateStep : signup.inactivateStep,
            ]}
          >
            <Text style={currentStep === 2 ? signup.activenumber : signup.inactivenumber}>2</Text>
          </View>
        </View>

        {/* Profile picture */}
        <View style={{ position: 'relative', alignSelf: 'center', marginVertical: 10 }}>
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require('../../../assets/images/defaultProfile.png')
            }
            style={signup.defaultProfile}
          />
          <TouchableOpacity
            onPress={handleProfilePicChange}
            style={signup.cameraBackground}
          >
            <Image
              source={require('../../../assets/icons/Camera-add.png')}
              style={signup.cameraIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Personal information form */}
        <View style={{ marginTop: 10 }}>
          <Text style={signup.subLabel}>Personal Information</Text>

          <View style={signup.inputContainer}>
            <Image
              source={require('../../../assets/icons/Edit-icon.png')}
              style={signup.inputIcon}
            />
            <TextInput
              style={signup.textInputForm}
              placeholder="First Name"
              placeholderTextColor="#A9A9A9"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={signup.inputContainer}>
            <Image
              source={require('../../../assets/icons/Edit-icon.png')}
              style={signup.inputIcon}
            />
            <TextInput
              style={signup.textInputForm}
              placeholder="Middle Name (Optional)"
              placeholderTextColor="#A9A9A9"
              value={middleName}
              onChangeText={setMiddleName}
            />
          </View>

          <View style={signup.inputContainer}>
            <Image
              source={require('../../../assets/icons/Edit-icon.png')}
              style={signup.inputIcon}
            />
            <TextInput
              style={signup.textInputForm}
              placeholder="Last Name"
              placeholderTextColor="#A9A9A9"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <Text style={signup.textform}>Select Gender:</Text>
          <GenderSelection onGenderSelect={setGender} />

          <Text style={signup.textform}>Date of Birth</Text>
          <TouchableOpacity
            style={signup.dateInput}
            onPress={() => setShowPicker(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../../../assets/icons/Calendar-icon.png')}
                style={[signup.inputIcon, { tintColor: '#666' }]}
              />
              <Text style={signup.dateText}>{date.toDateString()}</Text>
            </View>
            <Image
              source={require('../../../assets/icons/VerticalDown-icon.png')}
              style={[signup.icon, { tintColor: '#999', width: 20, height: 20 }]}
            />
          </TouchableOpacity>

          <DatePicker
            modal
            mode="date"
            open={showPicker}
            date={date}
            maximumDate={new Date()}
            onConfirm={pickedDate => { setShowPicker(false); setDate(pickedDate); }}
            onCancel={() => setShowPicker(false)}
          />

          {role !== 'admin' && (
            <>
              <Text style={signup.textform}>
                {role === 'student' ? 'Grade Level' : 'Assigned Grade Level'}
              </Text>
              <GradeLevelDropDownSelection onSelect={value => setGradeLevel(value)} />
            </>
          )}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[buttons.nextPageSignUpButton, modalVisible && { opacity: 0.7 }, { marginTop: 20 }]}
          onPress={handleRegister}
          disabled={modalVisible}
        >
          <Text style={buttons.nextPageSignUpText}>Complete Registration</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttons.cancelSignUpButton, modalVisible && { opacity: 0.7 }]}
          onPress={() =>
            showConfirm(
              'Cancel Registration',
              'Are you sure you want to cancel? Your progress will be lost.',
              () => {
                setAlertVisible(false);
                handleCancelRegistration(false);
              },
              'Cancel',
              'Keep Going'
            )
          }
          disabled={modalVisible}
        >
          <Text style={buttons.cancelSignUpText}>Cancel</Text>
        </TouchableOpacity>
      </View>


      {/* Loading / success modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => { }}
        onDismiss={handleModalClose}
      >
        <View style={signup.modalOverlay}>
          <View style={signup.modalContainer}>
            {modalType === 'loading' ? (
              <>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={signup.modalText}>{modalMessage}</Text>
              </>
            ) : (
              <>
                <LottieView
                  ref={confettiRef}
                  source={require('../../../assets/gifs&animations/Confetti.json')}
                  autoPlay={false}
                  loop={false}
                  style={signup.confettiAnimation}
                  resizeMode="cover"
                />
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

      <AlertModal
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}