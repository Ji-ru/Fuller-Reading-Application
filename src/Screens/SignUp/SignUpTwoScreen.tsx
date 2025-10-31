import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import signup from '../../ui/SignUpStyles';
import { useNavigationHelper } from '../../Functions/Buttons';
import { useNavigation } from '@react-navigation/native';
import buttons from '../../ui/ButtonStyles';
import bubbles from '../../ui/BubblesDesign';

export default function SignUpTwoScreen() {
  // Add navigation code here for SignUpCompletedScreen
  const navigation = useNavigation() as any;

  const [currentStep, setCurrentStep] = useState(2);

  const { handleNextStep, handleCancelRegistration } = useNavigationHelper();

  return (
    <SafeAreaView style={signup.container}>
      <View>
        {/* CISC KIDS TITLE */}
        <Image
          source={require('../../../assets/images/cisckids.png')}
          style={signup.ciscLogo}
        />
                {/* BUBBLE DECORATIONS */}
        <View style={bubbles.bubblesContainer} pointerEvents="none">
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
        {/* SCREEN TITLE */}
        <Text style={signup.label}>Register</Text>
        {/* STEPS INIDCATOR */}
        <View style={signup.stepsContainer}>
          <View
            style={[
              signup.stepCircle,
              currentStep == 1 ? signup.inactivateStep : signup.activateStep,
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
            <Text style={signup.number}>2</Text>
          </View>
        </View>
        {/* CREATE AN ACCOUNT FORM */}
        <Text style={signup.subLabel}>Create an Account</Text>
        <View>
          {/* EMAIL ADDRESS */}
          <Text style={signup.textform}>Email Address</Text>
          <TextInput style={signup.textInputForm} placeholder='example@gmail.com'/>
          {/* PASSWORD */}
          <Text style={signup.textform}>Password</Text>
          <TextInput style={signup.textInputForm} secureTextEntry placeholder='*********'/>
          {/* CONFIRM PASSWORD */}
          <Text style={signup.textform}>Confirm Password</Text>
          <TextInput style={signup.textInputForm} secureTextEntry placeholder='*********'/>
        </View>
        
        {/* CONFIRM AND CANCEL BUTTONS */}
        {/* NEXT PAGE */}
        <TouchableOpacity
          style={buttons.nextPageButton}
          onPress={() => handleNextStep('SignUpCompleted')}
        >
          <Text style={buttons.nextPageText}>Register</Text>
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
