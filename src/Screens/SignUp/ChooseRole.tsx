import React from 'react';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import chooseRole from '../../ui/ChooseRoleStyle';
import bubbles from '../../ui/BubblesDesign';
import user from '../../ui/UserStyle';
import buttons from '../../ui/ButtonStyles';
import upperNav from '../../ui/UpperNavigation';

export default function ChooseRole() {
  const { handleRoleSelection } = useNavigationHelper();

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

        {/* HEADER (LOGO + MENU ICON) */}
        <View>
          <View style={upperNav.header}>
            <Image
              style={upperNav.ciscLogo}
              source={require('../../../assets/images/cisckids.png')}
            />
          </View>
        </View>
        {/* TITLE */}
        <Text style={chooseRole.title}>Welcome! Choose your role.</Text>

        {/* IMAGE */}
        <View style={chooseRole.imageContainer}>
          <Image
            style={chooseRole.image}
            source={require('../../../assets/images/Abc-Reading2.png')}
          />
        </View>

        <View>
            <TouchableOpacity style={buttons.studentButton} onPress={() => handleRoleSelection('student')}>
                <Text style={buttons.nextPageText}>I am a Student</Text>
            </TouchableOpacity>
            <TouchableOpacity style={buttons.teacherButton} onPress={() => handleRoleSelection('faculty')}>
                <Text style={buttons.nextPageText}>I am a Teacher</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
