import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';

// Screens
import LoginScreen from './src/Screens/LoginScreen';
import LoadingScreen from './src/Screens/LoadingScreen';
import UserHomeScreen from './src/Screens/Student/UserHomeScreen';
import SignUpOneScreen from './src/Screens/SignUp/SignUpOneScreen';
import SignUpTwoScreen from './src/Screens/SignUp/SignUpTwoScreen';
import SignUpCompletedScreen from './src/Screens/SignUp/SignUpCompletedScreen';
import PageSelectionScreen from './src/Screens/Student/PageSelectionScreen';
import ReadingActivityScreen from './src/Screens/Student/ReadingActivityScreen';
import MiscuesReportsScreen from './src/Screens/Student/MiscuesReportsScreen';
import ReadingActivityScreenPage from './src/Screens/Student/ReadingTesting';
import ChooseRole from './src/Screens/SignUp/ChooseRole';
const Stack = createNativeStackNavigator();

function App() {
  return (
  <ApplicationProvider {...eva} theme={eva.light}>
    <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Loading" component={LoadingScreen} />

            {/* SIGNUP SCREENS */}
            <Stack.Screen name="ChooseRole" component={ChooseRole} />
            <Stack.Screen name="SignUpOne" component={SignUpOneScreen} />
            <Stack.Screen name="SignUpTwo" component={SignUpTwoScreen} />
            <Stack.Screen name="SignUpCompleted" component={SignUpCompletedScreen} />

            {/* USER SCREENS */}
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            <Stack.Screen name="PassageSelection" component={PageSelectionScreen} />
            <Stack.Screen name="ReadingActivity" component={ReadingActivityScreen} />
            <Stack.Screen name="MiscuesReports" component={MiscuesReportsScreen} />
            <Stack.Screen name="ReadingTesting" component={ReadingActivityScreenPage} />

            {/* ADMIN SCREENS */}

            {/* FACULTY SCREENS */}
            
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ApplicationProvider>
  );
}

export default App;
