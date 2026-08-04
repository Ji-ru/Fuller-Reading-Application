// User_SignIn_Screen.tsx
// React Dependencies
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Modal,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Video from 'react-native-video';

// Styles
import login from '../UI_Designs/LoginStyles';

import AlertModal from '../Components/GlobalUse/Modal/AlertModal';

// Controllers (Hooks)
import { useNavigationHelper } from '../Controller/NavigationController';
import { loginUser, sendPasswordResetEmail } from '../Controller/AuthenticationController';
import { initiateGoogleSignUp } from '../Utilities/googleAuthUtils';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Forgot Password State
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Alert Modal State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Rate limiting & Network Resilience States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const isMounted = useRef(true);
  const isInitialLoad = useRef(true);

  const { handleNextStep, handleReplaceStep, routeParams } = useNavigationHelper();

  // ── Protection Against Unmounted Component State Updates ───────────────────
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ── Lockout Timer Effect ───────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        if (isMounted.current) {
          setLockoutTimer((prev) => prev - 1);
        }
      }, 1000);
    } else if (lockoutTimer === 0 && failedAttempts >= 3) {
      if (isMounted.current) setFailedAttempts(0);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer, failedAttempts]);

  // ── Session Restoration Listener ───────────────────────────────────────────
  useEffect(() => {
    const auth = getAuth();
    // onAuthStateChanged fires immediately with the current user state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If a Firebase session already exists on the device, jump to Loading
      if (user && isMounted.current) {
        handleReplaceStep('Loading');
      }
      isInitialLoad.current = false;
    });

    return unsubscribe; // Cleanup listener on unmount
  }, [handleReplaceStep]);

  useEffect(() => {
    if (routeParams?.authError && isMounted.current) {
      setAuthError(routeParams.authError);
    }
  }, [routeParams?.authError]);

  // Dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const isValidEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> => {
    const timeoutPromise = new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout-error:${operationName}`)), timeoutMs)
    );
    return Promise.race([promise, timeoutPromise]);
  };

  /**
   * Handle verification of users credential stored in the firebase authentication
   */
  const handleLogin = async () => {
    dismissKeyboard();
    if (!isMounted.current) return;
    setAuthError('');

    if (lockoutTimer > 0) {
      setAuthError(`Too many failed attempts. Try again in ${lockoutTimer} seconds.`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (password.length > 128) {
      setAuthError('Password is too long.');
      return;
    }

    try {
      setLoading(true);
      // Adding a 60-second local timeout wrapper to prevent unbounded wait
      const result = await withTimeout(
        loginUser(email.trim(), password),
        60000,
        'Email Login'
      );
      if (result.success && isMounted.current) {
        handleReplaceStep('Loading');
      }
    } catch (error: any) {
      if (!isMounted.current) return;

      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      let errorMessage = error.message || 'Login failed. Please try again.';

      if (error.message?.includes('timeout-error')) {
        errorMessage = 'Connection timed out. Please check your internet connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        setFailedAttempts(Math.max(newAttempts, 3));
        setLockoutTimer(30);
      } else if (newAttempts >= 3) {
        setLockoutTimer(15);
        errorMessage = 'Too many failed attempts. Please wait 15 seconds before trying again.';
      }

      setAuthError(errorMessage);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // ── Google Sign-Up ──────────────────────────────────────────────────────────
  /**
   * Launches the Google account picker.
   * On success, navigates to ChooseRole and carries the email + idToken as
   * route params so they can travel through the sign-up flow without the user
   * having to type their email on SignUpTwo.
   */
  const handleGoogleSignUp = async () => {
    dismissKeyboard();
    if (!isMounted.current) return;
    setGoogleError('');

    try {
      setGoogleLoading(true);
      const result = await withTimeout(
        initiateGoogleSignUp(),
        60000,
        'Google Login'
      );

      const { email: googleEmail, userExists } = result;

      if (userExists && isMounted.current) {
        // User already has an account! Log them in automatically.
        handleReplaceStep('Loading');
      } else if (isMounted.current) {
        // Navigate to ChooseRole, passing the Google credentials as params.
        // ChooseRole will forward them to SignUpOne → SignUpTwo.
        handleNextStep('ChooseRole', {
          googleEmail,
        });
      }
    } catch (error: any) {
      if (!isMounted.current) return;

      // User deliberately dismissed the picker — show nothing
      if (error.message === 'CANCELLED') return;

      if (error.message.includes('timeout-error')) {
        setGoogleError('Connection timed out. Please check your internet connection.');
      } else {
        setGoogleError('Google Sign-In failed. Please try again.');
      }
    } finally {
      if (isMounted.current) setGoogleLoading(false);
    }
  };

  // ── Forgot Password ────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim() || !isValidEmail(forgotPasswordEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setForgotPasswordLoading(true);
    try {
      await sendPasswordResetEmail(forgotPasswordEmail.trim());
      setAlertTitle('Success');
      setAlertMessage('A password reset link has been sent to your email. Please check your spam folder as the link may be sent there.');
      setAlertVisible(true);
      setForgotPasswordVisible(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to send password reset email. Please try again.');
    } finally {
      if (isMounted.current) setForgotPasswordLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={login.safeAreaContainer}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={login.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={login.container}>

              {/* Logo Section - Using Video */}
              <View style={login.logoSection}>
                <Video
                  style={login.video}
                  source={require('../../assets/videos/cisc_logo_animated.mp4')}
                  repeat={true}
                  resizeMode="contain"
                />
              </View>

              {/* Error Display - Shows above inputs */}
              {authError ? (
                <View style={login.errorContainer}>
                  <View style={login.errorIconCircle}>
                    <Text style={login.errorIcon}>!</Text>
                  </View>
                  <Text style={login.errorText}>{authError}</Text>
                </View>
              ) : null}

              {googleError ? (
                <View style={login.errorContainer}>
                  <View style={login.errorIconCircle}>
                    <Text style={login.errorIcon}>!</Text>
                  </View>
                  <Text style={login.errorText}>{googleError}</Text>
                </View>
              ) : null}

              {/* Email Input */}
              <View style={login.inputWrapper}>
                <Text style={login.inputLabel}>Email Address</Text>
                <View style={login.inputContainer}>
                  <View style={login.iconContainer}>
                    <Text style={login.inputIcon}>✉️</Text>
                  </View>
                  <TextInput
                    style={login.input}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#D1D5DB"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setAuthError(''); // Clear error when user types
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={login.inputWrapper}>
                <Text style={login.inputLabel}>Password</Text>
                <View style={login.inputContainer}>
                  <View style={login.iconContainer}>
                    <Text style={login.inputIcon}>🔒</Text>
                  </View>
                  <TextInput
                    style={login.input}
                    secureTextEntry={!showPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#D1D5DB"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setAuthError(''); // Clear error when user types
                    }}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                  >
                    <Image
                      source={showPassword
                        ? require('../../assets/icons/EyesClose-icon.png')
                        : require('../../assets/icons/EyesOpen-icon.png')}
                      style={login.eyeIcon}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  onPress={() => setForgotPasswordVisible(true)}
                  style={login.forgotpassTouchable}
                >
                  <Text style={login.forgotpass}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  login.loginButton,
                  (loading || lockoutTimer > 0) && login.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading || lockoutTimer > 0}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={login.loginButtonText}>
                    {lockoutTimer > 0 ? `Try again in ${lockoutTimer}s` : 'Login'}
                  </Text>
                )}
              </TouchableOpacity>
              {/* <TouchableOpacity
                    style={login.signupwithgooglebutton}
                    onPress={() => {
                      dismissKeyboard();
                      handleGoogleSignUp()
                    }}
                    activeOpacity={0.7}
                    disabled={loading || googleLoading}
                  >
                    <Image
                      style={login.googleimage}
                      source={require('../../assets/images/Google-icon.png')}
                    />
                    <Text style={login.registerText}>Continue with Google</Text>
                  </TouchableOpacity> */}
              {/* Divider */}
              <View style={login.dividerContainer}>
                <View style={login.dividerLine} />
                <Text style={login.dividerText}>Not Registered Yet?</Text>
                <View style={login.dividerLine} />
              </View>

              {/* Register Section */}
              <View style={login.registerSection}>
                <Text style={login.registerPrompt}>
                  Ready to begin your reading adventure?
                </Text>

                <View style={login.registerButtonsContainer}>
                  <TouchableOpacity
                    style={login.signupwithemailbutton}
                    onPress={() => {
                      dismissKeyboard();
                      handleNextStep('ChooseRole');
                    }}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <Text style={login.registerText}>Sign Up with Email</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Forgot Password Modal */}
      <Modal visible={forgotPasswordVisible} transparent animationType="fade">
        <View style={login.modalBackdrop}>
          <View style={login.modalContainer}>
            <Text style={login.modalTitle}>Forgot Password</Text>
            <Text style={login.modalDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            <TextInput
              style={login.modalInput}
              placeholder="example@gmail.com"
              placeholderTextColor="#A5B8A7"
              value={forgotPasswordEmail}
              onChangeText={setForgotPasswordEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!forgotPasswordLoading}
            />
            <View style={login.modalActions}>
              <TouchableOpacity
                style={login.modalCancelBtn}
                onPress={() => {
                  setForgotPasswordVisible(false);
                  setForgotPasswordEmail('');
                }}
                disabled={forgotPasswordLoading}
              >
                <Text style={login.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[login.modalSendBtn, forgotPasswordLoading && login.modalSendBtnDisabled]}
                onPress={handleForgotPassword}
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={login.modalSendText}>Send Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaProvider>
  );
}