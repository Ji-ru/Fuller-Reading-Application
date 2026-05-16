import { StyleSheet } from 'react-native';

const signup = StyleSheet.create({
  container: {
    backgroundColor: '#ebf5fb',
    padding: 8,
    flex: 1,
  },
  // SIGN UP PAGES
  ciscLogo: {
    width: 90,
    height: 33,
    maxWidth: 90,
    maxHeight: 33,
  },
  label: {
    fontSize: 32,
    fontFamily: 'Andika-Bold',
    color: '#1c2833',
    textAlign: 'center',
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 18,
    fontFamily: 'Andika-Bold',
    color: '#1c2833',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  defaultProfile: {
    width: 85,
    height: 85,
    maxWidth: 85,
    maxHeight: 85,
    borderRadius: 65,
    alignSelf: 'center',
    marginTop: 5,
  },
  cameraBackground: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#154360',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#ebf5fb',
  },
  cameraIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  //   STEPS INDICATOR DESIGN
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  stepCircle: {
    width: 28,
    height: 28,
    maxHeight: 28,
    maxWidth: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: 36,
    height: 2,
    backgroundColor: '#cde3f5',
    marginHorizontal: 6,
    borderRadius: 1,
  },
  activateStep: {
    backgroundColor: '#3d71d9',
  },
  inactivateStep: {
    backgroundColor: '#d6eaf8',
  },

  //    FORMS
  textform: {
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'Andika-Bold',
    marginHorizontal: 20,
    color: '#1c2833',
    marginBottom: 2,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  textInputForm: {
    width: '90%',
    maxWidth: 360,
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#fff',
    alignSelf: 'center',
    fontFamily: 'Andika-Regular',
    fontSize: 15,
    color: '#1c2833',
    borderWidth: 1.5,
    borderColor: '#d6eaf8',
  },
  dateText: {
    textAlign: 'left',
    alignItems: 'flex-start',
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    marginHorizontal: 16,
    color: '#1c2833',
  },
  dateInput: {
    flexDirection: 'row',
    width: '90%',
    maxWidth: 360,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#d6eaf8',
    marginBottom: 6,
  },
  icon: {
    maxWidth: 24,
    maxHeight: 24,
    alignItems: 'flex-end',
    marginRight: 16,
    tintColor: '#859dab',
  },
  number: {
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Andika-Regular',
    color: '#1c2833',
  },

  // Select component (Dropdown)
  dropdownButton: {
    flexDirection: 'row',
    width: '90%',
    maxWidth: 360,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#d6eaf8',
  },

  dropdownArrowicon: {
    marginLeft: 180,
  },

  dropdownContainer: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 360,
    height: 50,
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#d6eaf8',
  },

  // COMPLETE SIGN UP PAGE
  completeSignUpContainer: {
    flex: 1,
    backgroundColor: '#ebf5fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: 360,
    height: 360,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    maxWidth: 412,
    maxHeight: 412,
  },
  completeTitle: {
    color: '#154360',
    fontFamily: 'Andika-Bold',
    fontSize: 32,
    width: 400,
    textAlign: 'center',
  },
  completeStatement: {
    textAlign: 'justify',
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 40,
    fontSize: 15,
    fontFamily: 'Andika-Regular',
    color: '#2c3e50',
    lineHeight: 22,
  },
  completeNextButton: {
    backgroundColor: '#154360',
    borderRadius: 14,
    width: '90%',
    maxWidth: 360,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 24,
    shadowColor: '#154360',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  // SIGN UP LOADING COMPLETION MODAL
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    minWidth: 250,
    minHeight: 300,
    justifyContent: 'center',
    overflow: 'hidden', // Important for confetti animation
  },
  modalText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    zIndex: 10, // Make sure text is above animations
  },
  successText: {
    color: '#3d71d9',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Confetti animation (background)
  confettiAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1, // Lower zIndex to be in background
  },
  // Congratulations animation (foreground)
  congratulationsAnimation: {
    width: 200,
    height: 200,
    zIndex: 2, // Higher zIndex to be in foreground
    marginBottom: -20, // Adjust spacing between animation and text
  },
  // Keep old lottieAnimation as fallback or remove if not needed
  lottieAnimation: {
    width: 120,
    height: 120,
    marginBottom: -10,
  },
});

export default signup;
