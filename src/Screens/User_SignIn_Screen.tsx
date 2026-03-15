// User_SignIn_Screen.tsx
// React Dependencies
import React, { useState, useEffect } from 'react';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { handleNextStep, handleReplaceStep, routeParams } = useNavigationHelper();

  useEffect(() => {
    if (routeParams?.authError) {
      setAuthError(routeParams.authError);
    }
  }, [routeParams?.authError]);

  // Dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  /**
   * Handle verification of users credential stored in the firebase authentication
   */
  const handleLogin = async () => {
    dismissKeyboard();

    // Clear previous errors
    setAuthError('');

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(email.trim(), password);

      if (result.success) {
        handleReplaceStep('Loading');
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';

      if (error.message.includes('user-not-found')) {
        errorMessage = 'No account found with this email.';
      } else if (error.message.includes('wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message.includes('user-disabled')) {
        errorMessage = 'This account has been disabled.';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Invalid email address.';
      } else if (error.message.includes('network-request-failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('invalid-credential')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else {
        errorMessage = error.message || 'Invalid email or password.';
      }

      setAuthError(errorMessage);
    } finally {
      setLoading(false);
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

              {/* Email Input */}
              <View style={login.inputWrapper}>
                <Text style={login.inputLabel}>Email Address</Text>
                <View style={login.inputContainer}>
                  <View style={login.iconContainer}>
                    <Text style={login.inputIcon}>✉️</Text>
                  </View>
                  <TextInput
                    style={login.input}
                    placeholder=""
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
                    placeholder=""
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
                  loading && login.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={login.loginButtonText}>Login</Text>
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
                      handleNextStep('SignUpOne');
                    }}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <Image
                      style={login.googleimage}
                      source={require('../../assets/images/Google-icon.png')}
                    />
                    <Text style={login.registerText}>Sign Up with Google</Text>
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