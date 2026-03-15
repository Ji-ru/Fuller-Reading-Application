import { StyleSheet } from 'react-native';

const upperNav = StyleSheet.create({
  ciscLogo: {
    marginTop: 10,
    width: 120,
    height: 30,
    maxWidth: 120,
    maxHeight: 30,
  },
  menuIcon: {
    width: 50,
    height: 35,
    maxWidth: 50,
    maxHeight: 35,
  },
  touchable: {
    padding: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  backButtonIcon: {
    width: 60,
    height: 40,
    maxWidth: 60,
    maxHeight: 40,
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
