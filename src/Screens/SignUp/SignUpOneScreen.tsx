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
import signup from '../../ui/SignUpStyles';
import DatePicker from 'react-native-date-picker';
import GradeLevelDropDownSelection from '../Buttons/GradeLevelSelectionButton';
import { useNavigationHelper } from '../../Functions/Buttons';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
} from 'react-native-image-picker';
import bubbles from '../../ui/BubblesDesign';
import buttons from '../../ui/ButtonStyles';

export default function SignUpOneScreen() {
  // Navigation handlers
  // Add state of the Registration Steps using react hook
  const { handleNextStep, handleCancelRegistration } = useNavigationHelper();

  // current step - UNDER CONSTRUCTION!!
  const [currentStep, setCurrentStep] = useState(1);

  // Add code of date picker
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  const showDatePicker = () => {
    setShowPicker(true);
  };

  // Profile pricture state
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
          <TextInput style={signup.textInputForm} placeholder="e.g Juan " />
          {/* MIDDLE NAME */}
          <Text style={signup.textform}>Middle Name</Text>
          <TextInput style={signup.textInputForm} placeholder="e.g Marasigan" />

          {/* LAST NAME */}
          <Text style={signup.textform}>Last Name</Text>
          <TextInput style={signup.textInputForm} placeholder="e.g Campus" />

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

          <Text style={signup.textform}>Grade Level</Text>
          <GradeLevelDropDownSelection />
        </View>
        {/* NEXT PAGE */}
        <TouchableOpacity
          style={buttons.nextPageButton}
          onPress={() => handleNextStep('SignUpTwo')}
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
