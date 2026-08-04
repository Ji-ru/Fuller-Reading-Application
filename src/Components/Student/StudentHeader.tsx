import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';
import { Icon } from '../GlobalUse/Icon';
import upperNav from '../../UI_Designs/UpperNavigation';
import { sw, sh, sf } from '../../Utils/responsive';
import { StudentColors } from '../../Utilities/Theme';

interface StudentHeaderProps {
  title?: string;
  leftTitle?: string;
  onBackPress?: () => void;
  onAboutPress: () => void;
  onLogoutPress: () => void;
  svgWidth?: number;
  fontSize?: number;
}

function MenuBars() {
  return (
    <View style={{ width: sw(22), height: sh(16), justifyContent: 'space-between' }}>
      <View style={{ width: sw(22), height: sh(2.5), borderRadius: sw(2), backgroundColor: '#1b2e23' }} />
      <View style={{ width: sw(16), height: sh(2.5), borderRadius: sw(2), backgroundColor: '#1b2e23' }} />
      <View style={{ width: sw(22), height: sh(2.5), borderRadius: sw(2), backgroundColor: '#1b2e23' }} />
    </View>
  );
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({ 
  title, 
  leftTitle,
  onBackPress, 
  onAboutPress, 
  onLogoutPress,
  svgWidth = sw(200),
  fontSize = sf(24)
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={{ zIndex: 100 }}>
      <View style={upperNav.header}>
        {/* Back Button or Left Title */}
        {leftTitle ? (
          <Text style={styles.headerLogo}>{leftTitle}</Text>
        ) : onBackPress ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBackPress} activeOpacity={0.7}>
            <Text style={styles.backArrowText}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: sw(45), height: sw(45) }} />
        )}

        {/* SVG Title */}
        {title ? (
          <Svg height={sh(60)} width={svgWidth}>
            {/* Stroke Outline */}
            <SvgText
              x={svgWidth / 2} 
              y={sh(35)} 
              fontSize={fontSize}
              fontFamily="Andika-Bold" 
              textAnchor="middle"
              fill="none" 
              stroke="#E8F5E9" 
              strokeWidth={sw(8)} 
              strokeLinejoin="round"
            >
              {title}
            </SvgText>
            {/* Inner Fill */}
            <SvgText
              x={svgWidth / 2} 
              y={sh(35)} 
              fontSize={fontSize}
              fontFamily="Andika-Bold" 
              textAnchor="middle"
              fill="#1B5E20"
            >
              {title}
            </SvgText>
          </Svg>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* Menu Button */}
        <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(!menuVisible)} activeOpacity={0.7}>
          <MenuBars />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {menuVisible && (
        <View style={upperNav.dropdownMenu}>
          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              onAboutPress();
            }}
            style={styles.aboutRow}
            activeOpacity={0.75}
          >
            <Icon name="info" size={sf(20)} color={StudentColors?.slate || '#9CA3AF'} filled />
            <Text style={styles.aboutText}>About</Text>
          </TouchableOpacity>
          <View style={styles.dropdownDivider} />
          <TouchableOpacity onPress={() => { setMenuVisible(false); onLogoutPress(); }} style={upperNav.logoutButton}>
            <Image source={require('../../../assets/icons/Logout-icon.png')} style={upperNav.logoutIcon} />
            <Text style={upperNav.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Overlay to close menu */}
      {menuVisible && (
        <TouchableOpacity style={upperNav.closeMenu} onPress={() => setMenuVisible(false)} activeOpacity={1} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerLogo: {
    fontSize: sf(18),
    fontFamily: 'Nunito-Black',
    color: '#2ca96a',
    letterSpacing: 0.5,
  },
  menuBtn: {
    width: sw(48), height: sw(48),
    borderRadius: sw(14),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.08, shadowRadius: sw(6), elevation: 3,
  },
  backBtn: {
    width: sw(45), height: sw(45), borderRadius: sw(10),
    backgroundColor: '#008443',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: {
    fontSize: sf(40), fontFamily: 'Nunito-Bold',
    color: '#FFFFFF', lineHeight: sf(28), marginLeft: sw(-2), paddingBottom: sh(2)
  },
  aboutRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: sw(16), paddingVertical: sh(14),
  },
  aboutText: {
    fontSize: sf(15), fontFamily: 'Nunito-Bold',
    color: '#9CA3AF', marginLeft: sw(12),
  },
  dropdownDivider: {
    height: sh(1), marginHorizontal: sw(12),
    backgroundColor: '#E3F0E7',
  },
});