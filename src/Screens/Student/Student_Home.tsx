import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import user from '../../UI_Designs/UserStyle';
import buttons from '../../UI_Designs/ButtonStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import upperNav from '../../UI_Designs/UpperNavigation';
import BubbleBackground from '../../Components/GlobalUse/BubbleBackground';
export default function UserHomeScreen() {
  
  // HANDLE MENU
  const [menuVisible, setMenuVisible] = useState(false);
  // HANDLE LOGOUT
  const { handleLogout, handleNextStep } = useNavigationHelper();

  // HANDLE LOGOUT MODAL VISIBILITY
  const [logoutVisible, setLogoutVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogoutPress = () => {
    setMenuVisible(false);
    setLogoutVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutVisible(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setLogoutVisible(false);
  };

  return (
    <SafeAreaView style={user.container}>
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
            <TouchableOpacity style={upperNav.touchable} onPress={toggleMenu}>
              <Image
                style={upperNav.menuIcon}
                source={require('../../../assets/icons/Menu-icon.png')}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* DROPDOWN MENU */}
        {menuVisible && (
          <View style={upperNav.dropdownMenu}>
            <TouchableOpacity
              onPress={handleLogoutPress}
              style={upperNav.logoutButton}
            >
              <Image
                source={require('../../../assets/icons/Logout-icon.png')}
                style={upperNav.logoutIcon}
              />
              <Text style={upperNav.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* OVERLAY TO CLOSE MENU */}
        {menuVisible && (
          <TouchableOpacity
            style={upperNav.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}
        {/* LOGOUT MODAL */}
        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />

        {/* INTRO */}
        <Text style={user.text}>Welcome, Learner!</Text>
        <Text style={user.subtext}>
          Adventure begins with every word you read!
        </Text>

        {/* STUDY IMAGE */}
        <Image
          style={user.imaginationReadingImage}
          source={require('../../../assets/images/Imagination-Reading.png')}
        />
        <Text style={user.statement}>
          When you can read, you can make your own stories and use your big
          imagination!
        </Text>

        {/* BUTTONS */}
        <TouchableOpacity style={buttons.startReadingButton} onPress={() => handleNextStep('PassageSelection')}>
          <Text style={buttons.nextPageText}>Start Learning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={buttons.readingHistoryButton} onPress={()=>handleNextStep('ReadingHistory')}>
          <Text style={buttons.nextPageText}>Reading History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={buttons.readingHistoryButton} onPress={()=>handleNextStep('Profile')}>
          <Text style={buttons.nextPageText}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={buttons.readingHistoryButton} onPress={()=>handleNextStep('StudentMyClass')}>
          <Text style={buttons.nextPageText}>My Class</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
