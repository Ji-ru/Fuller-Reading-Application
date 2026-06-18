import React, { useState, useRef, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  Modal, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Keyboard,
  StyleSheet,
} from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';
import signup from '../../UI_Designs/SignUpStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import buttons from '../../UI_Designs/ButtonStyles';
import upperNav from '../../UI_Designs/UpperNavigation';
import { RootStackParamList } from '../../Controller/NavigationController';
import {
  SignUpUserCredentials,
  GoogleSignUpUserCredentials,
} from '../../Controller/AuthenticationController';
import {
  launchImageLibrary, launchCamera, ImagePickerResponse,
} from 'react-native-image-picker';
import LottieView from 'lottie-react-native';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import AlertModal from '../../Components/GlobalUse/Modal/AlertModal';
import ActionSheetModal from '../../Components/GlobalUse/Modal/ActionSheetModal';
import DatePicker from 'react-native-date-picker';
import GenderSelection from '../../Components/SignUp/Buttons/GenderRadioButton';
import GradeLevelDropDownSelection from '../../Components/SignUp/Buttons/GradeLevelSelectionButton';

const C = {
  greenDark: '#008443',
  greenPale: '#E8F5E9',
  white:     '#ffffff',
  ink:       '#1B2B22',
};

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
});

type SignUpTwoRouteProp = RouteProp<RootStackParamList, 'SignUpTwo'>;

export default function SignUpTwoScreen() {
  const route = useRoute<SignUpTwoRouteProp>();
  const { accountInfo, role } = route.params;
  const isGoogleSignUp = Boolean(accountInfo.googleEmail);

  const { handleCancelRegistration, handleCompletedRegistration, handleBackStep } = useNavigationHelper();

  // ── States ───────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [gradeLevel, setGradeLevel] = useState(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isParentConfirmed] = useState(accountInfo.parentConfirmed);

  // Custom Alert Modal State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<{
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({ title: '', message: '' });

  const showAlert = (title: string, message: string) => {
    setAlertData({ title, message, confirmText: 'Got it' });
    setAlertVisible(true);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText: string, cancelText?: string) => {
    setAlertData({ title, message, onConfirm, confirmText, cancelText });
    setAlertVisible(true);
  };

  // Modal states (Loading / Success)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'loading' | 'success'>('loading');
  const [modalMessage, setModalMessage] = useState('');
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isMounted = useRef(true);
  const congratulationsRef = useRef<LottieView>(null);
  const confettiRef = useRef<LottieView>(null);

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

  // ── Image Helpers ──────────────────────────────────────────────────────────
  const handleProfilePicChange = () => setActionSheetVisible(true);

  const openCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: true }, handleImageResponse);
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, handleImageResponse);
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      showAlert('Error', 'Failed to pick image. Please try again.');
    } else if (response.assets?.[0]?.uri) {
      setProfileImage(response.assets[0].uri);
    }
  };

  const formatDateToReadable = (dateObj: Date): string => {
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // ── Registration ──────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !gender) {
      showAlert('Incomplete Form', 'Please ensure all required fields (Name and Gender) are filled out.');
      return;
    }

    // Vulnerability Solver Check
    if (!isGoogleSignUp) {
      if (!accountInfo.email || !isValidEmail(accountInfo.email)) {
        showAlert('Security Error', 'Invalid email format detected in the registration flow.');
        return;
      }
      if (accountInfo.password && accountInfo.password.length > 128) {
        showAlert('Security Error', 'Password exceeds maximum allowed length.');
        return;
      }
    }

    try {
      setModalType('loading');
      setModalMessage('Creating your account...');
      setModalVisible(true);

      const email = accountInfo.email;
      const password = accountInfo.password || '';
      const normalizedGradeLevel = typeof gradeLevel === 'string' ? parseInt(gradeLevel, 10) : gradeLevel;

      const userData = {
        role,
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        sex: gender,
        profileImageUrl: profileImage || '',
        gradeLevel: role === 'student' ? gradeLevel : undefined,
        dateOfBirth: formatDateToReadable(date),
        assignedGradeLevels: role === 'faculty' ? [normalizedGradeLevel] : undefined,
        parentConsent: { confirmed: isParentConfirmed || false },
      };

      if (isGoogleSignUp) {
        await withTimeout(GoogleSignUpUserCredentials(email, userData), 60000, 'Google Sign Up');
      } else {
        await withTimeout(SignUpUserCredentials(email, password, userData), 60000, 'Email Sign Up');
      }

      if (!isMounted.current) return;
      setModalType('success');
      setModalMessage('Account created successfully!');

      setTimeout(() => {
        confettiRef.current?.play();
        congratulationsRef.current?.play();
      }, 500);

      setTimeout(() => {
        if (isMounted.current) {
          setModalVisible(false);
          handleCompletedRegistration(role);
        }
      }, 3000);

    } catch (error: any) {
      if (!isMounted.current) return;
      setModalVisible(false);
      const msg = error.message && error.message.includes('timeout-error')
        ? 'Connection timed out. Please check your internet connection.'
        : error.message;
      showAlert('Registration Error', msg);
    }
  };

  return (
    <SafeAreaView style={signup.container}>
      <BubbleBackground />

      {/* Header / Back Button */}
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

      <View style={{ width: 45 }} />  
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView 
          scrollEnabled={!dropdownOpen}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, zIndex: 1 }}>
              {/* Step indicator */}
              <View style={signup.stepsContainer}>
                <View style={[signup.stepCircle, signup.activateStep]}>
                  <Text style={signup.activenumber}>✓</Text>
                </View>
                <View style={signup.stepLine} />
                <View style={[signup.stepCircle, signup.activateStep]}>
                  <Text style={signup.activenumber}>2</Text>
                </View>
              </View>

              {/* Profile picture */}
              <View style={{ position: 'relative', alignSelf: 'center', marginVertical: 20 }}>
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require('../../../assets/images/defaultProfile.png')
                  }
                  style={signup.defaultProfile}
                />
                <TouchableOpacity onPress={handleProfilePicChange} style={signup.cameraBackground}>
                  <Image source={require('../../../assets/icons/Camera-add.png')} style={signup.cameraIcon} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View>
                <Text style={signup.subLabel}>Personal Information</Text>

                <View style={signup.inputContainer}>
                  <View style={signup.iconContainer}><Text style={signup.inputIconText}>👤</Text></View>
                  <TextInput
                    style={signup.textInputForm}
                    placeholder="First Name"
                    placeholderTextColor="#A9A9A9"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={signup.inputContainer}>
                  <View style={signup.iconContainer}><Text style={signup.inputIconText}>👤</Text></View>
                  <TextInput
                    style={signup.textInputForm}
                    placeholder="Middle Name (Optional)"
                    placeholderTextColor="#A9A9A9"
                    value={middleName}
                    onChangeText={setMiddleName}
                  />
                </View>

                <View style={signup.inputContainer}>
                  <View style={signup.iconContainer}><Text style={signup.inputIconText}>👤</Text></View>
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
                <TouchableOpacity style={signup.dateInput} onPress={() => setShowPicker(true)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={require('../../../assets/icons/Calendar-icon.png')} style={signup.icon} />
                    <Text style={signup.dateText}>{date.toDateString()}</Text>
                  </View>
                  <Image source={require('../../../assets/icons/VerticalDown-icon.png')} style={{ width: 16, height: 16, tintColor: '#999' }} />
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
                  <View style={{ zIndex: 999, elevation: 999 }}>
                    <Text style={signup.textform}>{role === 'student' ? 'Grade Level' : 'Assigned Grade Level'}</Text>
                    <GradeLevelDropDownSelection 
                    key={`grade-${role}`}
                    onSelect={value => setGradeLevel(value)} />
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={{ marginTop: 10 }}>
                <TouchableOpacity
                  style={[buttons.nextPageSignUpButton, { marginTop: 30 }]}
                  onPress={handleRegister}
                >
                  <Text style={buttons.nextPageSignUpText}>Complete Registration</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={buttons.cancelSignUpButton}
                  onPress={() => handleCancelRegistration(false)}
                >
                  <Text style={buttons.cancelSignUpText}>Cancel</Text>
                </TouchableOpacity>
              </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionSheetModal
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        title="Profile Picture"
        options={[
          { text: 'Take a Photo', onPress: openCamera },
          { text: 'Choose from Gallery', onPress: openGallery },
          { text: 'Cancel', onPress: () => setActionSheetVisible(false), isCancel: true }
        ]}
      />

      <AlertModal
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        confirmText={alertData.confirmText}
        onConfirm={alertData.onConfirm || (() => setAlertVisible(false))}
        cancelText={alertData.cancelText}
        onClose={() => setAlertVisible(false)}
      />

      <Modal transparent animationType="fade" visible={modalVisible}>
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
                  autoPlay={false} loop={false} style={signup.confettiAnimation} resizeMode="cover"
                />
                <LottieView
                  ref={congratulationsRef}
                  source={require('../../../assets/gifs&animations/Congratulations.json')}
                  autoPlay={false} loop={false} style={signup.congratulationsAnimation} resizeMode="contain"
                />
                <Text style={[signup.modalText, signup.successText]}>{modalMessage}</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
