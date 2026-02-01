import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import user from '../../../UI_Designs/UserStyle';
import LogoutModal from '../../GlobalUse/Logout_Modal';
import upperNav from '../../../UI_Designs/UpperNavigation';

interface ReadingHeaderProps {
  onBack: () => void;
  onMenuToggle: () => void;
  onLogout: () => void;
  menuVisible: boolean;
}

export const ReadingHeader: React.FC<ReadingHeaderProps> = ({
  onBack,
  onMenuToggle,
  onLogout,
  menuVisible,
}) => {

  const [logoutVisible, setLogoutModalVisible] = useState(false);

  const handleLogoutPress = () => {
    onMenuToggle();
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    onLogout(); // Call parent's logout function
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  return (
    <>
      <View style={upperNav.header}>
        <TouchableOpacity style={upperNav.touchable} onPress={onBack}>
          <Image
            source={require('../../../../assets/icons/BackButton-icon.png')}
          />
        </TouchableOpacity>
        <Image
          style={upperNav.ciscLogo}
          source={require('../../../../assets/images/cisckids.png')}
        />
        <TouchableOpacity style={upperNav.touchable} onPress={onMenuToggle}>
          <Image
            style={upperNav.menuIcon}
            source={require('../../../../assets/icons/Menu-icon.png')}
          />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={upperNav.dropdownMenu}>
          <TouchableOpacity
            onPress={handleLogoutPress}
            style={upperNav.logoutButton}
          >
            <Image
              source={require('../../../../assets/icons/Logout-icon.png')}
              style={upperNav.logoutIcon}
            />
            <Text style={upperNav.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {menuVisible && (
        <TouchableOpacity
          style={upperNav.closeMenu}
          onPress={onMenuToggle}
          activeOpacity={1}
        />
      )}
      
      {/* Logout Modal */}
      <LogoutModal
        visible={logoutVisible}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </>
  );
};
