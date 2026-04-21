import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, Image, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import signup from '../../UI_Designs/SignUpStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import buttons from '../../UI_Designs/ButtonStyles';
import { RootStackParamList } from '../../Controller/NavigationController';
import { RouteProp, useRoute } from '@react-navigation/native';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import AlertModal from '../../Components/GlobalUse/Modal/AlertModal';
import upperNav from '../../UI_Designs/UpperNavigation';

type SignUpOneRouteProp = RouteProp<RootStackParamList, 'SignUpOne'>;

export default function SignUpOneScreen() {
  const route = useRoute<SignUpOneRouteProp>();
  const { role } = route.params;

  // ── Read optional Google params forwarded from ChooseRole ──────────────────
  const googleEmail = route.params?.googleEmail;
  const isGoogleSignUp = Boolean(googleEmail);

  const { handleAccountStepNext, handleCancelRegistration, handleBackStep } = useNavigationHelper();

  // ── Account Information States ───────────────────────────────────────────
  const [email, setEmail] = useState(googleEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isParentConfirmed, setIsParentConfirmed] = useState(false);

  // ── Custom Alert Modal State ───────────────────────────────────────────────
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<{
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({ title: '', message: '' });

  const showAlert = (title: string, message: string, confirmText?: string) => {
    setAlertData({
      title,
      message,
      confirmText: confirmText || 'Got it',
      onConfirm: undefined,
      cancelText: undefined,
    });
    setAlertVisible(true);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string,
    cancelText?: string
  ) => {
    setAlertData({ title, message, onConfirm, confirmText, cancelText });
    setAlertVisible(true);
  };

  const isValidEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  // ── Profile image helpers (unchanged) ──────────────────────────────────────
  const handleCancelPress = () => {
    const isEmpty = !email.trim() && !password && !confirmPassword && !isParentConfirmed;

    if (isEmpty) {
      handleCancelRegistration(false);
    } else {
      showConfirm(
        'Cancel Registration',
        'Are you sure you want to cancel? Your progress will be lost.',
        () => {
          setAlertVisible(false);
          handleCancelRegistration(false);
        },
        'Discard Progress',
        'Keep Going'
      );
    }
  };

  const handleNext = () => {
    // Password validation only applies to the email/password path
    if (!isGoogleSignUp) {
      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        showAlert('Incomplete Form', 'Please ensure all fields are filled out before proceeding.');
        return;
      }
      if (!isValidEmail(email.trim())) {
        showAlert('Invalid Email Address', 'The email format you entered is incorrect.');
        return;
      }
      if (password.length < 8) {
        showAlert('Password Too Short', 'For security reasons, your password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        showAlert('Passwords Mismatch', 'Please make sure both password fields contain the exact same characters.');
        return;
      }
    }

    if (role === 'student' && !isParentConfirmed) {
      showAlert(
        'Consent Required',
        'A parent or guardian must confirm consent before registration proceeds.'
      );
      return;
    }

    // Proceed to Step 2
    handleAccountStepNext(role, {
      email: email.trim(),
      password: isGoogleSignUp ? undefined : password,
      parentConfirmed: isParentConfirmed,
      googleEmail,
    });
  };

  return (
    <SafeAreaView style={signup.container}>
      <BubbleBackground />

      {/* Header / Back Button */}
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <Text style={signup.label}>Register</Text>

              {/* Step indicator */}
              <View style={signup.stepsContainer}>
                <View style={[signup.stepCircle, signup.activateStep]}>
                  <Text style={signup.activenumber}>1</Text>
                </View>
                <View style={signup.stepLine} />
                <View style={[signup.stepCircle, signup.inactivateStep]}>
                  <Text style={signup.inactivenumber}>2</Text>
                </View>
              </View>

              <Text style={signup.subLabel}>Create an Account</Text>

              <View style={{ marginTop: 20 }}>
                {isGoogleSignUp ? (
                  // ── Locked Google email badge ──────────────────────────────────
                  <View style={signup.googleEmailBadge}>
                    <Image
                      source={require('../../../assets/images/Google-icon.png')}
                      style={signup.googleIcon}
                    />
                    <Text style={signup.googleEmailText} numberOfLines={1}>
                      {googleEmail}
                    </Text>
                    <View style={signup.lockedTag}>
                      <Text style={signup.lockedTagText}>Google</Text>
                      </View>
                  </View>
                ) : (
                  // ── Editable email input (email path) ─────────────────────────
                  <View style={signup.inputContainer}>
                    <View style={signup.iconContainer}>
                      <Text style={signup.inputIconText}>✉️</Text>
                      </View>
                    <TextInput
                      style={signup.textInputForm}
                      placeholder="Email Address"
                      placeholderTextColor="#A9A9A9"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                )}

                {/* Password fields hidden for Google sign-up */}
                {!isGoogleSignUp && (
                  <>
                    <View style={signup.inputContainer}>
                      <View style={signup.iconContainer}>
                        <Text style={signup.inputIconText}>🔒</Text>
                        </View>
                      <TextInput
                        style={signup.textInputForm}
                        secureTextEntry={!showPassword}
                        placeholder="Password"
                        placeholderTextColor="#A9A9A9"
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image
                          source={
                            showPassword
                              ? require('../../../assets/icons/EyesClose-icon.png')
                              : require('../../../assets/icons/EyesOpen-icon.png')
                          }
                          style={signup.eyeIcon}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={signup.inputContainer}>
                      <View style={signup.iconContainer}>
                        <Text style={signup.inputIconText}>🔒</Text>
                        </View>
                      <TextInput
                        style={signup.textInputForm}
                        secureTextEntry={!showConfirmPassword}
                        placeholder="Confirm Password"
                        placeholderTextColor="#A9A9A9"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Image
                          source={
                            showConfirmPassword
                              ? require('../../../assets/icons/EyesClose-icon.png')
                              : require('../../../assets/icons/EyesOpen-icon.png')
                          }
                          style={signup.eyeIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {role === 'student' && (
                  <TouchableOpacity
                    style={signup.checkboxContainer}
                    onPress={() => setIsParentConfirmed(!isParentConfirmed)}
                    activeOpacity={0.8}
                  >
                    <View style={[signup.checkbox, isParentConfirmed && signup.checkedBox]}>
                      {isParentConfirmed && <Text style={signup.checkmark}>✓</Text>}
                    </View>

                    <Text style={signup.checkboxText}>
                      By checking this box, I confirm that I am a parent or guardian and consent
                      to my child's registration.
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Navigation Buttons */}
              <TouchableOpacity
                style={buttons.nextPageSignUpButton}
                onPress={handleNext}
              >
                <Text style={buttons.nextPageSignUpText}>Next</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={buttons.cancelSignUpButton}
                onPress={handleCancelPress}
              >
                <Text style={buttons.cancelSignUpText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <AlertModal
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        confirmText={alertData.confirmText}
        onConfirm={alertData.onConfirm}
        cancelText={alertData.cancelText}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}
