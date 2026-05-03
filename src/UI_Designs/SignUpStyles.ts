import { StyleSheet, Dimensions } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const { width: screenWidth } = Dimensions.get('window');
const formWidth = Math.min(screenWidth - sw(40), sw(350));

// ─── Palette (mirrors Student_Home) ──────────────────────────────────────────
const C = {
  green:      '#2ca96a',
  greenDark:  '#008443',
  greenDeep:  '#005028',
  greenLight: '#c0e8f2',
  greenPale:  '#E8F5E9',
  bg:         '#F1FBF4',
  white:      '#ffffff',
  ink:        '#1B2B22',
  inkLight:   '#6B8E6B',
  slate:      '#A5B8A7',
  border:     '#C8E6C9',
  inputBg:    '#F6FBF7',
  coral:      '#FF7043',
  disabled:   '#A5D6B0',
  blue:       '#3D71D9',   // kept for Google badge / locked tag only
};

const signup = StyleSheet.create({
  // ========== BASE ==========
  container: {
    backgroundColor: C.bg,
    paddingTop: sh(5),
    paddingRight: sw(10),
    paddingLeft: sw(10),
    flex: 1,
  },
  ciscLogo: {
    width: sw(90),
    height: sw(33),
    alignSelf: 'center',
    marginVertical: sh(10),
  },
  label: {
    fontSize: sf(35),
    fontFamily: 'Nunito-Black',
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    textAlign: 'center',
    marginVertical: sh(5),
    color: C.ink,
  },
  subLabel: {
    fontSize: sf(20),
    fontFamily: 'Nunito-ExtraBold',
    textAlign: 'center',
    color: C.green,
    marginBottom: sh(5),
  },

  // ========== AVATAR ==========
  defaultProfile: {
    width: sw(100),
    height: sw(100),
    borderRadius: sw(65),
    alignSelf: 'center',
  },
  cameraBackground: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: C.green,
    width: sw(36),
    height: sw(36),
    borderRadius: sw(18),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.white,
  },
  cameraIcon: {
    width: sw(16),
    height: sw(16),
    tintColor: C.white,
  },

  // ========== STEPS ==========
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: sh(5),
  },
  stepCircle: {
    width: sw(24),
    height: sw(24),
    borderRadius: sw(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: sw(40),
    height: 2,
    backgroundColor: C.border,
    marginHorizontal: sw(10),
  },
  activateStep: {
    backgroundColor: C.green,
  },
  inactivateStep: {
    backgroundColor: C.greenPale,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  activenumber: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Black',
    color: C.white,
  },
  inactivenumber: {
    fontSize: sf(12),
    fontFamily: 'Nunito-Black',
    color: C.inkLight,
  },

  // ========== FORM FIELDS ==========
  textform: {
    textAlign: 'left',
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
    marginHorizontal: sw(25),
    marginBottom: sh(5),
    color: C.inkLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: formWidth,
    height: sh(48),
    borderRadius: sw(14),
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    alignSelf: 'center',
    marginBottom: sh(12),
    paddingHorizontal: sw(15),
  },
  inputIcon: {
    width: sw(20),
    height: sw(20),
    marginRight: sw(10),
    tintColor: C.inkLight,
  },
  iconContainer: {
    width: sw(32),
    height: sw(32),
    borderRadius: sw(10),
    backgroundColor: C.greenPale,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(10),
  },
  inputIconText: {
    fontSize: sf(18),
  },
  eyeIcon: {
    width: sw(22),
    height: sw(22),
    tintColor: C.slate,
  },
  textInputForm: {
    flex: 1,
    height: '100%',
    fontFamily: 'Nunito-Medium',
    fontSize: sf(15),
    color: C.ink,
  },

  // ========== DATE INPUT ==========
  dateText: {
    textAlign: 'left',
    fontSize: sf(15),
    fontFamily: 'Nunito-Regular',
    marginHorizontal: sw(20),
    color: C.ink,
  },
  dateInput: {
    flexDirection: 'row',
    width: formWidth,
    height: sh(48),
    borderRadius: sw(14),
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: sh(12),
    paddingHorizontal: sw(15),
  },
  icon: {
    width: sw(24),
    height: sw(24),
  },

  // ========== DROPDOWN ==========
  dropdownButton: {
    flexDirection: 'row',
    width: formWidth,
    height: sh(40),
    borderRadius: sw(14),
    backgroundColor: C.white,
    justifyContent: 'flex-end',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    elevation: 2,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.08,
    shadowRadius: sw(3),
  },
  dropdownArrowicon: {
    marginLeft: 'auto',
    marginRight: sw(15),
  },
  dropdownContainer: {
    backgroundColor: C.white,
    width: formWidth,
    height: sh(48),
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: sw(14),
  },

  // ========== COMPLETE SIGN UP ==========
  completeSignUpContainer: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sw(20),
  },
  video: {
    width: Math.min(screenWidth - sw(40), sw(412)),
    height: Math.min(screenWidth - sw(40), sw(412)),
    marginBottom: sh(20),
    borderRadius: sw(20),
    overflow: 'hidden',
  },
  completeTitle: {
    color: C.green,
    fontFamily: 'Nunito-Black',
    fontSize: sf(35),
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    textAlign: 'center',
    width: '100%',
  },
  completeStatement: {
    textAlign: 'justify',
    paddingHorizontal: sw(20),
    paddingTop: sh(50),
    fontSize: sf(15),
    fontFamily: 'Nunito-Regular',
    color: C.inkLight,
  },
  completeNextButton: {
    backgroundColor: C.green,
    borderRadius: sw(14),
    width: Math.min(screenWidth - sw(40), sw(370)),
    height: sh(50),
    elevation: 5,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.25,
    shadowRadius: sw(6),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: sh(10),
    marginTop: sh(20),
  },

  // ========== MODAL ==========
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContainer: {
    backgroundColor: C.white,
    borderRadius: sw(20),
    padding: sw(30),
    alignItems: 'center',
    elevation: 8,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.18,
    shadowRadius: sw(10),
    minWidth: sw(250),
    minHeight: sh(300),
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalText: {
    marginTop: sh(20),
    fontSize: sf(16),
    fontFamily: 'Nunito-Bold',
    color: C.ink,
    textAlign: 'center',
    zIndex: 10,
  },
  successText: {
    color: C.green,
    fontSize: sf(18),
    fontFamily: 'Nunito-ExtraBold',
  },
  confettiAnimation: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
    zIndex: 1,
  },
  congratulationsAnimation: {
    width: sw(200),
    height: sw(200),
    zIndex: 2,
    marginBottom: sh(-20),
  },
  lottieAnimation: {
    width: sw(120),
    height: sw(120),
    marginBottom: sh(-10),
  },

  // ========== GOOGLE EMAIL BADGE ==========
  googleEmailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenPale,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: sw(12),
    paddingHorizontal: sw(14),
    paddingVertical: sh(12),
    marginBottom: sh(12),
    gap: sw(10),
    alignSelf: 'center',
    width: formWidth,
  },
  googleIcon: {
    width: sw(20),
    height: sw(20),
    resizeMode: 'contain',
  },
  googleEmailText: {
    flex: 1,
    fontSize: sf(14),
    color: C.ink,
    fontFamily: 'Nunito-Medium',
  },
  lockedTag: {
    backgroundColor: C.greenPale,
    borderRadius: sw(6),
    paddingHorizontal: sw(8),
    paddingVertical: sh(2),
    borderWidth: 1,
    borderColor: C.border,
  },
  lockedTagText: {
    fontSize: sf(11),
    color: C.green,
    fontFamily: 'Nunito-Bold',
  },

  // ========== CHECKBOX ==========
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: sh(10),
    marginBottom: sh(15),
    width: formWidth,
    alignSelf: 'center',
  },
  checkbox: {
    width: sw(20),
    height: sw(20),
    borderWidth: 2,
    borderColor: C.green,
    borderRadius: sw(4),
    marginRight: sw(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: C.green,
  },
  checkmark: {
    color: C.white,
    fontSize: sf(14),
    fontFamily: 'Nunito-Bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: sf(13),
    color: C.inkLight,
    fontFamily: 'Nunito-Medium',
    lineHeight: sh(18),
  },
});

export default signup;