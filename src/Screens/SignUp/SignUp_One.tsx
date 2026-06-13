import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, Image, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Keyboard, StyleSheet,
} from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';
import signup from '../../UI_Designs/SignUpStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import buttons from '../../UI_Designs/ButtonStyles';
import { RootStackParamList } from '../../Controller/NavigationController';
import { RouteProp, useRoute } from '@react-navigation/native';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import AlertModal from '../../Components/GlobalUse/Modal/AlertModal';
import upperNav from '../../UI_Designs/UpperNavigation';

type SignUpOneRouteProp = RouteProp<RootStackParamList, 'SignUpOne'>;

const C = {
  greenDark: '#008443',
  greenPale: '#E8F5E9',
  white:     '#ffffff',
  ink:       '#1B2B22',
};

function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
    </View>
  );
}

const H = StyleSheet.create({
  backBtn: {
    width: 45, height: 45, borderRadius: 10,
    backgroundColor: C.greenDark,
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40, fontFamily: 'Nunito-Bold',
    color: C.white, lineHeight: 28, marginLeft: -2, paddingBottom: 2,
  },
  menuBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
});

export default function SignUpOneScreen() {
  const route = useRoute<SignUpOneRouteProp>();
  const { role } = route.params;

  const googleEmail    = route.params?.googleEmail;
  const isGoogleSignUp = Boolean(googleEmail);

  const { handleAccountStepNext, handleCancelRegistration, handleBackStep } = useNavigationHelper();

  const [email,               setEmail]               = useState(googleEmail ?? '');
  const [password,            setPassword]            = useState('');
  const [confirmPassword,     setConfirmPassword]     = useState('');
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isParentConfirmed,   setIsParentConfirmed]   = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData]       = useState<{
    title: string; message: string;
    onConfirm?: () => void; confirmText?: string; cancelText?: string;
  }>({ title: '', message: '' });

  const showAlert = (title: string, message: string, confirmText?: string) => {
    setAlertData({ title, message, confirmText: confirmText || 'Got it' });
    setAlertVisible(true);
  };

  const showConfirm = (
    title: string, message: string,
    onConfirm: () => void, confirmText: string, cancelText?: string,
  ) => {
    setAlertData({ title, message, onConfirm, confirmText, cancelText });
    setAlertVisible(true);
  };

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleCancelPress = () => {
    const isEmpty = !email.trim() && !password && !confirmPassword && !isParentConfirmed;
    if (isEmpty) {
      handleCancelRegistration(false);
    } else {
      showConfirm(
        'Cancel Registration',
        'Are you sure you want to cancel? Your progress will be lost.',
        () => { setAlertVisible(false); handleCancelRegistration(false); },
        'Discard Progress', 'Keep Going',
      );
    }
  };

  const handleNext = () => {
    if (!isGoogleSignUp) {
      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        showAlert('Incomplete Form', 'Please ensure all fields are filled out before proceeding.'); return;
      }
      if (!isValidEmail(email.trim())) {
        showAlert('Invalid Email Address', 'The email format you entered is incorrect.'); return;
      }
      if (password.length < 8) {
        showAlert('Password Too Short', 'Your password must be at least 8 characters.'); return;
      }
      if (password !== confirmPassword) {
        showAlert('Passwords Mismatch', 'Both password fields must match.'); return;
      }
    }
    if (role === 'student' && !isParentConfirmed) {
      showAlert('Consent Required', 'A parent or guardian must confirm consent before proceeding.'); return;
    }
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

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={upperNav.header}>
        <TouchableOpacity style={H.backBtn} onPress={() => handleBackStep()} activeOpacity={0.7}>
          <Text style={H.backArrowText}>‹</Text>
        </TouchableOpacity>

        <Svg height={60} width={220}>
          <SvgText
            x={110} y={35} fontSize={23}
            fontFamily="Nunito-Black" textAnchor="middle"
            fill="none" stroke={C.greenPale}
            strokeWidth={8} strokeLinejoin="round"
          >
            Create Account
          </SvgText>
          <SvgText
            x={110} y={35} fontSize={23}
            fontFamily="Nunito-Black" textAnchor="middle"
            fill={C.greenDark}
          >
            Create Account
          </SvgText>
        </Svg>

        {/* Spacer */}
        <View style={{ width: 45 }} />
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
                  <View style={signup.googleEmailBadge}>
                    <Image source={require('../../../assets/images/Google-icon.png')} style={signup.googleIcon} />
                    <Text style={signup.googleEmailText} numberOfLines={1}>{googleEmail}</Text>
                    <View style={signup.lockedTag}>
                      <Text style={signup.lockedTagText}>Google</Text>
                    </View>
                  </View>
                ) : (
                  <View style={signup.inputContainer}>
                    <View style={signup.iconContainer}><Text style={signup.inputIconText}>✉️</Text></View>
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

                {!isGoogleSignUp && (
                  <>
                    <View style={signup.inputContainer}>
                      <View style={signup.iconContainer}><Text style={signup.inputIconText}>🔒</Text></View>
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
                          source={showPassword
                            ? require('../../../assets/icons/EyesClose-icon.png')
                            : require('../../../assets/icons/EyesOpen-icon.png')}
                          style={signup.eyeIcon}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={signup.inputContainer}>
                      <View style={signup.iconContainer}><Text style={signup.inputIconText}>🔒</Text></View>
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
                          source={showConfirmPassword
                            ? require('../../../assets/icons/EyesClose-icon.png')
                            : require('../../../assets/icons/EyesOpen-icon.png')}
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

              <TouchableOpacity style={buttons.nextPageSignUpButton} onPress={handleNext}>
                <Text style={buttons.nextPageSignUpText}>Next</Text>
              </TouchableOpacity>

              <TouchableOpacity style={buttons.cancelSignUpButton} onPress={handleCancelPress}>
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