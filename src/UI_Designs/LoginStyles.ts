import { StyleSheet } from 'react-native';

const login = StyleSheet.create({
  // ========== CONTAINER ==========
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#f2f6ff',
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
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
  },
  video: {
    width: 280,
    height: 280,
  },

  // ========== ERROR CONTAINER ==========
  errorContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderLeftWidth: 0,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  errorIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  errorIcon: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#DC2626',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    color: '#991B1B',
    lineHeight: 18,
  },

  // ========== INPUT FIELDS ==========
  inputWrapper: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputIcon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#111827',
  },

  // ========== LOGIN BUTTON ==========
  loginButton: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#5B9BD5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#5B9BD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#FFFFFF',
  },

  // ========== DIVIDER ==========
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dividerText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    color: '#64748B',
    marginHorizontal: 16,
  },

  // ========== REGISTER SECTION ==========
  registerSection: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  registerPrompt: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },
  registerLink: {
    fontSize: 13,
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
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signupwithemailbutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleimage: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  registerText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#374151',
  },

  // ========== LEGACY STYLES (for backward compatibility) ==========
  label: {
    marginTop: 5,
    alignSelf: 'flex-start',
    marginStart: 10,
    marginBottom: 5,
    fontFamily: 'Satoshi-Medium',
    fontSize: 15,
  },
  forgotpass: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    fontSize: 13,
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
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    fontFamily: 'Satoshi-Medium',
    elevation: 5,
    maxWidth: 350,
    maxHeight: 40,
    color: 'black'
  },
  button: {
    backgroundColor: '#5B9BD5',
    borderRadius: 5,
    width: 320,
    height: 40,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 350,
    maxHeight: 40,
  },
  buttonText: {
    color: '#FFFF',
    fontSize: 16,
    fontFamily: 'Satoshi-Black',
  },
  notRegisteredContainer: {
    backgroundColor: '#f2f6ff',
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  notRegisteredAlignment: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  leftLine: {
    flex: 2,
    height: 1,
    backgroundColor: '#CBD5E1',
    opacity: 0.6,
  },
  notRegisteredText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginHorizontal: 16,
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
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    opacity: 0.7,
  },
  forgotPassButton: {
    alignSelf: 'flex-end',
    marginEnd: 25,
    marginBottom: 10,
  },
});

export default login;