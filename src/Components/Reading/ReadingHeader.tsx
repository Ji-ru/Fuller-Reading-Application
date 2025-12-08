import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import user from '../../ui/UserStyle';
import LogoutModal from '../Buttons/LogoutModal';

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
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogoutPress = () => {
    onMenuToggle();
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    onLogout();
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  return (
    <>
      <View style={user.header}>
        <TouchableOpacity style={user.touchable} onPress={onBack}>
          <Image
            source={require('../../../assets/icons/BackButton-icon.png')}
          />
        </TouchableOpacity>
        <Image
          style={user.ciscLogo}
          source={require('../../../assets/images/cisckids.png')}
        />
        <TouchableOpacity style={user.touchable} onPress={onMenuToggle}>
          <Image
            style={user.menuIcon}
            source={require('../../../assets/icons/Menu-icon.png')}
          />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={user.dropdownMenu}>
          <TouchableOpacity
            onPress={handleLogoutPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderRadius: 12,
            }}
          >
            <Image
              source={require('../../../assets/icons/Logout-icon.png')}
              style={user.logoutIcon}
            />
            <Text style={user.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {menuVisible && (
        <TouchableOpacity
          style={user.closeMenu}
          onPress={onMenuToggle}
          activeOpacity={1}
        />
      )}
      
      {/* Logout Modal */}
      <LogoutModal
        visible={logoutModalVisible}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </>
  );
};
