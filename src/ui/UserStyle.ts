import React from 'react';
import { StyleSheet } from 'react-native';

const user = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
    padding: 10,
  },
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
    paddingHorizontal: 10
  },
  text: {
    marginHorizontal: 20,
    marginTop: 40,
    fontSize: 25,
    fontFamily: 'Satoshi-Bold',
  },
  subtext: {
    marginHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Satoshi-Light',
  },
  statement: {
    fontSize: 16,
    fontFamily: 'Satoshi-Light',
    marginHorizontal: 20,
    textAlign: 'center',
  },
  imaginationReadingImage: {
    width: 380,
    height: 300,
    alignSelf: 'center',
    maxHeight: 400,
    maxWidth: 400,
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

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }, 
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 24,
    width: '80%',
    maxWidth: 350,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Satoshi-Bold',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: 'Satoshi-Medium',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Satoshi-Medium',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Satoshi-Medium',
  },

});

export default user;
