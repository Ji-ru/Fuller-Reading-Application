import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function UserHomeScreen() {
  return (
    <SafeAreaView>
      <View>
        <Text style={styles.text}>WELCOM USER</Text>
      </View>
    </SafeAreaView>
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
  text: {
    textAlign: 'center',
    justifyContent: 'center',
    alignSelf:'center',
    alignItems: 'center'
  }
});
