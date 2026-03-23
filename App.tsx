import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApplicationProvider } from '@ui-kitten/components';
import { withBackgroundMusic } from './src/Components/GlobalUse/Background/Student_Bq_Music';
import * as eva from '@eva-design/eva';
import { GlobalMusicProvider } from './src/Components/GlobalUse/Background/GlobalMusicContext';
import { configureGoogleSignIn } from './src/Utilities/googleAuthUtils';
// ========================================================================
// PAGES
// ========================================================================
// SIGN IN PAGES
import LoginScreen from './src/Screens/User_SignIn_Screen';
import LoadingScreen from './src/Components/GlobalUse/Loading_Screen';

// SIGN UP PAGES
import ChooseRole from './src/Screens/SignUp/Choose_User_Role';
import SignUpOneScreen from './src/Screens/SignUp/SignUp_One';
import SignUpTwoScreen from './src/Screens/SignUp/SignUp_Two';
import SignUpCompletedScreen from './src/Screens/SignUp/SignUp_Completed';

// STUDENT PAGES
import UserHomeScreen from './src/Screens/Student/Student_Home';
import PageSelectionScreen from './src/Screens/Student/Student_Reading_Selection';
import ReadingActivityScreenPage from './src/Screens/Student/Student_Reading_Activity';
import ReadingHistoryScreen from './src/Screens/Student/Student_History';
import StudentProfile from './src/Screens/Student/Student_Profile';
import StudentMyClass from './src/Screens/Student/Student_MyClass';

// FACULTY PAGES
import FacultyTabNavigator from './src/Components/Faculty/NavigationBar/FacultyTabNavigator';
import StudentTabNavigator from './src/Components/Student/NavigationBar/StudentTabNavigator';
import MyStudents from './src/Screens/Faculty/Faculty_MyStudents';
import StudentViewProfile from './src/Screens/Faculty/Faculty_Student_View_Profile';

// ADMIN PAGES
import AdminDashboard from './src/Screens/Admin/Admin_Dashboard';
import AdminUserManagement from './src/Screens/Admin/Admin_UserManagement';
import AdminViewFacultyData from './src/Screens/Admin/Admin_ViewFacultyData';

const Stack = createNativeStackNavigator();
configureGoogleSignIn(); 

function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <SafeAreaProvider>
        <GlobalMusicProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>

              {/* SIGN IN PAGES */}
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Loading" component={LoadingScreen} />
              <Stack.Screen name="Profile" component={withBackgroundMusic(StudentProfile)} />

              {/* SIGNUP PAGES */}
              <Stack.Screen name="ChooseRole" component={ChooseRole} />
              <Stack.Screen name="SignUpOne" component={SignUpOneScreen} />
              <Stack.Screen name="SignUpTwo" component={SignUpTwoScreen} />
              <Stack.Screen name="SignUpCompleted" component={SignUpCompletedScreen} />

              {/* USER PAGES (STUDENT DASHBOARD WITH BACKGROUND MUSIC) */}
              <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
              <Stack.Screen name="UserHome" component={withBackgroundMusic(UserHomeScreen)} />
              <Stack.Screen name="PassageSelection" component={withBackgroundMusic(PageSelectionScreen)} />
              <Stack.Screen name="ReadingActivity" component={withBackgroundMusic(ReadingActivityScreenPage)} />
              <Stack.Screen name="ReadingHistory" component={withBackgroundMusic(ReadingHistoryScreen)} />
              <Stack.Screen name="StudentMyClass" component={withBackgroundMusic(StudentMyClass)} />

              {/* FACULTY PAGES */}
              <Stack.Screen name="FacultyTabs" component={FacultyTabNavigator} />
              <Stack.Screen name="MyStudents" component={MyStudents} />
              <Stack.Screen name="StudentViewProfile" component={StudentViewProfile} />

              {/* ADMIN PAGES */}
              <Stack.Screen name='AdminDashboard' component={AdminDashboard} />
              <Stack.Screen name='AdminUserManagement' component={AdminUserManagement} />
              <Stack.Screen name='AdminViewFacultyData' component={AdminViewFacultyData} />


            </Stack.Navigator>
          </NavigationContainer>
        </GlobalMusicProvider>
      </SafeAreaProvider>
    </ApplicationProvider>
  );
}

export default App;