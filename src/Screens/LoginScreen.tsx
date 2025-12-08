// React Dependencies
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Video from 'react-native-video';

// Styles
import login from '../ui/LoginStyles';
import bubbles from '../ui/BubblesDesign';

// Controllers (Hooks)
import { useNavigationHelper } from '../Controller/NavigationController';
import { loginUser } from '../Controller/AuthenticationController';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  /**
   * Handle navigation for the next page (either sign-in or sign-up)
   * Used in Register Section () and Sign-in Section
   */
  const { handleNextStep, handleReplaceStep } = useNavigationHelper();

  // Validation function
  const validateField = (field: 'email' | 'password', value: string) => {
    let error = '';

    switch (field) {
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = 'Invalid email';
        break;
      case 'password':
        if (!value.trim()) error = 'Password is required';
        break;
    }
    return error;
  };

  // Handle field blur
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, field === 'email' ? email : password);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Handle field change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      const error = validateField('email', value);
      setErrors(prev => ({ ...prev, email: error }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      const error = validateField('password', value);
      setErrors(prev => ({ ...prev, password: error }));
    }
  };

  // Form validation
  const validateForm = () => {
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    setTouched({
      email: true,
      password: true,
    });

    return !emailError && !passwordError;
  };

  /**
   * Handle verification of users credential strored in the firebase authentication
   * Errors:
   * - if either email and password fields are not insterted, then it renders alert error message and ask to enter credentials again
   * - if password are not verified (therefore not stored in firebase auth), then it renders alert error message and ask to enter credentials again
   * @returns - proceed to enter the designated screen page based on user's role (Admin/Staff/Student)
   */
  const handleLogin = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Call the login function
      const result = await loginUser(email.trim(), password);

      if (result.success) {
        // Navigate to Loading screen to check user role
        handleReplaceStep('Loading');
      }
    } catch (error: any) {
      // Handle specific login errors
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
      } else {
        errorMessage = error.message || 'Email and Password did not match.';
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get input style based on error state
  const getInputStyle = (field: 'email' | 'password') => {
    const hasError = touched[field] && errors[field];
    return [
      login.textinput,
      hasError && login.textInputError,
      !hasError && touched[field] && login.textInputValid,
    ];
  };

  return (
    <SafeAreaProvider>
      <ScrollView>
        <View style={login.container}>
          <Video
            style={login.video}
            source={require('../../assets/videos/cisc_logo_animated.mp4')}
            repeat={true}
          />

          {/* EMAIL INPUT */}
          <Text style={login.label}>
            Email Address <Text style={login.requiredStar}>* </Text>
            {touched.email && errors.email ? (
              <Text style={login.errorText}>{errors.email}</Text>
            ) : null}
          </Text>
          <TextInput
            style={getInputStyle('email')}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={handleEmailChange}
            onBlur={() => handleBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          {/* PASSWORD INPUT */}
          <Text style={login.label}>
            Password <Text style={login.requiredStar}>* </Text>
            {touched.password && errors.password ? (
              <Text style={login.errorText}>{errors.password}</Text>
            ) : null}
          </Text>
          <TextInput
            style={getInputStyle('password')}
            secureTextEntry
            placeholder="**********"
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={() => handleBlur('password')}
            editable={!loading}
          />

          {/* FORGOT PASSWORD */}
          <TouchableOpacity style={login.forgotPassButton} disabled={loading}>
            <Text style={login.forgotpass}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* SIGN IN BUTTON */}
          <TouchableOpacity
            style={[
              login.button,
              loading && login.buttonDisabled,
              (!email || !password) && login.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={login.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* REGISTER SECTION - KEEP EXACTLY THE SAME */}
          <View style={login.notRegisteredContainer}>
            <View style={login.notRegisteredAlignment}>
              <View style={login.leftLine} />
              <Text style={login.notRegisteredText}>Not Registered Yet?</Text>
              <View style={login.rightLine} />
            </View>
            <View>
              <TouchableOpacity
                style={login.signupwithgooglebutton}
                onPress={() => handleNextStep('SignUpOne')}
                activeOpacity={0.7}
              >
                <Image
                  style={login.googleimage}
                  source={require('../../assets/images/Google-icon.png')}
                />
                <Text style={login.registerText}>Sign Up with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={login.signupwithemailbutton}
                onPress={() => handleNextStep('ChooseRole')}
                activeOpacity={0.7}
              >
                <Text style={login.registerText}>Sign Up with Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
