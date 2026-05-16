import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationHelper } from '../../Controller/NavigationController';
import bubbles from '../../UI_Designs/BubblesDesign';
import buttons from '../../UI_Designs/ButtonStyles';
import chooseRole from '../../UI_Designs/ChooseRoleStyle';

function BackArrow({ color = '#1b2e23' }: { color?: string }) {
  return (
    <View style={{ width: 12, height: 12, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
  );
}

export default function ChooseRole() {
  const { handleRoleSelection, handleBackStep } = useNavigationHelper();

  return (
    <SafeAreaView style={chooseRole.container}>
      <View>
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

        {/* HEADER WITH BACK BUTTON */}
        <View style={localStyles.headerRow}>
          <TouchableOpacity style={localStyles.backBtn} onPress={handleBackStep} activeOpacity={0.7}>
            <BackArrow />
          </TouchableOpacity>
          <Image
            style={localStyles.logo}
            source={require('../../../assets/images/cisckids copy.png')}
            resizeMode="contain"
          />
          {/* Spacer to balance the row */}
          <View style={{ width: 44 }} />
        </View>

        {/* TITLE */}
        <Text style={chooseRole.title}>Maligayang pagdating! Pumili ng role.</Text>
        {/* IMAGE */}
        <View style={chooseRole.imageContainer}>
          <Image
            style={chooseRole.image}
            source={require('../../../assets/images/Abc-Reading2.png')}
          />
        </View>

        <View>
          <TouchableOpacity style={buttons.studentButton} onPress={() => handleRoleSelection('student')}>
            <Text style={buttons.nextPageText}>Ako ay Estudyante</Text>
          </TouchableOpacity>
          <TouchableOpacity style={buttons.teacherButton} onPress={() => handleRoleSelection('faculty')}>
            <Text style={[buttons.nextPageText, { color: '#3d71d9' }]}>Ako ay Guro</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  logo: {
    width: 100,
    height: 90,
  },
});
