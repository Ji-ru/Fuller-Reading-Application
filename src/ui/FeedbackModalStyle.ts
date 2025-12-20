import { StyleSheet } from "react-native";

const feedbackModal = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: 'white',
      borderRadius: 50,
      padding: 5,
      alignItems: 'center',
      width: '90%',
      maxWidth: 300,
      minHeight: 300,
      elevation: 5,
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
        width: 220,
        height: 220,
        marginTop: 10,
      },
    goodJobAnimation: {
        width: 160,
        height: 160,
        marginTop: 10,
      },
    tryAgainAnimation: {
      width: 160,
      height: 160,
      marginTop: 10,
    },
    title: {
      fontSize: 25,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 10,
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      fontSize: 15,
      color: '#666',
      textAlign: 'center',
      marginHorizontal: 10,
      marginBottom: 20,
      lineHeight: 22,
    },
    autoCloseText: {
      fontSize: 12,
      color: '#999',
      textAlign: 'center',
      marginTop: 10,
      fontStyle: 'italic',
    },
  });
  
  export default feedbackModal;
  