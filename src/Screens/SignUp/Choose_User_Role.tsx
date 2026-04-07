// screens/SignUp/Choose_User_Role.tsx
// Changes vs. original:
//   • Accepts optional googleEmail + googleIdToken route params.
//   • When those params exist the screen forwards them to SignUpOne so they
//     eventually reach SignUpTwo, where the email field is pre-filled.
//   • For non-Google sign-up nothing changes — handleRoleSelection() is still
//     used when the screen receives no google params.

import React from 'react';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../Controller/NavigationController';

import chooseRole from '../../UI_Designs/ChooseRoleStyle';
import buttons from '../../UI_Designs/ButtonStyles';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
import Svg, { Text as SvgText } from 'react-native-svg';

type ChooseRoleRouteProp = RouteProp<RootStackParamList, 'ChooseRole'>;

export default function ChooseRole() {
  const { handleRoleSelection, handleBackStep, handleNextStep } = useNavigationHelper();

  // ── Read optional Google params passed from LoginScreen ────────────────────
  const route = useRoute<ChooseRoleRouteProp>();
  const googleEmail = route.params?.googleEmail;

  const isGoogleSignUp = Boolean(googleEmail);

  // ── Role selection ─────────────────────────────────────────────────────────
  /**
   * For Google sign-up: navigate manually so we can attach the Google params.
   * For email sign-up:  use the existing handleRoleSelection() — no changes.
   */
  const onRoleSelected = (role: 'student' | 'faculty') => {
    if (isGoogleSignUp) {
      handleNextStep('SignUpOne', { role, googleEmail });  // ← consistent with the rest
    } else {
      handleRoleSelection(role);
    }
  };

  return (
    <SafeAreaView style={chooseRole.container}>
      <View>
        <BubbleBackground />

        {/* Header */}
        <View>
          <View style={upperNav.header}>
            <TouchableOpacity onPress={() => handleBackStep()}>
              <Image
                source={require('../../../assets/icons/BackButton-icon.png')}
                style={upperNav.backButtonIcon}
              />
            </TouchableOpacity>
            <Image
              style={upperNav.ciscLogo}
              source={require('../../../assets/images/cisckids.png')}
            />
          </View>
        </View>

        {/* Title — clarify when using Google */}
        {/* <Text style={chooseRole.title}>
          {isGoogleSignUp
            ? `Signing up with ${googleEmail}`
            : 'Welcome! Choose your role.'}
        </Text> */}
        <Svg height={60} width={400} style={{ marginTop: 50 }}>
          <SvgText
            x={200}                 // center X
            y={45}                  // baseline Y
            fontSize={40}
            fontFamily="DynaPuff-Bold"
            textAnchor="middle"     // center align
            fill="none"          // inside color
            stroke="#D7E9FF"        // outline color
            strokeWidth={8}         // outline thickness
            strokeLinejoin='round'
          >
            {isGoogleSignUp
              ? `Signing up with`
              : 'Welcome! '}
          </SvgText>
          <SvgText
            x={200}
            y={45}
            fontSize={40}
            fontFamily="DynaPuff-Bold"
            textAnchor="middle"
            fill="#3B7FC9"
          >
            {isGoogleSignUp
              ? `Signing up with`
              : 'Welcome! '}
          </SvgText>
        </Svg>
        <Svg height={60} width={400}>
          <SvgText
            x={200}                 // center X
            y={45}                  // baseline Y
            fontSize={40}
            fontFamily="DynaPuff-Bold"
            textAnchor="middle"     // center align
            fill="none"          // inside color
            stroke="#D7E9FF"        // outline color
            strokeWidth={8}         // outline thickness
            strokeLinejoin='round'
          >
            {isGoogleSignUp
              ? `${googleEmail}`
              : 'Who are you?.'}
          </SvgText>
          <SvgText
            x={200}
            y={45}
            fontSize={40}
            fontFamily="DynaPuff-Bold"
            textAnchor="middle"
            fill="#3B7FC9"
          >
            {isGoogleSignUp
              ? `${googleEmail}`
              : 'Who are you?.'}
          </SvgText>
        </Svg>

        {/* Illustration */}
        <View style={chooseRole.imageContainer}>
          <Image
            style={chooseRole.image}
            source={require('../../../assets/images/Abc-Reading2.png')}
          />
        </View>

        {/* Role buttons */}
        <View>
          <TouchableOpacity
            style={buttons.studentButton}
            onPress={() => onRoleSelected('student')}
          >
            <Text style={buttons.nextPageText}>I am a Student</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={buttons.teacherButton}
            onPress={() => onRoleSelected('faculty')}
          >
            <Text style={buttons.nextPageText}>I am a Teacher</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}