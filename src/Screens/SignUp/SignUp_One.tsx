import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
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
import buttons from '../../UI_Designs/ButtonStyles';
import GenderSelection from '../../Components/SignUp/Buttons/GenderRadioButton';
import { RootStackParamList } from '../../Controller/NavigationController';
import { RouteProp, useRoute } from '@react-navigation/native';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';

type SignUpOneRouteProp = RouteProp<RootStackParamList, 'SignUpOne'>;

export default function SignUpOneScreen() {
  // Navigation handlers
  // Get role from navigation params
  const route = useRoute<SignUpOneRouteProp>();
  const { role } = route.params;

  // Add state of the Registration Steps using react hook
  const { handleSignUpNavigationWithData, handleCancelRegistration } =
    useNavigationHelper();

  // current step - UNDER CONSTRUCTION!!
  const [currentStep, setCurrentStep] = useState(1);

  // Personal Infomation States
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gradeLevel, setGradeLevel] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Set user sex
  const [gender, setGender] = useState('');

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
      <BubbleBackground />

      <View>
        {/* CISC KIDS TITLE */}
        <Image
          source={require('../../../assets/images/cisckids.png')}
          style={signup.ciscLogo}
        />
        {/* SCREEN TITLE */}
        <Text style={signup.label}>Register</Text>

        {/* STEPS INDICATOR */}
        <View style={signup.stepsContainer}>
          <View
            style={[
              signup.stepCircle,
              currentStep == 1 ? signup.activateStep : signup.inactivateStep,
            ]}
          >
            <Text style={signup.number}>1</Text>
          </View>

          <View style={signup.stepLine} />

          <View
            style={[
              signup.stepCircle,
              currentStep == 2 ? signup.activateStep : signup.inactivateStep,
            ]}
          >
            <Text>2</Text>
          </View>
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
          <Text style={signup.subLabel}>Personal Information</Text>
          {/* FIRST NAME */}
          <Text style={signup.textform}>First Name</Text>
          <TextInput
            style={signup.textInputForm}
            placeholder="e.g Juan "
            value={firstName}
            onChangeText={setFirstName}
          />
          {/* MIDDLE NAME */}
          <Text style={signup.textform}>Middle Name</Text>
          <TextInput
            style={signup.textInputForm}
            placeholder="e.g Marasigan"
            value={middleName}
            onChangeText={setMiddleName}
          />

          {/* LAST NAME */}
          <Text style={signup.textform}>Last Name</Text>
          <TextInput
            style={signup.textInputForm}
            placeholder="e.g Campus"
            value={lastName}
            onChangeText={setLastName}
          />

          {/* SEX */}
          <Text style={signup.textform}>Select Gender:</Text>
          <GenderSelection onGenderSelect={setGender} />

          {/* DATE OF BIRTH */}
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
            onConfirm={date => {
              setShowPicker(false);
              setDate(date);
            }}
            onCancel={() => setShowPicker(false)}
          />

          {/*  */}
          {role !== 'admin' && (
            <>
              <Text style={signup.textform}>
                {role === 'student' ? 'Grade Level' : 'Assigned Grade Level'}
              </Text>
              <GradeLevelDropDownSelection
                onSelect={value => setGradeLevel(value)}
              />
            </>
          )}
        </View>

        {/* NEXT PAGE */}
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
              });
            } else if (role === 'admin') {
              // Admin
              handleSignUpNavigationWithData({
                profileImageUrl: profileImage || '',
                firstName: firstName.trim(),
                middleName: middleName.trim(),
                lastName: lastName.trim(),
                email: '',
                role,
                sex: gender
              })
            }
          }}
        >
          <Text style={buttons.nextPageText}>Next</Text>
        </TouchableOpacity>

        {/* CANCEL */}
        <TouchableOpacity
          style={buttons.cancelButton}
          onPress={handleCancelRegistration}
        >
          <Text style={buttons.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
