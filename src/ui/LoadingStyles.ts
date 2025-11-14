import { StyleSheet } from "react-native";

const loading = StyleSheet.create({
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
  });

  export default loading;