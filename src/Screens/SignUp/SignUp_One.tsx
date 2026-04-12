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

  // Helper function to format date as "7 December 2025"
  const formatDateToReadable = (dateObj: Date): string => {
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'long' });
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
          <Text style={signup.textform}>Pangalan</Text>
          <TextInput
            style={signup.textInputForm}
            placeholder="e.g Juan "
            value={firstName}
            onChangeText={setFirstName}
          />

          {/* LAST NAME */}
          <Text style={signup.textform}>Apelyido</Text>
          <TextInput
            style={signup.textInputForm}
            placeholder="e.g Campus"
            value={lastName}
            onChangeText={setLastName}
          />

          {/* SEX */}
          <Text style={signup.textform}>Kasarian</Text>
          <GenderSelection onGenderSelect={setGender} />

          {/* DATE OF BIRTH */}
          <Text style={signup.textform}>Petsa ng Kapanganakan</Text>
          <TouchableOpacity
            style={signup.dateInput}
            onPress={() => setShowPicker(true)}
          >
            <Text style={signup.dateText}>{date.toDateString()}</Text>
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
            onConfirm={date => {
              setShowPicker(false);
              setDate(date);
            }}
            onCancel={() => setShowPicker(false)}
          />

          <Text style={signup.textform}>
            {role === 'student' ? 'Antas ng Baitang' : 'Assigned Grade Level'}
          </Text>
          <GradeLevelDropDownSelection
            onSelect={value => setGradeLevel(value)}
          />

          {/* VERIFICATION CODE */}
          <Text style={signup.textform}>
            {role === 'student' ? 'Klase' : 'Faculty Access Code'}
          </Text>
          
          {role === 'student' ? (
             <ClassSelectionButton 
               gradeLevel={gradeLevel} 
               onSelect={setVerificationCode} 
             />
          ) : (
            <TextInput
              style={signup.textInputForm}
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
              // Basic requirement check for faculty code - detailed check in SignUp_Two
              if (!verificationCode.trim()) {
                return Alert.alert('Error', 'Pakilagay ang iyong Faculty Access Code.');
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

        {/* CANCEL */}
        <TouchableOpacity
          style={buttons.cancelButton}
          onPress={handleCancelRegistration}
        >
          <Text style={buttons.cancelText}>I-kansela</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
    width: 140,
    height: 48,
  },
});
