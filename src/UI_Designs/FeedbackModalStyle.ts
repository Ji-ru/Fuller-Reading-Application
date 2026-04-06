import { StyleSheet } from "react-native";
import { sw, sh, sf } from '../Utils/responsive';

const feedbackModal = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: sw(20),
    },
    modalContainer: {
      backgroundColor: 'white',
      borderRadius: sw(50),
      padding: sw(5),
      alignItems: 'center',
      width: '90%',
      maxWidth: sw(300),
      minHeight: sh(300),
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: sw(2) },
      shadowOpacity: 0.25,
      shadowRadius: sw(3.84),
    },
    confettiAnimation: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    },
    excellentAnimation: {
        width: sw(220),
        height: sw(220),
        marginTop: sh(10),
      },
    goodJobAnimation: {
        width: sw(160),
        height: sw(160),
        marginTop: sh(10),
      },
    tryAgainAnimation: {
      width: sw(160),
      height: sw(160),
      marginTop: sh(10),
    },
    title: {
      fontSize: sf(25),
      fontWeight: 'bold',
      color: '#333',
      marginTop: sh(10),
      marginBottom: sh(8),
      fontFamily: 'Satoshi-Bold',
      textAlign: 'center',
    },
    message: {
      fontSize: sf(15),
      color: '#666',
      textAlign: 'center',
      marginHorizontal: sw(10),
      marginBottom: sh(20),
      lineHeight: sf(22),
      fontFamily: 'Satoshi-Regular',
    },
    autoCloseText: {
      fontSize: sf(12),
      color: '#999',
      textAlign: 'center',
      marginTop: sh(10),
      fontFamily: 'Satoshi-MediumItalic',

    },
  });
  
  export default feedbackModal;