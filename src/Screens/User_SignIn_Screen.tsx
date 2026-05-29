// React Dependencies
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';

// Styles
import login from '../UI_Designs/LoginStyles';

// Controllers (Hooks)
import { useNavigationHelper } from '../Controller/NavigationController';
import { loginUser, sendPasswordReset, getAuth, onAuthStateChanged } from '../Controller/AuthenticationController';
import { EyeIcon, EyeOffIcon } from '../Components/GlobalUse/Icons';
import ConfirmationModal from '../Components/GlobalUse/ConfirmationModal';


export default function LoginScreen() {
  const { handleNextStep, handleReplaceStep } = useNavigationHelper();
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
  const [showPassword, setShowPassword] = useState(false);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    type: 'primary' as 'primary' | 'danger' | 'info',
    onConfirm: () => setModalVisible(false),
  });


  // Check if user is already logged in on mount
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        handleReplaceStep('Loading');
      }
    });
    return unsubscribe;
  }, [handleReplaceStep]);

  // Dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Validation function
  const validateField = (field: 'email' | 'password', value: string) => {
    let error = '';

    switch (field) {
      case 'email':
        if (!value.trim()) error = 'Kinakailangan';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = 'Invalid email';
        break;
      case 'password':
        if (!value.trim()) error = 'Kinakailangan';
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
    // Dismiss keyboard when submitting
    dismissKeyboard();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Call the login function
      await loginUser(email.trim(), password);

      // Navigate to Loading screen to check user role
      handleReplaceStep('Loading');
    } catch (error: any) {
      // Handle specific login errors
      let errorMessage = 'Login failed. Please try again.';

      if (error.message.includes('user-not-found')) {
        errorMessage = 'Walang nahanap na account gamit ang email na ito.';
      } else if (error.message.includes('wrong-password')) {
        errorMessage = 'Mali ang password. Pakisubukang muli.';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Masyadong maraming failed attempts. Pakisubukan muli mamaya.';
      } else if (error.message.includes('user-disabled')) {
        errorMessage = 'Ang account na ito ay na-disable.';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Hindi wasto ang format ng email address.';
      } else if (error.message.includes('Invalid email or password') || error.message.includes('invalid-credential')) {
        errorMessage = 'Walang account na tumutugma sa mga credentials na ito. Pakisuri ang email at password, o gumawa ng account kung ikaw ay bago dito.';
      } else {
        errorMessage = error.message || 'Email and Password did not match.';
      }

      showAlert('Login Failed', errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string, type: 'primary' | 'danger' | 'info' = 'primary') => {
    setModalContent({
      title,
      message,
      type,
      onConfirm: () => setModalVisible(false),
    });
    setModalVisible(true);
  };

  const handleForgotPassword = async () => {
    dismissKeyboard();
    
    if (!email.trim()) {
      showAlert(
        'Kinakailangan ang Email',
        'Pakilagay ang iyong email address para ma-reset ang iyong password.',
        'info'
      );
      return;
    }

    try {
      setLoading(true);
      const result = await sendPasswordReset(email);
      if (result.success) {
        showAlert(
          'Tagumpay',
          'Ang link para sa pag-reset ng password ay naipadala na sa iyong email.',
          'primary'
        );
      } else {
        showAlert('May Problema', result.error || 'Hindi maipadala ang link sa email.', 'danger');
      }
    } catch (error: any) {
      showAlert('May Problema', error.message || 'Hindi maipadala ang link sa email.', 'danger');
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
    <SafeAreaView style={login.safeAreaContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[login.container, { justifyContent: 'flex-start', paddingTop: 20 }]}>
              <Video
                style={login.video}
                source={require('../../assets/videos/cisc_logo_animated (4).mp4')}
                repeat={true}
              />
              {/* <Image
                style={login.video}
                source={require('../../assets/gifs&animations/')}
                resizeMode="contain"
              /> */}

              {/* EMAIL INPUT */}
              <Text style={login.label}>
                Email Address <Text style={login.requiredStar}>* </Text>
                {touched.email && errors.email ? (
                  <Text style={login.errorText}>{errors.email}</Text>
                ) : null}
              </Text>
              <TextInput
                style={getInputStyle('email')}
                placeholder="cisckids@gmail.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
              />

              {/* PASSWORD INPUT */}
              <Text style={login.label}>
                Password <Text style={login.requiredStar}>* </Text>
                {touched.password && errors.password ? (
                  <Text style={login.errorText}>{errors.password}</Text>
                ) : null}
              </Text>
              <View style={login.passwordContainer}>
                <TextInput
                  style={[getInputStyle('password'), { flex: 1, marginBottom: 0 }]}
                  secureTextEntry={!showPassword}
                  placeholder="∗∗∗∗∗∗∗∗∗∗∗"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity 
                  style={login.eyeIconContainer} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} color="#666" />
                  ) : (
                    <EyeIcon size={20} color="#666" />
                  )}
                </TouchableOpacity>
              </View>

              {/* FORGOT PASSWORD */}
              <TouchableOpacity
                style={login.forgotPassButton}
                disabled={loading}
                onPress={handleForgotPassword}
              >
                <Text style={login.forgotpass}>Nakalimutan ang password?</Text>
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
                  <Text style={login.notRegisteredText}>
                    Wala ka pang account?
                  </Text>
                  <View style={login.rightLine} />
                </View>
                <View>
                  <TouchableOpacity
                    style={login.signupwithemailbutton}
                    onPress={() => {
                      dismissKeyboard();
                      handleNextStep('ChooseRole');
                    }}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <Text style={login.registerText}>Mag-sign up gamit ang email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={modalVisible}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
        onConfirm={modalContent.onConfirm}
        onCancel={() => setModalVisible(false)}
        confirmText="Okay"
        cancelText="Bumalik"
      />
    </SafeAreaView>
  );
}

