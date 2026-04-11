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
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Video from 'react-native-video';

// Styles
import login from '../UI_Designs/LoginStyles';

// Controllers (Hooks)
import { useNavigationHelper } from '../Controller/NavigationController';
import { loginUser } from '../Controller/AuthenticationController';
import { initiateGoogleSignUp } from '../Utilities/googleAuthUtils';
import { getAuth } from '@react-native-firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Rate limiting & Network Resilience States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const isMounted = useRef(true);

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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // If a Firebase session already exists on the device, jump to Loading
      if (user && isMounted.current) {
        handleReplaceStep('Loading');
      }
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

      let errorMessage = 'Login failed. Please try again.';
      const newAttempts = failedAttempts + 1;

      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setLockoutTimer(15); // 15-second lockout
      }

      const rawMsg = error.message.toLowerCase();
      if (rawMsg.includes('user-not-found')) errorMessage = 'No account found with this email.';
      else if (rawMsg.includes('wrong-password')) errorMessage = 'Incorrect password. Please try again.';
      else if (rawMsg.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
        if (newAttempts < 3) { setFailedAttempts(3); setLockoutTimer(30); } // Harder lockout if Firebase triggers
      }
      else if (rawMsg.includes('user-disabled')) errorMessage = 'This account has been disabled.';
      else if (rawMsg.includes('invalid-email')) errorMessage = 'Invalid email address.';
      else if (rawMsg.includes('network-request-failed')) errorMessage = 'Network error. Please check your internet connection.';
      else if (rawMsg.includes('invalid-credential')) errorMessage = 'Invalid email or password. Please try again.';
      else if (rawMsg.includes('timeout-error')) errorMessage = 'Connection timed out. Please check your internet connection and try again.';
      else errorMessage = error.message || 'Invalid email or password.';

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
                    secureTextEntry
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
                </View>
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
                  </TouchableOpacity>

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
    </SafeAreaProvider>
  );
}