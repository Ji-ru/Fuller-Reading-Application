import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangleIcon } from '../../Components/GlobalUse/Icons';
import GenderSelection from '../../Components/SignUp/Buttons/GenderRadioButton';
import GradeLevelDropDownSelection from '../../Components/SignUp/Buttons/GradeLevelSelectionButton';
import { getClassByCode, verifyFacultyAccessCode } from '../../Controller/AuthenticationController';
import { RootStackParamList, useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import buttons from '../../UI_Designs/ButtonStyles';
import signup from '../../UI_Designs/SignUpStyles';


type SignUpOneRouteProp = RouteProp<RootStackParamList, 'SignUpOne'>;

export default function SignUpOneScreen() {
  // Navigation handlers
  // Get role from navigation params
  const route = useRoute<SignUpOneRouteProp>();
  const { role } = route.params;

  // Add state of the Registration Steps using react hook
  const { handleSignUpNavigationWithData, handleCancelRegistration, handleBackStep } =
    useNavigationHelper();

  // current step - UNDER CONSTRUCTION!!
  const [currentStep, setCurrentStep] = useState(1);

  // Personal Infomation States
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(1); // Default to 1 to match UI default of dropdown
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Set user sex
  const [gender, setGender] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [classCode, setClassCode] = useState('');

  // Cancel Modal State

  const [showImageSourceModal, setShowImageSourceModal] = useState(false);

  // Validation State
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  // Handle profile picture selection
  const handleProfilePicChange = () => {
    setShowImageSourceModal(true);
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      saveToPhotos: true,
    };
    launchCamera(options, (response: ImagePickerResponse) => {
      handleImageResponse(response);
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      handleImageResponse(response);
    });
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      Alert.alert('Error', 'User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } else if (response.assets && response.assets[0].uri) {
      setProfileImage(response.assets[0].uri);
    }
  };

  // Tagalog month names
  const tagalogMonths = [
    'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
    'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'
  ];

  const formatDateTagalog = (dateObj: Date): string => {
    const day = dateObj.getDate();
    const month = tagalogMonths[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Helper function to format date as "7 Pebrero 2025"
  const formatDateToReadable = (dateObj: Date): string => {
    const day = dateObj.getDate();
    const month = tagalogMonths[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <SafeAreaView style={signup.container}>
      {/* BUBBLE DECORATIONS */}
      <View style={bubbles.bubblesContainer}>
        {/* Top Bubbles */}
        <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
        <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
        <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
        <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />

        {/* Bottom Bubbles */}
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
        <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* HEADER WITH BACK BUTTON */}
            <View style={localStyles.headerRow}>
              <TouchableOpacity style={localStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
                <View style={localStyles.backArrow} />
              </TouchableOpacity>
              <Image
                source={require('../../../assets/images/cisckids copy.png')}
                style={localStyles.logo}
                resizeMode="contain"
              />
              <View style={{ width: 44 }} />
            </View>
            {/* PROFILE PICTURE WITH CHANGE BUTTON */}
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

            {/* PERSONAL INFORMATION */}
            <View>
              {/* FIRST NAME */}
              <Text style={signup.textform}>Pangalan</Text>
              <TextInput
                style={[signup.textInputForm, isSubmitted && !firstName.trim() ? { borderColor: '#e74c3c' } : null]}
                placeholder="e.g Juan "
                value={firstName}
                onChangeText={setFirstName}
              />
              {isSubmitted && !firstName.trim() && (
                <Text style={[localStyles.requirementInfo, { color: '#e74c3c' }]}>
                  * Kinakailangan
                </Text>
              )}

              {/* LAST NAME */}
              <Text style={signup.textform}>Apelyido</Text>
              <TextInput
                style={[signup.textInputForm, isSubmitted && !lastName.trim() ? { borderColor: '#e74c3c' } : null]}
                placeholder="e.g Campus"
                value={lastName}
                onChangeText={setLastName}
              />
              {isSubmitted && !lastName.trim() && (
                <Text style={[localStyles.requirementInfo, { color: '#e74c3c' }]}>
                  * Kinakailangan
                </Text>
              )}

              {/* SEX */}
              <Text style={signup.textform}>Kasarian</Text>
              <GenderSelection onGenderSelect={setGender} />
              {isSubmitted && !gender && (
                <Text style={[localStyles.requirementInfo, { color: '#e74c3c' }]}>
                  * Kinakailangan
                </Text>
              )}

              {/* DATE OF BIRTH */}
              <Text style={signup.textform}>Petsa ng Kapanganakan</Text>
              <TouchableOpacity
                style={[
                  signup.textInputForm,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                  }
                ]}
                activeOpacity={0.7}
                onPress={() => setShowPicker(true)}
              >
                <Text style={{ fontSize: 15, color: '#1b2e23', fontFamily: 'Andika-Regular' }}>
                  {formatDateTagalog(date)}
                </Text>
                <Image
                  source={require('../../../assets/icons/Calendar-icon.png')}
                  style={{ width: 18, height: 18, tintColor: '#3d71d9' }}
                />
              </TouchableOpacity>

              {/* Custom Date Picker Bottom Sheet */}
              <Modal
                visible={showPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPicker(false)}
              >
                <TouchableOpacity
                  style={localStyles.dateOverlay}
                  activeOpacity={1}
                  onPress={() => setShowPicker(false)}
                >
                  <View style={localStyles.dateModal}>
                    <View style={localStyles.dateIndicator} />
                    <Text style={localStyles.dateModalTitle}>Pumili ng Petsa</Text>

                    <DatePicker
                      date={date}
                      mode="date"
                      maximumDate={new Date()}
                      onDateChange={setDate}
                      locale="fil"
                      theme="light"
                      dividerColor="#d4f5e2"
                      style={{ alignSelf: 'center' }}
                    />

                    <View style={localStyles.dateActions}>
                      <TouchableOpacity
                        style={localStyles.dateCancelBtn}
                        onPress={() => setShowPicker(false)}
                      >
                        <Text style={localStyles.dateCancelText}>I-kansela</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={localStyles.dateConfirmBtn}
                        onPress={() => setShowPicker(false)}
                      >
                        <Text style={localStyles.dateConfirmText}>Piliin</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>

              <Text style={signup.textform}>
                {role === 'student' ? 'Antas ng Baitang' : 'Assigned Grade Level'}
              </Text>
              <GradeLevelDropDownSelection
                onSelect={value => setGradeLevel(value)}
              />

              {/* CLASS CODE - Student Only */}
              {role === 'student' && (
                <>
                  <Text style={signup.textform}>Class Code (Opsyonal)</Text>
                  <TextInput
                    style={signup.textInputForm}
                    placeholder="Ilagay ang class code"
                    value={classCode}
                    onChangeText={setClassCode}
                    autoCapitalize="characters"
                  />
                  <Text style={localStyles.requirementInfo}>
                    * Maaari itong i-skip at ilagay mamaya.
                  </Text>
                </>
              )}

              {/* VERIFICATION CODE - Faculty Only */}
              {role === 'faculty' && (
                <>
                  <Text style={signup.textform}>Faculty Access Code</Text>
                  <TextInput
                    style={[signup.textInputForm, isSubmitted && !verificationCode.trim() ? { borderColor: '#e74c3c' } : null]}
                    placeholder="Enter Secret Code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    autoCapitalize="characters"
                  />
                  {isSubmitted && !verificationCode.trim() && (
                    <Text style={[localStyles.requirementInfo, { color: '#e74c3c' }]}>
                      * Kinakailangan
                    </Text>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity
              style={buttons.nextPageButton}
              onPress={() => {
                setIsSubmitted(true);
                
                // Check if required fields are filled
                if (!firstName.trim() || !lastName.trim() || !gender) {
                  return;
                }

                // Faculty requires access code
                if (role === 'faculty' && !verificationCode.trim()) {
                  return;
                }

                if (role === 'student') {
                  handleSignUpNavigationWithData({
                    profileImageUrl: profileImage || '',
                    firstName: firstName.trim(),
                    middleName: middleName.trim(),
                    lastName: lastName.trim(),
                    email: '',
                    role,
                    sex: gender,
                    gradeLevel,
                    dateOfBirth: formatDateToReadable(date),
                    classCode: classCode.trim(),
                  });
                } else if (role === 'faculty') {
                  if (!verifyFacultyAccessCode(verificationCode.trim())) {
                    Alert.alert('Error', 'Invalid Faculty Access Code. Please contact your administrator.');
                    return;
                  }

                  handleSignUpNavigationWithData({
                    profileImageUrl: profileImage || '',
                    firstName: firstName.trim(),
                    middleName: middleName.trim(),
                    lastName: lastName.trim(),
                    email: '',
                    role,
                    sex: gender,
                    assignedGradeLevels: [gradeLevel],
                    facultyCode: verificationCode.trim(),
                  });
                }
              }}
            >
              <Text style={buttons.nextPageText}>Kasunod</Text>
            </TouchableOpacity>


          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Profile Picture Source Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImageSourceModal}
        onRequestClose={() => setShowImageSourceModal(false)}
      >
        <TouchableOpacity 
          style={localStyles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowImageSourceModal(false)}
        >
          <View style={[localStyles.modalContainer, { paddingBottom: 24 }]}>
            <View style={localStyles.dateIndicator} />
            <Text style={[localStyles.modalTitle, { marginBottom: 24 }]}>Pumili ng Litrato</Text>
            
            <View style={{ width: '100%', marginTop: 8 }}>
              <TouchableOpacity
                style={localStyles.imageSourceBtn}
                onPress={() => {
                  setShowImageSourceModal(false);
                  openCamera();
                }}
                activeOpacity={0.7}
              >
                <View style={[localStyles.sourceIconBox, { backgroundColor: '#3d71d9' + '12' }]}>
                   <Image source={require('../../../assets/icons/Camera-add.png')} style={[localStyles.sourceIcon, { tintColor: '#3d71d9' }]} />
                </View>
                <Text style={localStyles.imageSourceText}>Kumuha ng Litrato</Text>
              </TouchableOpacity>

              <View style={localStyles.sourceDivider} />

              <TouchableOpacity
                style={localStyles.imageSourceBtn}
                onPress={() => {
                  setShowImageSourceModal(false);
                  openGallery();
                }}
                activeOpacity={0.7}
              >
                <View style={[localStyles.sourceIconBox, { backgroundColor: '#3d71d9' + '12' }]}>
                   <Image source={require('../../../assets/icons/Calendar-icon.png')} style={[localStyles.sourceIcon, { tintColor: '#3d71d9' }]} />
                </View>
                <Text style={localStyles.imageSourceText}>Pumili sa Gallery</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[localStyles.modalCancelBtn, { marginTop: 20, width: '100%' }]}
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={localStyles.modalCancelBtnText}>I-kansela</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  backArrow: {
    width: 12,
    height: 12,
    borderLeftWidth: 2.5,
    borderTopWidth: 2.5,
    borderColor: '#1b2e23',
    transform: [{ rotate: '-45deg' }],
  },
  logo: {
    width: 100,
    height: 90,
  },

  // Date Picker Bottom Sheet
  dateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  dateModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
  },
  dateIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#eee',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  dateModalTitle: {
    fontSize: 18,
    fontFamily: 'Andika-Bold',
    color: '#1b2e23',
    marginBottom: 16,
    textAlign: 'center',
  },
  datePreview: {
    backgroundColor: '#3d71d9' + '12',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  datePreviewText: {
    fontSize: 16,
    fontFamily: 'Andika-Bold',
    color: '#3d71d9',
    textAlign: 'center',
  },
  dateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    gap: 12,
  },
  dateCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#3d71d9' + '20',
    alignItems: 'center',
  },
  dateCancelText: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: '#3d71d9',
  },
  dateConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#3d71d9',
    alignItems: 'center',
  },
  dateConfirmText: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: '#fff',
  },

  // Image Source Options
  imageSourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    width: '100%',
  },
  sourceDivider: {
    height: 1,
    backgroundColor: '#F0F3F6',
    width: '100%',
    marginVertical: 4,
  },
  sourceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sourceIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  imageSourceText: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: '#1b2e23',
    letterSpacing: 0.1,
  },

  // Modal Styles (Cancel Registration)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 28,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  modalIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Andika-Bold',
    color: '#1b2e23',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    color: '#8fafa0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: '#8fafa0',
  },
  modalConfirmBtn: {
    flex: 1.5,
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontFamily: 'Andika-Bold',
    color: '#fff',
  },
  requirementInfo: {
    fontSize: 10,
    color: '#8fafa0',
    marginHorizontal: 24,
    marginTop: -4,
    marginBottom: 8,
    fontFamily: 'Andika-Regular',
  },
});
