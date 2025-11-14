import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import user from '../../ui/UserStyle';

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
  const handleLogoutPress = () => {
    onMenuToggle();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ],
      { cancelable: true },
    );
  };

  return (
    <>
      <View style={user.header}>
        <TouchableOpacity style={user.touchable} onPress={onBack}>
          <Image source={require('../../../assets/icons/BackButton-icon.png')} />
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
    </>
  );
};