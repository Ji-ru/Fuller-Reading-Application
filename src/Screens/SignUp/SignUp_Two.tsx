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
  Alert, Modal, ActivityIndicator, StyleSheet,
} from 'react-native';
import signup from '../../UI_Designs/SignUpStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import buttons from '../../UI_Designs/ButtonStyles';
import { RootStackParamList } from '../../Controller/NavigationController';
import {
  SignUpUserCredentials,
  GoogleSignUpUserCredentials,    // ← your existing function
} from '../../Controller/AuthenticationController';
import LottieView from 'lottie-react-native';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import AlertModal from '../../Components/GlobalUse/Modal/AlertModal';
import { sw, sh, sf } from '../../Utils/responsive';

export default function SignUpTwoScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'SignUpTwo'>>();
  const personalInfo = route.params.userInfo;
  const role = route.params.role;

  // ── Google sign-up detection ──────────────────────────────────────────────
  // googleEmail is appended to userInfo by SignUpOne.
  // googleIdToken is no longer needed — auth.currentUser was set in
  // initiateGoogleSignUp() before navigation began.
  const googleEmail = (personalInfo as any).googleEmail as string | undefined;
  const isGoogleSignUp = Boolean(googleEmail);

  const [currentStep] = useState(2);
  const { handleDesignatedUserPage, handleCancelRegistration, handleCompletedRegistration } = useNavigationHelper();

  // Email pre-filled for Google users, empty for email users
  const [email, setEmail] = useState(googleEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isParentConfirmed, setIsParentConfirmed] = useState(false);

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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={signup.container}>
      <View>
        <Image
          source={require('../../../assets/images/cisckids.png')}
          style={signup.ciscLogo}
        />
        <BubbleBackground />

        <Text style={signup.label}>Register</Text>

        {/* Step indicator */}
        <View style={signup.stepsContainer}>
          <View
            style={[
              signup.stepCircle,
              currentStep === 1 ? signup.inactivateStep : signup.activateStep,
            ]}
          >
            <Text style={currentStep === 1 ? signup.activenumber : signup.inactivenumber}>1</Text>
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

        <Text style={signup.subLabel}>Create an Account</Text>

        <View>
          <Text style={signup.textform}>Email Address</Text>

          {isGoogleSignUp ? (
            // ── Locked Google email badge ──────────────────────────────────
            <View style={styles.googleEmailBadge}>
              <Image
                source={require('../../../assets/images/Google-icon.png')}
                style={styles.googleIcon}
              />
              <Text style={styles.googleEmailText} numberOfLines={1}>
                {googleEmail}
              </Text>
              <View style={styles.lockedTag}>
                <Text style={styles.lockedTagText}>Google</Text>
              </View>
            </View>
          ) : (
            // ── Editable email input (email path) ─────────────────────────
            <TextInput
              style={signup.textInputForm}
              placeholder="example@gmail.com"
              placeholderTextColor="#A9A9A9"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}

          {/* Password fields hidden for Google sign-up */}
          {!isGoogleSignUp && (
            <>
              <Text style={signup.textform}>Password</Text>
              <TextInput
                style={signup.textInputForm}
                secureTextEntry
                placeholder="*********"
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
              />

              <Text style={signup.textform}>Confirm Password</Text>
              <TextInput
                style={signup.textInputForm}
                secureTextEntry
                placeholder="*********"
                placeholderTextColor="#A9A9A9"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </>
          )}
          {role === 'student' && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsParentConfirmed(!isParentConfirmed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isParentConfirmed && styles.checkedBox]}>
                {isParentConfirmed && <Text style={styles.checkmark}>✓</Text>}
              </View>

              <Text style={styles.checkboxText}>
                By checking this box, I confirm that I am a parent or guardian and consent
                to my child's registration in compliance with child safety laws like COPPA.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[buttons.nextPageButton, modalVisible && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={modalVisible}
        >
          <Text style={buttons.nextPageText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttons.cancelButton, modalVisible && { opacity: 0.7 }]}
          onPress={handleCancelRegistration}
          disabled={modalVisible}
        >
          <Text style={buttons.cancelText}>Cancel</Text>
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

// ── Google email badge styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  googleEmailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#D0DAFB',
    borderRadius: sw(10),
    paddingHorizontal: sw(14),
    paddingVertical: sh(12),
    marginBottom: sh(12),
    gap: sw(10),
  },
  googleIcon: {
    width: sw(20),
    height: sw(20),
    resizeMode: 'contain',
  },
  googleEmailText: {
    flex: 1,
    fontSize: sf(14),
    color: '#1E1E1E',
    fontFamily: 'Satoshi-Medium',
  },
  lockedTag: {
    backgroundColor: '#E8EFFF',
    borderRadius: sw(6),
    paddingHorizontal: sw(8),
    paddingVertical: sh(2),
  },
  lockedTagText: {
    fontSize: sf(11),
    color: '#3D71D9',
    fontFamily: 'Satoshi-Bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: sh(10),
    marginBottom: sh(15),
  },

  checkbox: {
    width: sw(20),
    height: sw(20),
    borderWidth: 2,
    borderColor: '#3D71D9',
    borderRadius: sw(4),
    marginRight: sw(10),
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkedBox: {
    backgroundColor: '#3D71D9',
  },

  checkmark: {
    color: 'white',
    fontSize: sf(14),
    fontWeight: 'bold',
  },

  checkboxText: {
    flex: 1,
    fontSize: sf(13),
    color: '#666',
    fontFamily: 'Satoshi-Medium',
    lineHeight: sh(18),
  },
});