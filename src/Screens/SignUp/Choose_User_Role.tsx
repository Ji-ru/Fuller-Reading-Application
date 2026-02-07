import React from 'react';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import chooseRole from '../../UI_Designs/ChooseRoleStyle';
import buttons from '../../UI_Designs/ButtonStyles';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';

export default function ChooseRole() {
  const { handleRoleSelection } = useNavigationHelper();

  return (
    <SafeAreaView style={chooseRole.container}>
      <View>
        {/* BUBBLE DECORATIONS */}
        <BubbleBackground />

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
            <TouchableOpacity style={buttons.teacherButton} onPress={() => handleRoleSelection('admin')}>
                <Text style={buttons.nextPageText}>Admin</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
