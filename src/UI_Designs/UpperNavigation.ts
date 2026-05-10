import { StyleSheet, Dimensions } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

// Scale logo width: 25% of screen width, capped at 120, min 80
const logoWidth = Math.min(Math.max(screenWidth * 0.25, sw(80)), sw(120));
const logoHeight = logoWidth * (30 / 120); // maintain 120:30 ratio

// Scale icons based on screen width
const menuIconSize = Math.min(screenWidth * 0.12, sw(50));
const backIconSize = Math.min(screenWidth * 0.15, sw(60));
const backIconHeight = backIconSize * (40 / 60); // maintain 60:40 ratio

const upperNav = StyleSheet.create({
  ciscLogo: {
    marginTop: sh(10),
    width: logoWidth,
    height: logoHeight,
  },
  divider:    { height: 1, backgroundColor: '#E8F5E9', marginHorizontal: 12 },
  menuIcon: {
    width: menuIconSize,
    height: menuIconSize * (35 / 50), // maintain original ratio
  },
  touchable: {
    padding: sw(5),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sw(10),
  },
  backButtonIcon: {
    width: backIconSize,
    height: backIconHeight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sw(16),
    borderRadius: sw(12),
  },
  dropdownMenu: {
    position: 'absolute',
    top: sh(60),
    right: sw(20),
    backgroundColor: '#fff',
    borderRadius: sw(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(4),
    elevation: 5,
    minWidth: sw(150),
    zIndex: 1000,
  },
  closeMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  logoutIcon: {
    width: sw(20),
    height: sw(20),
    marginRight: sw(12),
    tintColor: '#e74c3c',
  },
  logoutText: {
    fontSize: sf(16),
    color: '#e74c3c',
    fontWeight: '600',
    fontFamily: 'Satoshi-Medium',
  },
  aboutText: {
    fontSize: sf(16),
    color: '#909090',
    fontWeight: '600',
    fontFamily: 'Andika-Bold',
  },
});

export default upperNav;