import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LogoutModal from '../../GlobalUse/Logout_Modal';
import upperNav from '../../../UI_Designs/UpperNavigation';

interface ReadingHeaderProps {
  onBack: () => void;
  onLogout: () => void;
}

function BackArrow({ color = '#1b2e23' }: { color?: string }) {
  return (
    <View style={{ width: 12, height: 12, borderLeftWidth: 2.5, borderTopWidth: 2.5, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
  );
}

export const ReadingHeader: React.FC<ReadingHeaderProps> = ({
  onBack,
  onLogout,
}) => {

  const [logoutVisible, setLogoutModalVisible] = useState(false);

  const handleLogoutPress = () => {
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
      <View style={localStyles.headerRow}>
        <TouchableOpacity style={localStyles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <BackArrow />
        </TouchableOpacity>

        <Image
          style={localStyles.logo}
          source={require('../../../../assets/images/cisckids.png')}
          resizeMode="contain"
        />

        <View style={{ width: 44 }} />
      </View>
      
      <LogoutModal
        visible={logoutVisible}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </>
  );
};

const localStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  menuBtn: {
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
  menuIcon: {
    width: 22,
    height: 22,
    tintColor: '#1b2e23',
    resizeMode: 'contain',
  },
  logo: {
    width: 120,
    height: 40,
  },
});
