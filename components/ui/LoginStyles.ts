import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  video: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },

  // INPUT ACCOUNT CREDENTIALS
  label: {
    marginTop: 5,
    alignSelf: 'flex-start',
    marginStart: 10,
    marginBottom: 5,
    fontWeight: 'medium',
    fontSize: 15,
  },
  forgotpass: {
    alignSelf: 'flex-end',
    marginEnd: 25,
    marginBottom: 10,
    fontSize: 10,
    textDecorationLine: 'underline',
    color: '#007AFF',
  },
  textinput: {
    width: '100%',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',

    // Shadows
    elevation: 5,

    // Dimension
    maxWidth: 350,
    maxHeight: 40,
  },

  // LOGIN BUTTON
  button: {
    backgroundColor: '#2CA96A',
    borderRadius: 5,
    width: 320,
    height: 40,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Satoshi Variable',
    maxWidth: 350,
    maxHeight: 40,
  },
  buttonText: {
    color: '#FFFF',
    fontSize: 15,
    fontWeight: 'black',
  },

  // NOT REGISTERED DESIGN
  notRegisteredContainer: {
    backgroundColor: '#ECFBFF',
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
    backgroundColor: '#C7C7CC',
    opacity: 0.6,
  },
  notRegisteredText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginHorizontal: 15,
  },
  rightLine: {
    flex: 2,
    height: 1,
    backgroundColor: '#C7C7CC',
    opacity: 0.6,
  },

  // GOOGLE REGISTRATION
  signupwithgooglebutton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingEnd: 10,
    borderRadius: 10,
    elevation: 5,
    marginTop: 20,
    width: 320,
    marginBottom: 10,
    maxWidth: 350,
    maxHeight: 40,

  },
  signupwithemailbutton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingEnd: 10,
    borderRadius: 10,
    elevation: 5,
    width: 320,
    height: 40,
    marginBottom: 10,
    maxWidth: 350,
    maxHeight: 40,
  },
  googleimage: {
    width: 42,
    height: 42,
  },
});
export default styles;
