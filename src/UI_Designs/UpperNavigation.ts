import { StyleSheet } from 'react-native';

const upperNav = StyleSheet.create({
  ciscLogo: {
    width: 90,
    height: 33,
    maxWidth: 90,
    maxHeight: 33,
  },
  menuIcon: {
    width: 20,
    height: 20,
    maxWidth: 20,
    maxHeight: 20,
  },
  touchable: {
    padding: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
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
