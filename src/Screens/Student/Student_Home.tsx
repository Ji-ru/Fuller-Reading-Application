import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import user from '../../UI_Designs/UserStyle';
import bubbles from '../../UI_Designs/BubblesDesign';
import buttons from '../../UI_Designs/ButtonStyles';
import { useNavigationHelper } from '../../Controller/NavigationController';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';
import upperNav from '../../UI_Designs/UpperNavigation';

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
        <Text style={user.text}>Maligayang pagdating, mag-aaral!</Text>
        <Text style={user.subtext}>
          Tara na! Magsanay tayong bumasa!
        </Text>

        {/* STUDY IMAGE */}
        <Image
          style={user.imaginationReadingImage}
          source={require('../../../assets/images/Imagination-Reading.png')}
        />
        <Text style={user.statement}>
          Sa bawat buklat, may bagong kwentong naghihintay!
        </Text>

        {/* BUTTONS */}
        <TouchableOpacity
          style={buttons.startReadingButton}
          onPress={() => handleNextStep('PassageSelection')}
        >
          <Text style={buttons.nextPageText}>Magsimulang Magbasa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={buttons.readingHistoryButton} onPress={()=>handleNextStep('ReadingHistory')}>
          <Text style={buttons.nextPageText}>Nakaraang Pagbabasa</Text> 
        </TouchableOpacity>
        <TouchableOpacity style={buttons.readingHistoryButton} onPress={()=>handleNextStep('Profile')}>
          <Text style={buttons.nextPageText}>Aking Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
