import React, { useEffect } from 'react';
import Video from 'react-native-video';
import { StyleSheet, View } from 'react-native';

export default function LoadingScreen({ navigation }: any) {
  // Loads for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('UserHome');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Video 
      style={styles.video} 
      source={require('../../assets/videos/cisc_logo_animated.mp4')}
      repeat={false}
      resizeMode='cover'
      />
    </View>
  );
}

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
});
