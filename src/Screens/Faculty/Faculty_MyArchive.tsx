import { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigationHelper } from '../../Controller/NavigationController';
import { SafeAreaView } from 'react-native-safe-area-context';
import bubbles from '../../UI_Designs/BubblesDesign';
import upperNav from '../../UI_Designs/UpperNavigation';
import LogoutModal from '../../Components/GlobalUse/Logout_Modal';

export default function MyArchive() {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const { handleLogout, handleClassStudents } = useNavigationHelper();

  // ========================================================================
  // EVENT HANDLER
  // ========================================================================
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
    <SafeAreaView>
      <View>
        {/* BUBBLE DECORATIONS */}
        <View style={bubbles.bubblesContainer}>
          <View style={[bubbles.bubble, bubbles.bubbleTopRight]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight1]} />
          <View style={[bubbles.bubble, bubbles.bubbleMiddleRight2]} />
          <View style={[bubbles.bubble, bubbles.bubbleTopLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft1]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft2]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft3]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft4]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft5]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft6]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft7]} />
          <View style={[bubbles.bubble, bubbles.bubbleBottomLeft8]} />
        </View>

        {/* HEADER */}
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

        {menuVisible && (
          <TouchableOpacity
            style={upperNav.closeMenu}
            onPress={() => setMenuVisible(false)}
            activeOpacity={1}
          />
        )}

        <LogoutModal
          visible={logoutVisible}
          onCancel={cancelLogout}
          onConfirm={confirmLogout}
        />
      </View>
    </SafeAreaView>
  );
}
