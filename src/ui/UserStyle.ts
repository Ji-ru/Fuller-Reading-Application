import { StyleSheet } from 'react-native';

const user = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
    padding: 10,
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
