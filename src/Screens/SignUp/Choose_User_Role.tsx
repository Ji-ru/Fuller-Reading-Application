import React from 'react';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../Controller/NavigationController';
import Svg, { Text as SvgText } from 'react-native-svg';

import chooseRole from '../../UI_Designs/ChooseRoleStyle';
import buttons from '../../UI_Designs/ButtonStyles';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';

type ChooseRoleRouteProp = RouteProp<RootStackParamList, 'ChooseRole'>;

const C = {
  green:      '#2ca96a',
  greenDark:  '#008443',
  greenPale:  '#E8F5E9',
  white:      '#ffffff',
  ink:        '#1B2B22',
};

function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
    </View>
  );
}

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
  menuBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
});

export default function ChooseRole() {
  const { handleRoleSelection, handleBackStep, handleNextStep } = useNavigationHelper();

  const route       = useRoute<ChooseRoleRouteProp>();
  const googleEmail = route.params?.googleEmail;
  const isGoogleSignUp = Boolean(googleEmail);

  const onRoleSelected = (role: 'student' | 'faculty') => {
    if (isGoogleSignUp) {
      handleNextStep('SignUpOne', { role, googleEmail });
    } else {
      handleRoleSelection(role);
    }
  };

  return (
    <SafeAreaView style={chooseRole.container}>
      <View>
        <BubbleBackground />

        {/* ── Header ─────────────────────────────────────────────────── */}
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
              Choose Role
            </SvgText>
            <SvgText
              x={110} y={35} fontSize={23}
              fontFamily="Nunito-Black" textAnchor="middle"
              fill={C.greenDark}
            >
              Choose Role
            </SvgText>
          </Svg>

          {/* Spacer to balance header — no menu needed on this screen */}
          <View style={{ width: 48 }} />
        </View>

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
            <Text style={[buttons.nextPageText, { color: C.white }]}>I am a Student</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={buttons.teacherButton}
            onPress={() => onRoleSelected('faculty')}
          >
            <Text style={[buttons.nextPageText, { color: C.green }]}>I am a Teacher</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}