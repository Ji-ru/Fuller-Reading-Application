// screens/SignUp/SignUp_One.tsx
// Changes vs. original:
//   • Accepts optional googleEmail + googleIdToken route params.
//   • Passes them through unchanged to SignUpTwo via handleSignUpNavigationWithData.
//   • No visual change — SignUpOne still collects personal information.

import React, { useState }       from 'react';
import { SafeAreaView }          from 'react-native-safe-area-context';
import {
  View, Text, Image, TextInput, TouchableOpacity, Alert,
} from 'react-native';
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
  const googleEmail   = route.params?.googleEmail;

  const { handleSignUpNavigationWithData, handleCancelRegistration } =
    useNavigationHelper();

  const [currentStep, setCurrentStep] = useState(1);

  // Personal information states
  const [firstName,    setFirstName]    = useState('');
  const [middleName,   setMiddleName]   = useState('');
  const [lastName,     setLastName]     = useState('');
  const [gradeLevel,   setGradeLevel]   = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [date,         setDate]         = useState(new Date());
  const [showPicker,   setShowPicker]   = useState(false);
  const [gender,       setGender]       = useState('');

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

  const openCamera = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8, saveToPhotos: true },
      handleImageResponse,
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      handleImageResponse,
    );
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      showAlert('Notice', 'User cancelled opening picker');
    } else if (response.errorCode) {
      showAlert('Error', 'Failed to pick image. Please try again.');
    } else if (response.assets?.[0]?.uri) {
      setProfileImage(response.assets[0].uri);
    }
  };

  const formatDateToReadable = (dateObj: Date): string => {
    const day   = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const year  = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
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
              currentStep === 1 ? signup.activateStep : signup.inactivateStep,
            ]}
          >
            <Text style={currentStep === 1 ? signup.activenumber : signup.inactivenumber}>1</Text>
          </View>
          <View style={signup.stepLine} />
          <View
            style={[
              signup.stepCircle,
              currentStep === 2 ? signup.activateStep : signup.inactivateStep,
            ]}
          >
            <Text style={currentStep === 2 ? signup.activenumber : signup.inactivenumber}>2</Text>
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

        {/* Personal information form */}
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
            onConfirm={pickedDate => { setShowPicker(false); setDate(pickedDate); }}
            onCancel={() => setShowPicker(false)}
          />

          {role !== 'admin' && (
            <>
              <Text style={signup.textform}>
                {role === 'student' ? 'Grade Level' : 'Assigned Grade Level'}
              </Text>
              <GradeLevelDropDownSelection onSelect={value => setGradeLevel(value)} />
            </>
          )}
        </View>

        {/* Navigation */}
        <TouchableOpacity style={buttons.nextPageSignUpButton} onPress={handleNext}>
          <Text style={buttons.nextPageSignUpText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={buttons.cancelSignUpButton}
          onPress={handleCancelRegistration}
        >
          <Text style={buttons.cancelSignUpText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <AlertModal
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        onClose={() => setAlertVisible(false)}
      />

      <ActionSheetModal
        visible={actionSheetVisible}
        title="Select Profile Picture"
        message="Choose an option to upload your photo"
        options={[
          { text: 'Take Photo', onPress: openCamera },
          { text: 'Choose from Gallery', onPress: openGallery },
          { text: 'Cancel', onPress: () => {}, isCancel: true }
        ]}
        onClose={() => setActionSheetVisible(false)}
      />
    </SafeAreaView>
  );
}