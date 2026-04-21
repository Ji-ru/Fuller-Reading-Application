// screens/SignUp/SignUp_One.tsx
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, Image, TextInput, TouchableOpacity, Alert, ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import signup         from '../../UI_Designs/SignUpStyles';
import DatePicker     from 'react-native-date-picker';
import GradeLevelDropDownSelection from '../../Components/SignUp/Buttons/GradeLevelSelectionButton';
import { useNavigationHelper }     from '../../Controller/NavigationController';
import {
  launchImageLibrary, launchCamera, ImagePickerResponse,
} from 'react-native-image-picker';
import buttons         from '../../UI_Designs/ButtonStyles';
import GenderSelection from '../../Components/SignUp/Buttons/GenderRadioButton';
import { RootStackParamList }      from '../../Controller/NavigationController';
import { RouteProp, useRoute }     from '@react-navigation/native';
import BubbleBackground            from '../../Components/GlobalUse/BubbleBackground';
import AlertModal                  from '../../Components/GlobalUse/Modal/AlertModal';
import ActionSheetModal            from '../../Components/GlobalUse/Modal/ActionSheetModal';

type SignUpOneRouteProp = RouteProp<RootStackParamList, 'SignUpOne'>;

export default function SignUpOneScreen() {
  const route = useRoute<SignUpOneRouteProp>();
  const { role } = route.params;

  // ── Read optional Google params forwarded from ChooseRole ──────────────────
  const googleEmail = route.params?.googleEmail;
  const isGoogleSignUp = Boolean(googleEmail);

  const { handleAccountStepNext, handleCancelRegistration, handleBackStep } = useNavigationHelper();

  const [currentStep] = useState(1);

  // Account Information states
  const [email, setEmail] = useState(googleEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // ── Custom Alert Modal State ───────────────────────────────────────────────
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setAlertData({ title, message });
    setAlertVisible(true);
  };

  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  // ── Profile image helpers (unchanged) ──────────────────────────────────────
  const handleProfilePicChange = () => {
    setActionSheetVisible(true);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText: string, cancelText?: string) => {
    setAlertData({ title, message, onConfirm, confirmText, cancelText });
    setAlertVisible(true);
  };

  const isValidEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      showAlert('Notice', 'User cancelled opening picker');
    } else if (response.errorCode) {
      showAlert('Error', 'Failed to pick image. Please try again.');
    } else if (response.assets?.[0]?.uri) {
      setProfileImage(response.assets[0].uri);
    }

    if (role === 'student' && !isParentConfirmed) {
      showAlert(
        'Consent Required',
        'A parent or guardian must confirm consent before registration proceeds.',
        'Acknowledge'
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

  // ── Next: pass personal info + google credentials to SignUpTwo ─────────────
  const handleNext = () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert('Missing Information', 'Please fill out your First Name and Last Name.');
      return;
    }

    // Google credentials are appended to the existing userInfo payload.
    // handleSignUpNavigationWithData must pass them as extra params —
    // see the NavigationController note in the README file.
    if (role === 'student') {
      handleSignUpNavigationWithData({
        profileImageUrl: profileImage || '',
        firstName:  firstName.trim(),
        middleName: middleName.trim(),
        lastName:   lastName.trim(),
        email: '',
        role,
        sex:        gender,
        gradeLevel,
        dateOfBirth: formatDateToReadable(date),
        // ── Google extras ───────────────────────────────────────────────────
        googleEmail,
      });
    } else if (role === 'faculty') {
      handleSignUpNavigationWithData({
        profileImageUrl: profileImage || '',
        firstName:  firstName.trim(),
        middleName: middleName.trim(),
        lastName:   lastName.trim(),
        email: '',
        role,
        sex:        gender,
        assignedGradeLevels: [gradeLevel],
        // ── Google extras ───────────────────────────────────────────────────
        googleEmail,
      });
    } else if (role === 'admin') {
      handleSignUpNavigationWithData({
        profileImageUrl: profileImage || '',
        firstName:  firstName.trim(),
        middleName: middleName.trim(),
        lastName:   lastName.trim(),
        email: '',
        role,
        sex: gender,
        googleEmail,
      });
    }
  };

  return (
  <SafeAreaView style={signup.container}>
    <BubbleBackground />

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
              <Image
                source={require('../../../assets/images/cisckids.png')}
                style={signup.ciscLogo}
              />

              <Text style={signup.label}>Register</Text>

              {/* Step indicator */}
              <View style={signup.stepsContainer}>
                <View
                  style={[
                    signup.stepCircle,
                    currentStep === 1
                      ? signup.activateStep
                      : signup.inactivateStep,
                  ]}
                >
                  <Text
                    style={
                      currentStep === 1
                        ? signup.activenumber
                        : signup.inactivenumber
                    }
                  >
                    1
                  </Text>
                </View>

                <View style={signup.stepLine} />

                <View
                  style={[
                    signup.stepCircle,
                    currentStep === 2
                      ? signup.activateStep
                      : signup.inactivateStep,
                  ]}
                >
                  <Text
                    style={
                      currentStep === 2
                        ? signup.activenumber
                        : signup.inactivenumber
                    }
                  >
                    2
                  </Text>
                </View>
              </View>

              {/* Profile picture */}
              <View style={{ position: 'relative', alignSelf: 'center' }}>
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

              {/* Form */}
              <View>
                <Text style={signup.subLabel}>Personal Information</Text>

                <Text style={signup.textform}>First Name</Text>
                <TextInput
                  style={signup.textInputForm}
                  placeholder="e.g Juan"
                  placeholderTextColor="#A9A9A9"
                  value={firstName}
                  onChangeText={setFirstName}
                />

                <Text style={signup.textform}>Middle Name</Text>
                <TextInput
                  style={signup.textInputForm}
                  placeholder="e.g Marasigan"
                  placeholderTextColor="#A9A9A9"
                  value={middleName}
                  onChangeText={setMiddleName}
                />

                <Text style={signup.textform}>Last Name</Text>
                <TextInput
                  style={signup.textInputForm}
                  placeholder="e.g Campus"
                  placeholderTextColor="#A9A9A9"
                  value={lastName}
                  onChangeText={setLastName}
                />

                <Text style={signup.textform}>Select Gender:</Text>
                <GenderSelection onGenderSelect={setGender} />

                <Text style={signup.textform}>Date of Birth</Text>
                <TouchableOpacity
                  style={signup.dateInput}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={signup.dateText}>
                    {date.toDateString()}
                  </Text>
                  <Image
                    source={require('../../../assets/icons/Calendar-icon.png')}
                    style={signup.icon}
                  />
                </TouchableOpacity>

                <DatePicker
                  modal
                  mode="date"
                  open={showPicker}
                  date={date}
                  maximumDate={new Date()}
                  onConfirm={pickedDate => {
                    setShowPicker(false);
                    setDate(pickedDate);
                  }}
                  onCancel={() => setShowPicker(false)}
                />

                {role !== 'admin' && (
                  <>
                    <Text style={signup.textform}>
                      {role === 'student'
                        ? 'Grade Level'
                        : 'Assigned Grade Level'}
                    </Text>

                    <GradeLevelDropDownSelection
                      onSelect={value => setGradeLevel(value)}
                    />
                  </>
                )}
              </View>

              {/* Buttons */}
              <TouchableOpacity
                style={buttons.nextPageSignUpButton}
                onPress={handleNext}
              >
                <Text style={buttons.nextPageSignUpText}>
                  Next
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={buttons.cancelSignUpButton}
                onPress={handleCancelRegistration}
              >
                <Text style={buttons.cancelSignUpText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
