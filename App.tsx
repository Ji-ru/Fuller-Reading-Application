import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';

// ========================================================================
// PAGES
// ========================================================================

import LoginScreen from './src/Screens/LoginScreen';
import LoadingScreen from './src/Screens/LoadingScreen';

// SIGN UP PAGE
import ChooseRole from './src/Screens/SignUp/ChooseRole';
import SignUpOneScreen from './src/Screens/SignUp/SignUpOne';
import SignUpTwoScreen from './src/Screens/SignUp/SignUpTwo';
import SignUpCompletedScreen from './src/Screens/SignUp/SignUpCompleted';

// STUDENT PAGE
import UserHomeScreen from './src/Screens/Student/UserHome';
import PageSelectionScreen from './src/Screens/Student/PageSelection';
import ReadingActivityScreenPage from './src/Screens/Student/ReadingActivity';
import ReadingHistoryScreen from './src/Screens/Student/History';
import StudentProfile from './src/Screens/Profile';

// FACULTY PAGE
import FacultyDashboard from './src/Screens/Faculty/FacultyDashboard';
import FacultyProfile from './src/Screens/Faculty/FacultyProfile';
import MyClass from './src/Screens/Faculty/MyClass';
const Stack = createNativeStackNavigator();

function App() {
  return (
  <ApplicationProvider {...eva} theme={eva.light}>
    <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>

            {/* SIGN IN PAGES */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Loading" component={LoadingScreen} />
            <Stack.Screen name="Profile" component={StudentProfile} />

            {/* SIGNUP PAGES */}
            <Stack.Screen name="ChooseRole" component={ChooseRole} />
            <Stack.Screen name="SignUpOne" component={SignUpOneScreen} />
            <Stack.Screen name="SignUpTwo" component={SignUpTwoScreen} />
            <Stack.Screen name="SignUpCompleted" component={SignUpCompletedScreen} />

            {/* USER PAGES */}
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            <Stack.Screen name="PassageSelection" component={PageSelectionScreen} />
            <Stack.Screen name="ReadingActivity" component={ReadingActivityScreenPage} />
            <Stack.Screen name="ReadingHistory" component={ReadingHistoryScreen} />

            {/* FACULTY PAGES */}
            <Stack.Screen name="FacultyDashboard" component={FacultyDashboard} />
            <Stack.Screen name="FacultyProfile" component={FacultyProfile} />
            <Stack.Screen name="MyClass" component={MyClass} />

            {/* ADMIN PAGES */}

            

            
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ApplicationProvider>
  );
}

export default App;
