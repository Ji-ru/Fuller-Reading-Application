import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Modal,
} from 'react-native';
import signup from '../../UI_Designs/SignUpStyles';
import DatePicker from 'react-native-date-picker';
import GradeLevelDropDownSelection from '../../Components/SignUp/Buttons/GradeLevelSelectionButton';
import { useNavigationHelper } from '../../Controller/NavigationController';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
} from 'react-native-image-picker';
import bubbles from '../../UI_Designs/BubblesDesign';
import buttons from '../../UI_Designs/ButtonStyles';
import GenderSelection from '../../Components/SignUp/Buttons/GenderRadioButton';
import { RootStackParamList } from '../../Controller/NavigationController';
import { RouteProp, useRoute } from '@react-navigation/native';
import { getCurrentAcademicYear } from '../../Utilities/acadYearUtils';
import AcademicYearDropDownSelection from '../../Components/SignUp/Buttons/AcademicYearDropdown';
import ClassSelectionButton from '../../Components/SignUp/Buttons/ClassSelectionButton';

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

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);

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
    Alert.alert(
      'Select Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
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
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
      <View>
        {/* HEADER WITH BACK BUTTON */}
        <View style={localStyles.headerRow}>
          <TouchableOpacity style={localStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
            <View style={localStyles.backArrow} />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/images/cisckids.png')}
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
          <Text style={signup.textform}>
            Pangalan {isSubmitted && !firstName.trim() && <Text style={{ color: '#e74c3c', fontSize: 13, fontFamily: 'Satoshi-Bold' }}>* Kinakailangan</Text>}
          </Text>
          <TextInput
            style={[signup.textInputForm, isSubmitted && !firstName.trim() ? { borderColor: '#e74c3c' } : null]}
            placeholder="e.g Juan "
            value={firstName}
            onChangeText={setFirstName}
          />

          {/* LAST NAME */}
          <Text style={signup.textform}>
            Apelyido {isSubmitted && !lastName.trim() && <Text style={{ color: '#e74c3c', fontSize: 13, fontFamily: 'Satoshi-Bold' }}>* Kinakailangan</Text>}
          </Text>
          <TextInput
            style={[signup.textInputForm, isSubmitted && !lastName.trim() ? { borderColor: '#e74c3c' } : null]}
            placeholder="e.g Campus"
            value={lastName}
            onChangeText={setLastName}
          />

          {/* SEX */}
          <Text style={signup.textform}>
            Kasarian {isSubmitted && !gender && <Text style={{ color: '#e74c3c', fontSize: 13, fontFamily: 'Satoshi-Bold' }}>* Kinakailangan</Text>}
          </Text>
          <GenderSelection onGenderSelect={setGender} />

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
            <Text style={{ fontSize: 15, color: '#1b2e23', fontFamily: 'Satoshi-Medium' }}>
              {formatDateTagalog(date)}
            </Text>
            <Image
              source={require('../../../assets/icons/Calendar-icon.png')}
              style={{ width: 18, height: 18, tintColor: '#8fafa0' }}
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

          {/* VERIFICATION CODE */}
          <Text style={signup.textform}>
            {role === 'student' ? 'Klase ' : 'Faculty Access Code '}
            {isSubmitted && !verificationCode.trim() && <Text style={{ color: '#e74c3c', fontSize: 13, fontFamily: 'Satoshi-Bold' }}>* Kinakailangan</Text>}
          </Text>
          
          {role === 'student' ? (
             <ClassSelectionButton 
               gradeLevel={gradeLevel} 
               onSelect={setVerificationCode} 
             />
          ) : (
            <TextInput
              style={[signup.textInputForm, isSubmitted && !verificationCode.trim() ? { borderColor: '#e74c3c' } : null]}
              placeholder='Enter Secret Code'
              value={verificationCode}
              onChangeText={setVerificationCode}
              autoCapitalize="characters"
            />
          )}
        </View>

        <TouchableOpacity
          style={buttons.nextPageButton}
          onPress={() => {
            setIsSubmitted(true);
            
            // Check if required fields are filled to bypass the Alert popup in NavigationController
            if (!firstName.trim() || !lastName.trim() || !gender || !verificationCode.trim()) {
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
                classCode: verificationCode.trim(),
              });
            } else if (role === 'faculty') {
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

        {/* CANCEL */}
        <TouchableOpacity
          style={buttons.cancelButton}
          onPress={() => setShowCancelModal(true)}
        >
          <Text style={buttons.cancelText}>I-kansela</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Cancel Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCancelModal}
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
             {/* ICON BOX */}
             <View style={localStyles.modalIconBox}>
                <Text style={{ fontSize: 32 }}>⚠️</Text>
             </View>

             {/* TEXT CONTENT */}
             <Text style={localStyles.modalTitle}>I-kansela ang Pagrehistro?</Text>
             <Text style={localStyles.modalMessage}>Sigurado ka ba na gusto mong kanselahin? Mawawala ang iyong mga nailagay na impormasyon.</Text>

             {/* BUTTONS */}
             <View style={localStyles.modalButtonRow}>
                <TouchableOpacity style={localStyles.modalCancelBtn} onPress={() => setShowCancelModal(false)}>
                   <Text style={localStyles.modalCancelBtnText}>Ipagpatuloy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   style={localStyles.modalConfirmBtn} 
                   onPress={() => {
                     setShowCancelModal(false);
                     // Navigate back to Login
                     handleBackStep(); // or handleCancelRegistration if it resets to login
                   }}
                >
                   <Text style={localStyles.modalConfirmBtnText}>I-discard</Text>
                </TouchableOpacity>
             </View>
          </View>
        </View>
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
    fontFamily: 'Satoshi-Bold',
    color: '#1b2e23',
    marginBottom: 16,
    textAlign: 'center',
  },
  datePreview: {
    backgroundColor: '#f0faf4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  datePreviewText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#1a7a45',
    textAlign: 'center',
  },
  dateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  dateCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#d4f5e2',
    alignItems: 'center',
  },
  dateCancelText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    color: '#8fafa0',
  },
  dateConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1a7a45',
    alignItems: 'center',
  },
  dateConfirmText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Bold',
    color: '#fff',
  },

  // Modal Styles (Cancel Registration)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
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
    fontFamily: 'Satoshi-Black',
    color: '#1b2e23',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#8fafa0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
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
    fontFamily: 'Satoshi-Bold',
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
    fontFamily: 'Satoshi-Bold',
    color: '#fff',
  },
});
