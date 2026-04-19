import { StyleSheet, Dimensions } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

// Responsive image dimensions – maintain aspect ratio while fitting screen
const imageWidth = Math.min(screenWidth - sw(40), sw(380));
const imageHeight = imageWidth * (300 / 380); // preserve original 380:300 ratio

const user = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6ff',
    padding: sw(10),
  },
  text: {
    marginHorizontal: sw(20),
    marginTop: sh(40),
    fontSize: sf(25),
    color: '#3B7FC9',
    fontFamily: 'DynaPuff-Bold',
  },
  subtext: {
    marginHorizontal: sw(20),
    fontSize: sf(16),
    color: '#3B7FC9',
    fontFamily: 'Comfortaa-Regular',
  },
  statement: {
    fontSize: sf(16),
    fontFamily: 'Comfortaa-Regular',
    marginHorizontal: sw(20),
    color: '#3B7FC9',
    textAlign: 'center',
  },
  imaginationReadingImage: {
    width: imageWidth,
    height: imageHeight,
    alignSelf: 'center',
    marginVertical: sh(20),
  },
  // Modal styles (already responsive)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: sw(15),
    padding: sw(24),
    width: '80%',
    maxWidth: sw(350),
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
  },
  modalTitle: {
    fontSize: sf(20),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: sh(12),
    fontFamily: 'Satoshi-Bold',
  },
  modalMessage: {
    fontSize: sf(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: sh(24),
    lineHeight: sf(22),
    fontFamily: 'Satoshi-Medium',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: sh(14),
    borderRadius: sw(10),
    alignItems: 'center',
    marginHorizontal: sw(8),
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
    fontSize: sf(16),
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Satoshi-Medium',
  },
  logoutButtonText: {
    fontSize: sf(16),
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Satoshi-Medium',
  },
});

export default user;
