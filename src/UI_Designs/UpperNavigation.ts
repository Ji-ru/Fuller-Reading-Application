import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Scale logo width: 25% of screen width, capped at 120, min 80
const logoWidth = Math.min(Math.max(screenWidth * 0.25, 80), 120);
const logoHeight = logoWidth * (30 / 120); // maintain 120:30 ratio

// Scale icons based on screen width
const menuIconSize = Math.min(screenWidth * 0.12, 50);
const backIconSize = Math.min(screenWidth * 0.15, 60);
const backIconHeight = backIconSize * (40 / 60); // maintain 60:40 ratio

const upperNav = StyleSheet.create({
  ciscLogo: {
    marginTop: 10,
    width: logoWidth,
    height: logoHeight,
  },
  menuIcon: {
    width: menuIconSize,
    height: menuIconSize * (35 / 50), // maintain original ratio
  },
  touchable: {
    padding: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  backButtonIcon: {
    width: backIconSize,
    height: backIconHeight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
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
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#e74c3c',
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
    fontFamily: 'Satoshi-Medium',
  },
});

export default upperNav;