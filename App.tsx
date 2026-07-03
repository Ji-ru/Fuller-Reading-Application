import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';

// ========================================================================
// PAGES
// ========================================================================

import LoginScreen from './src/Screens/User_SignIn_Screen';
import LoadingScreen from './src/Components/GlobalUse/Loading_Screen';

// SIGN UP PAGE
import ChooseRole from './src/Screens/SignUp/Choose_User_Role';
import SignUpOneScreen from './src/Screens/SignUp/SignUp_One';
import SignUpTwoScreen from './src/Screens/SignUp/SignUp_Two';
import SignUpCompletedScreen from './src/Screens/SignUp/SignUp_Completed';

// STUDENT PAGE
import UserHomeScreen from './src/Screens/Student/Student_Home';
import PageSelectionScreen from './src/Screens/Student/Student_Reading_Selection';
import ReadingActivityScreenPage from './src/Screens/Student/Student_Reading_Activity';
import ReadingHistoryScreen from './src/Screens/Student/Student_History';
import StudentProfile from './src/Screens/Student/Student_Profile';
import StudentClasses from './src/Screens/Student/Student_Classes';
import StudentTungkol from './src/Screens/Student/Student_Tungkol';
// import FacultyStack from './FacultyStack';

// FACULTY PAGE
import FacultyDashboard from './src/Screens/Faculty/Faculty_Dashboard';
import FacultyProfile from './src/Screens/Faculty/Faculty_Profile';
import MyClass from './src/Screens/Faculty/Faculty_MyClass';
import MyArchive from './src/Screens/Faculty/Faculty_MyArchive';
import MyStudents from './src/Screens/Faculty/Faculty_MyStudents';
// import StudentViewProfile from './src/Screens/Faculty/Student_View_Profile';
import FacultyStudentMonitor from './src/Screens/Faculty/Faculty_Student_Monitor';

// ADMIN PAGE
import AdminDashboard from './src/Screens/Admin/AdminDashboard';
import UserManagement from './src/Screens/Admin/UserManagement';
import AdminClassDashboard from './src/Screens/Admin/AdminClassDashboard';
import AdminClassManagement from './src/Screens/Admin/AdminClassManagement';
import AdminViewFacultyData from './src/Screens/Admin/AdminViewFacultyData';
import AdminReadingMaterials from './src/Screens/Admin/AdminReadingMaterials';

// ASSESSMENT PAGE
import FacultyAssessments from './src/Screens/Faculty/Faculty_Assessments';
import FacultyCreateAssessment from './src/Screens/Faculty/Faculty_CreateAssessment';
import FacultyReports from './src/Screens/Faculty/Faculty_Reports';
import StudentAssessments from './src/Screens/Student/Student_Assessments';
import StudentAssessmentActivity from './src/Screens/Student/Student_AssessmentActivity';
import StudentAssessmentReview from './src/Screens/Student/Student_AssessmentReview';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false, animation: 'none' }}>

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
            <Stack.Screen name="MyClasses" component={StudentClasses} />
            <Stack.Screen name="Tungkol" component={StudentTungkol} />
            <Stack.Screen name="StudentAssessments" component={StudentAssessments} />
            <Stack.Screen name="StudentAssessmentActivity" component={StudentAssessmentActivity} />
            <Stack.Screen name="StudentAssessmentReview" component={StudentAssessmentReview} />

            {/* FACULTY PAGES */}
            <Stack.Screen name="FacultyDashboard" component={FacultyDashboard} />
            <Stack.Screen name="FacultyProfile" component={FacultyProfile} />
            <Stack.Screen name="MyClass" component={MyClass} />
            <Stack.Screen name="Archive" component={MyArchive} />
            <Stack.Screen name="MyStudents" component={MyStudents} />
            {/* <Stack.Screen name="StudentViewProfile" component={StudentViewProfile} /> */}
            <Stack.Screen name="FacultyAssessments" component={FacultyAssessments} />
            <Stack.Screen name="FacultyCreateAssessment" component={FacultyCreateAssessment} />
            <Stack.Screen name="FacultyReports" component={FacultyReports} />
            <Stack.Screen name="FacultyStudentMonitor" component={FacultyStudentMonitor} />
            {/* <Stack.Screen name="Faculty" component={FacultyStack} />  */}

{/* ADMIN PAGES */}
             <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
             <Stack.Screen name="UserManagement" component={UserManagement} />
             <Stack.Screen name="AdminClassDashboard" component={AdminClassDashboard} />
             <Stack.Screen name="AdminClassManagement" component={AdminClassManagement} />
             <Stack.Screen name="AdminViewFacultyData" component={AdminViewFacultyData} />
             <Stack.Screen name="AdminReadingMaterials" component={AdminReadingMaterials} />


          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ApplicationProvider>
  );
}

export default App;
