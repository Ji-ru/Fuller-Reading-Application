import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import LogoutModal from '../../GlobalUse/Logout_Modal';
import upperNav from '../../../UI_Designs/UpperNavigation';
import { Icon } from '../../GlobalUse/Icon';
import { StudentColors } from '../../../Utilities/Theme';

interface ReadingHeaderProps {
  onBack: () => void;
  onMenuToggle: () => void;
  onLogout: () => void;
  onAbout?: () => void;
  menuVisible: boolean;
}

const C = {
  white: '#ffffff',
  darkBlue: '#163F6C',
  ink: '#1b2e23',
};

function MenuBars() {
  return (
    <View style={{ width: 22, height: 16, justifyContent: 'space-between' }}>
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 16, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
      <View style={{ width: 22, height: 2.5, borderRadius: 2, backgroundColor: C.ink }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  menuBtn: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  backBtn: {
    width: 45, height: 45, borderRadius: 10,
    backgroundColor: '#008443',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: {
    fontSize: 40, fontFamily: 'Nunito-Bold',
    color: C.white, lineHeight: 28, marginLeft: -2, paddingBottom: 2
  },
  aboutRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  aboutText: {
    fontSize: 15, fontFamily: 'Nunito-Bold',
    color: StudentColors.slate, marginLeft: 12,
  },
  dropdownDivider: {
    height: 1, marginHorizontal: 12, backgroundColor: '#E3F0E7',
  },
});

export const ReadingHeader: React.FC<ReadingHeaderProps> = ({
  onBack,
  onMenuToggle,
  onLogout,
  onAbout,
  menuVisible,
}) => {

  const [logoutVisible, setLogoutModalVisible] = useState(false);

  const handleLogoutPress = () => {
    onMenuToggle();
    setLogoutModalVisible(true);
  };

  const handleAboutPress = () => {
    onMenuToggle();
    onAbout?.();
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
      <View style={upperNav.header}>
        <TouchableOpacity style={headerStyles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={headerStyles.backArrowText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity style={headerStyles.menuBtn} onPress={onMenuToggle} activeOpacity={0.7}>
          <MenuBars />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={upperNav.dropdownMenu}>
          {onAbout && (
            <>
              <TouchableOpacity
                onPress={handleAboutPress}
                style={headerStyles.aboutRow}
                activeOpacity={0.75}
              >
                <Icon name="info" size={20} color={StudentColors.slate} filled />
                <Text style={headerStyles.aboutText}>About</Text>
              </TouchableOpacity>
              <View style={headerStyles.dropdownDivider} />
            </>
          )}
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
