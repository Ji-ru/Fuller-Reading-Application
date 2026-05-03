import { StyleSheet, Dimensions } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

const buttonWidth      = Math.min(screenWidth - sw(40), sw(367));
const signUpButtonWidth = Math.min(screenWidth - sw(40), sw(350));

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  green:     '#2ca96a',
  greenDark: '#008443',
  greenPale: '#E8F5E9',
  border:    '#C8E6C9',
  white:     '#ffffff',
  coral:     '#FF7043',
  ink:       '#1B2B22',
};

const buttons = StyleSheet.create({
  // ── Sign-Up flow primary ───────────────────────────────────────────────────
  nextPageSignUpButton: {
    backgroundColor: C.green,
    borderRadius: sw(14),
    width: signUpButtonWidth,
    height: sh(50),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: sh(10),
    marginTop: sh(25),
    elevation: 4,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.25,
    shadowRadius: sw(6),
  },
  nextPageSignUpText: {
    color: C.white,
    fontSize: sf(18),
    fontFamily: 'Nunito-ExtraBold',
    letterSpacing: 0.3,
  },

  // ── Sign-Up flow cancel ────────────────────────────────────────────────────
  cancelSignUpButton: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.coral,
    borderRadius: sw(14),
    width: signUpButtonWidth,
    height: sh(50),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  cancelSignUpText: {
    color: C.coral,
    fontSize: sf(18),
    fontFamily: 'Nunito-Bold',
  },

  // ── Generic next page (ChooseRole / completion screens) ───────────────────
  nextPageButton: {
    backgroundColor: C.green,
    borderRadius: sw(14),
    width: buttonWidth,
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
    marginTop: sh(35),
  },
  nextPageText: {
    color: C.white,
    fontSize: sf(22),
    fontFamily: 'DynaPuff-Bold',
  },

  // ── Generic cancel ────────────────────────────────────────────────────────
  cancelButton: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.coral,
    borderRadius: sw(14),
    width: buttonWidth,
    height: sh(50),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.08,
    shadowRadius: sw(3),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  cancelText: {
    color: C.coral,
    fontSize: sf(22),
    fontFamily: 'DynaPuff-Bold',
  },

  // ── Start Reading / Reading History ───────────────────────────────────────
  startReadingButton: {
    backgroundColor: C.green,
    borderRadius: sw(50),
    width: buttonWidth,
    height: sh(50),
    elevation: 5,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.25,
    shadowRadius: sw(6),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: sh(50),
  },
  readingHistoryButton: {
    backgroundColor: C.green,
    borderRadius: sw(50),
    width: buttonWidth,
    height: sh(50),
    elevation: 5,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.25,
    shadowRadius: sw(6),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: sh(15),
  },

  // ── ChooseRole buttons ────────────────────────────────────────────────────
  studentButton: {
    backgroundColor: C.green,
    borderRadius: sw(14),
    width: buttonWidth,
    height: sh(54),
    elevation: 5,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: sw(3) },
    shadowOpacity: 0.25,
    shadowRadius: sw(6),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: sh(15),
  },
  teacherButton: {
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.green,
    borderRadius: sw(14),
    width: buttonWidth,
    height: sh(54),
    elevation: 3,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.12,
    shadowRadius: sw(4),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: sh(15),
  },

  // ── Gender radio button ───────────────────────────────────────────────────
  sexRadioButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: signUpButtonWidth,
    height: sh(54),
    borderRadius: sw(14),
    padding: sw(10),
    marginBottom: sh(10),
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    alignSelf: 'center',
    marginVertical: sh(2),
  },
});

export default buttons;