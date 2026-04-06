import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const login = StyleSheet.create({
  // ========== CONTAINER ==========
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f2f6ff',
  },

  scrollContent: {
    flexGrow: 1,
    paddingVertical: sh(40),
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ========== LOGO SECTION ==========
  logoSection: {
    alignItems: 'center',
    zIndex: 1,
    width: sw(280),
    height: sw(280),
    borderRadius: sw(140),
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: sw(140),
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(10) },
    shadowOpacity: 0.51,
    shadowRadius: sw(13.16),
  },

  // ========== ERROR CONTAINER ==========
  errorContainer: {
    width: '100%',
    maxWidth: sw(340),
    backgroundColor: '#FEF2F2',
    borderRadius: sw(12),
    borderLeftWidth: 0,
    padding: sw(8),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sh(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(1) },
    shadowOpacity: 0.22,
    shadowRadius: sw(2.22),
  },
  errorIconCircle: {
    width: sw(32),
    height: sw(32),
    borderRadius: sw(16),
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(12),
  },
  errorIcon: {
    fontSize: sf(18),
    fontFamily: 'Satoshi-Bold',
    color: '#DC2626',
  },
  errorText: {
    flex: 1,
    fontSize: sf(13),
    fontFamily: 'Satoshi-Medium',
    color: '#991B1B',
    lineHeight: sf(18),
  },

  // ========== INPUT FIELDS ==========
  inputWrapper: {
    width: '100%',
    maxWidth: sw(340),
    marginBottom: sh(10),
  },
  inputLabel: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#374151',
    marginBottom: sh(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: sw(12),
    paddingHorizontal: sw(8),
    paddingVertical: sh(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.05,
    shadowRadius: sw(4),
    elevation: 2,
  },
  iconContainer: {
    width: sw(28),
    height: sw(28),
    borderRadius: sw(8),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sw(12),
  },
  inputIcon: {
    fontSize: sf(16),
  },
  input: {
    flex: 1,
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: '#111827',
  },

  // ========== LOGIN BUTTON ==========
  loginButton: {
    width: '100%',
    maxWidth: sw(340),
    backgroundColor: '#5B9BD5',
    borderRadius: sw(12),
    paddingVertical: sh(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: sh(8),
    marginBottom: sh(24),
    shadowColor: '#5B9BD5',
    shadowOffset: { width: 0, height: sw(4) },
    shadowOpacity: 0.3,
    shadowRadius: sw(8),
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
  },
  loginButtonText: {
    fontSize: sf(16),
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },

  // ========== DIVIDER ==========
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: sw(340),
    marginBottom: sh(20),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dividerText: {
    fontSize: sf(12),
    fontFamily: 'Satoshi-Medium',
    color: '#64748B',
    marginHorizontal: sw(16),
  },

  // ========== REGISTER SECTION ==========
  registerSection: {
    width: '100%',
    maxWidth: sw(340),
    alignItems: 'center',
  },
  registerPrompt: {
    fontSize: sf(14),
    fontFamily: 'Satoshi-Medium',
    color: '#475569',
    textAlign: 'center',
    marginBottom: sh(16),
  },
  registerLink: {
    fontSize: sf(13),
    fontFamily: 'Satoshi-Bold',
    color: '#5B9BD5',
    textDecorationLine: 'underline',
  },
  registerButtonsContainer: {
    width: '100%',
  },

  // ========== SIGNUP BUTTONS ==========
  signupwithgooglebutton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: sw(12),
    paddingVertical: sh(14),
    paddingHorizontal: sw(16),
    marginBottom: sh(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.05,
    shadowRadius: sw(4),
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signupwithemailbutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: sw(12),
    paddingVertical: sh(14),
    paddingHorizontal: sw(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.05,
    shadowRadius: sw(4),
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleimage: {
    width: sw(24),
    height: sw(24),
    marginRight: sw(12),
  },
  registerText: {
    fontSize: sf(15),
    fontFamily: 'Satoshi-Medium',
    color: '#374151',
  },

  // ========== LEGACY STYLES (for backward compatibility) ==========
  label: {
    marginTop: sh(5),
    alignSelf: 'flex-start',
    marginStart: sw(10),
    marginBottom: sh(5),
    fontFamily: 'Satoshi-Medium',
    fontSize: sf(15),
  },
  forgotpass: {
    alignSelf: 'flex-end',
    marginBottom: sh(10),
    fontSize: sf(13),
    fontFamily: 'Satoshi-Regular',
    textDecorationLine: 'underline',
    color: '#5B9BD5',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textinput: {
    width: '100%',
    borderRadius: sw(5),
    padding: sw(10),
    marginBottom: sh(10),
    backgroundColor: 'white',
    fontFamily: 'Satoshi-Medium',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    maxWidth: sw(350),
    maxHeight: sh(40),
    color: 'black',
  },
  button: {
    backgroundColor: '#5B9BD5',
    borderRadius: sw(5),
    width: sw(320),
    height: sh(40),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: sw(2) },
    shadowOpacity: 0.25,
    shadowRadius: sw(3.84),
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: sw(350),
    maxHeight: sh(40),
  },
  buttonText: {
    color: '#FFFF',
    fontSize: sf(16),
    fontFamily: 'Satoshi-Black',
  },
  notRegisteredContainer: {
    backgroundColor: '#f2f6ff',
    alignItems: 'center',
    paddingBottom: sh(40),
    paddingTop: sh(20),
    paddingHorizontal: sw(20),
  },
  notRegisteredAlignment: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: sw(350),
  },
  leftLine: {
    flex: 2,
    height: 1,
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },
  notRegisteredText: {
    fontSize: sf(12),
    color: '#64748B',
    fontWeight: '400',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginHorizontal: sw(16),
    fontFamily: 'Satoshi-Medium',
  },
  rightLine: {
    flex: 2,
    height: 1,
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
  },
  textInputValid: {
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  requiredStar: {
    color: '#EF4444',
    fontSize: sf(16),
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.7,
  },
  forgotPassButton: {
    alignSelf: 'flex-end',
    marginEnd: sw(25),
    marginBottom: sh(10),
  },
});

export default login;
