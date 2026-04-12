import { StyleSheet } from 'react-native';

const login = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: '#f0faf4',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  video: {
    width: 260,
    height: 260,
    marginBottom: 28,
    borderRadius: 24,
    overflow: 'hidden',
  },

  // ── Labels ──────────────────────────────────────────────────────────────
  label: {
    marginTop: 8,
    alignSelf: 'flex-start',
    marginStart: 4,
    marginBottom: 6,
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: '#1b2e23',
    letterSpacing: 0.2,
  },

  // ── Text Inputs ─────────────────────────────────────────────────────────
  textinput: {
    width: '100%',
    maxWidth: 360,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
    color: '#1b2e23',
    borderWidth: 1.5,
    borderColor: '#d4f5e2',
  },
  textInputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
    borderWidth: 1.5,
  },
  textInputValid: {
    borderColor: '#2ecc71',
    borderWidth: 1.5,
  },

  // ── Error & Required ────────────────────────────────────────────────────
  errorText: {
    fontSize: 11,
    color: '#e74c3c',
    fontFamily: 'Satoshi-Regular',
    marginLeft: 2,
  },
  requiredStar: {
    color: '#e74c3c',
    fontSize: 14,
  },

  // ── Forgot Password ────────────────────────────────────────────────────
  forgotpass: {
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#1a7a45',
    textDecorationLine: 'underline',
  },
  forgotPassButton: {
    alignSelf: 'flex-end',
    marginEnd: 4,
    marginBottom: 20,
    marginTop: -4,
  },

  // ── Sign In Button ──────────────────────────────────────────────────────
  button: {
    backgroundColor: '#1a7a45',
    borderRadius: 14,
    width: '100%',
    maxWidth: 360,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Satoshi-Black',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    backgroundColor: '#8fafa0',
    shadowOpacity: 0,
    elevation: 0,
  },

  // ── Not Registered Section ──────────────────────────────────────────────
  notRegisteredContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  notRegisteredAlignment: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  leftLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#c8e6d4',
  },
  notRegisteredText: {
    fontSize: 12,
    color: '#8fafa0',
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginHorizontal: 14,
    fontFamily: 'Satoshi-Medium',
  },
  rightLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#c8e6d4',
  },

  // ── Registration Buttons ────────────────────────────────────────────────
  signupwithgooglebutton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#d4f5e2',
    marginTop: 16,
    width: '100%',
    maxWidth: 360,
    height: 50,
    marginBottom: 10,
  },
  signupwithemailbutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a7a45',
    borderRadius: 14,
    width: '100%',
    maxWidth: 360,
    height: 50,
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 20,
    shadowColor: '#1a7a45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  googleimage: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  registerText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.4,
  },

  // ── Input Container ─────────────────────────────────────────────────────
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Divider ─────────────────────────────────────────────────────────────
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    maxWidth: 360,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#c8e6d4',
  },
  dividerText: {
    marginHorizontal: 14,
    color: '#8fafa0',
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
  },
});

export default login;
