import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './components/Screens/LoginScreen';
import LoadingScreen from './components/Screens/LoadingScreen';
import UserHomeScreen from './components/Screens/UserHomeScreen';
import SignUpOneScreen from './components/Screens/SignUpOneScreen';
import SignUpTwoScreen from './components/Screens/SignUpTwoScreen';
import SignUpCompletedScreen from './components/Screens/SignUpCompletedScreen';
import PageSelectionScreen from './components/Screens/PageSelectionScreen';
import ReadingActivityScreen from './components/Screens/ReadingActivityScreen';
import MiscuesReportsScreen from './components/Screens/MiscuesReportsScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="UserHome" component={UserHomeScreen} />
          <Stack.Screen name="SignUpOne" component={SignUpOneScreen} />
          <Stack.Screen name="SignUpTwo" component={SignUpTwoScreen} />
          <Stack.Screen name="SignUpCompleted" component={SignUpCompletedScreen} />
          <Stack.Screen name="PasageSelection" component={PageSelectionScreen} />
          <Stack.Screen name="ReadingActivity" component={ReadingActivityScreen} />
          <Stack.Screen name="MiscuesReports" component={MiscuesReportsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
